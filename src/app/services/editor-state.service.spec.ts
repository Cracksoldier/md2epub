import { TestBed } from '@angular/core/testing';
import { EditorStateService } from './editor-state.service';

describe('EditorStateService', () => {
  let service: EditorStateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditorStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initial content contains the sample markdown title', () => {
    expect(service.content()).toContain('# My First Book');
  });

  it('initial content is a non-empty string', () => {
    expect(service.content().length).toBeGreaterThan(0);
  });

  it('setContent() updates the content signal', () => {
    service.setContent('# New Title\n\nNew body.');
    expect(service.content()).toBe('# New Title\n\nNew body.');
  });

  it('setContent() with empty string empties the signal', () => {
    service.setContent('');
    expect(service.content()).toBe('');
  });

  it('content signal reflects the last setContent() call', () => {
    service.setContent('First');
    service.setContent('Second');
    expect(service.content()).toBe('Second');
  });
});
