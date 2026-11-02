import { useAbility as e, useManifest as t } from "@letterncms/sdk";
// admin/src/useCollection.ts
function n(n) {
	let r = t().collections.find((e) => e.handle === n), i = e("collections/get", { handle: n }, { staleTime: 6e4 });
	return {
		summary: r,
		collection: i.data,
		isLoading: i.isLoading,
		error: i.error
	};
}
export { n as t };
