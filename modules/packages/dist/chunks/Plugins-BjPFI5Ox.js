import { n as e, r as t, t as n } from "./installing-CCPtKzo4.js";
import { can as r, invalidate as i, loadManifest as a, locale as o, navigate as s, panelsFor as c, plural as l, registry as u, run as d, t as f, timeAgo as p, useAbility as m, useManifest as h, useTab as g } from "@letterncms/sdk";
import { useMemo as _, useRef as v, useState as y, useSyncExternalStore as b } from "react";
import { Badge as x, Button as S, DataView as C, EmptyState as w, Icon as T, IconButton as E, Input as D, List as O, Menu as k, NoMatches as A, Page as j, Row as M, Section as N, Select as P, Skeleton as F, Slideover as I, Switch as L, Tabs as R, cn as z, confirm as B, longDate as V, prompt as H, toast as U } from "@letterncms/ui";
import { Fragment as W, jsx as G, jsxs as K } from "react/jsx-runtime";
// admin/src/Store.tsx
var q = 2097152, J = (e) => {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
};
async function ee(e, t) {
	let n = crypto.randomUUID().replaceAll("-", "").slice(0, 24), r = new Uint8Array(await e.arrayBuffer()), i = null, a = Math.max(1, Math.ceil(r.length / q));
	for (let e = 0; e < a; e++) {
		let o = await d("packages/upload", {
			id: n,
			index: e,
			last: e === a - 1,
			allowUnsigned: t,
			data: J(r.subarray(e * q, (e + 1) * q))
		});
		e === a - 1 && (i = o);
	}
	return i;
}
var Y = (e) => e.pricing === "free" ? f("Free") : f("Paid");
function te() {
	let [t, a] = y("default"), s = m("packages/stores"), c = m("packages/catalog", { store: t }), [u, p] = y(""), [h, g] = y("all"), [b, x] = y(null), [C, E] = y(null), [O, k] = y(null), [j, M] = y(!0), N = v(null), I = c.data, R = m("packages/list", { type: "all" }), z = Object.fromEntries((R.data?.items ?? []).map((e) => [e.name, e.icon])), V = s.data?.items.find((e) => e.id === t), q = _(() => {
		let e = u.trim().toLowerCase();
		return (I?.items ?? []).filter((t) => (h === "all" || t.pricing === h || h === "paid" && t.pricing !== "free") && (e === "" || `${t.title} ${t.summary} ${t.package} ${t.categories.join(" ")}`.toLowerCase().includes(e)));
	}, [
		I,
		u,
		h
	]), J = async (e) => {
		i("packages/"), await c.refetch(), U.success(e);
	}, Y = async (t) => {
		E(t.package);
		try {
			let n = await d("packages/plan-install", {
				store: t.store,
				package: t.package,
				version: t.latest ?? void 0
			}), r = n.steps.filter((e) => !e.enable_only).map((e) => `${e.title} ${e.version}`);
			if (!await B({
				title: f("Install {name}?", { name: t.title }),
				description: [
					r.length > 1 ? f("Also installs what it needs: {list}.", { list: r.join(", ") }) : "",
					n.capabilities.length ? f("It may use: {list}.", { list: n.capabilities.join(", ") }) : "",
					f("This code runs with full access to your site.")
				].filter(Boolean).join(" "),
				confirm: t.installed ? f("Update") : f("Install")
			})) return;
			for (let r of n.steps) {
				if (r.enable_only) {
					await d("packages/enable", { name: r.package });
					continue;
				}
				k(f("Installing {name}…", { name: r.title }));
				let n = await d("packages/install", {
					store: t.store,
					package: r.package,
					version: r.version,
					turnOn: j
				});
				await e(n);
			}
			await J(t.installed ? f("{name} updated", { name: t.title }) : f("{name} installed", { name: t.title }));
		} catch (e) {
			U.error(e);
		} finally {
			E(null), k(null);
		}
	}, te = async (t) => {
		E("upload"), k(f("Uploading {name}…", { name: t.name }));
		try {
			let i = await ee(t, !1);
			try {
				i = await e(i);
			} catch (a) {
				if (!(a instanceof n) || a.code !== "unsigned" || !r("packages.install_unsigned")) throw a;
				if (!await B({
					title: f("Install {name} unsigned?", { name: t.name }),
					description: f("No store vouches for this file. It runs with full access to your site, and it gets no update offers."),
					confirm: f("Install Unsigned"),
					danger: !0
				})) return;
				i = await e(await ee(t, !0));
			}
			await J(f("{name} installed", { name: i.package ?? t.name }));
		} catch (e) {
			U.error(e);
		} finally {
			E(null), k(null), N.current && (N.current.value = "");
		}
	}, ne = async () => {
		let e = (await H({
			title: f("Add a store"),
			description: f("Code from a store runs with full access to this site. Add it only if you trust who runs it."),
			fields: [{
				handle: "url",
				type: "text",
				label: f("Store address"),
				required: !0,
				placeholder: "https://"
			}],
			confirm: f("Continue")
		}))?.url;
		if (e) try {
			let t = await d("packages/store-add", { url: e }), n = (await H({
				title: f("Confirm {name}", { name: t.name }),
				description: f("Compare this key fingerprint with the one in the store’s own documentation, then type it here: {fingerprint}", { fingerprint: t.fingerprint }),
				fields: [{
					handle: "fingerprint",
					type: "text",
					label: f("Key fingerprint"),
					required: !0
				}],
				confirm: f("Add Store")
			}))?.fingerprint;
			if (!n) return;
			let r = await d("packages/store-add", {
				url: e,
				confirm: n
			});
			if (!r.added) {
				U.error(f("That fingerprint does not match. The store was not added."));
				return;
			}
			await s.refetch(), a(r.id);
		} catch (e) {
			U.error(e);
		}
	}, X = async () => {
		E("refresh");
		try {
			let e = await d("packages/catalog", {
				store: t,
				refresh: !0
			});
			e.error && U.error(e.error), i("packages/catalog"), await c.refetch();
		} catch (e) {
			U.error(e);
		} finally {
			E(null);
		}
	}, Z = I ? I.problem === "dev_trust" ? f("This build has development keys, so the store is closed.") : I.problem ? f("No valid signing keys, so the store is off. Upload packages instead.") : I.freshness === "clock" ? f("This server’s clock looks wrong, so installs are paused.") : I.freshness === "expired" ? f("This catalog is out of date, so installs are off. Refresh it.") : I.freshness === "stale" ? f("This catalog is a few days old.") : I.error ? f("Can’t reach the store. {error}", { error: I.error }) : null : null;
	return /* @__PURE__ */ K("div", { children: [
		/* @__PURE__ */ K("div", {
			className: "mb-3 flex min-h-10 flex-wrap items-center gap-2",
			children: [
				(s.data?.items.length ?? 0) > 1 && /* @__PURE__ */ G("div", {
					className: "w-36",
					children: /* @__PURE__ */ G(P, {
						size: "sm",
						value: t,
						onChange: (e) => a(e ?? "default"),
						options: s.data.items.map((e) => ({
							value: e.id,
							label: e.name
						})),
						"aria-label": f("Store")
					})
				}),
				/* @__PURE__ */ G(D, {
					size: "sm",
					className: "w-full sm:w-60",
					icon: "search",
					value: u,
					onChange: (e) => p(e.target.value),
					placeholder: f("Search {items}…", { items: f("Plugins").toLocaleLowerCase(o()) }),
					"aria-label": f("Search")
				}),
				/* @__PURE__ */ G("div", {
					className: "w-24",
					children: /* @__PURE__ */ G(P, {
						size: "sm",
						value: h,
						onChange: (e) => g(e ?? "all"),
						"aria-label": f("Price"),
						options: [
							{
								value: "all",
								label: f("All")
							},
							{
								value: "free",
								label: f("Free")
							},
							{
								value: "paid",
								label: f("Paid")
							}
						]
					})
				}),
				/* @__PURE__ */ G(L, {
					checked: j,
					onChange: M,
					size: "sm",
					label: f("Turn On After Install")
				}),
				/* @__PURE__ */ G("input", {
					ref: N,
					type: "file",
					accept: ".zip,application/zip",
					className: "hidden",
					onChange: (e) => e.target.files?.[0] && void te(e.target.files[0])
				}),
				/* @__PURE__ */ K("div", {
					className: "ml-auto flex flex-wrap items-center gap-1",
					children: [
						/* @__PURE__ */ G(S, {
							variant: "ghost",
							icon: "refresh",
							loading: C === "refresh",
							disabled: C !== null,
							onClick: () => void X(),
							children: f("Refresh")
						}),
						/* @__PURE__ */ G(S, {
							variant: "ghost",
							icon: "upload",
							disabled: C !== null,
							onClick: () => N.current?.click(),
							children: f("Upload Zip")
						}),
						/* @__PURE__ */ G(S, {
							variant: "ghost",
							icon: "plus",
							onClick: () => void ne(),
							children: f("Add Store")
						}),
						V && !V.default && /* @__PURE__ */ G(S, {
							variant: "ghost",
							icon: "trash",
							className: "!text-danger",
							onClick: async () => {
								await B({
									title: f("Remove {name}?", { name: V.name }),
									description: f("What it installed stays, without update offers."),
									confirm: f("Remove Store"),
									danger: !0
								}) && (await d("packages/store-remove", { id: t }), a("default"), await s.refetch());
							},
							children: f("Remove Store")
						})
					]
				})
			]
		}),
		O && /* @__PURE__ */ G("p", {
			role: "status",
			className: "mb-4 text-sm text-muted",
			children: O
		}),
		Z && /* @__PURE__ */ K("p", {
			className: "mb-4 flex items-center gap-2 border-y border-border py-3 text-sm text-text",
			children: [/* @__PURE__ */ G(T, {
				name: "info",
				size: 16,
				className: "shrink-0 text-muted"
			}), Z]
		}),
		c.isLoading ? /* @__PURE__ */ G("div", {
			className: "grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3",
			children: [
				0,
				1,
				2
			].map((e) => /* @__PURE__ */ G(F, { className: "h-36" }, e))
		}) : q.length === 0 ? u.trim() !== "" || h !== "all" ? /* @__PURE__ */ G(A, { onClear: () => {
			p(""), g("all");
		} }) : /* @__PURE__ */ G(w, {
			icon: "download",
			title: f("Nothing in this store yet"),
			action: /* @__PURE__ */ G(S, {
				onClick: () => N.current?.click(),
				children: f("Upload a Zip")
			})
		}) : /* @__PURE__ */ K(W, { children: [/* @__PURE__ */ G("p", {
			className: "mb-2 text-xs text-muted",
			children: l(q.length, "{count} plugin", "{count} plugins")
		}), /* @__PURE__ */ G("div", {
			className: "grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3",
			children: q.map((e) => /* @__PURE__ */ G(re, {
				item: e,
				icon: z[e.package],
				busy: C === e.package,
				locked: C !== null,
				onOpen: () => x(e),
				onInstall: () => void Y(e)
			}, e.package))
		})] }),
		b && /* @__PURE__ */ G(ie, {
			item: b,
			onClose: () => x(null),
			locked: C !== null,
			onInstall: () => void Y(b)
		})
	] });
}
function ne({ item: e, icon: t }) {
	return e.icon ? /* @__PURE__ */ G("img", {
		src: e.icon,
		alt: "",
		className: "size-8 shrink-0 rounded-md object-cover",
		loading: "lazy"
	}) : /* @__PURE__ */ G("span", {
		className: "grid size-8 shrink-0 place-items-center rounded-md bg-sunken text-muted",
		children: /* @__PURE__ */ G(T, {
			name: t || "plugin",
			size: 16
		})
	});
}
function X({ item: e, busy: t, locked: n, onInstall: r }) {
	switch (e.action) {
		case "install":
		case "update": return /* @__PURE__ */ G(S, {
			size: "sm",
			variant: "primary",
			loading: t,
			disabled: n,
			onClick: r,
			children: e.action === "update" ? f("Update") : f("Install")
		});
		case "buy": return e.listing_url ? /* @__PURE__ */ G(S, {
			size: "sm",
			onClick: () => window.open(e.listing_url, "_blank", "noopener"),
			children: f("Buy on Store")
		}) : /* @__PURE__ */ G("span", {
			className: "text-xs text-muted",
			children: f("Paid Plugin")
		});
		case "installed": return /* @__PURE__ */ G("span", {
			className: "text-xs text-muted",
			children: f("Installed")
		});
		case "blocked": return /* @__PURE__ */ G(x, {
			tone: "danger",
			children: f("Blocked")
		});
		default: return /* @__PURE__ */ G("span", {
			className: "text-xs text-muted",
			children: f("Not for this version")
		});
	}
}
function re({ item: e, icon: t, busy: n, locked: r, onOpen: i, onInstall: a }) {
	return /* @__PURE__ */ K("article", {
		className: "flex min-w-0 flex-col gap-2 rounded-lg border border-border p-3",
		children: [
			/* @__PURE__ */ K("div", {
				className: "flex min-w-0 items-center gap-2.5",
				children: [
					/* @__PURE__ */ G(ne, {
						item: e,
						icon: t
					}),
					/* @__PURE__ */ K("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ G("button", {
							type: "button",
							onClick: i,
							className: "block max-w-full cursor-pointer truncate border-0 bg-transparent p-0 text-left text-sm font-medium text-ink hover:underline",
							children: e.title
						}), !e.first_party && /* @__PURE__ */ G("p", {
							className: "m-0 truncate text-xs text-muted",
							children: e.author.name || e.package
						})]
					}),
					/* @__PURE__ */ G(x, { children: Y(e) })
				]
			}),
			/* @__PURE__ */ G("p", {
				className: "m-0 line-clamp-2 min-h-8 flex-1 text-xs text-text",
				children: e.summary
			}),
			/* @__PURE__ */ K("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ G("span", {
					className: "text-xs text-muted",
					children: e.latest ?? "—"
				}), /* @__PURE__ */ G(X, {
					item: e,
					busy: n,
					locked: r,
					onInstall: a
				})]
			})
		]
	});
}
function ie({ item: e, onClose: t, locked: n, onInstall: r }) {
	let a = m("packages/item", {
		store: e.store,
		package: e.package
	}), o = a.data, [s, c] = y(!1), l = async () => {
		let e = (await H({
			title: f("Add Key"),
			fields: [{
				handle: "key",
				type: "textarea",
				label: f("Key"),
				required: !0
			}],
			confirm: f("Add Key")
		}))?.key;
		if (e) try {
			await d("packages/add-key", { key: e }), i("packages/"), U.success(f("Key added")), t();
		} catch (e) {
			U.error(e);
		}
	};
	return /* @__PURE__ */ G(I, {
		id: "store-item",
		open: !0,
		expanded: s,
		onExpandedChange: c,
		onOpenChange: (e) => {
			e || t();
		},
		title: e.title,
		icon: "plugin",
		children: /* @__PURE__ */ K("div", {
			className: "space-y-4 p-4 text-sm",
			children: [
				/* @__PURE__ */ K("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ G(X, {
							item: e,
							busy: !1,
							locked: n,
							onInstall: r
						}),
						e.access.message && /* @__PURE__ */ G("span", {
							className: "text-xs text-muted",
							children: e.access.message
						}),
						e.action === "buy" && /* @__PURE__ */ G(S, {
							size: "sm",
							disabled: n,
							onClick: () => void l(),
							children: f("Add Key")
						})
					]
				}),
				/* @__PURE__ */ G("p", {
					className: "m-0 text-xs text-muted",
					children: o ? f("Sold by {operator}, made by {author}", {
						operator: o.operator,
						author: e.author.name || e.package
					}) : e.package
				}),
				a.isLoading ? /* @__PURE__ */ G(F, { className: "h-32" }) : o?.description_html ? /* @__PURE__ */ G("div", {
					className: "cms-store-description",
					dangerouslySetInnerHTML: { __html: o.description_html }
				}) : /* @__PURE__ */ G("p", {
					className: "m-0",
					children: e.summary
				}),
				(o?.screenshots.length ?? 0) > 0 && /* @__PURE__ */ G("div", {
					className: "grid gap-2",
					children: o.screenshots.map((e) => /* @__PURE__ */ G("img", {
						src: e,
						alt: "",
						className: "w-full rounded border border-border",
						loading: "lazy"
					}, e))
				}),
				o && o.capabilities.length > 0 && /* @__PURE__ */ K("p", {
					className: "m-0",
					children: [/* @__PURE__ */ K("span", {
						className: "font-medium",
						children: [f("It may use"), ": "]
					}), o.capabilities.join(", ")]
				}),
				o && (o.requires.core || o.requires.php) && /* @__PURE__ */ G("p", {
					className: "m-0 text-xs text-muted",
					children: [o.requires.core && f("Needs {brand} {version}", { version: o.requires.core }), o.requires.php && `PHP ${o.requires.php}`].filter(Boolean).join(" · ")
				})
			]
		})
	});
}
// admin/src/Updates.tsx
var Z = [
	"downloading",
	"verifying",
	"extracting",
	"checking_files",
	"ready"
], Q = (e) => ({
	downloading: f("Downloading…"),
	verifying: f("Checking the signature…"),
	extracting: f("Unpacking…"),
	checking_files: f("Checking every file…"),
	ready: f("Switching…"),
	migrating: f("Updating the database…"),
	checking: f("Checking the new version…")
})[e] ?? e, ae = (e) => ({
	composer: f("Managed with Composer: run composer update."),
	git: f("Managed with Composer: run composer update."),
	file_mods: f("Updated through your deploy.")
})[e] ?? e;
function oe() {
	let n = m("packages/updates"), r = m("packages/list", { type: "all" }), a = Object.fromEntries((r.data?.items ?? []).map((e) => [e.name, e.label])), [o, s] = y(null), [c, l] = y(null), u = n.data, h = async () => {
		i("packages/"), await n.refetch();
	}, g = async () => {
		l("check");
		try {
			let e = await d("packages/update-check");
			e.error && U.error(e.error), await h();
		} catch (e) {
			U.error(e);
		} finally {
			l(null);
		}
	}, _ = async (e) => {
		if (!e.major || await B({
			title: f("Update to {version}?", { version: e.version }),
			description: [f("This is a new major version. Back up first, and read the release notes."), e.incompatible.length ? f("These plugins go inactive: {list}.", { list: e.incompatible.join(", ") }) : ""].filter(Boolean).join(" "),
			confirm: f("Update")
		})) {
			l("core");
			try {
				let n = await d("packages/update-start", { version: e.version });
				for (s(Q(n.state)); Z.includes(n.state);) n = await d("packages/update-step"), s(Q(n.state));
				if (n.drive && (s(Q("migrating")), await t() === "done")) {
					window.location.reload();
					return;
				}
				await h(), n.state === "failed" && U.error(n.error ?? f("The update failed. Nothing was changed."));
			} catch (e) {
				U.error(e), await h();
			} finally {
				l(null), s(null);
			}
		}
	}, v = async (t, n, r) => {
		l(t);
		try {
			let i = await d("packages/install", {
				store: n,
				package: t,
				version: r
			});
			await e(i), U.success(f("{name} updated", { name: t })), await h();
		} catch (e) {
			U.error(e), await h();
		} finally {
			l(null);
		}
	};
	if (n.isLoading || !u) return /* @__PURE__ */ G(F, { className: "h-40" });
	let { core: b, status: C } = u, E = b.update;
	return /* @__PURE__ */ K("div", { children: [
		/* @__PURE__ */ K(N, {
			title: f("{brand} {version}", { version: b.current }),
			actions: /* @__PURE__ */ K(W, { children: [/* @__PURE__ */ G("span", {
				className: "text-xs text-faint",
				children: b.check.checked_at ? /* @__PURE__ */ G("time", {
					dateTime: (/* @__PURE__ */ new Date(b.check.checked_at * 1e3)).toISOString(),
					title: V((/* @__PURE__ */ new Date(b.check.checked_at * 1e3)).toISOString()),
					children: f("Checked {date}", { date: p((/* @__PURE__ */ new Date(b.check.checked_at * 1e3)).toISOString()) })
				}) : f("Not checked yet")
			}), /* @__PURE__ */ G(S, {
				size: "sm",
				loading: c === "check",
				disabled: c !== null,
				onClick: () => void g(),
				children: f("Check Now")
			})] }),
			children: [
				b.managed ? /* @__PURE__ */ G($, {
					icon: "info",
					children: ae(b.managed)
				}) : b.trust === "dev_trust" ? /* @__PURE__ */ G($, {
					icon: "info",
					children: f("This build has development keys, so updates are off.")
				}) : null,
				C.state === "rolled_back" && /* @__PURE__ */ G($, {
					icon: "warning",
					children: f("The update to {version} failed and was undone. {error}", {
						version: C.target ?? "",
						error: C.error ?? ""
					})
				}),
				C.state === "failed" && /* @__PURE__ */ G($, {
					icon: "warning",
					children: f("The last update stopped. Nothing changed. {error}", { error: C.error ?? "" })
				}),
				b.yanked && /* @__PURE__ */ G($, {
					icon: "warning",
					children: f("This version was withdrawn: {reason}", { reason: b.yanked })
				}),
				b.support_ended && /* @__PURE__ */ G($, {
					icon: "warning",
					children: f("Security fixes for this version ended in {date}.", { date: b.support_ended.until })
				}),
				b.check.error && !b.trust && /* @__PURE__ */ G($, {
					icon: "info",
					children: f("The last check failed: {error}", { error: b.check.error })
				}),
				o && /* @__PURE__ */ K("p", {
					role: "status",
					className: "mt-3 flex items-center gap-2 text-sm text-text",
					children: [/* @__PURE__ */ G(T, {
						name: "spinner",
						size: 16,
						className: "animate-spin"
					}), o]
				}),
				!b.managed && (E || b.major) ? /* @__PURE__ */ G(O, {
					className: "mt-3",
					children: [E, b.major].filter((e) => e !== null).map((e) => /* @__PURE__ */ K(M, { children: [
						/* @__PURE__ */ G("span", {
							className: "font-medium",
							children: e.version
						}),
						e.security && /* @__PURE__ */ G(x, {
							tone: "warning",
							children: f("Security")
						}),
						e.major && /* @__PURE__ */ G(x, {
							tone: "neutral",
							children: f("New Major Version")
						}),
						/* @__PURE__ */ G("span", {
							className: "min-w-0 flex-1 truncate text-xs text-muted",
							children: e.host_problems.length ? f("Needs {what} on this host", { what: e.host_problems.join(", ") }) : e.incompatible.length ? f("Not for: {list}", { list: e.incompatible.join(", ") }) : ""
						}),
						e.notes_url && /* @__PURE__ */ G("a", {
							href: e.notes_url,
							target: "_blank",
							rel: "noreferrer",
							className: "text-xs text-muted underline",
							children: f("What Changed")
						}),
						/* @__PURE__ */ G(S, {
							size: "sm",
							variant: "primary",
							loading: c === "core",
							disabled: c !== null || e.host_problems.length > 0 || b.freshness === "expired" || b.freshness === "clock",
							onClick: () => void _(e),
							children: f("Update")
						})
					] }, e.version))
				}) : !b.managed && !b.trust ? /* @__PURE__ */ G("p", {
					className: "m-0 mt-3 text-sm text-muted",
					children: f("Up to date.")
				}) : null,
				C.state === "done" && C.previous && /* @__PURE__ */ K("p", {
					className: "m-0 mt-3 text-sm text-muted",
					children: [
						f("Updated from {version}.", { version: C.previous }),
						" ",
						/* @__PURE__ */ G("button", {
							type: "button",
							className: "cursor-pointer border-0 bg-transparent p-0 text-sm underline",
							disabled: c !== null,
							onClick: async () => {
								if (await B({
									title: f("Go back to {version}?", { version: C.previous }),
									description: f("The database stays as it is: updates within a major only add to it."),
									confirm: f("Go Back"),
									danger: !0
								})) try {
									await d("packages/update-rollback"), window.location.reload();
								} catch (e) {
									U.error(e);
								}
							},
							children: f("Go Back")
						})
					]
				}),
				!b.managed && /* @__PURE__ */ K("div", {
					className: "mt-4 flex flex-wrap items-center gap-3 text-sm text-text",
					children: [/* @__PURE__ */ G(L, {
						checked: b.auto,
						size: "sm",
						label: f("Install Security Updates Automatically"),
						onChange: (e) => void d("packages/update-auto", { on: e }).then(h)
					}), b.auto && E?.security && /* @__PURE__ */ G(S, {
						size: "sm",
						variant: "ghost",
						onClick: async () => {
							await d("packages/update-postpone", { days: 7 }), U.success(f("Postponed for 7 days")), await h();
						},
						children: f("Postpone 7 Days")
					})]
				})
			]
		}),
		u.advisories.length > 0 && /* @__PURE__ */ G(N, {
			title: f("Security Advisories"),
			children: /* @__PURE__ */ G(O, { children: u.advisories.map((e) => /* @__PURE__ */ K(M, { children: [
				/* @__PURE__ */ G(T, {
					name: "warning",
					size: 16,
					className: "shrink-0 text-warning"
				}),
				/* @__PURE__ */ G("span", {
					className: "min-w-0 flex-1 truncate",
					children: f("{name} {version} has a known security problem.", {
						name: e.label,
						version: e.version
					})
				}),
				e.advisory && /* @__PURE__ */ G("a", {
					href: e.advisory,
					target: "_blank",
					rel: "noreferrer",
					className: "text-xs underline",
					children: f("Read More")
				})
			] }, e.package)) })
		}),
		/* @__PURE__ */ K(N, {
			title: f("Plugins"),
			children: [u.packages.length === 0 ? /* @__PURE__ */ G(w, {
				icon: "check",
				title: f("All plugins are up to date"),
				className: "py-8"
			}) : /* @__PURE__ */ G(O, { children: u.packages.map((e) => /* @__PURE__ */ K(M, { children: [
				/* @__PURE__ */ G("span", {
					className: "min-w-0 truncate font-medium",
					children: e.label
				}),
				/* @__PURE__ */ K("span", {
					className: "shrink-0 text-xs text-muted",
					children: [
						e.installed,
						" → ",
						e.version
					]
				}),
				e.security && /* @__PURE__ */ G(x, {
					tone: "warning",
					children: f("Security")
				}),
				/* @__PURE__ */ G("span", {
					className: "min-w-0 flex-1 truncate text-xs text-muted",
					children: e.message
				}),
				e.allowed ? /* @__PURE__ */ G(S, {
					size: "sm",
					variant: "primary",
					loading: c === e.package,
					disabled: c !== null,
					onClick: () => void v(e.package, e.store, e.version),
					children: f("Update")
				}) : e.buy_url ? /* @__PURE__ */ G(S, {
					size: "sm",
					onClick: () => window.open(e.buy_url, "_blank", "noopener"),
					children: f("Extend License")
				}) : null,
				e.backup && /* @__PURE__ */ G(S, {
					size: "sm",
					variant: "ghost",
					disabled: c !== null,
					onClick: async () => {
						await d("packages/rollback", { package: e.package }), await h();
					},
					children: f("Go Back")
				})
			] }, e.package)) }), u.unverified.length > 0 && /* @__PURE__ */ G("p", {
				className: "mt-3 text-xs text-muted",
				children: f("Not from a store: {list}", { list: u.unverified.map((e) => a[e] ?? e).join(", ") })
			})]
		})
	] });
}
function $({ icon: e, children: t }) {
	return /* @__PURE__ */ K("p", {
		className: "m-0 mt-2 flex items-start gap-2 text-sm text-text",
		children: [/* @__PURE__ */ G(T, {
			name: e,
			size: 16,
			className: "mt-0.5 shrink-0 text-muted"
		}), /* @__PURE__ */ G("span", {
			className: "min-w-0",
			children: t
		})]
	});
}
// admin/src/Plugins.tsx
function se(e, t) {
	if (!t.active) return;
	let n = t.settings.map((t) => e.nav.find((e) => e.id === `settings.${t}`)).find((e) => !!e);
	if (n) return {
		path: n.path,
		settings: !0
	};
	let r = new Set(e.settingsNav.flatMap((e) => e.items)), i = e.nav.filter((e) => e.package === t.name && !e.home), a = i.find((e) => r.has(e.id)) ?? i[0];
	return a && {
		path: a.path,
		settings: r.has(a.id)
	};
}
function ce() {
	b(u.panels.subscribe, u.panels.version);
	let e = c("plugins.tabs", {}), [t, n] = g([
		"installed",
		"store",
		"updates",
		...e.map((e) => e.id)
	]), r = m("packages/list", { type: "all" }), [o, l] = y(null), [p, _] = y(!1), v = r.data?.items ?? [], x = v.filter((e) => !e.core).sort((e, t) => e.label.localeCompare(t.label)), E = v.filter((e) => e.active && e.installedVersion !== e.version), D = Object.fromEntries(v.map((e) => [e.name, e.label])), O = e.find((e) => e.id === t)?.component, k = h(), A = async (e, t, n, o) => {
		l(e.name);
		try {
			await d(t, n), t === "packages/enable" && await d("packages/sync").catch(() => {}), await Promise.all([a(), r.refetch()]), i("packages/"), U.success(o);
		} catch (e) {
			U.error(e);
		} finally {
			l(null);
		}
	};
	return /* @__PURE__ */ K(j, {
		width: "wide",
		crumbs: [{
			label: f("Plugins"),
			icon: "plugin"
		}],
		children: [
			E.length > 0 && /* @__PURE__ */ K("div", {
				className: "mb-6 flex items-center gap-3 border-y border-border py-3 text-sm",
				children: [
					/* @__PURE__ */ G(T, {
						name: "database",
						size: 16,
						className: "shrink-0 text-warning"
					}),
					/* @__PURE__ */ G("span", {
						className: "flex-1 text-text",
						children: f("Database updates are waiting")
					}),
					/* @__PURE__ */ G(S, {
						size: "sm",
						variant: "primary",
						loading: p,
						onClick: async () => {
							_(!0);
							try {
								await d("packages/sync"), await Promise.all([a(), r.refetch()]), U.success(f("Database is up to date"));
							} catch (e) {
								U.error(e);
							} finally {
								_(!1);
							}
						},
						children: f("Update")
					})
				]
			}),
			/* @__PURE__ */ G(R, {
				className: "mb-4",
				value: t,
				onChange: n,
				tabs: [
					{
						value: "installed",
						label: f("Installed"),
						count: r.data ? x.length : void 0
					},
					{
						value: "store",
						label: f("Store")
					},
					{
						value: "updates",
						label: f("Updates")
					},
					...e.map((e) => ({
						value: e.id,
						label: e.label ?? e.id
					}))
				]
			}),
			t === "store" && /* @__PURE__ */ G(te, {}),
			t === "updates" && /* @__PURE__ */ G(oe, {}),
			O && /* @__PURE__ */ G(O, {}),
			t === "installed" && /* @__PURE__ */ G(C, {
				id: "packages.plugins",
				label: f("Plugins"),
				items: x,
				rowKey: (e) => e.name,
				onRowClick: (e) => {
					let t = se(k, e);
					t && s(t.path);
				},
				searchText: (e) => `${e.label} ${e.description} ${e.name}`,
				icon: "plugin",
				loading: r.isLoading,
				error: r.isError,
				onRetry: () => void r.refetch(),
				columns: [
					{
						id: "name",
						label: f("Name"),
						width: "minmax(128px,1fr)",
						value: (e) => e.label,
						render: (e) => /* @__PURE__ */ K("span", {
							className: "flex min-w-0 items-center gap-2",
							children: [
								/* @__PURE__ */ G(T, {
									name: e.icon,
									size: 16,
									className: "shrink-0 text-muted"
								}),
								/* @__PURE__ */ G("span", {
									className: "shrink-0",
									children: e.label
								}),
								/* @__PURE__ */ G("span", {
									title: e.problem ?? e.description,
									className: z("ml-1 min-w-0 truncate font-normal max-sm:hidden", e.problem ? "text-warning" : "text-muted"),
									children: e.problem ?? le(e.description)
								})
							]
						})
					},
					{
						id: "version",
						label: f("Version"),
						width: "80px",
						value: (e) => e.version,
						render: (e) => /* @__PURE__ */ G("span", {
							className: "tabular-nums",
							children: e.version
						})
					},
					{
						id: "on",
						label: f("On"),
						width: "36px",
						value: (e) => Number(e.active),
						render: (e) => /* @__PURE__ */ G(ue, {
							pkg: e,
							labels: D,
							locked: o !== null,
							onAct: A
						})
					}
				],
				actions: (e) => /* @__PURE__ */ G(de, {
					pkg: e,
					place: se(k, e),
					busy: o === e.name,
					locked: o !== null,
					onAct: A
				}),
				empty: /* @__PURE__ */ G(w, {
					icon: "plugin",
					title: f("No plugins yet"),
					action: /* @__PURE__ */ G(S, {
						onClick: () => n("store"),
						children: f("Open Store")
					})
				})
			}),
			t === "installed" && (r.data?.errors ?? []).length > 0 && /* @__PURE__ */ G("div", {
				className: "mt-6 space-y-1 border-t border-border pt-4 text-xs text-danger",
				children: r.data.errors.map((e) => /* @__PURE__ */ G("p", {
					className: "m-0",
					children: e
				}, e))
			})
		]
	});
}
function le(e) {
	return e.split(/[:;,]\s|\.(\s|$)/)[0].trim();
}
function ue({ pkg: e, labels: t, locked: n, onAct: r }) {
	if (e.problem) return /* @__PURE__ */ K("span", {
		title: e.problem,
		className: "flex",
		children: [/* @__PURE__ */ G(T, {
			name: "warning",
			size: 16,
			className: "text-warning"
		}), /* @__PURE__ */ G("span", {
			className: "sr-only",
			children: e.problem
		})]
	});
	let i = e.required ? f("Required") : e.enabled && e.dependents.length ? f("Needed by {names}", { names: e.dependents.map((e) => t[e] ?? e).join(", ") }) : void 0;
	return /* @__PURE__ */ G("span", {
		title: i,
		className: "flex",
		children: /* @__PURE__ */ G(L, {
			size: "sm",
			checked: e.enabled,
			disabled: n || !!i,
			onChange: (t) => void r(e, t ? "packages/enable" : "packages/disable", { name: e.name }, f(t ? "{name} enabled" : "{name} disabled", { name: e.label })),
			"aria-label": f("{name} on", { name: e.label })
		})
	});
}
function de({ pkg: e, place: t, busy: n, locked: r, onAct: i }) {
	return /* @__PURE__ */ G(k, {
		trigger: /* @__PURE__ */ G(E, {
			icon: "more",
			label: f("Actions for {name}", { name: e.label }),
			size: "xs",
			disabled: n
		}),
		items: [
			t?.settings && {
				label: f("Settings"),
				icon: "settings",
				onSelect: () => s(t.path)
			},
			!!e.problem && e.enabled && !e.required && {
				label: f("Turn Off"),
				icon: "toggle",
				disabled: r || e.dependents.length > 0,
				onSelect: () => void i(e, "packages/disable", { name: e.name }, f("{name} disabled", { name: e.label }))
			},
			{
				label: f("Uninstall…"),
				icon: "trash",
				danger: !0,
				disabled: e.dependents.length > 0 || r,
				onSelect: async () => {
					await B({
						title: f("Uninstall {name}?", { name: e.label }),
						description: f("Its database tables, settings and files are removed."),
						confirm: f("Uninstall"),
						danger: !0
					}) && await i(e, "packages/uninstall", {
						name: e.name,
						deleteFiles: !0
					}, f("{name} uninstalled", { name: e.label }));
				}
			}
		]
	});
}
export { ce as default };
