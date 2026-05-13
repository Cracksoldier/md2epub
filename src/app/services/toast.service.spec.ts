import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('starts with an empty toasts array', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('show() adds a toast to the list', () => {
    service.show('Hello');
    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].message).toBe('Hello');
  });

  it('show() defaults type to "info"', () => {
    service.show('Hello');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('show() accepts an explicit type', () => {
    service.show('Something broke', 'error');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('show() accepts "success" type', () => {
    service.show('Done!', 'success');
    expect(service.toasts()[0].type).toBe('success');
  });

  it('multiple show() calls stack toasts', () => {
    service.show('First');
    service.show('Second');
    expect(service.toasts()).toHaveLength(2);
  });

  it('each toast gets a unique string id', () => {
    service.show('A');
    service.show('B');
    const ids = service.toasts().map(t => t.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('dismiss() removes toast by id', () => {
    service.show('Keep');
    service.show('Remove');
    const removeId = service.toasts()[1].id;
    service.dismiss(removeId);
    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].message).toBe('Keep');
  });

  it('dismiss() with unknown id leaves toasts unchanged', () => {
    service.show('Toast');
    service.dismiss('nonexistent');
    expect(service.toasts()).toHaveLength(1);
  });

  it('auto-dismisses after 3500ms', () => {
    vi.useFakeTimers();
    service.show('Auto');
    expect(service.toasts()).toHaveLength(1);
    vi.advanceTimersByTime(3500);
    expect(service.toasts()).toHaveLength(0);
    vi.useRealTimers();
  });

  it('does not auto-dismiss before 3500ms', () => {
    vi.useFakeTimers();
    service.show('Auto');
    vi.advanceTimersByTime(3499);
    expect(service.toasts()).toHaveLength(1);
    vi.useRealTimers();
  });
});
