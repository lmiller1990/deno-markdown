import { generate } from "./generator.ts";
import { Parser } from "./parser.ts";
import { tokenize } from "./tokenizer.ts";

const text = `# Title

Welcome to my blog. I wrote my own \`markdown\` to \`html\` compiler.

It even supports code blocks:
\`\`\`{2,5-10,15}
function() {
  return 'code block';
}
\`\`\`

See you next time!!`;

const tokens = tokenize(text);
console.log("\n\nTokens:\n", tokens);

const ast = new Parser(tokens).parse();
console.log("\n\nAST:\n", ast);

const output = generate(ast);
console.log("\n\nOutput:\n", output);
