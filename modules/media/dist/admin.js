import { n as e, r as t, t as n } from "./chunks/upload-CUTK6dbQ.js";
import { t as r } from "./chunks/Library-CYwMGA4g.js";
import { can as i, registry as a, run as o, t as s, useAbility as c } from "@letterncms/sdk";
import { lazy as l, useEffect as u, useRef as d, useState as f } from "react";
import { Button as p, Dialog as m, Icon as h, IconButton as g, cn as _ } from "@letterncms/ui";
import { Fragment as v, jsx as y, jsxs as b } from "react/jsx-runtime";
// admin/src/fields.tsx
function x({ field: e, onChange: t, disabled: n }) {
	let r = d(null);
	u(() => {
		e.autofocus && r.current?.click();
	}, []);
	let i = /* @__PURE__ */ y("input", {
		ref: r,
		type: "file",
		multiple: !!e.multiple,
		accept: e.accept || void 0,
		disabled: n,
		className: "hidden",
		onChange: (e) => {
			e.target.files?.length && t(Array.from(e.target.files)), e.target.value = "";
		}
	});
	return /* @__PURE__ */ b(v, { children: [i, /* @__PURE__ */ y(p, {
		size: "sm",
		variant: e.variant === "primary" ? "primary" : "secondary",
		icon: "upload",
		disabled: n,
		onClick: () => r.current?.click(),
		children: e.label
	})] });
}
// admin/src/MediaField.tsx
function S({ field: e, value: t, onChange: n, disabled: i }) {
	let a = (Array.isArray(t) ? t : typeof t == "string" && t ? [t] : []).filter(Boolean), o = e.max || Infinity, l = e.accept || "image/*", [u, d] = f(!1), [x, S] = f(a), C = c("media/get-many", { ids: a.filter((e) => !e.startsWith("/") && !e.startsWith("http")) }, { enabled: a.length > 0 }), w = new Map((C.data?.items ?? []).map((e) => [e.id, e]));
	return /* @__PURE__ */ b("div", { children: [
		/* @__PURE__ */ y("div", {
			className: _("flex flex-wrap gap-2", a.length === 0 && "hidden"),
			children: a.map((e) => {
				let t = w.get(e), r = e.startsWith("/") || e.startsWith("http");
				return /* @__PURE__ */ b("div", {
					className: "group relative size-24 overflow-hidden rounded-md border border-border bg-sunken",
					children: [
						t?.thumb || r ? /* @__PURE__ */ y("img", {
							src: t?.thumb ?? e,
							alt: t?.alt ?? "",
							className: "h-full w-full object-cover"
						}) : /* @__PURE__ */ y("div", {
							className: "grid h-full place-items-center text-muted",
							children: /* @__PURE__ */ y(h, {
								name: "file",
								size: 20
							})
						}),
						!i && /* @__PURE__ */ y(g, {
							icon: "close",
							label: s("Remove"),
							size: "xs",
							variant: "secondary",
							className: "absolute right-1 top-1 opacity-0 group-hover:opacity-100",
							onClick: () => n(a.filter((t) => t !== e))
						}),
						t && t.kind === "image" && !t.alt && /* @__PURE__ */ y("span", {
							className: "absolute bottom-1 left-1 rounded-xs bg-warning px-1 text-2xs font-medium text-white",
							title: s("No alt text"),
							children: "ALT"
						})
					]
				}, e);
			})
		}),
		a.length < o && /* @__PURE__ */ y(p, {
			size: "sm",
			icon: l.startsWith("image") ? "image" : "upload",
			disabled: i,
			className: a.length ? "mt-2" : "",
			onClick: () => {
				S(a), d(!0);
			},
			children: a.length ? s("Add More") : o === 1 ? l.startsWith("image") ? s("Choose Image") : s("Choose File") : s("Choose Files")
		}),
		/* @__PURE__ */ y(m, {
			open: u,
			onOpenChange: d,
			size: "xl",
			title: o === 1 ? l.startsWith("image") ? s("Choose Image") : s("Choose File") : s("Choose Files"),
			className: "!top-[6vh] !max-h-[88vh]",
			footer: /* @__PURE__ */ b(v, { children: [
				/* @__PURE__ */ y("span", {
					className: "mr-auto text-xs text-faint",
					children: s("{count} selected", { count: x.length })
				}),
				/* @__PURE__ */ y(p, {
					onClick: () => d(!1),
					children: s("Cancel")
				}),
				/* @__PURE__ */ y(p, {
					variant: "primary",
					disabled: x.length === 0,
					onClick: () => {
						n(x.slice(0, o === Infinity ? void 0 : o)), d(!1);
					},
					children: x.length > 1 ? s("Use {count} Files", { count: x.length }) : s("Use File")
				})
			] }),
			children: /* @__PURE__ */ y("div", {
				className: "min-h-[40vh]",
				children: /* @__PURE__ */ y(r, {
					mode: "pick",
					accept: l,
					multiple: o > 1,
					selected: x,
					onSelectionChange: (e) => {
						S(e), o === 1 && e.length === 1 && e[0] !== a[0] && (n(e), d(!1));
					}
				})
			})
		})
	] });
}
// admin/src/UploadAction.tsx
function C({ close: e }) {
	let r = d(null);
	return u(() => {
		let t = r.current;
		if (!t) return;
		let n = () => e?.();
		return t.addEventListener("cancel", n), t.click(), () => t.removeEventListener("cancel", n);
	}, []), /* @__PURE__ */ y("input", {
		ref: r,
		type: "file",
		multiple: !0,
		className: "hidden",
		onChange: (r) => {
			let i = Array.from(r.target.files ?? []);
			e?.(), i.length && t(i, n.current);
		}
	});
}
a.fields.set("media", S), a.fields.set("media-upload", x), a.components.set("media/library", l(() => import("./chunks/MediaLibrary-CMarZupa.js"))), a.components.set("media/upload", C), a.widgets.set("media-recent", l(() => import("./chunks/WidgetRecent-DtvMdjxg.js"))), a.composer.set("media", {
	trigger: "@",
	label: s("Media"),
	order: 20,
	search: async (e) => {
		if (!i("media.view")) return [];
		let { items: t } = await o("media/list", {
			search: e,
			perPage: 5
		});
		return t.map((e) => ({
			id: `media:${e.id}`,
			kind: "file",
			label: e.name,
			icon: e.kind === "image" ? "image" : "file",
			to: "/media",
			read: () => e
		}));
	}
});
export { r as Library, S as MediaField, e as upload };
