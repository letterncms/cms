import { CmsError as e, can as t, invalidate as n, run as r, setQuery as i, t as a, useAbility as o, useLocation as s } from "@letterncms/sdk";
import { useEffect as c, useMemo as l, useRef as u, useState as d } from "react";
import { Button as f, CodeEditor as p, IconButton as m, Menu as h, NotFoundState as ee, Notice as g, QueryError as _, SaveBar as te, SidebarRow as ne, Skeleton as v, Spinner as y, Topbar as b, cn as x, confirm as S, prompt as C, toast as w } from "@letterncms/ui";
import { Stylesheet as T, balanced as E } from "@letterncms/blocks";
import { Fragment as D, jsx as O, jsxs as k } from "react/jsx-runtime";
// admin/src/Code.tsx
var A = { files: {} }, re = {
	scripts: "export function mount(el, props) {\n}\n",
	styles: "\n"
}, j = {
	scripts: "js",
	styles: "css"
};
function M() {
	let l = o("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), u = o("styling-code/list"), m = o("styling-vendor/list"), [h, v] = d(A), [T, E] = d(!1), [D, M] = d(null), [I, L] = d(null), { query: oe } = s(), [R, se] = d(() => window.matchMedia("(max-width: 767px)").matches);
	c(() => {
		let e = window.matchMedia("(max-width: 767px)"), t = () => se(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let z = oe.file ?? (R ? null : "css"), B = (e) => i({ file: e === "css" && !R ? null : e }, !1), V = t("site.code"), ce = t("settings.manage"), H = l.data, U = !!H && (h.css !== void 0 && h.css !== H.css || h.js !== void 0 && h.js !== H.js || Object.keys(h.files).length > 0), W = (e, t) => v((n) => ({
		...n,
		files: t === null ? Object.fromEntries(Object.entries(n.files).filter(([t]) => t !== e)) : {
			...n.files,
			[e]: t
		}
	}));
	if (l.isLoading) return /* @__PURE__ */ O("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ O(y, {})
	});
	if (!H) return /* @__PURE__ */ k("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ O(b, { crumbs: [{
			label: a("Code"),
			icon: "code"
		}] }), /* @__PURE__ */ O(_, {
			title: a("Couldn’t load the code"),
			onRetry: () => void l.refetch(),
			retrying: l.isRefetching
		})]
	});
	let le = async () => {
		if (U && !T) {
			E(!0), M(null);
			try {
				h.css !== void 0 && h.css !== H.css && await r("styling/update", { css: h.css }), h.js !== void 0 && h.js !== H.js && await r("styling-code/set-custom", { js: h.js });
				for (let [e, t] of Object.entries(h.files)) await r("styling-code/save", {
					path: e,
					contents: t
				});
				await l.refetch(), n("styling/", "styling-code/"), v(A);
			} catch (t) {
				M({
					message: t instanceof Error ? t.message : String(t),
					refused: t instanceof e && t.type === "invalid_input"
				});
			} finally {
				E(!1);
			}
		}
	}, G = async (e, t) => {
		try {
			return await e(), n("styling-code/", "styling-vendor/"), w.success(t), !0;
		} catch (e) {
			return w.error(e), !1;
		}
	}, K = async (e) => {
		let t = await C({
			title: a(e === "scripts" ? "New Script" : "New Stylesheet"),
			fields: [{
				handle: "name",
				type: "text",
				label: a("Name"),
				mono: !0,
				autofocus: !0,
				placeholder: "hero"
			}],
			confirm: a(e === "scripts" ? "Create Script" : "Create Stylesheet")
		}), n = String(t?.name ?? "").trim().toLowerCase().replace(/\.(js|css)$/, "").replace(/\s+/g, "-");
		if (!n) return;
		if ((u.data?.[e] ?? []).includes(n)) return void w.error(a("“{name}” already exists", { name: n }));
		let i = `${e}/${n}.${j[e]}`;
		await G(() => r("styling-code/save", {
			path: i,
			contents: re[e]
		}), a("{name} added", { name: `${n}.${j[e]}` })) && B(i);
	}, ue = async (e, t) => {
		await S({
			title: a("Delete “{name}”?", { name: t }),
			confirm: a("Delete"),
			danger: !0
		}) && await G(() => r("styling-code/delete", { path: e }), a("{name} deleted", { name: t })) && (W(e, null), z === e && B(R ? null : "css"));
	}, de = async () => {
		let e = await C({
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
		t && (L("add"), await G(() => r("styling-vendor/create", { package: t }), a("{name} added", { name: t })), L(null));
	}, q = async (e) => {
		L(e), await G(() => r("styling-vendor/update", { import: e }), a("{name} updated", { name: e })), L(null);
	}, fe = async (e) => {
		await S({
			title: a("Delete “{name}”?", { name: e }),
			confirm: a("Delete"),
			danger: !0
		}) && await G(() => r("styling-vendor/delete", { import: e }), a("{name} deleted", { name: e })) && z === `library:${e}` && B(R ? null : "css");
	}, J = (e, t) => V ? [{
		label: a("Delete"),
		icon: "trash",
		danger: !0,
		onSelect: () => void ue(e, t)
	}] : [], Y = (e) => V ? [
		{
			label: a("Update"),
			icon: "refresh",
			disabled: !!I,
			onSelect: () => void q(e)
		},
		{
			separator: !0,
			label: ""
		},
		{
			label: a("Delete"),
			icon: "trash",
			danger: !0,
			disabled: !!I,
			onSelect: () => void fe(e)
		}
	] : [], pe = (e) => e ? /* @__PURE__ */ O("span", {
		className: "size-1.5 rounded-full bg-focus",
		"aria-label": a("Unsaved changes"),
		role: "img"
	}) : void 0, X = (e, t, n, r, i = [], a) => /* @__PURE__ */ O(ne, {
		label: t,
		icon: n,
		active: z === e,
		onClick: () => B(e),
		status: pe(r),
		badge: a,
		actions: i.map((e) => ({
			...e,
			quick: e.icon === "trash"
		}))
	}, e), Z = (e) => (u.data?.[e] ?? []).map((t) => {
		let n = `${e}/${t}.${j[e]}`;
		return X(n, `${t}.${j[e]}`, "file", n in h.files, J(n, `${t}.${j[e]}`));
	}), me = /* @__PURE__ */ k("nav", {
		"aria-label": a("Code"),
		className: "space-y-4 px-2 pb-8 pt-2",
		children: [
			!V && /* @__PURE__ */ O(g, {
				tone: "neutral",
				title: a("Editing code needs the “Edit Scripts and Stylesheets” permission.")
			}),
			/* @__PURE__ */ k(P, {
				title: a("Stylesheets"),
				add: V ? {
					label: a("New Stylesheet"),
					onAdd: () => void K("styles")
				} : void 0,
				children: [X("css", a("Site CSS"), "braces", h.css !== void 0 && h.css !== H.css), u.isError ? /* @__PURE__ */ O(_, {
					compact: !0,
					onRetry: () => void u.refetch(),
					retrying: u.isRefetching
				}) : u.data ? Z("styles") : /* @__PURE__ */ O(N, {})]
			}),
			/* @__PURE__ */ k(P, {
				title: a("Scripts"),
				add: V ? {
					label: a("New Script"),
					onAdd: () => void K("scripts")
				} : void 0,
				children: [X("js", a("Site JavaScript"), "braces", h.js !== void 0 && h.js !== H.js), u.isError ? null : u.data ? Z("scripts") : /* @__PURE__ */ O(N, {})]
			}),
			/* @__PURE__ */ O(P, {
				title: a("Libraries"),
				add: V ? {
					label: a("Add Library"),
					onAdd: () => void de(),
					busy: I === "add"
				} : void 0,
				children: m.isError ? /* @__PURE__ */ O(_, {
					compact: !0,
					onRetry: () => void m.refetch(),
					retrying: m.isRefetching
				}) : m.data ? m.data.imports.map((e) => X(`library:${e.import}`, e.import, "box", !1, Y(e.import), I === e.import ? /* @__PURE__ */ O(y, { size: 12 }) : e.version)) : /* @__PURE__ */ O(N, {})
			})
		]
	}), Q = z?.startsWith("library:") ? m.data?.imports.find((e) => `library:${e.import}` === z) : void 0, $ = z && /^(scripts|styles)\//.test(z) ? z : null, he = z ? z === "css" ? /* @__PURE__ */ O(F, {
		title: a("Site CSS"),
		onBack: () => B(null),
		children: /* @__PURE__ */ O(ae, {
			css: h.css ?? H.css,
			disabled: !ce,
			onChange: (e) => v((t) => ({
				...t,
				css: e
			}))
		})
	}) : z === "js" ? /* @__PURE__ */ O(F, {
		title: a("Site JavaScript"),
		onBack: () => B(null),
		children: /* @__PURE__ */ O(p, {
			fill: !0,
			label: a("Site JavaScript"),
			language: "javascript",
			value: h.js ?? H.js,
			onChange: (e) => v((t) => ({
				...t,
				js: e
			})),
			disabled: !V,
			placeholder: "document.addEventListener('cms:alpine', (e) => …)"
		})
	}) : $ ? /* @__PURE__ */ O(F, {
		title: $.split("/").pop() ?? $,
		mono: !0,
		onBack: () => B(null),
		menu: J($, $.split("/").pop() ?? $),
		children: V ? /* @__PURE__ */ O(ie, {
			path: $,
			edited: h.files[$],
			onEdit: (e) => W($, e)
		}) : /* @__PURE__ */ O(g, {
			tone: "neutral",
			title: a("Editing code needs the “Edit Scripts and Stylesheets” permission.")
		})
	}) : Q ? /* @__PURE__ */ O(F, {
		title: Q.import,
		mono: !0,
		onBack: () => B(null),
		menu: Y(Q.import),
		children: /* @__PURE__ */ k("div", {
			className: "space-y-1 text-sm",
			children: [
				/* @__PURE__ */ O("p", {
					className: "m-0 font-mono text-ink",
					children: Q.package
				}),
				/* @__PURE__ */ O("p", {
					className: "m-0 font-mono text-xs text-muted",
					children: Q.version
				}),
				V && /* @__PURE__ */ O(f, {
					icon: "refresh",
					loading: I === Q.import,
					disabled: !!I,
					onClick: () => void q(Q.import),
					className: "!mt-4",
					children: a("Update")
				})
			]
		})
	}) : m.data && u.data ? /* @__PURE__ */ O(ee, {}) : null : null;
	return /* @__PURE__ */ k("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ O(b, { crumbs: [{
				label: a("Code"),
				icon: "code"
			}] }),
			/* @__PURE__ */ O(te, {
				dirty: U,
				saving: T,
				error: D ? D.refused ? a("The CSS was not saved") : D.message : null,
				onSave: () => void le(),
				onDiscard: () => {
					v(A), M(null);
				}
			}),
			D?.refused && /* @__PURE__ */ O(g, {
				tone: "danger",
				className: "mx-4 mb-2",
				title: a("Tailwind refused the CSS"),
				onDismiss: () => M(null),
				children: D.message
			}),
			/* @__PURE__ */ k("div", {
				className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[15rem_minmax(0,1fr)]",
				children: [/* @__PURE__ */ O("div", {
					className: x("min-h-0 overflow-y-auto border-border bg-surface md:border-r", z && "max-md:hidden"),
					children: me
				}), /* @__PURE__ */ O("div", {
					className: x("flex min-h-0 min-w-0 flex-col", !z && "max-md:hidden"),
					children: he
				})]
			})
		]
	});
}
var N = () => /* @__PURE__ */ k("div", {
	className: "space-y-2 px-2 py-2",
	children: [/* @__PURE__ */ O(v, { className: "h-3 w-32" }), /* @__PURE__ */ O(v, { className: "h-3 w-24" })]
});
function P({ title: e, add: t, children: n }) {
	return /* @__PURE__ */ k("section", { children: [/* @__PURE__ */ k("div", {
		className: "flex h-8 items-center justify-between pl-2",
		children: [/* @__PURE__ */ O("h2", {
			className: "cms-label m-0",
			children: e
		}), t && (t.busy ? /* @__PURE__ */ O("span", {
			role: "status",
			"aria-label": a("Working…"),
			className: "grid size-6 place-items-center text-faint",
			children: /* @__PURE__ */ O(y, { size: 14 })
		}) : /* @__PURE__ */ O(m, {
			icon: "plus",
			size: "xs",
			label: t.label,
			onClick: t.onAdd
		}))]
	}), /* @__PURE__ */ O("div", {
		className: "space-y-px",
		children: n
	})] });
}
function F({ title: e, mono: t, onBack: n, menu: r = [], children: i }) {
	return /* @__PURE__ */ k(D, { children: [/* @__PURE__ */ k("div", {
		className: "flex h-11 shrink-0 items-center gap-1 border-b border-border px-4 max-md:pl-2",
		children: [
			/* @__PURE__ */ O(m, {
				icon: "arrow-left",
				size: "sm",
				label: a("Back"),
				onClick: n,
				className: "md:hidden"
			}),
			/* @__PURE__ */ O("h1", {
				className: x("m-0 min-w-0 flex-1 truncate text-sm font-medium text-ink", t && "font-mono"),
				children: e
			}),
			r.length > 0 && /* @__PURE__ */ O(h, {
				align: "end",
				trigger: /* @__PURE__ */ O(m, {
					icon: "more",
					size: "sm",
					label: a("File Actions")
				}),
				items: r
			})
		]
	}), /* @__PURE__ */ O("div", {
		className: "min-h-0 flex-1 p-4",
		children: i
	})] });
}
function ie({ path: e, edited: t, onEdit: n }) {
	let r = o("styling-code/get", { path: e }, {
		enabled: t === void 0,
		staleTime: 0
	});
	return r.isError ? /* @__PURE__ */ O(_, {
		compact: !0,
		onRetry: () => void r.refetch(),
		retrying: r.isRefetching
	}) : t === void 0 && !r.data ? /* @__PURE__ */ O(v, { className: "h-full w-full rounded-md" }) : /* @__PURE__ */ O(p, {
		fill: !0,
		label: e,
		language: e.endsWith(".css") ? "css" : "javascript",
		value: t ?? r.data?.contents ?? "",
		onChange: n
	}, e);
}
function ae({ css: e, onChange: t, disabled: n }) {
	let r = l(() => new T(e), [e]), i = l(() => r.extra(), [r]), [o, s] = d(i), f = u(i);
	return c(() => {
		i !== f.current && (f.current = i, s(i));
	}, [i]), /* @__PURE__ */ O(p, {
		fill: !0,
		label: a("Site CSS"),
		language: "tailwind",
		placeholder: ".hero-title { text-wrap: balance; }",
		value: o,
		disabled: n,
		onChange: (e) => {
			if (s(e), !E(e)) return;
			let n = r.setExtra(e);
			f.current = n.extra(), t(n.css);
		}
	});
}
export { M as default };
