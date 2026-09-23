// Synchronisatie met de server. Draait op de achtergrond: na een wijziging,
// als het netwerk terugkomt, en elke minuut.
import * as store from "./store.js";

let status = { mode: navigator.onLine ? "synced" : "offline", at: null, error: null };
const listeners = new Set();
let timer = null;
let running = false;
let again = false;

function set(patch) {
  status = { ...status, ...patch };
  listeners.forEach((fn) => fn());
}

export const getStatus = () => status;
export function subscribeStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function scheduleSync(delay = 1500) {
  clearTimeout(timer);
  timer = setTimeout(syncNow, delay);
}

export async function syncNow() {
  const token = store.getMeta("token");
  if (!token) return;
  if (running) {
    again = true;
    return;
  }
  if (!navigator.onLine) {
    set({ mode: "offline" });
    return;
  }
  running = true;
  set({ mode: "syncing" });
  const dirty = store.dirtyRecords().map(({ id, kind, data, updated_at, deleted }) => ({ id, kind, data, updated_at, deleted }));
  try {
    const res = await fetch("api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ cursor: store.getMeta("cursor", 0), changes: dirty }),
    });
    if (res.status === 401) {
      store.setMeta("token", null);
      set({ mode: "synced", error: "Opnieuw inloggen nodig" });
      return;
    }
    if (!res.ok) throw new Error("Server gaf " + res.status);
    const body = await res.json();
    store.markClean(dirty);
    store.applyRemote(body.changes);
    store.setMeta("cursor", body.cursor);
    set({ mode: "synced", at: Date.now(), error: null });
  } catch (e) {
    set({ mode: "offline", error: String(e.message || e) });
  } finally {
    running = false;
    if (again || store.dirtyRecords().length) {
      again = false;
      // Mislukt? Dan over 15 seconden opnieuw proberen.
      scheduleSync(status.mode === "synced" ? 500 : 15000);
    }
  }
}

export function startSync() {
  store.onLocalChange(() => scheduleSync());
  window.addEventListener("online", () => syncNow());
  window.addEventListener("offline", () => set({ mode: "offline" }));
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && syncNow());
  setInterval(syncNow, 60000);
  syncNow();
}
