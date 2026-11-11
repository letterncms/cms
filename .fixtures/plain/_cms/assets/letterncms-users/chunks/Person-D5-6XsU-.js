import { can as e, invalidate as t, locale as n, navigate as r, run as i, t as a, useAbility as o, useManifest as s } from "@letterncms/sdk";
import { useEffect as c, useState as l } from "react";
import { Badge as u, Button as d, Dialog as f, Fields as p, IconButton as m, confirm as h, toast as g } from "@letterncms/ui";
import { Fragment as _, jsx as v, jsxs as y } from "react/jsx-runtime";
// admin/src/Person.tsx
function b({ props: e, close: t }) {
	let n = e.user ? void 0 : e.id && e.id !== "new" ? e.id : void 0, i = o("roles/list"), a = o("user-fields/get"), s = o("users/get", { id: n }, { enabled: !!n }), l = t ?? (() => r("/users", { replace: !0 }));
	c(() => {
		s.isError && l();
	}, [s.isError]);
	let u = e.user ?? (n ? s.data : null);
	return !i.data || !a.data || u === void 0 ? null : /* @__PURE__ */ v(x, {
		user: u,
		roles: i.data.roles,
		profile: a.data.resolvedFields,
		onClose: l
	});
}
function x({ user: n, roles: r, profile: o, onClose: c }) {
	let u = s(), m = n?.id === u.user.id, b = !!n?.visitor, x = (e) => e.permissions.some((e) => e === "*" || e === "admin.access" || e === "admin.*"), C = Object.entries(r).filter(([e, t]) => x(t) !== b || n?.roles.includes(e)), [w, T] = l({
		name: n?.name ?? "",
		email: n?.email ?? "",
		roles: n?.roles ?? ["editor"],
		super: n?.super ?? !1
	}), [E, D] = l(n?.data ?? {}), [O, k] = l({
		add: [],
		remove: []
	}), [A, j] = l(null), M = e("users.manage"), N = !!n && M && !m, P = [
		{
			handle: "name",
			type: "text",
			label: a("Name"),
			required: !0,
			width: "half"
		},
		{
			handle: "email",
			type: "email",
			label: a("Email"),
			required: !0,
			width: "half"
		},
		...m ? [] : [{
			handle: "roles",
			type: "select",
			label: a("Roles"),
			multiple: !0,
			options: Object.fromEntries(C.map(([e, t]) => [e, t.label ? a(t.label) : e]))
		}],
		...u.user.super && !m && !b ? [{
			handle: "super",
			type: "toggle",
			label: a("Super Admin"),
			instructions: a("Bypasses every permission.")
		}] : []
	], F = async () => {
		j("save");
		try {
			let { super: e, roles: r, ...o } = w, s = {
				...o,
				data: E,
				...m ? {} : { roles: r },
				...u.user.super && !m && !b ? { super: e } : {}
			};
			if (n) {
				await i("users/update", {
					id: n.id,
					...s
				});
				for (let e of O.remove) await i("users/revoke", {
					id: n.id,
					access: e
				});
				for (let e of O.add) await i("users/grant", {
					id: n.id,
					access: e
				});
			} else await i("users/create", s);
			t("users/", "people/"), g.success(n ? a("Saved") : a("Invitation sent to {email}", { email: w.email })), c();
		} catch (e) {
			g.error(e);
		} finally {
			j(null);
		}
	}, I = async (e) => {
		j("suspend");
		try {
			await i("users/update", {
				id: e.id,
				suspended: e.status !== "suspended"
			}), t("users/", "people/"), g.success(e.status === "suspended" ? a("{name} reactivated", { name: e.name }) : a("{name} suspended", { name: e.name })), c();
		} catch (e) {
			g.error(e);
		} finally {
			j(null);
		}
	}, L = async (e) => {
		j("invite");
		try {
			await i("users/invite", { id: e.id }), g.success(a("Invitation sent"));
		} catch (e) {
			g.error(e);
		} finally {
			j(null);
		}
	}, R = async (e) => {
		if (await h({
			title: a("Remove {name}?", { name: e.name }),
			description: a("They lose access immediately. Their content stays."),
			confirm: a("Remove User"),
			danger: !0
		})) {
			j("remove");
			try {
				await i("users/delete", { id: e.id }), t("users/", "people/"), g.success(a("{name} removed", { name: e.name })), c();
			} catch (e) {
				g.error(e), j(null);
			}
		}
	};
	return /* @__PURE__ */ y(f, {
		open: !0,
		onOpenChange: (e) => !e && c(),
		title: a(n ? "Edit User" : "Invite User"),
		description: n ? void 0 : a("They get an email to set a password."),
		footer: /* @__PURE__ */ y(_, { children: [
			N && n && /* @__PURE__ */ y(_, { children: [
				/* @__PURE__ */ v(d, {
					variant: "destructive",
					className: "mr-auto max-sm:mr-0",
					loading: A === "remove",
					disabled: !!A,
					onClick: () => void R(n),
					children: a("Remove User")
				}),
				/* @__PURE__ */ v(d, {
					loading: A === "suspend",
					disabled: !!A,
					onClick: () => void I(n),
					children: n.status === "suspended" ? a("Reactivate") : a("Suspend")
				}),
				!n.lastLoginAt && !b && /* @__PURE__ */ v(d, {
					loading: A === "invite",
					disabled: !!A,
					onClick: () => void L(n),
					children: a("Resend Invitation")
				})
			] }),
			/* @__PURE__ */ v(d, {
				onClick: c,
				children: a("Cancel")
			}),
			/* @__PURE__ */ v(d, {
				variant: "primary",
				loading: A === "save",
				disabled: !w.name || !w.email || !!A && A !== "save",
				onClick: () => void F(),
				children: a(n ? "Save" : "Send Invitation")
			})
		] }),
		children: [
			/* @__PURE__ */ v(p, {
				fields: P,
				values: w,
				onChange: (e, t) => T({
					...w,
					[e]: t
				})
			}),
			o.length > 0 && /* @__PURE__ */ v(p, {
				className: "mt-5 border-t border-border pt-5",
				fields: o,
				values: E,
				onChange: (e, t) => D({
					...E,
					[e]: t
				})
			}),
			n && /* @__PURE__ */ v(S, {
				id: n.id,
				value: O,
				onChange: k
			})
		]
	});
}
function S({ id: t, value: r, onChange: i }) {
	let s = o("users/access", { id: t }), [c, f] = l(""), h = e("users.manage"), g = (s.data ?? []).filter((e) => !r.remove.includes(e.access)), _ = [...g, ...r.add.filter((e) => !g.some((t) => t.access === e)).map((e) => ({
		access: e,
		source: "new",
		expiresAt: null
	}))], b = () => {
		let e = c.trim();
		e && (f(""), r.remove.includes(e) ? i({
			...r,
			remove: r.remove.filter((t) => t !== e)
		}) : _.some((t) => t.access === e) || i({
			...r,
			add: [...r.add, e]
		}));
	}, x = (e) => r.add.includes(e) ? i({
		...r,
		add: r.add.filter((t) => t !== e)
	}) : i({
		...r,
		remove: [...r.remove, e]
	});
	return /* @__PURE__ */ y("section", {
		className: "mt-5 border-t border-border pt-5",
		children: [
			/* @__PURE__ */ v("h3", {
				className: "m-0 text-sm font-medium text-text",
				children: a("Access")
			}),
			_.length > 0 && /* @__PURE__ */ v("ul", {
				className: "m-0 mt-2 flex list-none flex-wrap gap-2 p-0",
				children: _.map((e) => /* @__PURE__ */ y("li", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ v(u, { children: e.access }),
						e.expiresAt && /* @__PURE__ */ v("span", {
							className: "text-xs text-faint",
							children: a("until {date}", { date: new Date(e.expiresAt).toLocaleDateString(n()) })
						}),
						h && /* @__PURE__ */ v(m, {
							icon: "close",
							size: "xs",
							label: a("Remove {name}", { name: e.access }),
							onClick: () => x(e.access)
						})
					]
				}, e.access + e.source))
			}),
			h && /* @__PURE__ */ y("form", {
				className: "mt-2 flex items-center gap-2",
				onSubmit: (e) => {
					e.preventDefault(), b();
				},
				children: [/* @__PURE__ */ v(p, {
					bare: !0,
					layout: "inline",
					className: "w-48 max-w-full",
					fields: [{
						handle: "access",
						type: "text",
						label: a("Access Name"),
						size: "sm",
						placeholder: a("magazine")
					}],
					values: { access: c },
					onChange: (e, t) => f(t ?? "")
				}), /* @__PURE__ */ v(d, {
					size: "sm",
					type: "submit",
					disabled: c.trim() === "",
					children: a("Add")
				})]
			})
		]
	});
}
export { b as default };
