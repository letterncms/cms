import { prefetchAbility as e, registry as t } from "@letterncms/sdk";
import { lazy as n } from "react";
// admin/src/index.tsx
t.routes.set("/account", {
	path: "/account",
	component: n(() => import("./chunks/Account-BTp5fGi4.js")),
	load: () => Promise.all([e("users/fields"), e("tokens/list")])
});
var r = (e) => n(() => import("./chunks/Account-BTp5fGi4.js").then((t) => ({ default: t[e] })));
for (let [e, [n, i]] of Object.entries({
	profile: ["Profile", 10],
	password: ["Password", 20],
	"two-factor": ["TwoFactor", 30],
	appearance: ["Appearance", 40],
	tokens: ["Tokens", 60]
})) t.panels.set(`account-${e}`, {
	id: `account-${e}`,
	slot: "account.sections",
	component: r(n),
	order: i
});
t.routes.set("/account-pages", {
	path: "/account-pages",
	component: n(() => import("./chunks/AccountPages-BFmNiOTb.js")),
	load: () => e("accounts/screens")
}), t.widgets.set("account-security", n(() => import("./chunks/WidgetSecurity-Cq-AbZQx.js")));
