import { Player } from '@minecraft/server';
import { ActionFormData, ActionFormResponse } from '@minecraft/server-ui';

interface TabbedButton<TAction extends string> {
    readonly text: string;
    readonly iconPath?: string;
    readonly action: TAction;
    readonly value?: string;
}

interface Tab<TAction extends string> {
    readonly id: string;
    readonly label: string;
    readonly buttons: TabbedButton<TAction>[];
}

export interface TabbedActionFormResult<TAction extends string> {
    readonly canceled: boolean;
    readonly tabId: string;
    readonly action?: TAction;
    readonly value?: string;
}

const TITLE_MARKER = '§c§u§s§t§o§m§r';
const CATEGORY_MARKER = '§c§a§t§e§g§o§r§y§8';

export class TabbedActionForm<TAction extends string> {
    private readonly tabs: Tab<TAction>[] = [];
    private titleText = '';
    private bodyText = '';

    title(title: string) {
        this.titleText = title;
        return this;
    }

    body(body: string) {
        this.bodyText = body;
        return this;
    }

    tab(id: string, label: string) {
        if (!this.tabs.some((tab) => tab.id === id)) {
            this.tabs.push({ id, label, buttons: [] });
        }
        return this;
    }

    button(tabId: string, button: TabbedButton<TAction>) {
        const tab = this.tabs.find((tab) => tab.id === tabId);
        if (!tab) throw new Error(`Missing tab: ${tabId}`);
        tab.buttons.push(button);
        return this;
    }

    async show(player: Player, selectedTabId = this.tabs[0]?.id): Promise<TabbedActionFormResult<TAction>> {
        const tab = this.tabs.find((tab) => tab.id === selectedTabId) ?? this.tabs[0];
        const form = new ActionFormData();

        form.title(`${TITLE_MARKER}${this.titleText}`);
        for (const button of tab.buttons) {
            form.button(button.text, button.iconPath);
        }
        for (const candidate of this.tabs) {
            form.button(`${CATEGORY_MARKER} ${candidate.label}`);
        }

        form.body(this.bodyText);

        const response: ActionFormResponse = await form.show(player);
        if (response.canceled || response.selection === undefined) {
            return { canceled: true, tabId: tab.id };
        }

        if (response.selection >= tab.buttons.length) {
            const tabIndex = response.selection - tab.buttons.length;
            const nextTab = this.tabs[tabIndex] ?? tab;
            return this.show(player, nextTab.id);
        }

        const selectedButton = tab.buttons[response.selection];
        return {
            canceled: false,
            tabId: tab.id,
            action: selectedButton.action,
            value: selectedButton.value,
        };
    }
}
