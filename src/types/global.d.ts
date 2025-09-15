import { CompilerError } from '@vue/compiler-core';

declare global {
  interface Window {
    Vue: {
      compile: (template: string) => { code: string; errors: CompilerError[] };
    };
  }
}

export {};
