import type { CreatureDetailDto, CreatureLootEntry } from '@shared/api-contract';

export type BoostedBossDetailEntry = CreatureDetailDto;

export const BOOSTED_BOSSES: BoostedBossDetailEntry[] = [
  {
    name: 'Abyssador',
    slug: 'Abyssador',
    imageUrl: 'https://static.tibia.com/images/library/creatures/abyssador.gif',
    boss: true,
    shortDescription:
      'Najtrudniejszy z bossów Warzone, bardzo mobilny i często staje się niewidzialny. Zadaje dużo obrażeń earth i fizycznych, a do tego potrafi bardzo mocno się leczyć.',
    accessQuest: 'Wymaga dostępu do Warzone 3.',
    location: 'Warzone 3.',
    soloLevel: '650+',
    groupLevel: '350+',
    attackStyle: [
      'mocne uderzenia wręcz',
      'fala earth',
      'bomby earth',
      'niewidzialność i silne leczenie',
    ],
    resistances: {
      physical: 0,
      earth: -100,
      fire: -75,
      ice: -75,
      energy: -75,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: "Abyssador's Lash",
        chance: 'very common',
      },
      {
        name: 'Crystal Crossbow',
        chance: 'common',
      },
      {
        name: 'Crystalline Axe',
        chance: 'common',
      },
      {
        name: 'Crystalline Sword',
        chance: 'common',
      },
      {
        name: 'Decorative Ribbon',
        chance: 'uncommon',
      },
      {
        name: 'Mycological Bow',
        chance: 'uncommon',
      },
      {
        name: 'Mycological Mace',
        chance: 'uncommon',
      },
      {
        name: 'Shiny Blade',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Adventurer Group',
    slug: 'Adventurer-Group',
    imageUrl: 'https://static.tibia.com/images/library/creatures/adventurergroup.gif',
    boss: true,
    shortDescription:
      'To starcie z pięcioma przeciwnikami naraz, po jednym na każdą profesję, a po zejściu na czerwone HP przechodzą oni w silniejsze formy avatarów. Trzeba unikać bright crystalów z mana drainem i przygotować się, że po ich zabiciu pojawia się Fatal Bug.',
    accessQuest: 'Wymaga Jade Dragon Head i dostępu do The Roost of the Graveborn Quest.',
    location: 'Greenshore, arena questa The Roost of the Graveborn Quest.',
    soloLevel: '700+',
    groupLevel: '350+',
    attackStyle: [
      'mieszane obrażenia wszystkich żywiołów',
      'ataki dystansowe i wręcz',
      'formy avatarów z większą ochroną',
      'bright crystale z mana drainem',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Worn Guide Book',
        chance: 'rare',
      },
      {
        name: 'Ancient Crypt Rune',
        chance: 'rare',
        notes: 'Może wypaść dopiero po pełnym ukończeniu questa.',
      },
    ],
  },
  {
    name: 'Ahau',
    slug: 'Ahau',
    imageUrl: 'https://static.tibia.com/images/library/creatures/ahau.gif',
    boss: true,
    shortDescription:
      'Przywódca Iksów walczący głównie obrażeniami earth i fire. Najważniejsza mechanika to cztery życia oraz coraz większa strefa lawy po każdym odrodzeniu.',
    accessQuest:
      'Wymaga dostępu do Iksupan w Adventures of Galthen Quest i użycia The Key Intihuatac.',
    location: 'Iksupan, północna część trzeciego poziomu miasta, arena z niebieskimi płomieniami.',
    soloLevel: '300+',
    groupLevel: '220+',
    attackStyle: [
      'uderzenia wręcz z poisonem',
      'strike earth',
      'beam fire',
      'pierścienie i bomby earth',
    ],
    resistances: {
      physical: 0,
      earth: -100,
      fire: 0,
      ice: 25,
      energy: 0,
      holy: 0,
      death: -100,
    },
    loot: [
      {
        name: 'gold coin',
        chance: 'very common',
      },
      {
        name: 'Great Health Potion',
        chance: 'common',
      },
      {
        name: 'Great Mana Potion',
        chance: 'common',
      },
      {
        name: 'Great Spirit Potion',
        chance: 'common',
      },
      {
        name: 'diamond',
        chance: 'common',
      },
      {
        name: 'bar of gold',
        chance: 'uncommon',
      },
      {
        name: 'Amber with a Bug',
        chance: 'uncommon',
      },
      {
        name: 'The Living Idol of Tukh',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Amenef The Burning',
    slug: 'Amenef-The-Burning',
    imageUrl: 'https://static.tibia.com/images/library/creatures/ameneftheburning.gif',
    boss: true,
    shortDescription:
      'Ognisty miniboss kultystów Fafnara z Kilmaresh. Sam zestaw ciosów nie jest skomplikowany, ale bije solidnie w zwarciu i premiuje graczy z ochroną na fire oraz energy.',
    accessQuest:
      'Miniboss linii Wanted w Kilmaresh Quest, dostępny przez teleport w Ruins of Nuur.',
    location: 'Ruins of Nuur, za teleportem wewnątrz ruin.',
    soloLevel: '250+',
    groupLevel: '180+',
    attackStyle: [
      'mocne uderzenia wręcz',
      'obrażenia fire',
      'obrażenia energy',
      'presja w zwarciu',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: -75,
      ice: 25,
      energy: -75,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'crystal coin',
        chance: 'common',
      },
      {
        name: 'Mastermind Potion',
        chance: 'common',
      },
      {
        name: 'Blue Gem',
        chance: 'uncommon',
      },
      {
        name: 'Golden Mask',
        chance: 'uncommon',
      },
      {
        name: 'Focus Cape',
        chance: 'uncommon',
      },
      {
        name: 'Eye-Embroidered Veil',
        chance: 'rare',
      },
      {
        name: 'Tagralt-Inlaid Scabbard',
        chance: 'rare',
      },
      {
        name: 'Sea Horse Figurine',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Anomaly',
    slug: 'Anomaly',
    imageUrl: 'https://static.tibia.com/images/library/creatures/anomaly.gif',
    boss: true,
    shortDescription:
      'Boss z Heart of Destruction, który regularnie przechodzi w formę Charged Anomaly odporną na zwykły damage. Wtedy trzeba przeciągać go przez czerwone vortexy, bo to one zdejmują mu życie.',
    accessQuest:
      'Wymaga rozpoczęcia Heart of Destruction Quest i ukończenia dostępu do walki w Otherworld.',
    location: 'Otherworld, arena bossa w ścieżce ankrahmuńskiej.',
    soloLevel: '450+',
    groupLevel: '250+',
    attackStyle: [
      'uderzenia wręcz',
      'transformacja w Charged Anomaly',
      'silniejsze ciosy w formie naładowanej',
      'częsty retarget',
    ],
    resistances: {
      physical: -75,
      earth: -75,
      fire: -75,
      ice: -75,
      energy: -75,
      holy: -75,
      death: -75,
    },
    loot: [
      {
        name: 'Gold Token',
        chance: 'very common',
      },
      {
        name: 'Mysterious Remains',
        chance: 'very common',
      },
      {
        name: 'gold coin',
        chance: 'common',
      },
      {
        name: 'Great Spirit Potion',
        chance: 'common',
      },
      {
        name: 'great mana potion',
        chance: 'common',
      },
      {
        name: 'Curious Matter',
        chance: 'uncommon',
      },
      {
        name: 'Void Boots',
        chance: 'rare',
      },
      {
        name: 'Frozen Lightning',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Arbaziloth',
    slug: 'Arbaziloth',
    imageUrl: 'https://static.tibia.com/images/library/creatures/arbaziloth4spheres.gif',
    boss: true,
    shortDescription:
      'Finałowy boss No Rest for the Wicked Quest z wyraźną mechaniką faz i zdejmowania niewrażliwości wędką. Trzeba uważać na ciągłe przywołania, efekt Powerless i momenty, w których boss staje się nietykalny aż do przeciągnięcia go przez fioletowy ogień.',
    accessQuest:
      'Finał No Rest for the Wicked Quest, dostęp do areny na -3 poziomie Azzilon Castle.',
    location: 'Azzilon Castle.',
    soloLevel: '900+',
    groupLevel: '500+',
    attackStyle: [
      'uderzenia wręcz',
      'nakładanie Powerless',
      'okresowa niewrażliwość',
      'przywołania i wzmacniana faza końcowa',
    ],
    resistances: {
      physical: -75,
      earth: 0,
      fire: -75,
      ice: -75,
      energy: 0,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: 'Strong Mana Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Health Potion',
        chance: 'common',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Giant Ruby',
        chance: 'uncommon',
      },
      {
        name: 'Demonrage Sword',
        chance: 'rare',
      },
      {
        name: 'Demonfang Mask',
        chance: 'rare',
      },
      {
        name: 'Dreadfire Headpiece',
        chance: 'very rare',
      },
      {
        name: 'Hellstalker Visor',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Black Vixen',
    slug: 'Black-Vixen',
    imageUrl: 'https://static.tibia.com/images/library/creatures/vixen.gif',
    boss: true,
    shortDescription:
      'Liderka werefoxów walcząca na dystans i lubiąca znikanie oraz przywołania. Sama walka nie jest bardzo ciężka, ale paraliż, death beam i summon werefoxa potrafią szybko dołożyć obrażeń.',
    accessQuest: 'Solo boss w Grimvale Quest, część The Curse Spreads.',
    location: 'Cormaya, za Earth Portalem w jaskini werebestii.',
    soloLevel: '160+',
    groupLevel: '120+',
    attackStyle: [
      'atak dystansowy',
      'beam death',
      'paraliżujący stalagmite',
      'niewidzialność i summon werefoxa',
    ],
    resistances: {
      physical: 0,
      earth: -75,
      fire: 25,
      ice: -75,
      energy: -75,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: 'Fox Paw',
        chance: 'very common',
      },
      {
        name: 'Werefox Tail',
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'Assassin Star',
        chance: 'common',
      },
      {
        name: 'Great Spirit Potion',
        chance: 'common',
      },
      {
        name: 'Moonlight Crystals',
        chance: 'semi-rare',
      },
      {
        name: 'Werefox Trophy',
        chance: 'semi-rare',
      },
      {
        name: 'Foxtail',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Blight Mariner',
    slug: 'Blight-Mariner',
    imageUrl: 'https://static.tibia.com/images/library/creatures/blightmariner.gif',
    boss: true,
    shortDescription:
      'Boss z Between the Lines Quest oparty bardziej na mechanice niż na samych statystykach. Nie wolno bić go, gdy żyją Drowned Deck Hands, bo wtedy leczy 5000 HP, a z czasem arena zalewa się dodatkowymi spittersami.',
    accessQuest: 'Wymaga dostępu do Between the Lines Quest i wejścia przez obraz w Venore.',
    location: 'Venore, ukryta arena dostępna po kliknięciu obrazu.',
    soloLevel: '350+',
    groupLevel: '250+',
    attackStyle: [
      'uderzenia wręcz',
      'leczenie po trafieniach gdy żyją addy',
      'cykliczne wycofywanie się na statek',
      'ciągłe przywołania Drowned Deck Handów',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'Small Topaz',
        chance: 'common',
      },
      {
        name: 'moonstone',
        chance: 'common',
      },
      {
        name: 'Sword Ring',
        chance: 'uncommon',
      },
      {
        name: 'Terra Boots',
        chance: 'uncommon',
      },
      {
        name: 'Gold Ingot',
        chance: 'uncommon',
      },
      {
        name: 'Proficiency Catalyst',
        chance: 'rare',
      },
      {
        name: 'Crystalline Armor',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Bloodback',
    slug: 'Bloodback',
    imageUrl: 'https://static.tibia.com/images/library/creatures/bloodhoof.gif',
    boss: true,
    shortDescription:
      'Lider wereboarów walczący głównie fizycznie i przez przywołanie wsparcia. To prosty solo boss, ale w zwarciu potrafi mocno przycisnąć, więc dystans i fire wciąż działają najlepiej.',
    accessQuest: 'Solo boss w Grimvale Quest, część The Curse Spreads.',
    location: 'Edron, za Earth Portalem w jaskini werebestii.',
    soloLevel: '150+',
    groupLevel: '110+',
    attackStyle: ['uderzenia wręcz', 'fizyczny burst', 'wzmocnienie berserk', 'summon wereboara'],
    resistances: {
      physical: 0,
      earth: -75,
      fire: 25,
      ice: 0,
      energy: -75,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'very common',
      },
      {
        name: 'Wereboar Hooves',
        chance: 'very common',
      },
      {
        name: 'Wereboar Tusks',
        chance: 'very common',
      },
      {
        name: 'Great Health Potion',
        chance: 'common',
      },
      {
        name: 'Wereboar Loincloth',
        chance: 'common',
      },
      {
        name: 'Dreaded Cleaver',
        chance: 'uncommon',
      },
      {
        name: 'Wereboar Trophy',
        chance: 'semi-rare',
      },
      {
        name: 'Spiked Squelcher',
        chance: 'semi-rare',
      },
    ],
  },
  {
    name: 'Bone Overlord',
    slug: 'Bone-Overlord',
    imageUrl: 'https://static.tibia.com/images/library/creatures/boneoverlordbosstiary.gif',
    boss: true,
    shortDescription:
      'Finał The Roost of the Graveborn Quest z rozbudowaną walką fazową. Najpierw trzeba zniszczyć soulcage’e i ogarniać teleporty, agony, curse oraz mana drain, a dopiero potem dobić właściwą phylactery z lootem.',
    accessQuest:
      'Wymaga ukończenia czterech poprzednich bossów w The Roost of the Graveborn Quest.',
    location: 'Forgotten Crypt pod Draconią.',
    soloLevel: '1000+',
    groupLevel: '600+',
    attackStyle: [
      'teleportowanie graczy do izolatki',
      'agony z oczu i wraithfire',
      'mana drain w czasie',
      'klątwa z obszarową eksplozją fizyczną',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Bonelord Eye',
        chance: 'common',
      },
      {
        name: 'Unholy Bone',
        chance: 'common',
      },
      {
        name: 'Haunted Blade',
        chance: 'uncommon',
      },
      {
        name: 'Giant Ruby',
        chance: 'uncommon',
      },
      {
        name: 'Giant Sapphire',
        chance: 'uncommon',
      },
      {
        name: 'Soul Trap',
        chance: 'rare',
      },
      {
        name: 'Necromantic Crypt Rune',
        chance: 'rare',
        notes: 'Drop pochodzi z Bonelords’s Phylactery, a nie bezpośrednio z modelu bossa.',
      },
    ],
  },
  {
    name: 'Brain Head',
    slug: 'Brain-Head',
    imageUrl: 'https://static.tibia.com/images/library/creatures/brainhead.gif',
    boss: true,
    shortDescription:
      'Undead boss z Feaster of Souls, którego trzeba bić głównie ice. Należy najpierw oczyścić część Cerebellumów i bardzo uważać na energię, bo ta leczy bossa, a fire według strategii też jest złym wyborem.',
    accessQuest: 'Wymaga postępu w Feaster of Souls Quest po misji Drain the Brain.',
    location: 'Netherworld.',
    soloLevel: '500+',
    groupLevel: '300+',
    attackStyle: [
      'uderzenia wręcz',
      'silne kontry po podejściu addów',
      'leczenie od obrażeń energy',
      'presja od Cerebellumów i Bad Thoughtów',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: -75,
      ice: 25,
      energy: -100,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Spirit Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Death Toll',
        chance: 'uncommon',
      },
      {
        name: "Brain Head's Giant Neuron",
        chance: 'rare',
      },
      {
        name: "Brain Head's Left Hemisphere",
        chance: 'rare',
      },
      {
        name: "Brain Head's Right Hemisphere",
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Brokul',
    slug: 'Brokul',
    imageUrl: 'https://static.tibia.com/images/library/creatures/brokul.gif',
    boss: true,
    shortDescription:
      'Boss deathlingów z Secret Library, bardzo groźny dla graczy stojących na linii jego beamów. Nie wolno stać przed nim ani zbyt blisko, bo łączy mocne beamy z bombami, paraliżem i leczeniem.',
    accessQuest: 'Część The Secret Library Quest.',
    location: 'Deepling Ancestorial Grounds.',
    soloLevel: '450+',
    groupLevel: '250+',
    attackStyle: [
      'mocne beamy fire, holy i death',
      'bomby obszarowe',
      'paraliż dystansowy',
      'leczenie',
    ],
    resistances: {
      physical: 0,
      earth: -100,
      fire: -100,
      ice: -100,
      energy: 25,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'The True Book of Death',
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'Broccoli',
        chance: 'common',
      },
      {
        name: 'Red Gem',
        chance: 'common',
      },
      {
        name: 'Gold Ingot',
        chance: 'uncommon',
      },
      {
        name: 'Deepling Ceremonial Dagger',
        chance: 'rare',
      },
      {
        name: 'Deepling Fork',
        chance: 'rare',
      },
      {
        name: 'Small Diamond',
        chance: 'uncommon',
      },
    ],
  },
  {
    name: 'Chagorz',
    slug: 'Chagorz',
    imageUrl: 'https://static.tibia.com/images/library/creatures/chagorz.gif',
    boss: true,
    shortDescription:
      'Jeden z najcięższych bossów Rotten Blood Quest, mocno oparty na polach darkfield, pillarach i rotten charge. Jeśli drużyna źle zarządza ruchem albo dopuści do złych eksplozji i beamów, boss szybko zaczyna leczyć się i karać ogromnym burstem fire.',
    accessQuest:
      'Wymaga dostępu do Rotten Blood Quest i pełnego naładowania Rotten Charges w Gloom Pillars.',
    location: 'Gloom Pillars.',
    soloLevel: '1100+',
    groupLevel: '650+',
    attackStyle: [
      'pierścień energy o ogromnym zasięgu',
      'bomby i beam death',
      'pola darkfield leczące bossa',
      'summon Pillar of Dark Energy',
    ],
    resistances: {
      physical: 0,
      earth: -75,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Spirit Potion',
        chance: 'common',
      },
      {
        name: 'The Essence of Chagorz',
        chance: 'uncommon',
      },
      {
        name: 'Spiritual Horseshoe',
        chance: 'rare',
      },
      {
        name: 'Darklight Geode',
        chance: 'rare',
      },
      {
        name: 'Bag You Covet',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Count Vlarkorth',
    slug: 'Count-Vlarkorth',
    imageUrl: 'https://static.tibia.com/images/library/creatures/countvlarkort.gif',
    boss: true,
    shortDescription:
      'Boss z Grave Danger Quest, który robi się uciążliwy głównie przez summonowanie minionów i fazy niewrażliwości. Trzeba trzymać Soulless Miniony z dala od niego i poprawnie używać szczątków dark vocationów, inaczej walka mocno się przeciąga.',
    accessQuest: 'Jeden z bossów Grave Danger Quest pod cmentarzem na północ od Edron.',
    location: 'Pod cmentarzem na północ od Edron.',
    soloLevel: '650+',
    groupLevel: '350+',
    attackStyle: [
      'uderzenia wręcz',
      'mocny beam fire',
      'summon Soulless Minionów',
      'leczenie i life steal',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: -75,
      ice: 0,
      energy: -75,
      holy: 0,
      death: 25,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'very common',
      },
      {
        name: 'Silver Token',
        chance: 'very common',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Spirit Potion',
        chance: 'common',
      },
      {
        name: 'Medal of Valiance',
        chance: 'uncommon',
      },
      {
        name: 'Ancient Liche Bone',
        chance: 'rare',
      },
      {
        name: 'Final Judgement',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Court Warlock',
    slug: 'Court-Warlock',
    imageUrl: 'https://static.tibia.com/images/library/creatures/courtwarlock.gif',
    boss: true,
    shortDescription:
      'Finał The Order of the Stag Quest zaczyna się od długiej gauntletowej obrony przeciw falom Raubritterów i zabójczemu death terenowi. Sam Court Warlock pojawia się dopiero po wyczyszczeniu minionów i jego końcowa siła zależy od tego, jak dobrze drużyna poradziła sobie wcześniej.',
    accessQuest:
      'Finalny boss The Order of the Stag Quest, po rozmowie z Captain Marie-Denise Banner na Isle of Ada.',
    location: 'Isle of Ada.',
    soloLevel: '600+',
    groupLevel: '400+',
    attackStyle: [
      'walka wręcz',
      'teleportowanie graczy po arenie',
      'ciągłe fale Raubritterów',
      'death tiles i finałowa faza bossa',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'Ultimate Health Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Spellbook of Mind Control',
        chance: 'common',
      },
      {
        name: 'Twisted Marionette',
        chance: 'rare',
      },
      {
        name: 'Stag Plate',
        chance: 'very rare',
      },
      {
        name: 'Stag Spellbook',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Darkfang',
    slug: 'Darkfang',
    imageUrl: 'https://static.tibia.com/images/library/creatures/darkfang.gif',
    boss: true,
    shortDescription:
      'Wilkolaczy boss z Grimvale, walczacy glownie w zwarciu i wspierajacy sie przywolaniami. Najwieksze zagrozenie robi, gdy summonowane wilki zaczynaja dokladac obrazenia obok jego falowego ataku.',
    accessQuest:
      'Teleport w jaskini werebestii na Edron w trakcie Grimvale Quest (The Curse Spreads).',
    location: 'Edron, po teleporcie wewnatrz jaskini werebestii.',
    soloLevel: '130+',
    groupLevel: '80+',
    attackStyle: ['uderzenia wrecz', 'przywolania gloom wolfow', 'falowy atak obszarowy'],
    resistances: {
      physical: 0,
      earth: -75,
      fire: 25,
      ice: -75,
      energy: -75,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: 'gold coin',
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'very common',
      },
      {
        name: 'black pearl',
        chance: 'common',
      },
      {
        name: 'werewolf fur',
        chance: 'common',
      },
      {
        name: 'werewolf fangs',
        chance: 'common',
      },
      {
        name: 'stone skin amulet',
        chance: 'uncommon',
      },
      {
        name: 'silver token',
        chance: 'rare',
      },
      {
        name: 'dreaded cleaver',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Deathstrike',
    slug: 'Deathstrike',
    imageUrl: 'https://static.tibia.com/images/library/creatures/deathstrike.gif',
    boss: true,
    shortDescription:
      "Warzone'owy geo-elemental z bardzo mocnym melee, niewidzialnoscia i czestym leczeniem. Walka dluzy sie przez jego self-heal, wiec potrzebuje stalej presji i sensownego focusu druzyny.",
    accessQuest: "Wymagany dostep do Warzone 1 w Bigfoot's Burden oraz wejscie do sali bossa.",
    location: 'Warzone 1.',
    soloLevel: '700+',
    groupLevel: '250+',
    attackStyle: [
      'mocne uderzenia wrecz',
      'mana drain wave',
      'fire beam i energy missile',
      'niewidzialnosc oraz samoleczenie',
    ],
    resistances: {
      physical: -75,
      earth: -100,
      fire: -75,
      ice: -75,
      energy: -75,
      holy: -75,
      death: -75,
    },
    loot: [
      {
        name: "deathstrike's snippet",
        chance: 'very common',
      },
      {
        name: 'crystal crossbow',
        chance: 'uncommon',
      },
      {
        name: 'crystalline axe',
        chance: 'uncommon',
      },
      {
        name: 'crystalline sword',
        chance: 'uncommon',
      },
      {
        name: 'mycological bow',
        chance: 'uncommon',
      },
      {
        name: 'mycological mace',
        chance: 'uncommon',
      },
      {
        name: 'shiny blade',
        chance: 'uncommon',
      },
      {
        name: 'decorative ribbon',
        chance: 'semi-rare',
      },
    ],
  },
  {
    name: 'Dragon Pack',
    slug: 'Dragon-Pack',
    imageUrl: 'https://static.tibia.com/images/library/creatures/representingdespor.gif',
    boss: true,
    shortDescription:
      'To nie klasyczny pojedynczy boss, lecz reprezentacja Dragon Hoard z finalu 20 Years a Cook Quest. Sam cel jest nieosiagalny, a zagrozenie pochodzi od ostatniego smoka, z ktorym dzieli pule zycia.',
    accessQuest:
      'Pojawia sie tylko w finalnej walce 20 Years a Cook Quest po ubiciu siedmiu smokow.',
    location: 'Sala finalna Dragon Hoard w 20 Years a Cook Quest.',
    soloLevel: '900+',
    groupLevel: '400+',
    attackStyle: [
      'brak bezposrednich atakow',
      'dzielona pula hp z ostatnim smokiem',
      'zagrozenia zalezne od aktywnego smoka',
    ],
    resistances: {
      physical: -100,
      earth: -100,
      fire: -100,
      ice: -100,
      energy: -100,
      holy: -100,
      death: -100,
    },
    loot: [
      {
        name: 'gold-scaled sentinel',
        chance: 'semi-rare',
      },
      {
        name: 'arcane dragon robe',
        chance: 'rare',
      },
      {
        name: 'mystical dragon robe',
        chance: 'rare',
      },
      {
        name: 'dauntless dragon scale armor',
        chance: 'rare',
      },
      {
        name: 'unerring dragon scale armor',
        chance: 'rare',
      },
      {
        name: 'heralds insignia',
        chance: 'very rare',
      },
      {
        name: 'heralds wings',
        chance: 'very rare',
      },
      {
        name: 'merudri battle mail',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Drume',
    slug: 'Drume',
    imageUrl: 'https://static.tibia.com/images/library/creatures/drume.gif',
    boss: true,
    shortDescription:
      'Uzurpator z Order of the Lion walczacy w zwarciu, ale dorzucajacy mocne earth i death. Dodatkowe ryzyko daja jego przywolania, wiec walka robi sie niebezpieczna, gdy zespol traci kontrole nad polem.',
    accessQuest:
      'Boss z The Order of the Lion Quest, odblokowywany podczas watku uzurpatorow w Bounac.',
    location: 'Bounac, pola na poludniowy wschod od miasta.',
    soloLevel: '400+',
    groupLevel: '250+',
    attackStyle: [
      'uderzenia wrecz',
      'earth strike i trucizna',
      'death projectile',
      'przywolania rycerzy zakonu',
    ],
    resistances: {
      physical: -75,
      earth: -100,
      fire: 0,
      ice: 0,
      energy: 25,
      holy: 25,
      death: -75,
    },
    loot: [
      {
        name: 'royal star',
        chance: 'very common',
      },
      {
        name: 'ultimate mana potion',
        chance: 'common',
      },
      {
        name: 'supreme health potion',
        chance: 'common',
      },
      {
        name: 'bullseye potion',
        chance: 'common',
      },
      {
        name: 'silver token',
        chance: 'uncommon',
      },
      {
        name: 'lion amulet',
        chance: 'rare',
      },
      {
        name: 'lion spellbook',
        chance: 'rare',
      },
      {
        name: 'lion plate',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Duke Krule',
    slug: 'Duke-Krule',
    imageUrl: 'https://static.tibia.com/images/library/creatures/dukekrule.gif',
    boss: true,
    shortDescription:
      'Undead boss z Grave Danger, ktory sam nie jest najgorszy, ale jego summony i mechanika ognia oraz wody potrafia skasowac nieustawiona druzyne. Gracze z rozna przemiana nie powinni podchodzic do siebie, bo dostaja bardzo wysoki burst.',
    accessQuest: 'Wymagany postep w Grave Danger Quest i wejscie do instancji pod Ancient Temple.',
    location: 'Pod Ancient Temple pod Thais.',
    soloLevel: '900+',
    groupLevel: '450+',
    attackStyle: [
      'uderzenia wrecz',
      'przywolania',
      'obrazenia od efektow ognia i lodu',
      'mechanika przemiany druzyny',
    ],
    resistances: {
      physical: 0,
      earth: -75,
      fire: 25,
      ice: 0,
      energy: -75,
      holy: 0,
      death: -100,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'ultimate mana potion',
        chance: 'common',
      },
      {
        name: 'supreme health potion',
        chance: 'common',
      },
      {
        name: 'silver token',
        chance: 'uncommon',
      },
      {
        name: 'young lich worm',
        chance: 'uncommon',
      },
      {
        name: 'rotten heart',
        chance: 'rare',
      },
      {
        name: 'noble amulet',
        chance: 'rare',
      },
      {
        name: 'final judgement',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Earl Osam',
    slug: 'Earl-Osam',
    imageUrl: 'https://static.tibia.com/images/library/creatures/earlosam.gif',
    boss: true,
    shortDescription:
      'Nekromantyczny boss z Grave Danger oparty o ice i earth. Kluczowy moment walki to faza channelingu, kiedy trzeba blyskawicznie zbijac Magical Spheres, bo kazda kula moze podleczyc go o ogromna ilosc hp.',
    accessQuest: 'Wymagany postep w Grave Danger Quest i dostep do walki na cmentarzu Cormayi.',
    location: 'Cmentarz na Cormayi.',
    soloLevel: '900+',
    groupLevel: '450+',
    attackStyle: [
      'uderzenia wrecz',
      'ice beam i ice chain',
      'earth wave',
      'faza channelingu z leczacymi kulami',
    ],
    resistances: {
      physical: 0,
      earth: -75,
      fire: 25,
      ice: -100,
      energy: 25,
      holy: 0,
      death: -100,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'ultimate spirit potion',
        chance: 'common',
      },
      {
        name: 'supreme health potion',
        chance: 'common',
      },
      {
        name: 'silver token',
        chance: 'uncommon',
      },
      {
        name: 'ancient liche bone',
        chance: 'uncommon',
      },
      {
        name: 'rotten heart',
        chance: 'rare',
      },
      {
        name: 'token of love',
        chance: 'rare',
      },
      {
        name: 'final judgement',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Ekatrix',
    slug: 'Ekatrix',
    imageUrl: 'https://static.tibia.com/images/library/creatures/ekatrix.gif',
    boss: true,
    shortDescription:
      'Niski poziomem boss-czarownica z Tainted Souls, walczaca jak mocniejsza Witch. Trzyma dystans, rzuca ogien i zostawia fire fieldy, ale dla przygotowanej postaci nie stanowi duzego zagrozenia.',
    accessQuest: 'Czesc The Tainted Souls Quest, z dostepem do Tainted Caves w Green Claw Swamp.',
    location: 'Tainted Caves w Green Claw Swamp.',
    soloLevel: '80+',
    groupLevel: '40+',
    attackStyle: ['fireball', 'fire field', 'walka na dystans'],
    resistances: {
      physical: 25,
      earth: -75,
      fire: 0,
      ice: 0,
      energy: -100,
      holy: 25,
      death: 0,
    },
    loot: [
      {
        name: 'gold coin',
        chance: 'very common',
      },
      {
        name: 'cookie',
        chance: 'common',
      },
      {
        name: 'broom',
        chance: 'common',
      },
      {
        name: 'witch broom',
        chance: 'uncommon',
      },
      {
        name: 'necrotic rod',
        chance: 'uncommon',
      },
      {
        name: 'stuffed toad',
        chance: 'uncommon',
      },
      {
        name: 'stealth ring',
        chance: 'rare',
      },
      {
        name: 'witch hat',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Eldritch Dragon Lord',
    slug: 'Eldritch-Dragon-Lord',
    imageUrl: 'https://static.tibia.com/images/library/creatures/eldritchdragonlord.gif',
    boss: true,
    shortDescription:
      'Nowoczesny smok-boss z Roost of the Graveborn, nastawiony na mocna presje i nagrody questowe. Przy skromnych danych na wiki najlepiej traktowac go jak znacznie wzmocnionego Dragon Lorda z wysoka kara za bledy pozycyjne.',
    accessQuest:
      'Czesc The Roost of the Graveborn Quest; cooldown mozna resetowac Golden Claw, a Fiery Crypt Rune wypada dopiero po pelnym ukonczeniu questa.',
    location: 'Pits of Inferno Dragon Lair.',
    soloLevel: '1000+',
    groupLevel: '600+',
    attackStyle: ['mocne ataki ogniowe', 'obrazenia obszarowe smoczego typu', 'uderzenia wrecz'],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'crystal coin',
        chance: 'common',
      },
      {
        name: 'ultimate health potion',
        chance: 'common',
      },
      {
        name: 'dragon tongue',
        chance: 'common',
      },
      {
        name: 'dragonbone staff',
        chance: 'uncommon',
      },
      {
        name: 'dragon shield',
        chance: 'uncommon',
      },
      {
        name: 'dragon slayer',
        chance: 'uncommon',
      },
      {
        name: 'golden claw',
        chance: 'rare',
      },
      {
        name: 'fiery crypt rune',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Eradicator',
    slug: 'Eradicator',
    imageUrl: 'https://static.tibia.com/images/library/creatures/eradicator.gif',
    boss: true,
    shortDescription:
      'Elektryczny boss z Heart of Destruction z bardzo mocnym melee i stalym spamem energy wave oraz beam. Co pewien czas zmienia forme i przywoluje Sparks of Destruction, wiec druzyna musi szybko przelaczac fokus.',
    accessQuest: 'Jeden z bossow Heart of Destruction Quest, wymagajacy dostepu do Otherworldu.',
    location: 'Otherworld.',
    soloLevel: '900+',
    groupLevel: '450+',
    attackStyle: [
      'bardzo mocne uderzenia wrecz',
      'great energy wave',
      'great energy beam',
      'zmiana formy i przywolania spark of destruction',
    ],
    resistances: {
      physical: -75,
      earth: -75,
      fire: -75,
      ice: -75,
      energy: -75,
      holy: -75,
      death: 0,
    },
    loot: [
      {
        name: 'gold token',
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'yellow gem',
        chance: 'common',
      },
      {
        name: 'ultimate health potion',
        chance: 'common',
      },
      {
        name: 'spark sphere',
        chance: 'uncommon',
      },
      {
        name: 'mysterious remains',
        chance: 'uncommon',
      },
      {
        name: 'void boots',
        chance: 'rare',
      },
      {
        name: 'plasmatic lightning',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Essence Of Malice',
    slug: 'Essence-Of-Malice',
    imageUrl: 'https://static.tibia.com/images/library/creatures/essenceofmalice.gif',
    boss: true,
    shortDescription:
      'Smoczo-undeadowy boss z Cults of Tibia, bijacy glownie death i walczacy bez szczegolnie skomplikowanej mechaniki. Najwazniejsze to nie opierac dps-u na death i wykorzystywac jego wyrazne slabosci na zywioly.',
    accessQuest: 'Czesc Cults of Tibia Quest, z walka odblokowywana w Forbidden Temple pod Carlin.',
    location: 'Forbidden Temple pod Carlin.',
    soloLevel: '350+',
    groupLevel: '220+',
    attackStyle: ['uderzenia wrecz', 'death missile', 'death beam', 'chain lightning z death'],
    resistances: {
      physical: 0,
      earth: 25,
      fire: 25,
      ice: -75,
      energy: 25,
      holy: 25,
      death: -100,
    },
    loot: [
      {
        name: 'gold coin',
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'ultimate health potion',
        chance: 'common',
      },
      {
        name: 'demon shield',
        chance: 'uncommon',
      },
      {
        name: 'shockwave amulet',
        chance: 'uncommon',
      },
      {
        name: 'gold token',
        chance: 'uncommon',
      },
      {
        name: 'blade of corruption',
        chance: 'rare',
      },
      {
        name: 'magma monocle',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Faceless Bane',
    slug: 'Faceless-Bane',
    imageUrl: 'https://static.tibia.com/images/library/creatures/facelessbane.gif',
    boss: true,
    shortDescription:
      'Dream Courtsowy duch-boss, ktory laczy energy, death i life drain oraz doklada trzy typy spectrow naraz. W praktyce trzeba unikac death damage i dobrze zabezpieczyc blockerowi energy/death, bo combo wchodzi niemal co ture.',
    accessQuest:
      'Czesc The Dream Courts Quest (linia Haunted House), z dostepem do Buried Cathedral.',
    location: 'Buried Cathedral.',
    soloLevel: '450+',
    groupLevel: '250+',
    attackStyle: [
      'uderzenia wrecz',
      'energy strike',
      'death strike',
      'beam life drain i przywolania spectrow',
    ],
    resistances: {
      physical: -75,
      earth: 0,
      fire: 25,
      ice: 0,
      energy: 0,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'small sapphire',
        chance: 'common',
      },
      {
        name: 'life crystal',
        chance: 'uncommon',
      },
      {
        name: 'violet gem',
        chance: 'uncommon',
      },
      {
        name: 'book backpack',
        chance: 'rare',
      },
      {
        name: 'ectoplasmic shield',
        chance: 'rare',
      },
      {
        name: 'spirit guide',
        chance: 'rare',
      },
      {
        name: 'dream blossom staff',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Ghulosh',
    slug: 'Ghulosh',
    imageUrl: 'https://static.tibia.com/images/library/creatures/ghulosh.gif',
    boss: true,
    shortDescription:
      'Biblioteczny demon z Secret Library z charakterystyczna faza Deathgaze. Walka polega na ustawianiu odbitych beamow w Concentrated Death i jednoczesnym pilnowaniu minionow, bo samo bicie bossa nie wystarczy.',
    accessQuest:
      'Czesc The Secret Library Quest; wejscie przez Fire Section i aktywacja walki przy Ostentatious Bookstand.',
    location: 'Fire Section w Secret Library.',
    soloLevel: '1100+',
    groupLevel: '600+',
    attackStyle: [
      'uderzenia wrecz',
      'death beam i death wave',
      'poison explosion',
      'physical chain i faza deathgaze',
    ],
    resistances: {
      physical: 0,
      earth: 25,
      fire: -100,
      ice: -75,
      energy: -75,
      holy: 25,
      death: -75,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'supreme health potion',
        chance: 'common',
      },
      {
        name: 'silver token',
        chance: 'common',
      },
      {
        name: 'knowledgeable book',
        chance: 'uncommon',
      },
      {
        name: 'solid rage',
        chance: 'uncommon',
      },
      {
        name: 'unliving demonbone',
        chance: 'rare',
      },
      {
        name: 'ornate tome',
        chance: 'rare',
      },
      {
        name: 'gold token',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Gnomevil',
    slug: 'Gnomevil',
    imageUrl: 'https://static.tibia.com/images/library/creatures/gnomehorticulist.gif',
    boss: true,
    shortDescription:
      'Warzone 2 boss, relatywnie latwy jak na swoja pule hp, ale z bardzo mocnym melee i paskudnym mana drainem. Najbezpieczniej zamknac go na blokerach, bo wtedy jego beamy i retarget na najwyzszy dps sa duzo latwiejsze do opanowania.',
    accessQuest: "Wymagany dostep do Warzone 2 w Bigfoot's Burden.",
    location: 'Sala bossa w Warzone 2.',
    soloLevel: '650+',
    groupLevel: '250+',
    attackStyle: [
      'mocne uderzenia wrecz',
      'ice i earth strike',
      'mana drain beams',
      'niewidzialnosc i samoleczenie',
    ],
    resistances: {
      physical: -75,
      earth: -100,
      fire: -75,
      ice: -75,
      energy: -100,
      holy: -75,
      death: -75,
    },
    loot: [
      {
        name: "gnomevil's hat",
        chance: 'very common',
      },
      {
        name: 'crystalline sword',
        chance: 'uncommon',
      },
      {
        name: 'crystal crossbow',
        chance: 'uncommon',
      },
      {
        name: 'crystalline axe',
        chance: 'uncommon',
      },
      {
        name: 'mycological bow',
        chance: 'uncommon',
      },
      {
        name: 'mycological mace',
        chance: 'uncommon',
      },
      {
        name: 'shiny blade',
        chance: 'uncommon',
      },
      {
        name: 'decorative ribbon',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Gorzindel',
    slug: 'Gorzindel',
    imageUrl: 'https://static.tibia.com/images/library/creatures/gorzindel.gif',
    boss: true,
    shortDescription:
      'Demoniczny boss z Secret Library, ktorego najpierw trzeba oslabic przez niszczenie ksiag w osobnych pokojach. Walka mocno premiuje kontrole minionow, szybkie przejscia przez teleport i odporna druzyne na paralize.',
    accessQuest:
      'Czesc The Secret Library Quest; wejscie przez Fire Section i teleport aktywowany Ostentatious Bookstand.',
    location: 'Secret Library.',
    soloLevel: '1200+',
    groupLevel: '650+',
    attackStyle: [
      'mocne czary obszarowe',
      'paraliza',
      'przywolania minionow',
      'mechanika niszczenia ksiag',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: -100,
      ice: 0,
      energy: -75,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'crystal coin',
        chance: 'common',
      },
      {
        name: 'ultimate spirit potion',
        chance: 'common',
      },
      {
        name: 'knowledgeable book',
        chance: 'uncommon',
      },
      {
        name: 'sinister book',
        chance: 'uncommon',
      },
      {
        name: 'ominous book',
        chance: 'uncommon',
      },
      {
        name: 'curious matter',
        chance: 'rare',
      },
      {
        name: 'gold token',
        chance: 'rare',
      },
    ],
  },
  {
    name: "Goshnar's Cruelty",
    slug: "Goshnar's-Cruelty",
    imageUrl: 'https://static.tibia.com/images/library/creatures/goshnarscruelty.gif',
    boss: true,
    shortDescription:
      'Soul Warowy boss-duch walczacy przewaznie w zwarciu, ale regularnie mieszajacy fizyczne combosy z life drainem. Nie ma wyraznych slabosci elementarnych, wiec najwazniejsze sa defensy i stabilne utrzymanie pozycji.',
    accessQuest: 'Czesc Soul War Quest; wymagany dostep do Furious Crater i instancji bossa.',
    location: 'Furious Crater.',
    soloLevel: '1600+',
    groupLevel: '800+',
    attackStyle: [
      'uderzenia wrecz',
      'life drain wave',
      'physical chain i dust berserk',
      'krwawe pociski obszarowe',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'ultimate mana potion',
        chance: 'common',
      },
      {
        name: 'crystal coin',
        chance: 'common',
      },
      {
        name: "cruelty's chest",
        chance: 'rare',
      },
      {
        name: "cruelty's claw",
        chance: 'rare',
      },
      {
        name: 'figurine of cruelty',
        chance: 'rare',
      },
      {
        name: 'bag you desire',
        chance: 'rare',
      },
      {
        name: 'spectral saddle',
        chance: 'very rare',
      },
      {
        name: 'spectral horse tack',
        chance: 'very rare',
      },
    ],
  },
  {
    name: "Goshnar's Greed",
    slug: "Goshnar's-Greed",
    imageUrl: 'https://static.tibia.com/images/library/creatures/goshnarsgreed.gif',
    boss: true,
    shortDescription:
      'Soul Warowy boss z Mirrored Nightmare, opisany na wiki dosc skromnie, ale traktowany jako dluga i wymagajaca walka endgame. Przy braku oczywistych slabosci najlepiej wejsc z pelnym przygotowaniem defensywnym i mocnym, rownym dps-em.',
    accessQuest: 'Czesc Soul War Quest; wymagany dostep do Mirrored Nightmare i instancji bossa.',
    location: 'Mirrored Nightmare.',
    soloLevel: '1600+',
    groupLevel: '800+',
    attackStyle: [
      'uderzenia wrecz',
      'obrazenia obszarowe',
      'dluga walka na wytrzymalosc',
      'brak wyraznych slabosci elementarnych',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'ultimate mana potion',
        chance: 'common',
      },
      {
        name: 'crystal coin',
        chance: 'common',
      },
      {
        name: 'giant shimmering pearl',
        chance: 'uncommon',
      },
      {
        name: 'figurine of greed',
        chance: 'rare',
      },
      {
        name: "greed's arm",
        chance: 'rare',
      },
      {
        name: 'bag you desire',
        chance: 'rare',
      },
      {
        name: 'spectral saddle',
        chance: 'very rare',
      },
      {
        name: 'spectral horseshoe',
        chance: 'very rare',
      },
    ],
  },
  {
    name: "Goshnar's Hatred",
    slug: "Goshnar's-Hatred",
    imageUrl: 'https://static.tibia.com/images/library/creatures/goshnarshatred.gif',
    boss: true,
    shortDescription:
      'Upiorny archfoe z Soul War skupiony na czystej wytrzymalosci i dlugiej walce w ciasnej arenie.',
    accessQuest: 'Wymaga dostepu do Soul War Quest.',
    location: 'Rotten Wasteland.',
    soloLevel: '1000+',
    groupLevel: '600+',
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Figurine of Hatred',
        chance: 'uncommon',
      },
      {
        name: 'Vial of Hatred',
        chance: 'uncommon',
      },
      {
        name: 'Bracelet of Strengthening',
        chance: 'rare',
      },
      {
        name: 'Bag You Desire',
        chance: 'rare',
      },
      {
        name: 'Spectral Horse Tack',
        chance: 'very rare',
      },
    ],
  },
  {
    name: "Goshnar's Malice",
    slug: "Goshnar's-Malice",
    imageUrl: 'https://static.tibia.com/images/library/creatures/goshnarsmalice.gif',
    boss: true,
    shortDescription:
      'Lodowy archfoe z Soul War, ktory odbija zywiolowe obrazenia i potrafi mocno karac za zly element ataku.',
    accessQuest: 'Wymaga dostepu do Soul War Quest.',
    location: 'Claustrophobic Inferno.',
    soloLevel: '1000+',
    groupLevel: '600+',
    attackStyle: ['mocne ataki ice', 'odbicie obrazen zywiolowych', 'ice beamy', 'krwawe bomby'],
    resistances: {
      physical: 0,
      earth: -30,
      fire: -30,
      ice: 0,
      energy: -30,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Figurine of Malice',
        chance: 'uncommon',
      },
      {
        name: "Malice's Horn",
        chance: 'uncommon',
      },
      {
        name: "Malice's Spine",
        chance: 'uncommon',
      },
      {
        name: 'The Skull of a Beast',
        chance: 'semi-rare',
      },
      {
        name: 'Dragon Figurine',
        chance: 'rare',
      },
      {
        name: 'Spectral Saddle',
        chance: 'very rare',
      },
    ],
  },
  {
    name: "Goshnar's Spite",
    slug: "Goshnar's-Spite",
    imageUrl: 'https://static.tibia.com/images/library/creatures/goshnarsspite.gif',
    boss: true,
    shortDescription:
      'Soul Warowy archfoe bazujacy na energii, earth i life drainie, grozny zwlaszcza dla zle ustawionej druzyny.',
    accessQuest: 'Wymaga dostepu do Soul War Quest.',
    location: 'Ebb and Flow.',
    soloLevel: '1000+',
    groupLevel: '600+',
    attackStyle: ['fale energy', 'beam earth', 'life drain wave', 'mocne obrazenia fizyczne'],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Figurine of Spite',
        chance: 'uncommon',
      },
      {
        name: "Spite's Spirit",
        chance: 'uncommon',
      },
      {
        name: 'The Skull of a Beast',
        chance: 'semi-rare',
      },
      {
        name: 'Bag You Desire',
        chance: 'rare',
      },
      {
        name: 'Spectral Horseshoe',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Grand Master Oberon',
    slug: 'Grand-Master-Oberon',
    imageUrl: 'https://static.tibia.com/images/library/creatures/grandmasteroberon.gif',
    boss: true,
    shortDescription:
      'Lider Order of the Falcon z wyrazna mechanika debat i resetowania zycia przy niskim hp.',
    accessQuest: 'Czesc The Secret Library Quest i wejscie do Falcon Bastion.',
    location: 'Falcon Bastion.',
    soloLevel: '500+',
    groupLevel: '300+',
    attackStyle: [
      'mocne uderzenia wrecz',
      'holy beam',
      'groundshaker earth',
      'death strike i leczenie z debata',
    ],
    resistances: {
      physical: -30,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 25,
      death: -75,
    },
    loot: [
      {
        name: 'The Spatial Warp Almanac',
        chance: 'very common',
      },
      {
        name: 'Falcon Bow',
        chance: 'rare',
      },
      {
        name: 'Falcon Shield',
        chance: 'rare',
      },
      {
        name: 'Falcon Plate',
        chance: 'very rare',
      },
      {
        name: 'Falcon Greaves',
        chance: 'very rare',
      },
      {
        name: 'Falcon Longsword',
        chance: 'rare',
      },
      {
        name: 'Falcon Coif',
        chance: 'rare',
      },
      {
        name: 'Grant of Arms',
        chance: 'semi-rare',
      },
    ],
  },
  {
    name: 'Ice Horror',
    slug: 'Ice-Horror',
    imageUrl: 'https://static.tibia.com/images/library/creatures/icehorror.gif',
    boss: true,
    shortDescription:
      'Nowoczesny boss z Okolnir oparty o burst energy i death, z lodowa odpornoscia i questowym cooldown resetem.',
    accessQuest:
      'Czesc The Roost of the Graveborn Quest; cooldown mozna resetowac Icy Horns, a Icy Crypt Rune wypada dopiero po ukonczeniu questa.',
    location: 'Okolnir.',
    soloLevel: '1000+',
    groupLevel: '600+',
    attackStyle: ['uderzenia wrecz', 'death ring', 'szeroka fala energy', 'presja obszarowa'],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: -100,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Great Spirit Potion',
        chance: 'common',
      },
      {
        name: 'Ice Rapier',
        chance: 'common',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Frosty Heart',
        chance: 'common',
      },
      {
        name: 'Crystal Ring',
        chance: 'uncommon',
      },
      {
        name: 'Pair of Earmuffs',
        chance: 'uncommon',
      },
      {
        name: 'Icy Crypt Rune',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Ichgahal',
    slug: 'Ichgahal',
    imageUrl: 'https://static.tibia.com/images/library/creatures/ichgahal.gif',
    boss: true,
    shortDescription:
      'Jeden z najciezszych bossow Rotten Blood, z ogromnym hp, przywolaniami i bardzo mocnym death ringiem.',
    accessQuest: 'Jeden z bossow Rotten Blood Quest.',
    location: 'Putrefactory.',
    soloLevel: '1200+',
    groupLevel: '700+',
    attackStyle: [
      'mocne uderzenia wrecz',
      'great death ring',
      'agony beam',
      'mana drain i summon grzybow',
    ],
    resistances: {
      physical: 0,
      earth: -75,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Spirit Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'The Essence of Ichgahal',
        chance: 'uncommon',
      },
      {
        name: "Ichgahal's Fungal Infestation",
        chance: 'rare',
      },
      {
        name: 'Putrefactive Figurine',
        chance: 'rare',
      },
      {
        name: 'Spiritual Horseshoe',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Irgix The Flimsy',
    slug: 'Irgix-The-Flimsy',
    imageUrl: 'https://static.tibia.com/images/library/creatures/irgix.gif',
    boss: true,
    shortDescription:
      'Widmowy boss z Feaster of Souls, prostszy mechanicznie, ale mocno niewrazliwy na energy i death.',
    accessQuest: 'Czesc Feaster of Souls Quest.',
    location: 'Netherworld.',
    soloLevel: '900+',
    groupLevel: '500+',
    attackStyle: ['walka wrecz'],
    resistances: {
      physical: -75,
      earth: 0,
      fire: 0,
      ice: 25,
      energy: -100,
      holy: 0,
      death: -100,
    },
    loot: [
      {
        name: 'Skull Coin',
        chance: 'common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Diamond',
        chance: 'common',
      },
      {
        name: 'Silver Hand Mirror',
        chance: 'uncommon',
      },
      {
        name: 'Death Toll',
        chance: 'rare',
      },
      {
        name: 'Pair of Nightmare Boots',
        chance: 'rare',
      },
      {
        name: 'Glacial Rod',
        chance: 'semi-rare',
      },
      {
        name: 'Springsprout Rod',
        chance: 'semi-rare',
      },
    ],
  },
  {
    name: 'Katex Blood Tongue',
    slug: 'Katex-Blood-Tongue',
    imageUrl: 'https://static.tibia.com/images/library/creatures/katex.gif',
    boss: true,
    shortDescription:
      'Werehyaenowy boss z Lion Sanctum, niepozorny na papierze, ale grozny przez summon i szybkie kombo death plus earth.',
    accessQuest: 'Czesc Grimvale Quest, etap An Ancient Feud.',
    location: 'Lion Sanctum.',
    soloLevel: '250+',
    groupLevel: '180+',
    attackStyle: [
      'uderzenia wrecz',
      'death bomb i death wave',
      'earth hit',
      'przywolanie werehyaeny',
    ],
    resistances: {
      physical: 0,
      earth: -75,
      fire: -30,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: "Katex' Blood",
        chance: 'uncommon',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Ultimate Health Potion',
        chance: 'common',
      },
      {
        name: 'Werehyaena Nose',
        chance: 'common',
      },
      {
        name: 'Werehyaena Talisman',
        chance: 'uncommon',
      },
      {
        name: 'Werehyaena Trophy',
        chance: 'semi-rare',
      },
      {
        name: 'Magic Plate Armor',
        chance: 'rare',
      },
      {
        name: 'Ornate Crossbow',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'King Zelos',
    slug: 'King-Zelos',
    imageUrl: 'https://static.tibia.com/images/library/creatures/kingzelos.gif',
    boss: true,
    shortDescription:
      'Final Grave Danger, byly krol Thais oparty na death obrazeniach, hexie i skalowaniu trudnosci zaleznie od postepu druzyny.',
    accessQuest: 'Finalny boss Grave Danger Quest po pokonaniu czterech minibossow.',
    location: 'Isle of the Kings.',
    soloLevel: '1000+',
    groupLevel: '500+',
    attackStyle: [
      'mocne uderzenia wrecz',
      'great hex beam',
      'rozszerzajacy sie death ring',
      'przywolania risen soldierow',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: -100,
    },
    loot: [
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Silver Token',
        chance: 'common',
      },
      {
        name: 'Gold Token',
        chance: 'uncommon',
      },
      {
        name: 'Ultimate Spirit Potion',
        chance: 'common',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Galea Mortis',
        chance: 'rare',
      },
      {
        name: 'Bow of Cataclysm',
        chance: 'rare',
      },
      {
        name: 'Death Oyoroi',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Kusuma',
    slug: 'Kusuma',
    imageUrl: 'https://static.tibia.com/images/library/creatures/kusuma.gif',
    boss: true,
    shortDescription:
      "Asuryjski boss z Marapur, mobilny i wygodny do kite'owania dzieki unikaniu energy fieldow.",
    accessQuest: 'Dostep do areny przez Energy Vein na Marapur.',
    location: 'Marapur.',
    soloLevel: '250+',
    groupLevel: '180+',
    attackStyle: ['uderzenia wrecz', 'earth damage', 'death damage', 'samoleczenie'],
    resistances: {
      physical: 0,
      earth: -100,
      fire: 25,
      ice: 0,
      energy: 25,
      holy: -30,
      death: 0,
    },
    loot: [
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Leaf Star',
        chance: 'common',
      },
      {
        name: 'Gold Ingot',
        chance: 'uncommon',
      },
      {
        name: 'Soul Orb',
        chance: 'uncommon',
      },
      {
        name: 'Golden Lotus Brooch',
        chance: 'semi-rare',
      },
      {
        name: 'Terra Hood',
        chance: 'semi-rare',
      },
      {
        name: 'Terra Legs',
        chance: 'rare',
      },
      {
        name: 'Snakebite Rod',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Lady Tenebris',
    slug: 'Lady-Tenebris',
    imageUrl: 'https://static.tibia.com/images/library/creatures/ladytenebris.gif',
    boss: true,
    shortDescription:
      'Boss Forgotten Knowledge skupiony na death obrazeniach i groznej eksplozji po teleportowaniu graczy do srodka areny.',
    accessQuest: 'Jeden z bossow Forgotten Knowledge Quest.',
    location: 'Dungeon za Death Portalem i Old Masonry.',
    soloLevel: '500+',
    groupLevel: '300+',
    attackStyle: [
      'mocne uderzenia wrecz',
      'death beam',
      'death strike',
      'teleport do centrum i eksplozja',
    ],
    resistances: {
      physical: 0,
      earth: -30,
      fire: -30,
      ice: -30,
      energy: -30,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: 'Gold Coin',
        chance: 'very common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Great Mana Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Health Potion',
        chance: 'common',
      },
      {
        name: 'Silver Token',
        chance: 'uncommon',
      },
      {
        name: 'Gold Token',
        chance: 'uncommon',
      },
      {
        name: 'Shadow Sceptre',
        chance: 'rare',
      },
      {
        name: 'Book of Lies',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Lloyd',
    slug: 'Lloyd',
    imageUrl: 'https://static.tibia.com/images/library/creatures/lloyd.gif',
    boss: true,
    shortDescription:
      'Piracki boss nastawiony na obrazenia fizyczne i death, dobry do szybkiego sprawdzenia statusu pod glowna postac.',
    accessQuest: 'Brak specjalnego questa dostepowego.',
    location: 'Vandura, piracka forteca na Vandura.',
    soloLevel: '250+',
    groupLevel: '150+',
    attackStyle: ['mocne uderzenia fizyczne', 'obrazenia death', 'przywolania'],
    resistances: {
      physical: -50,
      earth: -20,
      fire: -10,
      ice: -10,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'very common',
      },
      {
        name: 'great mana potion',
        chance: 'common',
      },
      {
        name: 'great health potion',
        chance: 'common',
      },
      {
        name: 'pirate boots',
        chance: 'uncommon',
      },
      {
        name: 'pirate shirt',
        chance: 'uncommon',
      },
      {
        name: 'ring of healing',
        chance: 'rare',
      },
      {
        name: 'gold ingot',
        chance: 'rare',
      },
      {
        name: 'small emerald',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Lokathmor',
    slug: 'Lokathmor',
    imageUrl: 'https://static.tibia.com/images/library/creatures/lokathmor.gif',
    boss: true,
    shortDescription:
      'Demoniczny boss z Secret Library, slaby na earth i energy, a odporny na fire, z klasycznym bibliotekowym lootem tokenowym.',
    accessQuest: 'Czesc The Secret Library Quest.',
    location: 'The Secret Library.',
    soloLevel: '500+',
    groupLevel: '300+',
    resistances: {
      physical: 0,
      earth: 25,
      fire: -75,
      ice: -30,
      energy: 25,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Silver Token',
        chance: 'common',
      },
      {
        name: 'Gold Token',
        chance: 'uncommon',
      },
      {
        name: 'Knowledgeable Book',
        chance: 'uncommon',
      },
      {
        name: 'Ominous Book',
        chance: 'uncommon',
      },
      {
        name: 'Crystallized Anger',
        chance: 'rare',
      },
      {
        name: "Spellweaver's Robe",
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Lord Azaram',
    slug: 'Lord-Azaram',
    imageUrl: 'https://static.tibia.com/images/library/creatures/lordazaram.gif',
    boss: true,
    shortDescription:
      "Jeden z bossow Grave Danger, oparty na fazie z Azaram's Soul i wymuszajacy dobre prowadzenie duszy przez fioletowy ogien.",
    accessQuest: 'Jeden z bossow Grave Danger Quest.',
    location: 'Ghostlands.',
    soloLevel: '900+',
    groupLevel: '450+',
    attackStyle: [
      'uderzenia wrecz',
      'earth beam',
      'male i duze poison wave',
      "faza z Azaram's Soul",
    ],
    resistances: {
      physical: 0,
      earth: -100,
      fire: 25,
      ice: 0,
      energy: -30,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Silver Token',
        chance: 'common',
      },
      {
        name: 'Ultimate Spirit Potion',
        chance: 'common',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Ancient Liche Bone',
        chance: 'uncommon',
      },
      {
        name: 'Rotten Heart',
        chance: 'uncommon',
      },
      {
        name: 'Final Judgement',
        chance: 'rare',
      },
      {
        name: 'Noble Cape',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Lord Retro',
    slug: 'Lord-Retro',
    imageUrl: 'https://static.tibia.com/images/library/creatures/lordretro.gif',
    boss: true,
    shortDescription:
      'Rocznicowy final 25 Years of Tibia Quest, bardziej mechaniczny niz lootowy, z praktycznie pelna niewrazliwoscia na standardowe obrazenia.',
    accessQuest: 'Finalny boss 25 Years of Tibia Quest.',
    location: 'Time Travel Dungeon.',
    soloLevel: '400+',
    groupLevel: '250+',
    resistances: {
      physical: -100,
      earth: -100,
      fire: -100,
      ice: -100,
      energy: -100,
      holy: -100,
      death: -100,
    },
  },
  {
    name: 'Magma Bubble',
    slug: 'Magma-Bubble',
    imageUrl: 'https://static.tibia.com/images/library/creatures/magmacolossus.gif',
    boss: true,
    shortDescription:
      'Finalny boss Primal Ordeal stojacy w miejscu i zasypujacy arene projektylami fire oraz efektami obszarowymi.',
    accessQuest: 'Finalny boss Primal Ordeal Quest.',
    location: 'Sparkling Pools.',
    soloLevel: '1000+',
    groupLevel: '600+',
    attackStyle: [
      'stacjonarna walka',
      'fire balle',
      'obszarowe eksplozje',
      'duza presja dystansowa',
    ],
    resistances: {
      physical: 0,
      earth: -100,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Health Potion',
        chance: 'common',
      },
      {
        name: 'Alicorn Headguard',
        chance: 'rare',
      },
      {
        name: 'Alicorn Quiver',
        chance: 'rare',
      },
      {
        name: 'Arboreal Crown',
        chance: 'rare',
      },
      {
        name: 'Spiritthorn Armor',
        chance: 'very rare',
      },
      {
        name: 'Spiritthorn Helmet',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Maior Domus',
    slug: 'Maior-Domus',
    imageUrl: 'https://static.tibia.com/images/library/creatures/maiordomus.gif',
    boss: true,
    shortDescription:
      'Pierwsza forma Maior Domus z finalnej walki Make Believe Quest, dostepna tez w Boss Difficulty System.',
    accessQuest: 'Pojawia sie podczas Make Believe Quest i w Boss Difficulty System.',
    soloLevel: '1200+',
    groupLevel: '700+',
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Figurine of Maior Domus',
        chance: 'rare',
      },
      {
        name: 'Moonsilver Strike Helm',
        chance: 'very rare',
      },
      {
        name: 'Moonsilver Trail Hood',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Mazoran',
    slug: 'Mazoran',
    imageUrl: 'https://static.tibia.com/images/library/creatures/mazoran.gif',
    boss: true,
    shortDescription:
      "Demoniczny boss z Ferumbras' Ascension, ktory sam w sobie jest prosty, ale arena regularnie zamienia sie w lawe. Najwieksze zagrozenie to obrazenia fire z podlogi i dodatkowe przywolania podczas kolejnych fal.",
    accessQuest: "Wymagany dostep do Ferumbras' Ascension Quest i wejscie do Grounds of Fire.",
    location: "Grounds of Fire, obszar Ferumbras' Ascension Quest.",
    soloLevel: '600+',
    groupLevel: '300+',
    attackStyle: [
      'mocne uderzenia fizyczne',
      'zalewanie areny lawa',
      'obrazenia fire z podlogi',
      'przywolania Rage of Mazoran',
    ],
    resistances: {
      physical: 0,
      earth: -75,
      fire: -100,
      ice: 0,
      energy: -75,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Silver Token',
        chance: 'very common',
      },
      {
        name: 'Gold Coin',
        chance: 'common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Maimer',
        chance: 'uncommon',
      },
      {
        name: 'Wand of Everblazing',
        chance: 'semi-rare',
      },
      {
        name: 'Impaler of the Igniter',
        chance: 'rare',
      },
      {
        name: 'Tempest Shield',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Mazzinor',
    slug: 'Mazzinor',
    imageUrl: 'https://static.tibia.com/images/library/creatures/mazzinor.gif',
    boss: true,
    shortDescription:
      'Biblioteczny demon energy, ktory co pewien czas przechodzi w faze niesmiertelnosci i przygotowuje zabojcze eksplozje na cala komnate. Kluczowe jest tworzenie vortexow z Wild Knowledge i wejscie w nie we wlasciwym momencie.',
    accessQuest:
      'Walka w ramach The Secret Library Quest; druzyna musi dotrzec do Earth Section i aktywowac Ostentatious Bookstand.',
    location: 'The Secret Library, sekcja Earth Section.',
    soloLevel: '950+',
    groupLevel: '500+',
    attackStyle: [
      'obrazenia energy z beamow i chainow',
      'faza niesmiertelnosci',
      'pelnopokojowe eksplozje energy',
      'przywolania Wild Knowledge',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: -100,
      ice: 0,
      energy: -75,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Platinum Coin',
        chance: 'very common',
      },
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Silver Token',
        chance: 'common',
      },
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Knowledgeable Book',
        chance: 'uncommon',
      },
      {
        name: 'Lightning Robe',
        chance: 'uncommon',
      },
      {
        name: 'Frozen Lightning',
        chance: 'rare',
      },
      {
        name: 'Energized Demonbone',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Megasylvan Yselda',
    slug: 'Megasylvan-Yselda',
    imageUrl: 'https://static.tibia.com/images/library/creatures/yselda.gif',
    boss: true,
    shortDescription:
      'Stacjonarny boss z Adventures of Galthen Quest, ktorego trzeba najpierw oslabic wypowiadajac konkretne slowa. Do pelnego zaliczenia walki warto dodatkowo utrzymac przy zyciu cztery Megasylvan Saplings w rogach sali.',
    accessQuest:
      'Wymagany postep w Adventures of Galthen Quest; do pelnego zaliczenia walki trzeba tez uleczyc cztery Megasylvan Saplings.',
    location: 'Forest of Life, przez Sleeping Carnisylvan.',
    soloLevel: '250+',
    groupLevel: '180+',
    attackStyle: [
      'uderzenia fizyczne',
      'przywolania Carnisylvan Sapling',
      'mechanika aktywacji haslem',
      'presja na leczenie sadzonek',
    ],
    resistances: {
      physical: -75,
      earth: -75,
      fire: -75,
      ice: -75,
      energy: -75,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Mastermind Potion',
        chance: 'common',
      },
      {
        name: 'Terra Mantle',
        chance: 'uncommon',
      },
      {
        name: 'Old Royal Diary',
        chance: 'uncommon',
      },
      {
        name: 'Megasylvan Sapling',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Melting Frozen Horror',
    slug: 'Melting-Frozen-Horror',
    imageUrl: 'https://static.tibia.com/images/library/creatures/frozenhorror.gif',
    boss: true,
    shortDescription:
      'Lodowy boss z Forgotten Knowledge, ktory leczy sie od obrazen ice i wymusza gre wokol Dragon Egg. Druzyna musi utrzymac bossa z dala od jajka i kontrolowac przywolane Frozen Miniony, bo ich ataki rowniez go wzmacniaja.',
    accessQuest:
      'Boss z Forgotten Knowledge Quest; trzeba wejsc do komnaty w Formorgar Mines i obsluzyc mechanike z Dragon Egg.',
    location: 'Formorgar Mines.',
    soloLevel: '500+',
    groupLevel: '180+',
    attackStyle: [
      'mocne uderzenia fizyczne',
      'leczenie od obrazen ice',
      'presja wokol Dragon Egg',
      'wsparcie Frozen Minionow',
    ],
    resistances: {
      physical: -75,
      earth: 0,
      fire: 25,
      ice: -100,
      energy: 25,
      holy: 0,
      death: 25,
    },
    loot: [
      {
        name: 'Frosty Heart',
        chance: 'very common',
      },
      {
        name: 'Spark Sphere',
        chance: 'very common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Crystalline Arrow',
        chance: 'common',
      },
      {
        name: 'Runic Ice Shield',
        chance: 'uncommon',
      },
      {
        name: 'Ornate Crossbow',
        chance: 'rare',
      },
      {
        name: 'Glowing Carrot',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Mimar Haffar',
    slug: 'Mimar-Haffar',
    imageUrl: 'https://static.tibia.com/images/library/creatures/mimarhaffar.gif',
    boss: true,
    shortDescription:
      'Pierwsza forma Mimar Haffar z Make Believe Quest i zarazem walka podpieta pod Boss Difficulty System. Strona wiki jest uboga, ale sam encounter nalezy traktowac jako nowoczesnego questa-bossa z rosnaca presja zalezne od wybranego poziomu trudnosci.',
    accessQuest:
      'Walka podczas Make Believe Quest w Moonstone Crater; dostep i nagrody zaleza od ustawien Boss Difficulty System.',
    location: 'Moonstone Crater.',
    soloLevel: '900+',
    groupLevel: '500+',
    attackStyle: [
      'presja pierwszej fazy',
      'atak bossa questowego',
      'mechaniki zalezne od poziomu trudnosci',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Dirty Turban',
        chance: 'common',
      },
      {
        name: 'Moonsilver Battle Visor',
        chance: 'uncommon',
      },
      {
        name: 'Moonsilver Spirit Mask',
        chance: 'uncommon',
      },
      {
        name: 'Figurine of Mimar Haffar',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Mitmah Vanguard',
    slug: 'Mitmah-Vanguard',
    imageUrl: 'https://static.tibia.com/images/library/creatures/mitmahvanguard.gif',
    boss: true,
    shortDescription:
      'Bardzo niebezpieczny boss Iksupan, ktory teleportuje sie, rootuje cala druzyne i karze stanie blisko poteznym energy UE. Walka wymaga dystansu, bo potrafi tez przebijac magic wall i wild growth.',
    accessQuest:
      'Dostep przez Iksupan Occupied Sanctuary; pierwsze zabicie daje Museum Goer i drugi addon Ancient Aucar Outfits.',
    location: 'Iksupan Occupied Sanctuary.',
    soloLevel: '650+',
    groupLevel: '350+',
    attackStyle: [
      'ciosy w zwarciu',
      'energy UE i energy beam',
      'pelnoekranowy root',
      'fire wave oraz death ring',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: -75,
      ice: -75,
      energy: 0,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: 'Crystal of the Mitmah',
        chance: 'common',
      },
      {
        name: 'Iks Footwraps',
        chance: 'uncommon',
      },
      {
        name: 'Stoic Iks Boots',
        chance: 'uncommon',
      },
      {
        name: 'Stoic Iks Casque',
        chance: 'uncommon',
      },
      {
        name: 'Stoic Iks Chestplate',
        chance: 'uncommon',
      },
      {
        name: 'Stoic Iks Robe',
        chance: 'uncommon',
      },
    ],
  },
  {
    name: 'Murcion',
    slug: 'Murcion',
    imageUrl: 'https://static.tibia.com/images/library/creatures/murcion.gif',
    boss: true,
    shortDescription:
      'Jeden z trudniejszych bossow Rotten Blood Quest, zostawiajacy mould zadajacy procentowe obrazenia i leczacy go, gdy sam na nim stoi. Dodatkowa presje robia wybuchajace Mushrooms oraz Elder Bloodjawy, przez co walka wymaga bardzo zdyscyplinowanego ruchu po malej sali.',
    accessQuest: 'Jeden z bossow Rotten Blood Quest, dostepny po wejsciu do Jaded Roots.',
    location: 'Jaded Roots.',
    soloLevel: '1000+',
    groupLevel: '600+',
    attackStyle: [
      'obrazenia death i agony',
      'mould z procentowymi obrazeniami',
      'wybuchajace Mushrooms z life drain',
      'przywolania Elder Bloodjaw',
    ],
    resistances: {
      physical: 0,
      earth: -75,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Spirit Potion',
        chance: 'common',
      },
      {
        name: 'The Essence of Murcion',
        chance: 'uncommon',
      },
      {
        name: 'Putrefactive Figurine',
        chance: 'uncommon',
      },
      {
        name: 'Spiritual Horseshoe',
        chance: 'rare',
      },
      {
        name: 'Bag You Covet',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Neferi The Spy',
    slug: 'Neferi-The-Spy',
    imageUrl: 'https://static.tibia.com/images/library/creatures/neferithespy.gif',
    boss: true,
    shortDescription:
      'Miniboss z Kilmaresh, stawiajacy glownie na zwarcie, death damage i pojedyncze przywolanie Skeleton Elite Warrior. To raczej szybka walka, ale warto uwazac na nagle skoki obrazen oraz slabosc na ice.',
    accessQuest:
      'Miniboss Wanted mission z Kilmaresh Quest; wejscie przez teleport przy lodzi w Issavi.',
    location: 'Teleport przy lodzi w Issavi prowadzi do komnaty bossa.',
    soloLevel: '300+',
    groupLevel: '180+',
    attackStyle: [
      'mocne uderzenia fizyczne',
      'obrazenia death',
      'przywolania Skeleton Elite Warrior',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 25,
      energy: 0,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Ultimate Health Potion',
        chance: 'common',
      },
      {
        name: 'Great Spirit Potion',
        chance: 'common',
      },
      {
        name: 'Eye-Embroidered Veil',
        chance: 'uncommon',
      },
      {
        name: 'Tagralt-Inlaid Scabbard',
        chance: 'uncommon',
      },
      {
        name: 'Stealth Ring',
        chance: 'uncommon',
      },
      {
        name: 'Golden Mask',
        chance: 'uncommon',
      },
      {
        name: 'Sea Horse Figurine',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Outburst',
    slug: 'Outburst',
    imageUrl: 'https://static.tibia.com/images/library/creatures/outburst.gif',
    boss: true,
    shortDescription:
      'Elektro-elementalny boss z Otherworld, ktory po przyjeciu obrazen kilkukrotnie przechodzi w forme Charging Outburst. Sama walka jest prostsza od bardziej technicznych encounterow, ale transformacje i obrazenia energy nadal potrafia zabolec slabsze postacie.',
    accessQuest:
      'Boss Heart of Destruction Quest w Otherworld; wymaga odblokowania odpowiedniej komnaty bossa.',
    location: 'Otherworld.',
    soloLevel: '500+',
    groupLevel: '250+',
    attackStyle: [
      'ciosy w zwarciu',
      'fazy Charging Outburst',
      'obrazenia energy',
      'presja pojedynczego celu',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 25,
      ice: 0,
      energy: 25,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: 'Gold Token',
        chance: 'very common',
      },
      {
        name: 'Gold Coin',
        chance: 'common',
      },
      {
        name: 'Great Mana Potion',
        chance: 'common',
      },
      {
        name: 'Instable Proto Matter',
        chance: 'uncommon',
      },
      {
        name: 'Energy Ball',
        chance: 'uncommon',
      },
      {
        name: 'Void Boots',
        chance: 'rare',
      },
      {
        name: 'Tiara of Power',
        chance: 'rare',
      },
      {
        name: 'Lightning Robe',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Plagirath',
    slug: 'Plagirath',
    imageUrl: 'https://static.tibia.com/images/library/creatures/plagirath.gif',
    boss: true,
    shortDescription:
      "Plagowy demon z Ferumbras' Ascension, ktory zasypuje sale Oozami, paraliza i mocnym poison damage. Dodatkowo czasami przemienia cel w Bog Raider, a po zakonczeniu efektu nastepuje bolesna eksplozja wokol gracza.",
    accessQuest: "Wymagany dostep do Ferumbras' Ascension Quest i wejscie do Grounds of Plague.",
    location: "Grounds of Plague, obszar Ferumbras' Ascension Quest.",
    soloLevel: '750+',
    groupLevel: '350+',
    attackStyle: [
      'mocne uderzenia fizyczne',
      'poison UE, beam i wave',
      'death explosion',
      'transformacja celu w Bog Raider',
    ],
    resistances: {
      physical: 0,
      earth: -100,
      fire: 25,
      ice: -75,
      energy: 25,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Silver Token',
        chance: 'very common',
      },
      {
        name: 'Gold Coin',
        chance: 'common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Great Mana Potion',
        chance: 'common',
      },
      {
        name: 'Plague Bite',
        chance: 'uncommon',
      },
      {
        name: 'Terra Legs',
        chance: 'uncommon',
      },
      {
        name: 'Muck Rod',
        chance: 'uncommon',
      },
      {
        name: 'Traditional Sai',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Ragiaz',
    slug: 'Ragiaz',
    imageUrl: 'https://static.tibia.com/images/library/creatures/ragiaz.gif',
    boss: true,
    shortDescription:
      'Nieumarlo-demoniczny boss z Grounds of Undeath, ktory miesza mocne ciosy fizyczne z earth damage i leczeniem. Najwazniejsza mechanika to szybkie zbicie Bone Capsule, bo w tej formie odzyskuje sporo zycia.',
    accessQuest: "Wymagany dostep do Ferumbras' Ascension Quest i wejscie do Grounds of Undeath.",
    location: "Grounds of Undeath, obszar Ferumbras' Ascension Quest.",
    soloLevel: '650+',
    groupLevel: '320+',
    attackStyle: [
      'mocne uderzenia fizyczne',
      'obrazenia earth',
      'samoleczenie przez Bone Capsule',
      'przywolania Death Dragon',
    ],
    resistances: {
      physical: 0,
      earth: -75,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: 'Silver Token',
        chance: 'very common',
      },
      {
        name: 'Gold Coin',
        chance: 'common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Great Spirit Potion',
        chance: 'common',
      },
      {
        name: 'Death Gaze',
        chance: 'uncommon',
      },
      {
        name: 'Death Ring',
        chance: 'uncommon',
      },
      {
        name: "Reaper's Axe",
        chance: 'rare',
      },
      {
        name: 'Skull Staff',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Ratmiral Blackwhiskers',
    slug: 'Ratmiral-Blackwhiskers',
    imageUrl: 'https://static.tibia.com/images/library/creatures/ratmiral.gif',
    boss: true,
    shortDescription:
      "Finalny boss A Pirate's Tail Quest, walczacy w zwarciu, ale wspierany przez cala piracko-szczurza zaloge. Sama postac Ratmirala nie jest najgorsza, lecz dodatkowe Piraty i minibossowie szybko podnosza presje na druzyne.",
    accessQuest: "Finalny boss A Pirate's Tail Quest, walka w The Wreckoning.",
    location: 'The Wreckoning.',
    soloLevel: '400+',
    groupLevel: '220+',
    attackStyle: [
      'ciosy w zwarciu',
      'presja life drain od zalogi',
      'przywolania Elite Piratow i minibossow',
      'walka single-target z dodatkiem AoE',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Pirate Coin',
        chance: 'common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: "Ratmiral's Hat",
        chance: 'semi-rare',
      },
      {
        name: 'Golden Cheese Wedge',
        chance: 'semi-rare',
      },
      {
        name: 'Cheesy Membership Card',
        chance: 'rare',
      },
      {
        name: 'Small Treasure Chest',
        chance: 'rare',
      },
      {
        name: 'Make-Do Boots',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Ravenous Hunger',
    slug: 'Ravenous-Hunger',
    imageUrl: 'https://static.tibia.com/images/library/creatures/ravenoushunger.gif',
    boss: true,
    shortDescription:
      'Popularny daily boss z Cults of Tibia, glownie przez szanse na Elven Mail. Walczy w zwarciu, przywoluje Mutated Bats i leczy sie life drain wave, dlatego magowie powinni trzymac bezpieczny dystans.',
    accessQuest:
      "Boss z Cults of Tibia Quest, odblokowywany po dostepie do kryjowki pod jaskinia trolli w Ab'Dendriel.",
    location: "Pod trollowa jaskinia w Ab'Dendriel.",
    soloLevel: '450+',
    groupLevel: '250+',
    attackStyle: [
      'ciosy w zwarciu',
      'fala life drain',
      'przywolania Mutated Bat',
      'kontrola pola Fire Bomb Rune',
    ],
    resistances: {
      physical: 0,
      earth: -100,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: -100,
    },
    loot: [
      {
        name: 'Mysterious Remains',
        chance: 'very common',
      },
      {
        name: 'Gold Coin',
        chance: 'common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Sacred Tree Amulet',
        chance: 'uncommon',
      },
      {
        name: 'Terra Boots',
        chance: 'uncommon',
      },
      {
        name: 'Cobra Crown',
        chance: 'rare',
      },
      {
        name: 'Elven Mail',
        chance: 'rare',
      },
      {
        name: 'Enchanted Merudri Brooch',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Razzagorn',
    slug: 'Razzagorn',
    imageUrl: 'https://static.tibia.com/images/library/creatures/razzargorn.gif',
    boss: true,
    shortDescription:
      "Destrukcyjny demon z Ferumbras' Ascension, mieszajacy fire, energy i death damage z przywolaniami Eruption of Destruction. Gdy addy zostana zignorowane, boss staje sie wyraznie grozniejszy i walka szybko sie destabilizuje.",
    accessQuest:
      "Wymagany dostep do Ferumbras' Ascension Quest i wejscie do Grounds of Destruction.",
    location: "Grounds of Destruction, obszar Ferumbras' Ascension Quest.",
    soloLevel: '700+',
    groupLevel: '350+',
    attackStyle: [
      'uderzenia fizyczne',
      'death beam',
      'fire wave i eksplozje',
      'przywolania Eruption of Destruction',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: -75,
      ice: 0,
      energy: 0,
      holy: -75,
      death: 0,
    },
    loot: [
      {
        name: 'Silver Token',
        chance: 'very common',
      },
      {
        name: 'Gold Coin',
        chance: 'common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Great Shield',
        chance: 'uncommon',
      },
      {
        name: 'Maimer',
        chance: 'uncommon',
      },
      {
        name: 'Visage of the End Days',
        chance: 'rare',
      },
      {
        name: 'Rift Crossbow',
        chance: 'rare',
      },
      {
        name: 'Orichalcum Pearl',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Realityquake',
    slug: 'Realityquake',
    imageUrl: 'https://static.tibia.com/images/library/creatures/realityquake.gif',
    boss: true,
    shortDescription:
      'Boss z Heart of Destruction pojawiajacy sie dopiero po pokonaniu Foreshock i Aftershock. Sama strona wiki podaje malo detali, ale encounter pelni role finalnego stat-checku tej sekwencji w Otherworld.',
    accessQuest:
      'Boss Heart of Destruction Quest; pojawia sie po pokonaniu Foreshock i Aftershock.',
    location: 'Otherworld.',
    soloLevel: '450+',
    groupLevel: '250+',
    attackStyle: ['ciosy fizyczne', 'presja energy', 'finalna faza po Foreshock i Aftershock'],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Gold Token',
        chance: 'very common',
      },
      {
        name: 'Gold Coin',
        chance: 'common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Crystallized Anger',
        chance: 'uncommon',
      },
      {
        name: 'Energy Vein',
        chance: 'uncommon',
      },
      {
        name: 'Void Boots',
        chance: 'rare',
      },
      {
        name: 'Tiara of Power',
        chance: 'rare',
      },
      {
        name: 'Golden Legs',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Rupture',
    slug: 'Rupture',
    imageUrl: 'https://static.tibia.com/images/library/creatures/rupture.gif',
    boss: true,
    shortDescription:
      'Boss z Otherworld, ktorego nie wolno bezmyslnie bic przez cala walke. Po pojawieniu sie Damage Resonance trzeba natychmiast przerzucic obrazenia na przywolanie, bo kazdy hit w Rupture leczy go o tysiace punktow zycia.',
    accessQuest:
      'Boss Heart of Destruction Quest w Otherworld; po odblokowaniu odpowiedniej areny.',
    location: 'Otherworld.',
    soloLevel: '650+',
    groupLevel: '320+',
    attackStyle: [
      'uderzenia fizyczne',
      'great drown beam',
      'great energy wave',
      'przywolania Damage Resonance',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Gold Token',
        chance: 'very common',
      },
      {
        name: 'Mysterious Remains',
        chance: 'very common',
      },
      {
        name: 'Gold Coin',
        chance: 'common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Odd Organ',
        chance: 'uncommon',
      },
      {
        name: 'Plasma Pearls',
        chance: 'uncommon',
      },
      {
        name: 'Shadow Sceptre',
        chance: 'rare',
      },
      {
        name: 'Ruthless Axe',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Scarlett Etzel',
    slug: 'Scarlett-Etzel',
    imageUrl: 'https://static.tibia.com/images/library/creatures/scarlettetzelstill.gif',
    boss: true,
    shortDescription:
      "Boss z Cobra Bastion z mechanika luster i Galthen's Chestplate. Najwieksze ryzyko daje leczenie przy zlym oknie podatnosci oraz potezny wybuch earth podczas poprawnego trafienia.",
    accessQuest:
      'Wymagany dostep do Cobra Bastion i mozliwosc wejscia do sali Scarlet w ramach tego obszaru.',
    location: 'Cobra Bastion.',
    soloLevel: '500+',
    groupLevel: '300+',
    attackStyle: [
      'uderzenia wrecz',
      'holy beam',
      'death strike',
      'wybuch earth przy mechanice luster',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'very common',
      },
      {
        name: 'supreme health potion',
        chance: 'common',
      },
      {
        name: 'ultimate mana potion',
        chance: 'common',
      },
      {
        name: 'silver token',
        chance: 'common',
      },
      {
        name: 'cobra axe',
        chance: 'rare',
      },
      {
        name: 'cobra crossbow',
        chance: 'rare',
      },
      {
        name: 'the cobra amulet',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Shadowpelt',
    slug: 'Shadowpelt',
    imageUrl: 'https://static.tibia.com/images/library/creatures/blackpelt.gif',
    boss: true,
    shortDescription:
      'Lider werebearow z Grimvale, walczacy glownie w zwarciu i wspierajacy sie leczeniem oraz summonem. Sama walka jest prosta, ale przedluzanie jej daje bossowi czas na odnowienie zycia.',
    accessQuest: 'Czesc Grimvale Quest, etap The Curse Spreads.',
    location: 'Cormaya, po przejsciu przez Earth Portal w jaskini werebestii.',
    soloLevel: '120+',
    groupLevel: '80+',
    attackStyle: ['uderzenia wrecz', 'samoleczenie', 'przywolanie werebeara'],
    resistances: {
      physical: 0,
      earth: -30,
      fire: 25,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'gold coin',
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'werebear fur',
        chance: 'common',
      },
      {
        name: 'werebear skull',
        chance: 'common',
      },
      {
        name: 'ultimate health potion',
        chance: 'uncommon',
      },
      {
        name: 'moonlight crystals',
        chance: 'semi-rare',
      },
      {
        name: 'silver token',
        chance: 'semi-rare',
      },
      {
        name: 'werebear trophy',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Sharpclaw',
    slug: 'Sharpclaw',
    imageUrl: 'https://static.tibia.com/images/library/creatures/sharpclaw.gif',
    boss: true,
    shortDescription:
      'Przywodca werebadgerow z Grimvale, nastawiony na zwarcie i irytujace wsparcie kontrola many. Dodatkowe zagrozenie tworza invis, oslabienie magii i przywolany werebadger.',
    accessQuest: 'Czesc Grimvale Quest, etap The Curse Spreads.',
    location: 'Edron, po teleporcie w jaskini werebestii.',
    soloLevel: '110+',
    groupLevel: '70+',
    attackStyle: ['uderzenia wrecz', 'mana drain', 'niewidzialnosc', 'przywolanie werebadgera'],
    resistances: {
      physical: 0,
      earth: -30,
      fire: 25,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'gold coin',
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'werebadger claws',
        chance: 'common',
      },
      {
        name: 'werebadger skull',
        chance: 'common',
      },
      {
        name: 'great mana potion',
        chance: 'common',
      },
      {
        name: 'moonlight crystals',
        chance: 'uncommon',
      },
      {
        name: 'silver token',
        chance: 'uncommon',
      },
      {
        name: 'wolf backpack',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Shulgrax',
    slug: 'Shulgrax',
    imageUrl: 'https://static.tibia.com/images/library/creatures/shulgrax.gif',
    boss: true,
    shortDescription:
      "Ciezki demoniczny boss z Ferumbras' Ascension, ktory laczy wysokie melee z fire i smiercionosnym sustainem. Bloker traci na nim sporo skutecznosci przez czeste obnizanie skilli melee.",
    accessQuest: "Wymagany dostep do Ferumbras' Ascension Quest i Dark Torturer Seal.",
    location: "Grounds of Damnation, obszar questa Ferumbras' Ascension.",
    soloLevel: '600+',
    groupLevel: '350+',
    attackStyle: ['mocne uderzenia wrecz', 'fire wave', 'fire beam', 'leczenie'],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 25,
      ice: 0,
      energy: 25,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'silver token',
        chance: 'very common',
      },
      {
        name: 'gold coin',
        chance: 'common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'great mana potion',
        chance: 'common',
      },
      {
        name: 'great spirit potion',
        chance: 'common',
      },
      {
        name: 'underworld rod',
        chance: 'uncommon',
      },
      {
        name: 'pair of iron fists',
        chance: 'rare',
      },
      {
        name: 'treader of torment',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Sir Baeloc',
    slug: 'Sir-Baeloc',
    imageUrl: 'https://static.tibia.com/images/library/creatures/sirbaeloc.gif',
    boss: true,
    shortDescription:
      'Undead boss z Grave Danger, ktory sam w sobie nie jest najgorszy, ale wymusza rownoczesne ubicie z Sir Nictrosem. Dodatkowy problem tworza summony i leczenie od death damage.',
    accessQuest: 'Wymagany postep w Grave Danger Quest i wejscie na cmentarz Darashii.',
    location: 'Cmentarz w Darashii.',
    soloLevel: '900+',
    groupLevel: '450+',
    attackStyle: [
      'hex',
      'przywolania',
      'presja w zwarciu',
      'mechanika wspolnego killu z Sir Nictrosem',
    ],
    resistances: {
      physical: 0,
      earth: -30,
      fire: 25,
      ice: -30,
      energy: 0,
      holy: 25,
      death: -100,
    },
    loot: [
      {
        name: 'silver token',
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'ultimate spirit potion',
        chance: 'common',
      },
      {
        name: 'supreme health potion',
        chance: 'common',
      },
      {
        name: 'ultimate mana potion',
        chance: 'common',
      },
      {
        name: 'ancient liche bone',
        chance: 'uncommon',
      },
      {
        name: 'rotten heart',
        chance: 'rare',
      },
      {
        name: 'final judgement',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Sir Nictros',
    slug: 'Sir-Nictros',
    imageUrl: 'https://static.tibia.com/images/library/creatures/sirnictros.gif',
    boss: true,
    shortDescription:
      'Brat Sir Baeloca i druga polowa pary z Grave Danger. Kluczowe jest ubijanie obu bossow naraz, bo inaczej beda sie wzajemnie leczyc, a death damage dodatkowo bardzo mu pomaga.',
    accessQuest: 'Wymagany postep w Grave Danger Quest i wejscie na cmentarz Darashii.',
    location: 'Cmentarz w Darashii.',
    soloLevel: '900+',
    groupLevel: '450+',
    attackStyle: [
      'hex',
      'przywolania',
      'presja w zwarciu',
      'mechanika wspolnego killu z Sir Baelokiem',
    ],
    resistances: {
      physical: 0,
      earth: -75,
      fire: 25,
      ice: -30,
      energy: 0,
      holy: 25,
      death: -100,
    },
    loot: [
      {
        name: 'death oyoroi',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Sister Hetai',
    slug: 'Sister-Hetai',
    imageUrl: 'https://static.tibia.com/images/library/creatures/sisterhetai.gif',
    boss: true,
    shortDescription:
      'Miniboss kultystow Fafnara z Kilmaresh, oparty glownie na mocnym melee i presji w zwarciu. Nie ma rozbudowanej mechaniki, ale jej wytrzymalosc i szybki kontakt karza slabo przygotowane postacie.',
    accessQuest:
      'Miniboss misji Wanted w Kilmaresh Quest, dostepny przez teleport w Kilmaresh Catacombs.',
    location: 'Kilmaresh Catacombs, za teleportem w katakumbach.',
    soloLevel: '250+',
    groupLevel: '180+',
    attackStyle: ['uderzenia wrecz', 'presja w zwarciu'],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 50,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'crystal coin',
        chance: 'common',
      },
      {
        name: 'gold ingot',
        chance: 'uncommon',
      },
      {
        name: 'lightning legs',
        chance: 'uncommon',
      },
      {
        name: 'focus cape',
        chance: 'uncommon',
      },
      {
        name: 'terra hood',
        chance: 'uncommon',
      },
      {
        name: 'eye-embroidered veil',
        chance: 'rare',
      },
      {
        name: 'sea horse figurine',
        chance: 'rare',
      },
      {
        name: 'Tagralt-Inlaid Scabbard',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Soul Of Dragonking Zyrtarch',
    slug: 'Soul-Of-Dragonking-Zyrtarch',
    imageUrl: 'https://static.tibia.com/images/library/creatures/dragonkingzyrtrachkillable.gif',
    boss: true,
    shortDescription:
      'Smiertelna forma Dragonking Zyrtarcha z Forgotten Knowledge. Wiki ma skromny opis walki, ale boss wyraznie nalezy do drakenow i jest calkowicie odporny na fire.',
    accessQuest: 'Jeden z bossow Forgotten Knowledge Quest.',
    location: 'Zao, Temple Complex.',
    soloLevel: '600+',
    groupLevel: '300+',
    resistances: {
      physical: 0,
      earth: 0,
      fire: -100,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'gold coin',
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'ultimate health potion',
        chance: 'common',
      },
      {
        name: 'silver token',
        chance: 'uncommon',
      },
      {
        name: 'gold token',
        chance: 'rare',
      },
      {
        name: 'drachaku',
        chance: 'rare',
      },
      {
        name: 'dragon scale helmet',
        chance: 'very rare',
      },
      {
        name: "snake god's sceptre",
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Srezz Yellow Eyes',
    slug: 'Srezz-Yellow-Eyes',
    imageUrl: 'https://static.tibia.com/images/library/creatures/srezz.gif',
    boss: true,
    shortDescription:
      'Serpentowaty boss z Lion Sanctum, grozny glownie przez life drain i solidny earth burst. Nie ma skomplikowanej mechaniki, ale stale obrazenia wysysajace zycie szybko zuzywaja zasoby.',
    accessQuest: 'Czesc Grimvale Quest, etap An Ancient Feud.',
    location: 'Lion Sanctum.',
    soloLevel: '220+',
    groupLevel: '130+',
    attackStyle: ['uderzenia wrecz', 'life drain wave', 'life drain bomb', 'earth ball'],
    resistances: {
      physical: 0,
      earth: -30,
      fire: -30,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: "Srezz' Eye",
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'ultimate health potion',
        chance: 'common',
      },
      {
        name: 'snake skin',
        chance: 'common',
      },
      {
        name: 'mastermind potion',
        chance: 'uncommon',
      },
      {
        name: 'gemmed figurine',
        chance: 'uncommon',
      },
      {
        name: 'winged tail',
        chance: 'rare',
      },
      {
        name: 'glacier robe',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Tarbaz',
    slug: 'Tarbaz',
    imageUrl: 'https://static.tibia.com/images/library/creatures/tarbaz.gif',
    boss: true,
    shortDescription:
      'Demoniczny miniboss z Ferumbras’ Ascension nastawiony na obrażenia fire i death. Walka jest prosta mechanicznie, ale trzeba uważać na beam oraz niszczenie magic walli i wild growthów.',
    accessQuest: 'Wymaga dostępu do Ferumbras’ Ascension Quest i wejścia do Grounds of Despair.',
    location: 'Grounds of Despair, obszar questa Ferumbras’ Ascension Quest.',
    soloLevel: '500+',
    groupLevel: '300+',
    attackStyle: ['uderzenia wręcz', 'fala fire', 'beam fire', 'eksplozje death'],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Silver Token',
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'great mana potion',
        chance: 'common',
      },
      {
        name: 'ultimate health potion',
        chance: 'common',
      },
      {
        name: 'demonic essence',
        chance: 'uncommon',
      },
      {
        name: 'Underworld Rod',
        chance: 'uncommon',
      },
      {
        name: 'Maimer',
        chance: 'rare',
      },
      {
        name: 'Shroud of Despair',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Tentugly',
    slug: 'Tentugly',
    imageUrl: 'https://static.tibia.com/images/library/creatures/fakeseamonster.gif',
    boss: true,
    shortDescription:
      "Morski boss z A Pirate's Tail Quest, w praktyce walczony jako glowa Tentuglyego wspierana przez macki. Sam sie nie porusza, ale doklada energy i wymaga szybkiego focusu po pojawieniu sie.",
    accessQuest: "Jeden z bossow A Pirate's Tail Quest.",
    location: 'Lodz miedzy Rascacoon a The Wreckoning.',
    soloLevel: '350+',
    groupLevel: '220+',
    attackStyle: [
      'uderzenia wrecz',
      'thunderstorm',
      'energy wave',
      'walka wspierana przez tentacles',
    ],
    resistances: {
      physical: 0,
      earth: 50,
      fire: 25,
      ice: 0,
      energy: -30,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'pirate coin',
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'ultimate mana potion',
        chance: 'common',
      },
      {
        name: 'ultimate health potion',
        chance: 'common',
      },
      {
        name: "Tentugly's Eye",
        chance: 'uncommon',
      },
      {
        name: 'small treasure chest',
        chance: 'uncommon',
      },
      {
        name: "Tentugly's Jaws",
        chance: 'rare',
      },
      {
        name: 'Plushie of Tentugly',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Thaian',
    slug: 'Thaian',
    imageUrl: 'https://static.tibia.com/images/library/creatures/thaian.gif',
    boss: true,
    shortDescription:
      'Boss z Feaster of Souls o ekstremalnie wysokich redukcjach na wszystkie typy obrazen. Najwiekszym problemem jest dlugosc walki i koniecznosc utrzymania stalego dps mimo jego twardosci.',
    accessQuest: 'Czesc Feaster of Souls Quest.',
    location: 'Barren Drift.',
    soloLevel: '700+',
    groupLevel: '350+',
    attackStyle: ['uderzenia wrecz', 'bardzo wysoka wytrzymalosc'],
    resistances: {
      physical: -75,
      earth: -75,
      fire: -75,
      ice: -75,
      energy: -75,
      holy: -75,
      death: -75,
    },
    loot: [
      {
        name: 'green gem',
        chance: 'common',
      },
      {
        name: 'yellow gem',
        chance: 'common',
      },
      {
        name: 'blue gem',
        chance: 'uncommon',
      },
      {
        name: 'phantasmal hair',
        chance: 'uncommon',
      },
      {
        name: 'death toll',
        chance: 'rare',
      },
      {
        name: 'eye of the chasm',
        chance: 'rare',
      },
      {
        name: 'luminescent crystal pickaxe',
        chance: 'rare',
      },
      {
        name: 'pair of old bracers',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The Blazing Rose',
    slug: 'The-Blazing-Rose',
    imageUrl: 'https://static.tibia.com/images/library/creatures/blazingrose.gif',
    boss: true,
    shortDescription:
      'Asuri boss z The Secret Library Quest, opisany na wiki bardzo skromnie. Najpewniejsza informacja to calkowita odpornosc na fire i osadzenie walki w Asura Palace.',
    accessQuest: 'Czesc The Secret Library Quest.',
    location: 'Asura Palace.',
    soloLevel: '300+',
    groupLevel: '180+',
    resistances: {
      physical: 0,
      earth: 0,
      fire: -100,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'great spirit potion',
        chance: 'common',
      },
      {
        name: 'demonic essence',
        chance: 'common',
      },
      {
        name: 'golden lotus brooch',
        chance: 'uncommon',
      },
      {
        name: 'moonlight rod',
        chance: 'uncommon',
      },
      {
        name: 'ultimate health potion',
        chance: 'common',
      },
      {
        name: 'oriental shoes',
        chance: 'uncommon',
      },
    ],
  },
  {
    name: 'The Brainstealer',
    slug: 'The-Brainstealer',
    imageUrl: 'https://static.tibia.com/images/library/creatures/brainstealer.gif',
    boss: true,
    shortDescription:
      'Finalny boss Too Hot to Handle Quest, oparty o mocne life drainy i mechanike Madness. Walka wymaga dobrej pozycji, bo beam boli bardzo mocno, a Mental Nexus robi fazy niewrazliwosci.',
    accessQuest: 'Finalny boss Too Hot to Handle Quest.',
    location: 'Dwelling of the Forgotten.',
    soloLevel: '1000+',
    groupLevel: '500+',
    attackStyle: [
      'uderzenia wrecz',
      'life drain beam',
      'death ring',
      'fazy niewrazliwosci z Mental Nexus',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: -100,
    },
    loot: [
      {
        name: "Brainstealer's Tissue",
        chance: 'common',
      },
      {
        name: 'eldritch crystal',
        chance: 'uncommon',
      },
      {
        name: "Brainstealer's Brain",
        chance: 'rare',
      },
      {
        name: "Brainstealer's Brainwave",
        chance: 'rare',
      },
      {
        name: 'eldritch bow',
        chance: 'rare',
      },
      {
        name: 'eldritch hood',
        chance: 'rare',
      },
      {
        name: 'gilded eldritch wand',
        chance: 'very rare',
      },
      {
        name: 'eldritch monk boots',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The Diamond Blossom',
    slug: 'The-Diamond-Blossom',
    imageUrl: 'https://static.tibia.com/images/library/creatures/diamondblossom.gif',
    boss: true,
    shortDescription:
      'Asuri boss z The Secret Library Quest, o slabiej opisanej walce niz wiekszosc nowoczesnych bossow. Z pewnych danych wynika jedynie, ze lepiej znosi death niz pozostale zywioly i przebywa w Asura Palace.',
    accessQuest: 'Czesc The Secret Library Quest.',
    location: 'Asura Palace.',
    soloLevel: '300+',
    groupLevel: '180+',
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: -30,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'soul orb',
        chance: 'common',
      },
      {
        name: 'demonic essence',
        chance: 'common',
      },
      {
        name: 'great spirit potion',
        chance: 'common',
      },
      {
        name: 'golden lotus brooch',
        chance: 'uncommon',
      },
      {
        name: 'moonlight rod',
        chance: 'uncommon',
      },
      {
        name: 'ultimate health potion',
        chance: 'common',
      },
    ],
  },
  {
    name: 'The Dread Maiden',
    slug: 'The-Dread-Maiden',
    imageUrl: 'https://static.tibia.com/images/library/creatures/dreadmaiden.gif',
    boss: true,
    shortDescription:
      'Boss z Feaster of Souls, ktory trzeba oslabic przez prowadzenie kolorowych duchow do odpowiednich vorteksow. Zla obsluga tej mechaniki leczy bossa albo karze druzyne dodatkowymi obrazeniami.',
    accessQuest: 'Czesc Feaster of Souls Quest.',
    location: 'Zarganash.',
    soloLevel: '1000+',
    groupLevel: '500+',
    attackStyle: ['uderzenia wrecz', 'mechanika kolorowych duchow', 'oslabianie przez vorteksy'],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 25,
      ice: 0,
      energy: 0,
      holy: 0,
      death: -100,
    },
    loot: [
      {
        name: 'crystal coin',
        chance: 'common',
      },
      {
        name: 'supreme health potion',
        chance: 'common',
      },
      {
        name: 'ultimate spirit potion',
        chance: 'common',
      },
      {
        name: 'death toll',
        chance: 'uncommon',
      },
      {
        name: 'soulforged lantern',
        chance: 'rare',
      },
      {
        name: 'spooky hood',
        chance: 'rare',
      },
      {
        name: 'pair of nightmare boots',
        chance: 'rare',
      },
      {
        name: 'ghost claw',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The Enraged Thorn Knight',
    slug: 'The-Enraged-Thorn-Knight',
    imageUrl: 'https://static.tibia.com/images/library/creatures/thornknight.gif',
    boss: true,
    shortDescription:
      'Jedna z form Thorn Knighta w Forgotten Knowledge, wygladajaca jak Crystal Warlord. Najwazniejsza zasada walki to calkowite unikanie death damage, bo boss leczy wtedy wielokrotnosc otrzymanych obrazen.',
    accessQuest: 'Jeden z bossow Forgotten Knowledge Quest, dostepny przez Desecrated Glade.',
    location: 'Loch dostepny przez Desecrated Glade.',
    soloLevel: '400+',
    groupLevel: '250+',
    attackStyle: ['uderzenia wrecz', 'presja fizyczna', 'kara za death damage'],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: -100,
    },
    loot: [
      {
        name: 'gold coin',
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'great mana potion',
        chance: 'common',
      },
      {
        name: 'ultimate health potion',
        chance: 'common',
      },
      {
        name: 'silver token',
        chance: 'uncommon',
      },
      {
        name: 'gold token',
        chance: 'rare',
      },
      {
        name: 'thorn seed',
        chance: 'rare',
      },
      {
        name: 'ruthless axe',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The False God',
    slug: 'The-False-God',
    imageUrl: 'https://static.tibia.com/images/library/creatures/falsegod.gif',
    boss: true,
    shortDescription:
      'Mocny minotaurzy boss z Cults of Tibia, oparty glownie na melee i presji obszarowej. Najwazniejsza mechanika walki to ciagly ruch po sali i unikanie Sphere of Wrath.',
    accessQuest: 'Czesc Cults of Tibia Quest.',
    location: 'Kryjowka kultu minotaurow niedaleko Mintwallin.',
    soloLevel: '350+',
    groupLevel: '220+',
    attackStyle: [
      'mocne uderzenia wrecz',
      'kamienna fala fizyczna',
      'presja obszarowa',
      'gonienie po arenie',
    ],
    resistances: {
      physical: -30,
      earth: 0,
      fire: -30,
      ice: 0,
      energy: -30,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: 'Gold Coin',
        chance: 'very common',
      },
      {
        name: 'Necromantic Rust',
        chance: 'very common',
      },
      {
        name: 'Mysterious Remains',
        chance: 'very common',
      },
      {
        name: 'Great Mana Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Health Potion',
        chance: 'common',
      },
      {
        name: 'Maimer',
        chance: 'rare',
      },
      {
        name: 'Ornate Mace',
        chance: 'rare',
      },
      {
        name: 'Blood of the Mountain',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'The Fear Feaster',
    slug: 'The-Fear-Feaster',
    imageUrl: 'https://static.tibia.com/images/library/creatures/fearfeaster.gif',
    boss: true,
    shortDescription:
      'Nieumarla bestia z Feaster of Souls, ktora lubi cisnac walke w zwarciu. Jest wyraznie slabsza na physical, fire i energy, ale death zamiast szkodzic moze ja podleczyc.',
    accessQuest: 'Czesc Feaster of Souls Quest.',
    location: 'Zarganash.',
    soloLevel: '700+',
    groupLevel: '450+',
    attackStyle: [
      'uderzenia wrecz',
      'wysoki burst w zwarciu',
      'brak odwrotu',
      'presja pod boss room',
    ],
    resistances: {
      physical: 25,
      earth: -30,
      fire: 25,
      ice: 0,
      energy: 25,
      holy: 0,
      death: -100,
    },
    loot: [
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'White Gem',
        chance: 'uncommon',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Spirit Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Soulforged Lantern',
        chance: 'rare',
      },
      {
        name: 'Ghost Chestplate',
        chance: 'rare',
      },
      {
        name: 'Spooky Hood',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The Flaming Orchid',
    slug: 'The-Flaming-Orchid',
    imageUrl: 'https://static.tibia.com/images/library/creatures/flamingorchid.gif',
    boss: true,
    shortDescription:
      'Asuryjski boss z Asura Palace, ktory miesza fire, death i mana drain. Potrafi paralizowac, znikac i leczyc sie, wiec walka robi sie grozna dla postaci bez ochrony na zywioly.',
    accessQuest:
      'Boss z Asura Palace Quest; wejscie co 20 godzin po zabiciu 3 Cave Hydr i 2 Greater Fire Elementals.',
    location: 'Asura Palace.',
    soloLevel: '250+',
    groupLevel: '180+',
    attackStyle: [
      'uderzenia wrecz',
      'beam z mana drainem',
      'pociski fire i death',
      'paralizujaca chmura',
      'niewidzialnosc i leczenie',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: -100,
      ice: 25,
      energy: 0,
      holy: 0,
      death: -30,
    },
    loot: [
      {
        name: 'Gold Coin',
        chance: 'common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Great Mana Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Health Potion',
        chance: 'common',
      },
      {
        name: 'Golden Lotus Brooch',
        chance: 'uncommon',
      },
      {
        name: 'Moonlight Rod',
        chance: 'uncommon',
      },
      {
        name: 'Assassin Dagger',
        chance: 'uncommon',
      },
      {
        name: 'Violet Gem',
        chance: 'uncommon',
      },
    ],
  },
  {
    name: 'The Gravedigger',
    slug: 'The-Gravedigger',
    imageUrl: 'https://static.tibia.com/images/library/creatures/thegravedigger.gif',
    boss: true,
    shortDescription:
      'Boss z The Roost of the Graveborn Quest, ktory stoi blisko celu, rzuca mocne fire balle i dorzuca przywolania Bonelord Totemow. Dodatkowo ignoruje Challenge i zwykle skupia sie na najblizszym graczu.',
    accessQuest:
      'Czesc The Roost of the Graveborn Quest; cooldown mozna resetowac itemem Shrunken Head, a Deathly Crypt Rune wypada dopiero po pelnym ukonczeniu questa.',
    location: 'Wejscie do sali na dzwignie znajduje sie na pustyni Ankrahmun.',
    soloLevel: '800+',
    groupLevel: '450+',
    attackStyle: [
      'uderzenia wrecz',
      'fire balle',
      'przywolania Bonelord Totemow',
      'focus najblizszego celu',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Great Spirit Potion',
        chance: 'common',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Bonelord Shield',
        chance: 'uncommon',
      },
      {
        name: 'Shrunken Head',
        chance: 'uncommon',
      },
      {
        name: 'Grave Flower',
        chance: 'uncommon',
      },
      {
        name: 'Deathly Crypt Rune',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The Lily Of Night',
    slug: 'The-Lily-Of-Night',
    imageUrl: 'https://static.tibia.com/images/library/creatures/lilyofnight.gif',
    boss: true,
    shortDescription:
      'Slabo opisana bosska powiazana z Secret Library, ale z dostepna lista lootu i wyrazna odpornoscia na death. Z uwagi na skape dane z wiki najlepiej traktowac ja jako asuryjskiego archfoe z neutralnymi pozostalymi zywiolami.',
    accessQuest: 'Powiazana z The Secret Library Quest.',
    location: 'Asura Palace.',
    soloLevel: '500+',
    groupLevel: '300+',
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: -100,
    },
    loot: [
      {
        name: 'Gold Coin',
        chance: 'very common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Great Spirit Potion',
        chance: 'common',
      },
      {
        name: 'Assassin Star',
        chance: 'common',
      },
      {
        name: 'Demonic Essence',
        chance: 'uncommon',
      },
      {
        name: 'Golden Lotus Brooch',
        chance: 'uncommon',
      },
      {
        name: 'Moonlight Rod',
        chance: 'uncommon',
      },
      {
        name: 'Necrotic Rod',
        chance: 'uncommon',
      },
    ],
  },
  {
    name: 'The Mega Magmaoid',
    slug: 'The-Mega-Magmaoid',
    imageUrl: 'https://static.tibia.com/images/library/creatures/megamagmaoid.gif',
    boss: true,
    shortDescription:
      'Pyro-elementalny boss z Too Hot to Handle Quest. Jest odporny na earth, wzmacnia go fire i ma widoczna slabosc na death, ale wiki nie podaje jeszcze wiarygodnej tabeli lootu.',
    accessQuest: 'Czesc Too Hot to Handle Quest.',
    location: 'Dwelling of the Forgotten.',
    soloLevel: '350+',
    groupLevel: '220+',
    resistances: {
      physical: 0,
      earth: -100,
      fire: -100,
      ice: 0,
      energy: -30,
      holy: 0,
      death: 25,
    },
  },
  {
    name: 'The Monster',
    slug: 'The-Monster',
    imageUrl: 'https://static.tibia.com/images/library/creatures/themonster.gif',
    boss: true,
    shortDescription:
      'Finalowy eksperyment Doctor Marrow z Cradle of Monsters. Na starcie jest praktycznie niewrazliwy i trzeba oslabic go, przeciagajac po rozlanych odczynnikach z niszczonych pojemnikow.',
    accessQuest: 'Final boss The Cradle of Monsters Quest.',
    location: 'Deeper Ingol.',
    soloLevel: '500+',
    groupLevel: '300+',
    attackStyle: ['uderzenia wrecz', 'hex', 'rzadki retarget', 'mechanika oslabiania pojemnikami'],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Platinum Coin',
        chance: 'very common',
      },
      {
        name: 'Ultimate Health Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Yellow Gem',
        chance: 'common',
      },
      {
        name: 'Giant Amethyst',
        chance: 'semi-rare',
      },
      {
        name: 'Watermelon Tourmaline',
        chance: 'rare',
      },
      {
        name: "Alchemist's Notepad",
        chance: 'very rare',
      },
      {
        name: 'Mutated Skin Armor',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'The Moonlight Aster',
    slug: 'The-Moonlight-Aster',
    imageUrl: 'https://static.tibia.com/images/library/creatures/moonlightaster.gif',
    boss: true,
    shortDescription:
      'Asuryjski boss z wyraznym pakietem kontroli: mana drain, curse, paraliza, niewidzialnosc i samoleczenie. Walka jest podobna do Flaming Orchid, ale mocniej karze slabosci na earth i energy.',
    accessQuest:
      'Boss z Asura Palace Quest; wejscie co 20 godzin po zabiciu 2 Vicious Liches i 2 Vile Destroyerow.',
    location: 'Asura Palace.',
    soloLevel: '250+',
    groupLevel: '180+',
    attackStyle: [
      'uderzenia wrecz',
      'beam z mana drainem',
      'kulka death z curse',
      'paralizujaca chmura',
      'niewidzialnosc i leczenie',
    ],
    resistances: {
      physical: 0,
      earth: 25,
      fire: -30,
      ice: -30,
      energy: 25,
      holy: 0,
      death: -100,
    },
    loot: [
      {
        name: 'Gold Coin',
        chance: 'common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Ultimate Health Potion',
        chance: 'common',
      },
      {
        name: 'Great Mana Potion',
        chance: 'common',
      },
      {
        name: 'Moonlight Rod',
        chance: 'uncommon',
      },
      {
        name: 'Peacock Feather Fan',
        chance: 'uncommon',
      },
      {
        name: 'Skullcracker Armor',
        chance: 'rare',
      },
      {
        name: 'Spellbook of Mind Control',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The Moonsnow Magnolia',
    slug: 'The-Moonsnow-Magnolia',
    imageUrl: 'https://static.tibia.com/images/library/creatures/moonsnowmagnolia.gif',
    boss: true,
    shortDescription:
      'Boss z Shards of a Broken Moon Quest, o slabo opisanej mechanice, ale dobrze udokumentowanych nagrodach. Zle znosi earth, fire i energy, a najlepiej broni sie przed ice.',
    accessQuest:
      'Czesc Shards of a Broken Moon Quest; cooldown mozna resetowac Frozen Peacock Feather.',
    location: 'Asura Citadel.',
    soloLevel: '700+',
    groupLevel: '450+',
    resistances: {
      physical: 0,
      earth: 25,
      fire: 25,
      ice: -30,
      energy: 25,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Enchanted Flamingo Amulet of Destruction',
        chance: 'rare',
      },
      {
        name: 'Enchanted Flamingo Amulet of Nature',
        chance: 'rare',
      },
      {
        name: 'Enchanted Flamingo Amulet of Precision',
        chance: 'rare',
      },
      {
        name: 'Enchanted Flamingo Amulet of Valor',
        chance: 'rare',
      },
      {
        name: 'Enchanted Swan Amulet of Balance',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The Nightmare Beast',
    slug: 'The-Nightmare-Beast',
    imageUrl: 'https://static.tibia.com/images/library/creatures/nightmarebeast.gif',
    boss: true,
    shortDescription:
      'Final boss Dream Courts z bardzo mocnymi atakami death na dystans. Kluczem do walki jest rotacyjne uzywanie totemu i tworzenie Dream Catcherow, aby zdejmowac curse z druzyny.',
    accessQuest: 'Final boss The Dream Courts Quest.',
    location: 'Dream Scar.',
    soloLevel: '700+',
    groupLevel: '450+',
    attackStyle: [
      'ataki dystansowe death',
      'death beam i chain',
      'czesty retarget',
      'mechanika curse z Dream Catcherami',
    ],
    resistances: {
      physical: -30,
      earth: 0,
      fire: -30,
      ice: 0,
      energy: 0,
      holy: -30,
      death: 0,
    },
    loot: [
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Spirit Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Mana Potion',
        chance: 'common',
      },
      {
        name: 'Silver Token',
        chance: 'uncommon',
      },
      {
        name: 'Gold Token',
        chance: 'uncommon',
      },
      {
        name: "Beast's Nightmare-Cushion",
        chance: 'rare',
      },
      {
        name: 'Turquoise Tendril Lantern',
        chance: 'rare',
      },
      {
        name: 'Dark Whispers',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The Pale Worm',
    slug: 'The-Pale-Worm',
    imageUrl: 'https://static.tibia.com/images/library/creatures/paleworm.gif',
    boss: true,
    shortDescription:
      'Koncowy boss Feaster of Souls, dzielacy pule zycia z A Weak Spot. Jest bardzo odporny na praktycznie kazdy zywiol i odpowiada poteznym melee, poison, death oraz holy.',
    accessQuest: 'Final boss Feaster of Souls Quest, ze wspolna pula zycia z A Weak Spot.',
    location: 'Zarganash.',
    soloLevel: '1000+',
    groupLevel: '600+',
    attackStyle: [
      'bardzo mocne uderzenia wrecz',
      'poison gfb',
      'death wave',
      'holy beam',
      'wspolna pula zycia z A Weak Spot',
    ],
    resistances: {
      physical: -75,
      earth: -75,
      fire: -75,
      ice: -75,
      energy: -75,
      holy: -75,
      death: -75,
    },
    loot: [
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Ultimate Spirit Potion',
        chance: 'common',
      },
      {
        name: "Pale Worm's Scalp",
        chance: 'rare',
      },
      {
        name: 'Ring of Souls',
        chance: 'rare',
      },
      {
        name: 'Ghost Backpack',
        chance: 'rare',
      },
      {
        name: 'Phantasmal Axe',
        chance: 'rare',
      },
      {
        name: 'Pair of Nightmare Boots',
        chance: 'rare',
      },
      {
        name: 'Fabulous Legs',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'The Rootkraken',
    slug: 'The-Rootkraken',
    imageUrl: 'https://static.tibia.com/images/library/creatures/rootkraken.gif',
    boss: true,
    shortDescription:
      'Finalowy boss Podzilla Quest, ktory miesza root, earth, death i holy. Najwiekszym zagrozeniem sa strefy kontroli i utrudnianie ruchu, a nie sam prosty burst z jednego zywiolu.',
    accessQuest: 'Final boss Podzilla Quest.',
    location: 'Podzilla.',
    soloLevel: '600+',
    groupLevel: '350+',
    attackStyle: ['root', 'strefy earth i death', 'holy obszarowki', 'death strike'],
    resistances: {
      physical: 0,
      earth: 25,
      fire: 50,
      ice: 0,
      energy: -30,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Ultimate Health Potion',
        chance: 'common',
      },
      {
        name: 'Great Mana Potion',
        chance: 'common',
      },
      {
        name: 'Supreme Health Potion',
        chance: 'common',
      },
      {
        name: 'Amber Crusher',
        chance: 'uncommon',
      },
      {
        name: 'Root Tentacle',
        chance: 'uncommon',
      },
      {
        name: 'Strange Inedible Fruit',
        chance: 'uncommon',
      },
      {
        name: 'Amber Kusarigama',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The Sandking',
    slug: 'The-Sandking',
    imageUrl: 'https://static.tibia.com/images/library/creatures/sandkingfinal.gif',
    boss: true,
    shortDescription:
      'Pustynny boss z Cults of Tibia, ktory miesza melee, chainy i obszarowe trucizny. Kluczowe jest niedopuszczenie, by wchodzil na zwloki Sand Broodow, bo wtedy mocno sie leczy.',
    accessQuest: 'Czesc Cults of Tibia Quest.',
    location: 'Pod Dark Pyramid.',
    soloLevel: '350+',
    groupLevel: '220+',
    attackStyle: [
      'mocne uderzenia wrecz',
      'fala poison/energy',
      'death chain',
      'leczenie na zwlokach Sand Brood',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Gold Coin',
        chance: 'very common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Great Mana Potion',
        chance: 'common',
      },
      {
        name: 'Ultimate Health Potion',
        chance: 'common',
      },
      {
        name: 'Silver Token',
        chance: 'uncommon',
      },
      {
        name: 'Gold Token',
        chance: 'uncommon',
      },
      {
        name: 'Cobra Crown',
        chance: 'rare',
      },
      {
        name: 'Calopteryx Cape',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The Scourge Of Oblivion',
    slug: 'The-Scourge-Of-Oblivion',
    imageUrl: 'https://static.tibia.com/images/library/creatures/scourgeofoblivion00.gif',
    boss: true,
    shortDescription:
      'Finalowy boss Secret Library z wielofazowa walka i okresami niewrazliwosci. Podczas invul faz trzeba czyscic summony i przetrwac mieszanke fire, physical oraz death.',
    accessQuest: 'Final battle The Secret Library Quest.',
    location: 'Secret Library.',
    soloLevel: '1200+',
    groupLevel: '700+',
    attackStyle: [
      'fazy niewrazliwosci',
      'great wave fire',
      'beam fizyczny',
      'death ball i chain',
      'przywolania podczas walki',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Royal Star',
        chance: 'common',
      },
      {
        name: 'Crystal Coin',
        chance: 'common',
      },
      {
        name: 'Ultimate Spirit Potion',
        chance: 'common',
      },
      {
        name: 'Silver Token',
        chance: 'common',
      },
      {
        name: 'Gold Token',
        chance: 'uncommon',
      },
      {
        name: 'Spark Sphere',
        chance: 'uncommon',
      },
      {
        name: 'Library Ticket',
        chance: 'rare',
      },
      {
        name: 'The Calamity',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'The Souldespoiler',
    slug: 'The-Souldespoiler',
    imageUrl: 'https://static.tibia.com/images/library/creatures/souldespoiler.gif',
    boss: true,
    shortDescription:
      'Cults of Tibia boss, ktory realnie traci zycie glownie dzieki Freed Soulom. Sam zadaje glownie physical i death, ale walka jest bardziej o obsluge mechaniki summonow niz o czysty dps.',
    accessQuest: 'Czesc Cults of Tibia Quest.',
    location: 'Kryjowka Humans Cult pod Outlaw Camp.',
    soloLevel: '350+',
    groupLevel: '220+',
    attackStyle: [
      'uderzenia wrecz',
      'death bomb i death strike',
      'spawn Freed Souls',
      'mechanika zabijania przez summony',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: -30,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Gold Coin',
        chance: 'very common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Mysterious Remains',
        chance: 'common',
      },
      {
        name: 'Ultimate Health Potion',
        chance: 'common',
      },
      {
        name: 'Curious Matter',
        chance: 'uncommon',
      },
      {
        name: 'Spark Sphere',
        chance: 'uncommon',
      },
      {
        name: 'Shield of Corruption',
        chance: 'rare',
      },
      {
        name: 'Rift Lance',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The Source Of Corruption',
    slug: 'The-Source-Of-Corruption',
    imageUrl: 'https://static.tibia.com/images/library/creatures/sourceofcorruption.gif',
    boss: true,
    shortDescription:
      'Elektro-elementalny final boss Cults of Tibia. Walczy w zwarciu, rzuca energy beam, przywoluje Soul Reapery i odbija czesc otrzymanych obrazen, wiec shooterzy musza pilnowac hp.',
    accessQuest: 'Final boss Cults of Tibia Quest.',
    location: 'Feyrist, za teleportem obok Gerimor.',
    soloLevel: '450+',
    groupLevel: '280+',
    attackStyle: [
      'uderzenia wrecz',
      'energy beam',
      'odbicie czesci obrazen',
      'przywolania Soul Reaperow',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'Gold Coin',
        chance: 'very common',
      },
      {
        name: 'Platinum Coin',
        chance: 'common',
      },
      {
        name: 'Crystallized Anger',
        chance: 'common',
      },
      {
        name: 'Solid Rage',
        chance: 'common',
      },
      {
        name: 'Gold Token',
        chance: 'uncommon',
      },
      {
        name: 'Silver Token',
        chance: 'uncommon',
      },
      {
        name: 'Umbral Slayer',
        chance: 'rare',
      },
      {
        name: 'Rift Bow',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The Time Guardian',
    slug: 'The-Time-Guardian',
    imageUrl: 'https://static.tibia.com/images/library/creatures/timeguardian.gif',
    boss: true,
    shortDescription:
      'Maszynowy miniboss z Forgotten Knowledge Quest, walczacy w kilku formach ze wspolnym paskiem zycia. W podstawowej postaci najlepiej przyjmuje obrazenia fizyczne, a zywiolami bije wyraznie slabiej.',
    accessQuest:
      'Wymagany dostep do Forgotten Knowledge Quest oraz wejscie przez Holy Portal za Astral Shaper Dungeon.',
    location: 'Gleboko pod polnocno-zachodnim Edron, arena The Time Guardian.',
    soloLevel: '500+',
    groupLevel: '300+',
    attackStyle: [
      'mocne uderzenia wrecz',
      'fire strike',
      'energy wave',
      'zmiana form ze wspolnym hp',
    ],
    resistances: {
      physical: 0,
      earth: -75,
      fire: -75,
      ice: 0,
      energy: -75,
      holy: 0,
      death: -75,
    },
    loot: [
      {
        name: 'gold coin',
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'ultimate health potion',
        chance: 'common',
      },
      {
        name: 'silver token',
        chance: 'uncommon',
      },
      {
        name: 'guardian boots',
        chance: 'rare',
      },
      {
        name: 'frozen time',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The Unarmored Voidborn',
    slug: 'The-Unarmored-Voidborn',
    imageUrl: 'https://static.tibia.com/images/library/creatures/voidbornvulnerable.gif',
    boss: true,
    shortDescription:
      'Druga forma voidborna z Cults of Tibia Quest, skrajnie podatna na praktycznie kazdy typ obrazen. Mimo olbrzymiej slabej odpornosci ma duzo hp, wiec walka nadal trwa chwile.',
    accessQuest: 'Pojawia sie po zabiciu The Armored Voidborn w Cults of Tibia Quest.',
    location: 'Kryjowka orkowego kultu w Edron Orc Cave.',
    soloLevel: '220+',
    groupLevel: '140+',
    attackStyle: [
      'mocne uderzenia wrecz',
      'death wave',
      'energy chain attack',
      'walka bez zlozonej mechaniki',
    ],
    resistances: {
      physical: 50,
      earth: 50,
      fire: 50,
      ice: 50,
      energy: 50,
      holy: 50,
      death: 50,
    },
    loot: [
      {
        name: 'gold coin',
        chance: 'very common',
      },
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'great mana potion',
        chance: 'common',
      },
      {
        name: 'silver token',
        chance: 'uncommon',
      },
      {
        name: 'gold token',
        chance: 'uncommon',
      },
      {
        name: 'heart of the mountain',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'The Unwelcome',
    slug: 'The-Unwelcome',
    imageUrl: 'https://static.tibia.com/images/library/creatures/theunwelcome.gif',
    boss: true,
    shortDescription:
      'Archfoe z Feaster of Souls Quest o bardzo wysokich odpornosciach na wszystkie podstawowe zrodla obrazen. To prostsza mechanicznie walka, ale wymaga solidnego sustainu i cierpliwego bicia.',
    accessQuest: 'Czesc Feaster of Souls Quest.',
    location: 'Zarganash.',
    soloLevel: '450+',
    groupLevel: '250+',
    attackStyle: ['uderzenia wrecz', 'duza wytrzymalosc', 'presja przez dlugi czas walki'],
    resistances: {
      physical: -75,
      earth: -75,
      fire: -75,
      ice: -75,
      energy: -75,
      holy: -75,
      death: -75,
    },
    loot: [
      {
        name: 'crystal coin',
        chance: 'common',
      },
      {
        name: 'berserk potion',
        chance: 'common',
      },
      {
        name: 'ultimate mana potion',
        chance: 'common',
      },
      {
        name: 'writhing heart',
        chance: 'uncommon',
      },
      {
        name: 'soulforged lantern',
        chance: 'rare',
      },
      {
        name: 'fabulous legs',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'The Winter Bloom',
    slug: 'The-Winter-Bloom',
    imageUrl: 'https://static.tibia.com/images/library/creatures/winterbloom.gif',
    boss: true,
    shortDescription:
      'Asura boss laczacy ice i death z niewidzialnoscia, paraliem oraz mana drainem. Najlatwiej wejsc przygotowanym na lod i szybko skrocic walke, bo potrafi tez sie podleczac.',
    accessQuest:
      'Dostep z Asura Palace Quest, co 20 godzin po pokonaniu Solitary Frost Dragon i 2 Greater Energy Elementali.',
    location: 'Asura Palace.',
    soloLevel: '250+',
    groupLevel: '150+',
    attackStyle: [
      'uderzenia wrecz',
      'ice missile i ice bomb',
      'death bomb',
      'paralyze, niewidzialnosc i mana drain',
    ],
    resistances: {
      physical: 0,
      earth: -30,
      fire: 25,
      ice: -100,
      energy: 0,
      holy: 0,
      death: -30,
    },
    loot: [
      {
        name: 'gold coin',
        chance: 'very common',
      },
      {
        name: 'great mana potion',
        chance: 'common',
      },
      {
        name: 'ultimate health potion',
        chance: 'common',
      },
      {
        name: 'demonic essence',
        chance: 'common',
      },
      {
        name: 'glacier robe',
        chance: 'rare',
      },
      {
        name: 'golden lotus brooch',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Timira The Many-Headed',
    slug: 'Timira-The-Many-Headed',
    imageUrl: 'https://static.tibia.com/images/library/creatures/timira.gif',
    boss: true,
    shortDescription:
      'Finalna naga z Within the Tides Quest, walczaca glownie z bliska, ale rozlewajaca obrazenia po calej sali lancuchami i polami ognia. Wiekszosc zywiolow dziala na nia dobrze, a sorcererzy zwykle lepiej wypadaja na single target.',
    accessQuest: 'Czesc Within the Tides Quest.',
    location: 'Emerald Gardens na wyspie Marapur.',
    soloLevel: '700+',
    groupLevel: '400+',
    attackStyle: [
      'uderzenia wrecz',
      'fire bomby i ringi',
      'death chain',
      'energy strike i mana drain chain',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: -30,
      ice: 25,
      energy: -30,
      holy: 0,
      death: -30,
    },
    loot: [
      {
        name: 'crystal coin',
        chance: 'common',
      },
      {
        name: 'ultimate mana potion',
        chance: 'common',
      },
      {
        name: 'naga basin',
        chance: 'uncommon',
      },
      {
        name: "piece of Timira's sensors",
        chance: 'rare',
      },
      {
        name: "one of Timira's many heads",
        chance: 'rare',
      },
      {
        name: 'naga quiver',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Tropical Desolator',
    slug: 'Tropical-Desolator',
    imageUrl: 'https://static.tibia.com/images/library/creatures/tropicaldesolator.gif',
    boss: true,
    shortDescription:
      'Iksowy boss z Between the Lines Quest, wspierany przez egzotyczne owoce z losowymi efektami. Najwieksze ryzyko daje heal dla bossa i fear, wiec trzeba stale kontrolowac pozycje.',
    accessQuest: 'Czesc Between the Lines Quest.',
    location: 'Liberty Bay.',
    soloLevel: '250+',
    groupLevel: '180+',
    attackStyle: [
      'uderzenia wrecz',
      'przywolania',
      'wybuchajace owoce z earth damage',
      'fear i leczenie bossa',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 25,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'very common',
      },
      {
        name: 'white pearl',
        chance: 'common',
      },
      {
        name: 'black pearl',
        chance: 'common',
      },
      {
        name: 'gold ingot',
        chance: 'uncommon',
      },
      {
        name: 'proficiency catalyst',
        chance: 'rare',
      },
      {
        name: 'scallop shell',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Unaz The Mean',
    slug: 'Unaz-The-Mean',
    imageUrl: 'https://static.tibia.com/images/library/creatures/unaz.gif',
    boss: true,
    shortDescription:
      'Upiorny boss z Feaster of Souls Quest, odporny na physical i energy, a calkowicie niewrazliwy na death. Walczy kontaktowo, ale potrafi dorzucic mocne komba zywiolowe, wiec warto podejsc z dobra ochrona.',
    accessQuest: 'Czesc Feaster of Souls Quest.',
    location: 'Netherworld.',
    soloLevel: '400+',
    groupLevel: '250+',
    attackStyle: ['uderzenia wrecz', 'mocne komba energy i physical', 'life drain', 'death damage'],
    resistances: {
      physical: -30,
      earth: 0,
      fire: 0,
      ice: 25,
      energy: -30,
      holy: 0,
      death: -100,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'ivory comb',
        chance: 'common',
      },
      {
        name: 'moonstone',
        chance: 'common',
      },
      {
        name: 'skull coin',
        chance: 'uncommon',
      },
      {
        name: 'death toll',
        chance: 'rare',
      },
      {
        name: 'pair of nightmare boots',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Urmahlullu The Weakened',
    slug: 'Urmahlullu-The-Weakened',
    imageUrl: 'https://static.tibia.com/images/library/creatures/urmahlulluweakest.gif',
    boss: true,
    shortDescription:
      'Oslabiona forma urmahlullu z Kilmaresh, ktora mimo nazwy nadal ma duzo zycia i nagradza mocnym burstem fire. To raczej statyczny boss do ustawienia i szybkiego fokusowania.',
    accessQuest: 'Czesc Kilmaresh Quest.',
    location: 'Issavi, Green Belt.',
    soloLevel: '400+',
    groupLevel: '250+',
    attackStyle: ['uderzenia wrecz', 'walka w zwarciu', 'prosta mechanika bez wielu faz'],
    resistances: {
      physical: 0,
      earth: 0,
      fire: -100,
      ice: 0,
      energy: -30,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'supreme health potion',
        chance: 'common',
      },
      {
        name: 'ultimate mana potion',
        chance: 'common',
      },
      {
        name: 'silver token',
        chance: 'uncommon',
      },
      {
        name: 'winged boots',
        chance: 'rare',
      },
      {
        name: 'sunray emblem',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Utua Stone Sting',
    slug: 'Utua-Stone-Sting',
    imageUrl: 'https://static.tibia.com/images/library/creatures/utua.gif',
    boss: true,
    shortDescription:
      'Pajeczy boss z watku An Ancient Feud, oparty na poisonie i physicalu. Jest wolny, wiec dystans ma sporo kontroli nad walka, a knight moze ograniczyc zagrozenie ustawieniem po skosie.',
    accessQuest: 'Czesc Grimvale Quest, etap An Ancient Feud.',
    location: 'Lion Sanctum.',
    soloLevel: '180+',
    groupLevel: '120+',
    attackStyle: ['uderzenia wrecz', 'blood wave', 'poison hit', 'poison ball'],
    resistances: {
      physical: 0,
      earth: -30,
      fire: -30,
      ice: 0,
      energy: -30,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'ultimate health potion',
        chance: 'common',
      },
      {
        name: "Utua's Poison",
        chance: 'uncommon',
      },
      {
        name: 'gold ingot',
        chance: 'uncommon',
      },
      {
        name: 'magic plate armor',
        chance: 'rare',
      },
      {
        name: 'skull helmet',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Vemiath',
    slug: 'Vemiath',
    imageUrl: 'https://static.tibia.com/images/library/creatures/vemiath.gif',
    boss: true,
    shortDescription:
      'Rotten Blood boss z bardzo ciezka mechanika agony, pol darklight i eksplodujacego Rotten Charge. Sama odpornosc jest neutralna, ale walka wymaga perfekcyjnego ruchu i podzialu rol.',
    accessQuest: 'Jeden z bossow Rotten Blood Quest.',
    location: 'Darklight Core.',
    soloLevel: '1200+',
    groupLevel: '600+',
    attackStyle: [
      'mocne uderzenia wrecz',
      'death beam',
      'great energy ring',
      'mana drain, agony i przywolania',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'crystal coin',
        chance: 'common',
      },
      {
        name: 'ultimate mana potion',
        chance: 'common',
      },
      {
        name: 'supreme health potion',
        chance: 'common',
      },
      {
        name: 'raw watermelon tourmaline',
        chance: 'uncommon',
      },
      {
        name: "Vemiath's Infused Basalt",
        chance: 'rare',
      },
      {
        name: 'bag you covet',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Vladrukh',
    slug: 'Vladrukh',
    imageUrl: 'https://static.tibia.com/images/library/creatures/vladrukh.gif',
    boss: true,
    shortDescription:
      'Boss z Bloody Tusks Quest, o ktorym wiki podaje niewiele szczegolow bojowych. Traktuj go jako pozniejszy questowy cel z nastawieniem na wytrzymanie i loot endgame.',
    accessQuest: 'Czesc Bloody Tusks Quest.',
    soloLevel: '500+',
    groupLevel: '300+',
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'ultimate mana potion',
        chance: 'common',
      },
      {
        name: 'greater proficiency catalyst',
        chance: 'uncommon',
      },
      {
        name: 'blood preservation',
        chance: 'rare',
      },
      {
        name: 'blood sceptre',
        chance: 'rare',
      },
      {
        name: 'skull belt',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Vok The Freakish',
    slug: 'Vok-The-Freakish',
    imageUrl: 'https://static.tibia.com/images/library/creatures/vok.gif',
    boss: true,
    shortDescription:
      'Duchowy boss z Feaster of Souls Quest, bardzo twardy na death i energy, ale slabszy na ice. Sama strona nie opisuje wielu mechanik, dlatego walka zwykle sprowadza sie do ostroznego focusu i trzymania ochron.',
    accessQuest: 'Czesc Feaster of Souls Quest.',
    location: 'Netherworld.',
    soloLevel: '450+',
    groupLevel: '250+',
    attackStyle: ['uderzenia wrecz', 'presja w zwarciu', 'wysoka odpornosc na death i energy'],
    resistances: {
      physical: -30,
      earth: 0,
      fire: 0,
      ice: 25,
      energy: -100,
      holy: 0,
      death: -100,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'cursed bone',
        chance: 'common',
      },
      {
        name: 'skull coin',
        chance: 'uncommon',
      },
      {
        name: 'death toll',
        chance: 'rare',
      },
      {
        name: 'ornate crossbow',
        chance: 'rare',
      },
      {
        name: 'pair of nightmare boots',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Wrathful Archivist',
    slug: 'Wrathful-Archivist',
    imageUrl: 'https://static.tibia.com/images/library/creatures/wrathfularchivist.gif',
    boss: true,
    shortDescription:
      'Biblioteczny boss z Between the Lines Quest, odpornosci ma neutralne, ale cala trudnosc bierze sie z mechanik aktywowanych przez niebieskie ksiazki. Bez szybkiego ogarniania run, duchow i zwierzat pozostaje niesmiertelny.',
    accessQuest: 'Jeden z bossow Between the Lines Quest.',
    location: 'Yalahar, na dachu domu Soilance po uzyciu levitate.',
    soloLevel: '250+',
    groupLevel: '180+',
    attackStyle: [
      'death damage',
      'energy damage',
      'mana drain',
      'okna podatnosci od mechanik z ksiazkami',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: 0,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'strong mana potion',
        chance: 'common',
      },
      {
        name: 'great mana potion',
        chance: 'common',
      },
      {
        name: 'blank imbuement scroll',
        chance: 'uncommon',
      },
      {
        name: 'proficiency catalyst',
        chance: 'rare',
      },
      {
        name: 'sand-filled horn',
        chance: 'very rare',
      },
    ],
  },
  {
    name: 'Yirkas Blue Scales',
    slug: 'Yirkas-Blue-Scales',
    imageUrl: 'https://static.tibia.com/images/library/creatures/yirkass.gif',
    boss: true,
    shortDescription:
      'Jaszczurzy boss z An Ancient Feud, bazujacy glownie na energy i earth. Dystans ma tu przewage, bo mozna ograniczac jego fale i wykorzystywac filary do bezpieczniejszego kitingu.',
    accessQuest: 'Czesc Grimvale Quest, etap An Ancient Feud.',
    location: 'Lion Sanctum.',
    soloLevel: '180+',
    groupLevel: '120+',
    attackStyle: ['uderzenia wrecz', 'energy strike i energy ball', 'energy bomb', 'earth wave'],
    resistances: {
      physical: 0,
      earth: -30,
      fire: -30,
      ice: 0,
      energy: -30,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'ultimate health potion',
        chance: 'common',
      },
      {
        name: "Yirkas' Egg",
        chance: 'uncommon',
      },
      {
        name: 'gold ingot',
        chance: 'uncommon',
      },
      {
        name: 'alloy legs',
        chance: 'rare',
      },
      {
        name: 'ornate crossbow',
        chance: 'rare',
      },
    ],
  },
  {
    name: 'Zamulosh',
    slug: 'Zamulosh',
    imageUrl: 'https://static.tibia.com/images/library/creatures/zamulosh.gif',
    boss: true,
    shortDescription:
      "Demoniczny slug Ferumbras' Ascension, walczacy z klonami, niewidzialnoscia i teleportami do centrum sali. Najwygodniej ubijac go obszarowo, bo skupienie tylko prawdziwej kopii zwykle spowalnia walke.",
    accessQuest: "Czesc Ferumbras' Ascension Quest jako slug Bazira.",
    location: 'Grounds of Deceit.',
    soloLevel: '500+',
    groupLevel: '300+',
    attackStyle: [
      'uderzenia wrecz',
      'death wave',
      'life drain i poison',
      'niewidzialnosc oraz przywolania klonow',
    ],
    resistances: {
      physical: 0,
      earth: 0,
      fire: -30,
      ice: 0,
      energy: 0,
      holy: 0,
      death: 0,
    },
    loot: [
      {
        name: 'platinum coin',
        chance: 'common',
      },
      {
        name: 'great mana potion',
        chance: 'common',
      },
      {
        name: 'silver token',
        chance: 'uncommon',
      },
      {
        name: 'demonic essence',
        chance: 'common',
      },
      {
        name: 'book of lies',
        chance: 'rare',
      },
      {
        name: 'rift crossbow',
        chance: 'rare',
      },
    ],
  },
];

export function findBoostedBossDetails(name: string | undefined): BoostedBossDetailEntry | null {
  if (!name) {
    return null;
  }

  return BOOSTED_BOSSES.find((entry) => entry.name === name) ?? null;
}

export type { CreatureLootEntry as BoostedLootEntry };
