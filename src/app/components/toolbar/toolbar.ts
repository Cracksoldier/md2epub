import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {
  readonly exportLoading = input(false);

  readonly importClick = output<void>();
  readonly settingsClick = output<void>();
  readonly exportClick = output<void>();
}
