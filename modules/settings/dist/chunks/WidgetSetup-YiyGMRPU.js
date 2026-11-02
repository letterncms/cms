import { brand as e, t, useAbility as n, useManifest as r } from "@letterncms/sdk";
import { Icon as i, Meter as a, Widget as o, WidgetRow as s, cn as c } from "@letterncms/ui";
import { Fragment as l, jsx as u, jsxs as d } from "react/jsx-runtime";
// admin/src/WidgetSetup.tsx
function f() {
	let f = r().settings.some((e) => e.namespace === "mail"), h = n("settings/get", { namespace: "site" }), g = n("settings/get", { namespace: "mail" }, { enabled: f }), _ = h.isLoading || f && g.isLoading, v = [];
	if (h.data) {
		let n = h.data.values, r = String(n.name ?? "").trim(), i = p(String(n.url ?? "")), a = String(n.description ?? "").trim(), o = String(n.timezone ?? "UTC");
		v.push({
			label: t("Site Name"),
			done: r !== "" && r !== e().name,
			value: r || t("Not set"),
			to: "/settings/site"
		}, {
			label: t("Public URL"),
			done: !!i && !m(i),
			value: i ? m(i) ? t("Local Address") : i : t("Not set"),
			to: "/settings/site"
		}, {
			label: t("Description"),
			done: a !== "",
			value: t(a ? "Added" : "Missing"),
			to: "/settings/site"
		}, {
			label: t("Timezone"),
			done: o !== "UTC",
			value: o,
			to: "/settings/site"
		});
	}
	if (f && g.data) {
		let e = String(g.data.values.from_address ?? "").trim();
		v.push({
			label: t("Email Sender"),
			done: e !== "",
			value: e || t("Not set"),
			to: "/settings/mail"
		});
	}
	let y = v.filter((e) => e.done).length, b = v.length > 0 && y === v.length;
	return /* @__PURE__ */ u(o, {
		query: h,
		loading: _,
		children: v.length > 0 && /* @__PURE__ */ d(l, { children: [/* @__PURE__ */ d("div", {
			className: "mb-1 flex items-center gap-3",
			children: [/* @__PURE__ */ u("span", {
				className: "shrink-0 text-xs text-muted",
				children: b ? t("Ready to launch") : t("{done} of {total} done", {
					done: y,
					total: v.length
				})
			}), /* @__PURE__ */ u(a, {
				value: y / v.length,
				tone: b ? "success" : "ink",
				label: t("Site Setup Progress"),
				className: "flex-1"
			})]
		}), v.map((e) => /* @__PURE__ */ u(s, {
			to: e.to,
			leading: /* @__PURE__ */ u(i, {
				name: e.done ? "check-circle" : "circle",
				size: 15,
				className: c("shrink-0", e.done ? "text-success" : "text-faint")
			}),
			title: e.label,
			meta: /* @__PURE__ */ u("span", {
				className: c("block max-w-36 truncate", !e.done && "text-muted"),
				children: e.value
			})
		}, e.label))] })
	});
}
function p(e) {
	try {
		return e.trim() ? new URL(e).host : "";
	} catch {
		return e.trim();
	}
}
function m(e) {
	let t = e.replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
	return [
		"localhost",
		"127.0.0.1",
		"0.0.0.0",
		"::1"
	].includes(t) || /\.(localhost|local|test)$/.test(t);
}
export { f as default };
