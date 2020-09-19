import { CharacterToken, TokenType } from "./types.ts";

export interface TokenMatch {
  type: TokenType;
  regexp: RegExp;
}

export const tokensMatches: TokenMatch[] = [
  { type: "h1", regexp: /(.*?#)/ },
  { type: "cr", regexp: /(\n)$/ },
  { type: "triple-backtick", regexp: /^\s?(```)/ },
  { type: "single-backtick", regexp: /^(\s?`)/ },
  { type: "text", regexp: /(\s?.+?)/ },
  { type: "whitespace", regexp: /(\s)/ },
];

export function matchToken(word: string): TokenMatch {
  for (const token of tokensMatches) {
    const matches = word.match(token.regexp);
    if (matches && matches[1]) {
      return token;
    }
  }

  throw Error(`No match found for "${word}"`);
}

export function tokenize(text: string) {
  const charTokens: CharacterToken[] = [];
  const words = text.split(/(?=\s)/) /// split by whitespace, keep the whitespace.
    .flatMap((x) => x.split(/(\u0060{3})/)) // split by ```
    .flatMap((x) =>
      x.includes("```")
        ? x // do not split code block backticks further.
        : x.split(/(\u0060)/) // inline code.
    )
    .filter((x) => x.length > 0); // remove ""

  for (const word of words) {
    const tokenType = matchToken(word);
    const token: CharacterToken = {
      type: tokenType.type,
      value: word,
    };
    charTokens.push(token);
  }

  charTokens.push({ type: "cr", value: "" });
  charTokens.push({ type: "EOF", value: "" });
  return charTokens;
}
