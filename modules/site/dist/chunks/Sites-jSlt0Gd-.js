import { loadManifest as e, navigate as t, queryClient as n, run as r, setManifest as i, t as a, useAbility as o, useManifest as s } from "@letterncms/sdk";
import { useMemo as c, useRef as l, useState as u } from "react";
import { Badge as d, Button as f, DataCard as p, DataGrid as m, Dialog as h, EmptyState as g, Field as _, Icon as v, IconButton as y, Input as b, Menu as x, Notice as S, Page as C, Pressable as w, QueryError as T, Textarea as E, cn as D, confirm as O, download as k, slugify as A, switchSite as j, toast as M } from "@letterncms/ui";
import { Fragment as N, jsx as P, jsxs as F } from "react/jsx-runtime";
// admin/src/Sites.tsx
function I() {
	let e = o("sites/list"), [t, i] = u(null), [s, c] = u(!1), [d, p] = u(null), h = l(null), [_, v] = u(!1), b = async (e) => {
		i(e.handle), await j(e, { home: !1 }), i(null);
	}, w = async (e) => {
		await O({
			title: a("Start {name} over?", { name: e.name }),
			description: e.active ? a("The site goes back to {name} as it came. What you changed is gone.", { name: e.name }) : a("{name} goes back to how it came. What you changed in it is gone.", { name: e.name }),
			confirm: a("Start Over"),
			danger: !0
		}) && (i(e.handle), await j(e, {
			fresh: !0,
			home: !1
		}), i(null));
	}, E = async (e) => {
		if (await O({
			title: a("Delete {name}?", { name: e.name }),
			description: a("This deletes the site and its saved changes."),
			confirm: a("Delete Site"),
			danger: !0
		})) {
			i(e.handle);
			try {
				await r("sites/delete", { handle: e.handle }), await n.invalidateQueries(), M.success(a("{name} deleted", { name: e.name }));
			} catch (e) {
				M.error(e);
			} finally {
				i(null);
			}
		}
	}, D = async (e) => {
		v(!0);
		try {
			let t = new Uint8Array(await e.arrayBuffer()), i = "";
			for (let e = 0; e < t.length; e += 32768) i += String.fromCharCode(...t.subarray(e, e + 32768));
			let o = await r("sites/import", {
				content: btoa(i),
				encoding: "base64"
			});
			await n.invalidateQueries(), M.success(a("{name} imported", { name: o.site.name }));
		} catch (e) {
			M.error(e);
		} finally {
			v(!1), h.current && (h.current.value = "");
		}
	};
	return /* @__PURE__ */ F(C, {
		title: a("Sites"),
		width: "full",
		actions: /* @__PURE__ */ F(N, { children: [
			/* @__PURE__ */ P("input", {
				ref: h,
				type: "file",
				accept: ".zip,application/zip",
				className: "hidden",
				onChange: (e) => e.target.files?.[0] && void D(e.target.files[0])
			}),
			/* @__PURE__ */ F("span", {
				className: "contents max-sm:hidden",
				children: [/* @__PURE__ */ P(f, {
					icon: "upload",
					loading: _,
					onClick: () => h.current?.click(),
					children: a("Import Site")
				}), /* @__PURE__ */ P(f, {
					icon: "download",
					onClick: () => c(!0),
					children: a("Export Site")
				})]
			}),
			/* @__PURE__ */ P("span", {
				className: "sm:hidden",
				children: /* @__PURE__ */ P(x, {
					align: "end",
					trigger: /* @__PURE__ */ P(y, {
						icon: "more",
						label: a("Actions"),
						loading: _
					}),
					items: [{
						label: a("Import Site"),
						icon: "upload",
						onSelect: () => h.current?.click()
					}, {
						label: a("Export Site"),
						icon: "download",
						onSelect: () => c(!0)
					}]
				})
			})
		] }),
		children: [
			e.isPending ? /* @__PURE__ */ P(m, {
				loading: !0,
				media: !0
			}) : e.error ? /* @__PURE__ */ P(T, {
				title: a("Sites could not be loaded"),
				message: a("Try again in a moment."),
				onRetry: () => e.refetch(),
				retrying: e.isFetching
			}) : e.data.sites.length === 0 ? /* @__PURE__ */ P(g, {
				icon: "box",
				title: a("No sites")
			}) : /* @__PURE__ */ P(m, {
				media: !0,
				children: e.data.sites.map((e) => /* @__PURE__ */ P(L, {
					site: e,
					busy: t,
					onChoose: () => void b(e),
					onStartOver: () => void w(e),
					onEdit: () => p(e),
					onDelete: () => void E(e)
				}, e.handle))
			}),
			e.data?.problems.map((e) => /* @__PURE__ */ P(S, {
				tone: "warning",
				title: e.folder,
				className: "mt-4",
				children: e.problem
			}, e.folder)),
			s && /* @__PURE__ */ P(z, { onClose: () => c(!1) }),
			d && /* @__PURE__ */ P(z, {
				site: d,
				onClose: () => p(null)
			})
		]
	});
}
function L({ site: e, busy: n, onChoose: r, onStartOver: i, onEdit: o, onDelete: s }) {
	let c = e.missingPlugins.length > 0, l = n === e.handle, u = !e.active && e.suits && !c && n === null, m = e.source !== "saved" && (e.active || e.edited), h = !e.active;
	return /* @__PURE__ */ P(p, {
		title: e.name,
		onClick: u ? r : void 0,
		active: e.active,
		image: e.previews[0] ? /* @__PURE__ */ P("img", {
			src: e.previews[0],
			alt: "",
			className: D("size-full object-cover object-top transition-opacity duration-base", l && "opacity-50")
		}) : /* @__PURE__ */ P("span", {
			className: "grid size-full place-items-center text-faint",
			children: /* @__PURE__ */ P(v, {
				name: "layout",
				size: 28
			})
		}),
		footer: e.active ? /* @__PURE__ */ P(d, {
			tone: "neutral",
			children: a("Current")
		}) : c ? /* @__PURE__ */ F(N, { children: [/* @__PURE__ */ P("span", {
			className: "min-w-0 flex-1 truncate",
			children: a("Needs {plugins}", { plugins: e.missingPlugins.join(", ") })
		}), /* @__PURE__ */ P(f, {
			size: "sm",
			className: "relative z-raised",
			onClick: () => t("/plugins"),
			children: a("Open Store")
		})] }) : e.suits ? /* @__PURE__ */ P("span", {
			className: D("font-medium", !l && "cms-reveal"),
			children: a(l ? "Switching…" : "Switch||site")
		}) : void 0,
		actions: /* @__PURE__ */ P(x, {
			align: "end",
			trigger: /* @__PURE__ */ P(y, {
				icon: "more",
				label: a("Actions"),
				size: "sm",
				disabled: n !== null
			}),
			items: [
				{
					label: a("Edit Details"),
					icon: "edit",
					onSelect: o
				},
				m && {
					label: a("Start Over"),
					icon: "arrow-counter-clockwise",
					danger: !0,
					onSelect: i
				},
				h && {
					label: a("Delete"),
					icon: "trash",
					danger: !0,
					onSelect: s
				}
			]
		}),
		children: e.description && /* @__PURE__ */ P("p", {
			className: "m-0 mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted",
			children: e.description
		})
	});
}
var R = (e) => {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
};
function z({ site: t, onClose: o }) {
	let d = s().site, [p, m] = u(t?.name ?? ""), [g, y] = u(t?.description ?? ""), [x, S] = u(null), [C, T] = u(!1), [D, O] = u(!1), j = l(null), N = t?.handle ?? A(p), I = !C && !x ? t?.previews[0] : void 0, L = x ? {
		"image/png": "png",
		"image/jpeg": "jpg",
		"image/webp": "webp"
	}[x.type] : void 0, z = c(() => x ? URL.createObjectURL(x) : null, [x]);
	return /* @__PURE__ */ P(h, {
		open: !0,
		onOpenChange: (e) => !e && o(),
		title: a(t ? "Edit Details" : "Export Site"),
		size: "sm",
		onSubmit: async () => {
			O(!0);
			try {
				let s = x && L ? {
					preview: R(new Uint8Array(await x.arrayBuffer())),
					previewType: L
				} : {};
				if (t) {
					await r("sites/update", {
						handle: N,
						name: p.trim(),
						description: g.trim(),
						...s,
						...C ? { removePreview: !0 } : {}
					}), await n.invalidateQueries(), await n.refetchQueries(), i(await e()), M.success(a("{name} saved", { name: p.trim() })), o();
					return;
				}
				let c = await r("sites/export", {
					handle: N,
					name: p.trim(),
					...g.trim() ? { description: g.trim() } : {},
					...s,
					zip: !0
				});
				k(c), M.success(a("{name} exported", { name: c.site.name })), o();
			} catch (e) {
				M.error(e);
			} finally {
				O(!1);
			}
		},
		submitLabel: a(t ? "Save" : "Export Site"),
		busy: D,
		submitDisabled: !N || !!x && !L,
		children: /* @__PURE__ */ F("div", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ P(_, {
					label: a("Name"),
					htmlFor: "site-name",
					children: /* @__PURE__ */ P(b, {
						id: "site-name",
						value: p,
						onChange: (e) => m(e.target.value),
						autoFocus: !0,
						maxLength: 80
					})
				}),
				/* @__PURE__ */ P(_, {
					label: a("Description"),
					htmlFor: "site-description",
					children: /* @__PURE__ */ P(E, {
						id: "site-description",
						rows: 3,
						value: g,
						onChange: (e) => y(e.target.value),
						placeholder: d.description || void 0,
						maxLength: 400
					})
				}),
				/* @__PURE__ */ F(_, {
					label: a("Thumbnail"),
					children: [/* @__PURE__ */ P("input", {
						ref: j,
						type: "file",
						accept: "image/png,image/jpeg,image/webp",
						className: "hidden",
						onChange: (e) => {
							S(e.target.files?.[0] ?? null), T(!1);
						}
					}), /* @__PURE__ */ F("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ P(w, {
							compact: !0,
							"aria-label": a(x || I ? "Replace" : "Upload"),
							onClick: () => j.current?.click(),
							className: "grid h-14 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-sm border border-border bg-sunken p-0 text-faint hover:border-border-strong",
							children: z || I ? /* @__PURE__ */ P("img", {
								src: z ?? I,
								alt: "",
								className: "size-full object-cover object-top"
							}) : /* @__PURE__ */ P(v, {
								name: "upload",
								size: 18
							})
						}), /* @__PURE__ */ F("div", {
							className: "flex min-w-0 flex-col items-start gap-1",
							children: [
								/* @__PURE__ */ P(f, {
									size: "sm",
									onClick: () => j.current?.click(),
									children: a(x || I ? "Replace" : "Upload")
								}),
								(x || I) && /* @__PURE__ */ P(f, {
									size: "sm",
									variant: "ghost",
									onClick: () => {
										S(null), T(!0), j.current && (j.current.value = "");
									},
									children: a("Remove")
								}),
								x && !L && /* @__PURE__ */ P("span", {
									className: "text-xs text-danger",
									children: a("Use a .png, .jpg or .webp.")
								})
							]
						})]
					})]
				})
			]
		})
	});
}
export { I as default };
