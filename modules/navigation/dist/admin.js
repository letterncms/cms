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
		className: n("w-full min-w-0 bg-transparent text-sm text-text outline-none", e.display === "fallback" ? "placeholder:text-text" : "placeholder:text-faint")
	});
}
e.fields.set("navigation-label", i), e.widgets.set("navigation-menus", t(() => import("./chunks/WidgetMenus-DmirGUA7.js"))), e.components.set("navigation/menu", t(() => import("./chunks/MenuEditor-WvW15a_C.js")));
