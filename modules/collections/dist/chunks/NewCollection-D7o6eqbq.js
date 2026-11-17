import { CmsError as e, invalidate as t, loadManifest as n, navigate as r, run as i, t as a, useAbility as o } from "@letterncms/sdk";
import { useState as s } from "react";
import { Dialog as c, Fields as l, Icon as u, Notice as d, QueryError as f, slugify as p, toast as m } from "@letterncms/ui";
import { jsx as h, jsxs as g } from "react/jsx-runtime";
// admin/src/NewCollection.tsx
var _ = () => ({
	categories: a("Categories"),
	tags: a("Tags")
}), v = () => ({
	list: a("List"),
	tree: a("Tree"),
	dated: a("Dated")
}), y = (e, t) => e === "categories" ? "folder" : e === "tags" ? "tag" : e === "global" ? "globe" : e === "menu" ? "list-tree" : t === "dated" ? "article" : t === "tree" ? "page" : "collection", b = () => ({
	collections: {
		title: a("New Collection"),
		submit: a("Create Collection"),
		placeholder: a("Products"),
		singular: a("Product"),
		type: "entries",
		opens: (e) => `/collections/${e}`
	},
	taxonomies: {
		title: a("New Taxonomy"),
		submit: a("Create Taxonomy"),
		placeholder: a("Topics"),
		singular: a("Topic"),
		type: "categories",
		opens: (e) => `/taxonomies/${e}`
	},
	globals: {
		title: a("New Global"),
		submit: a("Create Global"),
		placeholder: a("Footer"),
		singular: a("Footer"),
		type: "global",
		fields: [{
			handle: "text",
			type: "text",
			label: a("Text")
		}],
		opens: (e) => `/globals/${e}`
	},
	menus: {
		title: a("New Menu"),
		submit: a("Create Menu"),
		placeholder: a("Footer"),
		singular: a("Link"),
		type: "menu",
		fields: [{
			handle: "link",
			type: "link",
			label: a("Link"),
			required: !0
		}],
		opens: (e) => `/content/${e}`
	}
});
function x({ props: e, close: t }) {
	let n = e?.kind ?? "collections", i = o("collections/list");
	return /* @__PURE__ */ h(S, {
		kind: n,
		existing: i.data ?? [],
		onOpenChange: (e) => {
			e || (t ?? (() => r(`/${n}`, { replace: !0 })))();
		}
	});
}
function S({ kind: x, existing: S, onOpenChange: C }) {
	let w = b()[x], T = x === "globals" || x === "menus", E = o("collections/options"), [D, O] = s({
		title: "",
		handle: "",
		singular: "",
		template: "",
		type: w.type,
		structure: "list",
		driver: T ? "files" : "database",
		route: null
	}), [k, A] = s(!1), [j, M] = s(null), [N, P] = s({}), { title: F, type: I, driver: L } = D, R = I === "categories" ? "tree" : I === "tags" ? "list" : D.structure, z = E.data?.settings.find((e) => e.handle === "template"), B = D.handle || p(F).replace(/-/g, "_").slice(0, 64), V = `/${B.replace(/_/g, "-") || "items"}`, H = I === "categories" ? `${V}/{parent_uri}/{slug}` : R === "tree" ? "/{parent_uri}/{slug}" : `${V}/{slug}`, U = S.some((e) => e.handle === B) ? a("A collection with this handle already exists.") : B === "new" || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(B) ? a("Use letters, numbers, underscores or hyphens. Start with a letter or number.") : void 0, W = (e, t) => O((n) => ({
		...n,
		[e]: e === "handle" ? String(t ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 64) : t
	})), G = async () => {
		if (!k && E.data && F.trim() && !U) {
			A(!0), M(null), P({});
			try {
				await i("collections/save", {
					handle: B,
					createOnly: !0,
					definition: T ? {
						title: F.trim(),
						singular: D.singular.trim() || (x === "menus" ? w.singular : F.trim()),
						icon: y(I, R),
						type: I,
						driver: L,
						fields: w.fields
					} : {
						...E.data.defaults,
						title: F.trim(),
						singular: D.singular.trim() || F.trim(),
						icon: y(I, R),
						...I === "entries" ? { structure: R } : { type: I },
						driver: L,
						route: (D.route ?? H).trim() || null,
						...z && D.template.trim() ? { template: D.template.trim() } : {}
					}
				});
				try {
					await n();
				} catch (e) {
					m.error(e);
				}
				t("collections/"), C(!1), r(w.opens(B));
			} catch (t) {
				M(t instanceof Error ? t.message : a("Could not create the collection. Try again.")), t instanceof e && t.type === "invalid_input" && P(t.details);
			} finally {
				A(!1);
			}
		}
	}, K = {
		handle: "driver",
		type: "select",
		label: a("Storage"),
		display: "segmented",
		required: !0,
		options: {
			database: a("Database"),
			files: a("Flat Files")
		}
	}, q = T ? [{
		handle: "handle",
		type: "text",
		label: a("Handle"),
		placeholder: B || "footer",
		mono: !0,
		max: 64
	}, K] : [
		{
			handle: "handle",
			type: "text",
			label: a("Handle"),
			placeholder: B || (x === "taxonomies" ? "topics" : "products"),
			mono: !0,
			max: 64
		},
		{
			handle: "singular",
			type: "text",
			label: a(x === "taxonomies" ? "Term Name" : "Entry Name"),
			placeholder: F.trim() || w.singular
		},
		{
			handle: "route",
			type: "text",
			label: a("URL Pattern"),
			mono: !0
		},
		...z ? [{
			...z,
			width: "full"
		}] : [],
		K
	];
	return /* @__PURE__ */ h(c, {
		open: !0,
		onOpenChange: C,
		title: w.title,
		onSubmit: () => void G(),
		submitLabel: w.submit,
		submitDisabled: !E.data || !F.trim() || !!U,
		busy: k,
		children: /* @__PURE__ */ g("div", {
			className: "space-y-5",
			children: [
				E.isError && /* @__PURE__ */ h(f, {
					compact: !0,
					message: a("Could not load collection options."),
					onRetry: () => void E.refetch()
				}),
				/* @__PURE__ */ h(l, {
					fields: [{
						handle: "title",
						type: "text",
						label: a("Name"),
						required: !0,
						autofocus: !0,
						placeholder: w.placeholder
					}],
					values: D,
					onChange: W,
					errors: N,
					disabled: k
				}),
				!T && /* @__PURE__ */ h(l, {
					fields: [x === "taxonomies" ? {
						handle: "type",
						type: "select",
						label: a("Type"),
						display: "segmented",
						required: !0,
						options: _()
					} : {
						handle: "structure",
						type: "select",
						label: a("Structure"),
						display: "segmented",
						required: !0,
						options: v()
					}],
					values: D,
					onChange: W,
					disabled: k
				}),
				/* @__PURE__ */ g("details", {
					className: "group border-t border-border pt-3",
					children: [/* @__PURE__ */ g("summary", {
						className: "flex cursor-pointer list-none items-center gap-1.5 py-1 text-xs font-medium text-muted hover:text-text [&::-webkit-details-marker]:hidden",
						children: [
							/* @__PURE__ */ h(u, {
								name: "chevron-right",
								size: 12,
								className: "group-open:rotate-90"
							}),
							a("Advanced"),
							/* @__PURE__ */ h("span", {
								className: "ml-auto max-w-[60%] truncate font-mono font-normal text-faint",
								children: B
							})
						]
					}), /* @__PURE__ */ h(l, {
						className: "mt-4",
						fields: q,
						values: {
							...D,
							route: D.route ?? H
						},
						onChange: W,
						errors: N,
						disabled: k
					})]
				}),
				B && U && /* @__PURE__ */ h(d, {
					tone: "danger",
					children: U
				}),
				j && /* @__PURE__ */ h(d, {
					tone: "danger",
					children: j
				})
			]
		})
	});
}
export { x as default };
