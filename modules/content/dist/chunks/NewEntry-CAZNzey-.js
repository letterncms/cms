import { navigate } from "@letterncms/sdk";
import { Dialog, List, Row } from "@letterncms/ui";
import { jsx } from "react/jsx-runtime";
// admin/src/NewEntry.tsx
/** New, where a collection's entries come in kinds: pick one and the editor opens on its fields. */
function NewEntry({ props, close }) {
	const start = (kind) => {
		const query = new URLSearchParams({
			blueprint: kind,
			...props.locale ? { locale: props.locale } : {}
		});
		navigate(`/content/${props.collection}/new?${query}`);
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open: true,
		onOpenChange: (open) => !open && close?.(),
		size: "sm",
		title: props.title,
		children: /* @__PURE__ */ jsx(List, { children: props.kinds.map((kind) => /* @__PURE__ */ jsx(Row, {
			onClick: () => start(kind.handle),
			children: kind.title
		}, kind.handle)) })
	});
}
export { NewEntry as default };
