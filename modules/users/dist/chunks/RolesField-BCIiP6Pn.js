import { t as e, useAbility as t } from "@letterncms/sdk";
import { useState as n } from "react";
import { Button as r, Dialog as i, Fields as a, Icon as o, Spinner as s, cn as c, confirm as l } from "@letterncms/ui";
import { Fragment as u, jsx as d, jsxs as f } from "react/jsx-runtime";
// admin/src/RolesField.tsx
function p(e, t) {
	return e.some((e) => e === "*" || e === t || RegExp("^" + e.split("*").map((e) => e.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$").test(t));
}
function m({ value: i, onChange: u, disabled: m }) {
	let g = t("roles/list"), _ = i ?? {}, [v, y] = n(Object.keys(_)[0] ?? "admin"), [b, x] = n(!1);
	if (!g.data) return /* @__PURE__ */ d("div", {
		className: "grid h-24 place-items-center text-faint",
		children: /* @__PURE__ */ d(s, {})
	});
	let S = _[v] ? v : Object.keys(_)[0], C = _[S];
	if (!C) return null;
	let w = (e) => u({
		..._,
		[S]: e
	}), T = (e, t) => {
		let n = C.permissions.filter((t) => t !== e);
		w({
			...C,
			permissions: t ? [...n, e] : n
		});
	};
	return /* @__PURE__ */ f("div", {
		className: c("grid grid-cols-[160px_1fr] gap-6", m && "pointer-events-none opacity-60"),
		children: [
			/* @__PURE__ */ f("div", {
				className: "space-y-px",
				children: [Object.entries(_).map(([t, n]) => /* @__PURE__ */ f("button", {
					type: "button",
					onClick: () => y(t),
					className: c("flex h-8 w-full items-center rounded-sm px-2 text-left text-sm", t === S ? "bg-active font-medium text-ink" : "text-muted hover:bg-hover"),
					children: [/* @__PURE__ */ d("span", {
						className: "flex-1 truncate",
						children: n.label
					}), /* @__PURE__ */ d("span", {
						className: "text-xs tabular-nums text-faint",
						children: n.permissions.includes("*") ? e("All") : n.permissions.length
					})]
				}, t)), /* @__PURE__ */ f("button", {
					type: "button",
					onClick: () => x(!0),
					className: "flex h-8 w-full items-center gap-1.5 rounded-sm px-2 text-left text-sm text-muted hover:bg-hover hover:text-text",
					children: [/* @__PURE__ */ d(o, {
						name: "plus",
						size: 14
					}), e("New Role")]
				})]
			}),
			/* @__PURE__ */ f("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ d("div", {
						className: "mb-6 grid grid-cols-2 gap-3",
						children: /* @__PURE__ */ d(a, {
							className: "col-span-2",
							fields: [{
								handle: "label",
								type: "text",
								label: e("Name"),
								width: "half"
							}, {
								handle: "description",
								type: "textarea",
								label: e("Description"),
								rows: 1,
								width: "half"
							}],
							values: C,
							onChange: (e, t) => w({
								...C,
								[e]: t ?? ""
							})
						})
					}),
					C.permissions.includes("*") ? /* @__PURE__ */ d("p", {
						className: "text-sm text-muted",
						children: e("This role has every permission.")
					}) : Object.entries(g.data.permissions).map(([e, t]) => /* @__PURE__ */ f("div", {
						className: "mb-6",
						children: [/* @__PURE__ */ d("h3", {
							className: "m-0 mb-2 border-b border-border pb-1.5 text-sm font-semibold",
							children: e
						}), /* @__PURE__ */ d(a, {
							className: "!gap-y-2",
							fields: t.map((e) => ({
								handle: e.name,
								type: "toggle",
								label: e.label,
								instructions: e.description || void 0,
								display: "checkbox",
								width: t.every((e) => e.label.length <= 12 && !e.description) ? "third" : "full"
							})),
							values: Object.fromEntries(t.map((e) => [e.name, p(C.permissions, e.name)])),
							onChange: (e, t) => T(e, !!t)
						})]
					}, e)),
					S !== "admin" && /* @__PURE__ */ d(r, {
						variant: "ghost",
						className: "text-danger",
						onClick: async () => {
							if (await l({
								title: e("Delete the “{name}” role?", { name: C.label }),
								description: e("People with this role lose its permissions when you save."),
								confirm: e("Delete"),
								danger: !0
							})) {
								let { [S]: e, ...t } = _;
								u(t), y(Object.keys(t)[0]);
							}
						},
						children: e("Delete Role")
					})
				]
			}),
			b && /* @__PURE__ */ d(h, {
				onClose: () => x(!1),
				onCreate: (e, t) => {
					u({
						..._,
						[e]: {
							label: t,
							description: "",
							permissions: ["admin.access"]
						}
					}), y(e), x(!1);
				}
			})
		]
	});
}
function h({ onClose: t, onCreate: o }) {
	let [s, c] = n(""), l = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	return /* @__PURE__ */ d(i, {
		open: !0,
		onOpenChange: (e) => !e && t(),
		size: "sm",
		title: e("New Role"),
		footer: /* @__PURE__ */ f(u, { children: [/* @__PURE__ */ d(r, {
			onClick: t,
			children: e("Cancel")
		}), /* @__PURE__ */ d(r, {
			variant: "primary",
			disabled: !l,
			onClick: () => o(l, s),
			children: e("Create")
		})] }),
		children: /* @__PURE__ */ d(a, {
			fields: [{
				handle: "label",
				type: "text",
				label: e("Name"),
				placeholder: e("Client Editor"),
				autofocus: !0,
				instructions: l ? e("Handle: {handle}", { handle: l }) : void 0
			}],
			values: { label: s },
			onChange: (e, t) => c(t ?? "")
		})
	});
}
export { m as RolesField };
