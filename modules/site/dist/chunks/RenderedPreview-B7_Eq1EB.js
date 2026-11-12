import { requestText as e, t } from "@letterncms/sdk";
import { useEffect as n, useState as r } from "react";
import { Button as i, Dialog as a, Fields as o, QueryError as s, Spinner as c, deviceWidths as l } from "@letterncms/ui";
import { jsx as u, jsxs as d } from "react/jsx-runtime";
// admin/src/RenderedPreview.tsx
function f({ entry: f, collection: p, content: m, onClose: h }) {
	let [g, _] = r("desktop"), [v, y] = r(""), [b, x] = r(null), [S, C] = r(0), [w, T] = r(!0);
	return n(() => {
		let t = new AbortController();
		return T(!0), e("POST", f ? `/__preview/${f.id}` : "/__preview", {
			...m,
			collection: p,
			play: !0
		}, { signal: t.signal }).then(({ text: e }) => {
			if (!t.signal.aborted) {
				let t = document.querySelector("script[nonce]")?.nonce;
				y(t ? e.replace(/<script\b(?![^>]*\bnonce=)/gi, `<script nonce="${t}"`) : e), x(null);
			}
		}).catch((e) => {
			t.signal.aborted || x(e instanceof Error ? e.message : String(e));
		}).finally(() => {
			t.signal.aborted || T(!1);
		}), () => t.abort();
	}, [
		f?.id,
		p,
		m,
		S
	]), /* @__PURE__ */ d(a, {
		open: !0,
		onOpenChange: (e) => !e && h(),
		title: t("Preview"),
		size: "xl",
		className: "!top-[3vh] !max-h-[94vh] !max-w-[calc(100vw-32px)]",
		footer: /* @__PURE__ */ u(i, {
			onClick: h,
			children: t("Close")
		}),
		children: [/* @__PURE__ */ u(o, {
			bare: !0,
			layout: "inline",
			fields: [{
				handle: "device",
				type: "select",
				display: "segmented",
				label: t("Viewport"),
				required: !0,
				options: {
					desktop: t("Desktop"),
					tablet: t("Tablet"),
					mobile: t("Phone")
				}
			}],
			values: { device: g },
			onChange: (e, t) => t && _(t)
		}), b ? /* @__PURE__ */ u(s, {
			message: b,
			onRetry: () => C(S + 1)
		}) : /* @__PURE__ */ d("div", {
			className: "relative mt-3 flex h-[68vh] overflow-auto bg-sunken p-2",
			children: [w && /* @__PURE__ */ u("div", {
				className: "absolute inset-0 z-raised grid place-items-center bg-bg/70",
				children: /* @__PURE__ */ u(c, {})
			}), /* @__PURE__ */ u("iframe", {
				title: t("Site preview"),
				srcDoc: v,
				sandbox: "allow-same-origin allow-scripts allow-forms allow-popups",
				className: "mx-auto h-full shrink-0 border-0 bg-white",
				style: { width: g === "mobile" ? l.phone : g === "tablet" ? l.tablet : "100%" }
			})]
		})]
	});
}
export { f as RenderedPreview };
