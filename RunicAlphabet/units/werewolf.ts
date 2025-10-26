import type { UnitSource } from '../../../entity/units/index';
import { UnitSubType } from '../../../types/commonTypes';
import { meleeAction } from '../../../entity/units/actions/meleeAction';
import * as config from '../../../config'
import * as Unit from '../../../entity/Unit';
import type Underworld from '../../../Underworld';

export const werewolf_unit_id = 'Werewolf'
const unit: UnitSource = {
    id: werewolf_unit_id,
    info: {
        description: 'werewolf description',
        image: 'newWolfIdle',
        subtype: UnitSubType.MELEE,
    },
    unitProps: {
        damage: 30,
        staminaMax: config.UNIT_BASE_STAMINA,
        healthMax: 20,
        manaMax: 0,
        moveSpeed: 20,
    },
    animations: {
        idle: 'newWolfIdle',
        hit: 'wolfIdle',
        attack: 'wolfIdle',
        die: 'wolfIdle',
        walk: 'wolfIdle',
    },
    sfx: {
        // werewolf shares hurt sfx with archer intentionally
        damage: 'archerHurt',
        death: 'werewolfDeath'
    },
    action: async (unit: Unit.IUnit, attackTargets: Unit.IUnit[] | undefined, underworld: Underworld, canAttackTarget: boolean) => {

    },
    getUnitAttackTargets: (unit: Unit.IUnit, underworld: Underworld) => {
        return []
    }
};

export default unit;