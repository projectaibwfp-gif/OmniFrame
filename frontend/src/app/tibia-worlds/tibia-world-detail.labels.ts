export interface WorldDetailLabels {
  back: string;
  status: string;
  pvpType: string;
  location: string;
  gameWorldType: string;
  transferType: string;
  premiumOnly: string;
  battleyeProtected: string;
  battleyeDate: string;
  creationDate: string;
  playersOnline: string;
  onlinePlayersTitle: string;
  toggleExpand: string;
  toggleCollapse: string;
  collapsedNote: string;
  noneOnline: string;
  loading: string;
  retry: string;
  error: string;
  worldQuests: string;
  yes: string;
  no: string;
}

// eslint-disable-next-line complexity
export function buildWorldDetailLabels(isPl: boolean): WorldDetailLabels {
  return {
    back: isPl ? '← Wróć do światów' : '← Back to worlds',
    status: isPl ? 'Status' : 'Status',
    pvpType: isPl ? 'Typ PvP' : 'PvP type',
    location: isPl ? 'Lokalizacja' : 'Location',
    gameWorldType: isPl ? 'Typ świata' : 'World type',
    transferType: isPl ? 'Transfer' : 'Transfer',
    premiumOnly: isPl ? 'Premium only' : 'Premium only',
    battleyeProtected: isPl ? 'Ochrona BattlEye' : 'BattlEye protection',
    battleyeDate: isPl ? 'Data BattlEye' : 'BattlEye date',
    creationDate: isPl ? 'Data utworzenia' : 'Creation date',
    playersOnline: isPl ? 'Graczy online' : 'Players online',
    onlinePlayersTitle: isPl ? 'Gracze online' : 'Players online',
    toggleExpand: isPl ? 'Rozwiń listę' : 'Expand list',
    toggleCollapse: isPl ? 'Zwiń listę' : 'Collapse list',
    collapsedNote: isPl ? 'Lista jest zwinięta.' : 'The list is collapsed.',
    noneOnline: isPl ? 'Nikt nie jest online.' : 'Nobody is online right now.',
    loading: isPl ? 'Ładowanie świata...' : 'Loading world...',
    retry: isPl ? 'Spróbuj ponownie' : 'Retry',
    error: isPl ? 'Nie udało się pobrać danych świata.' : 'Could not load the world details.',
    worldQuests: isPl ? 'Misje świata' : 'World quests',
    yes: isPl ? 'Tak' : 'Yes',
    no: isPl ? 'Nie' : 'No',
  };
}
