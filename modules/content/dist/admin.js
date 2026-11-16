import { getManifest, navigate, prefetchAbility, registry, run, t } from "@letterncms/sdk";
import { lazy, useEffect, useRef, useState } from "react";
import { Button, Icon, Textarea, fieldControlId, slugify } from "@letterncms/ui";
import { jsx, jsxs } from "react/jsx-runtime";
// admin/src/TitleField.tsx
/**
* A document's title, set large above its body. `onEnter` (a function on the
* field definition) runs when Enter is pressed — titles are one line — and
* `onDown` when ↓ leaves its last line.
*/
function TitleField({ field, value, onChange, error, disabled }) {
	const onEnter = field.onEnter;
	const onDown = field.onDown;
	return /* @__PURE__ */ jsx(Textarea, {
		appearance: "plain",
		id: fieldControlId(field),
		"aria-describedby": field.describedBy,
		value: value ?? "",
		onChange: (e) => onChange(e.target.value.replace(/\n/g, " ")),
		onKeyDown: (e) => {
			const el = e.currentTarget;
			if (e.key === "Enter") {
				e.preventDefault();
				onEnter?.();
			} else if (e.key === "ArrowDown" && onDown && !e.shiftKey && el.selectionStart === el.value.length) {
				e.preventDefault();
				onDown();
			}
		},
		placeholder: field.placeholder ?? "",
		autoFocus: field.autofocus === true,
		rows: 1,
		disabled,
		"aria-label": field.label,
		invalid: !!error,
		className: "text-display font-semibold text-ink placeholder:text-faint/60"
	});
}
/** An entry's URL with its slug editable in place. The URL to show is the field's `uri` option; the value is the slug. */
function UriField({ field, value, onChange, disabled }) {
	const uri = String(field.uri ?? "");
	const slug = value ?? "";
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(slug);
	const input = useRef(null);
	useEffect(() => setDraft(slug), [slug]);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-6 w-full min-w-0 items-center gap-1.5 text-sm text-faint",
		children: [/* @__PURE__ */ jsx(Icon, {
			name: "link",
			size: 13,
			className: "shrink-0"
		}), editing ? /* @__PURE__ */ jsx("input", {
			ref: input,
			autoFocus: true,
			id: fieldControlId(field),
			"aria-describedby": field.describedBy,
			"aria-label": field.label,
			value: draft,
			onChange: (e) => setDraft(slugify(e.target.value, true)),
			onBlur: () => {
				setEditing(false);
				const s = slugify(draft);
				if (s && s !== slug) onChange(s);
			},
			onKeyDown: (e) => {
				if (e.key === "Enter") input.current?.blur();
				if (e.key === "Escape") {
					setDraft(slug);
					setEditing(false);
				}
			},
			className: "h-6 w-72 min-w-0 max-w-full rounded-xs border border-focus bg-bg px-1.5 font-mono text-xs text-text outline-none"
		}) : /* @__PURE__ */ jsx(Button, {
			variant: "ghost",
			size: "xs",
			id: fieldControlId(field),
			"aria-describedby": field.describedBy,
			disabled: disabled || uri === "/",
			onClick: () => setEditing(true),
			"aria-label": uri === "/" ? void 0 : t("Edit URL"),
			className: "min-w-0 max-w-full shrink !justify-start !px-1 text-left font-mono !font-normal !text-inherit hover:!text-text disabled:!opacity-100 disabled:hover:!bg-transparent",
			title: uri,
			children: /* @__PURE__ */ jsx("span", {
				className: "truncate",
				children: uri
			})
		})]
	});
}
// admin/src/index.tsx
registry.routes.set("/content/:collection/:id", {
	path: "/content/:collection/:id",
	component: lazy(() => import("./chunks/EntryEditor-CpSQ_w4H.js")),
	load: ({ collection, id }) => Promise.all([prefetchAbility("collections/get", { handle: collection }), ...id === "new" ? [] : [prefetchAbility("entries/get", { id }).catch(() => void 0)]])
});
registry.fields.set("title", TitleField);
registry.fields.set("uri", UriField);
registry.widgets.set("recent", lazy(() => import("./chunks/WidgetRecent-YTUPeBzR.js")));
registry.components.set("content/views", lazy(() => import("./chunks/SavedViews-BB_PmCGa.js")));
registry.components.set("content/new-entry", lazy(() => import("./chunks/NewEntry-CAZNzey-.js")));
var entryOption = (entry) => {
	const collection = getManifest().collections.find((c) => c.handle === entry.collection);
	return {
		id: `entry:${entry.id}`,
		kind: "entry",
		label: entry.title || t("Untitled"),
		detail: collection?.singular,
		icon: collection?.icon ?? "file",
		to: `/content/${entry.collection}/${entry.id}`,
		read: () => run("entries/get", { id: entry.id })
	};
};
registry.composer.set("entries", {
	trigger: "@",
	label: t("Content"),
	order: 10,
	search: async (query) => (query ? await run("content/search", {
		query,
		limit: 6
	}) : await run("content/recent", { limit: 6 })).map(entryOption)
});
registry.composer.set("entries-open", {
	trigger: "/",
	label: t("Content"),
	order: 70,
	search: async (query) => query.trim().length < 2 ? [] : (await run("content/search", {
		query: query.trim(),
		limit: 8
	})).map((entry) => {
		const { read, ...option } = entryOption(entry);
		return {
			...option,
			id: `open:${entry.id}`,
			detail: entry.uri ?? option.detail,
			perform: () => navigate(option.to)
		};
	})
});
