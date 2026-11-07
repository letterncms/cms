import { t as e } from "./Library-D7ZLD2zg.js";
import { setQuery as t, useLocation as n } from "@letterncms/sdk";
import { useEffect as r, useState as i } from "react";
import { jsx as a } from "react/jsx-runtime";
// admin/src/MediaLibrary.tsx
function o(o) {
	let { query: s } = n(), [c] = i(s.upload === "1");
	return r(() => {
		s.upload && t({ upload: null });
	}, [s.upload]), /* @__PURE__ */ a(e, {
		mode: "manage",
		bar: !0,
		autoUpload: c
	});
}
export { o as default };
