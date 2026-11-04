import { navigate as e, useLocation as t } from "@letterncms/sdk";
import { useEffect as n } from "react";
// admin/src/Blueprint.tsx
function r() {
	return n(() => e("/users?tab=fields", { replace: !0 }), []), null;
}
function i() {
	let { query: r } = t();
	return n(() => e(`/users?tab=sign-up${r.field ? `&field=${encodeURIComponent(r.field)}` : ""}`, { replace: !0 }), [r.field]), null;
}
export { i as SignUpSettings, r as default };
