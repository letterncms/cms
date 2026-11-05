import { can as e, queryClient as t, run as n, t as r, useAbility as i, useTab as a } from "@letterncms/sdk";
import { useEffect as o, useMemo as s, useRef as c, useState as l } from "react";
import { Button as u, EmptyState as d, Fields as f, IconButton as p, Menu as m, SaveBar as h, ScreenSidebar as ee, Segmented as g, SidebarRow as te, Spinner as ne, Tooltip as re, Topbar as ie, cn as ae, confirm as _, prompt as v, toast as y, useScreenSidebar as oe } from "@letterncms/ui";
import { Fragment as b, jsx as x, jsxs as S } from "react/jsx-runtime";
// admin/src/Theme.tsx
var se = [
	"color",
	"type",
	"space",
	"shape",
	"motion",
	"elements",
	"agents",
	"code"
], C = () => [
	{
		value: "color",
		label: r("Color"),
		icon: "palette"
	},
	{
		value: "type",
		label: r("Typography"),
		icon: "typography"
	},
	{
		value: "space",
		label: r("Space and Layout"),
		icon: "spacing"
	},
	{
		value: "shape",
		label: r("Shape and Components"),
		icon: "radius"
	},
	{
		value: "motion",
		label: r("Motion"),
		icon: "speed"
	},
	{
		value: "elements",
		label: r("Elements"),
		icon: "paragraph"
	},
	{
		value: "agents",
		label: r("Contrast and Agents"),
		icon: "sparkle"
	},
	{
		value: "code",
		label: r("Custom Code"),
		icon: "code"
	}
], w = [
	"0",
	"3xs",
	"2xs",
	"xs",
	"sm",
	"md",
	"lg",
	"xl",
	"2xl",
	"3xl",
	"4xl",
	"5xl",
	"6xl",
	"7xl"
], T = [
	"50",
	"100",
	"200",
	"300",
	"400",
	"500",
	"600",
	"700",
	"800",
	"900",
	"950"
], ce = [
	"success",
	"warning",
	"danger",
	"info"
], le = [
	"sans",
	"serif",
	"mono",
	"display",
	"condensed"
], ue = {
	desktop: "100%",
	tablet: "768px",
	phone: "390px"
}, E = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null), D = (e, t = {}) => e.map((e) => ({
	value: e,
	label: t[e] ?? e
}));
function de(e, t, n) {
	let [r, ...i] = t, a = { ...e };
	if (i.length) {
		let t = de(e[r] && typeof e[r] == "object" && !Array.isArray(e[r]) ? e[r] : {}, i, n);
		Object.keys(t).length ? a[r] = t : delete a[r];
	} else n == null || n === "" ? delete a[r] : a[r] = n;
	return a;
}
var fe = (e, t) => t.reduce((e, t) => e && typeof e == "object" ? e[t] : void 0, e);
function O() {
	let s = i("design/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), m = s.data?.theme ?? null, [_, O] = l(null), [N, P] = l(null), [I, L] = a(se), [R, _e] = l("light"), [z, ve] = l("desktop"), [ye, be] = l(!1), [xe, B] = l(null), [V, Se] = l(null), [Ce, H] = l(null), we = oe(), U = c(null), W = _ ?? m, Te = !!_ && !E(_, m) || N !== null && N !== (s.data?.js ?? ""), G = V?.resolved ?? s.data?.resolved, K = V?.findings ?? s.data?.findings ?? [], q = (e, t) => m && O((n) => de(n ?? m, e, t)), J = (e) => W ? fe(W, e) : void 0;
	o(() => {
		if (!_ || E(_, m)) {
			Se(null), H(null);
			return;
		}
		let e = !0, t = setTimeout(() => {
			n("design/preview", {
				theme: _,
				replace: !0
			}).then((t) => e && (Se(t), H(null)), (t) => e && H(t instanceof Error ? t.message : String(t)));
		}, 160);
		return () => {
			e = !1, clearTimeout(t);
		};
	}, [_, m]);
	let Ee = () => {
		let e = U.current?.contentDocument;
		if (!e?.head) return;
		let t = e.querySelector("link[rel=\"stylesheet\"][href*=\"/_cms/site/design-\"]"), n = e.getElementById("cms-design-preview");
		V ? (n || (n = e.createElement("style"), n.id = "cms-design-preview", t ? t.after(n) : e.head.appendChild(n)), n.textContent !== V.css && (n.textContent = V.css), t && (t.disabled = !0)) : (n?.remove(), t && (t.disabled = !1)), e.documentElement.dataset.mode !== R && (e.documentElement.dataset.mode = R);
	};
	o(Ee);
	let De = async () => {
		if (Te && !ye && W) {
			be(!0), B(null);
			try {
				if (_ && !E(_, m)) {
					let e = (await n("design/update", {
						theme: _,
						replace: !0
					})).findings.filter((e) => e.level === "error").length;
					e && y.error(r("Saved, but {n} color pairs miss their contrast. See Contrast and Agents.", { n: e }));
				}
				N !== null && N !== (s.data?.js ?? "") && await n("design/code", { js: N }), await t.invalidateQueries({ predicate: (e) => typeof e.queryKey[0] == "string" && (e.queryKey[0].startsWith("design/") || e.queryKey[0] === "blocks/types") }), O(null), P(null), U.current?.contentWindow?.location.reload();
			} catch (e) {
				B(e instanceof Error ? e.message : String(e));
			} finally {
				be(!1);
			}
		}
	};
	if (s.isLoading) return /* @__PURE__ */ x("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ x(ne, {})
	});
	if (!s.data || !W || !G) return /* @__PURE__ */ S("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ x(ie, { crumbs: [{
			label: r("Design System"),
			icon: "palette"
		}] }), /* @__PURE__ */ x(d, {
			icon: "palette",
			title: r("The design system could not be loaded"),
			description: s.error?.message
		})]
	});
	let Y = K.filter((e) => e.level === "error"), Oe = [...new Set((W.font?.faces ?? []).map((e) => e.family))], X = Object.keys(G.palettes), Z = X.flatMap((e) => T.map((t) => `${e}-${t}`)), Q = (e, t) => /* @__PURE__ */ x(f, {
		bare: !0,
		className: "flex min-w-0 flex-1",
		fields: [{
			handle: e.join("."),
			type: "text",
			size: "sm",
			label: t.label ?? e.at(-1),
			...t
		}],
		values: { [e.join(".")]: J(e) },
		onChange: (t, n) => q(e, n)
	}), $ = (e, t, n, i = 1) => {
		let a = J(e) ?? t;
		return /* @__PURE__ */ S("div", {
			className: "flex min-w-0 flex-1 items-center gap-1.5",
			children: [
				/* @__PURE__ */ x(M, {
					value: a[0],
					step: i,
					unit: n,
					label: r("Narrow"),
					onChange: (t) => q(e, [t, a[1]])
				}),
				/* @__PURE__ */ x("span", {
					className: "text-2xs text-faint",
					children: "→"
				}),
				/* @__PURE__ */ x(M, {
					value: a[1],
					step: i,
					unit: n,
					label: r("Wide"),
					onChange: (t) => q(e, [a[0], t])
				})
			]
		});
	};
	return /* @__PURE__ */ S("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ x(ie, {
				crumbs: [{
					label: r("Design System"),
					icon: "palette"
				}, { label: C().find((e) => e.value === I)?.label ?? "" }],
				actions: /* @__PURE__ */ S(b, { children: [Y.length > 0 && /* @__PURE__ */ x("button", {
					type: "button",
					onClick: () => L("agents"),
					className: "mr-1 rounded-full bg-danger-soft px-2 py-0.5 text-2xs font-medium text-danger",
					children: r("{n} contrast issues", { n: Y.length })
				}), /* @__PURE__ */ x(re, {
					content: r("Open Site"),
					children: /* @__PURE__ */ x(p, {
						icon: "external",
						label: r("Open Site"),
						onClick: () => window.open("/", "_blank", "noopener")
					})
				})] })
			}),
			/* @__PURE__ */ x(ee, {
				title: r("Design System"),
				backTo: "/",
				backLabel: r("Dashboard"),
				nested: !0,
				children: /* @__PURE__ */ x("nav", {
					"aria-label": r("Design System"),
					className: we.nested ? "space-y-px" : "px-2 pb-4",
					children: C().map((e) => /* @__PURE__ */ x(te, {
						label: e.label,
						icon: we.nested ? void 0 : e.icon,
						active: I === e.value,
						onClick: () => L(e.value)
					}, e.value))
				})
			}),
			/* @__PURE__ */ x(h, {
				dirty: Te,
				saving: ye,
				error: xe ?? Ce,
				onSave: () => void De(),
				onDiscard: () => {
					O(null), P(null), B(null);
				}
			}),
			/* @__PURE__ */ S("div", {
				className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(340px,440px)_minmax(0,1fr)] xl:grid-cols-[minmax(380px,480px)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ S("div", {
					className: "overflow-y-auto border-border px-4 pb-16 pt-2 md:border-r",
					children: [
						I === "color" && /* @__PURE__ */ S(b, { children: [
							/* @__PURE__ */ S(k, {
								title: r("Brand"),
								help: r("Your colors, exactly. Every palette below is made from them, and text on them is picked to stay readable."),
								children: [
									/* @__PURE__ */ x(A, {
										label: r("Primary"),
										children: /* @__PURE__ */ x(j, {
											value: J(["color", "primary"]),
											onChange: (e) => q(["color", "primary"], e ?? J(["color", "primary"]))
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Accent"),
										children: /* @__PURE__ */ x(j, {
											value: J(["color", "accent"]),
											placeholder: r("Primary"),
											onChange: (e) => q(["color", "accent"], e)
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Secondary"),
										children: /* @__PURE__ */ x(j, {
											value: J(["color", "secondary"]),
											placeholder: r("Dark neutral"),
											onChange: (e) => q(["color", "secondary"], e)
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Neutral"),
										children: /* @__PURE__ */ x(j, {
											value: J(["color", "neutral"]),
											placeholder: r("From primary"),
											onChange: (e) => q(["color", "neutral"], e)
										})
									}),
									Object.entries(J(["color", "palettes"]) ?? {}).map(([e, t]) => /* @__PURE__ */ S(A, {
										label: e,
										children: [/* @__PURE__ */ x(j, {
											value: t,
											onChange: (n) => q([
												"color",
												"palettes",
												e
											], n ?? t)
										}), /* @__PURE__ */ x(p, {
											icon: "trash",
											size: "xs",
											label: r("Remove {name}", { name: e }),
											onClick: () => q([
												"color",
												"palettes",
												e
											], void 0)
										})]
									}, e)),
									/* @__PURE__ */ x(u, {
										size: "sm",
										variant: "ghost",
										icon: "plus",
										onClick: async () => {
											let e = await v({
												title: r("New Brand Color"),
												description: r("A palette like the others: blocks can use {name}, on-{name}, {name}-soft and {name}-text."),
												fields: [{
													handle: "name",
													type: "text",
													label: r("Name"),
													mono: !0,
													autofocus: !0,
													placeholder: "lime"
												}],
												confirm: r("Add")
											}), t = String(e?.name ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
											if (t && /^[a-z]/.test(t)) {
												if (X.includes(t)) return void y.error(r("“{name}” already exists", { name: t }));
												q([
													"color",
													"palettes",
													t
												], "#7c3aed");
											}
										},
										children: r("Add a Brand Color")
									})
								]
							}),
							/* @__PURE__ */ x(k, {
								title: r("Status"),
								children: ce.map((e) => /* @__PURE__ */ x(A, {
									label: e,
									children: /* @__PURE__ */ x(j, {
										value: J(["color", e]),
										placeholder: r("Default"),
										onChange: (t) => q(["color", e], t)
									})
								}, e))
							}),
							/* @__PURE__ */ S(k, {
								title: r("Modes"),
								help: r("The page’s background and text in each mode. Every other color of a scheme is mixed from these two, with its contrast kept."),
								children: [
									/* @__PURE__ */ x(A, {
										label: r("Light Background"),
										children: Q([
											"color",
											"light",
											"background"
										], {
											type: "select",
											label: r("Light Background"),
											options: D(["white", ...Z]),
											placeholder: "neutral-50"
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Light Text"),
										children: Q([
											"color",
											"light",
											"foreground"
										], {
											type: "select",
											label: r("Light Text"),
											options: D(["black", ...Z]),
											placeholder: "neutral-950"
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Dark Mode"),
										children: /* @__PURE__ */ x(g, {
											size: "xs",
											value: J(["color", "dark"]) === !1 ? "off" : "on",
											onChange: (e) => q(["color", "dark"], e !== "off" && void 0),
											options: [{
												value: "on",
												label: r("On")
											}, {
												value: "off",
												label: r("Off")
											}]
										})
									}),
									J(["color", "dark"]) !== !1 && /* @__PURE__ */ S(b, { children: [/* @__PURE__ */ x(A, {
										label: r("Dark Background"),
										children: Q([
											"color",
											"dark",
											"background"
										], {
											type: "select",
											label: r("Dark Background"),
											options: D(["black", ...Z]),
											placeholder: "neutral-950"
										})
									}), /* @__PURE__ */ x(A, {
										label: r("Dark Text"),
										children: Q([
											"color",
											"dark",
											"foreground"
										], {
											type: "select",
											label: r("Dark Text"),
											options: D(["white", ...Z]),
											placeholder: "neutral-50"
										})
									})] })
								]
							}),
							/* @__PURE__ */ x(k, {
								title: r("Palettes"),
								children: X.map((e) => {
									let t = G.palettes[e];
									return /* @__PURE__ */ S("div", {
										className: "border-b border-border py-2",
										children: [
											/* @__PURE__ */ S("div", {
												className: "mb-1 flex items-center justify-between text-xs",
												children: [/* @__PURE__ */ x("span", {
													className: "font-medium text-ink",
													children: e
												}), /* @__PURE__ */ x("span", {
													className: "rounded-full px-2 py-0.5 text-2xs font-medium",
													style: {
														background: t.fill,
														color: t.on
													},
													children: r("Text on {name}", { name: e })
												})]
											}),
											/* @__PURE__ */ x("div", {
												className: "grid grid-cols-11 overflow-hidden rounded-sm",
												children: T.map((n) => /* @__PURE__ */ x("span", {
													title: `${e}-${n} ${t.shades[n]}`,
													className: "h-6",
													style: { background: t.shades[n] }
												}, n))
											}),
											t.fill !== t.seed && /* @__PURE__ */ x("p", {
												className: "m-0 mt-1 text-2xs text-faint",
												children: r("Its fill is {fill}, a little {way} than {seed}, so text on it is readable.", {
													fill: t.fill,
													seed: t.seed,
													way: F(t.fill) < F(t.seed) ? r("darker") : r("lighter")
												})
											})
										]
									}, e);
								})
							})
						] }),
						I === "type" && /* @__PURE__ */ S(b, { children: [
							/* @__PURE__ */ S(k, {
								title: r("Families"),
								help: r("Five slots every theme has. Upload or import a font below, then put it in a slot."),
								children: [
									le.map((e) => /* @__PURE__ */ S(A, {
										label: e,
										children: [Q(["font", e], {
											type: "select",
											label: e,
											options: D(Oe),
											placeholder: r(e === "display" ? "Same as sans" : e === "condensed" ? "Same as display" : "System")
										}), /* @__PURE__ */ x("span", {
											className: "w-20 shrink-0 truncate text-right text-sm text-ink",
											style: { fontFamily: G.families[e] },
											children: "Ag"
										})]
									}, e)),
									/* @__PURE__ */ x(A, {
										label: r("Body"),
										children: Q(["font", "body"], {
											type: "select",
											label: r("Body"),
											options: D(Object.keys(G.families)),
											placeholder: "sans"
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Headings"),
										children: Q(["font", "heading"], {
											type: "select",
											label: r("Headings"),
											options: D(Object.keys(G.families)),
											placeholder: "display"
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Code"),
										children: Q(["font", "code"], {
											type: "select",
											label: r("Code"),
											options: D(Object.keys(G.families)),
											placeholder: "mono"
										})
									})
								]
							}),
							/* @__PURE__ */ x(ge, {
								faces: W.font?.faces ?? [],
								onChanged: () => {
									s.refetch(), U.current?.contentWindow?.location.reload();
								},
								onRemove: (e) => q(["font", "faces"], (W.font?.faces ?? []).filter((t) => t.family !== e))
							}),
							/* @__PURE__ */ S(k, {
								title: r("Scale"),
								help: r("Body size and the ratio between steps, at a narrow and a wide screen. Headings grow more than body text as the screen widens."),
								children: [
									/* @__PURE__ */ x(A, {
										label: r("Body Size"),
										children: $(["type", "base"], [16, 18], "px")
									}),
									/* @__PURE__ */ x(A, {
										label: r("Ratio"),
										children: $(["type", "ratio"], [1.2, 1.25], "", .01)
									}),
									/* @__PURE__ */ x(A, {
										label: r("Body Leading"),
										children: /* @__PURE__ */ x(M, {
											value: J([
												"type",
												"leading",
												"body"
											]) ?? 1.5,
											step: .05,
											label: r("Body Leading"),
											onChange: (e) => q([
												"type",
												"leading",
												"body"
											], e)
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Display Leading"),
										children: /* @__PURE__ */ x(M, {
											value: J([
												"type",
												"leading",
												"display"
											]) ?? 1,
											step: .05,
											label: r("Display Leading"),
											onChange: (e) => q([
												"type",
												"leading",
												"display"
											], e)
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Display Tracking"),
										children: /* @__PURE__ */ x(M, {
											value: J([
												"type",
												"tracking",
												"display"
											]) ?? -.035,
											step: .005,
											unit: "em",
											label: r("Display Tracking"),
											onChange: (e) => q([
												"type",
												"tracking",
												"display"
											], e)
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Heading Weight"),
										children: Q(["type", "weight"], {
											type: "select",
											label: r("Heading Weight"),
											options: D(Object.keys(G.weights)),
											placeholder: "semibold"
										})
									})
								]
							}),
							/* @__PURE__ */ S(k, {
								title: r("Text Styles"),
								help: r("Size, family, weight, leading, tracking and case under one name. Blocks pick a text style first."),
								children: [Object.entries(G.textStyles).map(([e, t]) => /* @__PURE__ */ x(me, {
									name: e,
									style: t,
									resolved: G,
									custom: !(s.data.catalog.collections.textStyles ?? []).includes(e) || !s.data.catalog.descriptions.textStyles[e],
									own: J([
										"type",
										"styles",
										e
									]) ?? {},
									onChange: (t) => q([
										"type",
										"styles",
										e
									], t && Object.keys(t).length ? t : void 0),
									scales: s.data.catalog.scales
								}, e)), /* @__PURE__ */ x(u, {
									size: "sm",
									variant: "ghost",
									icon: "plus",
									onClick: async () => {
										let e = await v({
											title: r("New Text Style"),
											fields: [{
												handle: "name",
												type: "text",
												label: r("Name"),
												mono: !0,
												autofocus: !0,
												placeholder: "price"
											}],
											confirm: r("Add")
										}), t = String(e?.name ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
										t && /^[a-z]/.test(t) && !G.textStyles[t] && q([
											"type",
											"styles",
											t
										], {
											font: "body",
											size: "xl",
											weight: "medium"
										});
									},
									children: r("Add a Text Style")
								})]
							})
						] }),
						I === "space" && /* @__PURE__ */ S(b, { children: [
							/* @__PURE__ */ S(k, {
								title: r("Space"),
								help: r("The md step at a narrow and a wide screen. Every step is a multiple of it; large steps shrink more on phones."),
								children: [/* @__PURE__ */ x(A, {
									label: r("md"),
									children: $(["space", "base"], [16, 20], "px")
								}), w.slice(1).map((e) => /* @__PURE__ */ S("div", {
									className: "flex h-6 items-center gap-2 text-2xs",
									children: [
										/* @__PURE__ */ x("span", {
											className: "w-10 font-mono text-muted",
											children: e
										}),
										/* @__PURE__ */ x("span", {
											className: "h-1.5 rounded-full bg-focus/60",
											style: { width: Math.min(260, G.space[e]?.max ?? 0) }
										}),
										/* @__PURE__ */ S("span", {
											className: "ml-auto font-mono text-faint",
											children: [
												Math.round(G.space[e]?.min ?? 0),
												"–",
												Math.round(G.space[e]?.max ?? 0),
												"px"
											]
										})
									]
								}, e))]
							}),
							/* @__PURE__ */ x(k, {
								title: r("Roles"),
								children: [
									"gutter",
									"section",
									"section-sm",
									"section-lg"
								].map((e) => /* @__PURE__ */ x(A, {
									label: e,
									children: Q(["layout", e], {
										type: "select",
										label: e,
										options: D(w),
										placeholder: {
											gutter: "xl",
											section: "4xl",
											"section-sm": "3xl",
											"section-lg": "5xl"
										}[e]
									})
								}, e))
							}),
							/* @__PURE__ */ S(k, {
								title: r("Flow"),
								help: r("The space between a container’s children, set once here. Prose is the rhythm of long text: more before headings, less after."),
								children: [[
									"tight",
									"normal",
									"loose"
								].map((e) => /* @__PURE__ */ x(A, {
									label: e,
									children: Q(["flow", e], {
										type: "select",
										label: e,
										options: D(w),
										placeholder: {
											tight: "sm",
											normal: "md",
											loose: "xl"
										}[e]
									})
								}, e)), [
									[
										"gap",
										r("Prose: Between"),
										"md"
									],
									[
										"before",
										r("Prose: Before Headings"),
										"2xl"
									],
									[
										"after",
										r("Prose: After Headings"),
										"xs"
									],
									[
										"media",
										r("Prose: Around Media"),
										"xl"
									]
								].map(([e, t, n]) => /* @__PURE__ */ x(A, {
									label: t,
									children: Q([
										"flow",
										"prose",
										e
									], {
										type: "select",
										label: t,
										options: D(w),
										placeholder: n
									})
								}, e))]
							}),
							/* @__PURE__ */ S(k, {
								title: r("Containers"),
								help: r("Widths in rem."),
								children: [[
									["narrow", 40],
									["text", 46],
									["content", 72],
									["wide", 90]
								].map(([e, t]) => /* @__PURE__ */ x(A, {
									label: String(e),
									children: /* @__PURE__ */ x(M, {
										value: J([
											"layout",
											"containers",
											String(e)
										]) ?? t,
										step: 1,
										unit: "rem",
										label: String(e),
										onChange: (t) => q([
											"layout",
											"containers",
											String(e)
										], t)
									})
								}, e)), /* @__PURE__ */ x(A, {
									label: r("Screens"),
									children: $(["layout", "viewport"], [360, 1440], "px")
								})]
							})
						] }),
						I === "shape" && /* @__PURE__ */ S(b, { children: [
							/* @__PURE__ */ S(k, {
								title: r("Shape"),
								children: [
									/* @__PURE__ */ x(A, {
										label: r("Radius"),
										children: /* @__PURE__ */ x(M, {
											value: J(["radius"]) ?? 8,
											step: 1,
											unit: "px",
											label: r("Radius"),
											onChange: (e) => q(["radius"], e)
										})
									}),
									/* @__PURE__ */ x("div", {
										className: "flex gap-2 py-2",
										children: Object.entries(G.radii).filter(([e]) => e !== "none").map(([e, t]) => /* @__PURE__ */ x("span", {
											title: `${e} ${t}`,
											className: "size-7 border-l-2 border-t-2 border-muted",
											style: { borderTopLeftRadius: t === "9999px" ? "14px" : t }
										}, e))
									}),
									/* @__PURE__ */ x(A, {
										label: r("Shadow Depth"),
										children: /* @__PURE__ */ x(M, {
											value: J(["shadow", "strength"]) ?? 1,
											step: .1,
											label: r("Shadow Depth"),
											onChange: (e) => q(["shadow", "strength"], e)
										})
									})
								]
							}),
							/* @__PURE__ */ S(k, {
								title: r("Buttons"),
								children: [
									/* @__PURE__ */ x(A, {
										label: r("Radius"),
										children: Q([
											"recipes",
											"button",
											"radius"
										], {
											type: "select",
											label: r("Radius"),
											options: D(Object.keys(G.radii)),
											placeholder: "md"
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Text Style"),
										children: Q([
											"recipes",
											"button",
											"text"
										], {
											type: "select",
											label: r("Text Style"),
											options: D(Object.keys(G.textStyles)),
											placeholder: "label"
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Weight"),
										children: Q([
											"recipes",
											"button",
											"weight"
										], {
											type: "select",
											label: r("Weight"),
											options: D(Object.keys(G.weights)),
											placeholder: "medium"
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Case"),
										children: Q([
											"recipes",
											"button",
											"case"
										], {
											type: "select",
											label: r("Case"),
											options: D([
												"none",
												"uppercase",
												"lowercase",
												"capitalize"
											]),
											placeholder: "none"
										})
									})
								]
							}),
							/* @__PURE__ */ S(k, {
								title: r("Cards"),
								children: [
									/* @__PURE__ */ x(A, {
										label: r("Radius"),
										children: Q([
											"recipes",
											"card",
											"radius"
										], {
											type: "select",
											label: r("Radius"),
											options: D(Object.keys(G.radii)),
											placeholder: "lg"
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Padding"),
										children: Q([
											"recipes",
											"card",
											"padding"
										], {
											type: "select",
											label: r("Padding"),
											options: D(w),
											placeholder: "lg"
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Shadow"),
										children: Q([
											"recipes",
											"card",
											"shadow"
										], {
											type: "select",
											label: r("Shadow"),
											options: D([
												"none",
												"xs",
												"sm",
												"md",
												"lg",
												"xl",
												"2xl"
											]),
											placeholder: "none"
										})
									}),
									/* @__PURE__ */ x(A, {
										label: r("Border"),
										children: /* @__PURE__ */ x(g, {
											size: "xs",
											value: J([
												"recipes",
												"card",
												"border"
											]) === !1 ? "off" : "on",
											onChange: (e) => q([
												"recipes",
												"card",
												"border"
											], e !== "off" && void 0),
											options: [{
												value: "on",
												label: r("On")
											}, {
												value: "off",
												label: r("Off")
											}]
										})
									})
								]
							}),
							/* @__PURE__ */ x(k, {
								title: r("Fields"),
								children: /* @__PURE__ */ x(A, {
									label: r("Radius"),
									children: Q([
										"recipes",
										"field",
										"radius"
									], {
										type: "select",
										label: r("Radius"),
										options: D(Object.keys(G.radii)),
										placeholder: "md"
									})
								})
							})
						] }),
						I === "motion" && /* @__PURE__ */ S(k, {
							title: r("Motion"),
							help: r("Speed multiplies every duration: below 1 is snappier, above 1 calmer. Animations and transitions in blocks use these durations."),
							children: [
								/* @__PURE__ */ x(A, {
									label: r("Speed"),
									children: /* @__PURE__ */ x(M, {
										value: J(["motion", "speed"]) ?? 1,
										step: .05,
										label: r("Speed"),
										onChange: (e) => q(["motion", "speed"], e)
									})
								}),
								/* @__PURE__ */ x(A, {
									label: r("Between Pages"),
									children: Q(["motion", "page"], {
										type: "select",
										label: r("Between Pages"),
										options: D([
											"none",
											"fade",
											"slide",
											"scale"
										], {
											none: r("None"),
											fade: r("Fade"),
											slide: r("Slide"),
											scale: r("Scale")
										}),
										placeholder: r("None")
									})
								}),
								Object.entries(G.durations).map(([e, t]) => /* @__PURE__ */ S("div", {
									className: "group flex h-6 items-center gap-2 text-2xs",
									children: [
										/* @__PURE__ */ x("span", {
											className: "w-14 font-mono text-muted",
											children: e
										}),
										/* @__PURE__ */ x("span", {
											className: "relative h-2 flex-1",
											children: /* @__PURE__ */ x("span", {
												className: "absolute left-0 top-0 size-2 rounded-full bg-focus/70 transition-transform group-hover:translate-x-40",
												style: { transitionDuration: `${t}ms` }
											})
										}),
										/* @__PURE__ */ S("span", {
											className: "font-mono text-faint",
											children: [t, "ms"]
										})
									]
								}, e))
							]
						}),
						I === "elements" && /* @__PURE__ */ x(he, {
							value: J(["elements"]) ?? {},
							onChange: (e) => q(["elements"], Object.keys(e).length ? e : void 0)
						}),
						I === "agents" && /* @__PURE__ */ S(b, { children: [/* @__PURE__ */ S(k, {
							title: r("Contrast"),
							help: r("Every text and border color of every scheme, measured. Fix a miss by choosing other anchors or seeds."),
							children: [K.length === 0 && /* @__PURE__ */ x("p", {
								className: "m-0 py-3 text-xs text-success",
								children: r("Every role passes in every scheme.")
							}), K.map((e, t) => /* @__PURE__ */ S("p", {
								className: ae("m-0 border-b border-border py-1.5 text-xs", e.level === "error" ? "text-danger" : "text-muted"),
								children: [
									/* @__PURE__ */ x("span", {
										className: "font-medium",
										children: e.scheme
									}),
									" · ",
									e.pair,
									": ",
									e.ratio,
									":1 ",
									/* @__PURE__ */ S("span", {
										className: "text-faint",
										children: [
											"(",
											r("needs {n}:1", { n: e.needs }),
											")"
										]
									})
								]
							}, t))]
						}), /* @__PURE__ */ x(k, {
							title: r("DESIGN.md"),
							help: r("The theme as the assistant and MCP clients read it (cms://site/design). It updates when you save."),
							children: /* @__PURE__ */ x("pre", {
								className: "max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-md bg-sunken p-3 font-mono text-2xs leading-relaxed text-text",
								children: s.data.design
							})
						})] }),
						I === "code" && /* @__PURE__ */ x(k, {
							title: r("Custom JavaScript"),
							help: r("An ES module on every page, for scripts and Alpine components. Anything visual belongs in the theme instead."),
							children: e("site.code") ? /* @__PURE__ */ x(f, {
								bare: !0,
								fields: [{
									handle: "js",
									type: "code",
									language: "javascript",
									label: r("custom.js"),
									rows: 18
								}],
								values: { js: N ?? s.data.js ?? "" },
								onChange: (e, t) => P(t ?? "")
							}) : /* @__PURE__ */ x("p", {
								className: "m-0 py-3 text-xs text-faint",
								children: r("Only people who may edit code can change this.")
							})
						})
					]
				}, I), /* @__PURE__ */ S("div", {
					className: "flex min-w-0 flex-col bg-sunken max-md:hidden",
					children: [/* @__PURE__ */ S("div", {
						className: "flex h-10 shrink-0 items-center gap-2 border-b border-border bg-bg px-3",
						children: [
							/* @__PURE__ */ x(g, {
								size: "xs",
								value: z,
								onChange: ve,
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
							z !== "desktop" && /* @__PURE__ */ x("span", {
								className: "font-mono text-2xs text-faint",
								children: ue[z]
							}),
							/* @__PURE__ */ x("span", { className: "flex-1" }),
							J(["color", "dark"]) !== !1 && /* @__PURE__ */ x(g, {
								size: "xs",
								value: R,
								onChange: _e,
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
					}), /* @__PURE__ */ x(pe, {
						viewport: z,
						children: (e) => /* @__PURE__ */ x("iframe", {
							ref: U,
							src: "/",
							title: r("Site Preview"),
							className: ae("border-0 bg-bg", z !== "desktop" && "border-x border-border"),
							style: e,
							onLoad: Ee
						})
					})]
				})]
			})
		]
	});
}
function pe({ viewport: e, children: t }) {
	let n = c(null), [r, i] = l({
		width: 0,
		height: 0
	});
	o(() => {
		let e = n.current;
		if (!e) return;
		let t = () => i({
			width: e.clientWidth,
			height: e.clientHeight
		});
		t();
		let r = new ResizeObserver(t);
		return r.observe(e), () => r.disconnect();
	}, []);
	let a = e === "desktop" ? Math.max(r.width, 1024) : parseFloat(ue[e]), s = r.width ? Math.min(1, r.width / a) : 1;
	return /* @__PURE__ */ x("div", {
		ref: n,
		className: "relative min-h-0 flex-1 overflow-hidden",
		children: r.width > 0 && t({
			position: "absolute",
			top: 0,
			left: Math.max(0, (r.width - a * s) / 2),
			width: a,
			height: r.height / s,
			transform: s < 1 ? `scale(${s})` : void 0,
			transformOrigin: "top left"
		})
	});
}
function k({ title: e, help: t, children: n }) {
	return /* @__PURE__ */ S("section", {
		className: "mb-6",
		children: [/* @__PURE__ */ S("div", {
			className: "border-b border-border pb-1.5 pt-3",
			children: [/* @__PURE__ */ x("h3", {
				className: "m-0 text-xs font-semibold text-ink",
				children: e
			}), t && /* @__PURE__ */ x("p", {
				className: "m-0 mt-0.5 text-2xs leading-snug text-faint",
				children: t
			})]
		}), /* @__PURE__ */ x("div", {
			className: "pt-1",
			children: n
		})]
	});
}
function A({ label: e, children: t }) {
	return /* @__PURE__ */ S("div", {
		className: "flex min-h-9 items-center gap-2 border-b border-border/60 py-1",
		children: [/* @__PURE__ */ x("span", {
			className: "w-32 shrink-0 truncate text-xs text-muted",
			children: e
		}), /* @__PURE__ */ x("div", {
			className: "flex min-w-0 flex-1 items-center gap-1.5",
			children: t
		})]
	});
}
function j({ value: e, placeholder: t, onChange: n }) {
	let [i, a] = l(e ?? "");
	o(() => a(e ?? ""), [e]);
	let s = (e) => /^#[0-9a-f]{6}$/i.test(e) || /^oklch\(.+\)$/i.test(e);
	return /* @__PURE__ */ S("div", {
		className: "flex min-w-0 flex-1 items-center gap-1.5",
		children: [/* @__PURE__ */ x("label", {
			className: "relative size-7 shrink-0 overflow-hidden rounded-sm border border-border-strong",
			style: { background: e ?? "repeating-conic-gradient(var(--cms-sunken) 0 25%, var(--cms-bg) 0 50%) 0 0/8px 8px" },
			children: /* @__PURE__ */ x("input", {
				type: "color",
				value: e && /^#/.test(e) ? e : "#000000",
				onChange: (e) => n(e.target.value),
				className: "absolute inset-0 cursor-pointer opacity-0",
				"aria-label": r("Pick a Color")
			})
		}), /* @__PURE__ */ x("input", {
			value: i,
			placeholder: t,
			onChange: (e) => {
				a(e.target.value), s(e.target.value.trim()) && n(e.target.value.trim());
			},
			onBlur: () => {
				i.trim() ? s(i.trim()) || a(e ?? "") : n(void 0);
			},
			className: "h-7 min-w-0 flex-1 rounded-sm bg-active/60 px-2 font-mono text-xs outline-none placeholder:text-faint focus:bg-active"
		})]
	});
}
function M({ value: e, step: t, unit: n, label: r, onChange: i }) {
	return /* @__PURE__ */ S("label", {
		className: "flex h-7 min-w-0 flex-1 items-center gap-1 rounded-sm bg-active/60 px-2 text-xs focus-within:bg-active",
		children: [/* @__PURE__ */ x("input", {
			type: "number",
			"aria-label": r,
			value: e,
			step: t,
			onChange: (e) => e.target.value !== "" && i(Number(e.target.value)),
			className: "min-w-0 flex-1 bg-transparent font-mono tabular-nums outline-none"
		}), n && /* @__PURE__ */ x("span", {
			className: "text-2xs text-faint",
			children: n
		})]
	});
}
function me({ name: e, style: t, resolved: n, custom: i, own: a, onChange: o, scales: s }) {
	let [c, d] = l(!1), p = n.sizes[t.size], m = (e, t) => o({
		...a,
		...t ? { [e]: t } : {},
		...t ? {} : { [e]: void 0 }
	}), h = (e, t, n, r) => /* @__PURE__ */ x(f, {
		bare: !0,
		className: "min-w-0 flex-1",
		fields: [{
			handle: e,
			type: "select",
			size: "sm",
			label: t,
			options: D(n),
			placeholder: r
		}],
		values: { [e]: a[e] },
		onChange: (t, n) => m(e, n)
	});
	return /* @__PURE__ */ S("div", {
		className: "border-b border-border py-2",
		children: [/* @__PURE__ */ S("button", {
			type: "button",
			onClick: () => d(!c),
			className: "flex w-full items-baseline gap-3 text-left",
			children: [
				/* @__PURE__ */ x("span", {
					className: "w-24 shrink-0 truncate font-mono text-2xs text-muted",
					children: e
				}),
				/* @__PURE__ */ x("span", {
					className: "min-w-0 flex-1 truncate text-ink",
					style: {
						fontFamily: n.families[t.font],
						fontWeight: n.weights[t.weight],
						fontSize: Math.min(36, p?.max ?? 16),
						textTransform: t.case,
						fontStyle: t.style,
						lineHeight: 1.15
					},
					children: r("The quick brown fox")
				}),
				/* @__PURE__ */ S("span", {
					className: "shrink-0 font-mono text-2xs text-faint",
					children: [
						Math.round(p?.min ?? 0),
						"–",
						Math.round(p?.max ?? 0),
						"px"
					]
				})
			]
		}), c && /* @__PURE__ */ S("div", {
			className: "mt-2 grid grid-cols-2 gap-1.5",
			children: [
				h("font", r("Font"), [
					"body",
					"heading",
					"code",
					...Object.keys(n.families)
				], t.font),
				h("size", r("Size"), s.sizes, t.size),
				h("weight", r("Weight"), Object.keys(n.weights), t.weight),
				h("leading", r("Line Height"), Object.keys(s.leadings), t.leading || r("From size")),
				h("tracking", r("Letter Spacing"), Object.keys(s.trackings), t.tracking || r("From size")),
				h("case", r("Case"), [
					"none",
					"uppercase",
					"lowercase",
					"capitalize"
				], t.case),
				i && /* @__PURE__ */ x(u, {
					size: "sm",
					variant: "ghost",
					icon: "trash",
					onClick: () => o(void 0),
					children: r("Remove")
				})
			]
		})]
	});
}
function he({ value: e, onChange: t }) {
	let n = [
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"p",
		"a",
		"small",
		"strong",
		"em",
		"blockquote",
		"code",
		"ul",
		"ol",
		"li",
		"hr",
		"figcaption",
		"table",
		"th",
		"td",
		"label",
		"h1 em",
		"h2 em"
	], [i, a] = l(null);
	return /* @__PURE__ */ S(k, {
		title: r("Elements"),
		help: r("How plain HTML elements look before any block style: a text style for headings, a color for links. Values are names of the vocabulary."),
		children: [Object.entries(e).map(([n, o]) => /* @__PURE__ */ S("div", {
			className: "border-b border-border py-2",
			children: [/* @__PURE__ */ S("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ x("button", {
						type: "button",
						onClick: () => a(i === n ? null : n),
						className: "min-w-0 flex-1 truncate text-left font-mono text-xs text-ink",
						children: n
					}),
					/* @__PURE__ */ x("span", {
						className: "truncate text-2xs text-faint",
						children: Object.keys(N(o)).join(", ")
					}),
					/* @__PURE__ */ x(p, {
						icon: "trash",
						size: "xs",
						label: r("Remove {name}", { name: n }),
						onClick: () => {
							let { [n]: r, ...i } = e;
							t(i);
						}
					})
				]
			}), i === n && /* @__PURE__ */ x(P, {
				style: N(o),
				onChange: (r) => t({
					...e,
					[n]: r
				})
			})]
		}, n)), /* @__PURE__ */ x(m, {
			trigger: /* @__PURE__ */ x(u, {
				size: "sm",
				variant: "ghost",
				icon: "plus",
				children: r("Style an Element")
			}),
			items: n.filter((t) => !e[t]).map((n) => ({
				label: n,
				onSelect: () => {
					t({
						...e,
						[n]: {}
					}), a(n);
				}
			}))
		})]
	});
}
var N = (e) => Object.fromEntries(Object.entries(e ?? {}).filter(([, e]) => typeof e == "string"));
function P({ style: e, onChange: t }) {
	let n = [
		"text",
		"color",
		"fontFamily",
		"fontWeight",
		"fontStyle",
		"textTransform",
		"textDecorationLine",
		"textDecorationColor",
		"textUnderlineOffset",
		"letterSpacing",
		"lineHeight",
		"backgroundColor",
		"paddingBlock",
		"paddingInline",
		"borderRadius",
		"borderWidth",
		"borderColor",
		"listStyleType"
	], i = (e) => /color/i.test(e) ? {
		handle: e,
		type: "color",
		component: "blocks-color",
		label: e
	} : {
		handle: e,
		type: "text",
		component: "blocks-token",
		label: e
	};
	return /* @__PURE__ */ S("div", {
		className: "mt-2 space-y-1",
		children: [Object.keys(e).map((n) => /* @__PURE__ */ S("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ x("span", {
				className: "w-28 shrink-0 truncate font-mono text-2xs text-muted",
				children: n
			}), /* @__PURE__ */ x(f, {
				bare: !0,
				className: "min-w-0 flex-1",
				fields: [i(n)],
				values: e,
				onChange: (r, i) => {
					let a = { ...e };
					i ? a[n] = i : delete a[n], t(a);
				}
			})]
		}, n)), /* @__PURE__ */ x(m, {
			trigger: /* @__PURE__ */ x(u, {
				size: "xs",
				variant: "ghost",
				icon: "plus",
				children: r("Add a Property")
			}),
			items: n.filter((t) => !(t in e)).map((n) => ({
				label: n,
				onSelect: () => t({
					...e,
					[n]: n === "text" ? "body" : /color/i.test(n) ? "foreground" : ""
				})
			}))
		})]
	});
}
function ge({ faces: e, onChanged: t, onRemove: i }) {
	let [a, o] = l(""), [c, d] = l(!1), m = s(() => [...new Set(e.map((e) => e.family))], [e]), h = async () => {
		let e = a.trim();
		if (e) {
			d(!0);
			try {
				await n("design/fonts-import", { family: e }), y.success(r("{family} added: put it in a slot above", { family: e })), o(""), t();
			} catch (e) {
				y.error(e);
			} finally {
				d(!1);
			}
		}
	}, ee = async (e) => {
		let i = await new Promise((t) => {
			let n = new FileReader();
			n.onload = () => t(String(n.result)), n.readAsDataURL(e);
		}), a = e.name.replace(/\.woff2$/i, ""), o = await v({
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
				data: i,
				weight: /variable/i.test(a) ? "100 900" : "400",
				style: /italic/i.test(a) ? "italic" : "normal"
			}), y.success(r("{family} uploaded", { family: s })), t();
		} catch (e) {
			y.error(e);
		}
	};
	return /* @__PURE__ */ S(k, {
		title: r("Font Files"),
		help: r("Served from this site: visitors never connect to Google."),
		children: [
			m.length === 0 && /* @__PURE__ */ x("p", {
				className: "m-0 py-3 text-xs text-faint",
				children: r("None yet. The site uses system fonts.")
			}),
			m.map((t) => /* @__PURE__ */ S("div", {
				className: "flex items-center gap-3 border-b border-border py-2",
				children: [
					/* @__PURE__ */ x("span", {
						className: "grid size-9 shrink-0 place-items-center rounded-sm bg-sunken text-lg text-ink",
						style: { fontFamily: `"${t}"` },
						children: "Aa"
					}),
					/* @__PURE__ */ S("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ x("p", {
							className: "m-0 truncate text-sm text-ink",
							style: { fontFamily: `"${t}"` },
							children: t
						}), /* @__PURE__ */ x("p", {
							className: "m-0 truncate text-2xs text-faint",
							children: e.filter((e) => e.family === t).map((e) => `${e.weight ?? "400"}${e.style === "italic" ? " italic" : ""}`).join(" · ")
						})]
					}),
					/* @__PURE__ */ x(p, {
						icon: "trash",
						size: "xs",
						label: r("Remove {family}", { family: t }),
						onClick: async () => {
							await _({
								title: r("Remove {family}?", { family: t }),
								description: r("Slots that use it fall back to the system font."),
								confirm: r("Remove"),
								danger: !0
							}) && i(t);
						}
					})
				]
			}, t)),
			/* @__PURE__ */ S("form", {
				className: "flex items-center gap-2 py-2.5",
				onSubmit: (e) => {
					e.preventDefault(), h();
				},
				children: [/* @__PURE__ */ x(f, {
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
				}), /* @__PURE__ */ x(u, {
					type: "submit",
					size: "sm",
					loading: c,
					disabled: !a.trim(),
					children: r("Add")
				})]
			}),
			/* @__PURE__ */ x(f, {
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
	let t = parseInt(e.slice(1), 16), n = [
		t >> 16 & 255,
		t >> 8 & 255,
		t & 255
	].map((e) => e / 255).map((e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4);
	return .2126 * n[0] + .7152 * n[1] + .0722 * n[2];
}
export { O as default };
