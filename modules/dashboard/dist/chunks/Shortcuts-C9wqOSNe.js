import { t as e, useConfig as t } from "@letterncms/sdk";
import { Kbd as n, Widget as r } from "@letterncms/ui";
import { jsx as i, jsxs as a } from "react/jsx-runtime";
// admin/src/Shortcuts.tsx
function o() {
	let o = t("workspace").agent, s = [
		[e("Search and Commands"), "mod+k"],
		[o ? e("Ask {name}", { name: o.label }) : e("Chat"), "mod+j"],
		[e("New Entry in a List"), "c"],
		[e("Save"), "mod+s"],
		[e("Publish"), "mod+shift+p"],
		[e("Toggle Sidebar"), "mod+\\"]
	];
	return /* @__PURE__ */ i(r, { children: /* @__PURE__ */ i("ul", {
		className: "m-0 list-none p-0",
		children: s.map(([e, t]) => /* @__PURE__ */ a("li", {
			className: "flex h-8 items-center justify-between gap-3 text-sm text-text",
			children: [e, /* @__PURE__ */ i(n, { keys: t })]
		}, e))
	}) });
}
export { o as default };
