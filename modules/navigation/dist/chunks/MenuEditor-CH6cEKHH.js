import { can as e, invalidate as t, navigate as n, run as r, t as i, useAbility as a, useManifest as o } from "@letterncms/sdk";
import { useEffect as s, useMemo as c, useRef as l, useState as u } from "react";
import { Badge as d, Button as f, EmptyState as p, Fields as m, Icon as h, IconButton as g, List as _, Menu as v, NoMatches as y, NotFoundState as b, Popover as x, QueryError as S, Row as C, SaveBar as w, Skeleton as T, SortableTree as E, Spinner as D, cn as O, confirm as k, nativeName as A, toast as j } from "@letterncms/ui";
import { Fragment as M, jsx as N, jsxs as P } from "react/jsx-runtime";
// admin/src/MenuEditor.tsx
var F = () => ({
	handle: "query",
	type: "text",
	label: i("Search Content"),
	autofocus: !0,
	placeholder: i("Search Pages and Posts")
}), I = (e) => e.map(({ target: e, ...t }) => ({
	...t,
	label: t.label?.trim() || void 0,
	url: t.url?.trim() || void 0,
	newTab: t.newTab || void 0,
	locales: L(t.locales),
	children: I(t.children)
})), L = (e) => {
	let t = Object.entries(e ?? {}).flatMap(([e, t]) => {
		let n = Object.fromEntries(Object.entries(t ?? {}).filter(([, e]) => typeof e == "string" && e.trim() !== ""));
		return Object.keys(n).length ? [[e, n]] : [];
	});
	return t.length ? Object.fromEntries(t) : void 0;
}, R = (e) => JSON.stringify(I(e)), z = () => Array.from(crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(8)), (e) => "abcdefghijklmnopqrstuvwxyz0123456789"[e % 36]).join("");
function B({ props: e }) {
	let t = a("navigation/get", { handle: e.handle }, { refetchOnWindowFocus: !1 });
	return t.isLoading ? /* @__PURE__ */ N("div", {
		className: "space-y-1.5",
		"aria-hidden": !0,
		children: [
			0,
			1,
			2
		].map((e) => /* @__PURE__ */ N(T, { className: "h-11 rounded-lg" }, e))
	}) : t.isError && !t.data ? /* @__PURE__ */ N(S, {
		message: i("Couldn’t load this menu."),
		onRetry: () => void t.refetch(),
		retrying: t.isFetching
	}) : t.data ? /* @__PURE__ */ N(V, { menu: t.data }, t.data.handle) : /* @__PURE__ */ N(b, {
		icon: "list-tree",
		action: /* @__PURE__ */ N(f, {
			onClick: () => n("/navigation"),
			children: i("Back to Navigation")
		})
	});
}
function V({ menu: a }) {
	let [o, s] = u(a.items), l = a.maxDepth, [d, m] = u(null), [h, g] = u(!1), [_, v] = u(/* @__PURE__ */ new Set()), [y, b] = u(() => R(a.items)), [x, S] = u(a.items), [C, T] = u(!1), [D, A] = u(null), F = e("navigation.manage"), L = c(() => R(o) !== y, [o, y]), B = (e) => s(e), V = (e, t) => {
		let n = (r) => r.map((r) => r.id === e ? {
			...r,
			...t
		} : {
			...r,
			children: n(r.children)
		});
		B(n(o));
	}, W = (e, t) => {
		let n = null, r = (t, i) => t.flatMap((t, a) => t.id === e ? (n = {
			item: t,
			parent: i,
			index: a
		}, []) : [{
			...t,
			children: r(t.children, t.id)
		}]);
		B(r(o, null));
		let a = n;
		if (!a) return;
		let c = (e, t) => {
			if (t === a.parent) return {
				list: [
					...e.slice(0, a.index),
					a.item,
					...e.slice(a.index)
				],
				done: !0
			};
			let n = !1;
			return {
				list: e.map((e) => {
					if (n) return e;
					let t = c(e.children, e.id);
					return n = t.done, t.done ? {
						...e,
						children: t.list
					} : e;
				}),
				done: n
			};
		};
		j(i("Removed “{name}”", { name: t }), { action: {
			label: i("Undo"),
			onClick: () => s((e) => {
				let t = c(e, null);
				return t.done ? t.list : [...e, a.item];
			})
		} });
	}, G = (e) => v((t) => {
		let n = new Set(t);
		return n.has(e) ? n.delete(e) : n.add(e), n;
	}), K = (e) => B([...o, {
		id: z(),
		entry: e.id,
		target: {
			title: e.title,
			uri: e.uri,
			status: e.displayStatus,
			collection: e.collection
		},
		children: []
	}]), q = () => {
		let e = z();
		B([...o, {
			id: e,
			url: "",
			label: "",
			children: []
		}]), v((t) => new Set(t).add(e)), m(e);
	}, J = () => {
		s(x), A(null);
	}, Y = async () => {
		T(!0), A(null);
		try {
			let e = await r("navigation/update", {
				handle: a.handle,
				items: I(o)
			});
			s(e.items), b(R(e.items)), S(e.items), t("navigation/");
		} catch (e) {
			A(e instanceof Error ? e.message : String(e));
		} finally {
			T(!1);
		}
	}, X = async () => {
		if (await k({
			title: i("Delete “{title}”?", { title: a.title }),
			description: i("Repeat blocks that list this menu will show nothing."),
			confirm: i("Delete"),
			danger: !0
		})) {
			g(!0);
			try {
				await r("navigation/delete", { handle: a.handle }), t("navigation/", "views/"), n("/navigation");
			} catch (e) {
				j.error(e), g(!1);
			}
		}
	};
	return /* @__PURE__ */ P(M, { children: [
		o.length === 0 ? /* @__PURE__ */ N(p, {
			compact: !0,
			icon: "list-tree",
			title: i("No links yet")
		}) : /* @__PURE__ */ N(E, {
			indent: 32,
			className: "space-y-1.5!",
			items: o,
			maxDepth: l - 1,
			onChange: B,
			renderItem: (e, t) => /* @__PURE__ */ N(H, {
				item: e,
				ctx: t,
				expanded: _.has(e.id),
				disabled: !F,
				onToggle: () => G(e.id),
				onPatch: (t) => V(e.id, t),
				onRemove: () => W(e.id, e.label?.trim() || e.target?.title || e.url || i("Link")),
				autoFocus: d === e.id
			})
		}),
		F && /* @__PURE__ */ P("div", {
			className: O("flex flex-wrap items-center gap-2", o.length === 0 ? "justify-center" : "mt-3"),
			children: [/* @__PURE__ */ N(U, { onPick: K }), /* @__PURE__ */ N(f, {
				icon: "link",
				onClick: q,
				children: i("Add Link")
			})]
		}),
		F && /* @__PURE__ */ N("div", {
			className: "mt-10 border-t border-border pt-6",
			children: /* @__PURE__ */ N(f, {
				variant: "destructive",
				icon: "trash",
				className: "-ml-2",
				disabled: C,
				loading: h,
				onClick: () => void X(),
				children: i("Delete Menu")
			})
		}),
		F && /* @__PURE__ */ N(w, {
			dirty: L,
			saving: C,
			error: D,
			onSave: () => void Y(),
			onDiscard: J
		})
	] });
}
function H({ item: e, ctx: t, expanded: r, disabled: a, onToggle: s, onPatch: c, onRemove: l, autoFocus: u }) {
	let f = !e.entry, p = e.target?.status, _ = !!p && p !== "published" && p !== "changed", y = f ? e.url || i("No URL yet") : e.target?.uri ?? i("No URL"), b = o().site, x = b.locales.filter((e) => e !== b.defaultLocale), S = f || x.length > 0;
	return /* @__PURE__ */ P("div", {
		className: O("rounded-lg border bg-bg transition-shadow", r ? "border-border-strong shadow-pop" : "border-border"),
		children: [/* @__PURE__ */ P("div", {
			className: "flex h-11 items-center gap-2 px-2",
			children: [
				!a && t.handle,
				/* @__PURE__ */ N(h, {
					name: f ? "link" : "page",
					size: 14,
					className: "shrink-0 text-muted"
				}),
				/* @__PURE__ */ N(m, {
					bare: !0,
					className: "min-w-[60%] flex-1 max-sm:min-w-0",
					disabled: a,
					fields: [{
						handle: "label",
						type: "text",
						component: "navigation-label",
						label: i("Label"),
						autofocus: u,
						placeholder: f ? i("Label") : e.target?.title ?? i("Missing entry"),
						display: f ? void 0 : "fallback"
					}],
					values: { label: e.label ?? "" },
					onChange: (e, t) => c({ label: t })
				}),
				/* @__PURE__ */ N("span", {
					className: O("min-w-0 shrink truncate text-xs", (_ || !f || e.url) && "max-sm:hidden", f && !e.url ? "text-warning" : "text-faint"),
					children: y
				}),
				_ && /* @__PURE__ */ N(d, {
					tone: p === "missing" ? "danger" : "neutral",
					children: i(p === "missing" ? "Missing" : "Hidden until live")
				}),
				!a && /* @__PURE__ */ P(M, { children: [/* @__PURE__ */ N(v, {
					trigger: /* @__PURE__ */ N(g, {
						icon: "more",
						label: i("Actions for {name}", { name: e.label?.trim() || e.target?.title || i("Link") }),
						size: "xs"
					}),
					items: [
						{
							label: i("Move Out a Level"),
							icon: "arrow-left",
							disabled: !t.canOutdent,
							onSelect: t.outdent
						},
						{
							label: i("Nest Under the Item Above"),
							icon: "arrow-right",
							disabled: !t.canIndent,
							onSelect: t.indent
						},
						...!f && e.target?.collection ? [{
							label: i("Edit Page"),
							icon: "edit",
							onSelect: () => n(`/content/${e.target.collection}/${e.entry}`)
						}] : [],
						...S ? [] : [{
							label: i("Open in a New Tab"),
							icon: "external",
							checked: !!e.newTab,
							onSelect: () => c({ newTab: !e.newTab || void 0 })
						}],
						{
							separator: !0,
							label: ""
						},
						{
							label: i("Remove"),
							icon: "trash",
							danger: !0,
							onSelect: l
						}
					]
				}), S && /* @__PURE__ */ N(g, {
					icon: r ? "chevron-up" : "chevron-down",
					label: i(r ? "Collapse" : "Link Options"),
					size: "xs",
					className: "max-sm:ml-3",
					onClick: s
				})] })
			]
		}), r && S && /* @__PURE__ */ N(m, {
			className: "gap-y-2.5! border-t border-border p-4",
			disabled: a,
			fields: [...x.length === 0 ? f ? [{
				handle: "url",
				type: "url",
				component: "link",
				label: i("Link"),
				placeholder: i("Choose a page or paste a link")
			}] : [] : [{
				handle: "labels",
				type: "group",
				label: i("Label"),
				fields: x.map((t) => ({
					handle: t,
					type: "text",
					label: A(t),
					placeholder: e.label || e.target?.title || void 0
				}))
			}, ...f ? [{
				handle: "urls",
				type: "group",
				label: i("Link"),
				fields: b.locales.map((t) => ({
					handle: t,
					type: "url",
					component: "link",
					label: A(t),
					placeholder: t === b.defaultLocale ? i("Choose a page or paste a link") : e.url || void 0
				}))
			}] : []], {
				handle: "newTab",
				type: "toggle",
				label: i("Open in a New Tab"),
				display: "checkbox"
			}],
			values: {
				url: e.url ?? "",
				newTab: !!e.newTab,
				labels: Object.fromEntries(x.map((t) => [t, e.locales?.[t]?.label ?? ""])),
				urls: Object.fromEntries(b.locales.map((t) => [t, t === b.defaultLocale ? e.url ?? "" : e.locales?.[t]?.url ?? ""]))
			},
			onChange: (t, n) => {
				if (t === "newTab") return c({ newTab: n || void 0 });
				if (t === "url") return c({ url: n });
				let r = t === "labels" ? "label" : "url", i = n ?? {}, a = { ...e.locales };
				for (let e of x) a[e] = {
					...a[e],
					[r]: i[e] ?? ""
				};
				c(r === "url" ? {
					url: i[b.defaultLocale] ?? "",
					locales: a
				} : { locales: a });
			}
		})]
	});
}
function U({ onPick: e }) {
	let [t, n] = u(!1), [r, o] = u(""), [c, d] = u(""), g = l(void 0);
	s(() => {
		window.clearTimeout(g.current), g.current = window.setTimeout(() => d(r.trim()), 180);
	}, [r]);
	let v = a(c ? "content/search" : "content/recent", c ? { query: c } : {}, { enabled: t }), b = (v.data ?? []).filter((e) => e.uri !== null);
	return /* @__PURE__ */ P(x, {
		open: t,
		onOpenChange: (e) => {
			n(e), e || o("");
		},
		className: "w-[360px] max-w-[calc(100vw-16px)] p-0",
		trigger: /* @__PURE__ */ N(f, {
			icon: "page",
			children: i("Add Page")
		}),
		children: [/* @__PURE__ */ N("div", {
			className: "border-b border-border p-2",
			children: /* @__PURE__ */ N(m, {
				bare: !0,
				fields: [F()],
				values: { query: r },
				onChange: (e, t) => o(t)
			})
		}), /* @__PURE__ */ N("div", {
			className: "max-h-72 overflow-y-auto p-1",
			children: v.isFetching && !v.data ? /* @__PURE__ */ N("div", {
				className: "grid place-items-center py-6 text-faint",
				children: /* @__PURE__ */ N(D, { size: 14 })
			}) : v.isError ? /* @__PURE__ */ N(S, {
				compact: !0,
				message: i("Couldn’t load the pages."),
				onRetry: () => void v.refetch(),
				retrying: v.isFetching
			}) : b.length === 0 ? c ? /* @__PURE__ */ N(y, {
				className: "py-6",
				onClear: () => o("")
			}) : /* @__PURE__ */ N(p, {
				compact: !0,
				icon: "page",
				title: i("No pages yet")
			}) : /* @__PURE__ */ P(M, { children: [!c && /* @__PURE__ */ N("div", {
				className: "cms-label px-2 pb-1 pt-1.5",
				children: i("Recently Edited")
			}), /* @__PURE__ */ N(_, {
				className: "border-y-0! divide-y-0!",
				children: b.map((t) => /* @__PURE__ */ P(C, {
					className: "rounded-sm px-2",
					onClick: () => e(t),
					children: [
						/* @__PURE__ */ N(h, {
							name: "page",
							size: 14,
							className: "shrink-0 text-muted"
						}),
						/* @__PURE__ */ N("span", {
							className: "min-w-[55%] flex-1 truncate",
							children: t.title
						}),
						/* @__PURE__ */ N("span", {
							className: "min-w-0 shrink truncate text-xs text-faint",
							children: t.uri
						})
					]
				}, t.id))
			})] })
		})]
	});
}
export { B as default };
