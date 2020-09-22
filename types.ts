export type TokenType =
  | "h1"
  | "triple-backtick"
  | "text"
  | "single-backtick"
  | "whitespace"
  | "cr"
  | "asterisk"
  | "block-quote"
  | "open-square-bracket"
  | "close-square-bracket"
  | "open-circle-bracket"
  | "close-circle-bracket"
  | "EOF";

export interface CharacterToken {
  type: TokenType;
  value: string;
}
