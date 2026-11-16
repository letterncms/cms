import { t as e, timeAgo as t, useAbility as n } from "@letterncms/sdk";
import { Avatar as r, Icon as i, Tooltip as a, Widget as o, WidgetRow as s } from "@letterncms/ui";
import { jsx as c, jsxs as l } from "react/jsx-runtime";
// admin/src/WidgetComments.tsx
function u() {
	let u = n("comments/inbox", { limit: 5 }, { refetchInterval: 6e4 });
	return /* @__PURE__ */ c(o, {
		query: u,
		empty: u.data?.length === 0 && {
			icon: "comment",
			title: e("Nothing waiting for you")
		},
		children: u.data?.map((n) => {
			let o = n.author?.name ?? e("Someone");
			return /* @__PURE__ */ c(s, {
				to: `/content/${n.entry.collection}/${n.entry.id}`,
				leading: /* @__PURE__ */ c(r, {
					name: o,
					initials: n.author?.initials,
					src: n.author?.avatar,
					size: 22
				}),
				title: /* @__PURE__ */ c("span", {
					className: "font-medium",
					children: n.entry.title || e("Untitled")
				}),
				description: e("{name}: {comment}", {
					name: o,
					comment: n.body
				}),
				meta: /* @__PURE__ */ l("span", {
					className: "flex items-center gap-2",
					children: [n.reason === "mention" && /* @__PURE__ */ c(a, {
						content: e("Mentions you"),
						children: /* @__PURE__ */ c("span", {
							className: "inline-flex text-muted",
							children: /* @__PURE__ */ c(i, {
								name: "at",
								size: 12
							})
						})
					}), t(n.createdAt)]
				})
			}, n.threadId);
		})
	});
}
export { u as default };
