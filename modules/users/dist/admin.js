import { registry as e } from "@letterncms/sdk";
import { lazy as t } from "react";
e.components.set("users/person", t(() => import("./chunks/Person-CqxggwTP.js"))), e.components.set("users/profile-fields", t(() => import("./chunks/ProfileFields-2RrwU__H.js"))), e.fields.set("roles", t(() => import("./chunks/RolesField-DntVgKRq.js").then((e) => ({ default: e.RolesField })))), e.widgets.set("users-team", t(() => import("./chunks/WidgetTeam-BfnYprw_.js")));
