import { navigate as e } from "@letterncms/sdk";
import { Dialog as t, List as n, Row as r } from "@letterncms/ui";
import { jsx as i } from "react/jsx-runtime";
// admin/src/NewEntry.tsx
function a({ props: a, close: o }) {
	let s = (t) => {
		let n = new URLSearchParams({
			blueprint: t,
			...a.locale ? { locale: a.locale } : {}
		});
		e(`/content/${a.collection}/new?${n}`);
	};
	return /* @__PURE__ */ i(t, {
		open: !0,
		onOpenChange: (e) => !e && o?.(),
		size: "sm",
		title: a.title,
		children: /* @__PURE__ */ i(n, { children: a.kinds.map((e) => /* @__PURE__ */ i(r, {
			onClick: () => s(e.handle),
			children: e.title
		}, e.handle)) })
	});
}
export { a as default };
