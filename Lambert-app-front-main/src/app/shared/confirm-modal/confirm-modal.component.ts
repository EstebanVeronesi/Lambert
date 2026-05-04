import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-icon">⚠️</div>
          <h3 class="modal-title">{{ title }}</h3>
          <p class="modal-message">{{ message }}</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="close()">Cancelar</button>
            <button class="btn btn-danger" (click)="confirm()">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-dialog {
      background: #fff;
      border-radius: 12px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      animation: slideUp 0.2s ease-out;
    }

    .modal-icon { font-size: 3rem; margin-bottom: 1rem; }
    .modal-title { font-size: 1.25rem; font-weight: 600; color: #262626; margin-bottom: 0.5rem; }
    .modal-message { color: #6b7280; font-size: 0.9375rem; margin-bottom: 1.5rem; }
    .modal-actions { display: flex; gap: 0.75rem; justify-content: center; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class ConfirmModalComponent {
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Estás seguro?';
  @Input() confirmText = 'Eliminar';
  @Output() confirmed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  visible = false;

  open() { this.visible = true; }
  close() { this.visible = false; this.closed.emit(); }
  confirm() { this.visible = false; this.confirmed.emit(); }
}