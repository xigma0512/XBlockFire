import { GameEvent } from "./GameEvent";

type Listener<T extends keyof GameEvent> = (data: GameEvent[T]) => void;

class EventEmitter {

    private listeners: Map<keyof GameEvent, Listener<any>[]> = new Map();

    public subscribe<T extends keyof GameEvent>(eventName: T, listener: Listener<T>) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)!.push(listener);
        return listener;
    }

    public unsubscribe<T extends keyof GameEvent>(eventName: T, listenerToRemove: Listener<T>) {
        if (!this.listeners.has(eventName)) return;

        const listeners = this.listeners.get(eventName)!;
        const filteredListeners = listeners.filter((listener) => listener !== listenerToRemove);

        this.listeners.set(eventName, filteredListeners);
    }

    public emit<T extends keyof GameEvent>(eventName: T, data: GameEvent[T]) {
        if (!this.listeners.has(eventName)) return;

        this.listeners.get(eventName)!.forEach((listener) => listener(data));
    }
}

export const gameEvents = new EventEmitter();