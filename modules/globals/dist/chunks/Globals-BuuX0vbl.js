import { CmsError as e, can as t, invalidate as n, loadManifest as r, navigate as i, run as a, t as o, useAbility as s, useManifest as c } from "@letterncms/sdk";
import { useEffect as l, useState as u } from "react";
import { Button as d, DataView as f, Dialog as p, EmptyState as m, Fields as h, Icon as g, IconButton as _, Menu as v, NotFoundState as y, Page as b, SaveBar as x, Spinner as S, slugify as C, toast as w } from "@letterncms/ui";
import { Fragment as T, jsx as E, jsxs as D } from "react/jsx-runtime";
// admin/src/Globals.tsx
function O() {
	let e = c(), [n, r] = u(!1), a = t("globals.manage");
	return /* @__PURE__ */ D(b, {
		width: "wide",
		crumbs: [{
			label: o("Globals"),
			icon: "globe"
		}],
		actions: a && /* @__PURE__ */ E(d, {
			variant: "primary",
			icon: "plus",
			onClick: () => r(!0),
			children: o("New Global Set")
		}),
		children: [/* @__PURE__ */ E(A, {
			open: n,
			onOpenChange: r
		}), /* @__PURE__ */ E(f, {
			id: "globals",
			label: o("Globals"),
			items: e.globals,
			rowKey: (e) => e.handle,
			rowHref: (e) => `/globals/${e.handle}`,
			searchText: (e) => a ? `${e.title} ${e.handle}` : e.title,
			columns: [{
				id: "title",
				label: o("Name"),
				value: (e) => e.title,
				render: (e) => /* @__PURE__ */ D("span", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ E(g, {
						name: e.icon,
						size: 16,
						className: "shrink-0 text-muted"
					}), /* @__PURE__ */ E("span", {
						className: "truncate",
						children: e.title
					})]
				})
			}, ...a ? [{
				id: "handle",
				label: o("Handle"),
				width: "minmax(200px,1fr)",
				value: (e) => e.handle,
				render: (e) => /* @__PURE__ */ E("span", {
					className: "font-mono text-xs text-muted",
					children: e.handle
				})
			}] : []],
			actions: a ? (e) => /* @__PURE__ */ E(v, {
				trigger: /* @__PURE__ */ E(_, {
					icon: "more",
					label: o("Actions for {name}", { name: e.title }),
					size: "xs"
				}),
				items: [{
					label: o("Edit"),
					icon: "edit",
					onSelect: () => i(`/globals/${e.handle}`)
				}, {
					label: o("Edit Fields"),
					icon: "field",
					onSelect: () => i(`/globals/${e.handle}/fields`)
				}]
			}) : void 0,
			empty: /* @__PURE__ */ E(m, {
				icon: "globe",
				title: o("No global sets yet"),
				description: o("Site-wide values, like contact details or footer links.")
			})
		})]
	});
}
function k({ params: r }) {
	let f = c(), [p, m] = u(f.site.defaultLocale), g = s("globals/get", {
		handle: r.handle,
		locale: p
	}, { refetchOnWindowFocus: !1 }), [_, v] = u(null), [C, w] = u({}), [O, k] = u(!1), [A, j] = u(null), M = _ !== null;
	l(() => v(null), [p]);
	let N = async () => {
		if (_) {
			k(!0), j(null);
			try {
				await a("globals/update", {
					handle: r.handle,
					values: _,
					locale: p
				}), v(null), w({}), n("globals/");
			} catch (t) {
				t instanceof e && w(t.details), j(t instanceof Error ? t.message : String(t));
			} finally {
				k(!1);
			}
		}
	};
	return g.isLoading ? /* @__PURE__ */ E("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ E(S, {})
	}) : g.data ? /* @__PURE__ */ D(b, {
		width: "narrow",
		crumbs: [{
			label: o("Globals"),
			to: "/globals",
			icon: "globe"
		}, { label: g.data.title }],
		actions: /* @__PURE__ */ D(T, { children: [f.site.locales.length > 1 && /* @__PURE__ */ E(h, {
			bare: !0,
			layout: "inline",
			fields: [{
				handle: "locale",
				type: "select",
				label: o("Language"),
				display: "segmented",
				required: !0,
				options: f.site.locales.map((e) => ({
					value: e,
					label: e.toUpperCase()
				}))
			}],
			values: { locale: p },
			onChange: (e, t) => m(t)
		}), t("globals.manage") && /* @__PURE__ */ E(d, {
			icon: "field",
			onClick: () => i(`/globals/${r.handle}/fields`),
			children: o("Edit Fields")
		})] }),
		title: g.data.title,
		children: [/* @__PURE__ */ E(h, {
			fields: g.data.resolvedFields,
			values: _ ?? g.data.data,
			onChange: (e, t) => v({
				..._ ?? g.data.data,
				[e]: t
			}),
			errors: C,
			context: { locale: p }
		}), /* @__PURE__ */ E(x, {
			dirty: M,
			saving: O,
			error: A,
			onSave: () => void N(),
			onDiscard: () => {
				v(null), w({}), j(null);
			}
		})]
	}) : /* @__PURE__ */ E(b, {
		crumbs: [{
			label: o("Globals"),
			to: "/globals",
			icon: "globe"
		}, { label: o("Not Found") }],
		children: /* @__PURE__ */ E(y, {
			icon: "globe",
			action: /* @__PURE__ */ E(d, {
				onClick: () => i("/globals"),
				children: o("Back to {label}", { label: o("Globals") })
			})
		})
	});
}
function A({ open: e, onOpenChange: t }) {
	let [s, c] = u(""), [l, f] = u(!1), m = C(s).replace(/-/g, "_");
	return /* @__PURE__ */ E(p, {
		open: e,
		onOpenChange: t,
		title: o("New Global Set"),
		size: "sm",
		footer: /* @__PURE__ */ D(T, { children: [/* @__PURE__ */ E(d, {
			onClick: () => t(!1),
			children: o("Cancel")
		}), /* @__PURE__ */ E(d, {
			variant: "primary",
			disabled: !m,
			loading: l,
			onClick: async () => {
				f(!0);
				try {
					await a("globals/save", {
						handle: m,
						title: s,
						fields: [{
							handle: "text",
							type: "text",
							label: o("Text")
						}]
					}), await r(), n("globals/"), t(!1), i(`/globals/${m}/fields`);
				} catch (e) {
					w.error(e);
				} finally {
					f(!1);
				}
			},
			children: o("Create")
		})] }),
		children: /* @__PURE__ */ E(h, {
			fields: [{
				handle: "title",
				type: "text",
				label: o("Name"),
				placeholder: o("Footer"),
				autofocus: !0
			}],
			values: { title: s },
			onChange: (e, t) => c(t ?? "")
		})
	});
}
export { k as GlobalEditor, O as GlobalsList };
