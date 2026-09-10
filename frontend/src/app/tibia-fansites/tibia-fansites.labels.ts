export interface FansitesLabels {
  eyebrow: string;
  title: string;
  intro: string;
  promotedTitle: string;
  supportedTitle: string;
  homepage: string;
  languages: string;
  fansiteItem: string;
  specials: string;
  empty: string;
  loading: string;
  retry: string;
  error: string;
}

// eslint-disable-next-line complexity
export function buildFansitesLabels(isPl: boolean): FansitesLabels {
  return {
    eyebrow: 'Tibia',
    title: isPl ? "Fansite'y" : 'Fansites',
    intro: isPl
      ? "Oficjalne fansite'y Tibii promowane i wspierane przez CipSoft."
      : 'Official Tibia fansites promoted and supported by CipSoft.',
    promotedTitle: isPl ? 'Promowane' : 'Promoted',
    supportedTitle: isPl ? 'Wspierane' : 'Supported',
    homepage: isPl ? 'Strona główna' : 'Homepage',
    languages: isPl ? 'Języki' : 'Languages',
    fansiteItem: isPl ? 'Fansite item' : 'Fansite item',
    specials: isPl ? 'Specjały' : 'Specials',
    empty: isPl ? "Brak fansite'ów na liście." : 'No fansites in this list.',
    loading: isPl ? "Ładowanie fansite'ów..." : 'Loading fansites...',
    retry: isPl ? 'Spróbuj ponownie' : 'Retry',
    error: isPl ? "Nie udało się pobrać listy fansite'ów." : 'Could not load the fansites list.',
  };
}
