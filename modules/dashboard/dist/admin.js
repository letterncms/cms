import { registry as e } from "@letterncms/sdk";
import { lazy as t } from "react";
e.routes.set("/", {
	path: "/",
	component: t(() => import("./chunks/Dashboard-F2VsxsyX.js"))
}), e.widgets.set("shortcuts", t(() => import("./chunks/Shortcuts-C9wqOSNe.js")));
