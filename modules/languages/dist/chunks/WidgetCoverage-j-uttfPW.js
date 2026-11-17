import { can as e, locale as t, navigate as n, t as r, useAbility as i } from "@letterncms/sdk";
import { Button as a, Meter as o, Tooltip as s, Widget as c } from "@letterncms/ui";
import { jsx as l, jsxs as u } from "react/jsx-runtime";
// admin/src/WidgetCoverage.tsx
function d() {
	let d = i("translations/coverage", {}, { staleTime: 6e4 }), f = e("settings.manage"), p = d.data, m = new Intl.NumberFormat(t(), {
		style: "percent",
		maximumFractionDigits: 0
	}), h = [...p?.languages ?? []].sort((e, t) => Number(t.default) - Number(e.default) || t.share - e.share).slice(0, 6);
	return /* @__PURE__ */ l(c, {
		query: d,
		action: f && {
			label: r("Languages"),
			to: "/languages"
		},
		empty: p && p.languages.length < 2 ? {
			icon: "translate",
			title: r("One Language"),
			description: r("Add a language to translate your content."),
			action: f && /* @__PURE__ */ l(a, {
				size: "sm",
				icon: "plus",
				onClick: () => n("/languages"),
				children: r("Add a Language")
			})
		} : p?.total === 0 && {
			icon: "translate",
			title: r("No content to translate yet")
		},
		children: /* @__PURE__ */ l("div", {
			className: "grid gap-x-8 @md:grid-cols-2",
			children: h.map((e) => /* @__PURE__ */ u("div", {
				className: "py-2",
				children: [/* @__PURE__ */ u("div", {
					className: "flex items-baseline gap-2 text-sm",
					children: [
						/* @__PURE__ */ l(s, {
							content: e.englishName,
							children: /* @__PURE__ */ l("span", {
								className: "min-w-0 truncate text-text",
								children: e.name
							})
						}),
						e.default && /* @__PURE__ */ l("span", {
							className: "text-xs text-faint",
							children: r("Default")
						}),
						/* @__PURE__ */ l("span", {
							className: "ml-auto shrink-0 text-xs tabular-nums text-muted",
							children: m.format(e.share)
						})
					]
				}), /* @__PURE__ */ l(o, {
					value: e.share,
					tone: e.default ? "muted" : e.share >= 1 ? "success" : "ink",
					label: r("{language}: {count} of {total} entries", {
						language: e.englishName,
						count: e.entries,
						total: p?.total ?? 0
					}),
					className: "mt-1.5"
				})]
			}, e.code))
		})
	});
}
export { d as default };
