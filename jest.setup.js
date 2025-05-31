// Jest setup file for testing environment

// Mock Canvas API for testing
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}));

global.HTMLCanvasElement.prototype.toDataURL = jest.fn(() => '');

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup for React Testing Library
// Note: This import will be available after npm install
// import '@testing-library/jest-dom';

// Add custom matchers for testing
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null && received !== undefined;
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to be in the document`,
      pass,
    };
  },
  toHaveTextContent(received, expected) {
    const pass = received && received.textContent && received.textContent.includes(expected);
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to have text content "${expected}"`,
      pass,
    };
  },
  toHaveAttribute(received, attr, value) {
    const pass = received && received.getAttribute && received.getAttribute(attr) === value;
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to have attribute "${attr}" with value "${value}"`,
      pass,
    };
  },
  toHaveStyle(received, styles) {
    const pass = received && received.style && Object.keys(styles).every(key =>
      received.style[key] === styles[key] || received.style.getPropertyValue(key) === styles[key]
    );
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to have styles`,
      pass,
    };
  },
  toHaveValue(received, expected) {
    const pass = received && received.value === expected;
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to have value "${expected}"`,
      pass,
    };
  },
  toBeChecked(received) {
    const pass = received && received.checked === true;
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to be checked`,
      pass,
    };
  },
  toHaveDisplayValue(received, expected) {
    const pass = received && (received.value === expected || received.textContent === expected);
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to have display value "${expected}"`,
      pass,
    };
  },
});