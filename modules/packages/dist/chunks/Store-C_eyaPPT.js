import { n as e, t } from "./installing-CCPtKzo4.js";
import { a as n, i as r, n as i, o as a, r as o, t as s } from "./storeItem-xeALMtdo.js";
import { Link as c, can as l, invalidate as u, locale as d, navigate as f, plural as p, run as m, setQuery as ee, t as h, useAbility as g, useLocation as te } from "@letterncms/sdk";
import { useEffect as ne, useMemo as _, useRef as re, useState as v } from "react";
import { Button as y, EmptyState as b, Icon as x, IconButton as ie, Input as ae, List as S, Menu as C, NoMatches as oe, Page as w, Segmented as se, Select as T, Skeleton as E, cn as D, confirm as ce, toast as O } from "@letterncms/ui";
import { Fragment as le, jsx as k, jsxs as A } from "react/jsx-runtime";
// admin/src/Store.tsx
var j = 2097152, M = (e) => {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
};
async function N(e, t) {
	let n = crypto.randomUUID().replaceAll("-", "").slice(0, 24), r = new Uint8Array(await e.arrayBuffer()), i = null, a = Math.max(1, Math.ceil(r.length / j));
	for (let e = 0; e < a; e++) {
		let o = await m("packages/upload", {
			id: n,
			index: e,
			last: e === a - 1,
			allowUnsigned: t,
			data: M(r.subarray(e * j, (e + 1) * j))
		});
		e === a - 1 && (i = o);
	}
	return i;
}
function P() {
	return /* @__PURE__ */ k(I, { sites: !1 });
}
function F() {
	return /* @__PURE__ */ k(w, {
		crumbs: [{
			label: h("Sites"),
			to: "/sites",
			icon: "box"
		}, { label: h("Browse Store") }],
		children: /* @__PURE__ */ k(I, { sites: !0 })
	});
}
function I({ sites: i }) {
	let o = g("packages/catalog"), [s, c] = v(""), [w, D] = v(""), [j, M] = v("popular"), { query: P } = te(), F = P.show === "installed" ? "installed" : "all", I = (e) => ee({ show: e === "all" ? null : e });
	ne(() => {
		P.item && f(a({ package: P.item }), { replace: !0 });
	}, [P.item]);
	let [z, B] = v(null), [V, H] = v(null), [de, U] = v(n.turnOn), fe = (e) => U((t) => n.turnOn = e(t)), W = re(null), G = o.data, K = g("packages/list", { type: "plugin" }, { enabled: !i }), q = i ? void 0 : K.data?.items, J = _(() => (G?.items ?? []).filter((e) => e.type === "site" === i), [G, i]), pe = h(i ? "Sites" : "Plugins"), Y = _(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of J) for (let n of t.categories) e.set(n, (e.get(n) ?? 0) + 1);
		return [...e].sort((e, t) => e[0].localeCompare(t[0], d()));
	}, [J]), X = _(() => {
		let e = new Map((q ?? []).map((e) => [e.name, e])), t = new Set(J.map((e) => e.package));
		return [...J.map((t) => ({
			key: t.package,
			item: t,
			plugin: e.get(t.package)
		})), ...(q ?? []).filter((e) => !t.has(e.name)).map((e) => ({
			key: e.name,
			plugin: e
		}))];
	}, [J, q]), me = X.filter(L).length, Z = _(() => {
		let e = s.trim().toLocaleLowerCase(d()).split(/\s+/).filter(Boolean), t = X.filter((t) => {
			if (F === "installed" && !L(t)) return !1;
			let { item: n, plugin: r } = t, i = (n ? `${n.title} ${n.summary} ${n.package} ${n.author.name} ${n.categories.join(" ")}` : `${r.label} ${r.note} ${r.name}`).toLocaleLowerCase(d());
			return (!w || !!n?.categories.includes(w)) && e.every((e) => i.includes(e));
		});
		return j === "name" ? [...t].sort((e, t) => R(e).localeCompare(R(t), d())) : t;
	}, [
		X,
		F,
		s,
		w,
		j
	]), Q = s.trim() !== "" || w !== "", he = !Q && j === "popular" ? [...Z.filter((e) => e.item?.featured), ...Z.filter((e) => !e.item?.featured)] : Z, ge = new Set(J.map((e) => e.author.name || e.package)).size > 1, _e = () => {
		c(""), D("");
	}, ve = async (e) => {
		u("packages/"), await Promise.all([o.refetch(), K.refetch()]), O.success(e);
	}, ye = async (e) => {
		B(e.package), await r(e, H) && await Promise.all([o.refetch(), i ? void 0 : K.refetch()]), B(null);
	}, be = async (n) => {
		B("upload"), H(h("Uploading {name}…", { name: n.name }));
		try {
			let r = await N(n, !1);
			try {
				r = await e(r);
			} catch (i) {
				if (!(i instanceof t) || i.code !== "unsigned" || !l("packages.install_unsigned")) throw i;
				if (!await ce({
					title: h("Install {name} unsigned?", { name: n.name }),
					description: h("No store vouches for this file. It runs with full access to your site, and it gets no update offers."),
					confirm: h("Install Unsigned"),
					danger: !0
				})) return;
				r = await e(await N(n, !0));
			}
			await ve(h("{name} installed", { name: r.package ?? n.name }));
		} catch (e) {
			O.error(e);
		} finally {
			B(null), H(null), W.current && (W.current.value = "");
		}
	}, xe = async () => {
		B("refresh");
		try {
			let e = await m("packages/catalog", { refresh: !0 });
			e.error && O.error(e.error), u("packages/catalog"), await o.refetch();
		} catch (e) {
			O.error(e);
		} finally {
			B(null);
		}
	}, $ = G ? G.problem === "dev_trust" ? h("This build has development keys, so the store is closed.") : G.problem ? h("No valid signing keys, so the store is off. Upload packages instead.") : G.freshness === "clock" ? h("This server’s clock looks wrong, so installs are paused.") : G.freshness === "expired" ? h("This catalog is out of date, so installs are off until the store is checked again.") : G.freshness === "stale" ? h("This catalog is a few days old.") : G.error ? h("Can’t reach the store. {error}", { error: G.error }) : null : null, Se = (e) => /* @__PURE__ */ k(ue, {
		row: e,
		authored: ge,
		busy: z === e.key,
		locked: z !== null,
		onInstall: () => e.item && void ye(e.item)
	}, e.key);
	return /* @__PURE__ */ A("div", { children: [
		!i && /* @__PURE__ */ k("input", {
			ref: W,
			type: "file",
			accept: ".zip,application/zip",
			className: "hidden",
			onChange: (e) => e.target.files?.[0] && void be(e.target.files[0])
		}),
		/* @__PURE__ */ A("div", {
			className: "mb-3 flex min-h-10 flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ k(se, {
					size: "sm",
					value: F,
					onChange: I,
					"aria-label": h("Show"),
					options: [{
						value: "all",
						label: h("All")
					}, {
						value: "installed",
						label: h("Installed"),
						count: me || void 0
					}]
				}),
				/* @__PURE__ */ k(ae, {
					size: "sm",
					className: "w-full sm:w-auto sm:min-w-44 sm:flex-1",
					icon: "search",
					value: s,
					onChange: (e) => c(e.target.value),
					placeholder: h("Search {items}", { items: pe }),
					"aria-label": h("Search")
				}),
				/* @__PURE__ */ k("div", {
					className: "w-36 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
					children: /* @__PURE__ */ k(T, {
						size: "sm",
						value: j,
						onChange: (e) => M(e ?? "popular"),
						"aria-label": h("Sort"),
						options: [{
							value: "popular",
							label: h("Most Popular")
						}, {
							value: "name",
							label: h("Name")
						}]
					})
				}),
				Y.some(([, e]) => e > 1) && /* @__PURE__ */ k("div", {
					className: "w-36 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
					children: /* @__PURE__ */ k(T, {
						size: "sm",
						value: w || "all",
						onChange: (e) => D(!e || e === "all" ? "" : e),
						"aria-label": h("Category"),
						options: [{
							value: "all",
							label: h("All Categories")
						}, ...Y.map(([e]) => ({
							value: e,
							label: e
						}))]
					})
				}),
				/* @__PURE__ */ k("div", {
					className: "flex items-center gap-1 max-sm:ml-auto",
					children: /* @__PURE__ */ k(C, {
						trigger: /* @__PURE__ */ k(ie, {
							icon: "more",
							label: h("More")
						}),
						items: [
							!i && {
								label: h("Upload Zip"),
								icon: "upload",
								disabled: z !== null,
								onSelect: () => W.current?.click()
							},
							{
								label: h("Check Now"),
								icon: "refresh",
								disabled: z !== null,
								onSelect: () => void xe()
							},
							!i && {
								label: h("Turn On After Install"),
								checked: de,
								onSelect: () => fe((e) => !e)
							}
						]
					})
				})
			]
		}),
		V && /* @__PURE__ */ k("p", {
			role: "status",
			className: "mb-4 text-sm text-muted",
			children: V
		}),
		$ && /* @__PURE__ */ A("p", {
			className: "mb-4 flex items-center gap-2 border-y border-border py-3 text-sm text-text",
			children: [/* @__PURE__ */ k(x, {
				name: "info",
				size: 16,
				className: "shrink-0 text-muted"
			}), $]
		}),
		o.isLoading ? /* @__PURE__ */ k(S, { children: [
			0,
			1,
			2,
			3
		].map((e) => /* @__PURE__ */ A("div", {
			role: "listitem",
			className: "flex min-h-16 items-center gap-3 px-3",
			children: [/* @__PURE__ */ k(E, { className: "size-10 rounded-lg" }), /* @__PURE__ */ A("div", {
				className: "flex-1 space-y-2",
				children: [/* @__PURE__ */ k(E, { className: "h-3 w-32" }), /* @__PURE__ */ k(E, { className: "h-3 w-64 max-w-full" })]
			})]
		}, e)) }) : Z.length === 0 ? Q ? /* @__PURE__ */ k(oe, { onClear: _e }) : F === "installed" ? /* @__PURE__ */ k(b, {
			icon: i ? "box" : "plugin",
			title: h(i ? "No sites" : "No plugins installed yet"),
			action: /* @__PURE__ */ k(y, {
				onClick: () => I("all"),
				children: h(i ? "Browse Store" : "Browse Plugins")
			})
		}) : /* @__PURE__ */ k(b, {
			icon: "download",
			title: h("Nothing in this store yet"),
			action: i ? void 0 : /* @__PURE__ */ k(y, {
				onClick: () => W.current?.click(),
				children: h("Upload Zip")
			})
		}) : /* @__PURE__ */ A(le, { children: [Q && /* @__PURE__ */ k("h2", {
			className: "m-0 mb-3 text-sm font-medium text-ink",
			children: p(Z.length, "{count} result", "{count} results")
		}), /* @__PURE__ */ k(S, { children: he.map(Se) })] })
	] });
}
var L = ({ item: e, plugin: t }) => !!t || e?.type === "site" && !!e.installed, R = (e) => e.item?.title ?? e.plugin.label;
function ue({ row: e, authored: t, busy: n, locked: r, onInstall: l }) {
	let { item: u, plugin: d } = e, f = u ? a(u) : d.to, p = u?.title ?? d.label, m = d?.problem ?? (u ? [t && h("By {name}", { name: u.author.name || u.package }), u.summary].filter(Boolean).join(" · ") : d.note);
	return /* @__PURE__ */ A("div", {
		role: "listitem",
		className: "flex min-h-16 items-center gap-3 px-3 py-2",
		children: [
			u ? /* @__PURE__ */ k(i, {
				item: u,
				icon: d?.icon
			}) : /* @__PURE__ */ k("span", {
				className: "grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-sunken text-ink",
				children: /* @__PURE__ */ k(x, {
					name: d.icon || "plugin",
					size: 20
				})
			}),
			/* @__PURE__ */ A("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ k("div", {
					className: "flex min-w-0 items-center gap-2",
					children: f ? /* @__PURE__ */ k(c, {
						to: f,
						className: "min-w-0 truncate rounded-xs text-sm font-medium text-ink no-underline hover:underline hover:underline-offset-2",
						children: p
					}) : /* @__PURE__ */ k("span", {
						className: "min-w-0 truncate text-sm font-medium text-ink",
						children: p
					})
				}), /* @__PURE__ */ k("p", {
					className: D("m-0 truncate text-xs", d?.problem ? "text-warning" : "text-muted"),
					children: m
				})]
			}),
			/* @__PURE__ */ k("span", {
				className: "shrink-0 text-xs tabular-nums text-muted max-sm:hidden",
				children: d?.version ?? u?.installed ?? u?.latest
			}),
			/* @__PURE__ */ A("div", {
				className: "flex shrink-0 items-center gap-2",
				children: [u && (!d || u.action === "update") && /* @__PURE__ */ k(s, {
					item: u,
					busy: n,
					locked: r,
					onInstall: l
				}), d && /* @__PURE__ */ k(o, {
					plugin: d,
					disabled: r
				})]
			})
		]
	});
}
export { F as SiteStore, P as Store };
