import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-products-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-details.component.html',
  styleUrl: './products-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
}
