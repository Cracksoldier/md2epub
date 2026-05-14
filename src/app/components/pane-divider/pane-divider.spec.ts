import { TestBed } from '@angular/core/testing';
import { PaneDivider } from './pane-divider';

const RATIO_KEY = 'epub:v1:pane-ratio';
const LEGACY_RATIO_KEY = 'pane-ratio';

describe('PaneDivider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('static loadSavedRatio()', () => {
    it('returns 0.5 when nothing is stored', () => {
      expect(PaneDivider.loadSavedRatio()).toBe(0.5);
    });

    it('returns the stored numeric ratio', () => {
      localStorage.setItem(RATIO_KEY, '0.6');
      expect(PaneDivider.loadSavedRatio()).toBe(0.6);
    });

    it('clamps below minimum (0.2) to 0.2', () => {
      localStorage.setItem(RATIO_KEY, '0.1');
      expect(PaneDivider.loadSavedRatio()).toBe(0.2);
    });

    it('clamps above maximum (0.8) to 0.8', () => {
      localStorage.setItem(RATIO_KEY, '0.9');
      expect(PaneDivider.loadSavedRatio()).toBe(0.8);
    });

    it('returns 0.5 for a non-numeric stored value', () => {
      localStorage.setItem(RATIO_KEY, 'invalid');
      expect(PaneDivider.loadSavedRatio()).toBe(0.5);
    });

    it('returns 0.5 for an empty string stored value', () => {
      localStorage.setItem(RATIO_KEY, '');
      expect(PaneDivider.loadSavedRatio()).toBe(0.5);
    });

    it('accepts the boundary minimum value 0.2', () => {
      localStorage.setItem(RATIO_KEY, '0.2');
      expect(PaneDivider.loadSavedRatio()).toBe(0.2);
    });

    it('accepts the boundary maximum value 0.8', () => {
      localStorage.setItem(RATIO_KEY, '0.8');
      expect(PaneDivider.loadSavedRatio()).toBe(0.8);
    });
  });

  describe('static saveRatio()', () => {
    it('writes the ratio as a string under the namespaced key', () => {
      PaneDivider.saveRatio(0.65);
      expect(localStorage.getItem(RATIO_KEY)).toBe('0.65');
    });

    it('overwrites a previously saved ratio', () => {
      PaneDivider.saveRatio(0.3);
      PaneDivider.saveRatio(0.7);
      expect(localStorage.getItem(RATIO_KEY)).toBe('0.7');
    });
  });

  describe('legacy migration', () => {
    it('reads a value left at the unprefixed "pane-ratio" key and migrates it', () => {
      localStorage.setItem(LEGACY_RATIO_KEY, '0.55');
      expect(PaneDivider.loadSavedRatio()).toBe(0.55);
      expect(localStorage.getItem(RATIO_KEY)).toBe('0.55');
      expect(localStorage.getItem(LEGACY_RATIO_KEY)).toBeNull();
    });
  });

  describe('component keyboard interaction', () => {
    it('emits ratioChange on ArrowLeft keydown', async () => {
      await TestBed.configureTestingModule({ imports: [PaneDivider] }).compileComponents();
      const fixture = TestBed.createComponent(PaneDivider);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      localStorage.setItem(RATIO_KEY, '0.5');
      const emitted: number[] = [];
      component.ratioChange.subscribe((v: number) => emitted.push(v));

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
      fixture.nativeElement.dispatchEvent(event);

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toBeCloseTo(0.48, 5);
    });

    it('emits ratioChange on ArrowRight keydown', async () => {
      await TestBed.configureTestingModule({ imports: [PaneDivider] }).compileComponents();
      const fixture = TestBed.createComponent(PaneDivider);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      localStorage.setItem(RATIO_KEY, '0.5');
      const emitted: number[] = [];
      component.ratioChange.subscribe((v: number) => emitted.push(v));

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      fixture.nativeElement.dispatchEvent(event);

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toBeCloseTo(0.52, 5);
    });
  });
});
