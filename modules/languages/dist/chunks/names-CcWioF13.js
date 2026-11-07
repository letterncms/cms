import { locale as e } from "@letterncms/sdk";
// admin/src/names.ts
function t(e) {
	return r(e, e);
}
function n(t) {
	return r(t, e());
}
function r(e, t) {
	try {
		let n = new Intl.DisplayNames([t], { type: "language" }).of(e) ?? e;
		return n.charAt(0).toLocaleUpperCase(t) + n.slice(1);
	} catch {
		return e;
	}
}
var i = /* @__PURE__ */ "ar.bg.ca.cs.da.de.de-AT.de-CH.el.en.en-GB.en-US.es.es-MX.et.fa.fi.fr.fr-CA.he.hi.hr.hu.id.it.ja.ko.lt.lv.nb.nl.nl-BE.pl.pt.pt-BR.ro.ru.sk.sl.sr.sv.th.tr.uk.vi.zh-CN.zh-TW".split(".");
export { n, t as r, i as t };
