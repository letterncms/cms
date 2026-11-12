import { can as e, navigate as t, t as n, timeAgo as r, useAbility as i } from "@letterncms/sdk";
import { Button as a, Widget as o, WidgetRow as s } from "@letterncms/ui";
import { jsx as c } from "react/jsx-runtime";
// admin/src/WidgetGlobals.tsx
function l() {
	let l = i("globals/list");
	return /* @__PURE__ */ c(o, {
		action: {
			label: n("All Global Sets"),
			to: "/globals"
		},
		query: l,
		empty: l.data?.length === 0 && {
			icon: "globe",
			title: n("No global sets yet"),
			action: e("globals.manage") && /* @__PURE__ */ c(a, {
				size: "sm",
				icon: "plus",
				onClick: () => t("/globals"),
				children: n("New Global Set")
			})
		},
		children: l.data?.slice(0, 6).map((e) => /* @__PURE__ */ c(s, {
			to: `/globals/${e.handle}`,
			icon: e.icon,
			title: /* @__PURE__ */ c("span", {
				className: "font-medium",
				children: e.title
			}),
			meta: e.updatedAt ? r(e.updatedAt) : null
		}, e.handle))
	});
}
export { l as default };
