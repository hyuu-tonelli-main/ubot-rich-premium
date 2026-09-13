"use strict";
const Data = require("./emoji-data");
const { palette, aliases, social, socialFallback } = Data;
const aliasByName = new Map();
for (const a of aliases)
    aliasByName.set(a.name, a);
const aliasById = new Map();
for (const a of aliases)
    if (!aliasById.has(a.id))
        aliasById.set(a.id, a);
const MAX_EMOJI_CP = Object.keys(palette).reduce((max, e) => Math.max(max, Array.from(e).length), 1);
const ZWJ = "‍";
const VS16 = "️";
const MAX_CUSTOM_EMOJI = 100;
const SKIP_TAGS = ["tg-emoji", "pre", "code", "tg-plain"];
const MUNGKIN_EMOJI = /[\p{Extended_Pictographic}\p{Regional_Indicator}0-9#*\u2190-\u21FF\u2B00-\u2BFF]/u;
const RE_EMOJI_TAG = /<tg-emoji[^>]*>([\s\S]*?)<\/tg-emoji>/g;
const RE_PLAIN_TAG = /<\/?tg-plain>/gi;
const RE_ALIAS = /:([a-z][a-z0-9_]{1,20}):/g;
function emo(emoji) {
    const hit = lookup(emoji);
    if (!hit)
        return emoji;
    return tag(hit[0], hit[1]);
}
function emoCustom(id, fallback) {
    if (!id || !String(id).trim())
        return fallback || "";
    return tag(String(id).trim(), fallback);
}
function emoAlias(name) {
    const a = aliasByName.get(String(name || "").toLowerCase());
    if (!a)
        return "";
    return tag(a.id, a.fallback);
}
function emoSocial(name) {
    const id = social[String(name || "").toLowerCase()];
    if (!id)
        return "";
    return tag(id, socialFallback);
}
function carStrip() {
    return Data.carStrip.map(id => tag(id, Data.carStripFallback)).join("");
}
function faceBlock() {
    return Data.faceBlock
        .map((id, i) => (i === 3 ? "\n" : "") + tag(id, Data.faceBlockFallback))
        .join("");
}
function tag(id, fallback) {
    return `<tg-emoji emoji-id="${id}">${fallback}</tg-emoji>`;
}
function lookup(emoji) {
    if (palette[emoji])
        return palette[emoji];
    if (palette[emoji + VS16])
        return palette[emoji + VS16];
    const bare = emoji.endsWith(VS16) ? emoji.slice(0, -VS16.length) : emoji;
    return palette[bare] || null;
}
function resolveAliases(text) {
    if (!text || !String(text).includes(":"))
        return text;
    return walkText(String(text), gantiAlias);
}
function gantiAlias(run) {
    return run.replace(RE_ALIAS, (m, name) => {
        const a = aliasByName.get(name);
        return a ? tag(a.id, a.fallback) : m;
    });
}
function aliasToFallback(text) {
    if (!text || !String(text).includes(":"))
        return text;
    return walkText(String(text), (run) => run.replace(RE_ALIAS, (m, name) => {
        const a = aliasByName.get(name);
        return a ? a.fallback : m;
    }));
}
function aliasInfo(name) {
    return aliasByName.get(String(name || "").toLowerCase()) || null;
}
function aliasListByGroup() {
    const groups = new Map();
    for (const a of aliases) {
        if (!groups.has(a.group))
            groups.set(a.group, []);
        groups.get(a.group).push(a);
    }
    return groups;
}
function emojiById(id) {
    const key = String(id);
    for (const e of Object.keys(palette)) {
        if (palette[e][0] === key)
            return palette[e][1];
    }
    const a = aliasById.get(key);
    if (a)
        return a.fallback;
    return "";
}
function upgrade(html) {
    if (!html)
        return html;
    return walkText(String(html), naikkanEmoji);
}
function walkText(s, fn) {
    const lower = s.toLowerCase();
    let out = "";
    let i = 0;
    let teks = 0;
    while (i < s.length) {
        if (s[i] !== "<") {
            i++;
            continue;
        }
        out += fn(s.slice(teks, i));
        let end = s.indexOf(">", i);
        end = end < 0 ? s.length : end + 1;
        const tagText = s.slice(i, end);
        out += tagText;
        i = end;
        const skip = skippableTag(tagText);
        if (skip) {
            const closing = `</${skip}>`;
            const at = lower.indexOf(closing, i);
            if (at >= 0) {
                out += s.slice(i, at + closing.length);
                i = at + closing.length;
            }
        }
        teks = i;
    }
    return out + fn(s.slice(teks));
}
function naikkanEmoji(s) {
    let out = "";
    let i = 0;
    while (i < s.length) {
        const code = s.codePointAt(i);
        const size = code > 0xffff ? 2 : 1;
        if (!MUNGKIN_EMOJI.test(String.fromCodePoint(code))) {
            out += s.slice(i, i + size);
            i += size;
            continue;
        }
        const hit = matchPalette(s, i);
        if (hit) {
            out += tag(hit.id, hit.fallback);
            i = hit.end;
            continue;
        }
        const j = skipCluster(s, i);
        out += s.slice(i, j);
        i = j;
    }
    return out;
}
function matchPalette(s, i) {
    const batas = [];
    let j = i;
    for (let n = 0; n < MAX_EMOJI_CP && j < s.length; n++) {
        const c = s.codePointAt(j);
        j += c > 0xffff ? 2 : 1;
        batas.push(j);
    }
    for (let n = batas.length - 1; n >= 0; n--) {
        const end = batas[n];
        const hit = palette[s.slice(i, end)];
        if (!hit)
            continue;
        if (s[end] === ZWJ)
            continue;
        return { end, id: hit[0], fallback: hit[1] };
    }
    return null;
}
function skipCluster(s, i) {
    const code = s.codePointAt(i);
    let j = i + (code > 0xffff ? 2 : 1);
    while (s[j] === VS16)
        j++;
    while (s[j] === ZWJ && j + 1 < s.length) {
        j++;
        const next = s.codePointAt(j);
        j += next > 0xffff ? 2 : 1;
        while (s[j] === VS16)
            j++;
    }
    return j;
}
function skippableTag(tagText) {
    if (tagText.endsWith("/>"))
        return "";
    const lower = tagText.toLowerCase();
    for (const name of SKIP_TAGS) {
        if (lower.startsWith(`<${name}>`) || lower.startsWith(`<${name} `))
            return name;
    }
    return "";
}
function plain(html) {
    if (!html)
        return html;
    return `<tg-plain>${html}</tg-plain>`;
}
function unwrapPlain(html) {
    if (!html || !html.includes("tg-plain"))
        return html;
    return String(html).replace(RE_PLAIN_TAG, "");
}
function strip(html) {
    if (!html)
        return html;
    return String(html).replace(RE_EMOJI_TAG, "$1");
}
function countCustom(html) {
    if (!html)
        return 0;
    return (String(html).match(/<tg-emoji/g) || []).length;
}
function hasCustom(html) {
    return countCustom(html) > 0;
}
function capCustom(html, max = MAX_CUSTOM_EMOJI) {
    if (!html || countCustom(html) <= max)
        return html;
    let seen = 0;
    return String(html).replace(RE_EMOJI_TAG, (m, inner) => {
        seen++;
        return seen <= max ? m : inner;
    });
}
function ensure(html, marker = "💠") {
    const upgraded = upgrade(html);
    if (hasCustom(upgraded))
        return upgraded;
    return emo(marker) + " " + upgraded;
}
function nodes(teks) {
    if (typeof teks !== "string" || !teks)
        return teks;
    const naik = upgrade(teks);
    if (!naik.includes("<tg-emoji"))
        return teks;
    const keluar = [];
    let akhir = 0;
    for (const m of naik.matchAll(/<tg-emoji emoji-id="(\d+)">([^<]*)<\/tg-emoji>/g)) {
        if (m.index > akhir)
            keluar.push(naik.slice(akhir, m.index));
        keluar.push({ type: "custom_emoji", custom_emoji_id: m[1], alternative_text: m[2] });
        akhir = m.index + m[0].length;
    }
    if (akhir < naik.length)
        keluar.push(naik.slice(akhir));
    return keluar;
}
function blokPremium(blok) {
    if (Array.isArray(blok))
        return blok.map(blokPremium);
    if (!blok || typeof blok !== "object")
        return blok;
    const keluar = Object.assign({}, blok);
    if (typeof keluar.text === "string")
        keluar.text = nodes(keluar.text);
    if (Array.isArray(keluar.blocks))
        keluar.blocks = keluar.blocks.map(blokPremium);
    if (Array.isArray(keluar.items))
        keluar.items = keluar.items.map(blokPremium);
    if (Array.isArray(keluar.buttons))
        keluar.buttons = keluar.buttons.map(blokPremium);
    if (Array.isArray(keluar.cells))
        keluar.cells = keluar.cells.map((baris) => baris.map(blokPremium));
    if (keluar.caption && typeof keluar.caption === "object")
        keluar.caption = blokPremium(keluar.caption);
    return keluar;
}
function render(html, premium = true) {
    if (html === null || html === undefined)
        return html;
    const text = String(html);
    if (!text)
        return text;
    if (!premium) {
        return strip(unwrapPlain(aliasToFallback(text)));
    }
    return capCustom(unwrapPlain(upgrade(resolveAliases(text))));
}
module.exports = {
    emo,
    emoCustom,
    emoAlias,
    emoSocial,
    carStrip,
    faceBlock,
    resolveAliases,
    aliasToFallback,
    aliasInfo,
    aliasList: () => aliases.slice(),
    aliasListByGroup,
    emojiById,
    upgrade,
    nodes,
    blokPremium,
    strip,
    plain,
    unwrapPlain,
    capCustom,
    ensure,
    render,
    countCustom,
    hasCustom,
    MAX_CUSTOM_EMOJI,
};
