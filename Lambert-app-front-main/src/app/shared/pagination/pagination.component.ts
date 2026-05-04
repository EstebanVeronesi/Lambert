import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalPages > 1) {
      <nav class="pagination-nav mt-4">
        <button 
          class="btn btn-sm btn-secondary" 
          [disabled]="page === 1"
          (click)="onPageChange(page - 1)">
          ‹ Anterior
        </button>
        
        <span class="pagination-info">
          Página {{ page }} de {{ totalPages }}
        </span>
        
        <button 
          class="btn btn-sm btn-secondary" 
          [disabled]="page === totalPages"
          (click)="onPageChange(page + 1)">
          Siguiente ›
        </button>
      </nav>
    }
  `,
  styles: [`
    .pagination-nav { display: flex; align-items: center; justify-content: center; gap: 1rem; }
    .pagination-info { font-size: 0.875rem; color: #6b7280; }
  `]
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  onPageChange(newPage: number): void {
    this.pageChange.emit(newPage);
  }
}