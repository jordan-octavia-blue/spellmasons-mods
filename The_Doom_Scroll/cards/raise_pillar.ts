/// <reference path="../../globalTypes.d.ts" />
const {
  commonTypes,
  Unit,
  units,
  config,
  cards,
  cardUtils,
  PlanningView,
  VisualEffects,
  forcePushAwayFrom
} = globalThis.SpellmasonsAPI
const {CardCategory, CardRarity, probabilityMap, Faction, UnitType} = commonTypes;
const {takeDamage} = Unit;
const { allUnits } = units;
const { skyBeam } = VisualEffects;
const {refundLastSpell, getCurrentTargets, defaultTargetsForAllowNonUnitTargetTargetingSpell} = cards;
const { playDefaultSpellSFX} =cardUtils;
const { addWarningAtMouse, drawUICirclePrediction } = PlanningView;
import type { Spell } from '../../types/cards';
import type { IUnit } from '../../types/entity/Unit';
import type { Vec2 } from '../../types/jmath/Vec';
import type Underworld from '../../types/Underworld';



const id = 'Raise Pillar';
export { id as pillarId };
const spell: Spell = {
  card: {
    id,
    category: CardCategory.Soul,
    sfx: 'summonDecoy',
    supportQuantity: false,
    manaCost: 20,
    healthCost: 0,
    expenseScaling: 2,
    probability: probabilityMap[CardRarity.COMMON],
    thumbnail: 'spellmasons-mods/The_Doom_Scroll/graphics/spellIconRaise_Pillar.png',
    description: 'Raise a pillar at the target location, dealing 10 damage to nearby enemies and pushing them away.',
    allowNonUnitTarget: true,
    effect: async (state, card, quantity, underworld, prediction) => {
      const unitId = 'pillar';
      const sourceUnit = allUnits[unitId];
      if (sourceUnit) {
        const currentTargets = getCurrentTargets(state)
        const newPillarLocations = currentTargets.length ? currentTargets : [state.castLocation]
        for(let target of newPillarLocations){
          const summonLocation = {
            x: target.x,
            y: target.y
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
              healthMax: (sourceUnit.unitProps.healthMax || config.UNIT_BASE_HEALTH) * quantity,
              health: (sourceUnit.unitProps.health || config.UNIT_BASE_HEALTH) * quantity,
              damage: (sourceUnit.unitProps.damage || 0) * quantity,
              strength: quantity
            },
            underworld,
            prediction,
            state.casterUnit
          );
          if (prediction) {
            drawUICirclePrediction(unit, 32, 0xffffff);
          }
          pillarExplode(unit, 32, 10, underworld, prediction, state);
          if (!prediction) {
            // Animate effect of unit spawning from the sky
            skyBeam(unit);
          }
        }
      } else {
        console.error(`Source unit ${unitId} is missing`);
      }
      return state;
    },
  },
};
async function pillarExplode(caster: IUnit, radius: number, damage: number, underworld: Underworld, prediction: boolean, state: any) {
  const units = underworld.getUnitsWithinDistanceOfTarget(caster, radius, prediction)
    .filter(u => u.id != caster.id)
    .filter(u => u.unitSourceId != 'pillar');
  units.forEach(u => {
    // Deal damage to units
    takeDamage({
      unit: u,
      amount: damage,
      sourceUnit: caster,
      fromVec2: caster,
    }, underworld, prediction);
  });

  units.forEach(u => {
    // Push units away from exploding location
    const pushDistance = 32
    forcePushAwayFrom(u, state.casterUnit, pushDistance, underworld, prediction, caster);
  })

  underworld.getPickupsWithinDistanceOfTarget(caster, radius, prediction)
    .forEach(p => {
      // Push pickups away    
    const pushDistance = 32
      forcePushAwayFrom(p, state.casterUnit, pushDistance, underworld, prediction, caster);
    })
}
export default spell;
