import { c as e, i as t } from "./kinds-BDpWzonQ.js";
import { Link as n, can as r, invalidate as i, plural as a, t as o, useAbility as s } from "@letterncms/sdk";
import { useState as c } from "react";
import { Fields as l, Icon as u, Skeleton as d, Widget as f, cn as p, drawing as m, toast as h } from "@letterncms/ui";
import { jsx as g, jsxs as _ } from "react/jsx-runtime";
// admin/src/WidgetRecent.tsx
function v() {
	let v = s("media/list", { perPage: 6 }), [y, b] = c(!1), x = async (t) => {
		if (!t?.length) return;
		b(!0);
		let n = h.loading(a(t.length, "Uploading {count} file…", "Uploading {count} files…")), r = (await Promise.allSettled(t.map((t) => e(t)))).find((e) => e.status === "rejected");
		i("media/"), b(!1), r ? h.error(r.reason, { id: n }) : h.success(a(t.length, "Uploaded", "{count} files uploaded"), { id: n });
	};
	return /* @__PURE__ */ g(f, {
		query: v,
		action: {
			label: o("All Media"),
			to: "/media"
		},
		skeleton: /* @__PURE__ */ g("div", {
			className: "grid grid-cols-3 gap-2 @md:grid-cols-6",
			children: Array.from({ length: 6 }).map((e, t) => /* @__PURE__ */ g(d, { className: "aspect-square rounded-sm" }, t))
		}),
		empty: v.data?.items.length === 0 && {
			icon: "media",
			title: o("No uploads yet"),
			action: r("media.upload") && /* @__PURE__ */ g(l, {
				bare: !0,
				fields: [{
					handle: "files",
					type: "json",
					component: "media-upload",
					label: o("Upload"),
					multiple: !0
				}],
				values: {},
				onChange: (e, t) => void x(t),
				disabled: y
			})
		},
		children: /* @__PURE__ */ g("div", {
			className: "grid grid-cols-3 gap-2 @md:grid-cols-6",
			children: v.data?.items.map((e) => /* @__PURE__ */ g(n, {
				to: "/media",
				title: e.name,
				className: "group relative block aspect-square overflow-hidden rounded-sm border border-border bg-surface",
				children: e.thumb ? /* @__PURE__ */ g("img", {
					src: e.thumb,
					alt: e.alt ?? "",
					loading: "lazy",
					className: p("size-full transition-opacity duration-base group-hover:opacity-85", m(e.thumb) ? "object-contain p-2" : "object-cover")
				}) : /* @__PURE__ */ _("span", {
					className: "flex size-full flex-col items-center justify-center gap-1 px-1.5 text-faint transition-colors duration-base group-hover:bg-hover",
					children: [/* @__PURE__ */ g(u, {
						name: t[e.kind] ?? "file",
						size: 18
					}), /* @__PURE__ */ g("span", {
						className: "w-full truncate text-center text-2xs",
						children: e.filename
					})]
				})
			}, e.id))
		})
	});
}
export { v as default };
