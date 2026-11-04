import { t } from '@letterncms/sdk'

/** One short state for each reason. Never reads as a threat: the site keeps working. */
export const reasonText = (reason: string): string =>
  ({
    ok: t('Licensed'),
    nonpublic: t('No license needed here'),
    unlicensed: t('No license'),
    invalid: t('Key not valid'),
    wrong_family: t('Test key'),
    unknown_key: t('Update {brand} to check this key'),
    key_revoked: t('Key withdrawn'),
    unverifiable: t('This server can’t check keys'),
    idn_unconvertible: t('Use the xn-- form of the domain'),
    domain_mismatch: t('Not licensed for this domain'),
    refunded: t('Refunded'),
    charged_back: t('Charged back'),
    revoked: t('License revoked'),
    term_ended: t('Plan ended'),
    major_not_covered: t('This major version isn’t covered'),
    window_over: t('Updates ended'),
  })[reason] ?? reason
