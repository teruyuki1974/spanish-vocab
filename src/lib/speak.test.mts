import assert from "node:assert/strict";
import { test } from "node:test";
import { pickSpanishVoice } from "./speak";

test("スペインの音声を優先し、無ければ他のスペイン語音声を使う", () => {
  const voices = [
    { lang: "ja-JP", name: "日本語" },
    { lang: "es-MX", name: "メキシコ" },
    { lang: "es-ES", name: "スペイン" },
  ];
  assert.equal(pickSpanishVoice(voices)?.name, "スペイン");
  assert.equal(
    pickSpanishVoice([{ lang: "en-US" }, { lang: "es-AR" }])?.lang,
    "es-AR",
  );
  assert.equal(pickSpanishVoice([{ lang: "ja-JP" }]), undefined);
});
