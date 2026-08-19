import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-products-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-edit.component.html',
  styleUrl: './products-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
}
