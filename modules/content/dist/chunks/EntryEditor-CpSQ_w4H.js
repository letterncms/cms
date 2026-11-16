import NewEntry from "./NewEntry-CAZNzey-.js";
import { CmsError, blockNavigation, can, events, invalidate, locale, navigate, panelsFor, plural, registry, run, t, timeAgo, useAbility, useConfig, useLocation, useManifest, useScreenContext } from "@letterncms/sdk";
import { Fragment, Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Button, Dialog, EmptyState, Fields, Icon, IconButton, InspectorPanel, Menu, NotFoundState, Notice, Page, PanelHeader, PersonPicker, QueryError, ScreenSidebar, SharedMark, Spinner, StatusDot, Tabs, Tooltip, Topbar, cn, confirm, copyText, entryActionAvailability, fieldControlId, nativeName, slugify, statusLabel, toast, useShortcut, useWideInspector, wideFieldTypes } from "@letterncms/ui";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
// admin/src/useCollection.ts
/** A collection with the fields of one of its blueprints in place of its own: what an entry made with it is edited by. */
function withBlueprint(collection, blueprint) {
	const named = blueprint ? collection.resolvedBlueprints?.find((b) => b.handle === blueprint) : void 0;
	return named ? {
		...collection,
		resolvedFields: named.resolvedFields,
		blueprint: named.handle
	} : collection;
}
function useCollection(handle) {
	const summary = useManifest().collections.find((c) => c.handle === handle);
	const query = useAbility("collections/get", { handle }, { staleTime: 6e4 });
	return {
		summary,
		collection: query.data,
		isLoading: query.isLoading,
		error: query.error
	};
}
// admin/src/entrySession.ts
var entryContent = (entry) => ({
	title: entry.title,
	slug: entry.slug,
	data: entry.data,
	authorId: entry.authorId
});
/** The server names a field's error by its path in the input (data.summary); the form knows the field by its handle. */
var fieldErrors = (details) => Object.fromEntries(Object.entries(details).map(([path, message]) => [path.replace(/^data\./, ""), message]));
var sameContent = (a, b) => a.title === b.title && a.slug === b.slug && a.authorId === b.authorId && JSON.stringify(a.data) === JSON.stringify(b.data);
/** One working-copy owner. Requests serialize and acknowledge only the edits they captured. */
var EntrySession = class {
	state;
	listeners = /* @__PURE__ */ new Set();
	queue = Promise.resolve();
	edit = 0;
	disposed = false;
	persist;
	constructor(entry, working, persist) {
		this.persist = persist;
		this.state = {
			entry,
			working,
			dirty: false,
			phase: "idle",
			error: null,
			errors: {},
			conflict: null
		};
	}
	get = () => this.state;
	subscribe = (listener) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};
	emit(patch) {
		this.state = {
			...this.state,
			...patch
		};
		if (!this.disposed) this.listeners.forEach((listener) => listener());
	}
	update(patch) {
		this.edit++;
		const working = {
			...this.state.working,
			...patch
		};
		const dirty = !this.state.entry || !sameContent(working, entryContent(this.state.entry));
		this.emit({
			working,
			dirty,
			phase: this.state.phase === "saving" ? "saving" : this.state.error ? "error" : "idle"
		});
	}
	enqueue(work) {
		const task = this.queue.then(work);
		this.queue = task.catch(() => {});
		return task;
	}
	fail(error) {
		const failure = error instanceof Error ? error : new Error(String(error));
		this.emit({
			phase: "error",
			error: failure,
			errors: failure.type === "invalid_input" ? fieldErrors(failure.details ?? {}) : {},
			conflict: failure.type === "conflict" ? {
				message: failure.message,
				version: failure.details?.version
			} : null
		});
	}
	save(options = {}) {
		return this.enqueue(async () => {
			if (this.state.conflict && !options.expectedVersion) throw this.state.error;
			if (!this.state.dirty && !options.publish) return this.state.entry;
			const { entry, working } = this.state;
			if (!working.title.trim()) {
				this.emit({ errors: { title: "A title is required." } });
				return null;
			}
			const captured = this.edit;
			this.emit({
				phase: "saving",
				error: null
			});
			try {
				const result = await this.persist(entry, working, options);
				this.emit({
					entry: result,
					working: captured === this.edit ? entryContent(result) : this.state.working,
					dirty: captured !== this.edit,
					phase: "saved",
					error: null,
					errors: {},
					conflict: null
				});
				return result;
			} catch (error) {
				this.fail(error);
				throw error;
			}
		});
	}
	/** Explicit lifecycle replacement, used after the user resolves unsaved changes. */
	command(operation) {
		return this.enqueue(async () => {
			if (!this.state.entry) return null;
			const captured = this.edit;
			this.emit({
				phase: "saving",
				error: null
			});
			try {
				const result = await operation(this.state.entry);
				this.emit({
					entry: result,
					working: captured === this.edit ? entryContent(result) : this.state.working,
					dirty: captured !== this.edit,
					phase: "saved",
					error: null,
					errors: {},
					conflict: null
				});
				return result;
			} catch (error) {
				this.fail(error);
				throw error;
			}
		});
	}
	/** Call after a confirmed reload, or when leaving after a successful deletion. */
	reset(entry = this.state.entry) {
		this.edit++;
		this.emit({
			entry,
			...entry ? { working: entryContent(entry) } : {},
			dirty: false,
			phase: "idle",
			error: null,
			errors: {},
			conflict: null
		});
	}
	dispose() {
		this.disposed = true;
		this.listeners.clear();
	}
};
// admin/src/useEntrySession.ts
/** `held`: someone else holds the entry; nothing is changed or saved from here until they let go or it is taken over. */
function useEntrySession(initial, defaults, collection, locale, autosave, capabilities, held = false, blueprint = null) {
	const mounted = useRef(true);
	const creationPath = useRef(window.location.pathname);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const [session] = useState(() => new EntrySession(initial, defaults, async (entry, values, options) => {
		const ends = options.publish && options.expiresAt !== void 0 ? { expiresAt: options.expiresAt } : {};
		const result = entry && !capabilities.edit && options.publish ? await run("entries/publish", {
			id: entry.id,
			...options.at ? { at: options.at } : {},
			...ends,
			expectedVersion: options.expectedVersion ?? entry.version
		}) : entry ? await run("entries/update", {
			id: entry.id,
			...values,
			publish: !!options.publish,
			...options.at ? { at: options.at } : {},
			...ends,
			expectedVersion: options.expectedVersion ?? entry.version
		}) : await run("entries/create", {
			collection,
			locale,
			...blueprint ? { blueprint } : {},
			...values,
			slug: values.slug || void 0,
			status: options.publish ? "published" : "draft",
			...options.at ? { at: options.at } : {},
			...ends.expiresAt ? ends : {}
		});
		if (!entry && mounted.current && window.location.pathname === creationPath.current) window.history.replaceState(window.history.state, "", `${window.__CMS__.base}/content/${collection}/${result.id}${locale ? `?locale=${encodeURIComponent(locale)}` : ""}`);
		invalidate("entries/", "revisions/", "content/", "collections/overview");
		return result;
	}));
	const state = useSyncExternalStore(session.subscribe, session.get);
	const editable = !held && (state.entry ? capabilities.edit : capabilities.create);
	const timer = useRef(void 0);
	const cancel = () => clearTimeout(timer.current);
	useEffect(() => {
		cancel();
		if (editable && autosave > 0 && state.dirty && state.phase !== "saving" && !state.error && !state.conflict && state.working.title.trim()) timer.current = setTimeout(() => void session.save().catch(() => {}), autosave);
		return cancel;
	}, [
		session,
		state,
		autosave,
		editable
	]);
	useEffect(() => blockNavigation(() => session.get().dirty || session.get().phase === "saving" ? t("Discard unsaved changes?") : null), [session]);
	useEffect(() => {
		const unload = (event) => {
			if (session.get().dirty || session.get().phase === "saving") event.preventDefault();
		};
		window.addEventListener("beforeunload", unload);
		return () => window.removeEventListener("beforeunload", unload);
	}, [session]);
	const save = (options = {}) => {
		cancel();
		return !held && (editable || options.publish) ? session.save(options) : Promise.resolve(state.entry);
	};
	return {
		...state,
		session,
		editable,
		save,
		update: (patch) => {
			if (editable) session.update(patch);
		},
		cancel
	};
}
// admin/src/entryFields.ts
/** Every field has one owner. Inactive panels cannot hide fields. */
function resolveEntryFields(fields, body, panels) {
	const claimed = /* @__PURE__ */ new Map();
	let error = null;
	for (const panel of panels) for (const handle of panel.fieldHandles ?? []) {
		if (claimed.has(handle)) error = `Field “${handle}” is claimed by both “${claimed.get(handle)}” and “${panel.id}”.`;
		claimed.set(handle, panel.id);
	}
	const own = fields.filter((field) => field.handle !== body && !claimed.has(field.handle));
	return {
		error,
		document: own.filter((field) => (field.section ?? "main") === "main"),
		sidebar: own.filter((field) => (field.section ?? "main") !== "main"),
		claimed
	};
}
// admin/src/EntryDetails.tsx
function previewUri(collection, entry, slug) {
	if (entry?.uri) return entry.uri === "/" ? "/" : entry.uri.replace(/[^/]+$/, slug || entry.slug);
	return (collection.route ?? "/{slug}").replace("{parent_uri}/", "").replace("{slug}", slug || "…").replace(/\{[a-z_]+\}/g, "…").replace(/\/+/g, "/");
}
/**
* The entry's panel, laid out like every inspector: rows with an 88px label column and
* 28px controls, groups under a small title, hairlines between them.
*/
function EntryDetails({ props, working, fields, titleInDetails, update }) {
	const { entry, collection, editable, errors } = props;
	const manifest = useManifest();
	const summary = manifest.collections.find((c) => c.handle === collection.handle);
	const system = collection.system === true;
	const builder = can("collections.manage");
	const parent = useAbility("entries/get-many", { ids: entry?.parentId ? [entry.parentId] : [] }, { enabled: builder && !!entry?.parentId });
	const builtin = !!summary?.within;
	const builtinGroups = useAbility("pages/builtin", {}, { enabled: builtin });
	const builtinPage = builtinGroups.data?.find((group) => group.collection === collection.handle)?.pages.find((page) => page.handle === (entry?.slug ?? working.slug));
	const date = (value) => new Intl.DateTimeFormat(locale(), {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: manifest.site.timezone
	}).format(new Date(value));
	const sectionOf = (field) => field.section === "sidebar" ? "main" : field.section ?? "main";
	const main = fields.filter((field) => sectionOf(field) === "main");
	const groups = [...new Set(fields.map(sectionOf))].filter((group) => group !== "main").map((group) => {
		const inside = fields.filter((field) => sectionOf(field) === group);
		const name = group.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
		return {
			group,
			inside,
			heading: inside.length === 1 && inside[0].label?.toLowerCase() === name.toLowerCase() ? null : name
		};
	});
	const status = entry?.displayStatus ?? "draft";
	const context = {
		entry: entry ?? void 0,
		collection: collection.handle,
		locale: entry?.locale ?? manifest.site.defaultLocale
	};
	const info = [
		...!system || collection.route || summary?.within ? [[t("Status"), /* @__PURE__ */ jsx(StatusDot, {
			status,
			label: statusLabel(status),
			className: "text-text"
		}, "status")]] : [],
		...entry?.publishedAt && status !== "draft" ? [[status === "scheduled" ? t("Goes Live") : t("Published"), /* @__PURE__ */ jsx("time", {
			dateTime: entry.publishedAt,
			title: manifest.site.timezone,
			children: date(entry.publishedAt)
		}, "published")]] : [],
		...entry?.expiresAt && status !== "draft" ? [[status === "expired" ? t("Ended") : t("Ends"), /* @__PURE__ */ jsx("time", {
			dateTime: entry.expiresAt,
			title: manifest.site.timezone,
			children: date(entry.expiresAt)
		}, "ends")]] : [],
		...builder ? [
			...entry && collection.structure === "tree" ? [[t("Parent"), entry.parentId ? parent.data?.[0]?.title ?? (parent.isLoading ? t("Loading…") : "") : t("None")]] : [],
			...summary?.within ? [] : [[t("Collection"), collection.title]],
			...manifest.site.locales.length > 1 ? [[t("Language"), nativeName(entry?.locale ?? manifest.site.defaultLocale)]] : [],
			...entry?.createdAt ? [[t("Created"), date(entry.createdAt)]] : [],
			...entry?.updatedAt ? [[t("Updated"), date(entry.updatedAt)]] : []
		] : []
	];
	const row = (field) => /* @__PURE__ */ jsx(PanelRow, {
		field,
		error: errors[field.handle],
		children: /* @__PURE__ */ jsx(Fields, {
			bare: true,
			fields: [{
				...field,
				width: "full",
				size: field.size ?? "sm",
				rows: field.type === "textarea" ? field.rows ?? 3 : field.rows
			}],
			values: working.data,
			onChange: props.setValue,
			errors,
			disabled: !editable,
			context
		})
	}, field.handle);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs(PanelGroup, { children: [
			titleInDetails && /* @__PURE__ */ jsx(PanelRow, {
				field: {
					handle: "title",
					type: "text",
					label: t("Title")
				},
				error: errors.title,
				children: /* @__PURE__ */ jsx(Fields, {
					bare: true,
					fields: [{
						handle: "title",
						type: "text",
						label: t("Title"),
						size: "sm"
					}],
					values: { title: working.title },
					onChange: (_, value) => update({ title: value ?? "" }),
					errors,
					disabled: !editable
				})
			}),
			builtin ? /* @__PURE__ */ jsxs("div", {
				className: "flex min-h-7 items-start gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "flex h-7 w-[88px] shrink-0 items-center text-xs text-muted",
					children: t("URL")
				}), /* @__PURE__ */ jsx("span", {
					className: "flex h-7 min-w-0 flex-1 items-center",
					children: builtinPage?.path ? /* @__PURE__ */ jsx("span", {
						className: "truncate px-1 font-mono text-xs text-faint",
						title: builtinPage.path,
						children: builtinPage.path
					}) : /* @__PURE__ */ jsx("span", {
						className: "truncate px-1 text-xs text-faint",
						children: builtinGroups.isLoading ? "…" : t("Shown inside other pages")
					})
				})]
			}) : /* @__PURE__ */ jsx(PanelRow, {
				field: {
					handle: "slug",
					type: "text",
					label: collection.route ? t("URL") : t("Handle")
				},
				error: errors.slug,
				children: /* @__PURE__ */ jsx(Fields, {
					bare: true,
					fields: [collection.route ? {
						handle: "slug",
						type: "slug",
						label: t("URL"),
						component: "uri",
						uri: previewUri(collection, entry, working.slug),
						size: "sm"
					} : {
						handle: "slug",
						type: "text",
						label: t("Handle"),
						mono: true,
						max: 180,
						size: "sm"
					}],
					values: {
						title: working.title,
						slug: working.slug || slugify(working.title)
					},
					onChange: (handle, value) => update({ [handle]: value ?? "" }),
					errors,
					disabled: !editable
				})
			}),
			!system && /* @__PURE__ */ jsx(PanelRow, {
				field: {
					handle: "authorId",
					type: "person",
					label: t("Author")
				},
				error: errors.authorId,
				children: /* @__PURE__ */ jsx(PersonPicker, {
					id: "f-authorId",
					size: "sm",
					"aria-describedby": errors.authorId ? "f-authorId-error" : void 0,
					value: working.authorId ? [working.authorId] : [],
					max: 1,
					disabled: !editable,
					label: t("Assign Author"),
					onChange: (ids) => update({ authorId: ids[0] ?? null })
				})
			}),
			main.map(row)
		] }),
		groups.map(({ group, inside, heading }) => /* @__PURE__ */ jsx(PanelGroup, {
			title: heading,
			children: inside.map(row)
		}, group)),
		info.length > 0 && /* @__PURE__ */ jsxs(PanelGroup, {
			title: t("Info"),
			children: [/* @__PURE__ */ jsx("dl", {
				className: "m-0 space-y-1",
				children: info.map(([label, value]) => /* @__PURE__ */ jsxs("div", {
					className: "flex min-h-7 items-start gap-2",
					children: [/* @__PURE__ */ jsx("dt", {
						className: "flex h-7 w-[88px] shrink-0 items-center truncate text-xs text-muted",
						children: label
					}), /* @__PURE__ */ jsx("dd", {
						className: "m-0 min-w-0 flex-1 break-words py-1 text-sm text-text",
						children: value
					})]
				}, label))
			}), entry?.parentId && parent.isError && /* @__PURE__ */ jsx(QueryError, {
				message: parent.error.message,
				onRetry: () => void parent.refetch(),
				compact: true
			})]
		})
	] });
}
/** A group of rows under a small title (or none, for the first), hairlines between groups. */
function PanelGroup({ title, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: cn("border-b border-border px-4 pb-3 last:border-b-0", !title && "pt-3"),
		children: [title && /* @__PURE__ */ jsx("h3", {
			className: "m-0 flex h-10 items-center text-xs font-semibold text-ink",
			children: title
		}), /* @__PURE__ */ jsx("div", {
			className: "space-y-1",
			children
		})]
	});
}
/**
* One field: its label in the panel's label column and the control beside it, or above
* it for a field that needs the width. Help text sits under the control.
*/
function PanelRow({ field, error, children }) {
	const toggle = field.type === "toggle";
	const wide = wideFieldTypes.includes(field.type);
	const help = !error && field.instructions ? /* @__PURE__ */ jsx("p", {
		className: "m-0 mt-1 text-xs text-muted",
		children: field.instructions
	}) : null;
	const label = /* @__PURE__ */ jsxs("label", {
		htmlFor: fieldControlId(field),
		className: cn("flex h-7 min-w-0 shrink-0 items-center text-xs text-muted", !wide && "w-[88px]"),
		children: [/* @__PURE__ */ jsx("span", {
			className: "truncate",
			children: field.label
		}), typeof field.shared === "string" && /* @__PURE__ */ jsx(SharedMark, {
			from: field.shared,
			className: "ml-1.5"
		})]
	});
	if (toggle) return /* @__PURE__ */ jsxs("div", {
		className: "py-1",
		children: [children, help]
	});
	if (wide) return /* @__PURE__ */ jsxs("div", {
		className: "pb-1",
		children: [
			label,
			children,
			help
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-7 items-start gap-2",
		children: [label, /* @__PURE__ */ jsxs("div", {
			className: "min-w-0 flex-1",
			children: [children, help]
		})]
	});
}
function PublicationDialog({ entry, changes, busy, onClose, onPublish }) {
	const manifest = useManifest();
	const [at, setAt] = useState(entry?.publishedAt ?? null);
	const kept = entry?.expiresAt && new Date(entry.expiresAt).getTime() > Date.now() ? entry.expiresAt : null;
	const [ends, setEnds] = useState(kept);
	const [error, setError] = useState();
	const [endsError, setEndsError] = useState();
	const scheduled = entry?.displayStatus === "scheduled";
	const live = entry?.status === "published" && !scheduled && entry?.displayStatus !== "expired";
	const time = at ? new Date(at).getTime() : NaN;
	const future = time > Date.now();
	const moved = !!at && time !== new Date(entry?.publishedAt ?? 0).getTime() || ends !== kept;
	const label = future || !at && !live ? scheduled ? t("Change Schedule") : t("Schedule") : live ? changes ? t("Publish Changes") : t("Change Date") : t("Publish");
	const idle = !at || live && !changes && !moved || scheduled && future && !moved;
	const submit = async () => {
		if (!Number.isFinite(time)) {
			setError(t("Choose a publication date and time."));
			return;
		}
		if (live && future) {
			setError(t("Unpublish this entry before scheduling it for a future date."));
			return;
		}
		if (ends && !(new Date(ends).getTime() > Math.max(Date.now(), time))) {
			setEndsError(t("Choose an end after the publication date, and not in the past."));
			return;
		}
		if (await onPublish(at, ends === kept ? void 0 : ends)) onClose();
	};
	return /* @__PURE__ */ jsxs(Dialog, {
		open: true,
		onOpenChange: (open) => !open && !busy && onClose(),
		title: scheduled ? t("Change Schedule") : live ? t("Publication Date") : t("Schedule"),
		footer: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Button, {
			disabled: busy,
			onClick: onClose,
			children: t("Cancel")
		}), /* @__PURE__ */ jsx(Button, {
			variant: "publish",
			loading: busy,
			disabled: idle,
			onClick: submit,
			children: label
		})] }),
		children: [/* @__PURE__ */ jsx(Fields, {
			fields: [{
				handle: "at",
				type: "date",
				time: true,
				timezone: manifest.site.timezone,
				label: t("Starts"),
				required: true
			}, {
				handle: "ends",
				type: "date",
				time: true,
				timezone: manifest.site.timezone,
				label: t("Ends")
			}],
			values: {
				at,
				ends
			},
			onChange: (handle, value) => {
				if (handle === "ends") {
					setEnds(value || null);
					setEndsError(void 0);
				} else {
					setAt(value);
					setError(void 0);
				}
			},
			errors: {
				...error ? { at: error } : {},
				...endsError ? { ends: endsError } : {}
			},
			disabled: busy
		}), ends && /* @__PURE__ */ jsx(Button, {
			variant: "ghost",
			size: "sm",
			icon: "close",
			className: "-ml-2 mt-1",
			disabled: busy,
			onClick: () => {
				setEnds(null);
				setEndsError(void 0);
			},
			children: t("Remove End Date")
		})]
	});
}
// admin/src/EntryHistory.tsx
var when = (iso) => new Date(iso).toLocaleString(locale(), {
	dateStyle: "medium",
	timeStyle: "short"
});
var plain = (text) => text.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
var differ = (a, b) => JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);
var isObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);
var isBlock = (value) => isObject(value) && typeof value.id === "string" && typeof value.type === "string";
var isBlocks = (value) => Array.isArray(value) && value.some(isBlock);
/** A key as a label ("og_image" → "Og image"), for values inside a field that have no label of their own. */
var named = (key) => {
	const words = key.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
	return words.charAt(0).toUpperCase() + words.slice(1);
};
/** A value in words: text without its markup, a list by what its items are called, never a bare count. */
function said(value) {
	if (value === null || value === void 0 || value === "") return "";
	if (typeof value === "string") return plain(value);
	if (typeof value === "boolean") return value ? t("Yes") : "";
	if (Array.isArray(value)) return value.map(said).filter(Boolean).join(", ");
	if (isObject(value)) {
		const name = [
			value.title,
			value.name,
			value.label,
			value.filename,
			value.text,
			value.url,
			value.id
		].find((part) => typeof part === "string" && part !== "");
		return typeof name === "string" ? plain(name) : Object.entries(value).map(([key, part]) => `${named(key)}: ${said(part)}`).filter((line) => !line.endsWith(": ")).join(", ");
	}
	return String(value);
}
/** Every block of a document by its id, with its own words (not its children's). */
function blocks(nodes, into = /* @__PURE__ */ new Map()) {
	for (const node of nodes) {
		if (!isBlock(node)) continue;
		const props = node.props ?? {};
		const words = [
			props.text,
			props.label,
			props.title,
			props.question,
			props.alt,
			...Array.isArray(props.items) ? props.items : []
		].map((part) => typeof part === "string" ? plain(part) : said(part)).filter(Boolean).join(" · ");
		const { children, ...own } = node;
		into.set(node.id, {
			words,
			raw: JSON.stringify(own)
		});
		if (Array.isArray(children)) blocks(children, into);
	}
	return into;
}
/** A block document, block by block: only the blocks whose words differ, then one line when only looks or settings do. */
function blockChanges(label, now, then) {
	const a = blocks(Array.isArray(now) ? now : []), b = blocks(Array.isArray(then) ? then : []);
	const out = [];
	let quiet = false;
	for (const id of /* @__PURE__ */ new Set([...a.keys(), ...b.keys()])) {
		const was = a.get(id), will = b.get(id);
		if (was?.raw === will?.raw) continue;
		if ((was?.words ?? "") === (will?.words ?? "")) {
			quiet = true;
			continue;
		}
		out.push({
			label: out.length ? "" : label,
			now: was?.words ?? "",
			then: will?.words ?? ""
		});
	}
	if (quiet || !out.length && differ(now, then)) out.push({
		label: out.length ? "" : label,
		now: "",
		then: t("Layout or design changed")
	});
	return out;
}
/** One field: a block document block by block, a group key by key under the field's name, anything else by value. */
function fieldChanges(label, now, then) {
	if (!differ(now, then)) return [];
	if (isBlocks(now) || isBlocks(then)) return blockChanges(label, now, then);
	if ((isObject(now) || now == null) && (isObject(then) || then == null) && (isObject(now) || isObject(then))) {
		const a = isObject(now) ? now : {}, b = isObject(then) ? then : {};
		return [.../* @__PURE__ */ new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((key) => fieldChanges(`${label} › ${named(key)}`, a[key], b[key]));
	}
	const was = said(now), will = said(then);
	if (!was && !will) return [];
	return [{
		label,
		now: was,
		then: was === will ? t("Changed") : will
	}];
}
/**
* What restoring a version changes: exactly what `revisions/restore` writes. The snapshot's title, URL, data and
* author replace the working ones, and its unpublished changes are laid over that, each key whole.
*/
function changes(now, snapshot, fields, author) {
	const restored = {
		title: snapshot.title,
		slug: snapshot.slug,
		data: snapshot.data,
		authorId: snapshot.authorId,
		...snapshot.draft
	};
	const data = restored.data ?? {};
	return [
		...fieldChanges(t("Title"), now.title, restored.title),
		...fieldChanges(t("URL"), now.slug, restored.slug),
		...differ(now.authorId, restored.authorId) ? [{
			label: t("Author"),
			now: author,
			then: restored.authorId ? t("Someone else") : ""
		}] : [],
		...[.../* @__PURE__ */ new Set([...Object.keys(now.data), ...Object.keys(data)])].flatMap((handle) => fieldChanges(fields.find((field) => field.handle === handle)?.label ?? named(handle), now.data[handle], data[handle]))
	];
}
function EntryHistory({ entry, working, fields, editable, onRestore }) {
	const revisions = useAbility("revisions/list", { entryId: entry?.id ?? "" }, { enabled: !!entry });
	const [viewing, setViewing] = useState(null);
	if (!entry) return /* @__PURE__ */ jsx(EmptyState, {
		compact: true,
		icon: "history",
		title: t("No history yet")
	});
	if (revisions.isLoading) return /* @__PURE__ */ jsx("div", {
		className: "grid place-items-center p-6 text-faint",
		children: /* @__PURE__ */ jsx(Spinner, {})
	});
	if (revisions.isError && !revisions.data) return /* @__PURE__ */ jsx(QueryError, {
		message: revisions.error.message,
		onRetry: () => void revisions.refetch()
	});
	const labels = {
		create: t("Created"),
		save: t("Edited"),
		publish: t("Published"),
		unpublish: t("Unpublished"),
		restore: t("Restored"),
		discard: t("Discarded Changes"),
		move: t("Moved")
	};
	const label = (revision) => labels[revision.action] ?? revision.action;
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		revisions.isError && /* @__PURE__ */ jsx(QueryError, {
			message: revisions.error.message,
			onRetry: () => void revisions.refetch(),
			compact: true
		}),
		revisions.data?.length === 0 && /* @__PURE__ */ jsx(EmptyState, {
			compact: true,
			icon: "history",
			title: t("No history yet")
		}),
		/* @__PURE__ */ jsx("ol", {
			className: "m-0 list-none px-2 py-2",
			children: (revisions.data ?? []).map((revision, index, all) => {
				const line = /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
					className: "relative grid h-5 w-2 shrink-0 place-items-center",
					"aria-hidden": true,
					children: /* @__PURE__ */ jsx("span", { className: cn("size-2 rounded-full", revision.action === "publish" ? "bg-success" : "bg-surface ring-1 ring-inset ring-border-strong") })
				}), /* @__PURE__ */ jsxs("span", {
					className: "block min-w-0 flex-1",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "block truncate text-sm text-text",
						children: [label(revision), revision.title && revision.title !== entry.title && /* @__PURE__ */ jsxs("span", {
							className: "text-muted",
							children: [" · ", revision.title]
						})]
					}), /* @__PURE__ */ jsxs("span", {
						className: "block truncate text-xs text-faint",
						children: [
							revision.user?.name ?? t("System"),
							" · ",
							/* @__PURE__ */ jsx("time", {
								dateTime: revision.createdAt,
								title: when(revision.createdAt),
								children: timeAgo(revision.createdAt)
							})
						]
					})]
				})] });
				return /* @__PURE__ */ jsxs("li", {
					className: "relative",
					children: [index < all.length - 1 && /* @__PURE__ */ jsx("span", {
						className: "absolute bottom-[-10px] left-[11.5px] top-[22px] w-px bg-border",
						"aria-hidden": true
					}), index > 0 ? /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						onClick: () => setViewing(revision),
						className: "!h-auto min-h-12 w-full !items-start !justify-start !gap-2.5 !whitespace-normal !rounded-md !px-2 !py-2 text-left !font-normal",
						children: line
					}) : /* @__PURE__ */ jsx("div", {
						className: "flex min-h-12 items-start gap-2.5 px-2 py-2",
						children: line
					})]
				}, revision.id);
			})
		}),
		/* @__PURE__ */ jsx(Version, {
			revision: viewing,
			title: viewing ? `${label(viewing)} · ${when(viewing.createdAt)}` : "",
			working,
			fields,
			author: entry.author?.name ?? "",
			editable,
			onClose: () => setViewing(null),
			onRestore: (id) => {
				setViewing(null);
				onRestore(id);
			}
		})
	] });
}
var grid = "grid grid-cols-[minmax(96px,0.6fr)_1fr_1fr] gap-x-4 px-3 py-2";
/** One older version: what restoring it changes against what is in the editor now, and the way to restore it. */
function Version({ revision, title, working, fields, author, editable, onClose, onRestore }) {
	const loaded = useAbility("revisions/get", { id: revision?.id ?? "" }, { enabled: !!revision });
	const diff = revision && loaded.data ? changes(working, loaded.data.snapshot, fields, author) : null;
	return /* @__PURE__ */ jsx(Dialog, {
		open: !!revision,
		onOpenChange: (open) => {
			if (!open) onClose();
		},
		title,
		size: "lg",
		className: "max-sm:max-h-[72dvh] max-sm:before:mx-auto max-sm:before:mt-2 max-sm:before:h-1 max-sm:before:w-9 max-sm:before:shrink-0 max-sm:before:rounded-full max-sm:before:bg-border-strong max-sm:before:content-['']",
		...editable ? {
			onSubmit: () => revision && onRestore(revision.id),
			submitLabel: t("Restore Version"),
			submitDisabled: !diff?.length
		} : {},
		children: loaded.isError ? /* @__PURE__ */ jsx(QueryError, {
			compact: true,
			message: t("Couldn’t load this version"),
			onRetry: () => void loaded.refetch(),
			retrying: loaded.isRefetching
		}) : !diff ? /* @__PURE__ */ jsx("div", {
			className: "grid place-items-center py-10 text-faint",
			children: /* @__PURE__ */ jsx(Spinner, {})
		}) : diff.length === 0 ? /* @__PURE__ */ jsx("p", {
			role: "status",
			className: "m-0 py-6 text-center text-sm text-muted",
			children: t("Same as now")
		}) : /* @__PURE__ */ jsxs("div", {
			role: "table",
			className: "overflow-hidden rounded-lg border border-border",
			children: [/* @__PURE__ */ jsxs("div", {
				role: "row",
				className: cn(grid, "sticky top-0 border-b border-border bg-sunken text-xs font-medium text-muted"),
				children: [
					/* @__PURE__ */ jsx("span", { role: "columnheader" }),
					/* @__PURE__ */ jsx("span", {
						role: "columnheader",
						children: t("Current")
					}),
					/* @__PURE__ */ jsx("span", {
						role: "columnheader",
						children: t("This Version")
					})
				]
			}), diff.map((change, index) => /* @__PURE__ */ jsxs("div", {
				role: "row",
				className: cn(grid, "text-sm", index > 0 && (change.label ? "border-t border-border" : "border-t border-border/50")),
				children: [/* @__PURE__ */ jsx("span", {
					role: "rowheader",
					className: "min-w-0 break-words text-muted",
					children: change.label
				}), change.now && change.then ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
					role: "cell",
					className: "min-w-0 break-words text-text",
					children: marked(change.now, change.then, "del")
				}), /* @__PURE__ */ jsx("span", {
					role: "cell",
					className: "min-w-0 break-words text-text",
					children: marked(change.now, change.then, "add")
				})] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
					role: "cell",
					className: cn("min-w-0 break-words", change.now ? "text-danger line-through decoration-danger/40" : "text-faint"),
					children: change.now || "—"
				}), /* @__PURE__ */ jsx("span", {
					role: "cell",
					className: cn("min-w-0 break-words", change.then ? "text-success" : "text-faint"),
					children: change.then || "—"
				})] })]
			}, index))]
		})
	});
}
/**
* One side of two texts, word by word: the words both share plain, the ones only this side has marked (struck in
* red where restoring takes them away, green where it brings them). Past a few hundred words it marks the whole.
*/
function marked(now, then, side) {
	const a = now.split(/(\s+)/);
	const b = then.split(/(\s+)/);
	const own = side === "del" ? a : b;
	const style = side === "del" ? "text-danger line-through decoration-danger/40" : "text-success";
	if (a.length * b.length > 25e4) return /* @__PURE__ */ jsx("span", {
		className: style,
		children: own.join("")
	});
	const m = a.length, n = b.length;
	const table = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
	for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
	const kept = /* @__PURE__ */ new Set();
	for (let i = 0, j = 0; i < m && j < n;) if (a[i] === b[j]) {
		kept.add(side === "del" ? i : j);
		i++;
		j++;
	} else if (table[i + 1][j] >= table[i][j + 1]) i++;
	else j++;
	return /* @__PURE__ */ jsx(Fragment$1, { children: own.map((word, k) => kept.has(k) || !word.trim() ? /* @__PURE__ */ jsx(Fragment, { children: word }, k) : /* @__PURE__ */ jsx("span", {
		className: style,
		children: word
	}, k)) });
}
// admin/src/EntryMoveDialog.tsx
/** Flatten eligible parents, skipping the moving entry's entire subtree. */
function parentOptions(items, movingId, ancestors = []) {
	return items.flatMap((item) => {
		if (item.id === movingId) return [];
		const path = [...ancestors, item.title || t("Untitled")];
		return [{
			value: item.id,
			label: path.join(" / ")
		}, ...parentOptions(item.children ?? [], movingId, path)];
	});
}
/** The host serializes persistence and the move; this dialog only chooses a parent. */
function EntryMoveDialog({ entry, collection, busy, onClose, onMove }) {
	const tree = useAbility("entries/tree", {
		collection: collection.handle,
		locale: entry.locale
	}, { refetchOnWindowFocus: false });
	const [parentId, setParentId] = useState(entry.parentId);
	const [error, setError] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	const operation = useRef(false);
	const options = [{
		value: "",
		label: t("Root")
	}, ...parentOptions(tree.data ?? [], entry.id)];
	const available = parentId === null || options.some((option) => option.value === parentId);
	const ready = !!tree.data && !tree.isError;
	const pending = busy || submitting;
	const parentError = error ?? (ready && !available ? t("This parent is no longer available. Choose another parent.") : void 0);
	const submit = async () => {
		if (operation.current || pending || !ready || !available || parentId === entry.parentId) return;
		operation.current = true;
		setSubmitting(true);
		setError(null);
		try {
			if (await onMove(parentId)) onClose();
			else setError(t("Could not move this entry. Try again."));
		} catch (failure) {
			setError(failure instanceof Error ? failure.message : t("Could not move this entry. Try again."));
		} finally {
			setSubmitting(false);
			operation.current = false;
		}
	};
	return /* @__PURE__ */ jsxs(Dialog, {
		open: true,
		title: t("Move “{title}”", { title: entry.title }),
		onOpenChange: (open) => {
			if (!open && !pending) onClose();
		},
		footer: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Button, {
			disabled: pending,
			onClick: onClose,
			children: t("Cancel")
		}), /* @__PURE__ */ jsx(Button, {
			variant: "primary",
			loading: pending,
			disabled: !ready || !available || parentId === entry.parentId,
			onClick: submit,
			children: t("Move")
		})] }),
		children: [tree.isLoading || !tree.data && tree.isFetching ? /* @__PURE__ */ jsxs("div", {
			role: "status",
			className: "flex items-center gap-2 py-4 text-sm text-muted",
			children: [/* @__PURE__ */ jsx(Spinner, { size: 14 }), t("Loading available parents…")]
		}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [tree.isError && /* @__PURE__ */ jsx(QueryError, {
			message: tree.error.message,
			onRetry: () => void tree.refetch()
		}), tree.data && /* @__PURE__ */ jsx(Fields, {
			fields: [{
				handle: "parentId",
				type: "select",
				label: t("Parent"),
				required: true,
				options: available ? options : [...options, {
					value: parentId,
					label: t("Unavailable parent")
				}]
			}],
			values: { parentId: parentId ?? "" },
			onChange: (_, value) => {
				setParentId(value || null);
				setError(null);
			},
			errors: parentError ? { parentId: parentError } : {},
			disabled: pending || tree.isError
		})] }), /* @__PURE__ */ jsxs("div", {
			className: "mt-4 space-y-2 text-xs text-muted",
			children: [entry.uri && /* @__PURE__ */ jsx("p", {
				className: "m-0",
				children: t("Moving a published entry can change its live URL and the URLs of its descendants.")
			}), /* @__PURE__ */ jsx("p", {
				className: "m-0",
				children: t("Saved unpublished changes stay in the working copy. Moving does not publish them.")
			})]
		})]
	});
}
// admin/src/EntryEditor.tsx
function EntryEditor({ params }) {
	const { collection: defined, summary, isLoading, error } = useCollection(params.collection);
	const isNew = params.id === "new";
	const entryQuery = useEntryQuery(params.id, isNew);
	const manifest = useManifest();
	const { query } = useLocation();
	const blueprint = isNew ? defined?.resolvedBlueprints?.some((b) => b.handle === query.blueprint) ? query.blueprint : null : entryQuery.data?.blueprint ?? null;
	const asks = isNew && !!defined?.resolvedBlueprints?.length && query.blueprint === void 0;
	const shared = entryQuery.data?.sharedFields;
	const origin = Object.entries(entryQuery.data?.translations ?? {}).find(([, id]) => id === entryQuery.data?.originId)?.[0] ?? manifest.site.defaultLocale;
	const collection = useMemo(() => {
		const own = defined && withBlueprint(defined, blueprint);
		return own && shared?.length ? {
			...own,
			resolvedFields: own.resolvedFields.map((field) => shared.includes(field.handle) ? {
				...field,
				readOnly: true,
				shared: origin
			} : field)
		} : own;
	}, [
		defined,
		blueprint,
		shared?.join(","),
		origin
	]);
	const list = listOf(manifest, params.collection, entryQuery.data?.locale ?? query.locale);
	const retryLoad = () => {
		entryQuery.refetch();
		invalidate("collections/get");
	};
	const bodyField = collection?.resolvedFields.find((field) => field.body);
	const hold = !!bodyField && panelsFor("entry.editor", { bodyField }).length > 0 && /* @__PURE__ */ jsx(ScreenSidebar, {
		title: t("Outline||structure"),
		backTo: list.path,
		backLabel: list.label,
		children: null
	});
	if (isLoading || !isNew && entryQuery.isLoading) return /* @__PURE__ */ jsxs("div", {
		className: "flex h-full flex-col",
		children: [
			hold,
			/* @__PURE__ */ jsx(Topbar, { back: {
				to: list.path,
				label: list.label
			} }),
			/* @__PURE__ */ jsx("div", {
				className: "grid flex-1 place-items-center",
				children: /* @__PURE__ */ jsx(Spinner, {})
			})
		]
	});
	const failure = error ?? entryQuery.error;
	const missing = !collection || !isNew && !entryQuery.data;
	const listed = manifest.collections.find((c) => c.handle === (list.within?.handle ?? params.collection));
	const crumbs = [...listed ? [{
		label: listed.title,
		to: list.path,
		icon: listed.icon
	}] : [], { label: t("Not Found") }];
	if (missing && failure && ![
		"not_found",
		"forbidden",
		"invalid_input"
	].includes(failure.type)) return /* @__PURE__ */ jsx(Page, {
		crumbs: listed ? crumbs.slice(0, 1) : [],
		children: /* @__PURE__ */ jsx(QueryError, {
			message: failure.message,
			onRetry: retryLoad
		})
	});
	if (!collection || !summary || !isNew && !entryQuery.data) {
		const back = listed && /* @__PURE__ */ jsx(Button, {
			onClick: () => navigate(list.path),
			children: t("Back to {label}", { label: listed.title })
		});
		return /* @__PURE__ */ jsx(Page, {
			crumbs,
			children: failure?.type === "forbidden" ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(QueryError, {
				title: t("Access denied"),
				message: failure.message
			}), back && /* @__PURE__ */ jsx("div", {
				className: "mt-4",
				children: back
			})] }) : /* @__PURE__ */ jsx(NotFoundState, {
				icon: listed?.icon ?? "file",
				action: back
			})
		});
	}
	if (asks) return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Topbar, { back: {
		to: list.path,
		label: list.label
	} }), /* @__PURE__ */ jsx(NewEntry, {
		props: {
			collection: collection.handle,
			locale: query.locale,
			title: summary.newLabel,
			kinds: [{
				handle: "",
				title: summary.singular
			}, ...collection.resolvedBlueprints.map((b) => ({
				handle: b.handle,
				title: b.title
			}))]
		},
		close: () => navigate(list.path),
		disabled: false,
		onAction: () => {},
		scope: {}
	})] });
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [hold, /* @__PURE__ */ jsx(Editor, {
		collection,
		blueprint,
		initial: isNew ? null : entryQuery.data,
		can: summary.can
	}, `${params.collection}:${params.id}:${blueprint ?? ""}`)] });
}
/** Where the way back from an entry goes: its list, or the site's pages for a built-in page (they're listed there). */
function listOf(manifest, handle, locale) {
	const summary = manifest.collections.find((c) => c.handle === handle);
	const within = manifest.collections.find((c) => c.handle === summary?.within);
	const shown = within ?? summary;
	const other = locale && locale !== manifest.site.defaultLocale && manifest.site.locales.includes(locale);
	const query = summary?.tab ? `?tab=${summary.tab}` : other ? `?locale=${locale}` : "";
	return {
		path: `/content/${shown?.handle ?? handle}${query}`,
		label: shown?.title ?? "",
		within
	};
}
function useEntryQuery(id, skip) {
	return useAbility("entries/get", { id }, {
		enabled: !skip,
		refetchOnWindowFocus: false
	});
}
function Editor({ collection, blueprint, initial, can }) {
	const manifest = useManifest();
	const { query } = useLocation();
	const autosave = useConfig("content").autosave ?? 1200;
	const contentLocale = initial?.locale ?? (manifest.site.locales.includes(query.locale ?? "") ? query.locale : manifest.site.defaultLocale);
	const list = listOf(manifest, collection.handle, contentLocale);
	const listPath = list.path;
	const singular = list.within?.singular ?? manifest.collections.find((c) => c.handle === collection.handle)?.singular ?? collection.singular;
	const shownCollection = useMemo(() => ({
		...collection,
		singular
	}), [collection, singular]);
	const [held, setHeld] = useState(false);
	const control = useEntrySession(initial, {
		title: initial?.title ?? "",
		slug: initial?.slug ?? "",
		authorId: initial ? initial.authorId : manifest.user.id,
		data: initial?.data ?? Object.fromEntries(collection.resolvedFields.map((field) => [field.handle, field.default ?? null]))
	}, collection.handle, contentLocale, autosave, can, held, blueprint);
	const editable = control.editable;
	const { entry, working, dirty, phase, errors, conflict, update, session } = control;
	const builtin = !!useManifest().collections.find((c) => c.handle === collection.handle)?.within;
	const actions = {
		...entryActionAvailability(can, entry),
		...builtin ? { duplicate: false } : {}
	};
	const wide = useWideInspector();
	const [sidebarOpen, setSidebarOpen] = useState(() => wide);
	const [toolHost, setToolHost] = useState(null);
	const [sending, setSending] = useState(false);
	const panelKey = `cms.entry.panel.${collection.handle}`;
	const [selectedPanel, setSelectedPanel] = useState(() => localStorage.getItem(panelKey) || "details");
	const [publishing, setPublishing] = useState(false);
	const [moving, setMoving] = useState(false);
	const [replacing, setReplacing] = useState(false);
	const retry = useRef(() => control.save());
	const lastSave = useRef({});
	useSyncExternalStore(registry.panels.subscribe, registry.panels.version);
	const busy = phase === "saving";
	useScreenContext({
		kind: "entry",
		icon: collection.icon,
		rightEdge: true,
		data: () => {
			const { entry: saved, working: current, dirty: unsaved } = session.get();
			return {
				collection: collection.handle,
				id: saved?.id ?? null,
				status: saved?.displayStatus ?? "draft",
				unsaved,
				title: current.title,
				slug: current.slug,
				url: saved?.uri ?? null,
				locale: contentLocale,
				fields: current.data
			};
		},
		flush: async () => {
			const current = session.get();
			if (editable && current.dirty && current.working.title.trim()) await control.save().catch(() => {});
		}
	});
	useEffect(() => events.on("content.changed", () => {
		const id = session.get().entry?.id;
		if (!id) return;
		run("entries/get", { id }).then((fresh) => {
			const current = session.get();
			if (current.dirty || current.phase === "saving" || fresh.version === current.entry?.version) return;
			session.command(async () => fresh);
		}).catch(() => {});
	}), [session]);
	const setValue = (handle, value) => {
		update({ data: {
			...session.get().working.data,
			[handle]: value
		} });
	};
	const attempt = async (operation) => {
		try {
			return await operation();
		} catch (error) {
			toast.error(error);
			return;
		}
	};
	const save = async (options = {}) => {
		lastSave.current = options;
		retry.current = () => control.save(options);
		try {
			return await control.save(options);
		} catch {
			return;
		}
	};
	const savePanel = async () => {
		lastSave.current = {};
		retry.current = () => control.save();
		await control.save();
	};
	const publish = async (at, expiresAt) => {
		if (!actions.publish) return false;
		setSending(true);
		const result = await save({
			publish: true,
			...at ? { at } : {},
			...expiresAt !== void 0 ? { expiresAt } : {}
		});
		setSending(false);
		if (!result) return false;
		toast.success(result.displayStatus === "scheduled" ? t("Scheduled") : t("Published"));
		return true;
	};
	const resolveLocal = () => !session.get().dirty || confirm({
		title: t("Discard unsaved changes?"),
		description: t("Your unsaved edits will be replaced."),
		confirm: t("Discard changes"),
		danger: true
	});
	const reload = async () => {
		if (!await resolveLocal()) return;
		control.cancel();
		setReplacing(true);
		retry.current = reload;
		await attempt(() => session.command((current) => run("entries/get", { id: current.id })));
		setReplacing(false);
	};
	const replace = async (ability, input = {}) => {
		if (!await resolveLocal()) return;
		control.cancel();
		setReplacing(true);
		retry.current = () => replace(ability, input);
		await attempt(() => session.command((current) => run(ability, {
			...ability === "revisions/restore" ? {} : { id: current.id },
			...input,
			expectedVersion: current.version
		})));
		setReplacing(false);
		invalidate("entries/", "revisions/", "content/");
	};
	const discard = async () => {
		if (!entry || !await confirm({
			title: t("Discard unpublished changes to “{title}”?", { title: entry.title }),
			description: t("Every change since it was last published is lost. The published version stays as it is."),
			confirm: t("Discard Changes"),
			danger: true
		})) return;
		await replace("entries/discard-draft");
	};
	const unpublish = async () => {
		if (!entry || !await confirm({
			title: t("Unpublish “{title}”?", { title: entry.title }),
			description: t("It leaves the site and its address stops working until it is published again. Its content is kept as a draft."),
			confirm: t("Unpublish"),
			danger: true
		})) return;
		await replace("entries/unpublish");
	};
	const remove = async () => {
		if (!entry || !actions.delete || !await confirm({
			title: t("Delete “{title}”?", { title: entry.title }),
			description: t("This permanently deletes the entry and its history."),
			confirm: t("Delete"),
			danger: true
		})) return;
		control.cancel();
		retry.current = remove;
		await attempt(async () => {
			await session.command(async (current) => {
				await run("entries/delete", {
					id: current.id,
					expectedVersion: current.version
				});
				return current;
			});
			session.reset();
			invalidate("entries/", "revisions/", "content/");
			navigate(listPath);
		});
	};
	const duplicate = async () => {
		const current = session.get();
		const source = current.entry;
		if (!actions.duplicate || !source || current.dirty || current.phase === "saving") return;
		await attempt(async () => {
			const result = await run("entries/duplicate", {
				id: source.id,
				expectedVersion: source.version
			});
			navigate(`/content/${collection.handle}/${result.id}`);
		});
	};
	const move = async (parentId) => {
		if (!actions.move) return false;
		control.cancel();
		setReplacing(true);
		retry.current = () => move(parentId);
		try {
			if (session.get().dirty && !await control.save()) return false;
			const result = await session.command((current) => run("entries/move", {
				id: current.id,
				parentId,
				expectedVersion: current.version
			}));
			invalidate("entries/", "revisions/", "content/");
			return !!result;
		} catch (error) {
			toast.error(error);
			return false;
		} finally {
			setReplacing(false);
		}
	};
	const keepMine = async () => {
		if (!entry || !conflict) return;
		await attempt(async () => {
			const version = conflict.version ?? (await run("entries/get", { id: entry.id })).version;
			await save({
				...lastSave.current,
				expectedVersion: version
			});
		});
	};
	const panelProps = {
		entry,
		collection: shownCollection,
		content: working,
		values: working.data,
		title: working.title,
		setValue,
		save: savePanel,
		reload,
		editable: editable && !replacing,
		can,
		errors,
		hold: setHeld
	};
	const toolbar = panelsFor("entry.toolbar", panelProps);
	const notices = panelsFor("entry.notice", panelProps);
	useSyncExternalStore(registry.entryActions.subscribe, registry.entryActions.version);
	const entryActions = registry.entryActions.all().filter((action) => action.when?.(panelProps) ?? true).sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
	const sidebarPanels = panelsFor("entry.sidebar", panelProps);
	const bodyPanels = panelsFor("entry.body", panelProps);
	const bodyField = collection.resolvedFields.find((field) => field.body);
	const bodyHandle = bodyField?.handle;
	const placement = resolveEntryFields(collection.resolvedFields, bodyHandle, [...sidebarPanels, ...bodyPanels]);
	const tabs = [
		{
			value: "details",
			label: singular,
			icon: collection.icon || "file"
		},
		{
			value: "history",
			label: t("History"),
			icon: "history"
		},
		...sidebarPanels.map((panel) => ({
			value: panel.id,
			label: panel.label ?? panel.id,
			icon: panel.icon
		}))
	];
	const active = tabs.some((tab) => tab.value === selectedPanel) ? selectedPanel : "details";
	const selectPanel = (value) => {
		setSelectedPanel(value);
		localStorage.setItem(panelKey, value);
	};
	const toggleSidebar = () => {
		if (!sidebarOpen) selectPanel("details");
		setSidebarOpen(!sidebarOpen);
	};
	const properties = placement.document.filter((field) => !WIDE_FIELDS.includes(field.type));
	const mainFields = placement.document.filter((field) => WIDE_FIELDS.includes(field.type));
	const fieldContext = {
		entry: entry ?? void 0,
		collection: collection.handle,
		blueprint: collection.blueprint,
		locale: contentLocale
	};
	const restore = async (revisionId) => {
		if (actions.restore) await replace("revisions/restore", { revisionId });
	};
	const sidebar = /* @__PURE__ */ jsxs("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ jsx(PanelHeader, {
			onClose: () => setSidebarOpen(false),
			children: /* @__PURE__ */ jsx(Tabs, {
				id: "entry-sidebar",
				value: active,
				onChange: selectPanel,
				tabs,
				bordered: false,
				fit: true,
				className: "h-full min-w-0 flex-1"
			})
		}), /* @__PURE__ */ jsx("div", {
			role: "tabpanel",
			id: `entry-sidebar-${active}-panel`,
			"aria-labelledby": `entry-sidebar-${active}`,
			className: "min-h-0 flex-1 overflow-y-auto",
			children: active === "details" ? /* @__PURE__ */ jsx(EntryDetails, {
				props: panelProps,
				working,
				fields: bodyField?.type === "blocks" ? [...placement.document, ...placement.sidebar] : placement.sidebar,
				titleInDetails: bodyField?.type === "blocks",
				update
			}) : active === "history" ? /* @__PURE__ */ jsx(EntryHistory, {
				entry,
				working,
				fields: collection.resolvedFields,
				editable: actions.restore && !busy,
				onRestore: restore
			}) : sidebarPanels.filter((panel) => panel.id === active).map((panel) => /* @__PURE__ */ jsx(panel.component, { ...panelProps }, panel.id))
		})]
	});
	const header = /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Fields, {
		bare: true,
		fields: [{
			handle: "title",
			type: "text",
			label: t("Title"),
			component: "title",
			placeholder: t("Untitled"),
			autofocus: !entry,
			onEnter: () => {
				save();
				focusBody();
			},
			onDown: focusBody
		}],
		values: { title: working.title },
		onChange: (_, title) => update({ title: title ?? "" }),
		errors,
		disabled: !panelProps.editable
	}), (properties.length > 0 || mainFields.length > 0) && /* @__PURE__ */ jsxs(Properties, {
		collection: collection.handle,
		count: properties.length + mainFields.length,
		children: [properties.map((field) => /* @__PURE__ */ jsx(PropertyRow, {
			field,
			value: working.data[field.handle],
			onChange: (value) => setValue(field.handle, value),
			error: errors[field.handle],
			disabled: !panelProps.editable,
			context: fieldContext,
			values: working.data
		}, field.handle)), mainFields.length > 0 && /* @__PURE__ */ jsx(Fields, {
			fields: mainFields,
			values: working.data,
			onChange: setValue,
			errors,
			disabled: !panelProps.editable,
			context: fieldContext,
			className: "mt-4 !gap-y-4"
		})]
	})] });
	const editorProps = bodyField ? {
		...panelProps,
		footer: /* @__PURE__ */ jsx(Fragment$1, { children: bodyPanels.map((panel) => /* @__PURE__ */ jsx(panel.component, { ...panelProps }, panel.id)) }),
		bodyField,
		setTitle: (title) => update({ title }),
		sidebar,
		sidebarOpen,
		setSidebarOpen,
		toolbar: toolHost,
		listPath,
		listLabel: list.label
	} : null;
	const workspace = editorProps ? panelsFor("entry.editor", editorProps)[0] : null;
	const status = entry?.displayStatus ?? "draft";
	const live = entry?.status === "published" && status !== "scheduled" && status !== "expired";
	const upToDate = live && !dirty && !entry?.hasDraft;
	const titleError = !entry && dirty && !working.title.trim();
	const shownTitle = working.title || t("Untitled");
	const saveText = phase === "error" ? t("Couldn’t save") : titleError ? t("Add a title to save") : busy ? t("Saving…") : dirty ? t("Unsaved") : entry ? t("Saved") : "";
	const saveState = /* @__PURE__ */ jsx("span", {
		"aria-hidden": "true",
		title: saveText || void 0,
		className: cn("block size-1.5 rounded-full", phase === "error" || titleError ? "bg-danger" : busy || dirty ? "bg-faint" : "bg-transparent")
	});
	const failed = phase === "error" || titleError;
	const titled = /* @__PURE__ */ jsxs("span", {
		className: "flex min-w-0 items-center gap-1.5",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "truncate",
				children: shownTitle
			}),
			saveState,
			failed && /* @__PURE__ */ jsx("span", {
				className: "shrink-0 text-xs font-normal text-danger",
				children: saveText
			})
		]
	});
	useShortcut("mod+s", () => {
		if (editable) save();
	}, true, editable ? t("Save") : void 0);
	useShortcut("mod+shift+p", () => {
		if (actions.publish && !held && !upToDate && working.title.trim()) publish();
	}, true, actions.publish && !held ? t("Publish") : void 0);
	useShortcut("mod+.", toggleSidebar, true, t("{name} Details", { name: singular }));
	useEffect(() => {
		const first = Object.keys(errors)[0];
		if (!first) return;
		const path = first.replace(/^data\./, "").split(".");
		const handle = path[0];
		const owner = placement.claimed.get(handle);
		if (owner || bodyField?.type === "blocks" && (handle === "title" || placement.document.some((field) => field.handle === handle)) || handle === "authorId" || handle === "slug" || placement.sidebar.some((field) => field.handle === handle)) {
			setSidebarOpen(true);
			selectPanel(owner ?? "details");
		}
		if (placement.document.some((field) => field.handle === handle)) {
			localStorage.setItem(`cms.properties.${collection.handle}`, "open");
			window.dispatchEvent(new Event("cms.fields.reveal"));
		}
		requestAnimationFrame(() => {
			const node = document.getElementById(fieldControlId({ handle: path.at(-1) }, path.slice(0, -1))) ?? document.getElementById(`f-${handle}`) ?? document.querySelector(`[data-field="${CSS.escape(handle)}"] input, [data-field="${CSS.escape(handle)}"] textarea, [data-field="${CSS.escape(handle)}"] button`);
			node?.scrollIntoView({ block: "center" });
			node?.focus();
		});
	}, [errors]);
	return /* @__PURE__ */ jsxs("div", {
		className: "relative flex h-full flex-col",
		children: [
			/* @__PURE__ */ jsx(Topbar, {
				className: "max-sm:[&_[data-workspace-toggle]]:hidden",
				back: {
					to: listPath,
					label: list.label
				},
				title: titled,
				children: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
					className: "min-w-0 text-sm font-medium text-ink max-sm:hidden lg:hidden",
					children: titled
				}), workspace && /* @__PURE__ */ jsx("div", {
					ref: setToolHost,
					className: "flex shrink-0 items-center gap-0.5 empty:hidden"
				})] }),
				actions: /* @__PURE__ */ jsxs(Fragment$1, { children: [
					/* @__PURE__ */ jsx("span", {
						role: "status",
						className: "sr-only",
						children: saveText
					}),
					toolbar.map((panel) => /* @__PURE__ */ jsx(panel.component, { ...panelProps }, panel.id)),
					/* @__PURE__ */ jsx(Tooltip, {
						content: t("{name} Details", { name: singular }),
						shortcut: "mod+.",
						children: /* @__PURE__ */ jsx(IconButton, {
							icon: "sidebar",
							label: t("{name} Details", { name: singular }),
							title: void 0,
							active: sidebarOpen,
							onClick: toggleSidebar,
							className: "[&_svg]:-scale-x-100"
						})
					}),
					actions.publish ? upToDate ? /* @__PURE__ */ jsx(Menu, {
						trigger: /* @__PURE__ */ jsxs(Button, {
							variant: "ghost",
							className: "!gap-1 !px-1.5 !font-normal",
							children: [/* @__PURE__ */ jsx(StatusDot, {
								status,
								label: statusLabel(status),
								className: "text-sm"
							}), /* @__PURE__ */ jsx(Icon, {
								name: "chevron-down",
								size: 12,
								className: "shrink-0 text-faint"
							})]
						}),
						items: [{
							label: t("Publication Date…"),
							icon: "calendar",
							onSelect: () => setPublishing(true)
						}, entry && actions.unpublish && {
							label: t("Unpublish"),
							icon: "eye-off",
							onSelect: () => {
								unpublish();
							}
						}]
					}) : /* @__PURE__ */ jsxs(Button, {
						variant: "publish",
						disabled: !working.title.trim() || held,
						loading: sending,
						onClick: () => {
							publish();
						},
						children: [/* @__PURE__ */ jsx("span", {
							className: "max-sm:hidden",
							children: status === "scheduled" ? t("Publish Now") : live ? t("Publish Changes") : t("Publish")
						}), /* @__PURE__ */ jsx("span", {
							className: "sm:hidden",
							children: t("Publish")
						})]
					}) : editable && /* @__PURE__ */ jsx(Button, {
						variant: "primary",
						disabled: !dirty || busy,
						loading: busy,
						onClick: () => {
							save();
						},
						children: t("Save Draft")
					}),
					/* @__PURE__ */ jsx(Menu, {
						trigger: /* @__PURE__ */ jsx(IconButton, {
							icon: "more",
							label: t("More Actions")
						}),
						items: [
							...entryActions.map((action) => ({
								label: action.label,
								icon: action.icon,
								onSelect: () => action.perform(panelProps)
							})),
							entry && live && entry.uri && !entry.hasDraft ? {
								label: t("View on Site"),
								icon: "external",
								onSelect: () => {
									window.open(entry.uri, "_blank", "noopener");
								}
							} : null,
							actions.publish && !upToDate && {
								label: status === "scheduled" ? t("Change Schedule") : live ? t("Publication Date…") : t("Schedule…"),
								icon: "calendar",
								onSelect: () => setPublishing(true)
							},
							entry && actions.move && collection.structure === "tree" && {
								label: t("Move…"),
								icon: "arrow-right",
								onSelect: () => setMoving(true)
							},
							entry && actions.duplicate && {
								label: t("Duplicate"),
								icon: "copy",
								disabled: busy || dirty,
								description: busy || dirty ? t("Save changes before duplicating") : void 0,
								onSelect: () => {
									duplicate();
								}
							},
							entry && actions.discard && entry.hasDraft && {
								label: t("Discard Unpublished Changes"),
								icon: "undo",
								onSelect: () => {
									discard();
								}
							},
							entry && actions.unpublish && !(actions.publish && upToDate) && {
								label: t("Unpublish"),
								icon: "eye-off",
								onSelect: () => {
									unpublish();
								}
							},
							entry && {
								label: t("Copy ID"),
								icon: "hash",
								onSelect: () => void copyText(entry.id, { copied: t("ID copied") })
							},
							entry && actions.delete && {
								separator: true,
								label: ""
							},
							entry && actions.delete && {
								label: t("Delete"),
								icon: "trash",
								danger: true,
								onSelect: remove
							}
						]
					})
				] })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex h-8 shrink-0 items-center gap-3 border-b border-border px-4 sm:hidden",
				children: [/* @__PURE__ */ jsx("span", {
					className: "min-w-0 flex-1 truncate text-sm font-medium text-ink",
					children: shownTitle
				}), /* @__PURE__ */ jsx("span", {
					"aria-hidden": "true",
					className: cn("shrink-0 text-xs", failed ? "text-danger" : "text-faint"),
					children: saveText
				})]
			}),
			placement.error && /* @__PURE__ */ jsx(Notice, {
				tone: "danger",
				className: "m-3",
				children: placement.error
			}),
			notices.map((panel) => /* @__PURE__ */ jsx(panel.component, { ...panelProps }, panel.id)),
			workspace && editorProps ? /* @__PURE__ */ jsx("div", {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ jsx(Suspense, {
					fallback: /* @__PURE__ */ jsx("div", {
						className: "grid h-full place-items-center",
						children: /* @__PURE__ */ jsx(Spinner, {})
					}),
					children: /* @__PURE__ */ jsx(workspace.component, { ...editorProps })
				})
			}) : /* @__PURE__ */ jsxs("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ jsx("div", {
					className: "min-w-0 flex-1 overflow-y-auto",
					children: /* @__PURE__ */ jsxs("article", {
						className: "mx-auto w-full max-w-[784px] px-6 pb-24 pt-12 md:px-8 md:pt-16",
						children: [
							header,
							bodyField?.type === "blocks" ? /* @__PURE__ */ jsx(EmptyState, {
								icon: "blocks",
								title: t("Block editor unavailable")
							}) : bodyField && /* @__PURE__ */ jsxs("div", {
								className: "mt-8",
								"data-cms-body": true,
								children: [typeof bodyField.shared === "string" && /* @__PURE__ */ jsx(SharedMark, {
									from: bodyField.shared,
									className: "mb-2"
								}), /* @__PURE__ */ jsx(Fields, {
									bare: true,
									fields: [bodyField],
									values: working.data,
									onChange: setValue,
									errors,
									disabled: !panelProps.editable,
									context: {
										...fieldContext,
										title: working.title
									}
								})]
							}),
							bodyPanels.map((panel) => /* @__PURE__ */ jsx(panel.component, { ...panelProps }, panel.id))
						]
					})
				}), /* @__PURE__ */ jsx(InspectorPanel, {
					open: sidebarOpen,
					onOpenChange: setSidebarOpen,
					title: singular,
					children: sidebar
				})]
			}),
			publishing && /* @__PURE__ */ jsx(PublicationDialog, {
				entry,
				changes: dirty || !!entry?.hasDraft,
				busy,
				onClose: () => setPublishing(false),
				onPublish: (at, expiresAt) => publish(at, expiresAt)
			}),
			moving && entry && /* @__PURE__ */ jsx(EntryMoveDialog, {
				entry,
				collection: shownCollection,
				busy: busy || replacing,
				onClose: () => setMoving(false),
				onMove: move
			}),
			control.error && phase === "error" && /* @__PURE__ */ jsx(SaveFeedback, {
				error: control.error,
				conflict: !!conflict,
				dirty,
				onReload: reload,
				onKeepMine: keepMine,
				onRetry: () => {
					retry.current().catch(() => {});
				}
			})
		]
	});
}
/**
* Why the last save didn't go through, in words for people, with the way forward. A float under
* the top bar, so the page doesn't move. The CMS's own messages are written for people; anything
* else (the browser's "Failed to fetch") means the request never arrived.
*/
function SaveFeedback({ error, conflict, dirty, onReload, onKeepMine, onRetry }) {
	const ours = error instanceof CmsError && error.status > 0;
	const message = conflict ? error.message : ours && error.type === "invalid_input" ? t("Couldn’t save. Check the highlighted fields.") : ours ? t("Couldn’t save. {reason}", { reason: error.message }) : t("Couldn’t save. Check your connection.");
	return /* @__PURE__ */ jsx("div", {
		className: "pointer-events-none absolute inset-x-0 top-14 z-sticky flex justify-center px-4 max-sm:top-[5.5rem]",
		children: /* @__PURE__ */ jsxs("div", {
			role: "alert",
			className: "pointer-events-auto flex min-h-10 max-w-[560px] items-center gap-2.5 rounded-lg border border-border-float bg-float py-1.5 pl-3 pr-1.5 text-sm text-text shadow-pop",
			children: [
				/* @__PURE__ */ jsx(Icon, {
					name: "warning",
					size: 16,
					className: "shrink-0 text-danger"
				}),
				/* @__PURE__ */ jsx("span", {
					className: "min-w-0 flex-1",
					children: message
				}),
				conflict ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Button, {
					size: "xs",
					variant: "ghost",
					onClick: onReload,
					children: t("Load Their Version")
				}), dirty && /* @__PURE__ */ jsx(Button, {
					size: "xs",
					variant: "ghost",
					onClick: onKeepMine,
					children: t("Keep Mine")
				})] }) : error.type !== "invalid_input" && /* @__PURE__ */ jsx(Button, {
					size: "xs",
					variant: "ghost",
					onClick: onRetry,
					children: t("Try Again")
				})
			]
		})
	});
}
/** Into the first editable spot of the body (the title's Enter and ↓). */
function focusBody() {
	(document.querySelector("[data-cms-body] [contenteditable=\"true\"], [data-cms-body] textarea, [data-cms-body] input") ?? document.querySelector("[data-cms-fields] input, [data-cms-fields] textarea"))?.focus();
}
/** The entry's fields under the title; folded away on request (remembered per collection). */
function Properties({ collection, count, children }) {
	const key = `cms.properties.${collection}`;
	const [open, setOpen] = useState(() => localStorage.getItem(key) !== "closed");
	const toggle = () => {
		localStorage.setItem(key, open ? "closed" : "open");
		setOpen(!open);
	};
	useEffect(() => {
		const reveal = () => setOpen(true);
		window.addEventListener("cms.fields.reveal", reveal);
		return () => window.removeEventListener("cms.fields.reveal", reveal);
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "mt-6",
		"data-cms-fields": open ? "" : void 0,
		children: [open && /* @__PURE__ */ jsx("div", {
			className: "space-y-px",
			children
		}), /* @__PURE__ */ jsxs(Button, {
			variant: "ghost",
			onClick: toggle,
			"aria-expanded": open,
			className: "-ml-1.5 mt-2 !gap-1.5 !rounded-xs !px-1.5 !text-xs !font-normal !text-faint hover:!text-muted",
			children: [/* @__PURE__ */ jsx(Icon, {
				name: open ? "chevron-up" : "chevron-down",
				size: 12
			}), open ? t("Hide Properties") : plural(count, "{count} property", "{count} properties")]
		})]
	});
}
/** Fields that are a part of the document under the properties, not a property: a short textarea, media, tags or entries stay properties, drawn small. */
var WIDE_FIELDS = [
	"repeater",
	"blocks",
	"richtext",
	"markdown",
	"json",
	"group",
	"code",
	"fields"
];
/** One property: its label, and its value drawn small. */
function PropertyRow({ field, value, onChange, error, disabled, context, values }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "grid grid-cols-[148px_minmax(0,1fr)] items-start gap-3 py-0.5",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex h-8 min-w-0 items-center gap-1.5 text-sm text-muted",
			title: field.instructions ?? field.label,
			children: [/* @__PURE__ */ jsx("span", {
				className: "truncate",
				children: field.label
			}), typeof field.shared === "string" && /* @__PURE__ */ jsx(SharedMark, { from: field.shared })]
		}), /* @__PURE__ */ jsx("div", {
			className: "min-w-0",
			children: /* @__PURE__ */ jsx(Fields, {
				bare: true,
				fields: [{
					...field,
					width: "full",
					size: field.size ?? "sm",
					rows: field.type === "textarea" ? field.rows ?? 2 : field.rows
				}],
				values: {
					...values,
					[field.handle]: value
				},
				onChange: (_, next) => onChange(next),
				errors: error ? { [field.handle]: error } : {},
				disabled,
				context
			})
		})]
	});
}
export { EntryEditor as default };
