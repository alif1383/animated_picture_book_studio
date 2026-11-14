export type TestFn = () => void | Promise<void>;
export type HookFn = () => void | Promise<void>;

export function describe(name: string, fn: () => void): void;
export function it(name: string, fn: TestFn): void;
export function test(name: string, fn: TestFn): void;
export function beforeEach(fn: HookFn): void;
export function afterEach(fn: HookFn): void;
export function beforeAll(fn: HookFn): void;
export function afterAll(fn: HookFn): void;

export interface Assertion<T = any> {
  toBe(expected: any): void;
  toEqual(expected: any): void;
  toStrictEqual(expected: any): void;
  toContain(item: any): void;
  toHaveLength(length: number): void;
  toBeCloseTo(expected: number, precision?: number): void;
  toBeGreaterThan(expected: number): void;
  toBeGreaterThanOrEqual(expected: number): void;
  toBeLessThan(expected: number): void;
  toBeLessThanOrEqual(expected: number): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeDefined(): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeInstanceOf(expected: any): void;
  toMatch(expected: string | RegExp): void;
  toThrow(expected?: string | RegExp | Error): void;
  not: Assertion<T>;
  resolves: Assertion<Awaited<T>>;
  rejects: Assertion<any>;
}

export function expect<T = any>(actual: T, message?: string): Assertion<T>;

export namespace vi {
  function fn<T extends (...args: any[]) => any = (...args: any[]) => any>(impl?: T): T & {
    mock: { calls: Parameters<T>[]; results: Array<{ type: 'return' | 'throw'; value: any }> };
    mockClear(): void;
    mockReset(): void;
    mockReturnValue(val: ReturnType<T>): any;
    mockResolvedValue(val: Awaited<ReturnType<T>>): any;
  };
  function spyOn<T extends object, K extends keyof T>(obj: T, method: K): any;
  function restoreAllMocks(): void;
}
