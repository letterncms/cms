import { can as e, navigate as t, plural as n, t as r, timeAgo as i, useAbility as a } from "@letterncms/sdk";
import { Button as o, Widget as s, WidgetRow as c, compactNumber as l } from "@letterncms/ui";
import { jsx as u, jsxs as d } from "react/jsx-runtime";
// admin/src/WidgetOverview.tsx
function f() {
	let f = a("collections/overview"), p = e("collections.manage");
	return /* @__PURE__ */ u(s, {
		action: p && {
			label: r("Manage"),
			to: "/collections"
		},
		query: f,
		empty: f.data?.length === 0 && {
			icon: "collection",
			title: r("No collections yet"),
			action: p && /* @__PURE__ */ u(o, {
				size: "sm",
				icon: "plus",
				onClick: () => t("/collections/new"),
				children: r("New Collection")
			})
		},
		children: f.data?.slice(0, 8).map((e) => /* @__PURE__ */ u(c, {
			to: `/content/${e.handle}`,
			icon: e.icon,
			title: /* @__PURE__ */ u("span", {
				className: "font-medium",
				children: e.title
			}),
			meta: /* @__PURE__ */ d("span", {
				className: "flex items-center gap-4",
				children: [
					e.updatedAt && /* @__PURE__ */ u("span", {
						className: "hidden @md:inline",
						children: r("Changed {time}", { time: i(e.updatedAt) })
					}),
					e.drafts > 0 && /* @__PURE__ */ u("span", { children: n(e.drafts, "{count} draft", "{count} drafts") }),
					/* @__PURE__ */ u("span", {
						className: "min-w-6 text-right text-sm text-text",
						children: l(e.total)
					})
				]
			})
		}, e.handle))
	});
}
export { f as default };
