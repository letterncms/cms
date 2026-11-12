import { c as e, i as t } from "./kinds-BDpWzonQ.js";
import { Link as n, can as r, invalidate as i, plural as a, t as o, useAbility as s } from "@letterncms/sdk";
import { useState as c } from "react";
import { Fields as l, Icon as u, Skeleton as d, Widget as f, toast as p } from "@letterncms/ui";
import { jsx as m, jsxs as h } from "react/jsx-runtime";
// admin/src/WidgetRecent.tsx
function g() {
	let g = s("media/list", { perPage: 6 }), [_, v] = c(!1), y = async (t) => {
		if (!t?.length) return;
		v(!0);
		let n = p.loading(a(t.length, "Uploading {count} file…", "Uploading {count} files…")), r = (await Promise.allSettled(t.map((t) => e(t)))).find((e) => e.status === "rejected");
		i("media/"), v(!1), r ? p.error(r.reason, { id: n }) : p.success(a(t.length, "Uploaded", "{count} files uploaded"), { id: n });
	};
	return /* @__PURE__ */ m(f, {
		query: g,
		action: {
			label: o("All Media"),
			to: "/media"
		},
		skeleton: /* @__PURE__ */ m("div", {
			className: "grid grid-cols-3 gap-2 @md:grid-cols-6",
			children: Array.from({ length: 6 }).map((e, t) => /* @__PURE__ */ m(d, { className: "aspect-square rounded-sm" }, t))
		}),
		empty: g.data?.items.length === 0 && {
			icon: "media",
			title: o("No uploads yet"),
			action: r("media.upload") && /* @__PURE__ */ m(l, {
				bare: !0,
				fields: [{
					handle: "files",
					type: "json",
					component: "media-upload",
					label: o("Upload"),
					multiple: !0
				}],
				values: {},
				onChange: (e, t) => void y(t),
				disabled: _
			})
		},
		children: /* @__PURE__ */ m("div", {
			className: "grid grid-cols-3 gap-2 @md:grid-cols-6",
			children: g.data?.items.map((e) => /* @__PURE__ */ m(n, {
				to: "/media",
				title: e.name,
				className: "group relative block aspect-square overflow-hidden rounded-sm border border-border bg-surface",
				children: e.thumb ? /* @__PURE__ */ m("img", {
					src: e.thumb,
					alt: e.alt ?? "",
					loading: "lazy",
					className: "size-full object-cover transition-opacity duration-base group-hover:opacity-85"
				}) : /* @__PURE__ */ h("span", {
					className: "flex size-full flex-col items-center justify-center gap-1 px-1.5 text-faint transition-colors duration-base group-hover:bg-hover",
					children: [/* @__PURE__ */ m(u, {
						name: t[e.kind] ?? "file",
						size: 18
					}), /* @__PURE__ */ m("span", {
						className: "w-full truncate text-center text-2xs",
						children: e.filename
					})]
				})
			}, e.id))
		})
	});
}
export { g as default };
