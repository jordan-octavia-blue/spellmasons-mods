export interface HandmadeMap {
    data: number[];
    height: number;
    width: number;
    name?: string;
}
export declare const handmadeMaps: HandmadeMap[];
export declare function fixLiquid(map: HandmadeMap): HandmadeMap;
