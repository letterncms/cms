import { t as e } from "./shared-DCCXkjUq.js";
import { t, timeAgo as n, useAbility as r } from "@letterncms/sdk";
import { Widget as i, WidgetRow as a } from "@letterncms/ui";
import { jsx as o } from "react/jsx-runtime";
// admin/src/WidgetSites.tsx
function s() {
	let s = r("sync/overview", void 0, { refetchInterval: 6e4 }), c = s.data, l = c?.current && e.includes(c.current.status) ? c.current : null;
	return !s.isError && (!c || c.remotes.length === 0) ? null : /* @__PURE__ */ o(i, {
		query: s,
		action: {
			label: t("Open Sync"),
			to: "/sync"
		},
		children: c?.remotes.slice(0, 6).map((e) => /* @__PURE__ */ o(a, {
			to: "/sync",
			icon: /localhost|127\.0\.0\.1|\.test(:|\/|$)/.test(e.url) ? "desktop" : "globe",
			title: /* @__PURE__ */ o("span", {
				className: "font-medium",
				children: e.label
			}),
			description: e.url.replace(/^https?:\/\//, ""),
			meta: l?.remote === e.name ? `${l.label} · ${l.percent}%` : e.last && (e.last.undone_at ? t("last sync undone") : e.last.direction === "pull" ? t("pulled {ago}", { ago: n(e.last.at) }) : t("pushed {ago}", { ago: n(e.last.at) }))
		}, e.name))
	});
}
export { s as default };
