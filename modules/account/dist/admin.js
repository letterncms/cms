import { can as e, prefetchAbility as t, registry as n } from "@letterncms/sdk";
import { lazy as r } from "react";
// admin/src/index.tsx
n.routes.set("/account", {
	path: "/account",
	private: !0,
	component: r(() => import("./chunks/Account-Bb7p2OSq.js")),
	load: () => Promise.all([t("users/fields"), e("tokens.manage") && t("tokens/list")])
});
var i = (e) => r(() => import("./chunks/Account-Bb7p2OSq.js").then((t) => ({ default: t[e] })));
for (let [e, [t, r]] of Object.entries({
	profile: ["Profile", 10],
	security: ["Security", 30],
	api: ["Api", 60]
})) n.panels.set(`account-${e}`, {
	id: `account-${e}`,
	slot: "account.sections",
	component: i(t),
	order: r
});
n.widgets.set("account-security", r(() => import("./chunks/WidgetSecurity-Cq-AbZQx.js")));
