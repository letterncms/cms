import { r as e, t } from "./preview-J_UEsfe8.js";
import { t as n } from "@letterncms/sdk";
import { useState as r } from "react";
import { IconButton as i, Segmented as a, Tooltip as o, Topbar as s, cn as c } from "@letterncms/ui";
import { Fragment as l, jsx as u, jsxs as d } from "react/jsx-runtime";
// admin/src/Design.tsx
function f() {
	let [f, p] = r("desktop");
	return /* @__PURE__ */ d("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ u(s, {
			crumbs: [{
				label: n("Design"),
				icon: "palette"
			}],
			actions: /* @__PURE__ */ d(l, { children: [/* @__PURE__ */ u("span", {
				className: "max-md:hidden",
				children: /* @__PURE__ */ u(a, {
					size: "xs",
					"aria-label": n("Screen"),
					value: f,
					onChange: p,
					options: [
						{
							value: "desktop",
							icon: "desktop",
							title: n("Desktop")
						},
						{
							value: "tablet",
							icon: "tablet",
							title: n("Tablet")
						},
						{
							value: "phone",
							icon: "phone",
							title: n("Phone")
						}
					]
				})
			}), /* @__PURE__ */ u(o, {
				content: n("Open Site"),
				children: /* @__PURE__ */ u(i, {
					icon: "external",
					label: n("Open Site"),
					title: void 0,
					onClick: () => window.open("/", "_blank", "noopener")
				})
			})] })
		}), /* @__PURE__ */ u("div", {
			className: "flex min-h-0 flex-1 justify-center bg-sunken md:p-4",
			children: /* @__PURE__ */ u("iframe", {
				src: "/",
				title: n("Site"),
				className: c("h-full max-w-full transition-[width] duration-move", t),
				style: { width: e[f] }
			})
		})]
	});
}
export { f as default };
