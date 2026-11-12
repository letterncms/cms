import { loadManifest as e, navigate as t, queryClient as n, run as r, setManifest as i, t as a, useAbility as o, useManifest as s } from "@letterncms/sdk";
import { useMemo as c, useRef as l, useState as u } from "react";
import { Badge as d, Button as f, Dialog as p, EmptyState as m, Field as h, Icon as g, IconButton as _, Input as v, Menu as y, Notice as b, Page as x, QueryError as S, Skeleton as C, Textarea as w, confirm as T, download as E, slugify as D, switchKit as O, toast as k } from "@letterncms/ui";
import { Fragment as A, jsx as j, jsxs as M } from "react/jsx-runtime";
// admin/src/Kits.tsx
function N() {
	let e = o("kits/list"), [t, i] = u(null), [s, c] = u(!1), [d, p] = u(null), h = l(null), [g, _] = u(!1), v = async (e) => {
		i(e.handle), await O(e, { home: !1 }), i(null);
	}, y = async (e) => {
		await T({
			title: a("Start {name} over?", { name: e.name }),
			description: e.active ? a("The site goes back to {name} as it came. What you changed is gone.", { name: e.name }) : a("{name} goes back to how it came. What you changed in it is gone.", { name: e.name }),
			confirm: a("Start Over"),
			danger: !0
		}) && (i(e.handle), await O(e, {
			fresh: !0,
			home: !1
		}), i(null));
	}, w = async (e) => {
		if (await T({
			title: a("Delete {name}?", { name: e.name }),
			description: a("The kit goes, with what you changed in it. Your site stays as it is."),
			confirm: a("Delete"),
			danger: !0
		})) {
			i(e.handle);
			try {
				await r("kits/delete", { handle: e.handle }), await n.invalidateQueries(), k.success(a("{name} deleted", { name: e.name }));
			} catch (e) {
				k.error(e);
			} finally {
				i(null);
			}
		}
	}, E = async (e) => {
		if (await T({
			title: a("Use the design of {name}?", { name: e.name }),
			description: a("Templates, components, fonts and styles are replaced with {name}’s. Your pages, posts and menus stay.", { name: e.name }),
			confirm: a("Use Design")
		})) {
			i(e.handle);
			try {
				await r("kits/apply", {
					handle: e.handle,
					mode: "design",
					clash: "replace"
				}), await n.invalidateQueries(), k.success(a("{name}’s design is on this site", { name: e.name }));
			} catch (e) {
				k.error(e);
			} finally {
				i(null);
			}
		}
	}, D = async (e) => {
		_(!0);
		try {
			let t = new Uint8Array(await e.arrayBuffer()), i = "";
			for (let e = 0; e < t.length; e += 32768) i += String.fromCharCode(...t.subarray(e, e + 32768));
			let o = await r("kits/import", {
				content: btoa(i),
				encoding: "base64"
			});
			await n.invalidateQueries(), k.success(a("{name} imported", { name: o.kit.name }));
		} catch (e) {
			k.error(e);
		} finally {
			_(!1), h.current && (h.current.value = "");
		}
	};
	return /* @__PURE__ */ M(x, {
		title: a("Site Kits"),
		actions: /* @__PURE__ */ M(A, { children: [
			/* @__PURE__ */ j("input", {
				ref: h,
				type: "file",
				accept: ".zip,application/zip",
				className: "hidden",
				onChange: (e) => e.target.files?.[0] && void D(e.target.files[0])
			}),
			/* @__PURE__ */ j(f, {
				icon: "upload",
				loading: g,
				onClick: () => h.current?.click(),
				children: a("Import Site")
			}),
			/* @__PURE__ */ j(f, {
				icon: "download",
				onClick: () => c(!0),
				children: a("Export Site")
			})
		] }),
		children: [
			e.isPending ? /* @__PURE__ */ j("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					0,
					1,
					2
				].map((e) => /* @__PURE__ */ j(C, { className: "aspect-[4/3] w-full rounded-lg" }, e))
			}) : e.error ? /* @__PURE__ */ j(S, {
				title: a("Site kits could not be loaded"),
				message: a("Try again in a moment."),
				onRetry: () => e.refetch(),
				retrying: e.isFetching
			}) : e.data.kits.length === 0 ? /* @__PURE__ */ j(m, {
				icon: "box",
				title: a("No site kits")
			}) : /* @__PURE__ */ j("ul", {
				className: "m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3",
				children: e.data.kits.map((e) => /* @__PURE__ */ j(P, {
					kit: e,
					busy: t,
					onChoose: () => void v(e),
					onStartOver: () => void y(e),
					onDesign: () => void E(e),
					onEdit: () => p(e),
					onDelete: () => void w(e)
				}, e.handle))
			}),
			e.data?.problems.map((e) => /* @__PURE__ */ j(b, {
				tone: "warning",
				title: e.folder,
				className: "mt-4",
				children: e.problem
			}, e.folder)),
			s && /* @__PURE__ */ j(I, { onClose: () => c(!1) }),
			d && /* @__PURE__ */ j(I, {
				kit: d,
				onClose: () => p(null)
			})
		]
	});
}
function P({ kit: e, busy: n, onChoose: r, onStartOver: i, onDesign: o, onEdit: s, onDelete: c }) {
	let l = e.missingPlugins.length > 0, u = n === e.handle, p = !e.active && e.suits && !l && n === null, m = e.source !== "saved" && (e.active || e.edited), h = e.source !== "builtin", v = h && !e.active;
	return /* @__PURE__ */ M("li", {
		className: "group relative",
		children: [
			/* @__PURE__ */ M("button", {
				type: "button",
				onClick: r,
				disabled: !p,
				"aria-current": e.active || void 0,
				className: `flex w-full flex-col overflow-hidden rounded-lg border bg-bg p-0 text-left outline-none transition-[border-color,box-shadow] duration-base enabled:cursor-pointer ${e.active ? "border-[var(--cms-focus)] shadow-[var(--cms-shadow-focus)]" : "border-border enabled:hover:border-border-strong enabled:hover:shadow-sm focus-visible:border-[var(--cms-focus)] focus-visible:shadow-[var(--cms-shadow-focus)]"}`,
				children: [/* @__PURE__ */ j("span", {
					className: "relative block aspect-[16/10] w-full overflow-hidden border-b border-border bg-sunken",
					children: e.previews[0] ? /* @__PURE__ */ j("img", {
						src: e.previews[0],
						alt: "",
						className: `size-full object-cover object-top transition-opacity ${u ? "opacity-50" : ""}`
					}) : /* @__PURE__ */ j("span", {
						className: "grid size-full place-items-center text-faint",
						children: /* @__PURE__ */ j(g, {
							name: "layout",
							size: 28
						})
					})
				}), /* @__PURE__ */ M("span", {
					className: "flex items-center gap-2 px-3 py-2.5",
					children: [
						/* @__PURE__ */ M("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ j("span", {
								className: "block truncate text-sm font-medium text-ink",
								children: e.name
							}), e.description && /* @__PURE__ */ j("span", {
								className: "block truncate text-xs text-muted",
								children: e.description
							})]
						}),
						e.active && /* @__PURE__ */ j(d, {
							tone: "neutral",
							children: a("Current")
						}),
						!e.active && !l && e.suits && /* @__PURE__ */ j("span", {
							className: "shrink-0 text-xs font-medium text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
							children: a(u ? "Switching…" : "Switch||kit")
						})
					]
				})]
			}),
			l && /* @__PURE__ */ M("div", {
				className: "mt-2 flex items-center gap-2 text-xs text-muted",
				children: [/* @__PURE__ */ j("span", {
					className: "min-w-0 flex-1 truncate",
					children: a("Needs {plugins}", { plugins: e.missingPlugins.join(", ") })
				}), /* @__PURE__ */ j(f, {
					size: "sm",
					onClick: () => t("/plugins"),
					children: a("Open Store")
				})]
			}),
			(h || v || m || !e.active && e.source !== "saved" && e.suits) && /* @__PURE__ */ j("div", {
				className: "absolute right-2 top-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 data-[open]:opacity-100",
				children: /* @__PURE__ */ j(y, {
					align: "end",
					trigger: /* @__PURE__ */ j(_, {
						icon: "dots",
						label: a("More"),
						size: "sm",
						disabled: n !== null
					}),
					items: [
						h && {
							label: a("Edit Details"),
							icon: "edit",
							onSelect: s
						},
						!e.active && e.source !== "saved" && e.suits && !l && {
							label: a("Use Only the Design"),
							icon: "palette",
							onSelect: o
						},
						m && {
							label: a("Start Over"),
							icon: "arrow-counter-clockwise",
							danger: !0,
							onSelect: i
						},
						v && {
							label: a("Delete"),
							icon: "trash",
							danger: !0,
							onSelect: c
						}
					]
				})
			})
		]
	});
}
var F = (e) => {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
};
function I({ kit: t, onClose: o }) {
	let d = s().site, [m, _] = u(t?.name ?? ""), [y, b] = u(t?.description ?? ""), [x, S] = u(null), [C, T] = u(!1), [O, A] = u(!1), N = l(null), P = t?.handle ?? D(m), I = !C && !x ? t?.previews[0] : void 0, L = x ? {
		"image/png": "png",
		"image/jpeg": "jpg",
		"image/webp": "webp"
	}[x.type] : void 0, R = c(() => x ? URL.createObjectURL(x) : null, [x]);
	return /* @__PURE__ */ j(p, {
		open: !0,
		onOpenChange: (e) => !e && o(),
		title: a(t ? "Edit Details" : "Export Site"),
		size: "sm",
		onSubmit: async () => {
			A(!0);
			try {
				let s = x && L ? {
					preview: F(new Uint8Array(await x.arrayBuffer())),
					previewType: L
				} : {};
				if (t) {
					await r("kits/update", {
						handle: P,
						name: m.trim(),
						description: y.trim(),
						...s,
						...C ? { removePreview: !0 } : {}
					}), await n.invalidateQueries(), await n.refetchQueries(), i(await e()), k.success(a("{name} saved", { name: m.trim() })), o();
					return;
				}
				let c = await r("kits/export", {
					handle: P,
					name: m.trim(),
					...y.trim() ? { description: y.trim() } : {},
					...s,
					zip: !0
				});
				E(c), k.success(a("{name} exported", { name: c.kit.name })), o();
			} catch (e) {
				k.error(e);
			} finally {
				A(!1);
			}
		},
		submitLabel: a(t ? "Save" : "Export Site"),
		busy: O,
		submitDisabled: !P || !!x && !L,
		children: /* @__PURE__ */ M("div", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ j(h, {
					label: a("Name"),
					htmlFor: "kit-name",
					children: /* @__PURE__ */ j(v, {
						id: "kit-name",
						value: m,
						onChange: (e) => _(e.target.value),
						autoFocus: !0,
						maxLength: 80
					})
				}),
				/* @__PURE__ */ j(h, {
					label: a("Description"),
					htmlFor: "kit-description",
					children: /* @__PURE__ */ j(w, {
						id: "kit-description",
						rows: 3,
						value: y,
						onChange: (e) => b(e.target.value),
						placeholder: d.description || void 0,
						maxLength: 400
					})
				}),
				/* @__PURE__ */ M(h, {
					label: a("Thumbnail"),
					children: [/* @__PURE__ */ j("input", {
						ref: N,
						type: "file",
						accept: "image/png,image/jpeg,image/webp",
						className: "hidden",
						onChange: (e) => {
							S(e.target.files?.[0] ?? null), T(!1);
						}
					}), /* @__PURE__ */ M("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ j("button", {
							type: "button",
							onClick: () => N.current?.click(),
							className: "grid h-14 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-sm border border-border bg-sunken p-0 text-faint hover:border-border-strong",
							children: R || I ? /* @__PURE__ */ j("img", {
								src: R ?? I,
								alt: "",
								className: "size-full object-cover object-top"
							}) : /* @__PURE__ */ j(g, {
								name: "upload",
								size: 18
							})
						}), /* @__PURE__ */ M("div", {
							className: "flex min-w-0 flex-col items-start gap-1",
							children: [
								/* @__PURE__ */ j(f, {
									size: "sm",
									onClick: () => N.current?.click(),
									children: a(x || I ? "Replace" : "Upload")
								}),
								(x || I) && /* @__PURE__ */ j(f, {
									size: "sm",
									variant: "ghost",
									onClick: () => {
										S(null), T(!0), N.current && (N.current.value = "");
									},
									children: a("Remove")
								}),
								x && !L && /* @__PURE__ */ j("span", {
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
export { N as default };
