import { r as e, t } from "./upload-CUTK6dbQ.js";
import { can as n, invalidate as r, locale as i, plural as a, run as o, setQuery as s, t as c, useAbility as l, useLocation as u } from "@letterncms/sdk";
import { useEffect as d, useState as f } from "react";
import { Badge as p, Button as m, DataView as h, Dialog as g, EmptyState as _, Fields as v, Icon as y, IconButton as b, Menu as ee, NoMatches as te, SelectionBar as ne, cn as x, confirm as S, copyText as C, formatBytes as w, readViewPrefs as re, toast as T } from "@letterncms/ui";
import { Fragment as ie, jsx as E, jsxs as D } from "react/jsx-runtime";
// admin/src/Library.tsx
var ae = [
	"all",
	"image",
	"video",
	"audio",
	"pdf",
	"file"
], O = (e, t, n) => ({
	search: e.search || void 0,
	kind: e.kind,
	folder: e.folder,
	page: t,
	perPage: 60,
	sort: n ?? void 0
});
function oe() {
	return [{
		handle: "search",
		type: "text",
		label: c("Search Files"),
		icon: "search",
		size: "sm",
		placeholder: c("Search files…"),
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
function k({ mode: x = "manage", accept: k = "*", multiple: A = !1, selected: j = [], onSelectionChange: M, autoUpload: N = !1, bar: P = !1 }) {
	let { query: F } = u(), [I, L] = f(() => P ? {
		search: F.search ?? "",
		kind: ae.includes(F.kind ?? "") ? F.kind : "all",
		folder: F.folder || null
	} : {
		search: "",
		kind: k.startsWith("image") ? "image" : k.startsWith("video") ? "video" : k === "application/pdf" ? "pdf" : "all",
		folder: null
	}), { kind: ce, folder: R } = I;
	d(() => {
		P && s({
			search: I.search || null,
			kind: I.kind === "all" ? null : I.kind,
			folder: I.folder
		});
	}, [P, I]), d(() => {
		if (P) return t.current = R ?? "", () => {
			t.current = "";
		};
	}, [P, R]);
	let [le, z] = f(1), [B, ue] = f(() => re("overview.media", "grid").sort), [V, H] = f(/* @__PURE__ */ new Set()), [U, W] = f(!1), [G, K] = f(null), q = l("media/list", O(I, le, B), { placeholderData: (e) => e }), J = q.data?.items ?? [], Y = n("media.upload"), de = (e, t) => {
		z(1), H(/* @__PURE__ */ new Set()), L((n) => ({
			...n,
			[e]: t
		}));
	}, fe = (e) => [{
		handle: "files",
		type: "json",
		component: "media-upload",
		label: c("Upload"),
		multiple: x === "manage" || A,
		accept: k === "*" ? void 0 : k,
		...e
	}], pe = async (t) => {
		let n = await e(t, R ?? "");
		if (n.length && x === "pick") {
			let e = A ? [...j, ...n.map((e) => e.id)] : [n[0].id];
			M?.(e, n);
		}
	}, X = (e) => {
		if (x === "manage") return K(e);
		let t = A ? j.includes(e.id) ? j.filter((t) => t !== e.id) : [...j, e.id] : [e.id];
		M?.(t, [e]);
	}, Z = (e = !1) => Y ? /* @__PURE__ */ E(v, {
		layout: "inline",
		bare: !0,
		fields: fe({
			variant: x === "manage" ? "primary" : "secondary",
			autofocus: e
		}),
		values: {},
		onChange: (e, t) => void pe(t)
	}) : null, me = (e, t, n = J) => {
		if (x === "pick") {
			let r = A ? [...new Set(t ? [...j, ...e] : j.filter((t) => !e.includes(t)))] : t ? e.slice(0, 1) : [];
			M?.(r, n.filter((e) => r.includes(e.id)));
		} else H((n) => {
			let r = new Set(n);
			return e.forEach((e) => t ? r.add(e) : r.delete(e)), r;
		});
	}, Q = async (e) => {
		let t = e.length === 1 ? J.find((t) => t.id === e[0]) : void 0;
		if (!U && await S({
			title: t ? c("Delete “{name}”?", { name: t.name }) : a(e.length, "Delete {count} file?", "Delete {count} files?"),
			description: c("Pages that use it will show nothing in its place."),
			confirm: c("Delete"),
			danger: !0
		})) {
			W(!0);
			try {
				let t = await Promise.allSettled(e.map((e) => o("media/delete", { id: e }))), n = e.filter((e, n) => t[n].status === "rejected");
				H(new Set(n));
				let i = t.find((e) => e.status === "rejected");
				i?.status === "rejected" && T.error(i.reason), G && e.includes(G.id) && !n.includes(G.id) && K(null), r("media/");
			} finally {
				W(!1);
			}
		}
	}, he = (e) => e.thumb ? /* @__PURE__ */ E("img", {
		src: e.thumb,
		alt: e.alt ?? "",
		loading: "lazy",
		className: "absolute inset-0 size-full object-cover",
		style: { objectPosition: `${e.focal.x}% ${e.focal.y}%` }
	}) : /* @__PURE__ */ E("div", {
		className: "grid size-full place-items-center text-faint",
		children: /* @__PURE__ */ E(y, {
			name: e.kind === "video" ? "video" : e.kind === "audio" ? "file" : "file-text",
			size: 24
		})
	}), $ = !!I.search || ce !== "all" || R !== null, ge = !$ && !q.isError && q.data?.total === 0;
	return /* @__PURE__ */ D("div", {
		className: "min-w-0",
		children: [
			/* @__PURE__ */ E(h, {
				id: "media",
				label: c("Media"),
				items: J,
				source: {
					ability: "media/list",
					input: O(I, 1, B),
					perPage: 60
				},
				rowKey: (e) => e.id,
				onRowClick: X,
				defaultView: "grid",
				image: he,
				pagination: q.data && {
					page: q.data.page,
					pages: q.data.pages,
					total: q.data.total,
					perPage: 60,
					onPage: z
				},
				loading: q.isLoading,
				stale: q.isPlaceholderData,
				error: q.isError,
				onRetry: () => void q.refetch(),
				dates: (e) => ({
					publishedAt: null,
					updatedAt: e.updatedAt
				}),
				sort: B,
				dateSort: { updated: "updated_at" },
				onSort: (e) => {
					z(1), ue(e);
				},
				selection: {
					ids: x === "manage" ? V : new Set(j),
					onSelect: me
				},
				selected: (e) => G?.id === e.id,
				toolbar: ge ? void 0 : /* @__PURE__ */ D(ie, { children: [/* @__PURE__ */ E(v, {
					layout: "inline",
					bare: !0,
					className: "flex min-w-0 flex-wrap items-center gap-2 max-sm:w-full",
					fields: [...oe(), ...q.data?.folders.length ? [{
						handle: "folder",
						type: "select",
						label: c("Folder"),
						size: "sm",
						placeholder: c("All Folders"),
						options: q.data.folders.map((e) => ({
							value: e,
							label: e,
							icon: "folder"
						})),
						className: "w-44"
					}] : []],
					values: I,
					onChange: de
				}), !P && Z(N)] }),
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
						render: (e) => e.kind === "image" ? e.alt ? /* @__PURE__ */ E(p, {
							tone: "success",
							children: c("Added")
						}) : /* @__PURE__ */ E(p, {
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
				actions: (e) => /* @__PURE__ */ E(ee, {
					trigger: /* @__PURE__ */ E(b, {
						icon: "more",
						label: c("Actions for {name}", { name: e.name }),
						size: "xs"
					}),
					items: [
						{
							label: c(x === "pick" ? "Choose" : "Open"),
							icon: "edit",
							onSelect: () => X(e)
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
							disabled: U,
							onSelect: () => void Q([e.id])
						}
					]
				}),
				empty: $ ? /* @__PURE__ */ E(te, { onClear: () => {
					L({
						search: "",
						kind: "all",
						folder: null
					}), z(1);
				} }) : /* @__PURE__ */ E(_, {
					icon: "media",
					title: c("No files yet"),
					description: Y ? c("Images, videos and documents for your pages.") : void 0,
					action: P ? void 0 : Z()
				})
			}),
			P && N && /* @__PURE__ */ E("span", {
				className: "hidden",
				children: Z(!0)
			}),
			x === "manage" && /* @__PURE__ */ E(ne, {
				count: V.size,
				onClear: () => H(/* @__PURE__ */ new Set()),
				children: n("media.delete") && /* @__PURE__ */ E(m, {
					size: "sm",
					variant: "ghost",
					loading: U,
					onClick: () => void Q([...V]),
					children: c("Delete")
				})
			}),
			x === "manage" && G && /* @__PURE__ */ E(g, {
				open: !0,
				onOpenChange: (e) => !e && K(null),
				title: G.name,
				children: /* @__PURE__ */ E(se, {
					item: J.find((e) => e.id === G.id) ?? G,
					onClose: () => K(null)
				}, G.id)
			})
		]
	});
}
function se({ item: e, onClose: t }) {
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
	return /* @__PURE__ */ D("div", {
		className: "flex min-w-0 flex-col",
		children: [
			e.kind === "image" ? /* @__PURE__ */ D("div", {
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
				children: [/* @__PURE__ */ E("img", {
					src: e.thumb ?? e.url,
					alt: "",
					className: "block w-full"
				}), /* @__PURE__ */ E("span", {
					className: "pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4)]",
					style: {
						left: `${l.x}%`,
						top: `${l.y}%`
					}
				})]
			}) : e.kind === "video" ? /* @__PURE__ */ E("video", {
				src: e.url,
				controls: !0,
				className: "w-full rounded-md"
			}) : /* @__PURE__ */ E("div", {
				className: "grid h-32 place-items-center rounded-md bg-sunken text-muted",
				children: /* @__PURE__ */ E(y, {
					name: "file-text",
					size: 28
				})
			}),
			/* @__PURE__ */ D("dl", {
				className: "my-4 grid grid-cols-[80px_1fr] gap-y-1 text-xs",
				children: [
					/* @__PURE__ */ E("dt", {
						className: "text-faint",
						children: c("Type")
					}),
					/* @__PURE__ */ E("dd", {
						className: "m-0 truncate",
						children: e.mime
					}),
					/* @__PURE__ */ E("dt", {
						className: "text-faint",
						children: c("Size")
					}),
					/* @__PURE__ */ E("dd", {
						className: "m-0",
						children: w(e.size)
					}),
					e.width && /* @__PURE__ */ D(ie, { children: [/* @__PURE__ */ E("dt", {
						className: "text-faint",
						children: c("Dimensions")
					}), /* @__PURE__ */ D("dd", {
						className: "m-0",
						children: [
							e.width,
							" × ",
							e.height
						]
					})] }),
					/* @__PURE__ */ E("dt", {
						className: "text-faint",
						children: c("URL")
					}),
					/* @__PURE__ */ D("dd", {
						className: "m-0 flex items-center gap-1",
						children: [/* @__PURE__ */ E("span", {
							className: "truncate font-mono",
							children: e.url
						}), /* @__PURE__ */ E(b, {
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
			/* @__PURE__ */ E(v, {
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
			/* @__PURE__ */ D("div", {
				className: "mt-5 flex items-center justify-between border-t border-border pt-4",
				children: [n("media.delete") ? /* @__PURE__ */ E(m, {
					size: "sm",
					variant: "ghost",
					className: "text-danger",
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
				}) : /* @__PURE__ */ E("span", {}), g && /* @__PURE__ */ E(m, {
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
export { k as t };
