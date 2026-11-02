import { navigate as e, t, timeAgo as n, useAbility as r, useManifest as i } from "@letterncms/sdk";
import { Button as a, StatusDot as o, Widget as s, WidgetRow as c, statusLabel as l } from "@letterncms/ui";
import { jsx as u, jsxs as d } from "react/jsx-runtime";
// admin/src/WidgetRecent.tsx
function f() {
	let f = i(), p = r("content/recent", { limit: 8 }), m = f.collections.find((e) => e.can.create);
	return /* @__PURE__ */ u(s, {
		query: p,
		empty: p.data?.length === 0 && {
			icon: "file",
			title: t("Nothing edited yet"),
			action: m && /* @__PURE__ */ u(a, {
				size: "sm",
				icon: m.icon,
				onClick: () => e(`/content/${m.handle}/new`),
				children: m.newLabel
			})
		},
		children: p.data?.map((e) => {
			let r = f.collections.find((t) => t.handle === e.collection);
			return /* @__PURE__ */ u(c, {
				to: `/content/${e.collection}/${e.id}`,
				icon: r?.icon ?? "file",
				title: /* @__PURE__ */ u("span", {
					className: "font-medium",
					children: e.title || t("Untitled")
				}),
				meta: /* @__PURE__ */ d("span", {
					className: "flex items-center gap-4",
					children: [
						/* @__PURE__ */ u("span", {
							className: "hidden text-faint @lg:inline",
							children: r?.title
						}),
						/* @__PURE__ */ u(o, {
							status: e.displayStatus,
							label: t(l(e.displayStatus)),
							className: "hidden w-20 @md:inline-flex"
						}),
						/* @__PURE__ */ u("span", {
							className: "w-16 text-right",
							children: n(e.updatedAt)
						})
					]
				})
			}, e.id);
		})
	});
}
export { f as default };
