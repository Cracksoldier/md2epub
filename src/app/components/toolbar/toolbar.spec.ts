import { TestBed } from '@angular/core/testing';
import { Toolbar } from './toolbar';
import { I18nService } from '../../services/i18n.service';

describe('Toolbar', () => {
  let component: Toolbar;
  let i18n: I18nService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Toolbar],
    }).compileComponents();

    const fixture = TestBed.createComponent(Toolbar);
    component = fixture.componentInstance;
    i18n = TestBed.inject(I18nService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('localeOpen starts as false', () => {
    expect(component.localeOpen()).toBe(false);
  });

  it('toggleLocale() opens the dropdown', () => {
    component.toggleLocale(new MouseEvent('click'));
    expect(component.localeOpen()).toBe(true);
  });

  it('toggleLocale() closes the dropdown when already open', () => {
    component.toggleLocale(new MouseEvent('click'));
    component.toggleLocale(new MouseEvent('click'));
    expect(component.localeOpen()).toBe(false);
  });

  it('selectLocale() calls i18n.setLocale with the given code', () => {
    component.selectLocale('de');
    expect(i18n.locale()).toBe('de');
  });

  it('selectLocale() closes the dropdown', () => {
    component.localeOpen.set(true);
    component.selectLocale('es');
    expect(component.localeOpen()).toBe(false);
  });

  it('currentLocaleLabel() returns "English" for the default locale', () => {
    expect(component.currentLocaleLabel()).toBe('English');
  });

  it('currentLocaleLabel() updates when locale changes', () => {
    i18n.setLocale('de');
    expect(component.currentLocaleLabel()).toBe('Deutsch');
  });

  it('currentLocaleLabel() returns "日本語" for Japanese locale', () => {
    i18n.setLocale('ja');
    expect(component.currentLocaleLabel()).toBe('日本語');
  });

  it('Escape keydown closes the dropdown', () => {
    component.localeOpen.set(true);
    component.onEscape();
    expect(component.localeOpen()).toBe(false);
  });

  it('outside click closes the dropdown', () => {
    component.localeOpen.set(true);
    const externalNode = document.createElement('div');
    document.body.appendChild(externalNode);
    component.onDocClick(new MouseEvent('click', { bubbles: true }));
    expect(component.localeOpen()).toBe(false);
    document.body.removeChild(externalNode);
  });
});
