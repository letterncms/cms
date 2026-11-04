import { CmsError as e, boot as t, invalidate as n, locale as r, plural as i, t as a, xsrfToken as o } from "@letterncms/sdk";
import { toast as s } from "@letterncms/ui";
// admin/src/upload.ts
function c(n, i = "", s) {
	return new Promise((c, l) => {
		let u = new XMLHttpRequest(), d = new FormData();
		d.append("file", n), d.append("folder", i), u.open("POST", `${t.api}/media/upload`), u.setRequestHeader("X-XSRF-TOKEN", o() ?? ""), u.setRequestHeader("Accept", "application/json"), u.setRequestHeader("X-Cms-Locale", r()), u.upload.onprogress = (e) => e.lengthComputable && s?.(e.loaded / e.total), u.onload = () => {
			let t = (() => {
				try {
					return JSON.parse(u.responseText);
				} catch {
					return null;
				}
			})();
			u.status >= 200 && u.status < 300 && t?.data ? c(t.data) : l(new e(t?.error?.message ?? (u.status === 413 ? a("The file is larger than the server allows.") : a("Upload failed ({status})", { status: u.status })), t?.error?.type ?? "failed", u.status));
		}, u.onerror = () => l(new e(a("Network error during upload."))), u.send(d);
	});
}
async function l(e, t = "") {
	let r = Array.from(e);
	if (!r.length) return [];
	let o = r.map(() => 0), l = i(r.length, "Uploading {count} file…", "Uploading {count} files…"), u = s.loading(l, { description: "0%" }), d = () => s.loading(l, {
		id: u,
		description: `${Math.round(o.reduce((e, t) => e + t, 0) / r.length * 100)}%`
	}), f = [], p = [];
	await Promise.all(r.map(async (e, n) => {
		try {
			f.push(await c(e, t, (e) => {
				o[n] = e, d();
			}));
		} catch (t) {
			p.push({
				name: e.name,
				error: t
			});
		}
		o[n] = 1;
	})), n("media/"), f.length ? s.success(i(f.length, "{count} file uploaded", "{count} files uploaded"), {
		id: u,
		description: void 0
	}) : s.dismiss(u);
	for (let { name: e, error: t } of p) s.error(a("Couldn’t upload {name}: {reason}", {
		name: e,
		reason: t instanceof Error ? t.message : String(t)
	}));
	return f;
}
var u = { current: "" };
function d(e) {
	let [t, n, i] = e < 1024 ? [
		"byte",
		e,
		0
	] : e < 1024 ** 2 ? [
		"kilobyte",
		e / 1024,
		0
	] : [
		"megabyte",
		e / 1024 ** 2,
		1
	];
	return new Intl.NumberFormat(r(), {
		style: "unit",
		unit: t,
		unitDisplay: t === "byte" ? "narrow" : "short",
		maximumFractionDigits: i
	}).format(n);
}
export { l as i, u as n, c as r, d as t };
