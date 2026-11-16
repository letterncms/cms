import { n as e } from "./installing-CCPtKzo4.js";
import { invalidate as t, loadManifest as n, navigate as r, run as i, t as a } from "@letterncms/sdk";
import { Badge as o, Button as s, Icon as c, IconButton as l, Menu as u, Switch as d, Tooltip as f, cn as p, confirm as m, toast as h } from "@letterncms/ui";
import { jsx as g, jsxs as _ } from "react/jsx-runtime";
// admin/src/storeItem.tsx
var v = (e) => `/${e.type === "site" ? "sites" : "plugins"}/store/${e.package}`, y = { turnOn: !0 };
async function b(n, r) {
	try {
		let o = await i("packages/plan-install", {
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
			let n = await i("packages/install", {
				package: t.package,
				version: t.version,
				turnOn: y.turnOn
			});
			await e(n);
		}
		return t("packages/", ...n.type === "site" ? ["sites/"] : []), h.success(n.installed ? a("{name} updated", { name: n.title }) : a("{name} installed", { name: n.title })), !0;
	} catch (e) {
		return h.error(e), !1;
	} finally {
		r(null);
	}
}
function x({ item: e, icon: t, size: n = "md" }) {
	let r = n === "lg" ? "size-14 rounded-xl" : "size-10 rounded-lg";
	return e.icon ? /* @__PURE__ */ g("img", {
		src: e.icon,
		alt: "",
		className: p(r, "shrink-0 object-cover"),
		loading: "lazy"
	}) : /* @__PURE__ */ g("span", {
		className: p(r, "grid shrink-0 place-items-center border border-border bg-sunken text-ink"),
		children: /* @__PURE__ */ g(c, {
			name: t || e.glyph || "plugin",
			size: n === "lg" ? 26 : 20
		})
	});
}
function S({ item: e, busy: t, locked: n, onInstall: i, size: c = "sm" }) {
	switch (e.action) {
		case "install":
		case "update": return /* @__PURE__ */ g(s, {
			size: c,
			variant: "primary",
			loading: t,
			disabled: n,
			onClick: (e) => {
				e.stopPropagation(), i();
			},
			children: e.action === "update" ? a("Update") : a("Install")
		});
		case "installed": return e.type === "site" ? /* @__PURE__ */ g(s, {
			size: c,
			variant: "ghost",
			onClick: (e) => {
				e.stopPropagation(), r("/sites");
			},
			children: a("Open")
		}) : null;
		case "blocked": return /* @__PURE__ */ g(o, {
			tone: "danger",
			children: a("Blocked")
		});
		default: return /* @__PURE__ */ g("span", {
			className: "text-xs text-muted",
			children: a("Not for this version")
		});
	}
}
async function C(e, r) {
	try {
		let a = await i("packages/switch", {
			name: e.name,
			on: r
		});
		h.success(a.message), t("packages/"), await n();
	} catch (e) {
		h.error(e);
	}
}
async function w(e) {
	let r = await i("packages/uninstall", {
		name: e.name,
		deleteFiles: !0,
		dryRun: !0
	}).then((e) => e.changes?.[0]?.keeps ?? []).catch(() => []);
	if (!await m({
		title: a("Uninstall {name}?", { name: e.label }),
		description: [a("Its database tables, settings and files are removed."), ...r].join(" "),
		confirm: a("Uninstall"),
		danger: !0
	})) return !1;
	try {
		let r = await i("packages/uninstall", {
			name: e.name,
			deleteFiles: !0
		});
		return h.success(r.message), t("packages/"), await n(), !0;
	} catch (e) {
		return h.error(e), !1;
	}
}
function T(e, t) {
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
			onSelect: () => void w(e).then((e) => e && t?.())
		}
	];
}
function E({ plugin: e, disabled: t }) {
	let n = /* @__PURE__ */ g("span", {
		className: "inline-flex",
		children: /* @__PURE__ */ g(d, {
			checked: e.enabled,
			disabled: t || e.locked,
			onChange: (t) => void C(e, t),
			"aria-label": a("{name} on", { name: e.label })
		})
	});
	return /* @__PURE__ */ _("div", {
		className: "flex items-center gap-1",
		children: [e.locked && e.keptOn ? /* @__PURE__ */ g(f, {
			content: e.keptOn,
			children: n
		}) : n, /* @__PURE__ */ g(u, {
			align: "end",
			trigger: /* @__PURE__ */ g(l, {
				icon: "more",
				label: a("Actions for {name}", { name: e.label }),
				size: "sm"
			}),
			items: T(e)
		})]
	});
}
export { y as a, w as c, b as i, x as n, v as o, E as r, C as s, S as t };
