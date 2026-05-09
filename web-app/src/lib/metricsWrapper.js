// metricsWrapper.js
// Thin ES module wrapper around metrics.js (which has no exports — do not modify it).
// This file re-implements the same pure functions so App.jsx can import calculateMetrics.
// metrics.js is kept untouched per AGENTS.md.

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length === 0) return 0;
  const originalWord = word;
  word = word.replace(/e$/, '');
  const matches = word.match(/[aeiouy]+/g);
  let count = matches ? matches.length : 1;
  if (/[^aeiou]le$/.test(originalWord)) count += 1;
  return Math.max(1, count);
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function countSentences(text) {
  let normalized = text.replace(/(\d+)\.(\d+)/g, '$1DECIMAL$2');
  normalized = normalized.replace(/\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|approx|dept|est)\./gi, '$1ABBR');
  const sentences = normalized.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return Math.max(1, sentences.length);
}

function countTotalSyllables(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0)
    .reduce((total, word) => total + countSyllables(word), 0);
}

function countDifficultWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0)
    .filter(w => countSyllables(w) >= 3).length;
}

function fleschScore(words, sentences, syllables) {
  if (words === 0 || sentences === 0) return 0;
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
}

function getReadingTime(wordCount) {
  return Math.round((wordCount / 200) * 10) / 10;
}

export function calculateMetrics(text) {
  const words     = countWords(text);
  const sentences = countSentences(text);
  const syllables = countTotalSyllables(text);
  const difficult = countDifficultWords(text);
  return {
    readabilityScore:  fleschScore(words, sentences, syllables),
    avgSentenceLength: words === 0 ? 0 : Math.round((words / sentences) * 10) / 10,
    difficultWordPct:  words === 0 ? 0 : Math.round((difficult / words) * 1000) / 10,
    readingTime:       getReadingTime(words),
  };
}
