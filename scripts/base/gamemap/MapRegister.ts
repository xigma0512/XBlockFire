import GameMap from "./GameMap";

export class MapRegister {
    
    private static _instance: MapRegister;
    static get instance() { return (this._instance || (this._instance = new this())); }
    
    readonly availableMaps: Map<number, GameMapType>;
    
    constructor() {
        this.availableMaps = new Map();
        this.initializeMaps();
    }

    getMap(mapId: number) {
        if (this.availableMaps.has(mapId)) {
            return this.availableMaps.get(mapId) as GameMapType;
        }
        throw Error(`Cannot get map ${mapId}.`);
    }

    private initializeMaps() {
        for (const [mapId, mapInfo] of Object.entries(GameMap)) {
            this.availableMaps.set(Number(mapId), mapInfo);
        }
    }

}