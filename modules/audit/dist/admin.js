import { prefetchAbility as e, registry as t } from "@letterncms/sdk";
import { lazy as n } from "react";
t.routes.set("/audit", {
	path: "/audit",
	component: n(() => import("./chunks/Audit-CIL450Wr.js")),
	load: (t, { query: n }) => e("audit/list", {
		page: Number(n.page ?? 1),
		perPage: 50
	})
}), t.widgets.set("audit-activity", n(() => import("./chunks/WidgetActivity-DslDeOn4.js")));
