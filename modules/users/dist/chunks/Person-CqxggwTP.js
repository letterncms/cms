import { can as e, invalidate as t, locale as n, navigate as r, run as i, t as a, useAbility as o, useManifest as s } from "@letterncms/sdk";
import { useEffect as c, useState as l } from "react";
import { Button as u, Dialog as d, Field as f, Fields as p, IconButton as m, Input as h, List as g, Row as _, Skeleton as v, confirm as y, toast as b } from "@letterncms/ui";
import { jsx as x, jsxs as S } from "react/jsx-runtime";
// admin/src/Person.tsx
function C({ props: e, close: t }) {
	let n = e.user ? void 0 : e.id && e.id !== "new" ? e.id : void 0, i = o("roles/list"), s = o("user-fields/get"), l = o("users/get", { id: n }, { enabled: !!n }), u = t ?? (() => r("/users", { replace: !0 }));
	c(() => {
		l.isError && u();
	}, [l.isError]);
	let f = e.user ?? (n ? l.data : null);
	return !i.data || !s.data || f === void 0 ? /* @__PURE__ */ x(d, {
		open: !0,
		onOpenChange: (e) => !e && u(),
		title: e.user || n ? a("Edit User") : a("Invite User"),
		children: /* @__PURE__ */ S("div", {
			className: "grid gap-4",
			"aria-busy": "true",
			children: [/* @__PURE__ */ S("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ x(v, { className: "h-14" }), /* @__PURE__ */ x(v, { className: "h-14" })]
			}), /* @__PURE__ */ x(v, { className: "h-14" })]
		})
	}) : /* @__PURE__ */ x(w, {
		user: f,
		roles: i.data.roles,
		profile: s.data.resolvedFields,
		onClose: u
	});
}
function w({ user: n, roles: r, profile: o, onClose: c }) {
	let f = s(), m = n?.id === f.user.id, h = !!n?.visitor, g = (e) => e.permissions.some((e) => e === "*" || e === "admin.access" || e === "admin.*"), _ = Object.entries(r).filter(([e, t]) => g(t) !== h || n?.roles.includes(e)), [v, C] = l({
		name: n?.name ?? "",
		email: n?.email ?? "",
		roles: n?.roles ?? ["editor"],
		super: n?.super ?? !1
	}), [w, E] = l(n?.data ?? {}), [D, O] = l({
		add: [],
		remove: []
	}), [k, A] = l(null), j = e("users.manage"), M = !!n && j && !m, N = [
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
			options: Object.fromEntries(_.map(([e, t]) => [e, t.label ? a(t.label) : e]))
		}],
		...f.user.super && !m && !h ? [{
			handle: "super",
			type: "toggle",
			label: a("Super Admin")
		}] : []
	], P = async () => {
		A("save");
		try {
			let { super: e, roles: r, ...o } = v, s = {
				...o,
				data: w,
				...m ? {} : { roles: r },
				...f.user.super && !m && !h ? { super: e } : {}
			};
			if (n) {
				await i("users/update", {
					id: n.id,
					...s
				});
				for (let e of D.remove) await i("users/revoke", {
					id: n.id,
					access: e.access,
					source: e.source
				});
				for (let e of D.add) await i("users/grant", {
					id: n.id,
					access: e
				});
			} else await i("users/create", s);
			t("users/", "people/"), b.success(n ? a("Saved") : a("Invitation sent to {email}", { email: v.email })), c();
		} catch (e) {
			b.error(e);
		} finally {
			A(null);
		}
	}, F = async (e) => {
		A("suspend");
		try {
			await i("users/update", {
				id: e.id,
				suspended: e.status !== "suspended"
			}), t("users/", "people/"), b.success(e.status === "suspended" ? a("{name} reactivated", { name: e.name }) : a("{name} suspended", { name: e.name })), c();
		} catch (e) {
			b.error(e);
		} finally {
			A(null);
		}
	}, I = async (e) => {
		A("invite");
		try {
			await i("users/invite", { id: e.id }), b.success(a("Invitation sent"));
		} catch (e) {
			b.error(e);
		} finally {
			A(null);
		}
	}, L = async (e) => {
		if (await y({
			title: a("Delete {name}?", { name: e.name }),
			description: a("They lose access immediately. Their content stays."),
			confirm: a("Delete User"),
			danger: !0
		})) {
			A("remove");
			try {
				await i("users/delete", { id: e.id }), t("users/", "people/"), b.success(a("{name} deleted", { name: e.name })), c();
			} catch (e) {
				b.error(e), A(null);
			}
		}
	};
	return /* @__PURE__ */ S(d, {
		open: !0,
		onOpenChange: (e) => !e && c(),
		title: a(n ? "Edit User" : "Invite User"),
		onSubmit: () => void P(),
		submitLabel: a(n ? "Save" : "Send Invitation"),
		submitDisabled: !v.name || !v.email || !!k && k !== "save",
		busy: k === "save",
		children: [
			/* @__PURE__ */ x(p, {
				fields: N,
				values: v,
				onChange: (e, t) => C({
					...v,
					[e]: t
				})
			}),
			o.length > 0 && /* @__PURE__ */ x(p, {
				className: "mt-5 border-t border-border pt-5",
				fields: o,
				values: w,
				onChange: (e, t) => E({
					...w,
					[e]: t
				})
			}),
			n && /* @__PURE__ */ x(T, {
				id: n.id,
				value: D,
				onChange: O
			}),
			M && n && /* @__PURE__ */ S("div", {
				className: "mt-5 flex flex-wrap items-center gap-2 border-t border-border pb-1 pt-5",
				children: [
					/* @__PURE__ */ x(u, {
						loading: k === "suspend",
						disabled: !!k,
						onClick: () => void F(n),
						children: n.status === "suspended" ? a("Reactivate") : a("Suspend")
					}),
					!n.lastLoginAt && !h && /* @__PURE__ */ x(u, {
						loading: k === "invite",
						disabled: !!k,
						onClick: () => void I(n),
						children: a("Resend Invitation")
					}),
					/* @__PURE__ */ x(u, {
						variant: "destructive",
						icon: "trash",
						className: "sm:ml-auto",
						loading: k === "remove",
						disabled: !!k,
						onClick: () => void L(n),
						children: a("Delete User")
					})
				]
			})
		]
	});
}
function T({ id: t, value: r, onChange: i }) {
	let s = o("users/access", { id: t }), [c, d] = l(""), p = e("users.manage"), v = (e) => r.remove.some((t) => t.access === e.access && t.source === e.source), y = (s.data ?? []).filter((e) => !v(e)), b = () => {
		let e = c.trim();
		e && (d(""), !y.some((t) => t.access === e && t.source === "admin") && !r.add.includes(e) && i({
			...r,
			add: [...r.add, e]
		}));
	};
	if (!s.data || !p && y.length === 0) return null;
	let C = (e) => e === "admin" ? "" : e.split(/[:/]/)[0].replace(/[-_]+/g, " ").replace(/^./, (e) => e.toUpperCase());
	return /* @__PURE__ */ S("div", {
		className: "mt-5 grid gap-3",
		children: [(y.length > 0 || r.add.length > 0) && /* @__PURE__ */ x(f, {
			label: a("Page Access"),
			children: /* @__PURE__ */ S(g, { children: [y.map((e) => /* @__PURE__ */ S(_, {
				actions: p && /* @__PURE__ */ x(m, {
					icon: "close",
					label: a("Remove {name}", { name: e.access }),
					onClick: () => i({
						...r,
						remove: [...r.remove, {
							access: e.access,
							source: e.source
						}]
					})
				}),
				children: [/* @__PURE__ */ x("span", {
					className: "min-w-0 truncate font-medium",
					children: e.access
				}), /* @__PURE__ */ x("span", {
					className: "min-w-0 flex-1 truncate text-xs text-muted",
					children: [C(e.source), e.expiresAt && a("until {date}", { date: new Date(e.expiresAt).toLocaleDateString(n()) })].filter(Boolean).join(" · ")
				})]
			}, `${e.access}:${e.source}`)), r.add.map((e) => /* @__PURE__ */ x(_, {
				actions: /* @__PURE__ */ x(m, {
					icon: "close",
					label: a("Remove {name}", { name: e }),
					onClick: () => i({
						...r,
						add: r.add.filter((t) => t !== e)
					})
				}),
				children: /* @__PURE__ */ x("span", {
					className: "min-w-0 flex-1 truncate font-medium",
					children: e
				})
			}, `new:${e}`))] })
		}), p && /* @__PURE__ */ x(f, {
			label: y.length > 0 || r.add.length > 0 ? a("Access Name") : a("Page Access"),
			htmlFor: "person-access",
			children: /* @__PURE__ */ S("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ x(h, {
					id: "person-access",
					className: "min-w-0 flex-1",
					value: c,
					onChange: (e) => d(e.target.value),
					onKeyDown: (e) => {
						e.key === "Enter" && (e.preventDefault(), b());
					}
				}), /* @__PURE__ */ x(u, {
					disabled: c.trim() === "",
					onClick: b,
					children: a("Add Access")
				})]
			})
		})]
	});
}
export { C as default };
