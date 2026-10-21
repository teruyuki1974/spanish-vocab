type VoiceLike = {
  lang: string;
};

export function pickSpanishVoice<T extends VoiceLike>(
  voices: readonly T[],
): T | undefined {
  const spanish = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("es"),
  );
  return (
    spanish.find((voice) => voice.lang.toLowerCase().startsWith("es-es")) ??
    spanish[0]
  );
}

export function speakSpanish(texts: readonly string[]): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  const content = texts.map((text) => text.trim()).filter((text) => text.length > 0);
  if (content.length === 0) return false;

  const synthesis = window.speechSynthesis;
  const voice = pickSpanishVoice(synthesis.getVoices());
  synthesis.cancel();

  for (const text of content) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang ?? "es-ES";
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    synthesis.speak(utterance);
  }

  if (synthesis.paused) synthesis.resume();
  return true;
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
