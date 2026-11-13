import { can as e, invalidate as t, locale as n, plural as r, registry as i, run as a, t as o, timeAgo as s, useAbility as c, useManifest as l } from "@letterncms/sdk";
import { Fragment as u, lazy as d, useEffect as f, useMemo as p, useRef as m, useState as h, useSyncExternalStore as g } from "react";
import { Avatar as _, Button as v, EmptyState as y, Fields as b, Icon as x, IconButton as S, Menu as C, Notice as w, Spinner as T, Textarea as E, Tooltip as D, cn as O, confirm as k, toast as A } from "@letterncms/ui";
import { Fragment as j, jsx as M, jsxs as N } from "react/jsx-runtime";
// admin/src/CommentsPanel.tsx
function P({ entry: n }) {
	let r = n?.id ?? "", i = c("comments/list", { entryId: r }, {
		enabled: !!n,
		refetchInterval: 3e4
	}), a = e("comments.create"), s = c("comments/people", { entryId: r }, {
		enabled: !!n && a,
		staleTime: 3e5
	}), [l, u] = h(!1);
	if (!n) return null;
	let d = i.data ?? [], f = d.filter((e) => !e.resolved), p = d.filter((e) => e.resolved), m = () => t("comments/");
	return /* @__PURE__ */ N("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ M("div", {
			className: "min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3",
			children: i.isLoading ? /* @__PURE__ */ M("div", {
				className: "grid place-items-center py-10 text-faint",
				children: /* @__PURE__ */ M(T, {})
			}) : f.length === 0 && p.length === 0 ? /* @__PURE__ */ M(y, {
				compact: !0,
				icon: "comment",
				title: o("No comments yet")
			}) : /* @__PURE__ */ N(j, { children: [
				f.map((e) => /* @__PURE__ */ M(F, {
					thread: e,
					entryId: r,
					people: s.data ?? [],
					onChange: m,
					writable: a
				}, e.id)),
				p.length > 0 && /* @__PURE__ */ N(v, {
					variant: "ghost",
					size: "xs",
					onClick: () => u(!l),
					className: "!px-1.5 !font-normal !text-muted hover:!text-ink",
					"aria-expanded": l,
					children: [
						/* @__PURE__ */ M(x, {
							name: "chevron-down",
							size: 12,
							className: O("transition-transform duration-fast", !l && "-rotate-90")
						}),
						" ",
						o("{count} resolved", { count: p.length })
					]
				}),
				l && p.map((e) => /* @__PURE__ */ M(F, {
					thread: e,
					entryId: r,
					people: s.data ?? [],
					onChange: m,
					writable: a
				}, e.id))
			] })
		}), a && /* @__PURE__ */ M("div", {
			className: "shrink-0 px-4 pb-4",
			children: /* @__PURE__ */ M(R, {
				entryId: r,
				people: s.data ?? [],
				onPosted: m,
				placeholder: o("Add a comment…")
			})
		})]
	});
}
function F({ thread: e, entryId: t, people: n, onChange: r, writable: i }) {
	let [s, c] = h(!1);
	return /* @__PURE__ */ N("article", {
		className: O("rounded-lg bg-bg ring-1 ring-border", e.resolved && "opacity-70"),
		children: [/* @__PURE__ */ N("div", {
			className: "space-y-3 px-3 pb-3 pt-2.5",
			children: [/* @__PURE__ */ M(I, {
				comment: e,
				onChange: r,
				actions: i && /* @__PURE__ */ M(S, {
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
							A.error(e);
						}
					}
				})
			}), e.replies.map((e) => /* @__PURE__ */ M(I, {
				comment: e,
				onChange: r
			}, e.id))]
		}), i && /* @__PURE__ */ M("div", {
			className: "border-t border-border px-3 py-2",
			children: s ? /* @__PURE__ */ M(R, {
				entryId: t,
				parentId: e.id,
				people: n,
				autoFocus: !0,
				placeholder: o("Reply…"),
				onPosted: () => {
					c(!1), r();
				},
				onCancel: () => c(!1)
			}) : /* @__PURE__ */ M(v, {
				variant: "ghost",
				size: "xs",
				onClick: () => c(!0),
				className: "-mx-1.5 !px-1.5 !font-normal !text-muted hover:!text-ink",
				children: o("Reply")
			})
		})]
	});
}
function I({ comment: t, onChange: r, actions: i }) {
	let [c, l] = h(!1), [u, d] = h(t.body), f = e("comments.moderate");
	return /* @__PURE__ */ N("div", {
		className: "cms-reveal-row",
		children: [/* @__PURE__ */ N("div", {
			className: "flex items-center gap-2",
			children: [
				t.author && /* @__PURE__ */ M(_, {
					name: t.author.name,
					initials: t.author.initials,
					src: t.author.avatar,
					size: 20
				}),
				/* @__PURE__ */ M("span", {
					className: "min-w-0 truncate text-xs font-medium text-text",
					children: t.author?.name ?? o("Deleted user")
				}),
				/* @__PURE__ */ M("time", {
					className: "shrink-0 text-xs text-faint",
					dateTime: t.createdAt,
					title: new Date(t.createdAt).toLocaleString(n(), {
						dateStyle: "medium",
						timeStyle: "short"
					}),
					children: t.editedAt ? o("{time} · edited", { time: s(t.createdAt) }) : s(t.createdAt)
				}),
				/* @__PURE__ */ N("div", {
					className: "cms-reveal ml-auto flex items-center",
					children: [i, (t.mine || f) && /* @__PURE__ */ M(C, {
						trigger: /* @__PURE__ */ M(S, {
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
								if (await k({
									title: o("Delete this comment?"),
									description: t.replies.length ? o("Its replies are deleted too.") : void 0,
									confirm: o("Delete"),
									danger: !0
								})) try {
									await a("comments/delete", { id: t.id }), r();
								} catch (e) {
									A.error(e);
								}
							}
						}]
					})]
				})
			]
		}), c ? /* @__PURE__ */ N("div", {
			className: "mt-2 space-y-2",
			children: [/* @__PURE__ */ M(b, {
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
			}), /* @__PURE__ */ N("div", {
				className: "flex justify-end gap-1.5",
				children: [/* @__PURE__ */ M(v, {
					size: "xs",
					variant: "ghost",
					onClick: () => {
						l(!1), d(t.body);
					},
					children: o("Cancel")
				}), /* @__PURE__ */ M(v, {
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
							A.error(e);
						}
					},
					children: o("Save Comment")
				})]
			})]
		}) : /* @__PURE__ */ M("p", {
			className: "m-0 mt-1.5 whitespace-pre-wrap break-words pl-7 text-sm leading-relaxed text-text",
			children: L(t.body, t.mentions)
		})]
	});
}
function L(e, t) {
	if (!t.length) return e;
	let n = t.map((e) => e.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((e, t) => t.length - e.length);
	return e.split(RegExp(`(@(?:${n.join("|")}))`, "g")).map((e, t) => t % 2 == 1 ? /* @__PURE__ */ M("span", {
		className: "rounded-xs bg-active px-0.5 font-medium text-ink",
		children: e
	}, t) : /* @__PURE__ */ M(u, { children: e }, t));
}
function R({ entryId: e, parentId: t, people: n, onPosted: r, onCancel: i, placeholder: s, autoFocus: c }) {
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
				A.error(e);
			} finally {
				f(!1);
			}
		}
	};
	return /* @__PURE__ */ M("form", {
		onSubmit: (e) => {
			e.preventDefault(), p();
		},
		onKeyDown: (e) => e.key === "Escape" && !e.defaultPrevented && i?.(),
		children: /* @__PURE__ */ M(b, {
			bare: !0,
			fields: [{
				handle: "body",
				type: "textarea",
				component: "collaboration-composer",
				label: s,
				placeholder: s,
				autofocus: c,
				people: n,
				trailing: /* @__PURE__ */ N(j, { children: [i && /* @__PURE__ */ M(S, {
					icon: "close",
					label: o("Cancel"),
					size: "sm",
					onClick: i
				}), /* @__PURE__ */ M(S, {
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
function z({ field: e, value: t, onChange: n, disabled: r }) {
	let i = t ?? "", a = e.people ?? [], [s, c] = h(null), [l, u] = h(0), d = m(null), f = p(() => s === null ? [] : a.filter((e) => e.name.toLowerCase().includes(s.toLowerCase())).slice(0, 6), [s, a]), g = (e, t) => {
		let n = e.slice(0, t).match(/(?:^|\s)@([\p{L}\p{N} .'-]{0,30})$/u);
		c(n && !n[1].includes("  ") ? n[1] : null), u(0);
	}, y = (e) => {
		let t = d.current, r = t?.selectionStart ?? i.length, a = i.slice(0, r).replace(/@([\p{L}\p{N} .'-]{0,30})$/u, `@${e.name} `);
		n(a + i.slice(r)), c(null), requestAnimationFrame(() => {
			t?.focus(), t?.setSelectionRange(a.length, a.length);
		});
	};
	return /* @__PURE__ */ N("div", {
		className: "relative",
		children: [f.length > 0 && /* @__PURE__ */ M("ul", {
			role: "listbox",
			"aria-label": o("Mention Someone"),
			className: "cms-pop absolute bottom-full left-0 z-raised mb-1 w-full list-none p-1",
			children: f.map((e, t) => /* @__PURE__ */ M("li", {
				role: "option",
				"aria-selected": t === l,
				children: /* @__PURE__ */ N(v, {
					variant: "ghost",
					tabIndex: -1,
					onMouseDown: (t) => {
						t.preventDefault(), y(e);
					},
					"data-active": t === l || void 0,
					className: "w-full !justify-start !gap-2 !px-2 !font-normal",
					children: [/* @__PURE__ */ M(_, {
						name: e.name,
						initials: e.initials,
						src: e.avatar,
						size: 18
					}), e.name]
				})
			}, e.id))
		}), /* @__PURE__ */ N("div", {
			className: "flex items-end gap-1 rounded-lg border border-border bg-bg py-1 pl-2.5 pr-1 transition-colors focus-within:border-border-strong",
			children: [/* @__PURE__ */ M(E, {
				ref: d,
				value: i,
				autoFocus: e.autofocus === !0,
				disabled: r,
				rows: 1,
				appearance: "plain",
				placeholder: e.placeholder,
				"aria-label": e.label,
				onChange: (e) => {
					n(e.target.value), g(e.target.value, e.target.selectionStart);
				},
				onKeyDown: (e) => {
					if (f.length) {
						if (e.key === "ArrowDown" || e.key === "ArrowUp") {
							e.preventDefault(), u((t) => (t + (e.key === "ArrowDown" ? 1 : f.length - 1)) % f.length);
							return;
						}
						if (e.key === "Enter" || e.key === "Tab") {
							e.preventDefault(), y(f[l]);
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
var B = 15e3, V = 6e4, H = /* @__PURE__ */ new Map(), U = /* @__PURE__ */ new Set(), W = (e) => (U.add(e), () => {
	U.delete(e);
}), G = (e, t) => {
	t ? H.set(e, {
		...t,
		was: t.holding || H.get(e)?.was && !t.holding
	}) : H.delete(e), U.forEach((e) => e());
}, K = /* @__PURE__ */ new Map();
function q({ entry: e, reload: t }) {
	let n = l(), [i, s] = h({ others: [] }), c = m(0), u = e?.id;
	if (f(() => {
		if (!u) return;
		let e = () => {
			let e = Date.now() - c.current >= V;
			c.current = Date.now(), e && n();
		};
		document.addEventListener("input", e, !0), document.addEventListener("keydown", e, !0);
		let t = !0;
		function n() {
			document.visibilityState !== "hidden" && a("collaboration/presence", {
				entryId: u,
				editing: Date.now() - c.current < V
			}).then((e) => {
				t && (s(e), G(u, e));
			}).catch(() => {});
		}
		K.set(u, n), n();
		let r = window.setInterval(n, B);
		return document.addEventListener("visibilitychange", n), () => {
			t = !1, window.clearInterval(r), document.removeEventListener("input", e, !0), document.removeEventListener("keydown", e, !0), document.removeEventListener("visibilitychange", n), K.delete(u), G(u, null), a("collaboration/presence", {
				entryId: u,
				leave: !0
			}).catch(() => {});
		};
	}, [u]), !e) return null;
	let d = i.updatedAt && e.updatedAt && Date.parse(i.updatedAt) > Date.parse(e.updatedAt) && i.updatedBy?.id !== n.user.id, p = i.others.filter((e) => e.editing);
	return /* @__PURE__ */ N("div", {
		className: "flex items-center gap-2",
		children: [
			d && /* @__PURE__ */ M(D, {
				content: o("Your unsaved edits will be replaced"),
				children: /* @__PURE__ */ M(v, {
					size: "xs",
					variant: "secondary",
					icon: "refresh",
					onClick: t,
					children: i.updatedBy ? o("{name} saved · Reload", { name: i.updatedBy.name }) : o("Someone saved · Reload")
				})
			}),
			i.others.length > 0 && /* @__PURE__ */ M(D, {
				content: i.others.map((e) => e.editing ? o("{name} is editing", { name: e.name }) : o("{name} is viewing", { name: e.name })).join(" · "),
				children: /* @__PURE__ */ M("div", {
					className: "flex -space-x-1.5",
					"aria-label": r(i.others.length, "{count} other person here", "{count} other people here"),
					children: i.others.slice(0, 4).map((e) => /* @__PURE__ */ M("span", {
						className: O("rounded-full ring-2", e.editing ? "ring-ink" : "ring-bg"),
						children: /* @__PURE__ */ M(_, {
							name: e.name,
							initials: e.initials,
							src: e.avatar,
							size: 22
						})
					}, e.id))
				})
			}),
			p.length > 0 && !(i.holding === !1 && i.others.some((e) => e.holder)) && /* @__PURE__ */ M("span", {
				className: "text-xs text-muted max-sm:hidden",
				children: p.length === 1 ? o("{name} is editing", { name: p[0].name }) : o("{count} editing", { count: p.length })
			})
		]
	});
}
function J({ entry: e, can: t, hold: n, reload: r }) {
	let i = e?.id, s = g(W, () => i ? H.get(i) : void 0), [c, l] = h(!1), u = s && !s.holding ? s.others.find((e) => e.holder) : void 0, d = !!u && t.edit;
	if (f(() => (n(d), () => n(!1)), [d, n]), !d || !i || !s || !u) return null;
	let p = async () => {
		l(!0);
		try {
			await a("collaboration/take-over", { entryId: i }), s.updatedAt && e.updatedAt && Date.parse(s.updatedAt) > Date.parse(e.updatedAt) && await r(), K.get(i)?.();
		} catch (e) {
			A.error(e);
		} finally {
			l(!1);
		}
	};
	return /* @__PURE__ */ M(w, {
		className: "m-3",
		icon: "lock",
		action: /* @__PURE__ */ M(v, {
			size: "sm",
			loading: c,
			onClick: () => void p(),
			children: o("Take Over")
		}),
		children: s.was ? o("{name} took over editing.", { name: u.name }) : o("{name} is editing.", { name: u.name })
	});
}
i.fields.set("collaboration-composer", z), i.panels.set("collaboration-presence", {
	slot: "entry.toolbar",
	component: q,
	order: 1
}), i.panels.set("collaboration-hold", {
	slot: "entry.notice",
	component: J,
	order: 1
}), i.panels.set("collaboration-comments", {
	slot: "entry.sidebar",
	label: o("Comments"),
	icon: "comment",
	component: P,
	order: 30,
	when: (e) => !!e.entry
}), i.widgets.set("comments-inbox", d(() => import("./chunks/WidgetComments-Bfyaxo2i.js")));
