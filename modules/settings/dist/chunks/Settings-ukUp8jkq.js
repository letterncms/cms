import { navigate as e, t, useManifest as n } from "@letterncms/sdk";
import { useLayoutEffect as r } from "react";
import { EmptyState as i, Page as a, SettingsView as o } from "@letterncms/ui";
import { jsx as s } from "react/jsx-runtime";
// admin/src/Settings.tsx
function c() {
	let o = n().settings.find((e) => !e.home)?.namespace;
	return r(() => {
		o && e(`/settings/${o}`, { replace: !0 });
	}, [o]), o ? null : /* @__PURE__ */ s(a, {
		crumbs: [{
			label: t("Settings"),
			icon: "settings"
		}],
		children: /* @__PURE__ */ s(i, {
			icon: "settings",
			title: t("Nothing to set up")
		})
	});
}
function l({ namespace: e, onDirty: t }) {
	return /* @__PURE__ */ s(o, {
		namespace: e,
		onDirty: t
	});
}
export { l as SettingsForm, c as default };
