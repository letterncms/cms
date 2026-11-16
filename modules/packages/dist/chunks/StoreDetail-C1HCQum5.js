import { c as e, i as t, n, s as r, t as i } from "./storeItem-xeALMtdo.js";
import { locale as a, navigate as o, t as s, useAbility as c, useLocation as l } from "@letterncms/sdk";
import { useState as u } from "react";
import { Badge as d, Button as f, Icon as p, IconButton as m, NotFoundState as h, Page as g, Pressable as _, Skeleton as v, Switch as y, Tabs as b, Tooltip as x, cn as S } from "@letterncms/ui";
import { Fragment as C, jsx as w, jsxs as T } from "react/jsx-runtime";
// admin/src/StoreDetail.tsx
var E = (e) => {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? e : t.toLocaleDateString(a(), {
		year: "numeric",
		month: "long",
		day: "numeric"
	});
}, D = (e) => {
	let t = /(?:>=|\^|~)\s*v?(\d+(?:\.\d+)?)/.exec(e);
	return t ? s("{version} or later", { version: t[1] }) : e;
}, O = "/plugins";
function k({ params: e }) {
	let { path: t } = l(), n = t.startsWith("/sites/"), r = `${e.vendor}/${e.name}`, i = c("packages/catalog"), a = c("packages/list", { type: "plugin" }, { enabled: !n }), u = i.data?.items.find((e) => e.package === r && e.type === "site" === n), d = n ? [{
		label: s("Sites"),
		to: "/sites",
		icon: "box"
	}, {
		label: s("Browse Store"),
		to: "/sites/store"
	}] : [{
		label: s("Plugins"),
		to: O,
		icon: "plugin"
	}];
	return u ? /* @__PURE__ */ w(g, {
		width: "wide",
		crumbs: [...d, { label: u.title }],
		children: /* @__PURE__ */ w(A, {
			item: u,
			plugin: a.data?.items.find((e) => e.name === u.package),
			refetch: () => {
				i.refetch(), n || a.refetch();
			}
		}, u.package)
	}) : /* @__PURE__ */ w(g, {
		crumbs: [...d, { label: i.isLoading ? r : s("Not Found") }],
		children: i.isLoading ? /* @__PURE__ */ w(v, { className: "h-14 w-72" }) : /* @__PURE__ */ w(h, {
			icon: n ? "box" : "plugin",
			action: /* @__PURE__ */ w(f, {
				onClick: () => o(n ? "/sites/store" : O),
				children: s("Back to {label}", { label: s(n ? "Browse Store" : "Plugins") })
			})
		})
	});
}
function A({ item: a, plugin: l, refetch: m }) {
	let h = l?.icon, g = c("packages/item", { package: a.package }), _ = g.data, [S, O] = u("overview"), [k, A] = u(!1), [M, N] = u(null), P = async () => {
		A(!0), await t(a, N) && m(), A(!1);
	}, F = k, I = _?.releases ?? [], L = [
		[s("Version"), a.latest ?? "—"],
		...a.installed && a.installed !== a.latest ? [[s("Installed Here"), a.installed]] : [],
		...I[0]?.released_at ? [[s("Updated"), E(I[0].released_at)]] : [],
		..._?.requires.core ? [[s("Works With"), s("{brand} {version}", { version: D(_.requires.core) })]] : [],
		..._?.requires.php ? [["PHP", D(_.requires.php)]] : [],
		...a.categories.length ? [[s("Categories"), a.categories.join(", ")]] : [],
		[s("Made By"), a.author.url ? /* @__PURE__ */ w("a", {
			href: a.author.url,
			target: "_blank",
			rel: "noopener noreferrer",
			className: "text-ink underline underline-offset-2",
			children: a.author.name || a.package
		}) : a.author.name || a.package],
		[s("Package"), /* @__PURE__ */ w("code", {
			className: "text-xs",
			children: a.package
		}, "p")]
	], R = [
		_?.demo_url && {
			label: s("View the Demo"),
			href: _.demo_url,
			icon: "eye"
		},
		_?.docs_url && {
			label: s("Documentation"),
			href: _.docs_url,
			icon: "book-open"
		},
		_?.repository_url && {
			label: s("Source Code"),
			href: _.repository_url,
			icon: "code"
		},
		a.listing_url && {
			label: s("Store Page"),
			href: a.listing_url,
			icon: "arrow-square-out"
		}
	].filter(Boolean);
	return /* @__PURE__ */ T(C, { children: [
		/* @__PURE__ */ T("header", {
			className: "flex flex-wrap items-start gap-4",
			children: [
				/* @__PURE__ */ w(n, {
					item: a,
					icon: h,
					size: "lg"
				}),
				/* @__PURE__ */ T("div", {
					className: "min-w-0 flex-1 basis-56",
					children: [
						/* @__PURE__ */ w("h1", {
							className: "m-0 text-xl font-medium text-ink",
							children: a.title
						}),
						/* @__PURE__ */ w("p", {
							className: "m-0 mt-0.5 text-sm text-muted",
							children: s("By {name}", { name: a.author.name || a.package })
						}),
						/* @__PURE__ */ w("p", {
							className: "m-0 mt-2 max-w-2xl text-sm text-text",
							children: a.summary
						})
					]
				}),
				/* @__PURE__ */ w("div", {
					className: "flex flex-wrap items-center gap-2",
					children: l ? /* @__PURE__ */ T(C, { children: [
						l.settingsTo && /* @__PURE__ */ w(f, {
							size: "md",
							icon: "settings",
							onClick: () => o(l.settingsTo),
							children: s("Settings")
						}),
						(() => {
							let e = /* @__PURE__ */ w("span", {
								className: "inline-flex",
								children: /* @__PURE__ */ w(y, {
									checked: l.enabled,
									disabled: F || l.locked,
									onChange: (e) => void r(l, e).then(m),
									label: s("On")
								})
							});
							return l.locked && l.keptOn ? /* @__PURE__ */ w(x, {
								content: l.keptOn,
								children: e
							}) : e;
						})(),
						a.action === "update" && /* @__PURE__ */ w(i, {
							item: a,
							busy: k,
							locked: F,
							onInstall: () => void P(),
							size: "md"
						}),
						/* @__PURE__ */ w(f, {
							size: "md",
							icon: "trash",
							variant: "ghost",
							disabled: F || l.dependents.length > 0,
							title: l.dependents.length ? l.keptOn ?? void 0 : void 0,
							onClick: () => void e(l).then((e) => e && m()),
							children: s("Uninstall")
						})
					] }) : /* @__PURE__ */ w(i, {
						item: a,
						busy: k,
						locked: F,
						onInstall: () => void P(),
						size: "md"
					})
				})
			]
		}),
		M && /* @__PURE__ */ w("p", {
			role: "status",
			className: "m-0 mt-3 text-sm text-muted",
			children: M
		}),
		/* @__PURE__ */ T("div", {
			className: "mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]",
			children: [/* @__PURE__ */ T("div", {
				className: "min-w-0",
				children: [
					g.isLoading ? /* @__PURE__ */ w(v, { className: "aspect-[16/10] w-full" }) : /* @__PURE__ */ w(j, { shots: _?.gallery ?? [] }),
					/* @__PURE__ */ w(b, {
						className: "mt-6",
						value: S,
						onChange: O,
						tabs: [{
							value: "overview",
							label: s("Overview")
						}, {
							value: "changelog",
							label: s("Changelog"),
							count: I.length || void 0
						}]
					}),
					/* @__PURE__ */ w("div", {
						className: "pt-4 text-sm",
						children: S === "overview" ? /* @__PURE__ */ T("div", {
							className: "space-y-6",
							children: [
								g.isLoading ? /* @__PURE__ */ w(v, { className: "h-32" }) : _?.description_html ? /* @__PURE__ */ w("div", {
									className: "cms-store-description",
									dangerouslySetInnerHTML: { __html: _.description_html }
								}) : /* @__PURE__ */ w("p", {
									className: "m-0",
									children: a.summary
								}),
								(_?.requirements.length ?? 0) > 0 && /* @__PURE__ */ T("section", { children: [/* @__PURE__ */ w("h3", {
									className: "m-0 mb-2 text-sm font-medium text-ink",
									children: s("What It Needs")
								}), /* @__PURE__ */ w("ul", {
									className: "m-0 list-disc space-y-1 pl-5 text-text",
									children: _.requirements.map((e) => /* @__PURE__ */ w("li", { children: e }, e))
								})] }),
								_ && _.capabilities.length > 0 && /* @__PURE__ */ T("section", { children: [/* @__PURE__ */ w("h3", {
									className: "m-0 mb-2 text-sm font-medium text-ink",
									children: s("It may use")
								}), /* @__PURE__ */ w("div", {
									className: "flex flex-wrap gap-1.5",
									children: _.capabilities.map((e) => /* @__PURE__ */ w(d, { children: e }, e))
								})] })
							]
						}) : I.length === 0 ? /* @__PURE__ */ w("p", {
							className: "m-0 text-muted",
							children: s("This store doesn’t say what changed.")
						}) : /* @__PURE__ */ w("ol", {
							className: "m-0 list-none space-y-5 p-0",
							children: I.map((e) => /* @__PURE__ */ T("li", { children: [/* @__PURE__ */ T("div", {
								className: "flex flex-wrap items-baseline gap-2",
								children: [
									/* @__PURE__ */ w("span", {
										className: "font-medium text-ink",
										children: e.version
									}),
									/* @__PURE__ */ w("span", {
										className: "text-xs text-muted",
										children: E(e.released_at)
									}),
									e.security && /* @__PURE__ */ w(d, {
										tone: "warning",
										children: s("Security Fix")
									})
								]
							}), e.notes && /* @__PURE__ */ w("p", {
								className: "m-0 mt-1 whitespace-pre-line text-text",
								children: e.notes
							})] }, e.version))
						})
					})
				]
			}), /* @__PURE__ */ T("aside", {
				className: "min-w-0 lg:border-l lg:border-border lg:pl-6",
				children: [/* @__PURE__ */ w("dl", {
					className: "m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm",
					children: L.map(([e, t]) => /* @__PURE__ */ T("div", {
						className: "contents",
						children: [/* @__PURE__ */ w("dt", {
							className: "text-muted",
							children: e
						}), /* @__PURE__ */ w("dd", {
							className: "m-0 truncate text-right text-ink",
							children: t
						})]
					}, e))
				}), R.length > 0 && /* @__PURE__ */ w("div", {
					className: "mt-5 grid gap-1 border-t border-border pt-4",
					children: R.map((e) => /* @__PURE__ */ T("a", {
						href: e.href,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink no-underline hover:bg-hover",
						children: [/* @__PURE__ */ w(p, {
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
function j({ shots: e }) {
	let [t, n] = u(0);
	if (e.length === 0) return null;
	let r = e[Math.min(t, e.length - 1)], i = (t) => n((n) => (n + t + e.length) % e.length);
	return /* @__PURE__ */ T("figure", {
		className: "m-0",
		children: [
			/* @__PURE__ */ T("div", {
				className: "relative overflow-hidden rounded-lg border border-border bg-sunken",
				children: [/* @__PURE__ */ w("img", {
					src: r.url,
					alt: r.alt,
					className: "block aspect-[16/10] w-full object-cover object-top"
				}), e.length > 1 && /* @__PURE__ */ T("div", {
					className: "absolute right-2 bottom-2 flex gap-1",
					children: [/* @__PURE__ */ w(m, {
						icon: "arrow-left",
						label: s("Previous Picture"),
						variant: "secondary",
						onClick: () => i(-1)
					}), /* @__PURE__ */ w(m, {
						icon: "arrow-right",
						label: s("Next Picture"),
						variant: "secondary",
						onClick: () => i(1)
					})]
				})]
			}),
			r.alt && /* @__PURE__ */ w("figcaption", {
				className: "mt-2 text-xs text-muted",
				children: r.alt
			}),
			e.length > 1 && /* @__PURE__ */ w("div", {
				className: "mt-2 flex gap-2 overflow-x-auto pb-1",
				children: e.map((e, r) => /* @__PURE__ */ w(_, {
					onClick: () => n(r),
					"aria-label": s("Show picture {n}", { n: r + 1 }),
					"aria-current": r === t || void 0,
					className: S("w-24 shrink-0 overflow-hidden rounded-md border transition-opacity duration-base", r === t ? "border-ink opacity-100" : "border-border opacity-60 hover:opacity-100"),
					children: /* @__PURE__ */ w("img", {
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
export { k as default };
