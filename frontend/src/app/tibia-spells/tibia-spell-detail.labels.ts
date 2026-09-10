export interface SpellDetailLabels {
  back: string;
  level: string;
  mana: string;
  price: string;
  premiumOnly: string;
  cooldownAlone: string;
  cooldownGroup: string;
  damageType: string;
  formula: string;
  type: string;
  instant: string;
  rune: string;
  runeTitle: string;
  magicLevel: string;
  description: string;
  city: string;
  vocation: string;
  yes: string;
  no: string;
  loading: string;
  retry: string;
  error: string;
}

// eslint-disable-next-line complexity
export function buildSpellDetailLabels(isPl: boolean): SpellDetailLabels {
  return {
    back: isPl ? '← Wróć do zaklęć' : '← Back to spells',
    level: isPl ? 'Poziom' : 'Level',
    mana: isPl ? 'Mana' : 'Mana',
    price: isPl ? 'Cena' : 'Price',
    premiumOnly: isPl ? 'Wymaga premium' : 'Premium only',
    cooldownAlone: isPl ? 'Cooldown (sam)' : 'Cooldown (solo)',
    cooldownGroup: isPl ? 'Cooldown (grupa)' : 'Cooldown (group)',
    damageType: isPl ? 'Typ obrażeń' : 'Damage type',
    formula: 'Formula',
    type: isPl ? 'Typ' : 'Type',
    instant: 'Instant',
    rune: 'Rune',
    runeTitle: isPl ? 'Dane runy' : 'Rune information',
    magicLevel: isPl ? 'Poziom magii' : 'Magic level',
    description: isPl ? 'Opis' : 'Description',
    city: isPl ? 'Miasta' : 'Cities',
    vocation: isPl ? 'Profesje' : 'Vocations',
    yes: isPl ? 'Tak' : 'Yes',
    no: isPl ? 'Nie' : 'No',
    loading: isPl ? 'Ładowanie zaklęcia...' : 'Loading spell...',
    retry: isPl ? 'Spróbuj ponownie' : 'Retry',
    error: isPl ? 'Nie udało się pobrać danych zaklęcia.' : 'Could not load the spell details.',
  };
}
