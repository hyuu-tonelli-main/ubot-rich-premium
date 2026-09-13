"use strict";
const { opsi, log } = require("./options");
const REFRESH_MS = 30 * 60 * 1000;
let known = false;
let premium = false;
let ditolak = false;
let checkedAt = 0;
let checking = null;
let botDitolak = false;
function mode() {
    const m = opsi.mode;
    return m === "on" || m === "off" ? m : "auto";
}
function botMode() {
    const b = opsi.botMode;
    if (b === true)
        return "on";
    if (b === false)
        return "off";
    return b === "on" || b === "off" ? b : "auto";
}
function isPremium() {
    const m = mode();
    if (m === "on")
        return true;
    if (m === "off")
        return false;
    if (!known)
        return !ditolak;
    return premium;
}
function markUnsupported(alasan) {
    if (mode() === "on")
        return;
    if (!ditolak)
        log().warn(`akun tidak boleh kirim custom emoji, dipoloskan: ${alasan || "ditolak Telegram"}`);
    ditolak = true;
    premium = false;
    known = true;
    checkedAt = Date.now();
}
function botAllowed() {
    const m = botMode();
    if (m === "off")
        return false;
    if (m === "on")
        return true;
    return !botDitolak;
}
function markBotUnsupported(alasan) {
    if (botMode() === "on" || botDitolak)
        return;
    botDitolak = true;
    log().warn(`bot tidak boleh kirim custom emoji, dipoloskan: ${alasan || "ditolak Telegram"}`);
}
async function refresh(client, { force = false } = {}) {
    const c = client || opsi.client;
    if (!c)
        return premium;
    if (!force && known && Date.now() - checkedAt < REFRESH_MS)
        return premium;
    if (checking)
        return checking;
    checking = (async () => {
        try {
            const me = await c.getMe();
            premium = !!(me === null || me === void 0 ? void 0 : me.premium);
            known = true;
            checkedAt = Date.now();
            if (premium)
                ditolak = false;
        }
        catch (err) {
            log().warn(`gagal cek status Premium: ${err.message}`);
        }
        finally {
            checking = null;
        }
        return premium;
    })();
    return checking;
}
function watch(client) {
    refresh(client, { force: true });
    const timer = setInterval(() => refresh(client, { force: true }), REFRESH_MS);
    if (typeof timer.unref === "function")
        timer.unref();
    return timer;
}
function status() {
    return {
        akun: { mode: mode(), aktif: isPremium(), diketahui: known, premium, ditolak },
        bot: { mode: botMode(), aktif: botAllowed(), ditolak: botDitolak },
    };
}
module.exports = {
    isPremium,
    markUnsupported,
    botAllowed,
    markBotUnsupported,
    refresh,
    watch,
    status,
};
