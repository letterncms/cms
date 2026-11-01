import { CmsError as e, blockNavigation as t, can as n, invalidate as r, loadManifest as i, navigate as a, run as o, t as s, useAbility as c, useManifest as l } from "@letterncms/sdk";
import { useEffect as u, useState as d } from "react";
import { Button as f, DataView as p, Dialog as m, EmptyState as h, Fields as g, Icon as _, IconButton as v, Menu as y, Page as b, Spinner as x, slugify as S, toast as C, useShortcut as w } from "@letterncms/ui";
import { Fragment as T, jsx as E, jsxs as D } from "react/jsx-runtime";
// admin/src/Globals.tsx
function O() {
	let e = l(), [t, r] = d(!1), i = n("globals.manage");
	return /* @__PURE__ */ D(b, {
		width: "wide",
		crumbs: [{
			label: s("Globals"),
			icon: "globe"
		}],
		actions: i && /* @__PURE__ */ E(f, {
			variant: "primary",
			icon: "plus",
			onClick: () => r(!0),
			children: s("New Global Set")
		}),
		children: [/* @__PURE__ */ E(A, {
			open: t,
			onOpenChange: r
		}), /* @__PURE__ */ E(p, {
			id: "globals",
			label: s("Globals"),
			items: e.globals,
			rowKey: (e) => e.handle,
			rowHref: (e) => `/globals/${e.handle}`,
			searchText: (e) => `${e.title} ${e.handle}`,
			columns: [{
				id: "title",
				label: s("Name"),
				value: (e) => e.title,
				render: (e) => /* @__PURE__ */ D("span", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ E(_, {
						name: e.icon,
						size: 16,
						className: "shrink-0 text-muted"
					}), /* @__PURE__ */ E("span", {
						className: "truncate",
						children: e.title
					})]
				})
			}, {
				id: "handle",
				label: s("Handle"),
				width: "minmax(200px,1fr)",
				value: (e) => e.handle,
				render: (e) => /* @__PURE__ */ E("span", {
					className: "font-mono text-xs",
					children: e.handle
				})
			}],
			actions: i ? (e) => /* @__PURE__ */ E(y, {
				trigger: /* @__PURE__ */ E(v, {
					icon: "more",
					label: s("Actions for {name}", { name: e.title }),
					size: "xs"
				}),
				items: [{
					label: s("Edit"),
					icon: "edit",
					onSelect: () => a(`/globals/${e.handle}`)
				}, {
					label: s("Edit Fields"),
					icon: "field",
					onSelect: () => a(`/globals/${e.handle}/fields`)
				}]
			}) : void 0,
			empty: /* @__PURE__ */ E(h, {
				icon: "globe",
				title: s("No global sets yet"),
				description: s("Site-wide values, like contact details or footer links."),
				action: i && /* @__PURE__ */ E(f, {
					variant: "primary",
					icon: "plus",
					onClick: () => r(!0),
					children: s("New Global Set")
				})
			})
		})]
	});
}
function k({ params: i }) {
	let p = l(), [m, _] = d(p.site.defaultLocale), y = c("globals/get", {
		handle: i.handle,
		locale: m
	}, { refetchOnWindowFocus: !1 }), [S, O] = d(null), [k, A] = d({}), [j, M] = d(!1), N = S !== null;
	u(() => O(null), [m]), u(() => t(() => N ? s("Discard unsaved changes?") : null), [N]);
	let P = async () => {
		if (S) {
			M(!0);
			try {
				await o("globals/update", {
					handle: i.handle,
					values: S,
					locale: m
				}), O(null), A({}), r("globals/"), C.success(s("Saved"));
			} catch (t) {
				t instanceof e && A(t.details), C.error(t);
			} finally {
				M(!1);
			}
		}
	};
	return w("mod+s", () => void P()), y.isLoading ? /* @__PURE__ */ E("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ E(x, {})
	}) : y.data ? /* @__PURE__ */ E(b, {
		width: "narrow",
		crumbs: [{
			label: s("Globals"),
			to: "/globals",
			icon: "globe"
		}, { label: y.data.title }],
		actions: /* @__PURE__ */ D(T, { children: [
			p.site.locales.length > 1 && /* @__PURE__ */ E(g, {
				bare: !0,
				layout: "inline",
				fields: [{
					handle: "locale",
					type: "select",
					label: s("Language"),
					display: "segmented",
					required: !0,
					options: p.site.locales.map((e) => ({
						value: e,
						label: e.toUpperCase()
					}))
				}],
				values: { locale: m },
				onChange: (e, t) => _(t)
			}),
			n("globals.manage") && /* @__PURE__ */ E(v, {
				icon: "field",
				label: s("Edit Fields"),
				onClick: () => a(`/globals/${i.handle}/fields`)
			}),
			N && /* @__PURE__ */ E(f, {
				variant: "ghost",
				onClick: () => {
					O(null), A({});
				},
				children: s("Discard")
			}),
			/* @__PURE__ */ E(f, {
				variant: "primary",
				disabled: !N,
				loading: j,
				onClick: P,
				children: s("Save")
			})
		] }),
		title: y.data.title,
		children: /* @__PURE__ */ E(g, {
			fields: y.data.resolvedFields,
			values: S ?? y.data.data,
			onChange: (e, t) => O({
				...S ?? y.data.data,
				[e]: t
			}),
			errors: k,
			context: { locale: m }
		})
	}) : /* @__PURE__ */ E(b, {
		crumbs: [{
			label: s("Globals"),
			to: "/globals",
			icon: "globe"
		}, { label: s("Not Found") }],
		children: /* @__PURE__ */ E(h, {
			icon: "globe",
			title: s("Global set not found")
		})
	});
}
function A({ open: e, onOpenChange: t }) {
	let [n, c] = d(""), [l, u] = d(!1), p = S(n).replace(/-/g, "_");
	return /* @__PURE__ */ E(m, {
		open: e,
		onOpenChange: t,
		title: s("New Global Set"),
		size: "sm",
		footer: /* @__PURE__ */ D(T, { children: [/* @__PURE__ */ E(f, {
			onClick: () => t(!1),
			children: s("Cancel")
		}), /* @__PURE__ */ E(f, {
			variant: "primary",
			disabled: !p,
			loading: l,
			onClick: async () => {
				u(!0);
				try {
					await o("globals/save", {
						handle: p,
						title: n,
						fields: [{
							handle: "text",
							type: "text",
							label: s("Text")
						}]
					}), await i(), r("globals/"), t(!1), a(`/globals/${p}/fields`);
				} catch (e) {
					C.error(e);
				} finally {
					u(!1);
				}
			},
			children: s("Create")
		})] }),
		children: /* @__PURE__ */ E(g, {
			fields: [{
				handle: "title",
				type: "text",
				label: s("Name"),
				placeholder: s("Footer"),
				autofocus: !0
			}],
			values: { title: n },
			onChange: (e, t) => c(t ?? "")
		})
	});
}
export { k as GlobalEditor, O as GlobalsList };
