import { registry as e } from "@letterncms/sdk";
import { lazy as t } from "react";
import { cn as n } from "@letterncms/ui";
import { jsx as r } from "react/jsx-runtime";
// admin/src/fields.tsx
function i({ field: e, value: t, onChange: i, disabled: a }) {
	return /* @__PURE__ */ r("input", {
		value: t ?? "",
		disabled: a,
		onChange: (e) => i(e.target.value),
		placeholder: e.placeholder,
		"aria-label": e.label,
		autoFocus: e.autofocus === !0,
		className: n("-mx-1 h-7 w-[calc(100%+0.5rem)] min-w-0 rounded-xs bg-transparent px-1 text-sm font-medium text-text outline-none focus-visible:bg-hover", e.display === "fallback" ? "placeholder:text-text" : "placeholder:font-normal placeholder:text-faint")
	});
}
e.fields.set("navigation-label", i), e.widgets.set("navigation-menus", t(() => import("./chunks/WidgetMenus-DmirGUA7.js"))), e.components.set("navigation/menu", t(() => import("./chunks/MenuEditor-DtwClg6P.js"))), e.components.set("navigation/menu-settings", t(() => import("./chunks/MenuSettings-BoGGODDu.js")));
