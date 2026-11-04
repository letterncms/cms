import { t as e } from "@letterncms/sdk";
// admin/src/reasons.ts
var t = (t) => ({
	ok: e("Licensed"),
	nonpublic: e("No license needed here"),
	unlicensed: e("No license"),
	invalid: e("Key not valid"),
	wrong_family: e("Test key"),
	unknown_key: e("Update {brand} to check this key"),
	key_revoked: e("Key withdrawn"),
	unverifiable: e("This server can’t check keys"),
	idn_unconvertible: e("Use the xn-- form of the domain"),
	domain_mismatch: e("Not licensed for this domain"),
	refunded: e("Refunded"),
	charged_back: e("Charged back"),
	revoked: e("License revoked"),
	term_ended: e("Plan ended"),
	major_not_covered: e("This major version isn’t covered"),
	window_over: e("Updates ended")
})[t] ?? t;
export { t };
