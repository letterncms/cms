import { invalidate as e, loadManifest as t, run as n, useAbility as r } from "@letterncms/sdk";
import { useRef as i, useState as a } from "react";
import { FieldsEditor as o, SaveBar as s, Spinner as c, useTabDirty as l } from "@letterncms/ui";
import { Fragment as u, jsx as d, jsxs as f } from "react/jsx-runtime";
// admin/src/ProfileFields.tsx
function p() {
	let p = r("user-fields/get", {}, { refetchOnWindowFocus: !1 }), [m, h] = a(null), [g, _] = a(!1), [v, y] = a(null), b = i(!1), x = m !== null && JSON.stringify(m) !== JSON.stringify(p.data?.fields ?? []);
	l(x);
	let S = async () => {
		if (m && x && !b.current) {
			b.current = !0, _(!0), y(null);
			try {
				await n("user-fields/save", { fields: m }), e("users/", "user-fields/"), await t(), h(null);
			} catch (e) {
				y(e instanceof Error ? e.message : String(e));
			} finally {
				_(!1), b.current = !1;
			}
		}
	};
	return /* @__PURE__ */ f(u, { children: [p.data ? /* @__PURE__ */ d("div", {
		className: "mx-auto w-full max-w-[640px] pb-24",
		children: /* @__PURE__ */ d(o, {
			fields: m ?? p.data.fields ?? [],
			onChange: h
		})
	}) : /* @__PURE__ */ d("div", {
		className: "grid place-items-center py-10 text-faint",
		children: /* @__PURE__ */ d(c, {})
	}), /* @__PURE__ */ d(s, {
		dirty: x,
		saving: g,
		error: v,
		onSave: () => void S(),
		onDiscard: () => {
			h(null), y(null);
		}
	})] });
}
export { p as default };
