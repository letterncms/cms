import { t as e, useAbility as t } from "@letterncms/sdk";
import { useState as n } from "react";
import { Button as r, Input as i, Skeleton as a, copyText as o } from "@letterncms/ui";
import { jsx as s, jsxs as c } from "react/jsx-runtime";
// admin/src/SyncKey.tsx
function l() {
	let l = t("sync/overview"), [u, d] = n(!1), f = l.data?.site.key;
	if (!f) return /* @__PURE__ */ s(a, { className: "h-8" });
	let p = f.replace(/#.*/, "#" + "•".repeat(16)), m = async () => {
		await o(f, {
			copied: e("Copied. Paste it under Sync on the other site."),
			failed: null
		}) || d(!0);
	};
	return /* @__PURE__ */ c("div", {
		className: "flex items-center gap-2",
		children: [
			/* @__PURE__ */ s("div", {
				className: "min-w-0 flex-1",
				children: u ? /* @__PURE__ */ s(i, {
					readOnly: !0,
					autoFocus: !0,
					value: f,
					"aria-label": e("Connection key"),
					className: "w-full font-mono text-xs",
					onFocus: (e) => e.currentTarget.select()
				}) : /* @__PURE__ */ s("div", {
					"aria-label": e("Connection key"),
					className: "flex h-8 items-center truncate rounded-sm border border-border bg-bg px-2.5 font-mono text-xs text-muted",
					children: p
				})
			}),
			/* @__PURE__ */ s(r, {
				icon: u ? "eye-off" : "eye",
				onClick: () => d(!u),
				"aria-label": e(u ? "Hide" : "Show")
			}),
			/* @__PURE__ */ s(r, {
				icon: "copy",
				onClick: () => void m(),
				children: e("Copy")
			})
		]
	});
}
export { l as default };
