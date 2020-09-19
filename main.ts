// tokenizer -> parser -> generator

const text =
`# Title

some \`inline code\`.
\`testing\` \`inline\`

\`\`\`
function() {
  return 'code block';
}
\`\`\``

type TokenType = 'h1' | 'triple-backtick' | 'text' | 'single-backtick' | 'whitespace' | 'cr' | 'EOF'

interface TokenMatch {
  type: TokenType
  regexp: RegExp
}

const tokensMatches: TokenMatch[] = [
  { type: 'h1', regexp: /(.*?#)/ },
  { type: 'cr', regexp: /(\n)/ },
  { type: 'triple-backtick', regexp: /^\s?(```)/ },
  { type: 'single-backtick', regexp: /^(\s?`)/ },
  { type: 'text', regexp: /(\s?.+?)/ },
  { type: 'whitespace', regexp: /(\s)/ },
]

interface CharacterToken {
  type: TokenType
  value: string
}

function matchToken(word: string): TokenMatch {
  for (const token of tokensMatches) {
    const matches = word.match(token.regexp)
    if (matches && matches[1]) {
      return token
    }
  }

  throw Error(`No match found for "${word}"`)
}

function tokenize(text: string) {
  const charTokens: CharacterToken[] = []
  const words = text.split(/(?=\s)/) /// split by whitespace, keep the whitespace.
    .flatMap(x => x.split(/(\u0060{3})/)) // split by ```
    .flatMap(x => x.includes('```')
      ? x // do not split code block backticks further.
      : x.split(/(\u0060)/) // inline code.
    )
    .map(x => x.startsWith("\n") && x.length > 1 
      ? x.trimStart() // remove leading carriage returns
      : x)
    .filter(x => x.length > 0) // remove ""

  for (const word of words) {
    const tokenType = matchToken(word)
    const token: CharacterToken = {
      type: tokenType.type,
      value: word
    }
    charTokens.push(token)
  }

  charTokens.push({ type: 'EOF', value: '' })
  return charTokens
}

const tokens = tokenize(text)
console.log(tokens)

interface HeaderNode {
  type: 'header-node'
  level: number
  text: string
}

interface CodeBlockNode {
  type: 'code-block-node'
  text: string
}

interface InlineCodeNode {
  type: 'inline-code-node'
  text: string
}

interface ParagraphNode {
  type: 'paragraph-node'
  text: string
}

type ParsedNode = HeaderNode | CodeBlockNode | InlineCodeNode | ParagraphNode

class Parser {
  #tokens: CharacterToken[] = []
  #nodes: ParsedNode[] = []

  constructor(tokens: CharacterToken[]) {
    this.#tokens = tokens
  }

  peek(...args: TokenType[]) {
    const contains = args.some(type => this.#tokens[0].type === type)
    return contains
  }

  consume() {
    return this.#tokens.shift()
  }


  parseCodeBlock(): CodeBlockNode {
    let text = ''
    while (!this.peek('triple-backtick')) {
      const charToken = this.consume()
      text += charToken!.value
    }
    this.consume() // matching triple backtick

    return {
      type: 'code-block-node',
      text
    }
  }

  parseHeaderNode(): HeaderNode {
    let text = ''
    while (this.peek('text', 'whitespace')) {
      const charToken = this.consume()
      text += charToken!.value
    }

    return {
      type: 'header-node',
      level: 1,
      text
    }
  }

  parseInlineCodeNode(): InlineCodeNode {
    let text = ''
    while (!this.peek('single-backtick')) {
      text += this.consume()!.value
    }
    this.consume() // closing backtick

    return {
      type: 'inline-code-node',
      text
    }
  }

  parseParagraphNode(): ParagraphNode {
    let text = ''
    while (this.peek('text', 'whitespace')) {
      const token = this.consume()!
      text += token.value
      console.log(this.#tokens[0])
    }

    return {
      type: 'paragraph-node',
      text
    }
  }

  parse() {
    while (this.#tokens.length) {
      // const token = tokens.shift()
      if (!token || token.type === 'EOF') {
        return this.#nodes
      }

      if (token.type === 'h1') {
        const headerNode = this.parseHeaderNode()
        this.#nodes.push(headerNode)
      }

      if (token.type === 'single-backtick') {
        const node = this.parseInlineCodeNode()
        this.#nodes.push(node)
      }

      if (token.type === 'triple-backtick') {
        const codeBlockNode = this.parseCodeBlock()
        this.#nodes.push(codeBlockNode)
      }

      if (token.type === 'text') {
        const node = this.parseParagraphNode()
        this.#nodes.push(node)
      }
    }

    return this.#nodes
  }
}

const ast = new Parser(tokens).parse()
console.log(
  ast
)