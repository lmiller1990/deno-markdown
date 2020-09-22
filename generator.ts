import { ParsedNode, EmbeddableNode } from "./parser.ts";

function generateTextNodes(children: EmbeddableNode[]) {
  let text = "";

  for (const word of children) {
    if (word.type === "text-node") {
      text += `${word.text} `;
    }

    if (word.type === "inline-code-node") {
      text += `<code>${word.text}</code>`;
    }

    if (word.type === "italic-node") {
      text += `<em>${word.text}</em>`;
    }

    if (word.type === "link-node") {
      text += `<a href="${word.href}">${word.text}</a>`;
    }
  }

  return text;
}

export function generate(nodes: ParsedNode[]): string {
  let text = "";

  for (const node of nodes) {
    if (node.type === "header-node") {
      text += `<h${node.level}>${node.text}</h${node.level}>`;
    }

    if (node.type === "block-quote-node") {
      text += `<blockquote>${generateTextNodes(node.children)}</blockquote>`;
    }

    if (node.type === "paragraph-node") {
      text += `<p>${generateTextNodes(node.children)}</p>`;
    }

    if (node.type === "code-block-node") {
      text += `<pre data-line="${node.highlight}"><code>`;
      text += `${node.text}`;
      text += `</pre></code>`;
    }
  }

  return text;
}
