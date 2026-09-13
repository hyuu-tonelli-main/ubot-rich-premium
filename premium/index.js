"use strict";
const Emoji = require("./premium-emoji");
const State = require("./premium-state");
const Inline = require("./inline-send");
const RichSend = require("./rich-send");
const BotHook = require("./bot-hook");
const Banner = require("./banner");
const RichBlok = require("./rich");
const { opsi, pasangOpsi } = require("./options");
function installPremiumEmoji(pilihan = {}) {
    pasangOpsi(pilihan);
    if (opsi.banner !== false)
        Banner.cetak();
    if (opsi.bot) {
        RichSend.installBot(opsi.bot);
        BotHook.pasang(opsi.bot);
    }
    if (opsi.client) {
        RichSend.installUserbot(opsi.client);
        State.watch(opsi.client);
        if (!opsi.userId && typeof opsi.client.getMe === "function") {
            try {
                Promise.resolve(opsi.client.getMe())
                    .then((me) => { if (me === null || me === void 0 ? void 0 : me.id)
                    opsi.userId = String(me.id); })
                    .catch(() => { });
            }
            catch (_) { }
        }
    }
    return { status: State.status, emoji: Emoji, options: opsi };
}
module.exports = {
    installPremiumEmoji,
    rich: RichBlok,
    emoji: Emoji,
    premiumState: State,
    inlineSend: Inline,
    banner: Banner,
    options: opsi,
};
