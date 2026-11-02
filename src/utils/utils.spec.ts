import { FormControl } from '@angular/forms';
import { Utils } from './utils';

describe('Utils.stripUsernameAt', () => {
  it('removes every leading @ typed by the user', () => {
    const control = new FormControl('');
    Utils.stripUsernameAt(control);

    control.setValue('@@pepe');

    expect(control.value).toBe('pepe');
  });

  it('leaves usernames without a leading @ alone', () => {
    const control = new FormControl('');
    Utils.stripUsernameAt(control);

    control.setValue('pe@pe');

    expect(control.value).toBe('pe@pe');
  });

  it('accepts a missing control', () => {
    expect(() => Utils.stripUsernameAt(null)).not.toThrow();
  });
});
