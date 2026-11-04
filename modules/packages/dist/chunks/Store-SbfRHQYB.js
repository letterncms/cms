import { n as e, t } from "./installing-CCPtKzo4.js";
import { can as n, invalidate as r, locale as i, plural as a, run as o, t as s, useAbility as c } from "@letterncms/sdk";
import { useMemo as l, useRef as u, useState as d } from "react";
import { Badge as f, Button as p, EmptyState as m, Icon as h, Input as g, NoMatches as _, Select as v, Skeleton as y, Slideover as b, Switch as x, confirm as S, prompt as C, toast as w } from "@letterncms/ui";
import { Fragment as T, jsx as E, jsxs as D } from "react/jsx-runtime";
// admin/src/Store.tsx
var O = 2097152, k = (e) => {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
};
async function A(e, t) {
	let n = crypto.randomUUID().replaceAll("-", "").slice(0, 24), r = new Uint8Array(await e.arrayBuffer()), i = null, a = Math.max(1, Math.ceil(r.length / O));
	for (let e = 0; e < a; e++) {
		let s = await o("packages/upload", {
			id: n,
			index: e,
			last: e === a - 1,
			allowUnsigned: t,
			data: k(r.subarray(e * O, (e + 1) * O))
		});
		e === a - 1 && (i = s);
	}
	return i;
}
var j = (e) => e.pricing === "free" ? s("Free") : s("Paid");
function M() {
	let [f, b] = d("default"), O = c("packages/stores"), k = c("packages/catalog", { store: f }), [j, M] = d(""), [N, P] = d("all"), [L, R] = d(null), [z, B] = d(null), [V, H] = d(null), [U, W] = d(!0), G = u(null), K = k.data, q = c("packages/list", { type: "all" }), J = Object.fromEntries((q.data?.items ?? []).map((e) => [e.name, e.icon])), Y = O.data?.items.find((e) => e.id === f), X = l(() => {
		let e = j.trim().toLowerCase();
		return (K?.items ?? []).filter((t) => (N === "all" || t.pricing === N || N === "paid" && t.pricing !== "free") && (e === "" || `${t.title} ${t.summary} ${t.package} ${t.categories.join(" ")}`.toLowerCase().includes(e)));
	}, [
		K,
		j,
		N
	]), Z = async (e) => {
		r("packages/"), await k.refetch(), w.success(e);
	}, Q = async (t) => {
		B(t.package);
		try {
			let n = await o("packages/plan-install", {
				store: t.store,
				package: t.package,
				version: t.latest ?? void 0
			}), r = n.steps.filter((e) => !e.enable_only).map((e) => `${e.title} ${e.version}`);
			if (!await S({
				title: s("Install {name}?", { name: t.title }),
				description: [
					r.length > 1 ? s("Also installs what it needs: {list}.", { list: r.join(", ") }) : "",
					n.capabilities.length ? s("It may use: {list}.", { list: n.capabilities.join(", ") }) : "",
					s("This code runs with full access to your site.")
				].filter(Boolean).join(" "),
				confirm: t.installed ? s("Update") : s("Install")
			})) return;
			for (let r of n.steps) {
				if (r.enable_only) {
					await o("packages/enable", { name: r.package });
					continue;
				}
				H(s("Installing {name}…", { name: r.title }));
				let n = await o("packages/install", {
					store: t.store,
					package: r.package,
					version: r.version,
					turnOn: U
				});
				await e(n);
			}
			await Z(t.installed ? s("{name} updated", { name: t.title }) : s("{name} installed", { name: t.title }));
		} catch (e) {
			w.error(e);
		} finally {
			B(null), H(null);
		}
	}, ee = async (r) => {
		B("upload"), H(s("Uploading {name}…", { name: r.name }));
		try {
			let i = await A(r, !1);
			try {
				i = await e(i);
			} catch (a) {
				if (!(a instanceof t) || a.code !== "unsigned" || !n("packages.install_unsigned")) throw a;
				if (!await S({
					title: s("Install {name} unsigned?", { name: r.name }),
					description: s("No store vouches for this file. It runs with full access to your site, and it gets no update offers."),
					confirm: s("Install Unsigned"),
					danger: !0
				})) return;
				i = await e(await A(r, !0));
			}
			await Z(s("{name} installed", { name: i.package ?? r.name }));
		} catch (e) {
			w.error(e);
		} finally {
			B(null), H(null), G.current && (G.current.value = "");
		}
	}, te = async () => {
		let e = (await C({
			title: s("Add a store"),
			description: s("Code from a store runs with full access to this site. Add it only if you trust who runs it."),
			fields: [{
				handle: "url",
				type: "text",
				label: s("Store address"),
				required: !0,
				placeholder: "https://"
			}],
			confirm: s("Continue")
		}))?.url;
		if (e) try {
			let t = await o("packages/store-add", { url: e }), n = (await C({
				title: s("Confirm {name}", { name: t.name }),
				description: s("Compare this key fingerprint with the one in the store’s own documentation, then type it here: {fingerprint}", { fingerprint: t.fingerprint }),
				fields: [{
					handle: "fingerprint",
					type: "text",
					label: s("Key fingerprint"),
					required: !0
				}],
				confirm: s("Add Store")
			}))?.fingerprint;
			if (!n) return;
			let r = await o("packages/store-add", {
				url: e,
				confirm: n
			});
			if (!r.added) {
				w.error(s("That fingerprint does not match. The store was not added."));
				return;
			}
			await O.refetch(), b(r.id);
		} catch (e) {
			w.error(e);
		}
	}, ne = async () => {
		B("refresh");
		try {
			let e = await o("packages/catalog", {
				store: f,
				refresh: !0
			});
			e.error && w.error(e.error), r("packages/catalog"), await k.refetch();
		} catch (e) {
			w.error(e);
		} finally {
			B(null);
		}
	}, $ = K ? K.problem === "dev_trust" ? s("This build has development keys, so the store is closed.") : K.problem ? s("No valid signing keys, so the store is off. Upload packages instead.") : K.freshness === "clock" ? s("This server’s clock looks wrong, so installs are paused.") : K.freshness === "expired" ? s("This catalog is out of date, so installs are off. Refresh it.") : K.freshness === "stale" ? s("This catalog is a few days old.") : K.error ? s("Can’t reach the store. {error}", { error: K.error }) : null : null;
	return /* @__PURE__ */ D("div", { children: [
		/* @__PURE__ */ D("div", {
			className: "mb-3 flex min-h-10 flex-wrap items-center gap-2",
			children: [
				(O.data?.items.length ?? 0) > 1 && /* @__PURE__ */ E("div", {
					className: "w-36",
					children: /* @__PURE__ */ E(v, {
						size: "sm",
						value: f,
						onChange: (e) => b(e ?? "default"),
						options: O.data.items.map((e) => ({
							value: e.id,
							label: e.name
						})),
						"aria-label": s("Store")
					})
				}),
				/* @__PURE__ */ E(g, {
					size: "sm",
					className: "w-full sm:w-60",
					icon: "search",
					value: j,
					onChange: (e) => M(e.target.value),
					placeholder: s("Search {items}…", { items: s("Plugins").toLocaleLowerCase(i()) }),
					"aria-label": s("Search")
				}),
				/* @__PURE__ */ E("div", {
					className: "w-24",
					children: /* @__PURE__ */ E(v, {
						size: "sm",
						value: N,
						onChange: (e) => P(e ?? "all"),
						"aria-label": s("Price"),
						options: [
							{
								value: "all",
								label: s("All")
							},
							{
								value: "free",
								label: s("Free")
							},
							{
								value: "paid",
								label: s("Paid")
							}
						]
					})
				}),
				/* @__PURE__ */ E(x, {
					checked: U,
					onChange: W,
					size: "sm",
					label: s("Turn On After Install")
				}),
				/* @__PURE__ */ E("input", {
					ref: G,
					type: "file",
					accept: ".zip,application/zip",
					className: "hidden",
					onChange: (e) => e.target.files?.[0] && void ee(e.target.files[0])
				}),
				/* @__PURE__ */ D("div", {
					className: "ml-auto flex flex-wrap items-center gap-1",
					children: [
						/* @__PURE__ */ E(p, {
							variant: "ghost",
							icon: "refresh",
							loading: z === "refresh",
							disabled: z !== null,
							onClick: () => void ne(),
							children: s("Refresh")
						}),
						/* @__PURE__ */ E(p, {
							variant: "ghost",
							icon: "upload",
							disabled: z !== null,
							onClick: () => G.current?.click(),
							children: s("Upload Zip")
						}),
						/* @__PURE__ */ E(p, {
							variant: "ghost",
							icon: "plus",
							onClick: () => void te(),
							children: s("Add Store")
						}),
						Y && !Y.default && /* @__PURE__ */ E(p, {
							variant: "ghost",
							icon: "trash",
							className: "!text-danger",
							onClick: async () => {
								await S({
									title: s("Remove {name}?", { name: Y.name }),
									description: s("What it installed stays, without update offers."),
									confirm: s("Remove Store"),
									danger: !0
								}) && (await o("packages/store-remove", { id: f }), b("default"), await O.refetch());
							},
							children: s("Remove Store")
						})
					]
				})
			]
		}),
		V && /* @__PURE__ */ E("p", {
			role: "status",
			className: "mb-4 text-sm text-muted",
			children: V
		}),
		$ && /* @__PURE__ */ D("p", {
			className: "mb-4 flex items-center gap-2 border-y border-border py-3 text-sm text-text",
			children: [/* @__PURE__ */ E(h, {
				name: "info",
				size: 16,
				className: "shrink-0 text-muted"
			}), $]
		}),
		k.isLoading ? /* @__PURE__ */ E("div", {
			className: "grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3",
			children: [
				0,
				1,
				2
			].map((e) => /* @__PURE__ */ E(y, { className: "h-36" }, e))
		}) : X.length === 0 ? j.trim() !== "" || N !== "all" ? /* @__PURE__ */ E(_, { onClear: () => {
			M(""), P("all");
		} }) : /* @__PURE__ */ E(m, {
			icon: "download",
			title: s("Nothing in this store yet"),
			action: /* @__PURE__ */ E(p, {
				onClick: () => G.current?.click(),
				children: s("Upload a Zip")
			})
		}) : /* @__PURE__ */ D(T, { children: [/* @__PURE__ */ E("p", {
			className: "mb-2 text-xs text-muted",
			children: a(X.length, "{count} plugin", "{count} plugins")
		}), /* @__PURE__ */ E("div", {
			className: "grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3",
			children: X.map((e) => /* @__PURE__ */ E(F, {
				item: e,
				icon: J[e.package],
				busy: z === e.package,
				locked: z !== null,
				onOpen: () => R(e),
				onInstall: () => void Q(e)
			}, e.package))
		})] }),
		L && /* @__PURE__ */ E(I, {
			item: L,
			onClose: () => R(null),
			locked: z !== null,
			onInstall: () => void Q(L)
		})
	] });
}
function N({ item: e, icon: t }) {
	return e.icon ? /* @__PURE__ */ E("img", {
		src: e.icon,
		alt: "",
		className: "size-8 shrink-0 rounded-md object-cover",
		loading: "lazy"
	}) : /* @__PURE__ */ E("span", {
		className: "grid size-8 shrink-0 place-items-center rounded-md bg-sunken text-muted",
		children: /* @__PURE__ */ E(h, {
			name: t || "plugin",
			size: 16
		})
	});
}
function P({ item: e, busy: t, locked: n, onInstall: r }) {
	switch (e.action) {
		case "install":
		case "update": return /* @__PURE__ */ E(p, {
			size: "sm",
			variant: "primary",
			loading: t,
			disabled: n,
			onClick: r,
			children: e.action === "update" ? s("Update") : s("Install")
		});
		case "buy": return e.listing_url ? /* @__PURE__ */ E(p, {
			size: "sm",
			onClick: () => window.open(e.listing_url, "_blank", "noopener"),
			children: s("Buy on Store")
		}) : /* @__PURE__ */ E("span", {
			className: "text-xs text-muted",
			children: s("Paid Plugin")
		});
		case "installed": return /* @__PURE__ */ E("span", {
			className: "text-xs text-muted",
			children: s("Installed")
		});
		case "blocked": return /* @__PURE__ */ E(f, {
			tone: "danger",
			children: s("Blocked")
		});
		default: return /* @__PURE__ */ E("span", {
			className: "text-xs text-muted",
			children: s("Not for this version")
		});
	}
}
function F({ item: e, icon: t, busy: n, locked: r, onOpen: i, onInstall: a }) {
	return /* @__PURE__ */ D("article", {
		className: "flex min-w-0 flex-col gap-2 rounded-lg border border-border p-3",
		children: [
			/* @__PURE__ */ D("div", {
				className: "flex min-w-0 items-center gap-2.5",
				children: [
					/* @__PURE__ */ E(N, {
						item: e,
						icon: t
					}),
					/* @__PURE__ */ D("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ E("button", {
							type: "button",
							onClick: i,
							className: "block max-w-full cursor-pointer truncate border-0 bg-transparent p-0 text-left text-sm font-medium text-ink hover:underline",
							children: e.title
						}), !e.first_party && /* @__PURE__ */ E("p", {
							className: "m-0 truncate text-xs text-muted",
							children: e.author.name || e.package
						})]
					}),
					/* @__PURE__ */ E(f, { children: j(e) })
				]
			}),
			/* @__PURE__ */ E("p", {
				className: "m-0 line-clamp-2 min-h-8 flex-1 text-xs text-text",
				children: e.summary
			}),
			/* @__PURE__ */ D("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ E("span", {
					className: "text-xs text-muted",
					children: e.latest ?? "—"
				}), /* @__PURE__ */ E(P, {
					item: e,
					busy: n,
					locked: r,
					onInstall: a
				})]
			})
		]
	});
}
function I({ item: e, onClose: t, locked: n, onInstall: i }) {
	let a = c("packages/item", {
		store: e.store,
		package: e.package
	}), l = a.data, [u, f] = d(!1), m = async () => {
		let e = (await C({
			title: s("Add Key"),
			fields: [{
				handle: "key",
				type: "textarea",
				label: s("Key"),
				required: !0
			}],
			confirm: s("Add Key")
		}))?.key;
		if (e) try {
			await o("packages/add-key", { key: e }), r("packages/"), w.success(s("Key added")), t();
		} catch (e) {
			w.error(e);
		}
	};
	return /* @__PURE__ */ E(b, {
		id: "store-item",
		open: !0,
		expanded: u,
		onExpandedChange: f,
		onOpenChange: (e) => {
			e || t();
		},
		title: e.title,
		icon: "plugin",
		children: /* @__PURE__ */ D("div", {
			className: "space-y-4 p-4 text-sm",
			children: [
				/* @__PURE__ */ D("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ E(P, {
							item: e,
							busy: !1,
							locked: n,
							onInstall: i
						}),
						e.access.message && /* @__PURE__ */ E("span", {
							className: "text-xs text-muted",
							children: e.access.message
						}),
						e.action === "buy" && /* @__PURE__ */ E(p, {
							size: "sm",
							disabled: n,
							onClick: () => void m(),
							children: s("Add Key")
						})
					]
				}),
				/* @__PURE__ */ E("p", {
					className: "m-0 text-xs text-muted",
					children: l ? s("Sold by {operator}, made by {author}", {
						operator: l.operator,
						author: e.author.name || e.package
					}) : e.package
				}),
				a.isLoading ? /* @__PURE__ */ E(y, { className: "h-32" }) : l?.description_html ? /* @__PURE__ */ E("div", {
					className: "cms-store-description",
					dangerouslySetInnerHTML: { __html: l.description_html }
				}) : /* @__PURE__ */ E("p", {
					className: "m-0",
					children: e.summary
				}),
				(l?.screenshots.length ?? 0) > 0 && /* @__PURE__ */ E("div", {
					className: "grid gap-2",
					children: l.screenshots.map((e) => /* @__PURE__ */ E("img", {
						src: e,
						alt: "",
						className: "w-full rounded border border-border",
						loading: "lazy"
					}, e))
				}),
				l && l.capabilities.length > 0 && /* @__PURE__ */ D("p", {
					className: "m-0",
					children: [/* @__PURE__ */ D("span", {
						className: "font-medium",
						children: [s("It may use"), ": "]
					}), l.capabilities.join(", ")]
				}),
				l && (l.requires.core || l.requires.php) && /* @__PURE__ */ E("p", {
					className: "m-0 text-xs text-muted",
					children: [l.requires.core && s("Needs {brand} {version}", { version: l.requires.core }), l.requires.php && `PHP ${l.requires.php}`].filter(Boolean).join(" · ")
				})
			]
		})
	});
}
export { M as Store };
