// metrics.js
// Pure functions for readability scoring. No dependencies.
// Flesch-Kincaid: Score = 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length === 0) return 0;
  const originalWord = word;
  // Remove silent e at end
  word = word.replace(/e$/, '');
  // Count vowel groups
  const matches = word.match(/[aeiouy]+/g);
  let count = matches ? matches.length : 1;
  // Consonant+le ending (e.g. table, people, simple) loses a syllable from the e-strip — add it back
  if (/[^aeiou]le$/.test(originalWord)) count += 1;
  return Math.max(1, count);
}

function countWords(text) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

function countSentences(text) {
  // Replace decimal numbers and common abbreviations so dots aren't treated as sentence boundaries
  let normalized = text.replace(/(\d+)\.(\d+)/g, '$1DECIMAL$2');
  normalized = normalized.replace(/\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|approx|dept|est)\./gi, '$1ABBR');
  const sentences = normalized.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return Math.max(1, sentences.length);
}

function countTotalSyllables(text) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return words.reduce((total, word) => total + countSyllables(word), 0);
}

function countDifficultWords(text) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const difficult = words.filter(w => countSyllables(w) >= 3);
  return difficult.length;
}

function fleschScore(words, sentences, syllables) {
  if (words === 0 || sentences === 0) return 0;
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
}

function getReadingTime(wordCount) {
  // 200 words per minute
  return Math.round((wordCount / 200) * 10) / 10;
}

function calculateMetrics(text) {
  const words      = countWords(text);
  const sentences  = countSentences(text);
  const syllables  = countTotalSyllables(text);
  const difficult  = countDifficultWords(text);

  return {
    readabilityScore:  fleschScore(words, sentences, syllables),
    avgSentenceLength: words === 0 ? 0 : Math.round((words / sentences) * 10) / 10,
    difficultWordPct:  words === 0 ? 0 : Math.round((difficult / words) * 1000) / 10,
    readingTime:       getReadingTime(words)
  };
}
