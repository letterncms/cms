import { brand as e, t, useAbility as n } from "@letterncms/sdk";
import { Icon as r, Meter as i, Widget as a, WidgetRow as o, cn as s } from "@letterncms/ui";
import { Fragment as c, jsx as l, jsxs as u } from "react/jsx-runtime";
// admin/src/WidgetSetup.tsx
function d() {
	let d = n("settings/get", { namespace: "site" }), m = n("settings/get", { namespace: "email" }), h = d.isLoading || m.isLoading, g = [];
	if (d.data) {
		let n = d.data.values, r = String(n.name ?? "").trim(), i = f(String(n.url ?? "")), a = String(n.description ?? "").trim(), o = String(n.timezone ?? "UTC");
		g.push({
			label: t("Site Name"),
			done: r !== "" && r !== e().name,
			value: r || t("Not set"),
			to: "/settings/site"
		}, {
			label: t("Public URL"),
			done: !!i && !p(i),
			value: i ? p(i) ? t("Local Address") : i : t("Not set"),
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
	if (m.data) {
		let e = String(m.data.values.from_address ?? "").trim();
		g.push({
			label: t("Email Sender"),
			done: e !== "",
			value: e || t("Not set"),
			to: "/settings/email"
		});
	}
	let _ = g.filter((e) => e.done).length, v = g.length > 0 && _ === g.length;
	return /* @__PURE__ */ l(a, {
		query: d,
		loading: h,
		children: g.length > 0 && /* @__PURE__ */ u(c, { children: [/* @__PURE__ */ u("div", {
			className: "mb-1 flex items-center gap-3",
			children: [/* @__PURE__ */ l("span", {
				className: "shrink-0 text-xs text-muted",
				children: v ? t("Ready to launch") : t("{done} of {total} done", {
					done: _,
					total: g.length
				})
			}), /* @__PURE__ */ l(i, {
				value: _ / g.length,
				tone: v ? "success" : "ink",
				label: t("Site Setup Progress"),
				className: "flex-1"
			})]
		}), g.map((e) => /* @__PURE__ */ l(o, {
			to: e.to,
			leading: /* @__PURE__ */ l(r, {
				name: e.done ? "check-circle" : "circle",
				size: 15,
				className: s("shrink-0", e.done ? "text-success" : "text-faint")
			}),
			title: e.label,
			meta: /* @__PURE__ */ l("span", {
				className: s("block max-w-36 truncate", !e.done && "text-muted"),
				children: e.value
			})
		}, e.label))] })
	});
}
function f(e) {
	try {
		return e.trim() ? new URL(e).host : "";
	} catch {
		return e.trim();
	}
}
function p(e) {
	let t = e.replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
	return [
		"localhost",
		"127.0.0.1",
		"0.0.0.0",
		"::1"
	].includes(t) || /\.(localhost|local|test)$/.test(t);
}
export { d as default };
