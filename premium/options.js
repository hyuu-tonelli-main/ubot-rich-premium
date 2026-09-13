"use strict";
const warna = {
    reset: "\x1b[0m",
    dim: "\x1b[2m",
    cyan: "\x1b[36m",
    kuning: "\x1b[33m",
    merah: "\x1b[31m",
};
function loggerBawaan() {
    const tulis = (tanda, gaya) => (pesan) => console.log(`${gaya}[kafkagram]${warna.reset} ${tanda} ${pesan}`);
    return {
        info: tulis("", warna.cyan),
        warn: tulis("", warna.kuning),
        error: tulis("", warna.merah),
    };
}
const opsi = {
    client: null,
    bot: null,
    botUsername: null,
    ownerId: null,
    userId: null,
    mediaChatId: null,
    inline: true,
    media: true,
    cheatPremiumEmojis: false,
    teksMuat: "Memuat",
    tombolMuat: "tunggu sebentar...",
    mode: "auto",
    botMode: "auto",
    debug: false,
    banner: true,
    logger: loggerBawaan(),
};
function pasangOpsi(baru = {}) {
    for (const kunci of Object.keys(opsi)) {
        if (baru[kunci] !== undefined)
            opsi[kunci] = baru[kunci];
    }
    return opsi;
}
function log() {
    return opsi.logger || loggerBawaan();
}
module.exports = { opsi, pasangOpsi, log, warna };
