export interface HousesLabels {
  eyebrow: string;
  title: string;
  intro: string;
  worldLabel: string;
  worldPlaceholder: string;
  townLabel: string;
  townPlaceholder: string;
  searchAction: string;
  noSelection: string;
  housesTitle: string;
  guildhallsTitle: string;
  houseColumn: string;
  sizeColumn: string;
  bedsColumn: string;
  rentColumn: string;
  statusColumn: string;
  rented: string;
  auctioned: string;
  free: string;
  empty: string;
  loading: string;
  retry: string;
  error: string;
  worldsError: string;
}

// eslint-disable-next-line complexity
export function buildHousesLabels(isPl: boolean): HousesLabels {
  return {
    eyebrow: 'Tibia',
    title: isPl ? 'Domy' : 'Houses',
    intro: isPl
      ? 'Zobacz domy i guildhalle w wybranym mieście świata Tibia.'
      : 'Browse houses and guildhalls in a Tibia world town.',
    worldLabel: isPl ? 'Świat' : 'World',
    worldPlaceholder: isPl ? 'Wybierz świat' : 'Select world',
    townLabel: isPl ? 'Miasto' : 'Town',
    townPlaceholder: isPl ? 'np. Thais' : 'e.g. Thais',
    searchAction: isPl ? 'Pokaż' : 'Show',
    noSelection: isPl
      ? 'Wybierz świat i miasto, aby zobaczyć domy.'
      : 'Select a world and town to see houses.',
    housesTitle: isPl ? 'Domy' : 'Houses',
    guildhallsTitle: isPl ? 'Guildhalle' : 'Guildhalls',
    houseColumn: isPl ? 'Nazwa' : 'Name',
    sizeColumn: isPl ? 'Rozmiar' : 'Size',
    bedsColumn: isPl ? 'Łóżka' : 'Beds',
    rentColumn: isPl ? 'Czynsz' : 'Rent',
    statusColumn: isPl ? 'Status' : 'Status',
    rented: isPl ? 'Wynajęty' : 'Rented',
    auctioned: isPl ? 'Licytowany' : 'Auctioned',
    free: isPl ? 'Wolny' : 'Free',
    empty: isPl ? 'Brak domów w tym mieście.' : 'No houses in this town.',
    loading: isPl ? 'Ładowanie domów...' : 'Loading houses...',
    retry: isPl ? 'Spróbuj ponownie' : 'Retry',
    error: isPl ? 'Nie udało się pobrać listy domów.' : 'Could not load the houses list.',
    worldsError: isPl ? 'Nie udało się pobrać listy światów.' : 'Could not load the worlds list.',
  };
}
