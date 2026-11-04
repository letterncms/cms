import { can as e, queryClient as t, run as n, t as r, useAbility as i, useTab as a } from "@letterncms/sdk";
import { useEffect as o, useMemo as s, useRef as c, useState as l } from "react";
import { Button as u, EmptyState as d, Fields as f, Icon as p, IconButton as m, Menu as h, SaveBar as ee, ScreenSidebar as g, Segmented as _, SidebarRow as te, Spinner as ne, Tooltip as re, Topbar as ie, cn as v, confirm as y, prompt as b, toast as x, useScreenSidebar as ae } from "@letterncms/ui";
import { Fragment as S, jsx as C, jsxs as w } from "react/jsx-runtime";
// admin/src/DesignTokens.tsx
var oe = [
	"color",
	"type",
	"space",
	"shape",
	"motion",
	"elements",
	"buttons",
	"code"
];
function se() {
	return [{
		group: r("Tokens"),
		items: [
			{
				value: "color",
				label: r("Colors"),
				icon: "palette"
			},
			{
				value: "type",
				label: r("Typography"),
				icon: "typography"
			},
			{
				value: "space",
				label: r("Spacing"),
				icon: "spacing"
			},
			{
				value: "shape",
				label: r("Shape"),
				icon: "radius"
			},
			{
				value: "motion",
				label: r("Motion"),
				icon: "speed"
			}
		]
	}, {
		group: r("Styles"),
		items: [
			{
				value: "elements",
				label: r("Elements"),
				icon: "paragraph"
			},
			{
				value: "buttons",
				label: r("Buttons"),
				icon: "button"
			},
			{
				value: "code",
				label: r("Custom Code"),
				icon: "code"
			}
		]
	}];
}
function ce(e) {
	return {
		color: r("New Color"),
		font: r("New Font Family"),
		text: r("New Text Size"),
		weight: r("New Weight"),
		leading: r("New Line Height"),
		tracking: r("New Letter Spacing"),
		space: r("New Spacing"),
		container: r("New Container"),
		breakpoint: r("New Breakpoint"),
		radius: r("New Radius"),
		shadow: r("New Shadow"),
		duration: r("New Duration"),
		ease: r("New Easing")
	}[e] ?? r("New Token");
}
var le = {
	desktop: "100%",
	tablet: "768px",
	phone: "390px"
};
function ue({ viewport: e, desktop: t, children: n }) {
	let r = c(null), [i, a] = l({
		width: 0,
		height: 0
	});
	o(() => {
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
	let s = e === "desktop" ? Math.max(i.width, t) : parseFloat(le[e]), u = i.width ? Math.min(1, i.width / s) : 1;
	return /* @__PURE__ */ C("div", {
		ref: r,
		className: "relative min-h-0 flex-1 overflow-hidden",
		children: i.width > 0 && n({
			position: "absolute",
			top: 0,
			left: Math.max(0, (i.width - s * u) / 2),
			width: s,
			height: i.height / u,
			transform: u < 1 ? `scale(${u})` : void 0,
			transformOrigin: "top left"
		})
	});
}
var T = { weight: "font-weight" }, E = (e, t) => `--${T[e] ?? e}-${t}`;
function D(e, t) {
	return t && typeof t == "object" && !Array.isArray(t) && "min" in t ? O(String(t.min), String(t.max)) : e === "font" && Array.isArray(t) ? t.map((e) => /\s/.test(e) && !e.includes("\"") ? `"${e}"` : e).join(", ") : String(t ?? "").replace(/token:([a-z]+)\.([a-z0-9-]+)(?:\/(\d{1,3}))?/g, (e, t, n, r) => r ? `color-mix(in srgb, var(${E(t, n)}) ${r}%, transparent)` : `var(${E(t, n)})`);
}
function O(e, t) {
	let n = (e) => e.endsWith("rem") ? parseFloat(e) : parseFloat(e) / 16, r = n(e), i = n(t), a = (i - r) / 57.5, o = (e) => String(Math.round(e * 1e4) / 1e4);
	return `clamp(${o(Math.min(r, i))}rem, ${o(r - a * 22.5)}rem + ${o(a * 100)}vw, ${o(Math.max(r, i))}rem)`;
}
function k(e) {
	let t = e && typeof e == "object" && "max" in e ? e.max : e, n = parseFloat(String(t ?? ""));
	return Number.isNaN(n) ? 0 : /r?em$/.test(String(t)) ? n * 16 : n;
}
var A = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
function de(e) {
	return {
		tokens: e.tokens.map((e) => ({
			...e,
			from: e.path
		})),
		styles: e.styles ?? {},
		prose: e.prose ?? {},
		buttons: e.buttons ?? {},
		transition: e.transition ?? {
			type: "none",
			duration: .3
		},
		css: e.css ?? "",
		js: e.js ?? ""
	};
}
function fe(e, t, n) {
	let r = RegExp(`token:${t.replace(/[.-]/g, "\\$&")}(?![a-z0-9-])`, "g"), i = (e) => JSON.parse(JSON.stringify(e ?? null).replace(r, `token:${n}`));
	return {
		...e,
		styles: i(e.styles),
		prose: i(e.prose),
		buttons: i(e.buttons),
		tokens: e.tokens.map((e) => e.path === t ? {
			...e,
			path: n,
			name: n.split(".")[1]
		} : {
			...e,
			value: i(e.value),
			dark: i(e.dark)
		})
	};
}
function pe(e, t) {
	let n = new Map(e.tokens.map((e) => [e.path, e])), r = new Set(t.tokens.map((e) => e.from).filter(Boolean)), i = {
		tokens: {},
		dark: {},
		rename: {},
		remove: e.tokens.filter((e) => !r.has(e.path)).map((e) => e.path)
	};
	for (let e of t.tokens) {
		let t = e.from ? n.get(e.from) : void 0;
		t && t.path !== e.path && (i.rename[t.path] = e.path), t && A(t.value, e.value) || (i.tokens[e.path] = e.value), t && A(t.dark || null, e.dark || null) || (i.dark[e.path] = e.dark || null);
	}
	for (let n of [
		"styles",
		"prose",
		"buttons",
		"transition"
	]) A(e[n], t[n]) || (i[n] = t[n]);
	return i;
}
function me() {
	let u = i("design/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), h = s(() => u.data ? de(u.data) : null, [u.data]), [y, T] = l(null), [O, me] = a(oe), [F, ve] = l("light"), [I, L] = l("desktop"), [R, z] = l(!1), [B, V] = l(null), H = ae(), [Se, Ce] = l(null), U = c(null), W = y ?? h, G = !!y && !!h && !A(y, h), K = (e) => h && T((t) => e(t ?? h)), we = s(() => G && h && y ? {
		...pe(h, y),
		css: y.css
	} : null, [
		G,
		h,
		y
	]);
	o(() => {
		if (!we) return Ce(null);
		let e = !0, t = setTimeout(() => {
			n("design/preview", we).then((t) => e && Ce(t.css), () => {});
		}, 150);
		return () => {
			e = !1, clearTimeout(t);
		};
	}, [we]);
	let Te = s(() => (W?.tokens ?? []).map((e) => `${E(e.group, e.name)}:${D(e.group, F === "dark" && e.dark ? e.dark : e.value)}`).join(";"), [W, F]), Ee = () => {
		let e = U.current?.contentDocument;
		if (!e?.head) return;
		let t = e.querySelector("link[rel=\"stylesheet\"][href*=\"/_cms/site/design-\"]"), n = e.getElementById("cms-design-preview");
		Se === null ? (n?.remove(), t && (t.disabled = !1)) : (n || (n = e.createElement("style"), n.id = "cms-design-preview", t ? t.after(n) : e.head.appendChild(n)), n.textContent !== Se && (n.textContent = Se), t && (t.disabled = !0));
		let r = e.getElementById("cms-token-preview");
		r || (r = e.createElement("style"), r.id = "cms-token-preview", e.head.appendChild(r));
		let i = G ? `:root:root:root{${Te}}` : "";
		r.textContent !== i && (r.textContent = i), e.documentElement.dataset.theme !== F && (e.documentElement.dataset.theme = F);
	};
	o(Ee), o(() => {
		let e = document.createElement("style");
		return e.textContent = (u.data?.fonts ?? []).map((e) => `@font-face{font-family:"${e.family}";src:url("${/^(https:\/\/|\/)/.test(e.src) ? e.src : `/_cms/fonts/${e.src.split("/").pop()}`}") format("woff2");font-weight:${e.weight ?? "400"};font-style:${e.style ?? "normal"};font-display:swap}`).join("\n"), document.head.appendChild(e), () => e.remove();
	}, [u.data?.fonts]);
	let De = async () => {
		if (G && !R && h && y) {
			z(!0), V(null);
			try {
				let r = pe(h, y);
				(Object.keys(r.tokens).length + Object.keys(r.dark).length + Object.keys(r.rename).length + r.remove.length > 0 || [
					"styles",
					"prose",
					"buttons",
					"transition"
				].some((e) => e in r)) && await n("design/update", r), (y.css !== h.css || y.js !== h.js) && await n("design/code", {
					css: y.css,
					...e("site.code") ? { js: y.js } : {}
				}), await t.invalidateQueries({ predicate: (e) => typeof e.queryKey[0] == "string" && e.queryKey[0].startsWith("design/") }), T(null), U.current?.contentWindow?.location.reload();
			} catch (e) {
				V(e instanceof Error ? e.message : String(e));
			} finally {
				z(!1);
			}
		}
	};
	if (u.isLoading) return /* @__PURE__ */ C("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ C(ne, {})
	});
	if (!u.data || !W) return /* @__PURE__ */ w("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ C(ie, { crumbs: [{
			label: r("Design System"),
			icon: "palette"
		}] }), /* @__PURE__ */ C(d, {
			icon: "palette",
			title: r("The design system could not be loaded"),
			description: u.error?.message
		})]
	});
	let q = W.tokens, J = (e) => q.filter((t) => t.group === e), Oe = (e, t) => K((n) => ({
		...n,
		tokens: n.tokens.map((n) => n.path === e.path ? {
			...n,
			...t
		} : n)
	})), ke = (e) => K((t) => ({
		...t,
		tokens: t.tokens.filter((t) => t.path !== e.path)
	})), Ae = async (e, t, n = "") => {
		let i = await b({
			title: e,
			description: n ? r("Blocks that use token:{path} keep the old name.", { path: `${t}.${n}` }) : void 0,
			fields: [{
				handle: "name",
				type: "text",
				label: r("Name"),
				mono: !0,
				autofocus: !0,
				placeholder: t === "color" ? "brand" : "md"
			}],
			values: { name: n },
			confirm: r(n ? "Rename" : "Add")
		}), a = String(i?.name ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+/, "");
		return !a || a === n ? null : q.some((e) => e.path === `${t}.${a}`) ? (x.error(r("“{name}” already exists", { name: a })), null) : a;
	}, Y = async (e, t) => {
		let n = await Ae(ce(e), e);
		n && K((r) => ({
			...r,
			tokens: [...r.tokens, {
				path: `${e}.${n}`,
				group: e,
				name: n,
				value: t,
				dark: null
			}]
		}));
	}, X = {
		rename: async (e) => {
			let t = await Ae(r("Rename Token"), e.group, e.name);
			t && K((n) => fe(n, e.path, `${e.group}.${t}`));
		},
		remove: ke
	}, Z = (e, t, n = "value") => /* @__PURE__ */ C(f, {
		bare: !0,
		className: v("flex min-w-0 flex-1", !["site-size", "blocks-color"].includes(String(t.component)) && "pr-8"),
		fields: [{
			handle: `${e.path}:${n}`,
			type: "text",
			label: e.name,
			size: "sm",
			mono: !0,
			...t
		}],
		values: { [`${e.path}:${n}`]: e[n] },
		onChange: (t, r) => Oe(e, { [n]: n === "dark" ? r || null : r ?? e[n] })
	}), Q = (e, t = {}) => ({
		component: "blocks-value",
		unit: e,
		...t
	}), je = Object.fromEntries(q.map((e) => [E(e.group, e.name), D(e.group, F === "dark" && e.dark ? e.dark : e.value)])), Me = D("ease", J("ease")[0]?.value ?? "cubic-bezier(0.2, 0.8, 0.2, 1)"), $ = [...new Set((u.data.fonts ?? []).map((e) => e.family))];
	return /* @__PURE__ */ w("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ C(ie, {
				crumbs: [{
					label: r("Design System"),
					icon: "palette"
				}, { label: se().flatMap((e) => e.items).find((e) => e.value === O)?.label ?? "" }],
				actions: /* @__PURE__ */ C(re, {
					content: r("Open Site"),
					children: /* @__PURE__ */ C(m, {
						icon: "external",
						label: r("Open Site"),
						onClick: () => window.open("/", "_blank", "noopener")
					})
				})
			}),
			/* @__PURE__ */ C(g, {
				title: r("Design System"),
				backTo: "/",
				backLabel: r("Dashboard"),
				nested: !0,
				children: /* @__PURE__ */ C("nav", {
					"aria-label": r("Design System"),
					className: H.nested ? "space-y-px" : "px-2 pb-4",
					children: se().map((e, t) => /* @__PURE__ */ w("div", {
						className: v("space-y-px", t > 0 && (H.nested ? "mt-1" : "mt-4")),
						children: [!H.nested && /* @__PURE__ */ C("div", {
							className: "cms-label flex h-7 items-center px-2",
							children: e.group
						}), e.items.map((e) => /* @__PURE__ */ C(te, {
							label: e.label,
							icon: H.nested ? void 0 : e.icon,
							active: O === e.value,
							onClick: () => me(e.value)
						}, e.value))]
					}, e.group))
				})
			}),
			/* @__PURE__ */ C(ee, {
				dirty: G,
				saving: R,
				error: B,
				onSave: () => void De(),
				onDiscard: () => {
					T(null), V(null);
				}
			}),
			/* @__PURE__ */ w("div", {
				className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(380px,460px)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ w("div", {
					className: "overflow-y-auto border-border px-4 pb-16 pt-2 md:border-r",
					children: [
						O === "color" && /* @__PURE__ */ w(j, {
							title: r("Colors"),
							onAdd: () => Y("color", "#000000"),
							children: [/* @__PURE__ */ w("div", {
								className: "flex h-7 items-center gap-2 text-2xs text-faint",
								children: [
									/* @__PURE__ */ C("span", {
										className: "min-w-0 flex-1",
										children: r("Name")
									}),
									/* @__PURE__ */ w("span", {
										className: v(M, "flex items-center gap-1"),
										children: [/* @__PURE__ */ C(p, {
											name: "sun",
											size: 11
										}), r("Light")]
									}),
									/* @__PURE__ */ w("span", {
										className: v(M, "flex items-center gap-1"),
										children: [/* @__PURE__ */ C(p, {
											name: "moon",
											size: 11
										}), r("Dark")]
									}),
									/* @__PURE__ */ C("span", { className: "w-6 shrink-0" })
								]
							}), J("color").map((e) => /* @__PURE__ */ w(N, {
								token: e,
								...X,
								wide: !0,
								children: [/* @__PURE__ */ C("div", {
									className: M,
									children: Z(e, {
										type: "color",
										component: "blocks-color"
									})
								}), /* @__PURE__ */ C("div", {
									className: M,
									children: Z(e, {
										type: "color",
										component: "blocks-color",
										placeholder: r("Same")
									}, "dark")
								})]
							}, e.from ?? e.path))]
						}),
						O === "type" && /* @__PURE__ */ w(S, { children: [
							/* @__PURE__ */ C(j, {
								title: r("Font Families"),
								onAdd: () => Y("font", [
									...$[0] ? [$[0]] : [],
									"ui-sans-serif",
									"system-ui",
									"sans-serif"
								]),
								children: J("font").map((e) => /* @__PURE__ */ C(N, {
									token: e,
									...X,
									below: /* @__PURE__ */ C("p", {
										className: "m-0 truncate pb-2.5 text-lg leading-tight text-ink",
										style: { fontFamily: D("font", e.value) },
										children: r("The quick brown fox jumps over the lazy dog")
									}),
									children: Z(e, {
										component: "site-font-stack",
										families: $
									})
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ C(_e, {
								fonts: u.data.fonts ?? [],
								tokens: J("font"),
								onChanged: () => {
									u.refetch(), U.current?.contentWindow?.location.reload();
								}
							}),
							/* @__PURE__ */ C(j, {
								title: r("Type Scale"),
								onAdd: () => Y("text", {
									min: "1rem",
									max: "1.25rem"
								}),
								children: J("text").map((e) => /* @__PURE__ */ C(N, {
									token: e,
									...X,
									below: /* @__PURE__ */ C("p", {
										className: "m-0 truncate pb-2.5 leading-[1.1] tracking-[-0.01em] text-ink",
										style: {
											fontSize: D("text", e.value),
											fontFamily: D("font", J("font").find((e) => e.name === "display")?.value ?? J("font")[0]?.value)
										},
										children: r("Ship It")
									}),
									children: Z(e, { component: "site-size" })
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ C(j, {
								title: r("Weights"),
								onAdd: () => Y("weight", "600"),
								children: J("weight").map((e) => /* @__PURE__ */ C(N, {
									token: e,
									...X,
									sample: /* @__PURE__ */ C("span", {
										className: "text-base text-ink",
										style: { fontWeight: Number(e.value) || 400 },
										children: "Ag"
									}),
									children: Z(e, Q("", {
										step: 100,
										min: 100,
										max: 900
									}))
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ C(j, {
								title: r("Line Heights"),
								onAdd: () => Y("leading", "1.5"),
								children: J("leading").map((e) => /* @__PURE__ */ C(N, {
									token: e,
									...X,
									sample: /* @__PURE__ */ C("span", {
										className: "flex w-4 flex-col",
										style: { gap: `${Math.max(1, (Number(e.value) - .8) * 6)}px` },
										children: [
											0,
											1,
											2
										].map((e) => /* @__PURE__ */ C("span", { className: v("h-0.5 rounded-full bg-muted", e === 2 && "w-2/3") }, e))
									}),
									children: Z(e, Q("", {
										step: .05,
										min: 0
									}))
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ C(j, {
								title: r("Letter Spacing"),
								onAdd: () => Y("tracking", "0em"),
								children: J("tracking").map((e) => /* @__PURE__ */ C(N, {
									token: e,
									...X,
									sample: /* @__PURE__ */ C("span", {
										className: "text-xs font-medium text-ink",
										style: { letterSpacing: D("tracking", e.value) },
										children: "Aa"
									}),
									children: Z(e, Q("em", {
										units: ["em", "px"],
										step: .005
									}))
								}, e.from ?? e.path))
							})
						] }),
						O === "space" && /* @__PURE__ */ w(S, { children: [
							/* @__PURE__ */ C(j, {
								title: r("Spacing"),
								onAdd: () => Y("space", "1rem"),
								children: J("space").map((e) => /* @__PURE__ */ C(N, {
									token: e,
									...X,
									after: /* @__PURE__ */ C(P, {
										value: e.value,
										of: J("space")
									}),
									children: Z(e, { component: "site-size" })
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ C(j, {
								title: r("Containers"),
								onAdd: () => Y("container", "72rem"),
								children: J("container").map((e) => /* @__PURE__ */ C(N, {
									token: e,
									...X,
									after: /* @__PURE__ */ C(P, {
										value: e.value,
										of: J("container")
									}),
									children: Z(e, { component: "site-size" })
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ C(j, {
								title: r("Breakpoints"),
								onAdd: () => Y("breakpoint", "768px"),
								children: J("breakpoint").map((e) => /* @__PURE__ */ C(N, {
									token: e,
									...X,
									after: /* @__PURE__ */ C(P, {
										value: e.value,
										of: J("breakpoint")
									}),
									children: Z(e, Q("px", {
										units: [
											"px",
											"rem",
											"em"
										],
										min: 0
									}))
								}, e.from ?? e.path))
							})
						] }),
						O === "shape" && /* @__PURE__ */ w(S, { children: [/* @__PURE__ */ C(j, {
							title: r("Radius"),
							onAdd: () => Y("radius", "0.5rem"),
							children: J("radius").map((e) => /* @__PURE__ */ C(N, {
								token: e,
								...X,
								sample: /* @__PURE__ */ C("span", {
									className: "size-5 translate-x-0.5 translate-y-0.5 border-l-[1.5px] border-t-[1.5px] border-muted",
									style: { borderTopLeftRadius: `min(${D("radius", e.value)}, 20px)` }
								}),
								children: Z(e, Q("px", {
									units: [
										"px",
										"rem",
										"%"
									],
									min: 0
								}))
							}, e.from ?? e.path))
						}), /* @__PURE__ */ C(j, {
							title: r("Shadows"),
							onAdd: () => Y("shadow", "0 4px 16px -4px rgb(0 0 0 / 0.12)"),
							children: J("shadow").map((e) => /* @__PURE__ */ C(N, {
								token: e,
								...X,
								sample: /* @__PURE__ */ C("span", {
									className: "size-5 shrink-0 rounded-[5px] border border-border bg-bg",
									style: { boxShadow: D("shadow", e.value) }
								}),
								children: Z(e, { component: "site-shadow" })
							}, e.from ?? e.path))
						})] }),
						O === "motion" && /* @__PURE__ */ w(S, { children: [
							/* @__PURE__ */ w(j, {
								title: r("Page Transition"),
								children: [/* @__PURE__ */ C(ge, {
									label: r("Effect"),
									children: /* @__PURE__ */ C(f, {
										bare: !0,
										className: "flex min-w-0 flex-1",
										fields: [{
											handle: "type",
											type: "select",
											label: r("Effect"),
											size: "sm",
											required: !0,
											options: {
												none: r("None"),
												fade: r("Fade"),
												slide: r("Slide"),
												scale: r("Scale")
											}
										}],
										values: W.transition,
										onChange: (e, t) => K((e) => ({
											...e,
											transition: {
												...e.transition,
												type: String(t ?? "none")
											}
										}))
									})
								}), W.transition.type !== "none" && /* @__PURE__ */ C(ge, {
									label: r("Duration"),
									children: /* @__PURE__ */ C(f, {
										bare: !0,
										className: "flex min-w-0 flex-1",
										fields: [{
											handle: "duration",
											type: "text",
											component: "blocks-value",
											label: r("Duration"),
											unit: "ms",
											units: ["ms"],
											step: 10,
											min: 50,
											max: 2e3
										}],
										values: { duration: `${Math.round(W.transition.duration * 1e3)}ms` },
										onChange: (e, t) => K((e) => ({
											...e,
											transition: {
												...e.transition,
												duration: he(t, e.transition.duration)
											}
										}))
									})
								})]
							}),
							/* @__PURE__ */ C(j, {
								title: r("Durations"),
								onAdd: () => Y("duration", "300ms"),
								children: J("duration").map((e) => /* @__PURE__ */ C(N, {
									token: e,
									...X,
									sample: /* @__PURE__ */ C("span", {
										className: "relative h-3 w-6",
										children: /* @__PURE__ */ C("span", {
											className: "absolute left-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-muted transition-transform group-hover:translate-x-4",
											style: {
												transitionDuration: D("duration", e.value),
												transitionTimingFunction: Me
											}
										})
									}),
									children: Z(e, Q("ms", {
										units: ["ms"],
										step: 10,
										min: 0
									}))
								}, e.from ?? e.path))
							}),
							/* @__PURE__ */ C(j, {
								title: r("Easing"),
								onAdd: () => Y("ease", "cubic-bezier(0.2, 0.8, 0.2, 1)"),
								children: J("ease").map((e) => /* @__PURE__ */ C(N, {
									token: e,
									...X,
									children: Z(e, { component: "site-ease" })
								}, e.from ?? e.path))
							})
						] }),
						O === "elements" && /* @__PURE__ */ w(S, { children: [/* @__PURE__ */ C(ye, {
							title: r("Elements"),
							options: u.data.elements ?? [],
							tokens: q,
							vars: je,
							value: W.styles,
							onChange: (e) => K((t) => ({
								...t,
								styles: e
							}))
						}), /* @__PURE__ */ C(ye, {
							title: r("Prose"),
							options: u.data.elements ?? [],
							tokens: q,
							vars: je,
							value: W.prose,
							onChange: (e) => K((t) => ({
								...t,
								prose: e
							}))
						})] }),
						O === "buttons" && /* @__PURE__ */ C(be, {
							value: W.buttons,
							tokens: q,
							vars: je,
							onChange: (e) => K((t) => ({
								...t,
								buttons: e
							}))
						}),
						O === "code" && /* @__PURE__ */ C(xe, {
							css: W.css,
							js: W.js,
							onChange: (e) => K((t) => ({
								...t,
								...e
							}))
						})
					]
				}, O), /* @__PURE__ */ w("div", {
					className: "flex min-w-0 flex-col bg-sunken max-md:hidden",
					children: [/* @__PURE__ */ w("div", {
						className: "flex h-10 shrink-0 items-center gap-2 border-b border-border bg-bg px-3",
						children: [
							/* @__PURE__ */ C(_, {
								size: "xs",
								value: I,
								onChange: L,
								options: [
									{
										value: "desktop",
										icon: "desktop",
										title: r("Desktop")
									},
									{
										value: "tablet",
										icon: "tablet",
										title: r("Tablet")
									},
									{
										value: "phone",
										icon: "phone",
										title: r("Phone")
									}
								]
							}),
							I !== "desktop" && /* @__PURE__ */ C("span", {
								className: "font-mono text-2xs text-faint",
								children: le[I]
							}),
							/* @__PURE__ */ C("span", { className: "flex-1" }),
							/* @__PURE__ */ C(_, {
								size: "xs",
								value: F,
								onChange: ve,
								options: [{
									value: "light",
									icon: "sun",
									title: r("Light")
								}, {
									value: "dark",
									icon: "moon",
									title: r("Dark")
								}]
							})
						]
					}), /* @__PURE__ */ C(ue, {
						viewport: I,
						desktop: k(u.data.breakpoints?.lg) || 1024,
						children: (e) => /* @__PURE__ */ C("iframe", {
							ref: U,
							src: "/",
							title: r("Site Preview"),
							className: v("border-0 bg-bg", I !== "desktop" && "border-x border-border"),
							style: e,
							onLoad: Ee
						})
					})]
				})]
			})
		]
	});
}
function j({ title: e, onAdd: t, action: n, children: i }) {
	return /* @__PURE__ */ w("section", {
		className: "mb-6",
		children: [/* @__PURE__ */ w("div", {
			className: "flex h-9 items-center justify-between border-b border-border",
			children: [
				/* @__PURE__ */ C("h3", {
					className: "m-0 text-xs font-semibold text-ink",
					children: e
				}),
				n,
				t && /* @__PURE__ */ C(re, {
					content: r("Add Token"),
					children: /* @__PURE__ */ C(m, {
						icon: "plus",
						label: r("Add Token"),
						size: "xs",
						onClick: t
					})
				})
			]
		}), i]
	});
}
var M = "w-[108px] shrink-0 max-sm:w-[92px]";
function he(e, t) {
	let n = String(e ?? "").trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/);
	if (!n) return t;
	let r = n[2] === "s" ? Number(n[1]) : Number(n[1]) / 1e3;
	return Math.min(2, Math.max(.05, Math.round(r * 1e3) / 1e3));
}
function N({ token: e, sample: t, after: n, below: i, wide: a, rename: o, remove: s, children: c }) {
	let l = `token:${e.path}`, u = () => {
		navigator.clipboard?.writeText(l), x.success(r("Copied {reference}", { reference: l }));
	};
	return /* @__PURE__ */ w("div", {
		className: "group border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ w("div", {
			className: "flex min-h-9 items-center gap-2 py-1",
			children: [
				t !== void 0 && /* @__PURE__ */ C("span", {
					className: "grid w-7 shrink-0 place-items-center",
					children: t
				}),
				/* @__PURE__ */ C(re, {
					content: /* @__PURE__ */ C("span", {
						className: "font-mono",
						children: l
					}),
					children: /* @__PURE__ */ C("button", {
						type: "button",
						onClick: u,
						title: e.name,
						className: v("h-6 truncate rounded-xs text-left text-xs text-text hover:text-ink", a ? "min-w-0 flex-1" : t === void 0 ? "w-[120px] shrink-0 max-sm:w-20" : "w-[84px] shrink-0 max-sm:w-16"),
						children: e.name
					})
				}),
				a ? c : /* @__PURE__ */ C("div", {
					className: "flex w-60 shrink-0 max-lg:w-52 max-sm:w-auto max-sm:min-w-0 max-sm:flex-1",
					children: c
				}),
				!a && /* @__PURE__ */ C("span", {
					className: "flex min-w-0 flex-1 items-center max-sm:hidden",
					children: n
				}),
				/* @__PURE__ */ C(h, {
					trigger: /* @__PURE__ */ C(m, {
						icon: "more",
						label: r("Token Actions"),
						size: "xs",
						className: "shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
					}),
					items: [
						{
							label: r("Copy Reference"),
							icon: "copy",
							onSelect: u
						},
						{
							label: r("Rename…"),
							icon: "edit",
							onSelect: () => o(e)
						},
						{
							separator: !0,
							label: ""
						},
						{
							label: r("Delete"),
							icon: "trash",
							danger: !0,
							onSelect: () => s(e)
						}
					]
				})
			]
		}), i]
	});
}
function ge({ label: e, children: t }) {
	return /* @__PURE__ */ w("div", {
		className: "flex min-h-9 items-center gap-2 border-b border-border py-1 last:border-b-0",
		children: [/* @__PURE__ */ C("span", {
			className: "w-[120px] shrink-0 truncate text-xs text-text",
			children: e
		}), /* @__PURE__ */ C("div", {
			className: "flex w-60 shrink-0 pr-8 max-lg:w-52",
			children: t
		})]
	});
}
function P({ value: e, of: t }) {
	let n = Math.max(...t.map((e) => k(e.value)), 1);
	return /* @__PURE__ */ C("span", {
		className: "h-1.5 min-w-px rounded-full bg-border-strong",
		style: { width: `${k(e) / n * 100}%` }
	});
}
function _e({ fonts: e, tokens: t, onChanged: i }) {
	let [a, o] = l(""), [s, c] = l(!1), d = [...new Set(e.map((e) => e.family))], p = async () => {
		let e = a.trim();
		if (e) {
			c(!0);
			try {
				await n("design/fonts-import", { family: e }), x.success(r("{family} added", { family: e })), o(""), i();
			} catch (e) {
				x.error(e);
			} finally {
				c(!1);
			}
		}
	}, ee = async (e) => {
		let t = await new Promise((t) => {
			let n = new FileReader();
			n.onload = () => t(String(n.result)), n.readAsDataURL(e);
		}), a = e.name.replace(/\.woff2$/i, ""), o = await b({
			title: r("Upload Font"),
			fields: [{
				handle: "family",
				type: "text",
				label: r("Family Name"),
				autofocus: !0
			}],
			values: { family: a.replace(/[-_](regular|bold|variable|italic|\d+).*$/i, "").replace(/[-_]/g, " ") },
			confirm: r("Upload")
		}), s = String(o?.family ?? "").trim();
		if (s) try {
			await n("design/fonts-upload", {
				family: s,
				name: a,
				data: t,
				weight: /variable/i.test(a) ? "100 900" : "400",
				style: /italic/i.test(a) ? "italic" : "normal"
			}), x.success(r("{family} uploaded", { family: s })), i();
		} catch (e) {
			x.error(e);
		}
	}, g = async (t) => {
		if (await y({
			title: r("Remove {family}?", { family: t }),
			description: r("Font families that use it fall back to the system font."),
			confirm: r("Remove"),
			danger: !0
		})) try {
			await n("design/update", { fonts: e.filter((e) => e.family !== t) }), i();
		} catch (e) {
			x.error(e);
		}
	};
	return /* @__PURE__ */ w(j, {
		title: r("Font Files"),
		children: [
			d.length === 0 && /* @__PURE__ */ C("p", {
				className: "m-0 py-3 text-xs text-faint",
				children: r("None yet. The site uses system fonts.")
			}),
			d.map((n) => {
				let i = e.filter((e) => e.family === n), a = t.filter((e) => Array.isArray(e.value) && e.value[0] === n).map((e) => e.name);
				return /* @__PURE__ */ w("div", {
					className: "group flex items-center gap-3 border-b border-border py-2.5",
					children: [
						/* @__PURE__ */ C("span", {
							className: "grid size-9 shrink-0 place-items-center rounded-sm bg-sunken text-lg text-ink",
							style: { fontFamily: `"${n}"` },
							children: "Aa"
						}),
						/* @__PURE__ */ w("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ C("p", {
								className: "m-0 truncate text-sm text-ink",
								style: { fontFamily: `"${n}"` },
								children: n
							}), /* @__PURE__ */ w("p", {
								className: "m-0 truncate text-2xs text-faint",
								children: [i.map((e) => `${e.weight ?? "400"}${e.style === "italic" ? " italic" : ""}`).join(" · "), a.length > 0 && ` · ${r("used by {names}", { names: a.join(", ") })}`]
							})]
						}),
						/* @__PURE__ */ C(h, {
							trigger: /* @__PURE__ */ C(m, {
								icon: "more",
								label: r("Font Actions"),
								size: "xs",
								className: "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
							}),
							items: [{
								label: r("Remove"),
								icon: "trash",
								danger: !0,
								onSelect: () => void g(n)
							}]
						})
					]
				}, n);
			}),
			/* @__PURE__ */ w("form", {
				className: "flex items-center gap-2 py-2.5",
				onSubmit: (e) => {
					e.preventDefault(), p();
				},
				children: [/* @__PURE__ */ C(f, {
					bare: !0,
					className: "min-w-0 flex-1",
					fields: [{
						handle: "family",
						type: "text",
						label: r("Google Font"),
						size: "sm",
						placeholder: r("Google Font, like Inter Tight"),
						icon: "search"
					}],
					values: { family: a },
					onChange: (e, t) => o(t ?? "")
				}), /* @__PURE__ */ C(u, {
					type: "submit",
					size: "sm",
					loading: s,
					disabled: !a.trim(),
					children: r("Add")
				})]
			}),
			/* @__PURE__ */ C(f, {
				bare: !0,
				fields: [{
					handle: "file",
					type: "json",
					component: "site-file",
					label: r("Font File"),
					placeholder: r("Drop a .woff2 file or choose one"),
					accept: ".woff2,font/woff2"
				}],
				values: {},
				onChange: (e, t) => t && void ee(t)
			})
		]
	});
}
function F(e) {
	return {
		html: r("Page"),
		body: r("Body"),
		h1: r("Heading 1"),
		h2: r("Heading 2"),
		h3: r("Heading 3"),
		h4: r("Heading 4"),
		h5: r("Heading 5"),
		h6: r("Heading 6"),
		p: r("Paragraph"),
		a: r("Link"),
		"a:hover": r("Link on Hover"),
		small: r("Small Text"),
		strong: r("Bold Text"),
		em: r("Italic Text"),
		mark: r("Highlight"),
		code: r("Code"),
		kbd: r("Keyboard Key"),
		pre: r("Code Block"),
		blockquote: r("Quote"),
		hr: r("Divider"),
		ul: r("Bulleted List"),
		ol: r("Numbered List"),
		li: r("List Item"),
		img: r("Image"),
		figcaption: r("Caption"),
		table: r("Table"),
		th: r("Table Header"),
		td: r("Table Cell"),
		button: r("Form Button"),
		input: r("Text Input"),
		textarea: r("Text Area"),
		select: r("Dropdown"),
		label: r("Form Label"),
		"::selection": r("Selected Text"),
		":focus-visible": r("Focus Ring"),
		"h1 em": r("Italic in Heading 1"),
		"h2 em": r("Italic in Heading 2"),
		"h3 em": r("Italic in Heading 3"),
		"h1 strong": r("Bold in Heading 1"),
		"h2 strong": r("Bold in Heading 2")
	}[e] ?? e;
}
var ve = {
	font: "fontFamily",
	size: "fontSize",
	weight: "fontWeight",
	leading: "lineHeight",
	tracking: "letterSpacing",
	transform: "textTransform",
	decoration: "textDecoration",
	underlineOffset: "textUnderlineOffset",
	wrap: "textWrap",
	style: "fontStyle",
	features: "fontFeatureSettings",
	background: "backgroundColor",
	radius: "borderRadius"
}, I = /* @__PURE__ */ new Set([
	"fontWeight",
	"lineHeight",
	"opacity",
	"zIndex"
]);
function L(e) {
	return Object.fromEntries(Object.entries(e ?? {}).map(([e, t]) => [ve[e] ?? e, t]));
}
function R(e) {
	return Object.fromEntries(Object.entries(L(e)).map(([e, t]) => [e, typeof t == "number" && !I.has(e) && t !== 0 ? `${t}px` : D("", t)]));
}
function z(e) {
	let t = (t) => e.filter((e) => e.group === t);
	return [
		{
			handle: "fontFamily",
			type: "select",
			size: "sm",
			label: r("Font"),
			placeholder: r("Inherit"),
			options: t("font").map((e) => ({
				value: `token:${e.path}`,
				label: e.name
			}))
		},
		{
			handle: "fontSize",
			type: "text",
			component: "blocks-value",
			label: r("Size"),
			group: "text",
			placeholder: r("Inherit"),
			unit: "rem",
			units: [
				"rem",
				"px",
				"em",
				"%"
			],
			step: .125
		},
		{
			handle: "fontWeight",
			type: "select",
			size: "sm",
			label: r("Weight"),
			placeholder: r("Inherit"),
			options: [...t("weight").map((e) => ({
				value: `token:${e.path}`,
				label: `${e.name} · ${e.value}`
			})), ...[
				"100",
				"200",
				"300",
				"400",
				"500",
				"600",
				"700",
				"800",
				"900"
			].map((e) => ({
				value: e,
				label: e
			}))]
		},
		{
			handle: "lineHeight",
			type: "text",
			component: "blocks-value",
			label: r("Line Height"),
			group: "leading",
			unit: "",
			step: .05,
			placeholder: r("Inherit")
		},
		{
			handle: "letterSpacing",
			type: "text",
			component: "blocks-value",
			label: r("Letter Spacing"),
			group: "tracking",
			unit: "em",
			units: ["em", "px"],
			step: .005,
			placeholder: "0"
		},
		{
			handle: "color",
			type: "color",
			component: "blocks-color",
			label: r("Color"),
			placeholder: r("Inherit")
		}
	];
}
function B() {
	return [
		{
			handle: "backgroundColor",
			type: "color",
			component: "blocks-color",
			label: r("Fill"),
			placeholder: r("None")
		},
		{
			handle: "border",
			type: "group",
			component: "blocks-group",
			label: r("Border"),
			fields: [{
				handle: "borderWidth",
				type: "text",
				component: "blocks-value",
				label: r("Border Width"),
				placeholder: "0",
				min: 0,
				className: "!flex-none w-[64px]"
			}, {
				handle: "borderColor",
				type: "color",
				component: "blocks-color",
				label: r("Border Color"),
				placeholder: r("None")
			}]
		},
		{
			handle: "borderRadius",
			type: "text",
			component: "blocks-value",
			label: r("Radius"),
			group: "radius",
			unit: "px",
			units: [
				"px",
				"rem",
				"%"
			],
			min: 0,
			placeholder: "0"
		},
		{
			handle: "padding",
			type: "group",
			component: "blocks-group",
			label: r("Padding"),
			fields: [{
				handle: "paddingBlock",
				type: "text",
				component: "blocks-value",
				label: r("Vertical Padding"),
				group: "space",
				prefixIcon: "b-arrows-out-line-vertical",
				unit: "rem",
				placeholder: "0",
				min: 0
			}, {
				handle: "paddingInline",
				type: "text",
				component: "blocks-value",
				label: r("Horizontal Padding"),
				group: "space",
				prefixIcon: "b-arrows-out-line-horizontal",
				unit: "rem",
				placeholder: "0",
				min: 0
			}]
		}
	];
}
function V({ value: e, onChange: t, fields: n, tokens: i }) {
	let a = L(e), o = (e) => (e.fields ?? [e]).map((e) => e.handle), s = new Set(n.flatMap(o)), c = (e) => {
		let n = { ...a };
		for (let [t, r] of Object.entries(e)) r == null || r === "" ? delete n[t] : n[t] = r;
		t(n);
	}, l = {}, u = n.map((e) => {
		let t = o(e);
		return l[e.handle] = e.fields ? Object.fromEntries(t.map((e) => [e, a[e] ?? null])) : a[e.handle] ?? null, {
			...e,
			status: t.some((e) => e in a) ? "own" : void 0,
			reset: () => c(Object.fromEntries(t.map((e) => [e, null])))
		};
	}), d = Object.fromEntries(Object.entries(a).filter(([e]) => !s.has(e)));
	return /* @__PURE__ */ w(S, { children: [/* @__PURE__ */ C(f, {
		layout: "inline",
		fields: u,
		values: l,
		onChange: (e, t) => {
			let r = n.find((t) => t.handle === e);
			c(r?.fields ? Object.fromEntries(o(r).map((e) => [e, t?.[e] ?? null])) : { [e]: t });
		}
	}), /* @__PURE__ */ C(f, {
		bare: !0,
		fields: [{
			handle: "css",
			type: "json",
			component: "site-declarations",
			label: r("CSS"),
			mono: !1,
			tokens: i.map((e) => `token:${e.path}`)
		}],
		values: { css: d },
		onChange: (e, n) => t({
			...Object.fromEntries(Object.entries(a).filter(([e]) => s.has(e))),
			...n ?? {}
		})
	})] });
}
function H({ open: e, onToggle: t, label: n, aside: r, menu: i, children: a }) {
	return /* @__PURE__ */ w("div", {
		className: "group border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ w("div", {
			className: "flex min-h-10 items-center gap-2",
			children: [/* @__PURE__ */ w("button", {
				type: "button",
				"aria-expanded": e,
				onClick: t,
				className: "flex min-h-10 min-w-0 flex-1 items-center gap-1.5 rounded-xs text-left text-xs text-text outline-offset-[-2px] hover:text-ink",
				children: [
					/* @__PURE__ */ C(p, {
						name: "chevron-right",
						size: 12,
						className: v("shrink-0 text-faint transition-transform duration-120", e && "rotate-90")
					}),
					/* @__PURE__ */ C("span", {
						className: "min-w-0 flex-1 truncate",
						children: n
					}),
					r
				]
			}), i]
		}), e && /* @__PURE__ */ C("div", {
			className: "pb-3 pl-[18px]",
			children: a
		})]
	});
}
function ye({ title: e, value: t, onChange: n, options: i, tokens: a, vars: o }) {
	let [s, c] = l(null), u = i.filter((e) => !(e in t)), d = [...z(a), ...B()];
	return /* @__PURE__ */ w(j, {
		title: e,
		action: /* @__PURE__ */ C(h, {
			trigger: /* @__PURE__ */ C(m, {
				icon: "plus",
				label: r("Add Element"),
				size: "xs"
			}),
			items: u.map((e) => ({
				label: F(e),
				onSelect: () => {
					n({
						...t,
						[e]: {}
					}), c(e);
				}
			})),
			className: "max-h-72 overflow-auto"
		}),
		children: [Object.keys(t).length === 0 && /* @__PURE__ */ C("p", {
			className: "m-0 py-3 text-xs text-faint",
			children: r("No element styles")
		}), Object.entries(t).map(([e, i]) => /* @__PURE__ */ C(H, {
			open: s === e,
			onToggle: () => c(s === e ? null : e),
			label: F(e),
			aside: /* @__PURE__ */ C("span", {
				"aria-hidden": "true",
				className: "grid h-6 w-9 shrink-0 place-items-center rounded-xs",
				style: {
					...o,
					background: "var(--color-background)",
					color: "var(--color-foreground)"
				},
				children: /* @__PURE__ */ C("span", {
					className: "px-0.5",
					style: {
						...R(i),
						fontSize: 15,
						lineHeight: 1.2,
						margin: 0,
						paddingBlock: 0
					},
					children: "Aa"
				})
			}),
			menu: /* @__PURE__ */ C(h, {
				trigger: /* @__PURE__ */ C(m, {
					icon: "more",
					label: r("Element Actions"),
					size: "xs",
					className: "shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
				}),
				items: [{
					label: r("Remove"),
					icon: "trash",
					danger: !0,
					onSelect: () => n(Object.fromEntries(Object.entries(t).filter(([t]) => t !== e)))
				}]
			}),
			children: /* @__PURE__ */ C(V, {
				value: i,
				fields: d,
				tokens: a,
				onChange: (r) => n({
					...t,
					[e]: r
				})
			})
		}, e))]
	});
}
function be({ value: e, onChange: t, tokens: n, vars: i }) {
	let [a, o] = l(null), [s, c] = l("base"), u = async () => {
		let n = await b({
			title: r("New Button Variant"),
			fields: [{
				handle: "name",
				type: "text",
				label: r("Name"),
				placeholder: "outline",
				mono: !0,
				autofocus: !0
			}],
			confirm: r("Add")
		}), i = String(n?.name ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "");
		i && !(i in e) && (t({
			...e,
			[i]: {
				base: {},
				hover: {}
			}
		}), o(i));
	}, d = (e) => ({
		base: e.base ?? ("hover" in e ? {} : e),
		hover: e.hover ?? {}
	}), f = {
		...i,
		display: "inline-flex",
		alignItems: "center",
		padding: "0.45em 0.9em",
		fontSize: 13,
		fontWeight: "var(--font-weight-medium, 500)",
		lineHeight: 1.2,
		borderRadius: "var(--radius-md, 0.5rem)",
		border: "1px solid transparent",
		fontFamily: "var(--font-sans, inherit)",
		color: "var(--color-foreground)",
		whiteSpace: "nowrap"
	}, p = (e) => e.charAt(0).toUpperCase() + e.slice(1).replace(/-/g, " "), ee = [
		...B(),
		...z(n).filter((e) => [
			"fontWeight",
			"fontSize",
			"color"
		].includes(e.handle)).map((e) => e.handle === "color" ? {
			...e,
			label: r("Text")
		} : e),
		{
			handle: "opacity",
			type: "text",
			component: "blocks-value",
			label: r("Opacity"),
			percent: !0,
			step: .05,
			min: 0,
			max: 1,
			placeholder: "100"
		}
	];
	return /* @__PURE__ */ w(j, {
		title: r("Button Variants"),
		onAdd: u,
		children: [Object.keys(e).length === 0 && /* @__PURE__ */ C("p", {
			className: "m-0 py-3 text-xs text-faint",
			children: r("No variants")
		}), Object.entries(e).map(([l, u]) => {
			let { base: g, hover: _ } = d(u);
			return /* @__PURE__ */ w(H, {
				open: a === l,
				onToggle: () => o(a === l ? null : l),
				label: /* @__PURE__ */ C("span", {
					className: "inline-flex rounded-xs px-1.5 py-1",
					style: {
						...i,
						background: "var(--color-background)"
					},
					children: /* @__PURE__ */ C("span", {
						style: {
							...f,
							...R(g),
							fontSize: 11
						},
						children: p(l)
					})
				}),
				menu: /* @__PURE__ */ C(h, {
					trigger: /* @__PURE__ */ C(m, {
						icon: "more",
						label: r("Variant Actions"),
						size: "xs",
						className: "shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
					}),
					items: [{
						label: r("Delete"),
						icon: "trash",
						danger: !0,
						onSelect: () => t(Object.fromEntries(Object.entries(e).filter(([e]) => e !== l)))
					}]
				}),
				children: [/* @__PURE__ */ C("div", {
					role: "radiogroup",
					"aria-label": r("State"),
					className: "mb-2 grid grid-cols-2 gap-2",
					children: ["base", "hover"].map((e) => /* @__PURE__ */ C("button", {
						type: "button",
						role: "radio",
						"aria-checked": s === e,
						onClick: () => c(e),
						className: v("flex h-12 items-center justify-center rounded-sm border outline-offset-2 transition-[border-color,box-shadow] duration-120", s === e ? "border-focus ring-1 ring-focus" : "border-border hover:border-border-strong"),
						style: {
							...i,
							background: "var(--color-background)"
						},
						children: /* @__PURE__ */ C("span", {
							style: {
								...f,
								...R(g),
								...e === "hover" ? R(_) : {}
							},
							children: r(e === "base" ? "Default" : "Hover")
						})
					}, e))
				}), /* @__PURE__ */ C(V, {
					value: s === "base" ? g : _,
					fields: ee,
					tokens: n,
					onChange: (n) => t({
						...e,
						[l]: {
							...d(u),
							[s]: n
						}
					})
				}, s)]
			}, l);
		})]
	});
}
function xe({ css: t, js: n, onChange: i }) {
	let a = e("site.code"), o = (e, t, n, r) => /* @__PURE__ */ C(j, {
		title: t,
		children: /* @__PURE__ */ C("div", {
			className: "py-2.5",
			children: /* @__PURE__ */ C(f, {
				bare: !0,
				fields: [{
					handle: e,
					type: "code",
					label: t,
					rows: 14,
					placeholder: n
				}],
				values: { [e]: r },
				onChange: (t, n) => i({ [e]: n ?? "" }),
				disabled: !a
			})
		})
	});
	return /* @__PURE__ */ w(S, { children: [
		o("css", r("Custom CSS"), ".cms-prose figure { margin-block: 2rem; }", t),
		o("js", r("Custom JavaScript"), "document.addEventListener('cms:alpine', (e) => …)", n),
		!a && /* @__PURE__ */ C("p", {
			className: "m-0 text-2xs text-warning",
			children: r("Editing code needs the “Edit custom CSS and JavaScript” permission.")
		})
	] });
}
export { me as default };
