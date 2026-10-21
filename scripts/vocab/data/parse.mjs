export function pairs(text) {
  return text
    .trim()
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const tab = line.indexOf("\t");
      if (tab < 0) throw new Error(`タブがありません: ${line}`);
      return [line.slice(0, tab).trim(), line.slice(tab + 1).trim()];
    });
}
