import { loadManifest as e, navigate as t, plural as n, queryClient as r, run as i, setManifest as a, t as o, useAbility as s } from "@letterncms/sdk";
import { useEffect as c, useMemo as l, useState as u } from "react";
import { Button as d, Checkbox as f, Dialog as p, EmptyState as m, Field as h, Input as g, List as _, Notice as v, Page as y, QueryError as b, Row as x, Segmented as S, Skeleton as C, download as w, slugify as T, toast as E } from "@letterncms/ui";
import { Fragment as D, jsx as O, jsxs as k } from "react/jsx-runtime";
// admin/src/Kits.tsx
function A() {
	let e = s("kits/list"), [t, n] = u(null), [r, i] = u(!1);
	return /* @__PURE__ */ k(y, {
		title: o("Site Kits"),
		width: "narrow",
		actions: /* @__PURE__ */ O(d, {
			icon: "download",
			onClick: () => i(!0),
			children: o("Export Site")
		}),
		children: [
			e.isPending ? /* @__PURE__ */ O(_, { children: [0, 1].map((e) => /* @__PURE__ */ k(x, { children: [/* @__PURE__ */ O(C, { className: "h-10 w-16 rounded-sm" }), /* @__PURE__ */ O(C, { className: "h-4 w-32" })] }, e)) }) : e.error ? /* @__PURE__ */ O(b, {
				title: o("Site kits could not be loaded"),
				message: o("Try again in a moment."),
				onRetry: () => e.refetch(),
				retrying: e.isFetching
			}) : e.data.kits.length === 0 ? /* @__PURE__ */ O(m, {
				icon: "box",
				title: o("No site kits")
			}) : /* @__PURE__ */ O(_, { children: e.data.kits.map((e) => /* @__PURE__ */ k(x, {
				onClick: () => n(e),
				className: "py-2",
				children: [
					/* @__PURE__ */ O(j, {
						kit: e,
						className: "h-10 w-16"
					}),
					/* @__PURE__ */ O("span", {
						className: "min-w-0 flex-1 truncate font-medium text-ink",
						children: e.name
					}),
					/* @__PURE__ */ O("span", {
						className: "shrink-0 tabular-nums text-muted",
						children: e.version
					})
				]
			}, e.handle)) }),
			e.data?.problems.map((e) => /* @__PURE__ */ O(v, {
				tone: "warning",
				title: e.folder,
				className: "mt-4",
				children: e.problem
			}, e.folder)),
			t && /* @__PURE__ */ O(P, {
				kit: t,
				onClose: () => n(null)
			}),
			r && /* @__PURE__ */ O(F, { onClose: () => i(!1) })
		]
	});
}
function j({ kit: e, className: t }) {
	return e.previews[0] ? /* @__PURE__ */ O("img", {
		src: e.previews[0],
		alt: "",
		className: `shrink-0 rounded-sm border border-border bg-sunken object-cover object-top ${t ?? ""}`
	}) : /* @__PURE__ */ O("span", {
		"aria-hidden": !0,
		className: `shrink-0 rounded-sm border border-border bg-sunken ${t ?? ""}`
	});
}
function M(e) {
	if (e.type === "entry") return e.collection === "components" ? o("Component") : e.collection === "templates" ? o("Template") : o("Entry");
	let t = {
		collection: o("Collection"),
		global: o("Global Set"),
		menu: o("Menu"),
		media: o("File"),
		file: o("File"),
		setting: o("Setting"),
		language: o("Language"),
		library: o("Library||code"),
		tokens: o("Design Tokens"),
		font: o("Font"),
		custom: o("Custom Code"),
		script: o("Script"),
		style: o("Style"),
		load: o("Script Loading")
	};
	return e.type === "tokens" || e.type === "load" ? o("Design") : t[e.type] ?? e.type;
}
function N(e) {
	return e.title ? e.title : e.type === "tokens" ? o("Design Tokens") : e.type === "load" ? o("Script Loading") : e.name.split("/").pop().replace(/\.[a-z0-9]+$/i, "");
}
function P({ kit: m, onClose: g }) {
	let [y, w] = u("full"), [T, A] = u("refuse"), [j, P] = u(!1), [F, I] = u(!1), L = s("kits/get", {
		handle: m.handle,
		mode: y,
		clash: T
	});
	c(() => {
		L.error && console.error(L.error);
	}, [L.error]);
	let R = s("kits/get", {
		handle: m.handle,
		mode: y,
		clash: "refuse"
	}), z = L.data?.plan.steps ?? [], B = l(() => (R.data?.plan.steps ?? []).filter((e) => e.action === "clash"), [R.data]), V = l(() => {
		let e = {};
		for (let t of z) e[t.action] = (e[t.action] ?? 0) + 1;
		return e;
	}, [z]), H = T !== "refuse" || B.length === 0, U = m.missingPlugins.length > 0, W = [
		["create", n(V.create ?? 0, "{count} new item", "{count} new items")],
		["replace", n(V.replace ?? 0, "{count} replaced", "{count} replaced")],
		["rename", n(V.rename ?? 0, "{count} added under a new name", "{count} added under new names")],
		["merge", n(V.merge ?? 0, "{count} list joined", "{count} lists joined")],
		["skip", n(V.skip ?? 0, "{count} left as it is", "{count} left as they are")]
	];
	return /* @__PURE__ */ O(p, {
		open: !0,
		onOpenChange: (e) => !e && g(),
		title: m.name,
		size: "md",
		onSubmit: async () => {
			P(!0);
			try {
				await i("kits/apply", {
					handle: m.handle,
					mode: y,
					clash: T,
					withoutPlugins: F
				}), await r.invalidateQueries(), a(await e()), E.success(o("{name} applied", { name: m.name })), g();
			} catch (e) {
				E.error(e);
			} finally {
				P(!1);
			}
		},
		submitLabel: o("Apply Kit"),
		busy: j,
		submitDisabled: !m.suits || L.isPending || !!L.error || !H || U && !F || z.every((e) => e.action === "skip"),
		children: /* @__PURE__ */ k("div", {
			className: "flex flex-col gap-5",
			children: [
				/* @__PURE__ */ O(h, {
					label: o("Bring In"),
					children: /* @__PURE__ */ O(S, {
						block: !0,
						value: y,
						onChange: w,
						"aria-label": o("Bring In"),
						options: [{
							value: "full",
							label: o("Design and Content")
						}, {
							value: "design",
							label: o("Design Only")
						}]
					})
				}),
				!m.suits && /* @__PURE__ */ O(v, {
					tone: "danger",
					title: o("Made for another version")
				}),
				U && /* @__PURE__ */ k(D, { children: [/* @__PURE__ */ O(v, {
					tone: "warning",
					title: o("Needs {plugins}", { plugins: m.missingPlugins.join(", ") }),
					action: /* @__PURE__ */ O(d, {
						size: "sm",
						onClick: () => t("/plugins?tab=store"),
						children: o("Open Store")
					})
				}), /* @__PURE__ */ O(f, {
					checked: F,
					onChange: I,
					label: o("Apply Without Them")
				})] }),
				L.error ? /* @__PURE__ */ O(b, {
					compact: !0,
					title: o("This kit can’t be applied"),
					message: o("Something in the kit doesn’t fit this site."),
					onRetry: () => L.refetch(),
					retrying: L.isFetching
				}) : L.isPending ? /* @__PURE__ */ O(_, { children: [
					0,
					1,
					2
				].map((e) => /* @__PURE__ */ O(x, { children: /* @__PURE__ */ O(C, { className: "h-4 w-40" }) }, e)) }) : /* @__PURE__ */ O(_, { children: W.filter(([e]) => V[e]).map(([e, t]) => /* @__PURE__ */ O(x, { children: /* @__PURE__ */ O("span", {
					className: "text-text",
					children: t
				}) }, e)) }),
				(B.length > 0 || T !== "refuse") && /* @__PURE__ */ O(h, {
					label: o("Already on This Site"),
					children: /* @__PURE__ */ O(S, {
						block: !0,
						value: T,
						onChange: A,
						"aria-label": o("Already on This Site"),
						options: [
							{
								value: "skip",
								label: o("Keep the Site’s")
							},
							{
								value: "replace",
								label: o("Replace")
							},
							{
								value: "rename",
								label: o("Keep Both")
							}
						]
					})
				}),
				B.length > 0 && /* @__PURE__ */ O(_, { children: B.map((e) => /* @__PURE__ */ k(x, { children: [/* @__PURE__ */ O("span", {
					className: "min-w-0 flex-1 truncate text-text",
					children: N(e)
				}), /* @__PURE__ */ O("span", {
					className: "shrink-0 text-xs text-muted",
					children: M(e)
				})] }, e.type + e.name)) })
			]
		})
	});
}
function F({ onClose: e }) {
	let [t, n] = u(""), [r, a] = u(!1), s = T(t);
	return /* @__PURE__ */ O(p, {
		open: !0,
		onOpenChange: (t) => !t && e(),
		title: o("Export Site"),
		size: "sm",
		onSubmit: async () => {
			a(!0);
			try {
				let n = await i("kits/export", {
					handle: s,
					name: t.trim(),
					zip: !0
				});
				w(n), E.success(o("{name} exported", { name: n.kit.name })), e();
			} catch (e) {
				E.error(e);
			} finally {
				a(!1);
			}
		},
		submitLabel: o("Export Site"),
		busy: r,
		submitDisabled: !s,
		children: /* @__PURE__ */ O(h, {
			label: o("Name"),
			htmlFor: "kit-name",
			children: /* @__PURE__ */ O(g, {
				id: "kit-name",
				value: t,
				onChange: (e) => n(e.target.value),
				autoFocus: !0,
				maxLength: 80
			})
		})
	});
}
export { A as default };
