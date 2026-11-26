/**
 * @typedef {Object} Sentence
 * @property {string} id
 * @property {string} text
 * @property {string} transcription
 * @property {{[lang: string]: string}} translations
 * @property {{id: string, author: string}?} audio
 */

/**
 * @param {Sentence} sentence
 */
export function parseSentenceObject(sentence) {
  const transcriptionRegex = /\[([^\]]+)\]/g

  // e.g. "[私|わたし]は[月給|げっ|きゅう]です。"
  /** @type {string} */
  const input = sentence.transcription

  let parts = []
  let lastIndex = 0
  let match

  while ((match = transcriptionRegex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      const textWithoutKanji = input.slice(lastIndex, match.index)
      for (const character of textWithoutKanji) {
        parts.push({ text: character })
      }
    }

    lastIndex = transcriptionRegex.lastIndex

    const [kanji, ...kana] = match[1].split('|')

    const reading = [
      kanji.replace(/[\/\?<>\\:\*\|":]/g, '_'),
      kana.join(''),
    ].join('|')

    if (kanji.length === kana.length) {
      for (let i = 0; i < kana.length; i++) {
        parts.push({ text: kanji[i], transcription: kana[i], reading })
      }
    } else {
      parts.push({ text: kanji, transcription: kana.join(''), reading })
    }
  }

  if (lastIndex < input.length) {
    const textWithoutKanji = input.slice(lastIndex)
    for (const character of textWithoutKanji) {
      parts.push({ text: character })
    }
  }

  const readings = parts.reduce((readings, { reading }, i) => {
    if (reading && reading !== parts[i - 1]?.reading) {
      readings.push(reading)
    }
    return readings
  }, [])

  const audio = sentence.audio
    ? {
        ...sentence.audio,
        sources: [
          `https://tatoeba.org/en/audio/download/${sentence.audio.id}`,
          `https://api.tatoeba.org/unstable/audio/${sentence.audio.id}/file`,
        ],
      }
    : null

  return {
    ...sentence,
    parts,
    readings,
    audio,
  }
}
