import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [class]="toast.type">
          <span>{{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️' }}</span>
          <span class="toast-msg">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; max-width: 380px; }
    .toast-item { display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 10px; font-size: 0.875rem; font-weight: 500; animation: slideIn 0.3s ease; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    .toast-item.success { background: #e8f5ee; color: #0f7a38; border-left: 4px solid #159947; }
    .toast-item.error { background: #fdecea; color: #da251d; border-left: 4px solid #da251d; }
    .toast-item.warning { background: #fff8e1; color: #5a4200; border-left: 4px solid #f59e0b; }
    .toast-item.info { background: #e8f0fe; color: #0c5460; border-left: 4px solid #17a2b8; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .toast-msg { flex: 1; line-height: 1.4; }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
