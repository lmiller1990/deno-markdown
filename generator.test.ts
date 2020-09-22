import { assertEquals } from "https://deno.land/std@0.69.0/testing/asserts.ts"
import { generate } from "./generator.ts"
import { ParsedNode } from './parser.ts'

Deno.test('generates paragraph text with italic', () => {
  const tree: ParsedNode[] = [
    { 
      type: "paragraph-node",
      children: [
        { type: "text-node", text: " Welcome" },
        { type: "text-node", text: " to" },
        { type: "text-node", text: " the " },
        { type: "italic-node", text: "blog" },
      ]
    }
  ]
  const expected = `<p>Welcome to the <em>blog</em></p>`

  const actual = generate(tree)

  assertEquals(actual, expected)
})

Deno.test('generates paragraph text with link', () => {
  const tree: ParsedNode[] = [
    { 
      type: "paragraph-node",
      children: [
        { type: "text-node", text: "Welcome" },
        { type: "text-node", text: "to" },
        { type: "link-node", text: "my website", href: "https://lachlan-miller.me" },
      ]
    }
  ]
  const expected = `<p>Welcome to <a href="https://lachlan-miller.me">my website</a></p>`

  const actual = generate(tree)

  assertEquals(actual, expected)
})