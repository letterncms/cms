import { c as e, i as t, n, o as r, s as i, t as a } from "./storeItem-CSCMg4fc.js";
import { locale as o, navigate as s, t as c, useAbility as l, useLocation as u } from "@letterncms/sdk";
import { useEffect as d, useState as f } from "react";
import { Badge as p, Button as m, Icon as h, IconButton as g, NotFoundState as _, Page as v, Pressable as y, Skeleton as b, Switch as x, Tabs as S, Tooltip as C, cn as w } from "@letterncms/ui";
import { Fragment as T, jsx as E, jsxs as D } from "react/jsx-runtime";
// admin/src/StoreDetail.tsx
var O = (e) => {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? e : t.toLocaleDateString(o(), {
		year: "numeric",
		month: "long",
		day: "numeric"
	});
}, k = (e) => {
	let t = /(?:>=|\^|~)\s*v?(\d+(?:\.\d+)?)/.exec(e);
	return t ? c("{version} or later", { version: t[1] }) : e;
}, A = "/plugins";
function j({ params: e }) {
	let { path: t } = u(), n = t.startsWith("/kits/"), i = `${e.vendor}/${e.name}`, a = l("packages/catalog"), o = l("packages/list", { type: "plugin" }, { enabled: !n }), f = a.data?.items.find((e) => e.package === i), p = f && f.type === "kit" !== n ? r(f) : null;
	d(() => {
		p && s(p, { replace: !0 });
	}, [p]);
	let h = n ? [{
		label: c("Site Kits"),
		to: "/kits",
		icon: "box"
	}, {
		label: c("Browse Store"),
		to: "/kits/store"
	}] : [{
		label: c("Plugins"),
		to: A,
		icon: "plugin"
	}];
	return p ? null : f ? /* @__PURE__ */ E(v, {
		width: "wide",
		crumbs: [...h, { label: f.title }],
		children: /* @__PURE__ */ E(M, {
			item: f,
			plugin: o.data?.items.find((e) => e.name === f.package),
			refetch: () => {
				a.refetch(), n || o.refetch();
			}
		}, f.package)
	}) : /* @__PURE__ */ E(v, {
		crumbs: [...h, { label: a.isLoading ? i : c("Not Found") }],
		children: a.isLoading ? /* @__PURE__ */ E(b, { className: "h-14 w-72" }) : /* @__PURE__ */ E(_, {
			icon: n ? "box" : "plugin",
			action: /* @__PURE__ */ E(m, {
				onClick: () => s(n ? "/kits/store" : A),
				children: c("Back to {label}", { label: c(n ? "Browse Store" : "Plugins") })
			})
		})
	});
}
function M({ item: r, plugin: o, refetch: u }) {
	let d = o?.icon, g = l("packages/item", { package: r.package }), _ = g.data, [v, y] = f("overview"), [w, A] = f(!1), [j, M] = f(null), P = async () => {
		A(!0), await t(r, M) && u(), A(!1);
	}, F = w, I = _?.releases ?? [], L = [
		[c("Version"), r.latest ?? "—"],
		...r.installed && r.installed !== r.latest ? [[c("Installed Here"), r.installed]] : [],
		...I[0]?.released_at ? [[c("Updated"), O(I[0].released_at)]] : [],
		..._?.requires.core ? [[c("Works With"), c("{brand} {version}", { version: k(_.requires.core) })]] : [],
		..._?.requires.php ? [["PHP", k(_.requires.php)]] : [],
		...r.categories.length ? [[c("Categories"), r.categories.join(", ")]] : [],
		[c("Made By"), r.author.url ? /* @__PURE__ */ E("a", {
			href: r.author.url,
			target: "_blank",
			rel: "noopener noreferrer",
			className: "text-ink underline underline-offset-2",
			children: r.author.name || r.package
		}) : r.author.name || r.package],
		[c("Package"), /* @__PURE__ */ E("code", {
			className: "text-xs",
			children: r.package
		}, "p")]
	], R = [
		_?.demo_url && {
			label: c("View the Demo"),
			href: _.demo_url,
			icon: "eye"
		},
		_?.docs_url && {
			label: c("Documentation"),
			href: _.docs_url,
			icon: "book-open"
		},
		_?.repository_url && {
			label: c("Source Code"),
			href: _.repository_url,
			icon: "code"
		},
		r.listing_url && {
			label: c("Store Page"),
			href: r.listing_url,
			icon: "arrow-square-out"
		}
	].filter(Boolean);
	return /* @__PURE__ */ D(T, { children: [
		/* @__PURE__ */ D("header", {
			className: "flex flex-wrap items-start gap-4",
			children: [
				/* @__PURE__ */ E(n, {
					item: r,
					icon: d,
					size: "lg"
				}),
				/* @__PURE__ */ D("div", {
					className: "min-w-0 flex-1 basis-56",
					children: [
						/* @__PURE__ */ E("h1", {
							className: "m-0 text-xl font-medium text-ink",
							children: r.title
						}),
						/* @__PURE__ */ E("p", {
							className: "m-0 mt-0.5 text-sm text-muted",
							children: c("By {name}", { name: r.author.name || r.package })
						}),
						/* @__PURE__ */ E("p", {
							className: "m-0 mt-2 max-w-2xl text-sm text-text",
							children: r.summary
						})
					]
				}),
				/* @__PURE__ */ E("div", {
					className: "flex flex-wrap items-center gap-2",
					children: o ? /* @__PURE__ */ D(T, { children: [
						o.settingsTo && /* @__PURE__ */ E(m, {
							size: "md",
							icon: "settings",
							onClick: () => s(o.settingsTo),
							children: c("Settings")
						}),
						(() => {
							let e = /* @__PURE__ */ E("span", {
								className: "inline-flex",
								children: /* @__PURE__ */ E(x, {
									checked: o.enabled,
									disabled: F || o.locked,
									onChange: (e) => void i(o, e).then(u),
									label: c("On")
								})
							});
							return o.locked && o.keptOn ? /* @__PURE__ */ E(C, {
								content: o.keptOn,
								children: e
							}) : e;
						})(),
						r.action === "update" && /* @__PURE__ */ E(a, {
							item: r,
							busy: w,
							locked: F,
							onInstall: () => void P(),
							size: "md"
						}),
						/* @__PURE__ */ E(m, {
							size: "md",
							icon: "trash",
							variant: "ghost",
							disabled: F || o.dependents.length > 0,
							title: o.dependents.length ? o.keptOn ?? void 0 : void 0,
							onClick: () => void e(o).then((e) => e && u()),
							children: c("Uninstall")
						})
					] }) : /* @__PURE__ */ E(a, {
						item: r,
						busy: w,
						locked: F,
						onInstall: () => void P(),
						size: "md"
					})
				})
			]
		}),
		j && /* @__PURE__ */ E("p", {
			role: "status",
			className: "m-0 mt-3 text-sm text-muted",
			children: j
		}),
		/* @__PURE__ */ D("div", {
			className: "mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]",
			children: [/* @__PURE__ */ D("div", {
				className: "min-w-0",
				children: [
					g.isLoading ? /* @__PURE__ */ E(b, { className: "aspect-[16/10] w-full" }) : /* @__PURE__ */ E(N, { shots: _?.gallery ?? [] }),
					/* @__PURE__ */ E(S, {
						className: "mt-6",
						value: v,
						onChange: y,
						tabs: [{
							value: "overview",
							label: c("Overview")
						}, {
							value: "changelog",
							label: c("Changelog"),
							count: I.length || void 0
						}]
					}),
					/* @__PURE__ */ E("div", {
						className: "pt-4 text-sm",
						children: v === "overview" ? /* @__PURE__ */ D("div", {
							className: "space-y-6",
							children: [
								g.isLoading ? /* @__PURE__ */ E(b, { className: "h-32" }) : _?.description_html ? /* @__PURE__ */ E("div", {
									className: "cms-store-description",
									dangerouslySetInnerHTML: { __html: _.description_html }
								}) : /* @__PURE__ */ E("p", {
									className: "m-0",
									children: r.summary
								}),
								(_?.requirements.length ?? 0) > 0 && /* @__PURE__ */ D("section", { children: [/* @__PURE__ */ E("h3", {
									className: "m-0 mb-2 text-sm font-medium text-ink",
									children: c("What It Needs")
								}), /* @__PURE__ */ E("ul", {
									className: "m-0 list-disc space-y-1 pl-5 text-text",
									children: _.requirements.map((e) => /* @__PURE__ */ E("li", { children: e }, e))
								})] }),
								_ && _.capabilities.length > 0 && /* @__PURE__ */ D("section", { children: [/* @__PURE__ */ E("h3", {
									className: "m-0 mb-2 text-sm font-medium text-ink",
									children: c("It may use")
								}), /* @__PURE__ */ E("div", {
									className: "flex flex-wrap gap-1.5",
									children: _.capabilities.map((e) => /* @__PURE__ */ E(p, { children: e }, e))
								})] })
							]
						}) : I.length === 0 ? /* @__PURE__ */ E("p", {
							className: "m-0 text-muted",
							children: c("This store doesn’t say what changed.")
						}) : /* @__PURE__ */ E("ol", {
							className: "m-0 list-none space-y-5 p-0",
							children: I.map((e) => /* @__PURE__ */ D("li", { children: [/* @__PURE__ */ D("div", {
								className: "flex flex-wrap items-baseline gap-2",
								children: [
									/* @__PURE__ */ E("span", {
										className: "font-medium text-ink",
										children: e.version
									}),
									/* @__PURE__ */ E("span", {
										className: "text-xs text-muted",
										children: O(e.released_at)
									}),
									e.security && /* @__PURE__ */ E(p, {
										tone: "warning",
										children: c("Security Fix")
									})
								]
							}), e.notes && /* @__PURE__ */ E("p", {
								className: "m-0 mt-1 whitespace-pre-line text-text",
								children: e.notes
							})] }, e.version))
						})
					})
				]
			}), /* @__PURE__ */ D("aside", {
				className: "min-w-0 lg:border-l lg:border-border lg:pl-6",
				children: [/* @__PURE__ */ E("dl", {
					className: "m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm",
					children: L.map(([e, t]) => /* @__PURE__ */ D("div", {
						className: "contents",
						children: [/* @__PURE__ */ E("dt", {
							className: "text-muted",
							children: e
						}), /* @__PURE__ */ E("dd", {
							className: "m-0 truncate text-right text-ink",
							children: t
						})]
					}, e))
				}), R.length > 0 && /* @__PURE__ */ E("div", {
					className: "mt-5 grid gap-1 border-t border-border pt-4",
					children: R.map((e) => /* @__PURE__ */ D("a", {
						href: e.href,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink no-underline hover:bg-hover",
						children: [/* @__PURE__ */ E(h, {
							name: e.icon,
							size: 16,
							className: "text-muted"
						}), e.label]
					}, e.href))
				})]
			})]
		})
	] });
}
function N({ shots: e }) {
	let [t, n] = f(0);
	if (e.length === 0) return null;
	let r = e[Math.min(t, e.length - 1)], i = (t) => n((n) => (n + t + e.length) % e.length);
	return /* @__PURE__ */ D("figure", {
		className: "m-0",
		children: [
			/* @__PURE__ */ D("div", {
				className: "relative overflow-hidden rounded-lg border border-border bg-sunken",
				children: [/* @__PURE__ */ E("img", {
					src: r.url,
					alt: r.alt,
					className: "block aspect-[16/10] w-full object-cover object-top"
				}), e.length > 1 && /* @__PURE__ */ D("div", {
					className: "absolute right-2 bottom-2 flex gap-1",
					children: [/* @__PURE__ */ E(g, {
						icon: "arrow-left",
						label: c("Previous Picture"),
						variant: "secondary",
						onClick: () => i(-1)
					}), /* @__PURE__ */ E(g, {
						icon: "arrow-right",
						label: c("Next Picture"),
						variant: "secondary",
						onClick: () => i(1)
					})]
				})]
			}),
			r.alt && /* @__PURE__ */ E("figcaption", {
				className: "mt-2 text-xs text-muted",
				children: r.alt
			}),
			e.length > 1 && /* @__PURE__ */ E("div", {
				className: "mt-2 flex gap-2 overflow-x-auto pb-1",
				children: e.map((e, r) => /* @__PURE__ */ E(y, {
					onClick: () => n(r),
					"aria-label": c("Show picture {n}", { n: r + 1 }),
					"aria-current": r === t || void 0,
					className: w("w-24 shrink-0 overflow-hidden rounded-md border transition-opacity duration-base", r === t ? "border-ink opacity-100" : "border-border opacity-60 hover:opacity-100"),
					children: /* @__PURE__ */ E("img", {
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
export { j as default };
