// tokenizer -> parser -> generator

const text =
`# Title

Welcome to my blog. I wrote my own \`markdown\` to \`html\` compiler.

It even supports code blocks:
\`\`\`{2,5-10,15}
function() {
  return 'code block';
}
\`\`\`

See you next time.`

type TokenType = 'h1' | 'triple-backtick' | 'text' | 'single-backtick' | 'whitespace' | 'cr' | 'EOF'

interface TokenMatch {
  type: TokenType
  regexp: RegExp
}

const tokensMatches: TokenMatch[] = [
  { type: 'h1', regexp: /(.*?#)/ },
  { type: 'cr', regexp: /(\n)$/ },
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
    .filter(x => x.length > 0) // remove ""

  for (const word of words) {
    const tokenType = matchToken(word)
    const token: CharacterToken = {
      type: tokenType.type,
      value: word
    }
    charTokens.push(token)
  }

  charTokens.push({ type: 'cr', value: '' })
  charTokens.push({ type: 'EOF', value: '' })
  return charTokens
}

const tokens = tokenize(text)
console.log("\n\nTokens:\n", tokens)

interface HeaderNode {
  type: 'header-node'
  level: number
  text: string
}

interface CodeBlockNode {
  type: 'code-block-node'
  text: string
  highlight?: string
}

interface InlineCodeNode {
  type: 'inline-code-node'
  text: string
}

interface TextNode {
  type: 'text-node'
  text: string
}

interface ParagraphNode {
  type: 'paragraph-node'
  children: Array<TextNode | InlineCodeNode>
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
    this.consume()
    let text = ''
    let highlight: string | undefined = undefined
    let firstPass = true
    while (!this.peek('triple-backtick')) {
      const charToken = this.consume()

      if (firstPass && charToken?.value.match(/^\{.*\}$/)) {
        // it is the highlight lines. eg ```{1,2-3}
        highlight = charToken.value.trim()
      } else {
        text += charToken!.value
      }
      firstPass = false
    }
    this.consume() // matching triple backtick

    return {
      type: 'code-block-node',
      text: text.trimStart(),
      highlight
    }
  }

  parseHeaderNode(): HeaderNode {
    this.consume()
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
    this.consume()
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
    const nodes: Array<TextNode | InlineCodeNode> = []

    while (!this.peek('cr')) {
      if (this.peek('text', 'whitespace')) {
        const token = this.consume()!
        nodes.push({
          text: token.value,
          type: 'text-node'
        })
      } else if (this.peek('single-backtick')) {
        const inline = this.parseInlineCodeNode()
        nodes.push(inline)
      } else {
        throw Error(`Found unexpected token: ${JSON.stringify(this.#tokens[0].type)})`)
      }
    }

    return {
      type: 'paragraph-node',
      children: nodes
    }
  }

  parse() {
    while (this.#tokens.length) {
      // const token = tokens.shift()
      if (this.peek('EOF')) {
        return this.#nodes
      }

      if (this.peek('h1')) {
        const headerNode = this.parseHeaderNode()
        this.#nodes.push(headerNode)
      }

      if (this.peek('triple-backtick')) {
        const codeBlockNode = this.parseCodeBlock()
        this.#nodes.push(codeBlockNode)
      }

      if (this.peek('text', 'single-backtick')) {
        const node = this.parseParagraphNode()
        this.#nodes.push(node)
      }

      if (this.peek('whitespace', 'cr')) {
        this.consume()
      }
    }

    return this.#nodes
  }
}

const ast = new Parser(tokens).parse()
console.log("\n\nAST:\n", ast)

function generate(nodes: ParsedNode[]) {
  let text = ''

  for (const node of nodes) {
    if (node.type === 'header-node') {
      text += `<h${node.level}>${node.text}</h${node.level}>\n`
    }

    if (node.type === 'paragraph-node') {
      text += '<p>'
      for (const word of node.children) {
        if (word.type === 'text-node') {
          text += word.text
        }

        if (word.type === 'inline-code-node') {
          text += `<code>${word.text}</code>`
        }
      }
      text += '</p>'
    }

    if (node.type === 'code-block-node') {
      text += `<pre data-line="${node.highlight}"><code>`
      text += `${node.text}`
      text += `</pre></code>\n`
    }
  }

  return text
}

const output = generate(ast)
console.log("\n\nOutput:\n", output)