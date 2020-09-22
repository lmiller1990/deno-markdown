import { CharacterToken } from "./types.ts"
import { ParsedNode, Parser } from "./parser.ts"
import { assertEquals } from "https://deno.land/std@0.69.0/testing/asserts.ts"

Deno.test("parses header node", () => {
  const tokens: CharacterToken[] = [
    { type: "h1", value: "", },
    { type: "text", value: " Welcome" },
    { type: "text", value: " to" },
    { type: "text", value: " the" },
    { type: "text", value: " blog" },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ]

  const actual = new Parser(tokens).parse()

  const expected: ParsedNode[] = [
    { 
      level: 1,
      type: "header-node", 
      text: " Welcome to the blog"
    }
  ]

  assertEquals(actual, expected)
})

Deno.test("parses parseParagraphNode containing text", () => {
  const tokens: CharacterToken[] = [
    { type: "text", value: " Welcome" },
    { type: "text", value: " to" },
    { type: "text", value: " the" },
    { type: "text", value: " blog" },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ]

  const actual = new Parser(tokens).parse()

  const expected: ParsedNode[] = [
    { 
      type: "paragraph-node",
      children: [
        { type: "text-node", text: " Welcome" },
        { type: "text-node", text: " to" },
        { type: "text-node", text: " the" },
        { type: "text-node", text: " blog" },
      ]
    }
  ]

  assertEquals(actual, expected)
})