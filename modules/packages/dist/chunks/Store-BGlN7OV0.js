import { n as e, t } from "./installing-CCPtKzo4.js";
import { a as n, c as r, i, n as a, o, r as s, s as ee, t as c } from "./storeItem-DrQbnzUD.js";
import { Link as l, can as u, invalidate as d, locale as f, navigate as p, plural as m, run as h, setQuery as te, t as g, useAbility as _, useLocation as ne } from "@letterncms/sdk";
import { useEffect as re, useMemo as v, useRef as ie, useState as y } from "react";
import { Badge as b, Button as ae, EmptyState as oe, Icon as x, IconButton as se, Input as ce, List as S, Menu as le, NoMatches as ue, Segmented as de, Select as C, Skeleton as w, cn as T, confirm as E, prompt as D, toast as O } from "@letterncms/ui";
import { Fragment as fe, jsx as k, jsxs as A } from "react/jsx-runtime";
// admin/src/Store.tsx
var j = 2097152, M = (e) => {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
};
async function N(e, t) {
	let n = crypto.randomUUID().replaceAll("-", "").slice(0, 24), r = new Uint8Array(await e.arrayBuffer()), i = null, a = Math.max(1, Math.ceil(r.length / j));
	for (let e = 0; e < a; e++) {
		let o = await h("packages/upload", {
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
	let [r, a] = y("default"), s = _("package-stores/list"), c = _("packages/catalog", { store: r }), [l, b] = y(""), [T, j] = y(""), [M, P] = y("all"), [I, me] = y("popular"), { query: L } = ne(), R = L.show === "installed" ? "installed" : "all", z = (e) => te({ show: e === "all" ? null : e });
	re(() => {
		L.item && p(ee({
			package: L.item,
			store: L.store ?? "default"
		}), { replace: !0 });
	}, [L.item, L.store]);
	let [B, V] = y(null), [H, U] = y(null), [he, ge] = y(o.turnOn), _e = (e) => ge((t) => o.turnOn = e(t)), W = ie(null), G = c.data, K = _("packages/list", { type: "all" }), ve = Object.fromEntries((K.data?.items ?? []).map((e) => [e.name, e.icon])), q = v(() => (K.data?.items ?? []).filter((e) => !e.core), [K.data]), ye = new Map(q.map((e) => [e.name, e])), J = s.data?.items.find((e) => e.id === r), Y = G?.items ?? [], X = v(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of Y) for (let n of t.categories) e.set(n, (e.get(n) ?? 0) + 1);
		return [...e].sort((e, t) => e[0].localeCompare(t[0], f()));
	}, [Y]), be = Y.some((e) => e.pricing !== "free") && Y.some((e) => e.pricing === "free"), Z = v(() => {
		let e = new Set(Y.map((e) => e.package));
		return [...Y.map((e) => ({
			key: e.package,
			item: e,
			plugin: ye.get(e.package)
		})), ...q.filter((t) => !e.has(t.name)).map((e) => ({
			key: e.name,
			plugin: e
		}))];
	}, [Y, q]), xe = Z.filter((e) => e.plugin).length, Q = v(() => {
		let e = l.trim().toLocaleLowerCase(f()).split(/\s+/).filter(Boolean), t = Z.filter(({ item: t, plugin: n }) => {
			if (R === "installed" && !n) return !1;
			let r = (t ? `${t.title} ${t.summary} ${t.package} ${t.author.name} ${t.categories.join(" ")}` : `${n.label} ${n.note} ${n.name}`).toLocaleLowerCase(f());
			return (!T || !!t?.categories.includes(T)) && (M === "all" || !!t && M === "free" == (t.pricing === "free")) && e.every((e) => r.includes(e));
		});
		return I === "name" ? [...t].sort((e, t) => F(e).localeCompare(F(t), f())) : t;
	}, [
		Z,
		R,
		l,
		T,
		M,
		I
	]), $ = l.trim() !== "" || T !== "" || M !== "all", Se = !$ && I === "popular" ? [...Q.filter((e) => e.item?.featured), ...Q.filter((e) => !e.item?.featured)] : Q, Ce = Y.some((e) => e.pricing !== "free"), we = new Set(Y.map((e) => e.author.name || e.package)).size > 1, Te = () => {
		b(""), j(""), P("all");
	}, Ee = async (e) => {
		d("packages/"), await Promise.all([c.refetch(), K.refetch()]), O.success(e);
	}, De = async (e) => {
		V(e.package), await n(e, U) && await Promise.all([c.refetch(), K.refetch()]), V(null);
	}, Oe = async (n) => {
		V("upload"), U(g("Uploading {name}…", { name: n.name }));
		try {
			let r = await N(n, !1);
			try {
				r = await e(r);
			} catch (i) {
				if (!(i instanceof t) || i.code !== "unsigned" || !u("packages.install_unsigned")) throw i;
				if (!await E({
					title: g("Install {name} unsigned?", { name: n.name }),
					description: g("No store vouches for this file. It runs with full access to your site, and it gets no update offers."),
					confirm: g("Install Unsigned"),
					danger: !0
				})) return;
				r = await e(await N(n, !0));
			}
			await Ee(g("{name} installed", { name: r.package ?? n.name }));
		} catch (e) {
			O.error(e);
		} finally {
			V(null), U(null), W.current && (W.current.value = "");
		}
	}, ke = async () => {
		let e = (await D({
			title: g("Add Store"),
			description: g("Code from a store runs with full access to this site. Add it only if you trust who runs it."),
			fields: [{
				handle: "url",
				type: "text",
				label: g("Store Address"),
				required: !0,
				placeholder: "https://"
			}],
			confirm: g("Check Store")
		}))?.url;
		if (e) try {
			let t = await h("package-stores/create", { url: e }), n = (await D({
				title: g("Add {name}?", { name: t.name }),
				description: g("Compare this key fingerprint with the one in the store’s own documentation, then type it here: {fingerprint}", { fingerprint: t.fingerprint }),
				fields: [{
					handle: "fingerprint",
					type: "text",
					label: g("Key Fingerprint"),
					required: !0
				}],
				confirm: g("Add Store")
			}))?.fingerprint;
			if (!n) return;
			let r = await h("package-stores/create", {
				url: e,
				confirm: n
			});
			if (!r.added) {
				O.error(g("That fingerprint does not match. The store was not added."));
				return;
			}
			await s.refetch(), a(r.id);
		} catch (e) {
			O.error(e);
		}
	}, Ae = async () => {
		J && await E({
			title: g("Remove {name}?", { name: J.name }),
			description: g("What it installed stays, without update offers."),
			confirm: g("Remove Store"),
			danger: !0
		}) && (await h("package-stores/delete", { id: r }), a("default"), await s.refetch());
	}, je = async () => {
		V("refresh");
		try {
			let e = await h("packages/catalog", {
				store: r,
				refresh: !0
			});
			e.error && O.error(e.error), d("packages/catalog"), await c.refetch();
		} catch (e) {
			O.error(e);
		} finally {
			V(null);
		}
	}, Me = G ? G.problem === "dev_trust" ? g("This build has development keys, so the store is closed.") : G.problem ? g("No valid signing keys, so the store is off. Upload packages instead.") : G.freshness === "clock" ? g("This server’s clock looks wrong, so installs are paused.") : G.freshness === "expired" ? g("This catalog is out of date, so installs are off until the store is checked again.") : G.freshness === "stale" ? g("This catalog is a few days old.") : G.error ? g("Can’t reach the store. {error}", { error: G.error }) : null : null, Ne = (e) => /* @__PURE__ */ k(pe, {
		row: e,
		priced: Ce,
		authored: we,
		icon: ve[e.key],
		busy: B === e.key,
		locked: B !== null,
		onInstall: () => e.item && void De(e.item)
	}, e.key);
	return /* @__PURE__ */ A("div", { children: [
		/* @__PURE__ */ k("input", {
			ref: W,
			type: "file",
			accept: ".zip,application/zip",
			className: "hidden",
			onChange: (e) => e.target.files?.[0] && void Oe(e.target.files[0])
		}),
		/* @__PURE__ */ A("div", {
			className: "mb-3 flex min-h-10 flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ k(de, {
					size: "sm",
					value: R,
					onChange: z,
					"aria-label": g("Show"),
					options: [{
						value: "all",
						label: g("All")
					}, {
						value: "installed",
						label: g("Installed"),
						count: xe || void 0
					}]
				}),
				/* @__PURE__ */ k(ce, {
					size: "sm",
					className: "w-full sm:w-auto sm:min-w-44 sm:flex-1",
					icon: "search",
					value: l,
					onChange: (e) => b(e.target.value),
					placeholder: g("Search {items}", { items: g("Plugins") }),
					"aria-label": g("Search")
				}),
				/* @__PURE__ */ k("div", {
					className: "w-36 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
					children: /* @__PURE__ */ k(C, {
						size: "sm",
						value: I,
						onChange: (e) => me(e ?? "popular"),
						"aria-label": g("Sort"),
						options: [{
							value: "popular",
							label: g("Most Popular")
						}, {
							value: "name",
							label: g("Name")
						}]
					})
				}),
				X.some(([, e]) => e > 1) && /* @__PURE__ */ k("div", {
					className: "w-36 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
					children: /* @__PURE__ */ k(C, {
						size: "sm",
						value: T || "all",
						onChange: (e) => j(!e || e === "all" ? "" : e),
						"aria-label": g("Category"),
						options: [{
							value: "all",
							label: g("All Categories")
						}, ...X.map(([e]) => ({
							value: e,
							label: e
						}))]
					})
				}),
				be && /* @__PURE__ */ k("div", {
					className: "w-28 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
					children: /* @__PURE__ */ k(C, {
						size: "sm",
						value: M,
						onChange: (e) => P(e ?? "all"),
						"aria-label": g("Price"),
						options: [
							{
								value: "all",
								label: g("Any Price")
							},
							{
								value: "free",
								label: g("Free")
							},
							{
								value: "paid",
								label: g("Paid")
							}
						]
					})
				}),
				/* @__PURE__ */ A("div", {
					className: "flex items-center gap-1 max-sm:ml-auto",
					children: [(s.data?.items.length ?? 0) > 1 && /* @__PURE__ */ k("div", {
						className: "w-40 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]",
						children: /* @__PURE__ */ k(C, {
							size: "sm",
							value: r,
							onChange: (e) => a(e ?? "default"),
							options: s.data.items.map((e) => ({
								value: e.id,
								label: e.name
							})),
							"aria-label": g("Store")
						})
					}), /* @__PURE__ */ k(le, {
						trigger: /* @__PURE__ */ k(se, {
							icon: "more",
							label: g("More")
						}),
						items: [
							{
								label: g("Upload Zip"),
								icon: "upload",
								disabled: B !== null,
								onSelect: () => W.current?.click()
							},
							{
								label: g("Check Now"),
								icon: "refresh",
								disabled: B !== null,
								onSelect: () => void je()
							},
							Ce && {
								label: g("Add License Key"),
								icon: "key",
								onSelect: () => void i()
							},
							{
								label: g("Turn On After Install"),
								checked: he,
								onSelect: () => _e((e) => !e)
							},
							{
								separator: !0,
								label: ""
							},
							{
								label: g("Add Store"),
								icon: "plus",
								onSelect: () => void ke()
							},
							J && !J.default && {
								label: g("Remove {name}", { name: J.name }),
								icon: "trash",
								danger: !0,
								onSelect: () => void Ae()
							}
						]
					})]
				})
			]
		}),
		H && /* @__PURE__ */ k("p", {
			role: "status",
			className: "mb-4 text-sm text-muted",
			children: H
		}),
		Me && /* @__PURE__ */ A("p", {
			className: "mb-4 flex items-center gap-2 border-y border-border py-3 text-sm text-text",
			children: [/* @__PURE__ */ k(x, {
				name: "info",
				size: 16,
				className: "shrink-0 text-muted"
			}), Me]
		}),
		c.isLoading ? /* @__PURE__ */ k(S, { children: [
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
		}, e)) }) : Q.length === 0 ? $ ? /* @__PURE__ */ k(ue, { onClear: Te }) : R === "installed" ? /* @__PURE__ */ k(oe, {
			icon: "plugin",
			title: g("No plugins installed yet"),
			action: /* @__PURE__ */ k(ae, {
				onClick: () => z("all"),
				children: g("Browse Plugins")
			})
		}) : /* @__PURE__ */ k(oe, {
			icon: "download",
			title: g("Nothing in this store yet"),
			action: /* @__PURE__ */ k(ae, {
				onClick: () => W.current?.click(),
				children: g("Upload Zip")
			})
		}) : /* @__PURE__ */ A(fe, { children: [$ && /* @__PURE__ */ k("h2", {
			className: "m-0 mb-3 text-sm font-medium text-ink",
			children: m(Q.length, "{count} result", "{count} results")
		}), /* @__PURE__ */ k(S, { children: Se.map(Ne) })] })
	] });
}
var F = (e) => e.item?.title ?? e.plugin.label;
function pe({ row: { item: e, plugin: t }, icon: n, priced: i, authored: o, busy: u, locked: d, onInstall: f }) {
	let p = e ? ee(e) : t.to, m = e?.title ?? t.label, h = t?.problem ?? (e ? [o && g("By {name}", { name: e.author.name || e.package }), e.summary].filter(Boolean).join(" · ") : t.note);
	return /* @__PURE__ */ A("div", {
		role: "listitem",
		className: "flex min-h-16 items-center gap-3 px-3 py-2",
		children: [
			e ? /* @__PURE__ */ k(a, {
				item: e,
				icon: n
			}) : /* @__PURE__ */ k("span", {
				className: "grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-sunken text-ink",
				children: /* @__PURE__ */ k(x, {
					name: t.icon || "plugin",
					size: 20
				})
			}),
			/* @__PURE__ */ A("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ A("div", {
					className: "flex min-w-0 items-center gap-2",
					children: [p ? /* @__PURE__ */ k(l, {
						to: p,
						className: "min-w-0 truncate rounded-xs text-sm font-medium text-ink no-underline hover:underline hover:underline-offset-2",
						children: m
					}) : /* @__PURE__ */ k("span", {
						className: "min-w-0 truncate text-sm font-medium text-ink",
						children: m
					}), i && e && !t && /* @__PURE__ */ k(b, { children: r(e) })]
				}), /* @__PURE__ */ k("p", {
					className: T("m-0 truncate text-xs", t?.problem ? "text-warning" : "text-muted"),
					children: h
				})]
			}),
			/* @__PURE__ */ k("span", {
				className: "shrink-0 text-xs tabular-nums text-muted max-sm:hidden",
				children: t?.version ?? e?.latest
			}),
			/* @__PURE__ */ A("div", {
				className: "flex shrink-0 items-center gap-2",
				children: [e && (!t || e.action === "update") && /* @__PURE__ */ k(c, {
					item: e,
					busy: u,
					locked: d,
					onInstall: f
				}), t && /* @__PURE__ */ k(s, {
					plugin: t,
					disabled: d
				})]
			})
		]
	});
}
export { P as Store };
