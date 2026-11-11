import { plural as e, t, useAbility as n } from "@letterncms/sdk";
import { useState as r } from "react";
import { Badge as i, Button as a, Checkbox as o, Dialog as s, Fields as c, List as l, Row as u, SectionHeading as d, Spinner as f, cn as p, confirm as m } from "@letterncms/ui";
import { Fragment as h, jsx as g, jsxs as _ } from "react/jsx-runtime";
// admin/src/RolesField.tsx
var v = (e) => RegExp("^" + e.split("*").map((e) => e.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$");
function y(e, t) {
	return e.some((e) => e === "*" || e === t || v(e).test(t));
}
var b = [
	"view",
	"create",
	"edit",
	"publish",
	"delete"
], x = (e) => {
	let t = e[0]?.name.match(/^entries\.([^.]+)\./)?.[1];
	return t && e.every((e) => e.name.startsWith(`entries.${t}.`) && b.includes(e.name.split(".")[2])) ? t : null;
};
function S({ value: s, onChange: S, disabled: w }) {
	let T = n("roles/list"), E = s ?? {}, [D, O] = r(Object.keys(E)[0] ?? "admin"), [k, A] = r(!1);
	if (!T.data) return /* @__PURE__ */ g("div", {
		className: "grid h-24 place-items-center text-faint",
		children: /* @__PURE__ */ g(f, {})
	});
	let j = E[D] ? D : Object.keys(E)[0], M = E[j];
	if (!M) return null;
	let N = Object.values(T.data.permissions).flat().map((e) => e.name), P = (e) => S({
		...E,
		[j]: e
	}), F = (e, t) => {
		if (t) return P({
			...M,
			permissions: y(M.permissions, e) ? M.permissions : [...M.permissions, e]
		});
		let n = M.permissions.flatMap((t) => t === e ? [] : t.includes("*") && v(t).test(e) ? N.filter((n) => n !== e && v(t).test(n)) : [t]);
		P({
			...M,
			permissions: [...new Set(n)]
		});
	}, I = Object.entries(T.data.permissions), L = I.filter(([, e]) => x(e)), R = T.data.people ?? {}, z = ([e, n]) => /* @__PURE__ */ _("section", {
		className: "mb-8",
		children: [/* @__PURE__ */ g(d, {
			as: "h3",
			title: e
		}), /* @__PURE__ */ g("div", {
			className: "grid gap-2",
			children: n.map((e) => /* @__PURE__ */ g(o, {
				checked: y(M.permissions, e.name),
				onChange: (t) => F(e.name, t),
				label: /* @__PURE__ */ _("span", {
					className: "inline-flex flex-wrap items-center gap-x-2 gap-y-0.5",
					children: [
						/* @__PURE__ */ g("span", { children: e.label }),
						e.trusted && /* @__PURE__ */ g(i, {
							tone: "warning",
							children: t("Trusted Only")
						}),
						e.description && /* @__PURE__ */ g("span", {
							className: "text-xs text-muted",
							children: e.description
						})
					]
				})
			}, e.name))
		})]
	}, e);
	return /* @__PURE__ */ _("div", {
		className: p("grid gap-8", w && "pointer-events-none opacity-60"),
		children: [
			/* @__PURE__ */ _("div", { children: [/* @__PURE__ */ g(l, { children: Object.entries(E).map(([t, n]) => /* @__PURE__ */ _(u, {
				selected: t === j,
				onClick: () => O(t),
				children: [/* @__PURE__ */ g("span", {
					className: p("min-w-0 flex-1 truncate", t === j && "font-medium text-ink"),
					children: n.label
				}), (R[t] ?? 0) > 0 && /* @__PURE__ */ g("span", {
					className: "shrink-0 text-xs tabular-nums text-faint",
					children: e(R[t], "{count} person", "{count} people")
				})]
			}, t)) }), /* @__PURE__ */ g(a, {
				variant: "ghost",
				icon: "plus",
				className: "mt-2",
				onClick: () => A(!0),
				children: t("New Role")
			})] }),
			/* @__PURE__ */ _("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ g(c, {
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
						values: M,
						onChange: (e, t) => P({
							...M,
							[e]: t ?? ""
						})
					}),
					!M.permissions.includes("*") && /* @__PURE__ */ g(h, { children: I.map((e, n) => x(e[1]) ? n === I.findIndex(([, e]) => x(e)) && /* @__PURE__ */ _("div", {
						role: "table",
						"aria-label": t("Collections"),
						className: "mb-8",
						children: [/* @__PURE__ */ _("div", {
							role: "row",
							className: p("m-0 mb-1 grid min-h-7 text-base font-semibold text-ink grid-cols-[minmax(0,1fr)_repeat(5,2.75rem)] items-end gap-x-1 sm:grid-cols-[minmax(0,1fr)_repeat(5,3.75rem)]"),
							children: [/* @__PURE__ */ g("span", {
								role: "columnheader",
								children: t("Collections")
							}), b.map((e) => /* @__PURE__ */ g("span", {
								role: "columnheader",
								className: "truncate text-center text-xs font-medium text-muted",
								children: L[0][1].find((t) => t.name.endsWith(`.${e}`))?.label ?? e
							}, e))]
						}), /* @__PURE__ */ g("div", {
							role: "rowgroup",
							children: L.map(([e, t]) => /* @__PURE__ */ _("div", {
								role: "row",
								className: "grid min-h-8 grid-cols-[minmax(0,1fr)_repeat(5,2.75rem)] items-center gap-x-1 sm:grid-cols-[minmax(0,1fr)_repeat(5,3.75rem)]",
								children: [/* @__PURE__ */ g("span", {
									role: "rowheader",
									className: "truncate text-sm",
									children: e
								}), b.map((n) => {
									let r = t.find((e) => e.name.endsWith(`.${n}`));
									return /* @__PURE__ */ g("span", {
										role: "cell",
										className: "grid place-items-center",
										children: r && /* @__PURE__ */ g(o, {
											checked: y(M.permissions, r.name),
											onChange: (e) => F(r.name, e),
											label: /* @__PURE__ */ g("span", {
												className: "sr-only",
												children: `${r.label}: ${e}`
											})
										})
									}, n);
								})]
							}, e))
						})]
					}, "collections") : z(e)) }),
					j !== "admin" && /* @__PURE__ */ g(a, {
						variant: "destructive",
						icon: "trash",
						onClick: async () => {
							if (await m({
								title: t("Delete the “{name}” role?", { name: M.label }),
								description: t("People with this role lose its permissions when you save."),
								confirm: t("Delete Role"),
								danger: !0
							})) {
								let { [j]: e, ...t } = E;
								S(t), O(Object.keys(t)[0]);
							}
						},
						children: t("Delete Role")
					})
				]
			}),
			k && /* @__PURE__ */ g(C, {
				onClose: () => A(!1),
				onCreate: (e, t) => {
					S({
						...E,
						[e]: {
							label: t,
							description: "",
							permissions: ["admin.access"]
						}
					}), O(e), A(!1);
				}
			})
		]
	});
}
function C({ onClose: e, onCreate: n }) {
	let [i, a] = r(""), o = i.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	return /* @__PURE__ */ g(s, {
		open: !0,
		onOpenChange: (t) => !t && e(),
		size: "sm",
		title: t("New Role"),
		submitLabel: t("Create Role"),
		submitDisabled: !o,
		onSubmit: () => n(o, i),
		children: /* @__PURE__ */ g(c, {
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
export { S as RolesField };
