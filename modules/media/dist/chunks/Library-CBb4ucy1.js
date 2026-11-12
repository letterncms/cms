import { a as e, c as t, l as n, n as r, o as i, r as a, s as o, t as s } from "./kinds-BDpWzonQ.js";
import { can as c, invalidate as l, locale as u, plural as d, run as f, setQuery as p, t as m, useAbility as h, useLocation as ee } from "@letterncms/sdk";
import { useEffect as g, useRef as _, useState as v } from "react";
import { Badge as y, Button as b, DataView as te, Dialog as x, EmptyState as ne, Field as S, Fields as C, Icon as w, IconButton as T, InspectorPanel as E, List as D, Menu as O, NoMatches as k, PanelHeader as A, Row as j, Segmented as M, SelectionBar as N, cn as P, confirm as F, copyText as re, drawing as ie, formatBytes as ae, prompt as I, readViewPrefs as L, toast as R } from "@letterncms/ui";
import { Fragment as oe, jsx as z, jsxs as B } from "react/jsx-runtime";
// admin/src/Folders.tsx
var V = (e) => e.slice(e.lastIndexOf("/") + 1), H = (e) => e.includes("/") ? e.slice(0, e.lastIndexOf("/")) : "", U = (e, t) => e === t || e.startsWith(`${t}/`);
async function W(e = "") {
	let t = await I({
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
		return R.error(e), null;
	}
}
async function G(e) {
	let t = await I({
		title: m("Rename Folder"),
		fields: [{
			handle: "name",
			type: "text",
			label: m("Name"),
			required: !0
		}],
		values: { name: V(e) },
		confirm: m("Rename")
	}), n = String(t?.name ?? "").trim();
	if (!n || n === V(e)) return null;
	try {
		let t = await f("media-folders/rename", {
			path: e,
			to: H(e) ? `${H(e)}/${n}` : n
		});
		return l("media/"), t.path;
	} catch (e) {
		return R.error(e), null;
	}
}
async function K(e) {
	if (!await F({
		title: m("Delete “{name}”?", { name: V(e) }),
		description: m("Its files move to the folder above."),
		confirm: m("Delete"),
		danger: !0
	})) return !1;
	try {
		return await f("media-folders/delete", { path: e }), l("media/"), !0;
	} catch (e) {
		return R.error(e), !1;
	}
}
function se(e, t, n) {
	return e === null || !U(e, t) ? e : n === null ? H(t) || null : n + e.slice(t.length);
}
function ce({ folders: e, value: t, onChange: n, root: r, actions: i, current: a, className: o }) {
	let s = (e, r, i, o, s) => /* @__PURE__ */ B("div", {
		role: "listitem",
		className: "cms-reveal-row group relative flex items-center",
		children: [/* @__PURE__ */ B(b, {
			variant: "ghost",
			"aria-pressed": t === e,
			onClick: () => n(e),
			className: P("h-8 min-w-0 flex-1 justify-start gap-2 rounded-md pr-2 font-normal", s ? "pr-8" : void 0),
			style: { paddingLeft: 8 + o * 16 },
			children: [
				/* @__PURE__ */ z(w, {
					name: i,
					size: 16,
					className: "shrink-0 text-muted"
				}),
				/* @__PURE__ */ z("span", {
					className: "min-w-0 flex-1 truncate text-left",
					children: r
				}),
				a !== void 0 && a === e && /* @__PURE__ */ z("span", {
					className: "shrink-0 text-xs text-faint",
					children: m("Current")
				})
			]
		}), s && /* @__PURE__ */ z("div", {
			className: "cms-reveal absolute right-1 flex items-center",
			children: s
		})]
	}, e ?? "");
	return /* @__PURE__ */ B("div", {
		role: "list",
		className: P("space-y-px", o),
		children: [s(r.value, r.label, "media", 0), e.map((e) => s(e, V(e), "folder", e.split("/").length - 1, i?.(e)))]
	});
}
function le(e, t) {
	return [
		{
			label: m("New Folder"),
			icon: "plus",
			onSelect: () => void W(e).then((e) => e && t(void 0, e))
		},
		{
			label: m("Rename"),
			icon: "edit",
			onSelect: () => void G(e).then((e) => e && t(e))
		},
		{
			label: m("Delete Folder"),
			icon: "trash",
			danger: !0,
			onSelect: () => void K(e).then((e) => e && t(null))
		}
	];
}
function ue({ files: e, folders: t, onClose: n }) {
	let r = e.every((t) => t.folder === e[0].folder) ? e[0].folder : null, [i, a] = v(null), [o, s] = v([]), [c, u] = v(!1), d = [.../* @__PURE__ */ new Set([...t, ...o])].sort(), p = async () => {
		u(!0);
		try {
			let t = await f("media/move", {
				ids: e.map((e) => e.id),
				folder: i ?? ""
			});
			l("media/"), n(t.folder);
		} catch (e) {
			R.error(e), u(!1);
		}
	};
	return /* @__PURE__ */ B(x, {
		open: !0,
		onOpenChange: (e) => !e && n(),
		size: "sm",
		title: m("Move to Folder"),
		onSubmit: () => void p(),
		submitLabel: m("Move"),
		submitDisabled: i === null || i === r,
		busy: c,
		children: [/* @__PURE__ */ z(ce, {
			folders: d,
			value: i,
			current: r,
			onChange: (e) => a(e ?? ""),
			root: {
				value: "",
				label: m("No Folder")
			}
		}), /* @__PURE__ */ z(b, {
			variant: "ghost",
			icon: "plus",
			className: "mt-1 w-full justify-start px-2 font-normal text-muted",
			onClick: () => void W(i ?? r ?? "").then((e) => {
				e && (s((t) => [...t, e]), a(e));
			}),
			children: m("New Folder")
		})]
	});
}
function q({ close: e }) {
	let t = _(!1);
	return g(() => {
		t.current || (t.current = !0, W(o.current).then((t) => {
			t && o.show?.(t), e?.();
		}));
	}, []), null;
}
// admin/src/actions.ts
var J = (e) => e.kind === "entry" && e.collection ? `/content/${e.collection}/${e.id}` : e.kind === "global" ? `/globals/${e.id}` : void 0;
function de(e) {
	let t = [...new Set(e)], n = t.slice(0, 3), r = new Intl.ListFormat(u(), { type: t.length > 3 ? "unit" : "conjunction" }).format(n);
	return t.length > 3 ? m("{names} and {count} more", {
		names: r,
		count: t.length - 3
	}) : r;
}
async function fe(e) {
	if (!e.length) return [];
	let t;
	try {
		if (e.length === 1) {
			let { usedBy: n } = await f("media/get", { id: e[0].id });
			n.length && (t = m("It is used in {where} and will be missing there.", { where: de(n.map((e) => e.title)) }));
		} else {
			let { unused: n } = await f("media/report"), r = e.filter((e) => !n.includes(e.id)).length;
			r && (t = d(r, "{count} of them is in use and will be missing there.", "{count} of them are in use and will be missing there."));
		}
	} catch (e) {
		return R.error(e), [];
	}
	let n = e.length === 1 ? m("Delete “{name}”?", { name: e[0].name }) : d(e.length, "Delete {count} file?", "Delete {count} files?");
	if (!await F({
		title: n,
		description: t,
		confirm: m("Delete"),
		danger: !0
	})) return [];
	let r = await Promise.allSettled(e.map((e) => f("media/delete", {
		id: e.id,
		force: !0
	}))), i = r.find((e) => e.status === "rejected");
	return i && R.error(i.reason), l("media/"), e.filter((e, t) => r[t].status === "fulfilled").map((e) => e.id);
}
// admin/src/Crop.tsx
var Y = (e, t, n) => Math.max(t, Math.min(n, e)), X = 4;
function pe({ item: e, src: t, onClose: n }) {
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
		return e === "left" && (r = Y(t(r), 0, a - X)), e === "right" && (a = Y(t(a), r + X, 100)), e === "top" && (i = Y(t(i), 0, o - X)), e === "bottom" && (o = Y(t(o), i + X, 100)), {
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
	}), w = (e, t) => i((n) => {
		let r = t(C(e, n)), [i, a, o, s] = [
			n.x,
			n.y,
			n.x + n.w,
			n.y + n.h
		];
		if (e.left ? i = Y(r.x, 0, o - X) : o = Y(r.x, i + X, 100), e.top ? a = Y(r.y, 0, s - X) : s = Y(r.y, a + X, 100), h === null) return {
			x: i,
			y: a,
			w: o - i,
			h: s - a
		};
		let c = {
			w: e.left ? n.x + n.w : 100 - n.x,
			h: e.top ? n.y + n.h : 100 - n.y
		}, l = Math.max(X, Math.min(o - i, c.w, c.h * h)), u = l / h;
		return {
			x: e.left ? n.x + n.w - l : n.x,
			y: e.top ? n.y + n.h - u : n.y,
			w: l,
			h: u
		};
	}), T = (e) => (t) => {
		let n = t.shiftKey ? 10 : 1, [r, i] = {
			ArrowLeft: [-n, 0],
			ArrowRight: [n, 0],
			ArrowUp: [0, -n],
			ArrowDown: [0, n]
		}[t.key] ?? [];
		r !== void 0 && (t.preventDefault(), w(e, (e) => ({
			x: e.x + r,
			y: e.y + i
		})));
	}, E = (e) => e.currentTarget.hasPointerCapture(e.pointerId), D = async () => {
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
			R.error(e), o(!1);
		}
	}, O = "pointer-events-none absolute bg-black/55", k = "absolute size-3 -translate-x-1/2 -translate-y-1/2 border border-black/80 bg-white after:absolute after:-inset-4 after:content-['']";
	return /* @__PURE__ */ B(x, {
		open: !0,
		onOpenChange: (e) => !e && n(),
		title: m("Crop Image"),
		onSubmit: () => void D(),
		submitLabel: m("Crop"),
		submitDisabled: r.w > 99.9 && r.h > 99.9,
		busy: a,
		children: [/* @__PURE__ */ z(M, {
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
		}), /* @__PURE__ */ B("div", {
			ref: g,
			className: "relative mx-auto my-2 w-fit max-w-full touch-none select-none bg-sunken",
			children: [
				/* @__PURE__ */ z("img", {
					src: t,
					alt: "",
					draggable: !1,
					className: "block max-h-[44vh] max-w-full",
					onLoad: (t) => u(!!e.width && !!e.height && e.width !== e.height && t.currentTarget.naturalWidth > t.currentTarget.naturalHeight != e.width > e.height)
				}),
				/* @__PURE__ */ z("div", {
					className: `${O} inset-x-0 top-0`,
					style: { height: `${r.y}%` }
				}),
				/* @__PURE__ */ z("div", {
					className: `${O} inset-x-0 bottom-0`,
					style: { top: `${r.y + r.h}%` }
				}),
				/* @__PURE__ */ z("div", {
					className: `${O} left-0`,
					style: {
						top: `${r.y}%`,
						height: `${r.h}%`,
						width: `${r.x}%`
					}
				}),
				/* @__PURE__ */ z("div", {
					className: `${O} right-0`,
					style: {
						top: `${r.y}%`,
						height: `${r.h}%`,
						left: `${r.x + r.w}%`
					}
				}),
				/* @__PURE__ */ B("div", {
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
						if (!E(e)) return;
						let t = S(e);
						i((e) => ({
							...e,
							x: Y(t.x - y.current.x, 0, 100 - e.w),
							y: Y(t.y - y.current.y, 0, 100 - e.h)
						}));
					},
					children: [b.map((e) => /* @__PURE__ */ z("span", {
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
						onKeyDown: T(e),
						onPointerDown: (e) => {
							e.stopPropagation(), e.currentTarget.setPointerCapture(e.pointerId);
						},
						onPointerMove: (t) => {
							if (E(t)) {
								t.stopPropagation();
								let n = S(t);
								w(e, () => n);
							}
						},
						className: k,
						style: {
							left: e.left ? 0 : "100%",
							top: e.top ? 0 : "100%",
							cursor: e.left === e.top ? "nwse-resize" : "nesw-resize"
						}
					}, e.id)), h === null && te.map((e) => {
						let t = e.side === "left" || e.side === "right", n = Math.round(e.side === "left" ? r.x : e.side === "right" ? r.x + r.w : e.side === "top" ? r.y : r.y + r.h);
						return /* @__PURE__ */ z("span", {
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
								if (E(n)) {
									n.stopPropagation();
									let r = S(n);
									ne(e.side, () => t ? r.x : r.y);
								}
							},
							className: k,
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
var Z = (e) => Math.max(0, Math.min(100, Math.round(e)));
function me({ src: e, value: t, onChange: n, disabled: r }) {
	let i = _(null), a = (e) => {
		let t = i.current.getBoundingClientRect();
		n({
			x: Z((e.clientX - t.left) / t.width * 100),
			y: Z((e.clientY - t.top) / t.height * 100)
		});
	};
	return /* @__PURE__ */ B("div", {
		ref: i,
		className: P("relative mx-auto w-fit max-w-full select-none overflow-hidden rounded-md bg-sunken", !r && "cursor-crosshair"),
		onClick: (e) => !r && a(e),
		children: [/* @__PURE__ */ z("img", {
			src: e,
			alt: "",
			draggable: !1,
			className: "block max-h-[44vh] max-w-full"
		}), /* @__PURE__ */ z("span", {
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
					x: Z(t.x + i[e.key][0]),
					y: Z(t.y + i[e.key][1])
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
			className: P("absolute size-7 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-2 border-black/80 before:absolute before:inset-0 before:rounded-full before:border-2 before:border-white before:content-[''] after:absolute after:-inset-2 after:content-['']", !r && "cursor-grab active:cursor-grabbing"),
			style: {
				left: `${t.x}%`,
				top: `${t.y}%`
			}
		})]
	});
}
// admin/src/FilePanel.tsx
function he({ item: e, folders: n, onClose: r }) {
	let [a, o] = v(e), [u, d] = v({
		name: a.name,
		alt: a.alt ?? "",
		caption: a.caption ?? ""
	}), [p, ee] = v(a.folder), [y, te] = v(!1), [x, ne] = v(!1), [E, O] = v(null), [k, M] = v(a.focal), N = c("media.edit"), P = h("media/get", { id: a.id }).data?.usedBy ?? [], ie = a.kind === "image" && a.mime !== "image/svg+xml", I = N && [
		"image/jpeg",
		"image/png",
		"image/webp"
	].includes(a.mime) && !!a.width, L = a.url, V = a.thumb ?? L, H = _(null), U = (e) => {
		o(e), M(e.focal), l("media/");
	}, W = async () => {
		O("rotate");
		try {
			U(await f("media/transform", {
				id: a.id,
				rotate: 90
			}));
		} catch (e) {
			R.error(e);
		} finally {
			O(null);
		}
	}, G = async (e) => {
		if (await F({
			title: m("Replace “{name}”?", { name: a.name }),
			description: m("“{file}” takes its place wherever it is used. The file there now is deleted.", { file: e.name }),
			confirm: m("Replace File")
		})) {
			O("replace");
			try {
				U(await t(e, "", void 0, a.id));
			} catch (e) {
				R.error(e);
			} finally {
				O(null);
			}
		}
	}, K = _({
		...u,
		focal: k
	}), se = _(null), ce = _(void 0), le = () => {
		clearTimeout(ce.current);
		let e = se.current;
		if (se.current = null, !e) return;
		let t = {
			...e.draft,
			name: e.draft.name.trim() || K.current.name,
			focal: e.focal
		};
		JSON.stringify(t) !== JSON.stringify(K.current) && (K.current = t, f("media/update", {
			id: a.id,
			...t
		}).then(() => l("media/"), R.error));
	}, q = (e, t) => {
		N && (se.current = {
			draft: e,
			focal: t
		}, clearTimeout(ce.current), ce.current = setTimeout(le, 600));
	};
	return g(() => le, []), /* @__PURE__ */ B("div", {
		className: "flex h-full min-h-0 min-w-0 flex-col",
		children: [/* @__PURE__ */ z(A, {
			title: u.name || a.name,
			onClose: () => {
				le(), r();
			}
		}), /* @__PURE__ */ B("div", {
			className: "flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4",
			children: [
				ie ? N ? /* @__PURE__ */ B("div", { children: [/* @__PURE__ */ z(me, {
					src: V,
					value: k,
					onChange: (e) => {
						M(e), q(u, e);
					}
				}), I && /* @__PURE__ */ B("div", {
					className: "mt-2 flex items-center justify-center gap-2",
					children: [/* @__PURE__ */ z(b, {
						size: "sm",
						icon: "crop",
						disabled: E !== null,
						onClick: () => ne(!0),
						children: m("Crop")
					}), /* @__PURE__ */ z(b, {
						size: "sm",
						icon: "arrow-clockwise",
						loading: E === "rotate",
						disabled: E !== null,
						onClick: () => void W(),
						children: m("Rotate")
					})]
				})] }) : /* @__PURE__ */ z("img", {
					src: V,
					alt: a.alt ?? "",
					className: "mx-auto block max-h-[44vh] max-w-full rounded-md bg-sunken"
				}) : a.kind === "image" ? /* @__PURE__ */ z("img", {
					src: L,
					alt: a.alt ?? "",
					className: "mx-auto block max-h-[44vh] max-w-full rounded-md bg-sunken"
				}) : a.kind === "video" ? /* @__PURE__ */ z("video", {
					src: L,
					controls: !0,
					className: "max-h-[44vh] w-full rounded-md bg-sunken"
				}, L) : /* @__PURE__ */ z(s, {
					item: a,
					size: 28,
					className: "h-32 rounded-md bg-sunken"
				}),
				/* @__PURE__ */ B("dl", {
					className: "m-0 grid grid-cols-[88px_minmax(0,1fr)] items-center gap-y-1 text-xs",
					children: [
						/* @__PURE__ */ z("dt", {
							className: "text-faint",
							children: m("Kind")
						}),
						/* @__PURE__ */ z("dd", {
							className: "m-0 truncate",
							children: i(a)
						}),
						/* @__PURE__ */ z("dt", {
							className: "text-faint",
							children: m("Size")
						}),
						/* @__PURE__ */ z("dd", {
							className: "m-0",
							children: ae(a.size)
						}),
						a.width && /* @__PURE__ */ B(oe, { children: [/* @__PURE__ */ z("dt", {
							className: "text-faint",
							children: m("Dimensions")
						}), /* @__PURE__ */ B("dd", {
							className: "m-0",
							children: [
								a.width,
								" × ",
								a.height
							]
						})] }),
						p && /* @__PURE__ */ B(oe, { children: [/* @__PURE__ */ z("dt", {
							className: "text-faint",
							children: m("Folder")
						}), /* @__PURE__ */ z("dd", {
							className: "m-0 truncate",
							children: p
						})] }),
						/* @__PURE__ */ z("dt", {
							className: "text-faint",
							children: m("URL")
						}),
						/* @__PURE__ */ B("dd", {
							className: "m-0 flex min-w-0 items-center gap-1",
							children: [/* @__PURE__ */ z("span", {
								className: "truncate font-mono",
								children: a.url
							}), /* @__PURE__ */ z(T, {
								icon: "copy",
								label: m("Copy URL"),
								size: "xs",
								onClick: () => void re(new URL(a.url, location.origin).href, {
									copied: m("URL copied"),
									failed: m("Couldn’t copy the URL")
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ z(C, {
					className: "gap-y-4!",
					disabled: !N,
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
						d(n), q(n, k);
					}
				}),
				P.length > 0 && /* @__PURE__ */ z(S, {
					label: m("Used In"),
					children: /* @__PURE__ */ z(D, { children: P.map((e) => /* @__PURE__ */ B(j, {
						to: J(e),
						children: [/* @__PURE__ */ z(w, {
							name: e.kind === "entry" ? "page" : e.kind === "global" ? "globe" : "palette",
							size: 16,
							className: "shrink-0 text-muted"
						}), /* @__PURE__ */ z("span", {
							className: "truncate",
							children: e.title
						})]
					}, `${e.kind}:${e.id}`)) })
				}),
				(N || c("media.delete")) && /* @__PURE__ */ B("div", {
					className: "flex flex-wrap items-center gap-2 pb-0.5",
					children: [
						N && /* @__PURE__ */ z(b, {
							size: "sm",
							icon: "upload",
							loading: E === "replace",
							disabled: E !== null,
							onClick: () => H.current?.click(),
							children: m("Replace File")
						}),
						N && /* @__PURE__ */ z(b, {
							size: "sm",
							icon: "folder",
							onClick: () => te(!0),
							children: m("Move to Folder")
						}),
						c("media.delete") && /* @__PURE__ */ z(b, {
							size: "sm",
							variant: "destructive",
							icon: "trash",
							onClick: async () => {
								le(), (await fe([a])).length && r();
							},
							children: m("Delete File")
						})
					]
				}),
				/* @__PURE__ */ B("div", {
					className: "hidden",
					onSubmit: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ z("input", {
							ref: H,
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
								e.target.value = "", t && G(t);
							}
						}),
						y && /* @__PURE__ */ z(ue, {
							files: [{
								id: a.id,
								folder: p
							}],
							folders: n,
							onClose: (e) => {
								te(!1), e !== void 0 && ee(e);
							}
						}),
						x && /* @__PURE__ */ z(pe, {
							item: a,
							src: V,
							onClose: (e) => {
								ne(!1), e && U(e);
							}
						})
					]
				})
			]
		})]
	});
}
// admin/src/Library.tsx
var ge = (e, t, n, r = {}) => ({
	...r,
	search: e.search || void 0,
	kind: e.kind,
	folder: e.folder,
	page: t,
	perPage: 60,
	sort: n ?? void 0
});
function _e(t) {
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
function Q({ mode: e = "manage", accept: t = "*", except: l, multiple: d = !1, selected: f = [], onSelectionChange: x, autoUpload: S = !1, bar: D = !1 }) {
	let { query: A } = ee(), j = a(t), [M, F] = v(() => D ? {
		search: A.search ?? "",
		kind: r.includes(A.kind ?? "") ? A.kind : "all",
		folder: A.folder || null
	} : {
		search: "",
		kind: j,
		folder: null
	}), { kind: I, folder: R } = M, H = e === "pick" ? {
		accept: t !== "*" && !/^(image|video)\/\*$/.test(t) && t !== "application/pdf" ? t : void 0,
		except: l
	} : {};
	g(() => {
		D && p({
			search: M.search || null,
			kind: M.kind === "all" ? null : M.kind,
			folder: M.folder
		});
	}, [D, M]), g(() => {
		if (D) return o.current = R ?? "", o.show = (e) => Se("folder", e), () => {
			o.current = "", o.show = void 0;
		};
	}, [D, R]);
	let [U, W] = v(1), [G, K] = v(() => L("overview.media", "grid").sort), [q, J] = v(/* @__PURE__ */ new Set()), [de, Y] = v(!1), [X, pe] = v(null), [Z, me] = v(null), Q = h("media/list", ge(M, U, G, H), { placeholderData: (e) => e }), ve = Q.data?.items ?? [], $ = Q.data?.folders ?? [], ye = c("media.upload"), be = e === "manage" && c("media.edit"), xe = (e) => le(e, (t, n) => Se("folder", n ?? se(R, e, t ?? null))), Se = (e, t) => {
		W(1), J(/* @__PURE__ */ new Set()), F((n) => ({
			...n,
			[e]: e === "kind" ? t || "all" : t
		}));
	}, Ce = (n) => [{
		handle: "files",
		type: "json",
		component: "media-upload",
		label: m("Upload"),
		multiple: e === "manage" || d,
		accept: t === "*" ? void 0 : t,
		...n
	}], we = async (t) => {
		let r = await n(t, R ?? "");
		if (r.length && e === "pick") {
			let e = d ? [...f, ...r.map((e) => e.id)] : [r[0].id];
			x?.(e, r);
		}
	}, Te = (t) => {
		if (e === "manage") return pe(t);
		let n = d ? f.includes(t.id) ? f.filter((e) => e !== t.id) : [...f, t.id] : [t.id];
		x?.(n, [t]);
	}, Ee = ye ? /* @__PURE__ */ z(C, {
		layout: "inline",
		bare: !0,
		fields: Ce({
			handle: "files-here",
			variant: "secondary"
		}),
		values: {},
		onChange: (e, t) => void we(t)
	}) : null, De = (t = !1, n = e === "manage" ? "primary" : "secondary") => ye ? /* @__PURE__ */ z(C, {
		layout: "inline",
		bare: !0,
		fields: Ce({
			variant: n,
			autofocus: t
		}),
		values: {},
		onChange: (e, t) => void we(t)
	}) : null, Oe = (t, n, r = ve) => {
		if (e === "pick") {
			let e = d ? [...new Set(n ? [...f, ...t] : f.filter((e) => !t.includes(e)))] : n ? t.slice(0, 1) : [];
			x?.(e, r.filter((t) => e.includes(t.id)));
		} else J((e) => {
			let r = new Set(e);
			return t.forEach((e) => n ? r.add(e) : r.delete(e)), r;
		});
	}, ke = async (e) => {
		if (!de) {
			Y(!0);
			try {
				let t = await fe(ve.filter((t) => e.includes(t.id)));
				J((e) => new Set([...e].filter((e) => !t.includes(e))));
			} finally {
				Y(!1);
			}
		}
	}, [Ae, je] = v(!1), Me = _(0), Ne = (e) => ye && e.dataTransfer.types.includes("Files"), Pe = {
		onDragEnter: (e) => {
			Ne(e) && (Me.current++, je(!0));
		},
		onDragOver: (e) => {
			Ne(e) && (e.preventDefault(), e.dataTransfer.dropEffect = "copy");
		},
		onDragLeave: (e) => {
			Ne(e) && --Me.current <= 0 && (Me.current = 0, je(!1));
		},
		onDrop: (t) => {
			if (!Ne(t)) return;
			t.preventDefault(), Me.current = 0, je(!1);
			let n = Array.from(t.dataTransfer.files);
			we(e === "pick" && !d ? n.slice(0, 1) : n);
		}
	}, Fe = (e) => e.thumb ? /* @__PURE__ */ z("img", {
		src: e.thumb,
		alt: e.alt ?? "",
		loading: "lazy",
		className: P("absolute inset-0 size-full", ie(e.thumb) ? "object-contain p-4" : "object-cover"),
		style: ie(e.thumb) ? void 0 : { objectPosition: `${e.focal.x}% ${e.focal.y}%` }
	}) : /* @__PURE__ */ z(s, { item: e }), Ie = !!M.search || I !== (D ? "all" : j), Le = !Ie && R === null && !Q.isError && Q.data?.total === 0, Re = !D && j !== "all", ze = $.length > 0, Be = e === "pick";
	return /* @__PURE__ */ B("div", {
		className: P("relative min-w-0", ze && "md:grid md:grid-cols-[200px_minmax(0,1fr)] md:items-start md:gap-6", Ae && "rounded-lg outline-2 -outline-offset-2 outline-focus"),
		...Pe,
		children: [
			ze && /* @__PURE__ */ z("nav", {
				"aria-label": m("Folders"),
				className: "mt-1.5 max-md:hidden",
				children: /* @__PURE__ */ z(ce, {
					folders: $,
					value: R,
					onChange: (e) => Se("folder", e),
					root: {
						value: null,
						label: m("All Files")
					},
					actions: be ? (e) => /* @__PURE__ */ z(O, {
						trigger: /* @__PURE__ */ z(T, {
							icon: "more",
							label: m("Actions for {name}", { name: V(e) }),
							size: "xs"
						}),
						items: xe(e)
					}) : void 0
				})
			}),
			Ae && /* @__PURE__ */ z("div", {
				className: "pointer-events-none absolute inset-0 z-sticky flex justify-center rounded-lg bg-bg/80",
				children: /* @__PURE__ */ B("span", {
					className: "sticky top-[30vh] mt-[20vh] flex h-fit items-center gap-2 rounded-md bg-float px-3 py-2 text-sm font-medium text-ink shadow-pop ring-1 ring-border-strong",
					children: [/* @__PURE__ */ z(w, {
						name: "upload",
						size: 16
					}), R ? m("Drop to Upload to {folder}", { folder: V(R) }) : m("Drop to Upload")]
				})
			}),
			/* @__PURE__ */ B("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ z(te, {
						id: "media",
						label: m("Media"),
						items: ve,
						source: {
							ability: "media/list",
							input: ge(M, 1, G, H),
							perPage: 60
						},
						rowKey: (e) => e.id,
						onRowClick: Te,
						defaultView: "grid",
						image: Fe,
						pagination: Q.data && {
							page: Q.data.page,
							pages: Q.data.pages,
							total: Q.data.total,
							perPage: 60,
							onPage: W
						},
						loading: Q.isLoading,
						stale: Q.isPlaceholderData,
						error: Q.isError,
						onRetry: () => void Q.refetch(),
						dates: (e) => ({
							publishedAt: null,
							updatedAt: e.updatedAt
						}),
						sort: G,
						dateSort: { updated: "updated_at" },
						onSort: (e) => {
							W(1), K(e);
						},
						selection: Be ? void 0 : {
							ids: q,
							onSelect: Oe
						},
						selected: Be ? (e) => f.includes(e.id) : void 0,
						plain: Be,
						toolbar: Le ? void 0 : /* @__PURE__ */ B(oe, { children: [
							/* @__PURE__ */ z(C, {
								layout: "inline",
								bare: !0,
								className: "flex min-w-0 flex-wrap items-center gap-2 max-sm:w-full",
								fields: [..._e(!Re), ...$.length ? [{
									handle: "folder",
									type: "select",
									label: m("Folder"),
									size: "sm",
									placeholder: m("All Files"),
									options: $.map((e) => ({
										value: e,
										label: "\xA0\xA0".repeat(e.split("/").length - 1) + V(e),
										icon: "folder"
									})),
									className: "w-full sm:w-44 md:hidden"
								}] : []],
								values: {
									...M,
									kind: I === "all" ? null : I
								},
								onChange: Se
							}),
							be && R && /* @__PURE__ */ z(O, {
								trigger: /* @__PURE__ */ z(T, {
									icon: "more",
									label: m("Actions for {name}", { name: V(R) }),
									size: "sm",
									className: "md:hidden"
								}),
								items: xe(R)
							}),
							!D && De(S)
						] }),
						columns: Be ? [{
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
								render: (e) => ae(e.size)
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
								render: (e) => e.kind === "image" ? e.alt ? /* @__PURE__ */ z(y, {
									tone: "success",
									children: m("Added")
								}) : /* @__PURE__ */ z(y, {
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
						actions: Be ? void 0 : (t) => /* @__PURE__ */ z(O, {
							trigger: /* @__PURE__ */ z(T, {
								icon: "more",
								label: m("Actions for {name}", { name: t.name }),
								size: "xs"
							}),
							items: [
								{
									label: m("Open"),
									icon: "edit",
									onSelect: () => Te(t)
								},
								{
									label: m("Copy URL"),
									icon: "copy",
									onSelect: () => void re(new URL(t.url, location.origin).href, {
										copied: m("URL copied"),
										failed: m("Couldn’t copy the URL")
									})
								},
								be && {
									label: m("Move to Folder"),
									icon: "folder",
									onSelect: () => me([t])
								},
								e === "manage" && c("media.delete") && {
									label: m("Delete"),
									icon: "trash",
									danger: !0,
									disabled: de,
									onSelect: () => void ke([t.id])
								}
							]
						}),
						empty: Ie ? /* @__PURE__ */ z(k, { onClear: () => {
							F((e) => ({
								search: "",
								kind: D ? "all" : j,
								folder: e.folder
							})), W(1);
						} }) : /* @__PURE__ */ z(ne, {
							icon: R === null ? "media" : "folder",
							title: m(R === null ? I === "image" ? "No images yet" : I === "video" ? "No videos yet" : "No files yet" : "No files in this folder"),
							action: D ? Ee : De(!1, "secondary")
						})
					}),
					D && S && /* @__PURE__ */ z("span", {
						className: "hidden",
						children: De(!0)
					}),
					e === "manage" && /* @__PURE__ */ B(N, {
						count: q.size,
						onClear: () => J(/* @__PURE__ */ new Set()),
						children: [be && /* @__PURE__ */ z(b, {
							size: "sm",
							variant: "ghost",
							onClick: () => me(ve.filter((e) => q.has(e.id))),
							children: m("Move to Folder")
						}), c("media.delete") && /* @__PURE__ */ z(b, {
							size: "sm",
							variant: "destructive",
							loading: de,
							onClick: () => void ke([...q]),
							children: m("Delete")
						})]
					}),
					e === "manage" && /* @__PURE__ */ z(E, {
						sheet: !0,
						open: !!X,
						onOpenChange: (e) => !e && pe(null),
						title: X?.name ?? m("Media"),
						children: X && /* @__PURE__ */ z(he, {
							item: ve.find((e) => e.id === X.id) ?? X,
							folders: $,
							onClose: () => pe(null)
						}, X.id)
					}),
					Z && Z.length > 0 && /* @__PURE__ */ z(ue, {
						files: Z,
						folders: $,
						onClose: (e) => {
							me(null), e !== void 0 && J(/* @__PURE__ */ new Set());
						}
					})
				]
			})
		]
	});
}
export { q as n, Q as t };
