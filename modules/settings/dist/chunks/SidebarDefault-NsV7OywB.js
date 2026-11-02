import { events as e, t } from "@letterncms/sdk";
import { Button as n, Icon as r } from "@letterncms/ui";
import { jsx as i, jsxs as a } from "react/jsx-runtime";
// admin/src/SidebarDefault.tsx
function o({ value: o, onChange: s, disabled: c }) {
	let l = o != null;
	return /* @__PURE__ */ a("div", {
		className: "flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2.5",
		children: [
			/* @__PURE__ */ i(r, {
				name: "sidebar",
				size: 15,
				className: "text-faint"
			}),
			/* @__PURE__ */ i("span", {
				className: "min-w-0 flex-1 text-sm text-text",
				children: t(l ? "Arranged by an admin" : "Items that are pinned by default")
			}),
			l && /* @__PURE__ */ i(n, {
				size: "sm",
				variant: "ghost",
				icon: "undo",
				disabled: c,
				onClick: () => s(null),
				children: t("Reset")
			}),
			/* @__PURE__ */ i(n, {
				size: "sm",
				iconRight: "arrow-right",
				onClick: () => e.emit("sidebar.customize"),
				children: t("Customize Sidebar")
			})
		]
	});
}
export { o as SidebarDefault };
