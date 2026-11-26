import { readFile } from 'node:fs/promises'

const args = process.argv.slice(2)
if (args.length < 1) {
  console.error('Usage: node list.mjs aggregateJsonFile')
  process.exit(1)
}
const [aggregateJsonFile] = args

//

const japaneseEntries = await readFile(aggregateJsonFile)
  .then((data) => JSON.parse(data))
  .catch((err) => {
    console.error("Couldn't load JSON file", err)
    process.exit(1)
  })

// Remove kanji and its transcription
// "transcription": "ギター[弾|ひ]けるようになりたい。"
const allTheCharactersExceptKanji = new Set(
  japaneseEntries
    .map((entry) => entry.transcription.replace(/\[.*?\]/g, ''))
    .join(''),
)

console.log([...allTheCharactersExceptKanji].sort().join(''))

/* 

 !"%&(),.?]{}—―”…　、。「」『』〜
 ヴヵヶ・ー！（），．／：；？｢｣
 ぁあいぅうぇえぉおかがきぎくぐけげこごさざしじ
 すずせぜそぞただちぢっつづてでとどなにぬねの
 はばぱひびぴふぶぷへべぺほぼぽまみむめも
 ゃやゅゆょよらりるれろわゐゑをんゝ
 ァアィイゥウェエォオカガキギクグケゲコゴサザシジ
 スズセゼソゾタダチッツテデトドナニヌネノ
 ハバパヒビピフブプヘベペホボポマミムメモ
 ャヤュユョヨラリルレロワヱヲン

*/
