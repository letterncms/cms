import { can as e, invalidate as t, locale as n, plural as r, registry as i, run as a, t as o, timeAgo as s, useAbility as c, useManifest as l } from "@letterncms/sdk";
import { Fragment as u, lazy as d, useEffect as f, useMemo as p, useRef as m, useState as h } from "react";
import { Avatar as g, Button as _, Fields as v, Icon as y, IconButton as b, Menu as x, Spinner as S, Textarea as C, Tooltip as w, cn as T, confirm as E, toast as D } from "@letterncms/ui";
import { Fragment as O, jsx as k, jsxs as A } from "react/jsx-runtime";
// admin/src/CommentsPanel.tsx
function j({ entry: n }) {
	let r = n?.id ?? "", i = c("comments/list", { entryId: r }, {
		enabled: !!n,
		refetchInterval: 3e4
	}), a = e("comments.create"), s = c("comments/people", { entryId: r }, {
		enabled: !!n && a,
		staleTime: 3e5
	}), [l, u] = h(!1);
	if (!n) return null;
	let d = i.data ?? [], f = d.filter((e) => !e.resolved), p = d.filter((e) => e.resolved), m = () => t("comments/");
	return /* @__PURE__ */ A("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ k("div", {
			className: "min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3",
			children: i.isLoading ? /* @__PURE__ */ k("div", {
				className: "grid place-items-center py-10 text-faint",
				children: /* @__PURE__ */ k(S, {})
			}) : f.length === 0 && p.length === 0 ? /* @__PURE__ */ k("p", {
				className: "m-0 py-0.5 text-sm text-muted",
				children: o("No comments yet.")
			}) : /* @__PURE__ */ A(O, { children: [
				f.map((e) => /* @__PURE__ */ k(M, {
					thread: e,
					entryId: r,
					people: s.data ?? [],
					onChange: m,
					writable: a
				}, e.id)),
				p.length > 0 && /* @__PURE__ */ A("button", {
					type: "button",
					onClick: () => u(!l),
					className: "flex h-7 items-center gap-1.5 rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
					"aria-expanded": l,
					children: [
						/* @__PURE__ */ k(y, {
							name: "chevron-down",
							size: 12,
							className: T("transition-transform duration-120", !l && "-rotate-90")
						}),
						" ",
						o("{count} resolved", { count: p.length })
					]
				}),
				l && p.map((e) => /* @__PURE__ */ k(M, {
					thread: e,
					entryId: r,
					people: s.data ?? [],
					onChange: m,
					writable: a
				}, e.id))
			] })
		}), a && /* @__PURE__ */ k("div", {
			className: "shrink-0 px-4 pb-4",
			children: /* @__PURE__ */ k(F, {
				entryId: r,
				people: s.data ?? [],
				onPosted: m,
				placeholder: o("Add a comment…")
			})
		})]
	});
}
function M({ thread: e, entryId: t, people: n, onChange: r, writable: i }) {
	let [s, c] = h(!1);
	return /* @__PURE__ */ A("article", {
		className: T("rounded-lg bg-bg shadow-[0_0_0_1px_var(--cms-border)]", e.resolved && "opacity-70"),
		children: [/* @__PURE__ */ A("div", {
			className: "space-y-3 px-3 pb-3 pt-2.5",
			children: [/* @__PURE__ */ k(N, {
				comment: e,
				onChange: r,
				actions: i && /* @__PURE__ */ k(b, {
					icon: e.resolved ? "refresh" : "check",
					label: e.resolved ? o("Reopen") : o("Resolve"),
					size: "xs",
					onClick: async () => {
						try {
							await a("comments/resolve", {
								id: e.id,
								resolved: !e.resolved
							}), r();
						} catch (e) {
							D.error(e);
						}
					}
				})
			}), e.replies.map((e) => /* @__PURE__ */ k(N, {
				comment: e,
				onChange: r
			}, e.id))]
		}), i && /* @__PURE__ */ k("div", {
			className: "border-t border-border px-3 py-2",
			children: s ? /* @__PURE__ */ k(F, {
				entryId: t,
				parentId: e.id,
				people: n,
				autoFocus: !0,
				placeholder: o("Reply…"),
				onPosted: () => {
					c(!1), r();
				},
				onCancel: () => c(!1)
			}) : /* @__PURE__ */ k("button", {
				type: "button",
				onClick: () => c(!0),
				className: "-mx-1.5 flex h-6 items-center rounded-sm px-1.5 text-xs text-muted hover:bg-hover hover:text-ink",
				children: o("Reply")
			})
		})]
	});
}
function N({ comment: t, onChange: r, actions: i }) {
	let [c, l] = h(!1), [u, d] = h(t.body), f = e("comments.moderate");
	return /* @__PURE__ */ A("div", {
		className: "group",
		children: [/* @__PURE__ */ A("div", {
			className: "flex items-center gap-2",
			children: [
				t.author && /* @__PURE__ */ k(g, {
					name: t.author.name,
					initials: t.author.initials,
					src: t.author.avatar,
					size: 20
				}),
				/* @__PURE__ */ k("span", {
					className: "min-w-0 truncate text-xs font-medium text-text",
					children: t.author?.name ?? o("Deleted user")
				}),
				/* @__PURE__ */ k("time", {
					className: "shrink-0 text-xs text-faint",
					dateTime: t.createdAt,
					title: new Date(t.createdAt).toLocaleString(n(), {
						dateStyle: "medium",
						timeStyle: "short"
					}),
					children: t.editedAt ? o("{time} · edited", { time: s(t.createdAt) }) : s(t.createdAt)
				}),
				/* @__PURE__ */ A("div", {
					className: "ml-auto flex items-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100",
					children: [i, (t.mine || f) && /* @__PURE__ */ k(x, {
						trigger: /* @__PURE__ */ k(b, {
							icon: "more",
							label: o("Comment Options"),
							size: "xs"
						}),
						items: [t.mine && {
							label: o("Edit"),
							icon: "edit",
							onSelect: () => l(!0)
						}, {
							label: o("Delete"),
							icon: "trash",
							danger: !0,
							onSelect: async () => {
								if (await E({
									title: o("Delete this comment?"),
									description: t.replies.length ? o("Its replies are deleted too.") : void 0,
									confirm: o("Delete"),
									danger: !0
								})) try {
									await a("comments/delete", { id: t.id }), r();
								} catch (e) {
									D.error(e);
								}
							}
						}]
					})]
				})
			]
		}), c ? /* @__PURE__ */ A("div", {
			className: "mt-2 space-y-2",
			children: [/* @__PURE__ */ k(v, {
				bare: !0,
				fields: [{
					handle: "body",
					type: "textarea",
					label: o("Comment"),
					autofocus: !0,
					rows: 2
				}],
				values: { body: u },
				onChange: (e, t) => d(t ?? "")
			}), /* @__PURE__ */ A("div", {
				className: "flex justify-end gap-1.5",
				children: [/* @__PURE__ */ k(_, {
					size: "xs",
					variant: "ghost",
					onClick: () => {
						l(!1), d(t.body);
					},
					children: o("Cancel")
				}), /* @__PURE__ */ k(_, {
					size: "xs",
					variant: "primary",
					disabled: !u.trim(),
					onClick: async () => {
						try {
							await a("comments/update", {
								id: t.id,
								body: u
							}), l(!1), r();
						} catch (e) {
							D.error(e);
						}
					},
					children: o("Save")
				})]
			})]
		}) : /* @__PURE__ */ k("p", {
			className: "m-0 mt-1.5 whitespace-pre-wrap break-words pl-7 text-sm leading-relaxed text-text",
			children: P(t.body, t.mentions)
		})]
	});
}
function P(e, t) {
	if (!t.length) return e;
	let n = t.map((e) => e.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((e, t) => t.length - e.length);
	return e.split(RegExp(`(@(?:${n.join("|")}))`, "g")).map((e, t) => t % 2 == 1 ? /* @__PURE__ */ k("span", {
		className: "rounded-xs bg-active px-0.5 font-medium text-ink",
		children: e
	}, t) : /* @__PURE__ */ k(u, { children: e }, t));
}
function F({ entryId: e, parentId: t, people: n, onPosted: r, onCancel: i, placeholder: s, autoFocus: c }) {
	let [l, u] = h(""), [d, f] = h(!1), p = async () => {
		if (l.trim() && !d) {
			f(!0);
			try {
				let i = n.filter((e) => l.includes(`@${e.name}`)).map((e) => e.id);
				await a("comments/create", {
					entryId: e,
					parentId: t,
					body: l,
					mentions: i
				}), u(""), r();
			} catch (e) {
				D.error(e);
			} finally {
				f(!1);
			}
		}
	};
	return /* @__PURE__ */ k("form", {
		onSubmit: (e) => {
			e.preventDefault(), p();
		},
		onKeyDown: (e) => e.key === "Escape" && !e.defaultPrevented && i?.(),
		children: /* @__PURE__ */ k(v, {
			bare: !0,
			fields: [{
				handle: "body",
				type: "textarea",
				component: "collaboration-composer",
				label: s,
				placeholder: s,
				autofocus: c,
				people: n,
				trailing: /* @__PURE__ */ A(O, { children: [i && /* @__PURE__ */ k(b, {
					icon: "close",
					label: o("Cancel"),
					size: "sm",
					onClick: i
				}), /* @__PURE__ */ k(b, {
					icon: "arrow-up",
					label: o(t ? "Reply" : "Comment"),
					variant: l.trim() ? "primary" : "ghost",
					size: "sm",
					type: "submit",
					disabled: !l.trim(),
					loading: d
				})] })
			}],
			values: { body: l },
			onChange: (e, t) => u(t)
		})
	});
}
// admin/src/fields.tsx
function I({ field: e, value: t, onChange: n, disabled: r }) {
	let i = t ?? "", a = e.people ?? [], [s, c] = h(null), [l, u] = h(0), d = m(null), f = p(() => s === null ? [] : a.filter((e) => e.name.toLowerCase().includes(s.toLowerCase())).slice(0, 6), [s, a]), _ = (e, t) => {
		let n = e.slice(0, t).match(/(?:^|\s)@([\p{L}\p{N} .'-]{0,30})$/u);
		c(n && !n[1].includes("  ") ? n[1] : null), u(0);
	}, v = (e) => {
		let t = d.current, r = t?.selectionStart ?? i.length, a = i.slice(0, r).replace(/@([\p{L}\p{N} .'-]{0,30})$/u, `@${e.name} `);
		n(a + i.slice(r)), c(null), requestAnimationFrame(() => {
			t?.focus(), t?.setSelectionRange(a.length, a.length);
		});
	};
	return /* @__PURE__ */ A("div", {
		className: "relative",
		children: [f.length > 0 && /* @__PURE__ */ k("ul", {
			role: "listbox",
			"aria-label": o("Mention Someone"),
			className: "cms-pop absolute bottom-full left-0 z-20 mb-1 w-full list-none p-1",
			children: f.map((e, t) => /* @__PURE__ */ k("li", {
				role: "option",
				"aria-selected": t === l,
				children: /* @__PURE__ */ A("button", {
					type: "button",
					onMouseDown: (t) => {
						t.preventDefault(), v(e);
					},
					className: T("flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm", t === l ? "bg-hover" : "hover:bg-hover"),
					children: [/* @__PURE__ */ k(g, {
						name: e.name,
						initials: e.initials,
						src: e.avatar,
						size: 18
					}), e.name]
				})
			}, e.id))
		}), /* @__PURE__ */ A("div", {
			className: "flex items-end gap-1 rounded-lg border border-border bg-bg py-1 pl-2.5 pr-1 transition-colors focus-within:border-border-strong",
			children: [/* @__PURE__ */ k(C, {
				ref: d,
				value: i,
				autoFocus: e.autofocus === !0,
				disabled: r,
				rows: 1,
				appearance: "plain",
				placeholder: e.placeholder,
				"aria-label": e.label,
				onChange: (e) => {
					n(e.target.value), _(e.target.value, e.target.selectionStart);
				},
				onKeyDown: (e) => {
					if (f.length) {
						if (e.key === "ArrowDown" || e.key === "ArrowUp") {
							e.preventDefault(), u((t) => (t + (e.key === "ArrowDown" ? 1 : f.length - 1)) % f.length);
							return;
						}
						if (e.key === "Enter" || e.key === "Tab") {
							e.preventDefault(), v(f[l]);
							return;
						}
						if (e.key === "Escape") {
							e.preventDefault(), c(null);
							return;
						}
					}
					e.key === "Enter" && (e.metaKey || e.ctrlKey) && (e.preventDefault(), e.currentTarget.form?.requestSubmit());
				},
				onBlur: () => c(null),
				className: "max-h-40 flex-1 py-1 text-sm leading-5 placeholder:text-ghost"
			}), e.trailing]
		})]
	});
}
// admin/src/PresenceBar.tsx
var L = 15e3, R = 6e4;
function z({ entry: e, reload: t }) {
	let n = l(), [i, s] = h({ others: [] }), c = m(0), u = e?.id;
	if (f(() => {
		if (!u) return;
		let e = () => c.current = Date.now();
		document.addEventListener("input", e, !0), document.addEventListener("keydown", e, !0);
		let t = !0, n = () => {
			document.visibilityState !== "hidden" && a("collaboration/presence", {
				entryId: u,
				editing: Date.now() - c.current < R
			}).then((e) => t && s(e)).catch(() => {});
		};
		n();
		let r = window.setInterval(n, L);
		return document.addEventListener("visibilitychange", n), () => {
			t = !1, window.clearInterval(r), document.removeEventListener("input", e, !0), document.removeEventListener("keydown", e, !0), document.removeEventListener("visibilitychange", n), a("collaboration/presence", {
				entryId: u,
				leave: !0
			}).catch(() => {});
		};
	}, [u]), !e) return null;
	let d = i.updatedAt && e.updatedAt && Date.parse(i.updatedAt) > Date.parse(e.updatedAt) && i.updatedBy?.id !== n.user.id, p = i.others.filter((e) => e.editing);
	return /* @__PURE__ */ A("div", {
		className: "flex items-center gap-2",
		children: [
			d && /* @__PURE__ */ k(w, {
				content: o("Your unsaved edits will be replaced"),
				children: /* @__PURE__ */ k(_, {
					size: "xs",
					variant: "secondary",
					icon: "refresh",
					onClick: t,
					children: i.updatedBy ? o("{name} saved · Reload", { name: i.updatedBy.name }) : o("Someone saved · Reload")
				})
			}),
			i.others.length > 0 && /* @__PURE__ */ k(w, {
				content: i.others.map((e) => e.editing ? o("{name} is editing", { name: e.name }) : o("{name} is viewing", { name: e.name })).join(" · "),
				children: /* @__PURE__ */ k("div", {
					className: "flex -space-x-1.5",
					"aria-label": r(i.others.length, "{count} other person here", "{count} other people here"),
					children: i.others.slice(0, 4).map((e) => /* @__PURE__ */ k("span", {
						className: T("rounded-full ring-2", e.editing ? "ring-ink" : "ring-bg"),
						children: /* @__PURE__ */ k(g, {
							name: e.name,
							initials: e.initials,
							src: e.avatar,
							size: 22
						})
					}, e.id))
				})
			}),
			p.length > 0 && /* @__PURE__ */ k("span", {
				className: "text-xs text-muted",
				children: p.length === 1 ? o("{name} is editing", { name: p[0].name }) : o("{count} editing", { count: p.length })
			})
		]
	});
}
i.fields.set("collaboration-composer", I), i.panels.set("collaboration-presence", {
	slot: "entry.toolbar",
	component: z,
	order: 1
}), i.panels.set("collaboration-comments", {
	slot: "entry.sidebar",
	label: o("Comments"),
	icon: "comment",
	component: j,
	order: 30,
	when: (e) => !!e.entry
}), i.widgets.set("comments-inbox", d(() => import("./chunks/WidgetComments-Bfyaxo2i.js")));
