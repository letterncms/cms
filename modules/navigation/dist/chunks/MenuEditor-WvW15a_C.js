import { can as e, invalidate as t, run as n, t as r, useAbility as i, useManifest as a } from "@letterncms/sdk";
import { useEffect as o, useMemo as s, useRef as c, useState as l } from "react";
import { Badge as u, Button as d, Fields as f, Icon as p, IconButton as m, NotFoundState as h, Popover as g, SaveBar as _, Skeleton as v, SortableTree as y, Spinner as b, cn as x } from "@letterncms/ui";
import { Fragment as S, jsx as C, jsxs as w } from "react/jsx-runtime";
// admin/src/MenuEditor.tsx
var T = () => ({
	handle: "maxDepth",
	type: "select",
	label: r("Submenus"),
	size: "sm",
	required: !0,
	options: [
		{
			value: "1",
			label: r("No Submenus")
		},
		{
			value: "2",
			label: r("One Level")
		},
		...[
			3,
			4,
			5
		].map((e) => ({
			value: String(e),
			label: r("{count} Levels", { count: e - 1 })
		}))
	]
}), E = () => ({
	handle: "query",
	type: "text",
	label: r("Search Content"),
	autofocus: !0,
	placeholder: r("Search Pages and Posts")
}), D = (e) => e.map(({ target: e, ...t }) => ({
	...t,
	label: t.label?.trim() || void 0,
	url: t.url?.trim() || void 0,
	newTab: t.newTab || void 0,
	locales: O(t.locales),
	children: D(t.children)
})), O = (e) => {
	let t = Object.entries(e ?? {}).flatMap(([e, t]) => {
		let n = Object.fromEntries(Object.entries(t ?? {}).filter(([, e]) => typeof e == "string" && e.trim() !== ""));
		return Object.keys(n).length ? [[e, n]] : [];
	});
	return t.length ? Object.fromEntries(t) : void 0;
}, k = (e, t) => JSON.stringify([e, D(t)]), A = () => Array.from(crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(8)), (e) => "abcdefghijklmnopqrstuvwxyz0123456789"[e % 36]).join("");
function j({ props: e }) {
	let t = i("navigation/get", { handle: e.handle }, { refetchOnWindowFocus: !1 });
	return t.isLoading ? /* @__PURE__ */ C(v, { className: "h-40" }) : t.data ? /* @__PURE__ */ C(M, { menu: t.data }, t.data.handle) : /* @__PURE__ */ C(h, { icon: "list-tree" });
}
function M({ menu: i }) {
	let [a, o] = l(i.items), [c, u] = l(i.maxDepth), [p, m] = l(/* @__PURE__ */ new Set()), [h, g] = l(() => k(i.maxDepth, i.items)), [v, b] = l(i), [x, E] = l(!1), [O, j] = l(null), M = e("navigation.manage"), F = s(() => k(c, a) !== h, [
		c,
		a,
		h
	]), I = (e) => o(e), L = (e, t) => {
		let n = (r) => r.map((r) => r.id === e ? {
			...r,
			...t
		} : {
			...r,
			children: n(r.children)
		});
		I(n(a));
	}, R = (e) => {
		let t = (n) => n.filter((t) => t.id !== e).map((e) => ({
			...e,
			children: t(e.children)
		}));
		I(t(a));
	}, z = (e) => m((t) => {
		let n = new Set(t);
		return n.has(e) ? n.delete(e) : n.add(e), n;
	}), B = (e) => I([...a, {
		id: A(),
		entry: e.id,
		target: {
			title: e.title,
			uri: e.uri,
			status: e.displayStatus,
			collection: e.collection
		},
		children: []
	}]), V = () => {
		let e = A();
		I([...a, {
			id: e,
			url: "",
			label: "",
			children: []
		}]), m((t) => new Set(t).add(e));
	}, H = () => {
		u(v.maxDepth), o(v.items), j(null);
	}, U = async () => {
		E(!0), j(null);
		try {
			let e = await n("navigation/update", {
				handle: i.handle,
				maxDepth: c,
				items: D(a)
			});
			o(e.items), u(e.maxDepth), g(k(e.maxDepth, e.items)), b(e), t("navigation/");
		} catch (e) {
			j(e instanceof Error ? e.message : String(e));
		} finally {
			E(!1);
		}
	};
	return /* @__PURE__ */ w(S, { children: [
		a.length === 0 ? /* @__PURE__ */ C("div", {
			className: "rounded-md border border-dashed border-border-strong px-6 py-10 text-center text-sm text-muted",
			children: r("This menu is empty.")
		}) : /* @__PURE__ */ C(y, {
			items: a,
			maxDepth: c - 1,
			onChange: I,
			renderItem: (e, t) => /* @__PURE__ */ C(N, {
				item: e,
				ctx: t,
				expanded: p.has(e.id),
				disabled: !M,
				onToggle: () => z(e.id),
				onPatch: (t) => L(e.id, t),
				onRemove: () => R(e.id)
			})
		}),
		M && /* @__PURE__ */ w("div", {
			className: "mt-3 flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ C(P, { onPick: B }),
				/* @__PURE__ */ C(d, {
					icon: "link",
					onClick: V,
					children: r("Add Link")
				}),
				/* @__PURE__ */ w("div", {
					className: "ml-auto flex items-center gap-2 text-sm text-muted",
					children: [/* @__PURE__ */ C("span", {
						"aria-hidden": !0,
						children: r("Submenus")
					}), /* @__PURE__ */ C("span", {
						className: "w-36",
						children: /* @__PURE__ */ C(f, {
							bare: !0,
							fields: [T()],
							values: { maxDepth: String(c) },
							onChange: (e, t) => u(Number(t))
						})
					})]
				})
			]
		}),
		M && /* @__PURE__ */ C(_, {
			dirty: F,
			saving: x,
			error: O,
			onSave: () => void U(),
			onDiscard: H
		})
	] });
}
function N({ item: e, ctx: t, expanded: n, disabled: i, onToggle: o, onPatch: s, onRemove: c }) {
	let l = !e.entry, d = e.target?.status, h = l ? e.url || r("No URL yet") : e.target?.uri ?? r("No URL"), g = a().site, _ = g.locales.filter((e) => e !== g.defaultLocale), v = (e) => new Intl.DisplayNames([e], { type: "language" }).of(e) ?? e;
	return /* @__PURE__ */ w("div", {
		className: x("group rounded-sm border bg-bg", n ? "border-border-strong" : "border-border hover:border-border-strong"),
		children: [/* @__PURE__ */ w("div", {
			className: "flex h-10 items-center gap-1.5 pl-1 pr-1.5",
			children: [
				!i && t.handle,
				/* @__PURE__ */ C(p, {
					name: l ? "link" : "page",
					size: 14,
					className: "shrink-0 text-muted"
				}),
				/* @__PURE__ */ C(f, {
					bare: !0,
					className: "min-w-0 flex-1",
					disabled: i,
					fields: [{
						handle: "label",
						type: "text",
						component: "navigation-label",
						label: r("Label"),
						placeholder: l ? r("Label") : e.target?.title ?? r("Missing entry"),
						display: l ? void 0 : "fallback"
					}],
					values: { label: e.label ?? "" },
					onChange: (e, t) => s({ label: t })
				}),
				/* @__PURE__ */ C("span", {
					className: x("max-w-[38%] truncate text-xs", l && !e.url ? "text-warning" : "text-faint"),
					children: h
				}),
				d && d !== "published" && d !== "changed" && /* @__PURE__ */ C(u, {
					tone: d === "missing" ? "danger" : "neutral",
					children: r(d === "missing" ? "Missing" : "Hidden until live")
				}),
				!i && /* @__PURE__ */ w("div", {
					className: "flex items-center text-faint",
					children: [
						/* @__PURE__ */ C(m, {
							icon: "arrow-left",
							label: r("Move Out a Level"),
							size: "xs",
							disabled: !t.canOutdent,
							onClick: t.outdent
						}),
						/* @__PURE__ */ C(m, {
							icon: "arrow-right",
							label: r("Nest Under the Item Above"),
							size: "xs",
							disabled: !t.canIndent,
							onClick: t.indent
						}),
						/* @__PURE__ */ C(m, {
							icon: "settings",
							label: r("Link Options"),
							size: "xs",
							active: n,
							onClick: o
						}),
						/* @__PURE__ */ C(m, {
							icon: "trash",
							label: r("Remove"),
							size: "xs",
							onClick: c
						})
					]
				})
			]
		}), n && /* @__PURE__ */ C(f, {
			className: "gap-y-2.5! border-t border-border px-3 py-3 pl-9",
			disabled: i,
			fields: [
				...l ? [{
					handle: "url",
					type: "url",
					component: "link",
					label: r("Link"),
					placeholder: r("Choose a page or paste a link")
				}] : [],
				{
					handle: "newTab",
					type: "toggle",
					label: r("Open in a New Tab"),
					display: "checkbox"
				},
				..._.flatMap((t) => [{
					handle: `label:${t}`,
					type: "text",
					label: r("Label in {language}", { language: v(t) }),
					placeholder: e.label || e.target?.title || void 0,
					width: l ? "half" : void 0
				}, ...l ? [{
					handle: `url:${t}`,
					type: "url",
					component: "link",
					label: r("Link in {language}", { language: v(t) }),
					placeholder: e.url || void 0,
					width: "half"
				}] : []])
			],
			values: {
				url: e.url ?? "",
				newTab: !!e.newTab,
				...Object.fromEntries(_.flatMap((t) => [[`label:${t}`, e.locales?.[t]?.label ?? ""], [`url:${t}`, e.locales?.[t]?.url ?? ""]]))
			},
			onChange: (t, n) => {
				let [r, i] = t.split(":");
				if (!i) return s(t === "newTab" ? { newTab: n || void 0 } : { url: n });
				s({ locales: {
					...e.locales,
					[i]: {
						...e.locales?.[i],
						[r]: n
					}
				} });
			}
		})]
	});
}
function P({ onPick: e }) {
	let [t, n] = l(!1), [a, s] = l(""), [u, m] = l(""), h = c(void 0);
	o(() => {
		window.clearTimeout(h.current), h.current = window.setTimeout(() => m(a.trim()), 180);
	}, [a]);
	let _ = i(u ? "content/search" : "content/recent", u ? { query: u } : {}, { enabled: t }), v = (_.data ?? []).filter((e) => e.uri !== null);
	return /* @__PURE__ */ w(g, {
		open: t,
		onOpenChange: (e) => {
			n(e), e || s("");
		},
		className: "w-[360px] p-0",
		trigger: /* @__PURE__ */ C(d, {
			icon: "page",
			children: r("Add Page")
		}),
		children: [/* @__PURE__ */ C("div", {
			className: "border-b border-border p-2",
			children: /* @__PURE__ */ C(f, {
				bare: !0,
				fields: [E()],
				values: { query: a },
				onChange: (e, t) => s(t)
			})
		}), /* @__PURE__ */ C("div", {
			className: "max-h-72 overflow-y-auto p-1",
			children: _.isFetching && !_.data ? /* @__PURE__ */ C("div", {
				className: "grid place-items-center py-6 text-faint",
				children: /* @__PURE__ */ C(b, { size: 14 })
			}) : v.length === 0 ? /* @__PURE__ */ C("p", {
				className: "m-0 px-3 py-6 text-center text-sm text-faint",
				children: r(u ? "No matches" : "No pages yet")
			}) : /* @__PURE__ */ w(S, { children: [!u && /* @__PURE__ */ C("div", {
				className: "cms-label px-2 pb-1 pt-1.5",
				children: r("Recently Edited")
			}), v.map((t) => /* @__PURE__ */ w("button", {
				type: "button",
				onClick: () => {
					e(t), n(!1), s("");
				},
				className: "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-hover",
				children: [
					/* @__PURE__ */ C(p, {
						name: "page",
						size: 14,
						className: "shrink-0 text-muted"
					}),
					/* @__PURE__ */ C("span", {
						className: "min-w-0 flex-1 truncate",
						children: t.title
					}),
					/* @__PURE__ */ C("span", {
						className: "max-w-[45%] truncate text-xs text-faint",
						children: t.uri
					})
				]
			}, t.id))] })
		})]
	});
}
export { j as default };
