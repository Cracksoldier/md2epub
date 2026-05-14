import { Injectable, signal } from '@angular/core';

const SAMPLE = `# My First Book

*A story waiting to be told.*

---

## Chapter One: The Beginning

It was a dark and stormy night when everything changed. The old lighthouse at the edge of town had not been lit for twenty years, yet tonight its beam swept across the churning sea.

Margaret stood at her window, coffee mug warming her hands, watching the light with a mixture of wonder and unease.

## Chapter Two: The Discovery

The next morning brought pale sunlight and the smell of salt. Margaret found herself walking toward the lighthouse before she had consciously decided to go.

The door was ajar.

> "Some doors are better left closed," her grandmother had always said. "But the ones left ajar — those are invitations."

She pushed it open.

## Chapter Three: What Lies Within

Inside was not the ruin she expected. The floors were clean. A table held a lamp, a notebook, and a single red pen.

The first page of the notebook read:

\`\`\`
If you are reading this,
then it has found the right person at last.
\`\`\`

The rest of the pages were blank — and waiting.

---

*The end... or the beginning?*
`;

const STORAGE_KEY = 'epub-autosave-content';

@Injectable({ providedIn: 'root' })
export class EditorStateService {
  private readonly _content = signal(localStorage.getItem(STORAGE_KEY) ?? SAMPLE);
  readonly content = this._content.asReadonly();

  setContent(value: string): void {
    this._content.set(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch { /* QuotaExceededError — content stays in-memory */ }
  }
}
