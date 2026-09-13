"use strict";
function Api() {
    return require("../tl").Api;
}
const { opsi, log } = require("./options");
const Emoji = require("./premium-emoji");
const TTL_ANTRE = 120000;
const TTL_INLINE = 6 * 60 * 60 * 1000;
const TUNGGU_INLINE = 3000;
const KOSONG = { inline_keyboard: [] };
const BATAS_GAGAL = 3;
const JEDA_MATI = 5 * 60 * 1000;
const RE_BOT_MATI = /BOT_RESPONSE_TIMEOUT|BOT_INVALID|USER_BOT_INVALID|BOT_INLINE_DISABLED|USERNAME_NOT_OCCUPIED|USERNAME_INVALID|PEER_ID_INVALID/i;
const RE_CHAT_MATI = /CHAT_SEND_INLINE_FORBIDDEN|CHAT_WRITE_FORBIDDEN|CHAT_SEND_MEDIA_FORBIDDEN|CHAT_RESTRICTED|USER_BANNED_IN_CHANNEL|CHAT_ADMIN_REQUIRED|SLOWMODE_WAIT/i;
const JEDA_MATI_CHAT = 6 * 60 * 60 * 1000;
const antre = new Map();
const premium = new Map();
const petaInline = new Map();
const petaGanti = new Map();
const menunggu = new Map();
let botPeer = null;
let botPeerNama = null;
let gagalBeruntun = 0;
let matiSampai = 0;
let tanpaUmpan = 0;
let umpanMati = false;
const chatMati = new Map();
function alasanMati(peer) {
    if (opsi.inline === false)
        return "opsi inline dimatikan";
    if (!opsi.bot)
        return "bot belum dipasang";
    if (!opsi.botUsername)
        return "botUsername kosong";
    if (Date.now() < matiSampai)
        return `sedang jeda global sampai ${new Date(matiSampai).toLocaleTimeString()}`;
    if (peer === undefined || peer === null)
        return null;
    const sampai = chatMati.get(peerKey(peer));
    if (sampai && Date.now() < sampai)
        return `chat ${peerKey(peer)} ditandai bermasalah sampai ${new Date(sampai).toLocaleTimeString()}`;
    return null;
}
function aktif(peer) {
    return !alasanMati(peer);
}
function mediaAktif(peer) {
    return aktif(peer) && opsi.media !== false;
}
function tombolPancing(key) {
    return { inline_keyboard: [[{ text: opsi.tombolMuat || "tunggu sebentar...", callback_data: `prem:${key}` }]] };
}
function kunciBaru() {
    return "k" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function bersihkan() {
    const now = Date.now();
    for (const [k, v] of antre)
        if (now - v.dibuat > TTL_ANTRE)
            antre.delete(k);
    for (const [k, v] of premium)
        if (now - v.dibuat > TTL_ANTRE)
            premium.delete(k);
    for (const [k, v] of petaInline)
        if (now - v.dibuat > TTL_INLINE)
            petaInline.delete(k);
    for (const [k, v] of petaGanti)
        if (now - v.dibuat > TTL_INLINE)
            petaGanti.delete(k);
}
function ambil(key) {
    return antre.get(key) || null;
}
function catatGagal(err, peer) {
    const pesan = (err === null || err === void 0 ? void 0 : err.message) || "";
    if (RE_CHAT_MATI.test(pesan) && peer !== undefined && peer !== null) {
        const kunci = peerKey(peer);
        if (!chatMati.has(kunci)) {
            log().warn(`chat ${kunci} tidak mengizinkan jalur ini, balasan di sana memakai emoji biasa: ${pesan}`);
        }
        chatMati.set(kunci, Date.now() + JEDA_MATI_CHAT);
        return;
    }
    gagalBeruntun++;
    if (RE_BOT_MATI.test(pesan) || gagalBeruntun >= BATAS_GAGAL) {
        matiSampai = Date.now() + JEDA_MATI;
        gagalBeruntun = 0;
        log().warn(`premium emoji dimatikan sementara ${JEDA_MATI / 60000} menit: ${pesan}`);
    }
}
function statusChat(peer) {
    const sampai = chatMati.get(peerKey(peer));
    if (!sampai || Date.now() >= sampai)
        return null;
    return new Date(sampai);
}
function catatSukses() {
    gagalBeruntun = 0;
}
function peerKey(peer) {
    var _a, _b, _c;
    if (peer === null || peer === undefined)
        return "?";
    if (typeof peer === "string" || typeof peer === "number" || typeof peer === "bigint") {
        return String(peer).replace(/^-100/, "");
    }
    const v = (_c = (_b = (_a = peer.userId) !== null && _a !== void 0 ? _a : peer.channelId) !== null && _b !== void 0 ? _b : peer.chatId) !== null && _c !== void 0 ? _c : peer.id;
    return v ? String(v).replace(/^-100/, "") : "?";
}
const richDilewati = new Set();
function channelPeer(peer) {
    var _a;
    if (peer === null || peer === undefined)
        return false;
    if (typeof peer === "object") {
        if (/Channel/.test(peer.className || ((_a = peer.constructor) === null || _a === void 0 ? void 0 : _a.name) || ""))
            return true;
        return peer.channelId !== undefined;
    }
    return /^-100\d+$/.test(String(peer));
}
function richTanpaPancingan(peer) {
    if (opsi.mode === "on")
        return false;
    if (!channelPeer(peer))
        return false;
    const kunci = peerKey(peer);
    if (!richDilewati.has(kunci)) {
        richDilewati.add(kunci);
        log().info(`rich message ke supergrup ${kunci} dikirim langsung: di supergrup Telegram tidak memakai hak bot ` +
            "untuk custom emoji di dalam rich message, jadi pancingannya hanya menambah kedipan");
    }
    return true;
}
function kunciPesan(peer, id) {
    return `${peerKey(peer)}:${id}`;
}
function catatInline(key, inlineMessageId) {
    const tunggu = menunggu.get(key);
    if (typeof tunggu === "function") {
        menunggu.delete(key);
        tunggu(inlineMessageId);
        return;
    }
    menunggu.set(key, inlineMessageId);
}
function tungguInline(key, batas = TUNGGU_INLINE) {
    const sudah = menunggu.get(key);
    if (typeof sudah === "string") {
        menunggu.delete(key);
        return Promise.resolve(sudah);
    }
    return new Promise((resolve) => {
        menunggu.set(key, resolve);
        setTimeout(() => {
            if (menunggu.get(key) === resolve)
                menunggu.delete(key);
            resolve(null);
        }, batas);
    });
}
function daftarkanInline(peer, msgId, inlineMessageId, media) {
    if (!inlineMessageId || !msgId)
        return;
    petaInline.set(kunciPesan(peer, msgId), { inlineMessageId, media: !!media, dibuat: Date.now() });
}
function inlineIdDari(peer, msgId) {
    const v = petaInline.get(kunciPesan(peer, msgId));
    return v ? v.inlineMessageId : null;
}
function inlineMedia(peer, msgId) {
    const v = petaInline.get(kunciPesan(peer, msgId));
    return v ? v.media : false;
}
function lupakan(peer, msgId) {
    petaInline.delete(kunciPesan(peer, msgId));
    petaGanti.delete(kunciPesan(peer, msgId));
}
function catatGanti(peer, idLama, idBaru) {
    if (!idLama || !idBaru || idLama === idBaru)
        return;
    petaGanti.set(kunciPesan(peer, idLama), { id: idBaru, dibuat: Date.now() });
}
function gantiId(peer, idLama) {
    const v = petaGanti.get(kunciPesan(peer, idLama));
    return v ? v.id : null;
}
function adaPancingan(markup) {
    const baris = (markup === null || markup === void 0 ? void 0 : markup.inline_keyboard) || [];
    return baris.some((r) => r.some((b) => String((b === null || b === void 0 ? void 0 : b.callback_data) || "").startsWith("prem:")));
}
function pasangPancingan(hasil) {
    if (!aktif() || !Array.isArray(hasil))
        return hasil;
    return hasil.map((r) => {
        var _a;
        if (!r || typeof r !== "object" || !r.id)
            return r;
        if (adaPancingan(r.reply_markup))
            return r;
        const imc = r.input_message_content;
        const teks = typeof (imc === null || imc === void 0 ? void 0 : imc.message_text) === "string" ? imc.message_text : null;
        const caption = typeof r.caption === "string" ? r.caption : null;
        if (!teks && !caption)
            return r;
        premium.set(String(r.id), {
            teks,
            caption,
            markup: r.reply_markup || null,
            media: !teks,
            dibuat: Date.now(),
        });
        return Object.assign(Object.assign(Object.assign(Object.assign({}, r), (caption ? { caption: Emoji.plain(caption) } : {})), (teks ? { input_message_content: Object.assign(Object.assign({}, imc), { message_text: Emoji.plain(teks) }) } : {})), { reply_markup: {
                inline_keyboard: [
                    ...(((_a = r.reply_markup) === null || _a === void 0 ? void 0 : _a.inline_keyboard) || []),
                    [{ text: "⏳ Memuat…", callback_data: `prem:${r.id}` }],
                ],
            } });
    });
}
async function pancingHasilInline(client, peer, terkirim, resultId) {
    const isi = premium.get(String(resultId));
    if (!isi)
        return;
    premium.delete(String(resultId));
    const msgId = idDariUpdates(terkirim);
    if (!msgId)
        return;
    const inlineId = await umpanBalik(client, peer, msgId, String(resultId));
    if (!inlineId)
        return;
    daftarkanInline(peer, msgId, inlineId, isi.media);
    try {
        if (isi.media)
            await editCaptionViaBot(inlineId, isi.caption, isi.markup);
        else
            await editViaBot(inlineId, isi.teks, isi.markup);
    }
    catch (err) {
        log().warn(`gagal memasang premium emoji: ${err.message}`);
    }
}
async function pencetPancingan(client, peer, msgId, key) {
    if (!msgId)
        return;
    try {
        await client.invoke(new (Api()).messages.GetBotCallbackAnswer({
            peer,
            msgId,
            data: Buffer.from(`prem:${key}`, "utf8"),
        }));
    }
    catch (err) {
        if (!/BOT_RESPONSE_TIMEOUT|DATA_INVALID|MESSAGE_ID_INVALID/i.test((err === null || err === void 0 ? void 0 : err.message) || "")) {
            log().warn(`premium emoji tidak terpasang: ${err.message}`);
        }
    }
}
async function umpanBalik(client, peer, msgId, key) {
    if (umpanMati)
        return null;
    const tunggu = tungguInline(key);
    pencetPancingan(client, peer, msgId, key);
    const inlineId = await tunggu;
    if (inlineId) {
        tanpaUmpan = 0;
        return inlineId;
    }
    if (++tanpaUmpan >= BATAS_GAGAL) {
        umpanMati = true;
        log().warn("premium emoji tidak bisa dipasang, balasan memakai emoji biasa");
    }
    return null;
}
async function peerBotDari(client) {
    if (botPeer && botPeerNama === opsi.botUsername)
        return botPeer;
    botPeer = await client.getInputEntity(opsi.botUsername);
    botPeerNama = opsi.botUsername;
    return botPeer;
}
function idDariUpdates(hasil) {
    var _a, _b;
    const daftar = (hasil === null || hasil === void 0 ? void 0 : hasil.updates) || ((hasil === null || hasil === void 0 ? void 0 : hasil.update) ? [hasil.update] : []);
    for (const u of daftar) {
        const id = (_b = (_a = u === null || u === void 0 ? void 0 : u.message) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : u === null || u === void 0 ? void 0 : u.id;
        if (typeof id === "number")
            return id;
    }
    return null;
}
function balasanKe(replyTo) {
    var _a;
    const id = typeof replyTo === "object" ? (_a = replyTo === null || replyTo === void 0 ? void 0 : replyTo.replyToMsgId) !== null && _a !== void 0 ? _a : replyTo === null || replyTo === void 0 ? void 0 : replyTo.id : replyTo;
    if (!id)
        return {};
    try {
        return { replyTo: new (Api()).InputReplyToMessage({ replyToMsgId: Number(id) }) };
    }
    catch (_) {
        return { replyToMsgId: Number(id) };
    }
}
async function kirim(client, peer, { text, buttons, replyTo, silent, linkPreview } = {}) {
    var _a, _b;
    if (!aktif(peer) || typeof text !== "string" || !text.trim())
        return null;
    const bot = await peerBotDari(client);
    const key = kunciBaru();
    antre.set(key, { text, buttons: tombolPancing(key), linkPreview, polos: true, dibuat: Date.now() });
    bersihkan();
    const hasilInline = await client.invoke(new (Api()).messages.GetInlineBotResults({
        bot,
        peer,
        query: `kirim:${key}`,
        offset: "",
    }));
    const pilihan = ((_a = hasilInline === null || hasilInline === void 0 ? void 0 : hasilInline.results) === null || _a === void 0 ? void 0 : _a.find((r) => r.id === key)) || ((_b = hasilInline === null || hasilInline === void 0 ? void 0 : hasilInline.results) === null || _b === void 0 ? void 0 : _b[0]);
    if (!pilihan)
        throw new Error("bot tidak mengembalikan hasil");
    const terkirim = await client.invoke(new (Api()).messages.SendInlineBotResult(Object.assign({ peer, queryId: hasilInline.queryId, id: pilihan.id, hideVia: true, silent: !!silent }, balasanKe(replyTo))));
    antre.delete(key);
    catatSukses();
    const msgId = idDariUpdates(terkirim);
    const inlineId = await umpanBalik(client, peer, msgId, key);
    if (!inlineId) {
        await hapusPesan(client, peer, msgId);
        return null;
    }
    daftarkanInline(peer, msgId, inlineId, false);
    try {
        await editViaBot(inlineId, text, buttons, linkPreview);
    }
    catch (err) {
        log().warn(`gagal memasang premium emoji: ${err.message}`);
        await editViaBot(inlineId, Emoji.render(text, false), buttons, linkPreview).catch(() => { });
        await bersihkanTombol(inlineId, buttons);
    }
    return { id: msgId, peer, key, updates: terkirim, inlineId };
}
async function kirimMedia(client, peer, { file, caption, buttons, replyTo, silent, params } = {}) {
    var _a, _b;
    if (!mediaAktif(peer) || !file || !bisaUnggah(file))
        return null;
    const jenis = jenisMedia(params || {});
    const nama = (params === null || params === void 0 ? void 0 : params.fileName) || undefined;
    const fileId = await unggahMedia(file, jenis, nama);
    if (!fileId)
        return null;
    const bot = await peerBotDari(client);
    const key = kunciBaru();
    antre.set(key, { text: caption || "", fileId, jenis, nama, buttons: tombolPancing(key), polos: true, dibuat: Date.now() });
    bersihkan();
    const hasilInline = await client.invoke(new (Api()).messages.GetInlineBotResults({
        bot,
        peer,
        query: `media:${key}`,
        offset: "",
    }));
    const pilihan = ((_a = hasilInline === null || hasilInline === void 0 ? void 0 : hasilInline.results) === null || _a === void 0 ? void 0 : _a.find((r) => r.id === key)) || ((_b = hasilInline === null || hasilInline === void 0 ? void 0 : hasilInline.results) === null || _b === void 0 ? void 0 : _b[0]);
    if (!pilihan)
        throw new Error("bot tidak mengembalikan hasil untuk media");
    const terkirim = await client.invoke(new (Api()).messages.SendInlineBotResult(Object.assign({ peer, queryId: hasilInline.queryId, id: pilihan.id, hideVia: true, silent: !!silent }, balasanKe(replyTo))));
    antre.delete(key);
    catatSukses();
    const msgId = idDariUpdates(terkirim);
    const inlineId = await umpanBalik(client, peer, msgId, key);
    if (!inlineId) {
        await hapusPesan(client, peer, msgId);
        return null;
    }
    daftarkanInline(peer, msgId, inlineId, true);
    try {
        await editCaptionViaBot(inlineId, caption || "", buttons);
    }
    catch (err) {
        log().warn(`gagal memasang premium emoji di caption: ${err.message}`);
        await editCaptionViaBot(inlineId, Emoji.render(caption || "", false), buttons).catch(() => { });
        await bersihkanTombol(inlineId, buttons);
    }
    return { id: msgId, peer, key, updates: terkirim, inlineId };
}
function bersihkanRich(rich = {}) {
    const out = {};
    if (typeof rich.html === "string")
        out.html = rich.html;
    else if (typeof rich.markdown === "string")
        out.markdown = rich.markdown;
    else if (Array.isArray(rich.blocks))
        out.blocks = rich.blocks;
    if (rich.isRtl || rich.is_rtl)
        out.is_rtl = true;
    if (rich.media)
        out.media = rich.media;
    return out;
}
async function kirimRich(client, peer, { html, markdown, blocks, isRtl, media, buttons, replyTo, silent, cheat } = {}) {
    var _a, _b;
    if (!aktif(peer))
        throw new Error("rich message tidak bisa dikirim di chat ini (bot/izin chat)");
    if (cheat && richTanpaPancingan(peer))
        cheat = false;
    const rich = bersihkanRich({ html, markdown, blocks, isRtl, media });
    if (!rich.html && !rich.markdown && !rich.blocks)
        throw new Error("isi rich message kosong: pakai html, markdown, atau blocks");
    const bot = await peerBotDari(client);
    const key = kunciBaru();
    antre.set(key, {
        rich,
        buttons: cheat ? tombolPancing(key) : buttons || undefined,
        polos: !!cheat,
        dibuat: Date.now(),
    });
    bersihkan();
    const hasilInline = await client.invoke(new (Api()).messages.GetInlineBotResults({
        bot,
        peer,
        query: `rich:${key}`,
        offset: "",
    }));
    const pilihan = ((_a = hasilInline === null || hasilInline === void 0 ? void 0 : hasilInline.results) === null || _a === void 0 ? void 0 : _a.find((r) => r.id === key)) || ((_b = hasilInline === null || hasilInline === void 0 ? void 0 : hasilInline.results) === null || _b === void 0 ? void 0 : _b[0]);
    if (!pilihan)
        throw new Error("bot tidak mengembalikan hasil untuk rich message");
    const terkirim = await client.invoke(new (Api()).messages.SendInlineBotResult(Object.assign({ peer, queryId: hasilInline.queryId, id: pilihan.id, hideVia: true, silent: !!silent }, balasanKe(replyTo))));
    antre.delete(key);
    catatSukses();
    const msgId = idDariUpdates(terkirim);
    if (!cheat)
        return { id: msgId, peer, key, updates: terkirim };
    const inlineId = await umpanBalik(client, peer, msgId, key);
    if (!inlineId) {
        await hapusPesan(client, peer, msgId);
        throw new Error("premium emoji tidak bisa dipasang; kirim ulang tanpa cheat_premium_emojis");
    }
    daftarkanInline(peer, msgId, inlineId, false);
    await editRichViaBot(inlineId, rich, buttons).catch(async (err) => {
        log().warn(`gagal memasang premium emoji di rich message: ${err.message}`);
        await bersihkanTombol(inlineId, buttons);
    });
    return { id: msgId, peer, key, updates: terkirim, inlineId };
}
async function editRichViaBot(inlineMessageId, rich, buttons) {
    return await opsi.bot.telegram.callApi("editMessageText", {
        inline_message_id: inlineMessageId,
        rich_message: bersihkanRich(rich),
        reply_markup: buttons || KOSONG,
    });
}
async function editViaBot(inlineMessageId, text, buttons, linkPreview) {
    return await opsi.bot.telegram.editMessageText(undefined, undefined, inlineMessageId, text, Object.assign(Object.assign({ parse_mode: "HTML" }, (linkPreview === false ? { link_preview_options: { is_disabled: true } } : {})), { reply_markup: buttons || KOSONG }));
}
async function hapusPesan(client, peer, msgId) {
    if (!msgId)
        return;
    try {
        await client.deleteMessages(peer, [msgId], { revoke: true });
    }
    catch (_) { }
}
async function bersihkanTombol(inlineMessageId, buttons) {
    if (!inlineMessageId || buttons)
        return;
    try {
        await opsi.bot.telegram.editMessageReplyMarkup(undefined, undefined, inlineMessageId, KOSONG);
    }
    catch (_) { }
}
async function editCaptionViaBot(inlineMessageId, caption, buttons) {
    return await opsi.bot.telegram.editMessageCaption(undefined, undefined, inlineMessageId, caption, {
        parse_mode: "HTML",
        reply_markup: buttons || KOSONG,
    });
}
function jenisDariIsi(buf) {
    if (!Buffer.isBuffer(buf) || buf.length < 12)
        return null;
    const h = buf.subarray(0, 12);
    if (h[0] === 0xff && h[1] === 0xd8 && h[2] === 0xff)
        return "photo";
    if (h[0] === 0x89 && h.subarray(1, 4).toString() === "PNG")
        return "photo";
    if (h.subarray(0, 3).toString() === "GIF")
        return "gif";
    if (h.subarray(0, 4).toString() === "RIFF" && h.subarray(8, 12).toString() === "WEBP")
        return "photo";
    if (h.subarray(4, 8).toString() === "ftyp")
        return "video";
    if (h.subarray(0, 4).toString() === "OggS")
        return "voice";
    if (h.subarray(0, 3).toString() === "ID3")
        return "audio";
    if (h[0] === 0xff && (h[1] & 0xe0) === 0xe0)
        return "audio";
    return null;
}
function jenisMedia(params = {}) {
    if (params.voiceNote)
        return "voice";
    if (params.videoNote)
        return "video";
    if (params.forceDocument)
        return "document";
    const nama = String(params.fileName || (typeof params.file === "string" ? params.file : "") || "").toLowerCase();
    if (/\.(jpe?g|png|webp|bmp)$/.test(nama))
        return "photo";
    if (/\.(mp4|mov|mkv|webm)$/.test(nama))
        return "video";
    if (/\.gif$/.test(nama))
        return "gif";
    if (/\.(mp3|m4a|flac|wav)$/.test(nama))
        return "audio";
    if (/\.(ogg|oga|opus)$/.test(nama))
        return "voice";
    return jenisDariIsi(params.file) || "document";
}
function bisaUnggah(file) {
    return Buffer.isBuffer(file) || (typeof file === "string" && file.length > 0);
}
async function unggahMedia(file, jenis, namaFile) {
    var _a, _b, _c, _d, _e, _f, _g;
    const tujuan = opsi.mediaChatId || opsi.ownerId || opsi.userId;
    if (!tujuan || !opsi.bot)
        return null;
    const tg = opsi.bot.telegram;
    const kirimFile = {
        photo: (f) => tg.sendPhoto(tujuan, f),
        video: (f) => tg.sendVideo(tujuan, f),
        audio: (f) => tg.sendAudio(tujuan, f),
        voice: (f) => tg.sendVoice(tujuan, f),
        gif: (f) => tg.sendAnimation(tujuan, f),
        document: (f) => tg.sendDocument(tujuan, f),
    }[jenis] || ((f) => tg.sendDocument(tujuan, f));
    const isi = Buffer.isBuffer(file)
        ? { source: file, filename: namaFile || "file" }
        : typeof file === "string" && /^https?:\/\//i.test(file)
            ? { url: file }
            : { source: file };
    const pesan = await kirimFile(isi);
    const fileId = ((_b = (_a = pesan.photo) === null || _a === void 0 ? void 0 : _a[pesan.photo.length - 1]) === null || _b === void 0 ? void 0 : _b.file_id) ||
        ((_c = pesan.video) === null || _c === void 0 ? void 0 : _c.file_id) ||
        ((_d = pesan.audio) === null || _d === void 0 ? void 0 : _d.file_id) ||
        ((_e = pesan.voice) === null || _e === void 0 ? void 0 : _e.file_id) ||
        ((_f = pesan.animation) === null || _f === void 0 ? void 0 : _f.file_id) ||
        ((_g = pesan.document) === null || _g === void 0 ? void 0 : _g.file_id) ||
        null;
    tg.deleteMessage(tujuan, pesan.message_id).catch(() => { });
    return fileId;
}
module.exports = {
    channelPeer,
    aktif,
    mediaAktif,
    ambil,
    catatGagal,
    statusChat,
    alasanMati,
    catatInline,
    pasangPancingan,
    pancingHasilInline,
    kirim,
    kirimMedia,
    kirimRich,
    editRichViaBot,
    bersihkanRich,
    editViaBot,
    editCaptionViaBot,
    daftarkanInline,
    inlineIdDari,
    inlineMedia,
    lupakan,
    catatGanti,
    gantiId,
    jenisMedia,
    bisaUnggah,
};
