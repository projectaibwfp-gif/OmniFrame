import type { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./login/login.component').then(({ LoginComponent }) => LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        ({ DashboardComponent }) => DashboardComponent,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./profile/profile.component').then(({ ProfileComponent }) => ProfileComponent),
  },
  {
    path: 'about',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./about/about.component').then(({ AboutComponent }) => AboutComponent),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./users/users.component').then(({ UsersComponent }) => UsersComponent),
  },
  {
    path: 'news',
    canActivate: [authGuard],
    loadComponent: () => import('./news/news.component').then(({ NewsComponent }) => NewsComponent),
  },
  {
    path: 'boosted',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./boostable-bosses/boostable-bosses.component').then(
        ({ BoostableBossesComponent }) => BoostableBossesComponent,
      ),
  },
  {
    path: 'boosted/:kind/:name',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./boostable-bosses/boostable-bosses-detail.component').then(
        ({ BoostableBossesDetailComponent }) => BoostableBossesDetailComponent,
      ),
  },
  {
    path: 'boostable-bosses',
    redirectTo: 'boosted',
    pathMatch: 'full',
  },
  {
    path: 'character',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tibia-character/tibia-character.component').then(
        ({ TibiaCharacterComponent }) => TibiaCharacterComponent,
      ),
  },
  {
    path: 'highscores-snapshots',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./highscores-snapshots/highscores-snapshots.component').then(
        ({ HighscoresSnapshotsComponent }) => HighscoresSnapshotsComponent,
      ),
  },
  {
    path: 'killstatistics',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tibia-killstatistics/tibia-killstatistics.component').then(
        ({ TibiaKillStatisticsComponent }) => TibiaKillStatisticsComponent,
      ),
  },
  {
    path: 'worlds',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tibia-worlds/tibia-worlds.component').then(
        ({ TibiaWorldsComponent }) => TibiaWorldsComponent,
      ),
  },
  {
    path: 'world/:name',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tibia-worlds/tibia-world-detail.component').then(
        ({ TibiaWorldDetailComponent }) => TibiaWorldDetailComponent,
      ),
  },
  {
    path: 'spells',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tibia-spells/tibia-spells.component').then(
        ({ TibiaSpellsComponent }) => TibiaSpellsComponent,
      ),
  },
  {
    path: 'spell/:spellId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tibia-spells/tibia-spell-detail.component').then(
        ({ TibiaSpellDetailComponent }) => TibiaSpellDetailComponent,
      ),
  },
  {
    path: 'houses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tibia-houses/tibia-houses.component').then(
        ({ TibiaHousesComponent }) => TibiaHousesComponent,
      ),
  },
  {
    path: 'house/:world/:houseId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tibia-houses/tibia-house-detail.component').then(
        ({ TibiaHouseDetailComponent }) => TibiaHouseDetailComponent,
      ),
  },
  {
    path: 'fansites',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tibia-fansites/tibia-fansites.component').then(
        ({ TibiaFansitesComponent }) => TibiaFansitesComponent,
      ),
  },
  {
    path: 'guild/:name',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tibia-guild/tibia-guild.component').then(
        ({ TibiaGuildComponent }) => TibiaGuildComponent,
      ),
  },
  {
    path: 'hunting-places',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./hunting-places/hunting-places.component').then(
        ({ HuntingPlacesComponent }) => HuntingPlacesComponent,
      ),
  },
  {
    path: 'hunting-places/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./hunting-places/hunting-places-detail.component').then(
        ({ HuntingPlacesDetailComponent }) => HuntingPlacesDetailComponent,
      ),
  },
  {
    path: 'charm-places',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./charm-places/charm-places.component').then(
        ({ CharmPlacesComponent }) => CharmPlacesComponent,
      ),
  },
  {
    path: 'charm-places/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./charm-places/charm-places-detail.component').then(
        ({ CharmPlacesDetailComponent }) => CharmPlacesDetailComponent,
      ),
  },
  {
    path: 'quests',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./quests/quests.component').then(({ QuestsComponent }) => QuestsComponent),
  },
  {
    path: 'loot',
    canActivate: [authGuard],
    loadComponent: () => import('./loot/loot.component').then(({ LootComponent }) => LootComponent),
  },
  {
    path: 'creature/:slug',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tibia/creature-detail.component').then(
        ({ CreatureDetailComponent }) => CreatureDetailComponent,
      ),
  },
  {
    path: 'quests/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./quests/quest-detail.component').then(
        ({ QuestDetailComponent }) => QuestDetailComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
