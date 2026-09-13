export namespace opsi {
    const client: null;
    const bot: null;
    const botUsername: null;
    const ownerId: null;
    const userId: null;
    const mediaChatId: null;
    const inline: boolean;
    const media: boolean;
    const cheatPremiumEmojis: boolean;
    const teksMuat: string;
    const tombolMuat: string;
    const mode: string;
    const botMode: string;
    const debug: boolean;
    const banner: boolean;
    namespace logger {
        function info(pesan: any): void;
        function warn(pesan: any): void;
        function error(pesan: any): void;
    }
}
export function pasangOpsi(baru?: {}): {
    client: null;
    bot: null;
    botUsername: null;
    ownerId: null;
    userId: null;
    mediaChatId: null;
    inline: boolean;
    media: boolean;
    cheatPremiumEmojis: boolean;
    teksMuat: string;
    tombolMuat: string;
    mode: string;
    botMode: string;
    debug: boolean;
    banner: boolean;
    logger: {
        info: (pesan: any) => void;
        warn: (pesan: any) => void;
        error: (pesan: any) => void;
    };
};
export function log(): {
    info: (pesan: any) => void;
    warn: (pesan: any) => void;
    error: (pesan: any) => void;
};
export namespace warna {
    const reset: string;
    const dim: string;
    const cyan: string;
    const kuning: string;
    const merah: string;
}
