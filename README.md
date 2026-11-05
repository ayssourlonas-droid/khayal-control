# khayal-control — كل ما يخص ألعاب الويب

هذا المستودع هو «مصنع ألعاب الويب» لتطبيق خيال، ويجمع في مكان واحد:

| المسار | ما فيه |
|---|---|
| `games/<اسم>/` | ملفات كل لعبة منشورة (يكتبها الاستيراد، ويخدمها Cloudflare Pages) |
| `legal/credits.html` | صفحة حقوق الألعاب والمطورين (يولّدها الاستيراد تلقائياً) |
| `data_games.json` | الألعاب الظاهرة للاعبين |
| `data_games_featured.json` | الألعاب المميزة |
| `data_games_pending.json` | ألعاب بانتظار مراجعتك (تظهر في تبويب «للمراجعة» بالمتحكم) |
| `data_import_index.json` | فهرس كشف التكرار (اسم + حجم المستودع) |
| `version.json` | رقم آخر إصدار من خيال وروابط الدعم والشروط والخصوصية |
| `.github/workflows/import-game.yml` | خط الاستيراد: فحص الرخصة ← بناء ← اختبار ← نشر |
| `.github/workflows/health-check.yml` | فحص أسبوعي لسلامة كل لعبة منشورة |
| `.github/workflows/unzip.yml` | يفك ملف زيب مرفوع (للاستعمال من الهاتف) |
| `tools/` | سكربتات الاستيراد والفحص (انظر `tools/import_game/README.md`) |
| `host_template/` | قوالب الشروط والخصوصية، وWorker النطاقات الفرعية (اختياري) |

تطبيقا خيال والمتحكم في مستودع آخر (`Khayal.flutter`) ويقرآن البيانات من هنا.

## الإعداد مرة واحدة

1. اجعل المستودع **Public** (خيال يقرأ ملفات JSON من `raw.githubusercontent.com`).
2. اربطه بـ **Cloudflare Pages**: Workers & Pages ← Create ← Pages ← Connect to Git ← هذا المستودع. بلا أمر بناء، ومجلد الإخراج `/` (الجذر). بعد أول نشر تأخذ رابطاً مثل `https://xxxx.pages.dev`.
3. في **Settings ← Secrets and variables ← Actions ← Variables** أضف: `HOST_BASE_URL` = رابط Pages بلا `/` في آخره.
4. لا تحتاج `HOST_REPO` ولا `DATA_REPO` ولا `PUBLISH_TOKEN`: المستودع يستعمل نفسه ويدفع بصلاحية `contents: write` التي في الـworkflow. (تبقى المتغيرات اختيارية إن أردت فصل الاستضافة عن البيانات.)
5. في **Settings ← Actions ← General ← Workflow permissions** اختر **Read and write permissions** إن فشل النشر بخطأ صلاحية.

## دفعة واحدة لكل لعبة

عند استعمال مستودع واحد للاستضافة والبيانات يدفع الاستيراد **commit واحداً** لكل لعبة (ملفاتها + البيانات + الحقوق)، فيكون ذلك **بناء Cloudflare واحداً** فقط (الحد المجاني نحو 500 بناء شهرياً).

## ملاحظة عن unzip.yml

شغّله مرة واحدة فقط لرفع أول نسخة. لا تعد رفع زيب فيه `data_games.json` بعد بدء النشر، فسيستبدل ملفات البيانات بالفارغة ويمحو سجل الألعاب.

## أول تشغيل

من تطبيق المتحكم ← الإعدادات: GitHub (المالك `ayssourlonas-droid`، المستودع `khayal-control`) و«مستودع الاستيراد» بالقيم نفسها. ثم «استيراد» أو «اكتشاف».
