import { can as e, isActive as t, queryClient as n, run as r, t as i } from "@letterncms/sdk";
import { forwardRef as a, useState as o } from "react";
import { Button as s, Fields as c, Icon as l, IconButton as u, Popover as d, cn as f, fieldControlId as p } from "@letterncms/ui";
import { jsx as m, jsxs as h } from "react/jsx-runtime";
// admin/src/compile.ts
var g = !1, _ = !1;
async function v() {
	if (!t("letterncms/site") || !e("admin.access")) return;
	let { current: n } = await r("styling/get");
	if (n) return;
	let { compileStyling: i } = await import("@letterncms/blocks");
	for (let e = 0; e < 2; e++) {
		let e = await r("styling/source"), t = await i(e), { stored: n } = await r("styling/compiled", {
			signature: e.signature,
			css: t
		});
		if (n) return;
	}
}
function y() {
	g ? _ = !0 : (g = !0, v().catch((e) => console.error("[cms] The site’s stylesheet could not be compiled in the browser.", e)).finally(() => {
		g = !1, _ && (_ = !1, y());
	}));
}
var b = [
	"entries/",
	"content/",
	"styling/"
], x;
function S() {
	y(), n.getQueryCache().subscribe((e) => {
		if (e.type !== "updated" || e.action.type !== "invalidate") return;
		let t = e.query.queryKey[0];
		typeof t == "string" && b.some((e) => t.startsWith(e)) && (clearTimeout(x), x = setTimeout(y, 2e3));
	});
}
// admin/src/fields.tsx
var C = {
	sans: [
		"ui-sans-serif",
		"system-ui",
		"sans-serif"
	],
	serif: [
		"ui-serif",
		"Georgia",
		"serif"
	],
	mono: [
		"ui-monospace",
		"SF Mono",
		"Menlo",
		"monospace"
	]
}, w = /* @__PURE__ */ new Set([
	...Object.values(C).flat(),
	"-apple-system",
	"BlinkMacSystemFont",
	"Segoe UI",
	"Roboto",
	"Helvetica Neue",
	"Helvetica",
	"Arial",
	"Times New Roman",
	"Times",
	"Courier New",
	"Consolas",
	"Monaco",
	"cursive",
	"fantasy"
]);
function T(e) {
	return e.includes("monospace") ? "mono" : e.includes("serif") ? "serif" : "sans";
}
function E(e) {
	return String(e ?? "").split(",").map((e) => e.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}
function D(e) {
	return e.map((e) => /^[a-zA-Z][\w-]*$/.test(e) ? e : `"${e.replace(/"/g, "")}"`).join(", ");
}
function O(e) {
	return e[0] && !w.has(e[0]) && !e[0].endsWith(" Fallback") ? e[0] : "";
}
function k(e, t, n) {
	return D([...e ? [e, ...n ? [`${e} Fallback`] : []] : [], ...C[t]]);
}
function A({ field: e, value: t, onChange: n, disabled: r }) {
	let [a, c] = o(!1), f = E(t), g = O(f), _ = T(f), v = e.fonts ?? [], y = (e, t) => n(k(e, _, t)), b = async (t) => {
		c(!1);
		let n = await e.onAdd?.(t);
		n && y(n.family, n.fallback);
	}, x = (e, t, n, r, i) => /* @__PURE__ */ h("div", {
		className: "cms-reveal-row flex items-center gap-1 rounded-sm pr-1 hover:bg-hover",
		children: [/* @__PURE__ */ h(s, {
			variant: "ghost",
			onClick: () => {
				y(e, r), c(!1);
			},
			className: "!h-9 min-w-0 flex-1 shrink !justify-start !gap-2 !bg-transparent !pl-2 !pr-0 text-left !font-normal",
			children: [/* @__PURE__ */ m("span", {
				className: "min-w-0 flex-1 truncate text-base leading-tight text-ink",
				style: e ? { fontFamily: `"${e}"` } : void 0,
				children: t
			}), n && /* @__PURE__ */ m("span", {
				className: "shrink-0 text-2xs tabular-nums text-faint",
				children: n
			})]
		}), /* @__PURE__ */ m("span", {
			className: "grid w-6 shrink-0 place-items-center",
			children: e === g ? /* @__PURE__ */ m(l, {
				name: "check",
				size: 14,
				className: "text-ink"
			}) : i
		})]
	}, e || "system"), S = (e, t, n) => /* @__PURE__ */ h(s, {
		variant: "ghost",
		size: "md",
		onClick: n,
		className: "w-full !justify-start !gap-2 !rounded-sm !px-2 text-left !text-xs !font-normal",
		children: [/* @__PURE__ */ m(l, {
			name: e,
			size: 14,
			className: "shrink-0 text-faint"
		}), t]
	});
	return /* @__PURE__ */ h(d, {
		open: a,
		onOpenChange: c,
		align: "end",
		className: "w-72 !p-1.5",
		trigger: /* @__PURE__ */ h(s, {
			variant: "ghost",
			id: p(e),
			disabled: r,
			className: "cms-input w-full min-w-0 shrink !justify-start !gap-2 !pl-2 !pr-1.5 text-left !font-normal",
			children: [/* @__PURE__ */ m("span", {
				className: "min-w-0 flex-1 truncate",
				style: g ? { fontFamily: `"${g}"` } : void 0,
				children: g || i("System Font")
			}), /* @__PURE__ */ m(l, {
				name: "chevrons-up-down",
				size: 14,
				className: "shrink-0 text-faint"
			})]
		}),
		children: [/* @__PURE__ */ h("div", {
			className: "max-h-72 overflow-y-auto",
			children: [
				x("", i("System Font"), "", !1),
				g && !v.some((e) => e.family === g) && x(g, g, "", f.includes(`${g} Fallback`)),
				v.map((t) => x(t.family, t.family, t.styles, t.fallback, !t.used && e.onRemove ? /* @__PURE__ */ m(u, {
					icon: "trash",
					label: i("Remove {family}", { family: t.family }),
					size: "xs",
					className: "cms-reveal",
					onClick: () => e.onRemove(t.family)
				}) : void 0))
			]
		}), !!e.onAdd && /* @__PURE__ */ h("div", {
			className: "mt-1 border-t border-border pt-1",
			children: [S("search", i("Add a Google Font…"), () => void b("google")), S("upload", i("Upload a .woff2 File…"), () => void b("upload"))]
		})]
	});
}
var j = a(function({ label: e, children: t, className: n, ...r }, i) {
	return /* @__PURE__ */ h(s, {
		ref: i,
		variant: "ghost",
		"aria-label": e,
		...r,
		className: f("cms-input w-full min-w-0 shrink !justify-start !gap-1.5 !pl-2 !pr-1.5 text-left !font-normal data-[popup-open]:border-focus", n),
		children: [/* @__PURE__ */ m("span", {
			className: "min-w-0 flex-1 truncate",
			children: t
		}), /* @__PURE__ */ m(l, {
			name: "chevrons-up-down",
			size: 11,
			className: "shrink-0 text-faint"
		})]
	});
}), M = {
	handle: "shadow",
	type: "text",
	component: "blocks-shadows",
	label: "Shadow"
}, N = () => [
	{
		label: i("None"),
		value: "none"
	},
	{
		label: i("Small"),
		value: "0 1px 2px rgb(0 0 0 / 0.06)"
	},
	{
		label: i("Medium"),
		value: "0 4px 16px -4px rgb(0 0 0 / 0.12)"
	},
	{
		label: i("Large"),
		value: "0 24px 48px -16px rgb(0 0 0 / 0.2)"
	}
], P = ({ value: e }) => /* @__PURE__ */ m("span", {
	className: "size-3.5 shrink-0 rounded-xs border border-border bg-bg",
	style: { boxShadow: e ?? void 0 }
});
function F({ field: e, value: t, onChange: n, disabled: r }) {
	let a = N().find((e) => e.value === t?.replace(/\s+/g, " ").trim());
	return /* @__PURE__ */ h(d, {
		align: "start",
		className: "w-72 p-1",
		trigger: /* @__PURE__ */ m(j, {
			id: p(e),
			disabled: r,
			label: e.label,
			children: a?.label ?? i("Custom||shadow")
		}),
		children: [/* @__PURE__ */ m("div", {
			className: "space-y-px",
			children: N().map((e) => /* @__PURE__ */ h(s, {
				variant: "ghost",
				onClick: () => n(e.value),
				"data-active": e.value === a?.value || void 0,
				className: "w-full !justify-start !gap-2 !rounded-xs !px-2 text-left !text-xs !font-normal",
				children: [
					/* @__PURE__ */ m(P, { value: e.value }),
					/* @__PURE__ */ m("span", {
						className: "flex-1",
						children: e.label
					}),
					e.value === a?.value && /* @__PURE__ */ m(l, {
						name: "check",
						size: 12,
						className: "text-muted"
					})
				]
			}, e.value))
		}), /* @__PURE__ */ h("div", {
			className: "mt-1 border-t border-border px-1 pb-1 pt-2",
			children: [
				/* @__PURE__ */ m("p", {
					className: "m-0 mb-1 text-2xs font-medium text-muted",
					children: i("Custom||shadow")
				}),
				/* @__PURE__ */ m(c, {
					bare: !0,
					fields: [M],
					values: { shadow: t && t !== "none" ? t : "0 4px 16px 0 rgb(0 0 0 / 12%)" },
					onChange: (e, t) => n(t ?? "none")
				}),
				/* @__PURE__ */ h(s, {
					variant: "ghost",
					size: "xs",
					onClick: () => n(`${t && t !== "none" ? `${t}, ` : ""}0 2px 8px 0 rgb(0 0 0 / 10%)`),
					className: "mt-1.5 w-full !text-2xs !font-normal !text-muted hover:!text-text",
					children: [/* @__PURE__ */ m(l, {
						name: "plus",
						size: 11
					}), i("Add Layer")]
				})
			]
		})]
	});
}
export { E as a, S as c, O as i, F as n, k as o, T as r, y as s, A as t };
