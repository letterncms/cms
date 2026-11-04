import { prefetchAbility as e, registry as t } from "@letterncms/sdk";
import { lazy as n } from "react";
// admin/src/index.tsx
var r = () => Promise.all([
	e("users/list", {
		search: void 0,
		perPage: 100,
		page: 1
	}),
	e("roles/list"),
	e("users/fields")
]);
t.routes.set("/users", {
	path: "/users",
	private: !0,
	component: n(() => import("./chunks/Users-DhRbdXGI.js")),
	load: r
}), t.routes.set("/users/:id", {
	path: "/users/:id",
	private: !0,
	component: n(() => import("./chunks/Users-DhRbdXGI.js")),
	load: r
}), t.routes.set("/settings/accounts", {
	path: "/settings/accounts",
	component: n(() => import("./chunks/Blueprint-CcyFqSz6.js").then((e) => ({ default: e.SignUpSettings })))
}), t.routes.set("/users/fields", {
	path: "/users/fields",
	component: n(() => import("./chunks/Blueprint-CcyFqSz6.js")),
	load: () => e("users/fields")
}), t.fields.set("roles", n(() => import("./chunks/RolesField-DhQ9X9fG.js").then((e) => ({ default: e.RolesField })))), t.widgets.set("users-team", n(() => import("./chunks/WidgetTeam-De9-Q4_w.js")));
