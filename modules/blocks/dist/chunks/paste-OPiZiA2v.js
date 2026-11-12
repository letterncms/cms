import { d as e, f as t, h as n, i as r, u as i } from "./insert-Biw2VMgl.js";
import { run as a } from "@letterncms/sdk";
import { toast as o } from "@letterncms/ui";
// admin/src/write/paste.ts
async function s(s, c, l, u, d) {
	try {
		let o = await a("blocks/from-markdown", { markdown: l });
		if (o.length === 0) return;
		let { nodes: f } = s.get(), p = c.type === "paragraph" && e(c.props.text), m = r(f, c.id, o[0].type, u, d);
		if (!m) return;
		let h = p ? n(f, c.id) : f, g = p && t(f, c.id)?.parentId === m.parentId ? m.index - 1 : m.index;
		s.commit(i(h, m.parentId, g, o));
		let _ = o[o.length - 1];
		_.type === "list" ? s.focus(_.id, "end", "items", Math.max(0, (_.props.items?.length ?? 1) - 1)) : s.focus(_.id, "end");
	} catch (e) {
		o.error(e);
	}
}
export { s as pasteMarkdown };
