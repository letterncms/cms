import { r as e } from "./chunks/names-LPlgZyYe.js";
import { invalidate as t, navigate as n, registry as r, run as i, t as a, useAbility as o, useManifest as s } from "@letterncms/sdk";
import { lazy as c, useState as l } from "react";
import { LanguagePicker as u, toast as d } from "@letterncms/ui";
import { jsx as f } from "react/jsx-runtime";
// admin/src/LanguageMenu.tsx
function p({ entry: r, collection: c, save: p }) {
	let m = s().site.locales.length > 1, h = o("translations/list", { id: r?.id ?? "" }, { enabled: m && !!r }), g = o("languages/list", {}, {
		enabled: m && !!r,
		staleTime: 6e4
	}), [_, v] = l(!1);
	if (!r || !m) return null;
	let y = async (o, s) => {
		v(!0);
		let l = d.loading(a(s ? "Translating into {language}…" : "Creating the {language} version…", { language: e(o) }));
		try {
			await p().catch(() => {});
			let e = await i("translations/create", {
				id: r.id,
				locale: o,
				translate: s
			});
			t("translations/", "entries/", "content/"), d.success(a(s ? "Translated as a draft" : "Copy created as a draft"), {
				id: l,
				description: a(s ? "Review it, then publish." : "Translate the text, then publish.")
			}), n(`/content/${c.handle}/${e.id}`);
		} catch (e) {
			d.error(e, { id: l });
		} finally {
			v(!1);
		}
	}, b = h.data?.missing ?? [], x = g.data?.canTranslate ?? !1, S = h.data?.versions ?? [{
		id: r.id,
		locale: r.locale,
		status: r.status
	}], C = new Set(S.filter((e) => e.status !== "published" && e.status !== "changed").map((e) => e.locale));
	return /* @__PURE__ */ f(u, {
		value: r.locale,
		loading: _,
		languages: S.map((e) => ({
			code: e.locale,
			note: C.has(e.locale) ? a("Draft") : void 0
		})),
		onChange: (e) => {
			let t = S.find((t) => t.locale === e);
			t && n(`/content/${c.handle}/${t.id}`);
		},
		more: b.flatMap((t) => [x && {
			label: a("Translate into {language}", { language: e(t.locale) }),
			icon: "sparkle",
			onSelect: () => y(t.locale, !0)
		}, {
			label: x ? a("Copy for Manual Translation ({code})", { code: t.locale.toUpperCase() }) : a("Add {language} Version", { language: e(t.locale) }),
			icon: "copy",
			onSelect: () => y(t.locale, !1)
		}])
	});
}
r.widgets.set("languages-coverage", c(() => import("./chunks/WidgetCoverage-CNgootd3.js"))), r.panels.set("languages-menu", {
	slot: "entry.toolbar",
	component: p,
	order: 5
}), r.components.set("languages/add-language", c(() => import("./chunks/AddLanguage-CFl01gZK.js")));
