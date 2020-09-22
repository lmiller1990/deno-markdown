import {
  assertEquals,
} from "https://deno.land/std/testing/asserts.ts";
import { tokenize } from "./tokenizer.ts";
import { CharacterToken } from "./types.ts";
import { test, xtest } from "./test-utils.ts";

test("code block", () => {
  const actual = tokenize(
    `\`\`\`{1}
function log() {
  console.log('Hi!')
}
\`\`\`
`,
  );

  const expected: CharacterToken[] = [
    { type: "triple-backtick", value: "```" },
    { type: "text", value: "{1}" },
    {
      type: "text",
      value: "\nfunction",
    },
    { type: "text", value: " log" },
    { type: "open-circle-bracket", value: "(" },
    { type: "close-circle-bracket", value: ")" },
    { type: "text", value: " {" },
    {
      type: "cr",
      value: "\n",
    },
    { type: "text", value: " " },
    { type: "text", value: " console.log" },
    { type: "open-circle-bracket", value: "(" },
    { type: "text", value: "'Hi!'" },
    { type: "close-circle-bracket", value: ")" },
    {
      type: "text",
      value: "\n}",
    },
    {
      type: "cr",
      value: "\n",
    },
    { type: "triple-backtick", value: "```" },
    {
      type: "cr",
      value: "\n",
    },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ];

  assertEquals(actual, expected);
});

xtest("italics", () => {
  const actual = tokenize(`This is *important*.`);

  const expected: CharacterToken[] = [
    { type: "text", value: "This" },
    { type: "text", value: " is" },
    { type: "text", value: " " },
    { type: "asterisk", value: "*" },
    { type: "text", value: "important" },
    { type: "asterisk", value: "*" },
    { type: "text", value: "." },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ];

  assertEquals(actual, expected);
});

xtest("link", () => {
  const actual = tokenize(`[Link](https://lachlan-miller.me)`);

  const expected: CharacterToken[] = [
    { type: "open-square-bracket", value: "[" },
    { type: "text", value: "Link" },
    { type: "close-square-bracket", value: "]" },
    { type: "open-circle-bracket", value: "(" },
    { type: "text", value: "https://lachlan-miller.me" },
    { type: "close-circle-bracket", value: ")" },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ];

  assertEquals(actual, expected);
});
