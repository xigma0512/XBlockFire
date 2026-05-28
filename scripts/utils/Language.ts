import { zh_TW } from "../settings/lang/zh_TW";
import { LanguageKey } from "../settings/lang/LanguageKey";

export class Language {
    private static readonly dictionary = zh_TW;

    /**
     * 取得翻譯字串並替換佔位符
     */
    static translate(key: LanguageKey, ...args: (string | number)[]): string {
        const value = this.dictionary[key];
        if (!value) return key;

        let text = Array.isArray(value) ? value.join('\n') : value;

        args.forEach((val, index) => {
            text = text.replace(new RegExp(`%${index + 1}`, 'g'), val.toString());
        });

        return text;
    }

}
