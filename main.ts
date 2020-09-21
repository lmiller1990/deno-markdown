import { readStringDelim } from "https://deno.land/std/io/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { generate } from "./generator.ts";
import { Parser } from "./parser.ts";
import { tokenize } from "./tokenizer.ts";

const filename = join(Deno.cwd(), Deno.args[0]);
let fileReader = await Deno.open(filename);

let content = "";
for await (let line of readStringDelim(fileReader, "\n")) {
  content += line + "\n";
}
fileReader.close()

const tokens = tokenize(content);
console.log("\n\nTokens:\n", tokens);

const ast = new Parser(tokens).parse();
console.log("\n\nAST:\n", ast);

const output = generate(ast);
console.log("\n\nOutput:\n", output);
