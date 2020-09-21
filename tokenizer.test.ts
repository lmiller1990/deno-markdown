import {
  assertEquals,
} from "https://deno.land/std/testing/asserts.ts";
import { text } from "./data.ts"
import { tokenize } from "./tokenizer.ts"
import { CharacterToken } from "./types.ts";

Deno.test("tokenize", () => {
  const actual = tokenize(text)

  const expected: CharacterToken[] = [
    { type: "h1", value: "#" },
    { type: "text", value: " Title" },
    { type: "cr", value: "" },
    { type: "text", value: "\nWelcome" },
    { type: "text", value: " to" },
    { type: "text", value: " my" },
    { type: "text", value: " blog." },
    { type: "text", value: " I" },
    { type: "text", value: " wrote" },
    { type: "text", value: " my" },
    { type: "text", value: " own" },
    { type: "text", value: " " },
    { type: "single-backtick", value: "`" },
    { type: "text", value: "markdown" },
    { type: "single-backtick", value: "`" },
    { type: "text", value: " to" },
    { type: "text", value: " " },
    { type: "single-backtick", value: "`" },
    { type: "text", value: "html" },
    { type: "single-backtick", value: "`" },
    { type: "text", value: " compiler." },
    { type: "cr", value: "" },
    { type: "text", value: "\nIt" },
    { type: "text", value: " even" },
    { type: "text", value: " supports" },
    { type: "text", value: " code" },
    { type: "text", value: " blocks:" },
    { type: "cr", value: "" },
    { type: "triple-backtick", value: "```" },
    { type: "text", value: "{2,5-10,15}" },
    { type: "text", value: "\nfunction()" },
    { type: "text", value: " {" },
    { type: "cr", value: "" },
    { type: "text", value: " " },
    { type: "text", value: " return" },
    { type: "text", value: " 'code" },
    { type: "text", value: " block';" },
    { type: "text", value: "\n}" },
    { type: "cr", value: "" },
    { type: "triple-backtick", value: "```" },
    { type: "cr", value: "" },
    { type: "text", value: "\nSee" },
    { type: "text", value: " you" },
    { type: "text", value: " next" },
    { type: "text", value: " time!!" },
    { type: "cr", value: "" },
    { type: "EOF", value: "" }
  ]

  assertEquals(actual, expected)
})

Deno.test("tokenize", () => {
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