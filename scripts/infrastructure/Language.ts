import { language } from "../settings/config"
import zh_tw from "../settings/langs/zh_tw";

const LangTable = {
    'ZH-TW': zh_tw
}

const langTarget = language as keyof typeof LangTable;

export const lang = (id: keyof typeof LangTable['ZH-TW'], ...args: any[]) => {
    return LangTable[langTarget][id].replace(/%([a-z])/g, (_, keyChar) => {
        const argIndex = keyChar.charCodeAt(0) - 'a'.charCodeAt(0);
        return args[argIndex] ?? `%${keyChar}`;
    });
}