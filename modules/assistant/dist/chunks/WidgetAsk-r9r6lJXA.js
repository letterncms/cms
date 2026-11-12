import { can as e, events as t, navigate as n, t as r, useAbility as i } from "@letterncms/sdk";
import { useState as a } from "react";
import { Button as o, Fields as s, Kbd as c, Widget as l } from "@letterncms/ui";
import { jsx as u } from "react/jsx-runtime";
// admin/src/WidgetAsk.tsx
function d() {
	let d = i("assistant/status", {}, { staleTime: 6e4 }), f = d.data?.configured === !0, [p, m] = a("");
	return /* @__PURE__ */ u(l, {
		query: d,
		action: f && /* @__PURE__ */ u(c, { keys: "mod+j" }),
		empty: d.data?.configured === !1 && {
			icon: "key",
			title: r("Connect Claude"),
			description: e("settings.manage") ? r("The assistant needs an Anthropic API key.") : r("Ask an administrator to add an Anthropic API key."),
			action: e("settings.manage") && /* @__PURE__ */ u(o, {
				size: "sm",
				onClick: () => n("/settings/assistant"),
				children: r("Open Settings")
			})
		},
		children: /* @__PURE__ */ u("form", {
			onSubmit: (e) => {
				e.preventDefault();
				let n = p.trim();
				n && (t.emit("chat.ask", n), m(""));
			},
			children: /* @__PURE__ */ u(s, {
				bare: !0,
				fields: [{
					handle: "question",
					type: "text",
					label: r("Ask {brand}"),
					placeholder: r("Ask anything about your site"),
					icon: "sparkle",
					max: 2e3
				}],
				values: { question: p },
				onChange: (e, t) => m(t ?? "")
			})
		})
	});
}
export { d as default };
