import { describe, expect, it } from 'vitest';
import { readSelectValue } from './select-value';

function createSelectChange(options: readonly string[], selected: string): Event {
  const select = document.createElement('select');
  for (const value of options) {
    const option = document.createElement('option');
    option.value = value;
    select.append(option);
  }
  select.value = selected;

  const event = new Event('change');
  select.dispatchEvent(event);
  return event;
}

describe('readSelectValue', () => {
  it('returns the selected option value', () => {
    expect(readSelectValue(createSelectChange(['', 'Antica'], 'Antica'))).toBe('Antica');
  });

  it('maps the empty option to null', () => {
    expect(readSelectValue(createSelectChange(['', 'Antica'], ''))).toBeNull();
  });

  it('returns null for events not coming from a select', () => {
    const input = document.createElement('input');
    const event = new Event('change');
    input.dispatchEvent(event);

    expect(readSelectValue(event)).toBeNull();
  });
});
