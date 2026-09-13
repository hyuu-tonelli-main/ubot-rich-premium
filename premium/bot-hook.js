"use strict";
const Inline = require("./inline-send");
const Emoji = require("./premium-emoji");
const { opsi } = require("./options");
function teksMuat() {
    return Emoji.plain(opsi.teksMuat || "Memuat");
}
function pasang(bot) {
    if (!bot || bot.__kafkagramHook)
        return bot;
    bot.__kafkagramHook = true;
    bot.use(async (ctx, next) => {
        var _a;
        const q = ctx.inlineQuery;
        if (q && typeof q.query === "string") {
            if (q.query.startsWith("kirim:"))
                return await jawabTeks(ctx, q.query.slice(6).trim());
            if (q.query.startsWith("media:"))
                return await jawabMedia(ctx, q.query.slice(6).trim());
            if (q.query.startsWith("rich:"))
                return await jawabRich(ctx, q.query.slice(5).trim());
            const dari = ((_a = q.from) === null || _a === void 0 ? void 0 : _a.id) ? String(q.from.id) : null;
            const sah = [opsi.userId, opsi.ownerId].filter(Boolean).map(String);
            if (dari && (sah.length === 0 || sah.includes(dari))) {
                const asli = ctx.answerInlineQuery.bind(ctx);
                ctx.answerInlineQuery = (hasil, extra) => asli(Inline.pasangPancingan(hasil), extra);
            }
        }
        const cb = ctx.callbackQuery;
        if (cb && typeof cb.data === "string" && cb.data.startsWith("prem:")) {
            if (cb.inline_message_id)
                Inline.catatInline(cb.data.slice(5), cb.inline_message_id);
            return await ctx.answerCbQuery().catch(() => { });
        }
        return next();
    });
    return bot;
}
async function jawabTeks(ctx, kunci) {
    const isi = Inline.ambil(kunci);
    if (!isi)
        return await ctx.answerInlineQuery([], { cache_time: 0 });
    return await ctx.answerInlineQuery([Object.assign({ type: "article", id: kunci, title: opsi.botUsername || "kafkagram", input_message_content: Object.assign({ message_text: isi.polos ? teksMuat() : isi.text, parse_mode: "HTML" }, (isi.linkPreview === false ? { link_preview_options: { is_disabled: true } } : {})) }, (isi.buttons ? { reply_markup: isi.buttons } : {}))], { cache_time: 0 });
}
async function jawabRich(ctx, kunci) {
    const isi = Inline.ambil(kunci);
    if (!isi || !isi.rich)
        return await ctx.answerInlineQuery([], { cache_time: 0 });
    const rich = isi.polos ? { html: `<p>${teksMuat()}</p>` } : Object.assign({}, isi.rich);
    return await ctx.answerInlineQuery([Object.assign({ type: "article", id: kunci, title: opsi.botUsername || "kafkagram", input_message_content: { rich_message: rich } }, (isi.buttons ? { reply_markup: isi.buttons } : {}))], { cache_time: 0 });
}
async function jawabMedia(ctx, kunci) {
    const isi = Inline.ambil(kunci);
    if (!isi || !isi.fileId)
        return await ctx.answerInlineQuery([], { cache_time: 0 });
    const dasar = Object.assign(Object.assign({ id: kunci }, (isi.polos || isi.text ? { caption: isi.polos ? teksMuat() : isi.text, parse_mode: "HTML" } : {})), (isi.buttons ? { reply_markup: isi.buttons } : {}));
    const hasil = {
        photo: Object.assign(Object.assign({}, dasar), { type: "photo", photo_file_id: isi.fileId }),
        video: Object.assign(Object.assign({}, dasar), { type: "video", video_file_id: isi.fileId }),
        audio: Object.assign(Object.assign({}, dasar), { type: "audio", audio_file_id: isi.fileId }),
        voice: Object.assign(Object.assign({}, dasar), { type: "voice", voice_file_id: isi.fileId }),
        gif: Object.assign(Object.assign({}, dasar), { type: "gif", gif_file_id: isi.fileId }),
        document: Object.assign(Object.assign({}, dasar), { type: "document", document_file_id: isi.fileId, title: isi.nama || "file" }),
    }[isi.jenis] || Object.assign(Object.assign({}, dasar), { type: "document", document_file_id: isi.fileId, title: isi.nama || "file" });
    return await ctx.answerInlineQuery([hasil], { cache_time: 0 });
}
module.exports = { pasang };
