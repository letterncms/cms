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
			let r = f.collections.find((t) => t.handle === e.collection), i = f.collections.find((e) => e.handle === r?.within) ?? r, a = e.updatedAt ?? e.publishedAt;
			return /* @__PURE__ */ u(c, {
				to: `/content/${e.collection}/${e.id}`,
				icon: i?.icon ?? "file",
				title: /* @__PURE__ */ u("span", {
					className: "font-medium",
					children: e.title || t("Untitled")
				}),
				meta: /* @__PURE__ */ d("span", {
					className: "flex min-w-0 items-center gap-4",
					children: [
						/* @__PURE__ */ u("span", {
							className: "sr-only w-24 truncate text-faint @lg:not-sr-only @lg:block",
							children: i?.title
						}),
						/* @__PURE__ */ u(o, {
							status: e.displayStatus,
							label: l(e.displayStatus),
							className: "sr-only w-20 @md:not-sr-only @md:inline-flex"
						}),
						/* @__PURE__ */ u("time", {
							dateTime: a ?? void 0,
							className: "w-24 text-right",
							children: a ? n(a) : null
						})
					]
				})
			}, e.id);
		})
	});
}
export { f as default };
