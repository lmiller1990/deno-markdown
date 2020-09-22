export function test(name: string, callback: () => void | Promise<void>) {
  Deno.test(name, callback);
}

export function xtest(name: string, callback: () => void | Promise<void>) {
}
