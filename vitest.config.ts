import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    reporters: ['default'],
    testTimeout: 15_000,
  },
});
