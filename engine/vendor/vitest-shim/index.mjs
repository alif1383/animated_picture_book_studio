import assert from 'node:assert/strict';
import util from 'node:util';

const suiteStack = [];
export const registeredSuites = [];

function currentSuite() {
  return suiteStack[suiteStack.length - 1] || null;
}

export function describe(name, fn) {
  const suite = {
    name,
    tests: [],
    suites: [],
    beforeEach: [],
    afterEach: [],
    beforeAll: [],
    afterAll: [],
  };
  const parent = currentSuite();
  if (parent) {
    parent.suites.push(suite);
  } else {
    registeredSuites.push(suite);
  }
  suiteStack.push(suite);
  try {
    fn();
  } finally {
    suiteStack.pop();
  }
}

export function it(name, fn) {
  const parent = currentSuite();
  if (parent) {
    parent.tests.push({ name, fn });
  } else {
    registeredSuites.push({
      name: '(root)',
      tests: [{ name, fn }],
      suites: [],
      beforeEach: [],
      afterEach: [],
      beforeAll: [],
      afterAll: [],
    });
  }
}

export const test = it;

export function beforeEach(fn) {
  const s = currentSuite();
  if (s) s.beforeEach.push(fn);
}

export function afterEach(fn) {
  const s = currentSuite();
  if (s) s.afterEach.push(fn);
}

export function beforeAll(fn) {
  const s = currentSuite();
  if (s) s.beforeAll.push(fn);
}

export function afterAll(fn) {
  const s = currentSuite();
  if (s) s.afterAll.push(fn);
}

function formatMsg(customMessage, defaultMsg) {
  return customMessage ? `${customMessage}: ${defaultMsg}` : defaultMsg;
}

function createMatchers(actual, customMessage, isNot = false) {
  const check = (pass, posMsg, negMsg) => {
    const ok = isNot ? !pass : pass;
    if (!ok) {
      throw new Error(formatMsg(customMessage, isNot ? negMsg : posMsg));
    }
  };

  const matchers = {
    toBe(expected) {
      const pass = Object.is(actual, expected);
      check(
        pass,
        `expected ${util.inspect(actual)} to be ${util.inspect(expected)}`,
        `expected ${util.inspect(actual)} not to be ${util.inspect(expected)}`
      );
    },
    toEqual(expected) {
      let pass = false;
      try {
        assert.deepEqual(actual, expected);
        pass = true;
      } catch {
        pass = false;
      }
      check(
        pass,
        `expected ${util.inspect(actual)} to deeply equal ${util.inspect(expected)}`,
        `expected ${util.inspect(actual)} not to deeply equal ${util.inspect(expected)}`
      );
    },
    toStrictEqual(expected) {
      let pass = false;
      try {
        assert.deepStrictEqual(actual, expected);
        pass = true;
      } catch {
        pass = false;
      }
      check(
        pass,
        `expected ${util.inspect(actual)} to strictly equal ${util.inspect(expected)}`,
        `expected ${util.inspect(actual)} not to strictly equal ${util.inspect(expected)}`
      );
    },
    toContain(item) {
      let pass = false;
      if (typeof actual === 'string') {
        pass = actual.includes(String(item));
      } else if (Array.isArray(actual)) {
        pass = actual.includes(item);
      } else if (actual instanceof Set) {
        pass = actual.has(item);
      }
      check(
        pass,
        `expected ${util.inspect(actual)} to contain ${util.inspect(item)}`,
        `expected ${util.inspect(actual)} not to contain ${util.inspect(item)}`
      );
    },
    toHaveLength(expectedLen) {
      const len = actual != null ? actual.length : undefined;
      const pass = len === expectedLen;
      check(
        pass,
        `expected length ${expectedLen} but got ${len}`,
        `expected length not to be ${expectedLen}`
      );
    },
    toBeCloseTo(expected, precision = 2) {
      const diff = Math.abs(Number(actual) - Number(expected));
      const maxDiff = Math.pow(10, -precision) / 2;
      const pass = diff < maxDiff;
      check(
        pass,
        `expected ${actual} to be close to ${expected} (precision ${precision}, diff ${diff})`,
        `expected ${actual} not to be close to ${expected}`
      );
    },
    toBeGreaterThan(expected) {
      const pass = Number(actual) > Number(expected);
      check(
        pass,
        `expected ${actual} to be > ${expected}`,
        `expected ${actual} not to be > ${expected}`
      );
    },
    toBeGreaterThanOrEqual(expected) {
      const pass = Number(actual) >= Number(expected);
      check(
        pass,
        `expected ${actual} to be >= ${expected}`,
        `expected ${actual} not to be >= ${expected}`
      );
    },
    toBeLessThan(expected) {
      const pass = Number(actual) < Number(expected);
      check(
        pass,
        `expected ${actual} to be < ${expected}`,
        `expected ${actual} not to be < ${expected}`
      );
    },
    toBeLessThanOrEqual(expected) {
      const pass = Number(actual) <= Number(expected);
      check(
        pass,
        `expected ${actual} to be <= ${expected}`,
        `expected ${actual} not to be <= ${expected}`
      );
    },
    toBeNull() {
      const pass = actual === null;
      check(pass, `expected ${util.inspect(actual)} to be null`, `expected not null`);
    },
    toBeUndefined() {
      const pass = actual === undefined;
      check(
        pass,
        `expected ${util.inspect(actual)} to be undefined`,
        `expected ${util.inspect(actual)} to be defined`
      );
    },
    toBeDefined() {
      const pass = actual !== undefined;
      check(
        pass,
        `expected value to be defined`,
        `expected ${util.inspect(actual)} to be undefined`
      );
    },
    toBeTruthy() {
      const pass = Boolean(actual);
      check(
        pass,
        `expected ${util.inspect(actual)} to be truthy`,
        `expected ${util.inspect(actual)} not to be truthy`
      );
    },
    toBeFalsy() {
      const pass = !actual;
      check(
        pass,
        `expected ${util.inspect(actual)} to be falsy`,
        `expected ${util.inspect(actual)} not to be falsy`
      );
    },
    toBeInstanceOf(expected) {
      const pass = actual instanceof expected;
      check(
        pass,
        `expected ${util.inspect(actual)} to be instance of ${expected?.name || expected}`,
        `expected ${util.inspect(actual)} not to be instance of ${expected?.name || expected}`
      );
    },
    toMatch(expected) {
      const str = String(actual);
      const pass =
        expected instanceof RegExp ? expected.test(str) : str.includes(String(expected));
      check(
        pass,
        `expected ${util.inspect(str)} to match ${util.inspect(expected)}`,
        `expected ${util.inspect(str)} not to match ${util.inspect(expected)}`
      );
    },
    toThrow(expected) {
      let threw = false;
      let err = null;
      try {
        actual();
      } catch (e) {
        threw = true;
        err = e;
      }
      let pass = threw;
      if (threw && expected !== undefined) {
        const msg = err && err.message ? err.message : String(err);
        if (expected instanceof RegExp) {
          pass = expected.test(msg);
        } else if (typeof expected === 'string') {
          pass = msg.includes(expected);
        }
      }
      check(
        pass,
        `expected function to throw ${expected || ''}`,
        `expected function not to throw`
      );
    },
  };

  Object.defineProperty(matchers, 'not', {
    get() {
      return createMatchers(actual, customMessage, !isNot);
    },
  });

  return matchers;
}

export function expect(actual, customMessage) {
  return createMatchers(actual, customMessage, false);
}

const activeSpies = [];

export const vi = {
  fn(impl = () => undefined) {
    let currentImpl = impl;
    const mockFn = function (...args) {
      mockFn.mock.calls.push(args);
      try {
        const value = currentImpl.apply(this, args);
        mockFn.mock.results.push({ type: 'return', value });
        return value;
      } catch (err) {
        mockFn.mock.results.push({ type: 'throw', value: err });
        throw err;
      }
    };
    mockFn.mock = { calls: [], results: [] };
    mockFn.mockClear = () => {
      mockFn.mock.calls = [];
      mockFn.mock.results = [];
      return mockFn;
    };
    mockFn.mockReset = () => {
      mockFn.mockClear();
      currentImpl = () => undefined;
      return mockFn;
    };
    mockFn.mockReturnValue = (val) => {
      currentImpl = () => val;
      return mockFn;
    };
    mockFn.mockResolvedValue = (val) => {
      currentImpl = () => Promise.resolve(val);
      return mockFn;
    };
    return mockFn;
  },
  spyOn(obj, method) {
    const original = obj[method];
    const spy = vi.fn(original ? original.bind(obj) : () => undefined);
    obj[method] = spy;
    spy.mockRestore = () => {
      obj[method] = original;
    };
    activeSpies.push(spy);
    return spy;
  },
  restoreAllMocks() {
    while (activeSpies.length > 0) {
      const spy = activeSpies.pop();
      if (spy && typeof spy.mockRestore === 'function') spy.mockRestore();
    }
  },
};

export function resetRegisteredSuites() {
  registeredSuites.length = 0;
  suiteStack.length = 0;
}
