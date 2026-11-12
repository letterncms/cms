import { n as e, t } from "./chunks/Library-CBb4ucy1.js";
import { c as n, i as r, l as i, s as a, t as o } from "./chunks/kinds-BDpWzonQ.js";
import { can as s, plural as c, registry as l, run as u, t as d, useAbility as f } from "@letterncms/sdk";
import { lazy as p, useEffect as m, useRef as h, useState as g } from "react";
import { Button as _, Dialog as v, Icon as y, IconButton as b, cn as x, drawing as S } from "@letterncms/ui";
import { Fragment as C, jsx as w, jsxs as T } from "react/jsx-runtime";
// admin/src/fields.tsx
function E({ field: e, onChange: t, disabled: n }) {
	let r = h(null);
	m(() => {
		e.autofocus && r.current?.click();
	}, []);
	let i = /* @__PURE__ */ w("input", {
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
	return /* @__PURE__ */ T(C, { children: [i, /* @__PURE__ */ w(_, {
		size: "sm",
		variant: e.variant === "primary" ? "primary" : "secondary",
		icon: "upload",
		disabled: n,
		onClick: () => r.current?.click(),
		children: e.label
	})] });
}
// admin/src/MediaField.tsx
function D({ field: e, value: n, onChange: r, disabled: i }) {
	let a = (Array.isArray(n) ? n : typeof n == "string" && n ? [n] : []).filter(Boolean), s = e.max || Infinity, l = e.accept || "image/*", u = l.startsWith("image"), [p, m] = g(!1), [h, E] = g(a), D = f("media/get-many", { ids: a.filter((e) => !e.startsWith("/") && !e.startsWith("http")) }, { enabled: a.length > 0 }), O = new Map((D.data?.items ?? []).map((e) => [e.id, e]));
	return /* @__PURE__ */ T("div", { children: [
		/* @__PURE__ */ w("div", {
			className: x("flex flex-wrap gap-2", a.length === 0 && "hidden"),
			children: a.map((e) => {
				let t = O.get(e), n = e.startsWith("/") || e.startsWith("http");
				return /* @__PURE__ */ T("div", {
					className: "cms-reveal-row relative size-24 overflow-hidden rounded-md border border-border bg-sunken",
					children: [
						t?.thumb || n ? /* @__PURE__ */ w("img", {
							src: t?.thumb ?? e,
							alt: t?.alt ?? "",
							className: x("h-full w-full", S(t?.thumb ?? e) ? "object-contain p-1" : "object-cover")
						}) : t ? /* @__PURE__ */ w(o, {
							item: t,
							size: 20
						}) : /* @__PURE__ */ w("div", {
							className: "grid h-full place-items-center text-muted",
							children: /* @__PURE__ */ w(y, {
								name: "file",
								size: 20
							})
						}),
						!i && /* @__PURE__ */ w(b, {
							icon: "close",
							label: d("Remove"),
							size: "xs",
							variant: "secondary",
							className: "cms-reveal absolute right-1 top-1",
							onClick: () => r(a.filter((t) => t !== e))
						}),
						t && t.kind === "image" && !t.alt && /* @__PURE__ */ w("span", {
							className: "absolute bottom-1 left-1 rounded-xs bg-warning px-1 text-2xs font-medium text-white",
							title: d("No alt text"),
							children: "ALT"
						})
					]
				}, e);
			})
		}),
		a.length < s && /* @__PURE__ */ w(_, {
			size: "sm",
			icon: u ? "image" : "upload",
			disabled: i,
			className: a.length ? "mt-2" : "",
			onClick: () => {
				E(a), m(!0);
			},
			children: a.length ? d("Add More") : d(s === 1 ? u ? "Choose Image" : "Choose File" : u ? "Choose Images" : "Choose Files")
		}),
		/* @__PURE__ */ w(v, {
			open: p,
			onOpenChange: m,
			size: "xl",
			title: d(s === 1 ? u ? "Choose Image" : "Choose File" : u ? "Choose Images" : "Choose Files"),
			className: "sm:!top-[6vh] sm:!max-h-[88vh]",
			footer: /* @__PURE__ */ T(C, { children: [
				s !== 1 && /* @__PURE__ */ w("span", {
					className: "mr-auto text-xs text-faint max-sm:hidden",
					children: d("{count} selected", { count: h.length })
				}),
				/* @__PURE__ */ w(_, {
					onClick: () => m(!1),
					children: d("Cancel")
				}),
				s !== 1 && /* @__PURE__ */ w(_, {
					variant: "primary",
					disabled: h.length === 0,
					onClick: () => {
						r(h.slice(0, s === Infinity ? void 0 : s)), m(!1);
					},
					children: u ? c(h.length || 1, "Use Image", "Use {count} Images") : c(h.length || 1, "Use File", "Use {count} Files")
				})
			] }),
			children: /* @__PURE__ */ w("div", {
				className: "min-h-[40vh]",
				children: /* @__PURE__ */ w(t, {
					mode: "pick",
					accept: l,
					except: typeof e.except == "string" ? e.except : void 0,
					multiple: s > 1,
					selected: h,
					onSelectionChange: (e) => {
						E(e), s === 1 && e.length === 1 && (r(e), m(!1));
					}
				})
			})
		})
	] });
}
// admin/src/UploadAction.tsx
function O({ close: e }) {
	let t = h(null);
	return m(() => {
		let n = t.current;
		if (!n) return;
		let r = () => e?.();
		return n.addEventListener("cancel", r), n.click(), () => n.removeEventListener("cancel", r);
	}, []), /* @__PURE__ */ w("input", {
		ref: t,
		type: "file",
		multiple: !0,
		className: "hidden",
		onChange: (t) => {
			let n = Array.from(t.target.files ?? []);
			e?.(), n.length && i(n, a.current);
		}
	});
}
l.fields.set("media", D), l.fields.set("media-upload", E), l.components.set("media/library", p(() => import("./chunks/MediaLibrary-KC-g38zm.js"))), l.components.set("media/upload", O), l.components.set("media/new-folder", e), l.widgets.set("media-recent", p(() => import("./chunks/WidgetRecent-BDdXGmdU.js"))), l.composer.set("media", {
	trigger: "@",
	label: d("Media"),
	order: 20,
	search: async (e) => {
		if (!s("media.view")) return [];
		let { items: t } = await u("media/list", {
			search: e,
			perPage: 5
		});
		return t.map((e) => ({
			id: `media:${e.id}`,
			kind: "file",
			label: e.name,
			icon: r[e.kind] ?? "file",
			to: "/media",
			read: () => e
		}));
	}
});
export { t as Library, D as MediaField, n as upload };
