import { prefetchAbility as e, registry as t } from "@letterncms/sdk";
import { lazy as n } from "react";
t.routes.set("/audit", {
	path: "/audit",
	private: !0,
	component: n(() => import("./chunks/Audit-2OyET7z1.js")),
	load: (t, { query: n }) => e("audit/list", {
		page: Number(n.page ?? 1),
		perPage: 50,
		userId: n.person || void 0,
		ability: n.action || void 0
	})
}), t.widgets.set("audit-activity", n(() => import("./chunks/WidgetActivity-DslDeOn4.js")));
