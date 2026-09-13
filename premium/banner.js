"use strict";
function versiPaket() {
    const fs = require("fs");
    const path = require("path");
    for (const kandidat of ["../package.json", "../../package.json", "../../../package.json"]) {
        try {
            const isi = JSON.parse(fs.readFileSync(path.join(__dirname, kandidat), "utf8"));
            if (isi.name === "kafkagram")
                return isi.version;
        }
        catch (_) { }
    }
    return "";
}
const reset = "\x1b[0m";
const bold = "\x1b[1m";
const dim = "\x1b[2m";
const cyan = "\x1b[36m";
const putih = "\x1b[37m";
const pohon = [
    "   ╭─╮",
    "   │ │",
    "   ╰┬╯",
    "    │         ╭─╮",
    "   ╭┴╮   ╭────┤ │",
    "   │ ├───╯    ╰─╯",
    "   │ ├───╮",
    "   ╰┬╯   │    ╭─╮",
    "    │    ╰────┤ │",
    "   ╭┴╮        ╰─╯",
    "   │ │",
    "   ╰─╯",
];
const penutup = [
    "",
    `${bold}${putih}  kafkagram${reset}  ${dim}v${versiPaket()}${reset}`,
    "",
    `${dim}  premium emoji untuk akun biasa${reset}`,
    `${dim}  thanks for using my package${reset}`,
    `${dim}  ~kafk6  ${cyan}t.me/kafk6${reset}`,
    "",
];
let sudah = false;
function jeda(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
function diam() {
    return process.env.KAFKAGRAM_NO_BANNER === "1";
}
function cetak() {
    if (sudah || diam())
        return;
    sudah = true;
    const baris = pohon.map((b) => `${cyan}${bold}${b}${reset}`).concat(penutup);
    console.log("\n" + baris.join("\n"));
}
async function animasi() {
    if (diam())
        return;
    sudah = true;
    if (!process.stdout.isTTY)
        return cetakLangsung();
    console.log("");
    for (const b of pohon) {
        console.log(`${cyan}${bold}${b}${reset}`);
        await jeda(45);
    }
    for (const b of penutup) {
        console.log(b);
        await jeda(90);
    }
}
function cetakLangsung() {
    console.log("\n" + pohon.map((b) => `${cyan}${bold}${b}${reset}`).concat(penutup).join("\n"));
}
module.exports = { cetak, animasi, pohon, penutup };
