export function esc(t: any): string;
export function b(t: any): string;
export function i(t: any): string;
export function u(t: any): string;
export function s(t: any): string;
export function code(t: any): string;
export function mark(t: any): string;
export function spoiler(t: any): string;
export function sub(t: any): string;
export function sup(t: any): string;
export function math(t: any): string;
export function h1(t: any): string;
export function h2(t: any): string;
export function h3(t: any): string;
export function h4(t: any): string;
export function p(t: any): string;
export function hr(): string;
export function footer(t: any): string;
export function anchor(nama: any): string;
export function a(teks: any, url: any): string;
export function pre(kode: any, bahasa: any): string;
export function blockquote(teks: any, cite: any): string;
export function expandable(teks: any, cite: any): string;
export function aside(teks: any, cite: any): string;
export function details(ringkasan: any, isi: any, terbuka: any): string;
export function ul(item: any): string;
export function ol(item: any): string;
export function checklist(item: any): string;
export function table(kepala: any, baris: any, { bordered, striped, compact }?: {
    bordered?: boolean | undefined;
    striped?: boolean | undefined;
    compact?: boolean | undefined;
}): string;
export function gabung(...bagian: any[]): string;
export function thinking(teks: any): string;
export function mathBlock(latex: any): string;
export function button({ text, url, callback, style, disabled }?: {
    text: any;
    url: any;
    callback: any;
    style: any;
    disabled: any;
}): string;
export function buttonRow(tombol: any, align: any): string;
export function img(src: any, opsi: any): string;
export function video(src: any, opsi: any): string;
export function animation(src: any, opsi: any): string;
export function audio(src: any, opsi: any): string;
export function voice(src: any, opsi: any): string;
export function collage(isi: any, caption: any): string;
export function slideshow(isi: any, caption: any): string;
export function peta({ latitude, longitude, zoom, width, height, caption }?: {
    latitude: any;
    longitude: any;
    zoom: any;
    width: any;
    height: any;
    caption: any;
}): string;
declare function document_(id: any, teks: any): string;
export namespace blok {
    function judul(teks: any, ukuran?: number): {
        type: string;
        text: any;
        size: number;
    };
    function paragraf(teks: any): {
        type: string;
        text: any;
    };
    function pemisah(): {
        type: string;
    };
    function kaki(teks: any): {
        type: string;
        text: any;
    };
    function kutipan(teks: any, bisaDibuka: any): {
        type: string;
        text: any;
    };
    function praformat(teks: any, bahasa: any): {
        language?: any;
        type: string;
        text: any;
    };
    function daftar(item: any, bernomor: any): {
        type: string;
        is_ordered: boolean;
        items: any;
    };
    function tabel(kepala: any, baris: any, pilihan?: {}): {
        is_compact?: boolean | undefined;
        is_striped?: boolean | undefined;
        is_bordered?: boolean | undefined;
        type: string;
        cells: any[];
    };
    function tombol(daftar: any, align: any): {
        align?: any;
        type: string;
        buttons: ({
            style?: any;
            disabled: {};
            text: any;
        } | {
            style?: any;
            callback_data: any;
            text: any;
        } | {
            style?: any;
            url: any;
            text: any;
        })[];
    };
}
export { document_ as document };
