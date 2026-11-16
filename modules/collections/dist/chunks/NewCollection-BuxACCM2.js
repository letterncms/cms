import { CmsError as e, invalidate as t, loadManifest as n, navigate as r, run as i, t as a, useAbility as o } from "@letterncms/sdk";
import { useState as s } from "react";
import { Dialog as c, Fields as l, Icon as u, Notice as d, QueryError as f, slugify as p, toast as m } from "@letterncms/ui";
import { jsx as h, jsxs as g } from "react/jsx-runtime";
// admin/src/NewCollection.tsx
var _ = () => ({
	list: a("List"),
	tree: a("Tree"),
	dated: a("Dated")
});
function v({ close: e }) {
	let t = o("collections/list");
	return /* @__PURE__ */ h(y, {
		existing: t.data ?? [],
		onOpenChange: (t) => {
			t || (e ?? (() => r("/collections", { replace: !0 })))();
		}
	});
}
function y({ existing: v, onOpenChange: y }) {
	let b = o("collections/options"), [x, S] = s({
		title: "",
		handle: "",
		singular: "",
		template: "",
		structure: "list",
		driver: "database",
		route: null
	}), [C, w] = s(!1), [T, E] = s(null), [D, O] = s({}), { title: k, structure: A, driver: j } = x, M = b.data?.settings.find((e) => e.handle === "template"), N = x.handle || p(k).replace(/-/g, "_").slice(0, 64), P = A === "tree" ? "/{parent_uri}/{slug}" : `/${N.replace(/_/g, "-") || "items"}/{slug}`, F = v.some((e) => e.handle === N) ? a("A collection with this handle already exists.") : N === "new" || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(N) ? a("Use letters, numbers, underscores or hyphens. Start with a letter or number.") : void 0, I = (e, t) => S((n) => ({
		...n,
		[e]: e === "handle" ? String(t ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 64) : t
	})), L = async () => {
		if (!C && b.data && k.trim() && !F) {
			w(!0), E(null), O({});
			try {
				await i("collections/save", {
					handle: N,
					createOnly: !0,
					definition: {
						...b.data.defaults,
						title: k.trim(),
						singular: x.singular.trim() || k.trim(),
						icon: A === "dated" ? "article" : A === "tree" ? "page" : "collection",
						structure: A,
						driver: j,
						route: (x.route ?? P).trim() || null,
						...M && x.template.trim() ? { template: x.template.trim() } : {}
					}
				});
				try {
					await n();
				} catch (e) {
					m.error(e);
				}
				t("collections/"), y(!1), r(`/collections/${N}`);
			} catch (t) {
				E(t instanceof Error ? t.message : a("Could not create the collection. Try again.")), t instanceof e && t.type === "invalid_input" && O(t.details);
			} finally {
				w(!1);
			}
		}
	}, R = [
		{
			handle: "handle",
			type: "text",
			label: a("Handle"),
			placeholder: N || "products",
			mono: !0,
			max: 64
		},
		{
			handle: "singular",
			type: "text",
			label: a("Entry Name"),
			placeholder: k.trim() || a("Product")
		},
		{
			handle: "route",
			type: "text",
			label: a("URL Pattern"),
			mono: !0
		},
		...M ? [{
			...M,
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
		onOpenChange: y,
		title: a("New Collection"),
		onSubmit: () => void L(),
		submitLabel: a("Create Collection"),
		submitDisabled: !b.data || !k.trim() || !!F,
		busy: C,
		children: /* @__PURE__ */ g("div", {
			className: "space-y-5",
			children: [
				b.isError && /* @__PURE__ */ h(f, {
					compact: !0,
					message: a("Could not load collection options."),
					onRetry: () => void b.refetch()
				}),
				/* @__PURE__ */ h(l, {
					fields: [{
						handle: "title",
						type: "text",
						label: a("Name"),
						required: !0,
						autofocus: !0,
						placeholder: a("Products")
					}],
					values: x,
					onChange: I,
					errors: D,
					disabled: C
				}),
				/* @__PURE__ */ h(l, {
					fields: [{
						handle: "structure",
						type: "select",
						label: a("Structure"),
						display: "segmented",
						required: !0,
						options: _()
					}],
					values: x,
					onChange: I,
					disabled: C
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
								children: N
							})
						]
					}), /* @__PURE__ */ h(l, {
						className: "mt-4",
						fields: R,
						values: {
							...x,
							route: x.route ?? P
						},
						onChange: I,
						errors: D,
						disabled: C
					})]
				}),
				N && F && /* @__PURE__ */ h(d, {
					tone: "danger",
					children: F
				}),
				T && /* @__PURE__ */ h(d, {
					tone: "danger",
					children: T
				})
			]
		})
	});
}
export { v as default };
