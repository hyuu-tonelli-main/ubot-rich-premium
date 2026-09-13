# kafkagram

> Fork **GramJS** dengan dua tambahan: **premium emoji dari akun biasa**, dan **rich message** (Bot API 10.3).
> Dirawat oleh **[@kafk6](https://t.me/kafk6)**

```
   ╭─╮
   │ │
   ╰┬╯
    │         ╭─╮
   ╭┴╮   ╭────┤ │
   │ ├───╯    ╰─╯
   │ ├───╮
   ╰┬╯   │    ╭─╮
    │    ╰────┤ │
   ╭┴╮        ╰─╯
   │ │
   ╰─╯
```

---

## Daftar isi

- [Apa ini](#apa-ini)
- [Pasang](#pasang)
- [Mulai cepat](#mulai-cepat)
- [A. Cheat premium emoji](#a-cheat-premium-emoji)
- [B. Rich message](#b-rich-message)
- [Semua opsi](#semua-opsi)
- [Kembangkan](#kembangkan)

---

## Apa ini

Fork penuh [GramJS](https://github.com/gram-js/gramjs) (paket npm `telegram`). Semua API-nya sama persis, jadi pindah cukup ganti import:

```diff
- const { TelegramClient, Api } = require("telegram");
+ const { TelegramClient, Api } = require("kafkagram");
```

Yang ditambahkan:

| Fitur | Ringkas |
|---|---|
| **Cheat premium emoji** | Akun non-premium tetap bisa menampilkan stiker emoji, asalkan **bot**-nya berhak |
| **Rich message** | Judul, tabel, daftar, checklist, kutipan lipat, tombol dalam pesan |

Keduanya **opt-in**: tanpa diminta, kafkagram berperilaku persis GramJS asli.

## Pasang

```bash
npm install kafkagram telegraf
```

`telegraf` dipakai untuk sisi bot. Tanpa itu kafkagram tetap jalan, hanya kedua fitur di atas mati.

## Mulai cepat

```js
const { TelegramClient, sessions, installPremiumEmoji } = require("kafkagram");
const { Telegraf } = require("telegraf");

const bot = new Telegraf(BOT_TOKEN);
bot.launch();

const client = new TelegramClient(session, API_ID, API_HASH, {});
await client.start({ /* ... */ });
client.setParseMode("html");

installPremiumEmoji({
  client,
  bot,
  ownerId: 123456789,
  botUsername: "bot_kamu",
});
```

---

# A. Cheat premium emoji

## Syaratnya

- Akun userbot **boleh biasa** — tidak perlu Telegram Premium.
- **Bot** yang dipakai **harus berhak** mengirim custom emoji.
- Bot harus punya inline mode aktif: [@BotFather](https://t.me/BotFather) → `/setinline`.
- Bot dan userbot harus jalan di satu proses yang sama.

Cek cepat apakah botmu berhak:

```bash
curl -s -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -d chat_id=<ID_KAMU> -d parse_mode=HTML \
  --data-urlencode 'text=<tg-emoji emoji-id="5424972470023104089">🔥</tg-emoji>'
```

Kalau `entities` di balasannya berisi `custom_emoji`, botmu memenuhi syarat.

## Cara mengaktifkan

Per panggilan — properti `cheat_premium_emojis`:

```js
await client.sendMessage(chatId, {
  message: "<blockquote>🔥 HALO</blockquote>\n\n✅ premium :roket:",
  parseMode: "html",
  cheat_premium_emojis: true,
});
```

Tanpa properti itu (atau `false`), pengirimannya **persis GramJS asli** — teks tidak disentuh sama sekali.

Berlaku untuk semua jalur kirim:

```js
client.sendMessage(peer, { message, parseMode: "html", cheat_premium_emojis: true });
client.editMessage(peer, { message: id, text, parseMode: "html", cheat_premium_emojis: true });
client.sendFile(peer, { file, caption, parseMode: "html", cheat_premium_emojis: true });
client.sendRich(peer, { html, cheat_premium_emojis: true });
```

Mau semua balasan otomatis pakai cheat? Nyalakan global, lalu matikan per panggilan saat perlu:

```js
installPremiumEmoji({ client, bot, ownerId, botUsername, cheatPremiumEmojis: true });

await client.sendMessage(chatId, { message: "polos", cheat_premium_emojis: false });
```

`cheatPremiumEmojis` (camelCase) juga diterima di tiap panggilan.

## Menulis emojinya

| Cara | Contoh | Hasil |
|---|---|---|
| Emoji biasa | `🔥` | otomatis jadi stiker premium |
| Alias | `:roket:` `:api:` `:centang:` | stiker premium |
| Kunci tetap polos | `emoji.plain("🔥")` | tetap emoji biasa |
| Stiker sendiri | `emoji.emoCustom(id, "🔥")` | pakai id stikermu |

```js
const { emoji } = require("kafkagram");

emoji.render("🔥 :roket:", true);   // → tag <tg-emoji>
emoji.render("🔥 :roket:", false);  // → "🔥 🚀"
emoji.aliasList();                  // 297 alias
```

Isi `<code>`, `<pre>`, dan `<tg-plain>` tidak pernah disentuh. Jumlah custom emoji dijaga maksimal 100 per pesan sesuai batas Telegram.

## Kalau gagal

Semua jalur punya jaring pengaman — pesan **tetap terkirim**, hanya turun ke emoji biasa:

| Kejadian | Akibat |
|---|---|
| Bot tidak berhak custom emoji | dicatat sekali, sisa sesi memakai emoji biasa |
| Chat melarang jalur ini (`CHAT_SEND_INLINE_FORBIDDEN`, slow mode, dll.) | **hanya chat itu** yang memakai emoji biasa, chat lain tetap premium |
| Bot tidak menjawab / timeout | fitur dimatikan sementara 5 menit |
| Gagal berulang | berhenti mencoba, balasan tetap terkirim |

---

# B. Rich message

Rich message adalah format Bot API 10.3: judul, tabel, daftar, checklist, kutipan lipat, tombol di dalam badan pesan.

> **Syarat:** akun tidak bisa mengirim rich message sendiri — Telegram menolaknya dengan `RICH_MESSAGE_UNSUPPORTED`. Karena itu `sendRich` membutuhkan `bot` yang sudah dipasang di `installPremiumEmoji`.

## Pemakaian dasar

```js
const { rich } = require("kafkagram");

await client.sendRich(chatId, {
  html: rich.gabung(
    rich.h1("Laporan Harian"),
    rich.p("Ringkasan " + rich.b("penting") + " hari ini."),
    rich.table(["Fitur", "Status"], [["premium emoji", "jalan"], ["rich message", "jalan"]]),
    rich.checklist([{ text: "kirim laporan", checked: true }, "arsipkan"]),
    rich.expandable("Detail panjang yang bisa dibuka tutup."),
    rich.footer("dibuat oleh kafkagram")
  ),
});
```

Bisa digabung dengan cheat premium emoji:

```js
await client.sendRich(chatId, { html: rich.h2("🔥 Judul"), cheat_premium_emojis: true });
```

## Semua pembangun HTML

**Teks sebaris**

| Fungsi | Hasil |
|---|---|
| `rich.b(t)` `rich.i(t)` `rich.u(t)` `rich.s(t)` | tebal, miring, garis bawah, coret |
| `rich.code(t)` | `<code>` |
| `rich.mark(t)` | sorot |
| `rich.spoiler(t)` | spoiler |
| `rich.sub(t)` `rich.sup(t)` | subscript, superscript |
| `rich.math(t)` | rumus sebaris |
| `rich.a(teks, url)` | tautan |
| `rich.esc(t)` | escape HTML |

**Blok**

| Fungsi | Blok Telegram |
|---|---|
| `rich.h1..h4(t)` | `heading` |
| `rich.p(t)` | `paragraph` |
| `rich.hr()` | `divider` |
| `rich.footer(t)` | `footer` |
| `rich.anchor(nama)` | `anchor` |
| `rich.pre(kode, bahasa)` | `preformatted` |
| `rich.mathBlock(latex)` | `mathematical_expression` |
| `rich.blockquote(t, cite)` | `block_quotation` |
| `rich.expandable(t, cite)` | `expandable_block_quotation` |
| `rich.aside(t, cite)` | `pull_quotation` |
| `rich.details(ringkasan, isi, terbuka)` | `details` |
| `rich.ul(item[])` / `rich.ol(item[])` | `list` |
| `rich.checklist([{text, checked}])` | `list` + checkbox |
| `rich.table(kepala, baris, {bordered, striped, compact})` | `table` |
| `rich.buttonRow(tombol[], align)` | `buttons` |
| `rich.img(src, {caption, alt})` | `photo` |
| `rich.video/animation(src, opsi)` | `video` / `animation` |
| `rich.audio/voice(src, opsi)` | `audio` / `voice_note` |
| `rich.document(id, teks)` | `document` |
| `rich.collage(isi[], caption)` | `collage` |
| `rich.slideshow(isi[], caption)` | `slideshow` |
| `rich.peta({latitude, longitude, zoom, width, height})` | `map` |
| `rich.thinking(t)` | `thinking` — lihat catatan di bawah |
| `rich.gabung(...)` | sambung semua potongan |

## Batasan yang sudah diuji langsung

| Hal | Hasil uji |
|---|---|
| Tombol `url`, `disabled`, `style` di HTML | ✅ jalan |
| **Tombol `callback` di HTML** | ❌ `BUTTON_URL_INVALID` — wajib pakai `blocks` |
| `<tg-thinking>` dari bot biasa | ❌ `RICH_MESSAGE_BLOCK_UNSUPPORTED` |
| Premium emoji di dalam rich | ✅ jadi node `custom_emoji` |
| Premium emoji rich di chat privat & grup biasa | ✅ tampil |
| **Premium emoji rich di supergrup/channel** | ❌ dipoloskan Telegram, teks biasa tidak terpengaruh |
| Collage dari URL gambar | ✅ jalan |

Baris terakhir itu hasil pengukuran, bukan dugaan. Diuji di satu supergrup dengan bot berstatus
admin di sana, lalu diulang di grup biasa dengan isi yang sama persis — tiap pesan uji membawa
emoji biasa dan custom emoji berdampingan supaya bisa dibandingkan langsung:

| Yang dikirim | Penulis pesan | Grup biasa | Supergrup |
|---|---|---|---|
| Teks, hasil inline apa adanya | akun | polos | polos |
| Teks, diedit bot | akun | premium | premium |
| Teks milik bot sendiri | bot | — | premium |
| Rich, hasil inline apa adanya | akun | polos | polos |
| **Rich, diedit bot** | akun | **premium** | **polos** |
| **Rich milik bot sendiri** | bot | — | **polos** |

Dua hal yang perlu dibaca dari tabel ini:

Pertama, yang memberi hak custom emoji adalah **edit oleh bot** — bukan siapa yang tampil sebagai
pengirim. Hasil inline yang dikirim apa adanya selalu polos, teks maupun rich.

Kedua, di supergrup rich message tidak pernah membawa custom emoji, bahkan untuk pesan rich yang
dikirim bot atas namanya sendiri, padahal teks bot di chat yang sama premium. Jadi ini bukan soal
izin, keanggotaan, tombol, level boost, atau rute editnya — field `rich_message` yang tidak
membawanya. Tidak ada jalan memutar dari sisi lib, dan karena itu `sendRich` tidak lagi memakai
jalur cheat di supergrup: pancingannya hanya menambah dua round trip, kedipan, dan tanda "edited"
tanpa mengubah hasil. Di chat privat dan grup biasa pancingan tetap dipakai, karena di sana justru
itu yang membuat emojinya premium. Kalau kamu ingin lib tetap mencoba, pasang `mode: "on"`.

## Bentuk blok terstruktur

Untuk yang tidak bisa diungkapkan HTML — terutama **tombol callback** — pakai `blocks`:

```js
await client.sendRich(chatId, {
  blocks: [
    rich.blok.judul("Konfirmasi", 2),
    rich.blok.paragraf("Lanjutkan proses?"),
    rich.blok.tombol([
      { text: "Ya", callback: "lanjut:1", style: "success" },
      { text: "Batal", callback: "batal:1", style: "danger" },
    ], "center"),
  ],
});
```

Pembangun blok: `rich.blok.judul` `paragraf` `pemisah` `kaki` `kutipan` `praformat` `daftar` `tabel` `tombol`.

> `html`, `markdown`, dan `blocks` **tidak bisa digabung** — Telegram hanya menerima salah satu. Kalau `blocks` diisi, `html` diabaikan, dan pesan bertombol dalam badan **wajib disunting dengan blok juga**.

---

## Semua opsi

```js
installPremiumEmoji({
  client,                    // TelegramClient
  bot,                       // Telegraf, perender premium emoji & rich message
  ownerId: 123456789,        // id akun pemilik (tujuan unggah media lewat bot)
  userId: null,              // id akun userbot; dideteksi sendiri kalau kosong
  mediaChatId: null,         // chat penampung media; default ownerId
  botUsername: "bot_kamu",   // dikoreksi otomatis kalau tidak cocok dengan token
  userId: null,              // id akun userbot; dideteksi sendiri kalau kosong
  mediaChatId: null,         // chat penampung media; default ownerId

  cheatPremiumEmojis: false, // default per panggilan
  inline: true,              // false = matikan kedua fitur tambahan
  media: true,               // false = media dikirim dengan cara biasa
  mode: "auto",              // "auto" | "on" | "off"  — sisi akun
  botMode: "auto",           // "auto" | "on" | "off"  — sisi bot
  teksMuat: "Memuat",        // teks sementara sebelum pesan siap
  tombolMuat: "tunggu sebentar...",  // label tombol sementara
  debug: false,              // true = cetak alasan tiap kali fitur dilewati
  banner: true,              // false = jangan cetak logo saat start
  logger: console,           // { info, warn, error }
});
```

## Kembangkan

```bash
npm install
npm run build         # tsc → dist/
npm run test:premium  # 15 tes engine + 6 tes integrasi
npm start             # banner
```

Selebihnya kode GramJS asli, tidak diubah — kecuali `gramjs/tl/static/api.tl` yang ditambahi
definisi TL untuk rich message (GramJS berhenti di layer 193, tipe rich lahir setelahnya).
Sesudah merge dari upstream, jalankan ulang:

```bash
node dist/tl/generateModule.js   # regenerasi apiTl.js + api.d.ts
```

### Sinkron ke atas

```bash
git fetch upstream && git merge upstream/master     # GramJS (arsip)
git fetch teleproto && git merge teleproto/main     # penerusnya
```

> GramJS **diarsipkan** sejak Juli 2026. Penerus aktifnya [teleproto](https://github.com/sanyok12345/teleproto) sudah dipasang sebagai remote kedua. Fork ini sengaja berbasis GramJS supaya cocok dengan project yang sudah memakai `telegram@2.26.x`.

## Lisensi

MIT. Kode inti dari [GramJS](https://github.com/gram-js/gramjs) (MIT, © Painor); lapisan premium emoji & rich message © [@kafk6](https://t.me/kafk6).
