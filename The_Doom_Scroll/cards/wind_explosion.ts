/// <reference path="../../globalTypes.d.ts" />
const {
  commonTypes,
  config,
  Vec,
  JPromise,
  JAudio,
  Polygon2,
  Easing,
  cardUtils,
  cards,
  moveWithCollision,
  forcePushToDestination,
  PlanningView
} = globalThis.SpellmasonsAPI
const { CardCategory, CardRarity, probabilityMap } = commonTypes;
const { raceTimeout } = JPromise;
const { playDefaultSpellSFX } = cardUtils;
const { easeOutCubic } = Easing;
const { getCurrentTargets, defaultTargetsForAllowNonUnitTargetTargetingSpell } = cards;
const { playSFXKey } = JAudio;
const { invert } = Vec;
const { moveAlongVector, normalizedVector } = moveWithCollision;
const { drawUIPolyPrediction } = PlanningView;
const { isVec2InsidePolygon } = Polygon2;
import type { Vec2 } from '../../types/jmath/Vec';
import type { Spell } from '../../types/cards';
import type { HasSpace } from '../../types/entity/Type';
import type Underworld from '../../types/Underworld';
import { windTunnelId } from './wind_tunnel';


const id = 'Wind Explosion';
const defaultPushDistance = 140;
const range = 250;
const baseWidth = 20;
const timeoutMsAnimation = 2000;
const spell: Spell = {
  card: {
    id,
    category: CardCategory.Movement,
    supportQuantity: true,
    manaCost: 30,
    healthCost: 0,
    expenseScaling: 1,
    requires: [windTunnelId],
    probability: probabilityMap[CardRarity.SPECIAL],
    thumbnail: 'spellmasons-mods/The_Doom_Scroll/graphics/spellIconWind_Explosion.png',
    requiresFollowingCard: false,
    description: 'Creates a wind tunnel pointing at each target.',
    allowNonUnitTarget: true,
    effect: async (state, card, quantity, underworld, prediction, outOfRange) => {
      // +50% depth per radius boost
      const adjustedRadiusBoost = quantity - 1 + state.aggregator.radiusBoost;
      const depth = range * (1 + (0.5 * adjustedRadiusBoost));
      // Width doubles up to 4 casts, capping at 8x multiplier: 1 > 2 > 4 > 8
      const width = baseWidth * Math.pow(2, Math.min(quantity, 2)) / 2;

      const targets = getCurrentTargets(state);
      // Note: This loop must NOT be a for..of and it must cache the length because it
      // mutates state.targetedUnits as it iterates.  Otherwise it will continue to loop as it grows
      const animateColumns = [];
      let promises = [];
      for (let target of targets) {
        if (!target) {
          continue;
        }
        const normVec = normalizedVector(state.casterUnit, target).vector;
        if (!normVec) continue;
        const vector = normVec;
        const targetingColumn = getColumnPoints(state.casterUnit, vector, width, depth);
        // Draw visual circle for prediction
        if (prediction) {
          drawUIPolyPrediction(targetingColumn, 0xffffff);
        } else {
          animateColumns.push({ castLocation: target, vector, width, depth });
        }
        const withinColumn = underworld.getPotentialTargets(
          prediction
        ).filter(t => {
          return isVec2InsidePolygon(t, targetingColumn);
        });
        playDefaultSpellSFX(card, prediction);
        for (let entity of withinColumn) {
          if (entity != state.casterUnit) {
            promises.push(forcePushToDestination(entity, moveAlongVector(entity, vector, defaultPushDistance * quantity), 1 + adjustedRadiusBoost, underworld, prediction, state.casterUnit));
          }
        }
      }
      if (!prediction) {
        await animate(animateColumns, underworld, prediction);
      }

      await Promise.all(promises);
      return state;
    },
  },
};
export function getColumnPoints(castLocation: Vec2, vector: Vec2, width: number, depth: number): Vec2[] {
  const p1 = moveAlongVector(castLocation, invert(vector), -width);
  const p2 = moveAlongVector(castLocation, invert(vector), width);
  const p3 = moveAlongVector(p2, vector, depth);
  const p4 = moveAlongVector(p1, vector, depth);
  return [p1, p2, p3, p4];
}
interface Column {
  castLocation: Vec2;
  vector: Vec2;
  width: number;
  depth: number;
}
async function animate(columns: Column[], underworld: Underworld, prediction: boolean) {
  if (globalThis.headless || prediction) {
    // Animations do not occur on headless, so resolve immediately or else it
    // will just waste cycles on the server
    return Promise.resolve();
  }
  if (columns.length == 0) {
    // Prevent this function from running if there is nothing to animate
    return Promise.resolve();
  }
  // Keep track of which entities have been targeted so far for the sake
  // of making a new sfx when a new entity gets targeted
  const entitiesTargeted: HasSpace[] = [];
  playSFXKey('targeting');
  return raceTimeout(timeoutMsAnimation, 'animatedExpand', new Promise<void>(resolve => {
    animateFrame(columns, Date.now(), entitiesTargeted, underworld, resolve)();
  })).then(() => {
    globalThis.predictionGraphicsGreen?.clear();
  });
}
const millisToGrow = 1000;
function animateFrame(columns: Column[], startTime: number, entitiesTargeted: HasSpace[], underworld: Underworld, resolve: (value: void | PromiseLike<void>) => void) {
  return function animateFrameInner() {
    if (globalThis.predictionGraphicsGreen) {
      globalThis.predictionGraphicsGreen.clear();
      const now = Date.now();
      const timeDiff = now - startTime;
      for (let column of columns) {
        const { castLocation, vector, width, depth } = column

        const animatedDepth = depth * easeOutCubic(Math.min(1, timeDiff / millisToGrow));

        const targetingColumn = getColumnPoints(castLocation, vector, width, animatedDepth);
        globalThis.predictionGraphicsGreen.lineStyle(2, 0xffffff, 1.0)
        globalThis.predictionGraphicsGreen.drawPolygon(targetingColumn);
        const withinColumn = underworld.getPotentialTargets(
          false
        ).filter(t => {
          return isVec2InsidePolygon(t, targetingColumn);
        });
        withinColumn.forEach(v => {
          if (!entitiesTargeted.includes(v)) {
            entitiesTargeted.push(v);
            playSFXKey('targetAquired');
          }
          globalThis.predictionGraphicsGreen?.drawCircle(v.x, v.y, config.COLLISION_MESH_RADIUS);
        })
      }

      if (timeDiff > millisToGrow) {
        resolve();
        return;
      } else {
        requestAnimationFrame(animateFrame(columns, startTime, entitiesTargeted, underworld, resolve));
      }
    } else {
      resolve();
    }

  }
}
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
export default spell;