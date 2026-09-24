import type { BoostableBossesDto } from '@shared/api-contract';

/**
 * Pelna referencyjna lista bossow z /api/boostable-bosses (TibiaData), uzywana
 * jako baza do uzupelniania szczegolowych wpisow w `boosted-bosses.data.ts`.
 * Pole `featured` odzwierciedla aktualnie boostowanego bossa w momencie
 * pobrania danych - nie jest to wartosc stala w czasie.
 */
export const BOOSTABLE_BOSS_LIST_REFERENCE: BoostableBossesDto = {
  boosted: {
    name: 'Tarbaz',
    imageUrl: 'https://static.tibia.com/images/global/header/monsters/tarbaz.gif',
    featured: true,
  },
  boostableBossList: [
    {
      name: 'Abyssador',
      imageUrl: 'https://static.tibia.com/images/library/abyssador.gif',
      featured: false,
    },
    {
      name: 'Adventurer Group',
      imageUrl: 'https://static.tibia.com/images/library/adventurergroup.gif',
      featured: false,
    },
    { name: 'Ahau', imageUrl: 'https://static.tibia.com/images/library/ahau.gif', featured: false },
    {
      name: 'Amenef The Burning',
      imageUrl: 'https://static.tibia.com/images/library/ameneftheburning.gif',
      featured: false,
    },
    {
      name: 'Anomaly',
      imageUrl: 'https://static.tibia.com/images/library/anomaly.gif',
      featured: false,
    },
    {
      name: 'Arbaziloth',
      imageUrl: 'https://static.tibia.com/images/library/arbaziloth4spheres.gif',
      featured: false,
    },
    {
      name: 'Black Vixen',
      imageUrl: 'https://static.tibia.com/images/library/vixen.gif',
      featured: false,
    },
    {
      name: 'Blight Mariner',
      imageUrl: 'https://static.tibia.com/images/library/blightmariner.gif',
      featured: false,
    },
    {
      name: 'Bloodback',
      imageUrl: 'https://static.tibia.com/images/library/bloodhoof.gif',
      featured: false,
    },
    {
      name: 'Bone Overlord',
      imageUrl: 'https://static.tibia.com/images/library/boneoverlordbosstiary.gif',
      featured: false,
    },
    {
      name: 'Brain Head',
      imageUrl: 'https://static.tibia.com/images/library/brainhead.gif',
      featured: false,
    },
    {
      name: 'Brokul',
      imageUrl: 'https://static.tibia.com/images/library/brokul.gif',
      featured: false,
    },
    {
      name: 'Chagorz',
      imageUrl: 'https://static.tibia.com/images/library/chagorz.gif',
      featured: false,
    },
    {
      name: 'Count Vlarkorth',
      imageUrl: 'https://static.tibia.com/images/library/countvlarkort.gif',
      featured: false,
    },
    {
      name: 'Court Warlock',
      imageUrl: 'https://static.tibia.com/images/library/courtwarlock.gif',
      featured: false,
    },
    {
      name: 'Darkfang',
      imageUrl: 'https://static.tibia.com/images/library/darkfang.gif',
      featured: false,
    },
    {
      name: 'Deathstrike',
      imageUrl: 'https://static.tibia.com/images/library/deathstrike.gif',
      featured: false,
    },
    {
      name: 'Dragon Pack',
      imageUrl: 'https://static.tibia.com/images/library/representingdespor.gif',
      featured: false,
    },
    {
      name: 'Drume',
      imageUrl: 'https://static.tibia.com/images/library/drume.gif',
      featured: false,
    },
    {
      name: 'Duke Krule',
      imageUrl: 'https://static.tibia.com/images/library/dukekrule.gif',
      featured: false,
    },
    {
      name: 'Earl Osam',
      imageUrl: 'https://static.tibia.com/images/library/earlosam.gif',
      featured: false,
    },
    {
      name: 'Ekatrix',
      imageUrl: 'https://static.tibia.com/images/library/ekatrix.gif',
      featured: false,
    },
    {
      name: 'Eldritch Dragon Lord',
      imageUrl: 'https://static.tibia.com/images/library/eldritchdragonlord.gif',
      featured: false,
    },
    {
      name: 'Eradicator',
      imageUrl: 'https://static.tibia.com/images/library/eradicator.gif',
      featured: false,
    },
    {
      name: 'Essence Of Malice',
      imageUrl: 'https://static.tibia.com/images/library/essenceofmalice.gif',
      featured: false,
    },
    {
      name: 'Faceless Bane',
      imageUrl: 'https://static.tibia.com/images/library/facelessbane.gif',
      featured: false,
    },
    {
      name: 'Ghulosh',
      imageUrl: 'https://static.tibia.com/images/library/ghulosh.gif',
      featured: false,
    },
    {
      name: 'Gnomevil',
      imageUrl: 'https://static.tibia.com/images/library/gnomehorticulist.gif',
      featured: false,
    },
    {
      name: 'Gorzindel',
      imageUrl: 'https://static.tibia.com/images/library/gorzindel.gif',
      featured: false,
    },
    {
      name: "Goshnar's Cruelty",
      imageUrl: 'https://static.tibia.com/images/library/goshnarscruelty.gif',
      featured: false,
    },
    {
      name: "Goshnar's Greed",
      imageUrl: 'https://static.tibia.com/images/library/goshnarsgreed.gif',
      featured: false,
    },
    {
      name: "Goshnar's Hatred",
      imageUrl: 'https://static.tibia.com/images/library/goshnarshatred.gif',
      featured: false,
    },
    {
      name: "Goshnar's Malice",
      imageUrl: 'https://static.tibia.com/images/library/goshnarsmalice.gif',
      featured: false,
    },
    {
      name: "Goshnar's Spite",
      imageUrl: 'https://static.tibia.com/images/library/goshnarsspite.gif',
      featured: false,
    },
    {
      name: 'Grand Master Oberon',
      imageUrl: 'https://static.tibia.com/images/library/grandmasteroberon.gif',
      featured: false,
    },
    {
      name: 'Ice Horror',
      imageUrl: 'https://static.tibia.com/images/library/icehorror.gif',
      featured: false,
    },
    {
      name: 'Ichgahal',
      imageUrl: 'https://static.tibia.com/images/library/ichgahal.gif',
      featured: false,
    },
    {
      name: 'Irgix The Flimsy',
      imageUrl: 'https://static.tibia.com/images/library/irgix.gif',
      featured: false,
    },
    {
      name: 'Katex Blood Tongue',
      imageUrl: 'https://static.tibia.com/images/library/katex.gif',
      featured: false,
    },
    {
      name: 'King Zelos',
      imageUrl: 'https://static.tibia.com/images/library/kingzelos.gif',
      featured: false,
    },
    {
      name: 'Kusuma',
      imageUrl: 'https://static.tibia.com/images/library/kusuma.gif',
      featured: false,
    },
    {
      name: 'Lady Tenebris',
      imageUrl: 'https://static.tibia.com/images/library/ladytenebris.gif',
      featured: false,
    },
    {
      name: 'Lloyd',
      imageUrl: 'https://static.tibia.com/images/library/lloyd.gif',
      featured: false,
    },
    {
      name: 'Lokathmor',
      imageUrl: 'https://static.tibia.com/images/library/lokathmor.gif',
      featured: false,
    },
    {
      name: 'Lord Azaram',
      imageUrl: 'https://static.tibia.com/images/library/lordazaram.gif',
      featured: false,
    },
    {
      name: 'Lord Retro',
      imageUrl: 'https://static.tibia.com/images/library/lordretro.gif',
      featured: false,
    },
    {
      name: 'Magma Bubble',
      imageUrl: 'https://static.tibia.com/images/library/magmacolossus.gif',
      featured: false,
    },
    {
      name: 'Maior Domus',
      imageUrl: 'https://static.tibia.com/images/library/maiordomus.gif',
      featured: false,
    },
    {
      name: 'Mazoran',
      imageUrl: 'https://static.tibia.com/images/library/mazoran.gif',
      featured: false,
    },
    {
      name: 'Mazzinor',
      imageUrl: 'https://static.tibia.com/images/library/mazzinor.gif',
      featured: false,
    },
    {
      name: 'Megasylvan Yselda',
      imageUrl: 'https://static.tibia.com/images/library/yselda.gif',
      featured: false,
    },
    {
      name: 'Melting Frozen Horror',
      imageUrl: 'https://static.tibia.com/images/library/frozenhorror.gif',
      featured: false,
    },
    {
      name: 'Mimar Haffar',
      imageUrl: 'https://static.tibia.com/images/library/mimarhaffar.gif',
      featured: false,
    },
    {
      name: 'Mitmah Vanguard',
      imageUrl: 'https://static.tibia.com/images/library/mitmahvanguard.gif',
      featured: false,
    },
    {
      name: 'Murcion',
      imageUrl: 'https://static.tibia.com/images/library/murcion.gif',
      featured: false,
    },
    {
      name: 'Neferi The Spy',
      imageUrl: 'https://static.tibia.com/images/library/neferithespy.gif',
      featured: false,
    },
    {
      name: 'Outburst',
      imageUrl: 'https://static.tibia.com/images/library/outburst.gif',
      featured: false,
    },
    {
      name: 'Plagirath',
      imageUrl: 'https://static.tibia.com/images/library/plagirath.gif',
      featured: false,
    },
    {
      name: 'Ragiaz',
      imageUrl: 'https://static.tibia.com/images/library/ragiaz.gif',
      featured: false,
    },
    {
      name: 'Ratmiral Blackwhiskers',
      imageUrl: 'https://static.tibia.com/images/library/ratmiral.gif',
      featured: false,
    },
    {
      name: 'Ravenous Hunger',
      imageUrl: 'https://static.tibia.com/images/library/ravenoushunger.gif',
      featured: false,
    },
    {
      name: 'Razzagorn',
      imageUrl: 'https://static.tibia.com/images/library/razzargorn.gif',
      featured: false,
    },
    {
      name: 'Realityquake',
      imageUrl: 'https://static.tibia.com/images/library/realityquake.gif',
      featured: false,
    },
    {
      name: 'Rupture',
      imageUrl: 'https://static.tibia.com/images/library/rupture.gif',
      featured: false,
    },
    {
      name: 'Scarlett Etzel',
      imageUrl: 'https://static.tibia.com/images/library/scarlettetzelstill.gif',
      featured: false,
    },
    {
      name: 'Shadowpelt',
      imageUrl: 'https://static.tibia.com/images/library/blackpelt.gif',
      featured: false,
    },
    {
      name: 'Sharpclaw',
      imageUrl: 'https://static.tibia.com/images/library/sharpclaw.gif',
      featured: false,
    },
    {
      name: 'Shulgrax',
      imageUrl: 'https://static.tibia.com/images/library/shulgrax.gif',
      featured: false,
    },
    {
      name: 'Sir Baeloc',
      imageUrl: 'https://static.tibia.com/images/library/sirbaeloc.gif',
      featured: false,
    },
    {
      name: 'Sir Nictros',
      imageUrl: 'https://static.tibia.com/images/library/sirnictros.gif',
      featured: false,
    },
    {
      name: 'Sister Hetai',
      imageUrl: 'https://static.tibia.com/images/library/sisterhetai.gif',
      featured: false,
    },
    {
      name: 'Soul Of Dragonking Zyrtarch',
      imageUrl: 'https://static.tibia.com/images/library/dragonkingzyrtrachkillable.gif',
      featured: false,
    },
    {
      name: 'Srezz Yellow Eyes',
      imageUrl: 'https://static.tibia.com/images/library/srezz.gif',
      featured: false,
    },
    {
      name: 'Tarbaz',
      imageUrl: 'https://static.tibia.com/images/library/tarbaz.gif',
      featured: true,
    },
    {
      name: 'Tentugly',
      imageUrl: 'https://static.tibia.com/images/library/fakeseamonster.gif',
      featured: false,
    },
    {
      name: 'Thaian',
      imageUrl: 'https://static.tibia.com/images/library/thaian.gif',
      featured: false,
    },
    {
      name: 'The Blazing Rose',
      imageUrl: 'https://static.tibia.com/images/library/blazingrose.gif',
      featured: false,
    },
    {
      name: 'The Brainstealer',
      imageUrl: 'https://static.tibia.com/images/library/brainstealer.gif',
      featured: false,
    },
    {
      name: 'The Diamond Blossom',
      imageUrl: 'https://static.tibia.com/images/library/diamondblossom.gif',
      featured: false,
    },
    {
      name: 'The Dread Maiden',
      imageUrl: 'https://static.tibia.com/images/library/dreadmaiden.gif',
      featured: false,
    },
    {
      name: 'The Enraged Thorn Knight',
      imageUrl: 'https://static.tibia.com/images/library/thornknight.gif',
      featured: false,
    },
    {
      name: 'The False God',
      imageUrl: 'https://static.tibia.com/images/library/falsegod.gif',
      featured: false,
    },
    {
      name: 'The Fear Feaster',
      imageUrl: 'https://static.tibia.com/images/library/fearfeaster.gif',
      featured: false,
    },
    {
      name: 'The Flaming Orchid',
      imageUrl: 'https://static.tibia.com/images/library/flamingorchid.gif',
      featured: false,
    },
    {
      name: 'The Gravedigger',
      imageUrl: 'https://static.tibia.com/images/library/thegravedigger.gif',
      featured: false,
    },
    {
      name: 'The Lily Of Night',
      imageUrl: 'https://static.tibia.com/images/library/lilyofnight.gif',
      featured: false,
    },
    {
      name: 'The Mega Magmaoid',
      imageUrl: 'https://static.tibia.com/images/library/megamagmaoid.gif',
      featured: false,
    },
    {
      name: 'The Monster',
      imageUrl: 'https://static.tibia.com/images/library/themonster.gif',
      featured: false,
    },
    {
      name: 'The Moonlight Aster',
      imageUrl: 'https://static.tibia.com/images/library/moonlightaster.gif',
      featured: false,
    },
    {
      name: 'The Moonsnow Magnolia',
      imageUrl: 'https://static.tibia.com/images/library/moonsnowmagnolia.gif',
      featured: false,
    },
    {
      name: 'The Nightmare Beast',
      imageUrl: 'https://static.tibia.com/images/library/nightmarebeast.gif',
      featured: false,
    },
    {
      name: 'The Pale Worm',
      imageUrl: 'https://static.tibia.com/images/library/paleworm.gif',
      featured: false,
    },
    {
      name: 'The Rootkraken',
      imageUrl: 'https://static.tibia.com/images/library/rootkraken.gif',
      featured: false,
    },
    {
      name: 'The Sandking',
      imageUrl: 'https://static.tibia.com/images/library/sandkingfinal.gif',
      featured: false,
    },
    {
      name: 'The Scourge Of Oblivion',
      imageUrl: 'https://static.tibia.com/images/library/scourgeofoblivion00.gif',
      featured: false,
    },
    {
      name: 'The Souldespoiler',
      imageUrl: 'https://static.tibia.com/images/library/souldespoiler.gif',
      featured: false,
    },
    {
      name: 'The Source Of Corruption',
      imageUrl: 'https://static.tibia.com/images/library/sourceofcorruption.gif',
      featured: false,
    },
    {
      name: 'The Time Guardian',
      imageUrl: 'https://static.tibia.com/images/library/timeguardian.gif',
      featured: false,
    },
    {
      name: 'The Unarmored Voidborn',
      imageUrl: 'https://static.tibia.com/images/library/voidbornvulnerable.gif',
      featured: false,
    },
    {
      name: 'The Unwelcome',
      imageUrl: 'https://static.tibia.com/images/library/theunwelcome.gif',
      featured: false,
    },
    {
      name: 'The Winter Bloom',
      imageUrl: 'https://static.tibia.com/images/library/winterbloom.gif',
      featured: false,
    },
    {
      name: 'Timira The Many-Headed',
      imageUrl: 'https://static.tibia.com/images/library/timira.gif',
      featured: false,
    },
    {
      name: 'Tropical Desolator',
      imageUrl: 'https://static.tibia.com/images/library/tropicaldesolator.gif',
      featured: false,
    },
    {
      name: 'Unaz The Mean',
      imageUrl: 'https://static.tibia.com/images/library/unaz.gif',
      featured: false,
    },
    {
      name: 'Urmahlullu The Weakened',
      imageUrl: 'https://static.tibia.com/images/library/urmahlulluweakest.gif',
      featured: false,
    },
    {
      name: 'Utua Stone Sting',
      imageUrl: 'https://static.tibia.com/images/library/utua.gif',
      featured: false,
    },
    {
      name: 'Vemiath',
      imageUrl: 'https://static.tibia.com/images/library/vemiath.gif',
      featured: false,
    },
    {
      name: 'Vladrukh',
      imageUrl: 'https://static.tibia.com/images/library/vladrukh.gif',
      featured: false,
    },
    {
      name: 'Vok The Freakish',
      imageUrl: 'https://static.tibia.com/images/library/vok.gif',
      featured: false,
    },
    {
      name: 'Wrathful Archivist',
      imageUrl: 'https://static.tibia.com/images/library/wrathfularchivist.gif',
      featured: false,
    },
    {
      name: 'Yirkas Blue Scales',
      imageUrl: 'https://static.tibia.com/images/library/yirkass.gif',
      featured: false,
    },
    {
      name: 'Zamulosh',
      imageUrl: 'https://static.tibia.com/images/library/zamulosh.gif',
      featured: false,
    },
  ],
};
