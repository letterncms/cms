import { CmsError as e, can as t, invalidate as n, run as r, setQuery as i, t as a, useAbility as o, useLocation as s } from "@letterncms/sdk";
import { useEffect as c, useMemo as l, useRef as u, useState as d } from "react";
import { Button as f, CodeEditor as p, EmptyState as m, Icon as h, IconButton as g, Menu as _, NotFoundState as v, Notice as y, Pressable as b, QueryError as x, ResizeHandle as S, SaveBar as C, SidebarGroup as w, SidebarRow as T, Skeleton as E, Spinner as D, Topbar as O, cn as k, confirm as A, formatCode as j, formats as M, prompt as N, toast as P, useShortcut as F } from "@letterncms/ui";
import { Stylesheet as I, balanced as L } from "@letterncms/blocks";
import { Fragment as ee, jsx as R, jsxs as z } from "react/jsx-runtime";
// admin/src/code/documents.ts
var B = {
	scripts: "js",
	styles: "css"
}, te = {
	scripts: "export function mount(el, props) {\n}\n",
	styles: "\n"
}, V = (e) => /^(scripts|styles)\//.test(e);
function H(e) {
	return e === "css" ? {
		id: e,
		title: a("Site CSS"),
		icon: "braces",
		language: "tailwind"
	} : e === "js" ? {
		id: e,
		title: a("Site JavaScript"),
		icon: "braces",
		language: "javascript"
	} : e.startsWith("library:") ? {
		id: e,
		title: e.slice(8),
		icon: "box",
		library: e.slice(8)
	} : {
		id: e,
		title: e.split("/").pop() ?? e,
		icon: "file",
		language: e.endsWith(".css") ? "css" : "javascript"
	};
}
var ne = (e) => e === "tailwind" ? a("Tailwind CSS") : e === "css" ? "CSS" : e === "javascript" ? "JavaScript" : "";
function re(t, i) {
	let [o, s] = d({}), [c, u] = d({}), [f, p] = d(!1), [m, h] = d(null), g = l(() => t ? new I(t.css).extra() : void 0, [t?.css]), _ = (e) => e === "css" ? g : e === "js" ? t?.js : c[e], v = (e) => o[e] ?? _(e), y = (e) => o[e] !== void 0 && o[e] !== _(e), b = Object.keys(o).filter(y), x = (e, t) => s((n) => ({
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
			return { text: await j(t, H(e).language) };
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
					if (!L(c.css)) throw new e(a("A brace in the site’s CSS is never closed."), "invalid_input");
					await r("styling/update", { css: new I(t.css).setExtra(c.css).css });
				}
				c.js !== void 0 && await r("styling-code/set-custom", { js: c.js });
				for (let [e, t] of Object.entries(c)) V(e) && await r("styling-code/save", {
					path: e,
					contents: t
				});
				return await i(), n("styling/", "styling-code/"), u((e) => ({
					...e,
					...Object.fromEntries(Object.entries(c).filter(([e]) => V(e)))
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
var U = (e) => Object.prototype.toString.call(e).slice(8, -1), ie = (e) => !!e && typeof e == "object" && (U(e) === "Error" || typeof e.message == "string" && typeof e.stack == "string");
function W(e, t = !1, n = 0, r = /* @__PURE__ */ new Set()) {
	if (typeof e == "string") return t ? JSON.stringify(e) : e;
	if (typeof e == "bigint") return `${e}n`;
	if (typeof e != "object" || !e) return typeof e == "function" ? `ƒ ${e.name || "anonymous"}()` : String(e);
	if (r.has(e)) return "[Circular]";
	if (ie(e)) return `${e.name}: ${e.message}`;
	let i = U(e);
	if (i === "Date") return Number.isNaN(e.getTime()) ? "Invalid Date" : e.toISOString();
	if (i === "RegExp") return String(e);
	if (i === "Promise") return "Promise";
	if (i === "Window") return "Window";
	let a = e;
	if (typeof a.nodeType == "number" && typeof a.nodeName == "string") return a.nodeType === 1 ? `<${a.nodeName.toLowerCase()}${a.id ? `#${a.id}` : ""}${Array.from(a.classList ?? []).map((e) => `.${e}`).join("")}>` : a.nodeType === 3 ? `#text ${JSON.stringify((a.textContent ?? "").slice(0, 60))}` : a.nodeName.toLowerCase();
	let o = new Set(r).add(e), s = (e) => W(e, !0, n + 1, o), c = (e, t) => e > t ? `, …${e - t} more` : "";
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
function G(e) {
	if (typeof e[0] != "string" || !/%[sdifoOc]/.test(e[0])) return e.map((e) => W(e)).join(" ");
	let t = e.slice(1);
	return [e[0].replace(/%([sdifoOc%])/g, (e, n) => {
		if (n === "%") return "%";
		if (t.length === 0) return e;
		let r = t.shift();
		return n === "c" ? "" : n === "d" || n === "i" ? String(Number.parseInt(String(r), 10)) : n === "f" ? String(Number(r)) : W(r, n !== "s");
	}), ...t.map((e) => W(e))].join(" ");
}
function ae(e) {
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
var oe = import.meta.url.split(/[?#]/)[0];
function K(e) {
	for (let t of (e ?? "").split("\n")) {
		let e = t.match(/(https?:\/\/[^\s()]+?):(\d+):(\d+)/);
		if (e) return e[1].split(/[?#]/)[0] === oe ? void 0 : {
			url: e[1],
			line: Number(e[2]),
			column: Number(e[3])
		};
	}
}
var se = "(() => {\n  const sink = window.parent && window.parent[TOKEN]\n  if (!sink) return\n  for (const level of ['log', 'info', 'warn', 'error', 'debug']) {\n    const own = console[level].bind(console)\n    console[level] = (...args) => { sink.log(level, args, new Error().stack); own(...args) }\n  }\n  const assert = console.assert.bind(console)\n  console.assert = (ok, ...args) => { if (!ok) sink.log('error', ['Assertion failed:', ...args], new Error().stack); assert(ok, ...args) }\n  const table = console.table.bind(console)\n  console.table = (data, columns) => { sink.log('log', [data], new Error().stack); table(data, columns) }\n  const dir = console.dir.bind(console)\n  console.dir = (value, options) => { sink.log('log', [value], new Error().stack); dir(value, options) }\n  const trace = console.trace.bind(console)\n  console.trace = (...args) => { sink.log('log', ['Trace', ...args], new Error().stack, true); trace(...args) }\n  addEventListener('error', (event) => {\n    const target = event.target\n    if (target && target !== window && target.tagName) sink.missing(target.tagName, target.currentSrc || target.src || target.href || '')\n    else sink.error(event.message, event.error, event.filename, event.lineno, event.colno)\n  }, true)\n  addEventListener('unhandledrejection', (event) => sink.rejected(event.reason))\n  addEventListener('securitypolicyviolation', (event) => sink.refused(event.violatedDirective, event.blockedURI))\n  addEventListener('click', (event) => {\n    const link = event.target && event.target.closest && event.target.closest('a[href]')\n    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return\n    const url = new URL(link.getAttribute('href'), document.baseURI)\n    if (url.origin !== window.parent.location.origin || (link.target && link.target !== '_self')) return\n    event.preventDefault()\n    event.stopImmediatePropagation()\n    if (url.pathname.startsWith('/admin')) return\n    sink.navigate(url.pathname + url.search + url.hash)\n  }, true)\n  // What is typed runs here, on the page, so what it logs says where on the page it came from, never the admin.\n  window.__cmsConsoleRun = (code) => {\n    let value\n    try { value = code() } catch (error) { sink.ran(undefined, error, true); return }\n    sink.ran(value)\n  }\n})()", q = 0;
function ce(e, t, n) {
	let r = `__cmsConsole${++q}_${Math.random().toString(36).slice(2)}`, i = document.querySelector("script[nonce]")?.nonce ?? "", a = window, o = !1, s = !1, c = !1, l = !1, u = (e) => {
		o || n.message(e);
	}, d = (e, t) => ie(e) ? {
		text: W(e),
		detail: e.stack,
		source: K(e.stack)
	} : { text: t };
	a[r] = {
		log: (e, t, n, r = !1) => u({
			level: e,
			text: G(t),
			source: K(n),
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
			let t = d(e, W(e, !0));
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
				let e = d(t, W(t, !0));
				return u({
					level: "error",
					text: `Uncaught ${e.text}`,
					detail: e.detail
				});
			}
			e && typeof e.then == "function" ? e.then((e) => u({
				level: "result",
				text: `Promise ${W(e, !0)}`
			}), (e) => {
				let t = d(e, W(e, !0));
				u({
					level: "error",
					text: `Uncaught (in promise) ${t.text}`,
					detail: t.detail
				});
			}) : u({
				level: "result",
				text: W(e, !0)
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
		let a = i ? n.replace(/<script\b(?![^>]*\bnonce=)/gi, `<script nonce="${i}"`) : n, s = `<base href="${p.href.replace(/"/g, "&quot;")}"><script nonce="${i}">${se.replace("TOKEN", JSON.stringify(r))}<\/script>`;
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
function le({ open: e, height: t, onHeight: n, onClose: r, saved: i, onOpen: o, onCounts: s }) {
	let l = u(null), f = u(null), p = u(null), _ = u(0), [v, y] = d(e), [b, x] = d("/"), [C, w] = d("/"), [T, E] = d(0), [D, O] = d([]), [A, j] = d(!1), [M, N] = d(""), P = u({
		items: [],
		at: 0
	}), F = u(s);
	F.current = s, c(() => {
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
				id: ++_.current,
				count: 1
			}].slice(-1e3);
		});
		return O([]), e({
			level: "page",
			text: b
		}), f.current = ce(l.current, b, {
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
		F.current({
			errors: D.filter((e) => e.level === "error").reduce((e, t) => e + t.count, 0),
			warnings: D.filter((e) => e.level === "warn").reduce((e, t) => e + t.count, 0)
		});
	}, [D]);
	let I = u(!0);
	c(() => {
		let e = p.current;
		e && I.current && (e.scrollTop = e.scrollHeight);
	}, [D, e]);
	let L = () => {
		let e = M.trim();
		e && f.current && (P.current = {
			items: [...P.current.items.filter((t) => t !== e), e].slice(-50),
			at: 0
		}, I.current = !0, f.current.evaluate(e), N(""));
	}, ee = (e) => {
		let t = e.currentTarget;
		if (e.key === "Enter" && !e.shiftKey) e.preventDefault(), L();
		else if (e.key === "ArrowUp" && t.selectionStart === 0 || e.key === "ArrowDown" && t.selectionEnd === t.value.length) {
			let { items: t, at: n } = P.current, r = e.key === "ArrowUp" ? 1 : -1, i = Math.max(0, Math.min(t.length, n + r));
			if (i === n) return;
			e.preventDefault(), P.current.at = i, N(i === 0 ? "" : t[t.length - i]);
		} else e.key === "l" && e.ctrlKey && (e.preventDefault(), O([]));
	}, B = (e) => {
		let t = e.trim() || "/", n = t.startsWith("/") ? t : `/${t}`;
		w(n), n === b ? E((e) => e + 1) : x(n);
	};
	return /* @__PURE__ */ z("section", {
		"aria-label": a("Console"),
		className: k("relative shrink-0 flex-col border-t border-border bg-bg", e ? "flex" : "hidden"),
		style: { height: t },
		children: [
			/* @__PURE__ */ R(S, {
				grows: "up",
				value: t,
				min: 120,
				max: Math.round(window.innerHeight * .75),
				onResize: (e) => n(Math.max(120, Math.min(e, Math.round(window.innerHeight * .75)))),
				onReset: () => n(240),
				label: a("Resize Console"),
				className: "-top-1"
			}),
			/* @__PURE__ */ z("div", {
				className: "flex h-9 shrink-0 items-center gap-1 border-b border-border pl-3 pr-1.5",
				children: [
					/* @__PURE__ */ R("h2", {
						className: "m-0 text-xs font-medium text-ink",
						children: a("Console")
					}),
					/* @__PURE__ */ R("form", {
						className: "ml-2 flex min-w-0 flex-1 items-center",
						onSubmit: (e) => {
							e.preventDefault(), B(C);
						},
						children: /* @__PURE__ */ R("input", {
							"aria-label": a("Page"),
							value: C,
							onChange: (e) => w(e.target.value),
							onBlur: () => w(b),
							spellCheck: !1,
							className: "cms-input h-6 w-full max-w-64 min-w-0 rounded-sm px-2 font-mono text-2xs"
						})
					}),
					/* @__PURE__ */ R(g, {
						icon: "refresh",
						size: "xs",
						label: a("Reload Page"),
						onClick: () => E((e) => e + 1)
					}),
					/* @__PURE__ */ R(g, {
						icon: A ? "eye-off" : "eye",
						size: "xs",
						label: a(A ? "Hide Page" : "Show Page"),
						onClick: () => j(!A)
					}),
					/* @__PURE__ */ R(g, {
						icon: "slash",
						size: "xs",
						label: a("Clear Console"),
						shortcut: "ctrl+l",
						onClick: () => O([])
					}),
					/* @__PURE__ */ R(g, {
						icon: "close",
						size: "xs",
						label: a("Close Console"),
						shortcut: "ctrl+`",
						onClick: r
					})
				]
			}),
			/* @__PURE__ */ z("div", {
				className: "relative flex min-h-0 flex-1",
				children: [/* @__PURE__ */ z("div", {
					className: "flex min-h-0 min-w-0 flex-1 flex-col",
					children: [/* @__PURE__ */ R("div", {
						ref: p,
						role: "log",
						"aria-label": a("Console Messages"),
						onScroll: (e) => {
							let t = e.currentTarget;
							I.current = t.scrollHeight - t.scrollTop - t.clientHeight < 24;
						},
						className: "min-h-0 flex-1 overflow-y-auto font-mono text-2xs leading-4",
						children: D.length === 0 && v ? /* @__PURE__ */ R(m, {
							compact: !0,
							icon: "terminal",
							title: a("Nothing logged")
						}) : D.map((e) => /* @__PURE__ */ R(Y, {
							entry: e,
							onOpen: o
						}, e.id))
					}), /* @__PURE__ */ z("label", {
						className: "flex shrink-0 items-start gap-2 border-t border-border px-3 py-1.5",
						children: [/* @__PURE__ */ R(h, {
							name: "chevron-right",
							size: 12,
							className: "mt-0.5 shrink-0 text-focus"
						}), /* @__PURE__ */ R("textarea", {
							"aria-label": a("Run on the Page"),
							value: M,
							rows: Math.min(6, M.split("\n").length),
							onChange: (e) => N(e.target.value),
							onKeyDown: ee,
							spellCheck: !1,
							autoCapitalize: "off",
							autoComplete: "off",
							className: "min-w-0 flex-1 resize-none bg-transparent font-mono text-2xs leading-4 text-text outline-none"
						})]
					})]
				}), /* @__PURE__ */ R("div", {
					className: k("min-h-0 border-border bg-white", A ? "w-[45%] shrink-0 border-l max-md:absolute max-md:inset-0 max-md:w-full max-md:border-l-0" : "pointer-events-none invisible absolute inset-0"),
					children: v && /* @__PURE__ */ R("iframe", {
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
var ue = {
	error: "bg-danger-soft text-danger",
	warn: "bg-warning-soft text-ink",
	debug: "text-muted",
	result: "text-muted"
}, J = {
	error: "x-circle",
	warn: "warning",
	input: "chevron-right",
	result: "chevron-left"
};
function Y({ entry: e, onOpen: t }) {
	if (e.level === "page") return /* @__PURE__ */ z("div", {
		className: "flex items-center gap-2 border-b border-border px-3 py-1 text-faint",
		children: [/* @__PURE__ */ R(h, {
			name: "arrow-right",
			size: 12
		}), a("Ran {page}", { page: e.text })]
	});
	let n = e.source ? ae(e.source.url) : null, r = e.source ? `${n ? H(n).title : e.source.url.split("/").pop()?.split("?")[0]}${e.source.line ? `:${e.source.line}` : ""}` : null, i = J[e.level], o = e.text.length > 160 || e.text.includes("\n"), s = /* @__PURE__ */ R("span", {
		className: "min-w-0 flex-1 whitespace-pre-wrap break-words",
		children: e.text
	});
	return /* @__PURE__ */ z("div", {
		className: k("flex items-start gap-2 border-b border-border px-3 py-1", ue[e.level]),
		children: [
			/* @__PURE__ */ R("span", {
				className: "grid size-4 shrink-0 place-items-center",
				children: i && /* @__PURE__ */ R(h, {
					name: i,
					size: 12,
					className: e.level === "input" ? "text-focus" : e.level === "warn" ? "text-warning" : void 0
				})
			}),
			e.detail || o ? /* @__PURE__ */ z("details", {
				className: "group/more min-w-0 flex-1",
				children: [/* @__PURE__ */ z("summary", {
					className: "flex cursor-default items-start gap-1",
					children: [/* @__PURE__ */ R(h, {
						name: "chevron-right",
						size: 12,
						className: "mt-0.5 shrink-0 text-faint transition-transform duration-fast group-open/more:rotate-90"
					}), /* @__PURE__ */ R("span", {
						className: "min-w-0 flex-1 truncate group-open/more:whitespace-pre-wrap group-open/more:break-words",
						children: e.text
					})]
				}), e.detail && /* @__PURE__ */ R("pre", {
					className: "m-0 mt-1 whitespace-pre-wrap break-words pl-4 text-muted",
					children: e.detail
				})]
			}) : s,
			e.count > 1 && /* @__PURE__ */ R("span", {
				className: "shrink-0 rounded-full bg-active px-1.5 text-faint",
				children: e.count
			}),
			r && (n ? /* @__PURE__ */ R(b, {
				compact: !0,
				onClick: () => t(n, e.source?.line, e.source?.column),
				className: "shrink-0 rounded-xs text-faint underline-offset-2 hover:text-text hover:underline",
				children: r
			}) : /* @__PURE__ */ R("span", {
				className: "shrink-0 text-faint",
				children: r
			}))
		]
	});
}
// admin/src/code/EditorTabs.tsx
function de({ tabs: e, active: t, dirty: n, onSelect: r, onClose: i }) {
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
	return /* @__PURE__ */ R("div", {
		ref: o,
		role: "tablist",
		"aria-label": a("Open Files"),
		className: "flex h-9 shrink-0 overflow-x-auto overflow-y-hidden border-b border-border bg-sunken",
		children: e.map((e, o) => {
			let c = H(e), l = e === t, u = n(e);
			return /* @__PURE__ */ z("div", {
				className: k("cms-reveal-row group/tab relative flex shrink-0 items-center border-r border-border", l ? "-mb-px bg-bg text-ink" : "text-muted hover:text-text"),
				children: [/* @__PURE__ */ z(b, {
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
					children: [/* @__PURE__ */ R(h, {
						name: c.icon,
						size: 14,
						className: "shrink-0 text-faint"
					}), /* @__PURE__ */ R("span", {
						className: "whitespace-nowrap",
						children: c.title
					})]
				}), /* @__PURE__ */ z("span", {
					className: "relative mr-1 size-6",
					children: [u && /* @__PURE__ */ R("span", {
						role: "img",
						"aria-label": a("Unsaved changes"),
						className: "absolute inset-0 m-auto size-2 rounded-full bg-focus group-focus-within/tab:hidden group-hover/tab:hidden"
					}), /* @__PURE__ */ R("span", {
						className: k("absolute inset-0", u ? "hidden group-focus-within/tab:block group-hover/tab:block" : !l && "cms-reveal"),
						children: /* @__PURE__ */ R(g, {
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
function fe(e, t) {
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
function pe(e, t) {
	try {
		window.localStorage.setItem(e, JSON.stringify(t));
	} catch {}
}
var me = "cms:code:tabs", he = "cms:code:panel";
function X() {
	let e = o("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), n = o("styling-code/list"), r = o("styling-vendor/list"), l = re(e.data, () => e.refetch()), { query: f } = s(), p = ye(), v = t("site.code"), S = t("settings.manage"), [w, T] = d(() => fe(me, { open: ["css"] }).open), E = f.file ?? (p ? null : w[0] ?? null);
	c(() => {
		let e = f.file;
		e && T((t) => t.includes(e) ? t : [...t, e]);
	}, [f.file]), c(() => pe(me, { open: w }), [w]);
	let A = (e) => i({ file: e ?? void 0 }, !1), j = (e) => {
		w.includes(e) || T((t) => [...t, e]), A(e);
	}, N = (e) => {
		let t = w.indexOf(e), n = w.filter((t) => t !== e);
		T(n), E === e && A(n[Math.min(t, n.length - 1)] ?? null);
	}, [I, L] = d(() => fe(he, {
		open: !1,
		height: 240
	}));
	c(() => pe(he, I), [I]);
	let [B, te] = d({
		errors: 0,
		warnings: 0
	}), [U, ie] = d(0), W = () => L((e) => ({
		...e,
		open: !e.open
	})), G = u(/* @__PURE__ */ new Map()), [ae, oe] = d({}), [K, se] = d({}), q = (e, t, n) => {
		if (j(e), !t) return;
		let r = 0, i = () => {
			let a = G.current.get(e);
			a ? a.goTo(t, n) : r++ < 120 && requestAnimationFrame(i);
		};
		requestAnimationFrame(i);
	}, ce = async () => {
		let e = await l.save();
		if (!e) return;
		ie((e) => e + 1);
		let t = e[0];
		t && P(a("{name} was saved as written: {problem}", {
			name: H(t.id).title,
			problem: t.message
		}), {
			duration: 8e3,
			action: t.line ? {
				label: a("Show Line"),
				onClick: () => q(t.id, t.line, t.column)
			} : void 0
		});
	}, ue = async (e) => {
		let t = await l.format(e);
		if (t.mistake) return void P.error(a("{name} can’t be formatted: {problem}", {
			name: H(e).title,
			problem: t.mistake.message
		}));
		t.text !== l.text(e) && l.edit(e, t.text);
	}, J = ge({
		files: n,
		docs: l,
		open: j,
		close: N
	}), Y = E ? H(E) : null, X = !!Y && M(Y.language) && (E === "css" ? S : v);
	if (F("ctrl+`", W, !0, a("Toggle Console"), a("Code")), F("alt+shift+f", () => {
		E && X && ue(E);
	}, X, a("Format Document"), a("Code")), F("alt+mod+arrowright", () => {
		E && A(w[(w.indexOf(E) + 1) % w.length]);
	}, w.length > 1 && !p, a("Next Tab"), a("Code")), F("alt+mod+arrowleft", () => {
		E && A(w[(w.indexOf(E) - 1 + w.length) % w.length]);
	}, w.length > 1 && !p, a("Previous Tab"), a("Code")), e.isLoading) return /* @__PURE__ */ R("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ R(D, {})
	});
	if (!e.data) return /* @__PURE__ */ z("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ R(O, { crumbs: [{
			label: a("Code"),
			icon: "code"
		}] }), /* @__PURE__ */ R(x, {
			title: a("Couldn’t load the code"),
			onRetry: () => void e.refetch(),
			retrying: e.isRefetching
		})]
	});
	let Z = E?.startsWith("library:") ? r.data?.imports.find((e) => `library:${e.import}` === E) : void 0, Q = [...Y?.language ? [{
		label: a("Format Document"),
		icon: "wand",
		shortcut: "alt+shift+f",
		disabled: !X,
		onSelect: () => void ue(E)
	}] : [], ...E && V(E) ? J.fileMenu(E) : Z ? J.libraryMenu(Z.import) : []], $ = l.problem;
	return /* @__PURE__ */ z("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ R(O, {
				divided: !0,
				back: p && f.file ? {
					to: "/code",
					label: a("Code")
				} : void 0,
				crumbs: [{ label: p && Y ? Y.title : a("Code") }],
				actions: /* @__PURE__ */ z(ee, { children: [/* @__PURE__ */ R(g, {
					icon: "terminal",
					size: "sm",
					label: I.open ? a("Hide Console") : a("Show Console"),
					shortcut: "ctrl+`",
					active: I.open,
					onClick: W
				}), Q.length > 0 && /* @__PURE__ */ R(_, {
					align: "end",
					trigger: /* @__PURE__ */ R(g, {
						icon: "more",
						size: "sm",
						label: a("File Actions")
					}),
					items: Q
				})] })
			}),
			/* @__PURE__ */ R(C, {
				dirty: l.dirtyIds.length > 0,
				saving: l.saving,
				error: $ ? $.refused ? a("The CSS was not saved") : $.message : null,
				onSave: () => void ce(),
				onDiscard: l.discard
			}),
			!v && /* @__PURE__ */ R(y, {
				tone: "neutral",
				className: "mx-4 mb-2",
				title: a("Editing code needs the “Edit Scripts and Stylesheets” permission.")
			}),
			$?.refused && /* @__PURE__ */ R(y, {
				tone: "danger",
				className: "mx-4 mb-2",
				title: a("Tailwind refused the CSS"),
				onDismiss: l.clearProblem,
				children: $.message
			}),
			/* @__PURE__ */ z("div", {
				className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(220px,260px)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ R("div", {
					className: k("min-h-0 overflow-y-auto border-border pt-3 md:border-r", p && f.file && "hidden"),
					children: /* @__PURE__ */ R(_e, {
						files: n,
						libraries: r,
						docs: l,
						active: E,
						onOpen: j,
						actions: J,
						code: v
					})
				}), /* @__PURE__ */ z("div", {
					className: k("flex min-h-0 min-w-0 flex-col", p && !f.file && "hidden"),
					children: [
						!p && w.length > 0 && /* @__PURE__ */ R(de, {
							tabs: w,
							active: E,
							dirty: l.isDirty,
							onSelect: A,
							onClose: N
						}),
						/* @__PURE__ */ z("div", {
							className: "relative min-h-0 flex-1",
							children: [w.map((e) => /* @__PURE__ */ R("div", {
								className: k("absolute inset-0 flex flex-col", e !== E && "hidden"),
								children: /* @__PURE__ */ R(ve, {
									id: e,
									docs: l,
									library: r.data?.imports.find((t) => `library:${t.import}` === e),
									librariesLoaded: !!r.data,
									disabled: e === "css" ? !S : !v,
									fetching: J.fetching,
									onUpdateLibrary: J.updateLibrary,
									editorRef: (t) => {
										t ? G.current.set(e, t) : G.current.delete(e);
									},
									onCursor: (t) => oe((n) => ({
										...n,
										[e]: t
									})),
									onErrors: (t) => se((n) => ({
										...n,
										[e]: t
									}))
								})
							}, e)), !E && !p && /* @__PURE__ */ R(m, {
								icon: "code",
								title: a("No file open")
							})]
						}),
						/* @__PURE__ */ R(le, {
							open: I.open,
							height: p ? Math.min(I.height, 320) : I.height,
							onHeight: (e) => L((t) => ({
								...t,
								height: e
							})),
							onClose: () => L((e) => ({
								...e,
								open: !1
							})),
							saved: U,
							onOpen: q,
							onCounts: te
						}),
						/* @__PURE__ */ z("div", {
							className: "flex h-7 shrink-0 items-center gap-3 border-t border-border bg-sunken px-2 text-2xs text-muted",
							children: [
								/* @__PURE__ */ z(b, {
									compact: !0,
									onClick: W,
									"aria-label": a("{errors} errors, {warnings} warnings: Toggle Console", { ...B }),
									className: "flex h-6 items-center gap-2 rounded-sm px-1.5 hover:bg-hover hover:text-text",
									children: [/* @__PURE__ */ z("span", {
										className: k("flex items-center gap-1", B.errors > 0 && "text-danger"),
										children: [/* @__PURE__ */ R(h, {
											name: "x-circle",
											size: 12
										}), B.errors]
									}), /* @__PURE__ */ z("span", {
										className: k("flex items-center gap-1", B.warnings > 0 && "text-warning"),
										children: [/* @__PURE__ */ R(h, {
											name: "warning",
											size: 12
										}), B.warnings]
									})]
								}),
								/* @__PURE__ */ R("span", { className: "flex-1" }),
								E && !!K[E] && /* @__PURE__ */ R("span", {
									role: "status",
									className: "text-danger",
									children: K[E] === 1 ? a("1 error") : a("{count} errors", { count: K[E] })
								}),
								E && ae[E] && Y?.language && /* @__PURE__ */ R("span", { children: a("Ln {line}, Col {column}", { ...ae[E] }) }),
								Y?.language && /* @__PURE__ */ R("span", { children: ne(Y.language) })
							]
						})
					]
				})]
			})
		]
	});
}
function ge({ files: e, docs: i, open: o, close: s }) {
	let [c, l] = d(null), u = t("site.code"), f = async (e, t) => {
		try {
			return await e(), n("styling-code/", "styling-vendor/"), P.success(t), !0;
		} catch (e) {
			return P.error(e), !1;
		}
	}, p = async (t) => {
		let n = await N({
			title: a(t === "scripts" ? "New Script" : "New Stylesheet"),
			fields: [{
				handle: "name",
				type: "text",
				label: a("Name"),
				mono: !0,
				autofocus: !0,
				placeholder: "hero"
			}],
			confirm: a(t === "scripts" ? "Create Script" : "Create Stylesheet")
		}), i = String(n?.name ?? "").trim().toLowerCase().replace(/\.(js|css)$/, "").replace(/\s+/g, "-");
		if (!i) return;
		if ((e.data?.[t] ?? []).includes(i)) return void P.error(a("“{name}” already exists", { name: i }));
		let s = `${t}/${i}.${B[t]}`;
		await f(() => r("styling-code/save", {
			path: s,
			contents: te[t]
		}), a("{name} added", { name: `${i}.${B[t]}` })) && o(s);
	}, m = async (e) => {
		let t = H(e).title;
		await A({
			title: a("Delete “{name}”?", { name: t }),
			confirm: a("Delete File"),
			danger: !0
		}) && await f(() => r("styling-code/delete", { path: e }), a("{name} deleted", { name: t })) && (s(e), i.forget(e));
	}, h = async () => {
		let e = await N({
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
		await A({
			title: a("Delete “{name}”?", { name: e }),
			confirm: a("Delete Library"),
			danger: !0
		}) && await f(() => r("styling-vendor/delete", { import: e }), a("{name} deleted", { name: e })) && s(`library:${e}`);
	};
	return {
		fetching: c,
		addFile: p,
		addLibrary: h,
		updateLibrary: g,
		fileMenu: (e) => u ? [{
			label: a("Delete File"),
			icon: "trash",
			danger: !0,
			onSelect: () => void m(e)
		}] : [],
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
		] : []
	};
}
function _e({ files: e, libraries: t, docs: n, active: r, onOpen: i, actions: o, code: s }) {
	let c = (e) => e ? /* @__PURE__ */ R("span", {
		className: "size-1.5 rounded-full bg-focus",
		"aria-label": a("Unsaved changes"),
		role: "img"
	}) : void 0, l = (e, t = [], a) => {
		let o = H(e);
		return /* @__PURE__ */ R(T, {
			label: o.title,
			icon: o.icon,
			active: r === e,
			onClick: () => i(e),
			status: c(n.isDirty(e)),
			badge: a,
			actions: t.map((e) => ({
				...e,
				quick: e.icon === "trash"
			}))
		}, e);
	}, u = (t) => (e.data?.[t] ?? []).map((e) => l(`${t}/${e}.${B[t]}`, o.fileMenu(`${t}/${e}.${B[t]}`)));
	return /* @__PURE__ */ z("nav", {
		"aria-label": a("Files"),
		className: "px-2 pb-4",
		children: [
			/* @__PURE__ */ z(w, {
				title: a("Stylesheets"),
				action: s && /* @__PURE__ */ R(Q, {
					label: a("New Stylesheet"),
					onAdd: () => void o.addFile("styles")
				}),
				children: [l("css"), e.isError ? /* @__PURE__ */ R(x, {
					compact: !0,
					onRetry: () => void e.refetch(),
					retrying: e.isRefetching
				}) : e.data ? u("styles") : /* @__PURE__ */ R(Z, {})]
			}),
			/* @__PURE__ */ z(w, {
				title: a("Scripts"),
				action: s && /* @__PURE__ */ R(Q, {
					label: a("New Script"),
					onAdd: () => void o.addFile("scripts")
				}),
				children: [l("js"), e.isError ? null : e.data ? u("scripts") : /* @__PURE__ */ R(Z, {})]
			}),
			/* @__PURE__ */ R(w, {
				title: a("Libraries"),
				action: s && /* @__PURE__ */ R(Q, {
					label: a("Add Library"),
					onAdd: () => void o.addLibrary(),
					busy: o.fetching === "add"
				}),
				children: t.isError ? /* @__PURE__ */ R(x, {
					compact: !0,
					onRetry: () => void t.refetch(),
					retrying: t.isRefetching
				}) : t.data ? t.data.imports.map((e) => l(`library:${e.import}`, o.libraryMenu(e.import), o.fetching === e.import ? /* @__PURE__ */ R(D, { size: 12 }) : e.version)) : /* @__PURE__ */ R(Z, {})
			})
		]
	});
}
function ve({ id: e, docs: n, library: r, librariesLoaded: i, disabled: s, fetching: l, onUpdateLibrary: u, editorRef: d, onCursor: m, onErrors: h }) {
	let g = H(e), _ = V(e), y = o("styling-code/get", { path: e }, {
		enabled: _,
		staleTime: 0
	});
	if (c(() => {
		y.data && n.loaded(e, y.data.contents);
	}, [e, y.data]), g.library) return r ? /* @__PURE__ */ z("div", {
		className: "space-y-1 p-4 text-sm",
		children: [
			/* @__PURE__ */ R("p", {
				className: "m-0 font-mono text-ink",
				children: r.package
			}),
			/* @__PURE__ */ R("p", {
				className: "m-0 font-mono text-xs text-muted",
				children: r.version
			}),
			t("site.code") && /* @__PURE__ */ R(f, {
				icon: "refresh",
				loading: l === r.import,
				disabled: !!l,
				onClick: () => u(r.import),
				className: "!mt-4",
				children: a("Update")
			})
		]
	}) : i ? /* @__PURE__ */ R(v, {}) : null;
	if (_ && y.isError) return /* @__PURE__ */ R(x, {
		compact: !0,
		onRetry: () => void y.refetch(),
		retrying: y.isRefetching
	});
	let b = n.text(e);
	return b === void 0 ? /* @__PURE__ */ R(E, { className: "m-4 h-full rounded-md" }) : /* @__PURE__ */ R(p, {
		fill: !0,
		bare: !0,
		ref: d,
		label: g.title,
		language: g.language,
		value: b,
		disabled: s,
		onChange: (t) => n.edit(e, t),
		onCursor: m,
		onErrors: h,
		placeholder: e === "css" ? ".hero-title { text-wrap: balance; }" : e === "js" ? "document.addEventListener('cms:alpine', (e) => …)" : void 0
	});
}
function ye() {
	let [e, t] = d(() => window.matchMedia("(max-width: 767px)").matches);
	return c(() => {
		let e = window.matchMedia("(max-width: 767px)"), n = () => t(e.matches);
		return e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
var Z = () => /* @__PURE__ */ z("div", {
	className: "space-y-2 py-2 pl-2",
	children: [/* @__PURE__ */ R(E, { className: "h-3 w-32" }), /* @__PURE__ */ R(E, { className: "h-3 w-24" })]
});
function Q({ label: e, onAdd: t, busy: n }) {
	return n ? /* @__PURE__ */ R("span", {
		role: "status",
		"aria-label": a("Working…"),
		className: "grid size-6 place-items-center text-faint",
		children: /* @__PURE__ */ R(D, { size: 14 })
	}) : /* @__PURE__ */ R(g, {
		icon: "plus",
		size: "xs",
		label: e,
		onClick: t
	});
}
export { X as default };
