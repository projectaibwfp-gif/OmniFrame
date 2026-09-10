export interface WorldsLabels {
  eyebrow: string;
  title: string;
  intro: string;
  playersOnline: string;
  recordLabel: string;
  recordPlayers: string;
  recordDate: string;
  regularTitle: string;
  tournamentTitle: string;
  toggleExpand: string;
  toggleCollapse: string;
  listCollapsed: string;
  nameColumn: string;
  pvpType: string;
  location: string;
  playersOnlineColumn: string;
  transferType: string;
  status: string;
  empty: string;
  loading: string;
  retry: string;
  error: string;
}

// eslint-disable-next-line complexity
export function buildWorldsLabels(isPl: boolean): WorldsLabels {
  return {
    eyebrow: 'Tibia',
    title: isPl ? 'Światy' : 'Worlds',
    intro: isPl
      ? 'Lista wszystkich światów regularnych i turniejowych z TibiaData.'
      : 'Every regular and tournament Tibia world from TibiaData.',
    playersOnline: isPl ? 'Graczy online' : 'Players online',
    recordLabel: isPl ? 'Rekord' : 'Record',
    recordPlayers: isPl ? 'Graczy' : 'Players',
    recordDate: isPl ? 'Data' : 'Date',
    regularTitle: isPl ? 'Światy regularne' : 'Regular worlds',
    tournamentTitle: isPl ? 'Światy turniejowe' : 'Tournament worlds',
    toggleExpand: isPl ? 'Rozwiń listę' : 'Expand list',
    toggleCollapse: isPl ? 'Zwiń listę' : 'Collapse list',
    listCollapsed: isPl ? 'Lista jest domyślnie zwinięta.' : 'The list is collapsed by default.',
    nameColumn: isPl ? 'Nazwa' : 'Name',
    pvpType: isPl ? 'Typ PvP' : 'PvP type',
    location: isPl ? 'Lokalizacja' : 'Location',
    playersOnlineColumn: isPl ? 'Online' : 'Online',
    transferType: isPl ? 'Transfer' : 'Transfer',
    status: isPl ? 'Status' : 'Status',
    empty: isPl ? 'Brak światów na liście.' : 'No worlds in this list.',
    loading: isPl ? 'Ładowanie światów...' : 'Loading worlds...',
    retry: isPl ? 'Spróbuj ponownie' : 'Retry',
    error: isPl ? 'Nie udało się pobrać listy światów.' : 'Could not load the worlds list.',
  };
}
