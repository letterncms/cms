import { CmsError as e, can as t, invalidate as n, run as r, setQuery as i, t as a, useAbility as o, useLocation as s } from "@letterncms/sdk";
import { useEffect as c, useMemo as l, useRef as u, useState as d } from "react";
import { Button as f, CodeEditor as p, EmptyState as m, FileTree as h, Icon as g, IconButton as _, Menu as v, NotFoundState as y, Notice as b, Pressable as x, QueryError as S, ResizeHandle as C, SaveBar as w, Skeleton as T, Spinner as E, TextDiff as D, Topbar as O, UndoRedo as k, VersionDialog as A, VersionsButton as j, cn as M, confirm as N, formatCode as P, formats as ee, prompt as F, textsDiffer as I, toast as L, useShortcut as R, useVersion as z } from "@letterncms/ui";
import { Stylesheet as te, balanced as ne } from "@letterncms/blocks";
import { Fragment as re, jsx as B, jsxs as V } from "react/jsx-runtime";
// admin/src/code/documents.ts
var H = {
	scripts: "js",
	styles: "css"
}, ie = {
	scripts: "export function mount(el, props) {\n}\n",
	styles: "\n"
}, U = (e) => /^(scripts|styles)\//.test(e);
function W(e) {
	if (e === "css") return {
		id: e,
		title: "theme.css",
		icon: "file-css",
		language: "tailwind"
	};
	if (e === "js") return {
		id: e,
		title: "custom.js",
		icon: "file-js",
		language: "javascript"
	};
	if (e.startsWith("library:")) return {
		id: e,
		title: e.slice(8),
		icon: "box",
		library: e.slice(8)
	};
	let t = e.endsWith(".css");
	return {
		id: e,
		title: e.split("/").pop() ?? e,
		icon: t ? "file-css" : "file-js",
		language: t ? "css" : "javascript"
	};
}
function ae(e) {
	return e === "css" ? {
		kind: "styling",
		subject: "theme"
	} : e === "js" ? {
		kind: "code",
		subject: "custom.js"
	} : U(e) ? {
		kind: "code",
		subject: e
	} : null;
}
var oe = (e) => e === "tailwind" ? a("Tailwind CSS") : e === "css" ? "CSS" : e === "javascript" ? "JavaScript" : "";
function se(t, i) {
	let [o, s] = d({}), [c, u] = d({}), [f, p] = d(!1), [m, h] = d(null), g = l(() => t ? new te(t.css).extra() : void 0, [t?.css]), _ = (e) => e === "css" ? g : e === "js" ? t?.js : c[e], v = (e) => o[e] ?? _(e), y = (e) => o[e] !== void 0 && o[e] !== _(e), b = Object.keys(o).filter(y), x = (e, t) => s((n) => ({
		...n,
		[e]: t
	})), S = (e, t) => u((n) => n[e] === t ? n : {
		...n,
		[e]: t
	}), C = (e) => {
		s(({ [e]: t, ...n }) => n), u(({ [e]: t, ...n }) => n);
	}, w = () => {
		s({}), h(null);
	}, T = async (e) => {
		let t = v(e) ?? "";
		try {
			return { text: await P(t, W(e).language) };
		} catch (e) {
			let n = e instanceof Error ? e.message.split("\n")[0] : String(e), r = n.match(/\((\d+):(\d+)\)/);
			return {
				text: t,
				mistake: {
					message: n.replace(/\s*\(\d+:\d+\)\s*$/, ""),
					line: r ? Number(r[1]) : void 0,
					column: r ? Number(r[2]) : void 0
				}
			};
		}
	};
	return {
		text: v,
		base: _,
		isDirty: y,
		dirtyIds: b,
		edit: x,
		loaded: S,
		forget: C,
		discard: w,
		format: T,
		save: async () => {
			if (!t || f || b.length === 0) return null;
			p(!0), h(null);
			let o = [], c = {};
			for (let e of b) {
				let t = await T(e);
				c[e] = t.text, t.mistake && o.push({
					id: e,
					...t.mistake
				});
			}
			s((e) => ({
				...e,
				...c
			}));
			try {
				if (c.css !== void 0) {
					if (!ne(c.css)) throw new e(a("A brace in the site’s CSS is never closed."), "invalid_input");
					await r("styling/update", { css: new te(t.css).setExtra(c.css).css });
				}
				c.js !== void 0 && await r("styling-code/set-custom", { js: c.js });
				for (let [e, t] of Object.entries(c)) U(e) && await r("styling-code/save", {
					path: e,
					contents: t
				});
				return await i(), n("styling/", "styling-code/", "revisions/"), u((e) => ({
					...e,
					...Object.fromEntries(Object.entries(c).filter(([e]) => U(e)))
				})), s((e) => Object.fromEntries(Object.entries(e).filter(([e]) => !(e in c)))), o;
			} catch (t) {
				return h({
					message: t instanceof Error ? t.message : String(t),
					refused: t instanceof e && t.type === "invalid_input"
				}), null;
			} finally {
				p(!1);
			}
		},
		saving: f,
		problem: m,
		clearProblem: () => h(null)
	};
}
// admin/src/code/pageConsole.ts
var G = (e) => Object.prototype.toString.call(e).slice(8, -1), ce = (e) => !!e && typeof e == "object" && (G(e) === "Error" || typeof e.message == "string" && typeof e.stack == "string");
function K(e, t = !1, n = 0, r = /* @__PURE__ */ new Set()) {
	if (typeof e == "string") return t ? JSON.stringify(e) : e;
	if (typeof e == "bigint") return `${e}n`;
	if (typeof e != "object" || !e) return typeof e == "function" ? `ƒ ${e.name || "anonymous"}()` : String(e);
	if (r.has(e)) return "[Circular]";
	if (ce(e)) return `${e.name}: ${e.message}`;
	let i = G(e);
	if (i === "Date") return Number.isNaN(e.getTime()) ? "Invalid Date" : e.toISOString();
	if (i === "RegExp") return String(e);
	if (i === "Promise") return "Promise";
	if (i === "Window") return "Window";
	let a = e;
	if (typeof a.nodeType == "number" && typeof a.nodeName == "string") return a.nodeType === 1 ? `<${a.nodeName.toLowerCase()}${a.id ? `#${a.id}` : ""}${Array.from(a.classList ?? []).map((e) => `.${e}`).join("")}>` : a.nodeType === 3 ? `#text ${JSON.stringify((a.textContent ?? "").slice(0, 60))}` : a.nodeName.toLowerCase();
	let o = new Set(r).add(e), s = (e) => K(e, !0, n + 1, o), c = (e, t) => e > t ? `, …${e - t} more` : "";
	if (Array.isArray(e)) return n >= 2 ? `Array(${e.length})` : `[${e.slice(0, 20).map(s).join(", ")}${c(e.length, 20)}]`;
	if (i === "Map" || i === "Set") {
		let t = [...e.entries()];
		if (n >= 2) return `${i}(${t.length})`;
		let r = t.slice(0, 20).map(([e, t]) => i === "Map" ? `${s(e)} => ${s(t)}` : s(t));
		return `${i}(${t.length}) {${r.join(", ")}${c(t.length, 20)}}`;
	}
	let l = Object.keys(e), u = e.constructor?.name, d = u && u !== "Object" ? `${u} ` : "";
	return n >= 2 ? `${d}{…}` : `${d}{${l.slice(0, 20).map((t) => `${/^[$\w]+$/.test(t) ? t : JSON.stringify(t)}: ${s(e[t])}`).join(", ")}${c(l.length, 20)}}`;
}
function q(e) {
	if (typeof e[0] != "string" || !/%[sdifoOc]/.test(e[0])) return e.map((e) => K(e)).join(" ");
	let t = e.slice(1);
	return [e[0].replace(/%([sdifoOc%])/g, (e, n) => {
		if (n === "%") return "%";
		if (t.length === 0) return e;
		let r = t.shift();
		return n === "c" ? "" : n === "d" || n === "i" ? String(Number.parseInt(String(r), 10)) : n === "f" ? String(Number(r)) : K(r, n !== "s");
	}), ...t.map((e) => K(e))].join(" ");
}
function J(e) {
	let t;
	try {
		t = new URL(e, "http://site.invalid").pathname;
	} catch {
		return null;
	}
	if (/^\/_cms\/site\/custom-[0-9a-f]+\.js$/.test(t)) return "js";
	let n = t.match(/^\/_cms\/site\/(scripts|styles)\/(.+?)(?:-[0-9a-f]{10})?\.(js|css)$/);
	return n ? `${n[1]}/${n[2]}.${n[3]}` : null;
}
var le = import.meta.url.split(/[?#]/)[0];
function ue(e) {
	for (let t of (e ?? "").split("\n")) {
		let e = t.match(/(https?:\/\/[^\s()]+?):(\d+):(\d+)/);
		if (e) return e[1].split(/[?#]/)[0] === le ? void 0 : {
			url: e[1],
			line: Number(e[2]),
			column: Number(e[3])
		};
	}
}
var Y = "(() => {\n  const sink = window.parent && window.parent[TOKEN]\n  if (!sink) return\n  for (const level of ['log', 'info', 'warn', 'error', 'debug']) {\n    const own = console[level].bind(console)\n    console[level] = (...args) => { sink.log(level, args, new Error().stack); own(...args) }\n  }\n  const assert = console.assert.bind(console)\n  console.assert = (ok, ...args) => { if (!ok) sink.log('error', ['Assertion failed:', ...args], new Error().stack); assert(ok, ...args) }\n  const table = console.table.bind(console)\n  console.table = (data, columns) => { sink.log('log', [data], new Error().stack); table(data, columns) }\n  const dir = console.dir.bind(console)\n  console.dir = (value, options) => { sink.log('log', [value], new Error().stack); dir(value, options) }\n  const trace = console.trace.bind(console)\n  console.trace = (...args) => { sink.log('log', ['Trace', ...args], new Error().stack, true); trace(...args) }\n  addEventListener('error', (event) => {\n    const target = event.target\n    if (target && target !== window && target.tagName) sink.missing(target.tagName, target.currentSrc || target.src || target.href || '')\n    else sink.error(event.message, event.error, event.filename, event.lineno, event.colno)\n  }, true)\n  addEventListener('unhandledrejection', (event) => sink.rejected(event.reason))\n  addEventListener('securitypolicyviolation', (event) => sink.refused(event.violatedDirective, event.blockedURI))\n  addEventListener('click', (event) => {\n    const link = event.target && event.target.closest && event.target.closest('a[href]')\n    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return\n    const url = new URL(link.getAttribute('href'), document.baseURI)\n    if (url.origin !== window.parent.location.origin || (link.target && link.target !== '_self')) return\n    event.preventDefault()\n    event.stopImmediatePropagation()\n    if (url.pathname.startsWith('/admin')) return\n    sink.navigate(url.pathname + url.search + url.hash)\n  }, true)\n  // What is typed runs here, on the page, so what it logs says where on the page it came from, never the admin.\n  window.__cmsConsoleRun = (code) => {\n    let value\n    try { value = code() } catch (error) { sink.ran(undefined, error, true); return }\n    sink.ran(value)\n  }\n})()", de = 0;
function fe(e, t, n) {
	let r = `__cmsConsole${++de}_${Math.random().toString(36).slice(2)}`, i = document.querySelector("script[nonce]")?.nonce ?? "", a = window, o = !1, s = !1, c = !1, l = !1, u = (e) => {
		o || n.message(e);
	}, d = (e, t) => ce(e) ? {
		text: K(e),
		detail: e.stack,
		source: ue(e.stack)
	} : { text: t };
	a[r] = {
		log: (e, t, n, r = !1) => u({
			level: e,
			text: q(t),
			source: ue(n),
			detail: r ? (n ?? "").split("\n").slice(2).join("\n") : void 0
		}),
		error: (e, t, n, r, i) => {
			if (s && /SyntaxError|Unexpected|Invalid|missing/i.test(e)) {
				c = !0;
				return;
			}
			let a = d(t, e);
			u({
				level: "error",
				text: `Uncaught ${a.text}`,
				detail: a.detail,
				source: n ? {
					url: n,
					line: r,
					column: i
				} : a.source
			});
		},
		rejected: (e) => {
			let t = d(e, K(e, !0));
			u({
				level: "error",
				text: `Uncaught (in promise) ${t.text}`,
				detail: t.detail,
				source: t.source
			});
		},
		missing: (e, t) => u({
			level: "error",
			text: `Failed to load ${e.toLowerCase()} ${t}`
		}),
		refused: (e, t) => u({
			level: "error",
			text: `Refused by the content security policy (${e}): ${t || "inline"}`
		}),
		navigate: (e) => {
			o || n.navigate(e);
		},
		ran: (e, t, n = !1) => {
			if (l = !0, n) {
				let e = d(t, K(t, !0));
				return u({
					level: "error",
					text: `Uncaught ${e.text}`,
					detail: e.detail
				});
			}
			e && typeof e.then == "function" ? e.then((e) => u({
				level: "result",
				text: `Promise ${K(e, !0)}`
			}), (e) => {
				let t = d(e, K(e, !0));
				u({
					level: "error",
					text: `Uncaught (in promise) ${t.text}`,
					detail: t.detail
				});
			}) : u({
				level: "result",
				text: K(e, !0)
			});
		}
	};
	let f = new AbortController(), p = new URL(t, window.location.origin);
	return fetch(p, {
		credentials: "same-origin",
		headers: { accept: "text/html" },
		signal: f.signal
	}).then(async (t) => {
		let n = await t.text();
		if (o) return;
		t.ok || u({
			level: "error",
			text: `${t.status} ${t.statusText || ""} ${p.pathname}`.trim()
		});
		let a = i ? n.replace(/<script\b(?![^>]*\bnonce=)/gi, `<script nonce="${i}"`) : n, s = `<base href="${p.href.replace(/"/g, "&quot;")}"><script nonce="${i}">${Y.replace("TOKEN", JSON.stringify(r))}<\/script>`;
		e.srcdoc = /<head\b[^>]*>/i.test(a) ? a.replace(/<head\b[^>]*>/i, (e) => e + s) : s + a;
	}).catch((e) => {
		!o && !f.signal.aborted && u({
			level: "error",
			text: `Couldn’t load ${p.pathname}: ${e instanceof Error ? e.message : String(e)}`
		});
	}), {
		evaluate: (t) => {
			let n = e.contentDocument;
			if (!n?.head) return;
			let r = (e) => {
				l = !1;
				let t = n.createElement("script");
				t.nonce = i, t.textContent = `window.__cmsConsoleRun(${e})`, n.head.append(t), t.remove();
			};
			u({
				level: "input",
				text: t
			}), s = !0, c = !1, r(`() => (\n${t}\n)`), s = !1, !l && c && r(`() => {\n${t}\n}`);
		},
		destroy: () => {
			o = !0, f.abort(), delete a[r];
		}
	};
}
// admin/src/code/ConsolePanel.tsx
function pe({ open: e, height: t, onHeight: n, onClose: r, saved: i, onOpen: o, onCounts: s }) {
	let l = u(null), f = u(null), p = u(null), h = u(0), [v, y] = d(e), [b, x] = d("/"), [S, w] = d("/"), [T, E] = d(0), [D, O] = d([]), [k, A] = d(!1), [j, N] = d(""), P = u({
		items: [],
		at: 0
	}), ee = u(s);
	ee.current = s, c(() => {
		e && y(!0);
	}, [e]), c(() => {
		if (!v || !l.current) return;
		let e = (e) => O((t) => {
			let n = t.at(-1);
			return n && n.level === e.level && n.text === e.text && n.source?.url === e.source?.url && n.source?.line === e.source?.line && e.level !== "input" && e.level !== "result" ? [...t.slice(0, -1), {
				...n,
				count: n.count + 1
			}] : [...t, {
				...e,
				id: ++h.current,
				count: 1
			}].slice(-1e3);
		});
		return O([]), e({
			level: "page",
			text: b
		}), f.current = fe(l.current, b, {
			message: e,
			navigate: (e) => {
				x(e), w(e);
			}
		}), () => {
			f.current?.destroy(), f.current = null;
		};
	}, [
		v,
		b,
		T,
		i
	]), c(() => {
		ee.current({
			errors: D.filter((e) => e.level === "error").reduce((e, t) => e + t.count, 0),
			warnings: D.filter((e) => e.level === "warn").reduce((e, t) => e + t.count, 0)
		});
	}, [D]);
	let F = u(!0);
	c(() => {
		let e = p.current;
		e && F.current && (e.scrollTop = e.scrollHeight);
	}, [D, e]);
	let I = () => {
		let e = j.trim();
		e && f.current && (P.current = {
			items: [...P.current.items.filter((t) => t !== e), e].slice(-50),
			at: 0
		}, F.current = !0, f.current.evaluate(e), N(""));
	}, L = (e) => {
		let t = e.currentTarget;
		if (e.key === "Enter" && !e.shiftKey) e.preventDefault(), I();
		else if (e.key === "ArrowUp" && t.selectionStart === 0 || e.key === "ArrowDown" && t.selectionEnd === t.value.length) {
			let { items: t, at: n } = P.current, r = e.key === "ArrowUp" ? 1 : -1, i = Math.max(0, Math.min(t.length, n + r));
			if (i === n) return;
			e.preventDefault(), P.current.at = i, N(i === 0 ? "" : t[t.length - i]);
		} else e.key === "l" && e.ctrlKey && (e.preventDefault(), O([]));
	}, R = (e) => {
		let t = e.trim() || "/", n = t.startsWith("/") ? t : `/${t}`;
		w(n), n === b ? E((e) => e + 1) : x(n);
	};
	return /* @__PURE__ */ V("section", {
		"aria-label": a("Console"),
		className: M("relative shrink-0 flex-col border-t border-border bg-bg", e ? "flex" : "hidden"),
		style: { height: t },
		children: [
			/* @__PURE__ */ B(C, {
				grows: "up",
				value: t,
				min: 120,
				max: Math.round(window.innerHeight * .75),
				onResize: (e) => n(Math.max(120, Math.min(e, Math.round(window.innerHeight * .75)))),
				onReset: () => n(240),
				label: a("Resize Console"),
				className: "-top-1"
			}),
			/* @__PURE__ */ V("div", {
				className: "flex h-9 shrink-0 items-center gap-1 border-b border-border pl-3 pr-1.5",
				children: [
					/* @__PURE__ */ B("h2", {
						className: "m-0 text-xs font-medium text-ink",
						children: a("Console")
					}),
					/* @__PURE__ */ B("form", {
						className: "ml-2 flex min-w-0 flex-1 items-center",
						onSubmit: (e) => {
							e.preventDefault(), R(S);
						},
						children: /* @__PURE__ */ B("input", {
							"aria-label": a("Page"),
							value: S,
							onChange: (e) => w(e.target.value),
							onBlur: () => w(b),
							spellCheck: !1,
							className: "cms-input h-6 w-full max-w-64 min-w-0 rounded-sm px-2 font-mono text-2xs"
						})
					}),
					/* @__PURE__ */ B(_, {
						icon: "refresh",
						size: "xs",
						label: a("Reload Page"),
						onClick: () => E((e) => e + 1)
					}),
					/* @__PURE__ */ B(_, {
						icon: k ? "eye-off" : "eye",
						size: "xs",
						label: a(k ? "Hide Page" : "Show Page"),
						onClick: () => A(!k)
					}),
					/* @__PURE__ */ B(_, {
						icon: "slash",
						size: "xs",
						label: a("Clear Console"),
						shortcut: "ctrl+l",
						onClick: () => O([])
					}),
					/* @__PURE__ */ B(_, {
						icon: "close",
						size: "xs",
						label: a("Close Console"),
						shortcut: "ctrl+`",
						onClick: r
					})
				]
			}),
			/* @__PURE__ */ V("div", {
				className: "relative flex min-h-0 flex-1",
				children: [/* @__PURE__ */ V("div", {
					className: "flex min-h-0 min-w-0 flex-1 flex-col",
					children: [/* @__PURE__ */ B("div", {
						ref: p,
						role: "log",
						"aria-label": a("Console Messages"),
						onScroll: (e) => {
							let t = e.currentTarget;
							F.current = t.scrollHeight - t.scrollTop - t.clientHeight < 24;
						},
						className: "min-h-0 flex-1 overflow-y-auto font-mono text-2xs leading-4",
						children: D.length === 0 && v ? /* @__PURE__ */ B(m, {
							compact: !0,
							icon: "terminal",
							title: a("Nothing logged")
						}) : D.map((e) => /* @__PURE__ */ B(X, {
							entry: e,
							onOpen: o
						}, e.id))
					}), /* @__PURE__ */ V("label", {
						className: "flex shrink-0 items-start gap-2 border-t border-border px-3 py-1.5",
						children: [/* @__PURE__ */ B(g, {
							name: "chevron-right",
							size: 12,
							className: "mt-0.5 shrink-0 text-focus"
						}), /* @__PURE__ */ B("textarea", {
							"aria-label": a("Run on the Page"),
							value: j,
							rows: Math.min(6, j.split("\n").length),
							onChange: (e) => N(e.target.value),
							onKeyDown: L,
							spellCheck: !1,
							autoCapitalize: "off",
							autoComplete: "off",
							className: "min-w-0 flex-1 resize-none bg-transparent font-mono text-2xs leading-4 text-text outline-none"
						})]
					})]
				}), /* @__PURE__ */ B("div", {
					className: M("min-h-0 border-border bg-white", k ? "w-[45%] shrink-0 border-l max-md:absolute max-md:inset-0 max-md:w-full max-md:border-l-0" : "pointer-events-none invisible absolute inset-0"),
					children: v && /* @__PURE__ */ B("iframe", {
						ref: l,
						title: a("Page"),
						sandbox: "allow-same-origin allow-scripts allow-forms",
						className: "size-full border-0"
					})
				})]
			})
		]
	});
}
var me = {
	error: "bg-danger-soft text-danger",
	warn: "bg-warning-soft text-ink",
	debug: "text-muted",
	result: "text-muted"
}, he = {
	error: "x-circle",
	warn: "warning",
	input: "chevron-right",
	result: "chevron-left"
};
function X({ entry: e, onOpen: t }) {
	if (e.level === "page") return /* @__PURE__ */ V("div", {
		className: "flex items-center gap-2 border-b border-border px-3 py-1 text-faint",
		children: [/* @__PURE__ */ B(g, {
			name: "arrow-right",
			size: 12
		}), a("Ran {page}", { page: e.text })]
	});
	let n = e.source ? J(e.source.url) : null, r = e.source ? `${n ? W(n).title : e.source.url.split("/").pop()?.split("?")[0]}${e.source.line ? `:${e.source.line}` : ""}` : null, i = he[e.level], o = e.text.length > 160 || e.text.includes("\n"), s = /* @__PURE__ */ B("span", {
		className: "min-w-0 flex-1 whitespace-pre-wrap break-words",
		children: e.text
	});
	return /* @__PURE__ */ V("div", {
		className: M("flex items-start gap-2 border-b border-border px-3 py-1", me[e.level]),
		children: [
			/* @__PURE__ */ B("span", {
				className: "grid size-4 shrink-0 place-items-center",
				children: i && /* @__PURE__ */ B(g, {
					name: i,
					size: 12,
					className: e.level === "input" ? "text-focus" : e.level === "warn" ? "text-warning" : void 0
				})
			}),
			e.detail || o ? /* @__PURE__ */ V("details", {
				className: "group/more min-w-0 flex-1",
				children: [/* @__PURE__ */ V("summary", {
					className: "flex cursor-default items-start gap-1",
					children: [/* @__PURE__ */ B(g, {
						name: "chevron-right",
						size: 12,
						className: "mt-0.5 shrink-0 text-faint transition-transform duration-fast group-open/more:rotate-90"
					}), /* @__PURE__ */ B("span", {
						className: "min-w-0 flex-1 truncate group-open/more:whitespace-pre-wrap group-open/more:break-words",
						children: e.text
					})]
				}), e.detail && /* @__PURE__ */ B("pre", {
					className: "m-0 mt-1 whitespace-pre-wrap break-words pl-4 text-muted",
					children: e.detail
				})]
			}) : s,
			e.count > 1 && /* @__PURE__ */ B("span", {
				className: "shrink-0 rounded-full bg-active px-1.5 text-faint",
				children: e.count
			}),
			r && (n ? /* @__PURE__ */ B(x, {
				compact: !0,
				onClick: () => t(n, e.source?.line, e.source?.column),
				className: "shrink-0 rounded-xs text-faint underline-offset-2 hover:text-text hover:underline",
				children: r
			}) : /* @__PURE__ */ B("span", {
				className: "shrink-0 text-faint",
				children: r
			}))
		]
	});
}
// admin/src/code/EditorTabs.tsx
function ge({ tabs: e, active: t, dirty: n, onSelect: r, onClose: i }) {
	let o = u(null);
	c(() => {
		o.current?.querySelector("[aria-selected=\"true\"]")?.scrollIntoView({
			block: "nearest",
			inline: "nearest"
		});
	}, [t, e.length]);
	let s = (t, n) => {
		let i = t.key === "ArrowRight" ? 1 : t.key === "ArrowLeft" ? -1 : 0;
		if (!i) return;
		t.preventDefault();
		let a = e[(n + i + e.length) % e.length];
		r(a), requestAnimationFrame(() => o.current?.querySelector(`[data-tab="${CSS.escape(a)}"]`)?.focus());
	};
	return /* @__PURE__ */ B("div", {
		ref: o,
		role: "tablist",
		"aria-label": a("Open Files"),
		className: "flex h-9 shrink-0 overflow-x-auto overflow-y-hidden border-b border-border bg-sunken",
		children: e.map((e, o) => {
			let c = W(e), l = e === t, u = n(e);
			return /* @__PURE__ */ V("div", {
				className: M("cms-reveal-row group/tab relative flex shrink-0 items-center border-r border-border", l ? "-mb-px bg-bg text-ink" : "text-muted hover:text-text"),
				children: [/* @__PURE__ */ V(x, {
					compact: !0,
					role: "tab",
					"data-tab": e,
					"aria-selected": l,
					tabIndex: l ? 0 : -1,
					onClick: () => r(e),
					onAuxClick: (t) => {
						t.button === 1 && (t.preventDefault(), i(e));
					},
					onKeyDown: (e) => s(e, o),
					className: "flex h-full items-center gap-1.5 pl-3 pr-1 text-xs -outline-offset-2",
					children: [/* @__PURE__ */ B(g, {
						name: c.icon,
						size: 14,
						className: "shrink-0 text-faint"
					}), /* @__PURE__ */ B("span", {
						className: "whitespace-nowrap",
						children: c.title
					})]
				}), /* @__PURE__ */ V("span", {
					className: "relative mr-1 size-6",
					children: [u && /* @__PURE__ */ B("span", {
						role: "img",
						"aria-label": a("Unsaved changes"),
						className: "absolute inset-0 m-auto size-2 rounded-full bg-focus group-focus-within/tab:hidden group-hover/tab:hidden"
					}), /* @__PURE__ */ B("span", {
						className: M("absolute inset-0", u ? "hidden group-focus-within/tab:block group-hover/tab:block" : !l && "cms-reveal"),
						children: /* @__PURE__ */ B(_, {
							icon: "close",
							size: "xs",
							label: a("Close {name}", { name: c.title }),
							onClick: () => i(e)
						})
					})]
				})]
			}, e);
		})
	});
}
// admin/src/code/Code.tsx
function _e(e, t) {
	try {
		let n = window.localStorage.getItem(e);
		return n ? {
			...t,
			...JSON.parse(n)
		} : t;
	} catch {
		return t;
	}
}
function ve(e, t) {
	try {
		window.localStorage.setItem(e, JSON.stringify(t));
	} catch {}
}
var ye = "cms:code:tabs", be = "cms:code:panel", Z = "cms:code:tree";
function Q() {
	let e = o("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), n = o("styling-code/list"), r = o("styling-vendor/list"), l = se(e.data, () => e.refetch()), { query: f } = s(), p = Ee(), h = t("site.code"), y = t("settings.manage"), [C, T] = d(() => _e(ye, { open: ["css"] }).open), D = f.file ?? (p ? null : C[0] ?? null);
	c(() => {
		let e = f.file;
		e && T((t) => t.includes(e) ? t : [...t, e]);
	}, [f.file]), c(() => ve(ye, { open: C }), [C]);
	let A = (e) => i({ file: e ?? void 0 }, !1), N = (e) => {
		C.includes(e) || T((t) => [...t, e]), A(e);
	}, P = (e) => {
		let t = C.indexOf(e), n = C.filter((t) => t !== e);
		T(n), D === e && A(n[Math.min(t, n.length - 1)] ?? null);
	}, [F, I] = d(() => _e(be, {
		open: !1,
		height: 240
	}));
	c(() => ve(be, F), [F]);
	let [z, te] = d({
		errors: 0,
		warnings: 0
	}), [ne, H] = d(0), ie = () => I((e) => ({
		...e,
		open: !e.open
	})), G = u(/* @__PURE__ */ new Map()), [ce, K] = d({}), [q, J] = d(null), [le, ue] = d({}), [Y, de] = d({}), fe = (e, t, n) => {
		if (N(e), !t) return;
		let r = 0, i = () => {
			let a = G.current.get(e);
			a ? a.goTo(t, n) : r++ < 120 && requestAnimationFrame(i);
		};
		requestAnimationFrame(i);
	}, me = async () => {
		let e = await l.save();
		if (!e) return;
		H((e) => e + 1);
		let t = e[0];
		t && L(a("{name} was saved as written: {problem}", {
			name: W(t.id).title,
			problem: t.message
		}), {
			duration: 8e3,
			action: t.line ? {
				label: a("Show Line"),
				onClick: () => fe(t.id, t.line, t.column)
			} : void 0
		});
	}, he = async (e) => {
		let t = await l.format(e);
		if (t.mistake) return void L.error(a("{name} can’t be formatted: {problem}", {
			name: W(e).title,
			problem: t.mistake.message
		}));
		t.text !== l.text(e) && l.edit(e, t.text);
	}, X = Se({
		files: n,
		docs: l,
		open: N,
		close: P
	}), Z = D ? W(D) : null, Q = (e) => e === "css" ? y : h, Ce = !!Z && ee(Z.language) && Q(D), De = D && Z?.language ? ce[D] : void 0, Oe = {
		undo: () => {
			D && G.current.get(D)?.undo();
		},
		redo: () => {
			D && G.current.get(D)?.redo();
		},
		canUndo: !!De?.canUndo,
		canRedo: !!De?.canRedo
	}, ke = D ? ae(D) : null;
	if (R("ctrl+`", ie, !0, a("Toggle Console"), a("Code")), R("alt+shift+f", () => {
		D && Ce && he(D);
	}, Ce, a("Format Document"), a("Code")), R("alt+mod+arrowright", () => {
		D && A(C[(C.indexOf(D) + 1) % C.length]);
	}, C.length > 1 && !p, a("Next Tab"), a("Code")), R("alt+mod+arrowleft", () => {
		D && A(C[(C.indexOf(D) - 1 + C.length) % C.length]);
	}, C.length > 1 && !p, a("Previous Tab"), a("Code")), e.isLoading) return /* @__PURE__ */ B("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ B(E, {})
	});
	if (!e.data) return /* @__PURE__ */ V("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ B(O, { crumbs: [{
			label: a("Code"),
			icon: "code"
		}] }), /* @__PURE__ */ B(S, {
			title: a("Couldn’t load the code"),
			onRetry: () => void e.refetch(),
			retrying: e.isRefetching
		})]
	});
	let Ae = D?.startsWith("library:") ? r.data?.imports.find((e) => `library:${e.import}` === D) : void 0, je = [...Z?.language ? [{
		label: a("Format Document"),
		icon: "wand",
		shortcut: "alt+shift+f",
		disabled: !Ce,
		onSelect: () => void he(D)
	}] : [], ...D && U(D) ? X.fileMenu(D) : Ae ? X.libraryMenu(Ae.import) : []], $ = l.problem;
	return /* @__PURE__ */ V("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ B(O, {
				divided: !0,
				back: p && f.file ? {
					to: "/code",
					label: a("Code")
				} : void 0,
				crumbs: [{ label: p && Z ? Z.title : a("Code") }],
				actions: /* @__PURE__ */ V(re, { children: [
					Z?.language && /* @__PURE__ */ B(k, {
						history: Oe,
						keys: "named",
						group: a("Code"),
						disabled: !Q(D)
					}),
					ke && Q(D) && /* @__PURE__ */ B(j, {
						of: ke,
						onOpen: (e) => J({
							id: D,
							version: e
						})
					}),
					/* @__PURE__ */ B(_, {
						icon: "terminal",
						size: "sm",
						label: F.open ? a("Hide Console") : a("Show Console"),
						shortcut: "ctrl+`",
						active: F.open,
						onClick: ie
					}),
					je.length > 0 && /* @__PURE__ */ B(v, {
						align: "end",
						trigger: /* @__PURE__ */ B(_, {
							icon: "more",
							size: "sm",
							label: a("File Actions")
						}),
						items: je
					})
				] })
			}),
			/* @__PURE__ */ B(w, {
				dirty: l.dirtyIds.length > 0,
				saving: l.saving,
				error: $ ? $.refused ? a("The CSS was not saved") : $.message : null,
				onSave: () => void me(),
				onDiscard: l.discard
			}),
			!h && /* @__PURE__ */ B(b, {
				tone: "neutral",
				className: "mx-4 mb-2",
				title: a("Editing code needs the “Edit Scripts and Stylesheets” permission.")
			}),
			$?.refused && /* @__PURE__ */ B(b, {
				tone: "danger",
				className: "mx-4 mb-2",
				title: a("Tailwind refused the CSS"),
				onDismiss: l.clearProblem,
				children: $.message
			}),
			/* @__PURE__ */ V("div", {
				className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(220px,260px)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ B("div", {
					className: M("flex min-h-0 flex-col border-border pt-1 md:border-r", p && f.file && "hidden"),
					children: /* @__PURE__ */ B(we, {
						files: n,
						libraries: r,
						docs: l,
						active: D,
						onOpen: N,
						actions: X,
						code: h
					})
				}), /* @__PURE__ */ V("div", {
					className: M("flex min-h-0 min-w-0 flex-col", p && !f.file && "hidden"),
					children: [
						!p && C.length > 0 && /* @__PURE__ */ B(ge, {
							tabs: C,
							active: D,
							dirty: l.isDirty,
							onSelect: A,
							onClose: P
						}),
						/* @__PURE__ */ V("div", {
							className: "relative min-h-0 flex-1",
							children: [C.map((e) => /* @__PURE__ */ B("div", {
								className: M("absolute inset-0 flex flex-col", e !== D && "hidden"),
								children: /* @__PURE__ */ B(Te, {
									id: e,
									docs: l,
									library: r.data?.imports.find((t) => `library:${t.import}` === e),
									librariesLoaded: !!r.data,
									disabled: !Q(e),
									fetching: X.fetching,
									onUpdateLibrary: X.updateLibrary,
									editorRef: (t) => {
										t ? G.current.set(e, t) : G.current.delete(e);
									},
									onCursor: (t) => ue((n) => ({
										...n,
										[e]: t
									})),
									onErrors: (t) => de((n) => ({
										...n,
										[e]: t
									})),
									onHistory: (t) => K((n) => ({
										...n,
										[e]: t
									}))
								})
							}, e)), !D && !p && /* @__PURE__ */ B(m, {
								icon: "code",
								title: a("No file open")
							})]
						}),
						/* @__PURE__ */ B(pe, {
							open: F.open,
							height: p ? Math.min(F.height, 320) : F.height,
							onHeight: (e) => I((t) => ({
								...t,
								height: e
							})),
							onClose: () => I((e) => ({
								...e,
								open: !1
							})),
							saved: ne,
							onOpen: fe,
							onCounts: te
						}),
						/* @__PURE__ */ V("div", {
							className: "flex h-7 shrink-0 items-center gap-3 border-t border-border bg-sunken px-2 text-2xs text-muted",
							children: [
								/* @__PURE__ */ V(x, {
									compact: !0,
									onClick: ie,
									"aria-label": a("{errors} errors, {warnings} warnings: Toggle Console", { ...z }),
									className: "flex h-6 items-center gap-2 rounded-sm px-1.5 hover:bg-hover hover:text-text",
									children: [/* @__PURE__ */ V("span", {
										className: M("flex items-center gap-1", z.errors > 0 && "text-danger"),
										children: [/* @__PURE__ */ B(g, {
											name: "x-circle",
											size: 12
										}), z.errors]
									}), /* @__PURE__ */ V("span", {
										className: M("flex items-center gap-1", z.warnings > 0 && "text-warning"),
										children: [/* @__PURE__ */ B(g, {
											name: "warning",
											size: 12
										}), z.warnings]
									})]
								}),
								/* @__PURE__ */ B("span", { className: "flex-1" }),
								D && !!Y[D] && /* @__PURE__ */ B("span", {
									role: "status",
									className: "text-danger",
									children: Y[D] === 1 ? a("1 error") : a("{count} errors", { count: Y[D] })
								}),
								D && le[D] && Z?.language && /* @__PURE__ */ B("span", { children: a("Ln {line}, Col {column}", { ...le[D] }) }),
								Z?.language && /* @__PURE__ */ B("span", { children: oe(Z.language) })
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ B(xe, {
				opened: q,
				docs: l,
				writable: !!q && Q(q.id),
				onClose: () => J(null),
				onRestore: (e, t) => {
					J(null), l.edit(e, t), N(e), requestAnimationFrame(() => G.current.get(e)?.focus());
				}
			})
		]
	});
}
function xe({ opened: e, docs: t, writable: n, onClose: r, onRestore: i }) {
	let a = z(e?.version ?? null), o = a.data?.snapshot, s = !e || !o ? "" : e.id === "css" ? new te(o.css ?? "").extra() : o.contents ?? "", c = e ? t.text(e.id) ?? "" : "";
	return /* @__PURE__ */ B(A, {
		version: e?.version ?? null,
		onClose: r,
		onRestore: e && n ? () => i(e.id, s) : void 0,
		loading: !o,
		failed: a.isError,
		onRetry: () => void a.refetch(),
		unchanged: !!o && !I(c, s),
		children: /* @__PURE__ */ B(D, {
			now: c,
			then: s
		})
	});
}
function Se({ files: e, docs: i, open: o, close: s }) {
	let [c, l] = d(null), u = t("site.code"), f = async (e, t) => {
		try {
			return await e(), n("styling-code/", "styling-vendor/", "revisions/"), L.success(t), !0;
		} catch (e) {
			return L.error(e), !1;
		}
	}, p = async (t, n = "") => {
		let i = await F({
			title: a(t === "scripts" ? "New Script" : "New Stylesheet"),
			fields: [{
				handle: "name",
				type: "text",
				label: a("Name"),
				mono: !0,
				autofocus: !0,
				placeholder: `${n}hero`
			}],
			values: n ? { name: n } : void 0,
			confirm: a(t === "scripts" ? "Create Script" : "Create Stylesheet")
		}), s = String(i?.name ?? "").trim().toLowerCase().replace(/\.(js|css)$/, "").replace(/\s+/g, "-").replace(/^\/+|\/+$/g, "");
		if (!s) return;
		if ((e.data?.[t] ?? []).includes(s)) return void L.error(a("“{name}” already exists", { name: s }));
		let c = `${t}/${s}.${H[t]}`;
		await f(() => r("styling-code/save", {
			path: c,
			contents: ie[t]
		}), a("{name} added", { name: `${s.split("/").pop()}.${H[t]}` })) && o(c);
	}, m = async (e) => {
		let t = W(e).title;
		await N({
			title: a("Delete “{name}”?", { name: t }),
			description: a("The file and its history are deleted for good."),
			confirm: a("Delete File"),
			danger: !0
		}) && await f(() => r("styling-code/delete", { path: e }), a("{name} deleted", { name: t })) && (s(e), i.forget(e));
	}, h = async () => {
		let e = await F({
			title: a("Add Library"),
			fields: [{
				handle: "package",
				type: "text",
				label: a("Package"),
				mono: !0,
				autofocus: !0,
				placeholder: "gsap@3.12.5"
			}],
			confirm: a("Add Library")
		}), t = String(e?.package ?? "").trim();
		t && (l("add"), await f(() => r("styling-vendor/create", { package: t }), a("{name} added", { name: t })), l(null));
	}, g = async (e) => {
		l(e), await f(() => r("styling-vendor/update", { import: e }), a("{name} updated", { name: e })), l(null);
	}, _ = async (e) => {
		await N({
			title: a("Delete “{name}”?", { name: e }),
			confirm: a("Delete Library"),
			danger: !0
		}) && await f(() => r("styling-vendor/delete", { import: e }), a("{name} deleted", { name: e })) && s(`library:${e}`);
	}, v = (e) => u ? [{
		label: a("Delete File"),
		icon: "trash",
		danger: !0,
		onSelect: () => void m(e)
	}] : [], y = (e, t) => {
		if (!u) return [];
		let n = [];
		return t && t !== "scripts" || n.push({
			label: a("New Script"),
			icon: "file-js",
			onSelect: () => void p("scripts", t ? e : "")
		}), t && t !== "styles" || n.push({
			label: a("New Stylesheet"),
			icon: "file-css",
			onSelect: () => void p("styles", t ? e : "")
		}), t && t !== "vendor" || n.push({
			label: a("Add Library"),
			icon: "box",
			disabled: !!c,
			onSelect: () => void h()
		}), n;
	};
	return {
		fetching: c,
		addFile: p,
		addLibrary: h,
		updateLibrary: g,
		fileMenu: v,
		libraryMenu: (e) => u ? [
			{
				label: a("Update"),
				icon: "refresh",
				disabled: !!c,
				onSelect: () => void g(e)
			},
			{
				separator: !0,
				label: ""
			},
			{
				label: a("Delete Library"),
				icon: "trash",
				danger: !0,
				disabled: !!c,
				onSelect: () => void _(e)
			}
		] : [],
		newMenu: y,
		folderMenu: (e, t) => y(t, e)
	};
}
var Ce = [
	"dir:scripts",
	"dir:styles",
	"dir:vendor"
];
function we({ files: e, libraries: t, docs: n, active: r, onOpen: i, actions: o, code: s }) {
	let [u, f] = d(() => _e(Z, { open: Ce }).open);
	c(() => ve(Z, { open: u }), [u]);
	let p = (e) => n.isDirty(e) ? /* @__PURE__ */ B("span", {
		className: "size-1.5 rounded-full bg-focus",
		"aria-label": a("Unsaved changes"),
		role: "img"
	}) : void 0, m = l(() => {
		let n = (e, t) => ({
			id: e,
			name: t,
			icon: W(e).icon,
			status: p(e),
			actions: U(e) ? o.fileMenu(e).map((e) => ({
				...e,
				quick: e.icon === "trash"
			})) : []
		}), r = (t) => {
			let r = {
				id: `dir:${t}`,
				name: t,
				children: [],
				actions: o.folderMenu(t, "")
			};
			for (let i of e.data?.[t] ?? []) {
				let e = i.split("/"), a = r;
				e.slice(0, -1).forEach((n, r) => {
					let i = e.slice(0, r + 1).join("/"), s = a.children.find((e) => e.id === `dir:${t}/${i}`);
					s || a.children.push(s = {
						id: `dir:${t}/${i}`,
						name: n,
						children: [],
						actions: o.folderMenu(t, `${i}/`)
					}), a = s;
				}), a.children.push(n(`${t}/${i}.${H[t]}`, `${e[e.length - 1]}.${H[t]}`));
			}
			let i = (e) => {
				e.children?.sort((e, t) => Number(!e.children) - Number(!t.children) || e.name.localeCompare(t.name)), e.children?.forEach(i);
			};
			return i(r), r;
		}, i = {
			id: "dir:vendor",
			name: "vendor",
			actions: o.folderMenu("vendor", ""),
			children: (t.data?.imports ?? []).map((e) => ({
				id: `library:${e.import}`,
				name: e.import,
				icon: "box",
				badge: o.fetching === e.import ? /* @__PURE__ */ B(E, { size: 12 }) : e.version,
				actions: o.libraryMenu(e.import)
			}))
		};
		return [
			n("css", "theme.css"),
			n("js", "custom.js"),
			r("scripts"),
			r("styles"),
			i
		];
	}, [
		e.data,
		t.data,
		o.fetching,
		n.dirtyIds.join(),
		s
	]), g = e.isError || t.isError;
	return /* @__PURE__ */ V("nav", {
		"aria-label": a("Files"),
		className: "flex min-h-0 flex-col",
		children: [/* @__PURE__ */ V("div", {
			className: "flex h-9 shrink-0 items-center gap-2 pl-4 pr-2",
			children: [/* @__PURE__ */ B("h2", {
				className: "cms-label m-0 min-w-0 flex-1 truncate",
				children: a("Files")
			}), o.fetching === "add" ? /* @__PURE__ */ B("span", {
				role: "status",
				"aria-label": a("Working…"),
				className: "grid size-6 place-items-center text-faint",
				children: /* @__PURE__ */ B(E, { size: 14 })
			}) : s && /* @__PURE__ */ B(v, {
				align: "end",
				trigger: /* @__PURE__ */ B(_, {
					icon: "plus",
					size: "xs",
					label: a("New File")
				}),
				items: o.newMenu("")
			})]
		}), /* @__PURE__ */ B("div", {
			className: "min-h-0 flex-1 overflow-y-auto px-2 pb-4",
			children: g ? /* @__PURE__ */ B(S, {
				compact: !0,
				onRetry: () => {
					e.refetch(), t.refetch();
				},
				retrying: e.isRefetching || t.isRefetching
			}) : !e.data || !t.data ? /* @__PURE__ */ B(De, {}) : /* @__PURE__ */ B(h, {
				label: a("Files"),
				nodes: m,
				active: r,
				onOpen: i,
				expanded: u,
				onExpandedChange: f
			})
		})]
	});
}
function Te({ id: e, docs: n, library: r, librariesLoaded: i, disabled: s, fetching: l, onUpdateLibrary: u, editorRef: d, onCursor: m, onErrors: h, onHistory: g }) {
	let _ = W(e), v = U(e), b = o("styling-code/get", { path: e }, {
		enabled: v,
		staleTime: 0
	});
	if (c(() => {
		b.data && n.loaded(e, b.data.contents);
	}, [e, b.data]), _.library) return r ? /* @__PURE__ */ V("div", {
		className: "space-y-1 p-4 text-sm",
		children: [
			/* @__PURE__ */ B("p", {
				className: "m-0 font-mono text-ink",
				children: r.package
			}),
			/* @__PURE__ */ B("p", {
				className: "m-0 font-mono text-xs text-muted",
				children: r.version
			}),
			t("site.code") && /* @__PURE__ */ B(f, {
				icon: "refresh",
				loading: l === r.import,
				disabled: !!l,
				onClick: () => u(r.import),
				className: "!mt-4",
				children: a("Update")
			})
		]
	}) : i ? /* @__PURE__ */ B(y, {}) : null;
	if (v && b.isError) return /* @__PURE__ */ B(S, {
		compact: !0,
		onRetry: () => void b.refetch(),
		retrying: b.isRefetching
	});
	let x = n.text(e);
	return x === void 0 ? /* @__PURE__ */ B(T, { className: "m-4 h-full rounded-md" }) : /* @__PURE__ */ B(p, {
		fill: !0,
		bare: !0,
		ref: d,
		label: _.title,
		language: _.language,
		value: x,
		disabled: s,
		onChange: (t) => n.edit(e, t),
		onCursor: m,
		onErrors: h,
		onHistory: g,
		placeholder: e === "css" ? ".hero-title { text-wrap: balance; }" : e === "js" ? "document.addEventListener('cms:alpine', (e) => …)" : void 0
	});
}
function Ee() {
	let [e, t] = d(() => window.matchMedia("(max-width: 767px)").matches);
	return c(() => {
		let e = window.matchMedia("(max-width: 767px)"), n = () => t(e.matches);
		return e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
var De = () => /* @__PURE__ */ V("div", {
	className: "space-y-2 py-2 pl-2",
	children: [/* @__PURE__ */ B(T, { className: "h-3 w-32" }), /* @__PURE__ */ B(T, { className: "h-3 w-24" })]
});
export { Q as default };
