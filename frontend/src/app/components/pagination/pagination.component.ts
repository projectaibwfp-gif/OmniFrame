import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly startIndex = input.required<number>();
  readonly endIndex = input.required<number>();
  readonly total = input.required<number>();
  readonly previousLabel = input.required<string>();
  readonly nextLabel = input.required<string>();
  readonly ariaLabel = input('Stronicowanie');
  readonly pageChange = output<number>();

  protected readonly isFirstPage = computed(() => this.page() <= 1);
  protected readonly isLastPage = computed(() => this.page() >= this.totalPages());
  protected readonly hasMultiplePages = computed(() => this.totalPages() > 1);

  protected goToPreviousPage(): void {
    this.pageChange.emit(this.page() - 1);
  }

  protected goToNextPage(): void {
    this.pageChange.emit(this.page() + 1);
  }
}
