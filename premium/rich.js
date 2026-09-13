"use strict";
function esc(t) {
    return String(t !== null && t !== void 0 ? t : "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
const b = (t) => `<b>${t}</b>`;
const i = (t) => `<i>${t}</i>`;
const u = (t) => `<u>${t}</u>`;
const s = (t) => `<s>${t}</s>`;
const code = (t) => `<code>${t}</code>`;
const mark = (t) => `<mark>${t}</mark>`;
const spoiler = (t) => `<tg-spoiler>${t}</tg-spoiler>`;
const sub = (t) => `<sub>${t}</sub>`;
const sup = (t) => `<sup>${t}</sup>`;
const math = (t) => `<code class="language-math">${t}</code>`;
const h1 = (t) => `<h1>${t}</h1>`;
const h2 = (t) => `<h2>${t}</h2>`;
const h3 = (t) => `<h3>${t}</h3>`;
const h4 = (t) => `<h4>${t}</h4>`;
const p = (t) => `<p>${t}</p>`;
const hr = () => "<hr/>";
const footer = (t) => `<footer>${t}</footer>`;
const anchor = (nama) => `<a name="${esc(nama)}"></a>`;
function a(teks, url) {
    return `<a href="${esc(url)}">${teks}</a>`;
}
function pre(kode, bahasa) {
    if (bahasa)
        return `<pre><code class="language-${esc(bahasa)}">${esc(kode)}</code></pre>`;
    return `<pre>${esc(kode)}</pre>`;
}
function blockquote(teks, cite) {
    return cite ? `<blockquote>${teks}<cite>${cite}</cite></blockquote>` : `<blockquote>${teks}</blockquote>`;
}
function expandable(teks, cite) {
    return cite
        ? `<blockquote expandable>${teks}<cite>${cite}</cite></blockquote>`
        : `<blockquote expandable>${teks}</blockquote>`;
}
function aside(teks, cite) {
    return cite ? `<aside>${teks}<cite>${cite}</cite></aside>` : `<aside>${teks}</aside>`;
}
function details(ringkasan, isi, terbuka) {
    return `<details${terbuka ? " open" : ""}><summary>${ringkasan}</summary>${isi}</details>`;
}
function ul(item) {
    return `<ul>${item.map((x) => `<li>${x}</li>`).join("")}</ul>`;
}
function ol(item) {
    return `<ol>${item.map((x) => `<li>${x}</li>`).join("")}</ol>`;
}
function checklist(item) {
    const baris = item.map((x) => {
        const teks = typeof x === "string" ? x : x.text;
        const dicentang = typeof x === "string" ? false : !!x.checked;
        return `<li><input type="checkbox"${dicentang ? " checked" : ""}>${teks}</li>`;
    });
    return `<ul>${baris.join("")}</ul>`;
}
function table(kepala, baris, { bordered = true, striped = false, compact = false } = {}) {
    const atribut = [
        bordered ? "" : ' data-bordered="false"',
        striped ? ' data-striped="true"' : "",
        compact ? ' data-compact="true"' : "",
    ].join("");
    const th = (kepala === null || kepala === void 0 ? void 0 : kepala.length) ? `<tr>${kepala.map((x) => `<th>${x}</th>`).join("")}</tr>` : "";
    const td = (baris || []).map((r) => `<tr>${r.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("");
    return `<table${atribut}>${th}${td}</table>`;
}
function thinking(teks) {
    return `<tg-thinking>${teks}</tg-thinking>`;
}
function mathBlock(latex) {
    return `<tg-math-block>${esc(latex)}</tg-math-block>`;
}
function button({ text, url, callback, style, disabled } = {}) {
    if (callback && !url && !disabled) {
        throw new Error("tombol callback ditolak Telegram di mode html (BUTTON_URL_INVALID) — pakai blok: rich.blok.tombol([...])");
    }
    const atribut = [];
    if (disabled)
        atribut.push('type="disabled"');
    else if (url)
        atribut.push(`type="url" url="${esc(url)}"`);
    if (style)
        atribut.push(`style="${esc(style)}"`);
    return `<tg-button ${atribut.join(" ")}>${text}</tg-button>`;
}
function buttonRow(tombol, align) {
    const isi = (Array.isArray(tombol) ? tombol : [tombol])
        .map((t) => (typeof t === "string" ? t : button(t)))
        .join("");
    return `<tg-button-row${align ? ` align="${esc(align)}"` : ""}>${isi}</tg-button-row>`;
}
const TAG_TUNGGAL = new Set(["img"]);
function media(tag, src, { caption, alt } = {}) {
    const atribut = `src="${esc(src)}"${alt ? ` alt="${esc(alt)}"` : ""}`;
    const isi = TAG_TUNGGAL.has(tag) ? `<${tag} ${atribut}/>` : `<${tag} ${atribut}></${tag}>`;
    return caption ? `<figure>${isi}<figcaption>${caption}</figcaption></figure>` : isi;
}
const img = (src, opsi) => media("img", src, opsi);
const video = (src, opsi) => media("video", src, opsi);
const animation = (src, opsi) => media("video", src, opsi);
const audio = (src, opsi) => media("audio", src, opsi);
const voice = (src, opsi) => media("audio", src, opsi);
function document_(id, teks) {
    return `<tg-document id="${esc(id)}">${teks || ""}</tg-document>`;
}
function collage(isi, caption) {
    const blok = `<tg-collage>${isi.join("")}</tg-collage>`;
    return caption ? `<figure>${blok}<figcaption>${caption}</figcaption></figure>` : blok;
}
function slideshow(isi, caption) {
    const blok = `<tg-slideshow>${isi.join("")}</tg-slideshow>`;
    return caption ? `<figure>${blok}<figcaption>${caption}</figcaption></figure>` : blok;
}
function peta({ latitude, longitude, zoom, width, height, caption } = {}) {
    const atribut = [
        `latitude="${Number(latitude)}"`,
        `longitude="${Number(longitude)}"`,
        zoom ? `zoom="${Number(zoom)}"` : "",
        width ? `width="${Number(width)}"` : "",
        height ? `height="${Number(height)}"` : "",
    ].filter(Boolean).join(" ");
    const blok = `<tg-map ${atribut}></tg-map>`;
    return caption ? `<figure>${blok}<figcaption>${caption}</figcaption></figure>` : blok;
}
const blok = {
    judul: (teks, ukuran = 2) => ({ type: "heading", text: teks, size: ukuran }),
    paragraf: (teks) => ({ type: "paragraph", text: teks }),
    pemisah: () => ({ type: "divider" }),
    kaki: (teks) => ({ type: "footer", text: teks }),
    kutipan: (teks, bisaDibuka) => ({ type: bisaDibuka ? "expandable_block_quotation" : "block_quotation", text: teks }),
    praformat: (teks, bahasa) => (Object.assign({ type: "preformatted", text: teks }, (bahasa ? { language: bahasa } : {}))),
    daftar: (item, bernomor) => ({
        type: "list",
        is_ordered: !!bernomor,
        items: item.map((x) => (typeof x === "string" ? { blocks: [{ type: "paragraph", text: x }] } : x)),
    }),
    tabel: (kepala, baris, pilihan = {}) => (Object.assign(Object.assign(Object.assign({ type: "table", cells: [
            ...((kepala === null || kepala === void 0 ? void 0 : kepala.length) ? [kepala.map((t) => ({ text: t, is_header: true }))] : []),
            ...(baris || []).map((r) => r.map((t) => ({ text: t }))),
        ] }, (pilihan.bordered === false ? {} : { is_bordered: true })), (pilihan.striped ? { is_striped: true } : {})), (pilihan.compact ? { is_compact: true } : {}))),
    tombol: (daftar, align) => (Object.assign({ type: "buttons", buttons: (Array.isArray(daftar) ? daftar : [daftar]).map((t) => (Object.assign(Object.assign({ text: t.text }, (t.disabled ? { disabled: {} } : t.callback ? { callback_data: t.callback } : { url: t.url })), (t.style ? { style: t.style } : {})))) }, (align ? { align } : {}))),
};
function gabung(...bagian) {
    return bagian.flat().filter(Boolean).join("");
}
module.exports = {
    esc,
    b, i, u, s, code, mark, spoiler, sub, sup, math,
    h1, h2, h3, h4, p, hr, footer, anchor,
    a, pre, blockquote, expandable, aside, details,
    ul, ol, checklist, table, gabung,
    thinking, mathBlock, button, buttonRow,
    img, video, animation, audio, voice, collage, slideshow, peta,
    document: document_,
    blok,
};
