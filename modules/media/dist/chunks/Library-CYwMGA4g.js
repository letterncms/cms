import { r as e, t } from "./upload-CUTK6dbQ.js";
import { can as n, invalidate as r, locale as i, plural as a, run as o, setQuery as s, t as c, useAbility as l, useLocation as u } from "@letterncms/sdk";
import { useEffect as d, useState as f } from "react";
import { Badge as p, Button as m, DataView as h, Dialog as g, EmptyState as _, Fields as v, Icon as y, IconButton as b, Menu as ee, NoMatches as te, SelectionBar as ne, cn as x, confirm as S, copyText as C, formatBytes as w, readViewPrefs as re, toast as T } from "@letterncms/ui";
import { Fragment as E, jsx as D, jsxs as O } from "react/jsx-runtime";
// admin/src/Library.tsx
var ie = [
	"all",
	"image",
	"video",
	"audio",
	"pdf",
	"file"
], k = (e, t, n) => ({
	search: e.search || void 0,
	kind: e.kind,
	folder: e.folder,
	page: t,
	perPage: 60,
	sort: n ?? void 0
});
function ae() {
	return [{
		handle: "search",
		type: "text",
		label: c("Search Files"),
		icon: "search",
		size: "sm",
		placeholder: c("Search Files"),
		className: "w-full sm:w-60"
	}, {
		handle: "kind",
		type: "select",
		label: c("Kind"),
		display: "segmented",
		required: !0,
		options: {
			all: c("All"),
			image: c("Images"),
			video: c("Videos"),
			audio: c("Audio"),
			pdf: "PDF",
			file: c("Other")
		}
	}];
}
function A({ mode: x = "manage", accept: A = "*", multiple: j = !1, selected: M = [], onSelectionChange: N, autoUpload: P = !1, bar: F = !1 }) {
	let { query: I } = u(), L = A.startsWith("image") ? "image" : A.startsWith("video") ? "video" : A === "application/pdf" ? "pdf" : "all", [R, z] = f(() => F ? {
		search: I.search ?? "",
		kind: ie.includes(I.kind ?? "") ? I.kind : "all",
		folder: I.folder || null
	} : {
		search: "",
		kind: L,
		folder: null
	}), { kind: B, folder: V } = R;
	d(() => {
		F && s({
			search: R.search || null,
			kind: R.kind === "all" ? null : R.kind,
			folder: R.folder
		});
	}, [F, R]), d(() => {
		if (F) return t.current = V ?? "", () => {
			t.current = "";
		};
	}, [F, V]);
	let [se, H] = f(1), [U, ce] = f(() => re("overview.media", "grid").sort), [W, G] = f(/* @__PURE__ */ new Set()), [K, q] = f(!1), [J, Y] = f(null), X = l("media/list", k(R, se, U), { placeholderData: (e) => e }), Z = X.data?.items ?? [], le = n("media.upload"), ue = (e, t) => {
		H(1), G(/* @__PURE__ */ new Set()), z((n) => ({
			...n,
			[e]: t
		}));
	}, de = (e) => [{
		handle: "files",
		type: "json",
		component: "media-upload",
		label: c("Upload"),
		multiple: x === "manage" || j,
		accept: A === "*" ? void 0 : A,
		...e
	}], fe = async (t) => {
		let n = await e(t, V ?? "");
		if (n.length && x === "pick") {
			let e = j ? [...M, ...n.map((e) => e.id)] : [n[0].id];
			N?.(e, n);
		}
	}, Q = (e) => {
		if (x === "manage") return Y(e);
		let t = j ? M.includes(e.id) ? M.filter((t) => t !== e.id) : [...M, e.id] : [e.id];
		N?.(t, [e]);
	}, $ = (e = !1) => le ? /* @__PURE__ */ D(v, {
		layout: "inline",
		bare: !0,
		fields: de({
			variant: x === "manage" ? "primary" : "secondary",
			autofocus: e
		}),
		values: {},
		onChange: (e, t) => void fe(t)
	}) : null, pe = (e, t, n = Z) => {
		if (x === "pick") {
			let r = j ? [...new Set(t ? [...M, ...e] : M.filter((t) => !e.includes(t)))] : t ? e.slice(0, 1) : [];
			N?.(r, n.filter((e) => r.includes(e.id)));
		} else G((n) => {
			let r = new Set(n);
			return e.forEach((e) => t ? r.add(e) : r.delete(e)), r;
		});
	}, me = async (e) => {
		let t = e.length === 1 ? Z.find((t) => t.id === e[0]) : void 0;
		if (!K && await S({
			title: t ? c("Delete “{name}”?", { name: t.name }) : a(e.length, "Delete {count} file?", "Delete {count} files?"),
			description: c("Pages that use it will show nothing in its place."),
			confirm: c("Delete"),
			danger: !0
		})) {
			q(!0);
			try {
				let t = await Promise.allSettled(e.map((e) => o("media/delete", { id: e }))), n = e.filter((e, n) => t[n].status === "rejected");
				G(new Set(n));
				let i = t.find((e) => e.status === "rejected");
				i?.status === "rejected" && T.error(i.reason), J && e.includes(J.id) && !n.includes(J.id) && Y(null), r("media/");
			} finally {
				q(!1);
			}
		}
	}, he = (e) => e.thumb ? /* @__PURE__ */ D("img", {
		src: e.thumb,
		alt: e.alt ?? "",
		loading: "lazy",
		className: "absolute inset-0 size-full object-cover",
		style: { objectPosition: `${e.focal.x}% ${e.focal.y}%` }
	}) : /* @__PURE__ */ D("div", {
		className: "grid size-full place-items-center text-faint",
		children: /* @__PURE__ */ D(y, {
			name: e.kind === "video" ? "video" : e.kind === "audio" ? "file" : "file-text",
			size: 24
		})
	}), ge = !!R.search || B !== (F ? "all" : L) || V !== null, _e = !ge && B === "all" && !X.isError && X.data?.total === 0;
	return /* @__PURE__ */ O("div", {
		className: "min-w-0",
		children: [
			/* @__PURE__ */ D(h, {
				id: "media",
				label: c("Media"),
				items: Z,
				source: {
					ability: "media/list",
					input: k(R, 1, U),
					perPage: 60
				},
				rowKey: (e) => e.id,
				onRowClick: Q,
				defaultView: "grid",
				image: he,
				pagination: X.data && {
					page: X.data.page,
					pages: X.data.pages,
					total: X.data.total,
					perPage: 60,
					onPage: H
				},
				loading: X.isLoading,
				stale: X.isPlaceholderData,
				error: X.isError,
				onRetry: () => void X.refetch(),
				dates: (e) => ({
					publishedAt: null,
					updatedAt: e.updatedAt
				}),
				sort: U,
				dateSort: { updated: "updated_at" },
				onSort: (e) => {
					H(1), ce(e);
				},
				selection: {
					ids: x === "manage" ? W : new Set(M),
					onSelect: pe
				},
				selected: (e) => J?.id === e.id,
				toolbar: _e ? void 0 : /* @__PURE__ */ O(E, { children: [/* @__PURE__ */ D(v, {
					layout: "inline",
					bare: !0,
					className: "flex min-w-0 flex-wrap items-center gap-2 max-sm:w-full",
					fields: [...ae(), ...X.data?.folders.length ? [{
						handle: "folder",
						type: "select",
						label: c("Folder"),
						size: "sm",
						placeholder: c("All Folders"),
						options: X.data.folders.map((e) => ({
							value: e,
							label: e,
							icon: "folder"
						})),
						className: "w-44"
					}] : []],
					values: R,
					onChange: ue
				}), !F && $(P)] }),
				columns: [
					{
						id: "name",
						label: c("Name"),
						sort: "name",
						render: (e) => e.name
					},
					{
						id: "type",
						label: c("Type"),
						width: "160px",
						render: (e) => e.mime
					},
					{
						id: "size",
						label: c("Size"),
						width: "100px",
						align: "end",
						sort: "size",
						render: (e) => w(e.size)
					},
					{
						id: "folder",
						label: c("Folder"),
						width: "160px",
						sort: "folder",
						render: (e) => e.folder || "—"
					},
					{
						id: "alt",
						label: c("Alt Text"),
						hiddenByDefault: !0,
						width: "120px",
						render: (e) => e.kind === "image" ? e.alt ? /* @__PURE__ */ D(p, {
							tone: "success",
							children: c("Added")
						}) : /* @__PURE__ */ D(p, {
							tone: "warning",
							children: c("No alt text")
						}) : "—"
					},
					{
						id: "created",
						label: c("Uploaded"),
						width: "120px",
						sort: "created_at",
						render: (e) => new Date(e.createdAt).toLocaleDateString(i(), { dateStyle: "medium" })
					}
				],
				actions: (e) => /* @__PURE__ */ D(ee, {
					trigger: /* @__PURE__ */ D(b, {
						icon: "more",
						label: c("Actions for {name}", { name: e.name }),
						size: "xs"
					}),
					items: [
						{
							label: c(x === "pick" ? "Choose" : "Open"),
							icon: "edit",
							onSelect: () => Q(e)
						},
						{
							label: c("Copy URL"),
							icon: "copy",
							onSelect: () => void C(new URL(e.url, location.origin).href, {
								copied: c("URL copied"),
								failed: c("Couldn’t copy the URL")
							})
						},
						x === "manage" && n("media.delete") && {
							label: c("Delete"),
							icon: "trash",
							danger: !0,
							disabled: K,
							onSelect: () => void me([e.id])
						}
					]
				}),
				empty: ge ? /* @__PURE__ */ D(te, { onClear: () => {
					z({
						search: "",
						kind: F ? "all" : L,
						folder: null
					}), H(1);
				} }) : /* @__PURE__ */ D(_, {
					icon: "media",
					title: c(B === "image" ? "No images yet" : B === "video" ? "No videos yet" : "No files yet"),
					action: F ? void 0 : $()
				})
			}),
			F && P && /* @__PURE__ */ D("span", {
				className: "hidden",
				children: $(!0)
			}),
			x === "manage" && /* @__PURE__ */ D(ne, {
				count: W.size,
				onClear: () => G(/* @__PURE__ */ new Set()),
				children: n("media.delete") && /* @__PURE__ */ D(m, {
					size: "sm",
					variant: "ghost",
					loading: K,
					onClick: () => void me([...W]),
					children: c("Delete")
				})
			}),
			x === "manage" && J && /* @__PURE__ */ D(g, {
				open: !0,
				onOpenChange: (e) => !e && Y(null),
				title: J.name,
				children: /* @__PURE__ */ D(oe, {
					item: Z.find((e) => e.id === J.id) ?? J,
					onClose: () => Y(null)
				}, J.id)
			})
		]
	});
}
function oe({ item: e, onClose: t }) {
	let [i, s] = f({
		name: e.name,
		alt: e.alt ?? "",
		caption: e.caption ?? "",
		folder: e.folder
	}), [l, u] = f(e.focal), [d, p] = f(!1), h = i.name !== e.name || i.alt !== (e.alt ?? "") || i.caption !== (e.caption ?? "") || i.folder !== e.folder || l.x !== e.focal.x || l.y !== e.focal.y, g = n("media.edit"), _ = async () => {
		p(!0);
		try {
			await o("media/update", {
				id: e.id,
				...i,
				focal: l
			}), r("media/"), T.success(c("Saved"));
		} catch (e) {
			T.error(e);
		} finally {
			p(!1);
		}
	};
	return /* @__PURE__ */ O("div", {
		className: "flex min-w-0 flex-col",
		children: [
			e.kind === "image" ? /* @__PURE__ */ O("div", {
				className: x("relative overflow-hidden rounded-md bg-sunken", g && "cursor-crosshair"),
				onClick: (e) => {
					if (!g) return;
					let t = e.currentTarget.getBoundingClientRect();
					u({
						x: Math.round((e.clientX - t.left) / t.width * 100),
						y: Math.round((e.clientY - t.top) / t.height * 100)
					});
				},
				title: c("Click to set the focal point. Crops keep it in view."),
				children: [/* @__PURE__ */ D("img", {
					src: e.thumb ?? e.url,
					alt: "",
					className: "block w-full"
				}), /* @__PURE__ */ D("span", {
					className: "pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4)]",
					style: {
						left: `${l.x}%`,
						top: `${l.y}%`
					}
				})]
			}) : e.kind === "video" ? /* @__PURE__ */ D("video", {
				src: e.url,
				controls: !0,
				className: "w-full rounded-md"
			}) : /* @__PURE__ */ D("div", {
				className: "grid h-32 place-items-center rounded-md bg-sunken text-muted",
				children: /* @__PURE__ */ D(y, {
					name: "file-text",
					size: 28
				})
			}),
			/* @__PURE__ */ O("dl", {
				className: "my-4 grid grid-cols-[80px_1fr] gap-y-1 text-xs",
				children: [
					/* @__PURE__ */ D("dt", {
						className: "text-faint",
						children: c("Type")
					}),
					/* @__PURE__ */ D("dd", {
						className: "m-0 truncate",
						children: e.mime
					}),
					/* @__PURE__ */ D("dt", {
						className: "text-faint",
						children: c("Size")
					}),
					/* @__PURE__ */ D("dd", {
						className: "m-0",
						children: w(e.size)
					}),
					e.width && /* @__PURE__ */ O(E, { children: [/* @__PURE__ */ D("dt", {
						className: "text-faint",
						children: c("Dimensions")
					}), /* @__PURE__ */ O("dd", {
						className: "m-0",
						children: [
							e.width,
							" × ",
							e.height
						]
					})] }),
					/* @__PURE__ */ D("dt", {
						className: "text-faint",
						children: c("URL")
					}),
					/* @__PURE__ */ O("dd", {
						className: "m-0 flex items-center gap-1",
						children: [/* @__PURE__ */ D("span", {
							className: "truncate font-mono",
							children: e.url
						}), /* @__PURE__ */ D(b, {
							icon: "copy",
							label: c("Copy URL"),
							size: "xs",
							onClick: () => void C(new URL(e.url, location.origin).href, {
								copied: c("URL copied"),
								failed: c("Couldn’t copy the URL")
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ D(v, {
				className: "gap-y-4!",
				disabled: !g,
				fields: [
					{
						handle: "name",
						type: "text",
						label: c("Name"),
						size: "sm"
					},
					...e.kind === "image" ? [{
						handle: "alt",
						type: "textarea",
						label: c("Alt Text"),
						rows: 2,
						instructions: i.alt ? a(i.alt.length, "{count} character", "{count} characters") : c("Describe what the image shows, for screen readers and search.")
					}] : [],
					{
						handle: "caption",
						type: "textarea",
						label: c("Caption"),
						rows: 2
					},
					{
						handle: "folder",
						type: "text",
						label: c("Folder"),
						size: "sm",
						mono: !0,
						placeholder: "team/2026"
					}
				],
				values: i,
				onChange: (e, t) => s({
					...i,
					[e]: t ?? ""
				})
			}),
			/* @__PURE__ */ O("div", {
				className: "mt-5 flex items-center justify-between border-t border-border pt-4",
				children: [n("media.delete") ? /* @__PURE__ */ D(m, {
					size: "sm",
					variant: "destructive",
					icon: "trash",
					onClick: async () => {
						if (await S({
							title: c("Delete “{name}”?", { name: e.name }),
							description: c("Pages that use it will show nothing in its place."),
							confirm: c("Delete"),
							danger: !0
						})) try {
							await o("media/delete", { id: e.id }), r("media/"), t();
						} catch (e) {
							T.error(e);
						}
					},
					children: c("Delete")
				}) : /* @__PURE__ */ D("span", {}), g && /* @__PURE__ */ D(m, {
					size: "sm",
					variant: "primary",
					disabled: !h,
					loading: d,
					onClick: _,
					children: c("Save")
				})]
			})
		]
	});
}
export { A as t };
