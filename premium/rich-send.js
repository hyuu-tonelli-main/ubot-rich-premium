"use strict";
const Emoji = require("./premium-emoji");
const State = require("./premium-state");
const Inline = require("./inline-send");
const { opsi, log } = require("./options");
let HTMLParser;
function htmlParser() {
    if (HTMLParser === undefined) {
        try {
            HTMLParser = require("../extensions/html").HTMLParser;
        }
        catch (_) {
            HTMLParser = null;
        }
    }
    return HTMLParser;
}
const RE_EMOJI_ERROR = /premium|custom.?emoji|EMOJI_INVALID|EMOJI_NOT_MODIFIED|documentId|expected bigInt/i;
const RE_TAG_HTML = /<(b|strong|i|em|u|s|del|code|pre|a|blockquote|tg-emoji|tg-spoiler)\b/i;
function isHtml(client, parseMode) {
    if (parseMode === false || parseMode === null)
        return false;
    if (typeof parseMode === "string")
        return /^html$/i.test(parseMode.trim());
    if (parseMode && typeof parseMode === "object")
        return !!htmlParser() && parseMode === htmlParser();
    const def = client === null || client === void 0 ? void 0 : client.parseMode;
    if (!def)
        return false;
    return !!htmlParser() && def === htmlParser();
}
function prep(text, premium) {
    if (typeof text !== "string" || !text)
        return text;
    return Emoji.render(text, premium);
}
function tombolBotApi(buttons) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!buttons)
        return undefined;
    if (buttons.inline_keyboard)
        return buttons;
    if ((_a = buttons.reply_markup) === null || _a === void 0 ? void 0 : _a.inline_keyboard)
        return buttons.reply_markup;
    const baris = Array.isArray(buttons) ? buttons : [buttons];
    const keyboard = [];
    for (const r of baris) {
        const kolom = Array.isArray(r) ? r : [r];
        const isi = [];
        for (const b of kolom) {
            const teks = (_b = b === null || b === void 0 ? void 0 : b.text) !== null && _b !== void 0 ? _b : (_c = b === null || b === void 0 ? void 0 : b.button) === null || _c === void 0 ? void 0 : _c.text;
            const url = (_d = b === null || b === void 0 ? void 0 : b.url) !== null && _d !== void 0 ? _d : (_e = b === null || b === void 0 ? void 0 : b.button) === null || _e === void 0 ? void 0 : _e.url;
            const data = (_g = (_f = b === null || b === void 0 ? void 0 : b.callback_data) !== null && _f !== void 0 ? _f : b === null || b === void 0 ? void 0 : b.data) !== null && _g !== void 0 ? _g : (_h = b === null || b === void 0 ? void 0 : b.button) === null || _h === void 0 ? void 0 : _h.data;
            if (!teks)
                return null;
            if (url)
                isi.push({ text: teks, url });
            else if (data !== undefined && data !== null) {
                isi.push({ text: teks, callback_data: Buffer.isBuffer(data) ? data.toString("utf8") : String(data) });
            }
            else
                return null;
        }
        keyboard.push(isi);
    }
    return { inline_keyboard: keyboard };
}
const KUNCI_CHEAT = ["cheat_premium_emojis", "cheatPremiumEmojis"];
function cheatAktif(params) {
    for (const k of KUNCI_CHEAT) {
        if (params && params[k] !== undefined)
            return params[k] === true;
    }
    return opsi.cheatPremiumEmojis === true;
}
function tanpaCheat(params) {
    if (!params || typeof params !== "object")
        return params;
    if (!KUNCI_CHEAT.some((k) => k in params))
        return params;
    const out = Object.assign({}, params);
    for (const k of KUNCI_CHEAT)
        delete out[k];
    return out;
}
function layakInline(params, teks, htmlEksplisit, peer) {
    const tolak = (alasan) => {
        if (opsi.debug)
            log().info(`premium emoji dilewati (${alasan})`);
        return false;
    };
    const mati = Inline.alasanMati(peer);
    if (mati)
        return tolak(mati);
    if (typeof teks !== "string" || !teks.trim())
        return tolak("teks kosong");
    if (params.formattingEntities)
        return tolak("pakai formattingEntities sendiri");
    if (params.file)
        return tolak("ada file di params");
    if (teks.trimStart().startsWith("/"))
        return tolak("teks diawali /");
    if (!htmlEksplisit && !RE_TAG_HTML.test(teks))
        return tolak("bukan HTML");
    return true;
}
function bungkus(client, peer, hasil) {
    return {
        id: hasil.id,
        chatId: peer,
        viaInline: true,
        inlineKey: hasil.key,
        updates: hasil.updates,
        async edit(params = {}) {
            return await client.editMessage(peer, Object.assign({ message: hasil.id }, params));
        },
        async delete() {
            return await client.deleteMessages(peer, [hasil.id], { revoke: true });
        },
    };
}
function idPesan(nilai) {
    var _a;
    if (typeof nilai === "number")
        return nilai;
    if (typeof nilai === "string" && /^\d+$/.test(nilai))
        return Number(nilai);
    return (_a = nilai === null || nilai === void 0 ? void 0 : nilai.id) !== null && _a !== void 0 ? _a : null;
}
function installUserbot(client) {
    if (!client || client.__kafkagram)
        return client;
    client.__kafkagram = true;
    const asli = {
        sendMessage: client.sendMessage,
        editMessage: client.editMessage,
        sendFile: client.sendFile,
        invoke: client.invoke,
    };
    client.invoke = async function (req, ...rest) {
        var _a;
        const hasil = await asli.invoke.call(this, req, ...rest);
        if (Inline.aktif(req === null || req === void 0 ? void 0 : req.peer)) {
            const nama = (req === null || req === void 0 ? void 0 : req.className) || ((_a = req === null || req === void 0 ? void 0 : req.constructor) === null || _a === void 0 ? void 0 : _a.name) || "";
            if (nama.includes("SendInlineBotResult") && (req === null || req === void 0 ? void 0 : req.id)) {
                try {
                    await Inline.pancingHasilInline(this, req.peer, hasil, req.id);
                }
                catch (err) {
                    Inline.catatGagal(err, req === null || req === void 0 ? void 0 : req.peer);
                    log().warn(`premium emoji tidak terpasang: ${err.message}`);
                }
            }
        }
        return hasil;
    };
    client.sendMessage = async function (entity, params = {}, ...rest) {
        if (!params || typeof params !== "object")
            return asli.sendMessage.call(this, entity, params, ...rest);
        if (!cheatAktif(params))
            return asli.sendMessage.call(this, entity, tanpaCheat(params), ...rest);
        params = tanpaCheat(params);
        const html = isHtml(this, params.parseMode);
        const eksplis = typeof params.parseMode === "string" && /^html$/i.test(params.parseMode.trim());
        const teks = params.message;
        if (layakInline(params, teks, eksplis, entity)) {
            const tombol = tombolBotApi(params.buttons);
            if (tombol === null && opsi.debug)
                log().info("premium emoji dilewati (bentuk tombol tidak dikenali)");
            if (tombol !== null) {
                try {
                    if (opsi.debug)
                        log().info(`kirim lewat jalur premium ke ${Inline.peerKey(entity)}`);
                    const hasil = await Inline.kirim(this, entity, {
                        text: teks,
                        buttons: tombol,
                        replyTo: params.replyTo,
                        silent: params.silent,
                        linkPreview: params.linkPreview,
                    });
                    if (hasil)
                        return bungkus(this, entity, hasil);
                }
                catch (err) {
                    Inline.catatGagal(err, entity);
                    log().warn(`premium emoji dilewati, pesan dikirim biasa: ${err.message}`);
                }
            }
        }
        return await kirimLangsung(this, asli.sendMessage, entity, params, "message", html, rest);
    };
    client.editMessage = async function (entity, params = {}, ...rest) {
        if (!params || typeof params !== "object")
            return asli.editMessage.call(this, entity, params, ...rest);
        if (!cheatAktif(params))
            return asli.editMessage.call(this, entity, tanpaCheat(params), ...rest);
        params = tanpaCheat(params);
        const html = isHtml(this, params.parseMode);
        const eksplis = typeof params.parseMode === "string" && /^html$/i.test(params.parseMode.trim());
        const teks = params.text;
        const idAsli = idPesan(params.message);
        const target = (Inline.aktif(entity) && Inline.gantiId(entity, idAsli)) || idAsli;
        if (idAsli && layakInline(params, teks, eksplis, entity)) {
            const tombol = tombolBotApi(params.buttons);
            const inlineId = Inline.inlineIdDari(entity, target);
            if (inlineId && tombol !== null) {
                try {
                    if (Inline.inlineMedia(entity, target))
                        await Inline.editCaptionViaBot(inlineId, teks, tombol);
                    else
                        await Inline.editViaBot(inlineId, teks, tombol, params.linkPreview);
                    return { id: target, chatId: entity, viaInline: true };
                }
                catch (err) {
                    log().warn(`gagal menyunting pesan: ${err.message}`);
                }
            }
            if (tombol !== null) {
                try {
                    await this.deleteMessages(entity, [target], { revoke: true }).catch(() => { });
                    Inline.lupakan(entity, target);
                    const hasil = await Inline.kirim(this, entity, {
                        text: teks,
                        buttons: tombol,
                        replyTo: params.replyTo,
                        linkPreview: params.linkPreview,
                    });
                    if (hasil) {
                        Inline.catatGanti(entity, idAsli, hasil.id);
                        return bungkus(this, entity, hasil);
                    }
                }
                catch (err) {
                    Inline.catatGagal(err, entity);
                    log().warn(`premium emoji dilewati, pesan diedit biasa: ${err.message}`);
                }
            }
        }
        const pakai = target === idAsli ? params : Object.assign(Object.assign({}, params), { message: target });
        return await kirimLangsung(this, asli.editMessage, entity, pakai, "text", html, rest);
    };
    client.sendFile = async function (entity, params = {}, ...rest) {
        if (!params || typeof params !== "object")
            return asli.sendFile.call(this, entity, params, ...rest);
        if (!cheatAktif(params))
            return asli.sendFile.call(this, entity, tanpaCheat(params), ...rest);
        params = tanpaCheat(params);
        const html = isHtml(this, params.parseMode);
        if (Inline.mediaAktif(entity) && params.file && !params.formattingEntities) {
            const tombol = tombolBotApi(params.buttons);
            if (tombol !== null) {
                try {
                    const hasil = await Inline.kirimMedia(this, entity, {
                        file: params.file,
                        caption: params.caption,
                        buttons: tombol,
                        replyTo: params.replyTo,
                        silent: params.silent,
                        params,
                    });
                    if (hasil)
                        return bungkus(this, entity, hasil);
                }
                catch (err) {
                    Inline.catatGagal(err, entity);
                    log().warn(`premium emoji dilewati untuk media: ${err.message}`);
                }
            }
        }
        return await kirimLangsung(this, asli.sendFile, entity, params, "caption", html, rest);
    };
    client.sendRich = async function (entity, pilihan = {}) {
        const cheat = cheatAktif(pilihan);
        return await Inline.kirimRich(this, entity, Object.assign(Object.assign({}, tanpaCheat(pilihan)), { cheat }));
    };
    const st = State.status();
    log().info(`userbot siap — premium emoji ${st.akun.aktif ? "aktif" : "mati"}`);
    return client;
}
async function kirimLangsung(client, fn, entity, params, medan, html, rest) {
    if (params.formattingEntities)
        return fn.call(client, entity, params, ...rest);
    const premium = State.isPremium();
    const nilai = params[medan];
    let siap = params;
    if (typeof nilai === "string")
        siap = Object.assign(Object.assign({}, params), { [medan]: prep(nilai, premium && html) });
    else if (Array.isArray(nilai))
        siap = Object.assign(Object.assign({}, params), { [medan]: nilai.map((v) => prep(v, premium && html)) });
    else
        return fn.call(client, entity, params, ...rest);
    try {
        return await fn.call(client, entity, siap, ...rest);
    }
    catch (err) {
        const bawa = typeof siap[medan] === "string"
            ? Emoji.hasCustom(siap[medan])
            : Array.isArray(siap[medan]) && siap[medan].some((v) => typeof v === "string" && Emoji.hasCustom(v));
        if (!bawa || !RE_EMOJI_ERROR.test((err === null || err === void 0 ? void 0 : err.message) || ""))
            throw err;
        State.markUnsupported(err.message);
        const polos = typeof nilai === "string"
            ? Object.assign(Object.assign({}, params), { [medan]: prep(nilai, false) }) : Object.assign(Object.assign({}, params), { [medan]: nilai.map((v) => prep(v, false)) });
        return await fn.call(client, entity, polos, ...rest);
    }
}
const BOT_TEXT_METHODS = new Set(["sendMessage", "editMessageText"]);
const BOT_CAPTION_METHODS = new Set([
    "sendPhoto", "sendVideo", "sendAnimation", "sendAudio", "sendDocument",
    "sendVoice", "sendVideoNote", "editMessageCaption",
]);
function installBot(bot) {
    const tg = bot === null || bot === void 0 ? void 0 : bot.telegram;
    if (!tg)
        return bot;
    const proto = Object.getPrototypeOf(tg);
    if (!proto || proto.__kafkagram)
        return bot;
    const callApi = tg.callApi;
    proto.callApi = async function (method, payload = {}, ...rest) {
        if (!payload || typeof payload !== "object")
            return callApi.call(this, method, payload, ...rest);
        const premium = State.botAllowed();
        const body = transformBotPayload(method, payload, premium);
        try {
            return await callApi.call(this, method, body, ...rest);
        }
        catch (err) {
            if (!premium || !RE_EMOJI_ERROR.test((err === null || err === void 0 ? void 0 : err.message) || ""))
                throw err;
            State.markBotUnsupported(`${method}: ${err.message}`);
            return await callApi.call(this, method, transformBotPayload(method, payload, false), ...rest);
        }
    };
    proto.__kafkagram = true;
    tg.getMe().then((me) => {
        if (!(me === null || me === void 0 ? void 0 : me.username))
            return;
        if (opsi.botUsername && opsi.botUsername !== me.username) {
            log().warn(`botUsername "${opsi.botUsername}" tidak cocok dengan token (@${me.username}), dipakai @${me.username}`);
        }
        opsi.botUsername = me.username;
    }).catch((err) => log().warn(`gagal cek identitas bot: ${err.message}`));
    log().info(`bot siap — premium=${State.botAllowed()}`);
    return bot;
}
function transformBotPayload(method, payload, premium) {
    const htmlOk = /^html$/i.test(String(payload.parse_mode || ""));
    const body = Object.assign({}, payload);
    if (typeof body.text === "string") {
        body.text = prep(body.text, premium && htmlOk && BOT_TEXT_METHODS.has(method));
    }
    if (typeof body.caption === "string") {
        body.caption = prep(body.caption, premium && htmlOk && BOT_CAPTION_METHODS.has(method));
    }
    if (body.rich_message && typeof body.rich_message === "object") {
        if (typeof body.rich_message.html === "string") {
            body.rich_message = Object.assign(Object.assign({}, body.rich_message), { html: prep(body.rich_message.html, premium) });
        }
        else if (premium && Array.isArray(body.rich_message.blocks)) {
            body.rich_message = Object.assign(Object.assign({}, body.rich_message), { blocks: Emoji.blokPremium(body.rich_message.blocks) });
        }
    }
    if (body.media && typeof body.media === "object" && !Array.isArray(body.media)) {
        if (typeof body.media.caption === "string") {
            const mediaHtml = /^html$/i.test(String(body.media.parse_mode || ""));
            body.media = Object.assign(Object.assign({}, body.media), { caption: prep(body.media.caption, premium && mediaHtml) });
        }
    }
    if (Array.isArray(body.results)) {
        body.results = body.results.map((r) => transformInlineResult(r, premium));
    }
    return body;
}
function transformInlineResult(result, premium) {
    if (!result || typeof result !== "object")
        return result;
    const out = Object.assign({}, result);
    if (typeof out.caption === "string") {
        const htmlOk = /^html$/i.test(String(out.parse_mode || ""));
        out.caption = prep(out.caption, premium && htmlOk);
    }
    const imc = out.input_message_content;
    if (imc && imc.rich_message && typeof imc.rich_message.html === "string") {
        out.input_message_content = Object.assign(Object.assign({}, imc), { rich_message: Object.assign(Object.assign({}, imc.rich_message), { html: prep(imc.rich_message.html, premium) }) });
        return out;
    }
    if (imc && typeof imc.message_text === "string") {
        const htmlOk = /^html$/i.test(String(imc.parse_mode || ""));
        out.input_message_content = Object.assign(Object.assign({}, imc), { message_text: prep(imc.message_text, premium && htmlOk) });
    }
    return out;
}
module.exports = { installUserbot, installBot, isHtml, prep, tombolBotApi, cheatAktif, tanpaCheat };
