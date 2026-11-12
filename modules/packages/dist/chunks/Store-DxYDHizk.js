import { n as e, t } from "./installing-CCPtKzo4.js";
import { a as n, c as r, i, n as a, o, r as s, s as c, t as l } from "./storeItem-68HOWDmj.js";
import { Link as u, can as d, invalidate as f, locale as p, navigate as m, plural as h, run as g, setQuery as ee, t as _, useAbility as v, useLocation as te } from "@letterncms/sdk";
import { useEffect as ne, useMemo as y, useRef as re, useState as b } from "react";
import { Badge as x, Button as ie, EmptyState as ae, Icon as oe, IconButton as se, Input as ce, List as le, Menu as ue, NoMatches as de, Page as S, Segmented as fe, Select as C, Skeleton as w, cn as T, confirm as E, prompt as D, toast as O } from "@letterncms/ui";
import { Fragment as pe, jsx as k, jsxs as A } from "react/jsx-runtime";
// admin/src/Store.tsx
var j = 2097152, M = (e) => {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
};
async function N(e, t) {
	let n = crypto.randomUUID().replaceAll("-", "").slice(0, 24), r = new Uint8Array(await e.arrayBuffer()), i = null, a = Math.max(1, Math.ceil(r.length / j));
	for (let e = 0; e < a; e++) {
		let o = await g("packages/upload", {
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
	return /* @__PURE__ */ k(I, { kits: !1 });
}
function F() {
	return /* @__PURE__ */ k(S, {
		crumbs: [{
			label: _("Site Kits"),
			to: "/kits",
			icon: "box"
		}, { label: _("Browse Store") }],
		children: /* @__PURE__ */ k(I, { kits: !0 })
	});
}
function I({ kits: r }) {
	let [a, s] = b("default"), l = v("package-stores/list"), u = v("packages/catalog", { store: a }), [x, S] = b(""), [T, j] = b(""), [M, P] = b("all"), [F, I] = b("popular"), { query: z } = te(), B = z.show === "installed" ? "installed" : "all", he = (e) => ee({ show: e === "all" ? null : e });
	ne(() => {
		z.item && m(c({
			package: z.item,
			store: z.store ?? "default"
		}), { replace: !0 });
	}, [z.item, z.store]);
	let [V, H] = b(null), [ge, U] = b(null), [_e, ve] = b(o.turnOn), ye = (e) => ve((t) => o.turnOn = e(t)), W = re(null), G = u.data, K = v("packages/list", { type: "plugin" }, { enabled: !r }), q = r ? void 0 : K.data?.items, J = l.data?.items.find((e) => e.id === a), Y = y(() => (G?.items ?? []).filter((e) => e.type === "kit" === r), [G, r]), be = _(r ? "Site Kits" : "Plugins"), xe = y(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of Y) for (let n of t.categories) e.set(n, (e.get(n) ?? 0) + 1);
		return [...e].sort((e, t) => e[0].localeCompare(t[0], p()));
	}, [Y]), Se = Y.some((e) => e.pricing !== "free") && Y.some((e) => e.pricing === "free"), X = y(() => {
		let e = new Map((q ?? []).map((e) => [e.name, e])), t = new Set(Y.map((e) => e.package));
		return [...Y.map((t) => ({
			key: t.package,
			item: t,
			plugin: e.get(t.package)
		})), ...(q ?? []).filter((e) => !t.has(e.name)).map((e) => ({
			key: e.name,
			plugin: e
		}))];
	}, [Y, q]), Ce = X.filter(L).length, Z = y(() => {
		let e = x.trim().toLocaleLowerCase(p()).split(/\s+/).filter(Boolean), t = X.filter((t) => {
			if (B === "installed" && !L(t)) return !1;
			let { item: n, plugin: r } = t, i = (n ? `${n.title} ${n.summary} ${n.package} ${n.author.name} ${n.categories.join(" ")}` : `${r.label} ${r.note} ${r.name}`).toLocaleLowerCase(p());
			return (!T || !!n?.categories.includes(T)) && (M === "all" || !!n && M === "free" == (n.pricing === "free")) && e.every((e) => i.includes(e));
		});
		return F === "name" ? [...t].sort((e, t) => R(e).localeCompare(R(t), p())) : t;
	}, [
		X,
		B,
		x,
		T,
		M,
		F
	]), Q = x.trim() !== "" || T !== "" || M !== "all", we = !Q && F === "popular" ? [...Z.filter((e) => e.item?.featured), ...Z.filter((e) => !e.item?.featured)] : Z, Te = Y.some((e) => e.pricing !== "free"), Ee = new Set(Y.map((e) => e.author.name || e.package)).size > 1, De = () => {
		S(""), j(""), P("all");
	}, Oe = async (e) => {
		f("packages/"), await Promise.all([u.refetch(), K.refetch()]), O.success(e);
	}, ke = async (e) => {
		H(e.package), await n(e, U) && await Promise.all([u.refetch(), r ? void 0 : K.refetch()]), H(null);
	}, Ae = async (n) => {
		H("upload"), U(_("Uploading {name}…", { name: n.name }));
		try {
			let r = await N(n, !1);
			try {
				r = await e(r);
			} catch (i) {
				if (!(i instanceof t) || i.code !== "unsigned" || !d("packages.install_unsigned")) throw i;
				if (!await E({
					title: _("Install {name} unsigned?", { name: n.name }),
					description: _("No store vouches for this file. It runs with full access to your site, and it gets no update offers."),
					confirm: _("Install Unsigned"),
					danger: !0
				})) return;
				r = await e(await N(n, !0));
			}
			await Oe(_("{name} installed", { name: r.package ?? n.name }));
		} catch (e) {
			O.error(e);
		} finally {
			H(null), U(null), W.current && (W.current.value = "");
		}
	}, je = async () => {
		let e = (await D({
			title: _("Add Store"),
			description: _("Code from a store runs with full access to this site. Add it only if you trust who runs it."),
			fields: [{
				handle: "url",
				type: "text",
				label: _("Store Address"),
				required: !0,
				placeholder: "https://"
			}],
			confirm: _("Check Store")
		}))?.url;
		if (e) try {
			let t = await g("package-stores/create", { url: e }), n = (await D({
				title: _("Add {name}?", { name: t.name }),
				description: _("Compare this key fingerprint with the one in the store’s own documentation, then type it here: {fingerprint}", { fingerprint: t.fingerprint }),
				fields: [{
					handle: "fingerprint",
					type: "text",
					label: _("Key Fingerprint"),
					required: !0
				}],
				confirm: _("Add Store")
			}))?.fingerprint;
			if (!n) return;
			let r = await g("package-stores/create", {
				url: e,
				confirm: n
			});
			if (!r.added) {
				O.error(_("That fingerprint does not match. The store was not added."));
				return;
			}
			await l.refetch(), s(r.id);
		} catch (e) {
			O.error(e);
		}
	}, Me = async () => {
		J && await E({
			title: _("Remove {name}?", { name: J.name }),
			description: _("What it installed stays, without update offers."),
			confirm: _("Remove Store"),
			danger: !0
		}) && (await g("package-stores/delete", { id: a }), s("default"), await l.refetch());
	}, Ne = async () => {
		H("refresh");
		try {
			let e = await g("packages/catalog", {
				store: a,
				refresh: !0
			});
			e.error && O.error(e.error), f("packages/catalog"), await u.refetch();
		} catch (e) {
			O.error(e);
		} finally {
			H(null);
		}
	}, $ = G ? G.problem === "dev_trust" ? _("This build has development keys, so the store is closed.") : G.problem ? _("No valid signing keys, so the store is off. Upload packages instead.") : G.freshness === "clock" ? _("This server’s clock looks wrong, so installs are paused.") : G.freshness === "expired" ? _("This catalog is out of date, so installs are off until the store is checked again.") : G.freshness === "stale" ? _("This catalog is a few days old.") : G.error ? _("Can’t reach the store. {error}", { error: G.error }) : null : null, Pe = (e) => /* @__PURE__ */ k(me, {
		row: e,
		priced: Te,
		authored: Ee,
		busy: V === e.key,
		locked: V !== null,
		onInstall: () => e.item && void ke(e.item)
	}, e.key);
	return /* @__PURE__ */ A("div", { children: [
		!r && /* @__PURE__ */ k("input", {
			ref: W,
			type: "file",
			accept: ".zip,application/zip",
			className: "hidden",
			onChange: (e) => e.target.files?.[0] && void Ae(e.target.files[0])
		}),
		/* @__PURE__ */ A("div", {
			className: "mb-3 flex min-h-10 flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ k(fe, {
					size: "sm",
					value: B,
					onChange: he,
					"aria-label": _("Show"),
					options: [{
						value: "all",
						label: _("All")
					}, {
						value: "installed",
						label: _("Installed"),
						count: Ce || void 0
					}]
				}),
				/* @__PURE__ */ k(ce, {
					size: "sm",
					className: "w-full sm:w-auto sm:min-w-44 sm:flex-1",
					icon: "search",
					value: x,
					onChange: (e) => S(e.target.value),
					placeholder: _("Search {items}", { items: be }),
					"aria-label": _("Search")
				}),
				/* @__PURE__ */ k("div", {
					className: "w-36 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
					children: /* @__PURE__ */ k(C, {
						size: "sm",
						value: F,
						onChange: (e) => I(e ?? "popular"),
						"aria-label": _("Sort"),
						options: [{
							value: "popular",
							label: _("Most Popular")
						}, {
							value: "name",
							label: _("Name")
						}]
					})
				}),
				xe.some(([, e]) => e > 1) && /* @__PURE__ */ k("div", {
					className: "w-36 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
					children: /* @__PURE__ */ k(C, {
						size: "sm",
						value: T || "all",
						onChange: (e) => j(!e || e === "all" ? "" : e),
						"aria-label": _("Category"),
						options: [{
							value: "all",
							label: _("All Categories")
						}, ...xe.map(([e]) => ({
							value: e,
							label: e
						}))]
					})
				}),
				Se && /* @__PURE__ */ k("div", {
					className: "w-28 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
					children: /* @__PURE__ */ k(C, {
						size: "sm",
						value: M,
						onChange: (e) => P(e ?? "all"),
						"aria-label": _("Price"),
						options: [
							{
								value: "all",
								label: _("Any Price")
							},
							{
								value: "free",
								label: _("Free")
							},
							{
								value: "paid",
								label: _("Paid")
							}
						]
					})
				}),
				/* @__PURE__ */ A("div", {
					className: "flex items-center gap-1 max-sm:ml-auto",
					children: [(l.data?.items.length ?? 0) > 1 && /* @__PURE__ */ k("div", {
						className: "w-40 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
						children: /* @__PURE__ */ k(C, {
							size: "sm",
							value: a,
							onChange: (e) => s(e ?? "default"),
							options: l.data.items.map((e) => ({
								value: e.id,
								label: e.name
							})),
							"aria-label": _("Store")
						})
					}), /* @__PURE__ */ k(ue, {
						trigger: /* @__PURE__ */ k(se, {
							icon: "more",
							label: _("More")
						}),
						items: [
							!r && {
								label: _("Upload Zip"),
								icon: "upload",
								disabled: V !== null,
								onSelect: () => W.current?.click()
							},
							{
								label: _("Check Now"),
								icon: "refresh",
								disabled: V !== null,
								onSelect: () => void Ne()
							},
							Te && {
								label: _("Add License Key"),
								icon: "key",
								onSelect: () => void i()
							},
							!r && {
								label: _("Turn On After Install"),
								checked: _e,
								onSelect: () => ye((e) => !e)
							},
							{
								separator: !0,
								label: ""
							},
							{
								label: _("Add Store"),
								icon: "plus",
								onSelect: () => void je()
							},
							J && !J.default && {
								label: _("Remove {name}", { name: J.name }),
								icon: "trash",
								danger: !0,
								onSelect: () => void Me()
							}
						]
					})]
				})
			]
		}),
		ge && /* @__PURE__ */ k("p", {
			role: "status",
			className: "mb-4 text-sm text-muted",
			children: ge
		}),
		$ && /* @__PURE__ */ A("p", {
			className: "mb-4 flex items-center gap-2 border-y border-border py-3 text-sm text-text",
			children: [/* @__PURE__ */ k(oe, {
				name: "info",
				size: 16,
				className: "shrink-0 text-muted"
			}), $]
		}),
		u.isLoading ? /* @__PURE__ */ k(le, { children: [
			0,
			1,
			2,
			3
		].map((e) => /* @__PURE__ */ A("div", {
			role: "listitem",
			className: "flex min-h-16 items-center gap-3 px-3",
			children: [/* @__PURE__ */ k(w, { className: "size-10 rounded-lg" }), /* @__PURE__ */ A("div", {
				className: "flex-1 space-y-2",
				children: [/* @__PURE__ */ k(w, { className: "h-3 w-32" }), /* @__PURE__ */ k(w, { className: "h-3 w-64 max-w-full" })]
			})]
		}, e)) }) : Z.length === 0 ? Q ? /* @__PURE__ */ k(de, { onClear: De }) : B === "installed" ? /* @__PURE__ */ k(ae, {
			icon: r ? "box" : "plugin",
			title: _(r ? "No site kits" : "No plugins installed yet"),
			action: /* @__PURE__ */ k(ie, {
				onClick: () => he("all"),
				children: _(r ? "Browse Store" : "Browse Plugins")
			})
		}) : /* @__PURE__ */ k(ae, {
			icon: "download",
			title: _("Nothing in this store yet"),
			action: r ? void 0 : /* @__PURE__ */ k(ie, {
				onClick: () => W.current?.click(),
				children: _("Upload Zip")
			})
		}) : /* @__PURE__ */ A(pe, { children: [Q && /* @__PURE__ */ k("h2", {
			className: "m-0 mb-3 text-sm font-medium text-ink",
			children: h(Z.length, "{count} result", "{count} results")
		}), /* @__PURE__ */ k(le, { children: we.map(Pe) })] })
	] });
}
var L = ({ item: e, plugin: t }) => !!t || e?.type === "kit" && !!e.installed, R = (e) => e.item?.title ?? e.plugin.label;
function me({ row: e, priced: t, authored: n, busy: i, locked: o, onInstall: d }) {
	let { item: f, plugin: p } = e, m = f ? c(f) : p.to, h = f?.title ?? p.label, g = p?.problem ?? (f ? [n && _("By {name}", { name: f.author.name || f.package }), f.summary].filter(Boolean).join(" · ") : p.note);
	return /* @__PURE__ */ A("div", {
		role: "listitem",
		className: "flex min-h-16 items-center gap-3 px-3 py-2",
		children: [
			f ? /* @__PURE__ */ k(a, {
				item: f,
				icon: p?.icon
			}) : /* @__PURE__ */ k("span", {
				className: "grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-sunken text-ink",
				children: /* @__PURE__ */ k(oe, {
					name: p.icon || "plugin",
					size: 20
				})
			}),
			/* @__PURE__ */ A("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ A("div", {
					className: "flex min-w-0 items-center gap-2",
					children: [m ? /* @__PURE__ */ k(u, {
						to: m,
						className: "min-w-0 truncate rounded-xs text-sm font-medium text-ink no-underline hover:underline hover:underline-offset-2",
						children: h
					}) : /* @__PURE__ */ k("span", {
						className: "min-w-0 truncate text-sm font-medium text-ink",
						children: h
					}), t && f && !L(e) && /* @__PURE__ */ k(x, { children: r(f) })]
				}), /* @__PURE__ */ k("p", {
					className: T("m-0 truncate text-xs", p?.problem ? "text-warning" : "text-muted"),
					children: g
				})]
			}),
			/* @__PURE__ */ k("span", {
				className: "shrink-0 text-xs tabular-nums text-muted max-sm:hidden",
				children: p?.version ?? f?.installed ?? f?.latest
			}),
			/* @__PURE__ */ A("div", {
				className: "flex shrink-0 items-center gap-2",
				children: [f && (!p || f.action === "update") && /* @__PURE__ */ k(l, {
					item: f,
					busy: i,
					locked: o,
					onInstall: d
				}), p && /* @__PURE__ */ k(s, {
					plugin: p,
					disabled: o
				})]
			})
		]
	});
}
export { F as KitStore, P as Store };
