import { Injectable, isDevMode, signal } from '@angular/core';
import { TRANSLATIONS, LOCALES, type Locale, type TranslationMap } from '../i18n/translations';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly STORAGE_KEY = 'epub-i18n-locale';

  readonly locale = signal<Locale>(this.initLocale());
  readonly locales = LOCALES;

  private initLocale(): Locale {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Locale;
    return LOCALES.some(l => l.code === stored) ? stored : 'en';
  }

  setLocale(locale: Locale): void {
    this.locale.set(locale);
    localStorage.setItem(this.STORAGE_KEY, locale);
  }

  t(key: string, ...args: string[]): string {
    const map = TRANSLATIONS[this.locale()];
    const parts = key.split('.');
    let value: unknown = map as unknown;
    for (const part of parts) {
      value = (value as Record<string, unknown>)?.[part];
    }

    if (typeof value !== 'string') {
      let fallback: unknown = TRANSLATIONS['en'] as unknown;
      for (const part of parts) {
        fallback = (fallback as Record<string, unknown>)?.[part];
      }
      value = typeof fallback === 'string' ? fallback : key;
    }

    const str = value as string;
    if (!args.length) return str;
    return str.replace(/\{(\d+)\}/g, (_, i) => {
      const arg = args[+i];
      if (arg === undefined && isDevMode()) {
        console.warn(`[i18n] Missing argument {${i}} for key "${key}" (locale "${this.locale()}")`);
        return '';
      }
      return arg ?? '';
    });
  }
}
