import { loadManifest as e, navigate as t, queryClient as n, run as r, setManifest as i, t as a, useAbility as o, useManifest as s } from "@letterncms/sdk";
import { useMemo as c, useRef as l, useState as u } from "react";
import { Badge as d, Button as f, Dialog as p, EmptyState as m, Field as h, Icon as g, IconButton as _, Input as v, Menu as y, Notice as b, Page as x, Pressable as S, QueryError as C, Skeleton as w, Textarea as T, confirm as E, download as D, slugify as O, switchKit as k, toast as A } from "@letterncms/ui";
import { Fragment as j, jsx as M, jsxs as N } from "react/jsx-runtime";
// admin/src/Kits.tsx
function P() {
	let e = o("kits/list"), [t, i] = u(null), [s, c] = u(!1), [d, p] = u(null), h = l(null), [g, _] = u(!1), v = async (e) => {
		i(e.handle), await k(e, { home: !1 }), i(null);
	}, y = async (e) => {
		await E({
			title: a("Start {name} over?", { name: e.name }),
			description: e.active ? a("The site goes back to {name} as it came. What you changed is gone.", { name: e.name }) : a("{name} goes back to how it came. What you changed in it is gone.", { name: e.name }),
			confirm: a("Start Over"),
			danger: !0
		}) && (i(e.handle), await k(e, {
			fresh: !0,
			home: !1
		}), i(null));
	}, S = async (e) => {
		if (await E({
			title: a("Delete {name}?", { name: e.name }),
			description: a("The kit goes, with what you changed in it. Your site stays as it is."),
			confirm: a("Delete"),
			danger: !0
		})) {
			i(e.handle);
			try {
				await r("kits/delete", { handle: e.handle }), await n.invalidateQueries(), A.success(a("{name} deleted", { name: e.name }));
			} catch (e) {
				A.error(e);
			} finally {
				i(null);
			}
		}
	}, T = async (e) => {
		_(!0);
		try {
			let t = new Uint8Array(await e.arrayBuffer()), i = "";
			for (let e = 0; e < t.length; e += 32768) i += String.fromCharCode(...t.subarray(e, e + 32768));
			let o = await r("kits/import", {
				content: btoa(i),
				encoding: "base64"
			});
			await n.invalidateQueries(), A.success(a("{name} imported", { name: o.kit.name }));
		} catch (e) {
			A.error(e);
		} finally {
			_(!1), h.current && (h.current.value = "");
		}
	};
	return /* @__PURE__ */ N(x, {
		title: a("Site Kits"),
		actions: /* @__PURE__ */ N(j, { children: [
			/* @__PURE__ */ M("input", {
				ref: h,
				type: "file",
				accept: ".zip,application/zip",
				className: "hidden",
				onChange: (e) => e.target.files?.[0] && void T(e.target.files[0])
			}),
			/* @__PURE__ */ M(f, {
				icon: "upload",
				loading: g,
				onClick: () => h.current?.click(),
				children: a("Import Site")
			}),
			/* @__PURE__ */ M(f, {
				icon: "download",
				onClick: () => c(!0),
				children: a("Export Site")
			})
		] }),
		children: [
			e.isPending ? /* @__PURE__ */ M("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					0,
					1,
					2
				].map((e) => /* @__PURE__ */ M(w, { className: "aspect-[4/3] w-full rounded-lg" }, e))
			}) : e.error ? /* @__PURE__ */ M(C, {
				title: a("Site kits could not be loaded"),
				message: a("Try again in a moment."),
				onRetry: () => e.refetch(),
				retrying: e.isFetching
			}) : e.data.kits.length === 0 ? /* @__PURE__ */ M(m, {
				icon: "box",
				title: a("No site kits")
			}) : /* @__PURE__ */ M("ul", {
				className: "m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3",
				children: e.data.kits.map((e) => /* @__PURE__ */ M(F, {
					kit: e,
					busy: t,
					onChoose: () => void v(e),
					onStartOver: () => void y(e),
					onEdit: () => p(e),
					onDelete: () => void S(e)
				}, e.handle))
			}),
			e.data?.problems.map((e) => /* @__PURE__ */ M(b, {
				tone: "warning",
				title: e.folder,
				className: "mt-4",
				children: e.problem
			}, e.folder)),
			s && /* @__PURE__ */ M(L, { onClose: () => c(!1) }),
			d && /* @__PURE__ */ M(L, {
				kit: d,
				onClose: () => p(null)
			})
		]
	});
}
function F({ kit: e, busy: n, onChoose: r, onStartOver: i, onEdit: o, onDelete: s }) {
	let c = e.missingPlugins.length > 0, l = n === e.handle, u = !e.active && e.suits && !c && n === null, p = e.source !== "saved" && (e.active || e.edited), m = !e.active;
	return /* @__PURE__ */ N("li", {
		className: "cms-reveal-row relative",
		children: [
			/* @__PURE__ */ N(S, {
				inset: !0,
				onClick: r,
				disabled: !u,
				"aria-current": e.active || void 0,
				className: `flex w-full flex-col overflow-hidden rounded-lg border bg-bg p-0 text-left transition-[border-color,box-shadow] duration-base enabled:cursor-pointer ${e.active ? "border-focus shadow-focus" : "border-border enabled:hover:border-border-strong enabled:hover:shadow-sm"}`,
				children: [/* @__PURE__ */ M("span", {
					className: "relative block aspect-[16/10] w-full overflow-hidden border-b border-border bg-sunken",
					children: e.previews[0] ? /* @__PURE__ */ M("img", {
						src: e.previews[0],
						alt: "",
						className: `size-full object-cover object-top transition-opacity ${l ? "opacity-50" : ""}`
					}) : /* @__PURE__ */ M("span", {
						className: "grid size-full place-items-center text-faint",
						children: /* @__PURE__ */ M(g, {
							name: "layout",
							size: 28
						})
					})
				}), /* @__PURE__ */ N("span", {
					className: "flex items-center gap-2 px-3 py-2.5",
					children: [
						/* @__PURE__ */ N("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ M("span", {
								className: "block truncate text-sm font-medium text-ink",
								children: e.name
							}), e.description && /* @__PURE__ */ M("span", {
								className: "block truncate text-xs text-muted",
								children: e.description
							})]
						}),
						e.active && /* @__PURE__ */ M(d, {
							tone: "neutral",
							children: a("Current")
						}),
						!e.active && !c && e.suits && /* @__PURE__ */ M("span", {
							className: "cms-reveal shrink-0 text-xs font-medium text-muted",
							children: a(l ? "Switching…" : "Switch||kit")
						})
					]
				})]
			}),
			c && /* @__PURE__ */ N("div", {
				className: "mt-2 flex items-center gap-2 text-xs text-muted",
				children: [/* @__PURE__ */ M("span", {
					className: "min-w-0 flex-1 truncate",
					children: a("Needs {plugins}", { plugins: e.missingPlugins.join(", ") })
				}), /* @__PURE__ */ M(f, {
					size: "sm",
					onClick: () => t("/plugins"),
					children: a("Open Store")
				})]
			}),
			/* @__PURE__ */ M("div", {
				className: "cms-reveal absolute right-2 top-2",
				children: /* @__PURE__ */ M(y, {
					align: "end",
					trigger: /* @__PURE__ */ M(_, {
						icon: "dots",
						label: a("More"),
						size: "sm",
						disabled: n !== null
					}),
					items: [
						{
							label: a("Edit Details"),
							icon: "edit",
							onSelect: o
						},
						p && {
							label: a("Start Over"),
							icon: "arrow-counter-clockwise",
							danger: !0,
							onSelect: i
						},
						m && {
							label: a("Delete"),
							icon: "trash",
							danger: !0,
							onSelect: s
						}
					]
				})
			})
		]
	});
}
var I = (e) => {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
};
function L({ kit: t, onClose: o }) {
	let d = s().site, [m, _] = u(t?.name ?? ""), [y, b] = u(t?.description ?? ""), [x, C] = u(null), [w, E] = u(!1), [k, j] = u(!1), P = l(null), F = t?.handle ?? O(m), L = !w && !x ? t?.previews[0] : void 0, R = x ? {
		"image/png": "png",
		"image/jpeg": "jpg",
		"image/webp": "webp"
	}[x.type] : void 0, z = c(() => x ? URL.createObjectURL(x) : null, [x]);
	return /* @__PURE__ */ M(p, {
		open: !0,
		onOpenChange: (e) => !e && o(),
		title: a(t ? "Edit Details" : "Export Site"),
		size: "sm",
		onSubmit: async () => {
			j(!0);
			try {
				let s = x && R ? {
					preview: I(new Uint8Array(await x.arrayBuffer())),
					previewType: R
				} : {};
				if (t) {
					await r("kits/update", {
						handle: F,
						name: m.trim(),
						description: y.trim(),
						...s,
						...w ? { removePreview: !0 } : {}
					}), await n.invalidateQueries(), await n.refetchQueries(), i(await e()), A.success(a("{name} saved", { name: m.trim() })), o();
					return;
				}
				let c = await r("kits/export", {
					handle: F,
					name: m.trim(),
					...y.trim() ? { description: y.trim() } : {},
					...s,
					zip: !0
				});
				D(c), A.success(a("{name} exported", { name: c.kit.name })), o();
			} catch (e) {
				A.error(e);
			} finally {
				j(!1);
			}
		},
		submitLabel: a(t ? "Save" : "Export Site"),
		busy: k,
		submitDisabled: !F || !!x && !R,
		children: /* @__PURE__ */ N("div", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ M(h, {
					label: a("Name"),
					htmlFor: "kit-name",
					children: /* @__PURE__ */ M(v, {
						id: "kit-name",
						value: m,
						onChange: (e) => _(e.target.value),
						autoFocus: !0,
						maxLength: 80
					})
				}),
				/* @__PURE__ */ M(h, {
					label: a("Description"),
					htmlFor: "kit-description",
					children: /* @__PURE__ */ M(T, {
						id: "kit-description",
						rows: 3,
						value: y,
						onChange: (e) => b(e.target.value),
						placeholder: d.description || void 0,
						maxLength: 400
					})
				}),
				/* @__PURE__ */ N(h, {
					label: a("Thumbnail"),
					children: [/* @__PURE__ */ M("input", {
						ref: P,
						type: "file",
						accept: "image/png,image/jpeg,image/webp",
						className: "hidden",
						onChange: (e) => {
							C(e.target.files?.[0] ?? null), E(!1);
						}
					}), /* @__PURE__ */ N("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ M(S, {
							compact: !0,
							"aria-label": a(x || L ? "Replace" : "Upload"),
							onClick: () => P.current?.click(),
							className: "grid h-14 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-sm border border-border bg-sunken p-0 text-faint hover:border-border-strong",
							children: z || L ? /* @__PURE__ */ M("img", {
								src: z ?? L,
								alt: "",
								className: "size-full object-cover object-top"
							}) : /* @__PURE__ */ M(g, {
								name: "upload",
								size: 18
							})
						}), /* @__PURE__ */ N("div", {
							className: "flex min-w-0 flex-col items-start gap-1",
							children: [
								/* @__PURE__ */ M(f, {
									size: "sm",
									onClick: () => P.current?.click(),
									children: a(x || L ? "Replace" : "Upload")
								}),
								(x || L) && /* @__PURE__ */ M(f, {
									size: "sm",
									variant: "ghost",
									onClick: () => {
										C(null), E(!0), P.current && (P.current.value = "");
									},
									children: a("Remove")
								}),
								x && !R && /* @__PURE__ */ M("span", {
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
export { P as default };
