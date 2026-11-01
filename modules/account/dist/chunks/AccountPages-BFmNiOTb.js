import { can as e, navigate as t, run as n, t as r, useAbility as i } from "@letterncms/sdk";
import { Badge as a, Button as o, DataView as s, EmptyState as c, Page as l, toast as u } from "@letterncms/ui";
import { jsx as d } from "react/jsx-runtime";
// admin/src/AccountPages.tsx
function f() {
	let f = i("accounts/screens"), p = f.data ?? [], m = {
		default: [r("Standard"), "neutral"],
		draft: [r("Draft"), "info"],
		customised: [r("Customised"), "success"],
		conflict: [r("A page has this address"), "warning"]
	}, h = (e) => n("accounts/screen-customise", { handle: e.handle }).then(({ id: e }) => t(`/content/screens/${e}`), u.error);
	return /* @__PURE__ */ d(l, {
		width: "wide",
		crumbs: [{
			label: r("Account Pages"),
			icon: "user"
		}],
		children: /* @__PURE__ */ d(s, {
			id: "account-pages",
			label: r("Account Pages"),
			items: p,
			dates: () => ({
				publishedAt: null,
				updatedAt: null
			}),
			rowKey: (e) => e.handle,
			onRowClick: e("entries.screens.create") ? h : void 0,
			loading: f.isLoading,
			error: f.isError,
			onRetry: () => void f.refetch(),
			columns: [
				{
					id: "label",
					label: r("Page"),
					render: (e) => e.label
				},
				{
					id: "path",
					label: r("Address"),
					width: "minmax(160px,0.6fr)",
					render: (e) => e.path ?? /* @__PURE__ */ d("span", {
						className: "text-faint",
						children: r("Shown inside other pages")
					})
				},
				{
					id: "status",
					label: r("Status"),
					width: "200px",
					render: (e) => /* @__PURE__ */ d(a, {
						tone: m[e.status][1],
						children: m[e.status][0]
					})
				}
			],
			actions: e("entries.screens.create") ? (e) => /* @__PURE__ */ d(o, {
				size: "xs",
				onClick: () => h(e),
				children: e.id ? r("Edit") : r("Customise")
			}) : void 0,
			empty: /* @__PURE__ */ d(c, {
				icon: "user",
				title: r("No account pages")
			})
		})
	});
}
export { f as default };
