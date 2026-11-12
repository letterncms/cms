import { a as e, c as t, i as n, l as r, n as i, s as a, t as o, u as s } from "./storeItem-68HOWDmj.js";
import { locale as c, navigate as l, t as u, useAbility as d, useLocation as f } from "@letterncms/sdk";
import { useEffect as p, useState as m } from "react";
import { Badge as h, Button as g, Icon as _, IconButton as v, NotFoundState as y, Page as b, Pressable as x, Skeleton as S, Switch as C, Tabs as w, Tooltip as T, cn as E } from "@letterncms/ui";
import { Fragment as D, jsx as O, jsxs as k } from "react/jsx-runtime";
// admin/src/StoreDetail.tsx
var A = (e) => {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? e : t.toLocaleDateString(c(), {
		year: "numeric",
		month: "long",
		day: "numeric"
	});
}, j = (e) => {
	let t = /(?:>=|\^|~)\s*v?(\d+(?:\.\d+)?)/.exec(e);
	return t ? u("{version} or later", { version: t[1] }) : e;
}, M = "/plugins";
function N({ params: e }) {
	let { path: t, query: n } = f(), r = t.startsWith("/kits/"), i = n.store || "default", o = `${e.vendor}/${e.name}`, s = d("packages/catalog", { store: i }), c = d("packages/list", { type: "plugin" }, { enabled: !r }), m = s.data?.items.find((e) => e.package === o), h = m && m.type === "kit" !== r ? a(m) : null;
	p(() => {
		h && l(h, { replace: !0 });
	}, [h]);
	let _ = r ? [{
		label: u("Site Kits"),
		to: "/kits",
		icon: "box"
	}, {
		label: u("Browse Store"),
		to: "/kits/store"
	}] : [{
		label: u("Plugins"),
		to: M,
		icon: "plugin"
	}];
	return h ? null : m ? /* @__PURE__ */ O(b, {
		width: "wide",
		crumbs: [..._, { label: m.title }],
		children: /* @__PURE__ */ O(P, {
			item: m,
			plugin: c.data?.items.find((e) => e.name === m.package),
			refetch: () => {
				s.refetch(), r || c.refetch();
			}
		}, m.package)
	}) : /* @__PURE__ */ O(b, {
		crumbs: [..._, { label: s.isLoading ? o : u("Not Found") }],
		children: s.isLoading ? /* @__PURE__ */ O(S, { className: "h-14 w-72" }) : /* @__PURE__ */ O(y, {
			icon: r ? "box" : "plugin",
			action: /* @__PURE__ */ O(g, {
				onClick: () => l(r ? "/kits/store" : M),
				children: u("Back to {label}", { label: u(r ? "Browse Store" : "Plugins") })
			})
		})
	});
}
function P({ item: a, plugin: c, refetch: f }) {
	let p = c?.icon, v = d("packages/item", {
		store: a.store,
		package: a.package
	}), y = v.data, [b, x] = m("overview"), [E, M] = m(!1), [N, P] = m(null), I = async () => {
		M(!0), await e(a, P) && f(), M(!1);
	}, L = async () => {
		await n() && f();
	}, R = E, z = y?.releases ?? [], B = [
		[u("Version"), a.latest ?? "—"],
		...a.installed && a.installed !== a.latest ? [[u("Installed Here"), a.installed]] : [],
		...z[0]?.released_at ? [[u("Updated"), A(z[0].released_at)]] : [],
		[u("Price"), t(a)],
		...y?.requires.core ? [[u("Works With"), u("{brand} {version}", { version: j(y.requires.core) })]] : [],
		...y?.requires.php ? [["PHP", j(y.requires.php)]] : [],
		...a.categories.length ? [[u("Categories"), a.categories.join(", ")]] : [],
		[u("Made By"), a.author.url ? /* @__PURE__ */ O("a", {
			href: a.author.url,
			target: "_blank",
			rel: "noopener noreferrer",
			className: "text-ink underline underline-offset-2",
			children: a.author.name || a.package
		}) : a.author.name || a.package],
		...y?.operator && a.pricing !== "free" ? [[u("Sold By"), y.operator]] : [],
		[u("Package"), /* @__PURE__ */ O("code", {
			className: "text-xs",
			children: a.package
		}, "p")]
	], V = [
		y?.demo_url && {
			label: u("View the Demo"),
			href: y.demo_url,
			icon: "eye"
		},
		y?.docs_url && {
			label: u("Documentation"),
			href: y.docs_url,
			icon: "book-open"
		},
		y?.repository_url && {
			label: u("Source Code"),
			href: y.repository_url,
			icon: "code"
		},
		a.listing_url && {
			label: u("Store Page"),
			href: a.listing_url,
			icon: "arrow-square-out"
		}
	].filter(Boolean);
	return /* @__PURE__ */ k(D, { children: [
		/* @__PURE__ */ k("header", {
			className: "flex flex-wrap items-start gap-4",
			children: [
				/* @__PURE__ */ O(i, {
					item: a,
					icon: p,
					size: "lg"
				}),
				/* @__PURE__ */ k("div", {
					className: "min-w-0 flex-1 basis-56",
					children: [
						/* @__PURE__ */ O("h1", {
							className: "m-0 text-xl font-medium text-ink",
							children: a.title
						}),
						/* @__PURE__ */ O("p", {
							className: "m-0 mt-0.5 text-sm text-muted",
							children: u("By {name}", { name: a.author.name || a.package })
						}),
						/* @__PURE__ */ O("p", {
							className: "m-0 mt-2 max-w-2xl text-sm text-text",
							children: a.summary
						})
					]
				}),
				/* @__PURE__ */ k("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [a.action === "buy" && /* @__PURE__ */ O(g, {
						disabled: R,
						onClick: () => void L(),
						children: u("Add License Key")
					}), c ? /* @__PURE__ */ k(D, { children: [
						c.settingsTo && /* @__PURE__ */ O(g, {
							size: "md",
							icon: "settings",
							onClick: () => l(c.settingsTo),
							children: u("Settings")
						}),
						(() => {
							let e = /* @__PURE__ */ O("span", {
								className: "inline-flex",
								children: /* @__PURE__ */ O(C, {
									checked: c.enabled,
									disabled: R || c.locked,
									onChange: (e) => void r(c, e).then(f),
									label: u("On")
								})
							});
							return c.locked && c.keptOn ? /* @__PURE__ */ O(T, {
								content: c.keptOn,
								children: e
							}) : e;
						})(),
						a.action === "update" && /* @__PURE__ */ O(o, {
							item: a,
							busy: E,
							locked: R,
							onInstall: () => void I(),
							size: "md"
						}),
						/* @__PURE__ */ O(g, {
							size: "md",
							icon: "trash",
							variant: "ghost",
							disabled: R || c.dependents.length > 0,
							title: c.dependents.length ? c.keptOn ?? void 0 : void 0,
							onClick: () => void s(c).then((e) => e && f()),
							children: u("Uninstall")
						})
					] }) : /* @__PURE__ */ O(o, {
						item: a,
						busy: E,
						locked: R,
						onInstall: () => void I(),
						size: "md"
					})]
				})
			]
		}),
		a.access.message && /* @__PURE__ */ O("p", {
			className: "m-0 mt-3 text-xs text-muted",
			children: a.access.message
		}),
		N && /* @__PURE__ */ O("p", {
			role: "status",
			className: "m-0 mt-3 text-sm text-muted",
			children: N
		}),
		/* @__PURE__ */ k("div", {
			className: "mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]",
			children: [/* @__PURE__ */ k("div", {
				className: "min-w-0",
				children: [
					v.isLoading ? /* @__PURE__ */ O(S, { className: "aspect-[16/10] w-full" }) : /* @__PURE__ */ O(F, { shots: y?.gallery ?? [] }),
					/* @__PURE__ */ O(w, {
						className: "mt-6",
						value: b,
						onChange: x,
						tabs: [{
							value: "overview",
							label: u("Overview")
						}, {
							value: "changelog",
							label: u("Changelog"),
							count: z.length || void 0
						}]
					}),
					/* @__PURE__ */ O("div", {
						className: "pt-4 text-sm",
						children: b === "overview" ? /* @__PURE__ */ k("div", {
							className: "space-y-6",
							children: [
								v.isLoading ? /* @__PURE__ */ O(S, { className: "h-32" }) : y?.description_html ? /* @__PURE__ */ O("div", {
									className: "cms-store-description",
									dangerouslySetInnerHTML: { __html: y.description_html }
								}) : /* @__PURE__ */ O("p", {
									className: "m-0",
									children: a.summary
								}),
								(y?.requirements.length ?? 0) > 0 && /* @__PURE__ */ k("section", { children: [/* @__PURE__ */ O("h3", {
									className: "m-0 mb-2 text-sm font-medium text-ink",
									children: u("What It Needs")
								}), /* @__PURE__ */ O("ul", {
									className: "m-0 list-disc space-y-1 pl-5 text-text",
									children: y.requirements.map((e) => /* @__PURE__ */ O("li", { children: e }, e))
								})] }),
								y && y.capabilities.length > 0 && /* @__PURE__ */ k("section", { children: [/* @__PURE__ */ O("h3", {
									className: "m-0 mb-2 text-sm font-medium text-ink",
									children: u("It may use")
								}), /* @__PURE__ */ O("div", {
									className: "flex flex-wrap gap-1.5",
									children: y.capabilities.map((e) => /* @__PURE__ */ O(h, { children: e }, e))
								})] })
							]
						}) : z.length === 0 ? /* @__PURE__ */ O("p", {
							className: "m-0 text-muted",
							children: u("This store doesn’t say what changed.")
						}) : /* @__PURE__ */ O("ol", {
							className: "m-0 list-none space-y-5 p-0",
							children: z.map((e) => /* @__PURE__ */ k("li", { children: [/* @__PURE__ */ k("div", {
								className: "flex flex-wrap items-baseline gap-2",
								children: [
									/* @__PURE__ */ O("span", {
										className: "font-medium text-ink",
										children: e.version
									}),
									/* @__PURE__ */ O("span", {
										className: "text-xs text-muted",
										children: A(e.released_at)
									}),
									e.security && /* @__PURE__ */ O(h, {
										tone: "warning",
										children: u("Security Fix")
									})
								]
							}), e.notes && /* @__PURE__ */ O("p", {
								className: "m-0 mt-1 whitespace-pre-line text-text",
								children: e.notes
							})] }, e.version))
						})
					})
				]
			}), /* @__PURE__ */ k("aside", {
				className: "min-w-0 lg:border-l lg:border-border lg:pl-6",
				children: [/* @__PURE__ */ O("dl", {
					className: "m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm",
					children: B.map(([e, t]) => /* @__PURE__ */ k("div", {
						className: "contents",
						children: [/* @__PURE__ */ O("dt", {
							className: "text-muted",
							children: e
						}), /* @__PURE__ */ O("dd", {
							className: "m-0 truncate text-right text-ink",
							children: t
						})]
					}, e))
				}), V.length > 0 && /* @__PURE__ */ O("div", {
					className: "mt-5 grid gap-1 border-t border-border pt-4",
					children: V.map((e) => /* @__PURE__ */ k("a", {
						href: e.href,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink no-underline hover:bg-hover",
						children: [/* @__PURE__ */ O(_, {
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
function F({ shots: e }) {
	let [t, n] = m(0);
	if (e.length === 0) return null;
	let r = e[Math.min(t, e.length - 1)], i = (t) => n((n) => (n + t + e.length) % e.length);
	return /* @__PURE__ */ k("figure", {
		className: "m-0",
		children: [
			/* @__PURE__ */ k("div", {
				className: "relative overflow-hidden rounded-lg border border-border bg-sunken",
				children: [/* @__PURE__ */ O("img", {
					src: r.url,
					alt: r.alt,
					className: "block aspect-[16/10] w-full object-cover object-top"
				}), e.length > 1 && /* @__PURE__ */ k("div", {
					className: "absolute right-2 bottom-2 flex gap-1",
					children: [/* @__PURE__ */ O(v, {
						icon: "arrow-left",
						label: u("Previous Picture"),
						variant: "secondary",
						onClick: () => i(-1)
					}), /* @__PURE__ */ O(v, {
						icon: "arrow-right",
						label: u("Next Picture"),
						variant: "secondary",
						onClick: () => i(1)
					})]
				})]
			}),
			r.alt && /* @__PURE__ */ O("figcaption", {
				className: "mt-2 text-xs text-muted",
				children: r.alt
			}),
			e.length > 1 && /* @__PURE__ */ O("div", {
				className: "mt-2 flex gap-2 overflow-x-auto pb-1",
				children: e.map((e, r) => /* @__PURE__ */ O(x, {
					onClick: () => n(r),
					"aria-label": u("Show picture {n}", { n: r + 1 }),
					"aria-current": r === t || void 0,
					className: E("w-24 shrink-0 overflow-hidden rounded-md border transition-opacity duration-base", r === t ? "border-ink opacity-100" : "border-border opacity-60 hover:opacity-100"),
					children: /* @__PURE__ */ O("img", {
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
export { N as default };
