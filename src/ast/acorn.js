import { Parser } from 'acorn';
import jsx from 'acorn-jsx';
import staticClassFeatures from 'acorn-static-class-features';
import classFields from 'acorn-class-fields';
import typescript from './acorn-typescript';

const jsxParser = Parser.extend(typescript, jsx(), classFields, staticClassFeatures);

export const parse = code => jsxParser.parse(code, {
  ecmaVersion: 2020,
  sourceType: 'module',
  allowReturnOutsideFunction: true
});
