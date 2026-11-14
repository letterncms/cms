import { a as e, i as t, o as n, r, s as i } from "./fields-B2vWHHXc.js";
import { CmsError as a, can as o, invalidate as s, run as c, setQuery as l, t as u, useAbility as d, useLocation as f } from "@letterncms/sdk";
import { useEffect as p, useMemo as m, useRef as h, useState as g } from "react";
import { Button as _, EmptyState as v, Fields as y, Icon as b, IconButton as x, Menu as S, NEW_COLOR as C, Notice as ee, QueryError as te, SaveBar as ne, ScreenSidebar as re, Segmented as ie, SidebarRow as ae, Skeleton as oe, Spinner as se, Switch as ce, Tooltip as w, Topbar as le, cn as T, confirm as E, copyText as ue, deviceWidths as de, prompt as D, toast as O, useScreenSidebar as fe, useTheme as pe } from "@letterncms/ui";
import { Fragment as k, jsx as A, jsxs as j } from "react/jsx-runtime";
import { ClassText as me, LayerBar as M, StylePanels as N, Stylesheet as he, StylingProvider as ge, lightDark as _e, loadCompiler as ve, loadEngine as ye, parseClass as P, styleApi as F, tokensOf as I, useStyling as L, withVariants as R } from "@letterncms/blocks";
// admin/src/parts.tsx
var z = "cms-reveal shrink-0", B = () => /* @__PURE__ */ A("span", { className: "size-6 shrink-0" });
function V({ title: e, onAdd: t, addLabel: n, action: r, children: i }) {
	return /* @__PURE__ */ j("section", {
		className: "mb-6",
		children: [
			e && /* @__PURE__ */ j("div", {
				className: "flex h-9 items-center justify-between border-b border-border",
				children: [
					/* @__PURE__ */ A("h3", {
						className: "m-0 text-xs font-semibold text-ink",
						children: e
					}),
					r,
					t && n && /* @__PURE__ */ A(w, {
						content: n,
						children: /* @__PURE__ */ A(x, {
							icon: "plus",
							label: n,
							title: void 0,
							size: "xs",
							onClick: t
						})
					})
				]
			}),
			i,
			!e && (r || t && n) && /* @__PURE__ */ A("div", {
				className: "flex h-9 items-center border-t border-border",
				children: r ?? /* @__PURE__ */ A(_, {
					variant: "ghost",
					size: "xs",
					icon: "plus",
					onClick: t,
					className: "-ml-1.5 !px-1.5 !font-normal !text-muted hover:!text-ink",
					children: n
				})
			})
		]
	});
}
function H({ handle: e, label: t, value: n, onChange: r, field: i, disabled: a, className: o }) {
	return /* @__PURE__ */ A(y, {
		bare: !0,
		className: T("flex min-w-0 flex-1", o),
		disabled: a,
		fields: [{
			handle: e,
			type: "text",
			label: t,
			size: "sm",
			mono: !0,
			...i
		}],
		values: { [e]: n ?? null },
		onChange: (e, t) => r(t == null || t === "" ? null : String(t))
	});
}
function U({ name: e, sample: t, after: n, below: r, wide: i, menu: a, children: o }) {
	return /* @__PURE__ */ j("div", {
		className: "cms-reveal-row group border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ j("div", {
			className: T("flex min-h-9 items-center gap-2 py-1", i && "max-sm:flex-wrap"),
			children: [
				t !== void 0 && /* @__PURE__ */ A("span", {
					className: "grid w-7 shrink-0 place-items-center",
					children: t
				}),
				/* @__PURE__ */ A(w, {
					content: u("Copy Name"),
					children: /* @__PURE__ */ A(_, {
						variant: "ghost",
						size: "xs",
						onClick: () => void ue(e, { copied: u("Copied {reference}", { reference: e }) }),
						"aria-label": u("Copy {reference}", { reference: e }),
						className: T("!justify-start !bg-transparent !px-0 text-left font-mono !font-normal hover:text-ink", i ? "min-w-0 flex-1 shrink max-sm:order-1 max-sm:basis-[calc(100%-2.5rem)]" : t === void 0 ? "w-[120px] max-sm:w-20" : "w-[84px] max-sm:w-16"),
						children: /* @__PURE__ */ A("span", {
							className: "truncate",
							children: e
						})
					})
				}),
				i ? o : /* @__PURE__ */ A("div", {
					className: "flex w-60 min-w-0 shrink gap-1 max-lg:w-52 max-sm:w-auto max-sm:flex-1",
					children: o
				}),
				!i && /* @__PURE__ */ A("span", {
					className: "flex min-w-0 flex-1 items-center max-sm:hidden",
					children: n
				}),
				a && a.length > 0 ? /* @__PURE__ */ A(S, {
					trigger: /* @__PURE__ */ A(x, {
						icon: "more",
						label: u("Actions"),
						size: "xs",
						className: T(z, i && "max-sm:order-2")
					}),
					items: a
				}) : /* @__PURE__ */ A("span", { className: T("size-6 shrink-0", i && "max-sm:order-2") })
			]
		}), r]
	});
}
function W({ label: e, children: t }) {
	return /* @__PURE__ */ j("div", {
		className: "flex min-h-9 items-center gap-2 border-b border-border py-1 last:border-b-0",
		children: [
			/* @__PURE__ */ A("span", {
				className: "w-[120px] shrink-0 truncate text-xs text-text max-sm:w-20",
				children: e
			}),
			/* @__PURE__ */ A("div", {
				className: "flex w-60 min-w-0 shrink items-center max-lg:w-52 max-sm:w-auto max-sm:flex-1",
				children: t
			}),
			/* @__PURE__ */ A("span", { className: "min-w-0 flex-1 max-sm:hidden" }),
			/* @__PURE__ */ A(B, {})
		]
	});
}
function G({ open: e, onToggle: t, label: n, aside: r, menu: i, children: a }) {
	return /* @__PURE__ */ j("div", {
		className: "cms-reveal-row group border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ j("div", {
			className: "flex min-h-10 items-center gap-2",
			children: [/* @__PURE__ */ j(_, {
				variant: "ghost",
				"aria-expanded": e,
				onClick: t,
				className: "!h-auto min-h-10 min-w-0 flex-1 shrink !justify-start !gap-1.5 !rounded-xs !bg-transparent !px-0 text-left !text-xs !font-normal focus-visible:!-outline-offset-2 hover:text-ink",
				children: [
					/* @__PURE__ */ A(b, {
						name: "chevron-right",
						size: 12,
						className: T("shrink-0 text-faint transition-transform duration-fast", e && "rotate-90")
					}),
					/* @__PURE__ */ A("span", {
						className: "min-w-0 flex-1 truncate",
						children: n
					}),
					r
				]
			}), i]
		}), e && /* @__PURE__ */ A("div", {
			className: "pb-3 pl-[18px]",
			children: a
		})]
	});
}
function K({ onOpen: e, label: t, sample: n, summary: r, menu: i }) {
	return /* @__PURE__ */ j("div", {
		className: "cms-reveal-row group flex min-h-10 items-center gap-2 border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ j(_, {
			variant: "ghost",
			onClick: e,
			className: "!h-auto min-h-10 min-w-0 flex-1 shrink !justify-start !gap-2 !rounded-xs !bg-transparent !px-0 text-left !text-xs !font-normal focus-visible:!-outline-offset-2 hover:text-ink",
			children: [
				n,
				/* @__PURE__ */ A("span", {
					className: "shrink-0 text-ink",
					children: t
				}),
				/* @__PURE__ */ A("span", {
					className: "min-w-0 flex-1 truncate text-muted",
					children: r
				}),
				/* @__PURE__ */ A(b, {
					name: "chevron-right",
					size: 12,
					className: "shrink-0 text-faint"
				})
			]
		}), i ?? /* @__PURE__ */ A(B, {})]
	});
}
function q(e) {
	let t = String(e ?? "").trim(), n = /^clamp\((.*)\)$/.exec(t), r = n ? n[1].split(",").pop().trim() : t, i = parseFloat(r);
	return Number.isNaN(i) ? 0 : /r?em$/.test(r) ? i * 16 : i;
}
// admin/src/code-files.tsx
var J = () => /* @__PURE__ */ j("div", {
	className: "space-y-2 py-3",
	children: [/* @__PURE__ */ A(oe, { className: "h-3 w-32" }), /* @__PURE__ */ A(oe, { className: "h-3 w-24" })]
}), Y = (e, t) => t.length > 0 ? /* @__PURE__ */ A(S, {
	trigger: /* @__PURE__ */ A(x, {
		icon: "more",
		label: e,
		size: "xs",
		className: z
	}),
	items: t
}) : /* @__PURE__ */ A(B, {}), be = {
	scripts: "export function mount(el, props) {\n}\n",
	styles: "\n"
}, xe = {
	scripts: "js",
	styles: "css"
};
function Se({ path: e, name: t, open: n, onToggle: r, edited: i, onEdit: a, allowed: o, onDelete: s }) {
	let c = d("styling-code/get", { path: e }, {
		enabled: n && o && i === void 0,
		staleTime: 0
	});
	return o ? /* @__PURE__ */ A(G, {
		open: n,
		onToggle: r,
		label: /* @__PURE__ */ A("span", {
			className: "font-mono",
			children: t
		}),
		menu: Y(u("File Actions"), o ? [{
			label: u("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: s
		}] : []),
		children: c.isError ? /* @__PURE__ */ A(te, {
			compact: !0,
			onRetry: () => void c.refetch(),
			retrying: c.isRefetching
		}) : i === void 0 && !c.data ? /* @__PURE__ */ A(J, {}) : /* @__PURE__ */ A(y, {
			bare: !0,
			fields: [{
				handle: "contents",
				type: "code",
				label: t,
				rows: 14,
				language: e.endsWith(".css") ? "css" : "javascript"
			}],
			values: { contents: i ?? c.data?.contents ?? "" },
			onChange: (e, t) => a(t ?? ""),
			disabled: !o
		})
	}) : /* @__PURE__ */ A("div", {
		className: "flex min-h-10 items-center border-b border-border font-mono text-xs text-text last:border-b-0",
		children: t
	});
}
function Ce({ js: e, onJs: t, edits: n, onEdit: r }) {
	let i = o("site.code"), a = d("styling-code/list"), l = d("styling-vendor/list"), [f, p] = g(null), [m, h] = g(null), b = () => s("styling-code/", "styling-vendor/"), x = async (e, t) => {
		try {
			return await e(), b(), O.success(t), !0;
		} catch (e) {
			return O.error(e), !1;
		}
	}, S = async (e, t, n) => {
		h(e), await x(t, n), h(null);
	}, C = async (e) => {
		let t = await D({
			title: u(e === "scripts" ? "New Script" : "New Style"),
			fields: [{
				handle: "name",
				type: "text",
				label: u("Name"),
				mono: !0,
				autofocus: !0,
				placeholder: "hero"
			}],
			confirm: u(e === "scripts" ? "Create Script" : "Create Style")
		}), n = String(t?.name ?? "").trim().toLowerCase().replace(/\.(js|css)$/, "").replace(/\s+/g, "-");
		if (!n) return;
		if ((a.data?.[e] ?? []).includes(n)) return void O.error(u("“{name}” already exists", { name: n }));
		let r = `${e}/${n}.${xe[e]}`;
		await x(() => c("styling-code/save", {
			path: r,
			contents: be[e]
		}), u("{name} added", { name: n })) && p(r);
	}, ne = async (e, t) => {
		await E({
			title: u("Delete “{name}”?", { name: t }),
			confirm: u("Delete"),
			danger: !0
		}) && await x(() => c("styling-code/delete", { path: e }), u("{name} deleted", { name: t })) && r(e, null);
	}, re = async () => {
		let e = await D({
			title: u("Add Library"),
			fields: [{
				handle: "package",
				type: "text",
				label: u("Package"),
				mono: !0,
				autofocus: !0,
				placeholder: "gsap@3.12.5"
			}],
			confirm: u("Add Library")
		}), t = String(e?.package ?? "").trim();
		t && await S("add", () => c("styling-vendor/create", { package: t }), u("{name} added", { name: t }));
	}, ie = async (e) => {
		await E({
			title: u("Delete “{name}”?", { name: e }),
			confirm: u("Delete"),
			danger: !0
		}) && await x(() => c("styling-vendor/delete", { import: e }), u("{name} deleted", { name: e }));
	}, ae = (o, s, c) => {
		let l = a.data?.[o] ?? [];
		return /* @__PURE__ */ j(V, {
			title: s,
			onAdd: i && (o === "scripts" || l.length > 0) ? () => void C(o) : void 0,
			addLabel: c,
			children: [o === "scripts" && /* @__PURE__ */ A(G, {
				open: f === "js",
				onToggle: () => p(f === "js" ? null : "js"),
				label: u("Site JavaScript"),
				menu: /* @__PURE__ */ A(B, {}),
				children: /* @__PURE__ */ A(y, {
					bare: !0,
					fields: [{
						handle: "js",
						type: "code",
						label: u("Site JavaScript"),
						rows: 14,
						placeholder: "document.addEventListener('cms:alpine', (e) => …)",
						language: "javascript"
					}],
					values: { js: e },
					onChange: (e, n) => t(n ?? ""),
					disabled: !i
				})
			}), a.isError ? /* @__PURE__ */ A(te, {
				compact: !0,
				onRetry: () => void a.refetch(),
				retrying: a.isRefetching
			}) : a.data ? l.length === 0 && o === "styles" ? /* @__PURE__ */ A(v, {
				compact: !0,
				icon: "code",
				title: u("No styles"),
				action: i ? /* @__PURE__ */ A(_, {
					icon: "plus",
					onClick: () => void C(o),
					children: c
				}) : void 0
			}) : l.map((e) => {
				let t = `${o}/${e}.${xe[o]}`;
				return /* @__PURE__ */ A(Se, {
					path: t,
					name: e,
					open: f === t,
					onToggle: () => p(f === t ? null : t),
					edited: n[t],
					onEdit: (e) => r(t, e),
					allowed: i,
					onDelete: () => void ne(t, e)
				}, t);
			}) : /* @__PURE__ */ A(J, {})]
		});
	};
	return /* @__PURE__ */ j(k, { children: [
		!i && /* @__PURE__ */ A(ee, {
			tone: "neutral",
			className: "mb-4",
			title: u("Editing code needs the “Edit Scripts and Stylesheets” permission.")
		}),
		ae("scripts", u("Scripts"), u("New Script")),
		ae("styles", u("Styles"), u("New Style")),
		/* @__PURE__ */ A(V, {
			title: u("Libraries"),
			onAdd: i && m !== "add" && l.data?.imports.length ? () => void re() : void 0,
			addLabel: u("Add Library"),
			action: m === "add" ? /* @__PURE__ */ A("span", {
				role: "status",
				"aria-label": u("Working…"),
				className: "grid size-6 place-items-center text-faint",
				children: /* @__PURE__ */ A(se, { size: 14 })
			}) : void 0,
			children: l.isError ? /* @__PURE__ */ A(te, {
				compact: !0,
				onRetry: () => void l.refetch(),
				retrying: l.isRefetching
			}) : l.data ? l.data.imports.length === 0 ? /* @__PURE__ */ A(v, {
				compact: !0,
				icon: "code",
				title: u("No libraries"),
				action: i ? /* @__PURE__ */ A(_, {
					icon: "plus",
					loading: m === "add",
					onClick: () => void re(),
					children: u("Add Library")
				}) : void 0
			}) : l.data.imports.map((e) => /* @__PURE__ */ j("div", {
				className: "cms-reveal-row group flex min-h-10 items-center gap-2 border-b border-border last:border-b-0",
				children: [
					/* @__PURE__ */ A("span", {
						className: "min-w-0 flex-1 truncate font-mono text-xs text-text",
						children: e.import
					}),
					/* @__PURE__ */ A("span", {
						className: "shrink-0 font-mono text-2xs text-faint",
						children: e.version
					}),
					m === e.import ? /* @__PURE__ */ A("span", {
						role: "status",
						"aria-label": u("Working…"),
						className: "grid size-6 shrink-0 place-items-center text-faint",
						children: /* @__PURE__ */ A(se, { size: 14 })
					}) : Y(u("Library Actions"), i ? [
						{
							label: u("Update"),
							icon: "refresh",
							disabled: !!m,
							onSelect: () => void S(e.import, () => c("styling-vendor/update", { import: e.import }), u("{name} updated", { name: e.import }))
						},
						{
							separator: !0,
							label: ""
						},
						{
							label: u("Delete"),
							icon: "trash",
							danger: !0,
							disabled: !!m,
							onSelect: () => void ie(e.import)
						}
					] : [])
				]
			}, e.import)) : /* @__PURE__ */ A(J, {})
		})
	] });
}
// admin/src/preview.tsx
var we = {
	desktop: "100%",
	tablet: `${de.tablet}px`,
	phone: `${de.phone}px`
};
function Te(e, t) {
	let [n, r] = g({
		source: void 0,
		compiler: null,
		problem: null
	}), i = h({
		base: e,
		css: t
	});
	i.current = {
		base: e,
		css: t
	};
	let a = h(!1), o = h({}), s = h(!1), c = h(!0);
	p(() => (c.current = !0, () => {
		c.current = !1;
	}), []);
	let l = !!n.source;
	return p(() => {
		if (!e || t === void 0) return;
		let n = async () => {
			if (a.current = !0, !s.current) {
				s.current = !0;
				try {
					for (; a.current && c.current;) {
						a.current = !1;
						let e = i.current;
						if (!e.base || e.css === void 0) break;
						if (o.current.base === e.base && o.current.css === e.css) continue;
						o.current = e;
						let t = {
							css: e.css,
							files: e.base.files
						};
						try {
							let n = await ve(t);
							if (n.build(e.base.candidates), !await ye(t)) throw Error(u("Tailwind could not read the stylesheet."));
							c.current && r({
								source: {
									...e.base,
									css: e.css
								},
								compiler: n,
								problem: null
							});
						} catch (e) {
							c.current && r((t) => ({
								...t,
								problem: e instanceof Error ? e.message : String(e)
							}));
						}
					}
				} finally {
					s.current = !1;
				}
			}
		}, d = setTimeout(() => void n(), l ? 150 : 0);
		return () => clearTimeout(d);
	}, [
		e,
		t,
		l
	]), n;
}
function Ee({ viewport: e, desktop: t, children: n }) {
	let r = h(null), [i, a] = g({
		width: 0,
		height: 0
	});
	p(() => {
		let e = r.current;
		if (!e) return;
		let t = () => a({
			width: e.clientWidth,
			height: e.clientHeight
		});
		t();
		let n = new ResizeObserver(t);
		return n.observe(e), () => n.disconnect();
	}, []);
	let o = e === "desktop" ? Math.max(i.width, t) : parseFloat(we[e]), s = i.width ? Math.min(1, i.width / o) : 1;
	return /* @__PURE__ */ A("div", {
		ref: r,
		className: "relative min-h-0 flex-1 overflow-hidden",
		children: i.width > 0 && n({
			position: "absolute",
			top: 0,
			left: Math.max(0, (i.width - o * s) / 2),
			width: o,
			height: i.height / s,
			transform: s < 1 ? `scale(${s})` : void 0,
			transformOrigin: "top left"
		})
	});
}
var De = "cms-styling-draft";
function Oe(e, t, n, r) {
	if (!e?.head) return;
	let i = e.documentElement;
	if (r ? (i.dataset.theme !== r && (i.dataset.theme = r), i.style.colorScheme = r) : i.style.colorScheme && (delete i.dataset.theme, i.style.colorScheme = ""), !t.compiler || !t.source) return;
	let a = n.replace(/[^/-]*$/, ""), o = [...e.querySelectorAll("link[rel=\"stylesheet\"]")].filter((e) => a !== "" && (e.getAttribute("href") ?? "").startsWith(a)), s = new Set(t.source.candidates);
	for (let t of e.querySelectorAll("[class]")) for (let e of t.classList) s.add(e);
	let c;
	try {
		c = t.source.faces + t.compiler.build([...s]);
	} catch (e) {
		console.error(e);
		return;
	}
	let l = e.getElementById(De);
	l || (l = e.createElement("style"), l.id = De, o[0] ? o[0].after(l) : e.head.appendChild(l)), l.textContent !== c && (l.textContent = c);
	for (let e of o) e.disabled = !0;
}
function ke({ frame: e, compile: t, published: n, viewport: r, desktop: i, mode: a, bordered: o }) {
	let [s, c] = g(0);
	return p(() => Oe(e.current?.contentDocument, t, n, a), [
		e,
		t,
		n,
		a,
		s
	]), /* @__PURE__ */ j("div", {
		className: "relative flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ A(Ee, {
			viewport: r,
			desktop: i,
			children: (t) => /* @__PURE__ */ A("iframe", {
				ref: e,
				src: "/",
				title: u("Site Preview"),
				className: T("border-0 bg-bg", o && "border-x border-border"),
				style: t,
				onLoad: () => c((e) => e + 1)
			})
		}), t.problem && /* @__PURE__ */ A("div", {
			className: "absolute inset-x-3 top-3 rounded-lg bg-bg shadow-raise",
			children: /* @__PURE__ */ A(ee, {
				tone: "warning",
				title: u("Tailwind can’t read the stylesheet"),
				children: t.problem
			})
		})]
	});
}
// admin/src/rules.tsx
var Ae = (e) => e.replace(/^!|!$/g, "");
function je({ label: e, mono: t, classes: n, write: r, onBack: i, readOnly: a }) {
	let o = L(), [s, c] = g(""), [l, u] = g([]), d = m(() => o.breakpoints.map((e) => e.name), [o.breakpoints]), f = F(o.engine, n, d, s, l, a ? () => {} : r);
	return /* @__PURE__ */ j("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ A("div", {
				className: "flex h-10 items-center gap-1 border-b border-border px-2",
				children: /* @__PURE__ */ A(_, {
					variant: "ghost",
					size: "sm",
					icon: "arrow-left",
					onClick: i,
					className: "min-w-0 shrink !justify-start !px-2",
					children: /* @__PURE__ */ A("span", {
						className: t ? "truncate font-mono" : "truncate",
						children: e
					})
				})
			}),
			/* @__PURE__ */ A(M, {
				classes: n,
				engine: o.engine,
				breakpoints: o.breakpoints,
				breakpoint: s,
				state: l,
				onBreakpoint: c,
				onState: u
			}),
			/* @__PURE__ */ A("div", {
				className: "border-b border-border px-4 py-3",
				children: /* @__PURE__ */ A(me, {
					s: f,
					disabled: a
				})
			}),
			/* @__PURE__ */ A("div", {
				inert: a,
				children: /* @__PURE__ */ A(N, { s: f })
			})
		]
	});
}
var Me = (e) => String(e ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");
async function Ne(e, t, n, r, i = "") {
	let a = Me((await D({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: u("Name"),
			placeholder: "card",
			mono: !0,
			required: !0,
			autofocus: !0
		}],
		values: { name: i },
		confirm: r
	}))?.name);
	return !a || a === i ? null : /^[a-z][a-z0-9-]*$/.test(a) ? e.utilities().some((e) => e.name === a) || t?.valid(a) ? (O.error(u("There is already a class “{name}”.", { name: a })), null) : a : (O.error(u("A class name is lowercase letters, numbers and hyphens, and starts with a letter.")), null);
}
function Pe(e, t, n) {
	let r = (e) => {
		let { variants: r, utility: i } = P(e);
		return Ae(i) === t ? R(r, i.replace(t, n)) : e;
	}, i = e.renameUtility(t, n);
	for (let e of i.utilities()) {
		let t = e.classes.map(r);
		t.some((t, n) => t !== e.classes[n]) && (i = i.setUtility(e.name, t));
	}
	for (let e of i.elements()) {
		let t = e.classes.map(r);
		t.some((t, n) => t !== e.classes[n]) && (i = i.setElement(e.name, t));
	}
	return i;
}
function Fe({ edit: e }) {
	let { engine: t } = L(), n = f().query.class ?? "", r = (e) => l({
		class: e,
		tab: "classes"
	}, !1), i = e.sheet.utilities(), a = i.find((e) => e.name === n), [o, s] = g(null);
	if (n && (a || n === o)) return /* @__PURE__ */ A(je, {
		label: n,
		mono: !0,
		classes: a?.classes ?? [],
		readOnly: e.readOnly,
		onBack: () => r(null),
		write: (t) => e.change((e) => t.length > 0 || e.utilities().find((e) => e.name === n)?.custom ? e.setUtility(n, t) : e.removeUtility(n))
	}, n);
	let c = async () => {
		let n = await Ne(e.sheet, t, u("New Class"), u("Create Class"));
		n && (s(n), r(n));
	}, d = async (n) => {
		let r = await Ne(e.sheet, t, u("Rename Class"), u("Rename"), n);
		r && e.change((e) => Pe(e, n, r));
	}, p = async (n) => {
		let r = await Ne(e.sheet, t, u("Duplicate Class"), u("Duplicate Class"), `${n}-copy`);
		r && e.change((e) => e.duplicateUtility(n, r));
	}, m = async (t) => {
		await E({
			title: u("Delete “{name}”?", { name: t }),
			confirm: u("Delete"),
			danger: !0
		}) && e.change((e) => e.removeUtility(t));
	}, h = (e) => [
		{
			label: u("Rename…"),
			icon: "edit",
			onSelect: () => void d(e)
		},
		{
			label: u("Duplicate…"),
			icon: "copy",
			onSelect: () => void p(e)
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: u("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => void m(e)
		}
	];
	return i.length === 0 ? /* @__PURE__ */ A(v, {
		compact: !0,
		icon: "symbol",
		title: u("No classes"),
		action: e.readOnly ? void 0 : /* @__PURE__ */ A(_, {
			icon: "plus",
			onClick: () => void c(),
			children: u("New Class")
		})
	}) : /* @__PURE__ */ A(V, {
		onAdd: e.readOnly ? void 0 : () => void c(),
		addLabel: u("New Class"),
		children: i.map((t) => /* @__PURE__ */ A(K, {
			onOpen: () => r(t.name),
			label: /* @__PURE__ */ A("span", {
				className: "font-mono",
				children: t.name
			}),
			summary: t.classes.join(" "),
			menu: e.readOnly ? void 0 : /* @__PURE__ */ A(S, {
				trigger: /* @__PURE__ */ A(x, {
					icon: "more",
					label: u("Class Actions"),
					size: "xs",
					className: z
				}),
				items: h(t.name)
			})
		}, t.name))
	});
}
var Ie = () => [
	["body", u("Page")],
	["h1", u("Heading 1")],
	["h2", u("Heading 2")],
	["h3", u("Heading 3")],
	["h4", u("Heading 4")],
	["h5", u("Heading 5")],
	["h6", u("Heading 6")],
	["p", u("Paragraph")],
	["a", u("Link")],
	["small", u("Small Text")],
	["blockquote", u("Quote")],
	["code", u("Code")],
	["::selection", u("Selection")]
], Le = [
	["fontFamily", "fontFamily"],
	["fontWeight", "fontWeight"],
	["fontStyle", "fontStyle"],
	["letterSpacing", "letterSpacing"],
	["textTransform", "textTransform"],
	["textDecorationLine", "textDecorationLine"],
	["color", "color"],
	["backgroundColor", "backgroundColor"]
];
function Re(e, t, n) {
	let r = _e(e.resolve(t)), i = n === "dark" ? r.dark ?? r.light : r.light;
	return i.includes("var(") ? void 0 : i;
}
function ze(e, t, n) {
	if (!e) return {};
	let r = F(e, t, [], "", [], () => {}), i = {};
	for (let [t, a] of Le) {
		let o = r.value(a), s = o === void 0 ? void 0 : Re(e, o, n);
		s !== void 0 && (i[t] = s);
	}
	return i;
}
function Be(e) {
	if (!e || /[{};@]/.test(e)) return !1;
	try {
		return document.createDocumentFragment().querySelector(e), !0;
	} catch {
		return !1;
	}
}
function Ve({ edit: e }) {
	let { engine: t } = L(), [n, r] = g(null), i = e.sheet.elements(), a = Ie(), o = new Map(a), s = (e) => i.find((t) => t.name === e)?.classes ?? [], c = i.filter((e) => !o.has(e.name) && e.classes.length > 0).map((e) => e.name);
	if (n !== null) return /* @__PURE__ */ A(je, {
		label: o.get(n) ?? n,
		mono: !o.has(n),
		classes: s(n),
		readOnly: e.readOnly,
		onBack: () => r(null),
		write: (t) => e.change((e) => e.setElement(n, t))
	}, n);
	let l = async () => {
		let e = await D({
			title: u("Add Element"),
			fields: [{
				handle: "selector",
				type: "text",
				label: u("Selector"),
				placeholder: "figcaption",
				mono: !0,
				required: !0,
				autofocus: !0
			}],
			confirm: u("Add Element")
		}), t = String(e?.selector ?? "").trim().replace(/\s+/g, " ");
		if (t) {
			if (!Be(t)) return void O.error(u("“{selector}” is not a selector CSS can read.", { selector: t }));
			r(t);
		}
	}, d = {
		background: t ? Re(t, "var(--color-background)", e.mode) : void 0,
		color: t ? Re(t, "var(--color-foreground)", e.mode) : void 0
	}, f = (n) => {
		let i = s(n), a = o.get(n);
		return /* @__PURE__ */ A(K, {
			onOpen: () => r(n),
			sample: /* @__PURE__ */ A("span", {
				"aria-hidden": "true",
				className: "grid h-6 w-9 shrink-0 place-items-center overflow-hidden rounded-xs border border-border",
				style: d,
				children: /* @__PURE__ */ A("span", {
					className: "px-0.5 text-base leading-tight",
					style: ze(t, i, e.mode),
					children: "Aa"
				})
			}),
			label: a ?? /* @__PURE__ */ A("span", {
				className: "font-mono",
				children: n
			}),
			summary: i.join(" "),
			menu: e.readOnly || i.length === 0 ? void 0 : /* @__PURE__ */ A(S, {
				trigger: /* @__PURE__ */ A(x, {
					icon: "more",
					label: u("Element Actions"),
					size: "xs",
					className: z
				}),
				items: [{
					label: u("Clear Styles"),
					icon: "trash",
					danger: !0,
					onSelect: () => e.change((e) => e.setElement(n, []))
				}]
			})
		}, n);
	};
	return /* @__PURE__ */ j(V, {
		onAdd: e.readOnly ? void 0 : () => void l(),
		addLabel: u("Add Element"),
		children: [a.map(([e]) => f(e)), c.map(f)]
	});
}
// admin/src/theme.tsx
function X(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let r of e.variables()) {
		if (!r.name.startsWith(t)) continue;
		let e = r.name.slice(t.length);
		e === "" || e === "*" || e.includes("--") || t === "--font-" && e.startsWith("weight-") || n.set(r.name, {
			name: r.name,
			key: e,
			value: r.value
		});
	}
	return [...n.values()];
}
var He = (e) => String(e ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
async function Ue(e, t, n, r, i = "", a = "md") {
	let o = He((await D({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: u("Name"),
			mono: !0,
			autofocus: !0,
			required: !0,
			placeholder: a
		}],
		values: { name: i },
		confirm: r
	}))?.name);
	return !o || o === i ? null : e.variable(`${t}${o}`) === void 0 ? o : (O.error(u("“{name}” already exists", { name: o })), null);
}
function We(e, t, n, r) {
	let i = n.name.slice(0, n.name.length - n.key.length) + r, a = RegExp(`^(!?.*-)${n.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}((?:/[^!]+)?!?)$`), o = (e) => {
		let { variants: i, utility: o } = P(e), s = a.exec(o);
		return !s || !t?.declarations(o.replace(/^!|!$/g, ""))?.some((e) => e.value.includes(`var(${n.name})`)) ? e : R(i, `${s[1]}${r}${s[2]}`);
	}, s = e;
	for (let t of e.utilities()) {
		let e = t.classes.map(o);
		e.some((e, n) => e !== t.classes[n]) && (s = s.setUtility(t.name, e));
	}
	for (let t of e.elements()) {
		let e = t.classes.map(o);
		e.some((e, n) => e !== t.classes[n]) && (s = s.setElement(t.name, e));
	}
	return s.renameVariable(n.name, i);
}
function Ge(e, t) {
	let { engine: n } = L();
	return (r, i = []) => e.readOnly ? [] : [
		{
			label: u("Rename…"),
			icon: "edit",
			onSelect: async () => {
				let i = await Ue(e.sheet, t.prefix, u("Rename"), u("Rename"), r.key, t.placeholder);
				i && e.change((e) => We(e, n, r, i));
			}
		},
		...i,
		{
			separator: !0,
			label: ""
		},
		{
			label: u("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => e.change((e) => e.variables().filter((e) => e.name === r.name || e.name.startsWith(`${r.name}--`)).reduce((e, t) => e.setVariable(t.name, null), e))
		}
	];
}
var Ke = (e, t) => async () => {
	let n = await Ue(e.sheet, t.prefix, t.fresh, t.add, "", t.placeholder);
	n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
};
function Z({ edit: e, kind: t, row: n }) {
	let r = Ge(e, t), i = X(e.sheet, t.prefix), a = Ke(e, t);
	return /* @__PURE__ */ j(V, {
		title: t.title,
		onAdd: !e.readOnly && i.length > 0 ? () => void a() : void 0,
		addLabel: t.add,
		children: [i.length === 0 && /* @__PURE__ */ A(v, {
			compact: !0,
			icon: t.icon,
			title: t.none,
			action: e.readOnly ? void 0 : /* @__PURE__ */ A(_, {
				icon: "plus",
				onClick: () => void a(),
				children: t.add
			})
		}), i.map((t) => n(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => r(t, e)))]
	});
}
var Q = (e, t = {}) => ({
	component: "blocks-value",
	unit: e,
	...t
}), qe = Q("rem", {
	units: [
		"rem",
		"px",
		"em",
		"%",
		"vw"
	],
	step: .125
});
function Je({ value: e, of: t }) {
	let n = Math.max(...t.map((e) => q(e.value)), 1);
	return q(e) <= 0 ? null : /* @__PURE__ */ A("span", {
		className: "h-1.5 min-w-px rounded-full bg-border-strong",
		style: { width: `${q(e) / n * 100}%` }
	});
}
var $ = "w-[108px] shrink-0 max-sm:order-3 max-sm:w-auto max-sm:min-w-0 max-sm:flex-1 max-sm:basis-[40%]";
function Ye({ edit: e }) {
	let t = {
		prefix: "--color-",
		title: u("Colors"),
		add: u("Add Color"),
		fresh: u("New Color"),
		none: u("No colors"),
		icon: "palette",
		start: C,
		placeholder: "brand"
	}, n = Ge(e, t), r = X(e.sheet, t.prefix), i = Ke(e, t), a = e.sheet.variable("--color-*") !== "initial", o = (t, n, r) => e.change((e) => e.setVariable(t.name, r && r !== n ? `light-dark(${n}, ${r})` : n));
	return /* @__PURE__ */ j(k, { children: [
		/* @__PURE__ */ A(V, { children: /* @__PURE__ */ A(W, {
			label: u("Dark Mode"),
			children: /* @__PURE__ */ A(ce, {
				size: "sm",
				"aria-label": u("Dark Mode"),
				checked: e.dark,
				disabled: e.readOnly,
				onChange: (t) => e.change((e) => e.setProperty(":root", "color-scheme", t ? "light dark" : null))
			})
		}) }),
		/* @__PURE__ */ j(V, { children: [
			/* @__PURE__ */ j("div", {
				className: "flex min-h-9 items-center gap-2 border-b border-border text-2xs text-faint max-sm:flex-wrap max-sm:py-1",
				children: [
					/* @__PURE__ */ A("span", {
						className: "min-w-0 flex-1 max-sm:order-1 max-sm:basis-[calc(100%-2.5rem)]",
						children: u("Name")
					}),
					e.dark && /* @__PURE__ */ j("span", {
						className: T($, "flex items-center gap-1"),
						children: [/* @__PURE__ */ A(b, {
							name: "sun",
							size: 11
						}), u("Light")]
					}),
					e.dark && /* @__PURE__ */ j("span", {
						className: T($, "flex items-center gap-1"),
						children: [/* @__PURE__ */ A(b, {
							name: "moon",
							size: 11
						}), u("Dark")]
					}),
					!e.dark && /* @__PURE__ */ A("span", {
						className: $,
						children: u("Value")
					}),
					e.readOnly || r.length === 0 ? /* @__PURE__ */ A("span", { className: "size-6 shrink-0 max-sm:order-2" }) : /* @__PURE__ */ A(w, {
						content: t.add,
						children: /* @__PURE__ */ A(x, {
							icon: "plus",
							label: t.add,
							title: void 0,
							size: "xs",
							className: "shrink-0 max-sm:order-2",
							onClick: () => void i()
						})
					})
				]
			}),
			r.length === 0 && /* @__PURE__ */ A(v, {
				compact: !0,
				icon: t.icon,
				title: t.none,
				action: e.readOnly ? void 0 : /* @__PURE__ */ A(_, {
					icon: "plus",
					onClick: () => void i(),
					children: t.add
				})
			}),
			r.map((t) => {
				let { light: r, dark: i } = _e(t.value);
				return /* @__PURE__ */ j(U, {
					name: t.key,
					wide: !0,
					menu: n(t),
					children: [/* @__PURE__ */ A("div", {
						className: $,
						children: /* @__PURE__ */ A(H, {
							handle: `${t.name}:light`,
							label: e.dark ? u("{name} in Light Mode", { name: t.key }) : t.key,
							value: r,
							disabled: e.readOnly,
							field: {
								type: "color",
								component: "blocks-color"
							},
							onChange: (e) => e && o(t, e, i)
						})
					}), e.dark && /* @__PURE__ */ A("div", {
						className: $,
						children: /* @__PURE__ */ A(H, {
							handle: `${t.name}:dark`,
							label: u("{name} in Dark Mode", { name: t.key }),
							value: i ?? null,
							disabled: e.readOnly,
							field: {
								type: "color",
								component: "blocks-color",
								placeholder: u("Same"),
								swatch: r
							},
							onChange: (e) => o(t, r, e ?? void 0)
						})
					})]
				}, t.name);
			})
		] }),
		/* @__PURE__ */ A(V, { children: /* @__PURE__ */ A(W, {
			label: u("Tailwind Palette"),
			children: /* @__PURE__ */ A(ce, {
				size: "sm",
				"aria-label": u("Tailwind Palette"),
				checked: a,
				disabled: e.readOnly,
				onChange: (t) => e.change((e) => e.setVariable("--color-*", t ? null : "initial", "first"))
			})
		}) })
	] });
}
function Xe(e) {
	let t = e.flatMap((e) => String(e.weight ?? "400").split(/\s+/).map(Number)).filter((e) => e > 0), n = Math.min(...t), r = Math.max(...t), i = t.length === 0 ? "400" : n === r ? String(n) : `${n}–${r}`;
	return e.some((e) => e.style === "italic") ? `${i} · ${u("Italic")}` : i;
}
function Ze({ edit: i, fonts: a }) {
	let o = [...new Set(a.faces.map((e) => e.family))], s = new Set(X(i.sheet, "--font-").map((n) => t(e(n.value)))), c = o.map((e) => {
		let t = a.faces.filter((t) => t.family === e);
		return {
			family: e,
			styles: Xe(t),
			fallback: t.some((e) => Array.isArray(e.fallback) ? e.fallback.length > 0 : !!e.fallback),
			used: s.has(e)
		};
	}), l = n("", "sans", !1), d = i.sheet.variable("--font-display") ?? X(i.sheet, "--font-")[0]?.value, f = () => [
		["sans", u("Sans")],
		["serif", u("Serif")],
		["mono", u("Mono")]
	];
	return /* @__PURE__ */ j(k, { children: [
		/* @__PURE__ */ A(Z, {
			edit: i,
			kind: {
				prefix: "--font-",
				title: u("Fonts"),
				add: u("Add Font Family"),
				fresh: u("New Font Family"),
				none: u("No fonts"),
				icon: "typography",
				start: l,
				placeholder: "display"
			},
			row: (o, s, l) => {
				let d = e(o.value), p = t(d), m = a.faces.filter((e) => e.family === p), h = m.some((e) => e.preload);
				return /* @__PURE__ */ A(U, {
					name: o.key,
					sample: /* @__PURE__ */ A("span", {
						className: "block max-w-7 overflow-hidden whitespace-nowrap text-center text-lg leading-none text-ink",
						style: { fontFamily: o.value },
						children: "Aa"
					}),
					menu: l([
						{
							separator: !0,
							label: ""
						},
						{
							heading: !0,
							label: u("Fallback")
						},
						...f().map(([e, t]) => ({
							label: t,
							checked: r(d) === e,
							onSelect: () => s(n(p, e, d.includes(`${p} Fallback`)))
						})),
						...m.length ? [{
							separator: !0,
							label: ""
						}, {
							label: u("Preload"),
							checked: h,
							onSelect: () => a.preload(p, !h)
						}] : []
					]),
					children: /* @__PURE__ */ A(H, {
						handle: o.name,
						label: o.key,
						value: o.value,
						disabled: i.readOnly,
						field: {
							component: "site-font-stack",
							fonts: c,
							...i.readOnly ? {} : {
								onAdd: a.add,
								onRemove: a.remove
							}
						},
						onChange: s
					})
				}, o.name);
			}
		}),
		/* @__PURE__ */ A(Z, {
			edit: i,
			kind: {
				prefix: "--text-",
				title: u("Text Sizes"),
				add: u("Add Text Size"),
				fresh: u("New Text Size"),
				none: u("No text sizes"),
				icon: "typography",
				start: "1.25rem",
				placeholder: "lead"
			},
			row: (e, t, n) => {
				let r = `${e.name}--line-height`;
				return /* @__PURE__ */ j(U, {
					name: e.key,
					menu: n(),
					below: /* @__PURE__ */ A("p", {
						className: "m-0 truncate pb-2.5 text-ink",
						style: {
							fontSize: `min(${e.value}, 3rem)`,
							lineHeight: 1.1,
							fontFamily: d
						},
						children: u("Ship It")
					}),
					children: [/* @__PURE__ */ A(H, {
						handle: e.name,
						label: e.key,
						value: e.value,
						disabled: i.readOnly,
						field: qe,
						onChange: t
					}), /* @__PURE__ */ A(H, {
						handle: r,
						label: u("Line Height of {name}", { name: e.key }),
						value: i.sheet.variable(r) ?? null,
						disabled: i.readOnly,
						className: "!flex-none w-20",
						field: Q("", {
							step: .05,
							min: 0,
							placeholder: "–"
						}),
						onChange: (e) => i.change((t) => t.setVariable(r, e))
					})]
				}, e.name);
			}
		}),
		/* @__PURE__ */ A(Z, {
			edit: i,
			kind: {
				prefix: "--font-weight-",
				title: u("Weights"),
				add: u("Add Weight"),
				fresh: u("New Weight"),
				none: u("No weights"),
				icon: "typography",
				start: "600",
				placeholder: "strong"
			},
			row: (e, t, n) => /* @__PURE__ */ A(U, {
				name: e.key,
				menu: n(),
				sample: /* @__PURE__ */ A("span", {
					className: "text-base text-ink",
					style: { fontWeight: Number(e.value) || 400 },
					children: "Ag"
				}),
				children: /* @__PURE__ */ A(H, {
					handle: e.name,
					label: e.key,
					value: e.value,
					disabled: i.readOnly,
					field: Q("", {
						step: 100,
						min: 100,
						max: 900
					}),
					onChange: t
				})
			}, e.name)
		}),
		/* @__PURE__ */ A(Z, {
			edit: i,
			kind: {
				prefix: "--leading-",
				title: u("Line Heights"),
				add: u("Add Line Height"),
				fresh: u("New Line Height"),
				none: u("No line heights"),
				icon: "typography",
				start: "1.5",
				placeholder: "relaxed"
			},
			row: (e, t, n) => /* @__PURE__ */ A(U, {
				name: e.key,
				menu: n(),
				sample: /* @__PURE__ */ A("span", {
					className: "flex w-4 flex-col",
					style: { gap: `${Math.max(1, (Number(e.value) - .8) * 6)}px` },
					children: [
						0,
						1,
						2
					].map((e) => /* @__PURE__ */ A("span", { className: T("h-0.5 rounded-full bg-muted", e === 2 && "w-2/3") }, e))
				}),
				children: /* @__PURE__ */ A(H, {
					handle: e.name,
					label: e.key,
					value: e.value,
					disabled: i.readOnly,
					field: Q("", {
						step: .05,
						min: 0
					}),
					onChange: t
				})
			}, e.name)
		}),
		/* @__PURE__ */ A(Z, {
			edit: i,
			kind: {
				prefix: "--tracking-",
				title: u("Letter Spacing"),
				add: u("Add Letter Spacing"),
				fresh: u("New Letter Spacing"),
				none: u("No letter spacing"),
				icon: "typography",
				start: "0em",
				placeholder: "wide"
			},
			row: (e, t, n) => /* @__PURE__ */ A(U, {
				name: e.key,
				menu: n(),
				sample: /* @__PURE__ */ A("span", {
					className: "text-xs font-medium text-ink",
					style: { letterSpacing: e.value },
					children: "Aa"
				}),
				children: /* @__PURE__ */ A(H, {
					handle: e.name,
					label: e.key,
					value: e.value,
					disabled: i.readOnly,
					field: Q("em", {
						units: ["em", "px"],
						step: .005
					}),
					onChange: t
				})
			}, e.name)
		})
	] });
}
var Qe = [
	"sm",
	"md",
	"lg",
	"xl",
	"2xl"
];
function $e({ edit: e }) {
	let { engine: t } = L(), n = {
		prefix: "--spacing-",
		title: u("Spacing"),
		add: u("Add Spacing"),
		fresh: u("New Spacing"),
		none: u("No named spacing"),
		icon: "spacing",
		start: "2rem",
		placeholder: "gutter"
	}, r = {
		prefix: "--container-",
		title: u("Containers"),
		add: u("Add Container"),
		fresh: u("New Container"),
		none: u("No containers"),
		icon: "ruler",
		start: "72rem",
		placeholder: "content"
	}, i = {
		prefix: "--breakpoint-",
		title: u("Breakpoints"),
		add: u("Add Breakpoint"),
		fresh: u("New Breakpoint"),
		none: "",
		icon: "desktop",
		start: "120rem",
		placeholder: "3xl"
	}, a = Ge(e, i), o = X(e.sheet, i.prefix), s = new Map(I(t).of("breakpoint").filter((e) => Qe.includes(e.name)).map((e) => [e.variable, {
		name: e.variable,
		key: e.name,
		value: e.value
	}]));
	for (let e of o) s.set(e.name, e);
	let c = [...s.values()].sort((e, t) => q(e.value) - q(t.value)), l = Ke(e, i), d = (t) => (n, r, i) => /* @__PURE__ */ A(U, {
		name: n.key,
		menu: i(),
		after: /* @__PURE__ */ A(Je, {
			value: n.value,
			of: X(e.sheet, t.prefix)
		}),
		children: /* @__PURE__ */ A(H, {
			handle: n.name,
			label: n.key,
			value: n.value,
			disabled: e.readOnly,
			field: qe,
			onChange: r
		})
	}, n.name);
	return /* @__PURE__ */ j(k, { children: [
		/* @__PURE__ */ A(V, { children: /* @__PURE__ */ A(W, {
			label: u("Spacing Unit"),
			children: /* @__PURE__ */ A(H, {
				handle: "--spacing",
				label: u("Spacing Unit"),
				value: e.sheet.variable("--spacing") ?? null,
				disabled: e.readOnly,
				field: Q("rem", {
					units: ["rem", "px"],
					step: .0625,
					min: 0,
					placeholder: "0.25rem"
				}),
				onChange: (t) => e.change((e) => e.setVariable("--spacing", t))
			})
		}) }),
		/* @__PURE__ */ A(Z, {
			edit: e,
			kind: n,
			row: d(n)
		}),
		/* @__PURE__ */ A(Z, {
			edit: e,
			kind: r,
			row: d(r)
		}),
		/* @__PURE__ */ A(V, {
			title: i.title,
			onAdd: e.readOnly ? void 0 : () => void l(),
			addLabel: i.add,
			children: c.map((t) => {
				let n = o.some((e) => e.name === t.name) && !e.readOnly ? [{
					label: u("Reset"),
					icon: "undo",
					onSelect: () => e.change((e) => e.setVariable(t.name, null))
				}] : [];
				return /* @__PURE__ */ A(U, {
					name: t.key,
					menu: Qe.includes(t.key) ? n : a(t),
					after: /* @__PURE__ */ A(Je, {
						value: t.value,
						of: c
					}),
					children: /* @__PURE__ */ A(H, {
						handle: t.name,
						label: t.key,
						value: t.value,
						disabled: e.readOnly,
						field: Q("rem", {
							units: [
								"rem",
								"px",
								"em"
							],
							min: 0
						}),
						onChange: (n) => n !== null && e.change((e) => e.setVariable(t.name, n))
					})
				}, t.name);
			})
		})
	] });
}
function et({ edit: e }) {
	return /* @__PURE__ */ j(k, { children: [/* @__PURE__ */ A(Z, {
		edit: e,
		kind: {
			prefix: "--radius-",
			title: u("Radius"),
			add: u("Add Radius"),
			fresh: u("New Radius"),
			none: u("No radius"),
			icon: "radius",
			start: "0.5rem",
			placeholder: "card"
		},
		row: (t, n, r) => /* @__PURE__ */ A(U, {
			name: t.key,
			menu: r(),
			sample: /* @__PURE__ */ A("span", {
				className: "size-5 translate-x-0.5 translate-y-0.5 border-l-[1.5px] border-t-[1.5px] border-muted",
				style: { borderTopLeftRadius: `min(${t.value}, 20px)` }
			}),
			children: /* @__PURE__ */ A(H, {
				handle: t.name,
				label: t.key,
				value: t.value,
				disabled: e.readOnly,
				field: Q("rem", {
					units: [
						"rem",
						"px",
						"%"
					],
					step: .125,
					min: 0
				}),
				onChange: n
			})
		}, t.name)
	}), /* @__PURE__ */ A(Z, {
		edit: e,
		kind: {
			prefix: "--shadow-",
			title: u("Shadows"),
			add: u("Add Shadow"),
			fresh: u("New Shadow"),
			none: u("No shadows"),
			icon: "layers",
			start: "0 4px 16px -4px rgb(0 0 0 / 0.12)",
			placeholder: "card"
		},
		row: (t, n, r) => /* @__PURE__ */ A(U, {
			name: t.key,
			menu: r(),
			sample: /* @__PURE__ */ A("span", {
				className: "size-5 shrink-0 rounded-xs border border-border bg-bg",
				style: { boxShadow: t.value }
			}),
			children: /* @__PURE__ */ A(H, {
				handle: t.name,
				label: t.key,
				value: t.value,
				disabled: e.readOnly,
				field: { component: "site-shadow" },
				onChange: n
			})
		}, t.name)
	})] });
}
function tt(e, t) {
	let n = String(e ?? "").trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/);
	if (!n) return t;
	let r = n[2] === "s" ? Number(n[1]) : Number(n[1]) / 1e3;
	return Math.min(2, Math.max(.05, Math.round(r * 1e3) / 1e3));
}
function nt({ edit: e, transition: t, onTransition: n }) {
	return /* @__PURE__ */ j(k, { children: [/* @__PURE__ */ A(Z, {
		edit: e,
		kind: {
			prefix: "--ease-",
			title: u("Easings"),
			add: u("Add Easing"),
			fresh: u("New Easing"),
			none: u("No easings"),
			icon: "speed",
			start: "cubic-bezier(0.2, 0.8, 0.2, 1)",
			placeholder: "out"
		},
		row: (t, n, r) => /* @__PURE__ */ A(U, {
			name: t.key,
			menu: r(),
			children: /* @__PURE__ */ A(H, {
				handle: t.name,
				label: t.key,
				value: t.value,
				disabled: e.readOnly,
				field: { component: "ease" },
				onChange: n
			})
		}, t.name)
	}), /* @__PURE__ */ j(V, {
		title: u("Page Transition"),
		children: [
			/* @__PURE__ */ A(W, {
				label: u("Effect"),
				children: /* @__PURE__ */ A(H, {
					handle: "type",
					label: u("Effect"),
					value: t.type,
					disabled: e.readOnly,
					field: {
						type: "select",
						mono: !1,
						required: !0,
						options: {
							none: u("None"),
							fade: u("Fade"),
							slide: u("Slide"),
							scale: u("Scale")
						}
					},
					onChange: (e) => n({
						...t,
						type: e ?? "none"
					})
				})
			}),
			t.type !== "none" && /* @__PURE__ */ A(W, {
				label: u("Duration"),
				children: /* @__PURE__ */ A(H, {
					handle: "duration",
					label: u("Duration"),
					value: `${Math.round(t.duration * 1e3)}ms`,
					disabled: e.readOnly,
					field: Q("ms", {
						units: ["ms"],
						step: 10,
						min: 50,
						max: 2e3
					}),
					onChange: (e) => n({
						...t,
						duration: tt(e, t.duration)
					})
				})
			}),
			/* @__PURE__ */ A(W, {
				label: u("Page Loads"),
				children: /* @__PURE__ */ A(H, {
					handle: "navigation",
					label: u("Page Loads"),
					value: t.navigation,
					disabled: e.readOnly,
					field: {
						type: "select",
						mono: !1,
						required: !0,
						options: {
							document: u("Full Page"),
							client: u("Instant")
						}
					},
					onChange: (e) => n({
						...t,
						navigation: e === "client" ? "client" : "document"
					})
				})
			})
		]
	})] });
}
// admin/src/Styling.tsx
var rt = { files: {} }, it = [
	"colors",
	"typography",
	"layout",
	"shape",
	"motion",
	"classes",
	"elements",
	"code"
];
function at() {
	return [{
		group: u("Theme"),
		items: [
			{
				value: "colors",
				label: u("Colors"),
				icon: "palette"
			},
			{
				value: "typography",
				label: u("Typography"),
				icon: "typography"
			},
			{
				value: "layout",
				label: u("Layout"),
				icon: "ruler"
			},
			{
				value: "shape",
				label: u("Shape"),
				icon: "radius"
			},
			{
				value: "motion",
				label: u("Motion"),
				icon: "speed"
			}
		]
	}, {
		group: u("Styles"),
		items: [
			{
				value: "classes",
				label: u("Classes"),
				icon: "symbol"
			},
			{
				value: "elements",
				label: u("Elements"),
				icon: "paragraph"
			},
			{
				value: "code",
				label: u("Code"),
				icon: "code"
			}
		]
	}];
}
var ot = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
function st() {
	let e = d("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), t = d("styling/source", {}, {
		refetchOnWindowFocus: !1,
		retry: !1,
		staleTime: 6e4
	}), [n, r] = g(rt), { query: v } = f(), b = v.class ? "classes" : it.includes(v.tab) ? v.tab : it[0], S = (e) => l({
		tab: e === it[0] ? null : e,
		class: null
	}), [C, oe] = g(pe() === "dark" ? "dark" : "light"), [ce, ue] = g(!1), [de, me] = g(() => window.matchMedia("(max-width: 767px)").matches);
	p(() => {
		let e = window.matchMedia("(max-width: 767px)"), t = () => me(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let M = ce && de, [N, _e] = g("desktop"), [ve, ye] = g(!1), [P, F] = g(null), I = fe(), L = h(null), R = e.data, z = n.css ?? R?.css, B = n.transition ?? R?.transition, H = n.js ?? R?.js ?? "", U = !!R && (n.css !== void 0 && n.css !== R.css || n.transition !== void 0 && !ot(n.transition, R.transition) || n.js !== void 0 && n.js !== R.js || Object.keys(n.files).length > 0), W = !o("settings.manage"), G = m(() => new he(z ?? ""), [z]), K = Te(t.data, z), q = /^light\s+dark\b/.test(G.property(":root", "color-scheme") ?? "");
	if (p(() => {
		let e = document.createElement("style");
		return e.textContent = (R?.fonts ?? []).map((e) => `@font-face{font-family:"${e.family}";src:url("${/^(https:\/\/|\/)/.test(e.src) ? e.src : `/_cms/fonts/${e.src.split("/").pop()}`}") format("woff2");font-weight:${e.weight ?? "400"};font-style:${e.style ?? "normal"};font-display:swap}`).join("\n"), document.head.appendChild(e), () => e.remove();
	}, [R?.fonts]), e.isLoading || t.isLoading) return /* @__PURE__ */ A("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ A(se, {})
	});
	if (!R || !t.data || z === void 0 || !B) return /* @__PURE__ */ j("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ A(le, { crumbs: [{
			label: u("Styling"),
			icon: "palette"
		}] }), /* @__PURE__ */ A(te, {
			title: u("Couldn’t load the styling"),
			onRetry: () => {
				e.refetch(), t.refetch();
			},
			retrying: e.isRefetching || t.isRefetching
		})]
	});
	let J = {
		sheet: G,
		change: (e) => !W && r((t) => ({
			...t,
			css: e(new he(t.css ?? R.css)).css
		})),
		readOnly: W,
		dark: q,
		mode: q ? C : "light"
	}, Y = () => {
		s("styling/"), L.current?.contentWindow?.location.reload();
	}, be = async () => {
		if (U && !ve) {
			ye(!0), F(null);
			try {
				let a = {};
				n.css !== void 0 && n.css !== R.css && (a.css = n.css), n.transition !== void 0 && !ot(n.transition, R.transition) && (a.transition = n.transition), Object.keys(a).length > 0 && await c("styling/update", a), n.js !== void 0 && n.js !== R.js && await c("styling-code/set-custom", { js: n.js });
				for (let [e, t] of Object.entries(n.files)) await c("styling-code/save", {
					path: e,
					contents: t
				});
				await Promise.all([e.refetch(), t.refetch()]), s("styling-code/"), r(rt), L.current?.contentWindow?.location.reload(), i();
			} catch (e) {
				F({
					message: e instanceof Error ? e.message : String(e),
					refused: e instanceof a && e.type === "invalid_input"
				});
			} finally {
				ye(!1);
			}
		}
	}, xe = {
		faces: R.fonts,
		add: async (e) => {
			try {
				if (e === "google") {
					let e = await D({
						title: u("Add a Google Font"),
						fields: [{
							handle: "family",
							type: "text",
							label: u("Name"),
							placeholder: "Inter Tight",
							autofocus: !0,
							required: !0
						}],
						confirm: u("Add Font")
					}), t = String(e?.family ?? "").trim();
					if (!t) return null;
					let n = await c("styling/fonts-import", { family: t });
					return O.success(u("{family} added", { family: t })), Y(), {
						family: t,
						fallback: n.fonts.some((e) => !!e.fallback)
					};
				}
				let t = await new Promise((e) => {
					let t = document.createElement("input");
					t.type = "file", t.accept = ".woff2,font/woff2", t.onchange = () => e(t.files?.[0] ?? null), t.oncancel = () => e(null), t.click();
				});
				if (!t) return null;
				let n = await new Promise((e) => {
					let n = new FileReader();
					n.onload = () => e(String(n.result)), n.readAsDataURL(t);
				}), r = t.name.replace(/\.woff2$/i, ""), i = await D({
					title: u("Upload Font"),
					fields: [{
						handle: "family",
						type: "text",
						label: u("Family Name"),
						autofocus: !0,
						required: !0
					}],
					values: { family: r.replace(/[-_](regular|bold|variable|italic|\d+).*$/i, "").replace(/[-_]/g, " ") },
					confirm: u("Upload Font")
				}), a = String(i?.family ?? "").trim();
				return a ? (await c("styling/fonts-upload", {
					family: a,
					name: r,
					data: n,
					weight: /variable/i.test(r) ? "100 900" : "400",
					style: /italic/i.test(r) ? "italic" : "normal"
				}), O.success(u("{family} uploaded", { family: a })), Y(), {
					family: a,
					fallback: !1
				}) : null;
			} catch (e) {
				return O.error(e), null;
			}
		},
		remove: async (e) => {
			if (await E({
				title: u("Remove {family}?", { family: e }),
				confirm: u("Remove Font"),
				danger: !0
			})) try {
				await c("styling/update", { fonts: R.fonts.filter((t) => t.family !== e) }), Y();
			} catch (e) {
				O.error(e);
			}
		},
		preload: async (e, t) => {
			let n = R.fonts.some((t) => t.family === e && t.style !== "italic");
			try {
				await c("styling/update", { fonts: R.fonts.map((r) => r.family === e ? {
					...r,
					preload: t && (!n || r.style !== "italic")
				} : r) }), Y();
			} catch (e) {
				O.error(e);
			}
		}
	}, Se = /* @__PURE__ */ j(k, { children: [
		b === "colors" && /* @__PURE__ */ A(Ye, { edit: J }),
		b === "typography" && /* @__PURE__ */ A(Ze, {
			edit: J,
			fonts: xe
		}),
		b === "layout" && /* @__PURE__ */ A($e, { edit: J }),
		b === "shape" && /* @__PURE__ */ A(et, { edit: J }),
		b === "motion" && /* @__PURE__ */ A(nt, {
			edit: J,
			transition: B,
			onTransition: (e) => !W && r((t) => ({
				...t,
				transition: e
			}))
		}),
		b === "classes" && /* @__PURE__ */ A(Fe, { edit: J }),
		b === "elements" && /* @__PURE__ */ A(Ve, { edit: J }),
		b === "code" && /* @__PURE__ */ j(k, { children: [/* @__PURE__ */ A(V, {
			title: u("Stylesheet"),
			children: /* @__PURE__ */ A("div", {
				className: "pt-2",
				children: /* @__PURE__ */ A(y, {
					bare: !0,
					fields: [{
						handle: "css",
						type: "code",
						label: u("Stylesheet"),
						rows: 24,
						language: "tailwind"
					}],
					values: { css: z },
					onChange: (e, t) => r((e) => ({
						...e,
						css: t ?? ""
					})),
					disabled: W
				})
			})
		}), /* @__PURE__ */ A(Ce, {
			js: H,
			onJs: (e) => r((t) => ({
				...t,
				js: e
			})),
			edits: n.files,
			onEdit: (e, t) => r((n) => ({
				...n,
				files: t === null ? Object.fromEntries(Object.entries(n.files).filter(([t]) => t !== e)) : {
					...n.files,
					[e]: t
				}
			}))
		})] })
	] });
	return /* @__PURE__ */ j("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ A(le, {
				crumbs: [{
					label: u("Styling"),
					icon: "palette"
				}, { label: at().flatMap((e) => e.items).find((e) => e.value === b)?.label ?? "" }],
				actions: /* @__PURE__ */ j(k, { children: [/* @__PURE__ */ A(_, {
					variant: "ghost",
					icon: "eye",
					"aria-pressed": M,
					onClick: () => ue(!M),
					className: "md:hidden",
					children: u("Preview")
				}), /* @__PURE__ */ A(w, {
					content: u("Open Site"),
					children: /* @__PURE__ */ A(x, {
						icon: "external",
						label: u("Open Site"),
						title: void 0,
						onClick: () => window.open("/", "_blank", "noopener"),
						className: "max-md:hidden"
					})
				})] })
			}),
			/* @__PURE__ */ A(re, {
				title: u("Styling"),
				backTo: "/",
				backLabel: u("Dashboard"),
				nested: !0,
				children: /* @__PURE__ */ A("nav", {
					"aria-label": u("Styling"),
					className: I.nested ? "space-y-px" : "px-2 pb-4",
					children: at().map((e, t) => /* @__PURE__ */ j("div", {
						className: T("space-y-px", t > 0 && (I.nested ? "mt-1" : "mt-4")),
						children: [!I.nested && /* @__PURE__ */ A("div", {
							className: "cms-label flex h-7 items-center px-2",
							children: e.group
						}), e.items.map((e) => /* @__PURE__ */ A(ae, {
							label: e.label,
							icon: I.nested ? void 0 : e.icon,
							active: b === e.value,
							onClick: () => S(e.value)
						}, e.value))]
					}, e.group))
				})
			}),
			/* @__PURE__ */ A(ne, {
				dirty: U,
				saving: ve,
				error: P ? P.refused ? u("The stylesheet was not saved") : P.message : null,
				onSave: () => void be(),
				onDiscard: () => {
					r(rt), F(null);
				}
			}),
			/* @__PURE__ */ A(ge, {
				source: K.source ?? t.data,
				children: /* @__PURE__ */ j("div", {
					className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(380px,460px)_minmax(0,1fr)]",
					children: [/* @__PURE__ */ j("div", {
						className: T("overflow-y-auto border-border px-4 pb-16 pt-2 md:border-r", M && "max-md:hidden"),
						children: [P?.refused && /* @__PURE__ */ A(ee, {
							tone: "danger",
							className: "mb-3 mt-1",
							title: u("Tailwind refused the stylesheet"),
							onDismiss: () => F(null),
							children: P.message
						}), Se]
					}, b), /* @__PURE__ */ j("div", {
						className: T("flex min-w-0 flex-col bg-sunken", !M && "max-md:hidden"),
						children: [/* @__PURE__ */ j("div", {
							className: "flex h-10 shrink-0 items-center gap-2 border-b border-border bg-bg px-3",
							children: [
								/* @__PURE__ */ A("span", {
									className: "max-md:hidden",
									children: /* @__PURE__ */ A(ie, {
										size: "xs",
										"aria-label": u("Screen"),
										value: N,
										onChange: _e,
										options: [
											{
												value: "desktop",
												icon: "desktop",
												title: u("Desktop")
											},
											{
												value: "tablet",
												icon: "tablet",
												title: u("Tablet")
											},
											{
												value: "phone",
												icon: "phone",
												title: u("Phone")
											}
										]
									})
								}),
								N !== "desktop" && /* @__PURE__ */ A("span", {
									className: "font-mono text-2xs text-faint max-md:hidden",
									children: we[N]
								}),
								/* @__PURE__ */ A("span", { className: "flex-1" }),
								q && /* @__PURE__ */ A(ie, {
									size: "xs",
									"aria-label": u("Color Mode"),
									value: C,
									onChange: oe,
									options: [{
										value: "light",
										icon: "sun",
										title: u("Light")
									}, {
										value: "dark",
										icon: "moon",
										title: u("Dark")
									}]
								})
							]
						}), /* @__PURE__ */ A(ct, {
							frame: L,
							compile: K,
							published: R.stylesheet,
							viewport: M ? "phone" : N,
							mode: q ? C : null,
							bordered: N !== "desktop" && !M
						})]
					})]
				})
			})
		]
	});
}
function ct(e) {
	let { breakpoints: t } = L();
	return /* @__PURE__ */ A(ke, {
		...e,
		desktop: t.find((e) => e.name === "lg")?.width ?? 1024
	});
}
export { st as default };
