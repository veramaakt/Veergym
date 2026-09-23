// Alleen voor de demo (tools/build_demo.py): de app vullen met voorbeelddata.
import * as store from "./store.js";

export async function seedDemo() {
  await store.wipeLocal();
  store.applyRemote(window.VEERGYM_DEMO_DATA || []);
  store.setMeta("token", "demo");
  store.setMeta("demoVersion", window.VEERGYM_DEMO_VERSION || "1");
}

/** Nieuwe voorbeelddata gepubliceerd, of nog niets ingeladen? Dan opnieuw vullen. */
export async function ensureDemo() {
  if (!store.getMeta("token") || store.getMeta("demoVersion") !== (window.VEERGYM_DEMO_VERSION || "1")) await seedDemo();
}
