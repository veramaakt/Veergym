/* @ds-bundle: {"format":4,"namespace":"DesignSystem_de9512","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"GlassPanel","sourcePath":"components/core/GlassPanel.jsx"},{"name":"ICONS","sourcePath":"components/core/Icon.jsx"},{"name":"ICON_NAMES","sourcePath":"components/core/Icon.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconBadge","sourcePath":"components/core/IconBadge.jsx"},{"name":"SectionHeader","sourcePath":"components/core/SectionHeader.jsx"},{"name":"StatChip","sourcePath":"components/core/StatChip.jsx"},{"name":"StatDelta","sourcePath":"components/core/StatDelta.jsx"},{"name":"ValueField","sourcePath":"components/core/ValueField.jsx"},{"name":"CalendarGrid","sourcePath":"components/data/CalendarGrid.jsx"},{"name":"LineChart","sourcePath":"components/data/LineChart.jsx"},{"name":"ListRow","sourcePath":"components/data/ListRow.jsx"},{"name":"MetricSelector","sourcePath":"components/data/MetricSelector.jsx"},{"name":"MuscleBar","sourcePath":"components/data/MuscleBar.jsx"},{"name":"RadarChart","sourcePath":"components/data/RadarChart.jsx"},{"name":"RangeSelector","sourcePath":"components/data/RangeSelector.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"SyncStatus","sourcePath":"components/feedback/SyncStatus.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"ExerciseHeader","sourcePath":"components/logging/ExerciseHeader.jsx"},{"name":"NextUpPill","sourcePath":"components/logging/NextUpPill.jsx"},{"name":"RestTimerBar","sourcePath":"components/logging/RestTimerBar.jsx"},{"name":"RpeInput","sourcePath":"components/logging/RpeInput.jsx"},{"name":"SetRow","sourcePath":"components/logging/SetRow.jsx"},{"name":"SetTypeBadge","sourcePath":"components/logging/SetTypeBadge.jsx"},{"name":"StatStrip","sourcePath":"components/logging/StatStrip.jsx"},{"name":"MeasurementRow","sourcePath":"components/measurements/MeasurementRow.jsx"},{"name":"WeightTrendChart","sourcePath":"components/measurements/WeightTrendChart.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"},{"name":"MacroRemaining","sourcePath":"components/nutrition/MacroRemaining.jsx"},{"name":"MealBlock","sourcePath":"components/nutrition/MealBlock.jsx"}],"sourceHashes":{"components/core/Button.jsx":"bd460e9fd313","components/core/Chip.jsx":"4ca6d5fa0d7f","components/core/GlassPanel.jsx":"5f48395b6b53","components/core/Icon.jsx":"0b0f719d3697","components/core/IconBadge.jsx":"59c0ad26c815","components/core/SectionHeader.jsx":"7a9287da9276","components/core/StatChip.jsx":"6ebd01ab9ff5","components/core/StatDelta.jsx":"cb1f1b4ddde3","components/core/ValueField.jsx":"7a6320347616","components/data/CalendarGrid.jsx":"2b8eb0b2ca0b","components/data/LineChart.jsx":"a0e771ffb19e","components/data/ListRow.jsx":"58b8f84cc7a2","components/data/MetricSelector.jsx":"e54a832dc012","components/data/MuscleBar.jsx":"b4f6364c03ef","components/data/RadarChart.jsx":"1632ca574b35","components/data/RangeSelector.jsx":"1024942418f1","components/feedback/EmptyState.jsx":"edcbca9286f5","components/feedback/SyncStatus.jsx":"bafcc1d256cf","components/feedback/Toast.jsx":"20898da65bdf","components/logging/ExerciseHeader.jsx":"4d6af2e9341f","components/logging/NextUpPill.jsx":"44264b5f519c","components/logging/RestTimerBar.jsx":"a35063df1d7e","components/logging/RpeInput.jsx":"ffd580c8d4a9","components/logging/SetRow.jsx":"4efef92272f6","components/logging/SetTypeBadge.jsx":"1114a4d1cd90","components/logging/StatStrip.jsx":"3de1ce74a6b1","components/measurements/MeasurementRow.jsx":"03b399ecd3ab","components/measurements/WeightTrendChart.jsx":"8ee5e0973d23","components/navigation/BottomNav.jsx":"a742fa7102d5","components/navigation/TopBar.jsx":"585526cbe08b","components/nutrition/MacroRemaining.jsx":"9ccc68a1aed5","components/nutrition/MealBlock.jsx":"6492cf51010f","ui_kits/app/FoodScreen.jsx":"ed142eb178bc","ui_kits/app/MeasureScreen.jsx":"2b4f6c17dca1","ui_kits/app/ProgressScreen.jsx":"18e860da8758","ui_kits/app/RecapScreen.jsx":"cbb5817c3307","ui_kits/app/WorkoutScreen.jsx":"eadf5f51c62e"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_de9512 = window.DesignSystem_de9512 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const BASE = {
  fontFamily: "inherit",
  fontSize: "var(--button-size)",
  lineHeight: "var(--button-line)",
  fontWeight: 800,
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  justifyContent: "center",
  borderRadius: "var(--radius-md)",
  transition: "opacity .15s ease, transform .1s ease"
};
const VARIANTS = {
  primary: {
    background: "var(--ink)",
    color: "var(--surface-primary)"
  },
  accent: {
    background: "var(--accent-orange)",
    color: "#ffffff"
  },
  onAccent: {
    background: "#ffffff",
    color: "var(--ink)",
    borderRadius: "var(--radius-pill)"
  },
  quiet: {
    background: "transparent",
    color: "var(--ink-soft)",
    padding: "11px 0",
    minHeight: 44
  }
};
const SIZES = {
  md: {
    padding: "11px 18px",
    minHeight: 44
  },
  sm: {
    padding: "8px 13px",
    minHeight: 40
  }
};
function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    onClick: onClick,
    style: {
      ...BASE,
      ...(variant === "quiet" ? {} : SIZES[size] || SIZES.md),
      ...v,
      opacity: disabled ? 0.4 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Chip({
  children,
  selected = false,
  fill,
  color,
  onClick,
  style,
  ...rest
}) {
  const base = {
    fontFamily: "inherit",
    fontSize: "var(--chip-size)",
    lineHeight: "var(--chip-line)",
    fontWeight: 700,
    borderRadius: "var(--radius-pill)",
    padding: "7px 14px",
    minHeight: onClick ? 40 : undefined,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    cursor: onClick ? "pointer" : "default",
    whiteSpace: "nowrap",
    transition: "background .15s ease, color .15s ease"
  };
  const skin = fill ? {
    background: fill,
    color: color || "var(--ink)",
    border: "1px solid transparent"
  } : selected ? {
    background: "var(--ink)",
    color: "var(--surface-primary)",
    border: "1px solid var(--ink)"
  } : {
    background: "transparent",
    color: "var(--ink-soft)",
    border: "1px solid var(--border)"
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    style: {
      ...base,
      ...skin,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/GlassPanel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function GlassPanel({
  children,
  tone = "light",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: "relative",
      background: tone === "dark" ? "var(--glass-fill-dark)" : "var(--glass-fill)",
      border: "1px solid " + (tone === "dark" ? "var(--glass-border-dark)" : "var(--glass-border)"),
      borderRadius: "var(--radius-lg)",
      backdropFilter: "var(--glass-blur)",
      WebkitBackdropFilter: "var(--glass-blur)",
      color: tone === "dark" ? "var(--text-on-deep-green)" : "var(--ink)",
      padding: "14px 16px",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { GlassPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/GlassPanel.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ICONS = {
  bars: '<path d="M6 14v5M12 9v10M18 5v14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"></path>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="3" stroke="currentColor" stroke-width="1.8" fill="none"></rect><path d="M4 9.5h16M8 3.5v3.5M16 3.5v3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"></path>',
  check: '<path d="M5 12.5l4.5 4.5L19.5 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>',
  "chevron-down": '<path d="M5 9l7 7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>',
  clock: '<circle cx="12" cy="12" r="8.2" stroke="currentColor" stroke-width="1.8" fill="none"></circle><path d="M12 8v4.3l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>',
  close: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>',
  dumbbell: '<path d="M4 9v6M2 10.5v3M20 9v6M22 10.5v3M7 7v10M17 7v10M7 12h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>',
  fork: '<path d="M7 3v7a2 2 0 0 1-2 2 2 2 0 0 1-2-2V3M5 12v9M17 3c-1.5 0-2.5 2-2.5 4.5S15.5 12 17 12s2.5-2 2.5-4.5S18.5 3 17 3Zm0 9v9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>',
  home: '<path d="M4 11.5 12 4l8 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"></path><path d="M6 10v9.5h12V10" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="none"></path>',
  kebab: '<circle cx="12" cy="5.5" r="1.7" fill="currentColor"></circle><circle cx="12" cy="12" r="1.7" fill="currentColor"></circle><circle cx="12" cy="18.5" r="1.7" fill="currentColor"></circle>',
  plus: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>',
  radar: '<path d="M12 3v9l7 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"></path><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8" fill="none"></circle>',
  repeat: '<path d="M4 12a8 8 0 0 1 13.6-5.7M20 12a8 8 0 0 1-13.6 5.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"></path><path d="M17.6 3.5v3.3h-3.3M6.4 20.5v-3.3h3.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>',
  scale: '<rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="1.8" fill="none"></rect><path d="M12 9v3l2 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>',
  search: '<circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.8" fill="none"></circle><path d="M19 19l-4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>',
  skip: '<path d="M6 6v12M9 12l9-6.5v13L9 12Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="none"></path>',
  trend: '<path d="M4 16l5.5-6 4 3.5L20 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"></path><path d="M15 6h5v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>'
};
const ICON_NAMES = Object.keys(ICONS);
function Icon({
  name,
  size = 20,
  color = "currentColor",
  style,
  ...rest
}) {
  const body = ICONS[name];
  if (!body) return null;
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    "aria-hidden": "true",
    style: {
      display: "block",
      color,
      flex: "none",
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: body
    }
  }, rest));
}
Object.assign(__ds_scope, { ICONS, ICON_NAMES, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/IconBadge.jsx
try { (() => {
function IconBadge({
  icon,
  size = 34,
  fill = "var(--accent-peach)",
  color = "var(--ink)",
  style,
  children
}) {
  const radius = Math.round(size * 0.36);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      flex: "none",
      borderRadius: Math.min(Math.max(radius, 9), 14),
      background: fill,
      color,
      display: "grid",
      placeItems: "center",
      ...style
    }
  }, children || /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: Math.round(size * 0.53)
  }));
}
Object.assign(__ds_scope, { IconBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconBadge.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHeader.jsx
try { (() => {
function SectionHeader({
  icon,
  iconFill = "var(--accent-peach)",
  title,
  subtitle,
  right,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      ...style
    }
  }, icon, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--title-size)",
      lineHeight: "var(--title-line)",
      fontWeight: 800,
      color: "var(--ink)"
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 600,
      color: "var(--ink-soft)"
    }
  }, subtitle) : null), right);
}
Object.assign(__ds_scope, { SectionHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHeader.jsx", error: String((e && e.message) || e) }); }

// components/core/StatChip.jsx
try { (() => {
function StatChip({
  label,
  value,
  fill = "var(--accent-orange)",
  color = "var(--accent-orange-ink)",
  labelColor,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: fill,
      color,
      borderRadius: 14,
      padding: "9px 13px 10px",
      minWidth: 84,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--caption-size)",
      lineHeight: "var(--caption-line)",
      fontWeight: 700,
      letterSpacing: ".06em",
      textTransform: "uppercase",
      color: labelColor || color
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      fontWeight: 800
    }
  }, value));
}
Object.assign(__ds_scope, { StatChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatChip.jsx", error: String((e && e.message) || e) }); }

// components/core/StatDelta.jsx
try { (() => {
function StatDelta({
  direction = "up",
  children,
  style
}) {
  const up = direction === "up";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--delta-size)",
      lineHeight: "var(--delta-line)",
      fontWeight: 700,
      color: up ? "var(--delta-up)" : "var(--delta-down)",
      ...style
    }
  }, up ? "\u2191" : "\u2193", children);
}
Object.assign(__ds_scope, { StatDelta });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatDelta.jsx", error: String((e && e.message) || e) }); }

// components/core/ValueField.jsx
try { (() => {
function ValueField({
  value,
  placeholder = "\u2013",
  active = false,
  width = 58,
  onClick,
  style
}) {
  const empty = value === undefined || value === null || value === "";
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    style: {
      fontFamily: "inherit",
      width,
      border: "none",
      background: active ? "var(--accent-mint-soft)" : "var(--surface-tint)",
      color: empty ? "var(--ink-soft)" : "var(--ink)",
      borderRadius: "var(--radius-sm)",
      padding: "7px 0",
      minHeight: 44,
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      fontWeight: 800,
      textAlign: "center",
      cursor: "pointer",
      ...style
    }
  }, empty ? placeholder : value);
}
Object.assign(__ds_scope, { ValueField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ValueField.jsx", error: String((e && e.message) || e) }); }

// components/data/CalendarGrid.jsx
try { (() => {
const DAYS = ["ZO", "MA", "DI", "WO", "DO", "VR", "ZA"];
function CalendarGrid({
  days = 30,
  startWeekday = 1,
  trained = [],
  note,
  style
}) {
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 6
    }
  }, DAYS.map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      textAlign: "center",
      fontSize: "var(--caption-size)",
      lineHeight: "var(--caption-line)",
      fontWeight: 700,
      letterSpacing: ".06em",
      color: "var(--ink-soft)"
    }
  }, d)), cells.map((d, i) => {
    const on = d !== null && trained.indexOf(d) !== -1;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        height: 38,
        display: "grid",
        placeItems: "center",
        borderRadius: "var(--radius-md)",
        background: on ? "var(--accent-orange-soft)" : "transparent",
        color: on ? "var(--accent-orange-fg)" : "var(--ink-soft)",
        fontSize: "var(--body-md-size)",
        fontWeight: on ? 800 : 600
      }
    }, d || "");
  })), note ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      marginTop: 12,
      fontSize: "var(--body-sm-size)",
      fontWeight: 600,
      color: "var(--ink-soft)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 3,
      border: "1.5px solid var(--accent-orange-fg)"
    }
  }), note) : null);
}
Object.assign(__ds_scope, { CalendarGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/CalendarGrid.jsx", error: String((e && e.message) || e) }); }

// components/data/LineChart.jsx
try { (() => {
function smoothPath(pts) {
  if (pts.length < 2) return "";
  let d = "M" + pts[0].x + " " + pts[0].y;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cx = (p0.x + p1.x) / 2;
    d += " C" + cx + " " + p0.y + "," + cx + " " + p1.y + "," + p1.x + " " + p1.y;
  }
  return d;
}
function LineChart({
  values = [],
  labels = [],
  color = "var(--accent-orange)",
  height = 130,
  prIndex = null,
  formatValue,
  min: minProp,
  max: maxProp,
  style
}) {
  const ref = React.useRef(null);
  const [hover, setHover] = React.useState(null);
  const gid = React.useRef("lc" + Math.random().toString(36).slice(2, 8));
  const W = 320;
  const H = height;
  const padY = 16;
  const min = minProp != null ? minProp : Math.min.apply(null, values);
  const max = maxProp != null ? maxProp : Math.max.apply(null, values);
  const span = max - min || 1;
  const pts = values.map((v, i) => ({
    x: i / Math.max(values.length - 1, 1) * W,
    y: padY + (1 - (v - min) / span) * (H - padY * 2),
    v,
    i
  }));
  const line = smoothPath(pts);
  const area = line + " L" + W + " " + H + " L0 " + H + " Z";
  const last = pts[pts.length - 1];
  function onMove(e) {
    const box = ref.current.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width * W;
    let best = pts[0];
    for (const p of pts) if (Math.abs(p.x - x) < Math.abs(best.x - x)) best = p;
    setHover(best);
  }
  const shown = hover || null;
  const fmt = formatValue || (v => String(v));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    ref: ref,
    viewBox: "0 0 " + W + " " + H,
    preserveAspectRatio: "none",
    style: {
      display: "block",
      width: "100%",
      height: H,
      touchAction: "none",
      cursor: "crosshair"
    },
    onPointerDown: onMove,
    onPointerMove: e => {
      if (e.buttons || e.pointerType === "mouse") onMove(e);
    },
    onPointerLeave: () => setHover(null)
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: gid.current,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: color,
    stopOpacity: "0.4"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: color,
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: "url(#" + gid.current + ")"
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: color,
    strokeWidth: "3",
    strokeLinecap: "round",
    vectorEffect: "non-scaling-stroke"
  }), prIndex !== null && pts[prIndex] ? /*#__PURE__*/React.createElement("circle", {
    cx: pts[prIndex].x,
    cy: pts[prIndex].y,
    r: "5",
    fill: "var(--surface-primary)",
    stroke: color,
    strokeWidth: "2"
  }) : null, /*#__PURE__*/React.createElement("circle", {
    cx: last ? last.x : 0,
    cy: last ? last.y : 0,
    r: "4.5",
    fill: color
  }), shown ? /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: shown.x,
    y1: "0",
    x2: shown.x,
    y2: H,
    stroke: color,
    strokeWidth: "1",
    strokeDasharray: "3 3",
    opacity: "0.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: shown.x,
    cy: shown.y,
    r: "6",
    fill: color,
    stroke: "var(--surface-primary)",
    strokeWidth: "2"
  })) : null), shown ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: shown.x / W * 100 + "%",
      top: Math.max(shown.y - 44, 0),
      transform: "translateX(-50%)",
      background: "var(--surface-primary)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)",
      boxShadow: "var(--shadow-popover)",
      padding: "5px 9px",
      whiteSpace: "nowrap",
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--caption-size)",
      fontWeight: 700,
      color: "var(--ink-soft)"
    }
  }, labels[shown.i] || ""), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-sm-size)",
      fontWeight: 800,
      color: "var(--ink)"
    }
  }, fmt(shown.v))) : null, labels.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 6,
      fontSize: "var(--caption-size)",
      lineHeight: "var(--caption-line)",
      fontWeight: 700,
      color: "var(--ink-soft)"
    }
  }, /*#__PURE__*/React.createElement("span", null, labels[0]), /*#__PURE__*/React.createElement("span", null, labels[Math.floor(labels.length / 2)]), /*#__PURE__*/React.createElement("span", null, labels[labels.length - 1])) : null);
}
Object.assign(__ds_scope, { LineChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/LineChart.jsx", error: String((e && e.message) || e) }); }

// components/data/ListRow.jsx
try { (() => {
function ListRow({
  icon = "dumbbell",
  badgeFill = "var(--accent-peach)",
  name,
  sub,
  tags = [],
  value,
  first = false,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      padding: "12px 0",
      borderTop: first ? "none" : "1px solid var(--border)",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconBadge, {
    icon: icon,
    size: 32,
    fill: badgeFill
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      fontWeight: 800
    }
  }, name), sub ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 600,
      color: "var(--ink-soft)"
    }
  }, sub) : null, tags.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 5
    }
  }, tags.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      borderRadius: "var(--radius-pill)",
      border: "1px solid var(--border)",
      padding: "2px 9px",
      fontSize: "var(--caption-size)",
      lineHeight: "var(--caption-line)",
      fontWeight: 700,
      color: "var(--ink-soft)"
    }
  }, t))) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      fontWeight: 800,
      textAlign: "right"
    }
  }, value));
}
Object.assign(__ds_scope, { ListRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ListRow.jsx", error: String((e && e.message) || e) }); }

// components/data/MetricSelector.jsx
try { (() => {
function MetricSelector({
  options = [],
  value,
  onChange,
  style
}) {
  const [open, setOpen] = React.useState(false);
  if (!open) {
    return /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setOpen(true),
      style: {
        fontFamily: "inherit",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "transparent",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-pill)",
        padding: "7px 13px",
        minHeight: 40,
        color: "var(--ink-soft)",
        fontSize: "var(--chip-size)",
        lineHeight: "var(--chip-line)",
        fontWeight: 700,
        cursor: "pointer",
        ...style
      }
    }, value, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "chevron-down",
      size: 13
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 7,
      overflowX: "auto",
      paddingBottom: 2,
      maskImage: "linear-gradient(to right,#000 92%,transparent)",
      WebkitMaskImage: "linear-gradient(to right,#000 92%,transparent)",
      ...style
    }
  }, options.map(o => /*#__PURE__*/React.createElement(__ds_scope.Chip, {
    key: o,
    selected: o === value,
    onClick: () => {
      if (onChange) onChange(o);
      setOpen(false);
    }
  }, o)));
}
Object.assign(__ds_scope, { MetricSelector });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/MetricSelector.jsx", error: String((e && e.message) || e) }); }

// components/data/MuscleBar.jsx
try { (() => {
function MuscleBar({
  label,
  count,
  max = 1,
  color = "var(--accent-lavender)",
  style
}) {
  const pct = Math.max(4, Math.round(count / max * 100));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "6px 0",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 92,
      flex: "none",
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 700,
      color: "var(--ink)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 8,
      borderRadius: "var(--radius-sm)",
      background: "var(--surface-tint)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + "%",
      height: "100%",
      borderRadius: "var(--radius-sm)",
      background: color
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      flex: "none",
      textAlign: "right",
      fontSize: "var(--body-sm-size)",
      fontWeight: 800,
      color: "var(--ink-soft)"
    }
  }, count, "\xD7"));
}
Object.assign(__ds_scope, { MuscleBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/MuscleBar.jsx", error: String((e && e.message) || e) }); }

// components/data/RadarChart.jsx
try { (() => {
function RadarChart({
  axes = [],
  series = [],
  compare = null,
  color = "var(--accent-orange)",
  size = 240,
  legend = null,
  style
}) {
  const n = axes.length;
  const c = size / 2;
  const r = size / 2 - 26;
  const pt = (i, f) => {
    const a = Math.PI * 2 * i / n - Math.PI / 2;
    return [c + Math.cos(a) * r * f, c + Math.sin(a) * r * f];
  };
  const maxV = Math.max(1, ...series, ...(compare || []));
  const poly = vals => vals.map((v, i) => pt(i, v / maxV).join(",")).join(" ");
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 " + size + " " + size,
    style: {
      display: "block",
      width: "100%",
      maxWidth: size,
      margin: "0 auto"
    }
  }, [0.34, 0.67, 1].map(f => /*#__PURE__*/React.createElement("polygon", {
    key: f,
    points: axes.map((_, i) => pt(i, f).join(",")).join(" "),
    fill: "none",
    stroke: "var(--border)",
    strokeWidth: "1"
  })), axes.map((_, i) => {
    const p = pt(i, 1);
    return /*#__PURE__*/React.createElement("line", {
      key: i,
      x1: c,
      y1: c,
      x2: p[0],
      y2: p[1],
      stroke: "var(--border)",
      strokeWidth: "1"
    });
  }), compare ? /*#__PURE__*/React.createElement("polygon", {
    points: poly(compare),
    fill: "none",
    stroke: "var(--accent-compare)",
    strokeWidth: "2",
    strokeDasharray: "4 4"
  }) : null, /*#__PURE__*/React.createElement("polygon", {
    points: poly(series),
    fill: color,
    fillOpacity: "0.28",
    stroke: color,
    strokeWidth: "2"
  }), series.map((v, i) => {
    const p = pt(i, v / maxV);
    return /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: p[0],
      cy: p[1],
      r: "3.5",
      fill: color
    });
  }), axes.map((label, i) => {
    const p = pt(i, 1.2);
    return /*#__PURE__*/React.createElement("text", {
      key: label,
      x: p[0],
      y: p[1],
      textAnchor: p[0] > c + 4 ? "start" : p[0] < c - 4 ? "end" : "middle",
      dominantBaseline: "middle",
      fill: "var(--ink)",
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 11,
        fontWeight: 800
      }
    }, label);
  })), legend ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 16,
      marginTop: 8
    }
  }, legend.map(l => /*#__PURE__*/React.createElement("div", {
    key: l.label,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: "var(--caption-size)",
      fontWeight: 700,
      color: "var(--ink-soft)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: 2,
      background: l.color
    }
  }), l.label))) : null);
}
Object.assign(__ds_scope, { RadarChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/RadarChart.jsx", error: String((e && e.message) || e) }); }

// components/data/RangeSelector.jsx
try { (() => {
function RangeSelector({
  options = ["4w", "3m", "1j", "Alles"],
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      ...style
    }
  }, options.map(o => /*#__PURE__*/React.createElement(__ds_scope.Chip, {
    key: o,
    selected: o === value,
    onClick: () => onChange && onChange(o)
  }, o)));
}
Object.assign(__ds_scope, { RangeSelector });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/RangeSelector.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function EmptyState({
  icon = "trend",
  title,
  body,
  action,
  onAction,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      placeItems: "center",
      padding: "36px 20px",
      textAlign: "center",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 260
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      margin: "0 auto",
      borderRadius: "var(--radius-md)",
      background: "var(--surface-tint)",
      color: "var(--ink-soft)",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontSize: "var(--title-size)",
      lineHeight: "var(--title-line)",
      fontWeight: 800
    }
  }, title), body ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 600,
      color: "var(--ink-soft)"
    }
  }, body) : null, action ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    onClick: onAction
  }, action)) : null));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/SyncStatus.jsx
try { (() => {
const MODES = {
  synced: {
    icon: "check",
    label: "Gesynchroniseerd",
    color: "var(--ink-soft)",
    fill: "transparent"
  },
  syncing: {
    icon: "repeat",
    label: "Synchroniseren…",
    color: "var(--ink-soft)",
    fill: "transparent"
  },
  offline: {
    icon: "clock",
    label: "Offline — lokaal opgeslagen",
    color: "var(--accent-citrus-ink)",
    fill: "var(--accent-citrus)"
  }
};
function SyncStatus({
  mode = "synced",
  detail,
  style
}) {
  const m = MODES[mode] || MODES.synced;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      background: m.fill,
      color: m.color,
      border: m.fill === "transparent" ? "none" : "1px solid transparent",
      borderRadius: "var(--radius-pill)",
      padding: m.fill === "transparent" ? "4px 0" : "5px 11px",
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 700,
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: m.icon,
    size: 14
  }), detail || m.label);
}
Object.assign(__ds_scope, { SyncStatus });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/SyncStatus.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function Toast({
  title,
  detail,
  icon = "trend",
  fill = "var(--accent-citrus)",
  color = "var(--accent-citrus-ink)",
  onDismiss,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      background: fill,
      color,
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-float)",
      padding: "11px 12px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      flex: "none",
      borderRadius: 11,
      background: "rgba(255,255,255,.5)",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 17
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      fontWeight: 800
    }
  }, title), detail ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 600
    }
  }, detail) : null), onDismiss ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onDismiss,
    "aria-label": "Sluiten",
    style: {
      background: "none",
      border: "none",
      padding: 0,
      width: 44,
      height: 44,
      marginRight: -8,
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      color: "inherit"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "close",
    size: 16
  })) : null);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/logging/ExerciseHeader.jsx
try { (() => {
function ExerciseHeader({
  name,
  meta,
  target,
  note,
  badgeFill = "var(--accent-peach)",
  onMenu,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconBadge, {
    icon: "dumbbell",
    size: 34,
    fill: badgeFill
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--title-size)",
      lineHeight: "var(--title-line)",
      fontWeight: 800
    }
  }, name), meta ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 600,
      color: "var(--ink-soft)"
    }
  }, meta) : null), onMenu ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onMenu,
    "aria-label": "Menu",
    style: {
      background: "none",
      border: "none",
      padding: 0,
      width: 44,
      height: 44,
      marginRight: -10,
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      color: "var(--ink-soft)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "kebab",
    size: 18
  })) : null), target ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 700,
      color: "var(--ink-soft)"
    }
  }, target) : null, note ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontStyle: "italic",
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 600,
      color: "var(--ink-soft)"
    }
  }, note) : null);
}
Object.assign(__ds_scope, { ExerciseHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/logging/ExerciseHeader.jsx", error: String((e && e.message) || e) }); }

// components/logging/NextUpPill.jsx
try { (() => {
function NextUpPill({
  label,
  fill = "var(--accent-blue-light)",
  color = "var(--ink)",
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    style: {
      fontFamily: "inherit",
      display: "inline-flex",
      alignItems: "center",
      gap: 9,
      background: fill,
      color,
      border: "none",
      borderRadius: "var(--radius-pill)",
      padding: "8px 16px 8px 8px",
      cursor: "pointer",
      whiteSpace: "nowrap",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      borderRadius: "50%",
      background: "rgba(255,255,255,.55)",
      display: "grid",
      placeItems: "center",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "dumbbell",
    size: 14
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      fontWeight: 800
    }
  }, label));
}
Object.assign(__ds_scope, { NextUpPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/logging/NextUpPill.jsx", error: String((e && e.message) || e) }); }

// components/logging/RestTimerBar.jsx
try { (() => {
function RestTimerBar({
  time,
  onMinus,
  onPlus,
  onSkip,
  style
}) {
  const adjust = {
    fontFamily: "inherit",
    background: "rgba(255,255,255,.22)",
    color: "#ffffff",
    border: "none",
    borderRadius: "var(--radius-sm)",
    padding: "6px 11px",
    minWidth: 48,
    minHeight: 40,
    fontSize: "var(--chip-size)",
    fontWeight: 800,
    cursor: "pointer"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: "var(--accent-orange)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-float-accent)",
      padding: "10px 12px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onMinus,
    style: adjust
  }, "\u221215"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: "center",
      color: "#ffffff",
      fontSize: "var(--display-md-size)",
      lineHeight: "var(--display-md-line)",
      fontWeight: 800
    }
  }, time), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onPlus,
    style: adjust
  }, "+15"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "onAccent",
    size: "sm",
    onClick: onSkip
  }, "Skip"));
}
Object.assign(__ds_scope, { RestTimerBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/logging/RestTimerBar.jsx", error: String((e && e.message) || e) }); }

// components/logging/RpeInput.jsx
try { (() => {
function RpeInput({
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--caption-size)",
      lineHeight: "var(--caption-line)",
      fontWeight: 700,
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "var(--ink-soft)"
    }
  }, "RPE ", /*#__PURE__*/React.createElement("span", {
    style: {
      textTransform: "none",
      letterSpacing: 0
    }
  }, "(optioneel)")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      marginTop: 7,
      flexWrap: "wrap"
    }
  }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
    const on = value === n;
    return /*#__PURE__*/React.createElement("button", {
      key: n,
      type: "button",
      onClick: () => onChange && onChange(on ? null : n),
      "aria-pressed": on,
      style: {
        fontFamily: "inherit",
        width: 30,
        height: 44,
        border: "none",
        background: "transparent",
        padding: 0,
        cursor: "pointer",
        display: "grid",
        placeItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 28,
        height: 28,
        borderRadius: "var(--radius-sm)",
        display: "grid",
        placeItems: "center",
        background: on ? "var(--ink)" : "var(--surface-tint)",
        color: on ? "var(--surface-primary)" : "var(--ink-soft)",
        fontSize: "var(--body-sm-size)",
        fontWeight: 800
      }
    }, n));
  })));
}
Object.assign(__ds_scope, { RpeInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/logging/RpeInput.jsx", error: String((e && e.message) || e) }); }

// components/logging/SetRow.jsx
try { (() => {
function SetRow({
  index,
  previous,
  weight,
  reps,
  done = false,
  onToggle,
  onEditWeight,
  onEditReps,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "22px 1fr 58px 58px 44px",
      alignItems: "center",
      gap: 10,
      padding: "8px 10px",
      borderRadius: "var(--radius-md)",
      background: done ? "var(--accent-mint-soft)" : "transparent",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-sm-size)",
      fontWeight: 700,
      color: "var(--ink-soft)"
    }
  }, index), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 600,
      color: "var(--ink-soft)"
    }
  }, previous || "\u2013"), /*#__PURE__*/React.createElement(__ds_scope.ValueField, {
    value: weight,
    active: done,
    onClick: onEditWeight
  }), /*#__PURE__*/React.createElement(__ds_scope.ValueField, {
    value: reps,
    active: done,
    onClick: onEditReps
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onToggle,
    "aria-label": done ? "Set voltooid" : "Set afvinken",
    style: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      background: "transparent",
      border: "none",
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      background: done ? "var(--ink)" : "transparent",
      border: done ? "1px solid var(--ink)" : "1px solid var(--border)",
      color: done ? "var(--surface-primary)" : "transparent"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 15
  }))));
}
Object.assign(__ds_scope, { SetRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/logging/SetRow.jsx", error: String((e && e.message) || e) }); }

// components/logging/SetTypeBadge.jsx
try { (() => {
const TYPES = {
  normal: null,
  warmup: {
    short: "W",
    label: "Warming-up",
    fill: "var(--surface-tint)",
    color: "var(--ink-soft)"
  },
  dropset: {
    short: "D",
    label: "Dropset",
    fill: "var(--accent-lavender)",
    color: "var(--ink)"
  },
  failure: {
    short: "F",
    label: "Tot falen",
    fill: "var(--accent-orange)",
    color: "#ffffff"
  }
};
function SetTypeBadge({
  type = "normal",
  index,
  style
}) {
  const t = TYPES[type];
  if (!t) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--body-sm-size)",
        lineHeight: "var(--body-sm-line)",
        fontWeight: 700,
        color: "var(--ink-soft)",
        ...style
      }
    }, index);
  }
  return /*#__PURE__*/React.createElement("span", {
    title: t.label,
    "aria-label": t.label,
    style: {
      display: "inline-grid",
      placeItems: "center",
      width: 20,
      height: 20,
      borderRadius: 6,
      background: t.fill,
      color: t.color,
      fontSize: "var(--caption-size)",
      lineHeight: "var(--caption-line)",
      fontWeight: 800,
      ...style
    }
  }, t.short);
}
Object.assign(__ds_scope, { SetTypeBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/logging/SetTypeBadge.jsx", error: String((e && e.message) || e) }); }

// components/logging/StatStrip.jsx
try { (() => {
function StatStrip({
  items = [],
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      ...style
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      textAlign: i === items.length - 1 ? "right" : "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--caption-size)",
      lineHeight: "var(--caption-line)",
      fontWeight: 700,
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "var(--ink-soft)"
    }
  }, it.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--title-size)",
      lineHeight: "var(--title-line)",
      fontWeight: 800,
      color: it.accent || "var(--ink)"
    }
  }, it.value))));
}
Object.assign(__ds_scope, { StatStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/logging/StatStrip.jsx", error: String((e && e.message) || e) }); }

// components/measurements/MeasurementRow.jsx
try { (() => {
function MeasurementRow({
  label,
  value,
  unit = "cm",
  sinceStart,
  direction,
  first = false,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    style: {
      fontFamily: "inherit",
      width: "100%",
      textAlign: "left",
      background: "transparent",
      border: "none",
      borderTop: first ? "none" : "1px solid var(--border)",
      padding: "13px 0",
      minHeight: 44,
      display: "flex",
      alignItems: "center",
      gap: 12,
      cursor: onClick ? "pointer" : "default",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      fontWeight: 700,
      color: "var(--ink)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      fontWeight: 800
    }
  }, value == null ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink-soft)"
    }
  }, "\u2013") : value, value == null ? "" : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-sm-size)",
      fontWeight: 700
    }
  }, " ", unit)), sinceStart ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--delta-size)",
      lineHeight: "var(--delta-line)",
      fontWeight: 700,
      color: "var(--ink-soft)"
    }
  }, direction === "up" ? "↑" : direction === "down" ? "↓" : "", sinceStart, " sinds start") : null), onClick ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 16,
    style: {
      color: "var(--ink-soft)",
      transform: "rotate(-90deg)"
    }
  }) : null);
}
Object.assign(__ds_scope, { MeasurementRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/measurements/MeasurementRow.jsx", error: String((e && e.message) || e) }); }

// components/measurements/WeightTrendChart.jsx
try { (() => {
function movingAverage(values, window) {
  return values.map((_, i) => {
    const from = Math.max(0, i - window + 1);
    const slice = values.slice(from, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}
function WeightTrendChart({
  values = [],
  labels = [],
  window = 7,
  height = 140,
  style
}) {
  const avg = movingAverage(values, window);
  const W = 320;
  const H = height;
  const padY = 16;
  // One shared domain for both layers. The raw range contains the average's,
  // so the dots always sit where the line says they should.
  const min = Math.min.apply(null, values);
  const max = Math.max.apply(null, values);
  const span = max - min || 1;
  const dots = values.map((v, i) => ({
    x: i / Math.max(values.length - 1, 1) * W,
    y: padY + (1 - (v - min) / span) * (H - padY * 2)
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 " + W + " " + H,
    preserveAspectRatio: "none",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: H,
      pointerEvents: "none"
    }
  }, dots.map((d, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: d.x,
    cy: d.y,
    r: "2.5",
    fill: "var(--ink-soft)",
    opacity: "0.45"
  }))), /*#__PURE__*/React.createElement(__ds_scope.LineChart, {
    values: avg,
    labels: labels,
    color: "var(--accent-pink)",
    height: H,
    min: min,
    max: max,
    formatValue: v => v.toFixed(1).replace(".", ",") + " kg"
  }));
}
Object.assign(__ds_scope, { WeightTrendChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/measurements/WeightTrendChart.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
const TABS = [{
  id: "home",
  icon: "home",
  label: "Log"
}, {
  id: "progress",
  icon: "trend",
  label: "Voortgang"
}, {
  id: "measure",
  icon: "scale",
  label: "Metingen"
}, {
  id: "food",
  icon: "fork",
  label: "Eten"
}];
function BottomNav({
  active = "home",
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "var(--surface-tint)",
      borderRadius: "var(--radius-pill)",
      boxShadow: "var(--shadow-float)",
      padding: 8,
      ...style
    }
  }, TABS.map(t => {
    const on = t.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      type: "button",
      onClick: () => onChange && onChange(t.id),
      "aria-label": t.label,
      "aria-current": on ? "page" : undefined,
      style: {
        flex: 1,
        height: 48,
        border: "none",
        background: "transparent",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        color: "var(--ink)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        height: 44,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        background: on ? "var(--ink)" : "transparent",
        color: on ? "var(--surface-tint)" : "var(--ink-soft)"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: t.icon,
      size: 20
    })));
  }));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
function TopBar({
  title,
  leading = "collapse",
  onLeading,
  action,
  progress = null,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-primary)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 16px"
    }
  }, leading === "none" ? null : /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onLeading,
    "aria-label": leading === "close" ? "Sluiten" : "Inklappen",
    style: {
      background: "transparent",
      border: "none",
      borderRadius: "50%",
      width: 44,
      height: 44,
      marginLeft: -10,
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      color: "var(--ink-soft)",
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: leading === "close" ? 34 : 26,
      height: leading === "close" ? 34 : 26,
      borderRadius: leading === "close" ? "50%" : "var(--radius-sm)",
      background: leading === "close" ? "var(--surface-tint)" : "transparent",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: leading === "close" ? "close" : "chevron-down",
    size: leading === "close" ? 16 : 20
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      fontSize: "var(--title-size)",
      lineHeight: "var(--title-line)",
      fontWeight: 800
    }
  }, title), action ? typeof action === "string" ? /*#__PURE__*/React.createElement(__ds_scope.Button, null, action) : action : null), progress !== null ? /*#__PURE__*/React.createElement("div", {
    style: {
      height: 3,
      background: "var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: Math.round(progress * 100) + "%",
      height: "100%",
      background: "var(--accent-orange)"
    }
  })) : null);
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// components/nutrition/MacroRemaining.jsx
try { (() => {
function Remaining({
  label,
  value,
  unit
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--caption-size)",
      lineHeight: "var(--caption-line)",
      fontWeight: 700,
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "inherit"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--title-size)",
      lineHeight: "var(--title-line)",
      fontWeight: 800
    }
  }, value, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-sm-size)",
      fontWeight: 700
    }
  }, unit)));
}
function MacroRemaining({
  kcal,
  protein,
  fat,
  carbs,
  date,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--accent-nutrition-hero)",
      borderRadius: 22,
      padding: 14,
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.GlassPanel, {
    tone: "dark"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--caption-size)",
      lineHeight: "var(--caption-line)",
      fontWeight: 700,
      letterSpacing: ".08em",
      textTransform: "uppercase"
    }
  }, "Nog over vandaag"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--display-lg-size)",
      lineHeight: "var(--display-lg-line)",
      fontWeight: 800,
      marginTop: 2
    }
  }, kcal, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-md-size)",
      fontWeight: 700
    }
  }, " kcal")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Remaining, {
    label: "Eiwit",
    value: protein,
    unit: " g"
  }), /*#__PURE__*/React.createElement(Remaining, {
    label: "Vet",
    value: fat,
    unit: " g"
  }), /*#__PURE__*/React.createElement(Remaining, {
    label: "Koolhydraten",
    value: carbs,
    unit: " g"
  })), date ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 600
    }
  }, date) : null));
}
Object.assign(__ds_scope, { MacroRemaining });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/nutrition/MacroRemaining.jsx", error: String((e && e.message) || e) }); }

// components/nutrition/MealBlock.jsx
try { (() => {
function MealBlock({
  meal,
  accent = "var(--accent-peach)",
  note,
  recipe,
  kcal,
  protein,
  fat,
  carbs,
  onEdit,
  style
}) {
  const empty = !note;
  const macro = (label, v, unit) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      minWidth: 52
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--caption-size)",
      lineHeight: "var(--caption-line)",
      fontWeight: 700,
      letterSpacing: ".06em",
      textTransform: "uppercase",
      color: "var(--ink-soft)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      fontWeight: 800,
      color: v == null ? "var(--ink-soft)" : "var(--ink)"
    }
  }, v == null ? "–" : v, v == null ? "" : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-sm-size)",
      fontWeight: 700
    }
  }, unit)));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      paddingTop: 14,
      paddingBottom: 14,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconBadge, {
    icon: "fork",
    size: 32,
    fill: accent
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      fontWeight: 800
    }
  }, meal), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onEdit,
    "aria-label": "Bewerk " + meal,
    style: {
      background: "none",
      border: "none",
      padding: 0,
      width: 44,
      height: 44,
      marginRight: -10,
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      color: "var(--ink-soft)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: empty ? "plus" : "kebab",
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 9,
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 600,
      color: empty ? "var(--ink-soft)" : "var(--ink)"
    }
  }, empty ? "Nog niets genoteerd" : note), recipe ? /*#__PURE__*/React.createElement("a", {
    href: recipe,
    style: {
      display: "inline-block",
      marginTop: 6,
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 700,
      color: "var(--accent-blue)"
    }
  }, "Recept") : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      marginTop: 11
    }
  }, macro("kcal", kcal, ""), macro("Eiwit", protein, " g"), macro("Vet", fat, " g"), macro("Kh", carbs, " g")));
}
Object.assign(__ds_scope, { MealBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/nutrition/MealBlock.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/FoodScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  BottomNav,
  MacroRemaining,
  MealBlock,
  Button,
  Icon,
  SyncStatus
} = window.DesignSystem_de9512;
const MEALS = [{
  meal: "Ontbijt",
  accent: "var(--accent-peach)",
  note: "Havermout met skyr, blauwe bessen en een schep pindakaas",
  kcal: 430,
  protein: 32,
  fat: 14,
  carbs: 48
}, {
  meal: "Lunch",
  accent: "var(--accent-mint)",
  note: "Twee boterhammen hüttenkäse, handje noten, appel",
  kcal: 480,
  protein: 28,
  fat: 19,
  carbs: 52
}, {
  meal: "Snack",
  accent: "var(--accent-lavender)",
  note: "Eiwitshake na het trainen",
  kcal: 160,
  protein: 25,
  fat: 2,
  carbs: 8
}, {
  meal: "Diner",
  accent: "var(--accent-blue-light)",
  note: "",
  kcal: null,
  protein: null,
  fat: null,
  carbs: null,
  recipe: null
}, {
  meal: "Extra",
  accent: "var(--accent-pink)",
  note: "",
  kcal: null,
  protein: null,
  fat: null,
  carbs: null
}];
const GOAL = {
  kcal: 1800,
  protein: 130,
  fat: 60,
  carbs: 185
};
function FoodScreen({
  onTab
}) {
  const [copied, setCopied] = React.useState(false);
  const used = MEALS.reduce((a, m) => ({
    kcal: a.kcal + (m.kcal || 0),
    protein: a.protein + (m.protein || 0),
    fat: a.fat + (m.fat || 0),
    carbs: a.carbs + (m.carbs || 0)
  }), {
    kcal: 0,
    protein: 0,
    fat: 0,
    carbs: 0
  });
  const copy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "var(--surface-primary)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "16px 16px 90px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: "var(--title-size)",
      lineHeight: "var(--title-line)",
      fontWeight: 800
    }
  }, "Eten"), /*#__PURE__*/React.createElement(SyncStatus, {
    mode: "offline"
  })), /*#__PURE__*/React.createElement(MacroRemaining, {
    style: {
      marginTop: 14
    },
    kcal: GOAL.kcal - used.kcal,
    protein: GOAL.protein - used.protein,
    fat: GOAL.fat - used.fat,
    carbs: GOAL.carbs - used.carbs,
    date: "maandag 21 september"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, MEALS.map(m => /*#__PURE__*/React.createElement(MealBlock, _extends({
    key: m.meal
  }, m, {
    onEdit: () => {}
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      paddingTop: 14,
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 600,
      color: "var(--ink-soft)"
    }
  }, "Zet je notities van vandaag als tekst klaar voor je coach."), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: copy
  }, copied ? "Gekopieerd" : "Kopieer voor coach")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      marginTop: 14,
      paddingTop: 14,
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 600,
      color: "var(--ink-soft)"
    }
  }, "Dagdoel ", GOAL.kcal, " kcal \xB7 ", GOAL.protein, " g eiwit \xB7 ", GOAL.fat, " g vet \xB7 ", GOAL.carbs, " g koolhydraten")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 16px 14px"
    }
  }, /*#__PURE__*/React.createElement(BottomNav, {
    active: "food",
    onChange: onTab
  })));
}
Object.assign(window, {
  FoodScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/FoodScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/MeasureScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  BottomNav,
  MeasurementRow,
  WeightTrendChart,
  SectionHeader,
  IconBadge,
  Chip,
  Button,
  EmptyState
} = window.DesignSystem_de9512;
const DAILY = [70.8, 71.4, 70.6, 70.9, 70.2, 70.5, 70.9, 70.1, 69.8, 70.3, 69.6, 69.9, 69.4, 69.7, 69.1, 69.5, 68.9, 69.2, 68.6, 68.9, 68.4];
const LABELS = DAILY.map((_, i) => i === 0 ? "jul" : i === 10 ? "aug" : i === 20 ? "sep" : "");
const FIELDS = [{
  label: "Borst",
  value: 91.0,
  sinceStart: "1,0 cm",
  direction: "up"
}, {
  label: "Onderborst",
  value: 76.5,
  sinceStart: "2,0 cm",
  direction: "down"
}, {
  label: "Taille",
  value: 71.5,
  sinceStart: "3,5 cm",
  direction: "down"
}, {
  label: "Buik / navel",
  value: 79.0,
  sinceStart: "4,0 cm",
  direction: "down"
}, {
  label: "Heupen",
  value: 97.0,
  sinceStart: "1,5 cm",
  direction: "down"
}, {
  label: "Billen",
  value: 99.5,
  sinceStart: "0,5 cm",
  direction: "up"
}, {
  label: "Bovenbeen L",
  value: 58.0,
  sinceStart: "1,5 cm",
  direction: "up"
}, {
  label: "Bovenbeen R",
  value: 58.5,
  sinceStart: "1,5 cm",
  direction: "up"
}, {
  label: "Bovenarm L",
  value: 30.0,
  sinceStart: "1,0 cm",
  direction: "up"
}, {
  label: "Bovenarm R",
  value: null
}];
function MeasureScreen({
  onTab
}) {
  const [range, setRange] = React.useState("3m");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "var(--surface-primary)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "16px 16px 90px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--title-size)",
      lineHeight: "var(--title-line)",
      fontWeight: 800
    }
  }, "Metingen"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginTop: 12,
      borderTop: "1px solid var(--border)",
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 700,
      color: "var(--ink-soft)"
    }
  }, "Volgende meetmoment: woensdag 23 september"), /*#__PURE__*/React.createElement(Button, {
    size: "sm"
  }, "Invullen")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      marginTop: 18,
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    icon: /*#__PURE__*/React.createElement(IconBadge, {
      icon: "scale",
      size: 30,
      fill: "var(--accent-pink)",
      color: "var(--accent-pink-ink)"
    }),
    title: "Gewicht",
    subtitle: "Lijn is het 7-daags gemiddelde"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 12
    }
  }, ["4w", "3m", "1j", "Alles"].map(o => /*#__PURE__*/React.createElement(Chip, {
    key: o,
    selected: o === range,
    onClick: () => setRange(o)
  }, o))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--display-md-size)",
      lineHeight: "var(--display-md-line)",
      fontWeight: 800,
      marginTop: 12
    }
  }, "68,4", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-md-size)",
      fontWeight: 700
    }
  }, " kg")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--delta-size)",
      lineHeight: "var(--delta-line)",
      fontWeight: 700,
      color: "var(--ink-soft)"
    }
  }, "\u21932,4 kg sinds start"), /*#__PURE__*/React.createElement(WeightTrendChart, {
    style: {
      marginTop: 6
    },
    values: DAILY,
    labels: LABELS,
    window: 7
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      marginTop: 20,
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    icon: /*#__PURE__*/React.createElement(IconBadge, {
      icon: "bars",
      size: 30,
      fill: "var(--accent-lavender)"
    }),
    title: "Omtrekken",
    subtitle: "Laatste meting 9 september"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, FIELDS.map((f, i) => /*#__PURE__*/React.createElement(MeasurementRow, _extends({
    key: f.label,
    first: i === 0
  }, f, {
    onClick: () => {}
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement(EmptyState, {
    icon: "calendar",
    title: "Geen foto's",
    body: "Voortgangsfoto's staan op je toestel en zijn nog niet ingeschakeld."
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 16px 14px"
    }
  }, /*#__PURE__*/React.createElement(BottomNav, {
    active: "measure",
    onChange: onTab
  })));
}
Object.assign(window, {
  MeasureScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/MeasureScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ProgressScreen.jsx
try { (() => {
const {
  BottomNav,
  StatChip,
  RangeSelector,
  MetricSelector,
  SectionHeader,
  IconBadge,
  LineChart,
  Icon,
  Chip
} = window.DesignSystem_de9512;
const EXERCISES = [{
  name: "Leg Press",
  delta: "+16%",
  value: "140 kg",
  values: [112, 115, 118, 120, 124, 128, 131, 136, 140],
  prIndex: 5
}, {
  name: "Bench Press",
  delta: "+9%",
  value: "82,5 kg",
  values: [72, 74, 73, 76, 78, 77, 80, 81, 82.5],
  prIndex: null
}];
function ProgressScreen({
  onTab,
  onOpenRecap
}) {
  const [range, setRange] = React.useState("3m");
  const [metric, setMetric] = React.useState({
    "Leg Press": "Zwaarste gewicht",
    "Bench Press": "Zwaarste gewicht"
  });
  const labels = ["jul", "", "", "aug", "", "", "", "", "sep"];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "var(--surface-primary)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "18px 16px 90px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: "50%",
      background: "var(--accent-lavender)",
      color: "var(--ink)",
      display: "grid",
      placeItems: "center",
      fontSize: "var(--body-md-size)",
      fontWeight: 800
    }
  }, "V"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--title-size)",
      lineHeight: "var(--title-line)",
      fontWeight: 800
    }
  }, "Voortgang"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 700,
      color: "var(--ink-soft)"
    }
  }, "Sinds 17 jun 2025"))), /*#__PURE__*/React.createElement(RangeSelector, {
    style: {
      marginTop: 16
    },
    value: range,
    onChange: setRange
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 8,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(StatChip, {
    label: "PR's",
    value: "3",
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(StatChip, {
    label: "Sessies",
    value: "14",
    fill: "var(--accent-mint)",
    color: "var(--accent-mint-ink)",
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(StatChip, {
    label: "Volume",
    value: "62.400 kg",
    fill: "var(--accent-blue-light)",
    color: "var(--accent-blue)",
    style: {
      flex: 1.3
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    title: "Kracht per oefening",
    subtitle: "Oefeningen die je in deze periode minstens 2\xD7 deed",
    right: /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Zoeken",
      style: {
        width: 38,
        height: 38,
        borderRadius: "var(--radius-md)",
        border: "none",
        background: "var(--surface-tint)",
        color: "var(--ink-soft)",
        display: "grid",
        placeItems: "center",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 17
    }))
  })), EXERCISES.map(ex => /*#__PURE__*/React.createElement("div", {
    key: ex.name,
    style: {
      borderTop: "1px solid var(--border)",
      marginTop: 16,
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(IconBadge, {
    icon: "dumbbell",
    size: 30,
    fill: "var(--accent-orange)",
    color: "var(--accent-orange-ink)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      fontWeight: 800
    }
  }, ex.name, " \u2014 Kracht"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--delta-size)",
      lineHeight: "var(--delta-line)",
      fontWeight: 700,
      color: "var(--delta-up)"
    }
  }, ex.delta)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--display-md-size)",
      lineHeight: "var(--display-md-line)",
      fontWeight: 800,
      marginTop: 8
    }
  }, ex.value), /*#__PURE__*/React.createElement(LineChart, {
    values: ex.values,
    labels: labels,
    prIndex: ex.prIndex,
    height: 116,
    formatValue: v => String(v).replace(".", ",") + " kg"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(MetricSelector, {
    options: ["Zwaarste gewicht", "Geschat 1RM", "Beste setvolume", "Sessievolume", "Totaal reps"],
    value: metric[ex.name],
    onChange: m => setMetric(s => ({
      ...s,
      [ex.name]: m
    }))
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      marginTop: 20,
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    icon: /*#__PURE__*/React.createElement(IconBadge, {
      icon: "bars",
      size: 30,
      fill: "var(--accent-blue-light)",
      color: "var(--accent-blue)"
    }),
    title: "Volume",
    subtitle: "Per week, alle oefeningen"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--display-md-size)",
      lineHeight: "var(--display-md-line)",
      fontWeight: 800,
      marginTop: 10
    }
  }, "5.200 kg"), /*#__PURE__*/React.createElement(LineChart, {
    values: [3800, 4100, 3950, 4500, 4700, 4600, 5000, 5200],
    labels: ["jul", "", "", "aug", "", "", "", "sep"],
    color: "var(--accent-blue)",
    height: 110,
    formatValue: v => v.toLocaleString("nl-NL") + " kg"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      marginTop: 20,
      paddingTop: 14,
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 600,
      color: "var(--ink-soft)"
    }
  }, "Je maandoverzicht van september staat klaar."), /*#__PURE__*/React.createElement(Chip, {
    onClick: onOpenRecap
  }, "Bekijken"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 16px 14px"
    }
  }, /*#__PURE__*/React.createElement(BottomNav, {
    active: "progress",
    onChange: onTab
  })));
}
Object.assign(window, {
  ProgressScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ProgressScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/RecapScreen.jsx
try { (() => {
const {
  SectionHeader,
  IconBadge,
  StatDelta,
  CalendarGrid,
  RadarChart,
  MuscleBar,
  ListRow,
  Icon
} = window.DesignSystem_de9512;
function RecapScreen({
  onClose
}) {
  const stats = [{
    label: "Sessies",
    value: "13",
    delta: "2 vs aug",
    dir: "up",
    accent: null
  }, {
    label: "PR's",
    value: "3",
    delta: "1 vs aug",
    dir: "up",
    accent: "var(--accent-orange-fg)"
  }, {
    label: "Volume",
    value: "62.400 kg",
    delta: "4% vs aug",
    dir: "down",
    accent: null
  }];
  const muscles = [{
    label: "Bovenbenen",
    count: 24
  }, {
    label: "Rug",
    count: 16
  }, {
    label: "Borst",
    count: 14
  }, {
    label: "Schouders",
    count: 9
  }, {
    label: "Core",
    count: 7
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      overflowY: "auto",
      background: "var(--surface-primary)",
      padding: "16px 16px 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "Sluiten",
    style: {
      width: 34,
      height: 34,
      borderRadius: "50%",
      border: "none",
      background: "var(--surface-tint)",
      color: "var(--ink-soft)",
      display: "grid",
      placeItems: "center",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontSize: "var(--caption-size)",
      lineHeight: "var(--caption-line)",
      fontWeight: 700,
      letterSpacing: ".09em",
      textTransform: "uppercase",
      color: "var(--accent-orange-fg)"
    }
  }, "Maandoverzicht"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--display-md-size)",
      lineHeight: "var(--display-md-line)",
      fontWeight: 800,
      marginTop: 4
    }
  }, "Dit zijn je resultaten van september"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      fontWeight: 700,
      color: "var(--ink-soft)",
      marginTop: 8
    }
  }, "1 t/m 30 september 2026"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 18
    }
  }, stats.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.label
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--caption-size)",
      lineHeight: "var(--caption-line)",
      fontWeight: 700,
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "var(--ink-soft)"
    }
  }, s.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--display-md-size)",
      lineHeight: "var(--display-md-line)",
      fontWeight: 800,
      color: s.accent || "var(--ink)"
    }
  }, s.value), /*#__PURE__*/React.createElement(StatDelta, {
    direction: s.dir
  }, s.delta)))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      marginTop: 20,
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    icon: /*#__PURE__*/React.createElement(IconBadge, {
      icon: "calendar",
      size: 30,
      fill: "var(--accent-blue-light)",
      color: "var(--accent-blue)"
    }),
    title: "Welke dagen trainde je"
  }), /*#__PURE__*/React.createElement(CalendarGrid, {
    style: {
      marginTop: 14
    },
    days: 30,
    startWeekday: 1,
    trained: [1, 4, 6, 8, 11, 13, 15, 18, 20, 22, 25, 27, 30],
    note: "Meestal ma / do / za \u2014 precies je schema"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      marginTop: 20,
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    icon: /*#__PURE__*/React.createElement(IconBadge, {
      icon: "radar",
      size: 30,
      fill: "var(--accent-pink)",
      color: "var(--accent-pink-ink)"
    }),
    title: "Verdeling per spiergroep"
  }), /*#__PURE__*/React.createElement(RadarChart, {
    style: {
      marginTop: 10
    },
    size: 250,
    axes: ["Benen", "Borst", "Rug", "Schouders", "Core"],
    series: [24, 14, 16, 9, 7],
    compare: [20, 15, 16, 8, 10],
    legend: [{
      label: "september",
      color: "var(--accent-orange-fg)"
    }, {
      label: "augustus",
      color: "var(--accent-compare)"
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, muscles.map(m => /*#__PURE__*/React.createElement(MuscleBar, {
    key: m.label,
    label: m.label,
    count: m.count,
    max: 24
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      marginTop: 20,
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    icon: /*#__PURE__*/React.createElement(IconBadge, {
      icon: "trend",
      size: 30,
      fill: "var(--accent-orange)",
      color: "var(--accent-orange-ink)"
    }),
    title: "Personal records"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(ListRow, {
    first: true,
    name: "Leg Press",
    tags: ["Gewicht"],
    value: "140 kg"
  }), /*#__PURE__*/React.createElement(ListRow, {
    name: "Bench Press",
    tags: ["1RM"],
    value: "88 kg"
  }), /*#__PURE__*/React.createElement(ListRow, {
    name: "Lat Pulldown",
    tags: ["Gewicht"],
    value: "65 kg"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      marginTop: 20,
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    icon: /*#__PURE__*/React.createElement(IconBadge, {
      icon: "repeat",
      size: 30,
      fill: "var(--accent-mint)",
      color: "var(--accent-mint-ink)"
    }),
    title: "Top oefeningen"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(ListRow, {
    first: true,
    name: "Leg Press",
    badgeFill: "var(--accent-mint)",
    sub: "Bovenbenen",
    value: "12\xD7"
  }), /*#__PURE__*/React.createElement(ListRow, {
    name: "Bench Press",
    badgeFill: "var(--accent-mint)",
    sub: "Borst",
    value: "10\xD7"
  }), /*#__PURE__*/React.createElement(ListRow, {
    name: "Lat Pulldown",
    badgeFill: "var(--accent-mint)",
    sub: "Rug",
    value: "9\xD7"
  }))));
}
Object.assign(window, {
  RecapScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/RecapScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/WorkoutScreen.jsx
try { (() => {
const {
  TopBar,
  BottomNav,
  StatStrip,
  ExerciseHeader,
  SetRow,
  NextUpPill,
  RestTimerBar,
  Button,
  Icon,
  Toast,
  SyncStatus
} = window.DesignSystem_de9512;
const SETS_START = [{
  previous: "120 kg × 10",
  weight: 120,
  reps: 11,
  done: true
}, {
  previous: "120 kg × 9",
  weight: 120,
  reps: "",
  done: false
}, {
  previous: "115 kg × 10",
  weight: 115,
  reps: "",
  done: false
}];
function WorkoutScreen({
  onTab
}) {
  const [sets, setSets] = React.useState(SETS_START);
  const [rest, setRest] = React.useState(86);
  const [resting, setResting] = React.useState(true);
  const [pr, setPr] = React.useState(true);
  React.useEffect(() => {
    if (!resting) return;
    const t = setInterval(() => {
      setRest(r => {
        if (r <= 1) {
          setResting(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [resting]);
  const toggle = i => {
    setSets(s => s.map((x, j) => j === i ? {
      ...x,
      done: !x.done,
      reps: x.done ? x.reps : x.reps || 10
    } : x));
    if (!sets[i].done) {
      setRest(90);
      setResting(true);
    }
  };
  const addSet = () => setSets(s => s.concat([{
    previous: "",
    weight: s[s.length - 1].weight,
    reps: "",
    done: false
  }]));
  const doneCount = sets.filter(s => s.done).length;
  const mmss = Math.floor(rest / 60) + ":" + String(rest % 60).padStart(2, "0");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "var(--surface-primary)"
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: "Full Body A",
    action: "Voltooien",
    progress: resting ? rest / 90 : null
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "0 16px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      paddingTop: 12,
      paddingBottom: 14
    }
  }, /*#__PURE__*/React.createElement(StatStrip, {
    items: [{
      label: "Duur",
      value: "34:12"
    }, {
      label: "Volume",
      value: "2.860 kg"
    }, {
      label: "Sets",
      value: String(3 + doneCount),
      accent: "var(--accent-orange-fg)"
    }]
  }), /*#__PURE__*/React.createElement(SyncStatus, {
    style: {
      marginTop: 10
    },
    mode: "offline"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement(ExerciseHeader, {
    name: "Leg Press",
    meta: "Machine \xB7 Benen",
    target: "Doel 8\u201312 reps",
    note: "Stoel 5 \xB7 links eerst",
    onMenu: () => {}
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "22px 1fr 58px 58px 30px",
      gap: 10,
      padding: "14px 10px 2px",
      fontSize: "var(--caption-size)",
      lineHeight: "var(--caption-line)",
      fontWeight: 700,
      letterSpacing: ".06em",
      textTransform: "uppercase",
      color: "var(--ink-soft)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "#"), /*#__PURE__*/React.createElement("span", null, "Vorige"), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "center"
    }
  }, "Kg"), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "center"
    }
  }, "Reps"), /*#__PURE__*/React.createElement("span", null)), sets.map((s, i) => /*#__PURE__*/React.createElement(SetRow, {
    key: i,
    index: i + 1,
    previous: s.previous,
    weight: s.weight,
    reps: s.reps,
    done: s.done,
    onToggle: () => toggle(i)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 10px 0"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "quiet",
    onClick: addSet
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 14
  }), "Set toevoegen"))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border)",
      marginTop: 18,
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--caption-size)",
      lineHeight: "var(--caption-line)",
      fontWeight: 700,
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "var(--ink-soft)",
      marginBottom: 12
    }
  }, "Hierna"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      overflowX: "auto",
      paddingBottom: 4,
      maskImage: "linear-gradient(to right,#000 92%,transparent)",
      WebkitMaskImage: "linear-gradient(to right,#000 92%,transparent)"
    }
  }, /*#__PURE__*/React.createElement(NextUpPill, {
    label: "Chest Press"
  }), /*#__PURE__*/React.createElement(NextUpPill, {
    label: "Lat Pulldown",
    fill: "var(--accent-mint)",
    color: "var(--accent-mint-ink)"
  }), /*#__PURE__*/React.createElement(NextUpPill, {
    label: "Shoulder Press",
    fill: "var(--accent-pink)",
    color: "var(--accent-pink-ink)"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 16px 14px",
      display: "grid",
      gap: 10
    }
  }, pr ? /*#__PURE__*/React.createElement(Toast, {
    title: "Nieuw record \u2014 Leg Press",
    detail: "120 kg \xD7 11 \xB7 vorige beste 120 kg \xD7 10",
    onDismiss: () => setPr(false)
  }) : null, resting ? /*#__PURE__*/React.createElement(RestTimerBar, {
    time: mmss,
    onMinus: () => setRest(r => Math.max(0, r - 15)),
    onPlus: () => setRest(r => r + 15),
    onSkip: () => setResting(false)
  }) : null, /*#__PURE__*/React.createElement(BottomNav, {
    active: "home",
    onChange: onTab
  })));
}
Object.assign(window, {
  WorkoutScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/WorkoutScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.GlassPanel = __ds_scope.GlassPanel;

__ds_ns.ICONS = __ds_scope.ICONS;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconBadge = __ds_scope.IconBadge;

__ds_ns.SectionHeader = __ds_scope.SectionHeader;

__ds_ns.StatChip = __ds_scope.StatChip;

__ds_ns.StatDelta = __ds_scope.StatDelta;

__ds_ns.ValueField = __ds_scope.ValueField;

__ds_ns.CalendarGrid = __ds_scope.CalendarGrid;

__ds_ns.LineChart = __ds_scope.LineChart;

__ds_ns.ListRow = __ds_scope.ListRow;

__ds_ns.MetricSelector = __ds_scope.MetricSelector;

__ds_ns.MuscleBar = __ds_scope.MuscleBar;

__ds_ns.RadarChart = __ds_scope.RadarChart;

__ds_ns.RangeSelector = __ds_scope.RangeSelector;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.SyncStatus = __ds_scope.SyncStatus;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.ExerciseHeader = __ds_scope.ExerciseHeader;

__ds_ns.NextUpPill = __ds_scope.NextUpPill;

__ds_ns.RestTimerBar = __ds_scope.RestTimerBar;

__ds_ns.RpeInput = __ds_scope.RpeInput;

__ds_ns.SetRow = __ds_scope.SetRow;

__ds_ns.SetTypeBadge = __ds_scope.SetTypeBadge;

__ds_ns.StatStrip = __ds_scope.StatStrip;

__ds_ns.MeasurementRow = __ds_scope.MeasurementRow;

__ds_ns.WeightTrendChart = __ds_scope.WeightTrendChart;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.TopBar = __ds_scope.TopBar;

__ds_ns.MacroRemaining = __ds_scope.MacroRemaining;

__ds_ns.MealBlock = __ds_scope.MealBlock;

})();
