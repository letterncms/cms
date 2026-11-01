import { t as e } from "@letterncms/sdk";
// admin/src/reasons.ts
var t = (t, n) => ({
	ok: e("Licensed."),
	nonpublic: e("{host} is a local or staging host: no licence needed.", { host: n }),
	unlicensed: e("No licence covers {host} yet.", { host: n }),
	invalid: e("The licence key on this site is not valid. Paste it again from your account."),
	wrong_family: e("This is a test licence key. It only works on the test system."),
	unknown_key: e("This licence key was signed with a newer key. Update {brand} to check it."),
	key_revoked: e("The key that signed this licence was withdrawn. Refresh, or get a current key from your account."),
	unverifiable: e("PHP on this server has neither sodium nor OpenSSL with Ed25519, so the licence cannot be checked."),
	idn_unconvertible: e("This server cannot convert the domain name. Write the site URL in its xn-- form."),
	domain_mismatch: e("{host} is not one of the domains on this licence. Add it in your account.", { host: n }),
	refunded: e("This purchase was refunded."),
	charged_back: e("The payment for this licence was charged back."),
	revoked: e("This licence was revoked."),
	term_ended: e("The plan behind this licence has ended."),
	major_not_covered: e("This major version came out after the licence’s update window. Extend the licence to cover it."),
	window_over: e("The update window has ended. The plugin keeps working, including patches and minor releases of the versions it covers.")
})[t] ?? t, n = (t) => ({
	refresh_failing: e("This site has not reached the licence server for 30 days. Nothing changes; you can paste a current key from your account."),
	clock: e("This server’s clock looks wrong. It changes nothing about the licence.")
})[t] ?? t;
export { t as n, n as t };
