import { c as e, i as t } from "./kinds-BDpWzonQ.js";
import { Link as n, can as r, invalidate as i, plural as a, t as o, useAbility as s } from "@letterncms/sdk";
import { useState as c } from "react";
import { Fields as l, Icon as u, Skeleton as d, Tooltip as f, Widget as p, cn as m, drawing as h, toast as g } from "@letterncms/ui";
import { jsx as _, jsxs as v } from "react/jsx-runtime";
// admin/src/WidgetRecent.tsx
function y() {
	let y = s("media/list", { perPage: 6 }), [b, x] = c(!1), S = async (t) => {
		if (!t?.length) return;
		x(!0);
		let n = g.loading(a(t.length, "Uploading {count} file…", "Uploading {count} files…")), r = (await Promise.allSettled(t.map((t) => e(t)))).find((e) => e.status === "rejected");
		i("media/"), x(!1), r ? g.error(r.reason, { id: n }) : g.success(a(t.length, "Uploaded", "{count} files uploaded"), { id: n });
	};
	return /* @__PURE__ */ _(p, {
		query: y,
		action: {
			label: o("All Media"),
			to: "/media"
		},
		skeleton: /* @__PURE__ */ _("div", {
			className: "grid grid-cols-3 gap-2 @md:grid-cols-6",
			children: Array.from({ length: 6 }).map((e, t) => /* @__PURE__ */ _(d, { className: "aspect-square rounded-sm" }, t))
		}),
		empty: y.data?.items.length === 0 && {
			icon: "media",
			title: o("No uploads yet"),
			action: r("media.upload") && /* @__PURE__ */ _(l, {
				bare: !0,
				fields: [{
					handle: "files",
					type: "json",
					component: "media-upload",
					label: o("Upload"),
					multiple: !0
				}],
				values: {},
				onChange: (e, t) => void S(t),
				disabled: b
			})
		},
		children: /* @__PURE__ */ _("div", {
			className: "grid grid-cols-3 gap-2 @md:grid-cols-6",
			children: y.data?.items.map((e) => /* @__PURE__ */ _(f, {
				content: e.name,
				children: /* @__PURE__ */ _(n, {
					to: "/media",
					"aria-label": e.name,
					className: "group relative block aspect-square overflow-hidden rounded-sm border border-border bg-surface",
					children: e.thumb ? /* @__PURE__ */ _("img", {
						src: e.thumb,
						alt: e.alt ?? "",
						loading: "lazy",
						className: m("size-full transition-opacity duration-base group-hover:opacity-85", h(e.thumb) ? "object-contain p-2" : "object-cover")
					}) : /* @__PURE__ */ v("span", {
						className: "flex size-full flex-col items-center justify-center gap-1 px-1.5 text-faint transition-colors duration-base group-hover:bg-hover",
						children: [/* @__PURE__ */ _(u, {
							name: t[e.kind] ?? "file",
							size: 18
						}), /* @__PURE__ */ _("span", {
							className: "w-full truncate text-center text-2xs",
							children: e.filename
						})]
					})
				})
			}, e.id))
		})
	});
}
export { y as default };
