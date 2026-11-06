import { t as e } from "./shared-DCCXkjUq.js";
import { can as t, navigate as n, t as r, timeAgo as i, useAbility as a } from "@letterncms/sdk";
import { Button as o, Widget as s, WidgetRow as c } from "@letterncms/ui";
import { jsx as l } from "react/jsx-runtime";
// admin/src/WidgetSites.tsx
function u() {
	let u = a("sync/overview", void 0, { refetchInterval: 6e4 }), d = u.data, f = d?.current && e.includes(d.current.status) ? d.current : null;
	return /* @__PURE__ */ l(s, {
		query: u,
		action: {
			label: r("Open Sync"),
			to: "/sync"
		},
		empty: d?.remotes.length === 0 && {
			icon: "sync",
			title: r("Connect another site"),
			action: t("sync.manage") && /* @__PURE__ */ l(o, {
				size: "sm",
				icon: "plus",
				onClick: () => n("/sync"),
				children: r("Connect a Site")
			})
		},
		children: d?.remotes.slice(0, 6).map((e) => /* @__PURE__ */ l(c, {
			to: "/sync",
			icon: /localhost|127\.0\.0\.1|\.test(:|\/|$)/.test(e.url) ? "desktop" : "globe",
			title: /* @__PURE__ */ l("span", {
				className: "font-medium",
				children: e.label
			}),
			description: e.url.replace(/^https?:\/\//, ""),
			meta: f?.remote === e.name ? `${f.label} · ${f.percent}%` : e.last && (e.last.undone_at ? r("last sync undone") : e.last.direction === "pull" ? r("pulled {ago}", { ago: i(e.last.at) }) : r("pushed {ago}", { ago: i(e.last.at) }))
		}, e.name))
	});
}
export { u as default };
