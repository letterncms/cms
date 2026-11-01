import { can as e, invalidate as t, locale as n, navigate as r, run as i, t as a, timeAgo as o, useAbility as s, useManifest as c } from "@letterncms/sdk";
import { useEffect as l, useState as u } from "react";
import { Avatar as d, Badge as f, Button as p, DataView as m, Dialog as h, EmptyState as g, Fields as _, IconButton as v, Menu as y, Page as b, Segmented as x, confirm as S, toast as C } from "@letterncms/ui";
import { Fragment as w, jsx as T, jsxs as E } from "react/jsx-runtime";
// admin/src/Users.tsx
function D({ params: n }) {
	let h = c(), [D, k] = u(""), [A, j] = u(1), [M, N] = u("team"), P = s("users/list", {
		search: D || void 0,
		kind: M,
		perPage: 100,
		page: A
	}), F = s("roles/list"), I = s("users/fields"), [L, R] = u(n.id === "new" ? "new" : null), z = e("users.manage");
	l(() => {
		n.id && n.id !== "new" && P.data && R(P.data.items.find((e) => e.id === n.id) ?? null);
	}, [n.id, P.data]);
	let B = (e) => F.data?.roles[e]?.label ? a(F.data.roles[e].label) : e, V = P.data?.items ?? [];
	return /* @__PURE__ */ E(b, {
		width: "wide",
		crumbs: [{
			label: a("Users"),
			icon: "users"
		}],
		actions: /* @__PURE__ */ E(w, { children: [(e("collections.manage") || z) && /* @__PURE__ */ T(y, {
			trigger: /* @__PURE__ */ T(v, {
				icon: "more",
				label: a("More")
			}),
			items: [e("collections.manage") && {
				label: a("Profile Fields"),
				icon: "field",
				onSelect: () => r("/users/fields")
			}, z && {
				label: a("Roles"),
				icon: "shield",
				onSelect: () => r("/settings/roles")
			}]
		}), z && /* @__PURE__ */ T(p, {
			variant: "primary",
			icon: "user-plus",
			onClick: () => R("new"),
			children: a("Invite User")
		})] }),
		children: [/* @__PURE__ */ T(m, {
			id: "users",
			label: a("Users"),
			items: V,
			source: {
				ability: "users/list",
				input: {
					search: D || void 0,
					kind: M
				},
				perPage: 100
			},
			rowKey: (e) => e.id,
			onRowClick: z ? (e) => R(e) : void 0,
			pagination: P.data && {
				page: A,
				pages: Math.ceil(P.data.total / 100),
				total: P.data.total,
				perPage: 100,
				onPage: j
			},
			loading: P.isLoading,
			error: P.isError,
			onRetry: () => void P.refetch(),
			toolbar: /* @__PURE__ */ E("span", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ T(x, {
					size: "sm",
					value: M,
					onChange: (e) => {
						N(e), j(1);
					},
					options: [{
						value: "team",
						label: a("Team")
					}, {
						value: "visitors",
						label: a("Visitors")
					}]
				}), /* @__PURE__ */ T(_, {
					bare: !0,
					layout: "inline",
					fields: [{
						handle: "search",
						type: "text",
						label: a("Search"),
						icon: "search",
						size: "sm",
						placeholder: a("Search people…"),
						className: "w-64 max-w-full"
					}],
					values: { search: D },
					onChange: (e, t) => {
						k(t ?? ""), j(1);
					}
				})]
			}),
			columns: [
				{
					id: "name",
					label: a("Name"),
					render: (e) => /* @__PURE__ */ E("span", {
						className: "flex min-w-0 items-center gap-2",
						children: [
							/* @__PURE__ */ T(d, {
								name: e.name,
								initials: e.initials,
								src: e.avatar,
								size: 24
							}),
							/* @__PURE__ */ T("span", {
								className: "truncate",
								children: e.name
							}),
							e.id === h.user.id && /* @__PURE__ */ T("span", {
								className: "text-xs text-faint",
								children: a("You")
							})
						]
					})
				},
				{
					id: "email",
					label: a("Email"),
					width: "minmax(200px,1fr)",
					render: (e) => e.email
				},
				{
					id: "roles",
					label: a("Roles"),
					width: "minmax(160px,0.8fr)",
					render: (e) => /* @__PURE__ */ E("span", {
						className: "flex flex-wrap items-center gap-1",
						children: [
							e.status === "suspended" && /* @__PURE__ */ T(f, {
								tone: "danger",
								children: a("Suspended")
							}),
							e.super && /* @__PURE__ */ T(f, { children: a("Super Admin") }),
							e.roles.map((e) => /* @__PURE__ */ T(f, { children: B(e) }, e))
						]
					})
				},
				{
					id: "security",
					label: a("Security"),
					width: "90px",
					render: (e) => e.twoFactor ? /* @__PURE__ */ T(f, {
						tone: "success",
						children: a("2FA")
					}) : "—"
				},
				{
					id: "seen",
					label: a("Last Sign-In"),
					width: "140px",
					render: (e) => e.lastLoginAt ? o(e.lastLoginAt) : a("Never signed in")
				}
			],
			actions: z ? (e) => e.id === h.user.id ? null : /* @__PURE__ */ T(y, {
				trigger: /* @__PURE__ */ T(v, {
					icon: "more",
					label: a("More"),
					size: "xs"
				}),
				items: [
					{
						label: a("Edit"),
						icon: "edit",
						onSelect: () => R(e)
					},
					!e.lastLoginAt && !e.visitor && {
						label: a("Resend Invitation"),
						icon: "mail",
						onSelect: () => i("users/invite", { id: e.id }).then(() => C.success(a("Invitation sent")), C.error)
					},
					{
						label: e.status === "suspended" ? a("Reactivate") : a("Suspend"),
						icon: "shield",
						onSelect: () => i("users/update", {
							id: e.id,
							suspended: e.status !== "suspended"
						}).then(() => {
							t("users/"), C.success(a("Saved"));
						}, C.error)
					},
					{
						separator: !0,
						label: ""
					},
					{
						label: a("Remove User…"),
						icon: "trash",
						danger: !0,
						onSelect: async () => {
							await S({
								title: a("Remove {name}?", { name: e.name }),
								description: a("They lose access immediately. Their content stays."),
								confirm: a("Remove"),
								danger: !0
							}) && i("users/delete", { id: e.id }).then(() => {
								t("users/"), C.success(a("{name} removed", { name: e.name }));
							}, C.error);
						}
					}
				]
			}) : void 0,
			empty: D ? /* @__PURE__ */ T(g, {
				icon: "search",
				title: a("No matches"),
				action: /* @__PURE__ */ T(p, {
					onClick: () => k(""),
					children: a("Clear Search")
				})
			}) : /* @__PURE__ */ T(g, {
				icon: "users",
				title: a("No users yet")
			})
		}), L && F.data && I.data && /* @__PURE__ */ T(O, {
			user: L === "new" ? null : L,
			roles: F.data.roles,
			profile: I.data.resolvedFields,
			onClose: () => {
				R(null), n.id && r("/users", { replace: !0 });
			}
		})]
	});
}
function O({ user: e, roles: n, profile: r, onClose: o }) {
	let s = c(), [l, d] = u({
		name: e?.name ?? "",
		email: e?.email ?? "",
		roles: e?.roles ?? ["editor"],
		super: e?.super ?? !1
	}), [f, m] = u(e?.data ?? {}), [g, v] = u(!1), y = [
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
		{
			handle: "roles",
			type: "select",
			label: a("Roles"),
			multiple: !0,
			options: Object.fromEntries(Object.entries(n).map(([e, t]) => [e, t.label ? a(t.label) : e]))
		},
		...s.user.super ? [{
			handle: "super",
			type: "toggle",
			label: a("Super Admin"),
			instructions: a("Bypasses every permission.")
		}] : []
	];
	return /* @__PURE__ */ E(h, {
		open: !0,
		onOpenChange: (e) => !e && o(),
		title: a(e ? "Edit User" : "Invite User"),
		description: e ? void 0 : a("They get an email with a link to set their password. It works for 7 days."),
		footer: /* @__PURE__ */ E(w, { children: [/* @__PURE__ */ T(p, {
			onClick: o,
			children: a("Cancel")
		}), /* @__PURE__ */ T(p, {
			variant: "primary",
			loading: g,
			disabled: !l.name || !l.email,
			onClick: async () => {
				v(!0);
				try {
					let { super: n, ...r } = l, c = {
						...r,
						data: f,
						...s.user.super ? { super: n } : {}
					};
					e ? await i("users/update", {
						id: e.id,
						...c
					}) : await i("users/create", c), t("users/"), C.success(e ? a("Saved") : a("Invitation sent to {email}", { email: l.email })), o();
				} catch (e) {
					C.error(e);
				} finally {
					v(!1);
				}
			},
			children: a(e ? "Save" : "Send Invitation")
		})] }),
		children: [
			/* @__PURE__ */ T(_, {
				fields: y,
				values: l,
				onChange: (e, t) => d({
					...l,
					[e]: t
				})
			}),
			r.length > 0 && /* @__PURE__ */ T(_, {
				className: "mt-5 border-t border-border pt-5",
				fields: r,
				values: f,
				onChange: (e, t) => m({
					...f,
					[e]: t
				})
			}),
			e && /* @__PURE__ */ T(k, { id: e.id })
		]
	});
}
function k({ id: r }) {
	let o = s("users/access", { id: r }), [c, l] = u(""), d = e("users.manage");
	return /* @__PURE__ */ E("section", {
		className: "mt-5 border-t border-border pt-5",
		children: [
			/* @__PURE__ */ T("h3", {
				className: "m-0 text-sm font-medium text-ink",
				children: a("Access")
			}),
			/* @__PURE__ */ T("p", {
				className: "m-0 mt-1 text-xs text-muted",
				children: a("Names pages can be limited to, like magazine. Plugins add them too, for example after a purchase.")
			}),
			(o.data ?? []).length > 0 && /* @__PURE__ */ T("ul", {
				className: "m-0 mt-3 flex list-none flex-wrap gap-2 p-0",
				children: o.data.map((e) => /* @__PURE__ */ E("li", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ T(f, { children: e.access }),
						e.expiresAt && /* @__PURE__ */ T("span", {
							className: "text-xs text-faint",
							children: a("until {date}", { date: new Date(e.expiresAt).toLocaleDateString(n()) })
						}),
						d && /* @__PURE__ */ T(v, {
							icon: "close",
							size: "xs",
							label: a("Remove {name}", { name: e.access }),
							onClick: () => i("users/revoke", {
								id: r,
								access: e.access
							}).then(() => t("users/access"), C.error)
						})
					]
				}, e.access + e.source))
			}),
			d && /* @__PURE__ */ E("span", {
				className: "mt-3 flex items-center gap-2",
				children: [/* @__PURE__ */ T(_, {
					bare: !0,
					layout: "inline",
					fields: [{
						handle: "access",
						type: "text",
						label: a("Access Name"),
						size: "sm",
						placeholder: a("Access name"),
						className: "w-48 max-w-full"
					}],
					values: { access: c },
					onChange: (e, t) => l(t ?? "")
				}), /* @__PURE__ */ T(p, {
					size: "sm",
					disabled: c.trim() === "",
					onClick: () => i("users/grant", {
						id: r,
						access: c.trim()
					}).then(() => {
						l(""), t("users/access");
					}, C.error),
					children: a("Add")
				})]
			})
		]
	});
}
export { D as default };
