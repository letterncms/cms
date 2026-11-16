import { loadManifest as e, run as t, t as n } from "@letterncms/sdk";
// admin/src/installing.ts
var r = class extends Error {
	code;
	constructor(e, t) {
		super(e), this.code = t;
	}
};
async function i(i, a) {
	let o = 0, s = i;
	for (; s.state === "running";) try {
		s = await t("packages/job-step", { id: s.id }), o = 0, a?.(s);
	} catch (e) {
		if (++o > 3) throw e;
		await new Promise((e) => setTimeout(e, 1e3));
	}
	if (s.state === "failed") throw new r(s.error ?? n("The install failed."), s.code ?? null);
	return await e(), s;
}
var a = () => new URL("/_cms/update/tick", window.location.origin).toString();
async function o() {
	for (let e = 0; e < 200; e++) {
		try {
			let e = await fetch(a(), {
				method: "POST",
				cache: "no-store"
			});
			if (e.status === 200) {
				let t = await e.json();
				if (t.state && !["migrating", "checking"].includes(t.state)) return t.state;
			} else if (e.status === 204) return "done";
		} catch {}
		await new Promise((e) => setTimeout(e, 1500));
	}
	return "unknown";
}
export { i as n, o as r, r as t };
