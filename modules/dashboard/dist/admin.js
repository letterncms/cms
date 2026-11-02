import { navigate as e, registry as t, t as n } from "@letterncms/sdk";
import { lazy as r } from "react";
import { Button as i, Icon as a } from "@letterncms/ui";
import { jsx as o, jsxs as s } from "react/jsx-runtime";
// admin/src/DefaultField.tsx
function c({ value: t, onChange: r, disabled: c }) {
	let l = t != null;
	return /* @__PURE__ */ s("div", {
		className: "flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2.5",
		children: [
			/* @__PURE__ */ o(a, {
				name: "layout",
				size: 15,
				className: "text-faint"
			}),
			/* @__PURE__ */ o("span", {
				className: "min-w-0 flex-1 text-sm text-text",
				children: n(l ? "Arranged by an admin" : "Widgets that are on by default")
			}),
			l && /* @__PURE__ */ o(i, {
				size: "sm",
				variant: "ghost",
				icon: "undo",
				disabled: c,
				onClick: () => r(null),
				children: n("Reset")
			}),
			/* @__PURE__ */ o(i, {
				size: "sm",
				iconRight: "arrow-right",
				onClick: () => e("/?customize=1"),
				children: n("Arrange on Home Screen")
			})
		]
	});
}
t.routes.set("/", {
	path: "/",
	component: r(() => import("./chunks/Dashboard-BOBxrrZ9.js"))
}), t.widgets.set("shortcuts", r(() => import("./chunks/Shortcuts-ce8H42uA.js"))), t.fields.set("dashboard-default", c);
