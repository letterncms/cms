import { invalidate as e, loadManifest as t, run as n, t as r, useAbility as i } from "@letterncms/sdk";
import { useRef as a, useState as o } from "react";
import { FieldsEditor as s, SaveBar as c, Spinner as l, useTabDirty as u } from "@letterncms/ui";
import { Fragment as d, jsx as f, jsxs as p } from "react/jsx-runtime";
// admin/src/ProfileFields.tsx
function m() {
	let m = i("user-fields/get", {}, { refetchOnWindowFocus: !1 }), [h, g] = o(null), [_, v] = o(!1), [y, b] = o(null), x = a(!1), S = h !== null && JSON.stringify(h) !== JSON.stringify(m.data?.fields ?? []);
	u(S);
	let C = async () => {
		if (h && S && !x.current) {
			x.current = !0, v(!0), b(null);
			try {
				await n("user-fields/save", { fields: h }), e("users/", "user-fields/"), await t(), g(null);
			} catch (e) {
				b(e instanceof Error ? e.message : String(e));
			} finally {
				v(!1), x.current = !1;
			}
		}
	};
	return /* @__PURE__ */ p(d, { children: [m.data ? /* @__PURE__ */ f("div", {
		className: "mx-auto w-full max-w-[760px] pb-24",
		children: /* @__PURE__ */ f(s, {
			fields: h ?? m.data.fields ?? [],
			onChange: g,
			builtIn: r("Name, email and roles are built in.")
		})
	}) : /* @__PURE__ */ f("div", {
		className: "grid place-items-center py-10 text-faint",
		children: /* @__PURE__ */ f(l, {})
	}), /* @__PURE__ */ f(c, {
		dirty: S,
		saving: _,
		error: y,
		onSave: () => void C(),
		onDiscard: () => {
			g(null), b(null);
		}
	})] });
}
export { m as default };
