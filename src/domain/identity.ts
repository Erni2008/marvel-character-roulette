import type { Character } from './game';
/** Original colour identities for the text catalogue. No third-party artwork is bundled. */
export interface Identity {
  a: string; // primary
  b: string; // secondary
  glow: string;
  pattern: 'rays' | 'rings' | 'grid' | 'diamond' | 'bolt' | 'web';
}
const table: Record<string, [string, string, string, Identity['pattern']]> = {
  '001': ['#d4142a', '#1b3fa8', '#ff4b5c', 'web'],
  '002': ['#b3121d', '#e0a526', '#ffcc55', 'rings'],
  '003': ['#1f4fbf', '#c8102e', '#7fb0ff', 'rings'],
  '004': ['#2b4f91', '#c21f2c', '#9fd4ff', 'bolt'],
  '005': ['#2f8f2f', '#5a2a82', '#8dff6a', 'grid'],
  '006': ['#17171c', '#c8102e', '#ff3b4f', 'diamond'],
  '007': ['#4b2a7a', '#1e1e26', '#b98cff', 'rays'],
  '008': ['#1a1530', '#7b4dff', '#b49bff', 'diamond'],
  '009': ['#2a3b9e', '#d07a14', '#ffb347', 'rings'],
  '010': ['#9e1035', '#3c0b23', '#ff4f8a', 'rays'],
  '011': ['#2f7d55', '#a3163b', '#ffd24a', 'grid'],
  '012': ['#c8102e', '#1d3c9a', '#ffd24a', 'rays'],
  '013': ['#e1b81b', '#1b3f8f', '#ffe066', 'diamond'],
  '014': ['#9b0f1f', '#1a1a1a', '#ff3048', 'rings'],
  '015': ['#3a4d7a', '#e8eef8', '#d9ecff', 'bolt'],
  '016': ['#1d3f8f', '#e1b81b', '#ff4040', 'rays'],
  '017': ['#8a1238', '#5a1b8c', '#ff5a8a', 'diamond'],
  '018': ['#28416e', '#a8b4c8', '#a8d8ff', 'rings'],
  '019': ['#d44412', '#e1b81b', '#ffae3a', 'rays'],
  '020': ['#1d6b3a', '#d8b437', '#7dffa8', 'diamond'],
  '021': ['#6a1f6e', '#c13a77', '#ff7ae0', 'diamond'],
  '022': ['#232c7a', '#b3122a', '#8f9bff', 'grid'],
  '023': ['#a3172c', '#c9ced8', '#dfe8f5', 'grid'],
  '024': ['#8b3b16', '#4b4f59', '#ff8a3d', 'grid'],
  '025': ['#0b0b10', '#e8e8f0', '#c8c8ff', 'web'],
  '026': ['#b3001b', '#1a0005', '#ff2040', 'web'],
  '027': ['#1f6b3a', '#d4af37', '#7dff9e', 'diamond'],
  '028': ['#5b6475', '#c8102e', '#ff4050', 'grid'],
  '029': ['#5a2a8c', '#d4a017', '#ffcf3a', 'rings'],
  '030': ['#2e5c3a', '#7d8590', '#9effa8', 'grid'],
  '031': ['#9fb2c8', '#3a5f9e', '#e6f3ff', 'rays'],
  '032': ['#d44a0c', '#151515', '#ff8a1f', 'rays'],
  '033': ['#8f0d1a', '#2a0508', '#ff2b3c', 'diamond'],
  '034': ['#b3122a', '#2b2b33', '#ff5a6a', 'rings'],
  '035': ['#d4a017', '#1a1a1a', '#ffe14a', 'diamond'],
  '036': ['#7a2318', '#c59a5c', '#ff9c5a', 'rays'],
  '037': ['#1f7a52', '#3b1f4f', '#6bffb8', 'diamond'],
  '038': ['#b85d1a', '#2e5a7a', '#ffa35a', 'grid'],
  '039': ['#5a3a1c', '#4f7a2a', '#a6e36a', 'rings'],
  '040': ['#2f5d9e', '#5a2a6e', '#7fc8ff', 'grid'],
  '041': ['#5a2a82', '#1f7a3a', '#7dff6a', 'diamond'],
  '042': ['#2a1a3a', '#7b4dff', '#c08cff', 'web'],
  '043': ['#7a1414', '#1f5a2a', '#ff9a3a', 'rings'],
  '044': ['#2a6a3a', '#1a1a1a', '#6dff9a', 'rays'],
  '045': ['#1f6b3a', '#d4af37', '#8dffb0', 'diamond'],
  '046': ['#1a3a6a', '#b3122a', '#ff9a3a', 'rays'],
  '047': ['#b3301a', '#3a0a08', '#ff7a3a', 'grid'],
  '048': ['#6a1a1a', '#5a4a1a', '#ffb35a', 'grid'],
  '049': ['#4a1a6a', '#d4a017', '#d9a0ff', 'rings'],
  '050': ['#7a2a1a', '#3a1a10', '#ff7a4a', 'grid'],
  '051': ['#4a2a6a', '#8a5a1a', '#ffb35a', 'rays'],
  '052': ['#0a2a3a', '#1a1a2a', '#5adfff', 'web'],
  '053': ['#4a2a6a', '#7a1a2a', '#c08cff', 'diamond'],
  '054': ['#2a2a2a', '#a8841a', '#ffd35a', 'rings'],
  '055': ['#9a1a1a', '#1a1a1a', '#ff5a5a', 'bolt'],
  '056': ['#3a3a46', '#1a1a1a', '#ffb84a', 'grid'],
  '057': ['#7a4a1a', '#3a2a1a', '#ffa35a', 'rays'],
  '058': ['#1a3a8a', '#b3122a', '#ff5a5a', 'web'],
  '059': ['#1f4a2a', '#1a1a1a', '#7dff9a', 'rays'],
  '060': ['#1a1a2a', '#9a1a2a', '#ff4a6a', 'diamond'],
  '061': ['#7a3a1a', '#2a3a1a', '#ffa35a', 'grid'],
  '062': ['#1a4a6a', '#9a1a8a', '#ff5aef', 'rings'],
  '063': ['#4a1a6a', '#a8841a', '#d9a0ff', 'rays'],
  '064': ['#7a1a1a', '#2a1a1a', '#ff5a5a', 'web'],
  '065': ['#2a2a3a', '#d4a017', '#ffd35a', 'bolt'],
  '066': ['#3a1a4a', '#b3301a', '#ff7a3a', 'diamond'],
  '067': ['#1f4a2a', '#5a5a6a', '#8dffb0', 'grid'],
  '068': ['#9a1a2a', '#3a0a10', '#ff5a7a', 'rings'],
  '069': ['#2a4a2a', '#1a2a1a', '#9aff7a', 'grid'],
  '070': ['#1f4a2a', '#a8841a', '#8dffb0', 'diamond'],
  '071': ['#1a3a8a', '#c8102e', '#7fc8ff', 'bolt'],
  '072': ['#2a3a6a', '#8a8a9a', '#c08cff', 'rings'],
  '073': ['#1a3a8a', '#c8102e', '#ffd35a', 'rings'],
  '074': ['#3a1a4a', '#9a1a5a', '#d9a0ff', 'web'],
  '075': ['#3a3a46', '#1a1a1a', '#c8ccd8', 'grid'],
  '076': ['#7a4a1a', '#2a2a3a', '#ffa35a', 'grid'],
  '077': ['#b3501a', '#1f3a1a', '#ffa33a', 'rays'],
  '078': ['#0a1a2a', '#1a1a1a', '#5adfff', 'web'],
  '079': ['#a8741a', '#5a3a1a', '#ffd35a', 'bolt'],
  '080': ['#2a2a2e', '#5a5a6a', '#ff5a5a', 'grid'],
  '081': ['#7a1a3a', '#d4a017', '#9ab8ff', 'rings'],
  '082': ['#7a1414', '#1a1a1a', '#5adfff', 'rays'],
  '083': ['#5a1a6a', '#3a3a4a', '#d9a0ff', 'grid'],
  '084': ['#1a1a1a', '#c8107a', '#ff7ad9', 'diamond'],
  '085': ['#d8d8d8', '#2a5a2a', '#9aff9a', 'rings'],
  '086': ['#1f6b3a', '#c8104a', '#8dffb0', 'diamond'],
  '087': ['#5a4a1a', '#0a1a2a', '#5adfff', 'web'],
  '088': ['#5a5aaa', '#c8501a', '#ff9a3a', 'web'],
  '089': ['#9a3a1a', '#c8102e', '#ffa35a', 'bolt'],
  '090': ['#3a1a5a', '#a8841a', '#c08cff', 'diamond'],
  '091': ['#3a3a6a', '#d8d8e8', '#c8a0ff', 'rays'],
  '092': ['#3a2a8a', '#d4a017', '#5adfff', 'grid'],
  '093': ['#1f5a2a', '#9a1a2a', '#7dffb0', 'rings'],
  '094': ['#1a1a1a', '#d8d8d8', '#ff4a5a', 'grid'],
  '095': ['#c8102e', '#e8e0d0', '#ff5a5a', 'rays'],
  '097': ['#2f3a2a',  '#7fc241',  '#b6ff6a',  'grid'],
  '098': ['#1c1c22',  '#8a8a94',  '#ff3030',  'rays'],
  '099': ['#5a0f12',  '#d4a017',  '#7fdcff',  'grid'],
  '100': ['#2a2c33',  '#c9ccd4',  '#ff4a4a',  'grid'],
  '101': ['#2c1a4a',  '#b9bcc8',  '#c46bff',  'grid'],
  '102': ['#4a0f12',  '#3d7fd1',  '#6fc0ff',  'rays'],
  '103': ['#1e0f2e',  '#8a3fd1',  '#c46bff',  'grid'],
  '104': ['#2e2a1a',  '#c9a227',  '#ffd35a',  'grid'],
  '105': ['#4a0f2a',  '#e0306a',  '#ff6a9a',  'rays'],
  '106': ['#14121c',  '#c21f5a',  '#5affd0',  'rays'],
  '107': ['#0f1a3a',  '#2fa8ff',  '#ffb020',  'rays'],
  '096': ['#2a2a2e', '#d4a017', '#ffd35a', 'grid'],
};
const fallback: Identity['pattern'][] = ['rays', 'rings', 'grid', 'diamond', 'bolt', 'web'];
export function identity(c?: Character | null): Identity {
  if (!c) return { a: '#c8102e', b: '#1a1f2e', glow: '#ff3b4f', pattern: 'rays' };
  const row = table[c.id.slice(-3)];
  if (row) return { a: row[0], b: row[1], glow: row[2], pattern: row[3] };
  let h = 0;
  for (const ch of c.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  return {
    a: `hsl(${hue} 70% 38%)`,
    b: `hsl(${(hue + 150) % 360} 45% 22%)`,
    glow: `hsl(${hue} 95% 65%)`,
    pattern: fallback[h % fallback.length],
  };
}
export function monogram(name: string) {
  const words = name
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .split(/[\s-]+/)
    .filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
export function asset(path: string) {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
