import { type CardCost } from './cards/cardUtils';
import { IPlayer } from './entity/Player';
import Underworld from './Underworld';
import { CardCategory, WizardType } from './types/commonTypes';
export interface IUpgrade {
    title: string;
    replaces?: string[];
    requires?: string[];
    modName?: string;
    type: 'card' | 'special' | 'mageType';
    omitForWizardType?: WizardType[];
    cardCategory?: CardCategory;
    description: (player: IPlayer) => string;
    thumbnail: string;
    effect: (player: IPlayer, underworld: Underworld) => void;
    probability: number;
    cost: CardCost;
}
export declare const filterUpgrades: (u: IUpgrade, player: Pick<IPlayer, "upgrades" | "inventory">, underworld: Pick<Underworld, "activeMods" | "rules">) => boolean;
export declare function omitRerolledUpgrades(upgradeList: IUpgrade[]): IUpgrade[];
export declare function generateUpgrades(player: IPlayer, numberOfUpgrades: number, underworld: Underworld): IUpgrade[];
export declare function createUpgradeElement(upgrade: IUpgrade, player: IPlayer, underworld: Underworld): HTMLDivElement | undefined;
export declare function getUpgradeByTitle(title: string): IUpgrade | undefined;
export declare const upgradeSourceWhenDead: IUpgrade[];
export declare const upgradeCardsSource: IUpgrade[];
