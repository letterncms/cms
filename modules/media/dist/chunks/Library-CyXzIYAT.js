import { a as e, c as t, l as n, n as r, o as i, r as a, s as o, t as s } from "./kinds-BDpWzonQ.js";
import { can as c, invalidate as l, locale as u, plural as d, run as f, setQuery as p, t as m, useAbility as h, useLocation as ee } from "@letterncms/sdk";
import { useEffect as g, useRef as _, useState as v } from "react";
import { Badge as y, Button as b, DataView as te, Dialog as x, EmptyState as ne, Field as S, Fields as C, Icon as re, IconButton as ie, InspectorPanel as w, List as T, Menu as E, NoMatches as D, PanelHeader as ae, Row as oe, Segmented as O, SelectionBar as k, cn as A, confirm as j, copyText as se, drawing as ce, formatBytes as le, prompt as M, readViewPrefs as ue, toast as N } from "@letterncms/ui";
import { Fragment as de, jsx as P, jsxs as F } from "react/jsx-runtime";
// admin/src/Folders.tsx
var I = (e) => e.slice(e.lastIndexOf("/") + 1), L = (e) => e.includes("/") ? e.slice(0, e.lastIndexOf("/")) : "", R = (e, t) => e === t || e.startsWith(`${t}/`);
async function z(e = "") {
	let t = await M({
		title: m("New Folder"),
		fields: [{
			handle: "name",
			type: "text",
			label: m("Name"),
			required: !0
		}],
		confirm: m("Create Folder")
	}), n = String(t?.name ?? "").trim();
	if (!n) return null;
	try {
		let { path: t } = await f("media-folders/create", { path: e ? `${e}/${n}` : n });
		return l("media/"), t;
	} catch (e) {
		return N.error(e), null;
	}
}
async function B(e) {
	let t = await M({
		title: m("Rename Folder"),
		fields: [{
			handle: "name",
			type: "text",
			label: m("Name"),
			required: !0
		}],
		values: { name: I(e) },
		confirm: m("Rename")
	}), n = String(t?.name ?? "").trim();
	if (!n || n === I(e)) return null;
	try {
		let t = await f("media-folders/rename", {
			path: e,
			to: L(e) ? `${L(e)}/${n}` : n
		});
		return l("media/"), t.path;
	} catch (e) {
		return N.error(e), null;
	}
}
async function V(e) {
	if (!await j({
		title: m("Delete “{name}”?", { name: I(e) }),
		description: m("Its files move to the folder above."),
		confirm: m("Delete"),
		danger: !0
	})) return !1;
	try {
		return await f("media-folders/delete", { path: e }), l("media/"), !0;
	} catch (e) {
		return N.error(e), !1;
	}
}
function fe(e, t, n) {
	return e === null || !R(e, t) ? e : n === null ? L(t) || null : n + e.slice(t.length);
}
function H({ folders: e, value: t, onChange: n, root: r, actions: i, current: a, className: o }) {
	let s = (e, r, i, o, s) => /* @__PURE__ */ F("div", {
		role: "listitem",
		className: "cms-reveal-row group relative flex items-center",
		children: [/* @__PURE__ */ F(b, {
			variant: "ghost",
			"aria-pressed": t === e,
			onClick: () => n(e),
			className: A("h-8 min-w-0 flex-1 justify-start gap-2 rounded-md pr-2 font-normal", s ? "pr-8" : void 0),
			style: { paddingLeft: 8 + o * 16 },
			children: [
				/* @__PURE__ */ P(re, {
					name: i,
					size: 16,
					className: "shrink-0 text-muted"
				}),
				/* @__PURE__ */ P("span", {
					className: "min-w-0 flex-1 truncate text-left",
					children: r
				}),
				a !== void 0 && a === e && /* @__PURE__ */ P("span", {
					className: "shrink-0 text-xs text-faint",
					children: m("Current")
				})
			]
		}), s && /* @__PURE__ */ P("div", {
			className: "cms-reveal absolute right-1 flex items-center",
			children: s
		})]
	}, e ?? "");
	return /* @__PURE__ */ F("div", {
		role: "list",
		className: A("space-y-px", o),
		children: [s(r.value, r.label, "media", 0), e.map((e) => s(e, I(e), "folder", e.split("/").length - 1, i?.(e)))]
	});
}
function U(e, t) {
	return [
		{
			label: m("New Folder"),
			icon: "plus",
			onSelect: () => void z(e).then((e) => e && t(void 0, e))
		},
		{
			label: m("Rename"),
			icon: "edit",
			onSelect: () => void B(e).then((e) => e && t(e))
		},
		{
			label: m("Delete Folder"),
			icon: "trash",
			danger: !0,
			onSelect: () => void V(e).then((e) => e && t(null))
		}
	];
}
function pe({ files: e, folders: t, onClose: n }) {
	let r = e.every((t) => t.folder === e[0].folder) ? e[0].folder : null, [i, a] = v(null), [o, s] = v([]), [c, u] = v(!1), d = [.../* @__PURE__ */ new Set([...t, ...o])].sort(), p = async () => {
		u(!0);
		try {
			let t = await f("media/move", {
				ids: e.map((e) => e.id),
				folder: i ?? ""
			});
			l("media/"), n(t.folder);
		} catch (e) {
			N.error(e), u(!1);
		}
	};
	return /* @__PURE__ */ F(x, {
		open: !0,
		onOpenChange: (e) => !e && n(),
		size: "sm",
		title: m("Move to Folder"),
		onSubmit: () => void p(),
		submitLabel: m("Move"),
		submitDisabled: i === null || i === r,
		busy: c,
		children: [/* @__PURE__ */ P(H, {
			folders: d,
			value: i,
			current: r,
			onChange: (e) => a(e ?? ""),
			root: {
				value: "",
				label: m("No Folder")
			}
		}), /* @__PURE__ */ P(b, {
			variant: "ghost",
			icon: "plus",
			className: "mt-1 w-full justify-start px-2 font-normal text-muted",
			onClick: () => void z(i ?? r ?? "").then((e) => {
				e && (s((t) => [...t, e]), a(e));
			}),
			children: m("New Folder")
		})]
	});
}
function W({ close: e }) {
	let t = _(!1);
	return g(() => {
		t.current || (t.current = !0, z(o.current).then((t) => {
			t && o.show?.(t), e?.();
		}));
	}, []), null;
}
// admin/src/documents.tsx
var G = [
	"text/plain",
	"text/csv",
	"text/markdown"
], me = (e) => e.mime === "application/pdf" || G.includes(e.mime), K = /* @__PURE__ */ new Map();
function he(e, t) {
	let n = K.get(e);
	return n || (K.size > 120 && K.delete(K.keys().next().value), n = t(), n.catch(() => K.delete(e)), K.set(e, n)), n;
}
var q, ge = () => q ??= import("./pdf.worker.min-BuogX_kP.js").then(() => import("./pdf-ClWIOPyR.js")), _e = (e, t, n) => he(`pdf|${e}|${t}|${n}`, async () => {
	let r = (await ge()).getDocument({ url: e }), i = await r.promise;
	try {
		let e = [];
		for (let r = 1; r <= Math.min(t, i.numPages); r++) {
			let t = await i.getPage(r), a = t.getViewport({ scale: n / t.getViewport({ scale: 1 }).width }), o = document.createElement("canvas");
			o.width = Math.ceil(a.width), o.height = Math.ceil(a.height), await t.render({
				canvas: o,
				viewport: a,
				background: "white"
			}).promise, e.push(o.toDataURL("image/jpeg", .85)), t.cleanup();
		}
		return e;
	} finally {
		r.destroy();
	}
}), ve = (e, t) => he(`text|${e}|${t}`, async () => {
	let n = await fetch(e, { headers: { Range: `bytes=0-${t - 1}` } });
	if (!n.ok) throw Error(String(n.status));
	return (await n.text()).replace(/^﻿/, "").slice(0, t);
}), J = (e) => e.replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "").replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/(\*\*|__|`|~~)/g, "");
function Y() {
	let e = _(null), [t, n] = v(!1);
	return g(() => {
		let r = e.current;
		if (!r || t) return;
		let i = new IntersectionObserver(([e]) => {
			e?.isIntersecting && n(!0);
		}, { rootMargin: "200px" });
		return i.observe(r), () => i.disconnect();
	}, [t]), [e, t];
}
function ye({ item: e, panel: t = !1 }) {
	let [n, r] = Y(), i = e.mime === "application/pdf", [a, o] = v(null), c = t ? 2e4 : 1200;
	g(() => {
		if (!r) return;
		let n = !0;
		return o(null), (i ? _e(e.url, t ? 5 : 1, t ? 720 : 480).then((e) => e.length ? { pages: e } : null) : ve(e.url, c).then((e) => ({ text: e }))).then((e) => {
			n && o(e);
		}, () => {
			n && o(null);
		}), () => {
			n = !1;
		};
	}, [
		r,
		e.url,
		e.mime,
		i,
		t,
		c
	]);
	let l = a && "text" in a ? a.text : "", u = e.size > c ? "…" : "";
	return t ? /* @__PURE__ */ P("div", {
		ref: n,
		children: a && "pages" in a ? /* @__PURE__ */ P("div", {
			className: "max-h-[44vh] space-y-2 overflow-y-auto rounded-md bg-sunken p-2",
			children: a.pages.map((t, n) => /* @__PURE__ */ P("img", {
				src: t,
				alt: n === 0 ? e.name : "",
				className: "block w-full rounded-xs bg-white"
			}, n))
		}) : a ? /* @__PURE__ */ P("pre", {
			className: "m-0 max-h-[44vh] overflow-auto whitespace-pre-wrap break-words rounded-md bg-sunken p-3 font-mono text-xs leading-relaxed",
			children: l + u
		}) : /* @__PURE__ */ P(s, {
			item: e,
			size: 28,
			className: "h-32 rounded-md bg-sunken"
		})
	}) : /* @__PURE__ */ P("div", {
		ref: n,
		className: "absolute inset-0 overflow-hidden",
		children: a && "pages" in a ? /* @__PURE__ */ P("img", {
			src: a.pages[0],
			alt: "",
			className: "w-full bg-white object-cover object-top"
		}) : a ? /* @__PURE__ */ P("pre", {
			className: A("m-0 size-full overflow-hidden whitespace-pre-wrap break-words p-3 text-2xs leading-snug text-muted", e.mime !== "text/markdown" && "font-mono"),
			children: (e.mime === "text/markdown" ? J(l) : l) + u
		}) : /* @__PURE__ */ P(s, { item: e })
	});
}
// admin/src/actions.ts
var X = (e) => e.kind === "entry" && e.collection ? `/content/${e.collection}/${e.id}` : e.kind === "global" ? `/globals/${e.id}` : void 0;
function be(e) {
	let t = [...new Set(e)], n = t.slice(0, 3), r = new Intl.ListFormat(u(), { type: t.length > 3 ? "unit" : "conjunction" }).format(n);
	return t.length > 3 ? m("{names} and {count} more", {
		names: r,
		count: t.length - 3
	}) : r;
}
async function xe(e) {
	if (!e.length) return [];
	let t;
	try {
		if (e.length === 1) {
			let { usedBy: n } = await f("media/get", { id: e[0].id });
			n.length && (t = m("It is used in {where} and will be missing there.", { where: be(n.map((e) => e.title)) }));
		} else {
			let { unused: n } = await f("media/report"), r = e.filter((e) => !n.includes(e.id)).length;
			r && (t = d(r, "{count} of them is in use and will be missing there.", "{count} of them are in use and will be missing there."));
		}
	} catch (e) {
		return N.error(e), [];
	}
	let n = e.length === 1 ? m("Delete “{name}”?", { name: e[0].name }) : d(e.length, "Delete {count} file?", "Delete {count} files?");
	if (!await j({
		title: n,
		description: t,
		confirm: m("Delete"),
		danger: !0
	})) return [];
	let r = await Promise.allSettled(e.map((e) => f("media/delete", {
		id: e.id,
		force: !0
	}))), i = r.find((e) => e.status === "rejected");
	return i && N.error(i.reason), l("media/"), e.filter((e, t) => r[t].status === "fulfilled").map((e) => e.id);
}
// admin/src/Crop.tsx
var Z = (e, t, n) => Math.max(t, Math.min(n, e)), Q = 4;
function Se({ item: e, src: t, onClose: n }) {
	let [r, i] = v({
		x: 0,
		y: 0,
		w: 100,
		h: 100
	}), [a, o] = v(!1), [s, c] = v("free"), [l, u] = v(!1), [d, p] = l ? [e.height ?? 1, e.width ?? 1] : [e.width ?? 1, e.height ?? 1], h = s === "free" ? null : s === "original" ? 1 : s === "1:1" ? p / d : s === "4:3" ? 4 / 3 * (p / d) : 16 / 9 * (p / d), ee = (e) => {
		c(e);
		let t = e === "free" ? null : e === "original" ? 1 : e === "1:1" ? p / d : e === "4:3" ? 4 / 3 * (p / d) : 16 / 9 * (p / d);
		if (t === null) return;
		let n = Math.min(100, 100 * t), r = n / t;
		i({
			x: (100 - n) / 2,
			y: (100 - r) / 2,
			w: n,
			h: r
		});
	}, g = _(null), y = _({
		x: 0,
		y: 0
	}), b = [
		{
			id: "tl",
			label: m("Top Left Corner"),
			left: !0,
			top: !0
		},
		{
			id: "tr",
			label: m("Top Right Corner"),
			left: !1,
			top: !0
		},
		{
			id: "bl",
			label: m("Bottom Left Corner"),
			left: !0,
			top: !1
		},
		{
			id: "br",
			label: m("Bottom Right Corner"),
			left: !1,
			top: !1
		}
	], te = [
		{
			id: "t",
			label: m("Top Edge"),
			side: "top"
		},
		{
			id: "r",
			label: m("Right Edge"),
			side: "right"
		},
		{
			id: "b",
			label: m("Bottom Edge"),
			side: "bottom"
		},
		{
			id: "l",
			label: m("Left Edge"),
			side: "left"
		}
	], ne = (e, t) => i((n) => {
		let [r, i, a, o] = [
			n.x,
			n.y,
			n.x + n.w,
			n.y + n.h
		];
		return e === "left" && (r = Z(t(r), 0, a - Q)), e === "right" && (a = Z(t(a), r + Q, 100)), e === "top" && (i = Z(t(i), 0, o - Q)), e === "bottom" && (o = Z(t(o), i + Q, 100)), {
			x: r,
			y: i,
			w: a - r,
			h: o - i
		};
	}), S = (e) => {
		let t = g.current.getBoundingClientRect();
		return {
			x: (e.clientX - t.left) / t.width * 100,
			y: (e.clientY - t.top) / t.height * 100
		};
	}, C = (e, t = r) => ({
		x: e.left ? t.x : t.x + t.w,
		y: e.top ? t.y : t.y + t.h
	}), re = (e, t) => i((n) => {
		let r = t(C(e, n)), [i, a, o, s] = [
			n.x,
			n.y,
			n.x + n.w,
			n.y + n.h
		];
		if (e.left ? i = Z(r.x, 0, o - Q) : o = Z(r.x, i + Q, 100), e.top ? a = Z(r.y, 0, s - Q) : s = Z(r.y, a + Q, 100), h === null) return {
			x: i,
			y: a,
			w: o - i,
			h: s - a
		};
		let c = {
			w: e.left ? n.x + n.w : 100 - n.x,
			h: e.top ? n.y + n.h : 100 - n.y
		}, l = Math.max(Q, Math.min(o - i, c.w, c.h * h)), u = l / h;
		return {
			x: e.left ? n.x + n.w - l : n.x,
			y: e.top ? n.y + n.h - u : n.y,
			w: l,
			h: u
		};
	}), ie = (e) => (t) => {
		let n = t.shiftKey ? 10 : 1, [r, i] = {
			ArrowLeft: [-n, 0],
			ArrowRight: [n, 0],
			ArrowUp: [0, -n],
			ArrowDown: [0, n]
		}[t.key] ?? [];
		r !== void 0 && (t.preventDefault(), re(e, (e) => ({
			x: e.x + r,
			y: e.y + i
		})));
	}, w = (e) => e.currentTarget.hasPointerCapture(e.pointerId), T = async () => {
		let [t, i] = [d, p];
		o(!0);
		try {
			n(await f("media/transform", {
				id: e.id,
				crop: {
					x: Math.round(r.x / 100 * t),
					y: Math.round(r.y / 100 * i),
					width: Math.max(1, Math.round(r.w / 100 * t)),
					height: Math.max(1, Math.round(r.h / 100 * i))
				}
			}));
		} catch (e) {
			N.error(e), o(!1);
		}
	}, E = "pointer-events-none absolute bg-black/55", D = "absolute size-3 -translate-x-1/2 -translate-y-1/2 border border-black/80 bg-white after:absolute after:-inset-4 after:content-['']";
	return /* @__PURE__ */ F(x, {
		open: !0,
		onOpenChange: (e) => !e && n(),
		title: m("Crop Image"),
		onSubmit: () => void T(),
		submitLabel: m("Crop"),
		submitDisabled: r.w > 99.9 && r.h > 99.9,
		busy: a,
		children: [/* @__PURE__ */ P(O, {
			className: "mb-3 max-sm:w-full",
			block: !0,
			value: s,
			onChange: ee,
			"aria-label": m("Shape"),
			options: [
				{
					value: "free",
					label: m("Freeform")
				},
				{
					value: "original",
					label: m("Original")
				},
				{
					value: "1:1",
					label: "1:1"
				},
				{
					value: "4:3",
					label: "4:3"
				},
				{
					value: "16:9",
					label: "16:9"
				}
			]
		}), /* @__PURE__ */ F("div", {
			ref: g,
			className: "relative mx-auto my-2 w-fit max-w-full touch-none select-none bg-sunken",
			children: [
				/* @__PURE__ */ P("img", {
					src: t,
					alt: "",
					draggable: !1,
					className: "block max-h-[44vh] max-w-full",
					onLoad: (t) => u(!!e.width && !!e.height && e.width !== e.height && t.currentTarget.naturalWidth > t.currentTarget.naturalHeight != e.width > e.height)
				}),
				/* @__PURE__ */ P("div", {
					className: `${E} inset-x-0 top-0`,
					style: { height: `${r.y}%` }
				}),
				/* @__PURE__ */ P("div", {
					className: `${E} inset-x-0 bottom-0`,
					style: { top: `${r.y + r.h}%` }
				}),
				/* @__PURE__ */ P("div", {
					className: `${E} left-0`,
					style: {
						top: `${r.y}%`,
						height: `${r.h}%`,
						width: `${r.x}%`
					}
				}),
				/* @__PURE__ */ P("div", {
					className: `${E} right-0`,
					style: {
						top: `${r.y}%`,
						height: `${r.h}%`,
						left: `${r.x + r.w}%`
					}
				}),
				/* @__PURE__ */ F("div", {
					className: "absolute cursor-move border border-white ring-1 ring-black/50",
					style: {
						left: `${r.x}%`,
						top: `${r.y}%`,
						width: `${r.w}%`,
						height: `${r.h}%`
					},
					onPointerDown: (e) => {
						let t = S(e);
						y.current = {
							x: t.x - r.x,
							y: t.y - r.y
						}, e.currentTarget.setPointerCapture(e.pointerId);
					},
					onPointerMove: (e) => {
						if (!w(e)) return;
						let t = S(e);
						i((e) => ({
							...e,
							x: Z(t.x - y.current.x, 0, 100 - e.w),
							y: Z(t.y - y.current.y, 0, 100 - e.h)
						}));
					},
					children: [b.map((e) => /* @__PURE__ */ P("span", {
						role: "slider",
						tabIndex: 0,
						"aria-label": e.label,
						"aria-valuemin": 0,
						"aria-valuemax": 100,
						"aria-valuenow": Math.round(C(e).x),
						"aria-valuetext": m("{x}% from the left, {y}% from the top", {
							x: Math.round(C(e).x),
							y: Math.round(C(e).y)
						}),
						onKeyDown: ie(e),
						onPointerDown: (e) => {
							e.stopPropagation(), e.currentTarget.setPointerCapture(e.pointerId);
						},
						onPointerMove: (t) => {
							if (w(t)) {
								t.stopPropagation();
								let n = S(t);
								re(e, () => n);
							}
						},
						className: D,
						style: {
							left: e.left ? 0 : "100%",
							top: e.top ? 0 : "100%",
							cursor: e.left === e.top ? "nwse-resize" : "nesw-resize"
						}
					}, e.id)), h === null && te.map((e) => {
						let t = e.side === "left" || e.side === "right", n = Math.round(e.side === "left" ? r.x : e.side === "right" ? r.x + r.w : e.side === "top" ? r.y : r.y + r.h);
						return /* @__PURE__ */ P("span", {
							role: "slider",
							tabIndex: 0,
							"aria-label": e.label,
							"aria-orientation": t ? "horizontal" : "vertical",
							"aria-valuemin": 0,
							"aria-valuemax": 100,
							"aria-valuenow": n,
							onKeyDown: (n) => {
								let r = (n.shiftKey ? 10 : 1) * ((t ? n.key === "ArrowRight" : n.key === "ArrowDown") ? 1 : (t ? n.key === "ArrowLeft" : n.key === "ArrowUp") ? -1 : 0);
								r !== 0 && (n.preventDefault(), ne(e.side, (e) => e + r));
							},
							onPointerDown: (e) => {
								e.stopPropagation(), e.currentTarget.setPointerCapture(e.pointerId);
							},
							onPointerMove: (n) => {
								if (w(n)) {
									n.stopPropagation();
									let r = S(n);
									ne(e.side, () => t ? r.x : r.y);
								}
							},
							className: D,
							style: {
								left: e.side === "left" ? 0 : e.side === "right" ? "100%" : "50%",
								top: e.side === "top" ? 0 : e.side === "bottom" ? "100%" : "50%",
								cursor: t ? "ew-resize" : "ns-resize"
							}
						}, e.id);
					})]
				})
			]
		})]
	});
}
// admin/src/FocalPoint.tsx
var $ = (e) => Math.max(0, Math.min(100, Math.round(e)));
function Ce({ src: e, value: t, onChange: n, disabled: r }) {
	let i = _(null), a = (e) => {
		let t = i.current.getBoundingClientRect();
		n({
			x: $((e.clientX - t.left) / t.width * 100),
			y: $((e.clientY - t.top) / t.height * 100)
		});
	};
	return /* @__PURE__ */ F("div", {
		ref: i,
		className: A("relative mx-auto w-fit max-w-full select-none overflow-hidden rounded-md bg-sunken", !r && "cursor-crosshair"),
		onClick: (e) => !r && a(e),
		children: [/* @__PURE__ */ P("img", {
			src: e,
			alt: "",
			draggable: !1,
			className: "block max-h-[44vh] max-w-full"
		}), /* @__PURE__ */ P("span", {
			role: "slider",
			tabIndex: r ? -1 : 0,
			"aria-label": m("Focal Point"),
			"aria-disabled": r || void 0,
			"aria-valuemin": 0,
			"aria-valuemax": 100,
			"aria-valuenow": t.x,
			"aria-valuetext": m("{x}% from the left, {y}% from the top", {
				x: t.x,
				y: t.y
			}),
			onKeyDown: r ? void 0 : (e) => {
				let r = e.shiftKey ? 10 : 1, i = {
					ArrowLeft: [-r, 0],
					ArrowRight: [r, 0],
					ArrowUp: [0, -r],
					ArrowDown: [0, r]
				};
				if (e.key === "Home") n({
					x: 50,
					y: 50
				});
				else if (i[e.key]) n({
					x: $(t.x + i[e.key][0]),
					y: $(t.y + i[e.key][1])
				});
				else return;
				e.preventDefault();
			},
			onClick: (e) => e.stopPropagation(),
			onPointerDown: (e) => {
				r || e.currentTarget.setPointerCapture(e.pointerId);
			},
			onPointerMove: (e) => {
				e.currentTarget.hasPointerCapture(e.pointerId) && a(e);
			},
			className: A("absolute size-7 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-2 border-black/80 before:absolute before:inset-0 before:rounded-full before:border-2 before:border-white before:content-[''] after:absolute after:-inset-2 after:content-['']", !r && "cursor-grab active:cursor-grabbing"),
			style: {
				left: `${t.x}%`,
				top: `${t.y}%`
			}
		})]
	});
}
// admin/src/FilePanel.tsx
function we({ item: e, folders: n, onClose: r }) {
	let [a, o] = v(e), [u, d] = v({
		name: a.name,
		alt: a.alt ?? "",
		caption: a.caption ?? ""
	}), [p, ee] = v(a.folder), [y, te] = v(!1), [x, ne] = v(!1), [w, E] = v(null), [D, O] = v(a.focal), k = c("media.edit"), A = h("media/get", { id: a.id }).data?.usedBy ?? [], ce = a.kind === "image" && a.mime !== "image/svg+xml", M = k && [
		"image/jpeg",
		"image/png",
		"image/webp"
	].includes(a.mime) && !!a.width, ue = a.url, I = a.thumb ?? ue, L = _(null), R = (e) => {
		o(e), O(e.focal), l("media/");
	}, z = async () => {
		E("rotate");
		try {
			R(await f("media/transform", {
				id: a.id,
				rotate: 90
			}));
		} catch (e) {
			N.error(e);
		} finally {
			E(null);
		}
	}, B = async (e) => {
		if (await j({
			title: m("Replace “{name}”?", { name: a.name }),
			description: m("“{file}” takes its place wherever it is used. The file there now is deleted.", { file: e.name }),
			confirm: m("Replace File")
		})) {
			E("replace");
			try {
				R(await t(e, "", void 0, a.id));
			} catch (e) {
				N.error(e);
			} finally {
				E(null);
			}
		}
	}, V = _({
		...u,
		focal: D
	}), fe = _(null), H = _(void 0), U = () => {
		clearTimeout(H.current);
		let e = fe.current;
		if (fe.current = null, !e) return;
		let t = {
			...e.draft,
			name: e.draft.name.trim() || V.current.name,
			focal: e.focal
		};
		JSON.stringify(t) !== JSON.stringify(V.current) && (V.current = t, f("media/update", {
			id: a.id,
			...t
		}).then(() => l("media/"), N.error));
	}, W = (e, t) => {
		k && (fe.current = {
			draft: e,
			focal: t
		}, clearTimeout(H.current), H.current = setTimeout(U, 600));
	};
	return g(() => U, []), /* @__PURE__ */ F("div", {
		className: "flex h-full min-h-0 min-w-0 flex-col",
		children: [/* @__PURE__ */ P(ae, {
			title: u.name || a.name,
			onClose: () => {
				U(), r();
			}
		}), /* @__PURE__ */ F("div", {
			className: "flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4",
			children: [
				ce ? k ? /* @__PURE__ */ F("div", { children: [/* @__PURE__ */ P(Ce, {
					src: I,
					value: D,
					onChange: (e) => {
						O(e), W(u, e);
					}
				}), M && /* @__PURE__ */ F("div", {
					className: "mt-2 flex items-center justify-center gap-2",
					children: [/* @__PURE__ */ P(b, {
						size: "sm",
						icon: "crop",
						disabled: w !== null,
						onClick: () => ne(!0),
						children: m("Crop")
					}), /* @__PURE__ */ P(b, {
						size: "sm",
						icon: "arrow-clockwise",
						loading: w === "rotate",
						disabled: w !== null,
						onClick: () => void z(),
						children: m("Rotate")
					})]
				})] }) : /* @__PURE__ */ P("img", {
					src: I,
					alt: a.alt ?? "",
					className: "mx-auto block max-h-[44vh] max-w-full rounded-md bg-sunken"
				}) : a.kind === "image" ? /* @__PURE__ */ P("img", {
					src: ue,
					alt: a.alt ?? "",
					className: "mx-auto block max-h-[44vh] max-w-full rounded-md bg-sunken"
				}) : a.kind === "video" ? /* @__PURE__ */ P("video", {
					src: ue,
					controls: !0,
					className: "max-h-[44vh] w-full rounded-md bg-sunken"
				}, ue) : me(a) ? /* @__PURE__ */ P(ye, {
					item: a,
					panel: !0
				}) : /* @__PURE__ */ P(s, {
					item: a,
					size: 28,
					className: "h-32 rounded-md bg-sunken"
				}),
				/* @__PURE__ */ F("dl", {
					className: "m-0 grid grid-cols-[88px_minmax(0,1fr)] items-center gap-y-1 text-xs",
					children: [
						/* @__PURE__ */ P("dt", {
							className: "text-faint",
							children: m("Kind")
						}),
						/* @__PURE__ */ P("dd", {
							className: "m-0 truncate",
							children: i(a)
						}),
						/* @__PURE__ */ P("dt", {
							className: "text-faint",
							children: m("Size")
						}),
						/* @__PURE__ */ P("dd", {
							className: "m-0",
							children: le(a.size)
						}),
						a.width && /* @__PURE__ */ F(de, { children: [/* @__PURE__ */ P("dt", {
							className: "text-faint",
							children: m("Dimensions")
						}), /* @__PURE__ */ F("dd", {
							className: "m-0",
							children: [
								a.width,
								" × ",
								a.height
							]
						})] }),
						p && /* @__PURE__ */ F(de, { children: [/* @__PURE__ */ P("dt", {
							className: "text-faint",
							children: m("Folder")
						}), /* @__PURE__ */ P("dd", {
							className: "m-0 truncate",
							children: p
						})] }),
						/* @__PURE__ */ P("dt", {
							className: "text-faint",
							children: m("URL")
						}),
						/* @__PURE__ */ F("dd", {
							className: "m-0 flex min-w-0 items-center gap-1",
							children: [/* @__PURE__ */ P("span", {
								className: "truncate font-mono",
								children: a.url
							}), /* @__PURE__ */ P(ie, {
								icon: "copy",
								label: m("Copy URL"),
								size: "xs",
								onClick: () => void se(new URL(a.url, location.origin).href, {
									copied: m("URL copied"),
									failed: m("Couldn’t copy the URL")
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ P(C, {
					className: "gap-y-4!",
					disabled: !k,
					fields: [
						{
							handle: "name",
							type: "text",
							label: m("Name"),
							size: "sm"
						},
						...a.kind === "image" ? [{
							handle: "alt",
							type: "textarea",
							label: m("Alt Text"),
							rows: 2
						}] : [],
						{
							handle: "caption",
							type: "textarea",
							label: m("Caption"),
							rows: 2
						}
					],
					values: u,
					onChange: (e, t) => {
						let n = {
							...u,
							[e]: t ?? ""
						};
						d(n), W(n, D);
					}
				}),
				A.length > 0 && /* @__PURE__ */ P(S, {
					label: m("Used In"),
					children: /* @__PURE__ */ P(T, { children: A.map((e) => /* @__PURE__ */ F(oe, {
						to: X(e),
						children: [/* @__PURE__ */ P(re, {
							name: e.kind === "entry" ? "page" : e.kind === "global" ? "globe" : "palette",
							size: 16,
							className: "shrink-0 text-muted"
						}), /* @__PURE__ */ P("span", {
							className: "truncate",
							children: e.title
						})]
					}, `${e.kind}:${e.id}`)) })
				}),
				(k || c("media.delete")) && /* @__PURE__ */ F("div", {
					className: "flex flex-wrap items-center gap-2 pb-0.5",
					children: [
						k && /* @__PURE__ */ P(b, {
							size: "sm",
							icon: "upload",
							loading: w === "replace",
							disabled: w !== null,
							onClick: () => L.current?.click(),
							children: m("Replace File")
						}),
						k && /* @__PURE__ */ P(b, {
							size: "sm",
							icon: "folder",
							onClick: () => te(!0),
							children: m("Move to Folder")
						}),
						c("media.delete") && /* @__PURE__ */ P(b, {
							size: "sm",
							variant: "destructive",
							icon: "trash",
							onClick: async () => {
								U(), (await xe([a])).length && r();
							},
							children: m("Delete File")
						})
					]
				}),
				/* @__PURE__ */ F("div", {
					className: "hidden",
					onSubmit: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ P("input", {
							ref: L,
							type: "file",
							className: "hidden",
							accept: {
								image: "image/*",
								video: "video/*",
								audio: "audio/*",
								pdf: "application/pdf"
							}[a.kind],
							onChange: (e) => {
								let t = e.target.files?.[0];
								e.target.value = "", t && B(t);
							}
						}),
						y && /* @__PURE__ */ P(pe, {
							files: [{
								id: a.id,
								folder: p
							}],
							folders: n,
							onClose: (e) => {
								te(!1), e !== void 0 && ee(e);
							}
						}),
						x && /* @__PURE__ */ P(Se, {
							item: a,
							src: I,
							onClose: (e) => {
								ne(!1), e && R(e);
							}
						})
					]
				})
			]
		})]
	});
}
// admin/src/Library.tsx
var Te = (e, t, n, r = {}) => ({
	...r,
	search: e.search || void 0,
	kind: e.kind,
	folder: e.folder,
	page: t,
	perPage: 60,
	sort: n ?? void 0
});
function Ee(t) {
	return [{
		handle: "search",
		type: "text",
		label: m("Search Files"),
		icon: "search",
		size: "sm",
		placeholder: m("Search Files"),
		className: "w-full sm:w-60"
	}, ...t ? [{
		handle: "kind",
		type: "select",
		label: m("Kind"),
		size: "sm",
		placeholder: m("All Kinds"),
		options: e(),
		className: "w-full sm:w-40"
	}] : []];
}
function De({ mode: e = "manage", accept: t = "*", except: l, multiple: d = !1, selected: f = [], onSelectionChange: x, autoUpload: S = !1, bar: T = !1 }) {
	let { query: ae } = ee(), oe = a(t), [O, j] = v(() => T ? {
		search: ae.search ?? "",
		kind: r.includes(ae.kind ?? "") ? ae.kind : "all",
		folder: ae.folder || null
	} : {
		search: "",
		kind: oe,
		folder: null
	}), { kind: M, folder: N } = O, L = e === "pick" ? {
		accept: t !== "*" && !/^(image|video)\/\*$/.test(t) && t !== "application/pdf" ? t : void 0,
		except: l
	} : {};
	g(() => {
		T && p({
			search: O.search || null,
			kind: O.kind === "all" ? null : O.kind,
			folder: O.folder
		});
	}, [T, O]), g(() => {
		if (T) return o.current = N ?? "", o.show = (e) => Se("folder", e), () => {
			o.current = "", o.show = void 0;
		};
	}, [T, N]);
	let [R, z] = v(1), [B, V] = v(() => ue("overview.media", "grid").sort), [W, G] = v(/* @__PURE__ */ new Set()), [K, he] = v(!1), [q, ge] = v(null), [_e, ve] = v(null), J = h("media/list", Te(O, R, B, L), { placeholderData: (e) => e }), Y = J.data?.items ?? [], X = J.data?.folders ?? [], be = c("media.upload"), Z = e === "manage" && c("media.edit"), Q = (e) => U(e, (t, n) => Se("folder", n ?? fe(N, e, t ?? null))), Se = (e, t) => {
		z(1), G(/* @__PURE__ */ new Set()), j((n) => ({
			...n,
			[e]: e === "kind" ? t || "all" : t
		}));
	}, $ = (n) => [{
		handle: "files",
		type: "json",
		component: "media-upload",
		label: m("Upload"),
		multiple: e === "manage" || d,
		accept: t === "*" ? void 0 : t,
		...n
	}], Ce = async (t) => {
		let r = await n(t, N ?? "");
		if (r.length && e === "pick") {
			let e = d ? [...f, ...r.map((e) => e.id)] : [r[0].id];
			x?.(e, r);
		}
	}, De = (t) => {
		if (e === "manage") return ge(t);
		let n = d ? f.includes(t.id) ? f.filter((e) => e !== t.id) : [...f, t.id] : [t.id];
		x?.(n, [t]);
	}, Oe = be ? /* @__PURE__ */ P(C, {
		layout: "inline",
		bare: !0,
		fields: $({
			handle: "files-here",
			variant: "secondary"
		}),
		values: {},
		onChange: (e, t) => void Ce(t)
	}) : null, ke = (t = !1, n = e === "manage" ? "primary" : "secondary") => be ? /* @__PURE__ */ P(C, {
		layout: "inline",
		bare: !0,
		fields: $({
			variant: n,
			autofocus: t
		}),
		values: {},
		onChange: (e, t) => void Ce(t)
	}) : null, Ae = (t, n, r = Y) => {
		if (e === "pick") {
			let e = d ? [...new Set(n ? [...f, ...t] : f.filter((e) => !t.includes(e)))] : n ? t.slice(0, 1) : [];
			x?.(e, r.filter((t) => e.includes(t.id)));
		} else G((e) => {
			let r = new Set(e);
			return t.forEach((e) => n ? r.add(e) : r.delete(e)), r;
		});
	}, je = async (e) => {
		if (!K) {
			he(!0);
			try {
				let t = await xe(Y.filter((t) => e.includes(t.id)));
				G((e) => new Set([...e].filter((e) => !t.includes(e))));
			} finally {
				he(!1);
			}
		}
	}, [Me, Ne] = v(!1), Pe = _(0), Fe = (e) => be && e.dataTransfer.types.includes("Files"), Ie = {
		onDragEnter: (e) => {
			Fe(e) && (Pe.current++, Ne(!0));
		},
		onDragOver: (e) => {
			Fe(e) && (e.preventDefault(), e.dataTransfer.dropEffect = "copy");
		},
		onDragLeave: (e) => {
			Fe(e) && --Pe.current <= 0 && (Pe.current = 0, Ne(!1));
		},
		onDrop: (t) => {
			if (!Fe(t)) return;
			t.preventDefault(), Pe.current = 0, Ne(!1);
			let n = Array.from(t.dataTransfer.files);
			Ce(e === "pick" && !d ? n.slice(0, 1) : n);
		}
	}, Le = (e) => e.thumb ? /* @__PURE__ */ P("img", {
		src: e.thumb,
		alt: e.alt ?? "",
		loading: "lazy",
		className: A("absolute inset-0 size-full", ce(e.thumb) ? "object-contain p-4" : "object-cover"),
		style: ce(e.thumb) ? void 0 : { objectPosition: `${e.focal.x}% ${e.focal.y}%` }
	}) : me(e) ? /* @__PURE__ */ P(ye, { item: e }) : /* @__PURE__ */ P(s, { item: e }), Re = !!O.search || M !== (T ? "all" : oe), ze = !Re && N === null && !J.isError && J.data?.total === 0, Be = !T && oe !== "all", Ve = X.length > 0, He = e === "pick";
	return /* @__PURE__ */ F("div", {
		className: A("relative min-w-0", Ve && "md:grid md:grid-cols-[200px_minmax(0,1fr)] md:items-start md:gap-6", Me && "rounded-lg outline-2 -outline-offset-2 outline-focus"),
		...Ie,
		children: [
			Ve && /* @__PURE__ */ P("nav", {
				"aria-label": m("Folders"),
				className: "mt-1.5 max-md:hidden",
				children: /* @__PURE__ */ P(H, {
					folders: X,
					value: N,
					onChange: (e) => Se("folder", e),
					root: {
						value: null,
						label: m("All Files")
					},
					actions: Z ? (e) => /* @__PURE__ */ P(E, {
						trigger: /* @__PURE__ */ P(ie, {
							icon: "more",
							label: m("Actions for {name}", { name: I(e) }),
							size: "xs"
						}),
						items: Q(e)
					}) : void 0
				})
			}),
			Me && /* @__PURE__ */ P("div", {
				className: "pointer-events-none absolute inset-0 z-sticky flex justify-center rounded-lg bg-bg/80",
				children: /* @__PURE__ */ F("span", {
					className: "sticky top-[30vh] mt-[20vh] flex h-fit items-center gap-2 rounded-md bg-float px-3 py-2 text-sm font-medium text-ink shadow-pop ring-1 ring-border-strong",
					children: [/* @__PURE__ */ P(re, {
						name: "upload",
						size: 16
					}), N ? m("Drop to Upload to {folder}", { folder: I(N) }) : m("Drop to Upload")]
				})
			}),
			/* @__PURE__ */ F("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ P(te, {
						id: "media",
						label: m("Media"),
						items: Y,
						source: {
							ability: "media/list",
							input: Te(O, 1, B, L),
							perPage: 60
						},
						rowKey: (e) => e.id,
						onRowClick: De,
						defaultView: "grid",
						image: Le,
						pagination: J.data && {
							page: J.data.page,
							pages: J.data.pages,
							total: J.data.total,
							perPage: 60,
							onPage: z
						},
						loading: J.isLoading,
						stale: J.isPlaceholderData,
						error: J.isError,
						onRetry: () => void J.refetch(),
						dates: (e) => ({
							publishedAt: null,
							updatedAt: e.updatedAt
						}),
						sort: B,
						dateSort: { updated: "updated_at" },
						onSort: (e) => {
							z(1), V(e);
						},
						selection: He ? void 0 : {
							ids: W,
							onSelect: Ae
						},
						selected: He ? (e) => f.includes(e.id) : void 0,
						plain: He,
						toolbar: ze ? void 0 : /* @__PURE__ */ F(de, { children: [
							/* @__PURE__ */ P(C, {
								layout: "inline",
								bare: !0,
								className: "flex min-w-0 flex-wrap items-center gap-2 max-sm:w-full",
								fields: [...Ee(!Be), ...X.length ? [{
									handle: "folder",
									type: "select",
									label: m("Folder"),
									size: "sm",
									placeholder: m("All Files"),
									options: X.map((e) => ({
										value: e,
										label: "\xA0\xA0".repeat(e.split("/").length - 1) + I(e),
										icon: "folder"
									})),
									className: "w-full sm:w-44 md:hidden"
								}] : []],
								values: {
									...O,
									kind: M === "all" ? null : M
								},
								onChange: Se
							}),
							Z && N && /* @__PURE__ */ P(E, {
								trigger: /* @__PURE__ */ P(ie, {
									icon: "more",
									label: m("Actions for {name}", { name: I(N) }),
									size: "sm",
									className: "md:hidden"
								}),
								items: Q(N)
							}),
							!T && ke(S)
						] }),
						columns: He ? [{
							id: "name",
							label: m("Name"),
							render: (e) => e.name
						}] : [
							{
								id: "name",
								label: m("Name"),
								sort: "name",
								render: (e) => e.name
							},
							{
								id: "type",
								label: m("Kind"),
								width: "160px",
								render: (e) => i(e)
							},
							{
								id: "size",
								label: m("Size"),
								width: "100px",
								align: "end",
								sort: "size",
								render: (e) => le(e.size)
							},
							{
								id: "folder",
								label: m("Folder"),
								hiddenByDefault: !0,
								width: "160px",
								sort: "folder",
								render: (e) => e.folder || "—"
							},
							{
								id: "alt",
								label: m("Alt Text"),
								hiddenByDefault: !0,
								width: "120px",
								render: (e) => e.kind === "image" ? e.alt ? /* @__PURE__ */ P(y, {
									tone: "success",
									children: m("Added")
								}) : /* @__PURE__ */ P(y, {
									tone: "warning",
									children: m("No alt text")
								}) : "—"
							},
							{
								id: "created",
								label: m("Uploaded"),
								hiddenByDefault: !0,
								width: "120px",
								sort: "created_at",
								render: (e) => new Date(e.createdAt).toLocaleDateString(u(), { dateStyle: "medium" })
							}
						],
						actions: He ? void 0 : (t) => /* @__PURE__ */ P(E, {
							trigger: /* @__PURE__ */ P(ie, {
								icon: "more",
								label: m("Actions for {name}", { name: t.name }),
								size: "xs"
							}),
							items: [
								{
									label: m("Open"),
									icon: "edit",
									onSelect: () => De(t)
								},
								{
									label: m("Copy URL"),
									icon: "copy",
									onSelect: () => void se(new URL(t.url, location.origin).href, {
										copied: m("URL copied"),
										failed: m("Couldn’t copy the URL")
									})
								},
								Z && {
									label: m("Move to Folder"),
									icon: "folder",
									onSelect: () => ve([t])
								},
								e === "manage" && c("media.delete") && {
									label: m("Delete"),
									icon: "trash",
									danger: !0,
									disabled: K,
									onSelect: () => void je([t.id])
								}
							]
						}),
						empty: Re ? /* @__PURE__ */ P(D, { onClear: () => {
							j((e) => ({
								search: "",
								kind: T ? "all" : oe,
								folder: e.folder
							})), z(1);
						} }) : /* @__PURE__ */ P(ne, {
							icon: N === null ? "media" : "folder",
							title: m(N === null ? M === "image" ? "No images yet" : M === "video" ? "No videos yet" : "No files yet" : "No files in this folder"),
							action: T ? Oe : ke(!1, "secondary")
						})
					}),
					T && S && /* @__PURE__ */ P("span", {
						className: "hidden",
						children: ke(!0)
					}),
					e === "manage" && /* @__PURE__ */ F(k, {
						count: W.size,
						onClear: () => G(/* @__PURE__ */ new Set()),
						children: [Z && /* @__PURE__ */ P(b, {
							size: "sm",
							variant: "ghost",
							onClick: () => ve(Y.filter((e) => W.has(e.id))),
							children: m("Move to Folder")
						}), c("media.delete") && /* @__PURE__ */ P(b, {
							size: "sm",
							variant: "destructive",
							loading: K,
							onClick: () => void je([...W]),
							children: m("Delete")
						})]
					}),
					e === "manage" && /* @__PURE__ */ P(w, {
						sheet: !0,
						open: !!q,
						onOpenChange: (e) => !e && ge(null),
						title: q?.name ?? m("Media"),
						children: q && /* @__PURE__ */ P(we, {
							item: Y.find((e) => e.id === q.id) ?? q,
							folders: X,
							onClose: () => ge(null)
						}, q.id)
					}),
					_e && _e.length > 0 && /* @__PURE__ */ P(pe, {
						files: _e,
						folders: X,
						onClose: (e) => {
							ve(null), e !== void 0 && G(/* @__PURE__ */ new Set());
						}
					})
				]
			})
		]
	});
}
export { W as i, ye as n, me as r, De as t };
