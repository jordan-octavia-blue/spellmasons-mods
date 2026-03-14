import * as Vec from "./jmath/Vec";
import type { IObstacle } from "./entity/Obstacle";
import Underworld, { Biome } from "./Underworld";
export declare const caveSizes: {
    [size: string]: CaveParams;
};
interface CaveParams {
    numberOfLiquidSources?: number;
    minThickness: number;
    startThickness: number;
    startPointJitter: number;
    iterations: number;
    velocity: number;
}
export interface Limits {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
}
export declare function generateCave(params: CaveParams, biome: Biome, underworld: Underworld): {
    map: Map;
    limits: Limits;
    isHandmade: boolean;
    handmadeMapName: string | undefined;
};
export declare function convertBaseTilesToFinalTiles(map: Map): void;
export declare function getLimits(points: Vec.Vec2[]): Limits;
export type Tile = {
    image: string;
} & Vec.Vec2;
export interface Map {
    biome: Biome;
    liquid: Tile[];
    tiles: Tile[];
    width: number;
    height: number;
}
export declare const baseTiles: {
    empty: string;
    wall: string;
    semiWall: string;
    liquid: string;
    ground: string;
};
export declare const makeFinalTileImages: (biome: string) => {
    all_liquid: string;
    all_ground: string;
    liquidInsideCornerNE: string;
    liquidInsideCornerNW: string;
    liquidInsideCornerSE: string;
    liquidInsideCornerSW: string;
    liquidNGroundS: string;
    liquidCornerNE: string;
    liquidCornerNW: string;
    liquidEGroundW: string;
    liquidWGroundE: string;
    liquidSGroundN: string;
    liquidCornerSE: string;
    liquidCornerSW: string;
    wall: string;
    wallN: string;
};
export declare function toObstacle(t: Tile, biome: Biome): IObstacle | undefined;
export {};
