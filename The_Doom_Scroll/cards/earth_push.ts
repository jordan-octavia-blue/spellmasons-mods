/// <reference path="../../globalTypes.d.ts" />
const {
  commonTypes,
  Unit,
  math,
  config,
  PixiUtils,
  moveWithCollision,
  cardUtils,
  cards,
  JImage,
  forcePushTowards,
} = globalThis.SpellmasonsAPI
const {CardCategory, CardRarity, probabilityMap, Faction, UnitSubType, UnitType} = commonTypes;
const {takeDamage} = Unit;
const { containerProjectiles } = PixiUtils;
const { makeForceMoveProjectile } = moveWithCollision;
const { playDefaultSpellSFX } = cardUtils;
const { refundLastSpell } = cards;
import type { Spell } from '../../types/cards';
import type Image from '../../types/graphics/Image';
import type { HasSpace } from '../../types/entity/Type';
import { pillarId } from './raise_pillar';
import type { IUnit } from '../../types/entity/Unit';

const id = 'Earth Push';
const defaultPushDistance =140;
const spell: Spell = {
  card: {
    id,
    category: CardCategory.Damage,
    supportQuantity: true,
    sfx: 'push',
    manaCost: 15,
    healthCost: 0,
    expenseScaling: 1,
    requires: [pillarId],
    probability: probabilityMap[CardRarity.COMMON],
    thumbnail: 'spellmasons-mods/The_Doom_Scroll/graphics/spellIconEarthPush.png',
    description: 'Launches targeted traps, pillars, and urns towards the cast location. Pillars deal 60 damage each and urns explode on collision with units.',   
    ignoreRange: true,
    effect: async (state, card, quantity, underworld, prediction) => {
      let promises = [];
      const collideFnKey = 'earth_push';
      playDefaultSpellSFX(card, prediction);
      const pickupTargets = state.targetedPickups.filter(p => p.name === 'Trap');
      const pillarTargets = state.targetedUnits.filter(u => u.unitSourceId === 'pillar');
      const urnTargets = state.targetedUnits.filter(u => u.unitSourceId === 'Ice Urn' || u.unitSourceId === 'Explosive Urn' || u.unitSourceId === 'Toxic Urn');
      if (pickupTargets.length == 0 && pillarTargets.length == 0 && urnTargets.length == 0) {
        refundLastSpell(state, prediction, "Target a trap, pillar, or urn");
      } else {
        if (pickupTargets.length > 0) {
            for (let pickup of pickupTargets) {
                promises.push(forcePushTowards(pickup, state.castLocation, defaultPushDistance *3* quantity, underworld, prediction, state.casterUnit));
            }
        }
        if (pillarTargets.length > 0) {
            for (let pillar of pillarTargets) {
                //promises.push(forcePushTowards(pillar, state.casterUnit, defaultPushDistance *3* quantity, underworld, prediction, state.casterUnit));    
                let casterPositionAtTimeOfCast = pillar;
                let target = state.castLocation;
                let image: Image.IImageAnimated | undefined;
                const startPoint = casterPositionAtTimeOfCast;
                const velocity = math.similarTriangles(target.x - startPoint.x, target.y - casterPositionAtTimeOfCast.y, math.distance(startPoint, target), config.ARROW_PROJECTILE_SPEED)
                if (!prediction) {
                    image = JImage.create(casterPositionAtTimeOfCast, 'pillar', containerProjectiles)
                    if (image) {
                        image.sprite.rotation = Math.atan2(velocity.y, -velocity.x);
                    }
                }
                const pushedObject: HasSpace = {
                    x: casterPositionAtTimeOfCast.x,
                    y: casterPositionAtTimeOfCast.y,
                    radius: 1,
                    inLiquid: false,
                    image,
                    immovable: false,
                    beingPushed: false,
                    debugName: 'pillar_proj'
                    }
                Unit.cleanup(pillar);
                    makeForceMoveProjectile({
                    sourceUnit: state.casterUnit,
                    pushedObject,
                    startPoint,
                    velocity,
                    piercesRemaining: 0,
                    bouncesRemaining: 0,
                    collidingUnitIds: [state.casterUnit.id],
                    collideFnKey,
                    state,
                    }, underworld, prediction);
            }
        }
        if (urnTargets.length > 0) {
            for (let urn of urnTargets) {
                //promises.push(forcePushTowards(pillar, state.casterUnit, defaultPushDistance *3* quantity, underworld, prediction, state.casterUnit));    
                let casterPositionAtTimeOfCast = urn;
                let target = state.castLocation;
                let image: Image.IImageAnimated | undefined;
                const startPoint = casterPositionAtTimeOfCast;
                const velocity = math.similarTriangles(target.x - startPoint.x, target.y - casterPositionAtTimeOfCast.y, math.distance(startPoint, target), config.ARROW_PROJECTILE_SPEED)
                if (!prediction && urn.image) {
                    image = JImage.load(JImage.serialize(urn.image),containerProjectiles)
                    if (image) {
                        image.sprite.rotation = Math.atan2(velocity.y, velocity.x);
                    }
                }
                const pushedObject: HasSpace = {
                  x: casterPositionAtTimeOfCast.x,
                  y: casterPositionAtTimeOfCast.y,
                  radius: 1,
                  inLiquid: false,
                  image,
                  immovable: false,
                  beingPushed: false,
                  debugName: urn.unitSourceId
                }
                Unit.cleanup(urn);
                makeForceMoveProjectile({
                  sourceUnit: state.casterUnit,
                  pushedObject,
                  startPoint,
                  velocity,
                  piercesRemaining: 0,
                  bouncesRemaining: 0,
                  collidingUnitIds: [state.casterUnit.id],
                  collideFnKey,
                  state,
                }, underworld, prediction);
            }
            
        }
      }
      await Promise.all(promises);
      return state;
    },
  },
  events: {
    onProjectileCollision: ({ unit, underworld, projectile, prediction }) => {
        if (unit) {
            if (projectile.pushedObject.debugName === 'pillar_proj') {
                takeDamage({
                    unit: unit as IUnit,
                    amount: 60,
                    sourceUnit: projectile.sourceUnit,
                    fromVec2: projectile.startPoint,
                    thinBloodLine: true,
                }, underworld, prediction);
            } else if (projectile.pushedObject.debugName && projectile.pushedObject.debugName.includes('Urn')) {
              const urn = Unit.create(projectile.pushedObject.debugName, projectile.pushedObject.x, projectile.pushedObject.y, Faction.ALLY, 'urn_ice', UnitType.AI, UnitSubType.DOODAD, undefined, underworld, prediction, projectile.sourceUnit);
              takeDamage({unit:urn, amount:urn.health,sourceUnit:projectile.sourceUnit},underworld, prediction)
            }
        }
    }
  },
};
export default spell;
