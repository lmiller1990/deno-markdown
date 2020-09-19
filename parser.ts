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

export interface InlineCodeNode {
  type: "inline-code-node";
  text: string;
}

export interface TextNode {
  type: "text-node";
  text: string;
}

export interface ParagraphNode {
  type: "paragraph-node";
  children: Array<TextNode | InlineCodeNode>;
}

export type ParsedNode =
  | HeaderNode
  | CodeBlockNode
  | InlineCodeNode
  | ParagraphNode;

export class Parser {
  #tokens: CharacterToken[] = [];
  #nodes: ParsedNode[] = [];

  constructor(tokens: CharacterToken[]) {
    this.#tokens = tokens;
  }

  peek(...args: TokenType[]) {
    const contains = args.some((type) => this.#tokens[0].type === type);
    return contains;
  }

  consume() {
    return this.#tokens.shift();
  }

  parseCodeBlock(): CodeBlockNode {
    this.consume();
    let text = "";
    let highlight: string | undefined = undefined;
    let firstPass = true;
    while (!this.peek("triple-backtick")) {
      const charToken = this.consume();

      if (firstPass && charToken?.value.match(/^\{.*\}$/)) {
        // it is the highlight lines. eg ```{1,2-3}
        highlight = charToken.value.trim();
      } else {
        text += charToken!.value;
      }
      firstPass = false;
    }
    this.consume(); // matching triple backtick

    return {
      type: "code-block-node",
      text: text.trimStart(),
      highlight,
    };
  }

  parseHeaderNode(): HeaderNode {
    this.consume();
    let text = "";
    while (this.peek("text", "whitespace")) {
      const charToken = this.consume();
      text += charToken!.value;
    }

    return {
      type: "header-node",
      level: 1,
      text,
    };
  }

  parseInlineCodeNode(): InlineCodeNode {
    this.consume();
    let text = "";
    while (!this.peek("single-backtick")) {
      text += this.consume()!.value;
    }
    this.consume(); // closing backtick

    return {
      type: "inline-code-node",
      text,
    };
  }

  parseParagraphNode(): ParagraphNode {
    const nodes: Array<TextNode | InlineCodeNode> = [];

    while (!this.peek("cr")) {
      if (this.peek("text", "whitespace")) {
        const token = this.consume()!;
        nodes.push({
          text: token.value,
          type: "text-node",
        });
      } else if (this.peek("single-backtick")) {
        const inline = this.parseInlineCodeNode();
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

  parse() {
    while (this.#tokens.length) {
      // const token = tokens.shift()
      if (this.peek("EOF")) {
        return this.#nodes;
      }

      if (this.peek("h1")) {
        const headerNode = this.parseHeaderNode();
        this.#nodes.push(headerNode);
      }

      if (this.peek("triple-backtick")) {
        const codeBlockNode = this.parseCodeBlock();
        this.#nodes.push(codeBlockNode);
      }

      if (this.peek("text", "single-backtick")) {
        const node = this.parseParagraphNode();
        this.#nodes.push(node);
      }

      if (this.peek("whitespace", "cr")) {
        this.consume();
      }
    }

    return this.#nodes;
  }
}
