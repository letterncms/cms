import { CmsError as e, invalidate as t, loadManifest as n, navigate as r, run as i, t as a, useAbility as o } from "@letterncms/sdk";
import { useState as s } from "react";
import { Dialog as c, Fields as l, Icon as u, QueryError as d, slugify as f, toast as p } from "@letterncms/ui";
import { jsx as m, jsxs as h } from "react/jsx-runtime";
// admin/src/NewCollection.tsx
var g = () => ({
	list: a("List"),
	tree: a("Tree"),
	dated: a("Dated")
});
function _({ close: e }) {
	let t = o("collections/list");
	return /* @__PURE__ */ m(v, {
		existing: t.data ?? [],
		onOpenChange: (t) => {
			t || (e ?? (() => r("/collections", { replace: !0 })))();
		}
	});
}
function v({ existing: _, onOpenChange: v }) {
	let y = o("collections/options"), [b, x] = s({
		title: "",
		handle: "",
		singular: "",
		template: "",
		structure: "list",
		driver: "database",
		route: null
	}), [S, C] = s(!1), [w, T] = s(null), [E, D] = s({}), { title: O, structure: k, driver: A } = b, j = y.data?.settings.find((e) => e.handle === "template"), M = b.handle || f(O).replace(/-/g, "_").slice(0, 64), N = k === "tree" ? "/{parent_uri}/{slug}" : `/${M.replace(/_/g, "-") || "items"}/{slug}`, P = _.some((e) => e.handle === M) ? a("A collection with this handle already exists.") : M === "new" || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(M) ? a("Use letters, numbers, underscores or hyphens. Start with a letter or number.") : void 0, F = (e, t) => x((n) => ({
		...n,
		[e]: e === "handle" ? String(t ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 64) : t
	})), I = async () => {
		if (!S && y.data && O.trim() && !P) {
			C(!0), T(null), D({});
			try {
				await i("collections/save", {
					handle: M,
					createOnly: !0,
					definition: {
						...y.data.defaults,
						title: O.trim(),
						singular: b.singular.trim() || O.trim(),
						icon: k === "dated" ? "article" : k === "tree" ? "page" : "collection",
						structure: k,
						driver: A,
						route: (b.route ?? N).trim() || null,
						...j && b.template.trim() ? { template: b.template.trim() } : {}
					}
				});
				try {
					await n();
				} catch (e) {
					p.error(e);
				}
				t("collections/"), v(!1), r(`/collections/${M}`);
			} catch (t) {
				T(t instanceof Error ? t.message : a("Could not create the collection. Try again.")), t instanceof e && t.type === "invalid_input" && D(t.details);
			} finally {
				C(!1);
			}
		}
	}, L = [
		{
			handle: "handle",
			type: "text",
			label: a("Handle"),
			placeholder: M || "products",
			mono: !0,
			max: 64
		},
		{
			handle: "singular",
			type: "text",
			label: a("Entry Name"),
			placeholder: O.trim() || a("Product")
		},
		{
			handle: "route",
			type: "text",
			label: a("URL Pattern"),
			mono: !0
		},
		...j ? [{
			...j,
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
	return /* @__PURE__ */ m(c, {
		open: !0,
		onOpenChange: v,
		title: a("New Collection"),
		onSubmit: () => void I(),
		submitLabel: a("Create Collection"),
		submitDisabled: !y.data || !O.trim() || !!P,
		busy: S,
		children: /* @__PURE__ */ h("div", {
			className: "space-y-5",
			children: [
				y.isError && /* @__PURE__ */ m(d, {
					compact: !0,
					message: a("Could not load collection options."),
					onRetry: () => void y.refetch()
				}),
				/* @__PURE__ */ m(l, {
					fields: [{
						handle: "title",
						type: "text",
						label: a("Name"),
						required: !0,
						autofocus: !0,
						placeholder: a("Products")
					}],
					values: b,
					onChange: F,
					errors: E,
					disabled: S
				}),
				/* @__PURE__ */ m(l, {
					fields: [{
						handle: "structure",
						type: "select",
						label: a("Structure"),
						display: "segmented",
						required: !0,
						options: g()
					}],
					values: b,
					onChange: F,
					disabled: S
				}),
				/* @__PURE__ */ h("details", {
					className: "group border-t border-border pt-3",
					children: [/* @__PURE__ */ h("summary", {
						className: "flex cursor-pointer list-none items-center gap-1.5 py-1 text-xs font-medium text-muted hover:text-text [&::-webkit-details-marker]:hidden",
						children: [
							/* @__PURE__ */ m(u, {
								name: "chevron-right",
								size: 12,
								className: "group-open:rotate-90"
							}),
							a("Advanced"),
							/* @__PURE__ */ m("span", {
								className: "ml-auto max-w-[60%] truncate font-mono font-normal text-faint",
								children: M
							})
						]
					}), /* @__PURE__ */ m(l, {
						className: "mt-4",
						fields: L,
						values: {
							...b,
							route: b.route ?? N
						},
						onChange: F,
						errors: E,
						disabled: S
					})]
				}),
				M && P && /* @__PURE__ */ m("p", {
					role: "alert",
					className: "m-0 text-xs text-danger",
					children: P
				}),
				w && /* @__PURE__ */ m("p", {
					role: "alert",
					className: "m-0 text-sm text-danger",
					children: w
				})
			]
		})
	});
}
export { _ as default };
