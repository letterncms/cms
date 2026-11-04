import { plural as e, run as t, t as n } from "@letterncms/sdk";
import { BlueprintEditor as r } from "@letterncms/ui";
import { jsx as i } from "react/jsx-runtime";
// admin/src/Blueprint.tsx
var a = (r) => ({
	get: ["collections/get", { handle: r }],
	save: (e) => ["collections/save", {
		handle: r,
		definition: e
	}],
	remove: async () => {
		let { count: i } = await t("collections/get", { handle: r });
		return [
			"collections/delete",
			{
				handle: r,
				deleteEntries: i > 0
			},
			i > 0 ? e(i, "This permanently deletes the collection and its {count} entry, including drafts and history. This cannot be undone.", "This permanently deletes the collection and its {count} entries, including drafts and history. This cannot be undone.") : n("This permanently deletes the empty collection. This cannot be undone."),
			n(i > 0 ? "Delete Collection and Entries" : "Delete Collection")
		];
	},
	removeLabel: n("Delete Collection"),
	canRemove: (e) => e.deletable === !0,
	back: {
		label: n("Collections"),
		to: "/collections",
		icon: "collection"
	},
	entries: `/content/${r}`,
	settingsSections: [
		{
			title: n("General"),
			handles: [
				"title",
				"singular",
				"icon"
			]
		},
		{
			title: n("Entries"),
			handles: ["structure", "body"]
		},
		{
			title: n("Default Display"),
			handles: ["default_view", "default_columns"],
			bare: !0
		},
		{
			title: n("Publishing"),
			handles: ["route", "template"]
		}
	]
});
function o({ props: e }) {
	return /* @__PURE__ */ i(r, { kind: a(e.handle) }, e.handle);
}
export { o as default };
