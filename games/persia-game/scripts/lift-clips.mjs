// Copies the approved clips the levels speak from the lessons repo into public/audio/ and writes
// public/audio/manifest.json with each clip's review provenance. Run from the repo root:
//   node scripts/lift-clips.mjs ../Danish-Persian-Lessons
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const NAMES = {
  'vocabulary-5-sag': 'sag',
  'vocabulary-5-gorbe': 'gorbe',
  'vocabulary-5-asb': 'asb',
  'vocabulary-5-gav': 'gav',
  'vocabulary-5-mahi': 'mahi',
  'vocabulary-5-parande': 'parande',
  'vocabulary-5-khargush': 'khargush',
  'vocabulary-5-mush': 'mush',
  'vocabulary-5-shir': 'shir',
  'vocabulary-5-shotor': 'shotor',
  'vocabulary-5-rubah': 'rubah',
  'number-1-word': 'yek',
  'number-2-word': 'do',
  'number-3-word': 'se',
  'number-4-word': 'chahar',
  'number-5-word': 'panj',
  'number-6-word': 'shesh',
  'number-7-word': 'haft',
  'number-8-word': 'hasht',
  'number-9-word': 'noh',
  'number-10-word': 'dah',
  'number-11-word': 'yazdah',
  'number-12-word': 'davazdah',
  'number-13-word': 'sizdah',
  'number-14-word': 'chahardah',
  'number-15-word': 'panzdah',
  'number-16-word': 'shanzdah',
  'number-17-word': 'hefdah',
  'number-18-word': 'hejdah',
  'number-19-word': 'nuzdah',
  'number-20-word': 'bist',
  'vocabulary-3-baran': 'baran',
  'word-bridge-setareh': 'setare',
  'vocabulary-3-gol': 'gol',
  'vocabulary-3-mah': 'mah',
  'vocabulary-3-aseman': 'aseman',
  'vocabulary-3-khorshid': 'khorshid',
  'vocabulary-3-ranginkaman': 'rangin-kaman',
  'counting-2199-tal-21': 'bist-o-yek',
  'counting-2199-tal-22': 'bist-o-do',
  'counting-2199-tal-23': 'bist-o-se',
  'counting-2199-tal-24': 'bist-o-chahar',
  'counting-2199-tal-25': 'bist-o-panj',
  'counting-2199-tal-26': 'bist-o-shesh',
  'counting-2199-tal-27': 'bist-o-haft',
  'counting-2199-tal-28': 'bist-o-hasht',
  'counting-2199-tal-29': 'bist-o-noh',
  'counting-2199-ti-30': 'si',
  'counting-2199-tal-31': 'si-o-yek',
  'counting-2199-tal-32': 'si-o-do',
  'counting-2199-tal-33': 'si-o-se',
  'counting-2199-tal-34': 'si-o-chahar',
  'counting-2199-tal-35': 'si-o-panj',
  'counting-2199-tal-36': 'si-o-shesh',
  'counting-2199-tal-37': 'si-o-haft',
  'counting-2199-tal-38': 'si-o-hasht',
  'counting-2199-tal-39': 'si-o-noh',
  'counting-2199-ti-40': 'chehel',
  'counting-2199-tal-41': 'chehel-o-yek',
  'counting-2199-tal-42': 'chehel-o-do',
  'counting-2199-tal-43': 'chehel-o-se',
  'counting-2199-tal-44': 'chehel-o-chahar',
  'counting-2199-tal-45': 'chehel-o-panj',
  'counting-2199-tal-46': 'chehel-o-shesh',
  'counting-2199-tal-47': 'chehel-o-haft',
  'counting-2199-tal-48': 'chehel-o-hasht',
  'counting-2199-tal-49': 'chehel-o-noh',
  'counting-2199-ti-50': 'panjah',
};

const lessons = process.argv[2];
if (!lessons) {
  console.error('usage: node scripts/lift-clips.mjs <lessons-repo-dir>');
  process.exit(1);
}

const approved = JSON.parse(readFileSync(join(lessons, 'src/audio/approved.generated.json'), 'utf8'));
// Check every clip before copying any, so a refusal leaves public/audio as it was.
const records = Object.keys(NAMES).map((clipId) => {
  const record = approved.find((r) => r.clipId === clipId);
  if (!record) throw new Error(`${clipId} is not in the approved list`);
  if (!record.reviewedBy?.length) throw new Error(`${clipId} has no reviewer`);
  return record;
});

mkdirSync('public/audio', { recursive: true });
const manifest = records.map((record) => {
  const { clipId, durationMs, transcript, synthesisText, voiceModel, modelSha256, engineVersion, reviewedBy, license } = record;
  const file = `public/audio/${NAMES[clipId]}.mp3`;
  const sourceFile = `public${record.file}`;
  copyFileSync(join(lessons, sourceFile), file);
  const sha256 = createHash('sha256').update(readFileSync(file)).digest('hex');
  return { file, clipId, sha256, durationMs, transcript, synthesisText, voiceModel, modelSha256, engineVersion, reviewedBy, license, sourceFile };
});
writeFileSync('public/audio/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`lifted ${manifest.length} clips into public/audio/`);
