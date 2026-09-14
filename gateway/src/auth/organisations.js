'use strict';

/**
 * Build 46 Part A — partner organisations whose tag may appear in an invite
 * code: ACR-<ORG>-<selector>-<secret> (Kraken, 14 September 2026).
 *
 * A fixed list, so a mistyped tag can never be issued. To add a partner, add
 * its tag here (2–6 capital letters) and restart the gateway; the admin tool
 * reads the same list. The tag is not secret: it identifies the invitee's
 * organisation to the operator and in the admin listings. The gateway stores
 * the tag and a label only — never a name or an email address.
 */
const ORGANISATIONS = Object.freeze(['ZZU', 'UCD', 'HKU', 'TEST']);

const ORG_PATTERN = /^[A-Z]{2,6}$/;

function isKnownOrganisation(tag) {
  return typeof tag === 'string' && ORG_PATTERN.test(tag) && ORGANISATIONS.includes(tag);
}

module.exports = { ORGANISATIONS, ORG_PATTERN, isKnownOrganisation };
