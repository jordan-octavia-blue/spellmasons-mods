/// <reference path="../../globalTypes.d.ts" />
const {
  commonTypes,
  Unit,
  colors,
  math,
  config,
  Vec,
  cards,
  PixiUtils,
  moveWithCollision,
  modifierSummonerSickness,
  JImage,
  FloatingText,
  Arrow,
} = globalThis.SpellmasonsAPI
const {clone} = Vec;
const {CardCategory, CardRarity, probabilityMap} = commonTypes;
const { getCurrentTargets } = cards;
const { containerProjectiles } = PixiUtils;
const { makeForceMoveProjectile } = moveWithCollision;
const { summoningSicknessId } = modifierSummonerSickness;
const floatingText = FloatingText.default;
import type { Vec2 } from '../../types/jmath/Vec';
import type { HasSpace } from '../../types/entity/Type';
import type Image from '../../types/graphics/Image'
import type { Spell } from '../../types/cards';
import type { Modifier } from '../../types/cards/util';
import type Underworld from '../../types/Underworld';

export const bloodArrowCardId = 'Bloodied Arrow';
const damage = 10;
interface CurseData {
  modId: string,
  modifier: Modifier
}
const bloodiedArrowEffect = Arrow.arrowEffect(1, bloodArrowCardId);
const corpseDecayId = 'Corpse Decay';
const spell: Spell = {
  card: {
    id: bloodArrowCardId,
    category: CardCategory.Curses,
    probability: probabilityMap[CardRarity.UNCOMMON],
    manaCost: 0,
    healthCost: 10,
    expenseScaling: 1,
    supportQuantity: false,
    ignoreRange: true,
    // so that you can fire the arrow at targets out of range
    allowNonUnitTarget: true,
    // This ensures that "target scamming" doesn't work with target arrow
    // due to it being able to fire out of range
    noInitialTarget: true,
    requiresFollowingCard: false,
    animationPath: '',
    sfx: '',
    thumbnail: 'spellmasons-mods/The_Doom_Scroll/graphics/spellIconBloodArrow.png',
    description: 'Conjures a corrupted arrow that deals 10 damage and TRANSFERS one stack of each curse per stack of Bloodied Arrow from the caster to the victims.',
    effect: async (state, card, quantity, underworld, prediction) => bloodiedArrowEffect(state, card, quantity, underworld, prediction).then((state) => {
      // Purify 1 stack per quantity of every curse
      const modifiersToExclude = [summoningSicknessId, corpseDecayId]
      const curses: CurseData[] = Object.entries(state.casterUnit.modifiers)
        .map(([id, mod]) => ({ modId: id, modifier: mod }))
        .filter(x => x.modifier.isCurse)
        .filter(x => !modifiersToExclude.includes(x.modId));
      for (let curse of curses) {
        curse.modifier.quantity -= quantity;
        if(curse.modifier.quantity <= 0){
          Unit.removeModifier(state.casterUnit, curse.modId, underworld);
        }
      }
      return state;
    }),
  },
  events: {
    onProjectileCollision: ({ unit, pickup, underworld, projectile, prediction }) => {
      if (projectile.state && projectile.sourceUnit) {
        if (unit) {
            Unit.takeDamage({
                      unit: unit,
                      amount: damage,
                      sourceUnit: projectile.sourceUnit,
                      fromVec2: projectile.startPoint,
                      thinBloodLine: true,
                    }, underworld, prediction);
            const modifiersToExclude = [summoningSicknessId, corpseDecayId]
              const curses: CurseData[] = Object.entries(projectile.sourceUnit.modifiers)
                .map(([id, mod]) => ({ modId: id, modifier: mod }))
                .filter(x => x.modifier.isCurse)
                .filter(x => !modifiersToExclude.includes(x.modId));
            for (let curse of curses) {
                  let curseAmount = curse.modifier.quantity;
                  let unitCurseAmount = unit.modifiers[curse.modId]?.quantity || 0;
                  if (unitCurseAmount > curseAmount) {
                    continue;
                  } else if (unitCurseAmount < curseAmount) {
                    // If the unit has less than the curse amount, we can apply it
                    if (!prediction) {
                      floatingText({ coords: unit, text: curse.modId });
                    }
                    if (unit.alive) {
                      Unit.addModifier(unit, curse.modId, underworld, prediction, 1, curse.modifier);
                    }
                  }
              }
        } else {
          // There is no support for adding multiple vector locations as targets
          projectile.state.castLocation = projectile.pushedObject;
        }
      } else {
        console.error("State was not passed through projectile");
      }
    }
  }
};
export default spell;