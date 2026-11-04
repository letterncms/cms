import { r as e } from "./upload-D0UQvMEf.js";
import { Link as t, can as n, invalidate as r, plural as i, t as a, useAbility as o } from "@letterncms/sdk";
import { useState as s } from "react";
import { Fields as c, Icon as l, Skeleton as u, Widget as d, toast as f } from "@letterncms/ui";
import { jsx as p, jsxs as m } from "react/jsx-runtime";
// admin/src/WidgetRecent.tsx
var h = {
	image: "image",
	video: "video",
	audio: "play",
	pdf: "file-text",
	file: "file"
};
function g() {
	let g = o("media/list", { perPage: 6 }), [_, v] = s(!1), y = async (t) => {
		if (!t?.length) return;
		v(!0);
		let n = f.loading(i(t.length, "Uploading {count} file…", "Uploading {count} files…")), a = (await Promise.allSettled(t.map((t) => e(t)))).find((e) => e.status === "rejected");
		r("media/"), v(!1), a ? f.error(a.reason, { id: n }) : f.success(i(t.length, "Uploaded", "{count} files uploaded"), { id: n });
	};
	return /* @__PURE__ */ p(d, {
		query: g,
		action: {
			label: a("All Media"),
			to: "/media"
		},
		skeleton: /* @__PURE__ */ p("div", {
			className: "grid grid-cols-3 gap-2 @md:grid-cols-6",
			children: Array.from({ length: 6 }).map((e, t) => /* @__PURE__ */ p(u, { className: "aspect-square rounded-sm" }, t))
		}),
		empty: g.data?.items.length === 0 && {
			icon: "media",
			title: a("No uploads yet"),
			action: n("media.upload") && /* @__PURE__ */ p(c, {
				bare: !0,
				fields: [{
					handle: "files",
					type: "json",
					component: "media-upload",
					label: a("Upload"),
					multiple: !0
				}],
				values: {},
				onChange: (e, t) => void y(t),
				disabled: _
			})
		},
		children: /* @__PURE__ */ p("div", {
			className: "grid grid-cols-3 gap-2 @md:grid-cols-6",
			children: g.data?.items.map((e) => /* @__PURE__ */ p(t, {
				to: "/media",
				title: e.name,
				className: "group relative block aspect-square overflow-hidden rounded-sm border border-border bg-surface",
				children: e.thumb ? /* @__PURE__ */ p("img", {
					src: e.thumb,
					alt: e.alt ?? "",
					loading: "lazy",
					className: "size-full object-cover transition-opacity duration-120 group-hover:opacity-85"
				}) : /* @__PURE__ */ m("span", {
					className: "flex size-full flex-col items-center justify-center gap-1 px-1.5 text-faint transition-colors duration-120 group-hover:bg-hover",
					children: [/* @__PURE__ */ p(l, {
						name: h[e.kind] ?? "file",
						size: 18
					}), /* @__PURE__ */ p("span", {
						className: "w-full truncate text-center text-2xs",
						children: e.filename
					})]
				})
			}, e.id))
		})
	});
}
export { g as default };
