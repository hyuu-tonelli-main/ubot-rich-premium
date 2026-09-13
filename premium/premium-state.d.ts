export function isPremium(): boolean;
export function markUnsupported(alasan: any): void;
export function botAllowed(): boolean;
export function markBotUnsupported(alasan: any): void;
export function refresh(client: any, { force }?: {
    force?: boolean | undefined;
}): Promise<any>;
export function watch(client: any): NodeJS.Timeout;
export function status(): {
    akun: {
        mode: string;
        aktif: boolean;
        diketahui: boolean;
        premium: boolean;
        ditolak: boolean;
    };
    bot: {
        mode: string;
        aktif: boolean;
        ditolak: boolean;
    };
};
