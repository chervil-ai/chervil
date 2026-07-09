'use strict';

// EPUB 3 builder — zero dependencies.
//
// An EPUB is a ZIP whose first entry is an uncompressed `mimetype` file, plus
// XHTML chapters and an OPF manifest. Every entry here is STORED (method 0), so
// no compression library is needed: chapter text is small and images are
// already-compressed JPEG/PNG. Content (chapter bodies, resources) arrives
// pre-sanitized from the renderer, which uses the real DOM to produce
// well-formed XHTML — this module only assembles and escapes metadata.
//
// book = {
//   title, author, language,           // metadata (strings)
//   description,                       // optional
//   chapters: [{ title, body }],       // body = XHTML fragment for <body>
//   resources: [{ href, base64, mediaType }], // e.g. images/img1.png
//   cover: { base64, mediaType } | null,      // optional cover image
// }

const crypto = require('crypto');

// ---- Store-only ZIP ----------------------------------------------------------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// entries: [{ name, data: Buffer }] — order preserved (mimetype must be first).
function zipStore(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, 'utf8');
    const data = e.data;
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); // local file header
    local.writeUInt16LE(20, 4);         // version needed
    local.writeUInt16LE(0, 6);          // flags
    local.writeUInt16LE(0, 8);          // method 0 = stored
    local.writeUInt16LE(0, 10);         // mod time
    local.writeUInt16LE(0x21, 12);      // mod date (a fixed valid date)
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);         // extra len (must be 0 for mimetype)
    locals.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);       // version made by
    central.writeUInt16LE(20, 6);       // version needed
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x21, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    // extra/comment/disk/attrs all zero
    central.writeUInt32LE(offset, 42);  // local header offset
    centrals.push(central, name);

    offset += local.length + name.length + data.length;
  }
  const centralStart = offset;
  let centralSize = 0;
  for (const c of centrals) centralSize += c.length;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(centralStart, 16);
  return Buffer.concat([...locals, ...centrals, end]);
}

// ---- EPUB assembly -----------------------------------------------------------

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

const BOOK_CSS = `
body { font-family: Georgia, "Times New Roman", serif; line-height: 1.55; margin: 1em; color: #111; }
h1, h2, h3 { font-family: "Helvetica Neue", Arial, sans-serif; line-height: 1.25; }
h1 { font-size: 1.6em; } h2 { font-size: 1.3em; } h3 { font-size: 1.1em; }
img { max-width: 100%; height: auto; }
figure { margin: 1em 0; } figcaption { font-size: .85em; color: #555; }
blockquote { margin: 1em 1.5em; padding-left: .8em; border-left: 3px solid #ccc; color: #333; }
code, pre { font-family: Consolas, Menlo, monospace; font-size: .9em; }
pre { white-space: pre-wrap; background: #f4f4f4; padding: .8em; }
table { border-collapse: collapse; } td, th { border: 1px solid #bbb; padding: .3em .6em; }
.titlepage { text-align: center; margin-top: 18%; }
.titlepage .subtitle { color: #444; font-style: italic; }
.titlepage .meta { margin-top: 2em; font-size: .9em; color: #555; }
.objectives { text-align: left; display: inline-block; margin-top: 1.5em; }
.check-answer { font-style: italic; color: #333; margin-top: .3em; }
.applet-note { border: 1px dashed #999; padding: .7em; font-size: .9em; color: #444; margin: 1em 0; }
.media-link { margin: 1em 0; }
.flashcard dt { font-weight: bold; margin-top: .6em; }
.chervil-colophon { margin-top: 3em; font-size: .8em; color: #777; }
`;

function chapterXhtml(title, body, lang) {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${esc(lang)}">
<head><title>${esc(title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
${body}
</body>
</html>`;
}

/**
 * Build a complete .epub as a Buffer. Throws on empty input.
 */
function buildEpub(book) {
  const title = String(book && book.title || 'Untitled').slice(0, 300);
  const author = String(book && book.author || 'Chervil');
  const lang = String(book && book.language || 'en');
  const chapters = (book && Array.isArray(book.chapters) ? book.chapters : []).filter((c) => c && c.body);
  if (!chapters.length) throw new Error('Nothing to export.');
  const resources = (book && Array.isArray(book.resources) ? book.resources : []).filter((r) => r && r.href && r.base64);
  const uuid = crypto.randomUUID();
  const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

  const chapFiles = chapters.map((c, i) => ({
    id: `chap${i + 1}`,
    href: `chap-${i + 1}.xhtml`,
    title: c.title || `Chapter ${i + 1}`,
    data: Buffer.from(chapterXhtml(c.title || title, c.body, lang), 'utf8'),
  }));

  const coverItem = book && book.cover && book.cover.base64
    ? { href: `images/cover.${/png/i.test(book.cover.mediaType || '') ? 'png' : 'jpg'}`, mediaType: book.cover.mediaType || 'image/jpeg', base64: book.cover.base64 }
    : null;

  const manifest = [
    '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
    '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
    '<item id="css" href="style.css" media-type="text/css"/>',
    ...(coverItem ? [`<item id="cover-img" href="${esc(coverItem.href)}" media-type="${esc(coverItem.mediaType)}" properties="cover-image"/>`] : []),
    ...chapFiles.map((c) => `<item id="${c.id}" href="${c.href}" media-type="application/xhtml+xml"/>`),
    ...resources.map((r, i) => `<item id="res${i + 1}" href="${esc(r.href)}" media-type="${esc(r.mediaType || 'image/png')}"/>`),
  ].join('\n    ');

  const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id" xml:lang="${esc(lang)}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">urn:uuid:${uuid}</dc:identifier>
    <dc:title>${esc(title)}</dc:title>
    <dc:language>${esc(lang)}</dc:language>
    <dc:creator>${esc(author)}</dc:creator>
    ${book && book.description ? `<dc:description>${esc(String(book.description).slice(0, 1000))}</dc:description>` : ''}
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>
    ${manifest}
  </manifest>
  <spine toc="ncx">
    ${chapFiles.map((c) => `<itemref idref="${c.id}"/>`).join('\n    ')}
  </spine>
</package>`;

  const nav = chapterXhtml('Contents', `<nav epub:type="toc" id="toc">
<h1>Contents</h1>
<ol>
${chapFiles.map((c) => `  <li><a href="${c.href}">${esc(c.title)}</a></li>`).join('\n')}
</ol>
</nav>`, lang);

  const ncx = `<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head><meta name="dtb:uid" content="urn:uuid:${uuid}"/></head>
  <docTitle><text>${esc(title)}</text></docTitle>
  <navMap>
${chapFiles.map((c, i) => `    <navPoint id="np${i + 1}" playOrder="${i + 1}"><navLabel><text>${esc(c.title)}</text></navLabel><content src="${c.href}"/></navPoint>`).join('\n')}
  </navMap>
</ncx>`;

  const container = `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`;

  const entries = [
    { name: 'mimetype', data: Buffer.from('application/epub+zip', 'ascii') }, // MUST be first + stored
    { name: 'META-INF/container.xml', data: Buffer.from(container, 'utf8') },
    { name: 'OEBPS/content.opf', data: Buffer.from(opf, 'utf8') },
    { name: 'OEBPS/nav.xhtml', data: Buffer.from(nav, 'utf8') },
    { name: 'OEBPS/toc.ncx', data: Buffer.from(ncx, 'utf8') },
    { name: 'OEBPS/style.css', data: Buffer.from(BOOK_CSS, 'utf8') },
    ...(coverItem ? [{ name: `OEBPS/${coverItem.href}`, data: Buffer.from(coverItem.base64, 'base64') }] : []),
    ...chapFiles.map((c) => ({ name: `OEBPS/${c.href}`, data: c.data })),
    ...resources.map((r) => ({ name: `OEBPS/${r.href}`, data: Buffer.from(r.base64, 'base64') })),
  ];
  return zipStore(entries);
}

module.exports = { buildEpub };
