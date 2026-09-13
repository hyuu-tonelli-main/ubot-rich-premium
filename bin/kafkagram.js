#!/usr/bin/env node
let Banner;
for (const jalur of ["../premium/banner", "../gramjs/premium/banner", "../dist/premium/banner"]) {
  try { Banner = require(jalur); break; } catch (_) {}
}
let version = "";
for (const jalur of ["../package.json", "../../package.json"]) {
  try {
    const isi = require(jalur);
    if (isi.name === "kafkagram") { version = isi.version; break; }
  } catch (_) {}
}

const dim = "\x1b[2m";
const cyan = "\x1b[36m";
const reset = "\x1b[0m";

const contoh = [
  `${dim}  const { TelegramClient, installPremiumEmoji } = require("kafkagram");${reset}`,
  `${dim}  const { Telegraf } = require("telegraf");${reset}`,
  "",
  `${dim}  installPremiumEmoji({ client, bot, ownerId, botUsername });${reset}`,
  "",
  `${dim}  dokumentasi: ${cyan}github.com/kafk6/kafkagram${reset}`,
  "",
];

Banner.animasi().then(() => {
  if (process.argv.includes("--version") || process.argv.includes("-v")) {
    console.log(version);
    return;
  }
  console.log(contoh.join("\n"));
});
