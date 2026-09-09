import type { CreatureDetailDto, CreatureRef } from '@shared/api-contract';
import { LOOT_ITEMS, type LootItem } from '../loot/loot.data';
import { HUNTING_PLACES, type HuntingPlace } from '../hunting-places/hunting-places.data';
import { BOOSTED_BOSSES } from '../boostable-bosses/boosted-bosses.data';
import { BOOSTED_CREATURES } from '../boostable-bosses/boosted-creatures.data';

const RESISTANCE_KEYS = ['physical', 'fire', 'ice', 'energy', 'earth', 'holy', 'death'] as const;

interface ResistanceEntry {
  label: string;
  value: number;
}

interface MergedCreature extends CreatureDetailDto {
  droppedItems: LootItem[];
  huntingPlaces: HuntingPlace[];
}

const creatureMap = new Map<string, MergedCreature>();

function ensureEntry(slug: string, name: string): MergedCreature {
  const normalizedSlug = slug.toLowerCase();
  let entry = creatureMap.get(normalizedSlug);

  if (!entry) {
    entry = {
      name,
      slug: normalizedSlug,
      boss: false,
      droppedItems: [],
      huntingPlaces: [],
    };
    creatureMap.set(normalizedSlug, entry);
  }

  return entry;
}

function mergeOptionalField(
  target: MergedCreature,
  key: 'imageUrl' | 'shortDescription' | 'accessQuest' | 'location' | 'soloLevel' | 'groupLevel',
  value: string | undefined,
): void {
  if (value && !target[key]) {
    target[key] = value;
  }
}

function mergeNumericField(
  target: MergedCreature,
  key: 'health' | 'experience' | 'charmPoints',
  value: number | undefined,
): void {
  if (value !== undefined && target[key] === undefined) {
    target[key] = value;
  }
}

function mergeDetail(target: MergedCreature, source: CreatureDetailDto): void {
  mergeOptionalField(target, 'imageUrl', source.imageUrl);
  mergeOptionalField(target, 'shortDescription', source.shortDescription);
  mergeOptionalField(target, 'accessQuest', source.accessQuest);
  mergeOptionalField(target, 'location', source.location);
  mergeOptionalField(target, 'soloLevel', source.soloLevel);
  mergeOptionalField(target, 'groupLevel', source.groupLevel);

  mergeNumericField(target, 'health', source.health);
  mergeNumericField(target, 'experience', source.experience);
  mergeNumericField(target, 'charmPoints', source.charmPoints);

  if (source.boss) {
    target.boss = true;
  }
  if (source.resistances && !target.resistances) {
    target.resistances = source.resistances;
  }
  if (source.attackStyle && !target.attackStyle) {
    target.attackStyle = source.attackStyle;
  }
  if (source.loot && !target.loot) {
    target.loot = source.loot;
  }
}

// 1. Seed from hunting-places monsters (stats + resistances).
for (const place of HUNTING_PLACES) {
  for (const monster of place.monsters) {
    const entry = ensureEntry(monster.slug, monster.name);
    mergeDetail(entry, {
      name: monster.name,
      slug: monster.slug,
      health: monster.health,
      experience: monster.experience,
      boss: monster.boss,
      charmPoints: monster.charmPoints,
      resistances: monster.resistances,
    });
    entry.huntingPlaces.push(place);
  }
}

// 2. Merge boosted boss/creature detail (description, loot, location, attackStyle).
for (const boss of BOOSTED_BOSSES) {
  const entry = ensureEntry(boss.slug, boss.name);
  mergeDetail(entry, boss);
}

for (const creature of BOOSTED_CREATURES) {
  const entry = ensureEntry(creature.slug, creature.name);
  mergeDetail(entry, creature);
}

// 3. Seed from loot droppedBy refs (creatures that only appear as drop sources).
for (const item of LOOT_ITEMS) {
  for (const ref of item.droppedBy) {
    const entry = ensureEntry(ref.slug, ref.name);
    entry.droppedItems.push(item);
  }
}

const allCreatures = [...creatureMap.values()].sort((a, b) => a.name.localeCompare(b.name));

export function findCreatureBySlug(slug: string): MergedCreature | null {
  return creatureMap.get(slug.toLowerCase()) ?? null;
}

export function findDropsByCreatureSlug(slug: string): LootItem[] {
  const creature = findCreatureBySlug(slug);
  return creature?.droppedItems ?? [];
}

export function findHuntingPlacesByCreatureSlug(slug: string): HuntingPlace[] {
  const creature = findCreatureBySlug(slug);
  return creature?.huntingPlaces ?? [];
}

export function creatureResistanceEntries(creature: CreatureDetailDto): ResistanceEntry[] {
  if (!creature.resistances) {
    return [];
  }

  return RESISTANCE_KEYS.map((key) => ({
    label: key,
    value: creature.resistances![key],
  }));
}

export function resistanceClass(value: number): string {
  if (value <= -100) {
    return 'resist-immune';
  }
  if (value < 0) {
    return 'resist-strong';
  }
  if (value > 0) {
    return 'resist-weak';
  }
  return 'resist-neutral';
}

export function creatureRef(name: string): CreatureRef {
  return { name, slug: name.replace(/\s+/g, '-') };
}

export { allCreatures, type MergedCreature };
