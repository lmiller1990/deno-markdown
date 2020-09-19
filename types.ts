export type TokenType =
  | "h1"
  | "triple-backtick"
  | "text"
  | "single-backtick"
  | "whitespace"
  | "cr"
  | "EOF";

export interface CharacterToken {
  type: TokenType;
  value: string;
}
