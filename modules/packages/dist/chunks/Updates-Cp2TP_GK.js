import { n as e, r as t } from "./installing-CCPtKzo4.js";
import { invalidate as n, run as r, t as i, timeAgo as a, useAbility as o } from "@letterncms/sdk";
import { useState as s } from "react";
import { Badge as c, Button as l, EmptyState as u, Icon as d, List as f, Row as p, Section as m, Skeleton as h, Switch as g, Tooltip as _, confirm as v, longDate as y, toast as b } from "@letterncms/ui";
import { Fragment as x, jsx as S, jsxs as C } from "react/jsx-runtime";
// admin/src/Updates.tsx
var w = [
	"downloading",
	"verifying",
	"extracting",
	"checking_files",
	"ready"
], T = (e) => ({
	downloading: i("Downloading…"),
	verifying: i("Checking the signature…"),
	extracting: i("Unpacking…"),
	checking_files: i("Checking every file…"),
	ready: i("Switching…"),
	migrating: i("Updating the database…"),
	checking: i("Checking the new version…")
})[e] ?? e, E = (e) => ({
	composer: i("Updates come through Composer"),
	git: i("Updates come through Composer"),
	file_mods: i("Updated through your deploy.")
})[e] ?? e;
function D() {
	let D = o("packages/updates"), k = o("packages/list", { type: "plugin" }), A = Object.fromEntries((k.data?.items ?? []).map((e) => [e.name, e.label])), [j, M] = s(null), [N, P] = s(null), F = D.data, I = async () => {
		n("packages/"), await D.refetch();
	}, L = async () => {
		P("check");
		try {
			let e = await r("packages/update-check");
			e.error && b.error(e.error), await I();
		} catch (e) {
			b.error(e);
		} finally {
			P(null);
		}
	}, R = async (e) => {
		if (!e.major || await v({
			title: i("Update to {version}?", { version: e.version }),
			description: [i("This is a new major version. Back up first, and read the release notes."), e.incompatible.length ? i("These plugins go inactive: {list}.", { list: e.incompatible.join(", ") }) : ""].filter(Boolean).join(" "),
			confirm: i("Update")
		})) {
			P("core");
			try {
				let n = await r("packages/update-start", { version: e.version });
				for (M(T(n.state)); w.includes(n.state);) n = await r("packages/update-step"), M(T(n.state));
				if (n.drive && (M(T("migrating")), await t() === "done")) {
					window.location.reload();
					return;
				}
				await I(), n.state === "failed" && b.error(n.error ?? i("The update failed. Nothing was changed."));
			} catch (e) {
				b.error(e), await I();
			} finally {
				P(null), M(null);
			}
		}
	}, z = async (t, n) => {
		P(t);
		try {
			let a = await r("packages/install", {
				package: t,
				version: n
			});
			await e(a), b.success(i("{name} updated", { name: t })), await I();
		} catch (e) {
			b.error(e), await I();
		} finally {
			P(null);
		}
	};
	if (D.isLoading || !F) return /* @__PURE__ */ S(h, { className: "h-40" });
	let { core: B, status: V } = F, H = k.data?.items.length ?? 0, U = Math.max(0, H - F.unverified.length), W = B.update;
	return /* @__PURE__ */ C("div", { children: [
		/* @__PURE__ */ C(m, {
			title: i("{brand} {version}", { version: B.current }),
			actions: /* @__PURE__ */ C(x, { children: [/* @__PURE__ */ S("span", {
				className: "text-xs text-faint",
				children: B.check.checked_at ? /* @__PURE__ */ S(_, {
					content: y((/* @__PURE__ */ new Date(B.check.checked_at * 1e3)).toISOString()),
					children: /* @__PURE__ */ S("time", {
						dateTime: (/* @__PURE__ */ new Date(B.check.checked_at * 1e3)).toISOString(),
						children: i("Checked {date}", { date: a((/* @__PURE__ */ new Date(B.check.checked_at * 1e3)).toISOString()) })
					})
				}) : i("Not checked yet")
			}), /* @__PURE__ */ S(l, {
				size: "sm",
				loading: N === "check",
				disabled: N !== null,
				onClick: () => void L(),
				children: i("Check Now")
			})] }),
			children: [
				B.managed ? /* @__PURE__ */ S(O, {
					icon: "info",
					children: E(B.managed)
				}) : B.trust === "dev_trust" ? /* @__PURE__ */ S(O, {
					icon: "info",
					children: i("This build has development keys, so updates are off.")
				}) : null,
				V.state === "rolled_back" && /* @__PURE__ */ S(O, {
					icon: "warning",
					children: i("The update to {version} failed and was undone. {error}", {
						version: V.target ?? "",
						error: V.error ?? ""
					})
				}),
				V.state === "failed" && /* @__PURE__ */ S(O, {
					icon: "warning",
					children: i("The last update stopped. Nothing changed. {error}", { error: V.error ?? "" })
				}),
				B.yanked && /* @__PURE__ */ S(O, {
					icon: "warning",
					children: i("This version was withdrawn: {reason}", { reason: B.yanked })
				}),
				B.support_ended && /* @__PURE__ */ S(O, {
					icon: "warning",
					children: i("Security fixes for this version ended in {date}.", { date: B.support_ended.until })
				}),
				B.check.error && !B.trust && /* @__PURE__ */ S(O, {
					icon: "info",
					children: i("The last check failed: {error}", { error: B.check.error })
				}),
				j && /* @__PURE__ */ C("p", {
					role: "status",
					className: "mt-3 flex items-center gap-2 text-sm text-text",
					children: [/* @__PURE__ */ S(d, {
						name: "spinner",
						size: 16,
						className: "animate-spin"
					}), j]
				}),
				!B.managed && (W || B.major) ? /* @__PURE__ */ S(f, {
					className: "mt-3",
					children: [W, B.major].filter((e) => e !== null).map((e) => /* @__PURE__ */ C(p, { children: [
						/* @__PURE__ */ S("span", {
							className: "font-medium",
							children: e.version
						}),
						e.security && /* @__PURE__ */ S(c, {
							tone: "warning",
							children: i("Security")
						}),
						e.major && /* @__PURE__ */ S(c, {
							tone: "neutral",
							children: i("New Major Version")
						}),
						/* @__PURE__ */ S("span", {
							className: "min-w-0 flex-1 truncate text-xs text-muted",
							children: e.host_problems.length ? i("Needs {what} on this host", { what: e.host_problems.join(", ") }) : e.incompatible.length ? i("Not for: {list}", { list: e.incompatible.join(", ") }) : ""
						}),
						e.notes_url && /* @__PURE__ */ S("a", {
							href: e.notes_url,
							target: "_blank",
							rel: "noreferrer",
							className: "text-xs text-muted underline",
							children: i("What Changed")
						}),
						/* @__PURE__ */ S(l, {
							size: "sm",
							variant: "primary",
							loading: N === "core",
							disabled: N !== null || e.host_problems.length > 0 || B.freshness === "expired" || B.freshness === "clock",
							onClick: () => void R(e),
							children: i("Update")
						})
					] }, e.version))
				}) : !B.managed && !B.trust ? /* @__PURE__ */ S("p", {
					className: "m-0 mt-3 text-sm text-muted",
					children: i("Up to date")
				}) : null,
				V.state === "done" && V.previous && /* @__PURE__ */ C("p", {
					className: "m-0 mt-3 flex flex-wrap items-center gap-2 text-sm text-muted",
					children: [i("Updated from {version}.", { version: V.previous }), /* @__PURE__ */ S(l, {
						size: "xs",
						variant: "ghost",
						disabled: N !== null,
						onClick: async () => {
							if (await v({
								title: i("Go back to {version}?", { version: V.previous }),
								description: i("The database stays as it is: updates within a major only add to it."),
								confirm: i("Go Back"),
								danger: !0
							})) try {
								await r("packages/update-rollback"), window.location.reload();
							} catch (e) {
								b.error(e);
							}
						},
						children: i("Go Back")
					})]
				}),
				!B.managed && /* @__PURE__ */ C("div", {
					className: "mt-4 flex flex-wrap items-center gap-3 text-sm text-text",
					children: [/* @__PURE__ */ S(g, {
						checked: B.auto,
						size: "sm",
						label: i("Install Security Updates Automatically"),
						onChange: (e) => void r("packages/update-auto", { on: e }).then(I)
					}), B.auto && W?.security && /* @__PURE__ */ S(l, {
						size: "sm",
						variant: "ghost",
						onClick: async () => {
							await r("packages/update-postpone", { days: 7 }), b.success(i("Postponed for 7 days")), await I();
						},
						children: i("Postpone 7 Days")
					})]
				})
			]
		}),
		F.advisories.length > 0 && /* @__PURE__ */ S(m, {
			title: i("Security Advisories"),
			children: /* @__PURE__ */ S(f, { children: F.advisories.map((e) => /* @__PURE__ */ C(p, { children: [
				/* @__PURE__ */ S(d, {
					name: "warning",
					size: 16,
					className: "shrink-0 text-warning"
				}),
				/* @__PURE__ */ S("span", {
					className: "min-w-0 flex-1 truncate",
					children: i("{name} {version} has a known security problem.", {
						name: e.label,
						version: e.version
					})
				}),
				e.advisory && /* @__PURE__ */ S("a", {
					href: e.advisory,
					target: "_blank",
					rel: "noreferrer",
					className: "text-xs underline",
					children: i("Read More")
				})
			] }, e.package)) })
		}),
		F.packages.length > 0 ? /* @__PURE__ */ C(m, {
			title: i("Plugins"),
			children: [/* @__PURE__ */ S(f, { children: F.packages.map((e) => /* @__PURE__ */ C(p, { children: [
				/* @__PURE__ */ S("span", {
					className: "min-w-0 truncate font-medium",
					children: e.label
				}),
				/* @__PURE__ */ C("span", {
					className: "shrink-0 text-xs text-muted",
					children: [
						e.installed,
						" → ",
						e.version
					]
				}),
				e.security && /* @__PURE__ */ S(c, {
					tone: "warning",
					children: i("Security")
				}),
				/* @__PURE__ */ S("span", { className: "flex-1" }),
				/* @__PURE__ */ S(l, {
					size: "sm",
					variant: "primary",
					loading: N === e.package,
					disabled: N !== null,
					onClick: () => void z(e.package, e.version),
					children: i("Update")
				}),
				e.backup && /* @__PURE__ */ S(l, {
					size: "sm",
					variant: "ghost",
					disabled: N !== null,
					onClick: async () => {
						await r("packages/rollback", { package: e.package }), await I();
					},
					children: i("Go Back")
				})
			] }, e.package)) }), F.unverified.length > 0 && /* @__PURE__ */ S("p", {
				className: "mt-3 text-xs text-muted",
				children: i("Not from a store: {list}", { list: F.unverified.map((e) => A[e] ?? e).join(", ") })
			})]
		}) : H > 0 && /* @__PURE__ */ C(m, { children: [/* @__PURE__ */ S(u, {
			compact: !0,
			icon: U > 0 ? "check" : "plugin",
			title: i(U > 0 ? "All plugins are up to date" : "No plugins to check")
		}), U > 0 && F.unverified.length > 0 && /* @__PURE__ */ S("p", {
			className: "mt-3 text-center text-xs text-muted",
			children: i("Not from a store: {list}", { list: F.unverified.map((e) => A[e] ?? e).join(", ") })
		})] })
	] });
}
function O({ icon: e, children: t }) {
	return /* @__PURE__ */ C("p", {
		className: "m-0 mt-2 flex items-start gap-2 text-sm text-text",
		children: [/* @__PURE__ */ S(d, {
			name: e,
			size: 16,
			className: "mt-0.5 shrink-0 text-muted"
		}), /* @__PURE__ */ S("span", {
			className: "min-w-0",
			children: t
		})]
	});
}
export { D as UpdatesPanel };
