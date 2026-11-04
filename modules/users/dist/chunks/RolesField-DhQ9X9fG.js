import { plural as e, t, useAbility as n } from "@letterncms/sdk";
import { useState as r } from "react";
import { Badge as i, Button as a, Checkbox as o, Dialog as s, Fields as c, Icon as l, Spinner as u, cn as d, confirm as f } from "@letterncms/ui";
import { Fragment as p, jsx as m, jsxs as h } from "react/jsx-runtime";
// admin/src/RolesField.tsx
var g = (e) => RegExp("^" + e.split("*").map((e) => e.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$");
function _(e, t) {
	return e.some((e) => e === "*" || e === t || g(e).test(t));
}
var v = [
	"view",
	"create",
	"edit",
	"publish",
	"delete"
], y = (e) => {
	let t = e[0]?.name.match(/^entries\.([^.]+)\./)?.[1];
	return t && e.every((e) => e.name.startsWith(`entries.${t}.`) && v.includes(e.name.split(".")[2])) ? t : null;
};
function b({ value: s, onChange: b, disabled: S }) {
	let C = n("roles/list"), w = s ?? {}, [T, E] = r(Object.keys(w)[0] ?? "admin"), [D, O] = r(!1);
	if (!C.data) return /* @__PURE__ */ m("div", {
		className: "grid h-24 place-items-center text-faint",
		children: /* @__PURE__ */ m(u, {})
	});
	let k = w[T] ? T : Object.keys(w)[0], A = w[k];
	if (!A) return null;
	let j = Object.values(C.data.permissions).flat().map((e) => e.name), M = (e) => b({
		...w,
		[k]: e
	}), N = (e, t) => {
		if (t) return M({
			...A,
			permissions: _(A.permissions, e) ? A.permissions : [...A.permissions, e]
		});
		let n = A.permissions.flatMap((t) => t === e ? [] : t.includes("*") && g(t).test(e) ? j.filter((n) => n !== e && g(t).test(n)) : [t]);
		M({
			...A,
			permissions: [...new Set(n)]
		});
	}, P = Object.entries(C.data.permissions), F = P.filter(([, e]) => y(e)), I = "m-0 mb-3 text-base font-semibold text-ink", L = C.data.people ?? {}, R = ([e, n]) => /* @__PURE__ */ h("div", {
		className: "mb-6",
		children: [/* @__PURE__ */ m("h3", {
			className: I,
			children: e
		}), /* @__PURE__ */ m("div", {
			className: "grid gap-2",
			children: n.map((e) => /* @__PURE__ */ m(o, {
				checked: _(A.permissions, e.name),
				onChange: (t) => N(e.name, t),
				label: /* @__PURE__ */ h("span", {
					className: "inline-flex flex-wrap items-center gap-x-2 gap-y-0.5",
					children: [
						/* @__PURE__ */ m("span", { children: e.label }),
						e.trusted && /* @__PURE__ */ m(i, {
							tone: "warning",
							children: t("Trusted Only")
						}),
						e.description && /* @__PURE__ */ m("span", {
							className: "text-xs text-muted",
							children: e.description
						})
					]
				})
			}, e.name))
		})]
	}, e);
	return /* @__PURE__ */ h("div", {
		className: d("grid gap-6 md:grid-cols-[180px_minmax(0,1fr)]", S && "pointer-events-none opacity-60"),
		children: [
			/* @__PURE__ */ h("div", {
				className: "space-y-px self-start rounded-lg bg-surface p-1 md:sticky md:top-16",
				children: [Object.entries(w).map(([t, n]) => /* @__PURE__ */ h("button", {
					type: "button",
					"aria-current": t === k || void 0,
					onClick: () => E(t),
					className: d("flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors duration-120", t === k ? "bg-bg font-medium text-ink shadow-raise" : "text-muted hover:bg-hover hover:text-text"),
					children: [/* @__PURE__ */ m("span", {
						className: "flex-1 truncate",
						children: n.label
					}), (L[t] ?? 0) > 0 && /* @__PURE__ */ m("span", {
						className: "text-xs tabular-nums text-faint",
						title: e(L[t], "{count} person", "{count} people"),
						children: L[t]
					})]
				}, t)), /* @__PURE__ */ h("button", {
					type: "button",
					onClick: () => O(!0),
					className: "flex h-8 w-full items-center gap-1.5 rounded-md px-2 text-left text-sm text-muted hover:bg-hover hover:text-text",
					children: [/* @__PURE__ */ m(l, {
						name: "plus",
						size: 14
					}), t("New Role")]
				})]
			}),
			/* @__PURE__ */ h("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ m(c, {
						className: "mb-6",
						fields: [{
							handle: "label",
							type: "text",
							label: t("Name"),
							width: "half"
						}, {
							handle: "description",
							type: "text",
							label: t("Description")
						}],
						values: A,
						onChange: (e, t) => M({
							...A,
							[e]: t ?? ""
						})
					}),
					A.permissions.includes("*") ? /* @__PURE__ */ m("p", {
						className: "text-sm text-muted",
						children: t("This role has every permission.")
					}) : /* @__PURE__ */ m(p, { children: P.map((e, n) => y(e[1]) ? n === P.findIndex(([, e]) => y(e)) && /* @__PURE__ */ h("div", {
						role: "table",
						"aria-label": t("Collections"),
						className: "mb-6",
						children: [/* @__PURE__ */ h("div", {
							role: "row",
							className: d(I, "mb-1 grid grid-cols-[minmax(0,1fr)_repeat(5,2.75rem)] items-end gap-x-1 sm:grid-cols-[minmax(0,1fr)_repeat(5,3.75rem)]"),
							children: [/* @__PURE__ */ m("span", {
								role: "columnheader",
								children: t("Collections")
							}), v.map((e) => /* @__PURE__ */ m("span", {
								role: "columnheader",
								className: "truncate text-center text-xs font-medium text-muted",
								children: F[0][1].find((t) => t.name.endsWith(`.${e}`))?.label ?? e
							}, e))]
						}), /* @__PURE__ */ m("div", {
							role: "rowgroup",
							children: F.map(([e, t]) => /* @__PURE__ */ h("div", {
								role: "row",
								className: "grid min-h-8 grid-cols-[minmax(0,1fr)_repeat(5,2.75rem)] items-center gap-x-1 sm:grid-cols-[minmax(0,1fr)_repeat(5,3.75rem)]",
								children: [/* @__PURE__ */ m("span", {
									role: "rowheader",
									className: "truncate text-sm",
									children: e
								}), v.map((n) => {
									let r = t.find((e) => e.name.endsWith(`.${n}`));
									return /* @__PURE__ */ m("span", {
										role: "cell",
										className: "grid place-items-center",
										children: r && /* @__PURE__ */ m(o, {
											checked: _(A.permissions, r.name),
											onChange: (e) => N(r.name, e),
											label: /* @__PURE__ */ m("span", {
												className: "sr-only",
												children: `${r.label}: ${e}`
											})
										})
									}, n);
								})]
							}, e))
						})]
					}, "collections") : R(e)) }),
					k !== "admin" && /* @__PURE__ */ m(a, {
						variant: "ghost",
						icon: "trash",
						onClick: async () => {
							if (await f({
								title: t("Delete the “{name}” role?", { name: A.label }),
								description: t("People with this role lose its permissions when you save."),
								confirm: t("Delete Role"),
								danger: !0
							})) {
								let { [k]: e, ...t } = w;
								b(t), E(Object.keys(t)[0]);
							}
						},
						children: t("Delete Role")
					})
				]
			}),
			D && /* @__PURE__ */ m(x, {
				onClose: () => O(!1),
				onCreate: (e, t) => {
					b({
						...w,
						[e]: {
							label: t,
							description: "",
							permissions: ["admin.access"]
						}
					}), E(e), O(!1);
				}
			})
		]
	});
}
function x({ onClose: e, onCreate: n }) {
	let [i, o] = r(""), l = i.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	return /* @__PURE__ */ m(s, {
		open: !0,
		onOpenChange: (t) => !t && e(),
		size: "sm",
		title: t("New Role"),
		footer: /* @__PURE__ */ h(p, { children: [/* @__PURE__ */ m(a, {
			onClick: e,
			children: t("Cancel")
		}), /* @__PURE__ */ m(a, {
			variant: "primary",
			type: "submit",
			form: "new-role",
			disabled: !l,
			children: t("Create Role")
		})] }),
		children: /* @__PURE__ */ m("form", {
			id: "new-role",
			onSubmit: (e) => {
				e.preventDefault(), l && n(l, i);
			},
			children: /* @__PURE__ */ m(c, {
				fields: [{
					handle: "label",
					type: "text",
					label: t("Name"),
					placeholder: t("Client Editor"),
					autofocus: !0,
					instructions: l ? t("Handle: {handle}", { handle: l }) : void 0
				}],
				values: { label: i },
				onChange: (e, t) => o(t ?? "")
			})
		})
	});
}
export { b as RolesField };
