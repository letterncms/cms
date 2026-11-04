import { registry as e } from "@letterncms/sdk";
import { lazy as t } from "react";
e.routes.set("/", {
	path: "/",
	component: t(() => import("./chunks/Dashboard-B_bH3RhK.js"))
}), e.widgets.set("shortcuts", t(() => import("./chunks/Shortcuts-ce8H42uA.js")));
