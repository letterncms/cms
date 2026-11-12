import { registry as e, run as t, t as n } from "@letterncms/sdk";
import { toast as r } from "@letterncms/ui";
import { lazy as i } from "react";
// admin/src/index.tsx
e.widgets.set("email-status", i(() => import("./chunks/WidgetEmail-CfHt0Kol.js")));
async function a() {
	let e = await t("account/get");
	try {
		await t("email/test", { to: e.email }), r.success(n("Test email sent to {email}", { email: e.email }));
	} catch (e) {
		r.error(e);
	}
}
e.commands.set("email-test", {
	label: n("Send Test Email"),
	icon: "mail",
	keywords: [
		"smtp",
		"email",
		"mail",
		"test"
	],
	perform: a
});
