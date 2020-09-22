import { CharacterToken, TokenType } from "./types.ts";

export interface HeaderNode {
  type: "header-node";
  level: number;
  text: string;
}

export interface CodeBlockNode {
  type: "code-block-node";
  text: string;
  highlight?: string;
}

export interface LinkNode {
  type: "link-node";
  text: string;
  href: string;
}

export interface InlineCodeNode {
  type: "inline-code-node";
  text: string;
}

export interface TextNode {
  type: "text-node";
  text: string;
}

export interface ItalicNode {
  type: "italic-node";
  text: string;
}

export type EmbeddableNode = TextNode | InlineCodeNode | ItalicNode | LinkNode;

export interface ParagraphNode {
  type: "paragraph-node";
  children: EmbeddableNode[];
}

export interface BlockQuoteNode {
  type: "block-quote-node";
  children: EmbeddableNode[];
}

export type ParsedNode =
  | HeaderNode
  | CodeBlockNode
  | InlineCodeNode
  | ItalicNode
  | BlockQuoteNode
  | LinkNode
  | ParagraphNode;

function sanitize(code: string) {
  return code
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export class Parser {
  #tokens: CharacterToken[] = [];
  #nodes: ParsedNode[] = [];

  constructor(tokens: CharacterToken[]) {
    this.#tokens = tokens;
  }

  private peek(offset: number, ...args: TokenType[]) {
    const contains = args.some((type) => this.#tokens[0].type === type);
    return contains;
  }

  private consume() {
    return this.#tokens.shift();
  }

  private parseCodeBlock(): CodeBlockNode {
    this.consume();
    let text = "";
    let highlight: string | undefined = undefined;
    let firstPass = true;
    while (!this.peek(0, "triple-backtick")) {
      const charToken = this.consume();

      if (firstPass && charToken?.value.match(/^\{.*\}$/)) {
        // it is the highlight lines. eg ```{1,2-3}
        highlight = charToken.value.trim();
      } else if (["html", "js", "ts"].some(x => charToken?.value === x)) {
        // not support syntax highlight at the moment.
      } else {
        // it is some code
        text += sanitize(charToken!.value);
      }
      firstPass = false;
    }
    this.consume(); // matching triple backtick

    return {
      type: "code-block-node",
      text: text.trimStart(),
      highlight: undefined // not supporting this for now,
    };
  }

  private parseBlockQuoteNode(): BlockQuoteNode {
    // consume >
    this.consume();
    const { children } = this.parseParagraphNode();

    return {
      type: "block-quote-node",
      children,
    };
  }

  private parseHeaderNode(): HeaderNode {
    this.consume();
    let text = "";
    while (this.peek(0, "text", "whitespace")) {
      const charToken = this.consume();
      text += charToken!.value;
    }

    return {
      type: "header-node",
      level: 1,
      text,
    };
  }

  private parseItalicNode(): ItalicNode {
    this.consume();
    let text = "";
    while (!this.peek(0, "asterisk")) {
      text += this.consume()!.value;
    }
    this.consume(); // closing backtick

    return {
      type: "italic-node",
      text,
    };
  }

  private parseLinkNode(): LinkNode {
    // consume leading [
    this.consume();
    let text = "";
    while (!this.peek(0, "close-square-bracket")) {
      text += this.consume()!.value;
    }

    this.consume(); // consume trailing ]
    this.consume(); // consume trailing (

    let href = "";
    while (!this.peek(0, "close-circle-bracket")) {
      href += this.consume()!.value;
    }

    this.consume(); // trailing )

    return {
      type: "link-node",
      text,
      href,
    };
  }

  private parseInlineCodeNode(): InlineCodeNode {
    this.consume();
    let text = "";
    while (!this.peek(0, "single-backtick")) {
      text += sanitize(this.consume()!.value);
    }
    this.consume(); // closing backtick

    return {
      type: "inline-code-node",
      text,
    };
  }

  private parseParagraphNode(): ParagraphNode {
    const nodes: EmbeddableNode[] = [];

    while (!this.peek(0, "cr")) {
      if (
        this.peek(
          0,
          "text",
          "whitespace",
          "open-circle-bracket",
          "close-circle-bracket",
        )
      ) {
        const token = this.consume()!;
        nodes.push({
          text: token.value,
          type: "text-node",
        });
      } else if (this.peek(0, "single-backtick")) {
        const inline = this.parseInlineCodeNode();
        nodes.push(inline);
      } else if (this.peek(0, "asterisk") && !this.peek(1, "whitespace")) {
        const inline = this.parseItalicNode();
        nodes.push(inline);
      } else if (
        this.peek(0, "open-square-bracket") && !this.peek(1, "whitespace")
      ) {
        const inline = this.parseLinkNode();
        nodes.push(inline);
      } else {
        throw Error(
          `Found unexpected token: ${JSON.stringify(this.#tokens[0].type)})`,
        );
      }
    }

    return {
      type: "paragraph-node",
      children: nodes,
    };
  }

  parse(): ParsedNode[] {
    while (this.#tokens.length) {
      if (this.peek(0, "EOF")) {
        return this.#nodes;
      }

      if (this.peek(0, "h1")) {
        const headerNode = this.parseHeaderNode();
        this.#nodes.push(headerNode);
      }

      if (this.peek(0, "block-quote")) {
        const node = this.parseBlockQuoteNode();
        this.#nodes.push(node);
      }

      if (this.peek(0, "triple-backtick")) {
        const codeBlockNode = this.parseCodeBlock();
        this.#nodes.push(codeBlockNode);
      }

      if (this.peek(0, "text", "single-backtick")) {
        const node = this.parseParagraphNode();
        this.#nodes.push(node);
      }

      if (this.peek(0, "whitespace", "cr")) {
        this.consume();
      }
    }

    return this.#nodes;
  }
}
