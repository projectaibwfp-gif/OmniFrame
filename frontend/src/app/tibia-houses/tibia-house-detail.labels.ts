export interface HouseDetailLabels {
  back: string;
  world: string;
  town: string;
  type: string;
  size: string;
  beds: string;
  rent: string;
  statusTitle: string;
  rented: string;
  auctioned: string;
  free: string;
  owner: string;
  paidUntil: string;
  currentBid: string;
  biddingEnd: string;
  moving: string;
  loading: string;
  retry: string;
  error: string;
  noStatus: string;
}

// eslint-disable-next-line complexity
export function buildHouseDetailLabels(isPl: boolean): HouseDetailLabels {
  return {
    back: isPl ? '← Wróć do domów' : '← Back to houses',
    world: isPl ? 'Świat' : 'World',
    town: isPl ? 'Miasto' : 'Town',
    type: isPl ? 'Typ' : 'Type',
    size: isPl ? 'Rozmiar' : 'Size',
    beds: isPl ? 'Łóżka' : 'Beds',
    rent: isPl ? 'Czynsz' : 'Rent',
    statusTitle: isPl ? 'Status' : 'Status',
    rented: isPl ? 'Wynajęty' : 'Rented',
    auctioned: isPl ? 'Licytowany' : 'Auctioned',
    free: isPl ? 'Wolny' : 'Free',
    owner: isPl ? 'Właściciel' : 'Owner',
    paidUntil: isPl ? 'Opłacone do' : 'Paid until',
    currentBid: isPl ? 'Aktualna oferta' : 'Current bid',
    biddingEnd: isPl ? 'Koniec licytacji' : 'Auction ends',
    moving: isPl ? 'W trakcie przeprowadzki' : 'Moving out',
    loading: isPl ? 'Ładowanie domu...' : 'Loading house...',
    retry: isPl ? 'Spróbuj ponownie' : 'Retry',
    error: isPl ? 'Nie udało się pobrać danych domu.' : 'Could not load the house details.',
    noStatus: isPl ? 'Brak szczegółów statusu.' : 'No status details available.',
  };
}
