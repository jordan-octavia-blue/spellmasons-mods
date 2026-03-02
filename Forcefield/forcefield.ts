
const {
    units,
    Unit,
    Vec,
    math,
    cards,
    cardUtils,
    cardsUtil,
    moveWithCollision,
    Polygon2,
    Particles,
    ParticleCollection,
    colors,
    commonTypes,
    PlanningView,
    particleEmitter,
    
    
} = globalThis.SpellmasonsAPI;
import particles from "jdoleary-fork-pixi-particle-emitter"
import type Underworld from '../types/Underworld';
import type { Vec2 } from '../types/jmath/Vec';
import type { HasSpace } from '../types/entity/Type';
import type { IUnit } from '../types/entity/Unit';
import type { EffectState, Spell } from '../types/cards';
import type { Polygon2 } from '../types/jmath/Polygon2';
import { Mod } from '../types/types/commonTypes';
const { invert } = Vec;
const { simpleEmitter, createParticleTexture, containerParticles } = Particles;
const { stopAndDestroyForeverEmitter } = particleEmitter;
const { getOrInitModifier } = cardsUtil;
const { CardRarity, probabilityMap, CardCategory } = commonTypes;
const { toPolygon2LineSegments } = Polygon2;
const { drawUIPoly, drawUIPolyPrediction } = PlanningView;
const { defaultTargetsForAllowNonUnitTargetTargetingSpell } = cards;
const { moveAlongVector, normalizedVector } = moveWithCollision;

const id = 'Forcefield';
const range = 20;
const baseWidth = 80;
const spell: Spell = {
    card: {
        id,
        category: CardCategory.Mana,
        supportQuantity: true,
        manaCost: 10,
        healthCost: 0,
        expenseScaling: 3,
        costGrowthAlgorithm: 'exponential',
        probability: probabilityMap[CardRarity.SPECIAL],
        thumbnail: 'spellIconTargetColumn.png',
        requiresFollowingCard: false,
        description: 'Conjures a magical force wall that blocks movement and projectiles. Walls disappear after a turn or after summoning another wall. Stacks up to 3 times',
        allowNonUnitTarget: true,
        effect: async (state, card, quantity, underworld, prediction, outOfRange) => {
            // +50% depth per radius boost
            const adjustedRadiusBoost = quantity - 1 + state.aggregator.radiusBoost;
            const depth = range;
            // Width doubles up to 4 casts, capping at 8x multiplier: 1 > 2 > 4 > 8
            const width = baseWidth * Math.pow(2, Math.min(quantity, 3)) / 2;
            // Note: This loop must NOT be a for..of and it must cache the length because it
            // mutates state.targetedUnits as it iterates.  Otherwise it will continue to loop as it grows
            let targets: Vec2[] = [state.castLocation];
            targets = defaultTargetsForAllowNonUnitTargetTargetingSpell(targets, state.castLocation, card);
            const length = 1;
            const vector = normalizedVector(state.casterUnit, state.castLocation).vector || { x: 0, y: 0 };

            //This resets the stage back to before any walls were created
            if (underworld.lastLevelCreated && !prediction) {
                console.log('Found existing wall from previous cast, will replace it');
                underworld.cacheWalls(underworld.lastLevelCreated?.obstacles, underworld.lastLevelCreated?.imageOnlyTiles.filter(x => x.image == ''));
                Unit.removeModifier(state.casterUnit, id, underworld);

            }
            for (let i = 0; i < length; i++) {
                const target = targets[i];
                if (!target) {
                    continue;
                }
                const targetingColumn = getColumnPoints(target, vector, width, depth);
                const particlePoints = getParticlePoints(target, vector, depth, width);
                // Draw visual line for prediction of the walls
                if (underworld.lastLevelCreated && targetingColumn && targetingColumn[0] && targetingColumn[1] && targetingColumn[2] && targetingColumn[3]) {
                    //first, make the line segments for the 4 sides
                    const lineSegs = [{ p1: targetingColumn[0], p2: targetingColumn[1] }, { p1: targetingColumn[2], p2: targetingColumn[3] }, { p1: targetingColumn[0], p2: targetingColumn[3] }, { p1: targetingColumn[1], p2: targetingColumn[2] }];
                    //convert the line segments into a Polygon2
                    const wallPoly: Polygon2 = [targetingColumn[0], targetingColumn[1], targetingColumn[2], targetingColumn[3]];
                    let particleStart = moveAlongVector(targetingColumn[2], vector, depth * (Math.pow(2, Math.min(quantity, 3)) - 1) / 2);
                    particleStart = moveAlongVector(particleStart, invert(vector), -12);

                    if (containerParticles && !prediction && targetingColumn[0]) {
                        const emitters = particlePoints.map(point => simpleEmitter(particleStart, generateConfig(point, state.castLocation), () => { }, containerParticles));
                        emitters.forEach(e => (containerParticles && e) ? underworld.particleFollowers.push({ displayObject: containerParticles, emitter: e, target: particleStart }) : console.log('no container particles'));
                    }
                    if (prediction) {
                        drawUIPolyPrediction(wallPoly, 0xffffff);
                    } else {
                        underworld.pathingLineSegments.push(...toPolygon2LineSegments(wallPoly));
                        underworld.pathingPolygons.push(wallPoly);
                        Unit.addModifier(state.casterUnit, id, underworld, prediction, 1, { points: targetingColumn, particleStart })
                        for (let lineSeg of lineSegs) {
                            if (lineSeg) {
                                underworld.walls.push(lineSeg);
                            }
                        }
                    }
                }

            }

            return state;
        },
    },
    modifiers: {
        add,
        remove,
    },
    events: {
        onDrawSelected: async (unit: IUnit, underworld: Underworld, prediction: boolean) => {
            const modifier = unit.modifiers[id];
            if (globalThis.selectedUnitGraphics && modifier) {
                drawUIPoly(globalThis.selectedUnitGraphics, modifier.points, colors.manaBrightBlue);
            }
        },
        onTurnStart: async (unit: IUnit, underworld: Underworld, prediction: boolean) => {
            if (underworld.lastLevelCreated && !prediction) {
                console.log('Found existing wall from previous cast, will replace it');
                underworld.cacheWalls(underworld.lastLevelCreated?.obstacles, underworld.lastLevelCreated?.imageOnlyTiles.filter(x => x.image == ''));
                Unit.removeModifier(unit, id, underworld);
            }
        },
    }
};
function add(unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1, extra?: { [key: string]: any }) {
    const modifier = getOrInitModifier(unit, id, { isCurse: false, quantity: 1 }, () => {
        Unit.addEvent(unit, id);
    });
    if (extra && extra.points && extra.particleStart) {
        modifier.points = extra.points;
        modifier.particleStart = extra.particleStart;
    }
}
function remove(unit: IUnit, underworld: Underworld) {
    const modifier = unit.modifiers[id];
    if (underworld.lastLevelCreated && underworld.particleFollowers && modifier) {
        underworld.cacheWalls(underworld.lastLevelCreated?.obstacles, underworld.lastLevelCreated?.imageOnlyTiles.filter(x => x.image == ''));
        underworld.particleFollowers.forEach(f => { if (f.target == modifier.particleStart) stopAndDestroyForeverEmitter(f.emitter); });
    }
}
export function getColumnPoints(castLocation: Vec2, vector: Vec2, width: number, depth: number): Vec2[] {
    const p1 = moveAlongVector(castLocation, invert(vector), -width);
    const p2 = moveAlongVector(castLocation, invert(vector), width);
    const p3 = moveAlongVector(p2, vector, depth);
    const p4 = moveAlongVector(p1, vector, depth);
    return [p1, p2, p3, p4];
}
function generateConfig(point: Vec2, castLocation: Vec2): any {
    const texture = createParticleTexture();
    const config =
        particles.upgradeConfig({
            autoUpdate: true,
            "alpha": {
                "start": 0.51,
                "end": 0.29
            },
            "scale": {
                "start": 0.8,
                "end": 0.01,
                "minimumScaleMultiplier": 1
            },
            "color": {
                "start": "#5fe6f8ff",
                "end": "#293afcff"
            },
            "speed": {
                "start": 57,
                "end": 12,
                "minimumSpeedMultiplier": 1
            },
            "acceleration": {
                "x": -13,
                "y": 0
            },
            "maxSpeed": 0,
            "startRotation": {
                "min": 0,
                "max": 360
            },
            "noRotation": false,
            "rotationSpeed": {
                "min": 15,
                "max": 0
            },
            "lifetime": {
                "min": 0.2,
                "max": 0.3
            },
            "blendMode": "normal",
            "frequency": 0.003,
            "emitterLifetime": -1,
            "maxParticles": 500,
            "pos": {
                "x": -point.x / 2,
                "y": -point.y / 2
            },
            "addAtBack": false,
            "spawnType": "circle",
            "spawnCircle": {
                "x": castLocation.x,
                "y": castLocation.y,
                "r": 5,
            }
        }, texture);
    return config;
}
function getParticlePoints(castLocation: Vec2, vector: Vec2, width: number, depth: number): Vec2[] {
    const scaleMultiplier = 1.2;
    let points: Vec2[] = [];
    const p1 = Vec.add(moveAlongVector(castLocation, invert(vector), -width), moveAlongVector(castLocation, vector, depth / 2));
    points.push(p1);
    let lastPoint = p1;
    for (let i = 1; i < depth / 4; i++) {
        const p = moveAlongVector(lastPoint, invert(vector), width / scaleMultiplier);
        points.push(p);
        lastPoint = p;
    }
    return points;

}
const mod: Mod = {
    modName: 'Forcefield',
    author: 'Bug Jones',
    description: 'Adds a forcefield spell',
    screenshot: '',
    spells: [
        spell
    ],
};
export default mod;