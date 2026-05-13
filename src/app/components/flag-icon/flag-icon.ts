import { Component, input } from '@angular/core';

@Component({
  selector: 'app-flag-icon',
  standalone: true,
  imports: [],
  template: `
    @switch (locale()) {

      @case ('en') {
        <!-- United Kingdom -->
        <svg viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="20" height="14" fill="#012169"/>
          <line x1="0" y1="0" x2="20" y2="14" stroke="#fff" stroke-width="5"/>
          <line x1="20" y1="0" x2="0" y2="14" stroke="#fff" stroke-width="5"/>
          <line x1="0" y1="0" x2="20" y2="14" stroke="#C8102E" stroke-width="2.5"/>
          <line x1="20" y1="0" x2="0" y2="14" stroke="#C8102E" stroke-width="2.5"/>
          <rect x="0" y="4.8" width="20" height="4.4" fill="#fff"/>
          <rect x="7.8" y="0" width="4.4" height="14" fill="#fff"/>
          <rect x="0" y="5.8" width="20" height="2.4" fill="#C8102E"/>
          <rect x="8.8" y="0" width="2.4" height="14" fill="#C8102E"/>
          <rect width="20" height="14" fill="none" stroke="rgba(0,0,0,.15)" stroke-width=".5"/>
        </svg>
      }

      @case ('de') {
        <!-- Germany -->
        <svg viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="20" height="4.67" fill="#000"/>
          <rect y="4.67" width="20" height="4.67" fill="#DD0000"/>
          <rect y="9.34" width="20" height="4.66" fill="#FFCE00"/>
          <rect width="20" height="14" fill="none" stroke="rgba(0,0,0,.15)" stroke-width=".5"/>
        </svg>
      }

      @case ('de-styr') {
        <!-- Austria (Styria) -->
        <svg viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="20" height="4.67" fill="#ED2939"/>
          <rect y="4.67" width="20" height="4.67" fill="#fff"/>
          <rect y="9.34" width="20" height="4.66" fill="#ED2939"/>
          <rect width="20" height="14" fill="none" stroke="rgba(0,0,0,.15)" stroke-width=".5"/>
        </svg>
      }

      @case ('es') {
        <!-- Spain -->
        <svg viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="20" height="3.5" fill="#AA151B"/>
          <rect y="3.5" width="20" height="7" fill="#F1BF00"/>
          <rect y="10.5" width="20" height="3.5" fill="#AA151B"/>
          <rect width="20" height="14" fill="none" stroke="rgba(0,0,0,.15)" stroke-width=".5"/>
        </svg>
      }

      @case ('da') {
        <!-- Denmark -->
        <svg viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="20" height="14" fill="#C60C30"/>
          <rect x="0" y="5.5" width="20" height="3" fill="#fff"/>
          <rect x="6.5" y="0" width="3" height="14" fill="#fff"/>
          <rect width="20" height="14" fill="none" stroke="rgba(0,0,0,.15)" stroke-width=".5"/>
        </svg>
      }

      @case ('ja') {
        <!-- Japan -->
        <svg viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="20" height="14" fill="#fff"/>
          <circle cx="10" cy="7" r="4.2" fill="#BC002D"/>
          <rect width="20" height="14" fill="none" stroke="rgba(0,0,0,.15)" stroke-width=".5"/>
        </svg>
      }

      @case ('zh-TW') {
        <!-- Taiwan -->
        <svg viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="20" height="14" fill="#FE0000"/>
          <rect width="10" height="7" fill="#000095"/>
          <circle cx="5" cy="3.5" r="2.4" fill="#fff"/>
          <circle cx="5" cy="3.5" r="1.4" fill="#000095"/>
          <!-- 12-point sun rays simplified as lines -->
          <g stroke="#fff" stroke-width=".7" stroke-linecap="round">
            <line x1="5" y1="0.6" x2="5" y2="1.6"/>
            <line x1="5" y1="5.4" x2="5" y2="6.4"/>
            <line x1="2.1" y1="3.5" x2="3.1" y2="3.5"/>
            <line x1="6.9" y1="3.5" x2="7.9" y2="3.5"/>
            <line x1="2.9" y1="1.3" x2="3.6" y2="2"/>
            <line x1="6.4" y1="5" x2="7.1" y2="5.7"/>
            <line x1="7.1" y1="1.3" x2="6.4" y2="2"/>
            <line x1="3.6" y1="5" x2="2.9" y2="5.7"/>
          </g>
          <rect width="20" height="14" fill="none" stroke="rgba(0,0,0,.15)" stroke-width=".5"/>
        </svg>
      }

      @default {
        <svg viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="20" height="14" fill="#1e3a6e"/>
          <rect width="20" height="14" fill="none" stroke="rgba(0,0,0,.15)" stroke-width=".5"/>
        </svg>
      }
    }
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; flex-shrink: 0; }
    svg { width: 20px; height: 14px; border-radius: 2px; display: block; }
  `],
})
export class FlagIcon {
  readonly locale = input.required<string>();
}
