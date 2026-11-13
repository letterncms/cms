import { can as e, navigate as t, plural as n, t as r, useAbility as i } from "@letterncms/sdk";
import { Button as a, Widget as o, WidgetRow as s } from "@letterncms/ui";
import { jsx as c } from "react/jsx-runtime";
// admin/src/WidgetMenus.tsx
function l() {
	let l = i("navigation/list");
	return /* @__PURE__ */ c(o, {
		query: l,
		action: {
			label: r("All Menus"),
			to: "/navigation"
		},
		empty: l.data?.length === 0 && {
			icon: "list-tree",
			title: r("No menus yet"),
			action: e("navigation.manage") && /* @__PURE__ */ c(a, {
				size: "sm",
				icon: "plus",
				onClick: () => t("/navigation"),
				children: r("New Menu")
			})
		},
		children: l.data?.slice(0, 6).map((e) => /* @__PURE__ */ c(s, {
			to: `/navigation/${e.handle}`,
			icon: "list-tree",
			title: /* @__PURE__ */ c("span", {
				className: "font-medium",
				children: e.title
			}),
			meta: n(e.count, "{count} link", "{count} links")
		}, e.handle))
	});
}
export { l as default };
