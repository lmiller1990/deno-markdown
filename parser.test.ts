import { CharacterToken } from "./types.ts";
import { ParsedNode, Parser } from "./parser.ts";
import { assertEquals } from "https://deno.land/std@0.69.0/testing/asserts.ts";
import { test } from "./test-utils.ts";

test("parses header node", () => {
  const tokens: CharacterToken[] = [
    { type: "h1", value: "" },
    { type: "text", value: " Welcome" },
    { type: "text", value: " to" },
    { type: "text", value: " the" },
    { type: "text", value: " blog" },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ];

  const actual = new Parser(tokens).parse();

  const expected: ParsedNode[] = [
    {
      level: 1,
      type: "header-node",
      text: " Welcome to the blog",
    },
  ];

  assertEquals(actual, expected);
});

test("parses parseParagraphNode containing text", () => {
  const tokens: CharacterToken[] = [
    { type: "text", value: " Welcome" },
    { type: "text", value: " to" },
    { type: "text", value: " the" },
    { type: "text", value: " blog" },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ];
  const expected: ParsedNode[] = [
    {
      type: "paragraph-node",
      children: [
        { type: "text-node", text: " Welcome" },
        { type: "text-node", text: " to" },
        { type: "text-node", text: " the" },
        { type: "text-node", text: " blog" },
      ],
    },
  ];

  const actual = new Parser(tokens).parse();

  assertEquals(actual, expected);
});

test("parses paragraph node containing italics", () => {
  const tokens: CharacterToken[] = [
    { type: "text", value: " Welcome" },
    { type: "text", value: " to" },
    { type: "text", value: " the" },
    { type: "asterisk", value: "*" },
    { type: "text", value: "blog" },
    { type: "asterisk", value: "*" },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ];
  const expected: ParsedNode[] = [
    {
      type: "paragraph-node",
      children: [
        { type: "text-node", text: " Welcome" },
        { type: "text-node", text: " to" },
        { type: "text-node", text: " the" },
        { type: "italic-node", text: "blog" },
      ],
    },
  ];

  const actual = new Parser(tokens).parse();

  assertEquals(actual, expected);
});

test("parses paragraph node containing link", () => {
  const tokens: CharacterToken[] = [
    { type: "text", value: " Welcome" },
    { type: "text", value: " to" },
    { type: "text", value: " the" },
    { type: "open-square-bracket", value: "[" },
    { type: "text", value: "blog" },
    { type: "close-square-bracket", value: "]" },
    { type: "open-circle-bracket", value: "(" },
    { type: "text", value: "https://lachlan-miller.me" },
    { type: "close-circle-bracket", value: ")" },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ];
  const expected: ParsedNode[] = [
    {
      type: "paragraph-node",
      children: [
        { type: "text-node", text: " Welcome" },
        { type: "text-node", text: " to" },
        { type: "text-node", text: " the" },
        { type: "link-node", text: "blog", href: "https://lachlan-miller.me" },
      ],
    },
  ];

  const actual = new Parser(tokens).parse();

  assertEquals(actual, expected);
});

test("replaces < and > with HTML safe alternatives in inline code", () => {
  const tokens: CharacterToken[] = [
    { type: "single-backtick", value: "`" },
    { type: "text", value: "<button>" },
    { type: "single-backtick", value: "`" },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ];
  const expected: ParsedNode[] = [
    {
      type: "paragraph-node",
      children: [
        { type: "inline-code-node", text: "&lt;button&gt;" },
      ],
    },
  ];

  const actual = new Parser(tokens).parse();

  assertEquals(actual, expected);
});

test("replaces < and > with HTML safe alternatives in code block", () => {
  const tokens: CharacterToken[] = [
    { type: "triple-backtick", value: "```" },
    { type: "text", value: "<button>" },
    { type: "cr", value: "\n" },
    { type: "triple-backtick", value: "```" },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ];
  const expected: ParsedNode[] = [
    {
      highlight: undefined,
      type: "code-block-node",
      text: "&lt;button&gt;\n",
    },
  ];

  const actual = new Parser(tokens).parse();

  assertEquals(actual, expected);
});

test("parses block quote", () => {
  const tokens: CharacterToken[] = [
    { type: "block-quote", value: ">" },
    { type: "text", value: " TIP: Something" },
    { type: "cr", value: "" },
    { type: "EOF", value: "" },
  ];
  const expected: ParsedNode[] = [
    {
      type: "block-quote-node",
      children: [
        {
          type: "text-node",
          text: " TIP: Something",
        },
      ],
    },
  ];

  const actual = new Parser(tokens).parse();

  assertEquals(actual, expected);
});
