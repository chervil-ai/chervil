'use strict';

// Registrable-domain (eTLD+1) reducer with a *lite* public-suffix list. Good
// enough to group a site's subdomains under one credential entry (e.g.
// accounts.google.com and mail.google.com → google.com; bbc.co.uk stays
// bbc.co.uk). Not the full Mozilla PSL — covers the common multi-label public
// suffixes; everything else falls back to the last two labels.

// Two-or-more-label public suffixes under which the registrable domain is the
// NEXT label down. Kept intentionally compact; extend as needed.
const MULTI_SUFFIXES = new Set([
  // UK
  'co.uk', 'org.uk', 'me.uk', 'ltd.uk', 'plc.uk', 'net.uk', 'sch.uk', 'ac.uk', 'gov.uk', 'nhs.uk', 'police.uk',
  // Australia
  'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au', 'asn.au', 'id.au',
  // Japan
  'co.jp', 'or.jp', 'ne.jp', 'ac.jp', 'go.jp', 'ad.jp', 'ed.jp', 'gr.jp', 'lg.jp',
  // New Zealand
  'co.nz', 'net.nz', 'org.nz', 'govt.nz', 'ac.nz', 'geek.nz', 'school.nz',
  // South Africa
  'co.za', 'org.za', 'net.za', 'gov.za', 'ac.za', 'web.za',
  // Brazil
  'com.br', 'net.br', 'org.br', 'gov.br', 'edu.br',
  // India
  'co.in', 'net.in', 'org.in', 'gen.in', 'firm.in', 'ind.in', 'gov.in', 'ac.in',
  // Others (common)
  'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'com.mx', 'com.sg', 'com.hk', 'com.tw',
  'com.tr', 'com.ar', 'com.co', 'co.id', 'co.kr', 'co.il', 'com.ua', 'com.ph',
]);

// Reduce a hostname (or full URL) to its registrable domain. Returns the input
// host lowercased for IPs / single-label hosts / localhost (no reduction).
function registrableDomain(input) {
  let host = String(input || '').trim().toLowerCase();
  if (!host) return '';
  // Accept a full URL too.
  if (host.includes('://') || host.includes('/')) {
    try { host = new URL(host.includes('://') ? host : 'https://' + host).hostname; } catch { /* keep as-is */ }
  }
  host = host.replace(/:\d+$/, '').replace(/\.$/, ''); // strip port + trailing dot
  if (!host) return '';
  // IPv4 / IPv6 / localhost / single-label → no reduction.
  if (host === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':')) return host;
  const labels = host.split('.');
  if (labels.length <= 2) return host;
  const lastTwo = labels.slice(-2).join('.');
  if (MULTI_SUFFIXES.has(lastTwo)) return labels.slice(-3).join('.');
  return lastTwo;
}

// Do two hosts/URLs share a registrable domain? (used to scope credential fills)
function sameSite(a, b) {
  const ra = registrableDomain(a);
  return !!ra && ra === registrableDomain(b);
}

module.exports = { registrableDomain, sameSite };
