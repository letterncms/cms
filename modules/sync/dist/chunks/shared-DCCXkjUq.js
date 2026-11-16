import { t as e } from "@letterncms/sdk";
// admin/src/shared.ts
var t = ["running", "waiting"], n = (e) => e.toLocaleString(), r = (t) => t < 60 ? e("{n} s", { n: t }) : e("{n} min", { n: Math.ceil(t / 60) });
export { n, r, t };
