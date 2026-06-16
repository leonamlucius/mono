module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Usando caminhos globais puros. O '**/src/' encontra a pasta não importa o caminho antes dela.
  testMatch: [
    '**/src/**/*.spec.ts',
    '**/src/**/*.test.ts'
  ],
};