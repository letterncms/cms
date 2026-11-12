import { CmsError as e, Link as t, adminUrl as n, boot as r, eventStream as i, events as a, getManifest as o, loadManifest as s, matchPath as c, navigate as l, onManifest as u, panelsFor as d, queryClient as f, registry as p, run as m, screenContext as h, screenText as g, t as _, timeAgo as v, useAction as y, useLocation as b, useManifest as x, useScreen as S } from "@letterncms/sdk";
import { Button as C, Dock as w, Fields as T, Icon as E, IconButton as D, Menu as ee, Notice as te, Pressable as O, QueryError as k, SidebarRow as A, Spinner as j, Surface as M, Textarea as ne, Tooltip as N, View as re, cn as P, confirm as ie, copyText as ae, fillTemplate as oe, toast as se, useShortcutLabel as F } from "@letterncms/ui";
import { Fragment as ce, createContext as le, useCallback as I, useContext as ue, useEffect as L, useId as de, useLayoutEffect as fe, useRef as R, useState as z, useSyncExternalStore as B } from "react";
import { Fragment as V, jsx as H, jsxs as U } from "react/jsx-runtime";
import { useInfiniteQuery as pe } from "@tanstack/react-query";
// admin/src/store.ts
var me = "cms.chat.open", he = "cms.chat.detached", W = "cms.chat.current";
function ge() {
	try {
		return {
			mode: localStorage.getItem(me) === "true" && window.matchMedia("(min-width: 1024px)").matches ? "docked" : "closed",
			thread: sessionStorage.getItem(W) || null,
			detached: localStorage.getItem(he) === "true"
		};
	} catch {
		return {
			mode: "closed",
			thread: null,
			detached: !1
		};
	}
}
var _e = /* @__PURE__ */ new Set(), G = {
	...ge(),
	fresh: 0,
	history: !1,
	title: "",
	prompt: null,
	searching: !1,
	focus: 0,
	contextPath: "/",
	dismissed: [],
	selectedText: "",
	attached: {},
	skills: {},
	commands: {},
	drafts: {},
	options: {},
	working: null,
	awaiting: !1
}, K = null, q = null, ve = -Infinity, ye = !1;
function be() {
	let e = ye;
	return ye = !1, {
		back: performance.now() - ve < 300,
		focus: e
	};
}
function xe(e) {
	return e ? `/chat/${encodeURIComponent(e)}` : "/chat/new";
}
function Se(e) {
	let t = /^\/chat\/([^/]+)$/.exec(e);
	return t ? t[1] === "new" ? null : decodeURIComponent(t[1]) : void 0;
}
function J() {
	return o().config?.workspace?.agent ?? null;
}
var Ce = () => window.location.pathname.slice(r.base.length) || "/";
function we(e, t = !1) {
	let n = xe(e);
	Ce() !== n && l(n, {
		replace: t,
		overlay: !0
	});
}
function Te() {
	try {
		localStorage.setItem(me, String(G.mode !== "closed")), localStorage.setItem(he, String(G.detached)), G.thread ? sessionStorage.setItem(W, G.thread) : sessionStorage.removeItem(W);
	} catch {}
}
var Y = () => G.thread ?? "new", X = {
	get: () => G,
	key: Y,
	set(e) {
		let t = G;
		G = {
			...G,
			...e.thread !== void 0 && e.thread !== G.thread ? { title: "" } : {},
			...e
		}, _e.forEach((e) => e()), (G.mode !== t.mode || G.thread !== t.thread || G.detached !== t.detached) && Te();
	},
	open() {
		G.mode === "closed" ? (q = document.activeElement, X.set({
			mode: "docked",
			focus: G.focus + 1
		})) : X.set({ focus: G.focus + 1 });
	},
	close() {
		if (G.mode === "closed") return;
		let e = G.mode === "full";
		X.set({ mode: "closed" }), e && l(K ?? "/", { overlay: K !== null }), ve = performance.now(), q instanceof HTMLElement && q.isConnected && q !== document.body ? q.focus() : ye = !0, q = null;
	},
	toggle() {
		let e = document.activeElement?.closest(".cms-dock");
		G.mode === "closed" || !e ? X.open() : G.mode === "full" ? X.minimize() : X.close();
	},
	maximize() {
		K = Ce() + window.location.search, we(G.thread);
	},
	minimize() {
		G.mode === "full" && l(K ?? "/", { overlay: K !== null });
	},
	select(e) {
		G.mode === "full" && we(e), G.mode === "closed" && (q = document.activeElement), X.set({
			thread: e,
			mode: G.mode === "closed" ? "docked" : G.mode,
			history: !1,
			prompt: null,
			focus: G.focus + 1
		});
	},
	newChat() {
		G.working?.thread !== null && X.set({ fresh: G.fresh + 1 }), X.select(null);
	},
	ask(e) {
		G.drafts[Y()]?.trim() ? X.select(G.thread) : X.newChat(), e?.trim() && X.set({
			prompt: e.trim(),
			searching: !1
		});
	},
	search(e) {
		e.trim() && X.set({
			prompt: e.trim(),
			searching: !0
		});
	},
	draft(e) {
		X.set({ drafts: {
			...G.drafts,
			[Y()]: e
		} });
	},
	option(e, t) {
		X.set({ options: {
			...G.options,
			[Y()]: {
				...G.options[Y()] ?? {},
				[e]: t
			}
		} });
	},
	command(e) {
		X.set({ commands: {
			...G.commands,
			[Y()]: e
		} });
	},
	deleted(e) {
		let { [e]: t, ...n } = G.drafts, { [e]: r, ...i } = G.options;
		X.set({
			drafts: n,
			options: i
		}), Ce() === xe(e) && we(null, !0), G.thread === e && X.set({
			thread: null,
			prompt: null,
			focus: G.focus + 1
		});
	},
	created(e, t) {
		if (G.thread !== e) {
			let { new: n, ...r } = G.options, { new: i, ...a } = G.commands;
			X.set({
				thread: e,
				title: t,
				drafts: {
					...G.drafts,
					[e]: G.drafts.new ?? "",
					new: ""
				},
				options: n ? {
					...r,
					[e]: n
				} : r,
				commands: i ? {
					...a,
					[e]: i
				} : a
			});
		} else X.set({ title: t });
		Ce() === "/chat/new" && we(e, !0);
	},
	subscribe(e) {
		return _e.add(e), () => {
			_e.delete(e);
		};
	}
};
function Z() {
	return B(X.subscribe, X.get);
}
function Ee() {
	return {
		chosen: Z().detached,
		required: S().rightEdge === !0
	};
}
// admin/src/ChatToggle.tsx
function De() {
	let { mode: e, working: t, awaiting: n } = Z(), r = e !== "closed", i = R(null);
	return fe(() => {
		let e = i.current;
		if (r || !e) return;
		let { back: t, focus: n } = be();
		e.toggleAttribute("data-back", t), n && e.focus();
	}, [r]), r ? null : /* @__PURE__ */ H(N, {
		content: _("Chat"),
		shortcut: "mod+j",
		side: "bottom",
		children: /* @__PURE__ */ U(C, {
			ref: i,
			"data-workspace-toggle": !0,
			variant: "tonal",
			onClick: () => X.open(),
			className: "cms-chat-toggle",
			children: [
				!t && !n && /* @__PURE__ */ H(E, {
					name: "comment-solid",
					size: 16,
					className: "shrink-0 text-signal"
				}),
				n && /* @__PURE__ */ H("span", {
					role: "status",
					"aria-label": _("Waiting for your go-ahead"),
					className: "size-1.5 rounded-full bg-signal ring-1 ring-border-strong"
				}),
				!n && t && /* @__PURE__ */ H("span", {
					role: "status",
					"aria-label": _("Working…"),
					children: /* @__PURE__ */ H(j, { size: 12 })
				}),
				/* @__PURE__ */ H("span", {
					className: "max-sm:sr-only",
					children: _("Chat")
				})
			]
		})
	});
}
// admin/src/schema.ts
var Oe = {
	title: () => _("Title"),
	name: () => _("Name"),
	email: () => _("Email"),
	slug: () => _("Slug"),
	status: () => _("Status"),
	label: () => _("Label"),
	url: () => _("Link"),
	menu: () => _("Menu"),
	roles: () => _("Roles"),
	password: () => _("Password"),
	collection: () => _("Collection"),
	query: () => _("Search"),
	search: () => _("Search"),
	description: () => _("Description"),
	code: () => _("Code")
};
function ke(e) {
	return Oe[e] ? Oe[e]() : e.replace(/Id$/, "").replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").trim().replace(/\b\w/g, (e) => e.toUpperCase());
}
var Ae = (e) => (Array.isArray(e.type) ? e.type : [e.type]).filter((e) => typeof e == "string" && e !== "null"), je = (e) => !e.pattern && ![
	"ulid",
	"date-time",
	"uri"
].includes(e.format), Me = (e) => e === "id" || e === "ids" || /Id$/.test(e) || e === "entry";
function Ne(e) {
	if (!e) return null;
	if (Array.isArray(e.oneOf) && e.oneOf.length > 0 && e.oneOf.every((e) => e && "const" in e)) return Object.fromEntries(e.oneOf.map((e) => [String(e.const), String(e.title ?? e.const)]));
	if (!Array.isArray(e.enum)) return null;
	let t = e["x-labels"] && typeof e["x-labels"] == "object" ? e["x-labels"] : {};
	return Object.fromEntries(e.enum.map((e) => [String(e), typeof t[String(e)] == "string" && t[String(e)] !== "" ? String(t[String(e)]) : String(e)]));
}
function Pe(e, t) {
	return [
		"entry",
		"entryId",
		"parentId",
		"originId"
	].includes(t) ? "entries" : ["userId", "authorId"].includes(t) ? "users" : t !== "id" || !e ? null : e.startsWith("entries/") ? "entries" : e.startsWith("users/") ? "users" : null;
}
function Fe(e, t, n = {}) {
	let r = e?.properties && typeof e.properties == "object" ? e.properties : {};
	return (Array.isArray(e?.required) ? e.required : []).every((e) => e in n || !Me(e) || Ne(r[e]) !== null || Pe(t, e) !== null);
}
function Ie(e, t = {}, n = !1, r) {
	let i = e?.properties && typeof e.properties == "object" && !Array.isArray(e.properties) ? e.properties : {}, a = Array.isArray(e?.required) ? e.required : [], o = [...a.filter((e) => e in i), ...Object.keys(i).filter((e) => !a.includes(e))], s = [], c = 0;
	for (let e of o) {
		if (e in t) continue;
		let o = i[e] ?? {}, l = a.includes(e), [u] = Ae(o), d = Ne(o), f = Me(e) && !d ? Pe(r, e) : null;
		if (!l) {
			if (n || c >= 6 || !je(o) && !d || ![
				"string",
				"boolean",
				"integer",
				"number"
			].includes(u ?? "")) continue;
			c++;
		}
		let p = {
			handle: e,
			type: "text",
			label: o.title ?? (f === "entries" ? _("Page") : f === "users" ? _("Person") : ke(e)),
			...l ? { required: !0 } : {},
			...o.default === void 0 ? {} : { default: o.default }
		};
		f ? s.push({
			...p,
			type: f,
			max: 1,
			single: !0
		}) : d ? s.push({
			...p,
			type: "select",
			options: d,
			display: "dropdown"
		}) : u === "boolean" ? s.push({
			...p,
			type: "toggle"
		}) : u === "integer" || u === "number" ? s.push({
			...p,
			type: "number",
			...o.minimum === void 0 ? {} : { min: o.minimum },
			...o.maximum === void 0 ? {} : { max: o.maximum },
			...u === "integer" ? { step: 1 } : {}
		}) : u === "array" && Ne(o.items) ? s.push({
			...p,
			type: "select",
			multiple: !0,
			options: Ne(o.items)
		}) : u === "array" && Ae(o.items ?? {})[0] === "string" ? s.push({
			...p,
			type: "tags"
		}) : u === "object" || u === "array" ? s.push({
			...p,
			type: "json"
		}) : s.push({
			...p,
			...o.format === "email" ? { type: "email" } : {},
			...o.maxLength && o.maxLength > 2e3 ? { type: "textarea" } : {},
			.../pass(word)?|secret|token|key$/i.test(e) ? { secret: !0 } : {}
		});
	}
	return s;
}
function Le(e, t) {
	let n = new Set(e.filter((e) => e.single).map((e) => e.handle));
	return Object.fromEntries(Object.entries(t).map(([e, t]) => [e, n.has(e) && Array.isArray(t) ? t[0] : t]));
}
function Re(e, t, n) {
	return n ? {
		...e,
		[n]: t
	} : {
		...e,
		...Object.fromEntries(Object.entries(t).filter(([, e]) => e !== "" && e != null && !(Array.isArray(e) && e.length === 0)))
	};
}
function ze(e, t) {
	let n = [];
	for (let r of e) {
		let e = t[r.handle];
		if (e == null || e === "" || r.secret || r.single) continue;
		let i = r.options && typeof r.options == "object" && !Array.isArray(r.options) ? r.options : null;
		i ? n.push((Array.isArray(e) ? e : [e]).map((e) => i[String(e)] ?? String(e)).join(", ")) : r.type === "toggle" ? e === !0 && n.push(r.label) : typeof e == "string" || typeof e == "number" ? n.push(String(e)) : Array.isArray(e) && e.every((e) => typeof e == "string") && n.push(e.join(", "));
	}
	return n.filter((e) => e.length < 80).slice(0, 3).join(" · ");
}
function Be(e, t = {}) {
	return (Array.isArray(e?.required) ? e.required : []).every((e) => e in t);
}
// admin/src/commands.ts
var Ve = null;
u(() => {
	Ve = null;
});
var He = () => Ve ??= m("workspace/commands").catch(() => (Ve = null, [])), Q = (e, ...t) => {
	let n = t.filter(Boolean).join(" ").toLowerCase();
	return e.trim().toLowerCase().split(/\s+/).filter(Boolean).every((e) => n.includes(e));
};
p.composer.set("workspace-search", {
	trigger: "/",
	label: _("Search"),
	order: 90,
	search: (e) => J() && e.trim().length > 1 ? [{
		id: "search",
		label: _("Search for “{query}”", { query: e.trim() }),
		icon: "search",
		perform: () => X.search(e)
	}] : []
}), p.composer.set("workspace-create", {
	trigger: "/",
	label: _("New"),
	order: 20,
	search: async (e) => {
		let t = (await He()).find((e) => e.name === "entries/create");
		return t ? o().collections.filter((t) => t.can.create && !t.within && Q(e, t.newLabel, t.title, t.singular, t.handle, `new ${t.singular}`, "create")).map((e) => ({
			id: `create:${e.handle}`,
			label: e.newLabel,
			icon: "plus",
			command: {
				ability: "entries/create",
				input: { collection: e.handle },
				schema: t.input,
				required: !0
			}
		})) : [];
	}
}), p.composer.set("workspace-places", {
	trigger: "/",
	label: _("Go To"),
	order: 30,
	search: (e) => o().nav.filter((t) => !t.home && Q(e, t.label)).slice(0, e ? 8 : 6).map((e) => ({
		id: `go:${e.id}`,
		label: e.label,
		icon: e.icon,
		perform: () => l(e.path)
	}))
}), p.composer.set("workspace-commands", {
	trigger: "/",
	label: _("Commands"),
	order: 40,
	search: async (e) => {
		let t = await He();
		return [...p.commands.all().filter((t) => t.id !== "workspace" && !t.acceptsQuery && Q(e, t.label, ...t.keywords ?? [])).map((e) => ({
			id: `command:${e.id}`,
			label: e.label,
			icon: e.icon ?? "command",
			perform: () => void e.perform()
		})), ...o().commands.filter((t) => Q(e, t.label, ...t.keywords ?? [])).map((e) => {
			let n = e.ability ? t.find((t) => t.name === e.ability) : void 0;
			return e.ability && (n || !e.path) ? {
				id: `ability:${e.id}`,
				label: e.label,
				icon: e.icon,
				command: {
					ability: e.ability,
					input: e.input ?? {},
					schema: n?.input,
					required: !0
				}
			} : {
				id: `go:${e.id}`,
				label: e.label,
				icon: e.icon,
				perform: () => e.path && l(e.path)
			};
		})];
	}
}), p.composer.set("workspace-settings", {
	trigger: "/",
	label: _("Settings"),
	order: 50,
	search: (e) => o().settings.filter((t) => Q(e, t.label, t.namespace, "settings")).slice(0, e ? 8 : 4).map((e) => ({
		id: `settings:${e.namespace}`,
		label: _("{name} Settings", { name: e.label }),
		icon: e.icon,
		command: {
			ability: "settings/update",
			input: { namespace: e.namespace },
			into: "values",
			load: () => m("settings/get", { namespace: e.namespace })
		}
	}))
}), p.composer.set("workspace-abilities", {
	trigger: "/",
	label: _("Abilities"),
	order: 60,
	search: async (e) => e.trim() === "" ? [] : (await He()).filter((t) => Q(e, t.label, t.group, t.name) && Fe(t.input, t.name)).map((e) => ({
		id: `run:${e.name}`,
		label: e.label,
		group: e.group,
		icon: e.icon,
		command: {
			ability: e.name,
			schema: e.input,
			destructive: e.destructive
		}
	}))
});
// admin/src/NewChatRow.tsx
function Ue({ onNavigate: e }) {
	return /* @__PURE__ */ H(A, {
		label: _("New Chat"),
		icon: "compose",
		onClick: () => {
			e?.(), X.newChat();
		}
	});
}
// admin/src/context.ts
var We = 4e4, Ge = 12e3, Ke = 4e3;
function qe(e, t) {
	if (e.private) return [];
	let n = [];
	if (e.title && n.push({
		id: "page",
		kind: "page",
		label: e.title,
		icon: e.icon ?? "file",
		to: t.contextPath,
		read: e.kind ? async () => ({
			kind: e.kind,
			...e.data?.()
		}) : () => g(Ge)
	}), n.push(...e.items ?? []), t.selectedText) {
		let e = t.selectedText.slice(0, Ke);
		n.push({
			id: "text",
			kind: "selected_text",
			label: e.replace(/\s+/g, " "),
			icon: "quote",
			read: () => e
		});
	}
	return n.filter((e) => !t.dismissed.includes(e.id));
}
function Je(e, t) {
	let n = t.attached[t.thread ?? "new"] ?? [];
	return [...qe(e, t), ...n.filter((n) => !qe(e, t).some((e) => e.id === n.id))];
}
var Ye = (e) => {
	if (e != null && e !== "") try {
		return (typeof e == "string" ? e : JSON.stringify(e)).slice(0, We);
	} catch {
		return;
	}
}, Xe = /* @__PURE__ */ new Map();
async function Ze(e) {
	let t = h.get(), n = X.get(), r = e ?? "new", i = Je(t, n), a = n.skills[r]?.skill;
	X.set({
		attached: {
			...n.attached,
			[r]: []
		},
		skills: {
			...n.skills,
			[r]: null
		},
		selectedText: ""
	}), await t.flush?.();
	let o = e && Xe.get(e) || /* @__PURE__ */ new Map(), s = new Map(o), c = await Promise.all(i.map(async (e) => {
		let t = {
			kind: e.kind,
			label: e.label,
			icon: e.icon,
			to: e.to
		}, n = Ye(await Promise.resolve().then(() => e.read?.()).catch(() => void 0));
		return n === void 0 ? t : o.get(e.id) === n ? {
			...t,
			unchanged: !0
		} : (s.set(e.id, n), {
			...t,
			content: n
		});
	}));
	return {
		context: {
			path: i.some((e) => e.id === "page") || t.private ? n.contextPath : void 0,
			items: c,
			skill: a ?? void 0
		},
		carry: (e) => Xe.set(e, s)
	};
}
function Qe(e) {
	e && Xe.delete(e);
}
document.addEventListener("selectionchange", () => {
	let e = document.getSelection(), t = e?.anchorNode, n = t instanceof Element ? t : t?.parentElement;
	if (!e || !n?.closest("[data-cms-screen]")) return;
	let r = e.isCollapsed ? "" : e.toString().trim();
	r !== X.get().selectedText && X.set({
		selectedText: r,
		dismissed: X.get().dismissed.filter((e) => e !== "text")
	});
});
var $e = {
	page: () => _("{brand} sees this page"),
	block: () => _("{brand} sees this block"),
	selected_text: () => _("{brand} sees the text you selected")
}, et = () => window.matchMedia("(pointer: coarse)").matches;
function tt(e, t, n) {
	let r = /(?:^|\s)@([^\s@]*)$|(?:^|\n)\/([^\n/]*)$/.exec(e.slice(0, t));
	if (!r || r[1] !== void 0 && !n) return null;
	let i = r[1] === void 0 ? "/" : "@", a = r[1] ?? r[2] ?? "";
	return {
		char: i,
		query: a,
		start: t - a.length - 1
	};
}
function nt(e) {
	let t = B(p.composer.subscribe, p.composer.version), [n, r] = z([]), [i, a] = z(!1), o = e?.char, s = e?.query;
	return L(() => {
		if (!o) {
			r([]);
			return;
		}
		let e = !1;
		a(!0);
		let t = p.composer.all().filter((e) => e.trigger === o).sort((e, t) => (e.order ?? 50) - (t.order ?? 50)), n = setTimeout(() => {
			let n = /* @__PURE__ */ new Map(), i = t.length;
			i || a(!1);
			for (let o of t) Promise.resolve().then(() => o.search(s ?? "")).catch(() => []).then((s) => {
				if (e) return;
				n.set(o.id, s);
				let c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Map();
				for (let e of t) for (let t of n.get(e.id) ?? []) {
					let n = t.label.trim().toLowerCase();
					if (c.has(n)) continue;
					c.add(n);
					let r = t.group ?? e.label;
					l.has(r) || l.set(r, {
						source: e,
						label: r,
						options: []
					}), l.get(r).options.push(t);
				}
				r([...l.values()]), --i === 0 && a(!1);
			});
		}, s ? 120 : 0);
		return () => {
			e = !0, clearTimeout(n);
		};
	}, [
		o,
		s,
		t
	]), {
		groups: n,
		loading: i
	};
}
function rt({ onAdd: e }) {
	let t = Z(), n = S(), r = t.thread ?? "new", i = Je(n, t), a = t.skills[r], o = new Set(qe(n, t).map((e) => e.id)), s = n.title && !n.private && t.dismissed.includes("page"), c = (e) => {
		e.id === "text" ? X.set({ selectedText: "" }) : o.has(e.id) ? X.set({ dismissed: [...t.dismissed, e.id] }) : X.set({ attached: {
			...t.attached,
			[r]: (t.attached[r] ?? []).filter((t) => t.id !== e.id)
		} });
	};
	return /* @__PURE__ */ U("div", {
		className: "flex flex-wrap items-center gap-1 px-2 pt-2",
		children: [
			/* @__PURE__ */ H(N, {
				content: _("Add Context"),
				shortcut: "@",
				children: /* @__PURE__ */ H(O, {
					compact: !0,
					"aria-label": _("Add Context"),
					onClick: e,
					className: "cms-thread-chip justify-center !px-0 w-[22px] text-muted hover:text-text",
					children: /* @__PURE__ */ H("span", {
						"aria-hidden": "true",
						className: "text-xs leading-none",
						children: "@"
					})
				})
			}),
			a && /* @__PURE__ */ H(it, {
				icon: a.icon ?? "sparkle",
				label: a.label,
				hint: a.detail ?? a.label,
				strong: !0,
				onRemove: () => X.set({ skills: {
					...t.skills,
					[r]: null
				} })
			}),
			i.map((e) => /* @__PURE__ */ H(it, {
				icon: e.icon ?? "file",
				label: e.label,
				hint: (e.kind && $e[e.kind]?.()) ?? e.label,
				strong: !o.has(e.id),
				onRemove: () => c(e)
			}, e.id)),
			s && /* @__PURE__ */ U(O, {
				compact: !0,
				onClick: () => X.set({ dismissed: t.dismissed.filter((e) => e !== "page") }),
				className: "cms-thread-chip pr-1.5 text-faint hover:text-text",
				children: [/* @__PURE__ */ H(E, {
					name: "plus",
					size: 11
				}), /* @__PURE__ */ H("span", {
					className: "truncate",
					children: n.title
				})]
			})
		]
	});
}
function it({ icon: e, label: t, hint: n, strong: r, onRemove: i }) {
	return /* @__PURE__ */ U("span", {
		className: P("cms-thread-chip", r ? "text-text" : "text-muted"),
		children: [/* @__PURE__ */ H(N, {
			content: n,
			children: /* @__PURE__ */ U("span", {
				tabIndex: 0,
				className: "flex min-w-0 items-center gap-1 outline-offset-1",
				children: [/* @__PURE__ */ H(E, {
					name: e,
					size: 11,
					className: "shrink-0"
				}), /* @__PURE__ */ H("span", {
					className: "truncate",
					children: t
				})]
			})
		}), /* @__PURE__ */ H(O, {
			compact: !0,
			"aria-label": _("Remove {name}", { name: t }),
			onClick: i,
			className: "grid size-4 shrink-0 place-items-center rounded-xs text-faint hover:bg-hover hover:text-text",
			children: /* @__PURE__ */ H(E, {
				name: "close",
				size: 10
			})
		})]
	});
}
function at({ id: e, trigger: t, groups: n, loading: r, active: i, onActive: a, onPick: o }) {
	let s = R(null), c = R(!1);
	fe(() => {
		s.current?.querySelector("[aria-selected=\"true\"]")?.scrollIntoView({ block: "nearest" });
	}, [i]);
	let l = -1;
	return /* @__PURE__ */ U("div", {
		ref: s,
		onMouseMove: () => {
			c.current = !0;
		},
		id: e,
		role: "listbox",
		"aria-label": t.char === "@" ? _("Add Context") : _("Commands"),
		className: "cms-pop absolute inset-x-0 bottom-full z-sticky mb-1.5 max-h-80 overflow-y-auto overscroll-contain p-1",
		children: [n.map(({ source: t, label: n, options: r }) => /* @__PURE__ */ U("div", {
			role: "group",
			"aria-label": n,
			children: [/* @__PURE__ */ H("div", {
				className: "flex h-6 items-center px-2 text-2xs font-medium text-faint",
				children: n
			}), r.map((t) => {
				l++;
				let n = l;
				return /* @__PURE__ */ U("div", {
					id: `${e}-${n}`,
					role: "option",
					"aria-selected": n === i,
					onMouseEnter: () => {
						c.current && a(n);
					},
					onMouseMove: () => {
						n !== i && a(n);
					},
					onMouseDown: (e) => {
						e.preventDefault(), o(t);
					},
					className: P("cms-thread-option flex min-h-8 cursor-default items-center gap-2 rounded-sm px-2 py-1 text-sm", n === i ? "bg-hover text-ink" : "text-text"),
					children: [
						/* @__PURE__ */ H(E, {
							name: t.icon ?? "file",
							size: 14,
							className: "shrink-0 text-muted"
						}),
						/* @__PURE__ */ H("span", {
							className: "shrink-0 truncate",
							children: t.label
						}),
						t.detail && /* @__PURE__ */ H("span", {
							className: "min-w-0 flex-1 truncate text-xs text-faint",
							children: t.detail
						})
					]
				}, t.id);
			})]
		}, `${t.id}:${n}`)), n.length === 0 && /* @__PURE__ */ H("div", {
			className: "flex h-8 items-center gap-2 px-2 text-sm text-muted",
			children: r ? /* @__PURE__ */ U(V, { children: [
				/* @__PURE__ */ H(j, { size: 12 }),
				" ",
				_("Looking…")
			] }) : _("No matches")
		})]
	});
}
function ot({ pending: e, busy: t, onRun: n, onCancel: r }) {
	let i = e.option.command, [a, o] = z(null), [s, c] = z({}), l = i.load ? a ?? [] : Ie(i.schema, i.input ?? {}, i.required, i.ability), [u, d] = z(() => ({
		...Object.fromEntries(l.filter((e) => e.default !== void 0).map((e) => [e.handle, e.default])),
		...e.values
	}));
	L(() => {
		if (!i.load) return;
		let e = !1;
		return i.load().then((t) => {
			e || (o(t.fields), c(t.values ?? {}), d((e) => ({
				...t.values ?? {},
				...e
			})));
		}).catch((t) => !e && h(t instanceof Error ? t.message : String(t))), () => {
			e = !0;
		};
	}, []);
	let [f, p] = z({}), [m, h] = z(null), [g, v] = z(!1), y = de(), b = async () => {
		if (g || t) return;
		v(!0), h(null);
		let e = Le(l, u), r = i.load && i.into ? Object.fromEntries(Object.entries(e).filter(([e, t]) => JSON.stringify(t) !== JSON.stringify(s[e]))) : e, a = i.scope ? oe(i.input ?? {}, {
			...i.scope,
			values: r
		}) : Re(i.input ?? {}, r, i.into), o = await n(i.scope && Object.keys(i.input ?? {}).length === 0 ? r : a, ze(l, r));
		v(!1), o !== !0 && (p(o.details), h(Object.keys(o.details).some((e) => l.some((t) => t.handle === e)) ? null : o.message));
	};
	return /* @__PURE__ */ U("form", {
		id: y,
		"aria-label": e.option.label,
		onSubmit: (e) => {
			e.preventDefault(), b();
		},
		onKeyDown: (e) => {
			e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), r()), e.key === "Enter" && !e.nativeEvent.isComposing && e.target instanceof HTMLInputElement && (e.preventDefault(), b());
		},
		className: "cms-thread-command px-3 pb-1 pt-2.5",
		children: [
			/* @__PURE__ */ U("div", {
				className: "mb-2 flex items-center gap-1.5 text-sm font-medium text-ink",
				children: [/* @__PURE__ */ H(E, {
					name: e.option.icon ?? "command",
					size: 14,
					className: "text-muted"
				}), /* @__PURE__ */ H("span", {
					className: "min-w-0 truncate",
					children: e.option.label
				})]
			}),
			i.load && !a && !m && /* @__PURE__ */ H("div", {
				className: "grid h-16 place-items-center text-faint",
				children: /* @__PURE__ */ H(j, { size: 14 })
			}),
			l.length > 0 && /* @__PURE__ */ H("div", {
				className: "cms-thread-command-fields -mx-1 max-h-[min(50dvh,440px)] overflow-y-auto overscroll-contain px-1 pb-1",
				children: /* @__PURE__ */ H(T, {
					fields: l.map((e, t) => ({
						autofocus: t === 0,
						...e
					})),
					values: u,
					errors: f,
					onChange: (t, n) => {
						d((e) => ({
							...e,
							[t]: n
						})), p(({ [t]: e, ...n }) => n), X.command({
							...e,
							values: {
								...e.values,
								[t]: n
							}
						});
					}
				})
			}),
			m && /* @__PURE__ */ H("p", {
				role: "alert",
				className: "m-0 mt-2 text-sm text-danger",
				children: m
			}),
			/* @__PURE__ */ U("div", {
				className: "flex justify-end gap-1.5 pb-1.5 pt-3",
				children: [/* @__PURE__ */ H(C, {
					size: "sm",
					variant: "ghost",
					onClick: r,
					disabled: g,
					children: _("Cancel")
				}), /* @__PURE__ */ H(C, {
					size: "sm",
					type: "submit",
					variant: i.destructive ? "danger" : "primary",
					loading: g,
					disabled: t || !!i.load && !a,
					autoFocus: l.length === 0 && !i.load,
					children: i.confirm ?? (i.load ? _("Save") : _("Run"))
				})]
			})
		]
	});
}
function st({ placeholder: e, focus: t, busy: n, onSubmit: r, onCommand: i, children: a }) {
	let { drafts: o, thread: s, commands: c } = Z(), l = s ?? "new", u = o[l] ?? "", d = c[l] ?? null, f = J() !== null, p = R(null), [m, h] = z(0), [g, _] = z(null), [v, y] = z(0), b = de(), x = d ? null : tt(u, m, f), S = x && x.start !== g ? x : null, { groups: C, loading: w } = nt(S), T = C.flatMap((e) => e.options), E = S !== null;
	L(() => {
		He();
	}, []), L(() => {
		if (!t || d) return;
		let e = requestAnimationFrame(() => p.current?.focus());
		return () => cancelAnimationFrame(e);
	}, [t]);
	let [D, ee] = z(null);
	L(() => {
		y(0), ee(null);
	}, [S?.char, S?.query]), L(() => {
		if (D === null) return;
		let e = T.findIndex((e) => e.id === D);
		e >= 0 && e !== v && y(e);
	}, [T.map((e) => e.id).join("|")]);
	let te = (e) => {
		y(e), ee(T[e]?.id ?? null);
	};
	L(() => {
		x || _(null);
	}, [x]);
	let O = (e, t) => {
		X.draft(e), h(t), requestAnimationFrame(() => {
			p.current?.focus(), p.current?.setSelectionRange(t, t);
		});
	}, k = (e) => {
		if (!S) return;
		let t = u.slice(0, S.start), n = u.slice(S.start + 1 + S.query.length);
		if (e.insert !== void 0) {
			O(t + e.insert + n, t.length + e.insert.length);
			return;
		}
		if (e.command) {
			O(t + n, t.length);
			let r = e.command.input ?? {};
			!e.command.load && !e.command.scope && Be(e.command.schema, r) && !e.command.destructive ? i(e, r, !1) : X.command({
				option: e,
				values: {}
			});
			return;
		}
		if (e.perform || e.skill) {
			O(t + n, t.length), e.perform ? e.perform() : X.set({ skills: {
				...X.get().skills,
				[l]: e
			} });
			return;
		}
		let r = `@${e.label} `;
		O(t + r + n, t.length + r.length), X.set({ attached: {
			...X.get().attached,
			[l]: [...(X.get().attached[l] ?? []).filter((t) => t.id !== e.id), e]
		} });
	}, A = () => {
		let e = p.current?.selectionStart ?? u.length, t = e > 0 && !/\s/.test(u[e - 1]) ? " " : "";
		O(`${u.slice(0, e)}${t}@${u.slice(e)}`, e + t.length + 1);
	}, j = (e) => {
		if (!e.nativeEvent.isComposing) {
			if (E && T.length > 0) {
				if (e.key === "ArrowDown" || e.key === "ArrowUp") {
					e.preventDefault(), te((v + (e.key === "ArrowDown" ? 1 : -1) + T.length) % T.length);
					return;
				}
				if (e.key === "Enter" || e.key === "Tab") {
					e.preventDefault(), k(T[Math.min(v, T.length - 1)]);
					return;
				}
			}
			E && e.key === "Escape" ? (e.preventDefault(), _(S.start)) : e.key === "Enter" && !e.shiftKey && (e.preventDefault(), r());
		}
	}, M = () => {
		X.command(null), et() || requestAnimationFrame(() => p.current?.focus());
	};
	return /* @__PURE__ */ U("div", {
		className: "relative",
		children: [E && /* @__PURE__ */ H(at, {
			id: b,
			trigger: S,
			groups: C,
			loading: w,
			active: Math.min(v, Math.max(0, T.length - 1)),
			onActive: te,
			onPick: k
		}), /* @__PURE__ */ H("div", {
			className: "cms-thread-composer overflow-hidden rounded-lg border border-border bg-bg transition-colors focus-within:border-border-strong",
			children: d ? /* @__PURE__ */ H(ot, {
				pending: d,
				busy: n,
				onCancel: M,
				onRun: async (e, t) => {
					let n = await i(d.option, e, !0, t);
					return n === !0 && M(), n;
				}
			}, d.option.id) : /* @__PURE__ */ U("form", {
				onSubmit: (e) => {
					e.preventDefault(), r();
				},
				children: [
					f && /* @__PURE__ */ H(rt, { onAdd: A }),
					/* @__PURE__ */ H(ne, {
						ref: p,
						value: u,
						onChange: (e) => {
							X.draft(e.target.value), h(e.target.selectionStart);
						},
						onSelect: (e) => h(e.currentTarget.selectionStart),
						onKeyDown: j,
						rows: 2,
						placeholder: e,
						"aria-label": e,
						role: "combobox",
						"aria-autocomplete": "list",
						"aria-expanded": E,
						"aria-controls": E ? b : void 0,
						"aria-activedescendant": E && T.length > 0 ? `${b}-${v}` : void 0,
						className: "cms-thread-input max-h-52 min-h-0 resize-none border-0 bg-transparent px-3 pt-2.5 text-sm shadow-none focus:ring-0 focus-visible:outline-none"
					}),
					a
				]
			})
		})]
	});
}
// admin/src/Rename.tsx
function ct({ id: e, title: t, onDone: n, className: r }) {
	let [i, a] = z(t), [o, s] = z(!1), c = async () => {
		let r = i.trim();
		if (!r || r === t) return n(null);
		s(!0);
		try {
			await m("threads/rename", {
				id: e,
				title: r
			}), f.invalidateQueries({ queryKey: ["threads/list"] }), n(r);
		} catch (e) {
			se.error(e), s(!1);
		}
	};
	return /* @__PURE__ */ H("form", {
		className: P("min-w-0 flex-1", r),
		onSubmit: (e) => {
			e.preventDefault(), c();
		},
		onKeyDown: (e) => {
			e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), n(null));
		},
		onBlur: (e) => {
			!o && !e.currentTarget.contains(e.relatedTarget) && c();
		},
		children: /* @__PURE__ */ H(T, {
			bare: !0,
			fields: [{
				handle: "title",
				type: "text",
				label: _("Rename Chat"),
				size: "sm",
				autofocus: !0,
				max: 120
			}],
			values: { title: i },
			disabled: o,
			onChange: (e, t) => a(String(t ?? ""))
		})
	});
}
// admin/src/History.tsx
var lt = 30;
function ut() {
	let { working: e, thread: t, title: n } = Z(), r = pe({
		queryKey: ["threads/list", "pages"],
		initialPageParam: 0,
		queryFn: ({ pageParam: e }) => m("threads/list", {
			limit: lt,
			offset: e
		}),
		getNextPageParam: (e, t) => e.length === lt ? t.length * lt : void 0
	}), i = r.data?.pages.flat() ?? [], a = t && r.data && !i.some((e) => e.id === t) ? [{
		id: t,
		title: n,
		updatedAt: null
	}, ...i] : i;
	return {
		history: r,
		chats: e?.thread ? [{
			id: e.thread,
			title: e.title,
			updatedAt: a.find((t) => t.id === e.thread)?.updatedAt ?? null
		}, ...a.filter((t) => t.id !== e.thread)] : a
	};
}
function dt({ chat: e, remove: t, renaming: n, onRename: r }) {
	let { thread: i, working: a, drafts: o } = Z(), s = a?.thread === e.id, c = !!o[e.id]?.trim();
	return n ? /* @__PURE__ */ H("div", {
		"data-chat-row": e.id,
		className: "px-1 py-0.5",
		children: /* @__PURE__ */ H(ct, {
			id: e.id,
			title: e.title,
			onDone: (t) => {
				r(!1), t && i === e.id && X.set({ title: t }), requestAnimationFrame(() => document.querySelector(`[data-chat-row="${e.id}"] .cms-sidebar-row-main`)?.focus());
			}
		})
	}) : /* @__PURE__ */ H("div", {
		"data-chat-row": e.id,
		children: /* @__PURE__ */ H(A, {
			label: e.title || _("New Chat"),
			icon: "comment",
			title: `${e.title} · ${v(e.updatedAt)}`,
			onClick: () => X.select(e.id),
			active: i === e.id,
			status: s || c ? /* @__PURE__ */ U(V, { children: [s && /* @__PURE__ */ H("span", {
				role: "status",
				"aria-label": _("Working…"),
				children: /* @__PURE__ */ H(j, { size: 12 })
			}), c && /* @__PURE__ */ H("span", { children: _("Draft") })] }) : void 0,
			actions: [{
				label: _("Rename Chat"),
				icon: "edit",
				onSelect: () => r(!0)
			}, {
				label: _("Delete Chat"),
				icon: "trash",
				danger: !0,
				quick: !0,
				disabled: s,
				onSelect: () => t(e)
			}]
		})
	});
}
function ft(e) {
	let { working: t } = Z(), n = R(null), r = y("threads/delete", {
		invalidates: ["threads/list"],
		onSuccess: (e, { id: t }) => {
			X.deleted(t), se.success(_("Chat deleted"));
			let r = n.current;
			setTimeout(() => (r ? document.querySelector(`[data-chat-row="${r}"] .cms-sidebar-row-main`) : document.querySelector(".cms-thread-input"))?.focus(), 120);
		},
		onError: se.error
	});
	return async (i) => {
		if (t?.thread === i.id || r.isPending) return;
		let a = e.findIndex((e) => e.id === i.id);
		n.current = e[a + 1]?.id ?? e[a - 1]?.id ?? null, await ie({
			title: _("Delete “{title}”?", { title: i.title || _("New Chat") }),
			description: _("This chat and its messages will be permanently deleted."),
			confirm: _("Delete Chat"),
			danger: !0
		}) && r.mutate({ id: i.id });
	};
}
function pt() {
	let { history: e, chats: t } = ut(), n = ft(t), { drafts: r, working: i, thread: a, focusList: o } = Z(), [s, c] = z(null), l = R(null);
	L(() => {
		if (!o) return;
		let e = requestAnimationFrame(() => (l.current?.querySelector("[aria-current=\"page\"]") ?? l.current?.querySelector(".cms-sidebar-row-main"))?.focus());
		return () => cancelAnimationFrame(e);
	}, [o]);
	let u = i?.thread === null, d = r.new?.trim(), f = (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0), p = [
		{
			label: _("Today"),
			from: f
		},
		{
			label: _("Previous 7 Days"),
			from: f - 6048e5
		},
		{
			label: _("Older"),
			from: -Infinity
		}
	].map((e, n, r) => ({
		...e,
		chats: t.filter((t) => {
			let i = t.updatedAt ? new Date(t.updatedAt).getTime() : Date.now();
			return i >= e.from && (n === 0 || i < r[n - 1].from);
		})
	})).filter((e) => e.chats.length > 0), m = R(null);
	return L(() => {
		let t = m.current;
		if (!t) return;
		let n = new IntersectionObserver(([t]) => {
			t.isIntersecting && e.hasNextPage && !e.isFetchingNextPage && e.fetchNextPage();
		}, { rootMargin: "200px" });
		return n.observe(t), () => n.disconnect();
	}, [
		e.hasNextPage,
		e.isFetchingNextPage,
		e.fetchNextPage
	]), /* @__PURE__ */ U("nav", {
		ref: l,
		"aria-label": _("Chats"),
		className: "min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4 pt-1",
		children: [
			(u || d && a !== null) && /* @__PURE__ */ H(A, {
				label: (u ? i.title : d) || _("New Chat"),
				onClick: () => X.select(null),
				active: a === null,
				status: u ? /* @__PURE__ */ H("span", {
					role: "status",
					"aria-label": _("Working…"),
					children: /* @__PURE__ */ H(j, { size: 12 })
				}) : _("Draft"),
				actions: [!u && {
					label: _("Discard Draft"),
					icon: "close",
					quick: !0,
					onSelect: () => X.set({ drafts: {
						...X.get().drafts,
						new: ""
					} })
				}]
			}),
			p.map((e) => /* @__PURE__ */ U("section", {
				"aria-label": e.label,
				className: "mt-2 first:mt-0",
				children: [/* @__PURE__ */ H("h3", {
					className: "m-0 flex h-7 items-center px-2 text-xs font-medium text-faint",
					children: e.label
				}), /* @__PURE__ */ H("div", {
					className: "space-y-px",
					children: e.chats.map((e) => /* @__PURE__ */ H(dt, {
						chat: e,
						remove: (e) => void n(e),
						renaming: s === e.id,
						onRename: (t) => c(t ? e.id : null)
					}, e.id))
				})]
			}, e.label)),
			e.isPending && /* @__PURE__ */ H("div", {
				className: "grid h-24 place-items-center text-faint",
				children: /* @__PURE__ */ H(j, {})
			}),
			e.isError && /* @__PURE__ */ H(k, {
				compact: !0,
				message: _("Couldn’t load your chats"),
				onRetry: () => void e.refetch(),
				retrying: e.isRefetching
			}),
			e.hasNextPage && /* @__PURE__ */ H("div", {
				ref: m,
				className: "grid h-10 place-items-center text-faint",
				children: e.isFetchingNextPage && /* @__PURE__ */ H(j, { size: 14 })
			})
		]
	});
}
function mt() {
	return /* @__PURE__ */ H(N, {
		content: _("New Chat"),
		children: /* @__PURE__ */ H(D, {
			icon: "plus",
			label: _("New Chat"),
			title: void 0,
			onClick: () => X.newChat()
		})
	});
}
// admin/src/Markdown.tsx
function ht({ text: e }) {
	return /* @__PURE__ */ H("div", {
		className: "cms-md space-y-2.5 text-sm leading-[1.6] text-text",
		children: gt(e)
	});
}
function gt(e) {
	let t = e.replace(/\r\n/g, "\n").split("\n"), n = [], r = 0;
	for (; r < t.length;) {
		let e = t[r];
		if (!e.trim()) {
			r++;
			continue;
		}
		let i = e.match(/^\s*(```|~~~)\s*([\w-]*)/);
		if (i) {
			let e = [];
			for (r++; r < t.length && !t[r].trimStart().startsWith(i[1]);) e.push(t[r++]);
			r++, n.push(/* @__PURE__ */ H("pre", {
				className: "overflow-x-auto rounded-sm border border-border bg-sunken px-3 py-2 font-mono text-xs leading-relaxed text-text",
				children: /* @__PURE__ */ H("code", { children: e.join("\n") })
			}, n.length));
			continue;
		}
		let a = e.match(/^(#{1,4})\s+(.*)$/);
		if (a) {
			let e = a[1].length <= 2 ? "text-base" : "text-sm";
			n.push(/* @__PURE__ */ H("p", {
				className: `${e} pt-1 font-semibold tracking-[-0.01em] text-ink`,
				children: $(a[2])
			}, n.length)), r++;
			continue;
		}
		if (/^\s*\|.*\|\s*$/.test(e) && /^\s*\|?\s*:?-{2,}/.test(t[r + 1] ?? "")) {
			let i = (e) => e.trim().replace(/^\||\|$/g, "").split("|").map((e) => e.trim()), a = i(e), o = [];
			for (r += 2; r < t.length && /^\s*\|.*\|\s*$/.test(t[r]);) o.push(i(t[r++]));
			n.push(/* @__PURE__ */ H("div", {
				className: "overflow-x-auto rounded-sm border border-border",
				children: /* @__PURE__ */ U("table", {
					className: "w-full text-left text-xs",
					children: [/* @__PURE__ */ H("thead", {
						className: "bg-surface text-muted",
						children: /* @__PURE__ */ H("tr", { children: a.map((e, t) => /* @__PURE__ */ H("th", {
							className: "px-2.5 py-1.5 font-medium",
							children: $(e)
						}, t)) })
					}), /* @__PURE__ */ H("tbody", { children: o.map((e, t) => /* @__PURE__ */ H("tr", {
						className: "border-t border-border",
						children: e.map((e, t) => /* @__PURE__ */ H("td", {
							className: "px-2.5 py-1.5 align-top",
							children: $(e)
						}, t))
					}, t)) })]
				})
			}, n.length));
			continue;
		}
		if (/^\s*>/.test(e)) {
			let e = [];
			for (; r < t.length && /^\s*>/.test(t[r]);) e.push(t[r++].replace(/^\s*>\s?/, ""));
			n.push(/* @__PURE__ */ H("blockquote", {
				className: "border-l-2 border-border-strong pl-3 text-muted",
				children: gt(e.join("\n"))
			}, n.length));
			continue;
		}
		let o = /^\s*[-*+]\s+/, s = /^\s*\d+[.)]\s+/;
		if (o.test(e) || s.test(e)) {
			let i = s.test(e), a = i ? s : o, c = [];
			for (; r < t.length && (a.test(t[r]) || /^\s{2,}\S/.test(t[r]) && c.length);) a.test(t[r]) ? c.push(t[r].replace(a, "")) : c[c.length - 1] += `\n${t[r].trim()}`, r++;
			let l = i ? "ol" : "ul";
			n.push(/* @__PURE__ */ H(l, {
				className: `${i ? "list-decimal" : "list-disc"} space-y-1 pl-5 marker:text-faint`,
				children: c.map((e, t) => /* @__PURE__ */ H("li", { children: $(e) }, t))
			}, n.length));
			continue;
		}
		let c = [];
		for (; r < t.length && t[r].trim() && !/^(\s*(```|~~~|>|[-*+]\s|\d+[.)]\s)|#{1,4}\s)/.test(t[r]);) c.push(t[r++]);
		c.length === 0 && c.push(t[r++]), n.push(/* @__PURE__ */ H("p", { children: $(c.join("\n")) }, n.length));
	}
	return n;
}
var _t = /(`[^`]+`)|(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*\s][^*]*\*|_[^_\s][^_]*_)|(\[[^\]]+\]\([^)\s]+\))|(\n)/g;
function $(e) {
	let t = [], n = 0;
	for (let r of e.matchAll(_t)) {
		r.index > n && t.push(e.slice(n, r.index));
		let [i] = r, a = t.length;
		if (r[1]) {
			let e = /* @__PURE__ */ H("code", {
				className: "rounded-xs bg-sunken px-1 py-px font-mono text-xs",
				children: i.slice(1, -1)
			}, a);
			t.push(vt(i.slice(1, -1)) === null ? e : /* @__PURE__ */ H(yt, {
				href: i.slice(1, -1),
				children: e
			}, a));
		} else if (r[2]) t.push(/* @__PURE__ */ H("strong", {
			className: "font-semibold text-ink",
			children: $(i.slice(2, -2))
		}, a));
		else if (r[3]) t.push(/* @__PURE__ */ H("em", { children: $(i.slice(1, -1)) }, a));
		else if (r[4]) {
			let [, e, n] = i.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
			t.push(/* @__PURE__ */ H(yt, {
				href: n,
				children: $(e)
			}, a));
		} else t.push(/* @__PURE__ */ H("br", {}, a));
		n = r.index + i.length;
	}
	return n < e.length && t.push(e.slice(n)), t;
}
function vt(e) {
	let t = e.trim();
	if (t.startsWith(`${r.base}/`) || t === r.base) return t.slice(r.base.length) || "/";
	if (!/^\/(?!\/)[^\s]*$/.test(t) || t.includes("..")) return null;
	let n = t.split(/[?#]/)[0];
	return [...p.routes.all().map((e) => e.path), ...(o().views ?? []).map((e) => e.path)].filter((e) => e !== "/" && !e.includes("*")).some((e) => c(e, n)) ? t : null;
}
function yt({ href: e, children: t }) {
	let n = vt(e), i = n !== null;
	return i || /^(https?:\/\/|\/(?!\/)|mailto:)/i.test(e) ? /* @__PURE__ */ H("a", {
		href: i ? r.base + (n === "/" ? "" : n) : e,
		target: i ? void 0 : "_blank",
		rel: i ? void 0 : "noopener noreferrer",
		className: "text-ink underline decoration-border-strong underline-offset-2 hover:decoration-ink",
		onClick: (e) => {
			!i || e.metaKey || e.ctrlKey || (e.preventDefault(), l(n));
		},
		children: t
	}) : /* @__PURE__ */ H(V, { children: t });
}
// admin/src/transcript.ts
var bt = 0, xt = () => `local-${++bt}`;
function St(e, t, n) {
	for (let r = e.length - 1; r >= 0; r--) {
		let i = e[r];
		if (i.role !== "answer") continue;
		let a = i.parts.findIndex((e) => e.type === "tool" && e.id === t);
		if (a >= 0) {
			let t = i.parts.slice();
			t[a] = {
				...t[a],
				...n
			};
			let o = e.slice();
			return o[r] = {
				...i,
				parts: t
			}, o;
		}
	}
	return e;
}
function Ct(e, t, n) {
	if (t === "tool_result") return St(e, n.id, {
		status: n.declined ? "declined" : n.ok ? "ok" : "error",
		...n.output === void 0 ? {} : { output: String(n.output).slice(0, 4e3) },
		...n.input === void 0 ? {} : { input: n.input },
		...n.surface ? { surface: n.surface } : {},
		...n.ability ? { ability: n.ability } : {}
	});
	if (t === "surface_used") return St(e, n.id, { used: !0 });
	let r = t === "text" || t === "thinking" ? {
		type: t,
		text: String(n.delta ?? "")
	} : t === "tool" ? {
		type: "tool",
		id: n.id,
		name: n.name,
		label: n.label ?? n.name,
		status: "running",
		...n.ability ? { ability: n.ability } : {}
	} : t === "notice" ? {
		type: "notice",
		tone: n.tone ?? "neutral",
		message: n.message ?? ""
	} : t === "view" ? {
		type: "view",
		view: n.view
	} : t === "surface" ? {
		type: "surface",
		surface: n.surface
	} : t === "approval" ? {
		type: "approval",
		calls: n.calls ?? []
	} : null;
	if (!r) return e;
	let i = e.slice(), a = i[i.length - 1];
	a?.role !== "answer" && (a = {
		id: xt(),
		role: "answer",
		parts: []
	}, i.push(a));
	let o = a.parts.slice(), s = o[o.length - 1];
	if ((r.type === "text" || r.type === "thinking") && s?.type === r.type ? o[o.length - 1] = {
		...s,
		text: s.text + r.text
	} : o.push(r), i[i.length - 1] = {
		...a,
		parts: o
	}, r.type === "approval") for (let e of r.calls) i = St(i, e.id, {
		status: "awaiting",
		input: e.input
	});
	return i;
}
function wt(e) {
	let t = e.findLast((e) => e.role !== "note");
	if (t?.role !== "answer") return [];
	let n = t.parts.findLast((e) => e.type === "approval");
	return n?.type === "approval" && !n.decided ? n.calls : [];
}
function Tt(e, t = !1, n = []) {
	let r = e.findLastIndex((e) => e.role === "answer"), i = e[r];
	if (i?.role !== "answer") return e;
	let a = i.parts.findLastIndex((e) => e.type === "approval" && !e.decided);
	if (a < 0) return e;
	let o = i.parts[a], s = e.slice();
	s[r] = {
		...i,
		parts: i.parts.map((e, t) => t === a ? {
			...o,
			decided: !0
		} : e)
	};
	for (let e of o.calls) s = St(s, e.id, { status: t || !n.includes(e.id) ? "declined" : "running" });
	return s;
}
var Et = (e) => e.parts.filter((e) => e.type === "text").map((e) => e.text).join("\n\n");
function Dt(e) {
	try {
		let t = JSON.parse(e ?? "");
		return t && typeof t.to == "string" && t.to.startsWith("/") && !t.to.startsWith("//") ? {
			to: t.to,
			label: typeof t.label == "string" ? t.label : t.to
		} : null;
	} catch {
		return null;
	}
}
// admin/src/useThread.ts
function Ot(e) {
	X.get().mode === "full" && X.set({ mode: "docked" }), l(e), window.matchMedia("(max-width: 767px)").matches && X.close();
}
function kt(t, n = 0) {
	let [r, o] = z([]), [c, l] = z(null), [u, d] = z(""), [p, g] = z(!1), [v, y] = z(!1), [b, x] = z(null), S = R(null), C = R(t), w = R(n);
	L(() => {
		if (t === C.current && n === w.current && (r.length || p) || (w.current = n, S.current?.abort(), S.current = null, g(!1), y(!1), C.current = t, o([]), d(""), l(null), x(null), !t)) return;
		let e = !1;
		return y(!0), m("threads/get", { id: t }).then((t) => {
			e || (o(t.turns), d(t.title), l(t.agent), X.set({ title: t.title }));
		}).catch((n) => {
			e || (n.status === 404 ? X.deleted(t) : x(n.message));
		}).finally(() => !e && y(!1)), () => {
			e = !0;
		};
	}, [t, n]), L(() => () => S.current?.abort(), []);
	let T = I(async (t, { shown: n, onAccepted: c, form: u = !1 } = {}) => {
		S.current?.abort();
		let p = new AbortController();
		S.current = p, g(!0), x(null);
		let m = {
			thread: C.current,
			title: X.get().title || String(t.message ?? t.search ?? n?.text ?? _("New Chat"))
		};
		X.set({ working: m }), n && o((e) => [...e, n]);
		let h = !1, v = !1, y = null, b = typeof t.message == "string", w = t.edit?.turn, T = b && (!r.some((e) => e.role === "answer" && e.agent) || w !== void 0 && r.find((e) => e.role === "user")?.id === w);
		try {
			t.edit && Qe(C.current);
			let e = b ? await Ze(C.current) : null;
			if (p.signal.aborted) return {
				message: "",
				details: {}
			};
			await i("workspace/turn", {
				thread: C.current,
				...t,
				...e ? {
					context: e.context,
					agent: X.get().options[C.current ?? "new"] ?? {}
				} : {}
			}, (t, n) => {
				if (!(p.signal.aborted || S.current !== p)) switch (t) {
					case "thread":
						C.current = n.id, e?.carry(n.id), m = {
							thread: n.id,
							title: n.title
						}, X.set({ working: m }), d(n.title), X.created(n.id, n.title), f.invalidateQueries({ queryKey: ["threads/list"] });
						break;
					case "turn": {
						let e = n.turn;
						e.role === "user" ? (v = !0, o((t) => {
							let n = e.replaces ? t.findIndex((t) => t.id === e.replaces) : t.findLastIndex((e) => e.role === "user" && e.pending);
							return n < 0 ? [...t, e] : [
								...t.slice(0, n),
								e,
								...e.replaces ? [] : t.slice(n + 1)
							];
						}), e.replaces && c?.()) : o((t) => [...t, e]);
						break;
					}
					case "error":
						y = {
							message: n.message,
							details: n.details ?? {}
						};
						break;
					case "done":
						d(n.thread.title), l(n.agent ?? null), X.set({ title: n.thread.title });
						break;
					default:
						if (t === "tool_result" && n.ok && n.ability === "admin/open") {
							let e = Dt(n.output);
							e && Ot(e.to);
						}
						t === "tool_result" && n.mutated && (h = !0, f.invalidateQueries(), a.emit("content.changed")), o((e) => Ct(e, t, n));
				}
			}, p.signal);
		} catch (t) {
			p.signal.aborted || (y = {
				message: t instanceof e || t instanceof Error ? t.message : _("Something went wrong."),
				details: t instanceof e ? t.details : {}
			});
		} finally {
			if (y && !v && o((e) => e.filter((e) => !(e.role === "user" && e.pending))), t.command && !y && (h = !0, f.invalidateQueries(), a.emit("content.changed")), h) try {
				await s();
			} catch {}
			X.get().working === m && X.set({ working: null }), S.current === p && (S.current = null, g(!1)), f.invalidateQueries({ queryKey: ["threads/list"] }), T && C.current && v && J() && E(C.current);
		}
		return y && !(u && Object.keys(y.details).length) && x(y.message), y ?? !0;
	}, [r]), E = async (e) => {
		try {
			let { title: t } = await m("threads/rename", { id: e });
			C.current === e && (d(t), X.set({ title: t })), f.invalidateQueries({ queryKey: ["threads/list"] });
		} catch {}
	}, D = (e, t, n = {}) => ({
		id: xt(),
		role: "user",
		kind: e,
		text: t,
		pending: !0,
		...n
	}), ee = I((e) => {
		let t = e.trim();
		if (!t) return;
		o((e) => Tt(e, !0));
		let n = X.get(), r = n.skills[C.current ?? "new"], i = J() ? [...Je(h.get(), n).map((e) => ({
			label: e.label,
			...e.kind ? { kind: e.kind } : {},
			...e.icon ? { icon: e.icon } : {},
			...e.to && /^\/[A-Za-z0-9/_.-]{0,199}$/.test(e.to) ? { to: e.to } : {}
		})), ...r ? [{
			kind: "skill",
			label: r.label,
			...r.icon ? { icon: r.icon } : {}
		}] : []] : [];
		T(J() ? { message: t } : { search: t }, { shown: D(J() ? "message" : "search", t, i.length ? { attached: i } : {}) });
	}, [T]), te = I((e) => {
		let t = e.trim();
		t && (o((e) => Tt(e, !0)), T({ search: t }, { shown: D("search", t) }));
	}, [T]), O = I((e, t, n, r = !1, i) => T({ command: {
		ability: e,
		input: t,
		label: n,
		...i ? { detail: i } : {}
	} }, {
		shown: D("command", n, { command: {
			ability: e,
			label: n,
			input: t,
			...i ? { detail: i } : {}
		} }),
		form: r
	}), [T]), k = I(async (e, t, n) => {
		if (S.current || v || !C.current || e.pending || !t.trim()) return !1;
		let r = J() && e.kind === "message" ? { message: t.trim() } : { search: t.trim() };
		return await T({
			...r,
			edit: {
				turn: e.id,
				original: e.text
			}
		}, { onAccepted: n }) === !0;
	}, [v, T]), A = I((e) => {
		o((t) => Tt(t, !1, e)), T({ approve: e });
	}, [T]), j = I(() => {
		S.current?.abort(), S.current = null, g(!1), X.set({ working: null }), o((e) => [...e.filter((e) => !(e.role === "user" && e.pending)), {
			id: xt(),
			role: "note",
			text: _("Stopped. The step in progress still finishes on the server."),
			tone: "neutral"
		}]);
	}, []), M = I((e, t) => {
		if (S.current || wt(r).length || !C.current || v) return;
		let n = r.flatMap((e) => e.role === "answer" ? e.parts : []).find((t) => t.type === "tool" && t.id === e);
		n?.type === "tool" && n.surface && !n.used && T({ action: {
			tool: e,
			...t
		} }, { shown: D("action", _("Selected an action in “{title}”.", { title: n.surface.title })) });
	}, [
		r,
		v,
		T
	]);
	return {
		renamed: I((e) => {
			d(e), X.set({ title: e });
		}, []),
		turns: r,
		awaiting: wt(r),
		state: c,
		title: u,
		busy: p,
		loading: v,
		error: b,
		send: ee,
		search: te,
		command: O,
		edit: k,
		decide: A,
		stop: j,
		interact: M,
		dismissError: () => x(null)
	};
}
// admin/src/Panel.tsx
var At = le({}), jt = window.matchMedia("(min-width: 1024px)"), Mt = () => B((e) => (jt.addEventListener("change", e), () => jt.removeEventListener("change", e)), () => jt.matches);
function Nt() {
	F("mod+j", _("Chat"));
	let { path: e } = b(), { mode: t, title: n } = Z(), r = Ee(), i = Se(e);
	return fe(() => {
		let t = X.get();
		i === void 0 ? (e !== t.contextPath && X.set({
			contextPath: e,
			dismissed: [],
			selectedText: ""
		}), t.mode === "full" && X.set({ mode: "docked" })) : X.set({
			mode: "full",
			history: !1,
			...t.thread === i ? {} : {
				thread: i,
				prompt: null
			}
		});
	}, [e, i]), /* @__PURE__ */ H(w, {
		open: t !== "closed",
		full: t === "full",
		floating: r.chosen || r.required,
		label: n || _("New Chat"),
		children: /* @__PURE__ */ H(Pt, {
			open: t !== "closed",
			full: t === "full"
		})
	});
}
function Pt({ open: t, full: n }) {
	let { thread: r, fresh: i, prompt: a, searching: o, drafts: s, options: c, focus: l, history: u, skills: f, commands: m } = Z();
	x(), B(p.panels.subscribe, p.panels.version);
	let h = Ee(), g = Mt(), v = B((e) => {
		let t = window.matchMedia("(min-width: 768px)");
		return t.addEventListener("change", e), () => t.removeEventListener("change", e);
	}, () => window.matchMedia("(min-width: 768px)").matches), b = n && g, S = kt(r, i), C = J();
	L(() => X.set({ awaiting: S.awaiting.length > 0 }), [S.awaiting.length]);
	let w = y("threads/delete", {
		invalidates: ["threads/list"],
		onSuccess: (e, { id: t }) => {
			X.deleted(t), se.success(_("Chat deleted"));
		},
		onError: se.error
	}), T = r ?? "new", E = s[T] ?? "", [O, k] = z(0), [A, M] = z(null), [ne, re] = z(!1);
	L(() => re(!1), [r]);
	let ae = R(null), F = R(!0);
	L(() => {
		!t || !a || S.busy || S.loading || w.isPending || A !== null || (X.set({
			prompt: null,
			searching: !1
		}), o ? S.search(a) : S.send(a));
	}, [
		t,
		a,
		o,
		S,
		w.isPending,
		A
	]);
	let ce = R(l);
	L(() => {
		F.current = !0, M(null);
		let e = ce.current !== l;
		ce.current = l, t && (e || !et()) && k((e) => e + 1);
	}, [
		r,
		t,
		l
	]), fe(() => {
		let e = ae.current;
		t && e && F.current && (e.scrollTop = e.scrollHeight);
	});
	let le = f[T], I = !!E.trim() || !!le, ue = S.busy || S.loading || w.isPending || A !== null, de = () => {
		I && !ue && (F.current = !0, S.send(E.trim() || le.label), X.draft(""));
	}, pe = (e, t, n, r) => (F.current = !0, S.command(e.command.ability, t, e.label, n, r)), me = async (t, n, r) => {
		F.current = !0;
		let i = await S.command(t, n, r.label, !1);
		if (i !== !0) throw new e(i.message, "invalid_input", 422, i.details);
		return i;
	}, he = (e, t) => {
		let n = oe(e.form, t);
		X.command({
			values: {},
			option: {
				id: `ask:${e.ability}:${Date.now()}`,
				label: n.title,
				icon: e.icon,
				command: {
					ability: e.ability,
					input: e.input ?? {},
					scope: t,
					confirm: n.confirm ?? e.label,
					load: async () => ({
						fields: n.fields,
						values: n.values ?? {}
					})
				}
			}
		});
	}, W = /* @__PURE__ */ new Map();
	for (let e of S.turns) if (e.role === "answer") for (let t of e.parts) t.type === "tool" && t.surface && t.status === "ok" && W.set(t.surface.id, t.id);
	let ge = {
		disabled: S.busy || S.loading || S.awaiting.length > 0 || A !== null,
		onAction: S.interact,
		surfaces: W
	}, _e = async () => {
		!r || S.busy || S.loading || w.isPending || await ie({
			title: _("Delete “{title}”?", { title: S.title || _("New Chat") }),
			description: _("This chat and its messages will be permanently deleted."),
			confirm: _("Delete Chat"),
			danger: !0
		}) && w.mutate({ id: r });
	}, G = !S.loading && !S.turns.length, K = S.title || _("Chat"), q = u && !b, ve = {
		thread: r,
		agent: C,
		state: S.state,
		options: c[T] ?? {},
		setOption: X.option,
		busy: S.busy,
		loading: S.loading
	}, ye = d("workspace.composer", ve);
	return /* @__PURE__ */ U("div", {
		className: "cms-thread flex h-full min-h-0",
		"data-full": n || void 0,
		onKeyDown: (e) => {
			e.key !== "Escape" || e.defaultPrevented || document.querySelector("[role=\"dialog\"], [role=\"alertdialog\"], [role=\"menu\"], [role=\"listbox\"]") || (q ? X.set({ history: !1 }) : n ? X.minimize() : X.close());
		},
		children: [b && /* @__PURE__ */ U("div", {
			className: "flex w-[260px] shrink-0 flex-col border-r border-border",
			children: [/* @__PURE__ */ U("div", {
				className: "flex h-12 shrink-0 items-center justify-between pl-[calc(1rem+var(--cms-sidebar-toggle,0px))] pr-2",
				children: [/* @__PURE__ */ H("h2", {
					className: "m-0 text-sm font-semibold text-ink",
					children: _("Chats")
				}), /* @__PURE__ */ H(mt, {})]
			}), /* @__PURE__ */ H(pt, {})]
		}), /* @__PURE__ */ U("section", {
			"aria-label": K,
			"data-empty": n && G || void 0,
			className: "cms-thread-page relative flex min-w-0 flex-1 flex-col",
			children: [/* @__PURE__ */ U("header", {
				"data-dock-drag": !0,
				className: P("flex h-12 shrink-0 items-center gap-0.5 border-b border-border pr-2", n && !b ? "pl-[calc(0.75rem+var(--cms-sidebar-toggle,0px))]" : "pl-3"),
				children: [
					q && /* @__PURE__ */ H(N, {
						content: _("Back to Chat"),
						side: "bottom",
						children: /* @__PURE__ */ H(D, {
							icon: "arrow-left",
							label: _("Back to Chat"),
							title: void 0,
							className: "-ml-1 mr-0.5",
							onClick: () => X.set({ history: !1 })
						})
					}),
					ne && r && !q ? /* @__PURE__ */ H(ct, {
						id: r,
						title: K,
						onDone: (e) => {
							re(!1), e && S.renamed(e);
						}
					}) : /* @__PURE__ */ H("h2", {
						className: "m-0 min-w-0 flex-1 truncate text-sm font-medium text-ink",
						children: q ? _("Chats") : K
					}),
					!b && (r || !G || q) && /* @__PURE__ */ H(mt, {}),
					!b && r && !q && /* @__PURE__ */ H(N, {
						content: _("All Chats"),
						side: "bottom",
						children: /* @__PURE__ */ H(D, {
							icon: "history",
							label: _("All Chats"),
							title: void 0,
							onClick: () => X.set({
								history: !0,
								focusList: (X.get().focusList ?? 0) + 1
							})
						})
					}),
					r && !q && /* @__PURE__ */ H(ee, {
						trigger: /* @__PURE__ */ H(D, {
							icon: "more",
							label: _("Chat Actions"),
							disabled: w.isPending
						}),
						items: [{
							label: _("Rename Chat"),
							icon: "edit",
							disabled: S.loading,
							onSelect: () => re(!0)
						}, {
							label: _("Delete Chat"),
							icon: "trash",
							danger: !0,
							disabled: S.busy || S.loading || w.isPending,
							onSelect: _e
						}]
					}),
					v && !n && !h.required && /* @__PURE__ */ H(N, {
						content: h.chosen ? _("Dock Beside the Page") : _("Detach"),
						side: "bottom",
						children: /* @__PURE__ */ H(D, {
							icon: h.chosen ? "sidebar" : "detach",
							label: h.chosen ? _("Dock Beside the Page") : _("Detach"),
							title: void 0,
							onClick: () => X.set({ detached: !h.chosen })
						})
					}),
					v && /* @__PURE__ */ H(N, {
						content: _(n ? "Back to the Page" : "Full Size"),
						side: "bottom",
						children: /* @__PURE__ */ H(D, {
							icon: n ? "minimize" : "maximize",
							label: _(n ? "Back to the Page" : "Full Size"),
							title: void 0,
							onClick: () => n ? X.minimize() : X.maximize()
						})
					}),
					!n && /* @__PURE__ */ H(N, {
						content: _("Close"),
						shortcut: "mod+j",
						side: "bottom",
						children: /* @__PURE__ */ H(D, {
							icon: "close",
							label: _("Close"),
							title: void 0,
							onClick: () => X.close()
						})
					})
				]
			}), q ? /* @__PURE__ */ H(pt, {}) : /* @__PURE__ */ U(V, { children: [
				G && !b && /* @__PURE__ */ H(pt, {}),
				/* @__PURE__ */ H("div", {
					ref: ae,
					onScroll: (e) => {
						let t = e.currentTarget;
						F.current = t.scrollHeight - t.scrollTop - t.clientHeight < 48;
					},
					className: P("cms-thread-scroll min-h-0 overflow-y-auto overscroll-contain", G && !b ? "shrink-0" : "flex-1"),
					children: S.loading ? /* @__PURE__ */ H("div", {
						className: "grid h-full place-items-center text-faint",
						children: /* @__PURE__ */ H(j, {})
					}) : S.turns.length === 0 ? /* @__PURE__ */ H(Ft, { asking: !!C }) : /* @__PURE__ */ H(At.Provider, {
						value: {
							run: me,
							ask: he
						},
						children: /* @__PURE__ */ U("div", {
							className: "cms-thread-turns cms-thread-width space-y-6 py-5",
							children: [S.turns.map((e, t) => /* @__PURE__ */ H(It, {
								turn: e,
								...ge,
								editing: A === t,
								onEditingChange: (e) => {
									X.get().thread === r && M((n) => e ? t : n === t ? null : n);
								},
								editingDisabled: S.busy || S.loading || w.isPending,
								onEdit: S.edit
							}, `${r}:${e.id}`)), S.busy && /* @__PURE__ */ H(Xt, { turns: S.turns })]
						})
					})
				}),
				S.error && /* @__PURE__ */ H("div", {
					className: "cms-thread-width w-full shrink-0 pb-2",
					children: /* @__PURE__ */ H(te, {
						tone: "danger",
						onDismiss: S.dismissError,
						children: S.error
					})
				}),
				S.awaiting.length > 0 && A === null && /* @__PURE__ */ H(Jt, {
					calls: S.awaiting,
					onDecide: S.decide
				}),
				/* @__PURE__ */ H("div", {
					className: "cms-thread-footer cms-thread-width w-full shrink-0",
					children: /* @__PURE__ */ H(st, {
						placeholder: S.awaiting.length ? _("Or say what to do instead…") : _(C ? "Ask anything, or / for a command" : "Search, or / for a command"),
						focus: O,
						busy: ue,
						onSubmit: de,
						onCommand: pe,
						children: /* @__PURE__ */ U("div", {
							className: "flex items-center gap-2 px-2 pb-2",
							children: [/* @__PURE__ */ H("div", {
								className: "flex min-w-0 flex-1 items-center",
								children: ye.map(({ id: e, component: t }) => /* @__PURE__ */ H(t, { ...ve }, e))
							}), S.busy && C ? /* @__PURE__ */ H(D, {
								icon: "stop",
								label: _("Stop"),
								variant: "secondary",
								onClick: S.stop
							}) : /* @__PURE__ */ H(D, {
								icon: "arrow-up",
								label: _(C ? "Send" : "Search"),
								variant: "primary",
								onClick: de,
								disabled: !I || ue || !!m[T]
							})]
						})
					})
				})
			] })]
		})]
	});
}
function Ft({ asking: e }) {
	return /* @__PURE__ */ H("div", {
		className: "cms-thread-welcome cms-thread-width flex min-h-full flex-col justify-end pb-3 pt-2",
		children: /* @__PURE__ */ H("h2", {
			className: "cms-thread-greeting m-0 font-semibold tracking-[-0.02em] text-ink",
			children: _(e ? "What should we work on?" : "What are you looking for?")
		})
	});
}
function It({ turn: e, editing: t, onEditingChange: n, editingDisabled: r, onEdit: i, ...a }) {
	return e.role === "note" ? /* @__PURE__ */ U("p", {
		className: P("m-0 flex items-center gap-1.5 text-xs", e.tone === "warning" ? "text-warning" : "text-faint"),
		children: [
			/* @__PURE__ */ H(E, {
				name: e.tone === "warning" ? "warning" : "info",
				size: 13
			}),
			" ",
			e.text
		]
	}) : e.role === "user" ? /* @__PURE__ */ H(Lt, {
		turn: e,
		editing: t,
		onEditingChange: n,
		editingDisabled: r,
		onEdit: i
	}) : /* @__PURE__ */ H(Bt, {
		turn: e,
		...a
	});
}
function Lt({ turn: e, editing: t, onEditingChange: n, editingDisabled: r, onEdit: i }) {
	let [a, o] = z(""), s = R(null), c = () => {
		n(!1), requestAnimationFrame(() => s.current?.focus());
	}, l = async () => {
		!r && a.trim() && a.trim() !== e.text && await i(e, a, c);
	};
	if (e.kind === "action") return /* @__PURE__ */ H("p", {
		className: "m-0 text-right text-xs text-faint",
		children: e.text
	});
	let u = !e.pending && (e.kind === "message" || e.kind === "search");
	return /* @__PURE__ */ U("div", {
		className: "cms-thread-message flex flex-col items-end gap-1",
		children: [
			e.attached && e.attached.length > 0 && !t && /* @__PURE__ */ H(Vt, { items: e.attached }),
			t ? /* @__PURE__ */ U("form", {
				className: "cms-thread-message-editor w-full rounded-xl border border-border-strong bg-surface p-3",
				onSubmit: (e) => {
					e.preventDefault(), l();
				},
				children: [/* @__PURE__ */ H(ne, {
					autoFocus: !0,
					"aria-label": _("Edit message"),
					value: a,
					onChange: (e) => o(e.target.value),
					maxLength: 2e4,
					disabled: r,
					rows: 2,
					className: "max-h-52 resize-none",
					onKeyDown: (e) => {
						e.nativeEvent.isComposing || (e.key === "Escape" && (e.preventDefault(), c()), e.key === "Enter" && !e.shiftKey && (e.preventDefault(), l()));
					}
				}), /* @__PURE__ */ U("div", {
					className: "mt-2 flex justify-end gap-2",
					children: [/* @__PURE__ */ H(C, {
						size: "sm",
						variant: "ghost",
						disabled: r,
						onClick: c,
						children: _("Cancel")
					}), /* @__PURE__ */ H(C, {
						type: "submit",
						size: "sm",
						variant: "primary",
						disabled: r || !a.trim() || a.trim() === e.text,
						children: _("Save & Send")
					})]
				})]
			}) : e.kind === "command" ? /* @__PURE__ */ U("div", {
				className: "cms-thread-bubble flex max-w-[85%] items-baseline gap-1.5 rounded-xl px-3.5 py-2 text-sm text-text",
				children: [
					/* @__PURE__ */ H("span", {
						className: "shrink-0 font-mono text-xs text-faint",
						children: "/"
					}),
					/* @__PURE__ */ H("span", {
						className: "shrink-0 font-medium",
						children: e.text
					}),
					(e.command?.detail ?? zt(e)) && /* @__PURE__ */ H("span", {
						className: "min-w-0 truncate text-muted",
						children: e.command?.detail ?? zt(e)
					})
				]
			}) : /* @__PURE__ */ U("div", {
				className: "cms-thread-bubble max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-3.5 py-2 text-sm text-text",
				children: [e.kind === "search" && /* @__PURE__ */ H(E, {
					name: "search",
					size: 13,
					className: "-mt-0.5 mr-1.5 inline-block text-faint"
				}), e.text]
			}),
			!t && /* @__PURE__ */ U("div", {
				className: "cms-thread-message-actions flex items-center gap-0.5",
				children: [e.kind !== "command" && /* @__PURE__ */ H(Ht, { text: e.text }), u && /* @__PURE__ */ H(N, {
					content: _("Edit message"),
					children: /* @__PURE__ */ H(D, {
						ref: s,
						icon: "edit",
						label: _("Edit message"),
						title: void 0,
						disabled: r,
						onClick: () => {
							o(e.text), n(!0);
						}
					})
				})]
			})
		]
	});
}
var Rt = /* @__PURE__ */ new Set([
	"collection",
	"namespace",
	"handle",
	"id",
	"entry",
	"locale",
	"parentId",
	"status"
]);
function zt(e) {
	return Object.entries(e.command?.input ?? {}).filter(([e]) => !Rt.has(e)).map(([, e]) => e).filter((e) => typeof e == "string" && e.length > 0 && e.length < 80 && !/^[0-9a-hjkmnp-tv-z]{26}$/i.test(e) || typeof e == "number").slice(0, 3).join(" · ");
}
function Bt({ turn: e, ...t }) {
	let n = Et(e);
	return /* @__PURE__ */ U("div", {
		className: "cms-thread-message space-y-2",
		children: [e.parts.map((e, n) => /* @__PURE__ */ H(Ut, {
			part: e,
			...t
		}, e.type === "tool" ? e.id : n)), n.trim() && /* @__PURE__ */ H("div", {
			className: "cms-thread-message-actions flex items-center",
			children: /* @__PURE__ */ H(Ht, { text: n })
		})]
	});
}
function Vt({ items: e }) {
	return /* @__PURE__ */ H("div", {
		className: "flex max-w-[85%] flex-wrap justify-end gap-x-2 gap-y-0.5",
		children: e.map((e, n) => {
			let r = /* @__PURE__ */ U(V, { children: [/* @__PURE__ */ H(E, {
				name: e.icon ?? "file",
				size: 11,
				className: "shrink-0"
			}), /* @__PURE__ */ H("span", {
				className: "truncate",
				children: e.label
			})] }), i = "flex min-w-0 max-w-full items-center gap-1 rounded-xs text-xs text-faint no-underline";
			return e.to ? /* @__PURE__ */ H(t, {
				to: e.to,
				className: P(i, "hover:text-muted"),
				children: r
			}, n) : /* @__PURE__ */ H("span", {
				className: i,
				children: r
			}, n);
		})
	});
}
function Ht({ text: e }) {
	let [t, n] = z(!1);
	L(() => {
		if (!t) return;
		let e = window.setTimeout(() => n(!1), 2e3);
		return () => window.clearTimeout(e);
	}, [t]);
	let r = _(t ? "Copied" : "Copy message");
	return /* @__PURE__ */ U(V, { children: [/* @__PURE__ */ H(N, {
		content: r,
		children: /* @__PURE__ */ H(D, {
			icon: t ? "check" : "copy",
			label: r,
			title: void 0,
			onClick: async () => {
				await ae(e, { failed: _("Could not copy the message. Try again.") }) && n(!0);
			}
		})
	}), /* @__PURE__ */ H("span", {
		role: "status",
		className: "sr-only",
		children: t ? _("Message copied") : ""
	})] });
}
function Ut({ part: e, disabled: t, onAction: r, surfaces: i }) {
	let { run: a, ask: o } = ue(At);
	if (e.type === "text") return /* @__PURE__ */ H(ht, { text: e.text });
	if (e.type === "thinking") return /* @__PURE__ */ H(Wt, { text: e.text });
	if (e.type === "view") return /* @__PURE__ */ H("div", {
		className: "cms-thread-view min-w-0",
		children: /* @__PURE__ */ H(re, {
			root: e.view,
			embedded: !0,
			run: a,
			ask: o
		})
	});
	if (e.type === "surface") return /* @__PURE__ */ H(M, {
		document: e.surface,
		disabled: !0
	});
	if (e.type === "notice") return /* @__PURE__ */ U("p", {
		className: P("m-0 flex items-center gap-1.5 text-xs", e.tone === "warning" || e.tone === "danger" ? "text-warning" : "text-faint"),
		children: [
			/* @__PURE__ */ H(E, {
				name: e.tone === "warning" || e.tone === "danger" ? "warning" : "info",
				size: 13
			}),
			" ",
			e.message
		]
	});
	if (e.type === "approval") return null;
	if (e.ability === "admin/open" && e.status === "ok") {
		let t = Dt(e.output);
		if (t) return /* @__PURE__ */ U("p", {
			className: "m-0 flex min-h-8 items-center gap-1.5 text-xs text-faint",
			children: [
				/* @__PURE__ */ H(E, {
					name: "arrow-right",
					size: 13,
					className: "shrink-0"
				}),
				/* @__PURE__ */ H("span", {
					className: "shrink-0",
					children: _("Opened")
				}),
				/* @__PURE__ */ H("a", {
					href: n(t.to),
					onClick: (e) => {
						e.metaKey || e.ctrlKey || (e.preventDefault(), Ot(t.to));
					},
					className: "min-w-0 truncate text-muted underline decoration-border-strong underline-offset-2 hover:text-text",
					children: t.label
				})
			]
		});
	}
	return e.surface && e.status === "ok" ? i.get(e.surface.id) === e.id ? /* @__PURE__ */ H(M, {
		document: e.surface,
		disabled: t || e.used,
		onAction: (t) => r(e.id, t)
	}) : null : /* @__PURE__ */ H(Kt, { part: e });
}
function Wt({ text: e }) {
	let [t, n] = z(!1);
	return /* @__PURE__ */ U("div", { children: [/* @__PURE__ */ U(C, {
		variant: "ghost",
		size: "xs",
		onClick: () => n(!t),
		className: "-ml-1.5 !px-1.5 !font-normal !text-faint hover:!text-muted",
		"aria-expanded": t,
		children: [
			/* @__PURE__ */ H(E, {
				name: t ? "chevron-down" : "chevron-right",
				size: 11
			}),
			" ",
			_("Thought Process")
		]
	}), t && /* @__PURE__ */ H("p", {
		className: "m-0 mt-1.5 whitespace-pre-wrap border-l border-border pl-3 text-xs leading-relaxed text-muted",
		children: e
	})] });
}
var Gt = {
	ok: "check",
	error: "x-circle",
	declined: "minus",
	awaiting: "pause"
};
function Kt({ part: e }) {
	let [t, n] = z(!1), r = Zt(e.input) || $t(e.input);
	return /* @__PURE__ */ U("div", {
		className: "rounded-sm border border-border",
		children: [/* @__PURE__ */ U(C, {
			variant: "ghost",
			size: "md",
			onClick: () => n(!t),
			"aria-expanded": t,
			className: "w-full !justify-start !gap-2 !rounded-none !px-2.5 !text-xs !font-normal",
			children: [
				e.status === "running" ? /* @__PURE__ */ H(j, { size: 12 }) : /* @__PURE__ */ H(E, {
					name: Gt[e.status],
					size: 13,
					className: P(e.status === "ok" ? "text-success" : e.status === "error" ? "text-danger" : "text-faint")
				}),
				/* @__PURE__ */ H("span", {
					className: P("shrink-0 font-medium", e.status === "declined" ? "text-faint line-through" : "text-text"),
					children: e.label
				}),
				r && /* @__PURE__ */ H("span", {
					className: "min-w-0 flex-1 truncate text-faint",
					children: r
				}),
				/* @__PURE__ */ H(E, {
					name: t ? "chevron-down" : "chevron-right",
					size: 11,
					className: "ml-auto shrink-0 text-faint"
				})
			]
		}), t && /* @__PURE__ */ U("div", {
			className: "space-y-2 border-t border-border bg-surface px-2.5 py-2",
			children: [e.input !== void 0 && /* @__PURE__ */ H(qt, {
				label: _("Input"),
				value: JSON.stringify(e.input, null, 2)
			}), e.output && /* @__PURE__ */ H(qt, {
				label: e.status === "error" ? _("Error") : _("Result"),
				value: en(e.output)
			})]
		})]
	});
}
function qt({ label: e, value: t }) {
	return /* @__PURE__ */ U("div", { children: [/* @__PURE__ */ H("div", {
		className: "cms-label mb-1",
		children: e
	}), /* @__PURE__ */ H("pre", {
		className: "m-0 max-h-56 overflow-auto whitespace-pre-wrap break-all font-mono text-2xs leading-relaxed text-muted",
		children: t
	})] });
}
function Jt({ calls: e, onDecide: t }) {
	let n = e.some((e) => e.destructive);
	return /* @__PURE__ */ H("div", {
		className: "cms-thread-width w-full shrink-0 pb-2",
		children: /* @__PURE__ */ U("div", {
			className: "flex max-h-[40dvh] flex-col gap-2.5 overflow-y-auto rounded-xl border border-border-strong bg-surface p-3 shadow-sm",
			children: [
				/* @__PURE__ */ U("p", {
					className: "m-0 flex items-center gap-1.5 text-sm font-medium text-ink",
					children: [
						/* @__PURE__ */ H(E, {
							name: "shield",
							size: 14
						}),
						" ",
						e.length === 1 ? _("Allow this action?") : _("Allow these {count} actions?", { count: e.length })
					]
				}),
				/* @__PURE__ */ H("ul", {
					className: "m-0 flex list-none flex-col gap-2 p-0",
					children: e.map((e) => /* @__PURE__ */ H(Yt, { call: e }, e.id))
				}),
				e.some((e) => e.untrusted) && /* @__PURE__ */ H("p", {
					className: "m-0 text-xs text-muted",
					children: _("After reading site content")
				}),
				/* @__PURE__ */ U("div", {
					className: "flex justify-end gap-1.5",
					children: [/* @__PURE__ */ H(C, {
						size: "sm",
						variant: "ghost",
						onClick: () => t([]),
						autoFocus: !0,
						children: _("Decline")
					}), /* @__PURE__ */ H(C, {
						size: "sm",
						variant: n ? "danger" : "primary",
						onClick: () => t(e.map((e) => e.id)),
						children: e.length === 1 ? e[0].label : _("Allow All")
					})]
				})
			]
		})
	});
}
function Yt({ call: e }) {
	let [t, n] = z(!1), r = Zt(e.input), i = Qt(e.input);
	return /* @__PURE__ */ U("li", {
		className: "flex gap-2",
		children: [/* @__PURE__ */ H(E, {
			name: e.destructive ? "trash" : "edit",
			size: 13,
			className: P("mt-[3px] shrink-0", e.destructive ? "text-danger" : "text-muted")
		}), /* @__PURE__ */ U("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ H("p", {
					className: "m-0 text-sm text-text",
					children: r || e.label
				}),
				/* @__PURE__ */ U(C, {
					variant: "ghost",
					size: "xs",
					onClick: () => n(!t),
					"aria-expanded": t,
					className: "-ml-1.5 !px-1.5 !font-normal !text-faint hover:!text-muted",
					children: [r ? e.label : _("Details"), /* @__PURE__ */ H(E, {
						name: t ? "chevron-down" : "chevron-right",
						size: 11
					})]
				}),
				t && /* @__PURE__ */ H("dl", {
					className: "mx-0 mb-0 mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-l border-border pl-2.5 text-xs",
					children: i.map(([e, t]) => /* @__PURE__ */ U(ce, { children: [/* @__PURE__ */ H("dt", {
						className: "font-mono text-2xs leading-5 text-faint",
						children: e
					}), /* @__PURE__ */ H("dd", {
						className: "m-0 line-clamp-3 min-w-0 break-words text-muted",
						children: t
					})] }, e))
				})
			]
		})]
	});
}
function Xt({ turns: e }) {
	let t = e[e.length - 1], n = t?.role === "answer" ? t.parts[t.parts.length - 1] : void 0;
	return n?.type === "text" || n?.type === "view" || n?.type === "tool" && n.status === "running" ? null : /* @__PURE__ */ U("p", {
		className: "m-0 flex items-center gap-2 text-xs text-faint",
		children: [
			/* @__PURE__ */ H(j, { size: 12 }),
			" ",
			_("Working…")
		]
	});
}
function Zt(e) {
	let t = e && typeof e == "object" ? e.change_summary : void 0;
	return typeof t == "string" ? t.trim() : "";
}
function Qt(e) {
	return !e || typeof e != "object" ? [] : Object.entries(e).filter(([e, t]) => e !== "change_summary" && t != null && t !== "").map(([e, t]) => [e, (typeof t == "string" ? t : JSON.stringify(t)).slice(0, 300)]);
}
function $t(e) {
	if (!e || typeof e != "object") return "";
	let t = e;
	for (let e of [
		"title",
		"name",
		"query",
		"q",
		"uri",
		"collection",
		"handle",
		"to",
		"id"
	]) if (typeof t[e] == "string" && t[e]) return String(t[e]).slice(0, 80);
	return "";
}
function en(e) {
	try {
		return JSON.stringify(JSON.parse(e), null, 2);
	} catch {
		return e;
	}
}
p.panels.set("workspace", {
	slot: "shell.dock",
	component: Nt
}), p.panels.set("workspace-toggle", {
	slot: "topbar.end",
	component: De
}), p.panels.set("workspace-new-chat", {
	slot: "sidebar.start",
	component: Ue
}), p.entryActions.set("workspace-chat", {
	label: _("Chat"),
	icon: "comment",
	order: 0,
	when: () => window.matchMedia("(max-width: 639px)").matches,
	perform: () => X.open()
}), p.routes.set("/chat/:id", {
	path: "/chat/:id",
	component: () => null,
	overlay: !0
}), p.commands.set("workspace", {
	label: _("New Chat"),
	icon: "compose",
	group: _("Chat"),
	get keywords() {
		return [
			"chat",
			"thread",
			"command",
			"run",
			...J() ? [
				"ai",
				"ask",
				"help",
				"write",
				"build"
			] : []
		];
	},
	shortcut: "mod+j",
	get acceptsQuery() {
		return J() !== null;
	},
	perform: (e) => X.ask(e)
}), window.addEventListener("keydown", (e) => {
	(e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "j" && (e.preventDefault(), X.toggle());
});
