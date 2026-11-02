import { CmsError as e, abilityKey as t, blockNavigation as n, loadManifest as r, navigate as i, queryClient as a, run as o, t as s, useAbility as c, useManifest as l } from "@letterncms/sdk";
import { useEffect as u, useState as d } from "react";
import { Button as f, EmptyState as p, Fields as m, Page as h, Spinner as g, toast as _, useShortcut as v } from "@letterncms/ui";
import { Fragment as y, jsx as b, jsxs as x } from "react/jsx-runtime";
// admin/src/Settings.tsx
function S({ params: e }) {
	let t = l().settings[0]?.namespace;
	return u(() => {
		!e.namespace && t && i(`/settings/${t}`, { replace: !0 });
	}, [e.namespace, t]), e.namespace ? /* @__PURE__ */ b(C, { namespace: e.namespace }, e.namespace) : t ? null : /* @__PURE__ */ b(h, {
		crumbs: [{
			label: s("Settings"),
			icon: "settings"
		}],
		children: /* @__PURE__ */ b(p, {
			icon: "settings",
			title: s("Nothing to set up")
		})
	});
}
function C({ namespace: i }) {
	let S = l().settings.find((e) => e.namespace === i), C = c("settings/get", { namespace: i }, {
		refetchOnWindowFocus: !1,
		enabled: !!S
	}), [w, T] = d(null), [E, D] = d({}), [O, k] = d(!1), A = w !== null;
	u(() => n(() => A ? s("Discard unsaved changes?") : null), [A]);
	let j = async () => {
		if (w) {
			k(!0);
			try {
				let e = await o("settings/update", {
					namespace: i,
					values: w
				});
				a.setQueryData(t("settings/get", { namespace: i }), (t) => t && {
					...t,
					values: e
				}), T(null), D({}), a.invalidateQueries(), await r(), _.success(s("Saved"));
			} catch (t) {
				t instanceof e && D(t.details), _.error(t);
			} finally {
				k(!1);
			}
		}
	};
	return v("mod+s", () => void j()), /* @__PURE__ */ b(h, {
		width: "narrow",
		crumbs: [{
			label: s("Settings"),
			to: "/settings",
			icon: "settings"
		}, { label: S?.label ?? s("Not Found") }],
		actions: S && /* @__PURE__ */ x(y, { children: [A && /* @__PURE__ */ b(f, {
			variant: "ghost",
			onClick: () => {
				T(null), D({});
			},
			children: s("Discard")
		}), /* @__PURE__ */ b(f, {
			variant: "primary",
			disabled: !A,
			loading: O,
			onClick: j,
			children: s("Save")
		})] }),
		children: S ? C.isError ? /* @__PURE__ */ b(p, {
			icon: "warning",
			title: s("Something went wrong"),
			description: C.error.message,
			action: /* @__PURE__ */ b(f, {
				onClick: () => void C.refetch(),
				children: s("Try Again")
			})
		}) : C.isLoading || !C.data ? /* @__PURE__ */ b("div", {
			className: "grid place-items-center py-10 text-faint",
			children: /* @__PURE__ */ b(g, {})
		}) : /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ x("div", {
			className: "mb-8",
			children: [/* @__PURE__ */ b("h1", {
				className: "m-0 text-2xl font-semibold tracking-[-0.02em] text-ink",
				children: C.data.label
			}), C.data.description && /* @__PURE__ */ b("p", {
				className: "m-0 mt-1 text-sm text-muted",
				children: C.data.description
			})]
		}), /* @__PURE__ */ b(m, {
			fields: C.data.fields,
			values: w ?? C.data.values,
			onChange: (e, t) => T({
				...w ?? C.data.values,
				[e]: t
			}),
			errors: E
		})] }) : /* @__PURE__ */ b(p, {
			icon: "settings",
			title: s("These settings do not exist")
		})
	});
}
export { S as default };
