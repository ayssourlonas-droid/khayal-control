/* 数据层：所有可更新的数字都在这些 JSON 里，代码只读不改。
   更新数据时改 JSON 并同步 asOf 日期，然后跑 npm test。 */
import policy from './policy.json';
import cityData from './cities.json';
import bankData from './banks.json';
import platformData from './platforms.json';
import assetData from './assets.json';
import names from './names.json';
import markets from './markets.json';
import reno from './renovation.json';
import plans from './plans.json';
import glossary from './glossary.json';
import chengdu from './cities/chengdu.json';
import creditcard from './creditcard.json';
import temptations from './temptations.json';

export const POLICY = policy;
export const DATA_AS_OF = policy.asOf;
export const LPR5 = policy.lpr5;
export const GJJ_RATE = policy.gjjRate;
export const GJJ_RATE_SHORT = policy.gjjRateShort;

export const CITIES = cityData.cities;
export const cityById = id => CITIES.find(c => c.id === id) || CITIES[0];

export const BANKS = bankData.banks;
export const PLATFORMS = platformData.platforms;
export const platById = id => PLATFORMS.find(p => p.id === id);
export const ASSETS = assetData.assets;
export const assetById = id => ASSETS.find(a => a.id === id) || ASSETS[3];

export const NAME_A = names.first;
export const NAME_B = names.second;
export const MARKETS = markets;

export const RENO = reno.tiers;
export const RENO_BY_DECO = reno.byDeco;
export const STYLES = reno.styles;
export const TIER_STYLES = reno.tierStyles;
export const RENO_SPLIT = reno.split;

export const PLANS = plans;
export const GLOSSARY = glossary;

/* 深度城市包：cities.json 里城市的 deepPack 字段指向这里 */
export const DEEP_PACKS = { chengdu };
export const deepPackOf = city => city && city.deepPack ? DEEP_PACKS[city.deepPack] : null;
/* 兼容旧代码 */
export const CD_SPECS = chengdu.listings;
export const SEGS = chengdu.segments;

/* 第二关：信用卡规则和消费诱惑 */
export const CARD = creditcard;
export const TEMPT = temptations;
export const KINDS = temptations.kinds;
export const temptById = id => temptations.items.find(x => x.id === id);
