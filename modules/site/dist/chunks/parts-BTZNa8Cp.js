import { t as e } from "@letterncms/sdk";
import { Button as t, Fields as n, Icon as r, IconButton as i, Menu as a, Tooltip as o, cn as s, copyText as c } from "@letterncms/ui";
import { jsx as l, jsxs as u } from "react/jsx-runtime";
// admin/src/parts.tsx
var d = "cms-reveal shrink-0", f = () => /* @__PURE__ */ l("span", { className: "size-6 shrink-0" });
function p({ title: e, onAdd: n, addLabel: r, action: a, children: s }) {
	return /* @__PURE__ */ u("section", {
		className: "mb-6",
		children: [
			e && /* @__PURE__ */ u("div", {
				className: "flex h-9 items-center justify-between border-b border-border",
				children: [
					/* @__PURE__ */ l("h3", {
						className: "m-0 text-xs font-semibold text-ink",
						children: e
					}),
					a,
					n && r && /* @__PURE__ */ l(o, {
						content: r,
						children: /* @__PURE__ */ l(i, {
							icon: "plus",
							label: r,
							title: void 0,
							size: "xs",
							onClick: n
						})
					})
				]
			}),
			s,
			!e && (a || n && r) && /* @__PURE__ */ l("div", {
				className: "flex h-9 items-center border-t border-border",
				children: a ?? /* @__PURE__ */ l(t, {
					variant: "ghost",
					size: "xs",
					icon: "plus",
					onClick: n,
					className: "-ml-1.5 !px-1.5 !font-normal !text-muted hover:!text-ink",
					children: r
				})
			})
		]
	});
}
function m({ handle: e, label: t, value: r, onChange: i, field: a, disabled: o, className: c }) {
	return /* @__PURE__ */ l(n, {
		bare: !0,
		className: s("flex min-w-0 flex-1", c),
		disabled: o,
		fields: [{
			handle: e,
			type: "text",
			label: t,
			size: "sm",
			mono: !0,
			...a
		}],
		values: { [e]: r ?? null },
		onChange: (e, t) => i(t == null || t === "" ? null : String(t))
	});
}
function h({ name: n, copy: r = n, sample: f, after: p, below: m, wide: h, menu: g, children: _ }) {
	return /* @__PURE__ */ u("div", {
		className: "cms-reveal-row group border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ u("div", {
			className: s("flex min-h-9 items-center gap-2 py-1", h && "max-sm:flex-wrap"),
			children: [
				f !== void 0 && /* @__PURE__ */ l("span", {
					className: "grid w-7 shrink-0 place-items-center",
					children: f
				}),
				/* @__PURE__ */ l(o, {
					content: e("Copy Name"),
					children: /* @__PURE__ */ l(t, {
						variant: "ghost",
						size: "xs",
						onClick: () => void c(r, { copied: e("Copied {reference}", { reference: r }) }),
						"aria-label": e("Copy {reference}", { reference: r }),
						className: s("!justify-start !bg-transparent !px-0 text-left font-mono !font-normal hover:text-ink", h ? "min-w-0 flex-1 shrink max-sm:order-1 max-sm:basis-[calc(100%-2.5rem)]" : f === void 0 ? "w-[120px] max-sm:w-20" : "w-[84px] max-sm:w-16"),
						children: /* @__PURE__ */ l("span", {
							className: "truncate",
							children: n
						})
					})
				}),
				h ? _ : /* @__PURE__ */ l("div", {
					className: "flex w-60 min-w-0 shrink gap-1 max-lg:w-52 max-sm:w-auto max-sm:flex-1",
					children: _
				}),
				!h && /* @__PURE__ */ l("span", {
					className: "flex min-w-0 flex-1 items-center max-sm:hidden",
					children: p
				}),
				g && g.length > 0 ? /* @__PURE__ */ l(a, {
					trigger: /* @__PURE__ */ l(i, {
						icon: "more",
						label: e("Actions"),
						size: "xs",
						className: s(d, h && "max-sm:order-2")
					}),
					items: g
				}) : /* @__PURE__ */ l("span", { className: s("size-6 shrink-0", h && "max-sm:order-2") })
			]
		}), m]
	});
}
function g({ label: e, action: t, children: n }) {
	return /* @__PURE__ */ u("div", {
		className: "cms-reveal-row flex min-h-9 items-center gap-2 border-b border-border py-1 last:border-b-0",
		children: [
			/* @__PURE__ */ l("span", {
				className: "w-[120px] shrink-0 truncate text-xs text-text max-sm:w-20",
				children: e
			}),
			/* @__PURE__ */ l("div", {
				className: "flex w-60 min-w-0 shrink items-center max-lg:w-52 max-sm:w-auto max-sm:flex-1",
				children: n
			}),
			/* @__PURE__ */ l("span", { className: "min-w-0 flex-1 max-sm:hidden" }),
			t ? /* @__PURE__ */ l("span", {
				className: d,
				children: t
			}) : /* @__PURE__ */ l(f, {})
		]
	});
}
function _({ open: e, onToggle: n, label: i, aside: a, menu: o, children: c }) {
	return /* @__PURE__ */ u("div", {
		className: "cms-reveal-row group border-b border-border last:border-b-0",
		children: [/* @__PURE__ */ u("div", {
			className: "flex min-h-10 items-center gap-2",
			children: [/* @__PURE__ */ u(t, {
				variant: "ghost",
				"aria-expanded": e,
				onClick: n,
				className: "!h-auto min-h-10 min-w-0 flex-1 shrink !justify-start !gap-1.5 !rounded-xs !bg-transparent !px-0 text-left !text-xs !font-normal focus-visible:!-outline-offset-2 hover:text-ink",
				children: [
					/* @__PURE__ */ l(r, {
						name: "chevron-right",
						size: 12,
						className: s("shrink-0 text-faint transition-transform duration-fast", e && "rotate-90")
					}),
					/* @__PURE__ */ l("span", {
						className: "min-w-0 flex-1 truncate",
						children: i
					}),
					a
				]
			}), o]
		}), e && /* @__PURE__ */ l("div", {
			className: "pb-3 pl-[18px]",
			children: c
		})]
	});
}
function v({ onOpen: e, label: n, sample: i, summary: a, menu: o }) {
	return /* @__PURE__ */ u("div", {
		className: "cms-reveal-row group flex min-h-10 items-center gap-2 border-b border-border py-1.5 last:border-b-0",
		children: [/* @__PURE__ */ u(t, {
			variant: "ghost",
			onClick: e,
			className: "!h-auto min-h-10 min-w-0 flex-1 shrink !justify-start !gap-2 !rounded-xs !bg-transparent !px-0 text-left !text-xs !font-normal focus-visible:!-outline-offset-2 hover:text-ink",
			children: [
				i,
				/* @__PURE__ */ l("span", {
					className: "shrink-0 text-ink",
					children: n
				}),
				a !== void 0 && /* @__PURE__ */ l("span", {
					className: "min-w-0 flex-1 truncate text-muted",
					children: a
				}),
				/* @__PURE__ */ l(r, {
					name: "chevron-right",
					size: 12,
					className: "shrink-0 text-faint"
				})
			]
		}), o ?? /* @__PURE__ */ l(f, {})]
	});
}
export { v as a, d as c, f as i, _ as n, g as o, p as r, h as s, m as t };
