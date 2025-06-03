import jsx from 'acorn-jsx';
import staticClassFeatures from 'acorn-static-class-features';
import classFields from 'acorn-class-fields';
import {Parser} from './acorn-typescript';

class JSXParser extends Parser {
  constructor() {
    super(jsx(), classFields, staticClassFeatures);
  }
}

const jsxParser = new JSXParser();

export const parse = code => jsxParser.parse(code, {
      ecmaVersion: 2020,
      sourceType: 'module',
      allowReturnOutsideFunction: true
    });

