// Static data for the MibeLore page

export interface LoreLink {
  title: string
  url: string
  description?: string
}

export interface SitePageLink {
  label: string
  url: string
  description: string
}

export interface FugitiveCard {
  handle: string
  displayName: string
  alias?: string
  profile: string
  facts: string
  avatarUrl?: string
}

export interface FractureStage {
  phase: number
  name: string
  symbol: string
  contract: string
  description: string
  label: string
  imageUrl: string
}

export const LORE_DOCUMENTS: LoreLink[] = [
  {
    title: 'Official Lore',
    url: 'https://github.com/0xHoneyJar/mibera-codex/blob/main/core-lore/official-lore.md',
    description: 'The canonical Mibera creation story and universe',
  },
  {
    title: 'Philosophy',
    url: 'https://github.com/0xHoneyJar/mibera-codex/blob/main/core-lore/philosophy.md',
    description: 'The philosophical foundations of the Mibera universe',
  },
  {
    title: 'Archetypes',
    url: 'https://github.com/0xHoneyJar/mibera-codex/blob/main/core-lore/archetypes.md',
    description: 'Freetekno, Milady, Acidhouse, Chicago/Detroit',
  },
  {
    title: 'Drug & Tarot System',
    url: 'https://github.com/0xHoneyJar/mibera-codex/blob/main/core-lore/drug-tarot-system.md',
    description: '78 substances mapped to tarot arcana',
  },
  {
    title: 'Grails',
    url: 'https://github.com/0xHoneyJar/mibera-codex/blob/main/browse/grails.md',
    description: '42 hand-drawn 1/1 masterpieces',
  },
  {
    title: 'Swag Scoring',
    url: 'https://github.com/0xHoneyJar/mibera-codex/tree/main/swag-scoring',
    description: 'The SSS-F ranking methodology',
  },
  {
    title: 'Fractures — The Reveal Timeline',
    url: 'https://github.com/0xHoneyJar/mibera-codex/blob/main/fractures/README.md',
    description: '10 soulbound ERC-721 collections marking the progressive reveal',
  },
]

export const OFFICIAL_SITE_PAGES: SitePageLink[] = [
  { label: 'Honey Road', url: 'https://mibera.0xhoneyjar.xyz/', description: 'Main portal — the Mibera darknet marketplace homepage' },
  { label: 'Messages', url: 'https://mibera.0xhoneyjar.xyz/messages', description: 'Encrypted communications between agents and operators' },
  { label: 'Orders', url: 'https://mibera.0xhoneyjar.xyz/orders', description: 'Track your parcel delivery status across the network' },
  { label: 'Fractures', url: 'https://mibera.0xhoneyjar.xyz/fractures', description: 'Soulbound reveal timeline — track the progressive unveiling' },
  { label: 'Stash', url: 'https://mibera.0xhoneyjar.xyz/stash', description: 'Your personal inventory of collected items and assets' },
  { label: 'Gallery', url: 'https://mibera.0xhoneyjar.xyz/gallery', description: 'Browse the full Mibera art collection and trait explorer' },
  { label: 'Forum', url: 'https://mibera.0xhoneyjar.xyz/forum', description: 'Community discussions, lore theories and agent intel' },
  { label: 'Vending Machine', url: 'https://mibera.0xhoneyjar.xyz/vm', description: 'Automated dispensary for special items and drops' },
  { label: 'Backing', url: 'https://mibera.0xhoneyjar.xyz/backing', description: 'Support and backing information for the project' },
  { label: 'Quiz', url: 'https://mibera.0xhoneyjar.xyz/quiz', description: 'Test your knowledge of the Mibera333 universe' },
  { label: 'Maker', url: 'https://mibera.0xhoneyjar.xyz/maker', description: 'Create and customize your own Mibera content' },
  { label: 'MagicEden', url: 'https://magiceden.io/collections/berachain/mibera333', description: 'Browse and trade Mibera333 NFTs on MagicEden marketplace' },
]

export const FBI_FUGITIVES: FugitiveCard[] = [
  {
    handle: '@janitooor', displayName: 'Jani', alias: 'The Chief Operator',
    profile: 'Wanted for orchestrating chaos, disorder and illegal rave operations across the chain',
    facts: 'Mibera Chief Operator. Cypherpunk spirit, liberty advocate, helps people find their own fire. Also MCO of LOA framework. Likes chaos as a feature, not a bug.',
    avatarUrl: '/images/fugitives/janitooor.gif',
  },
  {
    handle: '@gumibera_', displayName: 'Gumi', alias: 'The MibeDesigner',
    profile: 'Suspected of flipping Milady from the white side to the dark — what an artist',
    facts: 'Original artist behind the Mibera collection. Created the Mibera-codex. Mastermind who took Milady aesthetics and twisted them into something beautifully dark and underground.',
    avatarUrl: '/images/fugitives/gumi.jpg',
  },
  {
    handle: '@lana_del_play', displayName: 'areyouhere', alias: 'MibInfluencer (mibera/acc)',
    profile: 'Never let Mibera alone, even when the ravers went wild and Milady made her appearance',
    facts: 'Relentless Mibera evangelist. Kept the signal alive through every dip, every silence, every rave. The one who never stopped posting, never stopped believing. Mibera/acc maximalist.',
    avatarUrl: '/images/fugitives/lana_del_play.jpg',
  },
  {
    handle: '@ruwaiting4', displayName: 'Miggs', alias: 'The Alpha Seeker',
    profile: 'Co-founded an unlicensed podcast operation — extremely dangerous when unchained',
    facts: 'MiBera & FatBera OG. Co-Founder of BerasUnChained podcast. Alpha hunter who sniffs out opportunities before they exist. Probably knows your next move before you do.',
    avatarUrl: '/images/fugitives/miggs.jpg',
  },
  {
    handle: '@DenOfNothing', displayName: 'DenOfNothing', alias: 'The Den',
    profile: 'Operating a Den of... nothing? Suspicious. Co-conspirator in the UnChained operation',
    facts: 'MiBera & FatBera holder. Co-Founder of BerasUnChained podcast. Built the Den where nothing happens — except everything that matters in the Bera underground.',
    avatarUrl: '/images/fugitives/DenOfNothing.jpg',
  },
  {
    handle: '@cryptosuzuki', displayName: 'getsal', alias: 'MibeDJ',
    profile: 'Japanese-Berlin DJ broadcasting illegal frequencies across the berachain airwaves',
    facts: 'BeraRave spirit embodied. Japanese-Berlin DJ mixing acid house and techno for the Mibera underground. Creator of BeRaMix sets. Music is the weapon, the dancefloor is the battlefield.',
    avatarUrl: '/images/fugitives/getsal.jpg',
  },
  {
    handle: '@NKontua', displayName: 'NKontua', alias: 'Adeitasuna — MibeStat',
    profile: 'Built an intelligence dashboard tracking every move in the Mibera economy',
    facts: 'Creator of MibeStats. Loves the Mibera project, liberty, the 5 pillars of blockchain and cypherpunk culture. Believes code is law and data should be free.',
    avatarUrl: '/images/fugitives/Adeitasuna.jpg',
  },
]

// Example images from Mibera #2474 across all reveal phases
export const FRACTURE_STAGES: FractureStage[] = [
  {
    phase: 1,
    name: 'MiParcels',
    symbol: 'MIPARCEL',
    contract: '0x6956dae88C00372B1A0b2dfBfE5Eed19F85b0D4B',
    description: 'Sealed envelopes — labels, stickers, lore scrawl',
    label: 'Phase 1',
    imageUrl: 'https://ipfs.io/ipfs/bafybeiexd3lj53j4gpm7rcvnvprlfaa5kqj7bi4zlh4tlj5og23j6fyese/2474.png',
  },
  {
    phase: 2,
    name: 'Miladies',
    symbol: 'MILADIES',
    contract: '0x8D4972bd5D2df474e71da6676a365fB549853991',
    description: 'Flipped Milady Maker art with toilet graffiti',
    label: 'Phase 2',
    imageUrl: 'https://ipfs.io/ipfs/bafybeie26hxmg7vdrokv7lxdyrumykj5rkgwabklckdmiyrdsc2hu3crgq/f26ad2e658e11c72249ce100389e398815a03e1c.png',
  },
  {
    phase: 3,
    name: 'MiReveal #1.1',
    symbol: 'MIREVEAL1.1',
    contract: '0x77ec6B83495974a5B2C5BEf943b0f2e5aCd8Fc26',
    description: 'Colors and scenery — first hints, rare foregrounds',
    label: 'Phase 3',
    imageUrl: 'https://ipfs.io/ipfs/bafybeid5cjlzpabdziixqw4g6bi57bj4b27egpsxag6pjet2i34o4ph3fq/f26ad2e658e11c72249ce100389e398815a03e1c.png',
  },
  {
    phase: 4,
    name: 'MiReveal #2.2',
    symbol: 'MIREVEAL2.2',
    contract: '0xc557Bf6C7d21BA98A40dDfE2BEAbA682C49D17A9',
    description: 'Scene clears, molecule placed, silhouette appears',
    label: 'Phase 4',
    imageUrl: 'https://d163aeqznbc6js.cloudfront.net/images/reveal_phase3/reveal_phase3_images/f26ad2e658e11c72249ce100389e398815a03e1c.png',
  },
  {
    phase: 5,
    name: 'MiReveal #3.3',
    symbol: 'MIREVEAL3.3',
    contract: '0xbcb082bB41E892f29d9c600eaadEA698d5f712Ef',
    description: 'Form takes shape, astrology revealed, eyes closed',
    label: 'Phase 5',
    imageUrl: 'https://d163aeqznbc6js.cloudfront.net/images/reveal_phase4/images/f26ad2e658e11c72249ce100389e398815a03e1c.png',
  },
  {
    phase: 6,
    name: 'MiReveal #4.20',
    symbol: 'MIREVEAL4.20',
    contract: '0x2030f226Bf9a0c886887e83AcCdcEfb7Dae26009',
    description: 'Moon appears, hat placed if applicable',
    label: 'Phase 6',
    imageUrl: 'https://d163aeqznbc6js.cloudfront.net/images/reveal_phase5/images/f26ad2e658e11c72249ce100389e398815a03e1c.png',
  },
  {
    phase: 7,
    name: 'MiReveal #5.5',
    symbol: 'MIREVEAL5.5',
    contract: '0xcc426F9375c5edcef5CA6bDb0449c071133348cF',
    description: 'Mibera awakens — rising sign, face finalized',
    label: 'Phase 7',
    imageUrl: 'https://d163aeqznbc6js.cloudfront.net/images/reveal_phase6/images/f26ad2e658e11c72249ce100389e398815a03e1c.png',
  },
  {
    phase: 8,
    name: 'MiReveal #6.9',
    symbol: 'MIREVEAL6.9',
    contract: '0xF68f402230E39067Ee7c98Fe9A86641fC124c5BE',
    description: 'Head takes final form, ancient emblem appears',
    label: 'Phase 8',
    imageUrl: 'https://d163aeqznbc6js.cloudfront.net/images/reveal_phase7/images/f26ad2e658e11c72249ce100389e398815a03e1c.png',
  },
  {
    phase: 9,
    name: 'MiReveal #7.7',
    symbol: 'MIREVEAL7.7',
    contract: '0xFc79B1BcCa172FF5a8F7425C82F5CBB0125Dd10',
    description: 'Tattoos added — calm before the storm',
    label: 'Phase 9',
    imageUrl: 'https://d163aeqznbc6js.cloudfront.net/images/reveal_phase8/images/f26ad2e658e11c72249ce100389e398815a03e1c.png',
  },
  {
    phase: 10,
    name: 'MiReveal #8.8',
    symbol: 'MIREVEAL8.8',
    contract: '0xa3d3EF45712631A6Fb50c677762b8653f932cf71',
    description: 'Final reveal — the current Mibera collection',
    label: 'Phase 10',
    imageUrl: 'https://gateway.irys.xyz/7rpvwFYcB5t7S1HziaBAr4RgfAFpqCwCYbFUbkFqpbAq/f26ad2e658e11c72249ce100389e398815a03e1c.png',
  },
]
