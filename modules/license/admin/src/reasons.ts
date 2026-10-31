import { t } from '@letterncms/sdk'

/** What a state means, for the person who can do something about it. Never reads as a threat: the site keeps working. */
export const reasonText = (reason: string, host: string): string => {
  const texts: Record<string, string> = {
    ok: t('Licensed.'),
    nonpublic: t('{host} is a local or staging host: no licence needed.', { host }),
    unlicensed: t('No licence covers {host} yet.', { host }),
    invalid: t('The licence key on this site is not valid. Paste it again from your account.'),
    wrong_family: t('This is a test licence key. It only works on the test system.'),
    unknown_key: t('This licence key was signed with a newer key. Update {brand} to check it.'),
    key_revoked: t('The key that signed this licence was withdrawn. Refresh, or get a current key from your account.'),
    unverifiable: t('PHP on this server has neither sodium nor OpenSSL with Ed25519, so the licence cannot be checked.'),
    idn_unconvertible: t('This server cannot convert the domain name. Write the site URL in its xn-- form.'),
    domain_mismatch: t('{host} is not one of the domains on this licence. Add it in your account.', { host }),
    refunded: t('This purchase was refunded.'),
    charged_back: t('The payment for this licence was charged back.'),
    revoked: t('This licence was revoked.'),
    term_ended: t('The plan behind this licence has ended.'),
    major_not_covered: t('This major version came out after the licence’s update window. Extend the licence to cover it.'),
    window_over: t('The update window has ended. The plugin keeps working, including patches and minor releases of the versions it covers.'),
  }
  return texts[reason] ?? reason
}

export const noteText = (note: string): string =>
  ({
    refresh_failing: t('This site has not reached the licence server for 30 days. Nothing changes; you can paste a current key from your account.'),
    clock: t('This server’s clock looks wrong. It changes nothing about the licence.'),
  })[note] ?? note
