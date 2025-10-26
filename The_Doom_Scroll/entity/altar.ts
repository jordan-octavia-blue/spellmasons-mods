const {commonTypes, Unit, cardsUtil} = globalThis.SpellmasonsAPI
const { UnitSubType } = commonTypes;

import type { UnitSource } from "../../types/entity/units";
import type Underworld from "../../types/Underworld";
import type { bloodDecoy } from "../../types/graphics/ui/colors";
import type { IUnit } from '../../types/entity/Unit';

export const ALTAR_UNIT_ID = 'Altar';
const unit: UnitSource = {
  id: ALTAR_UNIT_ID,
  info: {
    description: 'An intricate pylon raised by a geomancer that is very mana conducive. Spells cast will automatically target this unit.',
    image: 'altar',
    subtype: UnitSubType.DOODAD,
  },
  animations: {
    idle: 'altar',
    hit: 'altar',
    attack: 'altar',
    die: 'altarDeath',
    walk: 'altar',
  },
  sfx: {
    damage: 'unitDamage',
    death: 'decoyDeath',
  },
  unitProps: {
    damage: 0,
    attackRange: 0,
    staminaMax: 0,
    healthMax: 10,
    manaMax: 0,
    // This is critical to a decoy, it prevents it from being pushed due to unit crowding
    immovable: true,
    radius: 48,
    bloodColor: 8082207,
  },
  spawnParams: {
    probability:0,
    excludeMiniboss:true,
    excludeSummonCard:true,
    budgetCost:0,
    unavailableUntilLevelIndex:20,
  },
  init: (unit: IUnit, underworld: Underworld) => {
      Unit.addEvent(unit, EVENT_REMOVE_ON_DEATH_ID);
      cardsUtil.getOrInitModifier(unit, "Target Cursed", { isCurse: false, quantity: 10000, keepOnDeath: false}, () => { });
      if (unit.image) {
        unit.image.sprite.anchor.y = 0.7;
      }
  },
  action: async (_self: IUnit, _attackTargets: IUnit[], _underworld: Underworld, _canAttackTarget: boolean) => { },
  getUnitAttackTargets: (unit: IUnit, underworld: Underworld) => { return []; }
};

const EVENT_REMOVE_ON_DEATH_ID = 'removeOnDeath';
export const modifierRemoveOnDeath = {
    id:EVENT_REMOVE_ON_DEATH_ID,
    onDeath: async (unit: IUnit, underworld: Underworld, prediction: boolean, sourceUnit?: IUnit) => {
      // Remove corpse
      if (!prediction) {
        // Wait for death animation to finish
        setTimeout(() => {
          Unit.cleanup(unit, true);
        }, 1000)
      }
    }
  }

export default unit;
