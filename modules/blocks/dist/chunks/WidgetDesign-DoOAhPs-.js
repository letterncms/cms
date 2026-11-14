import { Link as e, can as t, navigate as n, plural as r, t as i, timeAgo as a, useAbility as o, useManifest as s } from "@letterncms/sdk";
import { Button as c, Icon as l, Widget as u, WidgetRow as d } from "@letterncms/ui";
import { jsx as f, jsxs as p } from "react/jsx-runtime";
// admin/src/WidgetDesign.tsx
var m = {
	sort: "-updated_at",
	perPage: 5
};
function h() {
	let h = s(), g = o("entries/list", {
		collection: "components",
		...m
	}), _ = o("entries/list", {
		collection: "templates",
		...m
	}), v = (e) => h.collections.find((t) => t.handle === e), y = [...g.data?.items ?? [], ..._.data?.items ?? []].sort((e, t) => (t.updatedAt ?? "").localeCompare(e.updatedAt ?? "")).slice(0, 5), b = {
		isLoading: g.isLoading || _.isLoading,
		isError: g.isError && _.isError,
		refetch: () => Promise.all([g.refetch(), _.refetch()])
	}, x = [{
		handle: "components",
		total: g.data?.total,
		label: (e) => r(e, "{count} component", "{count} components")
	}, {
		handle: "templates",
		total: _.data?.total,
		label: (e) => r(e, "{count} template", "{count} templates")
	}].filter((e) => e.total !== void 0);
	return /* @__PURE__ */ p(u, {
		query: b,
		action: t("settings.manage") && {
			label: i("Design"),
			to: "/design"
		},
		empty: y.length === 0 && {
			icon: "symbol",
			title: i("No components or templates yet"),
			action: v("components")?.can.create && /* @__PURE__ */ f(c, {
				size: "sm",
				icon: "symbol",
				onClick: () => n("/content/components/new"),
				children: i("New Component")
			})
		},
		children: [y.map((e) => {
			let t = v(e.collection);
			return /* @__PURE__ */ f(d, {
				to: `/content/${e.collection}/${e.id}`,
				icon: t?.icon ?? "symbol",
				title: /* @__PURE__ */ f("span", {
					className: "font-medium",
					children: e.title || i("Untitled")
				}),
				meta: /* @__PURE__ */ p("span", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ f("span", {
						className: "hidden text-faint @md:inline",
						children: t?.singular
					}), /* @__PURE__ */ f("span", {
						className: "w-16 text-right",
						children: a(e.updatedAt)
					})]
				})
			}, e.id);
		}), /* @__PURE__ */ f("div", {
			className: "mt-2 flex items-center gap-4 border-t border-border pt-2.5",
			children: x.map((t) => /* @__PURE__ */ p(e, {
				to: `/content/${t.handle}`,
				className: "flex items-center gap-1.5 text-xs text-muted no-underline transition-colors duration-base hover:text-text",
				children: [/* @__PURE__ */ f(l, {
					name: v(t.handle)?.icon ?? "symbol",
					size: 13,
					className: "text-faint"
				}), t.label(t.total ?? 0)]
			}, t.handle))
		})]
	});
}
export { h as default };
