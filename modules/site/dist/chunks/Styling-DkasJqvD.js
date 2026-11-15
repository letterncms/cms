import { a as e, i as t, o as n, s as r } from "./fields-CzRmxtjf.js";
import { CmsError as i, can as a, invalidate as o, run as s, setQuery as c, t as l, useAbility as u, useLocation as d } from "@letterncms/sdk";
import { useEffect as f, useMemo as p, useRef as m, useState as h } from "react";
import { Button as g, EmptyState as _, Fields as v, Icon as y, IconButton as b, Menu as x, NEW_COLOR as S, Notice as ee, Popover as C, Pressable as w, QueryError as T, SaveBar as te, ScreenSidebar as ne, Segmented as E, SidebarRow as re, Skeleton as ie, Spinner as ae, Tooltip as D, Topbar as oe, cn as O, confirm as se, copyText as ce, deviceWidths as k, prompt as A, toast as j, useScreenSidebar as le, useTheme as ue } from "@letterncms/ui";
import { Fragment as M, jsx as N, jsxs as P } from "react/jsx-runtime";
import { ClassesSection as F, ColorPicker as de, Specimen as I, StateMenu as fe, StylePanels as L, Stylesheet as pe, StylingProvider as me, askStyleName as R, balanced as z, buttonLabel as B, lightDark as V, loadCompiler as he, loadEngine as ge, loadTailwindTheme as _e, parseClass as ve, screenFor as ye, styleApi as be, styleSample as xe, themeDefaults as Se, useSpecimenSheet as H, useStyling as U, withVariants as W } from "@letterncms/blocks";
// admin/src/parts.tsx
var G = "cms-reveal shrink-0", K = () => /* @__PURE__ */ N("span", { className: "size-6 shrink-0" });
function q({ title: e, onAdd: t, addLabel: n, action: r, children: i }) {
	return /* @__PURE__ */ P("section", {
		className: "mb-6",
		children: [
			e && /* @__PURE__ */ P("div", {
				className: "flex h-9 items-center justify-between border-b border-border",
				children: [
					/* @__PURE__ */ N("h3", {
						className: "m-0 text-xs font-semibold text-ink",
						children: e
					}),
					r,
					t && n && /* @__PURE__ */ N(D, {
						content: n,
						children: /* @__PURE__ */ N(b, {
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
			!e && (r || t && n) && /* @__PURE__ */ N("div", {
				className: "flex h-9 items-center border-t border-border",
				children: r ?? /* @__PURE__ */ N(g, {
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
function J({ handle: e, label: t, value: n, onChange: r, field: i, disabled: a, className: o }) {
	return /* @__PURE__ */ N(v, {
		bare: !0,
		className: O("flex min-w-0 flex-1", o),
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
function Y({ name: e, copy: t = e, sample: n, after: r, below: i, wide: a, menu: o, children: s }) {
	return /* @__PURE__ */ P("div", {
		className: "cms-reveal-row group border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ P("div", {
			className: O("flex min-h-9 items-center gap-2 py-1", a && "max-sm:flex-wrap"),
			children: [
				n !== void 0 && /* @__PURE__ */ N("span", {
					className: "grid w-7 shrink-0 place-items-center",
					children: n
				}),
				/* @__PURE__ */ N(D, {
					content: l("Copy Name"),
					children: /* @__PURE__ */ N(g, {
						variant: "ghost",
						size: "xs",
						onClick: () => void ce(t, { copied: l("Copied {reference}", { reference: t }) }),
						"aria-label": l("Copy {reference}", { reference: t }),
						className: O("!justify-start !bg-transparent !px-0 text-left font-mono !font-normal hover:text-ink", a ? "min-w-0 flex-1 shrink max-sm:order-1 max-sm:basis-[calc(100%-2.5rem)]" : n === void 0 ? "w-[120px] max-sm:w-20" : "w-[84px] max-sm:w-16"),
						children: /* @__PURE__ */ N("span", {
							className: "truncate",
							children: e
						})
					})
				}),
				a ? s : /* @__PURE__ */ N("div", {
					className: "flex w-60 min-w-0 shrink gap-1 max-lg:w-52 max-sm:w-auto max-sm:flex-1",
					children: s
				}),
				!a && /* @__PURE__ */ N("span", {
					className: "flex min-w-0 flex-1 items-center max-sm:hidden",
					children: r
				}),
				o && o.length > 0 ? /* @__PURE__ */ N(x, {
					trigger: /* @__PURE__ */ N(b, {
						icon: "more",
						label: l("Actions"),
						size: "xs",
						className: O(G, a && "max-sm:order-2")
					}),
					items: o
				}) : /* @__PURE__ */ N("span", { className: O("size-6 shrink-0", a && "max-sm:order-2") })
			]
		}), i]
	});
}
function X({ label: e, action: t, children: n }) {
	return /* @__PURE__ */ P("div", {
		className: "cms-reveal-row flex min-h-9 items-center gap-2 border-b border-border py-1 last:border-b-0",
		children: [
			/* @__PURE__ */ N("span", {
				className: "w-[120px] shrink-0 truncate text-xs text-text max-sm:w-20",
				children: e
			}),
			/* @__PURE__ */ N("div", {
				className: "flex w-60 min-w-0 shrink items-center max-lg:w-52 max-sm:w-auto max-sm:flex-1",
				children: n
			}),
			/* @__PURE__ */ N("span", { className: "min-w-0 flex-1 max-sm:hidden" }),
			t ? /* @__PURE__ */ N("span", {
				className: G,
				children: t
			}) : /* @__PURE__ */ N(K, {})
		]
	});
}
function Z({ open: e, onToggle: t, label: n, aside: r, menu: i, children: a }) {
	return /* @__PURE__ */ P("div", {
		className: "cms-reveal-row group border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ P("div", {
			className: "flex min-h-10 items-center gap-2",
			children: [/* @__PURE__ */ P(g, {
				variant: "ghost",
				"aria-expanded": e,
				onClick: t,
				className: "!h-auto min-h-10 min-w-0 flex-1 shrink !justify-start !gap-1.5 !rounded-xs !bg-transparent !px-0 text-left !text-xs !font-normal focus-visible:!-outline-offset-2 hover:text-ink",
				children: [
					/* @__PURE__ */ N(y, {
						name: "chevron-right",
						size: 12,
						className: O("shrink-0 text-faint transition-transform duration-fast", e && "rotate-90")
					}),
					/* @__PURE__ */ N("span", {
						className: "min-w-0 flex-1 truncate",
						children: n
					}),
					r
				]
			}), i]
		}), e && /* @__PURE__ */ N("div", {
			className: "pb-3 pl-[18px]",
			children: a
		})]
	});
}
function Ce({ onOpen: e, label: t, sample: n, summary: r, menu: i }) {
	return /* @__PURE__ */ P("div", {
		className: "cms-reveal-row group flex min-h-10 items-center gap-2 border-b border-border py-1.5 last:border-b-0",
		children: [/* @__PURE__ */ P(g, {
			variant: "ghost",
			onClick: e,
			className: "!h-auto min-h-10 min-w-0 flex-1 shrink !justify-start !gap-2 !rounded-xs !bg-transparent !px-0 text-left !text-xs !font-normal focus-visible:!-outline-offset-2 hover:text-ink",
			children: [
				n,
				/* @__PURE__ */ N("span", {
					className: "shrink-0 text-ink",
					children: t
				}),
				r !== void 0 && /* @__PURE__ */ N("span", {
					className: "min-w-0 flex-1 truncate text-muted",
					children: r
				}),
				/* @__PURE__ */ N(y, {
					name: "chevron-right",
					size: 12,
					className: "shrink-0 text-faint"
				})
			]
		}), i ?? /* @__PURE__ */ N(K, {})]
	});
}
// admin/src/code-files.tsx
var we = () => /* @__PURE__ */ P("div", {
	className: "space-y-2 py-3",
	children: [/* @__PURE__ */ N(ie, { className: "h-3 w-32" }), /* @__PURE__ */ N(ie, { className: "h-3 w-24" })]
}), Te = (e, t) => t.length > 0 ? /* @__PURE__ */ N(x, {
	trigger: /* @__PURE__ */ N(b, {
		icon: "more",
		label: e,
		size: "xs",
		className: G
	}),
	items: t
}) : /* @__PURE__ */ N(K, {}), Ee = {
	scripts: "export function mount(el, props) {\n}\n",
	styles: "\n"
}, De = {
	scripts: "js",
	styles: "css"
};
function Oe({ path: e, name: t, open: n, onToggle: r, edited: i, onEdit: a, allowed: o, onDelete: s }) {
	let c = u("styling-code/get", { path: e }, {
		enabled: n && o && i === void 0,
		staleTime: 0
	});
	return o ? /* @__PURE__ */ N(Z, {
		open: n,
		onToggle: r,
		label: /* @__PURE__ */ N("span", {
			className: "font-mono",
			children: t
		}),
		menu: Te(l("File Actions"), o ? [{
			label: l("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: s
		}] : []),
		children: c.isError ? /* @__PURE__ */ N(T, {
			compact: !0,
			onRetry: () => void c.refetch(),
			retrying: c.isRefetching
		}) : i === void 0 && !c.data ? /* @__PURE__ */ N(we, {}) : /* @__PURE__ */ N(v, {
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
	}) : /* @__PURE__ */ N("div", {
		className: "flex min-h-10 items-center border-b border-border font-mono text-xs text-text last:border-b-0",
		children: t
	});
}
function ke({ js: e, onJs: t, edits: n, onEdit: r }) {
	let i = a("site.code"), c = u("styling-code/list"), d = u("styling-vendor/list"), [f, p] = h(null), [m, y] = h(null), b = () => o("styling-code/", "styling-vendor/"), x = async (e, t) => {
		try {
			return await e(), b(), j.success(t), !0;
		} catch (e) {
			return j.error(e), !1;
		}
	}, S = async (e, t, n) => {
		y(e), await x(t, n), y(null);
	}, C = async (e) => {
		let t = await A({
			title: l(e === "scripts" ? "New Script" : "New Stylesheet"),
			fields: [{
				handle: "name",
				type: "text",
				label: l("Name"),
				mono: !0,
				autofocus: !0,
				placeholder: "hero"
			}],
			confirm: l(e === "scripts" ? "Create Script" : "Create Stylesheet")
		}), n = String(t?.name ?? "").trim().toLowerCase().replace(/\.(js|css)$/, "").replace(/\s+/g, "-");
		if (!n) return;
		if ((c.data?.[e] ?? []).includes(n)) return void j.error(l("“{name}” already exists", { name: n }));
		let r = `${e}/${n}.${De[e]}`;
		await x(() => s("styling-code/save", {
			path: r,
			contents: Ee[e]
		}), l("{name} added", { name: n })) && p(r);
	}, w = async (e, t) => {
		await se({
			title: l("Delete “{name}”?", { name: t }),
			confirm: l("Delete"),
			danger: !0
		}) && await x(() => s("styling-code/delete", { path: e }), l("{name} deleted", { name: t })) && r(e, null);
	}, te = async () => {
		let e = await A({
			title: l("Add Library"),
			fields: [{
				handle: "package",
				type: "text",
				label: l("Package"),
				mono: !0,
				autofocus: !0,
				placeholder: "gsap@3.12.5"
			}],
			confirm: l("Add Library")
		}), t = String(e?.package ?? "").trim();
		t && await S("add", () => s("styling-vendor/create", { package: t }), l("{name} added", { name: t }));
	}, ne = async (e) => {
		await se({
			title: l("Delete “{name}”?", { name: e }),
			confirm: l("Delete"),
			danger: !0
		}) && await x(() => s("styling-vendor/delete", { import: e }), l("{name} deleted", { name: e }));
	}, E = (a, o, s) => {
		let u = c.data?.[a] ?? [];
		return /* @__PURE__ */ P(q, {
			title: o,
			onAdd: i && (a === "scripts" || u.length > 0) ? () => void C(a) : void 0,
			addLabel: s,
			children: [a === "scripts" && /* @__PURE__ */ N(Z, {
				open: f === "js",
				onToggle: () => p(f === "js" ? null : "js"),
				label: l("Site JavaScript"),
				menu: /* @__PURE__ */ N(K, {}),
				children: /* @__PURE__ */ N(v, {
					bare: !0,
					fields: [{
						handle: "js",
						type: "code",
						label: l("Site JavaScript"),
						rows: 14,
						placeholder: "document.addEventListener('cms:alpine', (e) => …)",
						language: "javascript"
					}],
					values: { js: e },
					onChange: (e, n) => t(n ?? ""),
					disabled: !i
				})
			}), c.isError ? /* @__PURE__ */ N(T, {
				compact: !0,
				onRetry: () => void c.refetch(),
				retrying: c.isRefetching
			}) : c.data ? u.length === 0 && a === "styles" ? /* @__PURE__ */ N(_, {
				compact: !0,
				icon: "code",
				title: l("No stylesheets"),
				action: i ? /* @__PURE__ */ N(g, {
					icon: "plus",
					onClick: () => void C(a),
					children: s
				}) : void 0
			}) : u.map((e) => {
				let t = `${a}/${e}.${De[a]}`;
				return /* @__PURE__ */ N(Oe, {
					path: t,
					name: e,
					open: f === t,
					onToggle: () => p(f === t ? null : t),
					edited: n[t],
					onEdit: (e) => r(t, e),
					allowed: i,
					onDelete: () => void w(t, e)
				}, t);
			}) : /* @__PURE__ */ N(we, {})]
		});
	};
	return /* @__PURE__ */ P(M, { children: [
		!i && /* @__PURE__ */ N(ee, {
			tone: "neutral",
			className: "mb-4",
			title: l("Editing code needs the “Edit Scripts and Stylesheets” permission.")
		}),
		E("scripts", l("Scripts"), l("New Script")),
		E("styles", l("Stylesheets"), l("New Stylesheet")),
		/* @__PURE__ */ N(q, {
			title: l("Libraries"),
			onAdd: i && m !== "add" && d.data?.imports.length ? () => void te() : void 0,
			addLabel: l("Add Library"),
			action: m === "add" ? /* @__PURE__ */ N("span", {
				role: "status",
				"aria-label": l("Working…"),
				className: "grid size-6 place-items-center text-faint",
				children: /* @__PURE__ */ N(ae, { size: 14 })
			}) : void 0,
			children: d.isError ? /* @__PURE__ */ N(T, {
				compact: !0,
				onRetry: () => void d.refetch(),
				retrying: d.isRefetching
			}) : d.data ? d.data.imports.length === 0 ? /* @__PURE__ */ N(_, {
				compact: !0,
				icon: "code",
				title: l("No libraries"),
				action: i ? /* @__PURE__ */ N(g, {
					icon: "plus",
					loading: m === "add",
					onClick: () => void te(),
					children: l("Add Library")
				}) : void 0
			}) : d.data.imports.map((e) => /* @__PURE__ */ P("div", {
				className: "cms-reveal-row group flex min-h-10 items-center gap-2 border-b border-border last:border-b-0",
				children: [
					/* @__PURE__ */ N("span", {
						className: "min-w-0 flex-1 truncate font-mono text-xs text-text",
						children: e.import
					}),
					/* @__PURE__ */ N("span", {
						className: "shrink-0 font-mono text-2xs text-faint",
						children: e.version
					}),
					m === e.import ? /* @__PURE__ */ N("span", {
						role: "status",
						"aria-label": l("Working…"),
						className: "grid size-6 shrink-0 place-items-center text-faint",
						children: /* @__PURE__ */ N(ae, { size: 14 })
					}) : Te(l("Library Actions"), i ? [
						{
							label: l("Update"),
							icon: "refresh",
							disabled: !!m,
							onSelect: () => void S(e.import, () => s("styling-vendor/update", { import: e.import }), l("{name} updated", { name: e.import }))
						},
						{
							separator: !0,
							label: ""
						},
						{
							label: l("Delete"),
							icon: "trash",
							danger: !0,
							disabled: !!m,
							onSelect: () => void ne(e.import)
						}
					] : [])
				]
			}, e.import)) : /* @__PURE__ */ N(we, {})
		})
	] });
}
// admin/src/preview.tsx
var Ae = {
	desktop: "100%",
	tablet: `${k.tablet}px`,
	phone: `${k.phone}px`
};
function je(e, t) {
	let [n, r] = h({
		source: void 0,
		compiler: null,
		problem: null
	}), i = m({
		base: e,
		css: t
	});
	i.current = {
		base: e,
		css: t
	};
	let a = m(!1), o = m({}), s = m(!1), c = m(!0);
	f(() => (c.current = !0, () => {
		c.current = !1;
	}), []);
	let u = !!n.source;
	return f(() => {
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
							let n = await he(t);
							if (n.build(e.base.candidates), !await ge(t)) throw Error(l("Tailwind could not read the stylesheet."));
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
		}, d = setTimeout(() => void n(), u ? 150 : 0);
		return () => clearTimeout(d);
	}, [
		e,
		t,
		u
	]), n;
}
function Me({ viewport: e, desktop: t, children: n }) {
	let r = m(null), [i, a] = h({
		width: 0,
		height: 0
	});
	f(() => {
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
	let o = e === "desktop" ? Math.max(i.width, t) : parseFloat(Ae[e]), s = i.width ? Math.min(1, i.width / o) : 1;
	return /* @__PURE__ */ N("div", {
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
var Ne = "cms-styling-draft";
function Pe(e, t, n, r) {
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
	let l = e.getElementById(Ne);
	l || (l = e.createElement("style"), l.id = Ne, o[0] ? o[0].after(l) : e.head.appendChild(l)), l.textContent !== c && (l.textContent = c);
	for (let e of o) e.disabled = !0;
}
function Fe({ frame: e, compile: t, published: n, viewport: r, desktop: i, mode: a, bordered: o }) {
	let [s, c] = h(0);
	return f(() => Pe(e.current?.contentDocument, t, n, a), [
		e,
		t,
		n,
		a,
		s
	]), /* @__PURE__ */ P("div", {
		className: "relative flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ N(Me, {
			viewport: r,
			desktop: i,
			children: (t) => /* @__PURE__ */ N("iframe", {
				ref: e,
				src: "/",
				title: l("Site Preview"),
				className: O("border-0 bg-bg", o && "border-x border-border"),
				style: t,
				onLoad: () => c((e) => e + 1)
			})
		}), t.problem && /* @__PURE__ */ N("div", {
			className: "absolute inset-x-3 top-3 rounded-lg bg-bg shadow-raise",
			children: /* @__PURE__ */ N(ee, {
				tone: "warning",
				title: l("Tailwind can’t read the stylesheet"),
				children: t.problem
			})
		})]
	});
}
// admin/src/rules.tsx
var Ie = (e) => e.replace(/^!|!$/g, ""), Le = (e) => e.elements().find((e) => e.name === "body")?.classes.join(" ") ?? "";
function Re({ edit: e, samples: t, label: n, node: r, classes: i, write: a, onBack: o, menu: s, groups: c }) {
	let u = U(), [d, f] = h([]), m = p(() => ye(t.device, 1280, u.breakpoints), [t.device, u.breakpoints]), _ = be(u.engine, i, m, d, e.readOnly ? () => {} : a), v = Le(e.sheet), y = H(t.compiler, [
		...ze(v),
		...i.map((e) => Ie(ve(e).utility)),
		...i,
		...ze(r.className ?? "")
	]);
	return /* @__PURE__ */ P("div", {
		className: "-mx-4 -mt-2",
		children: [
			/* @__PURE__ */ P("div", {
				className: "flex h-10 items-center gap-1 border-b border-border px-2",
				children: [
					/* @__PURE__ */ N(g, {
						variant: "ghost",
						size: "sm",
						icon: "arrow-left",
						onClick: o,
						className: "min-w-0 shrink !justify-start !px-2",
						children: /* @__PURE__ */ N("span", {
							className: "truncate",
							children: n
						})
					}),
					/* @__PURE__ */ N("span", { className: "flex-1" }),
					/* @__PURE__ */ N(fe, {
						classes: i,
						engine: u.engine,
						state: d,
						onState: f
					}),
					s && s.length > 0 && /* @__PURE__ */ N(x, {
						align: "end",
						trigger: /* @__PURE__ */ N(b, {
							icon: "more",
							label: l("Style Actions"),
							size: "xs"
						}),
						items: s
					})
				]
			}),
			/* @__PURE__ */ N("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ N(I, {
					sheet: y,
					node: r,
					page: v,
					mode: e.mode,
					align: "center",
					className: "h-28 rounded-md border border-border"
				})
			}),
			/* @__PURE__ */ P("div", {
				inert: e.readOnly,
				children: [/* @__PURE__ */ N(L, {
					s: _,
					groups: c
				}), /* @__PURE__ */ N(F, {
					s: _,
					site: u.classes,
					disabled: e.readOnly
				})]
			})
		]
	});
}
var ze = (e) => e.split(/\s+/).filter(Boolean), Be = [
	"typography",
	"spacing",
	"fill",
	"border",
	"effects",
	"transition"
], Ve = () => [
	{
		selector: "body",
		label: l("Body"),
		tag: "p"
	},
	{
		selector: "h1",
		label: l("Heading 1"),
		tag: "h1"
	},
	{
		selector: "h2",
		label: l("Heading 2"),
		tag: "h2"
	},
	{
		selector: "h3",
		label: l("Heading 3"),
		tag: "h3"
	},
	{
		selector: "h4",
		label: l("Heading 4"),
		tag: "h4"
	},
	{
		selector: "h5",
		label: l("Heading 5"),
		tag: "h5"
	},
	{
		selector: "h6",
		label: l("Heading 6"),
		tag: "h6"
	},
	{
		selector: "p",
		label: l("Paragraph"),
		tag: "p"
	},
	{
		selector: "a",
		label: l("Link"),
		tag: "a"
	},
	{
		selector: "strong",
		label: l("Bold"),
		tag: "strong"
	},
	{
		selector: "small",
		label: l("Small"),
		tag: "small"
	},
	{
		selector: "blockquote",
		label: l("Quote"),
		tag: "blockquote"
	},
	{
		selector: "code",
		label: l("Code"),
		tag: "code"
	},
	{
		selector: "figcaption",
		label: l("Caption"),
		tag: "figcaption"
	},
	{
		selector: "::selection",
		label: l("Selection"),
		tag: "span"
	}
];
function He({ edit: e, samples: t }) {
	let n = d().query.element ?? "", r = (e) => c({
		element: e,
		tab: "text"
	}, !1), i = e.sheet.elements(), a = (e) => i.find((t) => t.name === e)?.classes ?? [], o = Le(e.sheet), s = (e) => e.selector === "::selection" ? {
		tag: "span",
		text: e.label,
		className: a("::selection").join(" ")
	} : {
		tag: e.tag,
		text: e.label,
		...e.tag === "a" ? { attributes: { href: "#" } } : {}
	}, u = H(t.compiler, [...ze(o), ...a("::selection")]), f = Ve().find((e) => e.selector === n);
	return f ? /* @__PURE__ */ N(Re, {
		edit: e,
		samples: t,
		label: f.label,
		node: s(f),
		classes: a(f.selector),
		onBack: () => r(null),
		groups: Be,
		write: (t) => e.change((e) => e.setElement(f.selector, t)),
		menu: e.readOnly || a(f.selector).length === 0 ? [] : [{
			label: l("Reset"),
			icon: "undo",
			onSelect: () => e.change((e) => e.removeElement(f.selector))
		}]
	}, f.selector) : /* @__PURE__ */ N(q, { children: Ve().map((t) => /* @__PURE__ */ N(Ce, {
		onOpen: () => r(t.selector),
		sample: /* @__PURE__ */ N(I, {
			sheet: u,
			node: s(t),
			page: o,
			mode: e.mode,
			className: "h-12 min-w-0 flex-1 rounded-sm"
		}),
		label: /* @__PURE__ */ N("span", {
			className: "sr-only",
			children: t.label
		}),
		menu: e.readOnly || a(t.selector).length === 0 ? void 0 : /* @__PURE__ */ N(x, {
			trigger: /* @__PURE__ */ N(b, {
				icon: "more",
				label: l("Actions"),
				size: "xs",
				className: G
			}),
			items: [{
				label: l("Reset"),
				icon: "undo",
				onSelect: () => e.change((e) => e.removeElement(t.selector))
			}]
		})
	}, t.selector)) });
}
function Ue(e, t, n) {
	let r = (e) => {
		let { variants: r, utility: i } = ve(e);
		return Ie(i) === t ? W(r, i.replace(t, n)) : e;
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
function We({ edit: e, samples: t, buttons: n }) {
	let { engine: r } = U(), i = n ? "buttons" : "styles", a = d().query.style ?? "", o = (e) => c({
		style: e,
		tab: i
	}, !1), s = e.sheet.utilities(), u = s.filter((e) => /^[\w-]+$/.test(e.name) && e.name.startsWith("btn-") === n), f = u.find((e) => e.name === a), [p, m] = h(null), v = Le(e.sheet), y = (e) => xe(e), S = H(t.compiler, [...ze(v), ...u.map((e) => e.name)]), ee = s.map((e) => e.name), C = (e, t, n = "") => R(r, ee, e, t, n), w = (e) => e && n && !e.startsWith("btn-") ? `btn-${e}` : e, T = async () => {
		let t = w(await (n ? C(l("New Button"), l("Create Button")) : C(l("New Style"), l("Create Style"))));
		t && (n && u[0] ? e.change((e) => e.duplicateUtility(u[0].name, t)) : m(t), o(t));
	}, te = async (t) => {
		let r = w(await C(l("Rename"), l("Rename"), n ? t.replace(/^btn-/, "") : t));
		r && r !== t && (e.change((e) => Ue(e, t, r)), a === t && o(r));
	}, ne = async (t) => {
		let r = w(await C(l("Duplicate"), l("Duplicate"), `${n ? t.replace(/^btn-/, "") : t}-copy`));
		r && e.change((e) => e.duplicateUtility(t, r));
	}, E = async (t) => {
		await se({
			title: l("Delete “{name}”?", { name: n ? B(t) : t }),
			confirm: l("Delete"),
			danger: !0
		}) && (e.change((e) => e.removeUtility(t)), a === t && o(null));
	}, re = (t) => e.readOnly ? [] : [
		{
			label: l("Rename…"),
			icon: "edit",
			onSelect: () => void te(t)
		},
		{
			label: l("Duplicate…"),
			icon: "copy",
			onSelect: () => void ne(t)
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: l("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => void E(t)
		}
	];
	if (a && (f || a === p)) return /* @__PURE__ */ N(Re, {
		edit: e,
		samples: t,
		label: n ? B(a) : a,
		node: y(a),
		classes: f?.classes ?? [],
		onBack: () => o(null),
		menu: re(a),
		write: (t) => e.change((e) => t.length > 0 || e.utilities().find((e) => e.name === a)?.custom ? e.setUtility(a, t) : e.removeUtility(a))
	}, a);
	let ie = l(n ? "New Button" : "New Style");
	return u.length === 0 ? /* @__PURE__ */ N(_, {
		compact: !0,
		icon: n ? "button" : "symbol",
		title: l(n ? "No buttons" : "No styles"),
		action: e.readOnly ? void 0 : /* @__PURE__ */ N(g, {
			icon: "plus",
			onClick: () => void T(),
			children: ie
		})
	}) : /* @__PURE__ */ N(q, {
		onAdd: e.readOnly ? void 0 : () => void T(),
		addLabel: ie,
		children: u.map((t) => /* @__PURE__ */ N(Ce, {
			onOpen: () => o(t.name),
			sample: /* @__PURE__ */ N(I, {
				sheet: S,
				node: y(t.name),
				page: v,
				mode: e.mode,
				className: "h-14 min-w-0 flex-1 rounded-sm"
			}),
			label: /* @__PURE__ */ N("span", {
				className: "sr-only",
				children: n ? B(t.name) : t.name
			}),
			menu: e.readOnly ? void 0 : /* @__PURE__ */ N(x, {
				trigger: /* @__PURE__ */ N(b, {
					icon: "more",
					label: l("Style Actions"),
					size: "xs",
					className: G
				}),
				items: re(t.name)
			})
		}, t.name))
	});
}
function Ge(e) {
	return /* @__PURE__ */ N(We, {
		...e,
		buttons: !0
	});
}
function Ke(e) {
	return /* @__PURE__ */ N(We, {
		...e,
		buttons: !1
	});
}
// admin/src/theme.tsx
function qe(e, t, n = () => !1) {
	let r = (e) => {
		if (!e.startsWith(t)) return null;
		let r = e.slice(t.length);
		return r === "" || r.includes("--") || r.includes("*") || n(r) ? null : r;
	}, i = new Map(e.sheet.variables().filter((e) => r(e.name) !== null).map((e) => [e.name, e.value])), a = e.sheet.variable(`${t}*`) === "initial" || e.sheet.variable("--*") === "initial", o = [];
	for (let [t, n] of a ? [] : e.defaults) {
		let e = r(t);
		e !== null && o.push({
			name: t,
			key: e,
			value: i.get(t) ?? n,
			builtIn: !0,
			written: i.has(t)
		});
	}
	for (let [t, n] of i) (a || !e.defaults.has(t)) && o.push({
		name: t,
		key: r(t),
		value: n,
		builtIn: !1,
		written: !0
	});
	return o;
}
var Je = (e) => String(e ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
async function Ye(e, t, n, r, i = "", a = "md") {
	let o = Je((await A({
		title: n,
		fields: [{
			handle: "name",
			type: "text",
			label: l("Name"),
			mono: !0,
			autofocus: !0,
			required: !0,
			placeholder: a
		}],
		values: { name: i },
		confirm: r
	}))?.name);
	return !o || o === i ? null : e.sheet.variable(`${t}${o}`) !== void 0 || e.defaults.has(`${t}${o}`) ? (j.error(l("“{name}” already exists", { name: o })), null) : o;
}
function Xe(e, t, n, r) {
	let i = n.name.slice(0, n.name.length - n.key.length) + r, a = RegExp(`^(!?.*-)${n.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}((?:/[^!]+)?!?)$`), o = (e) => {
		let { variants: i, utility: o } = ve(e), s = a.exec(o);
		return !s || !t?.declarations(o.replace(/^!|!$/g, ""))?.some((e) => e.value.includes(`var(${n.name})`)) ? e : W(i, `${s[1]}${r}${s[2]}`);
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
var Ze = (e, t) => e.variables().filter((e) => e.name === t || e.name.startsWith(`${t}--`)).reduce((e, t) => e.setVariable(t.name, null), e);
function Qe(e, t) {
	let { engine: n } = U();
	return (r, i = []) => e.readOnly ? [] : r.builtIn ? [...i, ...r.written ? [...i.length ? [{
		separator: !0,
		label: ""
	}] : [], {
		label: l("Reset"),
		icon: "undo",
		onSelect: () => e.change((e) => Ze(e, r.name))
	}] : []] : [
		{
			label: l("Rename…"),
			icon: "edit",
			onSelect: async () => {
				let i = await Ye(e, t.prefix, l("Rename"), l("Rename"), r.key, t.placeholder);
				i && e.change((e) => Xe(e, n, r, i));
			}
		},
		...i,
		{
			separator: !0,
			label: ""
		},
		{
			label: l("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: () => e.change((e) => Ze(e, r.name))
		}
	];
}
function Q({ edit: e, kind: t, row: n }) {
	let r = Qe(e, t), i = async () => {
		let n = await Ye(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	};
	return /* @__PURE__ */ N(q, {
		title: t.title,
		onAdd: e.readOnly ? void 0 : () => void i(),
		addLabel: t.add,
		children: qe(e, t.prefix, t.skip).map((t) => n(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => r(t, e)))
	});
}
var $ = (e, t = {}) => ({
	component: "blocks-value",
	unit: e,
	...t
}), $e = { component: "site-size" }, et = $("rem", {
	units: [
		"rem",
		"px",
		"em"
	],
	step: .125,
	min: 0
}), tt = "w-[108px] shrink-0 max-sm:order-3 max-sm:w-auto max-sm:min-w-0 max-sm:flex-1 max-sm:basis-[40%]", nt = /^(.+)-(\d{2,3})$/;
function rt({ edit: e, row: t }) {
	let [n, r] = h(!1), i = /* @__PURE__ */ N(w, {
		compact: !0,
		"aria-label": t.key,
		disabled: e.readOnly,
		className: O("relative h-6 min-w-0 flex-1 outline-offset-1 transition-transform duration-fast first:rounded-l-xs last:rounded-r-xs hover:z-raised hover:scale-y-125 hover:shadow-pop hover:ring-2 hover:ring-float", n && "z-raised ring-2 ring-focus"),
		style: { background: V(t.value).light },
		children: t.written && /* @__PURE__ */ N("span", {
			className: "absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-edge",
			"aria-hidden": !0
		})
	});
	return /* @__PURE__ */ N(C, {
		open: n,
		onOpenChange: r,
		align: "start",
		className: "w-64 !p-0",
		trigger: /* @__PURE__ */ N("span", {
			className: "flex min-w-0 flex-1",
			children: /* @__PURE__ */ N(D, {
				content: t.key,
				children: i
			})
		}),
		children: /* @__PURE__ */ N(de, {
			label: t.key,
			value: t.value,
			onChange: (n) => e.change((e) => n === null ? Ze(e, t.name) : e.setVariable(t.name, n))
		})
	});
}
function it({ edit: e }) {
	let t = {
		prefix: "--color-",
		title: l("Colors"),
		add: l("Add Color"),
		fresh: l("New Color"),
		start: S,
		placeholder: "brand"
	}, n = Qe(e, t), r = qe(e, t.prefix), i = (t) => t.builtIn && e.palette.has(t.name), a = r.filter((e) => !i(e)), o = /* @__PURE__ */ new Map();
	for (let e of r.filter(i)) {
		let t = nt.exec(e.key)?.[1] ?? "";
		o.set(t, [...o.get(t) ?? [], e]);
	}
	let s = async () => {
		let n = await Ye(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, c = (t, n, r) => e.change((e) => e.setVariable(t.name, r && r !== n ? `light-dark(${n}, ${r})` : n));
	return /* @__PURE__ */ P(M, { children: [/* @__PURE__ */ P(q, { children: [/* @__PURE__ */ P("div", {
		className: "flex min-h-9 items-center gap-2 border-b border-border text-2xs text-faint max-sm:flex-wrap max-sm:py-1",
		children: [
			/* @__PURE__ */ N("span", {
				className: "min-w-0 flex-1 max-sm:order-1 max-sm:basis-[calc(100%-2.5rem)]",
				children: l("Name")
			}),
			/* @__PURE__ */ P("span", {
				className: O(tt, "flex items-center gap-1"),
				children: [/* @__PURE__ */ N(y, {
					name: "sun",
					size: 11
				}), l("Light")]
			}),
			/* @__PURE__ */ P("span", {
				className: O(tt, "flex items-center gap-1"),
				children: [/* @__PURE__ */ N(y, {
					name: "moon",
					size: 11
				}), l("Dark")]
			}),
			e.readOnly ? /* @__PURE__ */ N("span", { className: "size-6 shrink-0 max-sm:order-2" }) : /* @__PURE__ */ N(D, {
				content: t.add,
				children: /* @__PURE__ */ N(b, {
					icon: "plus",
					label: t.add,
					title: void 0,
					size: "xs",
					className: "shrink-0 max-sm:order-2",
					onClick: () => void s()
				})
			})
		]
	}), a.map((t) => {
		let { light: r, dark: i } = V(t.value);
		return /* @__PURE__ */ P(Y, {
			name: t.key,
			wide: !0,
			menu: n(t),
			children: [/* @__PURE__ */ N("div", {
				className: tt,
				children: /* @__PURE__ */ N(J, {
					handle: `${t.name}:light`,
					label: l("{name} in Light Mode", { name: t.key }),
					value: r,
					disabled: e.readOnly,
					field: {
						type: "color",
						component: "blocks-color"
					},
					onChange: (e) => e && c(t, e, i)
				})
			}), /* @__PURE__ */ N("div", {
				className: tt,
				children: /* @__PURE__ */ N(J, {
					handle: `${t.name}:dark`,
					label: l("{name} in Dark Mode", { name: t.key }),
					value: i ?? null,
					disabled: e.readOnly,
					field: {
						type: "color",
						component: "blocks-color",
						placeholder: l("Same"),
						swatch: r
					},
					onChange: (e) => c(t, r, e ?? void 0)
				})
			})]
		}, t.name);
	})] }), o.size > 0 && /* @__PURE__ */ N(q, {
		title: l("Palette"),
		children: /* @__PURE__ */ P("div", {
			className: "space-y-1.5 py-2",
			children: [[...o].filter(([e]) => e).map(([t, n]) => /* @__PURE__ */ P("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ N("span", {
					className: "w-16 shrink-0 truncate font-mono text-xs text-text",
					children: t
				}), /* @__PURE__ */ N("div", {
					className: "flex min-w-0 flex-1 gap-px",
					children: n.map((t) => /* @__PURE__ */ N(rt, {
						edit: e,
						row: t
					}, t.name))
				})]
			}, t)), (o.get("") ?? []).length > 0 && /* @__PURE__ */ N("div", {
				className: "flex items-center gap-4 pt-1",
				children: (o.get("") ?? []).map((t) => /* @__PURE__ */ P("div", {
					className: "flex w-24 items-center gap-2",
					children: [/* @__PURE__ */ N("span", {
						className: "flex size-6 shrink-0 overflow-hidden rounded-xs shadow-edge",
						children: /* @__PURE__ */ N(rt, {
							edit: e,
							row: t
						})
					}), /* @__PURE__ */ N("span", {
						className: "truncate font-mono text-xs text-text",
						children: t.key
					})]
				}, t.name))
			})]
		})
	})] });
}
function at(e) {
	let t = e.flatMap((e) => String(e.weight ?? "400").split(/\s+/).map(Number)).filter((e) => e > 0), n = Math.min(...t), r = Math.max(...t), i = t.length === 0 ? "400" : n === r ? String(n) : `${n}–${r}`;
	return e.some((e) => e.style === "italic") ? `${i} · ${l("Italic")}` : i;
}
var ot = (e, t) => /* @__PURE__ */ N("p", {
	className: "m-0 truncate pb-2.5 text-ink",
	style: {
		fontSize: `min(${e}, 2.75rem)`,
		lineHeight: 1.1,
		fontFamily: t
	},
	children: l("Ship It")
});
function st({ edit: i, fonts: a }) {
	let o = [...new Set(a.faces.map((e) => e.family))], s = new Set(qe(i, "--font-", (e) => e.startsWith("weight-")).map((t) => e(n(t.value)))), c = o.map((e) => {
		let t = a.faces.filter((t) => t.family === e);
		return {
			family: e,
			styles: at(t),
			fallback: t.some((e) => Array.isArray(e.fallback) ? e.fallback.length > 0 : !!e.fallback),
			used: s.has(e)
		};
	}), u = r("", "sans", !1), d = i.sheet.variable("--font-sans") ?? i.defaults.get("--font-sans"), f = () => [
		["sans", l("Sans")],
		["serif", l("Serif")],
		["mono", l("Mono")]
	];
	return /* @__PURE__ */ P(M, { children: [
		/* @__PURE__ */ N(Q, {
			edit: i,
			kind: {
				prefix: "--font-",
				title: l("Fonts"),
				add: l("Add Font Family"),
				fresh: l("New Font Family"),
				start: u,
				placeholder: "display",
				skip: (e) => e.startsWith("weight-")
			},
			row: (o, s, u) => {
				let d = n(o.value), p = e(d), m = a.faces.filter((e) => e.family === p), h = m.some((e) => e.preload);
				return /* @__PURE__ */ N(Y, {
					name: o.key,
					sample: /* @__PURE__ */ N("span", {
						className: "block max-w-7 overflow-hidden whitespace-nowrap text-center text-lg leading-none text-ink",
						style: { fontFamily: o.value },
						children: "Aa"
					}),
					menu: u([
						{
							heading: !0,
							label: l("Fallback")
						},
						...f().map(([e, n]) => ({
							label: n,
							checked: t(d) === e,
							onSelect: () => s(r(p, e, d.includes(`${p} Fallback`)))
						})),
						...m.length ? [{
							separator: !0,
							label: ""
						}, {
							label: l("Preload"),
							checked: h,
							onSelect: () => a.preload(p, !h)
						}] : []
					]),
					children: /* @__PURE__ */ N(J, {
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
		/* @__PURE__ */ N(Q, {
			edit: i,
			kind: {
				prefix: "--text-",
				title: l("Text Sizes"),
				add: l("Add Text Size"),
				fresh: l("New Text Size"),
				start: "1.25rem",
				placeholder: "lead",
				skip: (e) => e.startsWith("shadow-")
			},
			row: (e, t, n) => /* @__PURE__ */ N(Y, {
				name: e.key,
				menu: n(),
				below: ot(e.value, d),
				children: /* @__PURE__ */ N(J, {
					handle: e.name,
					label: e.key,
					value: e.value,
					disabled: i.readOnly,
					field: $e,
					onChange: t
				})
			}, e.name)
		}),
		/* @__PURE__ */ N(Q, {
			edit: i,
			kind: {
				prefix: "--font-weight-",
				title: l("Weights"),
				add: l("Add Weight"),
				fresh: l("New Weight"),
				start: "600",
				placeholder: "strong"
			},
			row: (e, t, n) => /* @__PURE__ */ N(Y, {
				name: e.key,
				menu: n(),
				sample: /* @__PURE__ */ N("span", {
					className: "text-base text-ink",
					style: {
						fontWeight: Number(e.value) || 400,
						fontFamily: d
					},
					children: "Ag"
				}),
				children: /* @__PURE__ */ N(J, {
					handle: e.name,
					label: e.key,
					value: e.value,
					disabled: i.readOnly,
					field: $("", {
						step: 50,
						min: 1,
						max: 1e3
					}),
					onChange: t
				})
			}, e.name)
		}),
		/* @__PURE__ */ N(Q, {
			edit: i,
			kind: {
				prefix: "--leading-",
				title: l("Line Heights"),
				add: l("Add Line Height"),
				fresh: l("New Line Height"),
				start: "1.5",
				placeholder: "airy"
			},
			row: (e, t, n) => /* @__PURE__ */ N(Y, {
				name: e.key,
				menu: n(),
				sample: /* @__PURE__ */ N("span", {
					className: "flex w-4 flex-col",
					style: { gap: `${Math.max(1, (Number(e.value) - .8) * 6)}px` },
					children: [
						0,
						1,
						2
					].map((e) => /* @__PURE__ */ N("span", { className: O("h-0.5 rounded-full bg-muted", e === 2 && "w-2/3") }, e))
				}),
				children: /* @__PURE__ */ N(J, {
					handle: e.name,
					label: e.key,
					value: e.value,
					disabled: i.readOnly,
					field: $("", {
						step: .05,
						min: 0
					}),
					onChange: t
				})
			}, e.name)
		}),
		/* @__PURE__ */ N(Q, {
			edit: i,
			kind: {
				prefix: "--tracking-",
				title: l("Letter Spacing"),
				add: l("Add Letter Spacing"),
				fresh: l("New Letter Spacing"),
				start: "0em",
				placeholder: "loose"
			},
			row: (e, t, n) => /* @__PURE__ */ N(Y, {
				name: e.key,
				menu: n(),
				sample: /* @__PURE__ */ N("span", {
					className: "text-xs font-medium text-ink",
					style: { letterSpacing: e.value },
					children: "Aa"
				}),
				children: /* @__PURE__ */ N(J, {
					handle: e.name,
					label: e.key,
					value: e.value,
					disabled: i.readOnly,
					field: $("em", {
						units: ["em", "px"],
						step: .005
					}),
					onChange: t
				})
			}, e.name)
		})
	] });
}
var ct = (e, t = $e) => (n, r, i) => /* @__PURE__ */ N(Y, {
	name: n.key,
	menu: i(),
	children: /* @__PURE__ */ N(J, {
		handle: n.name,
		label: n.key,
		value: n.value,
		disabled: e.readOnly,
		field: t,
		onChange: r
	})
}, n.name);
function lt({ edit: e }) {
	let t = {
		prefix: "--spacing-",
		title: l("Spacing"),
		add: l("Add Spacing"),
		fresh: l("New Spacing"),
		start: "2rem",
		placeholder: "gutter"
	}, n = Qe(e, t), r = e.sheet.variable("--spacing"), i = async () => {
		let n = await Ye(e, t.prefix, t.fresh, t.add, "", t.placeholder);
		n && e.change((e) => e.setVariable(`${t.prefix}${n}`, t.start));
	}, a = {
		name: "--spacing",
		key: "1",
		value: r ?? e.defaults.get("--spacing") ?? "0.25rem",
		builtIn: !0,
		written: r !== void 0
	};
	return /* @__PURE__ */ P(M, { children: [
		/* @__PURE__ */ P(q, {
			title: t.title,
			onAdd: e.readOnly ? void 0 : () => void i(),
			addLabel: t.add,
			children: [/* @__PURE__ */ N(Y, {
				name: a.key,
				copy: a.name,
				menu: n(a),
				children: /* @__PURE__ */ N(J, {
					handle: "--spacing",
					label: a.key,
					value: a.value,
					disabled: e.readOnly,
					field: $e,
					onChange: (t) => t !== null && e.change((e) => e.setVariable("--spacing", t))
				})
			}), qe(e, t.prefix).map((t) => ct(e)(t, (n) => n !== null && e.change((e) => e.setVariable(t.name, n)), (e) => n(t, e)))]
		}),
		/* @__PURE__ */ N(Q, {
			edit: e,
			kind: {
				prefix: "--container-",
				title: l("Containers"),
				add: l("Add Container"),
				fresh: l("New Container"),
				start: "72rem",
				placeholder: "content"
			},
			row: ct(e)
		}),
		/* @__PURE__ */ N(Q, {
			edit: e,
			kind: {
				prefix: "--breakpoint-",
				title: l("Breakpoints"),
				add: l("Add Breakpoint"),
				fresh: l("New Breakpoint"),
				start: "120rem",
				placeholder: "3xl"
			},
			row: ct(e, et)
		}),
		/* @__PURE__ */ N(Q, {
			edit: e,
			kind: {
				prefix: "--aspect-",
				title: l("Aspect Ratios"),
				add: l("Add Aspect Ratio"),
				fresh: l("New Aspect Ratio"),
				start: "4 / 3",
				placeholder: "photo"
			},
			row: (t, n, r) => /* @__PURE__ */ N(Y, {
				name: t.key,
				menu: r(),
				sample: /* @__PURE__ */ N("span", {
					className: "block max-h-5 w-5 rounded-xs border border-border-strong",
					style: { aspectRatio: t.value }
				}),
				children: /* @__PURE__ */ N(J, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					onChange: n
				})
			}, t.name)
		})
	] });
}
function ut({ edit: e }) {
	return /* @__PURE__ */ N(Q, {
		edit: e,
		kind: {
			prefix: "--radius-",
			title: l("Radius"),
			add: l("Add Radius"),
			fresh: l("New Radius"),
			start: "0.5rem",
			placeholder: "card"
		},
		row: (t, n, r) => /* @__PURE__ */ N(Y, {
			name: t.key,
			menu: r(),
			sample: /* @__PURE__ */ N("span", {
				className: "size-5 translate-x-0.5 translate-y-0.5 border-l-[1.5px] border-t-[1.5px] border-muted",
				style: { borderTopLeftRadius: `min(${t.value}, 20px)` }
			}),
			children: /* @__PURE__ */ N(J, {
				handle: t.name,
				label: t.key,
				value: t.value,
				disabled: e.readOnly,
				field: $("rem", {
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
	});
}
function dt({ edit: e }) {
	let t = (t, n) => (r, i, a) => /* @__PURE__ */ N(Y, {
		name: r.key,
		menu: a(),
		sample: n(r.value),
		children: /* @__PURE__ */ N(J, {
			handle: r.name,
			label: r.key,
			value: r.value,
			disabled: e.readOnly,
			field: {
				component: "site-shadow",
				kind: t
			},
			onChange: i
		})
	}, r.name), n = (e) => (t) => /* @__PURE__ */ N("span", {
		className: "size-5 shrink-0 rounded-xs border border-border bg-bg",
		style: e(t)
	});
	return /* @__PURE__ */ P(M, { children: [
		/* @__PURE__ */ N(Q, {
			edit: e,
			kind: {
				prefix: "--shadow-",
				title: l("Shadows"),
				add: l("Add Shadow"),
				fresh: l("New Shadow"),
				start: "0 4px 16px -4px rgb(0 0 0 / 0.12)",
				placeholder: "card"
			},
			row: t("box", n((e) => ({ boxShadow: e })))
		}),
		/* @__PURE__ */ N(Q, {
			edit: e,
			kind: {
				prefix: "--inset-shadow-",
				title: l("Inset Shadows"),
				add: l("Add Inset Shadow"),
				fresh: l("New Inset Shadow"),
				start: "inset 0 2px 4px rgb(0 0 0 / 0.08)",
				placeholder: "well"
			},
			row: t("box", n((e) => ({ boxShadow: e })))
		}),
		/* @__PURE__ */ N(Q, {
			edit: e,
			kind: {
				prefix: "--drop-shadow-",
				title: l("Drop Shadows"),
				add: l("Add Drop Shadow"),
				fresh: l("New Drop Shadow"),
				start: "0 4px 8px rgb(0 0 0 / 0.12)",
				placeholder: "lifted"
			},
			row: t("text", n((e) => ({ filter: e.split(/,(?![^(]*\))/).map((e) => `drop-shadow(${e.trim()})`).join(" ") })))
		}),
		/* @__PURE__ */ N(Q, {
			edit: e,
			kind: {
				prefix: "--text-shadow-",
				title: l("Text Shadows"),
				add: l("Add Text Shadow"),
				fresh: l("New Text Shadow"),
				start: "0 1px 2px rgb(0 0 0 / 0.2)",
				placeholder: "glow"
			},
			row: t("text", (e) => /* @__PURE__ */ N("span", {
				className: "text-base font-semibold text-ink",
				style: { textShadow: e },
				children: "A"
			}))
		}),
		/* @__PURE__ */ N(Q, {
			edit: e,
			kind: {
				prefix: "--blur-",
				title: l("Blur"),
				add: l("Add Blur"),
				fresh: l("New Blur"),
				start: "6px",
				placeholder: "soft"
			},
			row: (t, n, r) => /* @__PURE__ */ N(Y, {
				name: t.key,
				menu: r(),
				sample: /* @__PURE__ */ N("span", {
					className: "size-3 rounded-full bg-muted",
					style: { filter: `blur(min(${t.value}, 6px))` }
				}),
				children: /* @__PURE__ */ N(J, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: $("px", {
						units: ["px", "rem"],
						step: 1,
						min: 0
					}),
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ N(Q, {
			edit: e,
			kind: {
				prefix: "--perspective-",
				title: l("Perspective"),
				add: l("Add Perspective"),
				fresh: l("New Perspective"),
				start: "800px",
				placeholder: "deep"
			},
			row: ct(e, $("px", {
				units: ["px", "rem"],
				step: 10,
				min: 0
			}))
		})
	] });
}
function ft(e, t) {
	let n = String(e ?? "").trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/);
	if (!n) return t;
	let r = n[2] === "s" ? Number(n[1]) : Number(n[1]) / 1e3;
	return Math.min(2, Math.max(.05, Math.round(r * 1e3) / 1e3));
}
function pt({ edit: e, transition: t, onTransition: n }) {
	let r = (t, n) => e.change((e) => e.setVariable(t, n)), i = (t) => e.sheet.variable(t) ?? e.defaults.get(t) ?? null, a = (t) => e.sheet.variable(t) !== void 0 && !e.readOnly ? /* @__PURE__ */ N(D, {
		content: l("Reset"),
		children: /* @__PURE__ */ N(b, {
			icon: "undo",
			size: "xs",
			label: l("Reset"),
			title: void 0,
			onClick: () => r(t, null)
		})
	}) : void 0;
	return /* @__PURE__ */ P(M, { children: [
		/* @__PURE__ */ N(Q, {
			edit: e,
			kind: {
				prefix: "--ease-",
				title: l("Easings"),
				add: l("Add Easing"),
				fresh: l("New Easing"),
				start: "cubic-bezier(0.2, 0.8, 0.2, 1)",
				placeholder: "snap"
			},
			row: (t, n, r) => /* @__PURE__ */ N(Y, {
				name: t.key,
				menu: r(),
				children: /* @__PURE__ */ N(J, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					field: { component: "ease" },
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ N(Q, {
			edit: e,
			kind: {
				prefix: "--animate-",
				title: l("Animations"),
				add: l("Add Animation"),
				fresh: l("New Animation"),
				start: "spin 2s linear infinite",
				placeholder: "float"
			},
			row: (t, n, r) => /* @__PURE__ */ N(Y, {
				name: t.key,
				menu: r(),
				children: /* @__PURE__ */ N(J, {
					handle: t.name,
					label: t.key,
					value: t.value,
					disabled: e.readOnly,
					onChange: n
				})
			}, t.name)
		}),
		/* @__PURE__ */ P(q, {
			title: l("Transitions"),
			children: [/* @__PURE__ */ N(X, {
				label: l("Duration"),
				action: a("--default-transition-duration"),
				children: /* @__PURE__ */ N(J, {
					handle: "--default-transition-duration",
					label: l("Duration"),
					value: i("--default-transition-duration"),
					disabled: e.readOnly,
					field: $("ms", {
						units: ["ms", "s"],
						step: 10,
						min: 0
					}),
					onChange: (e) => e && r("--default-transition-duration", e)
				})
			}), /* @__PURE__ */ N(X, {
				label: l("Easing"),
				action: a("--default-transition-timing-function"),
				children: /* @__PURE__ */ N(J, {
					handle: "--default-transition-timing-function",
					label: l("Easing"),
					value: i("--default-transition-timing-function"),
					disabled: e.readOnly,
					field: { component: "ease" },
					onChange: (e) => e && r("--default-transition-timing-function", e)
				})
			})]
		}),
		/* @__PURE__ */ P(q, {
			title: l("Page Transition"),
			children: [
				/* @__PURE__ */ N(X, {
					label: l("Effect"),
					children: /* @__PURE__ */ N(J, {
						handle: "type",
						label: l("Effect"),
						value: t.type,
						disabled: e.readOnly,
						field: {
							type: "select",
							mono: !1,
							required: !0,
							options: {
								none: l("None"),
								fade: l("Fade"),
								slide: l("Slide"),
								scale: l("Scale")
							}
						},
						onChange: (e) => n({
							...t,
							type: e ?? "none"
						})
					})
				}),
				t.type !== "none" && /* @__PURE__ */ N(X, {
					label: l("Duration"),
					children: /* @__PURE__ */ N(J, {
						handle: "duration",
						label: l("Duration"),
						value: `${Math.round(t.duration * 1e3)}ms`,
						disabled: e.readOnly,
						field: $("ms", {
							units: ["ms"],
							step: 10,
							min: 50,
							max: 2e3
						}),
						onChange: (e) => n({
							...t,
							duration: ft(e, t.duration)
						})
					})
				}),
				/* @__PURE__ */ N(X, {
					label: l("Page Loads"),
					children: /* @__PURE__ */ N(J, {
						handle: "navigation",
						label: l("Page Loads"),
						value: t.navigation,
						disabled: e.readOnly,
						field: {
							type: "select",
							mono: !1,
							required: !0,
							options: {
								document: l("Full Page"),
								client: l("Instant")
							}
						},
						onChange: (e) => n({
							...t,
							navigation: e === "client" ? "client" : "document"
						})
					})
				})
			]
		})
	] });
}
// admin/src/Styling.tsx
var mt = { files: {} }, ht = [
	"colors",
	"typography",
	"layout",
	"shape",
	"effects",
	"motion",
	"text",
	"buttons",
	"styles",
	"code"
];
function gt() {
	return [{
		group: l("Theme"),
		items: [
			{
				value: "colors",
				label: l("Colors"),
				icon: "palette"
			},
			{
				value: "typography",
				label: l("Typography"),
				icon: "typography"
			},
			{
				value: "layout",
				label: l("Layout"),
				icon: "ruler"
			},
			{
				value: "shape",
				label: l("Shape"),
				icon: "radius"
			},
			{
				value: "effects",
				label: l("Effects"),
				icon: "shadow"
			},
			{
				value: "motion",
				label: l("Motion"),
				icon: "speed"
			}
		]
	}, {
		group: l("Styles"),
		items: [
			{
				value: "text",
				label: l("Text"),
				icon: "paragraph"
			},
			{
				value: "buttons",
				label: l("Buttons"),
				icon: "button"
			},
			{
				value: "styles",
				label: l("Saved Styles"),
				icon: "symbol"
			},
			{
				value: "code",
				label: l("Custom Code"),
				icon: "code"
			}
		]
	}];
}
var _t = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
function vt() {
	let e = u("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), t = u("styling/source", {}, {
		refetchOnWindowFocus: !1,
		retry: !1,
		staleTime: 6e4
	}), [n, r] = h(mt), { query: _ } = d(), v = _.style ? _.style.startsWith("btn-") ? "buttons" : "styles" : ht.includes(_.tab) ? _.tab : ht[0], y = (e) => c({
		tab: e === ht[0] ? null : e,
		style: null,
		element: null
	}), [x, S] = h(ue() === "dark" ? "dark" : "light"), [C, w] = h(!1), [ie, ce] = h(() => window.matchMedia("(max-width: 767px)").matches);
	f(() => {
		let e = window.matchMedia("(max-width: 767px)"), t = () => ce(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let k = C && ie, [F, de] = h("desktop"), [I, fe] = h(!1), [L, R] = h(null), z = le(), B = m(null), V = e.data, he = n.css ?? V?.css, ge = n.transition ?? V?.transition, ve = n.js ?? V?.js ?? "", ye = !!V && (n.css !== void 0 && n.css !== V.css || n.transition !== void 0 && !_t(n.transition, V.transition) || n.js !== void 0 && n.js !== V.js || Object.keys(n.files).length > 0), be = !a("settings.manage"), xe = p(() => new pe(he ?? ""), [he]), H = je(t.data, he), U = p(() => xe.variables().some((e) => e.value.startsWith("light-dark(")) || /color-scheme\s*:\s*light\s+dark\b/.test(xe.css), [xe]), [W, G] = h(null);
	f(() => {
		_e().then(G);
	}, []);
	let K = t.data?.files.cms, q = p(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of [...Se(W ?? ""), ...Se(K ?? "")]) e.set(t.name, t.value);
		return e;
	}, [W, K]), J = p(() => new Set(Se(W ?? "").filter((e) => e.name.startsWith("--color-")).map((e) => e.name)), [W]);
	if (f(() => {
		let e = document.createElement("style");
		return e.textContent = (V?.fonts ?? []).map((e) => `@font-face{font-family:"${e.family}";src:url("${/^(https:\/\/|\/)/.test(e.src) ? e.src : `/_cms/fonts/${e.src.split("/").pop()}`}") format("woff2");font-weight:${e.weight ?? "400"};font-style:${e.style ?? "normal"};font-display:swap}`).join("\n"), document.head.appendChild(e), () => e.remove();
	}, [V?.fonts]), e.isLoading || t.isLoading || W === null) return /* @__PURE__ */ N("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ N(ae, {})
	});
	if (!V || !t.data || he === void 0 || !ge) return /* @__PURE__ */ P("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ N(oe, { crumbs: [{
			label: l("Styling"),
			icon: "palette"
		}] }), /* @__PURE__ */ N(T, {
			title: l("Couldn’t load the styling"),
			onRetry: () => {
				e.refetch(), t.refetch();
			},
			retrying: e.isRefetching || t.isRefetching
		})]
	});
	let Y = {
		sheet: xe,
		change: (e) => !be && r((t) => ({
			...t,
			css: e(new pe(t.css ?? V.css)).css
		})),
		readOnly: be,
		defaults: q,
		palette: J,
		mode: U ? x : "light"
	}, X = {
		compiler: H.compiler,
		device: k ? "phone" : F
	}, Z = () => {
		o("styling/"), B.current?.contentWindow?.location.reload();
	}, Ce = async () => {
		if (ye && !I) {
			fe(!0), R(null);
			try {
				let i = {};
				n.css !== void 0 && n.css !== V.css && (i.css = n.css), n.transition !== void 0 && !_t(n.transition, V.transition) && (i.transition = n.transition), Object.keys(i).length > 0 && await s("styling/update", i), n.js !== void 0 && n.js !== V.js && await s("styling-code/set-custom", { js: n.js });
				for (let [e, t] of Object.entries(n.files)) await s("styling-code/save", {
					path: e,
					contents: t
				});
				await Promise.all([e.refetch(), t.refetch()]), o("styling-code/"), r(mt), B.current?.contentWindow?.location.reload();
			} catch (e) {
				R({
					message: e instanceof Error ? e.message : String(e),
					refused: e instanceof i && e.type === "invalid_input"
				});
			} finally {
				fe(!1);
			}
		}
	}, we = {
		faces: V.fonts,
		add: async (e) => {
			try {
				if (e === "google") {
					let e = await A({
						title: l("Add a Google Font"),
						fields: [{
							handle: "family",
							type: "text",
							label: l("Name"),
							placeholder: "Inter Tight",
							autofocus: !0,
							required: !0
						}],
						confirm: l("Add Font")
					}), t = String(e?.family ?? "").trim();
					if (!t) return null;
					let n = await s("styling/fonts-import", { family: t });
					return j.success(l("{family} added", { family: t })), Z(), {
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
				}), r = t.name.replace(/\.woff2$/i, ""), i = await A({
					title: l("Upload Font"),
					fields: [{
						handle: "family",
						type: "text",
						label: l("Family Name"),
						autofocus: !0,
						required: !0
					}],
					values: { family: r.replace(/[-_](regular|bold|variable|italic|\d+).*$/i, "").replace(/[-_]/g, " ") },
					confirm: l("Upload Font")
				}), a = String(i?.family ?? "").trim();
				return a ? (await s("styling/fonts-upload", {
					family: a,
					name: r,
					data: n,
					weight: /variable/i.test(r) ? "100 900" : "400",
					style: /italic/i.test(r) ? "italic" : "normal"
				}), j.success(l("{family} uploaded", { family: a })), Z(), {
					family: a,
					fallback: !1
				}) : null;
			} catch (e) {
				return j.error(e), null;
			}
		},
		remove: async (e) => {
			if (await se({
				title: l("Remove {family}?", { family: e }),
				confirm: l("Remove Font"),
				danger: !0
			})) try {
				await s("styling/update", { fonts: V.fonts.filter((t) => t.family !== e) }), Z();
			} catch (e) {
				j.error(e);
			}
		},
		preload: async (e, t) => {
			let n = V.fonts.some((t) => t.family === e && t.style !== "italic");
			try {
				await s("styling/update", { fonts: V.fonts.map((r) => r.family === e ? {
					...r,
					preload: t && (!n || r.style !== "italic")
				} : r) }), Z();
			} catch (e) {
				j.error(e);
			}
		}
	}, Te = /* @__PURE__ */ P(M, { children: [
		v === "colors" && /* @__PURE__ */ N(it, { edit: Y }),
		v === "typography" && /* @__PURE__ */ N(st, {
			edit: Y,
			fonts: we
		}),
		v === "layout" && /* @__PURE__ */ N(lt, { edit: Y }),
		v === "shape" && /* @__PURE__ */ N(ut, { edit: Y }),
		v === "effects" && /* @__PURE__ */ N(dt, { edit: Y }),
		v === "motion" && /* @__PURE__ */ N(pt, {
			edit: Y,
			transition: ge,
			onTransition: (e) => !be && r((t) => ({
				...t,
				transition: e
			}))
		}),
		v === "text" && /* @__PURE__ */ N(He, {
			edit: Y,
			samples: X
		}),
		v === "buttons" && /* @__PURE__ */ N(Ge, {
			edit: Y,
			samples: X
		}),
		v === "styles" && /* @__PURE__ */ N(Ke, {
			edit: Y,
			samples: X
		}),
		v === "code" && /* @__PURE__ */ P(M, { children: [/* @__PURE__ */ N(yt, { edit: Y }), /* @__PURE__ */ N(ke, {
			js: ve,
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
	return /* @__PURE__ */ P("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ N(oe, {
				crumbs: [{
					label: l("Styling"),
					icon: "palette"
				}, { label: gt().flatMap((e) => e.items).find((e) => e.value === v)?.label ?? "" }],
				actions: /* @__PURE__ */ P(M, { children: [/* @__PURE__ */ N(g, {
					variant: "ghost",
					icon: "eye",
					"aria-pressed": k,
					onClick: () => w(!k),
					className: "md:hidden",
					children: l("Preview")
				}), /* @__PURE__ */ N(D, {
					content: l("Open Site"),
					children: /* @__PURE__ */ N(b, {
						icon: "external",
						label: l("Open Site"),
						title: void 0,
						onClick: () => window.open("/", "_blank", "noopener"),
						className: "max-md:hidden"
					})
				})] })
			}),
			/* @__PURE__ */ N(ne, {
				title: l("Styling"),
				backTo: "/",
				backLabel: l("Dashboard"),
				nested: !0,
				children: /* @__PURE__ */ N("nav", {
					"aria-label": l("Styling"),
					className: z.nested ? "space-y-px" : "px-2 pb-4",
					children: gt().map((e, t) => /* @__PURE__ */ P("div", {
						className: O("space-y-px", t > 0 && (z.nested ? "mt-1" : "mt-4")),
						children: [!z.nested && /* @__PURE__ */ N("div", {
							className: "cms-label flex h-7 items-center px-2",
							children: e.group
						}), e.items.map((e) => /* @__PURE__ */ N(re, {
							label: e.label,
							icon: z.nested ? void 0 : e.icon,
							active: v === e.value,
							onClick: () => y(e.value)
						}, e.value))]
					}, e.group))
				})
			}),
			/* @__PURE__ */ N(te, {
				dirty: ye,
				saving: I,
				error: L ? L.refused ? l("The stylesheet was not saved") : L.message : null,
				onSave: () => void Ce(),
				onDiscard: () => {
					r(mt), R(null);
				}
			}),
			/* @__PURE__ */ N(me, {
				source: H.source ?? t.data,
				children: /* @__PURE__ */ P("div", {
					className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(380px,460px)_minmax(0,1fr)]",
					children: [/* @__PURE__ */ P("div", {
						className: O("overflow-y-auto border-border px-4 pb-16 pt-2 md:border-r", k && "max-md:hidden"),
						children: [L?.refused && /* @__PURE__ */ N(ee, {
							tone: "danger",
							className: "mb-3 mt-1",
							title: l("Tailwind refused the stylesheet"),
							onDismiss: () => R(null),
							children: L.message
						}), Te]
					}, v), /* @__PURE__ */ P("div", {
						className: O("flex min-w-0 flex-col bg-sunken", !k && "max-md:hidden"),
						children: [/* @__PURE__ */ P("div", {
							className: "flex h-10 shrink-0 items-center gap-2 border-b border-border bg-bg px-3",
							children: [
								/* @__PURE__ */ N("span", {
									className: "max-md:hidden",
									children: /* @__PURE__ */ N(E, {
										size: "xs",
										"aria-label": l("Screen"),
										value: F,
										onChange: de,
										options: [
											{
												value: "desktop",
												icon: "desktop",
												title: l("Desktop")
											},
											{
												value: "tablet",
												icon: "tablet",
												title: l("Tablet")
											},
											{
												value: "phone",
												icon: "phone",
												title: l("Phone")
											}
										]
									})
								}),
								F !== "desktop" && /* @__PURE__ */ N("span", {
									className: "font-mono text-2xs text-faint max-md:hidden",
									children: Ae[F]
								}),
								/* @__PURE__ */ N("span", { className: "flex-1" }),
								U && /* @__PURE__ */ N(E, {
									size: "xs",
									"aria-label": l("Color Mode"),
									value: x,
									onChange: S,
									options: [{
										value: "light",
										icon: "sun",
										title: l("Light")
									}, {
										value: "dark",
										icon: "moon",
										title: l("Dark")
									}]
								})
							]
						}), /* @__PURE__ */ N(bt, {
							frame: B,
							compile: H,
							published: V.stylesheet,
							viewport: k ? "phone" : F,
							mode: U ? x : null,
							bordered: F !== "desktop" && !k
						})]
					})]
				})
			})
		]
	});
}
function yt({ edit: e }) {
	let t = p(() => e.sheet.extra(), [e.sheet]), [n, r] = h(t), i = m(t);
	return f(() => {
		t !== i.current && (i.current = t, r(t));
	}, [t]), /* @__PURE__ */ N(q, {
		title: l("CSS"),
		children: /* @__PURE__ */ N("div", {
			className: "pt-2",
			children: /* @__PURE__ */ N(v, {
				bare: !0,
				fields: [{
					handle: "css",
					type: "code",
					label: l("CSS"),
					rows: 14,
					language: "tailwind",
					placeholder: ".hero-title { text-wrap: balance; }"
				}],
				values: { css: n },
				disabled: e.readOnly,
				onChange: (t, n) => {
					let a = String(n ?? "");
					r(a), z(a) && (i.current = e.sheet.setExtra(a).extra(), e.change((e) => e.setExtra(a)));
				}
			})
		})
	});
}
function bt(e) {
	let { breakpoints: t } = U();
	return /* @__PURE__ */ N(Fe, {
		...e,
		desktop: t.find((e) => e.name === "lg")?.width ?? 1024
	});
}
export { vt as default };
