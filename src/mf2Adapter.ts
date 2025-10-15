import { mf2Parser } from './mf2.js';
import type { Parser } from './types.js';

export const mf2ParserAdapter: Parser.T = {
  parse: (value, params, locale) => {
    const paramsObject = params[0] || {};
    return mf2Parser({
      message: value,
      params: paramsObject,
      locale: [locale],
    });
  },
};