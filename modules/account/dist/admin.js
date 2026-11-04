import { registry as e } from "@letterncms/sdk";
import { lazy as t } from "react";
// admin/src/index.tsx
var n = (e) => t(() => import("./chunks/Account-Dj_zU0ET.js").then((t) => ({ default: t[e] })));
e.components.set("account/profile", n("Profile")), e.components.set("account/two-factor", n("TwoFactor")), e.components.set("account/new-token", n("NewToken")), e.components.set("account/connect", n("Connect")), e.widgets.set("account-security", t(() => import("./chunks/WidgetSecurity-Cq-AbZQx.js")));
