import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizationService } from '../services/localization.service';
import { QUESTS, type Quest } from './quests.data';
import { questCategoryClass, type QuestCategory } from './quest-category';
import { buildQuestDetailLabels } from './quest-detail.labels';

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
  protected readonly categoryClass = questCategoryClass;

  protected readonly labels = computed(() =>
    buildQuestDetailLabels(this.localizationService.currentLocale() === 'pl'),
  );

  private readonly localizationService = inject(LocalizationService);

  protected getCategoryLabel(category: QuestCategory): string {
    return this.labels()[category];
  }

  protected toggleSpoiler(): void {
    this.spoilerVisible.update((value) => !value);
  }
}
