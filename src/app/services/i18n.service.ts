import { Injectable, isDevMode, signal } from '@angular/core';
import { TRANSLATIONS, LOCALES, type Locale, type TranslationMap } from '../i18n/translations';
import { readStorage, writeStorage } from '../utils/storage';

const STORAGE_SUFFIX = 'locale';
const LEGACY_KEY = 'epub-i18n-locale';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly locale = signal<Locale>(this.initLocale());
  readonly locales = LOCALES;

  private initLocale(): Locale {
    const stored = readStorage(STORAGE_SUFFIX, LEGACY_KEY) as Locale | null;
    return stored && LOCALES.some(l => l.code === stored) ? stored : 'en';
  }

  setLocale(locale: Locale): void {
    this.locale.set(locale);
    writeStorage(STORAGE_SUFFIX, locale);
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
