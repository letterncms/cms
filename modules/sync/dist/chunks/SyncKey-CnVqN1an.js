import { t as e, useAbility as t } from "@letterncms/sdk";
import { useState as n } from "react";
import { Button as r, IconButton as i, Input as a, SettingRow as o, SettingsPanel as s, Skeleton as c, copyText as l } from "@letterncms/ui";
import { jsx as u, jsxs as d } from "react/jsx-runtime";
// admin/src/SyncKey.tsx
function f() {
	let f = t("sync/overview"), [p, m] = n(!1), h = f.data?.site.key, g = h?.replace(/#.*/, "#" + "•".repeat(16)), _ = async () => {
		h && !await l(h, {
			copied: e("Copied. Paste it under Sync on the other site."),
			failed: null
		}) && m(!0);
	};
	return /* @__PURE__ */ u(s, { children: /* @__PURE__ */ u(o, { children: h ? /* @__PURE__ */ d("div", {
		className: "flex items-center gap-2",
		children: [
			/* @__PURE__ */ u("div", {
				className: "min-w-0 flex-1",
				children: p ? /* @__PURE__ */ u(a, {
					readOnly: !0,
					autoFocus: !0,
					value: h,
					"aria-label": e("Connection key"),
					className: "w-full font-mono text-xs",
					onFocus: (e) => e.currentTarget.select()
				}) : /* @__PURE__ */ u("div", {
					"aria-label": e("Connection key"),
					className: "flex h-8 items-center truncate rounded-sm border border-border bg-bg px-2.5 font-mono text-xs",
					children: /* @__PURE__ */ u("span", {
						className: "truncate",
						children: g
					})
				})
			}),
			/* @__PURE__ */ u(i, {
				icon: p ? "eye-off" : "eye",
				label: e(p ? "Hide" : "Show"),
				onClick: () => m(!p)
			}),
			/* @__PURE__ */ u(r, {
				icon: "copy",
				onClick: () => void _(),
				children: e("Copy")
			})
		]
	}) : /* @__PURE__ */ u(c, { className: "h-8" }) }) });
}
export { f as default };
