import { Player, system, world } from "@minecraft/server";
import { Commands } from "./Commands";

const COMMAND_IDENTIFIER = 'blockfire:'
const COMMAND_PREFIX = './bf';

system.afterEvents.scriptEventReceive.subscribe(ev => {
    try
    {
        if (!ev.id.startsWith(COMMAND_IDENTIFIER)) return;
        
        const executer = ev.sourceEntity;
        if (!(executer instanceof Player)) return;

        const cmdName = ev.id.replace(COMMAND_IDENTIFIER, '');
        const args = ev.message.split(' ');
        if (!Commands.has(cmdName)) throw Error(`Missing command name: '${cmdName}'`);
        
        Commands.get(cmdName)!(executer, ...args);
    }
    catch (err: any)
    {
        console.error(`Command executed failed.`);
        console.error(`sender: ${ev.sourceEntity?.nameTag} | id: ${ev.id} | message: ${ev.message}`);
        console.error(`error: ${err}`);
        
        if (ev.sourceEntity instanceof Player) ev.sourceEntity?.sendMessage(err.message);
    }
});

world.beforeEvents.chatSend.subscribe(ev => {
    try
    {
        if (!ev.message.startsWith(COMMAND_PREFIX)) return;
        ev.cancel = true;

        const executer = ev.sender;
        const args = ev.message.split(' ');
        const cmdName = args[1];

        args.splice(0, 2);
        if (!Commands.has(cmdName)) throw Error(`Missing command name: '${cmdName}'`);
        Commands.get(cmdName)!(executer, ...args);
    }
    catch (err: any)
    {
        console.error(`Command executed failed.`);
        console.error(`sender: ${ev.sender.nameTag} | message: ${ev.message}`);
        console.error(`error: ${err}`);
        ev.sender.sendMessage(err.message);
    }
});