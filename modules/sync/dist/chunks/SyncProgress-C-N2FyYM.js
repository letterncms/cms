import { r as e, t } from "./shared-DCCXkjUq.js";
import { plural as n, queryClient as r, run as i, t as a, useAbility as o } from "@letterncms/sdk";
import { useEffect as s, useRef as c, useState as l } from "react";
import { Button as u, Icon as d, confirm as f, toast as p } from "@letterncms/ui";
import { Fragment as m, jsx as h, jsxs as g } from "react/jsx-runtime";
// admin/src/SyncProgress.tsx
function _() {
	let e = o("sync/overview"), [t, n] = l(null), [i, a] = l(null), c = e.data, u = c?.current && c.current.id !== i && c.current.id !== t?.id ? c.current : null;
	s(() => {
		u && n(u);
	}, [u?.id]);
	let d = /* @__PURE__ */ new Set([...(c?.history ?? []).filter((e) => e.undone_at).map((e) => e.id), ...(c?.remotes ?? []).filter((e) => e.last?.undone_at).map((e) => e.last.id)]), f = t && t.id !== i && !(t.status === "done" && d.has(t.id)) ? t : null;
	return f ? /* @__PURE__ */ h(v, {
		job: f,
		onChange: n,
		onClose: () => {
			a(f.id), n(null), r.invalidateQueries();
		}
	}) : null;
}
function v({ job: o, onChange: _, onClose: v }) {
	let y = c(!0), [b, x] = l(!1), S = t.includes(o.status), C = o.id;
	s(() => {
		if (y.current = !0, !S) return;
		let e, n = async (a) => {
			if (await new Promise((t) => {
				e = setTimeout(t, a);
			}), y.current) try {
				let e = await i("sync/step", { id: C });
				if (!y.current) return;
				_(e), t.includes(e.status) ? n(e.status === "waiting" ? 3e3 : 0) : r.invalidateQueries();
			} catch {
				y.current && n(3e3);
			}
		};
		return n(o.status === "waiting" ? 3e3 : 0), () => {
			y.current = !1, clearTimeout(e);
		};
	}, [C, S]);
	let w = async () => {
		if (await f({
			title: a("Cancel this sync?"),
			description: a("Nothing has been switched over yet, so neither site changes."),
			confirm: a("Cancel Sync"),
			danger: !0
		})) {
			y.current = !1;
			try {
				_(await i("sync/cancel", { id: C })), r.invalidateQueries();
			} catch (e) {
				p.error(e);
			}
		}
	}, T = async () => {
		try {
			_(await i("sync/resume", { id: C }));
		} catch (e) {
			p.error(e);
		}
	}, E = async () => {
		if (await f({
			title: a("Undo this sync?"),
			description: a("{site} gets back what it had just before, from the backup made then.", { site: o.to }),
			confirm: a("Undo Sync"),
			danger: !0
		})) {
			x(!0);
			try {
				for (; !(await i("sync/undo", {
					id: C,
					...o.direction === "push" ? { remote: o.remote } : {}
				})).done;);
				p.success(a("Undone. {site} is as it was before.", { site: o.to })), v();
			} catch (e) {
				p.error(e);
			} finally {
				x(!1);
			}
		}
	}, D = o.direction === "pull" ? a("Pulling from {site}", { site: o.remote_label }) : a("Pushing to {site}", { site: o.remote_label }), O = o.finished_at ? Math.max(1, Math.round((new Date(o.finished_at).getTime() - new Date(o.started_at).getTime()) / 1e3)) : 0;
	return /* @__PURE__ */ h("section", {
		"aria-live": "polite",
		className: "mb-8 rounded-lg border border-border-strong bg-surface p-4",
		children: S || o.status === "paused" ? /* @__PURE__ */ g(m, { children: [
			/* @__PURE__ */ g("div", {
				className: "flex items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ h("h2", {
					className: "m-0 text-sm font-semibold text-ink",
					children: D
				}), /* @__PURE__ */ g("span", {
					className: "text-sm tabular-nums text-muted",
					children: [o.percent, "%"]
				})]
			}),
			/* @__PURE__ */ h("div", {
				className: "mt-3 h-1.5 overflow-hidden rounded-full bg-hover",
				role: "progressbar",
				"aria-valuenow": o.percent,
				"aria-valuemin": 0,
				"aria-valuemax": 100,
				"aria-label": D,
				children: /* @__PURE__ */ h("div", {
					className: "h-full rounded-full bg-ink transition-[width] duration-slow ease-out",
					style: { width: `${Math.max(2, o.percent)}%` }
				})
			}),
			/* @__PURE__ */ g("div", {
				className: "mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted",
				children: [/* @__PURE__ */ h("span", { children: o.status === "waiting" ? /* @__PURE__ */ g("span", {
					className: "text-warning",
					children: [
						o.message,
						" ",
						a("Trying again…")
					]
				}) : o.status === "paused" ? /* @__PURE__ */ h("span", {
					className: "text-warning",
					children: o.message
				}) : `${o.label}…` }), /* @__PURE__ */ g("span", {
					className: "tabular-nums",
					children: [
						n(o.rows, "{count} row", "{count} rows"),
						", ",
						n(o.files, "{count} file", "{count} files"),
						o.eta ? ` · ${a("about {time} left", { time: e(o.eta) })}` : ""
					]
				})]
			}),
			/* @__PURE__ */ g("div", {
				className: "mt-3 flex gap-2",
				children: [o.status === "paused" && /* @__PURE__ */ h(u, {
					size: "xs",
					variant: "primary",
					onClick: () => void T(),
					children: a("Carry On")
				}), /* @__PURE__ */ h(u, {
					size: "xs",
					variant: "ghost",
					onClick: () => void w(),
					children: a("Cancel")
				})]
			})
		] }) : o.status === "done" ? /* @__PURE__ */ g("div", {
			className: "flex flex-wrap items-center gap-3",
			children: [
				/* @__PURE__ */ h("span", {
					className: "grid size-8 place-items-center rounded-full bg-success/10 text-success",
					children: /* @__PURE__ */ h(d, {
						name: "check",
						size: 16
					})
				}),
				/* @__PURE__ */ g("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ h("p", {
						className: "m-0 text-sm font-medium text-ink",
						children: o.direction === "pull" ? a("Pulled from {site}", { site: o.remote_label }) : a("Pushed to {site}", { site: o.remote_label })
					}), /* @__PURE__ */ g("p", {
						className: "m-0 text-xs text-muted",
						children: [
							a("{rows} and {files} in {time}.", {
								rows: n(o.rows, "{count} row", "{count} rows"),
								files: n(o.files, "{count} file", "{count} files"),
								time: e(O)
							}),
							" ",
							o.groups.join(", "),
							"."
						]
					})]
				}),
				/* @__PURE__ */ h(u, {
					size: "sm",
					icon: "undo",
					loading: b,
					onClick: () => void E(),
					children: a("Undo")
				}),
				/* @__PURE__ */ h(u, {
					size: "sm",
					variant: "ghost",
					icon: "close",
					"aria-label": a("Close"),
					onClick: v
				})
			]
		}) : /* @__PURE__ */ g("div", {
			className: "flex flex-wrap items-start gap-3",
			children: [
				/* @__PURE__ */ h("span", {
					className: "grid size-8 shrink-0 place-items-center rounded-full bg-danger/10 text-danger",
					children: /* @__PURE__ */ h(d, {
						name: o.status === "cancelled" ? "close" : "warning",
						size: 16
					})
				}),
				/* @__PURE__ */ g("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ h("p", {
						className: "m-0 text-sm font-medium text-ink",
						children: o.status === "cancelled" ? a("Canceled. Neither site changed.") : a("The sync stopped. Neither site changed.")
					}), o.error && /* @__PURE__ */ h("p", {
						className: "m-0 mt-0.5 text-xs text-muted",
						children: o.error
					})]
				}),
				/* @__PURE__ */ h(u, {
					size: "sm",
					variant: "ghost",
					icon: "close",
					"aria-label": a("Close"),
					onClick: v
				})
			]
		})
	});
}
export { _ as default };
