import { registry as e } from "@letterncms/sdk";
import { lazy as t } from "react";
e.components.set("users/person", t(() => import("./chunks/Person-D5-6XsU-.js"))), e.components.set("users/profile-fields", t(() => import("./chunks/ProfileFields-Dk2rO7t4.js"))), e.fields.set("roles", t(() => import("./chunks/RolesField-_nsUrWzA.js").then((e) => ({ default: e.RolesField })))), e.widgets.set("users-team", t(() => import("./chunks/WidgetTeam-De9-Q4_w.js")));
