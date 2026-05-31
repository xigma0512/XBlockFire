import { system } from '@minecraft/server';

export class SystemPerformance {
    private static _instance: SystemPerformance;
    static get instance() {
        return this._instance || (this._instance = new this());
    }

    private _tps: number = 20;
    private _mspt: number = 0;

    private lastTickTime: number = Date.now();
    private tickSamples: number[] = [];
    private readonly SAMPLE_SIZE = 20;

    private constructor() {
        system.runInterval(() => {
            const now = Date.now();
            const tickTime = now - this.lastTickTime;
            this.lastTickTime = now;

            this.tickSamples.push(tickTime);
            if (this.tickSamples.length > this.SAMPLE_SIZE) {
                this.tickSamples.shift();
            }

            const avgTickTime = this.tickSamples.reduce((a, b) => a + b, 0) / this.tickSamples.length;
            this._mspt = avgTickTime;
            this._tps = Math.min(20, 1000 / avgTickTime);
        }, 1);
    }

    get tps() {
        return this._tps;
    }
    get mspt() {
        return this._mspt;
    }
}

export const Performance = SystemPerformance.instance;
