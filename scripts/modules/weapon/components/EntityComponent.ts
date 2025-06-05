import { SpawnEntityOptions, VanillaEntityIdentifier } from "@minecraft/server";
import { Component } from "./Component";

type ComponentDataType = {
    entityTypeId: VanillaEntityIdentifier,
    spawnOptions?: SpawnEntityOptions,
}

export class EntityComponent extends Component {
    
    readonly entityTypeId: VanillaEntityIdentifier;
    readonly spawnOptions?: SpawnEntityOptions;

    constructor(data: ComponentDataType) {
        super('entity');

        this.entityTypeId = data.entityTypeId;
        this.spawnOptions = data?.spawnOptions;
    }

}