import { locale as e, t, xsrfToken as n } from "@letterncms/sdk";
import { useEffect as r, useState as i } from "react";
import { Button as a, Dialog as o, Fields as s, QueryError as c, Spinner as l } from "@letterncms/ui";
import { jsx as u, jsxs as d } from "react/jsx-runtime";
// admin/src/RenderedPreview.tsx
function f({ entry: f, collection: p, content: m, onClose: h }) {
	let [g, _] = i("desktop"), [v, y] = i(""), [b, x] = i(null), [S, C] = i(0), [w, T] = i(!0);
	return r(() => {
		let r = new AbortController();
		return T(!0), fetch(f ? `/__preview/${f.id}` : "/__preview", {
			method: "POST",
			credentials: "same-origin",
			signal: r.signal,
			headers: {
				"Content-Type": "application/json",
				Accept: "text/html",
				"X-XSRF-TOKEN": n() ?? "",
				"X-Cms-Locale": e()
			},
			body: JSON.stringify({
				...m,
				collection: p,
				play: !0
			})
		}).then(async (e) => {
			let n = await e.text();
			if (!e.ok) throw Error(t("Preview failed ({status})", { status: e.status }));
			return n;
		}).then((e) => {
			if (!r.signal.aborted) {
				let t = document.querySelector("script[nonce]")?.nonce;
				y(t ? e.replace(/<script\b(?![^>]*\bnonce=)/gi, `<script nonce="${t}"`) : e), x(null);
			}
		}).catch((e) => {
			r.signal.aborted || x(e instanceof Error ? e.message : String(e));
		}).finally(() => {
			r.signal.aborted || T(!1);
		}), () => r.abort();
	}, [
		f?.id,
		p,
		m,
		S
	]), /* @__PURE__ */ d(o, {
		open: !0,
		onOpenChange: (e) => !e && h(),
		title: t("Preview"),
		size: "xl",
		className: "!top-[3vh] !max-h-[94vh] !max-w-[calc(100vw-32px)]",
		footer: /* @__PURE__ */ u(a, {
			onClick: h,
			children: t("Close")
		}),
		children: [/* @__PURE__ */ u(s, {
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
		}), b ? /* @__PURE__ */ u(c, {
			message: b,
			onRetry: () => C(S + 1)
		}) : /* @__PURE__ */ d("div", {
			className: "relative mt-3 flex h-[68vh] overflow-auto bg-sunken p-2",
			children: [w && /* @__PURE__ */ u("div", {
				className: "absolute inset-0 z-10 grid place-items-center bg-bg/70",
				children: /* @__PURE__ */ u(l, {})
			}), /* @__PURE__ */ u("iframe", {
				title: t("Site preview"),
				srcDoc: v,
				sandbox: "allow-same-origin allow-scripts allow-forms allow-popups",
				className: "mx-auto h-full shrink-0 border-0 bg-white",
				style: { width: g === "mobile" ? 390 : g === "tablet" ? 820 : "100%" }
			})]
		})]
	});
}
export { f as RenderedPreview };
