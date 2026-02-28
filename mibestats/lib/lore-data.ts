// Static data for the MibeLore page

export interface LoreLink {
  title: string
  url: string
  description?: string
}

export interface TorLink {
  label: string
  url: string
  description: string
}

export interface FugitiveCard {
  handle: string
  displayName: string
  description: string
  avatarUrl?: string
}

export interface FractureStage {
  phase: number
  name: string
  symbol: string
  contract: string
  description: string
  label: string
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

export const TOR_LINKS: TorLink[] = [
  { label: 'Official Site', url: 'https://mibera333.com', description: 'Main portal of the Mibera333 darknet marketplace' },
  { label: 'Messages', url: 'https://mibera333.com/messages', description: 'Encrypted communications between agents' },
  { label: 'Orders', url: 'https://mibera333.com/orders', description: 'Track your parcel delivery status' },
  { label: 'Forum', url: 'https://mibera333.com/forum', description: 'Community discussions and lore theories' },
  { label: 'MagicEden Collection', url: 'https://magiceden.io/collections/berachain/mibera333', description: 'Browse and trade Mibera333 NFTs on MagicEden' },
]

export const FBI_FUGITIVES: FugitiveCard[] = [
  { handle: '@maboroshi_xyz', displayName: 'maboroshi', description: 'Creator & artist behind the Mibera333 universe', avatarUrl: 'https://unavatar.io/twitter/maboroshi_xyz' },
  { handle: '@janitooor', displayName: 'janitooor', description: 'Community lead, orchestrating the Mibera movement', avatarUrl: 'https://unavatar.io/twitter/janitooor' },
  { handle: '@0xHoneyJar', displayName: 'HoneyJar', description: 'The Jar — Berachain ecosystem hub partnered with Mibera', avatarUrl: 'https://unavatar.io/twitter/0xHoneyJar' },
  { handle: '@beaboroshi', displayName: 'beaboroshi', description: 'Berachain liaison, bridging Mibera to the chain', avatarUrl: 'https://unavatar.io/twitter/beaboroshi' },
  { handle: '@maboroshi333', displayName: 'maboroshi333', description: 'Alt dimension persona of the creator', avatarUrl: 'https://unavatar.io/twitter/maboroshi333' },
  { handle: '@MiberaBot', displayName: 'MiberaBot', description: 'Automated bot posting sales, listings and updates', avatarUrl: 'https://unavatar.io/twitter/MiberaBot' },
  { handle: '@Mibera333', displayName: 'Mibera333', description: 'Official Mibera333 project account', avatarUrl: 'https://unavatar.io/twitter/Mibera333' },
  { handle: '@bera_foundation', displayName: 'Berachain Foundation', description: 'Foundation behind the Berachain L1', avatarUrl: 'https://unavatar.io/twitter/bera_foundation' },
  { handle: '@beaboroshi_art', displayName: 'beaboroshi_art', description: 'Art-focused account showcasing Mibera artwork', avatarUrl: 'https://unavatar.io/twitter/beaboroshi_art' },
  { handle: '@mibeRA_stats', displayName: 'MibeStats', description: 'Analytics and statistics for the Mibera collection', avatarUrl: 'https://unavatar.io/twitter/mibeRA_stats' },
  { handle: '@mibera_lore', displayName: 'mibera_lore', description: 'Deep dives into the Mibera333 mythology and lore', avatarUrl: 'https://unavatar.io/twitter/mibera_lore' },
  { handle: '@mibera_grails', displayName: 'mibera_grails', description: 'Tracking the 42 hand-drawn 1/1 grail masterpieces', avatarUrl: 'https://unavatar.io/twitter/mibera_grails' },
]

export const FRACTURE_STAGES: FractureStage[] = [
  {
    phase: 1,
    name: 'MiParcels',
    symbol: 'MIPARCEL',
    contract: '0x6956dae88C00372B1A0b2dfBfE5Eed19F85b0D4B',
    description: 'Sealed envelopes — labels, stickers, lore scrawl',
    label: 'Phase 1',
  },
  {
    phase: 2,
    name: 'Miladies',
    symbol: 'MILADIES',
    contract: '0x8D4972bd5D2df474e71da6676a365fB549853991',
    description: 'Flipped Milady Maker art with toilet graffiti',
    label: 'Phase 2',
  },
  {
    phase: 3,
    name: 'MiReveal #1.1',
    symbol: 'MIREVEAL1.1',
    contract: '0x77ec6B83495974a5B2C5BEf943b0f2e5aCd8Fc26',
    description: 'Colors and scenery — first hints, rare foregrounds',
    label: 'Phase 3',
  },
  {
    phase: 4,
    name: 'MiReveal #2.2',
    symbol: 'MIREVEAL2.2',
    contract: '0xc557Bf6C7d21BA98A40dDfE2BEAbA682C49D17A9',
    description: 'Scene clears, molecule placed, silhouette appears',
    label: 'Phase 4',
  },
  {
    phase: 5,
    name: 'MiReveal #3.3',
    symbol: 'MIREVEAL3.3',
    contract: '0xbcb082bB41E892f29d9c600eaadEA698d5f712Ef',
    description: 'Form takes shape, astrology revealed, eyes closed',
    label: 'Phase 5',
  },
  {
    phase: 6,
    name: 'MiReveal #4.20',
    symbol: 'MIREVEAL4.20',
    contract: '0x2030f226Bf9a0c886887e83AcCdcEfb7Dae26009',
    description: 'Moon appears, hat placed if applicable',
    label: 'Phase 6',
  },
  {
    phase: 7,
    name: 'MiReveal #5.5',
    symbol: 'MIREVEAL5.5',
    contract: '0xcc426F9375c5edcef5CA6bDb0449c071133348cF',
    description: 'Mibera awakens — rising sign, face finalized',
    label: 'Phase 7',
  },
  {
    phase: 8,
    name: 'MiReveal #6.9',
    symbol: 'MIREVEAL6.9',
    contract: '0xF68f402230E39067Ee7c98Fe9A86641fC124c5BE',
    description: 'Head takes final form, ancient emblem appears',
    label: 'Phase 8',
  },
  {
    phase: 9,
    name: 'MiReveal #7.7',
    symbol: 'MIREVEAL7.7',
    contract: '0xFc79B1BcCa172FF5a8F7425C82F5CBB0125Dd10',
    description: 'Tattoos added — calm before the storm',
    label: 'Phase 9',
  },
  {
    phase: 10,
    name: 'MiReveal #8.8',
    symbol: 'MIREVEAL8.8',
    contract: '0xa3d3EF45712631A6Fb50c677762b8653f932cf71',
    description: 'Final reveal — the current Mibera collection',
    label: 'Phase 10',
  },
]
