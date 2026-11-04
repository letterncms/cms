import { isActive as e, t } from "@letterncms/sdk";
import { Kbd as n, Widget as r } from "@letterncms/ui";
import { jsx as i, jsxs as a } from "react/jsx-runtime";
// admin/src/Shortcuts.tsx
function o() {
	let o = [
		[t("Search and Commands"), "mod+k"],
		...e("letterncms/assistant") ? [[t("Ask the assistant"), "mod+j"]] : [],
		[t("New Entry in a List"), "c"],
		[t("Save"), "mod+s"],
		[t("Publish"), "mod+shift+p"],
		[t("Toggle Sidebar"), "mod+\\"]
	];
	return /* @__PURE__ */ i(r, { children: /* @__PURE__ */ i("ul", {
		className: "m-0 list-none p-0",
		children: o.map(([e, t]) => /* @__PURE__ */ a("li", {
			className: "flex h-8 items-center justify-between gap-3 text-sm text-text",
			children: [e, /* @__PURE__ */ i(n, { keys: t })]
		}, e))
	}) });
}
export { o as default };
