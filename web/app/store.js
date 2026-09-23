// Lokale opslag in de browser (IndexedDB). Alles wat je logt komt eerst hier,
// zodat de app zonder bereik werkt. sync.js stuurt wijzigingen later naar de server.
//
// Een record: { id, kind, data, updated_at, deleted, dirty }
//   dirty = 1 betekent: nog niet naar de server gestuurd.

const DB_NAME = "veergym";
let db = null;
const records = new Map();
const meta = new Map();
const listeners = new Set();
const changeHooks = new Set();
let version = 0;

function req(r) {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export async function openStore() {
  db = await new Promise((resolve, reject) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => {
      r.result.createObjectStore("records", { keyPath: "id" });
      r.result.createObjectStore("meta", { keyPath: "k" });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  const tx = db.transaction(["records", "meta"]);
  for (const rec of await req(tx.objectStore("records").getAll())) records.set(rec.id, rec);
  for (const m of await req(tx.objectStore("meta").getAll())) meta.set(m.k, m.v);
}

function notify() {
  version++;
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export const getVersion = () => version;

/** Wordt aangeroepen na elke lokale wijziging (sync.js plant dan een sync). */
export function onLocalChange(fn) {
  changeHooks.add(fn);
}

function write(recs) {
  const tx = db.transaction("records", "readwrite");
  recs.forEach((r) => tx.objectStore("records").put(r));
}

export function uid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

// ---------- lezen ----------

export function get(id) {
  const r = records.get(id);
  return r && !r.deleted ? { id: r.id, ...r.data } : null;
}

export function list(kind) {
  const out = [];
  for (const r of records.values()) if (r.kind === kind && !r.deleted) out.push({ id: r.id, ...r.data });
  return out;
}

// ---------- schrijven ----------

export function put(kind, id, data) {
  const prev = records.get(id);
  const { id: _drop, ...clean } = data;
  const rec = { id, kind, data: clean, updated_at: Math.max(Date.now(), prev ? prev.updated_at + 1 : 0), deleted: false, dirty: 1 };
  records.set(id, rec);
  write([rec]);
  notify();
  changeHooks.forEach((fn) => fn());
  return id;
}

export function update(id, patch) {
  const r = records.get(id);
  if (!r) return;
  put(r.kind, id, { ...r.data, ...patch });
}

export function remove(id) {
  const prev = records.get(id);
  if (!prev) return;
  const rec = { ...prev, deleted: true, updated_at: Math.max(Date.now(), prev.updated_at + 1), dirty: 1 };
  records.set(id, rec);
  write([rec]);
  notify();
  changeHooks.forEach((fn) => fn());
}

// ---------- sync ----------

export function dirtyRecords() {
  return [...records.values()].filter((r) => r.dirty);
}

export function markClean(pushed) {
  const changed = [];
  for (const p of pushed) {
    const cur = records.get(p.id);
    if (cur && cur.updated_at === p.updated_at && cur.dirty) {
      cur.dirty = 0;
      changed.push(cur);
    }
  }
  if (changed.length) write(changed);
}

export function applyRemote(changes) {
  const changed = [];
  for (const ch of changes) {
    const local = records.get(ch.id);
    if (local && local.dirty && local.updated_at > ch.updated_at) continue;
    if (local && !local.dirty && local.updated_at === ch.updated_at && local.deleted === ch.deleted) continue;
    const rec = { id: ch.id, kind: ch.kind, data: ch.data, updated_at: ch.updated_at, deleted: ch.deleted, dirty: 0 };
    records.set(ch.id, rec);
    changed.push(rec);
  }
  if (changed.length) {
    write(changed);
    notify();
  }
}

// ---------- meta (token, cursor, actieve workout, voorkeuren) ----------

export function getMeta(k, fallback = null) {
  return meta.has(k) ? meta.get(k) : fallback;
}

export function setMeta(k, v) {
  meta.set(k, v);
  const tx = db.transaction("meta", "readwrite");
  if (v === null || v === undefined) tx.objectStore("meta").delete(k);
  else tx.objectStore("meta").put({ k, v });
  notify();
}

/** Alles lokaal wissen (bij uitloggen blijft data staan; dit is alleen voor noodgevallen). */
export async function wipeLocal() {
  records.clear();
  meta.clear();
  const tx = db.transaction(["records", "meta"], "readwrite");
  tx.objectStore("records").clear();
  tx.objectStore("meta").clear();
  notify();
}
