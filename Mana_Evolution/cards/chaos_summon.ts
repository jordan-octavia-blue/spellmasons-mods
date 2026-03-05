const {
    rand,
    Unit,
    config,
    commonTypes,
    cards,
    VisualEffects,
    PlanningView,
    cardUtils,
    units,
} = globalThis.SpellmasonsAPI;
const { getUniqueSeedString, chooseOneOfSeeded, seedrandom, randInt } = rand;
const { CardRarity, probabilityMap, CardCategory, Faction, UnitSubType, UnitType } = commonTypes;
const { addWarningAtMouse } = PlanningView;
const { playDefaultSpellSFX } = cardUtils;
const { skyBeam } = VisualEffects;
const { allUnits } = units;
const { addUnitTarget, refundLastSpell} = cards;
import type { Spell } from '../../types/cards/index';
const id  = 'Capture Soul';
const bossmasonUnitId = 'Deathmason',
    spellmasonUnitId = 'Spellmason',
    golem_unit_id = 'golem',
    ARCHER_ID = 'archer',
    ANCIENT_UNIT_ID = 'ancient',
    GLOP_UNIT_ID = 'glop',
    gripthulu_id = 'gripthulu',
    BLOOD_GOLEM_ID = 'Blood Golem',
    POISONER_ID = 'poisoner',
    VAMPIRE_ID = 'vampire',
    BLOOD_ARCHER_ID = 'Blood Archer',
    PRIEST_ID = 'priest',
    SUMMONER_ID = 'summoner',
    GHOST_ARCHER_ID = 'Ghost Archer',
    MANA_VAMPIRE_ID = 'Mana Vampire',
    DARK_PRIEST_ID = 'dark priest',
    DARK_SUMMONER_ID = 'Dark Summoner',
    urn_explosive_id = 'Explosive Urn',
    urn_ice_id = 'Ice Urn',
    urn_poison_id = 'Toxic Urn',
    CORRUPTED_ANCIENT_UNIT_ID = 'Corrupted Ancient',
    goru_id = 'Goru',
    greenGlopId = 'Green Glop';

const summonableUnits = [bossmasonUnitId,
    spellmasonUnitId,
    golem_unit_id,
    ARCHER_ID,
    ANCIENT_UNIT_ID,
    GLOP_UNIT_ID,
    gripthulu_id,
    BLOOD_GOLEM_ID,
    POISONER_ID,
    VAMPIRE_ID,
    BLOOD_ARCHER_ID,
    PRIEST_ID,
    SUMMONER_ID,
    GHOST_ARCHER_ID,
    MANA_VAMPIRE_ID,
    DARK_PRIEST_ID,
    DARK_SUMMONER_ID,
    urn_explosive_id,
    urn_ice_id,
    urn_poison_id,
    CORRUPTED_ANCIENT_UNIT_ID,
    goru_id,
    greenGlopId];
const slimeId = 'Slime',
    defianceId = 'Defiance',
    confidenceId = 'Confidence',
    unstableId = 'Unstable',
    curseimmunityId = 'CurseImmunity',
    targetImmuneId = 'target_immune',
    growthId = 'Growth',
    damagelimiterId = 'Damage Limiter';
const bossModifiers = [slimeId,
    defianceId,
    confidenceId,
    unstableId,
    curseimmunityId,
    targetImmuneId,
    growthId,
    damagelimiterId
]

    ;
export const chaosSummonId = "Chaos Summon";
const spell: Spell = {
    card: {
        id: chaosSummonId,
        category: CardCategory.Soul,
        sfx: 'summonDecoy',
        supportQuantity: false,
        manaCost: 40,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.SPECIAL],
        thumbnail: 'spellmasons-mods/Mana Evolution/images/chaos_summon.png',
        replaces: [id],
        description: 'Summons a random unit to fight for you. The summoned unit may receive random boss modifiers.',
        allowNonUnitTarget: true,
        effect: async (state, card, quantity, underworld, prediction) => {
            const seedString = `${getUniqueSeedString(underworld, state.casterPlayer)}${state.castLocation.x}${state.castLocation.y}${state.casterUnit.mana}`
            const seed = seedrandom(seedString);
            const unitId = chooseOneOfSeeded(summonableUnits, seed);

            if (unitId) {
                const sourceUnit = allUnits[unitId];
                if (sourceUnit) {
                    const summonLocation = {
                        x: state.castLocation.x,
                        y: state.castLocation.y
                    }
                    if (underworld.isCoordOnWallTile(summonLocation)) {
                        if (prediction) {
                            const WARNING = "Invalid Summon Location";
                            addWarningAtMouse(WARNING);
                        } else {
                            refundLastSpell(state, prediction, 'Invalid summon location, mana refunded.')
                        }
                        return state;
                    }
                    playDefaultSpellSFX(card, prediction);
                    const unit = Unit.create(
                        sourceUnit.id,
                        summonLocation.x,
                        summonLocation.y,
                        Faction.ALLY,
                        sourceUnit.info.image,
                        UnitType.AI,
                        sourceUnit.info.subtype,
                        {
                            ...sourceUnit.unitProps,
                            healthMax: (sourceUnit.unitProps.healthMax || underworld.rules.UNIT_BASE_HEALTH),
                            health: (sourceUnit.unitProps.health || underworld.rules.UNIT_BASE_HEALTH),
                            damage: (sourceUnit.unitProps.damage || 0),
                            strength: 1,
                            isMiniboss: randInt(0,3,seed) == 0
                        },
                        underworld,
                        prediction,
                        state.casterUnit
                    );

                    addUnitTarget(unit, state, prediction);

                    if (!prediction) {
                        // Animate effect of unit spawning from the sky
                        skyBeam(unit);
                    }
                } else {
                    console.error(`Source unit ${unitId} is missing`);
                }
                return state;
            } else {
                if (prediction) {
                    const WARNING = "Invalid Summon Location";
                    addWarningAtMouse(WARNING);
                } else {
                    refundLastSpell(state, prediction, 'Invalid summon location, mana refunded.')
                }
                return state;
            }


        },
    },
};
export default spell;
