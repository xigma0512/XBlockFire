import { system } from "@minecraft/server";
import { CustomCommandRegistry, CustomCommand, CustomCommandOrigin, CustomCommandResult } from "@minecraft/server";

import * as RoomCommand from "./handlers/Rooms";

type CommandCallbackType = (origin: CustomCommandOrigin, ...args: any[]) => CustomCommandResult | undefined

export class CommandRegistry {
    
    private static CustomCommandEnums = new Map<string, string[]>();
    private static CustomCommands = new Map<CustomCommand, CommandCallbackType>();
    
    static addCustomCommand(commandInfo: CustomCommand, callback: CommandCallbackType) {
        this.CustomCommands.set(commandInfo, callback);
    }

    static addCustomCommandEnum(enumName: string, enumValues: string[]) {
        this.CustomCommandEnums.set(enumName, enumValues);
    }

    static registerAll(commandRegistry: CustomCommandRegistry) {
        for (const [enumName, enumValues] of this.CustomCommandEnums.entries()) {
            commandRegistry.registerEnum(enumName, enumValues);
        }

        for (const [commandInfo, commandCallback] of this.CustomCommands.entries()) {
            commandRegistry.registerCommand(commandInfo, commandCallback);
        }
    }
}

system.beforeEvents.startup.subscribe(ev => {
    
    RoomCommand.register();

    const commandRegistry = ev.customCommandRegistry;
    CommandRegistry.registerAll(commandRegistry);
});