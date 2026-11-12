import { a as e, c as t, i as n, l as r, n as i, t as a, u as o } from "./storeItem-DrQbnzUD.js";
import { locale as s, navigate as c, t as l, useAbility as u, useLocation as d } from "@letterncms/sdk";
import { useState as f } from "react";
import { Badge as p, Button as m, Icon as h, IconButton as g, NotFoundState as _, Page as v, Pressable as y, Skeleton as b, Switch as x, Tabs as S, Tooltip as C, cn as w } from "@letterncms/ui";
import { Fragment as T, jsx as E, jsxs as D } from "react/jsx-runtime";
// admin/src/StoreDetail.tsx
var O = (e) => {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? e : t.toLocaleDateString(s(), {
		year: "numeric",
		month: "long",
		day: "numeric"
	});
}, k = (e) => {
	let t = /(?:>=|\^|~)\s*v?(\d+(?:\.\d+)?)/.exec(e);
	return t ? l("{version} or later", { version: t[1] }) : e;
}, A = "/plugins";
function j({ params: e }) {
	let { query: t } = d(), n = t.store || "default", r = `${e.vendor}/${e.name}`, i = u("packages/catalog", { store: n }), a = u("packages/list", { type: "all" }), o = i.data?.items.find((e) => e.package === r), s = [{
		label: l("Plugins"),
		to: A,
		icon: "plugin"
	}];
	return o ? /* @__PURE__ */ E(v, {
		width: "wide",
		crumbs: [...s, { label: o.title }],
		children: /* @__PURE__ */ E(M, {
			item: o,
			plugin: a.data?.items.find((e) => e.name === o.package),
			refetch: () => {
				i.refetch(), a.refetch();
			}
		}, o.package)
	}) : /* @__PURE__ */ E(v, {
		crumbs: [...s, { label: i.isLoading ? r : l("Not Found") }],
		children: i.isLoading ? /* @__PURE__ */ E(b, { className: "h-14 w-72" }) : /* @__PURE__ */ E(_, {
			icon: "plugin",
			action: /* @__PURE__ */ E(m, {
				onClick: () => c(A),
				children: l("Back to {label}", { label: l("Plugins") })
			})
		})
	});
}
function M({ item: s, plugin: d, refetch: g }) {
	let _ = d?.icon, v = u("packages/item", {
		store: s.store,
		package: s.package
	}), y = v.data, [w, A] = f("overview"), [j, M] = f(!1), [P, F] = f(null), I = async () => {
		M(!0), await e(s, F) && g(), M(!1);
	}, L = async () => {
		await n() && g();
	}, R = j, z = y?.releases ?? [], B = [
		[l("Version"), s.latest ?? "—"],
		...s.installed && s.installed !== s.latest ? [[l("Installed Here"), s.installed]] : [],
		...z[0]?.released_at ? [[l("Updated"), O(z[0].released_at)]] : [],
		[l("Price"), t(s)],
		...y?.requires.core ? [[l("Works With"), l("{brand} {version}", { version: k(y.requires.core) })]] : [],
		...y?.requires.php ? [["PHP", k(y.requires.php)]] : [],
		...s.categories.length ? [[l("Categories"), s.categories.join(", ")]] : [],
		[l("Made By"), s.author.url ? /* @__PURE__ */ E("a", {
			href: s.author.url,
			target: "_blank",
			rel: "noopener noreferrer",
			className: "text-ink underline underline-offset-2",
			children: s.author.name || s.package
		}) : s.author.name || s.package],
		...y?.operator && s.pricing !== "free" ? [[l("Sold By"), y.operator]] : [],
		[l("Package"), /* @__PURE__ */ E("code", {
			className: "text-xs",
			children: s.package
		}, "p")]
	], V = [
		y?.demo_url && {
			label: l("View the Demo"),
			href: y.demo_url,
			icon: "eye"
		},
		y?.docs_url && {
			label: l("Documentation"),
			href: y.docs_url,
			icon: "book-open"
		},
		y?.repository_url && {
			label: l("Source Code"),
			href: y.repository_url,
			icon: "code"
		},
		s.listing_url && {
			label: l("Store Page"),
			href: s.listing_url,
			icon: "arrow-square-out"
		}
	].filter(Boolean);
	return /* @__PURE__ */ D(T, { children: [
		/* @__PURE__ */ D("header", {
			className: "flex flex-wrap items-start gap-4",
			children: [
				/* @__PURE__ */ E(i, {
					item: s,
					icon: _,
					size: "lg"
				}),
				/* @__PURE__ */ D("div", {
					className: "min-w-0 flex-1 basis-56",
					children: [
						/* @__PURE__ */ E("h1", {
							className: "m-0 text-xl font-medium text-ink",
							children: s.title
						}),
						/* @__PURE__ */ E("p", {
							className: "m-0 mt-0.5 text-sm text-muted",
							children: l("By {name}", { name: s.author.name || s.package })
						}),
						/* @__PURE__ */ E("p", {
							className: "m-0 mt-2 max-w-2xl text-sm text-text",
							children: s.summary
						})
					]
				}),
				/* @__PURE__ */ D("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [s.action === "buy" && /* @__PURE__ */ E(m, {
						disabled: R,
						onClick: () => void L(),
						children: l("Add License Key")
					}), d ? /* @__PURE__ */ D(T, { children: [
						d.settingsTo && /* @__PURE__ */ E(m, {
							size: "md",
							icon: "settings",
							onClick: () => c(d.settingsTo),
							children: l("Settings")
						}),
						(() => {
							let e = /* @__PURE__ */ E("span", {
								className: "inline-flex",
								children: /* @__PURE__ */ E(x, {
									checked: d.enabled,
									disabled: R || d.locked,
									onChange: (e) => void r(d, e).then(g),
									label: l("On")
								})
							});
							return d.locked && d.keptOn ? /* @__PURE__ */ E(C, {
								content: d.keptOn,
								children: e
							}) : e;
						})(),
						s.action === "update" && /* @__PURE__ */ E(a, {
							item: s,
							busy: j,
							locked: R,
							onInstall: () => void I(),
							size: "md"
						}),
						/* @__PURE__ */ E(m, {
							size: "md",
							icon: "trash",
							variant: "ghost",
							disabled: R || d.dependents.length > 0,
							title: d.dependents.length ? d.keptOn ?? void 0 : void 0,
							onClick: () => void o(d).then((e) => e && g()),
							children: l("Uninstall")
						})
					] }) : /* @__PURE__ */ E(a, {
						item: s,
						busy: j,
						locked: R,
						onInstall: () => void I(),
						size: "md"
					})]
				})
			]
		}),
		s.access.message && /* @__PURE__ */ E("p", {
			className: "m-0 mt-3 text-xs text-muted",
			children: s.access.message
		}),
		P && /* @__PURE__ */ E("p", {
			role: "status",
			className: "m-0 mt-3 text-sm text-muted",
			children: P
		}),
		/* @__PURE__ */ D("div", {
			className: "mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]",
			children: [/* @__PURE__ */ D("div", {
				className: "min-w-0",
				children: [
					v.isLoading ? /* @__PURE__ */ E(b, { className: "aspect-[16/10] w-full" }) : /* @__PURE__ */ E(N, { shots: y?.gallery ?? [] }),
					/* @__PURE__ */ E(S, {
						className: "mt-6",
						value: w,
						onChange: A,
						tabs: [{
							value: "overview",
							label: l("Overview")
						}, {
							value: "changelog",
							label: l("Changelog"),
							count: z.length || void 0
						}]
					}),
					/* @__PURE__ */ E("div", {
						className: "pt-4 text-sm",
						children: w === "overview" ? /* @__PURE__ */ D("div", {
							className: "space-y-6",
							children: [
								v.isLoading ? /* @__PURE__ */ E(b, { className: "h-32" }) : y?.description_html ? /* @__PURE__ */ E("div", {
									className: "cms-store-description",
									dangerouslySetInnerHTML: { __html: y.description_html }
								}) : /* @__PURE__ */ E("p", {
									className: "m-0",
									children: s.summary
								}),
								(y?.requirements.length ?? 0) > 0 && /* @__PURE__ */ D("section", { children: [/* @__PURE__ */ E("h3", {
									className: "m-0 mb-2 text-sm font-medium text-ink",
									children: l("What It Needs")
								}), /* @__PURE__ */ E("ul", {
									className: "m-0 list-disc space-y-1 pl-5 text-text",
									children: y.requirements.map((e) => /* @__PURE__ */ E("li", { children: e }, e))
								})] }),
								y && y.capabilities.length > 0 && /* @__PURE__ */ D("section", { children: [/* @__PURE__ */ E("h3", {
									className: "m-0 mb-2 text-sm font-medium text-ink",
									children: l("It may use")
								}), /* @__PURE__ */ E("div", {
									className: "flex flex-wrap gap-1.5",
									children: y.capabilities.map((e) => /* @__PURE__ */ E(p, { children: e }, e))
								})] })
							]
						}) : z.length === 0 ? /* @__PURE__ */ E("p", {
							className: "m-0 text-muted",
							children: l("This store doesn’t say what changed.")
						}) : /* @__PURE__ */ E("ol", {
							className: "m-0 list-none space-y-5 p-0",
							children: z.map((e) => /* @__PURE__ */ D("li", { children: [/* @__PURE__ */ D("div", {
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
										children: l("Security Fix")
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
					children: B.map(([e, t]) => /* @__PURE__ */ D("div", {
						className: "contents",
						children: [/* @__PURE__ */ E("dt", {
							className: "text-muted",
							children: e
						}), /* @__PURE__ */ E("dd", {
							className: "m-0 truncate text-right text-ink",
							children: t
						})]
					}, e))
				}), V.length > 0 && /* @__PURE__ */ E("div", {
					className: "mt-5 grid gap-1 border-t border-border pt-4",
					children: V.map((e) => /* @__PURE__ */ D("a", {
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
						label: l("Previous Picture"),
						variant: "secondary",
						onClick: () => i(-1)
					}), /* @__PURE__ */ E(g, {
						icon: "arrow-right",
						label: l("Next Picture"),
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
					"aria-label": l("Show picture {n}", { n: r + 1 }),
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
