import { n as e } from "./installing-CCPtKzo4.js";
import { invalidate as t, loadManifest as n, navigate as r, run as i, t as a } from "@letterncms/sdk";
import { Badge as o, Button as s, Icon as c, IconButton as l, Menu as u, Switch as d, Tooltip as f, cn as p, confirm as m, prompt as h, toast as g } from "@letterncms/ui";
import { jsx as _, jsxs as v } from "react/jsx-runtime";
// admin/src/storeItem.tsx
var y = (e) => `/plugins/store/${e.package}${e.store && e.store !== "default" ? `?store=${encodeURIComponent(e.store)}` : ""}`, b = { turnOn: !0 };
async function x(n, r) {
	try {
		let o = await i("packages/plan-install", {
			store: n.store,
			package: n.package,
			version: n.latest ?? void 0
		}), s = o.steps.filter((e) => !e.enable_only).map((e) => `${e.title} ${e.version}`);
		if (!await m({
			title: n.installed ? a("Update {name}?", { name: n.title }) : a("Install {name}?", { name: n.title }),
			description: [
				s.length > 1 ? a("Also installs what it needs: {list}.", { list: s.join(", ") }) : "",
				o.capabilities.length ? a("It may use: {list}.", { list: o.capabilities.join(", ") }) : "",
				a("This code runs with full access to your site.")
			].filter(Boolean).join(" "),
			confirm: n.installed ? a("Update") : a("Install")
		})) return !1;
		for (let t of o.steps) {
			if (t.enable_only) {
				await i("packages/enable", { name: t.package });
				continue;
			}
			r(a("Installing {name}…", { name: t.title }));
			let o = await i("packages/install", {
				store: n.store,
				package: t.package,
				version: t.version,
				turnOn: b.turnOn
			});
			await e(o);
		}
		return t("packages/"), g.success(n.installed ? a("{name} updated", { name: n.title }) : a("{name} installed", { name: n.title })), !0;
	} catch (e) {
		return g.error(e), !1;
	} finally {
		r(null);
	}
}
var S = (e) => e.pricing === "free" ? a("Free") : a("Paid");
async function C() {
	let e = (await h({
		title: a("Add License Key"),
		fields: [{
			handle: "key",
			type: "textarea",
			label: a("License Key"),
			required: !0
		}],
		confirm: a("Add License Key")
	}))?.key;
	if (!e) return !1;
	try {
		return await i("packages/add-key", { key: e }), t("packages/"), g.success(a("License key added")), !0;
	} catch (e) {
		return g.error(e), !1;
	}
}
function w({ item: e, icon: t, size: n = "md" }) {
	let r = n === "lg" ? "size-14 rounded-xl" : "size-10 rounded-lg";
	return e.icon ? /* @__PURE__ */ _("img", {
		src: e.icon,
		alt: "",
		className: p(r, "shrink-0 object-cover"),
		loading: "lazy"
	}) : /* @__PURE__ */ _("span", {
		className: p(r, "grid shrink-0 place-items-center border border-border bg-sunken text-ink"),
		children: /* @__PURE__ */ _(c, {
			name: t || e.glyph || "plugin",
			size: n === "lg" ? 26 : 20
		})
	});
}
function T({ item: e, busy: t, locked: n, onInstall: i, size: c = "sm" }) {
	switch (e.action) {
		case "install":
		case "update": return /* @__PURE__ */ _(s, {
			size: c,
			variant: "primary",
			loading: t,
			disabled: n,
			onClick: (e) => {
				e.stopPropagation(), i();
			},
			children: e.action === "update" ? a("Update") : a("Install")
		});
		case "buy": return e.listing_url ? /* @__PURE__ */ _(s, {
			size: c,
			onClick: (t) => {
				t.stopPropagation(), window.open(e.listing_url, "_blank", "noopener");
			},
			children: a("Buy on Store")
		}) : /* @__PURE__ */ _("span", {
			className: "text-xs text-muted",
			children: a("Paid Plugin")
		});
		case "installed": return e.type === "kit" ? /* @__PURE__ */ _(s, {
			size: c,
			variant: "ghost",
			onClick: (e) => {
				e.stopPropagation(), r("/kits");
			},
			children: a("Open")
		}) : null;
		case "blocked": return /* @__PURE__ */ _(o, {
			tone: "danger",
			children: a("Blocked")
		});
		default: return /* @__PURE__ */ _("span", {
			className: "text-xs text-muted",
			children: a("Not for this version")
		});
	}
}
async function E(e, r) {
	try {
		let a = await i("packages/switch", {
			name: e.name,
			on: r
		});
		g.success(a.message), t("packages/"), await n();
	} catch (e) {
		g.error(e);
	}
}
async function D(e) {
	if (!await m({
		title: a("Uninstall {name}?", { name: e.label }),
		description: a("Its database tables, settings and files are removed."),
		confirm: a("Uninstall"),
		danger: !0
	})) return !1;
	try {
		let r = await i("packages/uninstall", {
			name: e.name,
			deleteFiles: !0
		});
		return g.success(r.message), t("packages/"), await n(), !0;
	} catch (e) {
		return g.error(e), !1;
	}
}
function O(e, t) {
	return [
		!!e.settingsTo && {
			label: a("Settings"),
			icon: "settings",
			onSelect: () => r(e.settingsTo)
		},
		!!e.to && e.to !== e.settingsTo && {
			label: a("Open"),
			icon: "arrow-right",
			onSelect: () => r(e.to)
		},
		(!!e.settingsTo || !!e.to) && {
			separator: !0,
			label: ""
		},
		{
			label: a("Uninstall…"),
			icon: "trash",
			danger: !0,
			disabled: e.dependents.length > 0,
			description: e.keptOn && e.dependents.length ? e.keptOn : void 0,
			onSelect: () => void D(e).then((e) => e && t?.())
		}
	];
}
function k({ plugin: e, disabled: t }) {
	let n = /* @__PURE__ */ _("span", {
		className: "inline-flex",
		children: /* @__PURE__ */ _(d, {
			checked: e.enabled,
			disabled: t || e.locked,
			onChange: (t) => void E(e, t),
			"aria-label": a("{name} on", { name: e.label })
		})
	});
	return /* @__PURE__ */ v("div", {
		className: "flex items-center gap-1",
		children: [e.locked && e.keptOn ? /* @__PURE__ */ _(f, {
			content: e.keptOn,
			children: n
		}) : n, /* @__PURE__ */ _(u, {
			align: "end",
			trigger: /* @__PURE__ */ _(l, {
				icon: "more",
				label: a("Actions for {name}", { name: e.label }),
				size: "sm"
			}),
			items: O(e)
		})]
	});
}
export { x as a, S as c, C as i, E as l, w as n, b as o, k as r, y as s, T as t, D as u };
