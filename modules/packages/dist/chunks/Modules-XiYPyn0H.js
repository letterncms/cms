import { n as e, r as t, t as n } from "./installing-CCPtKzo4.js";
import { can as r, invalidate as i, loadManifest as a, navigate as o, plural as s, run as c, t as l, useAbility as u, useTab as d } from "@letterncms/sdk";
import { useMemo as f, useRef as p, useState as m } from "react";
import { Badge as h, Button as g, DataView as _, EmptyState as v, Icon as y, IconButton as b, Input as x, List as S, Menu as C, Page as w, Row as T, Section as E, Select as D, Skeleton as O, Slideover as k, Switch as A, Tabs as j, confirm as M, prompt as N, toast as P } from "@letterncms/ui";
import { Fragment as F, jsx as I, jsxs as L } from "react/jsx-runtime";
// admin/src/Store.tsx
var R = 2097152, z = (e) => {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
};
async function B(e, t) {
	let n = crypto.randomUUID().replaceAll("-", "").slice(0, 24), r = new Uint8Array(await e.arrayBuffer()), i = null, a = Math.max(1, Math.ceil(r.length / R));
	for (let e = 0; e < a; e++) {
		let o = await c("packages/upload", {
			id: n,
			index: e,
			last: e === a - 1,
			allowUnsigned: t,
			data: z(r.subarray(e * R, (e + 1) * R))
		});
		e === a - 1 && (i = o);
	}
	return i;
}
var V = (e) => e.pricing === "free" ? l("Free") : l("Paid");
function H() {
	let [t, a] = m("default"), o = u("packages/stores"), d = u("packages/catalog", { store: t }), [h, _] = m(""), [S, w] = m("all"), [T, E] = m(null), [k, j] = m(null), [R, z] = m(null), [V, H] = m(!0), U = p(null), W = d.data, q = f(() => {
		let e = h.trim().toLowerCase();
		return (W?.items ?? []).filter((t) => (S === "all" || t.pricing === S || S === "paid" && t.pricing !== "free") && (e === "" || `${t.title} ${t.summary} ${t.package} ${t.categories.join(" ")}`.toLowerCase().includes(e)));
	}, [
		W,
		h,
		S
	]), J = async (e) => {
		i("packages/"), await d.refetch(), P.success(e);
	}, Y = async (t) => {
		j(t.package);
		try {
			let n = await c("packages/plan-install", {
				store: t.store,
				package: t.package,
				version: t.latest ?? void 0
			}), r = n.steps.filter((e) => !e.enable_only).map((e) => `${e.title} ${e.version}`);
			if (!await M({
				title: l("Install {name}?", { name: t.title }),
				description: [
					r.length > 1 ? l("Also installs what it needs: {list}.", { list: r.join(", ") }) : "",
					n.capabilities.length ? l("It may use: {list}.", { list: n.capabilities.join(", ") }) : "",
					l("This code runs with full access to your site.")
				].filter(Boolean).join(" "),
				confirm: t.installed ? l("Update") : l("Install")
			})) return;
			for (let r of n.steps) {
				if (r.enable_only) {
					await c("packages/enable", { name: r.package });
					continue;
				}
				z(l("Installing {name}…", { name: r.title }));
				let n = await c("packages/install", {
					store: t.store,
					package: r.package,
					version: r.version,
					turnOn: V
				});
				await e(n);
			}
			await J(t.installed ? l("{name} updated", { name: t.title }) : l("{name} installed", { name: t.title }));
		} catch (e) {
			P.error(e);
		} finally {
			j(null), z(null);
		}
	}, X = async (t) => {
		j("upload"), z(l("Uploading {name}…", { name: t.name }));
		try {
			let i = await B(t, !1);
			try {
				i = await e(i);
			} catch (a) {
				if (!(a instanceof n) || a.code !== "unsigned" || !r("packages.install_unsigned")) throw a;
				if (!await M({
					title: l("Install {name} unsigned?", { name: t.name }),
					description: l("No store vouches for this file. It runs with full access to your site, and it gets no update offers."),
					confirm: l("Install Unsigned"),
					danger: !0
				})) return;
				i = await e(await B(t, !0));
			}
			await J(l("{name} installed", { name: i.package ?? t.name }));
		} catch (e) {
			P.error(e);
		} finally {
			j(null), z(null), U.current && (U.current.value = "");
		}
	}, Z = async () => {
		let e = (await N({
			title: l("Add a store"),
			description: l("Code from a store runs with full access to this site. Add it only if you trust who runs it."),
			fields: [{
				handle: "url",
				type: "text",
				label: l("Store address"),
				required: !0,
				placeholder: "https://"
			}],
			confirm: l("Continue")
		}))?.url;
		if (e) try {
			let t = await c("packages/store-add", { url: e }), n = (await N({
				title: l("Confirm {name}", { name: t.name }),
				description: l("Compare this key fingerprint with the one in the store’s own documentation, then type it here: {fingerprint}", { fingerprint: t.fingerprint }),
				fields: [{
					handle: "fingerprint",
					type: "text",
					label: l("Key fingerprint"),
					required: !0
				}],
				confirm: l("Add Store")
			}))?.fingerprint;
			if (!n) return;
			let r = await c("packages/store-add", {
				url: e,
				confirm: n
			});
			if (!r.added) {
				P.error(l("That fingerprint does not match. The store was not added."));
				return;
			}
			await o.refetch(), a(r.id);
		} catch (e) {
			P.error(e);
		}
	}, Q = async () => {
		j("refresh");
		try {
			let e = await c("packages/catalog", {
				store: t,
				refresh: !0
			});
			e.error && P.error(e.error), i("packages/catalog"), await d.refetch();
		} catch (e) {
			P.error(e);
		} finally {
			j(null);
		}
	}, $ = W ? W.problem === "dev_trust" ? l("This build carries development keys, which only count on local and test sites. The store opens once it ships with production keys.") : W.problem ? l("This site has no valid list of signing keys, so it cannot trust a store. Download packages and upload them instead.") : W.freshness === "clock" ? l("This server’s clock looks wrong, so installs are paused. The public site is not affected.") : W.freshness === "expired" ? l("Can’t confirm this catalog is current, so installs from it are off. Refresh it, or upload a package by hand.") : W.freshness === "stale" ? l("This catalog is a few days old. Refresh it when you can.") : W.error ? l("The store could not be reached. Installed packages are not affected. {error}", { error: W.error }) : null : null;
	return /* @__PURE__ */ L("div", { children: [
		/* @__PURE__ */ L("div", {
			className: "mb-4 flex flex-wrap items-center gap-2",
			children: [
				(o.data?.items.length ?? 0) > 1 && /* @__PURE__ */ I(D, {
					value: t,
					onChange: (e) => a(e ?? "default"),
					options: o.data.items.map((e) => ({
						value: e.id,
						label: e.name
					})),
					"aria-label": l("Store")
				}),
				/* @__PURE__ */ I(x, {
					className: "min-w-40 flex-1",
					value: h,
					onChange: (e) => _(e.target.value),
					placeholder: l("Search the store"),
					"aria-label": l("Search the store")
				}),
				/* @__PURE__ */ I(D, {
					value: S,
					onChange: (e) => w(e ?? "all"),
					"aria-label": l("Price"),
					options: [
						{
							value: "all",
							label: l("All")
						},
						{
							value: "free",
							label: l("Free")
						},
						{
							value: "paid",
							label: l("Paid")
						}
					]
				}),
				/* @__PURE__ */ I(A, {
					checked: V,
					onChange: H,
					size: "sm",
					label: l("Turn on after install")
				}),
				/* @__PURE__ */ I("input", {
					ref: U,
					type: "file",
					accept: ".zip,application/zip",
					className: "hidden",
					onChange: (e) => e.target.files?.[0] && void X(e.target.files[0])
				}),
				/* @__PURE__ */ I(C, {
					trigger: /* @__PURE__ */ I(b, {
						icon: "more",
						label: l("More store actions")
					}),
					items: [
						{
							label: l("Refresh Catalog"),
							icon: "refresh",
							disabled: k !== null,
							onSelect: () => void Q()
						},
						{
							label: l("Upload a Zip…"),
							icon: "upload",
							disabled: k !== null,
							onSelect: () => U.current?.click()
						},
						{
							label: l("Add a Store…"),
							icon: "plus",
							onSelect: () => void Z()
						},
						!o.data?.items.find((e) => e.id === t)?.default && {
							label: l("Remove This Store…"),
							icon: "trash",
							danger: !0,
							onSelect: async () => {
								await M({
									title: l("Remove this store?"),
									description: l("What it installed stays, without update offers."),
									confirm: l("Remove Store"),
									danger: !0
								}) && (await c("packages/store-remove", { id: t }), a("default"), await o.refetch());
							}
						}
					]
				})
			]
		}),
		R && /* @__PURE__ */ I("p", {
			role: "status",
			className: "mb-4 text-sm text-muted",
			children: R
		}),
		$ && /* @__PURE__ */ L("p", {
			className: "mb-4 flex items-center gap-2 border-y border-border py-3 text-sm text-text",
			children: [/* @__PURE__ */ I(y, {
				name: "info",
				size: 16,
				className: "shrink-0 text-muted"
			}), $]
		}),
		d.isLoading ? /* @__PURE__ */ I("div", {
			className: "grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3",
			children: [
				0,
				1,
				2
			].map((e) => /* @__PURE__ */ I(O, { className: "h-36" }, e))
		}) : q.length === 0 ? /* @__PURE__ */ I(v, {
			icon: "download",
			title: l(h ? "Nothing matches that search" : "Nothing in this store yet"),
			description: l(h ? "Try fewer words." : "You can still upload a package as a zip."),
			action: h ? /* @__PURE__ */ I(g, {
				onClick: () => _(""),
				children: l("Clear Search")
			}) : /* @__PURE__ */ I(g, {
				onClick: () => U.current?.click(),
				children: l("Upload a Zip")
			})
		}) : /* @__PURE__ */ L(F, { children: [/* @__PURE__ */ I("p", {
			className: "mb-2 text-xs text-muted",
			children: s(q.length, "{count} package", "{count} packages")
		}), /* @__PURE__ */ I("div", {
			className: "grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3",
			children: q.map((e) => /* @__PURE__ */ I(G, {
				item: e,
				busy: k === e.package,
				locked: k !== null,
				onOpen: () => E(e),
				onInstall: () => void Y(e)
			}, e.package))
		})] }),
		T && /* @__PURE__ */ I(K, {
			item: T,
			onClose: () => E(null),
			locked: k !== null,
			onInstall: () => void Y(T)
		})
	] });
}
function U({ item: e }) {
	return e.icon ? /* @__PURE__ */ I("img", {
		src: e.icon,
		alt: "",
		className: "size-8 shrink-0 rounded object-cover",
		loading: "lazy"
	}) : /* @__PURE__ */ I("span", {
		className: "grid size-8 shrink-0 place-items-center rounded border border-border text-muted",
		children: /* @__PURE__ */ I(y, {
			name: "plugin",
			size: 16
		})
	});
}
function W({ item: e, busy: t, locked: n, onInstall: r }) {
	switch (e.action) {
		case "install":
		case "update": return /* @__PURE__ */ I(g, {
			size: "sm",
			variant: "primary",
			loading: t,
			disabled: n,
			onClick: r,
			children: e.action === "update" ? l("Update") : l("Install")
		});
		case "buy": return e.listing_url ? /* @__PURE__ */ I(g, {
			size: "sm",
			onClick: () => window.open(e.listing_url, "_blank", "noopener"),
			children: l("Buy on Store")
		}) : /* @__PURE__ */ I("span", {
			className: "text-xs text-muted",
			children: l("Paid Plugin")
		});
		case "installed": return /* @__PURE__ */ I("span", {
			className: "text-xs text-muted",
			children: l("Installed")
		});
		case "blocked": return /* @__PURE__ */ I(h, {
			tone: "danger",
			children: l("Blocked")
		});
		default: return /* @__PURE__ */ I("span", {
			className: "text-xs text-muted",
			children: l("Not for this version")
		});
	}
}
function G({ item: e, busy: t, locked: n, onOpen: r, onInstall: i }) {
	return /* @__PURE__ */ L("article", {
		className: "flex min-w-0 flex-col gap-2 rounded-lg border border-border p-3",
		children: [
			/* @__PURE__ */ L("div", {
				className: "flex min-w-0 items-start gap-2.5",
				children: [
					/* @__PURE__ */ I(U, { item: e }),
					/* @__PURE__ */ L("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ I("button", {
							type: "button",
							onClick: r,
							className: "block max-w-full cursor-pointer truncate border-0 bg-transparent p-0 text-left text-sm font-medium text-ink hover:underline",
							children: e.title
						}), /* @__PURE__ */ I("p", {
							className: "m-0 truncate text-xs text-muted",
							children: e.author.name || e.package
						})]
					}),
					/* @__PURE__ */ I(h, {
						tone: e.pricing === "free" ? "neutral" : "warning",
						children: V(e)
					})
				]
			}),
			/* @__PURE__ */ I("p", {
				className: "m-0 line-clamp-2 min-h-8 flex-1 text-xs text-text",
				children: e.summary
			}),
			/* @__PURE__ */ L("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ I("span", {
					className: "text-xs text-muted",
					children: e.latest ?? "—"
				}), /* @__PURE__ */ I(W, {
					item: e,
					busy: t,
					locked: n,
					onInstall: i
				})]
			})
		]
	});
}
function K({ item: e, onClose: t, locked: n, onInstall: r }) {
	let a = u("packages/item", {
		store: e.store,
		package: e.package
	}), o = a.data, [s, d] = m(!1), f = async () => {
		let e = (await N({
			title: l("Add Key"),
			description: l("Paste the key you got when you bought this plugin."),
			fields: [{
				handle: "key",
				type: "textarea",
				label: l("Key"),
				required: !0
			}],
			confirm: l("Add Key")
		}))?.key;
		if (e) try {
			await c("packages/add-key", { key: e }), i("packages/"), P.success(l("Key added")), t();
		} catch (e) {
			P.error(e);
		}
	};
	return /* @__PURE__ */ I(k, {
		id: "store-item",
		open: !0,
		expanded: s,
		onExpandedChange: d,
		onOpenChange: (e) => {
			e || t();
		},
		title: e.title,
		icon: "plugin",
		children: /* @__PURE__ */ L("div", {
			className: "space-y-4 p-4 text-sm",
			children: [
				/* @__PURE__ */ L("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ I(W, {
							item: e,
							busy: !1,
							locked: n,
							onInstall: r
						}),
						e.access.message && /* @__PURE__ */ I("span", {
							className: "text-xs text-muted",
							children: e.access.message
						}),
						e.action === "buy" && /* @__PURE__ */ I(g, {
							size: "sm",
							disabled: n,
							onClick: () => void f(),
							children: l("Add Key")
						})
					]
				}),
				/* @__PURE__ */ I("p", {
					className: "m-0 text-xs text-muted",
					children: o ? l("Sold by {operator}, made by {author}", {
						operator: o.operator,
						author: e.author.name || e.package
					}) : e.package
				}),
				a.isLoading ? /* @__PURE__ */ I(O, { className: "h-32" }) : o?.description_html ? /* @__PURE__ */ I("div", {
					className: "cms-store-description",
					dangerouslySetInnerHTML: { __html: o.description_html }
				}) : /* @__PURE__ */ I("p", {
					className: "m-0",
					children: e.summary
				}),
				(o?.screenshots.length ?? 0) > 0 && /* @__PURE__ */ I("div", {
					className: "grid gap-2",
					children: o.screenshots.map((e) => /* @__PURE__ */ I("img", {
						src: e,
						alt: "",
						className: "w-full rounded border border-border",
						loading: "lazy"
					}, e))
				}),
				o && o.capabilities.length > 0 && /* @__PURE__ */ L("p", {
					className: "m-0",
					children: [/* @__PURE__ */ L("span", {
						className: "font-medium",
						children: [l("It may use"), ": "]
					}), o.capabilities.join(", ")]
				}),
				o && (o.requires.core || o.requires.php) && /* @__PURE__ */ I("p", {
					className: "m-0 text-xs text-muted",
					children: [o.requires.core && l("Needs {brand} {version}", { version: o.requires.core }), o.requires.php && `PHP ${o.requires.php}`].filter(Boolean).join(" · ")
				})
			]
		})
	});
}
// admin/src/Updates.tsx
var q = [
	"downloading",
	"verifying",
	"extracting",
	"checking_files",
	"ready"
], J = (e) => ({
	downloading: l("Downloading…"),
	verifying: l("Checking the signature…"),
	extracting: l("Unpacking…"),
	checking_files: l("Checking every file…"),
	ready: l("Switching…"),
	migrating: l("Updating the database…"),
	checking: l("Checking the new version…")
})[e] ?? e, Y = (e) => ({
	composer: l("This site is managed with Composer. Update it with composer update."),
	git: l("This site is managed with Composer. Update it with composer update."),
	file_mods: l("This site does not change its own files. Update it through your deploy.")
})[e] ?? e;
function X() {
	let n = u("packages/updates"), [r, a] = m(null), [o, s] = m(null), d = n.data, f = async () => {
		i("packages/"), await n.refetch();
	}, p = async () => {
		s("check");
		try {
			let e = await c("packages/update-check");
			e.error && P.error(e.error), await f();
		} catch (e) {
			P.error(e);
		} finally {
			s(null);
		}
	}, _ = async (e) => {
		if (!e.major || await M({
			title: l("Update to {version}?", { version: e.version }),
			description: [l("This is a new major version. Back up first, and read the release notes."), e.incompatible.length ? l("These plugins go inactive: {list}.", { list: e.incompatible.join(", ") }) : ""].filter(Boolean).join(" "),
			confirm: l("Update")
		})) {
			s("core");
			try {
				let n = await c("packages/update-start", { version: e.version });
				for (a(J(n.state)); q.includes(n.state);) n = await c("packages/update-step"), a(J(n.state));
				if (n.drive && (a(J("migrating")), await t() === "done")) {
					window.location.reload();
					return;
				}
				await f(), n.state === "failed" && P.error(n.error ?? l("The update failed. Nothing was changed."));
			} catch (e) {
				P.error(e), await f();
			} finally {
				s(null), a(null);
			}
		}
	}, b = async (t, n, r) => {
		s(t);
		try {
			let i = await c("packages/install", {
				store: n,
				package: t,
				version: r
			});
			await e(i), P.success(l("{name} updated", { name: t })), await f();
		} catch (e) {
			P.error(e), await f();
		} finally {
			s(null);
		}
	};
	if (n.isLoading || !d) return /* @__PURE__ */ I(O, { className: "h-40" });
	let { core: x, status: C } = d, w = x.update;
	return /* @__PURE__ */ L("div", { children: [
		/* @__PURE__ */ L(E, {
			title: l("{brand} {version}", { version: x.current }),
			description: x.check.checked_at ? l("Checked {date}", { date: (/* @__PURE__ */ new Date(x.check.checked_at * 1e3)).toLocaleString() }) : l("Not checked yet"),
			actions: /* @__PURE__ */ I(g, {
				size: "sm",
				loading: o === "check",
				disabled: o !== null,
				onClick: () => void p(),
				children: l("Check Now")
			}),
			children: [
				x.managed ? /* @__PURE__ */ I(Z, {
					icon: "info",
					children: Y(x.managed)
				}) : x.trust === "dev_trust" ? /* @__PURE__ */ I(Z, {
					icon: "info",
					children: l("This build carries development keys, which only count on local and test sites. Updates start once it ships with production keys.")
				}) : null,
				C.state === "rolled_back" && /* @__PURE__ */ I(Z, {
					icon: "warning",
					children: l("The update to {version} failed its own checks, so this site went back. Your content is safe. {error}", {
						version: C.target ?? "",
						error: C.error ?? ""
					})
				}),
				C.state === "failed" && /* @__PURE__ */ I(Z, {
					icon: "warning",
					children: l("The last update stopped before anything changed. {error}", { error: C.error ?? "" })
				}),
				x.yanked && /* @__PURE__ */ I(Z, {
					icon: "warning",
					children: l("This version was withdrawn: {reason}", { reason: x.yanked })
				}),
				x.support_ended && /* @__PURE__ */ I(Z, {
					icon: "warning",
					children: l("This major version stopped getting security fixes in {date}. Plan the move to a newer one.", { date: x.support_ended.until })
				}),
				x.check.error && !x.trust && /* @__PURE__ */ I(Z, {
					icon: "info",
					children: l("The last check failed: {error}", { error: x.check.error })
				}),
				r && /* @__PURE__ */ L("p", {
					role: "status",
					className: "mt-3 flex items-center gap-2 text-sm text-text",
					children: [/* @__PURE__ */ I(y, {
						name: "spinner",
						size: 16,
						className: "animate-spin"
					}), r]
				}),
				!x.managed && (w || x.major) ? /* @__PURE__ */ I(S, {
					className: "mt-3",
					children: [w, x.major].filter((e) => e !== null).map((e) => /* @__PURE__ */ L(T, { children: [
						/* @__PURE__ */ I("span", {
							className: "font-medium",
							children: e.version
						}),
						e.security && /* @__PURE__ */ I(h, {
							tone: "warning",
							children: l("Security")
						}),
						e.major && /* @__PURE__ */ I(h, {
							tone: "neutral",
							children: l("New major")
						}),
						/* @__PURE__ */ I("span", {
							className: "min-w-0 flex-1 truncate text-xs text-muted",
							children: e.host_problems.length ? l("Needs {what} on this host", { what: e.host_problems.join(", ") }) : e.incompatible.length ? l("Not for: {list}", { list: e.incompatible.join(", ") }) : ""
						}),
						e.notes_url && /* @__PURE__ */ I("a", {
							href: e.notes_url,
							target: "_blank",
							rel: "noreferrer",
							className: "text-xs text-muted underline",
							children: l("What changed")
						}),
						/* @__PURE__ */ I(g, {
							size: "sm",
							variant: "primary",
							loading: o === "core",
							disabled: o !== null || e.host_problems.length > 0 || x.freshness === "expired" || x.freshness === "clock",
							onClick: () => void _(e),
							children: l("Update")
						})
					] }, e.version))
				}) : !x.managed && !x.trust ? /* @__PURE__ */ I("p", {
					className: "m-0 mt-3 text-sm text-muted",
					children: l("Up to date.")
				}) : null,
				C.state === "done" && C.previous && /* @__PURE__ */ L("p", {
					className: "m-0 mt-3 text-sm text-muted",
					children: [
						l("Updated from {version}.", { version: C.previous }),
						" ",
						/* @__PURE__ */ I("button", {
							type: "button",
							className: "cursor-pointer border-0 bg-transparent p-0 text-sm underline",
							disabled: o !== null,
							onClick: async () => {
								if (await M({
									title: l("Go back to {version}?", { version: C.previous }),
									description: l("The database stays as it is: updates within a major only add to it."),
									confirm: l("Go Back"),
									danger: !0
								})) try {
									await c("packages/update-rollback"), window.location.reload();
								} catch (e) {
									P.error(e);
								}
							},
							children: l("Go back")
						})
					]
				}),
				!x.managed && /* @__PURE__ */ L("div", {
					className: "mt-4 flex flex-wrap items-center gap-3 text-sm text-text",
					children: [/* @__PURE__ */ I(A, {
						checked: x.auto,
						size: "sm",
						label: l("Install security updates by themselves"),
						onChange: (e) => void c("packages/update-auto", { on: e }).then(f)
					}), x.auto && w?.security && /* @__PURE__ */ I(g, {
						size: "sm",
						variant: "ghost",
						onClick: async () => {
							await c("packages/update-postpone", { days: 7 }), P.success(l("Postponed for 7 days")), await f();
						},
						children: l("Postpone 7 Days")
					})]
				})
			]
		}),
		d.advisories.length > 0 && /* @__PURE__ */ I(E, {
			title: l("Security advisories"),
			children: /* @__PURE__ */ I(S, { children: d.advisories.map((e) => /* @__PURE__ */ L(T, { children: [
				/* @__PURE__ */ I(y, {
					name: "warning",
					size: 16,
					className: "shrink-0 text-warning"
				}),
				/* @__PURE__ */ I("span", {
					className: "min-w-0 flex-1 truncate",
					children: l("{name} {version} has a known problem. It keeps running until you decide.", {
						name: e.label,
						version: e.version
					})
				}),
				e.advisory && /* @__PURE__ */ I("a", {
					href: e.advisory,
					target: "_blank",
					rel: "noreferrer",
					className: "text-xs underline",
					children: l("Read More")
				})
			] }, e.package)) })
		}),
		/* @__PURE__ */ L(E, {
			title: l("Plugins"),
			children: [d.packages.length === 0 ? /* @__PURE__ */ I(v, {
				icon: "check",
				title: l("Everything from the store is up to date"),
				className: "py-8"
			}) : /* @__PURE__ */ I(S, { children: d.packages.map((e) => /* @__PURE__ */ L(T, { children: [
				/* @__PURE__ */ I("span", {
					className: "min-w-0 truncate font-medium",
					children: e.label
				}),
				/* @__PURE__ */ L("span", {
					className: "shrink-0 text-xs text-muted",
					children: [
						e.installed,
						" → ",
						e.version
					]
				}),
				e.security && /* @__PURE__ */ I(h, {
					tone: "warning",
					children: l("Security")
				}),
				/* @__PURE__ */ I("span", {
					className: "min-w-0 flex-1 truncate text-xs text-muted",
					children: e.message
				}),
				e.allowed ? /* @__PURE__ */ I(g, {
					size: "sm",
					variant: "primary",
					loading: o === e.package,
					disabled: o !== null,
					onClick: () => void b(e.package, e.store, e.version),
					children: l("Update")
				}) : e.buy_url ? /* @__PURE__ */ I(g, {
					size: "sm",
					onClick: () => window.open(e.buy_url, "_blank", "noopener"),
					children: l("Extend Licence")
				}) : null,
				e.backup && /* @__PURE__ */ I(g, {
					size: "sm",
					variant: "ghost",
					disabled: o !== null,
					onClick: async () => {
						await c("packages/rollback", { package: e.package }), await f();
					},
					children: l("Go Back")
				})
			] }, e.package)) }), d.unverified.length > 0 && /* @__PURE__ */ I("p", {
				className: "mt-3 text-xs text-muted",
				children: l("Not from a store, so no update offers: {list}", { list: d.unverified.join(", ") })
			})]
		})
	] });
}
function Z({ icon: e, children: t }) {
	return /* @__PURE__ */ L("p", {
		className: "m-0 mt-2 flex items-start gap-2 text-sm text-text",
		children: [/* @__PURE__ */ I(y, {
			name: e,
			size: 16,
			className: "mt-0.5 shrink-0 text-muted"
		}), /* @__PURE__ */ I("span", {
			className: "min-w-0",
			children: t
		})]
	});
}
// admin/src/Modules.tsx
var Q = [
	"plugins",
	"modules",
	"store",
	"updates"
], $ = (e) => e.core ? "modules" : "plugins";
function ee() {
	let [e, t] = d(Q), n = u("packages/list", { type: "all" }), [r, o] = m(null), [f, p] = m(!1), b = n.data?.items ?? [], x = b.filter((t) => $(t) === e).sort((e, t) => e.label.localeCompare(t.label)), S = b.filter((e) => e.active && e.installedVersion !== e.version), C = (e) => n.data ? b.filter((t) => $(t) === e).length : void 0, T = Object.fromEntries(b.map((e) => [e.name, e.label])), E = async (e, t, r, s) => {
		o(e.name);
		try {
			await c(t, r), t === "packages/enable" && await c("packages/sync").catch(() => {}), await Promise.all([a(), n.refetch()]), i("packages/"), P.success(s);
		} catch (e) {
			P.error(e);
		} finally {
			o(null);
		}
	};
	return /* @__PURE__ */ L(w, {
		width: "wide",
		crumbs: [{
			label: l("Modules"),
			icon: "plugin"
		}],
		children: [
			S.length > 0 && /* @__PURE__ */ L("div", {
				className: "mb-6 flex items-center gap-3 border-y border-border py-3 text-sm",
				children: [
					/* @__PURE__ */ I(y, {
						name: "database",
						size: 16,
						className: "shrink-0 text-warning"
					}),
					/* @__PURE__ */ I("span", {
						className: "flex-1 text-text",
						children: s(S.length, "{count} package needs a database update", "{count} packages need a database update")
					}),
					/* @__PURE__ */ I(g, {
						size: "sm",
						variant: "primary",
						loading: f,
						onClick: async () => {
							p(!0);
							try {
								await c("packages/sync"), await Promise.all([a(), n.refetch()]), P.success(l("Database is up to date"));
							} catch (e) {
								P.error(e);
							} finally {
								p(!1);
							}
						},
						children: l("Update")
					})
				]
			}),
			/* @__PURE__ */ I(j, {
				className: "mb-4",
				value: e,
				onChange: t,
				tabs: [
					{
						value: "plugins",
						label: l("Plugins"),
						count: C("plugins")
					},
					{
						value: "modules",
						label: l("Modules"),
						count: C("modules")
					},
					{
						value: "store",
						label: l("Store")
					},
					{
						value: "updates",
						label: l("Updates")
					}
				]
			}),
			e === "store" && /* @__PURE__ */ I(H, {}),
			e === "updates" && /* @__PURE__ */ I(X, {}),
			e !== "store" && e !== "updates" && /* @__PURE__ */ I(_, {
				id: `packages.${e}`,
				label: l("Modules"),
				items: x,
				rowKey: (e) => e.name,
				searchText: (e) => `${e.label} ${e.description} ${e.name}`,
				icon: "plugin",
				loading: n.isLoading,
				error: n.isError,
				onRetry: () => void n.refetch(),
				columns: [
					{
						id: "name",
						label: l("Name"),
						value: (e) => e.label,
						render: (e) => /* @__PURE__ */ L("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ I(y, {
								name: e.icon,
								size: 16,
								className: "shrink-0 text-muted"
							}), /* @__PURE__ */ I("span", {
								className: "truncate",
								children: e.label
							})]
						})
					},
					{
						id: "description",
						label: l("Description"),
						width: "minmax(240px,1.5fr)",
						render: (e) => /* @__PURE__ */ I("span", {
							title: e.description,
							children: e.description
						})
					},
					{
						id: "version",
						label: l("Version"),
						width: "80px",
						value: (e) => e.version,
						render: (e) => e.version
					},
					{
						id: "status",
						label: l("Status"),
						width: "120px",
						value: (e) => Number(e.active),
						render: (e) => /* @__PURE__ */ I(h, {
							tone: e.problem ? "warning" : e.active ? "success" : "neutral",
							children: e.problem ? l("Unavailable") : e.active ? l("Active") : l("Off")
						})
					},
					{
						id: "details",
						label: l("Details"),
						width: "minmax(160px,1fr)",
						render: (e) => /* @__PURE__ */ I("span", {
							title: e.problem ?? e.dependents.map((e) => T[e] ?? e).join(", "),
							children: e.problem ?? (e.enabled && e.dependents.length ? l("Needed by {names}", { names: e.dependents.map((e) => T[e] ?? e).join(", ") }) : e.required ? l("Required") : e.firstParty ? "—" : l("Third-party"))
						})
					}
				],
				actions: (e) => /* @__PURE__ */ I(te, {
					pkg: e,
					busy: r === e.name,
					locked: r !== null,
					onAct: E
				}),
				empty: /* @__PURE__ */ I(v, {
					icon: "plugin",
					title: l(e === "plugins" ? "No plugins yet" : "Nothing here yet"),
					description: l("Add them from the Store tab, or put a package in plugins/."),
					action: /* @__PURE__ */ I(g, {
						onClick: () => t("store"),
						children: l("Open Store")
					})
				})
			}),
			e !== "store" && e !== "updates" && (n.data?.errors ?? []).length > 0 && /* @__PURE__ */ I("div", {
				className: "mt-6 space-y-1 border-t border-border pt-4 text-xs text-danger",
				children: n.data.errors.map((e) => /* @__PURE__ */ I("p", {
					className: "m-0",
					children: e
				}, e))
			})
		]
	});
}
function te({ pkg: e, busy: t, locked: n, onAct: r }) {
	let i = $(e), a = e.enabled && e.dependents.length > 0;
	return /* @__PURE__ */ I(C, {
		trigger: /* @__PURE__ */ I(b, {
			icon: "more",
			label: l("Actions for {name}", { name: e.label }),
			size: "xs",
			disabled: t
		}),
		items: [
			e.active && !!e.settings[0] && {
				label: l("Settings"),
				icon: "settings",
				onSelect: () => o(`/settings/${e.settings[0]}`)
			},
			{
				label: e.enabled ? l("Turn Off") : l("Turn On"),
				icon: "check",
				disabled: n || a || e.required,
				onSelect: () => void r(e, e.enabled ? "packages/disable" : "packages/enable", { name: e.name }, e.enabled ? l("{name} disabled", { name: e.label }) : l("{name} enabled", { name: e.label }))
			},
			i === "plugins" && {
				label: l("Uninstall…"),
				icon: "trash",
				danger: !0,
				disabled: e.dependents.length > 0 || n,
				onSelect: async () => {
					await M({
						title: l("Uninstall {name}?", { name: e.label }),
						description: l("Its database tables, settings and files are removed."),
						confirm: l("Uninstall"),
						danger: !0
					}) && await r(e, "packages/uninstall", {
						name: e.name,
						deleteFiles: !0
					}, l("{name} uninstalled", { name: e.label }));
				}
			}
		]
	});
}
export { ee as default };
