import { CmsError as e, abilityKey as t, loadManifest as n, navigate as r, panelsFor as i, queryClient as a, registry as o, run as s, setQuery as c, t as l, useAbility as u, useLocation as d, useManifest as f, useTab as p } from "@letterncms/sdk";
import { Suspense as m, useEffect as h, useLayoutEffect as g, useState as _, useSyncExternalStore as v } from "react";
import { Button as y, EmptyState as b, Fields as x, Page as S, SaveBar as C, Section as w, Spinner as T, Switch as E, Tabs as D, fieldVisible as O } from "@letterncms/ui";
import { Fragment as k, jsx as A, jsxs as j } from "react/jsx-runtime";
// admin/src/Settings.tsx
function M({ params: e }) {
	let t = f(), { query: n } = d(), i = t.settings.find((e) => !e.home)?.namespace, a = t.settings.find((t) => t.namespace === e.namespace), o = a?.home ? t.nav.find((e) => e.id === `settings.${a.namespace}`)?.path : void 0;
	return g(() => {
		!e.namespace && i ? r(`/settings/${i}`, { replace: !0 }) : o && r(n.field ? `${o}&field=${encodeURIComponent(n.field)}` : o, { replace: !0 });
	}, [
		e.namespace,
		i,
		o,
		n.field
	]), e.namespace ? o ? null : /* @__PURE__ */ A(N, { namespace: e.namespace }, e.namespace) : i ? null : /* @__PURE__ */ A(S, {
		crumbs: [{
			label: l("Settings"),
			icon: "settings"
		}],
		children: /* @__PURE__ */ A(b, {
			icon: "settings",
			title: l("Nothing to set up")
		})
	});
}
function N({ namespace: e }) {
	let t = f().settings.find((t) => t.namespace === e);
	v(o.panels.subscribe, o.panels.version);
	let n = t ? i("settings.tabs", { namespace: e }) : [], [a, s] = p(["settings", ...n.map((e) => e.id)]), c = a === "settings", [u, d] = _(!1), [h, g] = _([]);
	!c && !h.includes(a) && g([...h, a]);
	let x = t ? i("settings.actions", {
		namespace: e,
		tab: a,
		dirty: u
	}) : [];
	return /* @__PURE__ */ A(S, {
		width: "wide",
		title: t?.label,
		crumbs: [{
			label: t?.label ?? l("Not Found"),
			icon: t?.icon
		}],
		actions: x.length > 0 && /* @__PURE__ */ A(k, { children: x.map(({ id: t, component: n }) => /* @__PURE__ */ A(n, {
			namespace: e,
			tab: a,
			dirty: u
		}, t)) }),
		children: t ? /* @__PURE__ */ j(k, { children: [
			n.length > 0 && /* @__PURE__ */ A(D, {
				id: "settings-tabs",
				className: "mb-6",
				value: a,
				onChange: s,
				tabs: [{
					value: "settings",
					label: l("Settings"),
					indicator: u
				}, ...n.map((e) => ({
					value: e.id,
					label: e.label ?? e.id
				}))]
			}),
			/* @__PURE__ */ A("div", {
				id: "settings-tabs-settings-panel",
				role: n.length > 0 ? "tabpanel" : void 0,
				"aria-labelledby": n.length > 0 ? "settings-tabs-settings" : void 0,
				hidden: !c,
				children: /* @__PURE__ */ A(I, {
					namespace: e,
					onDirty: d
				})
			}),
			n.filter((e) => h.includes(e.id)).map(({ id: t, component: n }) => /* @__PURE__ */ A("div", {
				id: `settings-tabs-${t}-panel`,
				role: "tabpanel",
				"aria-labelledby": `settings-tabs-${t}`,
				hidden: a !== t,
				children: /* @__PURE__ */ A(m, {
					fallback: /* @__PURE__ */ A("div", {
						className: "grid place-items-center py-10 text-faint",
						children: /* @__PURE__ */ A(T, {})
					}),
					children: /* @__PURE__ */ A(n, {
						namespace: e,
						active: a === t
					})
				})
			}, t))
		] }) : /* @__PURE__ */ A(b, {
			icon: "settings",
			title: l("Not Found"),
			action: /* @__PURE__ */ A(y, {
				onClick: () => r("/settings"),
				children: l("Settings")
			})
		})
	});
}
function P(e, t) {
	let n = (e) => e == null || e === "" || Array.isArray(e) && e.length === 0;
	if (n(e) && n(t)) return !0;
	let r = (e) => Array.isArray(e) ? e.map(r) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).sort().map((t) => [t, r(e[t])])) : e;
	return JSON.stringify(r(e)) === JSON.stringify(r(t));
}
function F(e, t) {
	return e ? Object.keys(e).some((n) => !P(e[n], t?.[n])) : !1;
}
function I({ namespace: r, onDirty: i }) {
	let o = u("settings/get", { namespace: r }, { refetchOnWindowFocus: !1 }), [c, d] = _(null), [f, p] = _({}), [m, g] = _(null), [v, x] = _(!1), S = F(c, o.data?.values);
	h(() => i?.(S), [S, i]), L(!!o.data);
	let w = () => {
		d(null), p({}), g(null);
	}, E = async () => {
		if (c && S) {
			x(!0), g(null);
			try {
				let e = await s("settings/update", {
					namespace: r,
					values: c
				});
				a.setQueryData(t("settings/get", { namespace: r }), (t) => t && {
					...t,
					values: e
				}), d(null), p({}), a.invalidateQueries(), await n();
			} catch (t) {
				t instanceof e && p(t.details), g(t instanceof Error ? t.message : String(t));
			} finally {
				x(!1);
			}
		}
	};
	return o.isError ? /* @__PURE__ */ A(b, {
		icon: "warning",
		title: l("Something went wrong"),
		description: o.error.message,
		action: /* @__PURE__ */ A(y, {
			onClick: () => void o.refetch(),
			children: l("Try Again")
		})
	}) : o.isLoading || !o.data ? /* @__PURE__ */ A("div", {
		className: "grid place-items-center py-10 text-faint",
		children: /* @__PURE__ */ A(T, {})
	}) : /* @__PURE__ */ j("div", {
		className: "mx-auto w-full max-w-[640px] pb-24",
		children: [/* @__PURE__ */ A(z, {
			fields: o.data.fields,
			values: c ?? o.data.values,
			onChange: (e, t) => d({
				...c ?? o.data.values,
				[e]: t
			}),
			errors: f
		}), /* @__PURE__ */ A(C, {
			dirty: S,
			saving: v,
			error: m,
			onSave: () => void E(),
			onDiscard: w
		})]
	});
}
function L(e) {
	let { query: t } = d(), n = t.field;
	h(() => {
		if (!e || !n) return;
		let t = document.querySelector(`[data-cms-screen] [data-field="${CSS.escape(n)}"]:not([hidden] *)`);
		t && (t.scrollIntoView({ block: "center" }), t.querySelector("input:not([type=hidden]), select, textarea, button, [role=switch], [tabindex=\"0\"]")?.focus({ preventScroll: !0 })), c({ field: null });
	}, [e, n]);
}
var R = (e) => e.type === "toggle" && !e.component && e.display !== "checkbox";
function z({ fields: e, values: t, onChange: n, errors: r }) {
	let i = [];
	for (let t of e) {
		let e = typeof t.section == "string" && t.section !== "" ? t.section : void 0, n = i[i.length - 1];
		n && n.title === e ? n.fields.push(t) : i.push({
			title: e,
			fields: [t]
		});
	}
	return /* @__PURE__ */ A("div", { children: i.map((e, i) => {
		let a = e.fields.filter((e) => O(e, t));
		if (!a.length) return null;
		let o = [];
		for (let e of a) {
			let t = o[o.length - 1];
			t && t.switches === R(e) ? t.fields.push(e) : o.push({
				switches: R(e),
				fields: [e]
			});
		}
		let s = /* @__PURE__ */ A("div", {
			className: "space-y-4",
			children: o.map((e, i) => e.switches ? /* @__PURE__ */ A("div", {
				className: "overflow-hidden rounded-lg border border-border bg-bg",
				children: e.fields.map((e) => /* @__PURE__ */ j("label", {
					"data-field": e.handle,
					className: "flex min-h-14 cursor-pointer items-center gap-4 px-4 py-3 [&+&]:border-t [&+&]:border-border",
					children: [/* @__PURE__ */ j("span", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ A("span", {
								className: "flex flex-wrap items-center gap-x-2 text-sm font-medium text-text",
								children: e.label
							}),
							e.instructions && /* @__PURE__ */ A("span", {
								className: "mt-0.5 block text-xs text-muted",
								children: e.instructions
							}),
							r[e.handle] && /* @__PURE__ */ A("span", {
								className: "mt-0.5 block text-xs text-danger",
								children: r[e.handle]
							})
						]
					}), /* @__PURE__ */ A(E, {
						checked: !!(t[e.handle] ?? e.default),
						onChange: (t) => n(e.handle, t),
						"aria-label": e.label
					})]
				}, e.handle))
			}, i) : /* @__PURE__ */ A(x, {
				fields: e.fields,
				values: t,
				onChange: n,
				errors: r
			}, i))
		});
		return /* @__PURE__ */ A(w, {
			title: e.title,
			children: s
		}, i);
	}) });
}
export { z as GroupedFields, I as SettingsForm, F as changedFrom, M as default };
