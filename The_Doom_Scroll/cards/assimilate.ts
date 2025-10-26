/// <reference path="../../globalTypes.d.ts" />
const {
  commonTypes,
  Unit,
  colors,
  config,
  math,
  Vec,
  PlanningView,
  JPromise
} = globalThis.SpellmasonsAPI
const { add } = Vec;
const { CardCategory, CardRarity, probabilityMap, UnitType } = commonTypes;
const { distance } = math;
const { drawPredictionLine, drawUICircleFillPrediction } = PlanningView;
const { raceTimeout } = JPromise;
import type { Vec2 } from '../../types/jmath/Vec';
import type { EffectState, Spell } from '../../types/cards';
import type { HasSpace } from '../../types/entity/Type';
import type Underworld from '../../types/Underworld';
import type { IUnit } from '../../types/entity/Unit';


const id = 'Assimilate';
const numberOfTargetsPerQuantity = 5;
const baseRadius = 250;
const spell: Spell = {
  card: {
    id,
    category: CardCategory.Soul,
    manaCost: 0,
    healthCost: 50,
    expenseScaling: 2,
    costGrowthAlgorithm: 'exponential',
    probability: probabilityMap[CardRarity.RARE],
    thumbnail: 'spellmasons-mods/The_Doom_Scroll/graphics/spellIconAssimilate.png',
    supportQuantity: true,
    requiresFollowingCard: false,
    allowNonUnitTarget: true,
    omitForWizardType: ['Deathmason', 'Goru'],
    description: 'Connects the caster to 5 nearby targets per cast, sacrificing them and funneling their power into the caster. Can only be cast once',
    effect: async (state, card, quantity, underworld, prediction) => {
      let limitTargetsLeft = numberOfTargetsPerQuantity * quantity + 1;
      let potentialTargets: IUnit[] = [];
      underworld.getPotentialTargets(prediction).filter(t => Unit.isUnit(t)).sort((a, b) => distance(a, state.casterUnit) - distance(b, state.casterUnit)).slice(0, limitTargetsLeft).forEach(u => {if (Unit.isUnit(u))potentialTargets.push(u)});
      // Note: This loop must NOT be a for..of and it must cache the length because it
      // mutates state.targetedUnits as it iterates.  Otherwise it will continue to loop as it grows
      const wizard = state.casterUnit;
      let targets = [wizard];
      const length = targets.length;
      const linkGroups: AnimateConnectLinks[][] = [];
      //for (let i = 0; i < length; i++) {
      // Refresh current targets so connect doesn't re-target already
      // targeted units
      const target = wizard;
      const filterFn = (x: any) => {
        if (Unit.isUnit(x)) {
          return true;
        } else {
          // Do not match unit and non unit
          return false;
        }
      }

      // Connect does not get extra radius from quantity,
      // but can instead chain to more targets
      // +25% range per radius boost
      const adjustedRadius = baseRadius * (1 + (0.10 * state.aggregator.radiusBoost))

      // Find all units touching the spell origin
      const chained = getConnectingUnits(
        target,
        adjustedRadius,
        limitTargetsLeft,
        targets,
        potentialTargets,
        filterFn,
        prediction
      );
      // Draw prediction lines so user can see how it chains
      if (prediction) {
        chained.forEach(chained_entity => {
          drawPredictionLine(chained_entity.chainSource, chained_entity.entity);
        });
      } else {
        linkGroups.push(chained.map(x => ({ from: x.chainSource, targets: [{ to: x.entity, playedSound: false }] })));
      }
      // Update effectState targets
      chained.forEach(u => targets.push(u.entity));
      //}
      //}
      if (!prediction) {
        await animateConnections(linkGroups, underworld, prediction);
      }
      const filterCasterOut = (x: IUnit) => {
        if (x == state.casterUnit) {
          return false; // Do not include caster in the merge
        } else {
          return true;
        }
      }
      mergeUnits(state.casterUnit, targets.filter(x => filterCasterOut(x)), underworld, prediction, state);
      if (!prediction && !globalThis.headless && state.casterPlayer) {
        await new Promise(res => {
          setTimeout(res, 200);
        })
        if (!state.casterPlayer.disabledCards) {
          state.casterPlayer.disabledCards = []
        }
        state.casterPlayer.disabledCards.push('Assimilate');
      }
      return state;
    },
  },
};
export function mergeUnits(target: IUnit, unitsToMerge: IUnit[], underworld: Underworld, prediction: boolean, state?: EffectState) {
  let storedModifiers = [];
  for (const unit of unitsToMerge) {
    // Prediction Lines
    if (prediction) {
      const graphics = globalThis.predictionGraphicsBlue;
      if (graphics) {
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.moveTo(unit.x, unit.y);
        graphics.lineTo(target.x, target.y);
        graphics.drawCircle(target.x, target.y, 2);
      }
    }

    if (target.unitType == UnitType.PLAYER_CONTROLLED) {
      // Players only gain current stats, for balance purposes
      target.health += unit.health;
      target.mana += unit.mana;
      // Allows player to grow in size
      target.stamina += unit.stamina;
      target.soulFragments += unit.soulFragments;
      target.moveSpeed += unit.moveSpeed / 10;
      target.strength += unit.strength;
    } else {
      // Combine Stats
      target.healthMax += unit.healthMax;
      target.health += unit.health;
      target.manaMax += unit.manaMax;
      target.mana += unit.mana;

      target.damage += unit.damage;
      target.manaCostToCast += unit.manaCostToCast;
      target.manaPerTurn += unit.manaPerTurn;
      target.strength += unit.strength;
    }
    // Kill/Delete the unit that got merged
    if (unit.unitType == UnitType.PLAYER_CONTROLLED) {
      // Players die instead of being deleted
      Unit.die(unit, underworld, prediction);
    } else {
      // Give XP
      // This gives xp immediately when something gets merged, but ideally:
      // - Would be stored in an OnDeathEvent on the primary target instead of being immediate
      // - Would run the rest of the reportEnemyKilled() logic, for stat tracking and whatever else
      if (unit.originalLife) {
        underworld.enemiesKilled++;
      }

      if (state) {
        state.targetedUnits = state.targetedUnits.filter(u => u != unit);
      }

      Unit.cleanup(unit);
    }
  }
  return state;
}
export function getConnectingUnits(
  source: IUnit,
  radius: number,
  chainsLeft: number,
  targets: IUnit[] = [],
  potentialTargets: IUnit[],
  filterFn: (x: any) => boolean, //selects which type of entities this can chain to
  prediction: boolean,
  radiusFn?: (chainSource: IUnit, chainsLeft: number) => number,
): { chainSource: IUnit, entity: IUnit }[] {

  potentialTargets = potentialTargets
    .filter(x => filterFn(x))
    .filter(t => !targets.includes(t));

  let connected: { chainSource: IUnit, entity: IUnit }[] = [];
  if (chainsLeft > 0) {
    connected = getNextConnectingEntities(source, radius, chainsLeft, potentialTargets, prediction, radiusFn)
  }
  return connected;
}

export function getNextConnectingEntities(
  source: IUnit,
  baseRadius: number,
  chainsLeft: number,
  potentialTargets: IUnit[],
  prediction: boolean,
  radiusModifierFn?: (chainSource: IUnit, chainsLeft: number) => number,
): { chainSource: IUnit, entity: IUnit }[] {

  potentialTargets = potentialTargets.filter(x => x != source);

  let adjustedRadius = baseRadius;
  if (radiusModifierFn) {
    adjustedRadius *= radiusModifierFn(source, chainsLeft);
  }

  if (prediction) {
    drawUICircleFillPrediction(source, adjustedRadius - config.COLLISION_MESH_RADIUS / 2, colors.trueWhite);
  }

  let connected: { chainSource: IUnit, entity: IUnit }[] = [];
  do {
    let closestDist = adjustedRadius;
    let closestTarget: IUnit | undefined = undefined;

    for (let t of potentialTargets) {
      const dist = math.distance(t, source);
      if (dist <= closestDist) {
        closestDist = dist;
        closestTarget = t;
      }
    }

    if (closestTarget) {
      connected.push({ chainSource: source, entity: closestTarget });
      chainsLeft--;
      if (chainsLeft > 0) {
        const next = getNextConnectingEntities(closestTarget, baseRadius, chainsLeft, potentialTargets, prediction, radiusModifierFn)
        chainsLeft -= next.length;
        connected = connected.concat(next);
        potentialTargets = potentialTargets.filter(x => {
          for (let c of connected) {
            if (x == c.entity) return false; //filter out targets in the connected tree
          }
          return true; //include all targets not in the connected tree
        });
      }
    }
    else //No targets to chain to, no reason to looping anymore
    {
      break;
    }

  } while (chainsLeft + 1 > 0)

  return connected;
}

const timeoutMsAnimation = 2000;
export async function animateConnections(links: AnimateConnectLinks[][], underworld: Underworld, prediction: boolean) {
  if (globalThis.headless || prediction) {
    // Animations do not occur on headless, so resolve immediately or else it
    // will just waste cycles on the server
    return Promise.resolve();
  }
  if (links.length == 0) {
    // Prevent this function from running if there is nothing to animate
    return Promise.resolve();
  }
  // Keep track of which entities have been targeted so far for the sake
  // of making a new sfx when a new entity gets targeted
  const entitiesTargeted: HasSpace[] = [];
  return raceTimeout(timeoutMsAnimation, 'animatedConnect', new Promise<void>(resolve => {
    animateFrame(links, Date.now(), entitiesTargeted, underworld, resolve, prediction)();
  }));
}
interface AnimateConnectLinks {
  from: Vec2;
  targets: { to: Vec2, playedSound: boolean }[];
}
const millisToGrow = 750;
// Smaller circle is more asethetic for connect since the line grows from one circle's edge to another
const circleRadius = config.COLLISION_MESH_RADIUS / 2;
function animateFrame(linkGroups: AnimateConnectLinks[][], startTime: number, entitiesTargeted: HasSpace[], underworld: Underworld, resolve: (value: void | PromiseLike<void>) => void, prediction: boolean) {
  return function animateFrameInner() {
    if (globalThis.headless || prediction) {
      resolve();
      return;
    }
    if (globalThis.predictionGraphicsGreen) {
      globalThis.predictionGraphicsGreen.clear();
      globalThis.predictionGraphicsGreen.lineStyle(2, 0xffffff, 1.0)
      const now = Date.now();
      const timeDiff = now - startTime;
      for (let links of linkGroups) {
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          if (!link) {
            continue;
          }
          const { from, targets } = link;
          const proportionComplete = math.lerpSegmented(0, 1, timeDiff / millisToGrow, i, links.length);
          for (let target of targets) {
            if (proportionComplete === 0) {
              continue;
            }
            const { to } = target;
            const dist = distance(from, to)
            const edgeOfStartCircle = add(from, math.similarTriangles(to.x - from.x, to.y - from.y, dist, circleRadius));
            globalThis.predictionGraphicsGreen.moveTo(edgeOfStartCircle.x, edgeOfStartCircle.y);
            const edgeOfCircle = add(to, math.similarTriangles(from.x - to.x, from.y - to.y, dist, circleRadius));
            const pointApproachingTarget = add(edgeOfStartCircle, math.similarTriangles(edgeOfCircle.x - edgeOfStartCircle.x, edgeOfCircle.y - edgeOfStartCircle.y, dist, dist * Math.min(1, proportionComplete)));
            globalThis.predictionGraphicsGreen.lineTo(pointApproachingTarget.x, pointApproachingTarget.y);
            if (proportionComplete >= 1) {
              globalThis.predictionGraphicsGreen.drawCircle(to.x, to.y, circleRadius);
              // Play sound when new target is animated to be selected
              if (!target.playedSound) {
                target.playedSound = true;
              }
            }
          }
        }
      }
      // + 250 to give time for the final circles to show
      if (timeDiff > millisToGrow + 250) {
        resolve();
        globalThis.predictionGraphicsGreen.clear();
        return;
      } else {
        requestAnimationFrame(animateFrame(linkGroups, startTime, entitiesTargeted, underworld, resolve, prediction));
      }
    } else {
      resolve();
    }
  }
}

export default spell;
