import { CodegenResult } from '@vue/compiler-core';

declare global {
  interface Window {
    Vue: {
      compile: typeof import('@vue/compiler-dom').compile;
    };
  }
}

export {};
