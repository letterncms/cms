import { can as e, loadManifest as t, navigate as n, queryClient as r, run as i, setManifest as a, t as o, useAbility as s, useManifest as c } from "@letterncms/sdk";
import { useMemo as l, useRef as u, useState as d } from "react";
import { Badge as f, Button as p, Dialog as m, EmptyState as h, Field as g, Icon as _, IconButton as v, Input as y, Menu as b, Notice as x, Page as S, Pressable as C, QueryError as w, Skeleton as T, Textarea as E, confirm as D, download as O, slugify as k, switchKit as A, toast as j } from "@letterncms/ui";
import { Fragment as M, jsx as N, jsxs as P } from "react/jsx-runtime";
// admin/src/Kits.tsx
function F() {
	let t = s("kits/list"), [a, c] = d(null), [l, f] = d(!1), [m, g] = d(null), _ = u(null), [v, y] = d(!1), b = async (e) => {
		c(e.handle), await A(e, { home: !1 }), c(null);
	}, C = async (e) => {
		await D({
			title: o("Start {name} over?", { name: e.name }),
			description: e.active ? o("The site goes back to {name} as it came. What you changed is gone.", { name: e.name }) : o("{name} goes back to how it came. What you changed in it is gone.", { name: e.name }),
			confirm: o("Start Over"),
			danger: !0
		}) && (c(e.handle), await A(e, {
			fresh: !0,
			home: !1
		}), c(null));
	}, E = async (e) => {
		if (await D({
			title: o("Delete {name}?", { name: e.name }),
			description: o("The kit goes, with what you changed in it. Your site stays as it is."),
			confirm: o("Delete"),
			danger: !0
		})) {
			c(e.handle);
			try {
				await i("kits/delete", { handle: e.handle }), await r.invalidateQueries(), j.success(o("{name} deleted", { name: e.name }));
			} catch (e) {
				j.error(e);
			} finally {
				c(null);
			}
		}
	}, O = async (e) => {
		y(!0);
		try {
			let t = new Uint8Array(await e.arrayBuffer()), n = "";
			for (let e = 0; e < t.length; e += 32768) n += String.fromCharCode(...t.subarray(e, e + 32768));
			let a = await i("kits/import", {
				content: btoa(n),
				encoding: "base64"
			});
			await r.invalidateQueries(), j.success(o("{name} imported", { name: a.kit.name }));
		} catch (e) {
			j.error(e);
		} finally {
			y(!1), _.current && (_.current.value = "");
		}
	};
	return /* @__PURE__ */ P(S, {
		title: o("Site Kits"),
		actions: /* @__PURE__ */ P(M, { children: [
			/* @__PURE__ */ N("input", {
				ref: _,
				type: "file",
				accept: ".zip,application/zip",
				className: "hidden",
				onChange: (e) => e.target.files?.[0] && void O(e.target.files[0])
			}),
			e("packages.manage") && /* @__PURE__ */ N(p, {
				icon: "search",
				onClick: () => n("/kits/store"),
				children: o("Browse Store")
			}),
			/* @__PURE__ */ N(p, {
				icon: "upload",
				loading: v,
				onClick: () => _.current?.click(),
				children: o("Import Site")
			}),
			/* @__PURE__ */ N(p, {
				icon: "download",
				onClick: () => f(!0),
				children: o("Export Site")
			})
		] }),
		children: [
			t.isPending ? /* @__PURE__ */ N("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					0,
					1,
					2
				].map((e) => /* @__PURE__ */ N(T, { className: "aspect-[4/3] w-full rounded-lg" }, e))
			}) : t.error ? /* @__PURE__ */ N(w, {
				title: o("Site kits could not be loaded"),
				message: o("Try again in a moment."),
				onRetry: () => t.refetch(),
				retrying: t.isFetching
			}) : t.data.kits.length === 0 ? /* @__PURE__ */ N(h, {
				icon: "box",
				title: o("No site kits")
			}) : /* @__PURE__ */ N("ul", {
				className: "m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3",
				children: t.data.kits.map((e) => /* @__PURE__ */ N(I, {
					kit: e,
					busy: a,
					onChoose: () => void b(e),
					onStartOver: () => void C(e),
					onEdit: () => g(e),
					onDelete: () => void E(e)
				}, e.handle))
			}),
			t.data?.problems.map((e) => /* @__PURE__ */ N(x, {
				tone: "warning",
				title: e.folder,
				className: "mt-4",
				children: e.problem
			}, e.folder)),
			l && /* @__PURE__ */ N(R, { onClose: () => f(!1) }),
			m && /* @__PURE__ */ N(R, {
				kit: m,
				onClose: () => g(null)
			})
		]
	});
}
function I({ kit: e, busy: t, onChoose: r, onStartOver: i, onEdit: a, onDelete: s }) {
	let c = e.missingPlugins.length > 0, l = t === e.handle, u = !e.active && e.suits && !c && t === null, d = e.source !== "saved" && (e.active || e.edited), m = !e.active;
	return /* @__PURE__ */ P("li", {
		className: "cms-reveal-row relative",
		children: [
			/* @__PURE__ */ P(C, {
				inset: !0,
				onClick: r,
				disabled: !u,
				"aria-current": e.active || void 0,
				className: `flex w-full flex-col overflow-hidden rounded-lg border bg-bg p-0 text-left transition-[border-color,box-shadow] duration-base enabled:cursor-pointer ${e.active ? "border-focus shadow-focus" : "border-border enabled:hover:border-border-strong enabled:hover:shadow-sm"}`,
				children: [/* @__PURE__ */ N("span", {
					className: "relative block aspect-[16/10] w-full overflow-hidden border-b border-border bg-sunken",
					children: e.previews[0] ? /* @__PURE__ */ N("img", {
						src: e.previews[0],
						alt: "",
						className: `size-full object-cover object-top transition-opacity ${l ? "opacity-50" : ""}`
					}) : /* @__PURE__ */ N("span", {
						className: "grid size-full place-items-center text-faint",
						children: /* @__PURE__ */ N(_, {
							name: "layout",
							size: 28
						})
					})
				}), /* @__PURE__ */ P("span", {
					className: "flex items-center gap-2 px-3 py-2.5",
					children: [
						/* @__PURE__ */ P("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ N("span", {
								className: "block truncate text-sm font-medium text-ink",
								children: e.name
							}), e.description && /* @__PURE__ */ N("span", {
								className: "block truncate text-xs text-muted",
								children: e.description
							})]
						}),
						e.active && /* @__PURE__ */ N(f, {
							tone: "neutral",
							children: o("Current")
						}),
						!e.active && !c && e.suits && /* @__PURE__ */ N("span", {
							className: "cms-reveal shrink-0 text-xs font-medium text-muted",
							children: o(l ? "Switching…" : "Switch||kit")
						})
					]
				})]
			}),
			c && /* @__PURE__ */ P("div", {
				className: "mt-2 flex items-center gap-2 text-xs text-muted",
				children: [/* @__PURE__ */ N("span", {
					className: "min-w-0 flex-1 truncate",
					children: o("Needs {plugins}", { plugins: e.missingPlugins.join(", ") })
				}), /* @__PURE__ */ N(p, {
					size: "sm",
					onClick: () => n("/plugins"),
					children: o("Open Store")
				})]
			}),
			/* @__PURE__ */ N("div", {
				className: "cms-reveal absolute right-2 top-2",
				children: /* @__PURE__ */ N(b, {
					align: "end",
					trigger: /* @__PURE__ */ N(v, {
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
						m && {
							label: o("Delete"),
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
var L = (e) => {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
};
function R({ kit: e, onClose: n }) {
	let s = c().site, [f, h] = d(e?.name ?? ""), [v, b] = d(e?.description ?? ""), [x, S] = d(null), [w, T] = d(!1), [D, A] = d(!1), M = u(null), F = e?.handle ?? k(f), I = !w && !x ? e?.previews[0] : void 0, R = x ? {
		"image/png": "png",
		"image/jpeg": "jpg",
		"image/webp": "webp"
	}[x.type] : void 0, z = l(() => x ? URL.createObjectURL(x) : null, [x]);
	return /* @__PURE__ */ N(m, {
		open: !0,
		onOpenChange: (e) => !e && n(),
		title: o(e ? "Edit Details" : "Export Site"),
		size: "sm",
		onSubmit: async () => {
			A(!0);
			try {
				let s = x && R ? {
					preview: L(new Uint8Array(await x.arrayBuffer())),
					previewType: R
				} : {};
				if (e) {
					await i("kits/update", {
						handle: F,
						name: f.trim(),
						description: v.trim(),
						...s,
						...w ? { removePreview: !0 } : {}
					}), await r.invalidateQueries(), await r.refetchQueries(), a(await t()), j.success(o("{name} saved", { name: f.trim() })), n();
					return;
				}
				let c = await i("kits/export", {
					handle: F,
					name: f.trim(),
					...v.trim() ? { description: v.trim() } : {},
					...s,
					zip: !0
				});
				O(c), j.success(o("{name} exported", { name: c.kit.name })), n();
			} catch (e) {
				j.error(e);
			} finally {
				A(!1);
			}
		},
		submitLabel: o(e ? "Save" : "Export Site"),
		busy: D,
		submitDisabled: !F || !!x && !R,
		children: /* @__PURE__ */ P("div", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ N(g, {
					label: o("Name"),
					htmlFor: "kit-name",
					children: /* @__PURE__ */ N(y, {
						id: "kit-name",
						value: f,
						onChange: (e) => h(e.target.value),
						autoFocus: !0,
						maxLength: 80
					})
				}),
				/* @__PURE__ */ N(g, {
					label: o("Description"),
					htmlFor: "kit-description",
					children: /* @__PURE__ */ N(E, {
						id: "kit-description",
						rows: 3,
						value: v,
						onChange: (e) => b(e.target.value),
						placeholder: s.description || void 0,
						maxLength: 400
					})
				}),
				/* @__PURE__ */ P(g, {
					label: o("Thumbnail"),
					children: [/* @__PURE__ */ N("input", {
						ref: M,
						type: "file",
						accept: "image/png,image/jpeg,image/webp",
						className: "hidden",
						onChange: (e) => {
							S(e.target.files?.[0] ?? null), T(!1);
						}
					}), /* @__PURE__ */ P("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ N(C, {
							compact: !0,
							"aria-label": o(x || I ? "Replace" : "Upload"),
							onClick: () => M.current?.click(),
							className: "grid h-14 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-sm border border-border bg-sunken p-0 text-faint hover:border-border-strong",
							children: z || I ? /* @__PURE__ */ N("img", {
								src: z ?? I,
								alt: "",
								className: "size-full object-cover object-top"
							}) : /* @__PURE__ */ N(_, {
								name: "upload",
								size: 18
							})
						}), /* @__PURE__ */ P("div", {
							className: "flex min-w-0 flex-col items-start gap-1",
							children: [
								/* @__PURE__ */ N(p, {
									size: "sm",
									onClick: () => M.current?.click(),
									children: o(x || I ? "Replace" : "Upload")
								}),
								(x || I) && /* @__PURE__ */ N(p, {
									size: "sm",
									variant: "ghost",
									onClick: () => {
										S(null), T(!0), M.current && (M.current.value = "");
									},
									children: o("Remove")
								}),
								x && !R && /* @__PURE__ */ N("span", {
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
export { F as default };
