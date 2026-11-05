import { can as e, locale as t, navigate as n, t as r, useAbility as i } from "@letterncms/sdk";
import { Button as a, Meter as o, Widget as s } from "@letterncms/ui";
import { jsx as c, jsxs as l } from "react/jsx-runtime";
// admin/src/WidgetCoverage.tsx
function u() {
	let u = i("translations/coverage", {}, { staleTime: 6e4 }), d = e("settings.manage"), f = u.data, p = new Intl.NumberFormat(t(), {
		style: "percent",
		maximumFractionDigits: 0
	}), m = [...f?.languages ?? []].sort((e, t) => Number(t.default) - Number(e.default) || t.share - e.share).slice(0, 6);
	return /* @__PURE__ */ c(s, {
		query: u,
		action: d && {
			label: r("Languages"),
			to: "/languages"
		},
		empty: f && f.languages.length < 2 ? {
			icon: "translate",
			title: r("One Language"),
			description: r("Add a language to translate your content."),
			action: d && /* @__PURE__ */ c(a, {
				size: "sm",
				icon: "plus",
				onClick: () => n("/languages"),
				children: r("Add a Language")
			})
		} : f?.total === 0 && {
			icon: "translate",
			title: r("No content to translate yet")
		},
		children: /* @__PURE__ */ c("div", {
			className: "grid gap-x-8 @md:grid-cols-2",
			children: m.map((e) => /* @__PURE__ */ l("div", {
				className: "py-2",
				children: [/* @__PURE__ */ l("div", {
					className: "flex items-baseline gap-2 text-sm",
					children: [
						/* @__PURE__ */ c("span", {
							className: "min-w-0 truncate text-text",
							title: e.englishName,
							children: e.name
						}),
						e.default && /* @__PURE__ */ c("span", {
							className: "text-xs text-faint",
							children: r("Default")
						}),
						/* @__PURE__ */ c("span", {
							className: "ml-auto shrink-0 text-xs tabular-nums text-muted",
							children: p.format(e.share)
						})
					]
				}), /* @__PURE__ */ c(o, {
					value: e.share,
					tone: e.default ? "muted" : e.share >= 1 ? "success" : "ink",
					label: r("{language}: {count} of {total} entries", {
						language: e.englishName,
						count: e.entries,
						total: f?.total ?? 0
					}),
					className: "mt-1.5"
				})]
			}, e.code))
		})
	});
}
export { u as default };
