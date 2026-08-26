import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizationService } from '../services/localization.service';
import { QUESTS, type Quest } from './quests.data';

interface DetailLabels {
  back: string;
  notFound: string;
  notFoundAction: string;
  city: string;
  minLevel: string;
  category: string;
  description: string;
  spoiler: string;
  showSpoiler: string;
  hideSpoiler: string;
  rewards: string;
  main: string;
  side: string;
  daily: string;
  access: string;
}

function categoryClass(category: Quest['category']): string {
  const map: Record<Quest['category'], string> = {
    main: 'category-main',
    side: 'category-side',
    daily: 'category-daily',
    access: 'category-access',
  };
  return map[category];
}

@Component({
  selector: 'app-quest-detail',
  imports: [RouterLink],
  templateUrl: './quest-detail.component.html',
  styleUrl: './quest-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestDetailComponent {
  readonly id = input.required<string>();

  protected readonly quest = computed<Quest | undefined>(() =>
    QUESTS.find((q) => q.id === this.id()),
  );

  protected readonly spoilerVisible = signal(false);

  // eslint-disable-next-line complexity
  protected readonly labels = computed<DetailLabels>(() => {
    const isPl = this.localizationService.currentLocale() === 'pl';
    return {
      back: isPl ? '← Wróć do listy' : '← Back to list',
      notFound: isPl ? 'Nie znaleziono questa' : 'Quest not found',
      notFoundAction: isPl ? 'Wróć do listy' : 'Back to list',
      city: isPl ? 'Miasto' : 'City',
      minLevel: isPl ? 'Min. poziom' : 'Min level',
      category: isPl ? 'Kategoria' : 'Category',
      description: isPl ? 'Opis' : 'Description',
      spoiler: isPl ? 'Spoiler' : 'Spoiler',
      showSpoiler: isPl ? 'Pokaż spoiler' : 'Show spoiler',
      hideSpoiler: isPl ? 'Ukryj spoiler' : 'Hide spoiler',
      rewards: isPl ? 'Nagrody' : 'Rewards',
      main: isPl ? 'Główny' : 'Main',
      side: isPl ? 'Poboczny' : 'Side',
      daily: isPl ? 'Dzienny' : 'Daily',
      access: isPl ? 'Dostęp' : 'Access',
    };
  });

  private readonly localizationService = inject(LocalizationService);

  protected getCategoryLabel(category: Quest['category']): string {
    return this.labels()[category];
  }

  protected getCategoryClass(category: Quest['category']): string {
    return categoryClass(category);
  }

  protected toggleSpoiler(): void {
    this.spoilerVisible.update((value) => !value);
  }
}
