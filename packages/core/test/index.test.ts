import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { corePrint } from '@pdf-viewer-toolkit/core';
import { modulePrint } from '@pdf-viewer-toolkit/core/module';

afterEach(() => {
  jest.clearAllMocks();
});

describe('corePrint', () => {
  it('Check to see if the log outputs correctly.', () => {
    const result = corePrint();

    expect(result).toBe('core');
  });
});

describe('modulePrint', () => {
  it('Check to see if the log outputs correctly.', () => {
    const result = modulePrint();

    expect(result).toBe('module');
  });
});
