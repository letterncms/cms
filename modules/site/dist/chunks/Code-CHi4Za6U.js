import { c as e, i as t, n, r } from "./parts-BTZNa8Cp.js";
import { CmsError as i, can as a, invalidate as o, run as s, t as c, useAbility as l } from "@letterncms/sdk";
import { useEffect as u, useMemo as d, useRef as f, useState as p } from "react";
import { Button as m, EmptyState as h, Fields as g, IconButton as _, Menu as v, Notice as y, Page as b, QueryError as x, SaveBar as S, Skeleton as C, Spinner as w, confirm as T, prompt as E, toast as D } from "@letterncms/ui";
import { Stylesheet as O, balanced as k } from "@letterncms/blocks";
import { Fragment as A, jsx as j, jsxs as M } from "react/jsx-runtime";
// admin/src/code-files.tsx
var N = () => /* @__PURE__ */ M("div", {
	className: "space-y-2 py-3",
	children: [/* @__PURE__ */ j(C, { className: "h-3 w-32" }), /* @__PURE__ */ j(C, { className: "h-3 w-24" })]
}), P = (n, r) => r.length > 0 ? /* @__PURE__ */ j(v, {
	trigger: /* @__PURE__ */ j(_, {
		icon: "more",
		label: n,
		size: "xs",
		className: e
	}),
	items: r
}) : /* @__PURE__ */ j(t, {}), F = {
	scripts: "export function mount(el, props) {\n}\n",
	styles: "\n"
}, I = {
	scripts: "js",
	styles: "css"
};
function L({ path: e, name: t, open: r, onToggle: i, edited: a, onEdit: o, allowed: s, onDelete: u }) {
	let d = l("styling-code/get", { path: e }, {
		enabled: r && s && a === void 0,
		staleTime: 0
	});
	return s ? /* @__PURE__ */ j(n, {
		open: r,
		onToggle: i,
		label: /* @__PURE__ */ j("span", {
			className: "font-mono",
			children: t
		}),
		menu: P(c("File Actions"), s ? [{
			label: c("Delete"),
			icon: "trash",
			danger: !0,
			onSelect: u
		}] : []),
		children: d.isError ? /* @__PURE__ */ j(x, {
			compact: !0,
			onRetry: () => void d.refetch(),
			retrying: d.isRefetching
		}) : a === void 0 && !d.data ? /* @__PURE__ */ j(N, {}) : /* @__PURE__ */ j(g, {
			bare: !0,
			fields: [{
				handle: "contents",
				type: "code",
				label: t,
				rows: 14,
				language: e.endsWith(".css") ? "css" : "javascript"
			}],
			values: { contents: a ?? d.data?.contents ?? "" },
			onChange: (e, t) => o(t ?? ""),
			disabled: !s
		})
	}) : /* @__PURE__ */ j("div", {
		className: "flex min-h-10 items-center border-b border-border font-mono text-xs text-text last:border-b-0",
		children: t
	});
}
function R({ js: e, onJs: i, edits: u, onEdit: d }) {
	let f = a("site.code"), _ = l("styling-code/list"), v = l("styling-vendor/list"), [b, S] = p(null), [C, O] = p(null), k = () => o("styling-code/", "styling-vendor/"), R = async (e, t) => {
		try {
			return await e(), k(), D.success(t), !0;
		} catch (e) {
			return D.error(e), !1;
		}
	}, z = async (e, t, n) => {
		O(e), await R(t, n), O(null);
	}, B = async (e) => {
		let t = await E({
			title: c(e === "scripts" ? "New Script" : "New Stylesheet"),
			fields: [{
				handle: "name",
				type: "text",
				label: c("Name"),
				mono: !0,
				autofocus: !0,
				placeholder: "hero"
			}],
			confirm: c(e === "scripts" ? "Create Script" : "Create Stylesheet")
		}), n = String(t?.name ?? "").trim().toLowerCase().replace(/\.(js|css)$/, "").replace(/\s+/g, "-");
		if (!n) return;
		if ((_.data?.[e] ?? []).includes(n)) return void D.error(c("“{name}” already exists", { name: n }));
		let r = `${e}/${n}.${I[e]}`;
		await R(() => s("styling-code/save", {
			path: r,
			contents: F[e]
		}), c("{name} added", { name: n })) && S(r);
	}, V = async (e, t) => {
		await T({
			title: c("Delete “{name}”?", { name: t }),
			confirm: c("Delete"),
			danger: !0
		}) && await R(() => s("styling-code/delete", { path: e }), c("{name} deleted", { name: t })) && d(e, null);
	}, H = async () => {
		let e = await E({
			title: c("Add Library"),
			fields: [{
				handle: "package",
				type: "text",
				label: c("Package"),
				mono: !0,
				autofocus: !0,
				placeholder: "gsap@3.12.5"
			}],
			confirm: c("Add Library")
		}), t = String(e?.package ?? "").trim();
		t && await z("add", () => s("styling-vendor/create", { package: t }), c("{name} added", { name: t }));
	}, U = async (e) => {
		await T({
			title: c("Delete “{name}”?", { name: e }),
			confirm: c("Delete"),
			danger: !0
		}) && await R(() => s("styling-vendor/delete", { import: e }), c("{name} deleted", { name: e }));
	}, W = (a, o, s) => {
		let l = _.data?.[a] ?? [];
		return /* @__PURE__ */ M(r, {
			title: o,
			onAdd: f && (a === "scripts" || l.length > 0) ? () => void B(a) : void 0,
			addLabel: s,
			children: [a === "scripts" && /* @__PURE__ */ j(n, {
				open: b === "js",
				onToggle: () => S(b === "js" ? null : "js"),
				label: c("Site JavaScript"),
				menu: /* @__PURE__ */ j(t, {}),
				children: /* @__PURE__ */ j(g, {
					bare: !0,
					fields: [{
						handle: "js",
						type: "code",
						label: c("Site JavaScript"),
						rows: 14,
						placeholder: "document.addEventListener('cms:alpine', (e) => …)",
						language: "javascript"
					}],
					values: { js: e },
					onChange: (e, t) => i(t ?? ""),
					disabled: !f
				})
			}), _.isError ? /* @__PURE__ */ j(x, {
				compact: !0,
				onRetry: () => void _.refetch(),
				retrying: _.isRefetching
			}) : _.data ? l.length === 0 && a === "styles" ? /* @__PURE__ */ j(h, {
				compact: !0,
				icon: "code",
				title: c("No stylesheets"),
				action: f ? /* @__PURE__ */ j(m, {
					icon: "plus",
					onClick: () => void B(a),
					children: s
				}) : void 0
			}) : l.map((e) => {
				let t = `${a}/${e}.${I[a]}`;
				return /* @__PURE__ */ j(L, {
					path: t,
					name: e,
					open: b === t,
					onToggle: () => S(b === t ? null : t),
					edited: u[t],
					onEdit: (e) => d(t, e),
					allowed: f,
					onDelete: () => void V(t, e)
				}, t);
			}) : /* @__PURE__ */ j(N, {})]
		});
	};
	return /* @__PURE__ */ M(A, { children: [
		!f && /* @__PURE__ */ j(y, {
			tone: "neutral",
			className: "mb-4",
			title: c("Editing code needs the “Edit Scripts and Stylesheets” permission.")
		}),
		W("scripts", c("Scripts"), c("New Script")),
		W("styles", c("Stylesheets"), c("New Stylesheet")),
		/* @__PURE__ */ j(r, {
			title: c("Libraries"),
			onAdd: f && C !== "add" && v.data?.imports.length ? () => void H() : void 0,
			addLabel: c("Add Library"),
			action: C === "add" ? /* @__PURE__ */ j("span", {
				role: "status",
				"aria-label": c("Working…"),
				className: "grid size-6 place-items-center text-faint",
				children: /* @__PURE__ */ j(w, { size: 14 })
			}) : void 0,
			children: v.isError ? /* @__PURE__ */ j(x, {
				compact: !0,
				onRetry: () => void v.refetch(),
				retrying: v.isRefetching
			}) : v.data ? v.data.imports.length === 0 ? /* @__PURE__ */ j(h, {
				compact: !0,
				icon: "code",
				title: c("No libraries"),
				action: f ? /* @__PURE__ */ j(m, {
					icon: "plus",
					loading: C === "add",
					onClick: () => void H(),
					children: c("Add Library")
				}) : void 0
			}) : v.data.imports.map((e) => /* @__PURE__ */ M("div", {
				className: "cms-reveal-row group flex min-h-10 items-center gap-2 border-b border-border last:border-b-0",
				children: [
					/* @__PURE__ */ j("span", {
						className: "min-w-0 flex-1 truncate font-mono text-xs text-text",
						children: e.import
					}),
					/* @__PURE__ */ j("span", {
						className: "shrink-0 font-mono text-2xs text-faint",
						children: e.version
					}),
					C === e.import ? /* @__PURE__ */ j("span", {
						role: "status",
						"aria-label": c("Working…"),
						className: "grid size-6 shrink-0 place-items-center text-faint",
						children: /* @__PURE__ */ j(w, { size: 14 })
					}) : P(c("Library Actions"), f ? [
						{
							label: c("Update"),
							icon: "refresh",
							disabled: !!C,
							onSelect: () => void z(e.import, () => s("styling-vendor/update", { import: e.import }), c("{name} updated", { name: e.import }))
						},
						{
							separator: !0,
							label: ""
						},
						{
							label: c("Delete"),
							icon: "trash",
							danger: !0,
							disabled: !!C,
							onSelect: () => void U(e.import)
						}
					] : [])
				]
			}, e.import)) : /* @__PURE__ */ j(N, {})
		})
	] });
}
// admin/src/Code.tsx
var z = { files: {} };
function B({ css: e, onChange: t, disabled: n }) {
	let i = d(() => new O(e), [e]), a = d(() => i.extra(), [i]), [o, s] = p(a), l = f(a);
	return u(() => {
		a !== l.current && (l.current = a, s(a));
	}, [a]), /* @__PURE__ */ j(r, {
		title: c("CSS"),
		children: /* @__PURE__ */ j("div", {
			className: "pt-2",
			children: /* @__PURE__ */ j(g, {
				bare: !0,
				fields: [{
					handle: "css",
					type: "code",
					label: c("CSS"),
					rows: 16,
					language: "tailwind",
					placeholder: ".hero-title { text-wrap: balance; }"
				}],
				values: { css: o },
				disabled: n,
				onChange: (e, n) => {
					let r = String(n ?? "");
					if (s(r), !k(r)) return;
					let a = i.setExtra(r);
					l.current = a.extra(), t(a.css);
				}
			})
		})
	});
}
function V() {
	let e = l("styling/get", {}, {
		refetchOnWindowFocus: !1,
		retry: !1
	}), [t, n] = p(z), [r, u] = p(!1), [d, f] = p(null), m = e.data, h = !!m && (t.css !== void 0 && t.css !== m.css || t.js !== void 0 && t.js !== m.js || Object.keys(t.files).length > 0);
	if (e.isLoading) return /* @__PURE__ */ j("div", {
		className: "grid h-full place-items-center text-faint",
		children: /* @__PURE__ */ j(w, {})
	});
	if (!m) return /* @__PURE__ */ j(b, {
		crumbs: [{
			label: c("Code"),
			icon: "code"
		}],
		children: /* @__PURE__ */ j(x, {
			title: c("Couldn’t load the code"),
			onRetry: () => void e.refetch(),
			retrying: e.isRefetching
		})
	});
	let g = async () => {
		if (h && !r) {
			u(!0), f(null);
			try {
				t.css !== void 0 && t.css !== m.css && await s("styling/update", { css: t.css }), t.js !== void 0 && t.js !== m.js && await s("styling-code/set-custom", { js: t.js });
				for (let [e, n] of Object.entries(t.files)) await s("styling-code/save", {
					path: e,
					contents: n
				});
				await e.refetch(), o("styling/", "styling-code/"), n(z);
			} catch (e) {
				f({
					message: e instanceof Error ? e.message : String(e),
					refused: e instanceof i && e.type === "invalid_input"
				});
			} finally {
				u(!1);
			}
		}
	};
	return /* @__PURE__ */ M(b, {
		crumbs: [{
			label: c("Code"),
			icon: "code"
		}],
		width: "narrow",
		children: [/* @__PURE__ */ j(S, {
			dirty: h,
			saving: r,
			error: d ? d.refused ? c("The CSS was not saved") : d.message : null,
			onSave: () => void g(),
			onDiscard: () => {
				n(z), f(null);
			}
		}), /* @__PURE__ */ M("div", { children: [
			d?.refused && /* @__PURE__ */ j(y, {
				tone: "danger",
				className: "mb-3",
				title: c("Tailwind refused the CSS"),
				onDismiss: () => f(null),
				children: d.message
			}),
			/* @__PURE__ */ j(B, {
				css: t.css ?? m.css,
				disabled: !a("settings.manage"),
				onChange: (e) => n((t) => ({
					...t,
					css: e
				}))
			}),
			/* @__PURE__ */ j(R, {
				js: t.js ?? m.js,
				onJs: (e) => n((t) => ({
					...t,
					js: e
				})),
				edits: t.files,
				onEdit: (e, t) => n((n) => ({
					...n,
					files: t === null ? Object.fromEntries(Object.entries(n.files).filter(([t]) => t !== e)) : {
						...n.files,
						[e]: t
					}
				}))
			})
		] })]
	});
}
export { V as default };
