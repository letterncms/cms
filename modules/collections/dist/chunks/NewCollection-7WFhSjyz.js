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
}), y = (e, t) => e === "categories" ? "folder" : e === "tags" ? "tag" : t === "dated" ? "article" : t === "tree" ? "page" : "collection";
function b({ props: e, close: t }) {
	let n = !!e?.taxonomy, i = o("collections/list");
	return /* @__PURE__ */ h(x, {
		taxonomy: n,
		existing: i.data ?? [],
		onOpenChange: (e) => {
			e || (t ?? (() => r(n ? "/taxonomies" : "/collections", { replace: !0 })))();
		}
	});
}
function x({ taxonomy: b, existing: x, onOpenChange: S }) {
	let C = o("collections/options"), [w, T] = s({
		title: "",
		handle: "",
		singular: "",
		template: "",
		type: b ? "categories" : "entries",
		structure: "list",
		driver: "database",
		route: null
	}), [E, D] = s(!1), [O, k] = s(null), [A, j] = s({}), { title: M, type: N, driver: P } = w, F = N === "categories" ? "tree" : N === "tags" ? "list" : w.structure, I = C.data?.settings.find((e) => e.handle === "template"), L = w.handle || p(M).replace(/-/g, "_").slice(0, 64), R = `/${L.replace(/_/g, "-") || "items"}`, z = N === "categories" ? `${R}/{parent_uri}/{slug}` : F === "tree" ? "/{parent_uri}/{slug}" : `${R}/{slug}`, B = x.some((e) => e.handle === L) ? a("A collection with this handle already exists.") : L === "new" || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(L) ? a("Use letters, numbers, underscores or hyphens. Start with a letter or number.") : void 0, V = (e, t) => T((n) => ({
		...n,
		[e]: e === "handle" ? String(t ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 64) : t
	})), H = async () => {
		if (!E && C.data && M.trim() && !B) {
			D(!0), k(null), j({});
			try {
				await i("collections/save", {
					handle: L,
					createOnly: !0,
					definition: {
						...C.data.defaults,
						title: M.trim(),
						singular: w.singular.trim() || M.trim(),
						icon: y(N, F),
						...N === "entries" ? { structure: F } : { type: N },
						driver: P,
						route: (w.route ?? z).trim() || null,
						...I && w.template.trim() ? { template: w.template.trim() } : {}
					}
				});
				try {
					await n();
				} catch (e) {
					m.error(e);
				}
				t("collections/"), S(!1), r(`/${b ? "taxonomies" : "collections"}/${L}`);
			} catch (t) {
				k(t instanceof Error ? t.message : a("Could not create the collection. Try again.")), t instanceof e && t.type === "invalid_input" && j(t.details);
			} finally {
				D(!1);
			}
		}
	}, U = [
		{
			handle: "handle",
			type: "text",
			label: a("Handle"),
			placeholder: L || (b ? "topics" : "products"),
			mono: !0,
			max: 64
		},
		{
			handle: "singular",
			type: "text",
			label: a(b ? "Term Name" : "Entry Name"),
			placeholder: M.trim() || a(b ? "Topic" : "Product")
		},
		{
			handle: "route",
			type: "text",
			label: a("URL Pattern"),
			mono: !0
		},
		...I ? [{
			...I,
			width: "full"
		}] : [],
		{
			handle: "driver",
			type: "select",
			label: a("Storage"),
			display: "segmented",
			required: !0,
			options: {
				database: a("Database"),
				files: a("Flat Files")
			}
		}
	];
	return /* @__PURE__ */ h(c, {
		open: !0,
		onOpenChange: S,
		title: a(b ? "New Taxonomy" : "New Collection"),
		onSubmit: () => void H(),
		submitLabel: a(b ? "Create Taxonomy" : "Create Collection"),
		submitDisabled: !C.data || !M.trim() || !!B,
		busy: E,
		children: /* @__PURE__ */ g("div", {
			className: "space-y-5",
			children: [
				C.isError && /* @__PURE__ */ h(f, {
					compact: !0,
					message: a("Could not load collection options."),
					onRetry: () => void C.refetch()
				}),
				/* @__PURE__ */ h(l, {
					fields: [{
						handle: "title",
						type: "text",
						label: a("Name"),
						required: !0,
						autofocus: !0,
						placeholder: a(b ? "Topics" : "Products")
					}],
					values: w,
					onChange: V,
					errors: A,
					disabled: E
				}),
				/* @__PURE__ */ h(l, {
					fields: [b ? {
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
					values: w,
					onChange: V,
					disabled: E
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
								children: L
							})
						]
					}), /* @__PURE__ */ h(l, {
						className: "mt-4",
						fields: U,
						values: {
							...w,
							route: w.route ?? z
						},
						onChange: V,
						errors: A,
						disabled: E
					})]
				}),
				L && B && /* @__PURE__ */ h(d, {
					tone: "danger",
					children: B
				}),
				O && /* @__PURE__ */ h(d, {
					tone: "danger",
					children: O
				})
			]
		})
	});
}
export { b as default };
