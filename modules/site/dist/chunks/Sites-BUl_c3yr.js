import { can as e, loadManifest as t, navigate as n, queryClient as r, run as i, setManifest as a, t as o, useAbility as s, useManifest as c } from "@letterncms/sdk";
import { useMemo as l, useRef as u, useState as d } from "react";
import { Badge as f, Button as p, DataCard as m, DataGrid as h, Dialog as g, EmptyState as _, Field as v, Icon as y, IconButton as b, Input as x, Menu as S, Notice as C, Page as w, Pressable as T, QueryError as E, Textarea as D, cn as O, confirm as k, download as A, slugify as j, switchSite as M, toast as N } from "@letterncms/ui";
import { Fragment as P, jsx as F, jsxs as I } from "react/jsx-runtime";
// admin/src/Sites.tsx
function L() {
	let t = s("sites/list"), [a, c] = d(null), [l, f] = d(!1), [m, g] = d(null), v = u(null), [y, b] = d(!1), x = async (e) => {
		c(e.handle), await M(e, { home: !1 }), c(null);
	}, S = async (e) => {
		await k({
			title: o("Start {name} over?", { name: e.name }),
			description: e.active ? o("The site goes back to {name} as it came. What you changed is gone.", { name: e.name }) : o("{name} goes back to how it came. What you changed in it is gone.", { name: e.name }),
			confirm: o("Start Over"),
			danger: !0
		}) && (c(e.handle), await M(e, {
			fresh: !0,
			home: !1
		}), c(null));
	}, T = async (e) => {
		if (await k({
			title: o("Delete {name}?", { name: e.name }),
			description: o("This deletes the site and its saved changes."),
			confirm: o("Delete"),
			danger: !0
		})) {
			c(e.handle);
			try {
				await i("sites/delete", { handle: e.handle }), await r.invalidateQueries(), N.success(o("{name} deleted", { name: e.name }));
			} catch (e) {
				N.error(e);
			} finally {
				c(null);
			}
		}
	}, D = async (e) => {
		b(!0);
		try {
			let t = new Uint8Array(await e.arrayBuffer()), n = "";
			for (let e = 0; e < t.length; e += 32768) n += String.fromCharCode(...t.subarray(e, e + 32768));
			let a = await i("sites/import", {
				content: btoa(n),
				encoding: "base64"
			});
			await r.invalidateQueries(), N.success(o("{name} imported", { name: a.site.name }));
		} catch (e) {
			N.error(e);
		} finally {
			b(!1), v.current && (v.current.value = "");
		}
	};
	return /* @__PURE__ */ I(w, {
		title: o("Sites"),
		actions: /* @__PURE__ */ I(P, { children: [
			/* @__PURE__ */ F("input", {
				ref: v,
				type: "file",
				accept: ".zip,application/zip",
				className: "hidden",
				onChange: (e) => e.target.files?.[0] && void D(e.target.files[0])
			}),
			e("packages.manage") && /* @__PURE__ */ F(p, {
				icon: "search",
				onClick: () => n("/sites/store"),
				children: o("Browse Store")
			}),
			/* @__PURE__ */ F(p, {
				icon: "upload",
				loading: y,
				onClick: () => v.current?.click(),
				children: o("Import Site")
			}),
			/* @__PURE__ */ F(p, {
				icon: "download",
				onClick: () => f(!0),
				children: o("Export Site")
			})
		] }),
		children: [
			t.isPending ? /* @__PURE__ */ F(h, {
				loading: !0,
				media: !0
			}) : t.error ? /* @__PURE__ */ F(E, {
				title: o("Sites could not be loaded"),
				message: o("Try again in a moment."),
				onRetry: () => t.refetch(),
				retrying: t.isFetching
			}) : t.data.sites.length === 0 ? /* @__PURE__ */ F(_, {
				icon: "box",
				title: o("No sites")
			}) : /* @__PURE__ */ F(h, {
				media: !0,
				children: t.data.sites.map((e) => /* @__PURE__ */ F(R, {
					site: e,
					busy: a,
					onChoose: () => void x(e),
					onStartOver: () => void S(e),
					onEdit: () => g(e),
					onDelete: () => void T(e)
				}, e.handle))
			}),
			t.data?.problems.map((e) => /* @__PURE__ */ F(C, {
				tone: "warning",
				title: e.folder,
				className: "mt-4",
				children: e.problem
			}, e.folder)),
			l && /* @__PURE__ */ F(B, { onClose: () => f(!1) }),
			m && /* @__PURE__ */ F(B, {
				site: m,
				onClose: () => g(null)
			})
		]
	});
}
function R({ site: e, busy: t, onChoose: r, onStartOver: i, onEdit: a, onDelete: s }) {
	let c = e.missingPlugins.length > 0, l = t === e.handle, u = !e.active && e.suits && !c && t === null, d = e.source !== "saved" && (e.active || e.edited), h = !e.active;
	return /* @__PURE__ */ F(m, {
		title: e.name,
		onClick: u ? r : void 0,
		active: e.active,
		image: e.previews[0] ? /* @__PURE__ */ F("img", {
			src: e.previews[0],
			alt: "",
			className: O("size-full object-cover object-top transition-opacity duration-base", l && "opacity-50")
		}) : /* @__PURE__ */ F("span", {
			className: "grid size-full place-items-center text-faint",
			children: /* @__PURE__ */ F(y, {
				name: "layout",
				size: 28
			})
		}),
		footer: e.active ? /* @__PURE__ */ F(f, {
			tone: "neutral",
			children: o("Current")
		}) : c ? /* @__PURE__ */ I(P, { children: [/* @__PURE__ */ F("span", {
			className: "min-w-0 flex-1 truncate",
			children: o("Needs {plugins}", { plugins: e.missingPlugins.join(", ") })
		}), /* @__PURE__ */ F(p, {
			size: "sm",
			className: "relative z-raised",
			onClick: () => n("/plugins"),
			children: o("Open Store")
		})] }) : e.suits ? /* @__PURE__ */ F("span", {
			className: O("font-medium", !l && "cms-reveal"),
			children: o(l ? "Switching…" : "Switch||site")
		}) : void 0,
		actions: /* @__PURE__ */ F(S, {
			align: "end",
			trigger: /* @__PURE__ */ F(b, {
				icon: "dots",
				label: o("More"),
				size: "sm",
				disabled: t !== null
			}),
			items: [
				{
					label: o("Edit Details"),
					icon: "edit",
					onSelect: a
				},
				d && {
					label: o("Start Over"),
					icon: "arrow-counter-clockwise",
					danger: !0,
					onSelect: i
				},
				h && {
					label: o("Delete"),
					icon: "trash",
					danger: !0,
					onSelect: s
				}
			]
		}),
		children: e.description && /* @__PURE__ */ F("p", {
			className: "m-0 mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted",
			children: e.description
		})
	});
}
var z = (e) => {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
};
function B({ site: e, onClose: n }) {
	let s = c().site, [f, m] = d(e?.name ?? ""), [h, _] = d(e?.description ?? ""), [b, S] = d(null), [C, w] = d(!1), [E, O] = d(!1), k = u(null), M = e?.handle ?? j(f), P = !C && !b ? e?.previews[0] : void 0, L = b ? {
		"image/png": "png",
		"image/jpeg": "jpg",
		"image/webp": "webp"
	}[b.type] : void 0, R = l(() => b ? URL.createObjectURL(b) : null, [b]);
	return /* @__PURE__ */ F(g, {
		open: !0,
		onOpenChange: (e) => !e && n(),
		title: o(e ? "Edit Details" : "Export Site"),
		size: "sm",
		onSubmit: async () => {
			O(!0);
			try {
				let s = b && L ? {
					preview: z(new Uint8Array(await b.arrayBuffer())),
					previewType: L
				} : {};
				if (e) {
					await i("sites/update", {
						handle: M,
						name: f.trim(),
						description: h.trim(),
						...s,
						...C ? { removePreview: !0 } : {}
					}), await r.invalidateQueries(), await r.refetchQueries(), a(await t()), N.success(o("{name} saved", { name: f.trim() })), n();
					return;
				}
				let c = await i("sites/export", {
					handle: M,
					name: f.trim(),
					...h.trim() ? { description: h.trim() } : {},
					...s,
					zip: !0
				});
				A(c), N.success(o("{name} exported", { name: c.site.name })), n();
			} catch (e) {
				N.error(e);
			} finally {
				O(!1);
			}
		},
		submitLabel: o(e ? "Save" : "Export Site"),
		busy: E,
		submitDisabled: !M || !!b && !L,
		children: /* @__PURE__ */ I("div", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ F(v, {
					label: o("Name"),
					htmlFor: "site-name",
					children: /* @__PURE__ */ F(x, {
						id: "site-name",
						value: f,
						onChange: (e) => m(e.target.value),
						autoFocus: !0,
						maxLength: 80
					})
				}),
				/* @__PURE__ */ F(v, {
					label: o("Description"),
					htmlFor: "site-description",
					children: /* @__PURE__ */ F(D, {
						id: "site-description",
						rows: 3,
						value: h,
						onChange: (e) => _(e.target.value),
						placeholder: s.description || void 0,
						maxLength: 400
					})
				}),
				/* @__PURE__ */ I(v, {
					label: o("Thumbnail"),
					children: [/* @__PURE__ */ F("input", {
						ref: k,
						type: "file",
						accept: "image/png,image/jpeg,image/webp",
						className: "hidden",
						onChange: (e) => {
							S(e.target.files?.[0] ?? null), w(!1);
						}
					}), /* @__PURE__ */ I("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ F(T, {
							compact: !0,
							"aria-label": o(b || P ? "Replace" : "Upload"),
							onClick: () => k.current?.click(),
							className: "grid h-14 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-sm border border-border bg-sunken p-0 text-faint hover:border-border-strong",
							children: R || P ? /* @__PURE__ */ F("img", {
								src: R ?? P,
								alt: "",
								className: "size-full object-cover object-top"
							}) : /* @__PURE__ */ F(y, {
								name: "upload",
								size: 18
							})
						}), /* @__PURE__ */ I("div", {
							className: "flex min-w-0 flex-col items-start gap-1",
							children: [
								/* @__PURE__ */ F(p, {
									size: "sm",
									onClick: () => k.current?.click(),
									children: o(b || P ? "Replace" : "Upload")
								}),
								(b || P) && /* @__PURE__ */ F(p, {
									size: "sm",
									variant: "ghost",
									onClick: () => {
										S(null), w(!0), k.current && (k.current.value = "");
									},
									children: o("Remove")
								}),
								b && !L && /* @__PURE__ */ F("span", {
									className: "text-xs text-danger",
									children: o("Use a .png, .jpg or .webp.")
								})
							]
						})]
					})]
				})
			]
		})
	});
}
export { L as default };
