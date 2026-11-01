import e from "./Collections-BCef-w78.js";
import { plural as t, run as n, t as r } from "@letterncms/sdk";
import { BlueprintEditor as i } from "@letterncms/ui";
import { jsx as a } from "react/jsx-runtime";
// admin/src/Blueprint.tsx
var o = (e) => ({
	get: ["collections/get", { handle: e }],
	save: (t) => ["collections/save", {
		handle: e,
		definition: t
	}],
	remove: async () => {
		let { count: i } = await n("collections/get", { handle: e });
		return [
			"collections/delete",
			{
				handle: e,
				deleteEntries: i > 0
			},
			i > 0 ? t(i, "This permanently deletes the collection and its {count} entry, including drafts and history. This cannot be undone.", "This permanently deletes the collection and its {count} entries, including drafts and history. This cannot be undone.") : r("This permanently deletes the empty collection. This cannot be undone."),
			r(i > 0 ? "Delete Collection and Entries" : "Delete Collection")
		];
	},
	removeLabel: r("Delete Collection"),
	canRemove: (e) => e.deletable === !0,
	back: {
		label: r("Collections"),
		to: "/collections",
		icon: "collection"
	},
	entries: `/content/${e}`,
	settingsSections: [
		{
			title: r("General"),
			handles: [
				"title",
				"singular",
				"icon"
			]
		},
		{
			title: r("Entries"),
			handles: ["structure", "body"]
		},
		{
			title: r("Default Display"),
			handles: ["default_view", "default_columns"],
			bare: !0
		},
		{
			title: r("Publishing"),
			handles: ["route", "template"]
		}
	]
});
function s({ params: t }) {
	return t.handle === "new" ? /* @__PURE__ */ a(e, { creating: !0 }) : /* @__PURE__ */ a(i, { kind: o(t.handle) }, t.handle);
}
export { s as default };
