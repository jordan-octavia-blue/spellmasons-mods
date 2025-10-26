/// <reference path="../../globalTypes.d.ts" />
const {
  commonTypes,
  Unit,
  units,
  config,
  Vec,
  moveWithCollision,
  cards,
  cardUtils,
  PlanningView,
  VisualEffects,
  forcePushAwayFrom
} = globalThis.SpellmasonsAPI
const {CardCategory, CardRarity, probabilityMap, Faction, UnitType} = commonTypes;
const {takeDamage} = Unit;
const { moveAlongVector, normalizedVector } = moveWithCollision;
const { invert } = Vec;
const { refundLastSpell } = cards;
const { playDefaultSpellSFX } = cardUtils;
const { addWarningAtMouse, drawUICirclePrediction } = PlanningView;
const { skyBeam } = VisualEffects;
const { allUnits } = units;
import { getCurrentTargets, type Spell } from '../../types/cards';
import type { IUnit } from '../../types/entity/Unit';
import type { Vec2 } from '../../types/jmath/Vec';
import type Underworld from '../../types/Underworld';
import { pillarId } from './raise_pillar';


const id = 'Raise Wall';
export { id as raiseWallId };
const range = 250;
const baseWidth = 48;
const timeoutMsAnimation = 2000;
const spell: Spell = {
  card: {
    id,
    category: CardCategory.Soul,
    supportQuantity: true,
    manaCost: 30,
    healthCost: 0,
    expenseScaling: 1,
    probability: probabilityMap[CardRarity.SPECIAL],
    thumbnail: 'spellmasons-mods/The_Doom_Scroll/graphics/spellIconRaise_Wall.png',
    requiresFollowingCard: false,
    description: 'Raise a wall of pillars at the target location, blocking enemy movement but allowing projectiles through.',
    requires: [pillarId],
    allowNonUnitTarget: true,
    effect: async (state, card, quantity, underworld, prediction, outOfRange) => {
      const unitId = 'pillar';
            const sourceUnit = allUnits[unitId];
            const vector = normalizedVector(state.casterUnit, state.castLocation).vector;
            if (vector) {
            let spawnpoints: Vec2[] = getSpawnPoints(state.castLocation, vector, baseWidth, quantity);
            const length = spawnpoints.length;
            for (let i = 0; i < length; i++) {
              const target = spawnpoints[i];
              if (sourceUnit && target) {
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
                if (prediction) {
                  drawUICirclePrediction(target, 32, 0xffffff);
                }
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
                    healthMax: (sourceUnit.unitProps.healthMax || config.UNIT_BASE_HEALTH),
                    health: (sourceUnit.unitProps.health || config.UNIT_BASE_HEALTH),
                    damage: (sourceUnit.unitProps.damage || 0) * quantity,
                    strength: quantity
                  },
                  underworld,
                  prediction,
                  state.casterUnit
                );
                pillarExplode(unit, 32, 10, underworld, prediction, state);
                if (!prediction) {
                  // Animate effect of unit spawning from the sky
                  skyBeam(unit);
                }
              } else {
                console.error(`Source unit ${unitId} is missing`);
              }
          }
            }
            return state;
    },
  },
};
export function getSpawnPoints(castLocation: Vec2, vector: Vec2, width: number, quantity: number): Vec2[] {
    let points: Vec2[] = [];
    points.push(castLocation);
    const p1 = moveAlongVector(castLocation, invert(vector), -width);
    const p2 = moveAlongVector(castLocation, invert(vector), width);
    points.push(p1);
    points.push(p2);
    if (quantity > 1) {
        for (let i = 2; i <= quantity; i++) {
            const p3 = moveAlongVector(castLocation, invert(vector), -width*i);
            const p4 = moveAlongVector(castLocation, invert(vector), width*i);
            points.push(p3);
            points.push(p4);
        }
    }
    return points;
}
const millisToGrow = 1000;
function distanceAlongColumn(point: Vec2, columnOrigin: Vec2, vector: Vec2): number {
  const vectorToPoint = Vec.subtract(point, columnOrigin);
  // Vector is the direction the column extends
  // Vector is already normalized in effect, so no need to normalize it again here
  const projection = Vec.projectOnNormal(vectorToPoint, vector);

  // if (predictionGraphicsGreen) {
  //   const projectionEnd = Vec.add(columnOrigin, projection);
  //   predictionGraphicsGreen.lineStyle(4, colors.trueBlue, 1.0)
  //   predictionGraphicsGreen.moveTo(columnOrigin.x, columnOrigin.y);
  //   predictionGraphicsGreen.lineTo(projectionEnd.x, projectionEnd.y);
  //   predictionGraphicsGreen.endFill();

  //   const columnEnd = Vec.add(columnOrigin, vector);
  //   predictionGraphicsGreen.lineStyle(2, colors.trueRed, 1.0)
  //   predictionGraphicsGreen.moveTo(columnOrigin.x, columnOrigin.y);
  //   predictionGraphicsGreen.lineTo(columnEnd.x, columnEnd.y);
  //   predictionGraphicsGreen.endFill();
  // }

  return Vec.magnitude(projection);
}
async function pillarExplode(caster: IUnit, radius: number, damage: number, underworld: Underworld, prediction: boolean, state: any) {
  const units = underworld.getUnitsWithinDistanceOfTarget(caster, radius, prediction).filter(u => u.id != caster.id).filter(u => u.unitSourceId != 'pillar');
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