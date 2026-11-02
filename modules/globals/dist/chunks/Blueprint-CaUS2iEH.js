import { t as e } from "@letterncms/sdk";
import { BlueprintEditor as t } from "@letterncms/ui";
import { jsx as n } from "react/jsx-runtime";
// admin/src/Blueprint.tsx
var r = (t) => ({
	get: ["globals/get", { handle: t }],
	builtIn: null,
	save: (e) => ["globals/save", {
		handle: t,
		title: e.title,
		icon: e.icon,
		fields: e.fields
	}],
	remove: [
		"globals/delete",
		{ handle: t },
		e("Its values are deleted too.")
	],
	back: {
		label: e("Globals"),
		to: `/globals/${t}`,
		icon: "globe"
	}
});
function i({ params: e }) {
	return /* @__PURE__ */ n(t, { kind: r(e.handle) }, e.handle);
}
export { i as default };
