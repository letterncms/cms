import { r as e } from "./chunks/names-CcWioF13.js";
import { invalidate as t, navigate as n, registry as r, run as i, t as a, useAbility as o, useManifest as s } from "@letterncms/sdk";
import { lazy as c, useState as l } from "react";
import { Button as u, Menu as d, toast as f } from "@letterncms/ui";
import { jsx as p } from "react/jsx-runtime";
// admin/src/LanguageMenu.tsx
function m({ entry: r, collection: c, save: m }) {
	let h = s().site.locales.length > 1, g = o("translations/list", { id: r?.id ?? "" }, { enabled: h && !!r }), _ = o("languages/list", {}, {
		enabled: h && !!r,
		staleTime: 6e4
	}), [v, y] = l(!1);
	if (!r || !h) return null;
	let b = async (o, s) => {
		y(!0);
		let l = f.loading(a(s ? "Translating into {language}…" : "Creating the {language} version…", { language: e(o) }));
		try {
			await m().catch(() => {});
			let e = await i("translations/create", {
				id: r.id,
				locale: o,
				translate: s
			});
			t("translations/", "entries/", "content/"), f.success(a(s ? "Translated as a draft" : "Copy created as a draft"), {
				id: l,
				description: a(s ? "Review it, then publish." : "Translate the text, then publish.")
			}), n(`/content/${c.handle}/${e.id}`);
		} catch (e) {
			f.error(e, { id: l });
		} finally {
			y(!1);
		}
	}, x = g.data?.missing ?? [], S = _.data?.canTranslate ?? !1;
	return /* @__PURE__ */ p(d, {
		trigger: /* @__PURE__ */ p(u, {
			variant: "ghost",
			size: "sm",
			icon: "translate",
			loading: v,
			title: a("Languages"),
			children: r.locale.toUpperCase()
		}),
		items: [
			{
				label: a("Languages"),
				heading: !0
			},
			...(g.data?.versions ?? []).map((t) => ({
				label: t.status === "published" || t.status === "changed" ? e(t.locale) : a("{language} · draft", { language: e(t.locale) }),
				checked: t.id === r.id,
				onSelect: () => t.id !== r.id && n(`/content/${c.handle}/${t.id}`)
			})),
			x.length > 0 && {
				separator: !0,
				label: ""
			},
			...x.flatMap((t) => [S && {
				label: a("Translate into {language}", { language: e(t.locale) }),
				icon: "sparkle",
				onSelect: () => b(t.locale, !0)
			}, {
				label: S ? a("Copy for Manual Translation ({code})", { code: t.locale.toUpperCase() }) : a("Add {language} Version", { language: e(t.locale) }),
				icon: "copy",
				onSelect: () => b(t.locale, !1)
			}])
		]
	});
}
r.widgets.set("languages-coverage", c(() => import("./chunks/WidgetCoverage-CNgootd3.js"))), r.panels.set("languages-menu", {
	slot: "entry.toolbar",
	component: m,
	order: 5
}), r.components.set("languages/add-language", c(() => import("./chunks/AddLanguage-CQF0kaRT.js")));
