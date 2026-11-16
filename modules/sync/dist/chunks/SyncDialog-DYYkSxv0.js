import { n as e } from "./shared-DCCXkjUq.js";
import { plural as t, queryClient as n, run as r, t as i, useAbility as a } from "@letterncms/sdk";
import { useState as o } from "react";
import { Button as s, Checkbox as c, Dialog as l, Icon as u, Notice as d, Spinner as f, confirm as p, formatBytes as m, toast as h } from "@letterncms/ui";
import { Fragment as g, jsx as _, jsxs as v } from "react/jsx-runtime";
// admin/src/SyncDialog.tsx
function y({ props: e, close: t }) {
	let { direction: y } = e, S = {
		name: e.remote,
		label: e.label ?? e.remote
	}, C = () => t?.(), w = a("sync/preview", {
		remote: S.name,
		direction: y
	}), [T, E] = o(null), [D, O] = o(null), [k, A] = o(!1), j = w.data, M = (e) => e.tables.every((e) => e.from === 0 && e.to === 0) && (!e.files || e.files.add + e.files.change + e.files.remove === 0), N = (j?.groups ?? []).filter((e) => !M(e)), P = (j?.groups ?? []).filter(M), F = T ?? new Set(N.filter((e) => e.selected).map((e) => e.id)), I = N.find((e) => e.id === "content"), L = y === "pull", R = N.filter((e) => F.has(e.id)), z = R.reduce((e, t) => e + t.bytes, 0), B = (e, t) => {
		let n = new Set(F);
		t ? n.add(e) : n.delete(e), E(n);
	}, V = async () => {
		let e = R.map((e) => e.label).join(", ");
		if (await p({
			title: L ? i("Pull into this site?") : i("Push to {site}?", { site: S.label }),
			description: L ? i("This site gets {what} from {from}, in place of its own. A backup is made first, so you can undo it.", {
				what: e,
				from: S.label
			}) : i("{site} gets {what} from this site, in place of its own. A backup is made there first, so you can undo it.", {
				what: e,
				site: S.label
			}),
			confirm: i(L ? "Pull Now" : "Push Now"),
			danger: !L
		})) {
			A(!0);
			try {
				let e = D === null || (I?.collections ?? []).every((e) => D.has(e.handle));
				await r("sync/start", {
					remote: S.name,
					direction: y,
					groups: [...F],
					collections: e ? null : [...D]
				}), n.invalidateQueries(), C();
			} catch (e) {
				h.error(e), A(!1);
			}
		}
	};
	return /* @__PURE__ */ v(l, {
		open: !0,
		onOpenChange: (e) => !e && C(),
		size: "lg",
		title: i(L ? "Pull from {site}" : "Push to {site}", { site: S.label }),
		description: j ? /* @__PURE__ */ v("span", {
			className: "flex flex-wrap items-center gap-1.5",
			children: [
				/* @__PURE__ */ _("span", { children: j.from.label }),
				/* @__PURE__ */ _(u, {
					name: "arrow-right",
					size: 12
				}),
				/* @__PURE__ */ _("span", { children: j.to.label }),
				/* @__PURE__ */ v("span", {
					className: "text-faint",
					children: [
						"· ",
						j.from.url.replace(/^https?:\/\//, ""),
						" → ",
						j.to.url.replace(/^https?:\/\//, "")
					]
				})
			]
		}) : i("Comparing the two sites…"),
		footer: /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _(s, {
			onClick: C,
			children: i("Cancel")
		}), /* @__PURE__ */ v(s, {
			variant: L ? "primary" : "publish",
			icon: L ? "arrow-down" : "arrow-up",
			loading: k,
			disabled: !j || j.problems.length > 0 || R.length === 0,
			onClick: () => void V(),
			children: [i(L ? "Pull" : "Push"), R.length > 0 && z > 0 ? ` · ${m(z)}` : ""]
		})] }),
		children: [
			w.isLoading && /* @__PURE__ */ _("div", {
				className: "grid h-40 place-items-center",
				children: /* @__PURE__ */ v("div", {
					className: "flex items-center gap-2 text-sm text-muted",
					children: [/* @__PURE__ */ _(f, {}), i("Comparing the two sites…")]
				})
			}),
			w.isError && /* @__PURE__ */ _(d, {
				tone: "danger",
				children: w.error.message
			}),
			j && /* @__PURE__ */ v("div", {
				className: "grid gap-4",
				children: [
					j.problems.map((e) => /* @__PURE__ */ _(d, {
						tone: "danger",
						children: e
					}, e)),
					j.problems.length === 0 && N.length === 0 && /* @__PURE__ */ _("p", {
						className: "m-0 text-sm text-muted",
						children: i("The two sites already have the same content and files. There’s nothing to {direction}.", { direction: i(L ? "pull" : "push") })
					}),
					N.length > 0 && /* @__PURE__ */ _("ul", {
						className: "m-0 grid list-none gap-1 p-0",
						children: N.map((e) => /* @__PURE__ */ _("li", {
							className: `rounded-md border px-3 py-2.5 ${F.has(e.id) ? "border-border-strong bg-surface" : "border-border"}`,
							children: /* @__PURE__ */ v("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ _("div", {
									className: "pt-0.5",
									children: /* @__PURE__ */ _(c, {
										checked: F.has(e.id),
										disabled: !e.available,
										onChange: (t) => B(e.id, t),
										label: /* @__PURE__ */ _("span", {
											className: "sr-only",
											children: e.label
										})
									})
								}), /* @__PURE__ */ v("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ v("div", {
											className: "flex flex-wrap items-baseline justify-between gap-x-3",
											children: [/* @__PURE__ */ _("span", {
												className: "text-sm font-medium text-ink",
												children: e.label
											}), /* @__PURE__ */ _("span", {
												className: "text-xs text-muted",
												children: x(e)
											})]
										}),
										e.available ? /* @__PURE__ */ _("p", {
											className: "m-0 mt-0.5 text-xs text-muted",
											children: e.description
										}) : /* @__PURE__ */ _("p", {
											className: "m-0 mt-0.5 text-xs text-danger",
											children: e.reason
										}),
										e.id === "content" && F.has("content") && (e.collections?.length ?? 0) > 1 && /* @__PURE__ */ _(b, {
											items: e.collections,
											value: D,
											onChange: O
										})
									]
								})]
							})
						}, e.id))
					}),
					P.length > 0 && N.length > 0 && /* @__PURE__ */ _("p", {
						className: "m-0 text-xs text-muted",
						children: i("Empty on both sites: {groups}.", { groups: P.map((e) => e.label).join(", ") })
					}),
					(j.notes.length > 0 || j.rewrite.length > 0) && /* @__PURE__ */ v("div", {
						className: "grid gap-1 text-xs text-muted",
						children: [j.rewrite.map(([e, t]) => /* @__PURE__ */ v("p", {
							className: "m-0 flex items-center gap-1.5",
							children: [/* @__PURE__ */ _(u, {
								name: "link",
								size: 12,
								className: "shrink-0"
							}), /* @__PURE__ */ v("span", {
								className: "truncate",
								children: [
									/* @__PURE__ */ _("code", { children: e }),
									" → ",
									/* @__PURE__ */ _("code", { children: t })
								]
							})]
						}, e)), j.notes.map((e) => /* @__PURE__ */ v("p", {
							className: "m-0 flex gap-1.5",
							children: [/* @__PURE__ */ _(u, {
								name: "info",
								size: 12,
								className: "mt-0.5 shrink-0"
							}), e]
						}, e))]
					}),
					j.problems.length === 0 && /* @__PURE__ */ _("p", {
						className: "m-0 text-xs text-muted",
						children: L ? i("Kept here whatever you pull: your .env, secrets and keys, the plugins that are on, Sync’s connections, and everyone who is signed in.") : i("Kept on {site} whatever you push: its .env, secrets and keys, the plugins that are on, its Sync connections, and everyone who is signed in there.", { site: S.label })
					})
				]
			})
		]
	});
}
function b({ items: t, value: n, onChange: r }) {
	let a = n ?? new Set(t.map((e) => e.handle));
	return /* @__PURE__ */ v("details", {
		className: "mt-2 text-xs",
		children: [/* @__PURE__ */ _("summary", {
			className: "cursor-pointer text-muted hover:text-text",
			children: a.size === t.length ? i("All collections") : i("{n} of {total} collections", {
				n: a.size,
				total: t.length
			})
		}), /* @__PURE__ */ _("div", {
			className: "mt-2 grid gap-1.5 sm:grid-cols-2",
			children: t.map((t) => /* @__PURE__ */ _(c, {
				checked: a.has(t.handle),
				onChange: (e) => {
					let n = new Set(a);
					e ? n.add(t.handle) : n.delete(t.handle), r(n);
				},
				label: /* @__PURE__ */ v("span", { children: [
					t.handle,
					" ",
					/* @__PURE__ */ v("span", {
						className: "text-muted",
						children: [
							e(t.to),
							" → ",
							e(t.from)
						]
					})
				] })
			}, t.handle))
		})]
	});
}
function x(n) {
	let r = [];
	if (n.tables.length) {
		let i = n.tables.reduce((e, t) => e + t.from, 0), a = n.tables.reduce((e, t) => e + t.to, 0);
		(i > 0 || a > 0) && r.push(t(i, "{count} row replaces {to}", "{count} rows replace {to}", { to: e(a) }));
	}
	if (n.files) {
		let t = n.files, a = [
			t.add && i("{n} new", { n: e(t.add) }),
			t.change && i("{n} changed", { n: e(t.change) }),
			t.remove && i("{n} removed", { n: e(t.remove) })
		].filter(Boolean);
		r.push(a.length ? a.join(", ") + (t.bytes > 0 ? ` · ${m(t.bytes)}` : "") : i("Files the same"));
	}
	return r.join(" · ");
}
export { y as default };
