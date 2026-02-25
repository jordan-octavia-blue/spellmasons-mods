/// <reference path="../globalTypes.d.ts" />

import type { Spell } from '../types/cards/index';
//straight importing from commontypes, don't know why but importing from the api don't work - GQ
import { CardRarity, probabilityMap, CardCategory } from '../types/types/commonTypes';
//import { recalcPositionForCards, syncInventory } from '../types/graphics/ui/CardUI';
import { Mod } from '../types/types/commonTypes';






const {
    cards,
    FloatingText,
    config,
    CardUI
} = globalThis.SpellmasonsAPI;

const Cards = cards
export const sellCardId = 'Sell For Deathmason';
const spell: Spell = {
    card: {
        id: sellCardId,
        replaces: [],
        category: CardCategory.Blessings,
        supportQuantity: false,
        manaCost: 10,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.RARE],
        thumbnail: 'spellmasons-mods/SellforDeathmason/SellforDeathmasonImage.png',
        allowNonUnitTarget: true,
        requiresFollowingCard: true,
        ignoreRange: true,
        animationPath: '',
        sfx: '',
        omitForWizardType: ['Spellmason', 'Goru'],
        description: ['spell_sell'],
        frontload: true,
        effect: async (state, card, quantity, underworld, prediction) => {
            // Clear out the rest of the spell so it doesn't actually cast it
            underworld
            const sellIndex = state.cardIds.indexOf(sellCardId);
            if (sellIndex !== 0) {
                FloatingText.default({ coords: state.castLocation, text: 'sell error' });
                return state;
            }
            if (!prediction && state.casterPlayer) {
                // Use Array.from(new Set()) so that you can't sell the same card more than once
                const cardsToSell = Array.from(new Set(state.cardIds.slice(sellIndex + 1)));
                const sellValues = cardsToSell.map(cardId => {
                    const card = Cards.allCards[cardId];
                    if (card && state.casterPlayer) {
                        //Using the defined value from config, will change in need be - GQ
                        const highestSellVal = config.STAT_POINTS_PER_LEVEL * 2;
                        let sellValue: number;
                        // Summon cards (from summon_generic) have thumbnails starting with "spellIconSummon_"
                        // and soulFragmentCostOverride represents unit budget cost - use this for sell value
                        const isSummonCard = card.thumbnail?.startsWith('spellIconSummon_');
                        if (isSummonCard && !isNullOrUndef(card.soulFragmentCostOverride)) {
                            sellValue = Math.round(Math.min(card.soulFragmentCostOverride * 10, highestSellVal));
                        } else {
                            const rarity: CardRarity = Object.entries(probabilityMap).find(([rarity, probability]) => probability === card.probability)?.[0] as CardRarity || CardRarity.COMMON;
                            sellValue = Math.round({
                                [CardRarity.COMMON]: highestSellVal / 8,
                                [CardRarity.SPECIAL]: highestSellVal / 6,
                                [CardRarity.UNCOMMON]: highestSellVal / 4,
                                [CardRarity.RARE]: highestSellVal / 2,
                                [CardRarity.FORBIDDEN]: highestSellVal,
                                [CardRarity.RUNIC]: highestSellVal / 2,
                            }[rarity]);
                        }
                        state.casterPlayer.statPointsUnspent += sellValue;
                        return `${card.id}: ${sellValue} SP`;
                    } else {
                        return '';
                    }
                });

                // Remove sold cards from inv
                if (!state.casterPlayer.disabledCards) {
                    state.casterPlayer.disabledCards = []
                }
                state.casterPlayer.disabledCards.push(...cardsToSell)
                // Remove sold cards from toolbar (replaces with empty '')
                state.casterPlayer.cardsInToolbar = state.casterPlayer.cardsInToolbar.map(cardId => cardsToSell.includes(cardId) ? '' : cardId);
                //Makes sure sold cards are removed from inventory - GQ
                const removeFromInventory = new Set(cardsToSell);
                state.casterPlayer.inventory = state.casterPlayer.inventory.filter(item => !removeFromInventory.has(item));
                // For the casting player only...
                // Had to import the player def from the spellmason repo, hope that doesn't break anything -GQ
                if (state.casterPlayer === globalThis.player) {
                    FloatingText.default({ coords: state.castLocation, text: sellValues.join('\n') });
                    // Rerender runes menu in case they have the inventory open because they need to see their SP update
                    // renderRunesMenu(underworld);
                    CardUI.recalcPositionForCards(globalThis.player, underworld);
                    CardUI.syncInventory(undefined, underworld);
                }
            }

            state.cardIds = [];
            return state;

        }
    },
};


const mod: Mod = {
    modName: 'Sell for Deathmason',
    author: 'GoldenQuiche',
    description: 'Adds Sell for Deathmason, which is not available in vanilla because it would be broken with him',
    screenshot: 'spellmasons-mods/SellforDeathmason/SellforDeathmasonImage.png',
    spells: [
        spell
    ],
    spritesheet: 'SellforDeathmasonJson.json'
};
export default mod;
