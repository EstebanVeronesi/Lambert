import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb-nav mb-3">
      @for (item of items; track item.label; let last = $last) {
        @if (!last) {
          <a [routerLink]="item.link" class="breadcrumb-link">{{ item.label }}</a>
          <span class="breadcrumb-sep">›</span>
        } @else {
          <span class="breadcrumb-current">{{ item.label }}</span>
        }
      }
    </nav>
  `,
  styles: [`
    .breadcrumb-nav { display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; }
    .breadcrumb-link { color: #6b7280; text-decoration: none; }
    .breadcrumb-link:hover { color: #159947; }
    .breadcrumb-sep { color: #ced4da; margin: 0 4px; }
    .breadcrumb-current { color: #262626; font-weight: 600; }
  `]
})
export class BreadcrumbComponent {
  @Input() items: { label: string; link?: string }[] = [];
}