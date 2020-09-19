import { text } from "./data.ts";
import { generate } from "./generator.ts";
import { Parser } from "./parser.ts";
import { tokenize } from "./tokenizer.ts";

const tokens = tokenize(text);
console.log("\n\nTokens:\n", tokens);

const ast = new Parser(tokens).parse();
console.log("\n\nAST:\n", ast);

const output = generate(ast);
console.log("\n\nOutput:\n", output);
