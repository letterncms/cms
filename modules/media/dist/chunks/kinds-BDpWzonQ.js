import { CmsError as e, boot as t, invalidate as n, locale as r, plural as i, t as a, xsrfToken as o } from "@letterncms/sdk";
import { Icon as s, cn as c, toast as l } from "@letterncms/ui";
import { jsx as u, jsxs as d } from "react/jsx-runtime";
// admin/src/upload.ts
function f(n, i = "", s, c) {
	return new Promise((l, u) => {
		let d = new XMLHttpRequest(), f = new FormData();
		f.append("file", n), f.append("folder", i), c && f.append("replace", c), d.open("POST", `${t.api}/media/upload`), d.setRequestHeader("X-XSRF-TOKEN", o() ?? ""), d.setRequestHeader("Accept", "application/json"), d.setRequestHeader("X-Cms-Locale", r()), d.upload.onprogress = (e) => e.lengthComputable && s?.(e.loaded / e.total), d.onload = () => {
			let t = (() => {
				try {
					return JSON.parse(d.responseText);
				} catch {
					return null;
				}
			})();
			d.status >= 200 && d.status < 300 && t?.data ? l(t.data) : u(new e(t?.error?.message ?? (d.status === 413 ? a("The file is larger than the server allows.") : a("Upload failed ({status})", { status: d.status })), t?.error?.type ?? "failed", d.status));
		}, d.onerror = () => u(new e(a("Network error during upload."))), d.send(f);
	});
}
async function p(e, t = "") {
	let r = Array.from(e);
	if (!r.length) return [];
	let o = r.map(() => 0), s = i(r.length, "Uploading {count} file…", "Uploading {count} files…"), c = l.loading(s, { description: "0%" }), u = () => l.loading(s, {
		id: c,
		description: `${Math.round(o.reduce((e, t) => e + t, 0) / r.length * 100)}%`
	}), d = [], p = [];
	await Promise.all(r.map(async (e, n) => {
		try {
			d.push(await f(e, t, (e) => {
				o[n] = e, u();
			}));
		} catch (t) {
			p.push({
				name: e.name,
				error: t
			});
		}
		o[n] = 1;
	})), n("media/"), d.length ? l.success(i(d.length, "{count} file uploaded", "{count} files uploaded"), {
		id: c,
		description: void 0
	}) : l.dismiss(c);
	for (let { name: e, error: t } of p) l.error(a("Couldn’t upload {name}: {reason}", {
		name: e,
		reason: t instanceof Error ? t.message : String(t)
	}));
	return d;
}
var m = { current: "" }, h = [
	"image",
	"video",
	"audio",
	"pdf",
	"model",
	"texture",
	"animation",
	"file"
], g = {
	image: "image",
	video: "video",
	audio: "music-notes",
	pdf: "file-text",
	model: "cube",
	texture: "checkerboard",
	animation: "play-circle",
	file: "file"
}, _ = (e) => ({
	image: a("Image"),
	video: a("Video"),
	audio: a("Audio"),
	pdf: "PDF",
	model: a("3D Model"),
	texture: a("Texture"),
	animation: a("Animation"),
	file: a("File")
})[e] ?? a("File"), v = () => ({
	image: a("Images"),
	video: a("Videos"),
	audio: a("Audio"),
	pdf: "PDF",
	model: a("3D Models"),
	texture: a("Textures"),
	animation: a("Animations"),
	file: a("Other")
}), y = (e) => e.mime === "application/json" ? "Lottie" : e.mime === "application/vnd.rive" ? "Rive" : e.filename.includes(".") ? e.filename.slice(e.filename.lastIndexOf(".") + 1).toUpperCase() : "", b = (e) => [_(e.kind), e.kind === "pdf" ? "" : y(e)].filter(Boolean).join(" · "), x = (e) => e.startsWith("image") ? "image" : e.startsWith("video") ? "video" : e.startsWith("audio") ? "audio" : e === "application/pdf" ? "pdf" : e.startsWith("model") ? "model" : "all";
function S({ item: e, size: t = 24, className: n }) {
	let r = y(e);
	return /* @__PURE__ */ d("div", {
		className: c("flex size-full flex-col items-center justify-center gap-1.5 text-faint", n),
		children: [/* @__PURE__ */ u(s, {
			name: g[e.kind] ?? "file",
			size: t
		}), r && /* @__PURE__ */ u("span", {
			className: "max-w-full truncate px-1 text-2xs font-medium tracking-wide",
			children: r
		})]
	});
}
export { v as a, f as c, g as i, p as l, h as n, b as o, x as r, m as s, S as t };
