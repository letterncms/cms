import e from "./Collections-CY3GfDak.js";
import { navigate as t, plural as n, run as r, t as i, useAbility as a } from "@letterncms/sdk";
import { BlueprintEditor as o, Button as s, NotFoundState as c, Page as l } from "@letterncms/ui";
import { jsx as u } from "react/jsx-runtime";
// admin/src/Blueprint.tsx
var d = (e) => ({
	get: ["collections/get", { handle: e }],
	save: (t) => ["collections/save", {
		handle: e,
		definition: t
	}],
	remove: async () => {
		let { count: t } = await r("collections/get", { handle: e });
		return [
			"collections/delete",
			{
				handle: e,
				deleteEntries: t > 0
			},
			t > 0 ? n(t, "This permanently deletes the collection and its {count} entry, including drafts and history. This cannot be undone.", "This permanently deletes the collection and its {count} entries, including drafts and history. This cannot be undone.") : i("This permanently deletes the empty collection. This cannot be undone."),
			i(t > 0 ? "Delete Collection and Entries" : "Delete Collection")
		];
	},
	removeLabel: i("Delete Collection"),
	canRemove: (e) => e.deletable === !0,
	back: {
		label: i("Collections"),
		to: "/collections",
		icon: "collection"
	},
	entries: `/content/${e}`,
	settingsSections: [
		{
			title: i("General"),
			handles: [
				"title",
				"singular",
				"icon"
			]
		},
		{
			title: i("Entries"),
			handles: ["structure", "body"]
		},
		{
			title: i("Default Display"),
			handles: ["default_view", "default_columns"],
			bare: !0
		},
		{
			title: i("Publishing"),
			handles: ["route", "template"]
		}
	]
});
function f({ params: t }) {
	return t.handle === "new" ? /* @__PURE__ */ u(e, { creating: !0 }) : /* @__PURE__ */ u(p, { handle: t.handle }, t.handle);
}
function p({ handle: e }) {
	if (a("collections/get", { handle: e }, { refetchOnWindowFocus: !1 }).data?.system) {
		let e = {
			label: i("Collections"),
			to: "/collections",
			icon: "collection"
		};
		return /* @__PURE__ */ u(l, {
			crumbs: [e, { label: i("Not Found") }],
			children: /* @__PURE__ */ u(c, {
				icon: "collection",
				action: /* @__PURE__ */ u(s, {
					onClick: () => t(e.to),
					children: i("Back to {label}", { label: e.label })
				})
			})
		});
	}
	return /* @__PURE__ */ u(o, { kind: d(e) });
}
export { f as default };
