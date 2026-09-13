export function channelPeer(peer: any): boolean;
export function aktif(peer: any): boolean;
export function mediaAktif(peer: any): boolean;
export function ambil(key: any): any;
export function catatGagal(err: any, peer: any): void;
export function statusChat(peer: any): Date | null;
export function alasanMati(peer: any): string | null;
export function catatInline(key: any, inlineMessageId: any): void;
export function pasangPancingan(hasil: any): any;
export function pancingHasilInline(client: any, peer: any, terkirim: any, resultId: any): Promise<void>;
export function kirim(client: any, peer: any, { text, buttons, replyTo, silent, linkPreview }?: {
    text: any;
    buttons: any;
    replyTo: any;
    silent: any;
    linkPreview: any;
}): Promise<{
    id: number | null;
    peer: any;
    key: string;
    updates: any;
    inlineId: any;
} | null>;
export function kirimMedia(client: any, peer: any, { file, caption, buttons, replyTo, silent, params }?: {
    file: any;
    caption: any;
    buttons: any;
    replyTo: any;
    silent: any;
    params: any;
}): Promise<{
    id: number | null;
    peer: any;
    key: string;
    updates: any;
    inlineId: any;
} | null>;
export function kirimRich(client: any, peer: any, { html, markdown, blocks, isRtl, media, buttons, replyTo, silent, cheat }?: {
    html: any;
    markdown: any;
    blocks: any;
    isRtl: any;
    media: any;
    buttons: any;
    replyTo: any;
    silent: any;
    cheat: any;
}): Promise<{
    id: number | null;
    peer: any;
    key: string;
    updates: any;
    inlineId?: undefined;
} | {
    id: number | null;
    peer: any;
    key: string;
    updates: any;
    inlineId: any;
}>;
export function editRichViaBot(inlineMessageId: any, rich: any, buttons: any): Promise<any>;
export function bersihkanRich(rich?: {}): {
    html: any;
    markdown: any;
    blocks: any;
    is_rtl: boolean;
    media: any;
};
export function editViaBot(inlineMessageId: any, text: any, buttons: any, linkPreview: any): Promise<any>;
export function editCaptionViaBot(inlineMessageId: any, caption: any, buttons: any): Promise<any>;
export function daftarkanInline(peer: any, msgId: any, inlineMessageId: any, media: any): void;
export function inlineIdDari(peer: any, msgId: any): any;
export function inlineMedia(peer: any, msgId: any): any;
export function lupakan(peer: any, msgId: any): void;
export function catatGanti(peer: any, idLama: any, idBaru: any): void;
export function gantiId(peer: any, idLama: any): any;
export function jenisMedia(params?: {}): "photo" | "gif" | "video" | "audio" | "document" | "voice";
export function bisaUnggah(file: any): boolean;
