
const {
    Unit,
    Vec,
    cardsUtil,
    moveWithCollision,
    Polygon2,
    Particles,
    ParticleCollection,
    colors,
    commonTypes,
    PlanningView,
    lineSegment,
} = globalThis.SpellmasonsAPI;
import * as particles from 'jdoleary-fork-pixi-particle-emitter'
import type Underworld from '../types/Underworld';
import type { Vec2 } from '../types/jmath/Vec';
import type { IUnit } from '../types/entity/Unit';
import type { Spell } from '../types/cards';
import type { Mod } from '../types/types/commonTypes';
import type { LineSegment as LineSegmentType } from '../types/jmath/lineSegment';
const { invert } = Vec;
const { simpleEmitter, createParticleTexture, containerParticles } = Particles;
const { stopAndDestroyForeverEmitter } = ParticleCollection;
const { getOrInitModifier } = cardsUtil;
const { CardRarity, probabilityMap, CardCategory } = commonTypes;
const { toPolygon2LineSegments } = Polygon2;
const { drawUIPoly, drawUIPolyPrediction } = PlanningView;
const { moveAlongVector, normalizedVector } = moveWithCollision;
const { lineSegmentIntersection, isCollinearAndOverlapping } = lineSegment;

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
            const depth = range;
            // Width doubles up to 4 casts, capping at 8x multiplier: 1 > 2 > 4 > 8
            const width = baseWidth * Math.pow(2, Math.min(quantity, 3)) / 2;
            const target: Vec2 = state.castLocation;
            const vector = normalizedVector(state.casterUnit, state.castLocation).vector || { x: 0, y: 0 };

            // Reset walls from a previous forcefield cast
            if (underworld.lastLevelCreated && !prediction) {
                Unit.removeModifier(state.casterUnit, id, underworld);
            }

            const targetingColumn = getColumnPoints(target, vector, width, depth);
            const particlePoints = getParticlePoints(target, vector, depth, width);

            if (underworld.lastLevelCreated && targetingColumn[0] && targetingColumn[1] && targetingColumn[2] && targetingColumn[3]) {
                const lineSegs: LineSegmentType[] = [
                    { p1: targetingColumn[0], p2: targetingColumn[1] },
                    { p1: targetingColumn[2], p2: targetingColumn[3] },
                    { p1: targetingColumn[0], p2: targetingColumn[3] },
                    { p1: targetingColumn[1], p2: targetingColumn[2] },
                ];
                const wallPoly: Vec2[] = [targetingColumn[0], targetingColumn[1], targetingColumn[2], targetingColumn[3]];

                // Prevent placing walls that overlap existing walls (which can trap the caster)
                if (wouldOverlapExistingWalls(lineSegs, underworld.walls)) {
                    if (prediction) {
                        drawUIPolyPrediction(wallPoly, 0xff0000);
                    }
                    return state;
                }

                let particleStart = moveAlongVector(targetingColumn[2], vector, depth * (Math.pow(2, Math.min(quantity, 3)) - 1) / 2);
                particleStart = moveAlongVector(particleStart, invert(vector), -12);

                if (containerParticles && !prediction && targetingColumn[0]) {
                    spawnParticles(particlePoints, particleStart, state.castLocation, underworld);
                }
                if (prediction) {
                    drawUIPolyPrediction(wallPoly, 0xffffff);
                } else {
                    underworld.pathingLineSegments.push(...toPolygon2LineSegments(wallPoly));
                    underworld.pathingPolygons.push(wallPoly);
                    Unit.addModifier(state.casterUnit, id, underworld, prediction, 1, { points: targetingColumn, particleStart, particlePoints, castLocation: state.castLocation });
                    for (const lineSeg of lineSegs) {
                        underworld.walls.push(lineSeg);
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
            const modifier = unit.modifiers[id];
            if (underworld.lastLevelCreated && !prediction && modifier) {
                Unit.removeModifier(unit, id, underworld);
            }
        },
    }
};
function wouldOverlapExistingWalls(newSegments: LineSegmentType[], existingWalls: LineSegmentType[]): boolean {
    for (const newSeg of newSegments) {
        for (const wall of existingWalls) {
            if (lineSegmentIntersection(newSeg, wall) || isCollinearAndOverlapping(newSeg, wall)) {
                return true;
            }
        }
    }
    return false;
}
function spawnParticles(particlePoints: Vec2[], particleStart: Vec2, castLocation: Vec2, underworld: Underworld) {
    if (!containerParticles) return;
    const emitters = particlePoints.map(point => simpleEmitter(particleStart, generateConfig(point, castLocation), () => { }, containerParticles));
    emitters.forEach(e => (containerParticles && e) ? underworld.particleFollowers.push({ displayObject: containerParticles, emitter: e, target: particleStart }) : undefined);
}
function cleanupParticles(modifier: any, underworld: Underworld) {
    if (underworld.particleFollowers && modifier.particleStart) {
        underworld.particleFollowers.forEach(f => { if (f.target == modifier.particleStart) stopAndDestroyForeverEmitter(f.emitter); });
    }
}
function add(unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1, extra?: { [key: string]: any }) {
    const modifier = getOrInitModifier(unit, id, { isCurse: false, quantity: 1 }, () => {
        Unit.addEvent(unit, id);
    });
    if (extra) {
        if (extra.points) modifier.points = extra.points;
        if (extra.particleStart) modifier.particleStart = extra.particleStart;
        if (extra.particlePoints) modifier.particlePoints = extra.particlePoints;
        if (extra.castLocation) modifier.castLocation = extra.castLocation;
    }
}
function remove(unit: IUnit, underworld: Underworld) {
    const modifier = unit.modifiers[id];
    if (underworld.lastLevelCreated && modifier) {
        cleanupParticles(modifier, underworld);
        underworld.cacheWalls(underworld.lastLevelCreated?.obstacles, underworld.lastLevelCreated?.imageOnlyTiles.filter(x => x.image == ''));
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
    const points: Vec2[] = [];
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
