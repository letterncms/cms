import { navigate as e, plural as t, run as n, t as r } from "@letterncms/sdk";
import { BlueprintEditor as i } from "@letterncms/ui";
import { jsx as a } from "react/jsx-runtime";
// admin/src/Blueprint.tsx
var o = (e) => e === "categories" || e === "tags", s = (i, a) => ({
	get: ["collections/get", { handle: i }],
	save: (e) => ["collections/save", {
		handle: i,
		definition: e
	}],
	remove: async () => {
		let { count: e } = await n("collections/get", { handle: i });
		return [
			"collections/delete",
			{
				handle: i,
				deleteEntries: e > 0
			},
			e > 0 ? t(e, "This permanently deletes the collection and its {count} entry, including drafts and history. This cannot be undone.", "This permanently deletes the collection and its {count} entries, including drafts and history. This cannot be undone.") : r("This permanently deletes the empty collection. This cannot be undone."),
			r(e > 0 ? "Delete Collection and Entries" : "Delete Collection")
		];
	},
	removeLabel: r("Delete Collection"),
	canRemove: (e) => e.deletable === !0,
	back: a ? {
		label: r("Taxonomies"),
		to: "/taxonomies",
		icon: "tag"
	} : {
		label: r("Collections"),
		to: "/collections",
		icon: "collection"
	},
	saved: (t) => {
		o(t.type) !== a && e(`/${o(t.type) ? "taxonomies" : "collections"}/${i}?tab=settings`, { replace: !0 });
	},
	entries: `/content/${i}`,
	blueprints: (e) => n("entries/list", {
		collection: i,
		perPage: 1,
		filters: [{
			field: "blueprint",
			value: e
		}]
	}).then((e) => e.total),
	bodies: !0,
	rows: (e, t) => n("collections/usage", {
		handle: i,
		field: e,
		rowType: t
	}).then((e) => e.rows),
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
			title: r("Content"),
			handles: ["type", "structure"]
		},
		{
			title: r("Default Display"),
			handles: ["default_view", "default_columns"],
			bare: !0
		},
		{
			title: r("Publishing"),
			handles: [
				"route",
				"template",
				"archives"
			]
		}
	]
});
function c({ props: e }) {
	return /* @__PURE__ */ a(i, { kind: s(e.handle, !!e.taxonomy) }, `${e.handle} ${!!e.taxonomy}`);
}
export { c as default };
