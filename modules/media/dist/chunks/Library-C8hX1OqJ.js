import { a as e, c as t, l as n, n as r, o as i, r as a, s as o, t as s } from "./kinds-BDpWzonQ.js";
import { can as c, invalidate as l, locale as u, plural as d, run as f, setQuery as p, t as m, useAbility as h, useLocation as ee } from "@letterncms/sdk";
import { useEffect as g, useRef as _, useState as v } from "react";
import { Badge as y, Button as b, DataView as te, Dialog as x, EmptyState as S, Field as C, Fields as w, Icon as T, IconButton as E, List as D, Menu as O, NoMatches as k, Row as A, Segmented as j, SelectionBar as ne, cn as M, confirm as N, copyText as re, formatBytes as ie, prompt as P, readViewPrefs as ae, toast as F } from "@letterncms/ui";
import { Fragment as oe, jsx as I, jsxs as L } from "react/jsx-runtime";
// admin/src/Folders.tsx
var R = (e) => e.slice(e.lastIndexOf("/") + 1), z = (e) => e.includes("/") ? e.slice(0, e.lastIndexOf("/")) : "", se = (e, t) => e === t || e.startsWith(`${t}/`);
async function B(e = "") {
	let t = await P({
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
		return F.error(e), null;
	}
}
async function V(e) {
	let t = await P({
		title: m("Rename Folder"),
		fields: [{
			handle: "name",
			type: "text",
			label: m("Name"),
			required: !0
		}],
		values: { name: R(e) },
		confirm: m("Rename")
	}), n = String(t?.name ?? "").trim();
	if (!n || n === R(e)) return null;
	try {
		let t = await f("media-folders/rename", {
			path: e,
			to: z(e) ? `${z(e)}/${n}` : n
		});
		return l("media/"), t.path;
	} catch (e) {
		return F.error(e), null;
	}
}
async function H(e) {
	if (!await N({
		title: m("Delete “{name}”?", { name: R(e) }),
		description: m("Its files move to the folder above."),
		confirm: m("Delete"),
		danger: !0
	})) return !1;
	try {
		return await f("media-folders/delete", { path: e }), l("media/"), !0;
	} catch (e) {
		return F.error(e), !1;
	}
}
function ce(e, t, n) {
	return e === null || !se(e, t) ? e : n === null ? z(t) || null : n + e.slice(t.length);
}
function U({ folders: e, value: t, onChange: n, root: r, actions: i, current: a, className: o }) {
	let s = (e, r, i, o, s) => /* @__PURE__ */ L("div", {
		role: "listitem",
		className: "cms-reveal-row group relative flex items-center",
		children: [/* @__PURE__ */ L(b, {
			variant: "ghost",
			"aria-pressed": t === e,
			onClick: () => n(e),
			className: M("h-8 min-w-0 flex-1 justify-start gap-2 rounded-md pr-2 font-normal", s ? "pr-8" : void 0),
			style: { paddingLeft: 8 + o * 16 },
			children: [
				/* @__PURE__ */ I(T, {
					name: i,
					size: 16,
					className: "shrink-0 text-muted"
				}),
				/* @__PURE__ */ I("span", {
					className: "min-w-0 flex-1 truncate text-left",
					children: r
				}),
				a !== void 0 && a === e && /* @__PURE__ */ I("span", {
					className: "shrink-0 text-xs text-faint",
					children: m("Current")
				})
			]
		}), s && /* @__PURE__ */ I("div", {
			className: "cms-reveal absolute right-1 flex items-center",
			children: s
		})]
	}, e ?? "");
	return /* @__PURE__ */ L("div", {
		role: "list",
		className: M("space-y-px", o),
		children: [s(r.value, r.label, "media", 0), e.map((e) => s(e, R(e), "folder", e.split("/").length - 1, i?.(e)))]
	});
}
function le(e, t) {
	return [
		{
			label: m("New Folder"),
			icon: "plus",
			onSelect: () => void B(e).then((e) => e && t(void 0, e))
		},
		{
			label: m("Rename"),
			icon: "edit",
			onSelect: () => void V(e).then((e) => e && t(e))
		},
		{
			label: m("Delete Folder"),
			icon: "trash",
			danger: !0,
			onSelect: () => void H(e).then((e) => e && t(null))
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
			F.error(e), u(!1);
		}
	};
	return /* @__PURE__ */ L(x, {
		open: !0,
		onOpenChange: (e) => !e && n(),
		size: "sm",
		title: m("Move to Folder"),
		onSubmit: () => void p(),
		submitLabel: m("Move"),
		submitDisabled: i === null || i === r,
		busy: c,
		children: [/* @__PURE__ */ I(U, {
			folders: d,
			value: i,
			current: r,
			onChange: (e) => a(e ?? ""),
			root: {
				value: "",
				label: m("No Folder")
			}
		}), /* @__PURE__ */ I(b, {
			variant: "ghost",
			icon: "plus",
			className: "mt-1 w-full justify-start px-2 font-normal text-muted",
			onClick: () => void B(i ?? r ?? "").then((e) => {
				e && (s((t) => [...t, e]), a(e));
			}),
			children: m("New Folder")
		})]
	});
}
function de({ close: e }) {
	let t = _(!1);
	return g(() => {
		t.current || (t.current = !0, B(o.current).then((t) => {
			t && o.show?.(t), e?.();
		}));
	}, []), null;
}
// admin/src/actions.ts
var W = (e) => e.kind === "entry" && e.collection ? `/content/${e.collection}/${e.id}` : e.kind === "global" ? `/globals/${e.id}` : void 0;
function G(e) {
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
			n.length && (t = m("It is used in {where} and will be missing there.", { where: G(n.map((e) => e.title)) }));
		} else {
			let { unused: n } = await f("media/report"), r = e.filter((e) => !n.includes(e.id)).length;
			r && (t = d(r, "{count} of them is in use and will be missing there.", "{count} of them are in use and will be missing there."));
		}
	} catch (e) {
		return F.error(e), [];
	}
	let n = e.length === 1 ? m("Delete “{name}”?", { name: e[0].name }) : d(e.length, "Delete {count} file?", "Delete {count} files?");
	if (!await N({
		title: n,
		description: t,
		confirm: m("Delete"),
		danger: !0
	})) return [];
	let r = await Promise.allSettled(e.map((e) => f("media/delete", {
		id: e.id,
		force: !0
	}))), i = r.find((e) => e.status === "rejected");
	return i && F.error(i.reason), l("media/"), e.filter((e, t) => r[t].status === "fulfilled").map((e) => e.id);
}
// admin/src/Crop.tsx
var K = (e, t, n) => Math.max(t, Math.min(n, e)), q = 4;
function J({ item: e, src: t, onClose: n }) {
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
	], S = (e, t) => i((n) => {
		let [r, i, a, o] = [
			n.x,
			n.y,
			n.x + n.w,
			n.y + n.h
		];
		return e === "left" && (r = K(t(r), 0, a - q)), e === "right" && (a = K(t(a), r + q, 100)), e === "top" && (i = K(t(i), 0, o - q)), e === "bottom" && (o = K(t(o), i + q, 100)), {
			x: r,
			y: i,
			w: a - r,
			h: o - i
		};
	}), C = (e) => {
		let t = g.current.getBoundingClientRect();
		return {
			x: (e.clientX - t.left) / t.width * 100,
			y: (e.clientY - t.top) / t.height * 100
		};
	}, w = (e, t = r) => ({
		x: e.left ? t.x : t.x + t.w,
		y: e.top ? t.y : t.y + t.h
	}), T = (e, t) => i((n) => {
		let r = t(w(e, n)), [i, a, o, s] = [
			n.x,
			n.y,
			n.x + n.w,
			n.y + n.h
		];
		if (e.left ? i = K(r.x, 0, o - q) : o = K(r.x, i + q, 100), e.top ? a = K(r.y, 0, s - q) : s = K(r.y, a + q, 100), h === null) return {
			x: i,
			y: a,
			w: o - i,
			h: s - a
		};
		let c = {
			w: e.left ? n.x + n.w : 100 - n.x,
			h: e.top ? n.y + n.h : 100 - n.y
		}, l = Math.max(q, Math.min(o - i, c.w, c.h * h)), u = l / h;
		return {
			x: e.left ? n.x + n.w - l : n.x,
			y: e.top ? n.y + n.h - u : n.y,
			w: l,
			h: u
		};
	}), E = (e) => (t) => {
		let n = t.shiftKey ? 10 : 1, [r, i] = {
			ArrowLeft: [-n, 0],
			ArrowRight: [n, 0],
			ArrowUp: [0, -n],
			ArrowDown: [0, n]
		}[t.key] ?? [];
		r !== void 0 && (t.preventDefault(), T(e, (e) => ({
			x: e.x + r,
			y: e.y + i
		})));
	}, D = (e) => e.currentTarget.hasPointerCapture(e.pointerId), O = async () => {
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
			F.error(e), o(!1);
		}
	}, k = "pointer-events-none absolute bg-black/55", A = "absolute size-3 -translate-x-1/2 -translate-y-1/2 border border-black/80 bg-white after:absolute after:-inset-4 after:content-['']";
	return /* @__PURE__ */ L(x, {
		open: !0,
		onOpenChange: (e) => !e && n(),
		title: m("Crop Image"),
		onSubmit: () => void O(),
		submitLabel: m("Crop"),
		submitDisabled: r.w > 99.9 && r.h > 99.9,
		busy: a,
		children: [/* @__PURE__ */ I(j, {
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
		}), /* @__PURE__ */ L("div", {
			ref: g,
			className: "relative mx-auto my-2 w-fit max-w-full touch-none select-none bg-sunken",
			children: [
				/* @__PURE__ */ I("img", {
					src: t,
					alt: "",
					draggable: !1,
					className: "block max-h-[44vh] max-w-full",
					onLoad: (t) => u(!!e.width && !!e.height && e.width !== e.height && t.currentTarget.naturalWidth > t.currentTarget.naturalHeight != e.width > e.height)
				}),
				/* @__PURE__ */ I("div", {
					className: `${k} inset-x-0 top-0`,
					style: { height: `${r.y}%` }
				}),
				/* @__PURE__ */ I("div", {
					className: `${k} inset-x-0 bottom-0`,
					style: { top: `${r.y + r.h}%` }
				}),
				/* @__PURE__ */ I("div", {
					className: `${k} left-0`,
					style: {
						top: `${r.y}%`,
						height: `${r.h}%`,
						width: `${r.x}%`
					}
				}),
				/* @__PURE__ */ I("div", {
					className: `${k} right-0`,
					style: {
						top: `${r.y}%`,
						height: `${r.h}%`,
						left: `${r.x + r.w}%`
					}
				}),
				/* @__PURE__ */ L("div", {
					className: "absolute cursor-move border border-white ring-1 ring-black/50",
					style: {
						left: `${r.x}%`,
						top: `${r.y}%`,
						width: `${r.w}%`,
						height: `${r.h}%`
					},
					onPointerDown: (e) => {
						let t = C(e);
						y.current = {
							x: t.x - r.x,
							y: t.y - r.y
						}, e.currentTarget.setPointerCapture(e.pointerId);
					},
					onPointerMove: (e) => {
						if (!D(e)) return;
						let t = C(e);
						i((e) => ({
							...e,
							x: K(t.x - y.current.x, 0, 100 - e.w),
							y: K(t.y - y.current.y, 0, 100 - e.h)
						}));
					},
					children: [b.map((e) => /* @__PURE__ */ I("span", {
						role: "slider",
						tabIndex: 0,
						"aria-label": e.label,
						"aria-valuemin": 0,
						"aria-valuemax": 100,
						"aria-valuenow": Math.round(w(e).x),
						"aria-valuetext": m("{x}% from the left, {y}% from the top", {
							x: Math.round(w(e).x),
							y: Math.round(w(e).y)
						}),
						onKeyDown: E(e),
						onPointerDown: (e) => {
							e.stopPropagation(), e.currentTarget.setPointerCapture(e.pointerId);
						},
						onPointerMove: (t) => {
							if (D(t)) {
								t.stopPropagation();
								let n = C(t);
								T(e, () => n);
							}
						},
						className: A,
						style: {
							left: e.left ? 0 : "100%",
							top: e.top ? 0 : "100%",
							cursor: e.left === e.top ? "nwse-resize" : "nesw-resize"
						}
					}, e.id)), h === null && te.map((e) => {
						let t = e.side === "left" || e.side === "right", n = Math.round(e.side === "left" ? r.x : e.side === "right" ? r.x + r.w : e.side === "top" ? r.y : r.y + r.h);
						return /* @__PURE__ */ I("span", {
							role: "slider",
							tabIndex: 0,
							"aria-label": e.label,
							"aria-orientation": t ? "horizontal" : "vertical",
							"aria-valuemin": 0,
							"aria-valuemax": 100,
							"aria-valuenow": n,
							onKeyDown: (n) => {
								let r = (n.shiftKey ? 10 : 1) * ((t ? n.key === "ArrowRight" : n.key === "ArrowDown") ? 1 : (t ? n.key === "ArrowLeft" : n.key === "ArrowUp") ? -1 : 0);
								r !== 0 && (n.preventDefault(), S(e.side, (e) => e + r));
							},
							onPointerDown: (e) => {
								e.stopPropagation(), e.currentTarget.setPointerCapture(e.pointerId);
							},
							onPointerMove: (n) => {
								if (D(n)) {
									n.stopPropagation();
									let r = C(n);
									S(e.side, () => t ? r.x : r.y);
								}
							},
							className: A,
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
var Y = (e) => Math.max(0, Math.min(100, Math.round(e)));
function pe({ src: e, value: t, onChange: n, disabled: r }) {
	let i = _(null), a = (e) => {
		let t = i.current.getBoundingClientRect();
		n({
			x: Y((e.clientX - t.left) / t.width * 100),
			y: Y((e.clientY - t.top) / t.height * 100)
		});
	};
	return /* @__PURE__ */ L("div", {
		ref: i,
		className: M("relative mx-auto w-fit max-w-full select-none overflow-hidden rounded-md bg-sunken", !r && "cursor-crosshair"),
		onClick: (e) => !r && a(e),
		children: [/* @__PURE__ */ I("img", {
			src: e,
			alt: "",
			draggable: !1,
			className: "block max-h-[44vh] max-w-full"
		}), /* @__PURE__ */ I("span", {
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
					x: Y(t.x + i[e.key][0]),
					y: Y(t.y + i[e.key][1])
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
			className: M("absolute size-7 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-2 border-black/80 before:absolute before:inset-0 before:rounded-full before:border-2 before:border-white before:content-[''] after:absolute after:-inset-2 after:content-['']", !r && "cursor-grab active:cursor-grabbing"),
			style: {
				left: `${t.x}%`,
				top: `${t.y}%`
			}
		})]
	});
}
// admin/src/FileDialog.tsx
function me({ item: e, folders: n, onClose: r }) {
	let [a, o] = v(e), [u, d] = v({
		name: a.name,
		alt: a.alt ?? "",
		caption: a.caption ?? ""
	}), [p, ee] = v(a.folder), [g, y] = v(!1), [te, S] = v(!1), [O, k] = v(null), [j, ne] = v(a.focal), [M, P] = v(!1), ae = u.name !== a.name || u.alt !== (a.alt ?? "") || u.caption !== (a.caption ?? "") || j.x !== a.focal.x || j.y !== a.focal.y, R = c("media.edit"), z = h("media/get", { id: a.id }).data?.usedBy ?? [], se = a.kind === "image" && a.mime !== "image/svg+xml", B = R && [
		"image/jpeg",
		"image/png",
		"image/webp"
	].includes(a.mime) && !!a.width, V = a.url, H = a.thumb ?? V, ce = _(null), U = (e) => {
		o(e), ne(e.focal), l("media/");
	}, le = async () => {
		k("rotate");
		try {
			U(await f("media/transform", {
				id: a.id,
				rotate: 90
			}));
		} catch (e) {
			F.error(e);
		} finally {
			k(null);
		}
	}, de = async (e) => {
		if (await N({
			title: m("Replace “{name}”?", { name: a.name }),
			description: m("“{file}” takes its place wherever it is used. The file there now is deleted.", { file: e.name }),
			confirm: m("Replace File")
		})) {
			k("replace");
			try {
				U(await t(e, "", void 0, a.id));
			} catch (e) {
				F.error(e);
			} finally {
				k(null);
			}
		}
	}, G = async () => {
		P(!0);
		try {
			await f("media/update", {
				id: a.id,
				...u,
				focal: j
			}), l("media/"), r();
		} catch (e) {
			F.error(e), P(!1);
		}
	};
	return te ? /* @__PURE__ */ I(J, {
		item: a,
		src: H,
		onClose: (e) => {
			S(!1), e && U(e);
		}
	}) : /* @__PURE__ */ I(x, {
		open: !0,
		onOpenChange: (e) => !e && r(),
		title: a.name,
		...R ? {
			onSubmit: () => void G(),
			submitLabel: m("Save"),
			submitDisabled: !ae,
			busy: M
		} : {},
		children: /* @__PURE__ */ L("div", {
			className: "flex min-w-0 flex-col gap-4",
			children: [
				se ? R ? /* @__PURE__ */ L("div", { children: [/* @__PURE__ */ I(pe, {
					src: H,
					value: j,
					onChange: ne
				}), B && /* @__PURE__ */ L("div", {
					className: "mt-2 flex items-center justify-center gap-2",
					children: [/* @__PURE__ */ I(b, {
						size: "sm",
						icon: "crop",
						disabled: O !== null,
						onClick: () => S(!0),
						children: m("Crop")
					}), /* @__PURE__ */ I(b, {
						size: "sm",
						icon: "arrow-clockwise",
						loading: O === "rotate",
						disabled: O !== null,
						onClick: () => void le(),
						children: m("Rotate")
					})]
				})] }) : /* @__PURE__ */ I("img", {
					src: H,
					alt: a.alt ?? "",
					className: "mx-auto block max-h-[44vh] max-w-full rounded-md bg-sunken"
				}) : a.kind === "image" ? /* @__PURE__ */ I("img", {
					src: V,
					alt: a.alt ?? "",
					className: "mx-auto block max-h-[44vh] max-w-full rounded-md bg-sunken"
				}) : a.kind === "video" ? /* @__PURE__ */ I("video", {
					src: V,
					controls: !0,
					className: "max-h-[44vh] w-full rounded-md bg-sunken"
				}, V) : /* @__PURE__ */ I(s, {
					item: a,
					size: 28,
					className: "h-32 rounded-md bg-sunken"
				}),
				/* @__PURE__ */ L("dl", {
					className: "m-0 grid grid-cols-[88px_minmax(0,1fr)] items-center gap-y-1 text-xs",
					children: [
						/* @__PURE__ */ I("dt", {
							className: "text-faint",
							children: m("Kind")
						}),
						/* @__PURE__ */ I("dd", {
							className: "m-0 truncate",
							children: i(a)
						}),
						/* @__PURE__ */ I("dt", {
							className: "text-faint",
							children: m("Size")
						}),
						/* @__PURE__ */ I("dd", {
							className: "m-0",
							children: ie(a.size)
						}),
						a.width && /* @__PURE__ */ L(oe, { children: [/* @__PURE__ */ I("dt", {
							className: "text-faint",
							children: m("Dimensions")
						}), /* @__PURE__ */ L("dd", {
							className: "m-0",
							children: [
								a.width,
								" × ",
								a.height
							]
						})] }),
						p && /* @__PURE__ */ L(oe, { children: [/* @__PURE__ */ I("dt", {
							className: "text-faint",
							children: m("Folder")
						}), /* @__PURE__ */ I("dd", {
							className: "m-0 truncate",
							children: p
						})] }),
						/* @__PURE__ */ I("dt", {
							className: "text-faint",
							children: m("URL")
						}),
						/* @__PURE__ */ L("dd", {
							className: "m-0 flex min-w-0 items-center gap-1",
							children: [/* @__PURE__ */ I("span", {
								className: "truncate font-mono",
								children: a.url
							}), /* @__PURE__ */ I(E, {
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
				/* @__PURE__ */ I(w, {
					className: "gap-y-4!",
					disabled: !R,
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
					onChange: (e, t) => d({
						...u,
						[e]: t ?? ""
					})
				}),
				z.length > 0 && /* @__PURE__ */ I(C, {
					label: m("Used In"),
					children: /* @__PURE__ */ I(D, { children: z.map((e) => /* @__PURE__ */ L(A, {
						to: W(e),
						children: [/* @__PURE__ */ I(T, {
							name: e.kind === "entry" ? "page" : e.kind === "global" ? "globe" : "palette",
							size: 16,
							className: "shrink-0 text-muted"
						}), /* @__PURE__ */ I("span", {
							className: "truncate",
							children: e.title
						})]
					}, `${e.kind}:${e.id}`)) })
				}),
				(R || c("media.delete")) && /* @__PURE__ */ L("div", {
					className: "flex flex-wrap items-center gap-2 pb-0.5",
					children: [
						R && /* @__PURE__ */ I(b, {
							size: "sm",
							icon: "upload",
							loading: O === "replace",
							disabled: O !== null,
							onClick: () => ce.current?.click(),
							children: m("Replace File")
						}),
						R && /* @__PURE__ */ I(b, {
							size: "sm",
							icon: "folder",
							onClick: () => y(!0),
							children: m("Move to Folder")
						}),
						c("media.delete") && /* @__PURE__ */ I(b, {
							size: "sm",
							variant: "destructive",
							icon: "trash",
							onClick: async () => {
								(await fe([a])).length && r();
							},
							children: m("Delete File")
						})
					]
				}),
				/* @__PURE__ */ L("div", {
					className: "hidden",
					onSubmit: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ I("input", {
						ref: ce,
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
							e.target.value = "", t && de(t);
						}
					}), g && /* @__PURE__ */ I(ue, {
						files: [{
							id: a.id,
							folder: p
						}],
						folders: n,
						onClose: (e) => {
							y(!1), e !== void 0 && ee(e);
						}
					})]
				})
			]
		})
	});
}
// admin/src/Library.tsx
var he = (e, t, n, r = {}) => ({
	...r,
	search: e.search || void 0,
	kind: e.kind,
	folder: e.folder,
	page: t,
	perPage: 60,
	sort: n ?? void 0
});
function ge(t) {
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
function _e({ mode: e = "manage", accept: t = "*", except: l, multiple: d = !1, selected: f = [], onSelectionChange: x, autoUpload: C = !1, bar: D = !1 }) {
	let { query: A } = ee(), j = a(t), [N, P] = v(() => D ? {
		search: A.search ?? "",
		kind: r.includes(A.kind ?? "") ? A.kind : "all",
		folder: A.folder || null
	} : {
		search: "",
		kind: j,
		folder: null
	}), { kind: F, folder: z } = N, se = e === "pick" ? {
		accept: t !== "*" && !/^(image|video)\/\*$/.test(t) && t !== "application/pdf" ? t : void 0,
		except: l
	} : {};
	g(() => {
		D && p({
			search: N.search || null,
			kind: N.kind === "all" ? null : N.kind,
			folder: N.folder
		});
	}, [D, N]), g(() => {
		if (D) return o.current = z ?? "", o.show = (e) => xe("folder", e), () => {
			o.current = "", o.show = void 0;
		};
	}, [D, z]);
	let [B, V] = v(1), [H, de] = v(() => ae("overview.media", "grid").sort), [W, G] = v(/* @__PURE__ */ new Set()), [K, q] = v(!1), [J, Y] = v(null), [pe, _e] = v(null), X = h("media/list", he(N, B, H, se), { placeholderData: (e) => e }), Z = X.data?.items ?? [], Q = X.data?.folders ?? [], ve = c("media.upload"), ye = e === "manage" && c("media.edit"), be = (e) => le(e, (t, n) => xe("folder", n ?? ce(z, e, t ?? null))), xe = (e, t) => {
		V(1), G(/* @__PURE__ */ new Set()), P((n) => ({
			...n,
			[e]: e === "kind" ? t || "all" : t
		}));
	}, Se = (n) => [{
		handle: "files",
		type: "json",
		component: "media-upload",
		label: m("Upload"),
		multiple: e === "manage" || d,
		accept: t === "*" ? void 0 : t,
		...n
	}], Ce = async (t) => {
		let r = await n(t, z ?? "");
		if (r.length && e === "pick") {
			let e = d ? [...f, ...r.map((e) => e.id)] : [r[0].id];
			x?.(e, r);
		}
	}, we = (t) => {
		if (e === "manage") return Y(t);
		let n = d ? f.includes(t.id) ? f.filter((e) => e !== t.id) : [...f, t.id] : [t.id];
		x?.(n, [t]);
	}, Te = (t = !1, n = e === "manage" ? "primary" : "secondary") => ve ? /* @__PURE__ */ I(w, {
		layout: "inline",
		bare: !0,
		fields: Se({
			variant: n,
			autofocus: t
		}),
		values: {},
		onChange: (e, t) => void Ce(t)
	}) : null, Ee = (t, n, r = Z) => {
		if (e === "pick") {
			let e = d ? [...new Set(n ? [...f, ...t] : f.filter((e) => !t.includes(e)))] : n ? t.slice(0, 1) : [];
			x?.(e, r.filter((t) => e.includes(t.id)));
		} else G((e) => {
			let r = new Set(e);
			return t.forEach((e) => n ? r.add(e) : r.delete(e)), r;
		});
	}, De = async (e) => {
		if (!K) {
			q(!0);
			try {
				let t = await fe(Z.filter((t) => e.includes(t.id)));
				G((e) => new Set([...e].filter((e) => !t.includes(e))));
			} finally {
				q(!1);
			}
		}
	}, [Oe, ke] = v(!1), Ae = _(0), je = (e) => ve && e.dataTransfer.types.includes("Files"), Me = {
		onDragEnter: (e) => {
			je(e) && (Ae.current++, ke(!0));
		},
		onDragOver: (e) => {
			je(e) && (e.preventDefault(), e.dataTransfer.dropEffect = "copy");
		},
		onDragLeave: (e) => {
			je(e) && --Ae.current <= 0 && (Ae.current = 0, ke(!1));
		},
		onDrop: (t) => {
			if (!je(t)) return;
			t.preventDefault(), Ae.current = 0, ke(!1);
			let n = Array.from(t.dataTransfer.files);
			Ce(e === "pick" && !d ? n.slice(0, 1) : n);
		}
	}, Ne = (e) => e.thumb ? /* @__PURE__ */ I("img", {
		src: e.thumb,
		alt: e.alt ?? "",
		loading: "lazy",
		className: "absolute inset-0 size-full object-cover",
		style: { objectPosition: `${e.focal.x}% ${e.focal.y}%` }
	}) : /* @__PURE__ */ I(s, { item: e }), Pe = !!N.search || F !== (D ? "all" : j), Fe = !Pe && z === null && !X.isError && X.data?.total === 0, Ie = !D && j !== "all", Le = Q.length > 0, $ = e === "pick";
	return /* @__PURE__ */ L("div", {
		className: M("relative min-w-0", Le && "md:grid md:grid-cols-[200px_minmax(0,1fr)] md:items-start md:gap-6", Oe && "rounded-lg outline-2 -outline-offset-2 outline-focus"),
		...Me,
		children: [
			Le && /* @__PURE__ */ I("nav", {
				"aria-label": m("Folders"),
				className: "mt-1.5 max-md:hidden",
				children: /* @__PURE__ */ I(U, {
					folders: Q,
					value: z,
					onChange: (e) => xe("folder", e),
					root: {
						value: null,
						label: m("All Files")
					},
					actions: ye ? (e) => /* @__PURE__ */ I(O, {
						trigger: /* @__PURE__ */ I(E, {
							icon: "more",
							label: m("Actions for {name}", { name: R(e) }),
							size: "xs"
						}),
						items: be(e)
					}) : void 0
				})
			}),
			Oe && /* @__PURE__ */ I("div", {
				className: "pointer-events-none absolute inset-0 z-sticky flex justify-center rounded-lg bg-bg/80",
				children: /* @__PURE__ */ L("span", {
					className: "sticky top-[30vh] mt-[20vh] flex h-fit items-center gap-2 rounded-md bg-float px-3 py-2 text-sm font-medium text-ink shadow-pop ring-1 ring-border-strong",
					children: [/* @__PURE__ */ I(T, {
						name: "upload",
						size: 16
					}), z ? m("Drop to Upload to {folder}", { folder: R(z) }) : m("Drop to Upload")]
				})
			}),
			/* @__PURE__ */ L("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ I(te, {
						id: "media",
						label: m("Media"),
						items: Z,
						source: {
							ability: "media/list",
							input: he(N, 1, H, se),
							perPage: 60
						},
						rowKey: (e) => e.id,
						onRowClick: we,
						defaultView: "grid",
						image: Ne,
						pagination: X.data && {
							page: X.data.page,
							pages: X.data.pages,
							total: X.data.total,
							perPage: 60,
							onPage: V
						},
						loading: X.isLoading,
						stale: X.isPlaceholderData,
						error: X.isError,
						onRetry: () => void X.refetch(),
						dates: (e) => ({
							publishedAt: null,
							updatedAt: e.updatedAt
						}),
						sort: H,
						dateSort: { updated: "updated_at" },
						onSort: (e) => {
							V(1), de(e);
						},
						selection: $ ? void 0 : {
							ids: W,
							onSelect: Ee
						},
						selected: $ ? (e) => f.includes(e.id) : void 0,
						plain: $,
						toolbar: Fe ? void 0 : /* @__PURE__ */ L(oe, { children: [
							/* @__PURE__ */ I(w, {
								layout: "inline",
								bare: !0,
								className: "flex min-w-0 flex-wrap items-center gap-2 max-sm:w-full",
								fields: [...ge(!Ie), ...Q.length ? [{
									handle: "folder",
									type: "select",
									label: m("Folder"),
									size: "sm",
									placeholder: m("All Files"),
									options: Q.map((e) => ({
										value: e,
										label: "\xA0\xA0".repeat(e.split("/").length - 1) + R(e),
										icon: "folder"
									})),
									className: "w-full sm:w-44 md:hidden"
								}] : []],
								values: {
									...N,
									kind: F === "all" ? null : F
								},
								onChange: xe
							}),
							ye && z && /* @__PURE__ */ I(O, {
								trigger: /* @__PURE__ */ I(E, {
									icon: "more",
									label: m("Actions for {name}", { name: R(z) }),
									size: "sm",
									className: "md:hidden"
								}),
								items: be(z)
							}),
							!D && Te(C)
						] }),
						columns: $ ? [{
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
								render: (e) => ie(e.size)
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
								render: (e) => e.kind === "image" ? e.alt ? /* @__PURE__ */ I(y, {
									tone: "success",
									children: m("Added")
								}) : /* @__PURE__ */ I(y, {
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
						actions: $ ? void 0 : (t) => /* @__PURE__ */ I(O, {
							trigger: /* @__PURE__ */ I(E, {
								icon: "more",
								label: m("Actions for {name}", { name: t.name }),
								size: "xs"
							}),
							items: [
								{
									label: m("Open"),
									icon: "edit",
									onSelect: () => we(t)
								},
								{
									label: m("Copy URL"),
									icon: "copy",
									onSelect: () => void re(new URL(t.url, location.origin).href, {
										copied: m("URL copied"),
										failed: m("Couldn’t copy the URL")
									})
								},
								ye && {
									label: m("Move to Folder"),
									icon: "folder",
									onSelect: () => _e([t])
								},
								e === "manage" && c("media.delete") && {
									label: m("Delete"),
									icon: "trash",
									danger: !0,
									disabled: K,
									onSelect: () => void De([t.id])
								}
							]
						}),
						empty: Pe ? /* @__PURE__ */ I(k, { onClear: () => {
							P((e) => ({
								search: "",
								kind: D ? "all" : j,
								folder: e.folder
							})), V(1);
						} }) : /* @__PURE__ */ I(S, {
							icon: z === null ? "media" : "folder",
							title: m(z === null ? F === "image" ? "No images yet" : F === "video" ? "No videos yet" : "No files yet" : "No files in this folder"),
							action: D ? void 0 : Te(!1, "secondary")
						})
					}),
					D && C && /* @__PURE__ */ I("span", {
						className: "hidden",
						children: Te(!0)
					}),
					e === "manage" && /* @__PURE__ */ L(ne, {
						count: W.size,
						onClear: () => G(/* @__PURE__ */ new Set()),
						children: [ye && /* @__PURE__ */ I(b, {
							size: "sm",
							variant: "ghost",
							onClick: () => _e(Z.filter((e) => W.has(e.id))),
							children: m("Move to Folder")
						}), c("media.delete") && /* @__PURE__ */ I(b, {
							size: "sm",
							variant: "destructive",
							loading: K,
							onClick: () => void De([...W]),
							children: m("Delete")
						})]
					}),
					e === "manage" && J && /* @__PURE__ */ I(me, {
						item: Z.find((e) => e.id === J.id) ?? J,
						folders: Q,
						onClose: () => Y(null)
					}, J.id),
					pe && pe.length > 0 && /* @__PURE__ */ I(ue, {
						files: pe,
						folders: Q,
						onClose: (e) => {
							_e(null), e !== void 0 && G(/* @__PURE__ */ new Set());
						}
					})
				]
			})
		]
	});
}
export { de as n, _e as t };
