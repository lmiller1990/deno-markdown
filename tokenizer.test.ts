import {
  assertEquals,
} from "https://deno.land/std/testing/asserts.ts";
import { text } from "./data.ts"
import { tokenize } from "./tokenizer.ts"
import { CharacterToken } from "./types.ts";

Deno.test("code block", () => {
  const actual = tokenize(
    `\`\`\`{1}
\`\`\`
`)

  const expected: CharacterToken[] = [
    { type: "triple-backtick", value: "```" },
    { type: "text", value: "{1}" },
    { type: "cr", value: "" },
    { type: "triple-backtick", value: "```" },
    { type: "cr", value: "" },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ]

  assertEquals(actual, expected)
})

Deno.test("italics", () => {
  const actual = tokenize(`This is *important*.`)

  const expected: CharacterToken[] = [
    { type: "text", value: "This", },
    { type: "text", value: " is" },
    { type: "text", value: " " },
    { type: "asterisk", value: "*" },
    { type: "text", value: "important" },
    { type: "asterisk", value: "*" },
    { type: "text", value: "." },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ]

  assertEquals(actual, expected)
})

Deno.test("link", () => {
  const actual = tokenize(`[Link](https://lachlan-miller.me)`)

  const expected: CharacterToken[] = [
    { type: "open-square-bracket", value: "[", },
    { type: "text", value: "Link" },
    { type: "close-square-bracket", value: "]" },
    { type: "open-circle-bracket", value: "(" },
    { type: "text", value: "https://lachlan-miller.me" },
    { type: "close-circle-bracket", value: ")" },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ]

  assertEquals(actual, expected)
})
