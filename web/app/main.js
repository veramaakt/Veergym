// Startpunt van de app: opslag openen, synchroniseren, schermen tonen.
import { html, DS, DEMO, useState, useEffect, useMemo, useSyncExternalStore, Sheet } from "./ui.js";
import * as store from "./store.js";
import { startSync, getStatus, subscribeStatus, syncNow } from "./sync.js";
import { getActive } from "./session.js";
import { Login } from "./screens/login.js";
import { Home } from "./screens/home.js";
import { Workout, WorkoutDock } from "./screens/workout.js";
import { Summary } from "./screens/summary.js";
import { TemplateEditor } from "./screens/template.js";
import { Library } from "./screens/library.js";
import { ExerciseDetail } from "./screens/exercise.js";
import { Settings } from "./screens/settings.js";
import { Later } from "./screens/later.js";
import { Progress } from "./screens/progress.js";
import { Recap } from "./screens/recap.js";
import { HevyImport } from "./screens/import.js";
import { Measure, MeasureDetail, MeasureEntry, MeasureImport } from "./screens/measure.js";

const TAB_SCREENS = new Set(["home", "progress", "measure", "food"]);

function App() {
  useSyncExternalStore(store.subscribe, store.getVersion);
  const sync = useSyncExternalStore(subscribeStatus, getStatus);
  const [nav, setNav] = useState({ screen: "home", params: {} });
  const [history, setHistory] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState(null);

  const token = store.getMeta("token");
  const version = store.getVersion();
  const data = useMemo(() => {
    const exercises = store.list("exercise");
    const exById = Object.fromEntries(exercises.map((e) => [e.id, e]));
    return { exercises, exById, workouts: store.list("workout"), templates: store.list("template"), folders: store.list("folder") };
  }, [version]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.ms || 4500);
    return () => clearTimeout(t);
  }, [toast]);

  if (!token) return html`<div class="app"><${Login} /></div>`;

  const ctx = {
    ...data,
    sync,
    syncNow,
    active: getActive(),
    go(screen, params = {}) {
      setHistory((h) => [...h, nav]);
      setNav({ screen, params });
    },
    replace(screen, params = {}) {
      setNav({ screen, params });
    },
    back() {
      setHistory((h) => {
        const prev = h[h.length - 1] || { screen: "home", params: {} };
        setNav(prev);
        return h.slice(0, -1);
      });
    },
    tab(screen) {
      setHistory([]);
      setNav({ screen, params: {} });
    },
    sheet: setSheet,
    closeSheet: () => setSheet(null),
    toast: setToast,
  };

  const S = {
    home: Home,
    progress: Progress,
    recap: Recap,
    import: HevyImport,
    measure: Measure,
    measureDetail: MeasureDetail,
    measureEntry: MeasureEntry,
    measureImport: MeasureImport,
    food: Later,
    workout: Workout,
    summary: Summary,
    template: TemplateEditor,
    library: Library,
    exercise: ExerciseDetail,
    settings: Settings,
  }[nav.screen] || Home;

  const isTab = TAB_SCREENS.has(nav.screen);
  return html`<div class="app">
    ${DEMO && html`<div class="demo-bar">Demo met voorbeelddata · plaats gerust comments</div>`}
    <div class="screen"><${S} ctx=${ctx} params=${nav.params} screen=${nav.screen} /></div>
    <div class="dock">
      ${toast && html`<${DS.Toast} ...${toast} onDismiss=${() => setToast(null)} />`}
      ${nav.screen !== "summary" && html`<${WorkoutDock} ctx=${ctx} onWorkout=${nav.screen === "workout"} />`}
      ${isTab && html`<${DS.BottomNav} active=${nav.screen} onChange=${(id) => ctx.tab(id)} />`}
    </div>
    ${sheet && html`<${Sheet} onClose=${() => setSheet(null)}>${sheet}<//>`}
  </div>`;
}

/** Demo: vul de app met voorbeelddata als hij nog leeg is. */
function seedDemo() {
  store.applyRemote(window.VEERGYM_DEMO_DATA || []);
  store.setMeta("token", "demo");
}

async function boot() {
  await store.openStore();
  if (DEMO) {
    if (!store.getMeta("token")) seedDemo();
  } else {
    startSync();
  }
  if (!DEMO && "serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  window.ReactDOM.createRoot(document.getElementById("root")).render(html`<${App} />`);
}

boot();
