import { c as e, i as t, l as n, s as r, t as i } from "./chunks/kinds-BDpWzonQ.js";
import { i as a, n as o, r as s, t as c } from "./chunks/Library-CyXzIYAT.js";
import { can as l, plural as u, registry as d, run as f, t as p, useAbility as m } from "@letterncms/sdk";
import { lazy as h, useEffect as g, useRef as _, useState as v } from "react";
import { Button as y, Dialog as b, Icon as x, IconButton as S, cn as C, drawing as w } from "@letterncms/ui";
import { Fragment as T, jsx as E, jsxs as D } from "react/jsx-runtime";
// admin/src/fields.tsx
function O({ field: e, onChange: t, disabled: n }) {
	let r = _(null);
	g(() => {
		e.autofocus && r.current?.click();
	}, []);
	let i = /* @__PURE__ */ E("input", {
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
	return /* @__PURE__ */ D(T, { children: [i, /* @__PURE__ */ E(y, {
		size: "sm",
		variant: e.variant === "primary" ? "primary" : "secondary",
		icon: "upload",
		disabled: n,
		onClick: () => r.current?.click(),
		children: e.label
	})] });
}
// admin/src/MediaField.tsx
function k({ field: e, value: t, onChange: n, disabled: r }) {
	let a = (Array.isArray(t) ? t : typeof t == "string" && t ? [t] : []).filter(Boolean), l = e.max || Infinity, d = e.accept || "image/*", f = d.startsWith("image"), [h, g] = v(!1), [_, O] = v(a), k = m("media/get-many", { ids: a.filter((e) => !e.startsWith("/") && !e.startsWith("http")) }, { enabled: a.length > 0 }), A = new Map((k.data?.items ?? []).map((e) => [e.id, e]));
	return /* @__PURE__ */ D("div", { children: [
		/* @__PURE__ */ E("div", {
			className: C("flex flex-wrap gap-2", a.length === 0 && "hidden"),
			children: a.map((e) => {
				let t = A.get(e), c = e.startsWith("/") || e.startsWith("http");
				return /* @__PURE__ */ D("div", {
					className: "cms-reveal-row relative size-24 overflow-hidden rounded-md border border-border bg-sunken",
					children: [
						t?.thumb || c ? /* @__PURE__ */ E("img", {
							src: t?.thumb ?? e,
							alt: t?.alt ?? "",
							className: C("h-full w-full", w(t?.thumb ?? e) ? "object-contain p-1" : "object-cover")
						}) : t ? s(t) ? /* @__PURE__ */ E(o, { item: t }) : /* @__PURE__ */ E(i, {
							item: t,
							size: 20
						}) : /* @__PURE__ */ E("div", {
							className: "grid h-full place-items-center text-muted",
							children: /* @__PURE__ */ E(x, {
								name: "file",
								size: 20
							})
						}),
						!r && /* @__PURE__ */ E(S, {
							icon: "close",
							label: p("Remove"),
							size: "xs",
							variant: "secondary",
							className: "cms-reveal absolute right-1 top-1",
							onClick: () => n(a.filter((t) => t !== e))
						}),
						t && t.kind === "image" && !t.alt && /* @__PURE__ */ E("span", {
							className: "absolute bottom-1 left-1 rounded-xs bg-warning px-1 text-2xs font-medium text-white",
							title: p("No alt text"),
							children: "ALT"
						})
					]
				}, e);
			})
		}),
		a.length < l && /* @__PURE__ */ E(y, {
			size: "sm",
			icon: f ? "image" : "upload",
			disabled: r,
			className: a.length ? "mt-2" : "",
			onClick: () => {
				O(a), g(!0);
			},
			children: a.length ? p("Add More") : p(l === 1 ? f ? "Choose Image" : "Choose File" : f ? "Choose Images" : "Choose Files")
		}),
		/* @__PURE__ */ E(b, {
			open: h,
			onOpenChange: g,
			size: "xl",
			title: p(l === 1 ? f ? "Choose Image" : "Choose File" : f ? "Choose Images" : "Choose Files"),
			className: "sm:!top-[6vh] sm:!max-h-[88vh]",
			footer: /* @__PURE__ */ D(T, { children: [
				l !== 1 && /* @__PURE__ */ E("span", {
					className: "mr-auto text-xs text-faint max-sm:hidden",
					children: p("{count} selected", { count: _.length })
				}),
				/* @__PURE__ */ E(y, {
					onClick: () => g(!1),
					children: p("Cancel")
				}),
				l !== 1 && /* @__PURE__ */ E(y, {
					variant: "primary",
					disabled: _.length === 0,
					onClick: () => {
						n(_.slice(0, l === Infinity ? void 0 : l)), g(!1);
					},
					children: f ? u(_.length || 1, "Use Image", "Use {count} Images") : u(_.length || 1, "Use File", "Use {count} Files")
				})
			] }),
			children: /* @__PURE__ */ E("div", {
				className: "min-h-[40vh]",
				children: /* @__PURE__ */ E(c, {
					mode: "pick",
					accept: d,
					except: typeof e.except == "string" ? e.except : void 0,
					multiple: l > 1,
					selected: _,
					onSelectionChange: (e) => {
						O(e), l === 1 && e.length === 1 && (n(e), g(!1));
					}
				})
			})
		})
	] });
}
// admin/src/UploadAction.tsx
function A({ close: e }) {
	let t = _(null);
	return g(() => {
		let n = t.current;
		if (!n) return;
		let r = () => e?.();
		return n.addEventListener("cancel", r), n.click(), () => n.removeEventListener("cancel", r);
	}, []), /* @__PURE__ */ E("input", {
		ref: t,
		type: "file",
		multiple: !0,
		className: "hidden",
		onChange: (t) => {
			let i = Array.from(t.target.files ?? []);
			e?.(), i.length && n(i, r.current);
		}
	});
}
d.fields.set("media", k), d.fields.set("media-upload", O), d.components.set("media/library", h(() => import("./chunks/MediaLibrary-clVTTp7U.js"))), d.components.set("media/upload", A), d.components.set("media/new-folder", a), d.widgets.set("media-recent", h(() => import("./chunks/WidgetRecent-BDdXGmdU.js"))), d.composer.set("media", {
	trigger: "@",
	label: p("Media"),
	order: 20,
	search: async (e) => {
		if (!l("media.view")) return [];
		let { items: n } = await f("media/list", {
			search: e,
			perPage: 5
		});
		return n.map((e) => ({
			id: `media:${e.id}`,
			kind: "file",
			label: e.name,
			icon: t[e.kind] ?? "file",
			to: "/media",
			read: () => e
		}));
	}
});
export { c as Library, k as MediaField, e as upload };
