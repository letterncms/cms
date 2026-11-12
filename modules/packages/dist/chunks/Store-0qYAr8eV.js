import { n as e, t } from "./installing-CCPtKzo4.js";
import { can as n, invalidate as r, locale as i, navigate as a, plural as o, run as s, t as c, useAbility as l, useLocation as ee } from "@letterncms/sdk";
import { useMemo as u, useRef as d, useState as f } from "react";
import { Badge as p, Button as m, EmptyState as te, Icon as h, IconButton as g, Input as _, List as v, Menu as y, NoMatches as ne, Pressable as b, Select as x, Skeleton as S, Slideover as C, Tabs as w, cn as T, confirm as E, prompt as D, toast as O } from "@letterncms/ui";
import { Fragment as re, jsx as k, jsxs as A } from "react/jsx-runtime";
// admin/src/storeItem.tsx
var j = (e) => e.pricing === "free" ? c("Free") : c("Paid");
async function M() {
	let e = (await D({
		title: c("Add License Key"),
		fields: [{
			handle: "key",
			type: "textarea",
			label: c("License Key"),
			required: !0
		}],
		confirm: c("Add License Key")
	}))?.key;
	if (!e) return !1;
	try {
		return await s("packages/add-key", { key: e }), r("packages/"), O.success(c("License key added")), !0;
	} catch (e) {
		return O.error(e), !1;
	}
}
function N({ item: e, icon: t, size: n = "md" }) {
	let r = n === "lg" ? "size-14 rounded-xl" : "size-10 rounded-lg";
	return e.icon ? /* @__PURE__ */ k("img", {
		src: e.icon,
		alt: "",
		className: T(r, "shrink-0 object-cover"),
		loading: "lazy"
	}) : /* @__PURE__ */ k("span", {
		className: T(r, "grid shrink-0 place-items-center border border-border bg-sunken text-ink"),
		children: /* @__PURE__ */ k(h, {
			name: t || e.glyph || "plugin",
			size: n === "lg" ? 26 : 20
		})
	});
}
function P({ item: e, busy: t, locked: n, onInstall: r, size: i = "sm" }) {
	switch (e.action) {
		case "install":
		case "update": return /* @__PURE__ */ k(m, {
			size: i,
			variant: "primary",
			loading: t,
			disabled: n,
			onClick: (e) => {
				e.stopPropagation(), r();
			},
			children: e.action === "update" ? c("Update") : c("Install")
		});
		case "buy": return e.listing_url ? /* @__PURE__ */ k(m, {
			size: i,
			onClick: (t) => {
				t.stopPropagation(), window.open(e.listing_url, "_blank", "noopener");
			},
			children: c("Buy on Store")
		}) : /* @__PURE__ */ k("span", {
			className: "text-xs text-muted",
			children: c("Paid Plugin")
		});
		case "installed": return /* @__PURE__ */ A("span", {
			className: "inline-flex items-center gap-1 text-xs text-muted",
			children: [/* @__PURE__ */ k(h, {
				name: "check",
				size: 14
			}), c("Installed")]
		});
		case "blocked": return /* @__PURE__ */ k(p, {
			tone: "danger",
			children: c("Blocked")
		});
		default: return /* @__PURE__ */ k("span", {
			className: "text-xs text-muted",
			children: c("Not for this version")
		});
	}
}
// admin/src/StoreDetail.tsx
var F = (e) => {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? e : t.toLocaleDateString(i(), {
		year: "numeric",
		month: "long",
		day: "numeric"
	});
}, I = (e) => {
	let t = /(?:>=|\^|~)\s*v?(\d+(?:\.\d+)?)/.exec(e);
	return t ? c("{version} or later", { version: t[1] }) : e;
};
function ie({ item: e, icon: t, onClose: n, busy: r, locked: i, onInstall: a }) {
	let o = l("packages/item", {
		store: e.store,
		package: e.package
	}), s = o.data, [ee, u] = f(!0), [d, te] = f("overview"), g = async () => {
		await M() && n();
	}, _ = s?.releases ?? [], v = [
		[c("Version"), e.latest ?? "—"],
		...e.installed && e.installed !== e.latest ? [[c("Installed Here"), e.installed]] : [],
		..._[0]?.released_at ? [[c("Updated"), F(_[0].released_at)]] : [],
		[c("Price"), j(e)],
		...s?.requires.core ? [[c("Works With"), c("{brand} {version}", { version: I(s.requires.core) })]] : [],
		...s?.requires.php ? [["PHP", I(s.requires.php)]] : [],
		...e.categories.length ? [[c("Categories"), e.categories.join(", ")]] : [],
		[c("Made By"), e.author.url ? /* @__PURE__ */ k("a", {
			href: e.author.url,
			target: "_blank",
			rel: "noopener noreferrer",
			className: "text-ink underline underline-offset-2",
			children: e.author.name || e.package
		}) : e.author.name || e.package],
		...s?.operator && e.pricing !== "free" ? [[c("Sold By"), s.operator]] : [],
		[c("Package"), /* @__PURE__ */ k("code", {
			className: "text-xs",
			children: e.package
		}, "p")]
	], y = [
		s?.docs_url && {
			label: c("Documentation"),
			href: s.docs_url,
			icon: "book-open"
		},
		s?.repository_url && {
			label: c("Source Code"),
			href: s.repository_url,
			icon: "code"
		},
		e.listing_url && {
			label: c("Store Page"),
			href: e.listing_url,
			icon: "arrow-square-out"
		}
	].filter(Boolean);
	return /* @__PURE__ */ k(C, {
		id: "store-item",
		open: !0,
		expanded: ee,
		onExpandedChange: u,
		onOpenChange: (e) => {
			e || n();
		},
		title: e.title,
		icon: "plugin",
		children: /* @__PURE__ */ A("div", {
			className: "mx-auto max-w-5xl p-4 sm:p-6",
			children: [
				/* @__PURE__ */ A("header", {
					className: "flex flex-wrap items-start gap-4",
					children: [
						/* @__PURE__ */ k(N, {
							item: e,
							icon: t,
							size: "lg"
						}),
						/* @__PURE__ */ A("div", {
							className: "min-w-0 flex-1 basis-56",
							children: [
								/* @__PURE__ */ k("h2", {
									className: "m-0 text-xl font-medium text-ink",
									children: e.title
								}),
								/* @__PURE__ */ k("p", {
									className: "m-0 mt-0.5 text-sm text-muted",
									children: c("By {name}", { name: e.author.name || e.package })
								}),
								/* @__PURE__ */ k("p", {
									className: "m-0 mt-2 max-w-2xl text-sm text-text",
									children: e.summary
								})
							]
						}),
						/* @__PURE__ */ A("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [e.action === "buy" && /* @__PURE__ */ k(m, {
								disabled: i,
								onClick: () => void g(),
								children: c("Add License Key")
							}), /* @__PURE__ */ k(P, {
								item: e,
								busy: r,
								locked: i,
								onInstall: a,
								size: "md"
							})]
						})
					]
				}),
				e.access.message && /* @__PURE__ */ k("p", {
					className: "m-0 mt-3 text-xs text-muted",
					children: e.access.message
				}),
				/* @__PURE__ */ A("div", {
					className: "mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]",
					children: [/* @__PURE__ */ A("div", {
						className: "min-w-0",
						children: [
							o.isLoading ? /* @__PURE__ */ k(S, { className: "aspect-[16/10] w-full" }) : /* @__PURE__ */ k(L, { shots: s?.gallery ?? [] }),
							/* @__PURE__ */ k(w, {
								className: "mt-6",
								value: d,
								onChange: te,
								tabs: [{
									value: "overview",
									label: c("Overview")
								}, {
									value: "changelog",
									label: c("Changelog"),
									count: _.length || void 0
								}]
							}),
							/* @__PURE__ */ k("div", {
								className: "pt-4 text-sm",
								children: d === "overview" ? /* @__PURE__ */ A("div", {
									className: "space-y-6",
									children: [
										o.isLoading ? /* @__PURE__ */ k(S, { className: "h-32" }) : s?.description_html ? /* @__PURE__ */ k("div", {
											className: "cms-store-description",
											dangerouslySetInnerHTML: { __html: s.description_html }
										}) : /* @__PURE__ */ k("p", {
											className: "m-0",
											children: e.summary
										}),
										(s?.requirements.length ?? 0) > 0 && /* @__PURE__ */ A("section", { children: [/* @__PURE__ */ k("h3", {
											className: "m-0 mb-2 text-sm font-medium text-ink",
											children: c("What It Needs")
										}), /* @__PURE__ */ k("ul", {
											className: "m-0 list-disc space-y-1 pl-5 text-text",
											children: s.requirements.map((e) => /* @__PURE__ */ k("li", { children: e }, e))
										})] }),
										s && s.capabilities.length > 0 && /* @__PURE__ */ A("section", { children: [/* @__PURE__ */ k("h3", {
											className: "m-0 mb-2 text-sm font-medium text-ink",
											children: c("It may use")
										}), /* @__PURE__ */ k("div", {
											className: "flex flex-wrap gap-1.5",
											children: s.capabilities.map((e) => /* @__PURE__ */ k(p, { children: e }, e))
										})] })
									]
								}) : _.length === 0 ? /* @__PURE__ */ k("p", {
									className: "m-0 text-muted",
									children: c("This store doesn’t say what changed.")
								}) : /* @__PURE__ */ k("ol", {
									className: "m-0 list-none space-y-5 p-0",
									children: _.map((e) => /* @__PURE__ */ A("li", { children: [/* @__PURE__ */ A("div", {
										className: "flex flex-wrap items-baseline gap-2",
										children: [
											/* @__PURE__ */ k("span", {
												className: "font-medium text-ink",
												children: e.version
											}),
											/* @__PURE__ */ k("span", {
												className: "text-xs text-muted",
												children: F(e.released_at)
											}),
											e.security && /* @__PURE__ */ k(p, {
												tone: "warning",
												children: c("Security Fix")
											})
										]
									}), e.notes && /* @__PURE__ */ k("p", {
										className: "m-0 mt-1 whitespace-pre-line text-text",
										children: e.notes
									})] }, e.version))
								})
							})
						]
					}), /* @__PURE__ */ A("aside", {
						className: "min-w-0 lg:border-l lg:border-border lg:pl-6",
						children: [/* @__PURE__ */ k("dl", {
							className: "m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm",
							children: v.map(([e, t]) => /* @__PURE__ */ A("div", {
								className: "contents",
								children: [/* @__PURE__ */ k("dt", {
									className: "text-muted",
									children: e
								}), /* @__PURE__ */ k("dd", {
									className: "m-0 truncate text-right text-ink",
									children: t
								})]
							}, e))
						}), y.length > 0 && /* @__PURE__ */ k("div", {
							className: "mt-5 grid gap-1 border-t border-border pt-4",
							children: y.map((e) => /* @__PURE__ */ A("a", {
								href: e.href,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink no-underline hover:bg-hover",
								children: [/* @__PURE__ */ k(h, {
									name: e.icon,
									size: 16,
									className: "text-muted"
								}), e.label]
							}, e.href))
						})]
					})]
				})
			]
		})
	});
}
function L({ shots: e }) {
	let [t, n] = f(0);
	if (e.length === 0) return null;
	let r = e[Math.min(t, e.length - 1)], i = (t) => n((n) => (n + t + e.length) % e.length);
	return /* @__PURE__ */ A("figure", {
		className: "m-0",
		children: [
			/* @__PURE__ */ A("div", {
				className: "relative overflow-hidden rounded-lg border border-border bg-sunken",
				children: [/* @__PURE__ */ k("img", {
					src: r.url,
					alt: r.alt,
					className: "block aspect-[16/10] w-full object-cover object-top"
				}), e.length > 1 && /* @__PURE__ */ A("div", {
					className: "absolute right-2 bottom-2 flex gap-1",
					children: [/* @__PURE__ */ k(g, {
						icon: "arrow-left",
						label: c("Previous Picture"),
						variant: "secondary",
						onClick: () => i(-1)
					}), /* @__PURE__ */ k(g, {
						icon: "arrow-right",
						label: c("Next Picture"),
						variant: "secondary",
						onClick: () => i(1)
					})]
				})]
			}),
			r.alt && /* @__PURE__ */ k("figcaption", {
				className: "mt-2 text-xs text-muted",
				children: r.alt
			}),
			e.length > 1 && /* @__PURE__ */ k("div", {
				className: "mt-2 flex gap-2 overflow-x-auto pb-1",
				children: e.map((e, r) => /* @__PURE__ */ k(b, {
					onClick: () => n(r),
					"aria-label": c("Show picture {n}", { n: r + 1 }),
					"aria-current": r === t || void 0,
					className: T("w-24 shrink-0 overflow-hidden rounded-md border transition-opacity duration-base", r === t ? "border-ink opacity-100" : "border-border opacity-60 hover:opacity-100"),
					children: /* @__PURE__ */ k("img", {
						src: e.url,
						alt: "",
						className: "block aspect-[16/10] w-full object-cover object-top",
						loading: "lazy"
					})
				}, e.url))
			})
		]
	});
}
// admin/src/Store.tsx
var R = 2097152, z = (e) => {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
};
async function B(e, t) {
	let n = crypto.randomUUID().replaceAll("-", "").slice(0, 24), r = new Uint8Array(await e.arrayBuffer()), i = null, a = Math.max(1, Math.ceil(r.length / R));
	for (let e = 0; e < a; e++) {
		let o = await s("packages/upload", {
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
function V() {
	let [p, b] = f("default"), C = l("package-stores/list"), w = l("packages/catalog", { store: p }), [T, j] = f(""), [N, P] = f(""), [F, I] = f("all"), [L, R] = f("popular"), [z, V] = f(null), { query: H } = ee(), [U, W] = f(null), [G, K] = f(null), [oe, se] = f(!0), q = d(null), J = w.data, ce = l("packages/list", { type: "all" }), le = Object.fromEntries((ce.data?.items ?? []).map((e) => [e.name, e.icon])), Y = C.data?.items.find((e) => e.id === p), X = J?.items ?? [], Z = z ?? (H.item ? X.find((e) => e.package === H.item) ?? null : null), ue = () => {
		V(null), H.item && a("/plugins?tab=store", { replace: !0 });
	}, de = u(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of X) for (let n of t.categories) e.set(n, (e.get(n) ?? 0) + 1);
		return [...e].sort((e, t) => e[0].localeCompare(t[0], i()));
	}, [X]), fe = X.some((e) => e.pricing !== "free") && X.some((e) => e.pricing === "free"), Q = u(() => {
		let e = T.trim().toLocaleLowerCase(i()).split(/\s+/).filter(Boolean), t = X.filter((t) => {
			let n = `${t.title} ${t.summary} ${t.package} ${t.author.name} ${t.categories.join(" ")}`.toLocaleLowerCase(i());
			return (!N || t.categories.includes(N)) && (F === "all" || F === "free" == (t.pricing === "free")) && e.every((e) => n.includes(e));
		});
		return L === "name" ? [...t].sort((e, t) => e.title.localeCompare(t.title, i())) : L === "installed" ? [...t].sort((e, t) => Number(!!t.installed) - Number(!!e.installed)) : t;
	}, [
		X,
		T,
		N,
		F,
		L
	]), $ = T.trim() !== "" || N !== "" || F !== "all", pe = !$ && L === "popular" ? [...Q.filter((e) => e.featured), ...Q.filter((e) => !e.featured)] : Q, me = X.some((e) => e.pricing !== "free"), he = new Set(X.map((e) => e.author.name || e.package)).size > 1, ge = () => {
		j(""), P(""), I("all");
	}, _e = async (e) => {
		r("packages/"), await w.refetch(), O.success(e);
	}, ve = async (t) => {
		W(t.package);
		try {
			let n = await s("packages/plan-install", {
				store: t.store,
				package: t.package,
				version: t.latest ?? void 0
			}), r = n.steps.filter((e) => !e.enable_only).map((e) => `${e.title} ${e.version}`);
			if (!await E({
				title: t.installed ? c("Update {name}?", { name: t.title }) : c("Install {name}?", { name: t.title }),
				description: [
					r.length > 1 ? c("Also installs what it needs: {list}.", { list: r.join(", ") }) : "",
					n.capabilities.length ? c("It may use: {list}.", { list: n.capabilities.join(", ") }) : "",
					c("This code runs with full access to your site.")
				].filter(Boolean).join(" "),
				confirm: t.installed ? c("Update") : c("Install")
			})) return;
			for (let r of n.steps) {
				if (r.enable_only) {
					await s("packages/enable", { name: r.package });
					continue;
				}
				K(c("Installing {name}…", { name: r.title }));
				let n = await s("packages/install", {
					store: t.store,
					package: r.package,
					version: r.version,
					turnOn: oe
				});
				await e(n);
			}
			await _e(t.installed ? c("{name} updated", { name: t.title }) : c("{name} installed", { name: t.title }));
		} catch (e) {
			O.error(e);
		} finally {
			W(null), K(null);
		}
	}, ye = async (r) => {
		W("upload"), K(c("Uploading {name}…", { name: r.name }));
		try {
			let i = await B(r, !1);
			try {
				i = await e(i);
			} catch (a) {
				if (!(a instanceof t) || a.code !== "unsigned" || !n("packages.install_unsigned")) throw a;
				if (!await E({
					title: c("Install {name} unsigned?", { name: r.name }),
					description: c("No store vouches for this file. It runs with full access to your site, and it gets no update offers."),
					confirm: c("Install Unsigned"),
					danger: !0
				})) return;
				i = await e(await B(r, !0));
			}
			await _e(c("{name} installed", { name: i.package ?? r.name }));
		} catch (e) {
			O.error(e);
		} finally {
			W(null), K(null), q.current && (q.current.value = "");
		}
	}, be = async () => {
		let e = (await D({
			title: c("Add Store"),
			description: c("Code from a store runs with full access to this site. Add it only if you trust who runs it."),
			fields: [{
				handle: "url",
				type: "text",
				label: c("Store Address"),
				required: !0,
				placeholder: "https://"
			}],
			confirm: c("Check Store")
		}))?.url;
		if (e) try {
			let t = await s("package-stores/create", { url: e }), n = (await D({
				title: c("Add {name}?", { name: t.name }),
				description: c("Compare this key fingerprint with the one in the store’s own documentation, then type it here: {fingerprint}", { fingerprint: t.fingerprint }),
				fields: [{
					handle: "fingerprint",
					type: "text",
					label: c("Key Fingerprint"),
					required: !0
				}],
				confirm: c("Add Store")
			}))?.fingerprint;
			if (!n) return;
			let r = await s("package-stores/create", {
				url: e,
				confirm: n
			});
			if (!r.added) {
				O.error(c("That fingerprint does not match. The store was not added."));
				return;
			}
			await C.refetch(), b(r.id);
		} catch (e) {
			O.error(e);
		}
	}, xe = async () => {
		Y && await E({
			title: c("Remove {name}?", { name: Y.name }),
			description: c("What it installed stays, without update offers."),
			confirm: c("Remove Store"),
			danger: !0
		}) && (await s("package-stores/delete", { id: p }), b("default"), await C.refetch());
	}, Se = async () => {
		W("refresh");
		try {
			let e = await s("packages/catalog", {
				store: p,
				refresh: !0
			});
			e.error && O.error(e.error), r("packages/catalog"), await w.refetch();
		} catch (e) {
			O.error(e);
		} finally {
			W(null);
		}
	}, Ce = J ? J.problem === "dev_trust" ? c("This build has development keys, so the store is closed.") : J.problem ? c("No valid signing keys, so the store is off. Upload packages instead.") : J.freshness === "clock" ? c("This server’s clock looks wrong, so installs are paused.") : J.freshness === "expired" ? c("This catalog is out of date, so installs are off until the store is checked again.") : J.freshness === "stale" ? c("This catalog is a few days old.") : J.error ? c("Can’t reach the store. {error}", { error: J.error }) : null : null, we = (e) => /* @__PURE__ */ k(ae, {
		item: e,
		priced: me,
		authored: he,
		icon: le[e.package],
		busy: U === e.package,
		locked: U !== null,
		onOpen: () => V(e),
		onInstall: () => void ve(e)
	}, e.package);
	return /* @__PURE__ */ A("div", { children: [
		/* @__PURE__ */ k("input", {
			ref: q,
			type: "file",
			accept: ".zip,application/zip",
			className: "hidden",
			onChange: (e) => e.target.files?.[0] && void ye(e.target.files[0])
		}),
		/* @__PURE__ */ A("div", {
			className: "mb-3 flex min-h-10 flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ k(_, {
					size: "sm",
					className: "w-full sm:w-72",
					icon: "search",
					value: T,
					onChange: (e) => j(e.target.value),
					placeholder: c("Search {items}", { items: c("Plugins") }),
					"aria-label": c("Search")
				}),
				/* @__PURE__ */ k("div", {
					className: "w-40 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
					children: /* @__PURE__ */ k(x, {
						size: "sm",
						value: L,
						onChange: (e) => R(e ?? "popular"),
						"aria-label": c("Sort"),
						options: [
							{
								value: "popular",
								label: c("Most Popular")
							},
							{
								value: "name",
								label: c("Name")
							},
							{
								value: "installed",
								label: c("Installed First")
							}
						]
					})
				}),
				de.some(([, e]) => e > 1) && /* @__PURE__ */ k("div", {
					className: "w-40 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
					children: /* @__PURE__ */ k(x, {
						size: "sm",
						value: N || "all",
						onChange: (e) => P(!e || e === "all" ? "" : e),
						"aria-label": c("Category"),
						options: [{
							value: "all",
							label: c("All Categories")
						}, ...de.map(([e]) => ({
							value: e,
							label: e
						}))]
					})
				}),
				fe && /* @__PURE__ */ k("div", {
					className: "w-28 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
					children: /* @__PURE__ */ k(x, {
						size: "sm",
						value: F,
						onChange: (e) => I(e ?? "all"),
						"aria-label": c("Price"),
						options: [
							{
								value: "all",
								label: c("Any Price")
							},
							{
								value: "free",
								label: c("Free")
							},
							{
								value: "paid",
								label: c("Paid")
							}
						]
					})
				}),
				/* @__PURE__ */ A("div", {
					className: "ml-auto flex items-center gap-1",
					children: [
						(C.data?.items.length ?? 0) > 1 && /* @__PURE__ */ k("div", {
							className: "w-40 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
							children: /* @__PURE__ */ k(x, {
								size: "sm",
								value: p,
								onChange: (e) => b(e ?? "default"),
								options: C.data.items.map((e) => ({
									value: e.id,
									label: e.name
								})),
								"aria-label": c("Store")
							})
						}),
						/* @__PURE__ */ k(m, {
							variant: "ghost",
							icon: "upload",
							disabled: U !== null,
							onClick: () => q.current?.click(),
							children: c("Upload Zip")
						}),
						/* @__PURE__ */ k(y, {
							trigger: /* @__PURE__ */ k(g, {
								icon: "more",
								label: c("More")
							}),
							items: [
								{
									label: c("Check Now"),
									icon: "refresh",
									disabled: U !== null,
									onSelect: () => void Se()
								},
								me && {
									label: c("Add License Key"),
									icon: "key",
									onSelect: () => void M()
								},
								{
									label: c("Turn On After Install"),
									checked: oe,
									onSelect: () => se((e) => !e)
								},
								{
									separator: !0,
									label: ""
								},
								{
									label: c("Add Store"),
									icon: "plus",
									onSelect: () => void be()
								},
								Y && !Y.default && {
									label: c("Remove {name}", { name: Y.name }),
									icon: "trash",
									danger: !0,
									onSelect: () => void xe()
								}
							]
						})
					]
				})
			]
		}),
		G && /* @__PURE__ */ k("p", {
			role: "status",
			className: "mb-4 text-sm text-muted",
			children: G
		}),
		Ce && /* @__PURE__ */ A("p", {
			className: "mb-4 flex items-center gap-2 border-y border-border py-3 text-sm text-text",
			children: [/* @__PURE__ */ k(h, {
				name: "info",
				size: 16,
				className: "shrink-0 text-muted"
			}), Ce]
		}),
		w.isLoading ? /* @__PURE__ */ k(v, { children: [
			0,
			1,
			2,
			3
		].map((e) => /* @__PURE__ */ A("div", {
			role: "listitem",
			className: "flex min-h-16 items-center gap-3 px-3",
			children: [/* @__PURE__ */ k(S, { className: "size-10 rounded-lg" }), /* @__PURE__ */ A("div", {
				className: "flex-1 space-y-2",
				children: [/* @__PURE__ */ k(S, { className: "h-3 w-32" }), /* @__PURE__ */ k(S, { className: "h-3 w-64 max-w-full" })]
			})]
		}, e)) }) : Q.length === 0 ? $ ? /* @__PURE__ */ k(ne, { onClear: ge }) : /* @__PURE__ */ k(te, {
			icon: "download",
			title: c("Nothing in this store yet"),
			action: /* @__PURE__ */ k(m, {
				onClick: () => q.current?.click(),
				children: c("Upload Zip")
			})
		}) : /* @__PURE__ */ A(re, { children: [$ && /* @__PURE__ */ k("h2", {
			className: "m-0 mb-3 text-sm font-medium text-ink",
			children: o(Q.length, "{count} result", "{count} results")
		}), /* @__PURE__ */ k(v, { children: pe.map(we) })] }),
		Z && /* @__PURE__ */ k(ie, {
			item: X.find((e) => e.package === Z.package) ?? Z,
			icon: le[Z.package],
			onClose: ue,
			busy: U === Z.package,
			locked: U !== null,
			onInstall: () => void ve(Z)
		})
	] });
}
function ae({ item: e, icon: t, priced: n, authored: r, busy: i, locked: a, onOpen: o, onInstall: s }) {
	return /* @__PURE__ */ A("div", {
		role: "listitem",
		className: "flex min-h-16 items-center gap-3 px-3 py-2",
		children: [
			/* @__PURE__ */ k(N, {
				item: e,
				icon: t
			}),
			/* @__PURE__ */ A("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ A("div", {
					className: "flex min-w-0 items-center gap-2",
					children: [/* @__PURE__ */ k(m, {
						variant: "ghost",
						className: "-ml-2.5 min-w-0 font-medium text-ink",
						onClick: o,
						children: /* @__PURE__ */ k("span", {
							className: "truncate",
							children: e.title
						})
					}), n && /* @__PURE__ */ k(p, { children: j(e) })]
				}), /* @__PURE__ */ k("p", {
					className: "m-0 truncate text-xs text-muted",
					children: [r && c("By {name}", { name: e.author.name || e.package }), e.summary].filter(Boolean).join(" · ")
				})]
			}),
			/* @__PURE__ */ k("span", {
				className: "shrink-0 text-xs tabular-nums text-muted max-sm:hidden",
				children: e.latest
			}),
			/* @__PURE__ */ k("div", {
				className: "shrink-0",
				children: /* @__PURE__ */ k(P, {
					item: e,
					busy: i,
					locked: a,
					onInstall: s
				})
			})
		]
	});
}
export { V as Store };
