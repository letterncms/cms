import { can as e, navigate as t, plural as n, t as r, timeAgo as i, useAbility as a, useManifest as o } from "@letterncms/sdk";
import { Avatar as s, Button as c, Widget as l, WidgetRow as u } from "@letterncms/ui";
import { Fragment as d, jsx as f, jsxs as p } from "react/jsx-runtime";
// admin/src/WidgetTeam.tsx
function m() {
	let m = o(), h = a("users/recent", { limit: 5 }), g = e("users.manage");
	return !h.isError && (!h.data || h.data.total <= 1) ? null : /* @__PURE__ */ f(l, {
		action: {
			label: r("All Users"),
			to: "/users"
		},
		query: h,
		children: h.data && /* @__PURE__ */ p(d, { children: [h.data.items.map((e) => /* @__PURE__ */ f(u, {
			to: g ? `/users/${e.id}` : void 0,
			leading: /* @__PURE__ */ f(s, {
				name: e.name,
				initials: e.initials,
				src: e.avatar,
				size: 24
			}),
			title: /* @__PURE__ */ p("span", {
				className: "flex items-baseline gap-1.5",
				children: [/* @__PURE__ */ f("span", {
					className: "truncate font-medium",
					children: e.name
				}), e.id === m.user.id && /* @__PURE__ */ f("span", {
					className: "shrink-0 text-xs text-faint",
					children: r("You")
				})]
			}),
			description: e.role || r("No role"),
			meta: e.lastLoginAt ? i(e.lastLoginAt) : r("Never signed in")
		}, e.id)), g && /* @__PURE__ */ p("div", {
			className: "mt-2 flex items-center justify-between gap-3 border-t border-border pt-2",
			children: [/* @__PURE__ */ f("span", {
				className: "text-xs text-faint",
				children: h.data.total > h.data.items.length ? n(h.data.total, "{count} person in all", "{count} people in all") : ""
			}), /* @__PURE__ */ f(c, {
				size: "sm",
				variant: "ghost",
				icon: "user-plus",
				onClick: () => t("/users/new"),
				children: r("Invite User")
			})]
		})] })
	});
}
export { m as default };
