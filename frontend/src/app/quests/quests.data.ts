export interface Quest {
  id: string;
  name: string;
  city: string;
  minLevel: number;
  category: 'main' | 'side' | 'daily' | 'access';
  description: string;
  spoiler: string;
  rewards?: string[];
}

export const QUESTS: Quest[] = [
  {
    id: 'annihilator',
    name: 'The Annihilator',
    city: 'Edron',
    minLevel: 100,
    category: 'main',
    description:
      'Klasyczny quest na najpotężniejszy przedmiot w Tibii - Demon Helmet. Wymaga drużyny i dobrego przygotowania.',
    spoiler:
      'Wejdź do jaskini na Hero Cave koło Edron (123, 54, 7). Znajdź teleport na końcu jaskini i pokonaj 4 demony. Kluczowy moment to walka z Demonem na końcu - potrzebna drużyna z healem i SD. Nagroda: Demon Helmet.',
    rewards: ['Demon Helmet'],
  },
  {
    id: 'poi',
    name: 'Pits of Inferno',
    city: 'Edron',
    minLevel: 120,
    category: 'main',
    description:
      'Długi quest dający dostęp do Pits of Inferno - endgameowej kopalni demonów i bosów.',
    spoiler:
      'Rozpocznij u NPC Hjaern na Svargrond. Zbierz błogosławieństwa od 7 kapłanów po świecie, potem udaj się do Edron i wejdź do POI przez teleport w Hero Cave. W środku pokonaj bosów i udaj się na najniższe poziomy.',
    rewards: ['Access to Pits of Inferno'],
  },
  {
    id: 'inquisition',
    name: 'The Inquisition',
    city: 'Thais',
    minLevel: 100,
    category: 'main',
    description: 'Quest na dostęp do Demonwing i walkę z Ushuriel.',
    spoiler:
      'Rozpocznij u NPC Henricus w Thais Temple. Wykonaj serie zadań w różnych miastach, w tym wykonaj exorcyzmy i pokonaj demony. Końcowy boss to Ushuriel w Inquisition Quarter.',
    rewards: ['Access to Demonwing', 'Holy Icon'],
  },
  {
    id: 'dreamer-challenge',
    name: 'Dreamer Challenge Quest',
    city: 'Venore',
    minLevel: 80,
    category: 'side',
    description: 'Quest na dostęp do Dream Realm i nagrody związane z snami.',
    spoiler:
      'Rozpocznij u NPC Erund w Venore. Zbierz przedmioty do rytuału i udaj się do Dream Realm przez specjalny teleport. W środku rozwiąż zagadki i pokonaj potwory.',
    rewards: ['Dream Matter'],
  },
  {
    id: 'killing-in-name',
    name: 'Killing in the Name of...',
    city: 'Svargrond',
    minLevel: 50,
    category: 'daily',
    description: 'Dzienne zadania na zabijanie potworów dla NPC z Svargrond.',
    spoiler:
      'Porozmawiaj z NPC Lurik w Svargrond. Wybierz zadanie i zabij wymaganą liczbę potworów. Po wykonaniu wróć po nagrodę. Questy resetują się co 20 godzin.',
    rewards: ['Experience', 'Gold', 'Task Points'],
  },
  {
    id: 'yalahari',
    name: 'Yalahari Quest',
    city: 'Yalahar',
    minLevel: 80,
    category: 'access',
    description: 'Główny quest Yalahar dający dostęp do różnych części miasta.',
    spoiler:
      'Rozpocznij u NPC Palimuth w Yalahar. Wykonaj serie misji dla różnych frakcji w mieście. Końcowo zdobądź dostęp do Sunken Quarter i innych zamkniętych dzielnic.',
    rewards: ['Access to Yalahar quarters'],
  },
  {
    id: 'wyrm-hills',
    name: 'Wyrm Hills Access',
    city: 'Liberty Bay',
    minLevel: 60,
    category: 'access',
    description: 'Krótki quest dający dostęp do Wyrm Hills koło Liberty Bay.',
    spoiler:
      'Porozmawiaj z NPC Eleonore w Liberty Bay. Znajdź zaginionego mężczyznę w dżungli i przynieś dowód. Nagrodą jest klucz do Wyrm Hills.',
    rewards: ['Access to Wyrm Hills'],
  },
  {
    id: 'feyrist',
    name: 'Feyrist Access',
    city: 'Feyrist',
    minLevel: 100,
    category: 'access',
    description: 'Quest na dostęp do Feyrist - magicznej krainy wróżek i faunów.',
    spoiler:
      'Rozpocznij u NPC Maeryn na Feyrist. Pomóż jej odbudować relacje z mieszkańcami i zdobądź błogosławieństwo. Wymagany jest dostęp do Roshamuul.',
    rewards: ['Access to Feyrist'],
  },
  {
    id: 'soul-war',
    name: 'Soul War Quest',
    city: 'Marapur',
    minLevel: 250,
    category: 'main',
    description: 'Endgameowy quest dający dostęp do Soul War i nagrody bestowe.',
    spoiler:
      'Rozpocznij u NPC The Blind Prophet w Marapur. Przejdź przez szereg trudnych walk z bosami i rozwiąż mechaniki związane z duszami. Końcowy boss to Goshnar.',
    rewards: ['Access to Soul War', 'Soul Set'],
  },
  {
    id: 'cobra-bastion',
    name: 'Cobra Bastion Access',
    city: 'Issavi',
    minLevel: 150,
    category: 'access',
    description: 'Quest na dostęp do Cobra Bastion w Issavi.',
    spoiler:
      'Rozpocznij u NPC Kallimae w Issavi. Pomóż jej z infiltracją bastionu kobry i zdobądź zaufanie. Końcowo otrzymasz dostęp do wnętrza bastionu.',
    rewards: ['Access to Cobra Bastion'],
  },
];

export const CITIES = [...new Set(QUESTS.map((quest) => quest.city))].sort();
