export interface GuildLabels {
  back: string;
  description: string;
  founded: string;
  world: string;
  active: string;
  inactive: string;
  inWar: string;
  openApplications: string;
  homepage: string;
  membersTotal: string;
  membersOnline: string;
  membersOffline: string;
  membersInvited: string;
  guildhallsTitle: string;
  membersTitle: string;
  invitesTitle: string;
  rankColumn: string;
  nameColumn: string;
  levelColumn: string;
  vocationColumn: string;
  statusColumn: string;
  joinedColumn: string;
  loading: string;
  retry: string;
  error: string;
  empty: string;
  toggleExpand: string;
  toggleCollapse: string;
  listCollapsed: string;
}

// eslint-disable-next-line complexity
export function buildGuildLabels(isPl: boolean): GuildLabels {
  return {
    back: isPl ? '← Wróć do postaci' : '← Back to character',
    description: isPl ? 'Opis' : 'Description',
    founded: isPl ? 'Założona' : 'Founded',
    world: isPl ? 'Świat' : 'World',
    active: isPl ? 'Aktywna' : 'Active',
    inactive: isPl ? 'Nieaktywna' : 'Inactive',
    inWar: isPl ? 'W wojnie' : 'In war',
    openApplications: isPl ? 'Otwarte aplikacje' : 'Open applications',
    homepage: isPl ? 'Strona gildii' : 'Guild homepage',
    membersTotal: isPl ? 'Członków' : 'Members',
    membersOnline: isPl ? 'Online' : 'Online',
    membersOffline: isPl ? 'Offline' : 'Offline',
    membersInvited: isPl ? 'Zaproszonych' : 'Invited',
    guildhallsTitle: isPl ? 'Guildhalle' : 'Guildhalls',
    membersTitle: isPl ? 'Członkowie' : 'Members',
    invitesTitle: isPl ? 'Zaproszenia' : 'Invites',
    rankColumn: isPl ? 'Ranga' : 'Rank',
    nameColumn: isPl ? 'Nazwa' : 'Name',
    levelColumn: isPl ? 'Poziom' : 'Level',
    vocationColumn: isPl ? 'Profesja' : 'Vocation',
    statusColumn: isPl ? 'Status' : 'Status',
    joinedColumn: isPl ? 'Dołączył' : 'Joined',
    loading: isPl ? 'Ładowanie gildii...' : 'Loading guild...',
    retry: isPl ? 'Spróbuj ponownie' : 'Retry',
    error: isPl ? 'Nie udało się pobrać danych gildii.' : 'Could not load the guild details.',
    empty: isPl ? 'Brak danych gildii.' : 'No guild data available.',
    toggleExpand: isPl ? 'Rozwiń listę' : 'Expand list',
    toggleCollapse: isPl ? 'Zwiń listę' : 'Collapse list',
    listCollapsed: isPl ? 'Lista jest domyślnie zwinięta.' : 'The list is collapsed by default.',
  };
}
