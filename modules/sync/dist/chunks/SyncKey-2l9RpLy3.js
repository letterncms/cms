import { t as e, useAbility as t } from "@letterncms/sdk";
import { useState as n } from "react";
import { Button as r, IconButton as i, Input as a, SettingRow as o, SettingsPanel as s, Skeleton as c, copyText as l, selectFieldTextOnClick as u } from "@letterncms/ui";
import { jsx as d, jsxs as f } from "react/jsx-runtime";
// admin/src/SyncKey.tsx
function p() {
	let p = t("sync/overview"), [m, h] = n(!1), g = p.data?.site.key, _ = g?.replace(/#.*/, "#" + "•".repeat(16)), v = async () => {
		g && !await l(g, {
			copied: e("Copied. Paste it under Sync on the other site."),
			failed: null
		}) && h(!0);
	};
	return /* @__PURE__ */ d(s, { children: /* @__PURE__ */ d(o, { children: g ? /* @__PURE__ */ f("div", {
		className: "flex items-center gap-2",
		children: [
			/* @__PURE__ */ d(a, {
				readOnly: !0,
				autoFocus: m,
				value: m ? g : _,
				"aria-label": e("Connection key"),
				className: "min-w-0 flex-1 font-mono [&>input]:text-xs",
				onFocus: m ? (e) => e.currentTarget.select() : void 0,
				onClick: u
			}, m ? "shown" : "masked"),
			/* @__PURE__ */ d(i, {
				icon: m ? "eye-off" : "eye",
				label: e(m ? "Hide" : "Show"),
				onClick: () => h(!m)
			}),
			/* @__PURE__ */ d(r, {
				icon: "copy",
				onClick: () => void v(),
				children: e("Copy")
			})
		]
	}) : /* @__PURE__ */ d(c, { className: "h-8" }) }) });
}
export { p as default };
