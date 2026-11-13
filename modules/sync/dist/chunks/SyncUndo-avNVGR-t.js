import { queryClient as e, run as t, t as n } from "@letterncms/sdk";
import { useEffect as r, useRef as i, useState as a } from "react";
import { Dialog as o, Spinner as s, confirm as c, toast as l } from "@letterncms/ui";
import { jsx as u } from "react/jsx-runtime";
// admin/src/SyncUndo.tsx
function d({ props: d, close: f }) {
	let [p, m] = a(!1), h = i(!1), g = d.site ?? "";
	return r(() => {
		h.current || (h.current = !0, (async () => {
			let r = !!d.remote;
			if (!await c(r ? {
				title: n("Undo the last push to {site}?", { site: g }),
				description: n("{site} gets back what it had before that push, from the backup it made. Changes made there since are replaced too.", { site: g }),
				confirm: n("Undo Push"),
				danger: !0
			} : {
				title: n("Undo this sync?"),
				description: n("This site gets back what it had before it, from the backup made just then. Changes made since are replaced too."),
				confirm: n("Undo Sync"),
				danger: !0
			})) return f?.();
			m(!0);
			try {
				for (; !(await t("sync/undo", {
					id: d.id,
					...r ? { remote: d.remote } : {}
				})).done;);
				l.success(r ? n("{site} is back as it was before the push.", { site: g }) : n("Undone. This site is as it was before that sync.")), e.invalidateQueries();
			} catch (e) {
				l.error(e);
			} finally {
				f?.();
			}
		})());
	}, []), p ? /* @__PURE__ */ u(o, {
		open: !0,
		onOpenChange: () => {},
		size: "sm",
		title: n("Undoing…"),
		children: /* @__PURE__ */ u("div", {
			className: "grid h-16 place-items-center",
			children: /* @__PURE__ */ u(s, {})
		})
	}) : null;
}
export { d as default };
