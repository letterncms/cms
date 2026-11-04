import { can as e, invalidate as t, loadManifest as n, locale as r, navigate as i, panelsFor as a, registry as o, run as s, t as c, timeAgo as l, useAbility as u, useManifest as d, useTab as f } from "@letterncms/sdk";
import { Suspense as p, useEffect as m, useRef as h, useState as g, useSyncExternalStore as _ } from "react";
import { Avatar as v, Badge as y, Button as b, DataView as x, Dialog as S, EmptyState as C, Fields as w, FieldsEditor as T, IconButton as E, NoMatches as D, Page as O, SaveBar as k, Spinner as A, Tabs as j, confirm as M, toast as N } from "@letterncms/ui";
import { Fragment as P, jsx as F, jsxs as I } from "react/jsx-runtime";
// admin/src/Users.tsx
var L = "accounts";
function R({ params: t }) {
	let n = d(), [r, a] = g(""), [o, s] = g(1), p = e("settings.manage"), [h, _] = f([
		"team",
		"visitors",
		...p ? ["sign-up"] : [],
		...e("collections.manage") ? ["fields"] : []
	]), S = h === "team" || h === "visitors", T = h === "visitors" ? "visitors" : "team", E = u("users/list", {
		search: r || void 0,
		kind: T,
		perPage: 100,
		page: o
	}, { enabled: S }), k = u("roles/list"), A = u("users/fields"), [M, N] = g(t.id === "new" ? "new" : null), P = e("users.manage"), L = B(h === "fields"), R = z(p && h === "sign-up");
	m(() => {
		t.id && t.id !== "new" && E.data && N(E.data.items.find((e) => e.id === t.id) ?? null);
	}, [t.id, E.data]);
	let H = (e) => k.data?.roles[e]?.label ? c(k.data.roles[e].label) : e, U = E.data?.items ?? [];
	return /* @__PURE__ */ I(O, {
		width: "wide",
		crumbs: [{
			label: c("Users"),
			icon: "users"
		}],
		actions: P && h === "team" && /* @__PURE__ */ F(b, {
			variant: "primary",
			icon: "user-plus",
			onClick: () => N("new"),
			children: c("Invite User")
		}),
		children: [
			/* @__PURE__ */ F(j, {
				id: "users-tabs",
				className: "mb-6",
				value: h,
				onChange: (e) => {
					_(e), a(""), s(1);
				},
				tabs: [
					{
						value: "team",
						label: c("Team")
					},
					{
						value: "visitors",
						label: c("Visitors")
					},
					...p ? [{
						value: "sign-up",
						label: c("Sign-Up"),
						indicator: R.dirty
					}] : [],
					...e("collections.manage") ? [{
						value: "fields",
						label: c("Profile Fields"),
						indicator: L.dirty
					}] : []
				]
			}),
			R.body,
			L.body,
			S && /* @__PURE__ */ F(x, {
				id: "users",
				label: c("Users"),
				items: U,
				source: {
					ability: "users/list",
					input: {
						search: r || void 0,
						kind: T
					},
					perPage: 100
				},
				rowKey: (e) => e.id,
				onRowClick: P ? (e) => N(e) : void 0,
				pagination: E.data && {
					page: o,
					pages: Math.ceil(E.data.total / 100),
					total: E.data.total,
					perPage: 100,
					onPage: s
				},
				loading: E.isLoading,
				error: E.isError,
				onRetry: () => void E.refetch(),
				toolbar: /* @__PURE__ */ F(w, {
					bare: !0,
					layout: "inline",
					fields: [{
						handle: "search",
						type: "text",
						label: c("Search"),
						icon: "search",
						size: "sm",
						placeholder: c("Search people…"),
						className: "w-64 max-w-full"
					}],
					values: { search: r },
					onChange: (e, t) => {
						a(t ?? ""), s(1);
					}
				}),
				columns: [
					{
						id: "name",
						label: c("Name"),
						render: (e) => /* @__PURE__ */ I("span", {
							className: "flex min-w-0 items-center gap-2",
							children: [
								/* @__PURE__ */ F(v, {
									name: e.name,
									initials: e.initials,
									src: e.avatar,
									size: 24
								}),
								/* @__PURE__ */ F("span", {
									className: "truncate",
									children: e.name
								}),
								e.id === n.user.id && /* @__PURE__ */ F("span", {
									className: "text-xs text-faint",
									children: c("You")
								})
							]
						})
					},
					{
						id: "email",
						label: c("Email"),
						width: "minmax(200px,1fr)",
						render: (e) => e.email
					},
					{
						id: "roles",
						label: c("Roles"),
						width: "minmax(160px,0.8fr)",
						render: (e) => /* @__PURE__ */ I("span", {
							className: "flex flex-wrap items-center gap-1",
							children: [
								e.status === "suspended" && /* @__PURE__ */ F(y, {
									tone: "danger",
									children: c("Suspended")
								}),
								e.super && /* @__PURE__ */ F(y, { children: c("Super Admin") }),
								e.roles.map((e) => /* @__PURE__ */ F(y, { children: H(e) }, e))
							]
						})
					},
					{
						id: "two-factor",
						label: c("Two-Factor"),
						width: "100px",
						render: (e) => e.twoFactor ? /* @__PURE__ */ F(y, {
							tone: "success",
							children: c("Two-Factor")
						}) : /* @__PURE__ */ F("span", {
							className: "text-faint",
							children: "—"
						})
					},
					{
						id: "seen",
						label: c("Last Sign-In"),
						width: "140px",
						render: (e) => e.lastLoginAt ? l(e.lastLoginAt) : c("Never signed in")
					}
				],
				empty: r ? /* @__PURE__ */ F(D, { onClear: () => a("") }) : /* @__PURE__ */ F(C, {
					icon: "users",
					title: c(h === "visitors" ? "No visitors yet" : "No users yet")
				})
			}),
			M && k.data && A.data && /* @__PURE__ */ F(V, {
				user: M === "new" ? null : M,
				roles: k.data.roles,
				profile: A.data.resolvedFields,
				onClose: () => {
					N(null), t.id && i("/users", { replace: !0 });
				}
			})
		]
	});
}
function z(e) {
	_(o.panels.subscribe, o.panels.version);
	let t = a("screen.settings", { namespace: L })[0]?.component, [n, r] = g(!1), [i, s] = g(!1);
	return e && !n && r(!0), {
		dirty: i,
		body: n && t && /* @__PURE__ */ F("div", {
			id: "users-tabs-sign-up-panel",
			role: "tabpanel",
			"aria-labelledby": "users-tabs-sign-up",
			hidden: !e,
			children: /* @__PURE__ */ F(p, {
				fallback: /* @__PURE__ */ F("div", {
					className: "grid place-items-center py-10 text-faint",
					children: /* @__PURE__ */ F(A, {})
				}),
				children: /* @__PURE__ */ F(t, {
					namespace: L,
					onDirty: s
				})
			})
		})
	};
}
function B(e) {
	let r = u("users/fields", {}, { refetchOnWindowFocus: !1 }), [i, a] = g(null), [o, l] = g(!1), [d, f] = g(null), p = h(!1), m = i !== null && JSON.stringify(i) !== JSON.stringify(r.data?.fields ?? []), _ = async () => {
		if (i && m && !p.current) {
			p.current = !0, l(!0), f(null);
			try {
				await s("users/fields-save", { fields: i }), t("users/"), await n(), a(null);
			} catch (e) {
				f(e instanceof Error ? e.message : String(e));
			} finally {
				l(!1), p.current = !1;
			}
		}
	};
	return {
		dirty: m,
		body: /* @__PURE__ */ I(P, { children: [e && (r.data ? /* @__PURE__ */ F("div", {
			className: "mx-auto w-full max-w-[760px] pb-24",
			children: /* @__PURE__ */ F(T, {
				fields: i ?? r.data.fields ?? [],
				onChange: a,
				builtIn: c("Name, email and roles are built in.")
			})
		}) : /* @__PURE__ */ F("div", {
			className: "grid place-items-center py-10 text-faint",
			children: /* @__PURE__ */ F(A, {})
		})), /* @__PURE__ */ F(k, {
			dirty: m,
			saving: o,
			error: d,
			onSave: () => void _(),
			onDiscard: () => {
				a(null), f(null);
			}
		})] })
	};
}
function V({ user: n, roles: r, profile: i, onClose: a }) {
	let o = d(), l = n?.id === o.user.id, u = !!n?.visitor, f = (e) => e.permissions.some((e) => e === "*" || e === "admin.access" || e === "admin.*"), p = Object.entries(r).filter(([e, t]) => f(t) !== u || n?.roles.includes(e)), [m, h] = g({
		name: n?.name ?? "",
		email: n?.email ?? "",
		roles: n?.roles ?? ["editor"],
		super: n?.super ?? !1
	}), [_, v] = g(n?.data ?? {}), [y, x] = g({
		add: [],
		remove: []
	}), [C, T] = g(null), E = e("users.manage"), D = !!n && E && !l, O = [
		{
			handle: "name",
			type: "text",
			label: c("Name"),
			required: !0,
			width: "half"
		},
		{
			handle: "email",
			type: "email",
			label: c("Email"),
			required: !0,
			width: "half"
		},
		...l ? [] : [{
			handle: "roles",
			type: "select",
			label: c("Roles"),
			multiple: !0,
			options: Object.fromEntries(p.map(([e, t]) => [e, t.label ? c(t.label) : e]))
		}],
		...o.user.super && !l && !u ? [{
			handle: "super",
			type: "toggle",
			label: c("Super Admin"),
			instructions: c("Bypasses every permission.")
		}] : []
	], k = async () => {
		T("save");
		try {
			let { super: e, roles: r, ...i } = m, d = {
				...i,
				data: _,
				...l ? {} : { roles: r },
				...o.user.super && !l && !u ? { super: e } : {}
			};
			if (n) {
				await s("users/update", {
					id: n.id,
					...d
				});
				for (let e of y.remove) await s("users/revoke", {
					id: n.id,
					access: e
				});
				for (let e of y.add) await s("users/grant", {
					id: n.id,
					access: e
				});
			} else await s("users/create", d);
			t("users/"), N.success(n ? c("Saved") : c("Invitation sent to {email}", { email: m.email })), a();
		} catch (e) {
			N.error(e);
		} finally {
			T(null);
		}
	}, A = async (e) => {
		T("suspend");
		try {
			await s("users/update", {
				id: e.id,
				suspended: e.status !== "suspended"
			}), t("users/"), N.success(e.status === "suspended" ? c("{name} reactivated", { name: e.name }) : c("{name} suspended", { name: e.name })), a();
		} catch (e) {
			N.error(e);
		} finally {
			T(null);
		}
	}, j = async (e) => {
		T("invite");
		try {
			await s("users/invite", { id: e.id }), N.success(c("Invitation sent"));
		} catch (e) {
			N.error(e);
		} finally {
			T(null);
		}
	}, L = async (e) => {
		if (await M({
			title: c("Remove {name}?", { name: e.name }),
			description: c("They lose access immediately. Their content stays."),
			confirm: c("Remove User"),
			danger: !0
		})) {
			T("remove");
			try {
				await s("users/delete", { id: e.id }), t("users/"), N.success(c("{name} removed", { name: e.name })), a();
			} catch (e) {
				N.error(e), T(null);
			}
		}
	};
	return /* @__PURE__ */ I(S, {
		open: !0,
		onOpenChange: (e) => !e && a(),
		title: c(n ? "Edit User" : "Invite User"),
		description: n ? void 0 : c("They get an email to set a password."),
		footer: /* @__PURE__ */ I(P, { children: [
			D && n && /* @__PURE__ */ I(P, { children: [
				/* @__PURE__ */ F(b, {
					variant: "ghost",
					className: "mr-auto text-danger! max-sm:mr-0",
					loading: C === "remove",
					disabled: !!C,
					onClick: () => void L(n),
					children: c("Remove User")
				}),
				/* @__PURE__ */ F(b, {
					loading: C === "suspend",
					disabled: !!C,
					onClick: () => void A(n),
					children: n.status === "suspended" ? c("Reactivate") : c("Suspend")
				}),
				!n.lastLoginAt && !u && /* @__PURE__ */ F(b, {
					loading: C === "invite",
					disabled: !!C,
					onClick: () => void j(n),
					children: c("Resend Invitation")
				})
			] }),
			/* @__PURE__ */ F(b, {
				onClick: a,
				children: c("Cancel")
			}),
			/* @__PURE__ */ F(b, {
				variant: "primary",
				loading: C === "save",
				disabled: !m.name || !m.email || !!C && C !== "save",
				onClick: () => void k(),
				children: c(n ? "Save" : "Send Invitation")
			})
		] }),
		children: [
			/* @__PURE__ */ F(w, {
				fields: O,
				values: m,
				onChange: (e, t) => h({
					...m,
					[e]: t
				})
			}),
			i.length > 0 && /* @__PURE__ */ F(w, {
				className: "mt-5 border-t border-border pt-5",
				fields: i,
				values: _,
				onChange: (e, t) => v({
					..._,
					[e]: t
				})
			}),
			n && /* @__PURE__ */ F(H, {
				id: n.id,
				value: y,
				onChange: x
			})
		]
	});
}
function H({ id: t, value: n, onChange: i }) {
	let a = u("users/access", { id: t }), [o, s] = g(""), l = e("users.manage"), d = (a.data ?? []).filter((e) => !n.remove.includes(e.access)), f = [...d, ...n.add.filter((e) => !d.some((t) => t.access === e)).map((e) => ({
		access: e,
		source: "new",
		expiresAt: null
	}))], p = () => {
		let e = o.trim();
		e && (s(""), n.remove.includes(e) ? i({
			...n,
			remove: n.remove.filter((t) => t !== e)
		}) : f.some((t) => t.access === e) || i({
			...n,
			add: [...n.add, e]
		}));
	}, m = (e) => n.add.includes(e) ? i({
		...n,
		add: n.add.filter((t) => t !== e)
	}) : i({
		...n,
		remove: [...n.remove, e]
	});
	return /* @__PURE__ */ I("section", {
		className: "mt-5 border-t border-border pt-5",
		children: [
			/* @__PURE__ */ F("h3", {
				className: "m-0 text-sm font-medium text-text",
				children: c("Access")
			}),
			f.length > 0 && /* @__PURE__ */ F("ul", {
				className: "m-0 mt-2 flex list-none flex-wrap gap-2 p-0",
				children: f.map((e) => /* @__PURE__ */ I("li", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ F(y, { children: e.access }),
						e.expiresAt && /* @__PURE__ */ F("span", {
							className: "text-xs text-faint",
							children: c("until {date}", { date: new Date(e.expiresAt).toLocaleDateString(r()) })
						}),
						l && /* @__PURE__ */ F(E, {
							icon: "close",
							size: "xs",
							label: c("Remove {name}", { name: e.access }),
							onClick: () => m(e.access)
						})
					]
				}, e.access + e.source))
			}),
			l && /* @__PURE__ */ I("form", {
				className: "mt-2 flex items-center gap-2",
				onSubmit: (e) => {
					e.preventDefault(), p();
				},
				children: [/* @__PURE__ */ F(w, {
					bare: !0,
					layout: "inline",
					className: "w-48 max-w-full",
					fields: [{
						handle: "access",
						type: "text",
						label: c("Access Name"),
						size: "sm",
						placeholder: c("magazine")
					}],
					values: { access: o },
					onChange: (e, t) => s(t ?? "")
				}), /* @__PURE__ */ F(b, {
					size: "sm",
					type: "submit",
					disabled: o.trim() === "",
					children: c("Add")
				})]
			})
		]
	});
}
export { R as default };
