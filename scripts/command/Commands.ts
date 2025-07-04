import { Player } from "@minecraft/server";
import { roomCmd } from "./handlers/Rooms";

type CommandHandlerType = (executer: Player, ...args: string[]) => void;

export const Commands = new Map<string, CommandHandlerType>();

Commands.set('room', roomCmd);