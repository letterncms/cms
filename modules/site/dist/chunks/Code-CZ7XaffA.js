import { CmsError as e, can as t, invalidate as n, run as r, setQuery as i, t as a, useAbility as o, useLocation as s } from "@letterncms/sdk";
import { useEffect as c, useMemo as l, useRef as u, useState as d } from "react";
import { Button as f, CodeEditor as p, IconButton as m, Menu as ee, NotFoundState as te, Notice as h, QueryError as g, SaveBar as ne, SidebarGroup as _, SidebarRow as re, Skeleton as v, Spinner as y, Tooltip as b, Topbar as ie, cn as x, confirm as S, prompt as C, toast as w } from "@letterncms/ui";
import { Stylesheet as T, balanced as E } from "@letterncms/blocks";
import { jsx as D, jsxs as O } from "react/jsx-runtime";
// admin/src/Code.tsx
var k = { files: {} }, ae = {
	scripts: "export function mount(el, props) {\n}\n",
	styles: "\n"
}, A = {
	scripts: "js",
	styles: "css"
};
function j() {
	let c = o("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), l = o("styling-code/list"), u = o("styling-vendor/list"), [v, b] = d(k), [T, E] = d(!1), [j, P] = d(null), [F, I] = d(null), { query: L } = s(), R = L.file ?? "css", z = (e) => i({ file: e }, !1), B = oe(), V = t("site.code"), le = t("settings.manage"), H = c.data, U = !!H && (v.css !== void 0 && v.css !== H.css || v.js !== void 0 && v.js !== H.js || Object.keys(v.files).length > 0), W = (e, t) => b((n) => ({
		...n,
		files: t === null ? Object.fromEntries(Object.entries(n.files).filter(([t]) => t !== e)) : {
			...n.files,
			[e]: t
		}
	}));
	if (c.isLoading) return /* @__PURE__ */ D("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ D(y, {})
	});
	if (!H) return /* @__PURE__ */ O("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ D(ie, { crumbs: [{
			label: a("Code"),
			icon: "code"
		}] }), /* @__PURE__ */ D(g, {
			title: a("Couldn’t load the code"),
			onRetry: () => void c.refetch(),
			retrying: c.isRefetching
		})]
	});
	let ue = async () => {
		if (U && !T) {
			E(!0), P(null);
			try {
				v.css !== void 0 && v.css !== H.css && await r("styling/update", { css: v.css }), v.js !== void 0 && v.js !== H.js && await r("styling-code/set-custom", { js: v.js });
				for (let [e, t] of Object.entries(v.files)) await r("styling-code/save", {
					path: e,
					contents: t
				});
				await c.refetch(), n("styling/", "styling-code/"), b(k);
			} catch (t) {
				P({
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
		if ((l.data?.[e] ?? []).includes(n)) return void w.error(a("“{name}” already exists", { name: n }));
		let i = `${e}/${n}.${A[e]}`;
		await G(() => r("styling-code/save", {
			path: i,
			contents: ae[e]
		}), a("{name} added", { name: `${n}.${A[e]}` })) && z(i);
	}, de = async (e, t) => {
		await S({
			title: a("Delete “{name}”?", { name: t }),
			confirm: a("Delete File"),
			danger: !0
		}) && await G(() => r("styling-code/delete", { path: e }), a("{name} deleted", { name: t })) && (W(e, null), R === e && z("css"));
	}, fe = async () => {
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
		t && (I("add"), await G(() => r("styling-vendor/create", { package: t }), a("{name} added", { name: t })), I(null));
	}, q = async (e) => {
		I(e), await G(() => r("styling-vendor/update", { import: e }), a("{name} updated", { name: e })), I(null);
	}, pe = async (e) => {
		await S({
			title: a("Delete “{name}”?", { name: e }),
			confirm: a("Delete Library"),
			danger: !0
		}) && await G(() => r("styling-vendor/delete", { import: e }), a("{name} deleted", { name: e })) && R === `library:${e}` && z("css");
	}, J = (e, t) => V ? [{
		label: a("Delete"),
		icon: "trash",
		danger: !0,
		onSelect: () => void de(e, t)
	}] : [], Y = (e) => V ? [
		{
			label: a("Update"),
			icon: "refresh",
			disabled: !!F,
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
			disabled: !!F,
			onSelect: () => void pe(e)
		}
	] : [], me = (e) => e ? /* @__PURE__ */ D("span", {
		className: "size-1.5 rounded-full bg-focus",
		"aria-label": a("Unsaved changes"),
		role: "img"
	}) : void 0, X = (e, t, n, r, i = [], a) => /* @__PURE__ */ D(re, {
		label: t,
		icon: n,
		active: R === e,
		onClick: () => z(e),
		status: me(r),
		badge: a,
		actions: i.map((e) => ({
			...e,
			quick: e.icon === "trash"
		}))
	}, e), Z = (e) => (l.data?.[e] ?? []).map((t) => {
		let n = `${e}/${t}.${A[e]}`;
		return X(n, `${t}.${A[e]}`, "file", n in v.files, J(n, `${t}.${A[e]}`));
	}), he = /* @__PURE__ */ O("nav", {
		"aria-label": a("Code"),
		className: "px-2 pb-4",
		children: [
			/* @__PURE__ */ O(_, {
				title: a("Stylesheets"),
				action: V && /* @__PURE__ */ D(N, {
					label: a("New Stylesheet"),
					onAdd: () => void K("styles")
				}),
				children: [X("css", a("Site CSS"), "braces", v.css !== void 0 && v.css !== H.css), l.isError ? /* @__PURE__ */ D(g, {
					compact: !0,
					onRetry: () => void l.refetch(),
					retrying: l.isRefetching
				}) : l.data ? Z("styles") : /* @__PURE__ */ D(M, {})]
			}),
			/* @__PURE__ */ O(_, {
				title: a("Scripts"),
				action: V && /* @__PURE__ */ D(N, {
					label: a("New Script"),
					onAdd: () => void K("scripts")
				}),
				children: [X("js", a("Site JavaScript"), "braces", v.js !== void 0 && v.js !== H.js), l.isError ? null : l.data ? Z("scripts") : /* @__PURE__ */ D(M, {})]
			}),
			/* @__PURE__ */ D(_, {
				title: a("Libraries"),
				action: V && /* @__PURE__ */ D(N, {
					label: a("Add Library"),
					onAdd: () => void fe(),
					busy: F === "add"
				}),
				children: u.isError ? /* @__PURE__ */ D(g, {
					compact: !0,
					onRetry: () => void u.refetch(),
					retrying: u.isRefetching
				}) : u.data ? u.data.imports.map((e) => X(`library:${e.import}`, e.import, "box", !1, Y(e.import), F === e.import ? /* @__PURE__ */ D(y, { size: 12 }) : e.version)) : /* @__PURE__ */ D(M, {})
			})
		]
	}), Q = R.startsWith("library:") ? u.data?.imports.find((e) => `library:${e.import}` === R) : void 0, $ = /^(scripts|styles)\//.test(R) ? R : null, ge = R === "css" ? a("Site CSS") : R === "js" ? a("Site JavaScript") : $ ? $.split("/").pop() ?? $ : Q?.import, _e = $ ? J($, ge ?? $) : Q ? Y(Q.import) : [], ve = R === "css" ? /* @__PURE__ */ D(ce, {
		css: v.css ?? H.css,
		disabled: !le,
		onChange: (e) => b((t) => ({
			...t,
			css: e
		}))
	}) : R === "js" ? /* @__PURE__ */ D(p, {
		fill: !0,
		label: a("Site JavaScript"),
		language: "javascript",
		value: v.js ?? H.js,
		onChange: (e) => b((t) => ({
			...t,
			js: e
		})),
		disabled: !V,
		placeholder: "document.addEventListener('cms:alpine', (e) => …)"
	}) : $ ? V ? /* @__PURE__ */ D(se, {
		path: $,
		edited: v.files[$],
		onEdit: (e) => W($, e)
	}) : /* @__PURE__ */ D(h, {
		tone: "neutral",
		title: a("Editing code needs the “Edit Scripts and Stylesheets” permission.")
	}) : Q ? /* @__PURE__ */ O("div", {
		className: "space-y-1 text-sm",
		children: [
			/* @__PURE__ */ D("p", {
				className: "m-0 font-mono text-ink",
				children: Q.package
			}),
			/* @__PURE__ */ D("p", {
				className: "m-0 font-mono text-xs text-muted",
				children: Q.version
			}),
			V && /* @__PURE__ */ D(f, {
				icon: "refresh",
				loading: F === Q.import,
				disabled: !!F,
				onClick: () => void q(Q.import),
				className: "!mt-4",
				children: a("Update")
			})
		]
	}) : u.data && l.data ? /* @__PURE__ */ D(te, {}) : null;
	return /* @__PURE__ */ O("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ D(ie, {
				divided: !0,
				back: B && L.file ? {
					to: "/code",
					label: a("Code")
				} : void 0,
				crumbs: [{ label: B && L.file ? ge : a("Code") }],
				actions: _e.length > 0 && /* @__PURE__ */ D(ee, {
					align: "end",
					trigger: /* @__PURE__ */ D(m, {
						icon: "more",
						size: "sm",
						label: a("File Actions")
					}),
					items: _e
				})
			}),
			/* @__PURE__ */ D(ne, {
				dirty: U,
				saving: T,
				error: j ? j.refused ? a("The CSS was not saved") : j.message : null,
				onSave: () => void ue(),
				onDiscard: () => {
					b(k), P(null);
				}
			}),
			!V && /* @__PURE__ */ D(h, {
				tone: "neutral",
				className: "mx-4 mb-2",
				title: a("Editing code needs the “Edit Scripts and Stylesheets” permission.")
			}),
			j?.refused && /* @__PURE__ */ D(h, {
				tone: "danger",
				className: "mx-4 mb-2",
				title: a("Tailwind refused the CSS"),
				onDismiss: () => P(null),
				children: j.message
			}),
			/* @__PURE__ */ O("div", {
				className: "grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(240px,280px)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ D("div", {
					className: x("min-h-0 overflow-y-auto border-border pt-3 md:border-r", L.file && "max-md:hidden"),
					children: he
				}), /* @__PURE__ */ D("div", {
					className: x("flex min-h-0 min-w-0 flex-col p-4", !L.file && "max-md:hidden"),
					children: ve
				})]
			})
		]
	});
}
function oe() {
	let [e, t] = d(() => window.matchMedia("(max-width: 767px)").matches);
	return c(() => {
		let e = window.matchMedia("(max-width: 767px)"), n = () => t(e.matches);
		return e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
var M = () => /* @__PURE__ */ O("div", {
	className: "space-y-2 py-2 pl-2",
	children: [/* @__PURE__ */ D(v, { className: "h-3 w-32" }), /* @__PURE__ */ D(v, { className: "h-3 w-24" })]
});
function N({ label: e, onAdd: t, busy: n }) {
	return n ? /* @__PURE__ */ D("span", {
		role: "status",
		"aria-label": a("Working…"),
		className: "grid size-6 place-items-center text-faint",
		children: /* @__PURE__ */ D(y, { size: 14 })
	}) : /* @__PURE__ */ D(b, {
		content: e,
		children: /* @__PURE__ */ D(m, {
			icon: "plus",
			size: "xs",
			label: e,
			title: void 0,
			onClick: t
		})
	});
}
function se({ path: e, edited: t, onEdit: n }) {
	let r = o("styling-code/get", { path: e }, {
		enabled: t === void 0,
		staleTime: 0
	});
	return r.isError ? /* @__PURE__ */ D(g, {
		compact: !0,
		onRetry: () => void r.refetch(),
		retrying: r.isRefetching
	}) : t === void 0 && !r.data ? /* @__PURE__ */ D(v, { className: "h-full w-full rounded-md" }) : /* @__PURE__ */ D(p, {
		fill: !0,
		label: e,
		language: e.endsWith(".css") ? "css" : "javascript",
		value: t ?? r.data?.contents ?? "",
		onChange: n
	}, e);
}
function ce({ css: e, onChange: t, disabled: n }) {
	let r = l(() => new T(e), [e]), i = l(() => r.extra(), [r]), [o, s] = d(i), f = u(i);
	return c(() => {
		i !== f.current && (f.current = i, s(i));
	}, [i]), /* @__PURE__ */ D(p, {
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
export { j as default };
