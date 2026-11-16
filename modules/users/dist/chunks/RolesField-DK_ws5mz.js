import { plural as e, t, useAbility as n } from "@letterncms/sdk";
import { useState as r } from "react";
import { Badge as i, Button as a, Checkbox as o, Dialog as s, Fields as c, IconButton as l, List as u, Menu as d, Row as f, SectionHeading as p, Spinner as m, cn as h, confirm as g } from "@letterncms/ui";
import { Fragment as _, jsx as v, jsxs as y } from "react/jsx-runtime";
// admin/src/RolesField.tsx
var b = (e) => RegExp("^" + e.split("*").map((e) => e.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$");
function x(e, t) {
	return e.some((e) => e === "*" || e === t || b(e).test(t));
}
var S = [
	"view",
	"create",
	"edit",
	"publish",
	"delete"
], C = (e) => {
	let t = e[0]?.name.match(/^entries\.([^.]+)\./)?.[1];
	return t && e.every((e) => e.name.startsWith(`entries.${t}.`) && S.includes(e.name.split(".")[2])) ? t : null;
};
function w({ value: s, onChange: w, disabled: E }) {
	let D = n("roles/list"), O = s ?? {}, [k, A] = r(Object.keys(O)[0] ?? "admin"), [j, M] = r(!1);
	if (!D.data) return /* @__PURE__ */ v("div", {
		className: "grid h-24 place-items-center text-faint",
		children: /* @__PURE__ */ v(m, {})
	});
	let N = O[k] ? k : Object.keys(O)[0], P = O[N];
	if (!P) return null;
	let F = Object.values(D.data.permissions).flat().map((e) => e.name), I = (e) => w({
		...O,
		[N]: e
	}), L = (e, t) => {
		if (t) return I({
			...P,
			permissions: x(P.permissions, e) ? P.permissions : [...P.permissions, e]
		});
		let n = P.permissions.flatMap((t) => t === e ? [] : t.includes("*") && b(t).test(e) ? F.filter((n) => n !== e && b(t).test(n)) : [t]);
		I({
			...P,
			permissions: [...new Set(n)]
		});
	}, R = (e, t) => {
		if (t) return I({
			...P,
			permissions: [...P.permissions, ...e.filter((e) => !x(P.permissions, e))]
		});
		let n = P.permissions.flatMap((t) => e.includes(t) ? [] : t.includes("*") && e.some((e) => b(t).test(e)) ? F.filter((n) => !e.includes(n) && b(t).test(n)) : [t]);
		I({
			...P,
			permissions: [...new Set(n)]
		});
	}, z = (e) => {
		let t = e.filter((e) => x(P.permissions, e)).length;
		return {
			checked: t === e.length && t > 0,
			indeterminate: t > 0 && t < e.length
		};
	}, B = async (e) => {
		if (!await g({
			title: t("Delete the “{name}” role?", { name: O[e].label }),
			description: t("People with this role lose its permissions when you save."),
			confirm: t("Delete Role"),
			danger: !0
		})) return;
		let { [e]: n, ...r } = O;
		w(r), A(Object.keys(r)[0]);
	}, V = (e) => {
		let n = t("{label} copy", { label: O[e].label }), r = `${e}-copy`;
		for (let t = 2; O[r]; t++) r = `${e}-copy-${t}`;
		w({
			...O,
			[r]: {
				...O[e],
				label: n,
				permissions: [...O[e].permissions]
			}
		}), A(r);
	}, H = Object.entries(D.data.permissions), U = H.filter(([, e]) => C(e)), W = D.data.people ?? {}, G = ([e, n]) => /* @__PURE__ */ y("section", {
		className: "mb-8",
		children: [/* @__PURE__ */ v(p, {
			as: "h3",
			title: e,
			actions: n.length > 1 && /* @__PURE__ */ v(o, {
				...z(n.map((e) => e.name)),
				onChange: (e) => R(n.map((e) => e.name), e),
				label: /* @__PURE__ */ y(_, { children: [t("All"), /* @__PURE__ */ y("span", {
					className: "sr-only",
					children: [" ", e]
				})] })
			})
		}), /* @__PURE__ */ v("div", {
			className: "grid gap-2",
			children: n.map((e) => /* @__PURE__ */ v(o, {
				checked: x(P.permissions, e.name),
				onChange: (t) => L(e.name, t),
				label: /* @__PURE__ */ y("span", {
					className: "inline-flex flex-wrap items-center gap-x-2 gap-y-0.5",
					children: [
						/* @__PURE__ */ v("span", { children: e.label }),
						e.trusted && /* @__PURE__ */ v(i, {
							tone: "warning",
							children: t("Trusted Only")
						}),
						e.description && /* @__PURE__ */ v("span", {
							className: "text-xs text-muted",
							children: e.description
						})
					]
				})
			}, e.name))
		})]
	}, e);
	return /* @__PURE__ */ y("div", {
		className: h("grid gap-8", E && "pointer-events-none opacity-60"),
		children: [
			/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(u, { children: Object.entries(O).map(([n, r]) => /* @__PURE__ */ y(f, {
				selected: n === N,
				onClick: () => A(n),
				actions: /* @__PURE__ */ v(d, {
					align: "end",
					trigger: /* @__PURE__ */ v(l, {
						size: "xs",
						icon: "more",
						label: t("Actions for {name}", { name: r.label })
					}),
					items: [{
						label: t("Duplicate Role"),
						icon: "copy",
						onSelect: () => V(n)
					}, n !== "admin" && {
						label: t("Delete Role"),
						icon: "trash",
						danger: !0,
						onSelect: () => void B(n)
					}]
				}),
				children: [/* @__PURE__ */ v("span", {
					className: h("min-w-0 flex-1 truncate", n === N && "font-medium text-ink"),
					children: r.label
				}), (W[n] ?? 0) > 0 && /* @__PURE__ */ v("span", {
					className: "shrink-0 text-xs tabular-nums text-faint",
					children: e(W[n], "{count} person", "{count} people")
				})]
			}, n)) }), /* @__PURE__ */ v(a, {
				variant: "ghost",
				icon: "plus",
				className: "mt-2",
				onClick: () => M(!0),
				children: t("New Role")
			})] }),
			/* @__PURE__ */ y("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ v(c, {
					className: "mb-6",
					fields: [{
						handle: "label",
						type: "text",
						label: t("Name")
					}, {
						handle: "description",
						type: "textarea",
						label: t("Description"),
						rows: 2
					}],
					values: P,
					onChange: (e, t) => I({
						...P,
						[e]: t ?? ""
					})
				}), !P.permissions.includes("*") && /* @__PURE__ */ v(_, { children: H.map((e, n) => C(e[1]) ? n === H.findIndex(([, e]) => C(e)) && /* @__PURE__ */ y("div", {
					role: "table",
					"aria-label": t("Collections"),
					className: "mb-8",
					children: [/* @__PURE__ */ y("div", {
						role: "row",
						className: h("m-0 mb-1 grid min-h-7 text-base font-semibold text-ink grid-cols-[minmax(0,1fr)_repeat(5,2.75rem)] items-end gap-x-1 sm:grid-cols-[minmax(0,1fr)_repeat(5,3.75rem)]"),
						children: [/* @__PURE__ */ v("span", {
							role: "columnheader",
							children: t("Collections")
						}), S.map((e) => /* @__PURE__ */ v("span", {
							role: "columnheader",
							className: "truncate text-center text-xs font-medium text-muted",
							children: U[0][1].find((t) => t.name.endsWith(`.${e}`))?.label ?? e
						}, e))]
					}), /* @__PURE__ */ y("div", {
						role: "rowgroup",
						children: [/* @__PURE__ */ y("div", {
							role: "row",
							className: "grid min-h-8 grid-cols-[minmax(0,1fr)_repeat(5,2.75rem)] items-center gap-x-1 border-b border-border sm:grid-cols-[minmax(0,1fr)_repeat(5,3.75rem)]",
							children: [/* @__PURE__ */ v("span", {
								role: "rowheader",
								className: "truncate text-sm text-muted",
								children: t("All Collections")
							}), S.map((e) => {
								let n = U.flatMap(([, t]) => t.filter((t) => t.name.endsWith(`.${e}`)).map((e) => e.name)), r = U[0][1].find((t) => t.name.endsWith(`.${e}`))?.label ?? e;
								return /* @__PURE__ */ v("span", {
									role: "cell",
									className: "grid place-items-center",
									children: n.length > 0 && /* @__PURE__ */ v(o, {
										...z(n),
										onChange: (e) => R(n, e),
										label: /* @__PURE__ */ v("span", {
											className: "sr-only",
											children: `${r}: ${t("All Collections")}`
										})
									})
								}, e);
							})]
						}), U.map(([e, t]) => /* @__PURE__ */ y("div", {
							role: "row",
							className: "grid min-h-8 grid-cols-[minmax(0,1fr)_repeat(5,2.75rem)] items-center gap-x-1 sm:grid-cols-[minmax(0,1fr)_repeat(5,3.75rem)]",
							children: [/* @__PURE__ */ v("span", {
								role: "rowheader",
								className: "min-w-0 truncate text-sm",
								children: /* @__PURE__ */ v(o, {
									...z(t.map((e) => e.name)),
									onChange: (e) => R(t.map((e) => e.name), e),
									label: e
								})
							}), S.map((n) => {
								let r = t.find((e) => e.name.endsWith(`.${n}`));
								return /* @__PURE__ */ v("span", {
									role: "cell",
									className: "grid place-items-center",
									children: r && /* @__PURE__ */ v(o, {
										checked: x(P.permissions, r.name),
										onChange: (e) => L(r.name, e),
										label: /* @__PURE__ */ v("span", {
											className: "sr-only",
											children: `${r.label}: ${e}`
										})
									})
								}, n);
							})]
						}, e))]
					})]
				}, "collections") : G(e)) })]
			}),
			j && /* @__PURE__ */ v(T, {
				onClose: () => M(!1),
				onCreate: (e, t) => {
					w({
						...O,
						[e]: {
							label: t,
							description: "",
							permissions: ["admin.access"]
						}
					}), A(e), M(!1);
				}
			})
		]
	});
}
function T({ onClose: e, onCreate: n }) {
	let [i, a] = r(""), o = i.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	return /* @__PURE__ */ v(s, {
		open: !0,
		onOpenChange: (t) => !t && e(),
		size: "sm",
		title: t("New Role"),
		submitLabel: t("Create Role"),
		submitDisabled: !o,
		onSubmit: () => n(o, i),
		children: /* @__PURE__ */ v(c, {
			fields: [{
				handle: "label",
				type: "text",
				label: t("Name"),
				placeholder: t("Client Editor"),
				autofocus: !0,
				instructions: o ? t("Handle: {handle}", { handle: o }) : void 0
			}],
			values: { label: i },
			onChange: (e, t) => a(t ?? "")
		})
	});
}
export { w as RolesField };
