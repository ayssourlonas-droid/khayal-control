import fs from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseSentenceObject } from '../shared.mjs'

const args = process.argv.slice(2)
if (args.length < 3) {
  process.exit(1)
}
const [
  aggregateJsonFile,
  languageNamesJsonFile,
  chunkSizeJsonFile,
  outputDirectory,
] = args

//

const languageNames = await readFile(languageNamesJsonFile).then((data) =>
  JSON.parse(data),
)
const chunkSize = await readFile(chunkSizeJsonFile).then((data) =>
  JSON.parse(data),
)

//

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

//

const japaneseEntries = await readFile(aggregateJsonFile)
  .then((data) => JSON.parse(data))
  .catch((err) => {
    console.error("Couldn't load JSON file", err)
    process.exit(1)
  })

japaneseEntries.sort((a, b) => parseInt(a.id) - parseInt(b.id))

ensureDir(outputDirectory)

// From now on, `id` refers to the index of the sentence in
// the `japaneseEntries` data structure, and NOT its Tatoeba id.

// Store sentences in chunks of `chunkSize` instead of separate files
// to avoid having hundreds of thousands of files which slows down tooling

const chunksDirectory = path.join(outputDirectory, 'chunks')
ensureDir(chunksDirectory)

await Promise.all(
  Array.from({ length: Math.ceil(japaneseEntries.length / chunkSize) }).map(
    (_, chunkIndex) => {
      const entries = japaneseEntries.slice(
        chunkIndex * chunkSize,
        (chunkIndex + 1) * chunkSize,
      )
      return writeFile(
        path.join(chunksDirectory, `${chunkIndex}.json`),
        JSON.stringify(entries, null, 2),
      )
    },
  ),
)

// TODO: knowing the number of sentences makes this obsolete

await writeFile(
  path.join(outputDirectory, 'sentences.json'),
  JSON.stringify(japaneseEntries.map((_, id) => id)),
)

// Index of sentences that have audio

await writeFile(
  path.join(outputDirectory, 'sentences-with-audio.json'),
  JSON.stringify(
    japaneseEntries
      .map((entry, id) => [entry, id])
      .filter(([{ audio }]) => audio)
      .map(([_, id]) => id),
  ),
)

// Indices of sentences that have a translation to a given language

const idsByLang = {}
japaneseEntries.forEach(({ translations }, id) => {
  for (const lang of Object.keys(translations)) {
    if (!languageNames[lang]) {
      console.log('WARNING: unknown language (skipping)', lang)
      continue
    }
    if (!idsByLang[lang]) idsByLang[lang] = new Set()
    idsByLang[lang].add(id)
  }
})

await writeFile(
  path.join(outputDirectory, 'languages.json'),
  JSON.stringify(
    Object.keys(idsByLang).map((lang) => ({ lang, name: languageNames[lang] })),
    null,
    2,
  ),
)

ensureDir(path.join(outputDirectory, 'sentences-by-language'))

for (const [lang, ids] of Object.entries(idsByLang)) {
  await writeFile(
    path.join(outputDirectory, 'sentences-by-language', `${lang}.json`),
    JSON.stringify(Array.from(ids)),
  )
}

// Indices of sentences containing a given reading

/* 

const idsByReading = {}
japaneseEntries.forEach((sentence, id) => {
  const { readings } = parseSentenceObject(sentence)
  for (const reading of readings) {
    if (!idsByReading[reading]) idsByReading[reading] = new Set()
    idsByReading[reading].add(id)
  }
})

await writeFile(
  path.join(outputDirectory, 'sentences-by-reading.json'),
  JSON.stringify(
    // Convert sets to arrays
    Object.fromEntries(
      Object.entries(idsByReading).map(([reading, ids]) => [reading, [...ids]]),
    ),
  ),
)

ensureDir(path.join(outputDirectory, 'sentences-by-reading'))

for (const [reading, ids] of Object.entries(idsByReading)) {
  await writeFile(
    path.join(outputDirectory, 'sentences-by-reading', `${reading}.json`),
    JSON.stringify(Array.from(ids)),
  )
} 

*/

// Index of readings contained in each sentence

await writeFile(
  path.join(outputDirectory, 'readings-by-sentence.json'),
  JSON.stringify(
    japaneseEntries.map((sentence) => {
      const { readings } = parseSentenceObject(sentence)
      return readings
    }),
  ),
)
