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
	component: n(() => import("./chunks/Users-BAKBhf6h.js")),
	load: r
}), t.routes.set("/users/:id", {
	path: "/users/:id",
	component: n(() => import("./chunks/Users-BAKBhf6h.js")),
	load: r
}), t.routes.set("/users/fields", {
	path: "/users/fields",
	component: n(() => import("./chunks/Blueprint-DP94Jd_0.js")),
	load: () => e("users/fields")
}), t.fields.set("roles", n(() => import("./chunks/RolesField-BCIiP6Pn.js").then((e) => ({ default: e.RolesField })))), t.widgets.set("users-team", n(() => import("./chunks/WidgetTeam-De9-Q4_w.js")));
