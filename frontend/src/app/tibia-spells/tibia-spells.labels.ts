export interface SpellsLabels {
  eyebrow: string;
  title: string;
  intro: string;
  searchLabel: string;
  searchPlaceholder: string;
  nameColumn: string;
  levelColumn: string;
  manaColumn: string;
  priceColumn: string;
  typeColumn: string;
  premiumColumn: string;
  premium: string;
  notPremium: string;
  instant: string;
  rune: string;
  empty: string;
  loading: string;
  retry: string;
  error: string;
  previous: string;
  next: string;
}

// eslint-disable-next-line complexity
export function buildSpellsLabels(isPl: boolean): SpellsLabels {
  return {
    eyebrow: 'Tibia',
    title: isPl ? 'Zaklęcia' : 'Spells',
    intro: isPl
      ? 'Pełna lista zaklęć i run z TibiaData.'
      : 'The full list of Tibia spells and runes from TibiaData.',
    searchLabel: isPl ? 'Szukaj' : 'Search',
    searchPlaceholder: isPl ? 'Nazwa zaklęcia...' : 'Spell name...',
    nameColumn: isPl ? 'Nazwa' : 'Name',
    levelColumn: isPl ? 'Poziom' : 'Level',
    manaColumn: isPl ? 'Mana' : 'Mana',
    priceColumn: isPl ? 'Cena' : 'Price',
    typeColumn: isPl ? 'Typ' : 'Type',
    premiumColumn: isPl ? 'Premium' : 'Premium',
    premium: 'Premium',
    notPremium: 'Free',
    instant: 'Instant',
    rune: 'Rune',
    empty: isPl ? 'Brak zaklęć na liście.' : 'No spells in the list.',
    loading: isPl ? 'Ładowanie zaklęć...' : 'Loading spells...',
    retry: isPl ? 'Spróbuj ponownie' : 'Retry',
    error: isPl ? 'Nie udało się pobrać listy zaklęć.' : 'Could not load the spells list.',
    previous: isPl ? 'Poprzednia' : 'Previous',
    next: isPl ? 'Następna' : 'Next',
  };
}
