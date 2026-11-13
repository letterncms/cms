import { n as e, r as t } from "./installing-CCPtKzo4.js";
import { invalidate as n, run as r, t as i, timeAgo as a, useAbility as o } from "@letterncms/sdk";
import { useState as s } from "react";
import { Badge as c, Button as l, EmptyState as u, Icon as d, List as f, Row as p, Section as m, Skeleton as h, Switch as g, confirm as _, longDate as v, toast as y } from "@letterncms/ui";
import { Fragment as b, jsx as x, jsxs as S } from "react/jsx-runtime";
// admin/src/Updates.tsx
var C = [
	"downloading",
	"verifying",
	"extracting",
	"checking_files",
	"ready"
], w = (e) => ({
	downloading: i("Downloading…"),
	verifying: i("Checking the signature…"),
	extracting: i("Unpacking…"),
	checking_files: i("Checking every file…"),
	ready: i("Switching…"),
	migrating: i("Updating the database…"),
	checking: i("Checking the new version…")
})[e] ?? e, T = (e) => ({
	composer: i("Updates come through Composer"),
	git: i("Updates come through Composer"),
	file_mods: i("Updated through your deploy.")
})[e] ?? e;
function E() {
	let E = o("packages/updates"), O = o("packages/list", { type: "plugin" }), k = Object.fromEntries((O.data?.items ?? []).map((e) => [e.name, e.label])), [A, j] = s(null), [M, N] = s(null), P = E.data, F = async () => {
		n("packages/"), await E.refetch();
	}, I = async () => {
		N("check");
		try {
			let e = await r("packages/update-check");
			e.error && y.error(e.error), await F();
		} catch (e) {
			y.error(e);
		} finally {
			N(null);
		}
	}, L = async (e) => {
		if (!e.major || await _({
			title: i("Update to {version}?", { version: e.version }),
			description: [i("This is a new major version. Back up first, and read the release notes."), e.incompatible.length ? i("These plugins go inactive: {list}.", { list: e.incompatible.join(", ") }) : ""].filter(Boolean).join(" "),
			confirm: i("Update")
		})) {
			N("core");
			try {
				let n = await r("packages/update-start", { version: e.version });
				for (j(w(n.state)); C.includes(n.state);) n = await r("packages/update-step"), j(w(n.state));
				if (n.drive && (j(w("migrating")), await t() === "done")) {
					window.location.reload();
					return;
				}
				await F(), n.state === "failed" && y.error(n.error ?? i("The update failed. Nothing was changed."));
			} catch (e) {
				y.error(e), await F();
			} finally {
				N(null), j(null);
			}
		}
	}, R = async (t, n, a) => {
		N(t);
		try {
			let o = await r("packages/install", {
				store: n,
				package: t,
				version: a
			});
			await e(o), y.success(i("{name} updated", { name: t })), await F();
		} catch (e) {
			y.error(e), await F();
		} finally {
			N(null);
		}
	};
	if (E.isLoading || !P) return /* @__PURE__ */ x(h, { className: "h-40" });
	let { core: z, status: B } = P, V = O.data?.items.length ?? 0, H = Math.max(0, V - P.unverified.length), U = z.update;
	return /* @__PURE__ */ S("div", { children: [
		/* @__PURE__ */ S(m, {
			title: i("{brand} {version}", { version: z.current }),
			actions: /* @__PURE__ */ S(b, { children: [/* @__PURE__ */ x("span", {
				className: "text-xs text-faint",
				children: z.check.checked_at ? /* @__PURE__ */ x("time", {
					dateTime: (/* @__PURE__ */ new Date(z.check.checked_at * 1e3)).toISOString(),
					title: v((/* @__PURE__ */ new Date(z.check.checked_at * 1e3)).toISOString()),
					children: i("Checked {date}", { date: a((/* @__PURE__ */ new Date(z.check.checked_at * 1e3)).toISOString()) })
				}) : i("Not checked yet")
			}), /* @__PURE__ */ x(l, {
				size: "sm",
				loading: M === "check",
				disabled: M !== null,
				onClick: () => void I(),
				children: i("Check Now")
			})] }),
			children: [
				z.managed ? /* @__PURE__ */ x(D, {
					icon: "info",
					children: T(z.managed)
				}) : z.trust === "dev_trust" ? /* @__PURE__ */ x(D, {
					icon: "info",
					children: i("This build has development keys, so updates are off.")
				}) : null,
				B.state === "rolled_back" && /* @__PURE__ */ x(D, {
					icon: "warning",
					children: i("The update to {version} failed and was undone. {error}", {
						version: B.target ?? "",
						error: B.error ?? ""
					})
				}),
				B.state === "failed" && /* @__PURE__ */ x(D, {
					icon: "warning",
					children: i("The last update stopped. Nothing changed. {error}", { error: B.error ?? "" })
				}),
				z.yanked && /* @__PURE__ */ x(D, {
					icon: "warning",
					children: i("This version was withdrawn: {reason}", { reason: z.yanked })
				}),
				z.support_ended && /* @__PURE__ */ x(D, {
					icon: "warning",
					children: i("Security fixes for this version ended in {date}.", { date: z.support_ended.until })
				}),
				z.check.error && !z.trust && /* @__PURE__ */ x(D, {
					icon: "info",
					children: i("The last check failed: {error}", { error: z.check.error })
				}),
				A && /* @__PURE__ */ S("p", {
					role: "status",
					className: "mt-3 flex items-center gap-2 text-sm text-text",
					children: [/* @__PURE__ */ x(d, {
						name: "spinner",
						size: 16,
						className: "animate-spin"
					}), A]
				}),
				!z.managed && (U || z.major) ? /* @__PURE__ */ x(f, {
					className: "mt-3",
					children: [U, z.major].filter((e) => e !== null).map((e) => /* @__PURE__ */ S(p, { children: [
						/* @__PURE__ */ x("span", {
							className: "font-medium",
							children: e.version
						}),
						e.security && /* @__PURE__ */ x(c, {
							tone: "warning",
							children: i("Security")
						}),
						e.major && /* @__PURE__ */ x(c, {
							tone: "neutral",
							children: i("New Major Version")
						}),
						/* @__PURE__ */ x("span", {
							className: "min-w-0 flex-1 truncate text-xs text-muted",
							children: e.host_problems.length ? i("Needs {what} on this host", { what: e.host_problems.join(", ") }) : e.incompatible.length ? i("Not for: {list}", { list: e.incompatible.join(", ") }) : ""
						}),
						e.notes_url && /* @__PURE__ */ x("a", {
							href: e.notes_url,
							target: "_blank",
							rel: "noreferrer",
							className: "text-xs text-muted underline",
							children: i("What Changed")
						}),
						/* @__PURE__ */ x(l, {
							size: "sm",
							variant: "primary",
							loading: M === "core",
							disabled: M !== null || e.host_problems.length > 0 || z.freshness === "expired" || z.freshness === "clock",
							onClick: () => void L(e),
							children: i("Update")
						})
					] }, e.version))
				}) : !z.managed && !z.trust ? /* @__PURE__ */ x("p", {
					className: "m-0 mt-3 text-sm text-muted",
					children: i("Up to date")
				}) : null,
				B.state === "done" && B.previous && /* @__PURE__ */ S("p", {
					className: "m-0 mt-3 flex flex-wrap items-center gap-2 text-sm text-muted",
					children: [i("Updated from {version}.", { version: B.previous }), /* @__PURE__ */ x(l, {
						size: "xs",
						variant: "ghost",
						disabled: M !== null,
						onClick: async () => {
							if (await _({
								title: i("Go back to {version}?", { version: B.previous }),
								description: i("The database stays as it is: updates within a major only add to it."),
								confirm: i("Go Back"),
								danger: !0
							})) try {
								await r("packages/update-rollback"), window.location.reload();
							} catch (e) {
								y.error(e);
							}
						},
						children: i("Go Back")
					})]
				}),
				!z.managed && /* @__PURE__ */ S("div", {
					className: "mt-4 flex flex-wrap items-center gap-3 text-sm text-text",
					children: [/* @__PURE__ */ x(g, {
						checked: z.auto,
						size: "sm",
						label: i("Install Security Updates Automatically"),
						onChange: (e) => void r("packages/update-auto", { on: e }).then(F)
					}), z.auto && U?.security && /* @__PURE__ */ x(l, {
						size: "sm",
						variant: "ghost",
						onClick: async () => {
							await r("packages/update-postpone", { days: 7 }), y.success(i("Postponed for 7 days")), await F();
						},
						children: i("Postpone 7 Days")
					})]
				})
			]
		}),
		P.advisories.length > 0 && /* @__PURE__ */ x(m, {
			title: i("Security Advisories"),
			children: /* @__PURE__ */ x(f, { children: P.advisories.map((e) => /* @__PURE__ */ S(p, { children: [
				/* @__PURE__ */ x(d, {
					name: "warning",
					size: 16,
					className: "shrink-0 text-warning"
				}),
				/* @__PURE__ */ x("span", {
					className: "min-w-0 flex-1 truncate",
					children: i("{name} {version} has a known security problem.", {
						name: e.label,
						version: e.version
					})
				}),
				e.advisory && /* @__PURE__ */ x("a", {
					href: e.advisory,
					target: "_blank",
					rel: "noreferrer",
					className: "text-xs underline",
					children: i("Read More")
				})
			] }, e.package)) })
		}),
		P.packages.length > 0 ? /* @__PURE__ */ S(m, {
			title: i("Plugins"),
			children: [/* @__PURE__ */ x(f, { children: P.packages.map((e) => /* @__PURE__ */ S(p, { children: [
				/* @__PURE__ */ x("span", {
					className: "min-w-0 truncate font-medium",
					children: e.label
				}),
				/* @__PURE__ */ S("span", {
					className: "shrink-0 text-xs text-muted",
					children: [
						e.installed,
						" → ",
						e.version
					]
				}),
				e.security && /* @__PURE__ */ x(c, {
					tone: "warning",
					children: i("Security")
				}),
				/* @__PURE__ */ x("span", {
					className: "min-w-0 flex-1 truncate text-xs text-muted",
					children: e.message
				}),
				e.allowed ? /* @__PURE__ */ x(l, {
					size: "sm",
					variant: "primary",
					loading: M === e.package,
					disabled: M !== null,
					onClick: () => void R(e.package, e.store, e.version),
					children: i("Update")
				}) : e.buy_url ? /* @__PURE__ */ x(l, {
					size: "sm",
					onClick: () => window.open(e.buy_url, "_blank", "noopener"),
					children: i("Extend License")
				}) : null,
				e.backup && /* @__PURE__ */ x(l, {
					size: "sm",
					variant: "ghost",
					disabled: M !== null,
					onClick: async () => {
						await r("packages/rollback", { package: e.package }), await F();
					},
					children: i("Go Back")
				})
			] }, e.package)) }), P.unverified.length > 0 && /* @__PURE__ */ x("p", {
				className: "mt-3 text-xs text-muted",
				children: i("Not from a store: {list}", { list: P.unverified.map((e) => k[e] ?? e).join(", ") })
			})]
		}) : V > 0 && /* @__PURE__ */ S(m, { children: [/* @__PURE__ */ x(u, {
			compact: !0,
			icon: H > 0 ? "check" : "plugin",
			title: i(H > 0 ? "All plugins are up to date" : "No plugins to check")
		}), H > 0 && P.unverified.length > 0 && /* @__PURE__ */ x("p", {
			className: "mt-3 text-center text-xs text-muted",
			children: i("Not from a store: {list}", { list: P.unverified.map((e) => k[e] ?? e).join(", ") })
		})] })
	] });
}
function D({ icon: e, children: t }) {
	return /* @__PURE__ */ S("p", {
		className: "m-0 mt-2 flex items-start gap-2 text-sm text-text",
		children: [/* @__PURE__ */ x(d, {
			name: e,
			size: 16,
			className: "mt-0.5 shrink-0 text-muted"
		}), /* @__PURE__ */ x("span", {
			className: "min-w-0",
			children: t
		})]
	});
}
export { E as UpdatesPanel };
