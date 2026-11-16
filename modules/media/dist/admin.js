import { i as e, n as t, r as n, t as r } from "./chunks/Library-B15BS2N1.js";
import { c as i, i as a, l as o, s, t as c } from "./chunks/kinds-BDpWzonQ.js";
import { can as l, plural as u, registry as d, run as f, t as p, useAbility as m } from "@letterncms/sdk";
import { lazy as h, useEffect as g, useRef as _, useState as v } from "react";
import { Button as y, Dialog as b, Icon as x, IconButton as S, Tooltip as C, cn as w, drawing as T } from "@letterncms/ui";
import { Fragment as E, jsx as D, jsxs as O } from "react/jsx-runtime";
// admin/src/fields.tsx
function k({ field: e, onChange: t, disabled: n }) {
	let r = _(null);
	g(() => {
		e.autofocus && r.current?.click();
	}, []);
	let i = /* @__PURE__ */ D("input", {
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
	return /* @__PURE__ */ O(E, { children: [i, /* @__PURE__ */ D(y, {
		size: "sm",
		variant: e.variant === "primary" ? "primary" : "secondary",
		icon: "upload",
		disabled: n,
		onClick: () => r.current?.click(),
		children: e.label
	})] });
}
// admin/src/MediaField.tsx
function A({ field: e, value: i, onChange: a, disabled: o }) {
	let s = (Array.isArray(i) ? i : typeof i == "string" && i ? [i] : []).filter(Boolean), l = e.max || Infinity, d = e.accept || "image/*", f = d.startsWith("image"), [h, g] = v(!1), [_, k] = v(s), A = m("media/get-many", { ids: s.filter((e) => !e.startsWith("/") && !e.startsWith("http")) }, { enabled: s.length > 0 }), j = new Map((A.data?.items ?? []).map((e) => [e.id, e]));
	return /* @__PURE__ */ O("div", { children: [
		/* @__PURE__ */ D("div", {
			className: w("flex flex-wrap gap-2", s.length === 0 && "hidden"),
			children: s.map((e) => {
				let r = j.get(e), i = e.startsWith("/") || e.startsWith("http");
				return /* @__PURE__ */ O("div", {
					className: "cms-reveal-row relative size-24 overflow-hidden rounded-md border border-border bg-sunken",
					children: [
						r?.thumb || i ? /* @__PURE__ */ D("img", {
							src: r?.thumb ?? e,
							alt: r?.alt ?? "",
							className: w("h-full w-full", T(r?.thumb ?? e) ? "object-contain p-1" : "object-cover")
						}) : r ? n(r) ? /* @__PURE__ */ D(t, { item: r }) : /* @__PURE__ */ D(c, {
							item: r,
							size: 20
						}) : /* @__PURE__ */ D("div", {
							className: "grid h-full place-items-center text-muted",
							children: /* @__PURE__ */ D(x, {
								name: "file",
								size: 20
							})
						}),
						!o && /* @__PURE__ */ D(S, {
							icon: "close",
							label: p("Remove"),
							size: "xs",
							variant: "secondary",
							className: "cms-reveal absolute right-1 top-1",
							onClick: () => a(s.filter((t) => t !== e))
						}),
						r && r.kind === "image" && !r.alt && /* @__PURE__ */ D(C, {
							content: p("No alt text"),
							children: /* @__PURE__ */ D("span", {
								className: "absolute bottom-1 left-1 rounded-xs bg-warning px-1 text-2xs font-medium text-white",
								children: "ALT"
							})
						})
					]
				}, e);
			})
		}),
		s.length < l && /* @__PURE__ */ D(y, {
			size: "sm",
			icon: f ? "image" : "upload",
			disabled: o,
			className: s.length ? "mt-2" : "",
			onClick: () => {
				k(s), g(!0);
			},
			children: s.length ? p("Add More") : p(l === 1 ? f ? "Choose Image" : "Choose File" : f ? "Choose Images" : "Choose Files")
		}),
		/* @__PURE__ */ D(b, {
			open: h,
			onOpenChange: g,
			size: "xl",
			title: p(l === 1 ? f ? "Choose Image" : "Choose File" : f ? "Choose Images" : "Choose Files"),
			className: "sm:!top-[6vh] sm:!max-h-[88vh]",
			footer: /* @__PURE__ */ O(E, { children: [
				l !== 1 && /* @__PURE__ */ D("span", {
					className: "mr-auto text-xs text-faint max-sm:hidden",
					children: p("{count} selected", { count: _.length })
				}),
				/* @__PURE__ */ D(y, {
					onClick: () => g(!1),
					children: p("Cancel")
				}),
				l !== 1 && /* @__PURE__ */ D(y, {
					variant: "primary",
					disabled: _.length === 0,
					onClick: () => {
						a(_.slice(0, l === Infinity ? void 0 : l)), g(!1);
					},
					children: f ? u(_.length || 1, "Use Image", "Use {count} Images") : u(_.length || 1, "Use File", "Use {count} Files")
				})
			] }),
			children: /* @__PURE__ */ D("div", {
				className: "min-h-[40vh]",
				children: /* @__PURE__ */ D(r, {
					mode: "pick",
					accept: d,
					except: typeof e.except == "string" ? e.except : void 0,
					multiple: l > 1,
					selected: _,
					onSelectionChange: (e) => {
						k(e), l === 1 && e.length === 1 && (a(e), g(!1));
					}
				})
			})
		})
	] });
}
// admin/src/UploadAction.tsx
function j({ close: e }) {
	let t = _(null);
	return g(() => {
		let n = t.current;
		if (!n) return;
		let r = () => e?.();
		return n.addEventListener("cancel", r), n.click(), () => n.removeEventListener("cancel", r);
	}, []), /* @__PURE__ */ D("input", {
		ref: t,
		type: "file",
		multiple: !0,
		className: "hidden",
		onChange: (t) => {
			let n = Array.from(t.target.files ?? []);
			e?.(), n.length && o(n, s.current);
		}
	});
}
d.fields.set("media", A), d.fields.set("media-upload", k), d.components.set("media/library", h(() => import("./chunks/MediaLibrary-C9of4-Su.js"))), d.components.set("media/upload", j), d.components.set("media/new-folder", e), d.widgets.set("media-recent", h(() => import("./chunks/WidgetRecent-SaPDI6zY.js"))), d.composer.set("media", {
	trigger: "@",
	label: p("Media"),
	order: 20,
	search: async (e) => {
		if (!l("media.view")) return [];
		let { items: t } = await f("media/list", {
			search: e,
			perPage: 5
		});
		return t.map((e) => ({
			id: `media:${e.id}`,
			kind: "file",
			label: e.name,
			icon: a[e.kind] ?? "file",
			to: "/media",
			read: () => e
		}));
	}
});
export { r as Library, A as MediaField, i as upload };
