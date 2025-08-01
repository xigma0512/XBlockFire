import { language } from "../settings/config"
import zh_tw from "../settings/langs/zh_tw";

const LangTable = {
    'ZH-TW': zh_tw
}

const langTarget = language as keyof typeof LangTable;
type Labels = keyof typeof LangTable['ZH-TW'];

export function lang(id: Labels, ...args: any[]): string;
export function lang(id: Labels, ...args: any[]): string[];

export function lang(id: Labels, ...args: any[]): string | string[] {
    const content = LangTable[langTarget][id];

    const transform = (str: string) => {
        return str.replace(/%([a-z])/g, (_, keyChar) => {
            const argIndex = keyChar.charCodeAt(0) - 'a'.charCodeAt(0);
            return args[argIndex] ?? `%${keyChar}`;
        });
    }

    if (typeof content === 'string') {
        return transform(content);
    } else {   
        return content.map(c => transform(c));
    }
}