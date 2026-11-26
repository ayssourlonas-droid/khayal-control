import fs from 'node:fs'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'csv-parse'

const args = process.argv.slice(2)
if (args.length < 2) {
  console.error('Usage: node aggregate.mjs csvFileDirectory outputFile')
  process.exit(1)
}
const [csvFileDirectory, outputFile] = args

//

// Tatoeba files are .csv and .tsv but they all use tabs
// Double quotes are used within values, unescaped
function readCSVFile(fileName, callback) {
  const stream = fs.createReadStream(fileName)

  return new Promise((resolve, reject) => {
    stream
      .pipe(parse({ delimiter: '\t', quote: false /* relax_quotes: true */ }))
      .on('data', callback)
      .on('error', (err) => reject(err))
      .on('end', () => resolve())
  })
}

//

/** @type {Map<string, import('../shared.mjs').Sentence>} */
const japaneseSentences = new Map()

await readCSVFile(
  path.join(csvFileDirectory, 'jpn_transcriptions.tsv'),
  ([id, _, __, username, transcription]) => {
    // "A transcription without a username has not been marked as reviewed"
    // https://tatoeba.org/en/downloads
    if (!username) return

    japaneseSentences.set(id, {
      id,
      transcription,
      translations: {},
    })
  },
)

await readCSVFile(
  path.join(csvFileDirectory, 'sentences_with_audio.csv'),
  ([id, audioId, author, _license, _url]) => {
    const sentence = japaneseSentences.get(id)
    if (!sentence) return

    sentence.audio = {
      id: audioId,
      author,
    }
  },
)

const links = new Map()

await readCSVFile(
  path.join(csvFileDirectory, 'links.csv'),
  ([id, translationId]) => {
    const sentence = japaneseSentences.get(id)
    if (!sentence) return

    links.set(translationId, id)
  },
)

await readCSVFile(
  path.join(csvFileDirectory, 'sentences_detailed.csv'),
  ([id, lang, text, _username, _dateAdded, _dateModified]) => {
    // Is this a Japanese sentence?
    const sentence = japaneseSentences.get(id)
    if (sentence) {
      sentence.text = text
      return
    }

    // Does this sentence translate to/from a Japanese sentence?
    const japaneseId = links.get(id)
    if (!japaneseId) return

    // Ignore japanese/japanese translations and invalid language identifiers
    if (['jpn', '\\N'].includes(lang)) return

    // Note: there might already be a `lang` translation
    // Last one wins for lack of a way to decide which one to keep
    japaneseSentences.get(japaneseId).translations[lang] = text
  },
)

const entries = Array.from(japaneseSentences.values()).filter((sentence) => {
  // Some sentences appear in "transcriptions" but not in "sentences_detailed"
  if (!sentence.text) return false

  // Filter out sentences with no translations
  if (Object.keys(sentence.translations).length === 0) return false

  // Filter out sentences that are too long
  if (sentence.text.length > 30) return false

  // Filter out sentences containing spaces
  if (sentence.text.match(/\s/)) return false

  // Filter out sentences containing unsupported characters
  if (sentence.text.match(/[ヶヵゝ]/)) return false

  return true
})

console.log(`Total Japanese sentences: ${japaneseSentences.size}`)
console.log(`Filtered Japanese sentences: ${entries.length}`)

await writeFile(outputFile, JSON.stringify(entries, null, 2))
