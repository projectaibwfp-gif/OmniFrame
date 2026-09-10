import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title, Meta } from '@angular/platform-browser';
import { APP_BASE_URL, APP_DISPLAY_NAME } from '@shared/runtime-config';

interface SeoRouteDefinition {
  title: string;
  description: string;
  robots?: string;
  schemaType?: 'WebSite' | 'CollectionPage' | 'WebPage' | 'Dataset';
}

const DEFAULT_SEO: SeoRouteDefinition = {
  title: `${APP_DISPLAY_NAME} - Tibia tools, loot, quests, hunting places and character data`,
  description: `${APP_DISPLAY_NAME} aggregates Tibia tools, loot, quests, hunting places, boosted data, news and character lookup in one searchable source.`,
  robots: 'index,follow',
  schemaType: 'WebSite',
};

const PRIVATE_ROBOTS = 'noindex,nofollow';

const SEO_BY_ROUTE: Record<string, SeoRouteDefinition> = {
  '/': {
    title: `${APP_DISPLAY_NAME} Dashboard - Tibia tools and game data`,
    description: `Browse Tibia tools, boosted data, loot, quests, hunting places, kill statistics and character lookup from one ${APP_DISPLAY_NAME} dashboard.`,
    schemaType: 'WebSite',
  },
  '/about': {
    title: `About ${APP_DISPLAY_NAME} - Tibia data hub`,
    description: `Learn what ${APP_DISPLAY_NAME} contains: Tibia loot, quests, boosted creatures, hunting places, kill statistics and character tools.`,
    schemaType: 'WebPage',
  },
  '/news': {
    title: 'Tibia news - latest official updates',
    description: `Read the latest Tibia news with searchable categories and structured update lists in ${APP_DISPLAY_NAME}.`,
    schemaType: 'CollectionPage',
  },
  '/boosted': {
    title: 'Boosted bosses and creatures - Tibia daily rotation',
    description:
      'Check currently boosted Tibia bosses and creatures, plus reference lists and detail views in one place.',
    schemaType: 'Dataset',
  },
  '/character': {
    title: 'Tibia character lookup - profile, highscores and history',
    description:
      'Look up Tibia characters, their highscores history, experience details and account-related character data.',
    schemaType: 'Dataset',
  },
  '/hunting-places': {
    title: 'Tibia hunting places - searchable XP and profit spots',
    description:
      'Find Tibia hunting places by level, vocation, weapon type and access, with searchable profit and experience guidance.',
    schemaType: 'Dataset',
  },
  '/charm-places': {
    title: 'Tibia charm places - searchable bestiary spots',
    description:
      'Browse Tibia charm places with filters, bestiary targets and practical farming locations.',
    schemaType: 'Dataset',
  },
  '/quests': {
    title: 'Tibia quests - searchable quest database',
    description:
      'Search Tibia quests by category, city and level requirements, with structured quest details and spoilers.',
    schemaType: 'Dataset',
  },
  '/loot': {
    title: 'Tibia loot - item categories, search and market value',
    description:
      'Browse categorized Tibia loot items with search, filters, sources and estimated market value.',
    schemaType: 'Dataset',
  },
  '/highscores-snapshots': {
    title: 'Tibia highscores snapshots - searchable database',
    description:
      'Explore Tibia highscores snapshots by world with structured records and sortable database-style listings.',
    schemaType: 'Dataset',
  },
  '/killstatistics': {
    title: 'Tibia kill statistics - world creature and boss data',
    description:
      'Analyze Tibia kill statistics by world with structured creature and boss kill data.',
    schemaType: 'Dataset',
  },
  '/worlds': {
    title: 'Tibia worlds - regular and tournament world list',
    description:
      'Explore every regular and tournament Tibia world with status, players online and record data.',
    schemaType: 'Dataset',
  },
  '/spells': {
    title: 'Tibia spells and runes - searchable list',
    description:
      'Browse the full Tibia spell and rune list with level, mana, price and premium requirements.',
    schemaType: 'Dataset',
  },
  '/houses': {
    title: 'Tibia houses and guildhalls - town listings',
    description:
      'Find Tibia houses and guildhalls by world and town with rent, size and availability status.',
    schemaType: 'Dataset',
  },
  '/fansites': {
    title: 'Tibia fansites - promoted and supported communities',
    description:
      'Discover official Tibia fansites promoted and supported by CipSoft, with languages and specials.',
    schemaType: 'CollectionPage',
  },
  '/login': {
    title: `Login - ${APP_DISPLAY_NAME}`,
    description: `Sign in to ${APP_DISPLAY_NAME}.`,
    robots: PRIVATE_ROBOTS,
    schemaType: 'WebPage',
  },
  '/profile': {
    title: `Profile - ${APP_DISPLAY_NAME}`,
    description: `Manage your ${APP_DISPLAY_NAME} profile and linked Tibia main character.`,
    robots: PRIVATE_ROBOTS,
    schemaType: 'WebPage',
  },
  '/users': {
    title: `Users - ${APP_DISPLAY_NAME}`,
    description: `User list available inside ${APP_DISPLAY_NAME} after authentication.`,
    robots: PRIVATE_ROBOTS,
    schemaType: 'WebPage',
  },
};

interface SeoPrefixDefinition {
  prefix: string;
  seo: SeoRouteDefinition;
}

const SEO_BY_ROUTE_PREFIX: readonly SeoPrefixDefinition[] = [
  {
    prefix: '/boosted/',
    seo: {
      title: `Tibia boosted target details - ${APP_DISPLAY_NAME}`,
      description:
        'Detailed Tibia boosted boss or creature reference with loot, resistances, access and practical notes.',
      schemaType: 'Dataset',
    },
  },
  {
    prefix: '/quests/',
    seo: {
      title: `Tibia quest details - ${APP_DISPLAY_NAME}`,
      description:
        'Structured Tibia quest details with requirements, category and walkthrough context.',
      schemaType: 'Dataset',
    },
  },
  {
    prefix: '/hunting-places/',
    seo: {
      title: `Tibia hunting place details - ${APP_DISPLAY_NAME}`,
      description:
        'Detailed Tibia hunting place reference with level range, profit and tactical notes.',
      schemaType: 'Dataset',
    },
  },
  {
    prefix: '/charm-places/',
    seo: {
      title: `Tibia charm place details - ${APP_DISPLAY_NAME}`,
      description:
        'Detailed Tibia charm place reference with monsters, route and bestiary farming context.',
      schemaType: 'Dataset',
    },
  },
  {
    prefix: '/creature/',
    seo: {
      title: `Tibia creature details - ${APP_DISPLAY_NAME}`,
      description:
        'Unified Tibia creature reference with stats, resistances, loot drops and hunting places.',
      schemaType: 'Dataset',
    },
  },
  {
    prefix: '/world/',
    seo: {
      title: `Tibia world details - ${APP_DISPLAY_NAME}`,
      description:
        'Detailed Tibia world information with status, PvP type, transfer rules and players online.',
      schemaType: 'Dataset',
    },
  },
  {
    prefix: '/spell/',
    seo: {
      title: `Tibia spell details - ${APP_DISPLAY_NAME}`,
      description:
        'Detailed Tibia spell information with level, mana, price, formula and available vocations.',
      schemaType: 'Dataset',
    },
  },
  {
    prefix: '/house/',
    seo: {
      title: `Tibia house details - ${APP_DISPLAY_NAME}`,
      description:
        'Detailed Tibia house and guildhall information with size, beds, rent and ownership status.',
      schemaType: 'Dataset',
    },
  },
  {
    prefix: '/guild/',
    seo: {
      title: `Tibia guild details - ${APP_DISPLAY_NAME}`,
      description:
        'Detailed Tibia guild information with founding date, members, ranks and guildhalls.',
      schemaType: 'Dataset',
    },
  },
];

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  initialize(): void {
    this.applyForCurrentRoute();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.applyForCurrentRoute());
  }

  private applyForCurrentRoute(): void {
    const path = this.router.url.split('?')[0] || '/';
    const seo = this.resolveSeo(path);
    const canonicalUrl = this.buildCanonicalUrl(path);

    this.title.setTitle(seo.title);
    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.updateTag({
      name: 'robots',
      content: seo.robots ?? DEFAULT_SEO.robots ?? 'index,follow',
    });
    this.meta.updateTag({ property: 'og:title', content: seo.title });
    this.meta.updateTag({ property: 'og:description', content: seo.description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: seo.title });
    this.meta.updateTag({ name: 'twitter:description', content: seo.description });

    this.upsertCanonicalLink(canonicalUrl);
    this.upsertStructuredData(seo, canonicalUrl);
    this.document.documentElement.lang = path === '/' ? 'en' : this.document.documentElement.lang;
  }

  private resolveSeo(path: string): SeoRouteDefinition {
    const exactMatch = SEO_BY_ROUTE[path];
    if (exactMatch) {
      return exactMatch;
    }

    const prefixMatch = SEO_BY_ROUTE_PREFIX.find(({ prefix }) => path.startsWith(prefix));
    return prefixMatch?.seo ?? DEFAULT_SEO;
  }

  private buildCanonicalUrl(path: string): string {
    const origin = this.document.location?.origin ?? APP_BASE_URL;
    return `${origin}${path}`;
  }

  private upsertCanonicalLink(href: string): void {
    const head = this.document.head;
    let link = head.querySelector('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }

    link.setAttribute('href', href);
  }

  private upsertStructuredData(seo: SeoRouteDefinition, canonicalUrl: string): void {
    const head = this.document.head;
    const elementId = 'omniframe-structured-data';
    let script = this.document.getElementById(elementId) as HTMLScriptElement | null;

    if (!script) {
      script = this.document.createElement('script');
      script.id = elementId;
      script.type = 'application/ld+json';
      head.appendChild(script);
    }

    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': seo.schemaType ?? 'WebPage',
      name: seo.title,
      description: seo.description,
      url: canonicalUrl,
      inLanguage: this.document.documentElement.lang || 'en',
      isAccessibleForFree: true,
      publisher: {
        '@type': 'Organization',
        name: APP_DISPLAY_NAME,
      },
    });
  }
}
