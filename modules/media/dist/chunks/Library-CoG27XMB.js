import { i as e, n as t, t as n } from "./upload-D0UQvMEf.js";
import { can as r, invalidate as i, locale as a, plural as o, run as s, setQuery as c, t as l, useAbility as u, useLocation as d } from "@letterncms/sdk";
import { useEffect as f, useState as p } from "react";
import { Badge as m, Button as h, DataView as g, Dialog as _, EmptyState as v, Fields as y, Icon as b, IconButton as x, Menu as ee, NoMatches as te, SelectionBar as ne, cn as S, confirm as C, copyText as w, readViewPrefs as re, toast as T } from "@letterncms/ui";
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
		label: l("Search Files"),
		icon: "search",
		size: "sm",
		placeholder: l("Search files…"),
		className: "w-full sm:w-60"
	}, {
		handle: "kind",
		type: "select",
		label: l("Kind"),
		display: "segmented",
		required: !0,
		options: {
			all: l("All"),
			image: l("Images"),
			video: l("Videos"),
			audio: l("Audio"),
			pdf: "PDF",
			file: l("Other")
		}
	}];
}
function A({ mode: S = "manage", accept: A = "*", multiple: j = !1, selected: M = [], onSelectionChange: N, autoUpload: P = !1, bar: F = !1 }) {
	let { query: I } = d(), [L, R] = p(() => F ? {
		search: I.search ?? "",
		kind: ie.includes(I.kind ?? "") ? I.kind : "all",
		folder: I.folder || null
	} : {
		search: "",
		kind: A.startsWith("image") ? "image" : A.startsWith("video") ? "video" : A === "application/pdf" ? "pdf" : "all",
		folder: null
	}), { kind: se, folder: z } = L;
	f(() => {
		F && c({
			search: L.search || null,
			kind: L.kind === "all" ? null : L.kind,
			folder: L.folder
		});
	}, [F, L]), f(() => {
		if (F) return t.current = z ?? "", () => {
			t.current = "";
		};
	}, [F, z]);
	let [ce, B] = p(1), [V, le] = p(() => re("overview.media", "grid").sort), [H, U] = p(/* @__PURE__ */ new Set()), [W, G] = p(!1), [K, q] = p(null), J = u("media/list", k(L, ce, V), { placeholderData: (e) => e }), Y = J.data?.items ?? [], X = r("media.upload"), ue = (e, t) => {
		B(1), U(/* @__PURE__ */ new Set()), R((n) => ({
			...n,
			[e]: t
		}));
	}, de = (e) => [{
		handle: "files",
		type: "json",
		component: "media-upload",
		label: l("Upload"),
		multiple: S === "manage" || j,
		accept: A === "*" ? void 0 : A,
		...e
	}], fe = async (t) => {
		let n = await e(t, z ?? "");
		if (n.length && S === "pick") {
			let e = j ? [...M, ...n.map((e) => e.id)] : [n[0].id];
			N?.(e, n);
		}
	}, Z = (e) => {
		if (S === "manage") return q(e);
		let t = j ? M.includes(e.id) ? M.filter((t) => t !== e.id) : [...M, e.id] : [e.id];
		N?.(t, [e]);
	}, Q = (e = !1) => X ? /* @__PURE__ */ D(y, {
		layout: "inline",
		bare: !0,
		fields: de({
			variant: S === "manage" ? "primary" : "secondary",
			autofocus: e
		}),
		values: {},
		onChange: (e, t) => void fe(t)
	}) : null, pe = (e, t, n = Y) => {
		if (S === "pick") {
			let r = j ? [...new Set(t ? [...M, ...e] : M.filter((t) => !e.includes(t)))] : t ? e.slice(0, 1) : [];
			N?.(r, n.filter((e) => r.includes(e.id)));
		} else U((n) => {
			let r = new Set(n);
			return e.forEach((e) => t ? r.add(e) : r.delete(e)), r;
		});
	}, $ = async (e) => {
		let t = e.length === 1 ? Y.find((t) => t.id === e[0]) : void 0;
		if (!W && await C({
			title: t ? l("Delete “{name}”?", { name: t.name }) : o(e.length, "Delete {count} file?", "Delete {count} files?"),
			description: l("Pages that use it will show nothing in its place."),
			confirm: l("Delete"),
			danger: !0
		})) {
			G(!0);
			try {
				let t = await Promise.allSettled(e.map((e) => s("media/delete", { id: e }))), n = e.filter((e, n) => t[n].status === "rejected");
				U(new Set(n));
				let r = t.find((e) => e.status === "rejected");
				r?.status === "rejected" && T.error(r.reason), K && e.includes(K.id) && !n.includes(K.id) && q(null), i("media/");
			} finally {
				G(!1);
			}
		}
	}, me = (e) => e.thumb ? /* @__PURE__ */ D("img", {
		src: e.thumb,
		alt: e.alt ?? "",
		loading: "lazy",
		className: "absolute inset-0 size-full object-cover",
		style: { objectPosition: `${e.focal.x}% ${e.focal.y}%` }
	}) : /* @__PURE__ */ D("div", {
		className: "grid size-full place-items-center text-faint",
		children: /* @__PURE__ */ D(b, {
			name: e.kind === "video" ? "video" : e.kind === "audio" ? "file" : "file-text",
			size: 24
		})
	}), he = !!L.search || se !== "all" || z !== null, ge = !he && !J.isError && J.data?.total === 0;
	return /* @__PURE__ */ O("div", {
		className: "min-w-0",
		children: [
			/* @__PURE__ */ D(g, {
				id: "media",
				label: l("Media"),
				items: Y,
				source: {
					ability: "media/list",
					input: k(L, 1, V),
					perPage: 60
				},
				rowKey: (e) => e.id,
				onRowClick: Z,
				defaultView: "grid",
				image: me,
				pagination: J.data && {
					page: J.data.page,
					pages: J.data.pages,
					total: J.data.total,
					perPage: 60,
					onPage: B
				},
				loading: J.isLoading,
				stale: J.isPlaceholderData,
				error: J.isError,
				onRetry: () => void J.refetch(),
				dates: (e) => ({
					publishedAt: null,
					updatedAt: e.updatedAt
				}),
				sort: V,
				dateSort: { updated: "updated_at" },
				onSort: (e) => {
					B(1), le(e);
				},
				selection: {
					ids: S === "manage" ? H : new Set(M),
					onSelect: pe
				},
				selected: (e) => K?.id === e.id,
				toolbar: ge ? void 0 : /* @__PURE__ */ O(E, { children: [/* @__PURE__ */ D(y, {
					layout: "inline",
					bare: !0,
					className: "flex min-w-0 flex-wrap items-center gap-2 max-sm:w-full",
					fields: [...ae(), ...J.data?.folders.length ? [{
						handle: "folder",
						type: "select",
						label: l("Folder"),
						size: "sm",
						placeholder: l("All Folders"),
						options: J.data.folders.map((e) => ({
							value: e,
							label: e,
							icon: "folder"
						})),
						className: "w-44"
					}] : []],
					values: L,
					onChange: ue
				}), !F && Q(P)] }),
				columns: [
					{
						id: "name",
						label: l("Name"),
						sort: "name",
						render: (e) => e.name
					},
					{
						id: "type",
						label: l("Type"),
						width: "160px",
						render: (e) => e.mime
					},
					{
						id: "size",
						label: l("Size"),
						width: "100px",
						align: "end",
						sort: "size",
						render: (e) => n(e.size)
					},
					{
						id: "folder",
						label: l("Folder"),
						width: "160px",
						sort: "folder",
						render: (e) => e.folder || "—"
					},
					{
						id: "alt",
						label: l("Alt Text"),
						hiddenByDefault: !0,
						width: "120px",
						render: (e) => e.kind === "image" ? e.alt ? /* @__PURE__ */ D(m, {
							tone: "success",
							children: l("Added")
						}) : /* @__PURE__ */ D(m, {
							tone: "warning",
							children: l("No alt text")
						}) : "—"
					},
					{
						id: "created",
						label: l("Uploaded"),
						width: "120px",
						sort: "created_at",
						render: (e) => new Date(e.createdAt).toLocaleDateString(a(), { dateStyle: "medium" })
					}
				],
				actions: (e) => /* @__PURE__ */ D(ee, {
					trigger: /* @__PURE__ */ D(x, {
						icon: "more",
						label: l("Actions for {name}", { name: e.name }),
						size: "xs"
					}),
					items: [
						{
							label: l(S === "pick" ? "Choose" : "Open"),
							icon: "edit",
							onSelect: () => Z(e)
						},
						{
							label: l("Copy URL"),
							icon: "copy",
							onSelect: () => void w(new URL(e.url, location.origin).href, {
								copied: l("URL copied"),
								failed: l("Couldn’t copy the URL")
							})
						},
						S === "manage" && r("media.delete") && {
							label: l("Delete"),
							icon: "trash",
							danger: !0,
							disabled: W,
							onSelect: () => void $([e.id])
						}
					]
				}),
				empty: he ? /* @__PURE__ */ D(te, { onClear: () => {
					R({
						search: "",
						kind: "all",
						folder: null
					}), B(1);
				} }) : /* @__PURE__ */ D(v, {
					icon: "media",
					title: l("No files yet"),
					description: X ? l("Images, videos and documents for your pages.") : void 0,
					action: F ? void 0 : Q()
				})
			}),
			F && P && /* @__PURE__ */ D("span", {
				className: "hidden",
				children: Q(!0)
			}),
			S === "manage" && /* @__PURE__ */ D(ne, {
				count: H.size,
				onClear: () => U(/* @__PURE__ */ new Set()),
				children: r("media.delete") && /* @__PURE__ */ D(h, {
					size: "sm",
					variant: "ghost",
					loading: W,
					onClick: () => void $([...H]),
					children: l("Delete")
				})
			}),
			S === "manage" && K && /* @__PURE__ */ D(_, {
				open: !0,
				onOpenChange: (e) => !e && q(null),
				title: K.name,
				children: /* @__PURE__ */ D(oe, {
					item: Y.find((e) => e.id === K.id) ?? K,
					onClose: () => q(null)
				}, K.id)
			})
		]
	});
}
function oe({ item: e, onClose: t }) {
	let [a, c] = p({
		name: e.name,
		alt: e.alt ?? "",
		caption: e.caption ?? "",
		folder: e.folder
	}), [u, d] = p(e.focal), [f, m] = p(!1), g = a.name !== e.name || a.alt !== (e.alt ?? "") || a.caption !== (e.caption ?? "") || a.folder !== e.folder || u.x !== e.focal.x || u.y !== e.focal.y, _ = r("media.edit"), v = async () => {
		m(!0);
		try {
			await s("media/update", {
				id: e.id,
				...a,
				focal: u
			}), i("media/"), T.success(l("Saved"));
		} catch (e) {
			T.error(e);
		} finally {
			m(!1);
		}
	};
	return /* @__PURE__ */ O("div", {
		className: "flex min-w-0 flex-col",
		children: [
			e.kind === "image" ? /* @__PURE__ */ O("div", {
				className: S("relative overflow-hidden rounded-md bg-sunken", _ && "cursor-crosshair"),
				onClick: (e) => {
					if (!_) return;
					let t = e.currentTarget.getBoundingClientRect();
					d({
						x: Math.round((e.clientX - t.left) / t.width * 100),
						y: Math.round((e.clientY - t.top) / t.height * 100)
					});
				},
				title: l("Click to set the focal point. Crops keep it in view."),
				children: [/* @__PURE__ */ D("img", {
					src: e.thumb ?? e.url,
					alt: "",
					className: "block w-full"
				}), /* @__PURE__ */ D("span", {
					className: "pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4)]",
					style: {
						left: `${u.x}%`,
						top: `${u.y}%`
					}
				})]
			}) : e.kind === "video" ? /* @__PURE__ */ D("video", {
				src: e.url,
				controls: !0,
				className: "w-full rounded-md"
			}) : /* @__PURE__ */ D("div", {
				className: "grid h-32 place-items-center rounded-md bg-sunken text-muted",
				children: /* @__PURE__ */ D(b, {
					name: "file-text",
					size: 28
				})
			}),
			/* @__PURE__ */ O("dl", {
				className: "my-4 grid grid-cols-[80px_1fr] gap-y-1 text-xs",
				children: [
					/* @__PURE__ */ D("dt", {
						className: "text-faint",
						children: l("Type")
					}),
					/* @__PURE__ */ D("dd", {
						className: "m-0 truncate",
						children: e.mime
					}),
					/* @__PURE__ */ D("dt", {
						className: "text-faint",
						children: l("Size")
					}),
					/* @__PURE__ */ D("dd", {
						className: "m-0",
						children: n(e.size)
					}),
					e.width && /* @__PURE__ */ O(E, { children: [/* @__PURE__ */ D("dt", {
						className: "text-faint",
						children: l("Dimensions")
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
						children: l("URL")
					}),
					/* @__PURE__ */ O("dd", {
						className: "m-0 flex items-center gap-1",
						children: [/* @__PURE__ */ D("span", {
							className: "truncate font-mono",
							children: e.url
						}), /* @__PURE__ */ D(x, {
							icon: "copy",
							label: l("Copy URL"),
							size: "xs",
							onClick: () => void w(new URL(e.url, location.origin).href, {
								copied: l("URL copied"),
								failed: l("Couldn’t copy the URL")
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ D(y, {
				className: "gap-y-4!",
				disabled: !_,
				fields: [
					{
						handle: "name",
						type: "text",
						label: l("Name"),
						size: "sm"
					},
					...e.kind === "image" ? [{
						handle: "alt",
						type: "textarea",
						label: l("Alt Text"),
						rows: 2,
						instructions: a.alt ? o(a.alt.length, "{count} character", "{count} characters") : l("Describe what the image shows, for screen readers and search.")
					}] : [],
					{
						handle: "caption",
						type: "textarea",
						label: l("Caption"),
						rows: 2
					},
					{
						handle: "folder",
						type: "text",
						label: l("Folder"),
						size: "sm",
						mono: !0,
						placeholder: "team/2026"
					}
				],
				values: a,
				onChange: (e, t) => c({
					...a,
					[e]: t ?? ""
				})
			}),
			/* @__PURE__ */ O("div", {
				className: "mt-5 flex items-center justify-between border-t border-border pt-4",
				children: [r("media.delete") ? /* @__PURE__ */ D(h, {
					size: "sm",
					variant: "ghost",
					className: "text-danger",
					icon: "trash",
					onClick: async () => {
						if (await C({
							title: l("Delete “{name}”?", { name: e.name }),
							description: l("Pages that use it will show nothing in its place."),
							confirm: l("Delete"),
							danger: !0
						})) try {
							await s("media/delete", { id: e.id }), i("media/"), t();
						} catch (e) {
							T.error(e);
						}
					},
					children: l("Delete")
				}) : /* @__PURE__ */ D("span", {}), _ && /* @__PURE__ */ D(h, {
					size: "sm",
					variant: "primary",
					disabled: !g,
					loading: f,
					onClick: v,
					children: l("Save")
				})]
			})
		]
	});
}
export { A as t };
