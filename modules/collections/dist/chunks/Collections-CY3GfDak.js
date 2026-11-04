import { CmsError as e, invalidate as t, loadManifest as n, navigate as r, run as i, t as a, useAbility as o } from "@letterncms/sdk";
import { useState as s } from "react";
import { Button as c, DataView as l, Dialog as u, EmptyState as d, Fields as f, Icon as p, Page as m, slugify as h, toast as g } from "@letterncms/ui";
import { Fragment as _, jsx as v, jsxs as y } from "react/jsx-runtime";
// admin/src/Collections.tsx
var b = () => ({
	list: a("List"),
	tree: a("Tree"),
	dated: a("Dated")
});
function x({ creating: e = !1 }) {
	let t = o("collections/list"), n = t.data?.filter((e) => !e.system), [i, u] = s(e);
	return /* @__PURE__ */ y(m, {
		width: "wide",
		crumbs: [{
			label: a("Collections"),
			icon: "collection"
		}],
		actions: n?.length !== 0 && /* @__PURE__ */ v(c, {
			variant: "primary",
			icon: "plus",
			onClick: () => u(!0),
			children: a("New Collection")
		}),
		children: [/* @__PURE__ */ v(l, {
			id: "collections",
			label: a("Collections"),
			items: n ?? [],
			rowKey: (e) => e.handle,
			rowHref: (e) => `/collections/${e.handle}`,
			loading: t.isLoading,
			error: t.isError,
			onRetry: () => void t.refetch(),
			searchText: (e) => `${e.title} ${e.handle} ${e.route ?? ""}`,
			columns: [
				{
					id: "title",
					label: a("Name"),
					value: (e) => e.title,
					render: (e) => /* @__PURE__ */ y("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ v(p, {
							name: e.icon,
							size: 16,
							className: "shrink-0 text-muted"
						}), /* @__PURE__ */ v("span", {
							className: "truncate",
							children: e.title
						})]
					})
				},
				{
					id: "route",
					label: a("URL"),
					width: "minmax(200px,1fr)",
					value: (e) => e.route,
					render: (e) => /* @__PURE__ */ v("span", {
						className: "font-mono text-xs",
						children: e.route ?? a("No URL")
					})
				},
				{
					id: "structure",
					label: a("Structure"),
					width: "120px",
					value: (e) => e.structure,
					render: (e) => b()[e.structure]
				},
				{
					id: "count",
					label: a("Entries"),
					width: "90px",
					align: "end",
					value: (e) => e.count,
					render: (e) => e.count
				}
			],
			empty: /* @__PURE__ */ v(d, {
				icon: "collection",
				title: a("No collections yet"),
				description: a("Collections define what you can write: pages, posts, products…"),
				action: /* @__PURE__ */ v(c, {
					variant: "primary",
					icon: "plus",
					onClick: () => u(!0),
					children: a("New Collection")
				})
			})
		}), i && /* @__PURE__ */ v(S, {
			existing: t.data ?? [],
			onOpenChange: (t) => {
				u(t), !t && e && r("/collections", { replace: !0 });
			}
		})]
	});
}
function S({ existing: l, onOpenChange: d }) {
	let m = o("collections/options"), [x, S] = s({
		title: "",
		handle: "",
		singular: "",
		template: "",
		structure: "list",
		driver: "database",
		route: null
	}), [C, w] = s(!1), [T, E] = s(null), [D, O] = s({}), { title: k, structure: A, driver: j } = x, M = m.data?.settings.find((e) => e.handle === "template"), N = x.handle || h(k).replace(/-/g, "_").slice(0, 64), P = A === "tree" ? "/{parent_uri}/{slug}" : `/${N.replace(/_/g, "-") || "items"}/{slug}`, F = l.some((e) => e.handle === N) ? a("A collection with this handle already exists.") : N === "new" || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(N) ? a("Use letters, numbers, underscores or hyphens. Start with a letter or number.") : void 0, I = (e, t) => S((n) => ({
		...n,
		[e]: e === "handle" ? String(t ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 64) : t
	})), L = async () => {
		if (!C && m.data && k.trim() && !F) {
			w(!0), E(null), O({});
			try {
				await i("collections/save", {
					handle: N,
					createOnly: !0,
					definition: {
						...m.data.defaults,
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
					g.error(e);
				}
				t("collections/"), d(!1), r(`/collections/${N}`);
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
	return /* @__PURE__ */ v(u, {
		open: !0,
		onOpenChange: (e) => {
			C || d(e);
		},
		title: a("New Collection"),
		footer: /* @__PURE__ */ y(_, { children: [/* @__PURE__ */ v(c, {
			disabled: C,
			onClick: () => d(!1),
			children: a("Cancel")
		}), /* @__PURE__ */ v(c, {
			variant: "primary",
			type: "submit",
			form: "new-collection",
			disabled: !m.data || !k.trim() || !!F,
			loading: C,
			children: a("Create Collection")
		})] }),
		children: /* @__PURE__ */ y("form", {
			id: "new-collection",
			className: "space-y-5",
			onSubmit: (e) => {
				e.preventDefault(), L();
			},
			children: [
				m.isError && /* @__PURE__ */ y("div", {
					role: "alert",
					className: "flex items-center gap-3 rounded-sm border border-danger/30 p-3 text-sm",
					children: [/* @__PURE__ */ v("span", {
						className: "min-w-0 flex-1 text-danger",
						children: a("Could not load collection options.")
					}), /* @__PURE__ */ v(c, {
						size: "sm",
						loading: m.isFetching,
						onClick: () => void m.refetch(),
						children: a("Retry")
					})]
				}),
				/* @__PURE__ */ v(f, {
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
				/* @__PURE__ */ v(f, {
					fields: [{
						handle: "structure",
						type: "select",
						label: a("Structure"),
						display: "segmented",
						required: !0,
						options: b()
					}],
					values: x,
					onChange: I,
					disabled: C
				}),
				/* @__PURE__ */ y("details", {
					className: "group border-t border-border pt-3",
					children: [/* @__PURE__ */ y("summary", {
						className: "flex cursor-pointer list-none items-center gap-1.5 py-1 text-xs font-medium text-muted hover:text-text [&::-webkit-details-marker]:hidden",
						children: [
							/* @__PURE__ */ v(p, {
								name: "chevron-right",
								size: 12,
								className: "group-open:rotate-90"
							}),
							a("Advanced"),
							/* @__PURE__ */ v("span", {
								className: "ml-auto max-w-[60%] truncate font-mono font-normal text-faint",
								children: N
							})
						]
					}), /* @__PURE__ */ v(f, {
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
				N && F && /* @__PURE__ */ v("p", {
					role: "alert",
					className: "m-0 text-xs text-danger",
					children: F
				}),
				T && /* @__PURE__ */ v("p", {
					role: "alert",
					className: "m-0 text-sm text-danger",
					children: T
				})
			]
		})
	});
}
export { x as default };
