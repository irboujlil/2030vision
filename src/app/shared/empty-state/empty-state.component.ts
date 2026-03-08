import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="flex flex-col items-center justify-center h-full py-16 text-center">
      <div class="text-3xl mb-3 opacity-40">{{ icon }}</div>
      <p class="text-silver/50 text-sm">{{ message }}</p>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = '←';
  @Input() message = 'Select an item to continue';
}
