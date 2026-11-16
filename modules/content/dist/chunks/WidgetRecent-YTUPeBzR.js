import { navigate, t, timeAgo, useAbility, useManifest } from "@letterncms/sdk";
import { Button, StatusDot, Widget, WidgetRow, statusLabel } from "@letterncms/ui";
import { jsx, jsxs } from "react/jsx-runtime";
// admin/src/WidgetRecent.tsx
/** Home-screen widget: the entries changed last, across the collections you can view. */
function WidgetRecent() {
	const manifest = useManifest();
	const recent = useAbility("content/recent", { limit: 8 });
	const first = manifest.collections.find((c) => c.can.create);
	return /* @__PURE__ */ jsx(Widget, {
		query: recent,
		empty: recent.data?.length === 0 && {
			icon: "file",
			title: t("Nothing edited yet"),
			action: first && /* @__PURE__ */ jsx(Button, {
				size: "sm",
				icon: first.icon,
				onClick: () => navigate(`/content/${first.handle}/new`),
				children: first.newLabel
			})
		},
		children: recent.data?.map((e) => {
			const own = manifest.collections.find((x) => x.handle === e.collection);
			const c = manifest.collections.find((x) => x.handle === own?.within) ?? own;
			const when = e.updatedAt ?? e.publishedAt;
			return /* @__PURE__ */ jsx(WidgetRow, {
				to: `/content/${e.collection}/${e.id}`,
				icon: c?.icon ?? "file",
				title: /* @__PURE__ */ jsx("span", {
					className: "font-medium",
					children: e.title || t("Untitled")
				}),
				meta: /* @__PURE__ */ jsxs("span", {
					className: "flex min-w-0 items-center gap-4",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "sr-only w-24 truncate text-faint @lg:not-sr-only @lg:block",
							children: c?.title
						}),
						/* @__PURE__ */ jsx(StatusDot, {
							status: e.displayStatus,
							label: statusLabel(e.displayStatus),
							className: "sr-only w-20 @md:not-sr-only @md:inline-flex"
						}),
						/* @__PURE__ */ jsx("time", {
							dateTime: when ?? void 0,
							className: "w-24 text-right",
							children: when ? timeAgo(when) : null
						})
					]
				})
			}, e.id);
		})
	});
}
export { WidgetRecent as default };
