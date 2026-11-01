import { t as e } from "@letterncms/sdk";
import { BlueprintEditor as t } from "@letterncms/ui";
import { jsx as n } from "react/jsx-runtime";
// admin/src/Blueprint.tsx
var r = () => ({
	get: ["users/fields", {}],
	builtIn: e("Name, email and roles are built in."),
	save: (e) => ["users/fields-save", { fields: e.fields }],
	back: {
		label: e("Users"),
		to: "/users",
		icon: "users"
	}
});
function i() {
	return /* @__PURE__ */ n(t, { kind: r() });
}
export { i as default };
