import { n as e, t } from "./installing-CCPtKzo4.js";
import { can as n, invalidate as r, locale as i, plural as a, run as o, t as s, useAbility as c } from "@letterncms/sdk";
import { useMemo as l, useRef as u, useState as d } from "react";
import { Badge as f, Button as p, EmptyState as m, Icon as h, IconButton as g, Input as _, List as v, Menu as y, NoMatches as b, Select as x, Skeleton as S, Slideover as C, Tabs as w, cn as T, confirm as E, prompt as D, toast as O } from "@letterncms/ui";
import { Fragment as ee, jsx as k, jsxs as A } from "react/jsx-runtime";
// admin/src/storeItem.tsx
var j = (e) => e.pricing === "free" ? s("Free") : s("Paid");
function M({ item: e, icon: t, size: n = "md" }) {
	let r = n === "lg" ? "size-14 rounded-xl" : "size-10 rounded-lg";
	return e.icon ? /* @__PURE__ */ k("img", {
		src: e.icon,
		alt: "",
		className: T(r, "shrink-0 object-cover"),
		loading: "lazy"
	}) : /* @__PURE__ */ k("span", {
		className: T(r, "grid shrink-0 place-items-center border border-border bg-sunken text-ink"),
		children: /* @__PURE__ */ k(h, {
			name: e.glyph || t || "plugin",
			size: n === "lg" ? 26 : 20
		})
	});
}
function N({ item: e, busy: t, locked: n, onInstall: r, size: i = "sm" }) {
	switch (e.action) {
		case "install":
		case "update": return /* @__PURE__ */ k(p, {
			size: i,
			variant: "primary",
			loading: t,
			disabled: n,
			onClick: (e) => {
				e.stopPropagation(), r();
			},
			children: e.action === "update" ? s("Update") : s("Install")
		});
		case "buy": return e.listing_url ? /* @__PURE__ */ k(p, {
			size: i,
			onClick: (t) => {
				t.stopPropagation(), window.open(e.listing_url, "_blank", "noopener");
			},
			children: s("Buy on Store")
		}) : /* @__PURE__ */ k("span", {
			className: "text-xs text-muted",
			children: s("Paid Plugin")
		});
		case "installed": return /* @__PURE__ */ A("span", {
			className: "inline-flex items-center gap-1 text-xs text-muted",
			children: [/* @__PURE__ */ k(h, {
				name: "check",
				size: 14
			}), s("Installed")]
		});
		case "blocked": return /* @__PURE__ */ k(f, {
			tone: "danger",
			children: s("Blocked")
		});
		default: return /* @__PURE__ */ k("span", {
			className: "text-xs text-muted",
			children: s("Not for this version")
		});
	}
}
// admin/src/StoreDetail.tsx
var P = (e) => {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? e : t.toLocaleDateString(i(), {
		year: "numeric",
		month: "long",
		day: "numeric"
	});
}, F = (e) => {
	let t = /(?:>=|\^|~)\s*v?(\d+(?:\.\d+)?)/.exec(e);
	return t ? s("{version} or later", { version: t[1] }) : e;
};
function te({ item: e, icon: t, onClose: n, busy: i, locked: a, onInstall: l }) {
	let u = c("packages/item", {
		store: e.store,
		package: e.package
	}), m = u.data, [g, _] = d(!0), [v, y] = d("overview"), b = async () => {
		let e = (await D({
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
			await o("packages/add-key", { key: e }), r("packages/"), O.success(s("Key added")), n();
		} catch (e) {
			O.error(e);
		}
	}, x = m?.releases ?? [], T = [
		[s("Version"), e.latest ?? "—"],
		...e.installed && e.installed !== e.latest ? [[s("Installed Here"), e.installed]] : [],
		...x[0]?.released_at ? [[s("Updated"), P(x[0].released_at)]] : [],
		[s("Price"), j(e)],
		...m?.requires.core ? [[s("Works With"), s("{brand} {version}", { version: F(m.requires.core) })]] : [],
		...m?.requires.php ? [["PHP", F(m.requires.php)]] : [],
		...e.categories.length ? [[s("Categories"), e.categories.join(", ")]] : [],
		[s("Made By"), e.author.url ? /* @__PURE__ */ k("a", {
			href: e.author.url,
			target: "_blank",
			rel: "noopener noreferrer",
			className: "text-ink underline underline-offset-2",
			children: e.author.name || e.package
		}) : e.author.name || e.package],
		...m?.operator && e.pricing !== "free" ? [[s("Sold By"), m.operator]] : [],
		[s("Package"), /* @__PURE__ */ k("code", {
			className: "text-xs",
			children: e.package
		}, "p")]
	], E = [
		m?.docs_url && {
			label: s("Documentation"),
			href: m.docs_url,
			icon: "book-open"
		},
		m?.repository_url && {
			label: s("Source Code"),
			href: m.repository_url,
			icon: "code"
		},
		e.listing_url && {
			label: s("Store Page"),
			href: e.listing_url,
			icon: "arrow-square-out"
		}
	].filter(Boolean);
	return /* @__PURE__ */ k(C, {
		id: "store-item",
		open: !0,
		expanded: g,
		onExpandedChange: _,
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
						/* @__PURE__ */ k(M, {
							item: e,
							icon: t,
							size: "lg"
						}),
						/* @__PURE__ */ A("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ k("h2", {
									className: "m-0 text-xl font-medium text-ink",
									children: e.title
								}),
								/* @__PURE__ */ k("p", {
									className: "m-0 mt-0.5 text-sm text-muted",
									children: s("By {name}", { name: e.author.name || e.package })
								}),
								/* @__PURE__ */ k("p", {
									className: "m-0 mt-2 max-w-2xl text-sm text-text",
									children: e.summary
								})
							]
						}),
						/* @__PURE__ */ A("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [e.action === "buy" && /* @__PURE__ */ k(p, {
								disabled: a,
								onClick: () => void b(),
								children: s("Add Key")
							}), /* @__PURE__ */ k(N, {
								item: e,
								busy: i,
								locked: a,
								onInstall: l,
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
							u.isLoading ? /* @__PURE__ */ k(S, { className: "aspect-[16/10] w-full" }) : /* @__PURE__ */ k(I, { shots: m?.gallery ?? [] }),
							/* @__PURE__ */ k(w, {
								className: "mt-6",
								value: v,
								onChange: y,
								tabs: [{
									value: "overview",
									label: s("Overview")
								}, {
									value: "changelog",
									label: s("Changelog"),
									count: x.length || void 0
								}]
							}),
							/* @__PURE__ */ k("div", {
								className: "pt-4 text-sm",
								children: v === "overview" ? /* @__PURE__ */ A("div", {
									className: "space-y-6",
									children: [
										u.isLoading ? /* @__PURE__ */ k(S, { className: "h-32" }) : m?.description_html ? /* @__PURE__ */ k("div", {
											className: "cms-store-description",
											dangerouslySetInnerHTML: { __html: m.description_html }
										}) : /* @__PURE__ */ k("p", {
											className: "m-0",
											children: e.summary
										}),
										(m?.requirements.length ?? 0) > 0 && /* @__PURE__ */ A("section", { children: [/* @__PURE__ */ k("h3", {
											className: "m-0 mb-2 text-sm font-medium text-ink",
											children: s("What It Needs")
										}), /* @__PURE__ */ k("ul", {
											className: "m-0 list-disc space-y-1 pl-5 text-text",
											children: m.requirements.map((e) => /* @__PURE__ */ k("li", { children: e }, e))
										})] }),
										m && m.capabilities.length > 0 && /* @__PURE__ */ A("section", { children: [/* @__PURE__ */ k("h3", {
											className: "m-0 mb-2 text-sm font-medium text-ink",
											children: s("It may use")
										}), /* @__PURE__ */ k("div", {
											className: "flex flex-wrap gap-1.5",
											children: m.capabilities.map((e) => /* @__PURE__ */ k(f, { children: e }, e))
										})] })
									]
								}) : x.length === 0 ? /* @__PURE__ */ k("p", {
									className: "m-0 text-muted",
									children: s("This store doesn’t say what changed.")
								}) : /* @__PURE__ */ k("ol", {
									className: "m-0 list-none space-y-5 p-0",
									children: x.map((e) => /* @__PURE__ */ A("li", { children: [/* @__PURE__ */ A("div", {
										className: "flex flex-wrap items-baseline gap-2",
										children: [
											/* @__PURE__ */ k("span", {
												className: "font-medium text-ink",
												children: e.version
											}),
											/* @__PURE__ */ k("span", {
												className: "text-xs text-muted",
												children: P(e.released_at)
											}),
											e.security && /* @__PURE__ */ k(f, {
												tone: "warning",
												children: s("Security Fix")
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
							children: T.map(([e, t]) => /* @__PURE__ */ A("div", {
								className: "contents",
								children: [/* @__PURE__ */ k("dt", {
									className: "text-muted",
									children: e
								}), /* @__PURE__ */ k("dd", {
									className: "m-0 truncate text-right text-ink",
									children: t
								})]
							}, e))
						}), E.length > 0 && /* @__PURE__ */ k("div", {
							className: "mt-5 grid gap-1 border-t border-border pt-4",
							children: E.map((e) => /* @__PURE__ */ A("a", {
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
function I({ shots: e }) {
	let [t, n] = d(0);
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
						label: s("Previous Picture"),
						variant: "secondary",
						onClick: () => i(-1)
					}), /* @__PURE__ */ k(g, {
						icon: "arrow-right",
						label: s("Next Picture"),
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
				children: e.map((e, r) => /* @__PURE__ */ k("button", {
					type: "button",
					onClick: () => n(r),
					"aria-label": s("Show picture {n}", { n: r + 1 }),
					"aria-current": r === t || void 0,
					className: T("w-24 shrink-0 cursor-pointer overflow-hidden rounded-md border bg-transparent p-0 transition-opacity", r === t ? "border-ink opacity-100" : "border-border opacity-60 hover:opacity-100"),
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
var L = 2097152, R = (e) => {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
};
async function z(e, t) {
	let n = crypto.randomUUID().replaceAll("-", "").slice(0, 24), r = new Uint8Array(await e.arrayBuffer()), i = null, a = Math.max(1, Math.ceil(r.length / L));
	for (let e = 0; e < a; e++) {
		let s = await o("packages/upload", {
			id: n,
			index: e,
			last: e === a - 1,
			allowUnsigned: t,
			data: R(r.subarray(e * L, (e + 1) * L))
		});
		e === a - 1 && (i = s);
	}
	return i;
}
function B() {
	let [f, C] = d("default"), w = c("package-stores/list"), T = c("packages/catalog", { store: f }), [j, M] = d(""), [N, P] = d(""), [F, I] = d("all"), [L, R] = d("popular"), [B, re] = d(null), [V, H] = d(null), [U, W] = d(null), [G, ie] = d(!0), K = u(null), q = T.data, ae = c("packages/list", { type: "all" }), J = Object.fromEntries((ae.data?.items ?? []).map((e) => [e.name, e.icon])), Y = w.data?.items.find((e) => e.id === f), X = q?.items ?? [], Z = l(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of X) for (let n of t.categories) e.set(n, (e.get(n) ?? 0) + 1);
		return [...e].sort((e, t) => e[0].localeCompare(t[0], i()));
	}, [X]), oe = X.some((e) => e.pricing !== "free") && X.some((e) => e.pricing === "free"), Q = l(() => {
		let e = j.trim().toLocaleLowerCase(i()).split(/\s+/).filter(Boolean), t = X.filter((t) => {
			let n = `${t.title} ${t.summary} ${t.package} ${t.author.name} ${t.categories.join(" ")}`.toLocaleLowerCase(i());
			return (!N || t.categories.includes(N)) && (F === "all" || F === "free" == (t.pricing === "free")) && e.every((e) => n.includes(e));
		});
		return L === "name" ? [...t].sort((e, t) => e.title.localeCompare(t.title, i())) : L === "installed" ? [...t].sort((e, t) => Number(!!t.installed) - Number(!!e.installed)) : t;
	}, [
		X,
		j,
		N,
		F,
		L
	]), $ = j.trim() !== "" || N !== "" || F !== "all", se = !$ && L === "popular" ? [...Q.filter((e) => e.featured), ...Q.filter((e) => !e.featured)] : Q, ce = X.some((e) => e.pricing !== "free"), le = new Set(X.map((e) => e.author.name || e.package)).size > 1, ue = () => {
		M(""), P(""), I("all");
	}, de = async (e) => {
		r("packages/"), await T.refetch(), O.success(e);
	}, fe = async (t) => {
		H(t.package);
		try {
			let n = await o("packages/plan-install", {
				store: t.store,
				package: t.package,
				version: t.latest ?? void 0
			}), r = n.steps.filter((e) => !e.enable_only).map((e) => `${e.title} ${e.version}`);
			if (!await E({
				title: t.installed ? s("Update {name}?", { name: t.title }) : s("Install {name}?", { name: t.title }),
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
				W(s("Installing {name}…", { name: r.title }));
				let n = await o("packages/install", {
					store: t.store,
					package: r.package,
					version: r.version,
					turnOn: G
				});
				await e(n);
			}
			await de(t.installed ? s("{name} updated", { name: t.title }) : s("{name} installed", { name: t.title }));
		} catch (e) {
			O.error(e);
		} finally {
			H(null), W(null);
		}
	}, pe = async (r) => {
		H("upload"), W(s("Uploading {name}…", { name: r.name }));
		try {
			let i = await z(r, !1);
			try {
				i = await e(i);
			} catch (a) {
				if (!(a instanceof t) || a.code !== "unsigned" || !n("packages.install_unsigned")) throw a;
				if (!await E({
					title: s("Install {name} unsigned?", { name: r.name }),
					description: s("No store vouches for this file. It runs with full access to your site, and it gets no update offers."),
					confirm: s("Install Unsigned"),
					danger: !0
				})) return;
				i = await e(await z(r, !0));
			}
			await de(s("{name} installed", { name: i.package ?? r.name }));
		} catch (e) {
			O.error(e);
		} finally {
			H(null), W(null), K.current && (K.current.value = "");
		}
	}, me = async () => {
		let e = (await D({
			title: s("Add Store"),
			description: s("Code from a store runs with full access to this site. Add it only if you trust who runs it."),
			fields: [{
				handle: "url",
				type: "text",
				label: s("Store Address"),
				required: !0,
				placeholder: "https://"
			}],
			confirm: s("Check Store")
		}))?.url;
		if (e) try {
			let t = await o("package-stores/create", { url: e }), n = (await D({
				title: s("Add {name}?", { name: t.name }),
				description: s("Compare this key fingerprint with the one in the store’s own documentation, then type it here: {fingerprint}", { fingerprint: t.fingerprint }),
				fields: [{
					handle: "fingerprint",
					type: "text",
					label: s("Key Fingerprint"),
					required: !0
				}],
				confirm: s("Add Store")
			}))?.fingerprint;
			if (!n) return;
			let r = await o("package-stores/create", {
				url: e,
				confirm: n
			});
			if (!r.added) {
				O.error(s("That fingerprint does not match. The store was not added."));
				return;
			}
			await w.refetch(), C(r.id);
		} catch (e) {
			O.error(e);
		}
	}, he = async () => {
		Y && await E({
			title: s("Remove {name}?", { name: Y.name }),
			description: s("What it installed stays, without update offers."),
			confirm: s("Remove Store"),
			danger: !0
		}) && (await o("package-stores/delete", { id: f }), C("default"), await w.refetch());
	}, ge = async () => {
		H("refresh");
		try {
			let e = await o("packages/catalog", {
				store: f,
				refresh: !0
			});
			e.error && O.error(e.error), r("packages/catalog"), await T.refetch();
		} catch (e) {
			O.error(e);
		} finally {
			H(null);
		}
	}, _e = q ? q.problem === "dev_trust" ? s("This build has development keys, so the store is closed.") : q.problem ? s("No valid signing keys, so the store is off. Upload packages instead.") : q.freshness === "clock" ? s("This server’s clock looks wrong, so installs are paused.") : q.freshness === "expired" ? s("This catalog is out of date, so installs are off. Refresh it.") : q.freshness === "stale" ? s("This catalog is a few days old.") : q.error ? s("Can’t reach the store. {error}", { error: q.error }) : null : null, ve = (e) => /* @__PURE__ */ k(ne, {
		item: e,
		priced: ce,
		authored: le,
		icon: J[e.package],
		busy: V === e.package,
		locked: V !== null,
		onOpen: () => re(e),
		onInstall: () => void fe(e)
	}, e.package);
	return /* @__PURE__ */ A("div", { children: [
		/* @__PURE__ */ k("input", {
			ref: K,
			type: "file",
			accept: ".zip,application/zip",
			className: "hidden",
			onChange: (e) => e.target.files?.[0] && void pe(e.target.files[0])
		}),
		/* @__PURE__ */ A("div", {
			className: "mb-3 flex min-h-10 flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ k(_, {
					size: "sm",
					className: "w-full sm:w-72",
					icon: "search",
					value: j,
					onChange: (e) => M(e.target.value),
					placeholder: s("Search {items}", { items: s("Plugins") }),
					"aria-label": s("Search")
				}),
				/* @__PURE__ */ k("div", {
					className: "w-40 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
					children: /* @__PURE__ */ k(x, {
						size: "sm",
						value: L,
						onChange: (e) => R(e ?? "popular"),
						"aria-label": s("Sort"),
						options: [
							{
								value: "popular",
								label: s("Most Popular")
							},
							{
								value: "name",
								label: s("Name")
							},
							{
								value: "installed",
								label: s("Installed First")
							}
						]
					})
				}),
				Z.some(([, e]) => e > 1) && /* @__PURE__ */ k("div", {
					className: "w-40 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
					children: /* @__PURE__ */ k(x, {
						size: "sm",
						value: N || "all",
						onChange: (e) => P(!e || e === "all" ? "" : e),
						"aria-label": s("Category"),
						options: [{
							value: "all",
							label: s("All Categories")
						}, ...Z.map(([e]) => ({
							value: e,
							label: e
						}))]
					})
				}),
				oe && /* @__PURE__ */ k("div", {
					className: "w-28 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
					children: /* @__PURE__ */ k(x, {
						size: "sm",
						value: F,
						onChange: (e) => I(e ?? "all"),
						"aria-label": s("Price"),
						options: [
							{
								value: "all",
								label: s("Any Price")
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
				/* @__PURE__ */ A("div", {
					className: "ml-auto flex items-center gap-1",
					children: [
						(w.data?.items.length ?? 0) > 1 && /* @__PURE__ */ k("div", {
							className: "w-40 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
							children: /* @__PURE__ */ k(x, {
								size: "sm",
								value: f,
								onChange: (e) => C(e ?? "default"),
								options: w.data.items.map((e) => ({
									value: e.id,
									label: e.name
								})),
								"aria-label": s("Store")
							})
						}),
						/* @__PURE__ */ k(p, {
							variant: "ghost",
							icon: "upload",
							disabled: V !== null,
							onClick: () => K.current?.click(),
							children: s("Upload Zip")
						}),
						/* @__PURE__ */ k(y, {
							trigger: /* @__PURE__ */ k(g, {
								icon: "more",
								label: s("More")
							}),
							items: [
								{
									label: s("Refresh"),
									icon: "refresh",
									disabled: V !== null,
									onSelect: () => void ge()
								},
								{
									label: s("Turn On After Install"),
									checked: G,
									onSelect: () => ie((e) => !e)
								},
								{
									separator: !0,
									label: ""
								},
								{
									label: s("Add Store"),
									icon: "plus",
									onSelect: () => void me()
								},
								Y && !Y.default && {
									label: s("Remove {name}", { name: Y.name }),
									icon: "trash",
									danger: !0,
									onSelect: () => void he()
								}
							]
						})
					]
				})
			]
		}),
		U && /* @__PURE__ */ k("p", {
			role: "status",
			className: "mb-4 text-sm text-muted",
			children: U
		}),
		_e && /* @__PURE__ */ A("p", {
			className: "mb-4 flex items-center gap-2 border-y border-border py-3 text-sm text-text",
			children: [/* @__PURE__ */ k(h, {
				name: "info",
				size: 16,
				className: "shrink-0 text-muted"
			}), _e]
		}),
		T.isLoading ? /* @__PURE__ */ k(v, { children: [
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
		}, e)) }) : Q.length === 0 ? $ ? /* @__PURE__ */ k(b, { onClear: ue }) : /* @__PURE__ */ k(m, {
			icon: "download",
			title: s("Nothing in this store yet"),
			action: /* @__PURE__ */ k(p, {
				onClick: () => K.current?.click(),
				children: s("Upload Zip")
			})
		}) : /* @__PURE__ */ A(ee, { children: [$ && /* @__PURE__ */ k("h2", {
			className: "m-0 mb-3 text-sm font-medium text-ink",
			children: a(Q.length, "{count} result", "{count} results")
		}), /* @__PURE__ */ k(v, { children: se.map(ve) })] }),
		B && /* @__PURE__ */ k(te, {
			item: X.find((e) => e.package === B.package) ?? B,
			icon: J[B.package],
			onClose: () => re(null),
			busy: V === B.package,
			locked: V !== null,
			onInstall: () => void fe(B)
		})
	] });
}
function ne({ item: e, icon: t, priced: n, authored: r, busy: i, locked: a, onOpen: o, onInstall: c }) {
	return /* @__PURE__ */ A("div", {
		role: "listitem",
		className: "flex min-h-16 items-center gap-3 px-3 py-2",
		children: [
			/* @__PURE__ */ k(M, {
				item: e,
				icon: t
			}),
			/* @__PURE__ */ A("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ A("div", {
					className: "flex min-w-0 items-center gap-2",
					children: [/* @__PURE__ */ k(p, {
						variant: "ghost",
						className: "-ml-2.5 min-w-0 font-medium text-ink",
						onClick: o,
						children: /* @__PURE__ */ k("span", {
							className: "truncate",
							children: e.title
						})
					}), n && /* @__PURE__ */ k(f, { children: j(e) })]
				}), /* @__PURE__ */ k("p", {
					className: "m-0 truncate text-xs text-muted",
					children: [r && s("By {name}", { name: e.author.name || e.package }), e.summary].filter(Boolean).join(" · ")
				})]
			}),
			/* @__PURE__ */ k("span", {
				className: "shrink-0 text-xs tabular-nums text-muted max-sm:hidden",
				children: e.latest
			}),
			/* @__PURE__ */ k("div", {
				className: "shrink-0",
				children: /* @__PURE__ */ k(N, {
					item: e,
					busy: i,
					locked: a,
					onInstall: c
				})
			})
		]
	});
}
export { B as Store };
