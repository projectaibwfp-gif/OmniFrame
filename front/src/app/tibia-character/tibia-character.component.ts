import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import type {
  TibiaCharacterExperienceDto,
  TibiaCharacterLookupDto,
} from '@shared/api-contract';
import { TibiaCharacterService } from './tibia-character.service';

@Component({
  selector: 'app-tibia-character',
  imports: [FormsModule],
  templateUrl: './tibia-character.component.html',
  styleUrl: './tibia-character.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TibiaCharacterComponent {
  protected readonly characterName = signal('');
  protected readonly lookup = signal<TibiaCharacterLookupDto | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly apiError = signal<string | null>(null);

  protected readonly character = computed(() => this.lookup()?.character ?? null);
  protected readonly history = computed(() => this.lookup()?.history ?? []);
  protected readonly achievements = computed(() => this.character()?.achievements ?? []);
  protected readonly otherCharacters = computed(() => this.character()?.otherCharacters ?? []);
  protected readonly experience = computed(() => this.character()?.experience ?? null);

  private readonly tibiaCharacterService = inject(TibiaCharacterService);

  protected setCharacterName(value: string): void {
    this.characterName.set(value);
  }

  protected getExperienceStatusLabel(experience: TibiaCharacterExperienceDto): string {
    if (experience.status === 'found') {
      return 'Dokładny EXP z highscores';
    }

    if (experience.status === 'outside_top1000') {
      return 'Postać poza top 1000 highscores';
    }

    return 'Nie można potwierdzić EXP per profesja (ograniczenie TibiaData)';
  }

  protected loadCharacter(): void {
    const name = this.characterName().trim();
    if (!name) {
      this.lookup.set(null);
      this.apiError.set('Podaj nazwę postaci.');
      return;
    }

    this.isLoading.set(true);
    this.lookup.set(null);
    this.apiError.set(null);

    this.tibiaCharacterService
      .getCharacter(name)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => this.lookup.set(response),
        error: (error) => {
          if (error?.status === 404) {
            this.apiError.set(`Nie znaleziono postaci "${name}".`);
            return;
          }

          this.apiError.set('Nie udało się pobrać danych postaci. Spróbuj ponownie.');
        },
      });
  }
}
