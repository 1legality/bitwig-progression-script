/*
 * Rhythm Generator v0.1
 * Controller script for Bitwig Studio
 */

loadAPI(17)

host.setShouldFailOnDeprecatedUse(true)
host.defineController('1legality', 'Rhythm Generator', '0.1', '64fc7e0d-6c39-4f46-8b10-6814139d5172', '1legality')

// --- Constants ---
const TPQ = 96
const TICKS_16TH = TPQ / 4
const BAR_TICKS = 4 * TPQ

// Updated with recommended BPM ranges, sorted alphanumerically
const GENRES = [
  'Ambient (60-80)',
  'Amen Brother (160-175)',
  'Boom Bap (90)',
  'Drill (140)',
  'House (120-128)',
  'Lofi (70-90)',
  'Synthwave (100-120)',
  'Techno (130)',
  'Trap (140)',
  'Tribal (125)'
]
const INSTRUMENTS = (() => {
  const rest = ['Bass', 'CB', 'CH', 'BD', 'RS', 'CY', 'SH', 'SN', 'LT'].sort()
  return ['All'].concat(rest)
})()

const DEFAULT_TRANSPOSE = -18 // Fixed: 0 shift to keep BD at C1 (36). -30 was dropping it to F#-2.

const GM_DRUM_MAP = {
  "BD": 36,
  "SN": 38,
  "CH": 42,
  "OH": 46,
  "LT": 45,
  "MT": 47,
  "HT": 50,
  "CL": 39,
  "SH": 49,
  "RS": 39,
  "CB": 51,
  "CY": 49,
  "HC": 39,
  "AC": 57,
  "LC": 64,
  "Bass": 36 // Custom: Anchor for bass
}

function clampNote(n) {
  if (typeof n !== 'number') n = Number(n) || 0
  n = Math.round(n)
  if (n < 0) n = 0
  if (n > 127) n = 127
  return n
}

/**
 * Calculates the transposed MIDI note, ensuring it wraps within valid octaves
 * and stays within the 0-127 MIDI range.
 * Mirrors logic from DrumPattern.control.js.
 * 
 * @param {number} baseNote - The source MIDI note (default 36/C1)
 * @param {number} transpose - transposition amount in semitones
 * @returns {number} Valid MIDI note (0-127)
 */
function getTransposedNote(baseNote = 36, transpose = 0) {
  let note = baseNote + transpose

  // Wrap octaves if out of range to keep the same note class (e.g. C)
  while (note < 0) note += 12
  while (note > 127) note -= 12

  return clampNote(note)
}

function createVariation(pattern, inst, genre) {
  // Convert string to array for easier manipulation
  let chars = pattern.split('')

  // Helper to safely set a char if it's empty
  const fill = (idx, char) => {
    if (idx >= 0 && idx < 16 && chars[idx] === '.') {
      chars[idx] = char
    }

  }

  // --- LOFI SPECIFIC VARIATION (Subtractive/Chill) ---
  if (genre === 'Lofi') {
    // 1. KICK: Remove hits to create space
    if (inst === 'BD' || inst === 'Bass') {
      for (let i = 0; i < 16; i++) {
        if (chars[i] === 'x' && Math.random() < 0.2) chars[i] = '.'
      }
      // Rare pickup at the end
      if (Math.random() < 0.2 && chars[15] === '.') chars[15] = 'x'
    }

    // 2. SNARE: Ghost notes only, no heavy fills
    if (inst === 'SN') {
      // Add ghost before hit
      for (let i = 1; i < 16; i++) {
        if (chars[i] === 'x' && chars[i - 1] === '.' && Math.random() < 0.3) {
          fill(i - 1, 'x') // 'x' here will be treated as ghost downstream if velocity is low or if we add a 'g' char support later, 
          // but for now relying on the downstream ghost-snare logic which checks for low velocity or specific genre rules.
          // Actually, let's rely on the downstream articulations. The 'x' just places a note.
        }
      }
      // DO NOT add the heavy end fill (14, 15)
    }

    // 3. HATS/perc: Thin out
    if (['CH', 'SH', 'CY', 'LT', 'RS', 'CB'].indexOf(inst) >= 0) {
      for (let i = 0; i < 16; i++) {
        if (chars[i] !== '.' && Math.random() < 0.15) chars[i] = '.'
      }
    }

    return chars.join('')
  }

  // 1. DENSITY VARIATION (CH, SH, CY, LT, etc)
  if (['CH', 'SH', 'CY', 'LT', 'RS', 'CB'].indexOf(inst) >= 0) {
    // Fill in some gaps 
    for (let i = 0; i < 16; i++) {
      // Add 16ths in empty spots with 20% chance
      if (Math.random() < 0.2) fill(i, 'x')
    }

    // Techno/House: Add open hat on off-beat if not present
    if ((genre === 'Techno' || genre === 'House') && inst === 'CH') {
      fill(2, 'o'); fill(6, 'o'); fill(10, 'o'); fill(14, 'o')
    }
  }

  // 2. KICK VARIATION (BD, Bass)
  if (inst === 'BD' || inst === 'Bass') {
    // Add a pickup kick at end of bar
    if (Math.random() > 0.3) fill(15, 'x')

    // Double a kick: Find a kick, add one after it if empty
    for (let i = 0; i < 14; i++) {
      if (chars[i] === 'x' && chars[i + 1] === '.' && Math.random() < 0.25) {
        fill(i + 1, 'x')
      }
    }
  }

  // 3. SNARE VARIATION (SN)
  if (inst === 'SN') {
    // Add ghost notes before hits
    for (let i = 1; i < 16; i++) {
      if (chars[i] === 'x' && chars[i - 1] === '.' && Math.random() < 0.4) {
        fill(i - 1, 'x') // Add a pre-hit
      }
    }

    // Simple end fill
    if (Math.random() > 0.3) {
      fill(14, 'x')
      fill(15, 'x')
    }
  }

  return chars.join('')
}

// --- TEMPLATES ---
const TEMPLATES = {
  'BD': {
    'Trap': ['x.........x.....', 'x...........x...', 'x..x......x.....', 'x.........x..x..', 'x.......x.x.....'],
    'Drill': ['x.........x...x.', 'x...x.....x...x.', 'x.........x.x...', 'x.....x...x.....', 'x...x...x...x...'],
    'Lofi': [
      'x.........x.....', // Extreme minimalism (The pulse)
      'x.............x.', // The "breathing" kick
      'x...x...........', // Just the start
      'x.........x..x..'  // Classic
    ],
    'Boom Bap': ['x.........xx....', 'x..x......x.....', 'x.........x.x...', 'x.....x.x.......'],
    'House': ['x...x...x...x...', 'x...x...x...x...', 'x..x.x..x..x.x..', 'x.......x...x...'],
    'Techno': ['x...x...x...x...', 'x...x...x...x...', 'x..xx...x..xx...', 'x...x.x.x...x...'],
    'Ambient': ['x...............', 'x.......x.......', '................'],
    'Tribal': ['x.....x.....x...', 'x...x...x.x.....', 'x..x..x.....x...'],
    'Amen Brother': [
      // MAINS (0-2)
      'x.x.......xx....', // Classic
      'x.........xx..x.', // Variation
      '..x.......xx....', // Late entry
      // FILLS (3-5)
      'x.x...x...xx..x.', // Busy Kick
      'x.x.x.x.x.xx....', // Machine gun
      'xx..xx..xx..xx..'  // Full roll
    ],
    'Synthwave': [
      'x...x...x...x...', // Reliable 4-on-the-floor
      'x...x...x..x.x..', // Slight push
      'x...x..x.x..x...', // Funky kick
      'x...x...x...x..x'  // Pickup
    ]
  },
  'Bass': {
    'Trap': [
      'x...x...x...x...', 'x.......x.......', 'x...x.x...x.x...', 'x...x...x..x.x..',
      'x.......x...x...', 'x...x...xx..x...', 'x..x...x..x...x.', 'x...x..x...x...x'
    ],
    'Drill': [
      'x...x...x...x...', 'x...x...x...x.x.', 'x...x.x...x...x.',
      'x...x...x..x...x', 'x...x.x..x...x..', 'x...x...xx...x..'
    ],
    'Lofi': [
      'x.......x.......', 'x...x.......x...', 'x...x...x.......',
      'x.......x...x...', 'x...x...x..x....', 'x...x........x..'
    ],
    'Boom Bap': [
      'x...x.......x...', 'x...x...x...x...', 'x...x.......x.x.',
      'x...x..x....x...', 'x...x...x.x.....', 'x..x....x...x...'
    ],
    'House': [
      'x...x...x...x...', 'x...x...x...x...', 'x...x...x...x.x.',
      'x...x...x..x.x..', 'x..x..x..x..x..x', 'x...x...xx...x..'
    ],
    'Techno': [
      'x...x...x...x...', 'x...x...x...x...', 'x...x...x..xx...',
      'x..x..x..x..x..x', 'x...x.x.x...x...', 'x...x...xx..x...'
    ],
    'Ambient': [
      'x...............', 'x.......x.......', 'x...........x...',
      'x.......x...x...', 'x...x...........', 'x.......x.....x.'
    ],
    'Tribal': [
      'x...x...x...x...', 'x...x.x...x.x...', 'x...x...x...x.x.',
      'x..x...x...x...x', 'x...x...xx...x..', 'x..x..x..x..x..x'
    ],
    'Amen Brother': [
      'x...x...x...x...', 'x...x...x...x.x.', 'x...x...x.x...x.',
      'x...x..x...x...x', 'x..x...x..x...x.', 'x...x.x...x...x.'
    ],
    'Synthwave': [
      'x.......x.......', // Simple
      'x...x...x...x...', // Driving 8ths
      'x.x.x...x.x.x...', // Funky
      'x...x.x...x.x...'  // Disco bass
    ]
  },
  'SN': {
    'Trap': ['........x.......', '........x.......', '........x...x...', '........x.x.....'],
    'Drill': ['......x.......x.', '......x.....x...', 'xxx...x.......x.', '......x...x...x.'],
    'Lofi': [
      '....x.......x...', // Standard
      '....x.......x.x.', // Ghost end
      '....x..x....x...', // Double
      '....x...x...x...' // Lazy syncopation
    ],
    'Boom Bap': ['....x.......x...', '....x..x....x...', '....x.......x.x.'],
    'House': ['....x.......x...', '....x.......x...', '....x.....x.x...', '..x.....x.......'],
    'Techno': ['....x.......x...', '....x.......x...', '................'],
    'Ambient': ['................', '....x.......x...', '................'],
    'Tribal': ['....x.......x...', '..x.....x.......', '......x.......x.'],
    'Amen Brother': [
      // MAINS (0-2)
      '....x..x.x..x...', // The Standard
      '....x.......x.x.', // Ghosty end
      '..x.x..x.x..x...', // Displaced
      // FILLS (3-5)
      '....x...x.x.x...', // Roll end
      '....x..x.x.x.x..', // Intense
      '..x...x...x...x.'  // Jungle chop
    ],
    'Synthwave': [
      '....x.......x...', // Solid 2/4
      '....x.......x.x.', // Ghost end
      '....x..x.x..x...', // French house shuffle
      '..x.....x.......'  // Clap style
    ]
  },
  'CH': {
    'Trap': ['x.x.x.x.x.x.x.x.', 'x.x.x.x.x.xxx.x.', 'x...x...x...x...', 'x.......x.......', 'x.x.x.x.x.......', 'x.x...x.x.x...x.'],
    'Drill': ['x..x..x.x..x..x.', 'x..x.x..x..x.x..', 'x..x..x...x..x..', '.x..x..x.x..x..x', 'x...x...x..x..x.'],
    'Lofi': [
      'x.x.x.x.x.x.x.x.', // Straight-ish 8ths
      'x-x-x-x-x-x-x-x-', // Swing 8ths
      'x.x.x.x.x.x.....', // Space
      'x...x...x...x...', // Qtrs
      'x.x.x...x.x.x...'  // Broken
    ],
    'Boom Bap': ['x.x.x.x.x.x.x.x.', 'x-x-x-x-x-x-x-x-', 'x.x..x..x.x..x..', 'x...x.x.x...x.x.', 'x.......x.x.x...'],
    'House': ['.o.o.o.o.o.o.o.o', 'x.o.x.o.x.o.x.o.', 'x...x...x...x...', '..x...x...x...x.', 'x.x.x.o.x.x.x.o.'],
    'Techno': ['x.x.x.x.x.x.x.x.', '.x.x.x.x.x.x.x.x', 'xxxx.xxxxxxx.xxx', '..x...x...x...x.'],
    'Ambient': ['...x.......x....', 'x.......x.......', '.......x.......x', '. . . . x . . . ', '................'],
    'Tribal': ['..x...x...x...x.', 'x...x.x.x...x...', '..x.x...x.x...x.'],
    'Amen Brother': [
      'x.x.x.x.x.x.x.x.', // Ride/Hat steady
      'x.x.x.x.x.xx.xx.', // Funky shuffle
      'x.x.x.x.x.x.x.o.', // Open hat end
      'x.xx.xx.x.xx.xx.'  // Intense ride
    ],
    'Synthwave': [
      '..o...o...o...o.', // The Classic French Touch Open Hat
      'x.o.x.o.x.o.x.o.', // Driving Disco
      'x.x.x.x.x.x.x.x.', // 8th note shaker feel
      'xxx.xxx.xxx.xxx.'  // Gallop
    ]
  },
  'SH': {
    'Trap': ['x.x.x.x.x.x.x.x.', 'x.xxx.xxx.xxx.xx', 'x...x...x...x...', '..x...x...x...x.'],
    'Drill': ['x.x.x.x.x.x.x.x.', '-.x.-.x.-.x.-.x.', 'x..x..x..x..x..x', '......x.......x.'],
    'Lofi': ['x.x.x.x.x.x.x.x.', 'x.x.x.x.x.x.x...', 'x...x...x...x...', '..x.x.x...x.x.x.'],
    'Boom Bap': ['x.x.x.x.x.x.x.x.', 'x-x-x-x-x-x-x-x-', 'x..x..x..x..x..x'],
    'House': ['x.x.x.x.x.x.x.x.', '..x...x...x...x.', 'x.x.x...x.x.x...', 'x...x.x.x...x.x.'],
    'Techno': ['x.x.x.x.x.x.x.x.', 'x.x.x.x.x.x.x.x.', '.x.x.x.x.x.x.x.x'],
    'Ambient': ['x.x.x.x.x.x.x.x.', '................', 'x.......x.......', '........x.......'],
    'Tribal': ['x.x.x.x.x.x.x.x.', '..x.x.x...x.x.x.', 'x...x...x...x...'],
    'Amen Brother': ['x.x.x.x.x.x.x.x.'],
    'Synthwave': ['x.x.x.x.x.x.x.x.', '................', 'xxxxxxxxxxxxxxxx']
  },
  'LT': {
    'Trap': ['................', '..............xx', '............x.x.', 'x...............'],
    'Drill': ['..............x.', '..........x..x..', '..x.............', 'x..x..x.........'],
    'Lofi': ['................', '..............f.', '..........x.....'],
    'Boom Bap': ['................', '..............x.', '..x.......x.....'],
    'House': ['................', '..x.......x.....', '....x.......x...', '..x...x...x...x.'],
    'Techno': ['................', '....x.......x...', '..x...x...x...x.', 'x...x...x...x...'],
    'Ambient': ['x...............', '..............x.', '......x.........'],
    'Tribal': ['....x.......x...', '..x...x.....x...', 'x.......x.......', '......x.x.....x.'],
    'Amen Brother': ['................', '............x...', '..x...x.........'],
    'Synthwave': ['............xxxx', '..........x.x...', 'x.x.............', '..............x.'] // Iconic fills
  },
  'RS': {
    'Trap': ['..x...x...x...x.', '....x.......x...', 'x.......x.......', '......x...x.....'],
    'Drill': ['..x.....x.......', '......x...x.....', '....x.......x...', 'x.....x.....x...'],
    'Lofi': [
      '....x.......x...', // Backbeat on 2 and 4 (like snare replacement)
      '....x.......x.x.', // With ghost end
      '....x..x....x...', // Slight swing feel
      '....x.......x...'  // Simple and clean
    ],
    'Boom Bap': ['..x...x.......x.', '....x...x.......', '..x.............'],
    'House': ['..x...x...x...x.', '....x.......x...', 'x.....x.....x...', '...x.....x......'],
    'Techno': ['..x...x...x...x.', '....x.......x...', 'x...x...x...x...', '......x.x.x.....'],
    'Ambient': ['..x.............', '......x.......x.', 'x.......x.......', '....x.......x...'],
    'Tribal': ['..x.............', '....x.......x...', '......x.x.......'],
    'Amen Brother': ['..x.............', 'x.......x.......'],
    'Synthwave': ['....x.......x...', '..x...x...x.....']
  },
  'CY': {
    'Trap': ['x...x...x...x...', 'x.x.x.x.x.x.x.x.', 'x.......x.......'],
    'Drill': ['x...x...x...x...', 'x..x..x.x..x..x.', 'x.......x.......'],
    'Lofi': ['x...x...x...x...', 'x.x.x.x.x.x.x.x.', 'x..x..x..x..x..x'],
    'Boom Bap': ['x.x.x.x.x.x.x.x.', 'x...x.x.x...x.x.', 'x..x.x..x..x.x..', 'x...x...x..x.x..'],
    'House': ['x...x...x...x...', '.x..x...x...x...', 'x.x.x.x.x.x.x.x.', 'x...x.x.x...x.x.'],
    'Techno': ['x.x.x.x.x.x.x.x.', 'x...x...x...x...', '.x..x...x...x...'],
    'Ambient': ['x...............', 'x...x...x...x...', 'x.......x.......'],
    'Tribal': ['x...x...x...x...', 'x.....x.x.....x.', 'x.x...x...x...x.'],
    'Amen Brother': ['x.x.x.x.x.x.x.x.', 'x.x.x.x.x.xx.xx.', 'x.xx.xx.x.xx.xx.', 'x...x.x.x...x.x.'],
    'Synthwave': ['x...x...x...x...', 'x.x.x.x.x.x.x.x.']
  },
  'CB': {
    'Trap': ['x...............', '............x...', '..x.......x.....'],
    'Drill': ['..x.............', 'x.....x.....x...', '....x.......x...'],
    'Lofi': ['..x.............', '......x.........'],
    'Boom Bap': ['..x...x.......x.', '....x...x.......'],
    'House': ['.x..x...x...x...', '..x...x...x...x.', 'x...x...x...x...'],
    'Techno': ['.x..x...x...x...', '..x.......x.....', 'x...x...x...x...'],
    'Ambient': ['................', '......x.........', '..............x.'],
    'Tribal': ['..x.....x.......', 'x...x.....x.....', '......x...x.....'],
    'Amen Brother': ['x...............', '..............x.'],
    'Synthwave': ['x...............', '..............x.']
  }
}

const RULES = {
  'Trap': { velStrong: 110, velWeak: 70, swing: 0 },
  'Drill': { velStrong: 100, velWeak: 60, swing: 0 },
  'Lofi': { velStrong: 75, velWeak: 45, swing: 0.32 }, // Heavy swing, soft hits
  'Boom Bap': { velStrong: 110, velWeak: 60, swing: 0.15 },
  'House': { velStrong: 115, velWeak: 50, swing: 0.05 },
  'Techno': { velStrong: 115, velWeak: 90, swing: 0 },
  'Ambient': { velStrong: 65, velWeak: 40, swing: 0 },
  'Tribal': { velStrong: 120, velWeak: 75, swing: 0.18 },
  'Amen Brother': { velStrong: 125, velWeak: 55, swing: 0.10 },
  'Synthwave': { velStrong: 120, velWeak: 85, swing: 0.12 } // MPC Swing for French House
}

var sectionSetting, instrumentSetting
var cursorClipLauncher, cursorClipArranger
var clipTypeSetting

function init() {
  println('Rhythm Generator v0.1 Initialized')
  const documentState = host.getDocumentState()

  cursorClipLauncher = host.createLauncherCursorClip(16 * 128, 128)
  cursorClipArranger = host.createArrangerCursorClip(16 * 128, 128)

  const defaultScrollKey = getTransposedNote(GM_DRUM_MAP['BD'], DEFAULT_TRANSPOSE)
  try { cursorClipLauncher.scrollToKey(defaultScrollKey) } catch (e) { }
  try { cursorClipArranger.scrollToKey(defaultScrollKey) } catch (e) { }

  instrumentSetting = documentState.getEnumSetting('Instrument', 'Generator', INSTRUMENTS, INSTRUMENTS[0])
  sectionSetting = documentState.getEnumSetting('Genre', 'Generator', GENRES, GENRES[0])
  clipTypeSetting = documentState.getEnumSetting('Clip Type', 'Generator', ['Launcher', 'Arranger'], 'Launcher')

  documentState.getSignalSetting('Generate', 'Generator', 'Generate!').addSignalObserver(() => {
    generateAndWrite()
  })
}

/**
 * INTELLIGENT ENSEMBLE SELECTION
 */
function selectEnsemble(genre) {
  // 1. Foundation
  let active = ['BD', 'SN']

  // 2. Primary Driver
  const drivers = ['CH', 'SH', 'CY']
  let driver = drivers[Math.floor(Math.random() * drivers.length)]

  if (genre === 'Trap' || genre === 'Drill') driver = 'CH'
  if (genre === 'Tribal') driver = 'SH'
  if (genre === 'Techno') driver = (Math.random() > 0.4) ? 'CH' : 'CY'
  if (genre === 'Amen Brother') driver = 'CY' // Default to Ride for the classic sound
  if (genre === 'Synthwave') driver = (Math.random() > 0.7) ? 'CY' : 'CH' // Mostly Hats

  active.push(driver)

  // 3. Secondary Driver
  if (Math.random() > 0.4) {
    let supportDriver = drivers[Math.floor(Math.random() * drivers.length)]
    if (supportDriver !== driver) {
      if (genre !== 'Trap' && genre !== 'Drill') {
        active.push(supportDriver)
      }
    }
  }

  // 4. Primary Texture
  const textures = ['LT', 'RS', 'CB']
  let texture = textures[Math.floor(Math.random() * textures.length)]

  // 5. Secondary Texture
  let secondTexture = null
  if (Math.random() > 0.6) {
    secondTexture = textures[Math.floor(Math.random() * textures.length)]
    if (secondTexture === texture) secondTexture = null
  }

  if (genre === 'Ambient') {
    active = ['SH', 'CY', 'CB', 'LT']
    if (Math.random() > 0.5) active.push('RS')
  }
  else if (genre === 'Lofi') {
    // LOFI TRIO: Kick, backbeat (Snare OR Rim Shot), Hat (or Shaker)
    // Rim shots are common in Lofi for a softer, jazzier feel
    active = ['BD']
    // 50/50 between Snare (muted) and Rim Shot (clean, dry)
    active.push((Math.random() > 0.5) ? 'SN' : 'RS')
    // 50/50 between Closed Hat (Classic) and Shaker (Organic)
    active.push((Math.random() > 0.5) ? 'CH' : 'SH')
  }
  else if (genre === 'Tribal') {
    active = ['BD', 'LT', 'RS', 'SH']
    if (Math.random() > 0.5) active.push('CH')
  }
  else if (genre === 'Amen Brother') {
    // Crucial fix: Don't play both Ride and Hi-Hat to avoid "too much timbre"
    // Use the crash/ride as the main driver, maybe add a ghosty snare or shuffle hat later, but not as a full layer
    active = ['BD', 'SN', 'CY']

    // Very rarely add a separate "shaker" layer for texture, but usually just the break trio is best
    if (Math.random() > 0.8) active.push('SH')
  }
  else if (genre === 'Synthwave') {
    // French Touch: Kick, Snare, Hats + Shaker/Ride. 
    // Less toms, more groove.
    active = ['BD', 'SN', 'CH']
    if (Math.random() > 0.4) active.push('SH') // Shaker is key for disco
    if (Math.random() > 0.6) active.push('CY')
    if (Math.random() > 0.8) active.push('CB') // Occasional cowbell
  }
  else {
    active.push(texture)
    if (secondTexture) active.push(secondTexture)
  }

  // 6. Low anchor (Bass) for groove-based genres
  if (genre !== 'Ambient' && genre !== 'Techno') {
    if (Math.random() > 0.35) active.push('Bass')
  } else if (genre === 'Techno' && Math.random() > 0.65) {
    active.push('Bass')
  }

  return active
}

function generateAndWrite() {
  // Strip BPM info for internal logic mapping (e.g. "Trap (140)" -> "Trap")
  const rawGenre = sectionSetting.get()
  const genre = rawGenre.split(' (')[0]

  const instSelection = instrumentSetting.get()

  let instrumentsToProcess = []

  if (instSelection === 'All') {
    instrumentsToProcess = selectEnsemble(genre)
    println(`Generated Ensemble for ${genre}: ${instrumentsToProcess.join(', ')}`)
  } else {
    instrumentsToProcess = [instSelection]
  }

  const isAll = instSelection === 'All'
  let combinedEvents = []
  for (let i = 0; i < instrumentsToProcess.length; i++) {
    const inst = instrumentsToProcess[i]
    const instEvents = generatePatternForInstrument(inst, genre, isAll)
    combinedEvents = combinedEvents.concat(instEvents)
  }

  const clipChoice = (clipTypeSetting && clipTypeSetting.get && clipTypeSetting.get() === 'Arranger') ? cursorClipArranger : cursorClipLauncher
  writeEventsToClip(clipChoice, combinedEvents)

  host.showPopupNotification('Generated: ' + (isAll ? 'Ensemble' : instSelection) + ' (' + genre + ')')
}

function generateBaseSteps(inst, genre, rule, patternStr, baseNote) {
  const steps = []

  for (let i = 0; i < 16; i++) {
    const char = patternStr[i]
    if (char === '-') continue
    if (char === '.') continue

    let vel = (i % 4 === 0) ? rule.velStrong : rule.velWeak
    let type = 'hit'
    let note = baseNote

    if (inst === 'SH') {
      const subPos = i % 4
      if (subPos === 0) vel = rule.velStrong
      else if (subPos === 2) vel = rule.velStrong * 0.85
      else vel = rule.velWeak
    }
    if (inst === 'CY') {
      vel = (vel > 100) ? 95 : vel
    }
    if (inst === 'CB') {
      vel = rule.velStrong * 1.05
      type = 'bell'
    }
    if (inst === 'BD') {
      vel = rule.velStrong + 10 // Dynamic kick, relative to genre strength
      if (char === '.') vel = rule.velStrong - 10
    }
    if (inst === 'SN') {
      if (genre === 'Lofi') {
        // Lofi snares are very muted and soft
        vel = rule.velWeak + 10 // Much softer than other genres
      } else if (i % 4 === 0 || i === 4 || i === 12) {
        vel = rule.velStrong + 15
      } else {
        vel = rule.velWeak + 20
      }
      if ((genre === 'Trap' || genre === 'Drill') && i === 8) vel = 127
    }

    if (char === 'o') {
      if (inst === 'CH') {
        note = getTransposedNote(GM_DRUM_MAP['OH'], DEFAULT_TRANSPOSE)
      }
      vel = rule.velStrong + 10
      type = 'open'
    } else if (char === 'f') {
      type = 'flam'
    } else if (char === '.') {
      vel = Math.floor(vel * 0.7)
    }

    steps.push({ i, vel, note, type })
  }
  return steps
}

function generatePatternForInstrument(inst, genre, isAll = false) {
  const rule = RULES[genre] || RULES['Trap']
  const bank = TEMPLATES[inst] || TEMPLATES['CH']
  const templates = bank[genre] || bank['Trap'] || bank[Object.keys(bank)[0]]

  const baseNote = getTransposedNote(GM_DRUM_MAP[inst], DEFAULT_TRANSPOSE)
  let events = []

  // Select Main Pattern
  let mainPattern, turnPattern

  if (genre === 'Amen Brother') {
    // Smart Pairing for Amen:
    // First 3 templates are "Main Grooves", Last 3 are "Fills"
    const split = Math.floor(templates.length / 2)
    const mainIdx = Math.floor(Math.random() * split)
    const turnIdx = split + Math.floor(Math.random() * (templates.length - split))

    mainPattern = templates[mainIdx]
    turnPattern = templates[turnIdx]
  } else {
    // Standard Logic
    const mainIdx = Math.floor(Math.random() * templates.length)
    mainPattern = templates[mainIdx]

    // Algorithmically derive B-part from A-part for coherence
    turnPattern = createVariation(mainPattern, inst, genre)
  }

  for (let bar = 0; bar < 4; bar++) {
    const isTurnaround = (bar === 3)

    // Choose pattern for this bar
    // Techno/House/Ambient often benefit from more repetition (A-A-A-A')
    // Breakbeats (Amen/Trap/Drill) benefit from A-A-A-B
    let currentPattern = mainPattern
    if (isTurnaround) {
      // For subtle vibes, sometimes we don't want a full pattern switch, 
      // but for 'Amen' etc we usually do.
      if (genre !== 'Techno' && genre !== 'Ambient' && genre !== 'House') {
        currentPattern = turnPattern
      }
      // For Techno/House, we might keep mainPattern but the 'isTurnaround' flag 
      // downstream in articulations will handle the "subtle" variation (fills/rolls)
    }

    const steps = generateBaseSteps(inst, genre, rule, currentPattern, baseNote)

    // Synthwave loves huge tom fills on turnarounds
    if (inst === 'LT' && genre === 'Synthwave' && !isTurnaround) {
      if (Math.random() > 0.2) continue
    }
    else if (inst === 'LT' && genre !== 'Tribal' && !isTurnaround) {
      continue
    }

    for (let s = 0; s < steps.length; s++) {
      const step = steps[s]
      const tick = (bar * BAR_TICKS) + (step.i * TICKS_16TH)

      events.push({
        time: tick,
        duration: TICKS_16TH,
        velocity: step.vel,
        note: step.note,
        type: step.type,
        gridPos: step.i,
        instrument: inst,
        genre: genre
      })
    }
  }

  if (!isAll) {
    events = applyInstrumentArticulations(events, inst, rule, genre)
  }
  events = applyGroove(events, rule)

  return events
}

function applyInstrumentArticulations(events, inst, rule, genre) {
  let out = []
  events.sort((a, b) => a.time - b.time)

  for (let i = 0; i < events.length; i++) {
    let ev = events[i]
    let processed = false
    const bar = Math.floor(ev.time / BAR_TICKS)
    const isTurnaround = (bar === 3)

    // 1. Explicit Flams
    if (ev.type === 'flam') {
      out.push({
        time: Math.max(0, ev.time - 3),
        duration: 3,
        velocity: ev.velocity * 0.6,
        note: clampNote(ev.note),
        type: 'grace',
        instrument: ev.instrument,
        genre: ev.genre
      })
      out.push(ev)
      processed = true
    }

    // 2. EAR CANDY: Ratchet / Rolls
    if (!processed && (inst === 'CH' || inst === 'SH' || inst === 'CY')) {
      let rollChance = 0.08
      if (genre === 'Trap' || genre === 'Drill') rollChance = 0.2
      if (genre === 'Amen Brother') rollChance = 0.12
      if (isTurnaround) rollChance += 0.15
      if (genre === 'Synthwave') rollChance = 0.02 // Synthwave usually has straight hats

      if (ev.velocity > 60 && Math.random() < rollChance) {
        let div = (Math.random() > 0.6) ? 2 : 3

        // GLITCH MODE for Trap/Drill
        if (genre === 'Trap' || genre === 'Drill') {
          const glitchRnd = Math.random()
          if (glitchRnd > 0.85) div = 6      // Fast sextuplets
          else if (glitchRnd > 0.6) div = 4  // 64th notes (machine gun)
          else if (glitchRnd > 0.3) div = 3  // Triplets
          else div = 2                       // 32nd notes
        }

        const stepSize = ev.duration / div

        for (let k = 0; k < div; k++) {
          let rollVel = ev.velocity * (0.7 + (k * 0.1))

          if (genre === 'Trap' || genre === 'Drill') {
            // Chaos velocity for glitch effect
            rollVel = 40 + Math.floor(Math.random() * 80)
          }

          out.push({
            time: ev.time + (k * stepSize),
            duration: stepSize,
            velocity: Math.min(127, rollVel),
            note: ev.note,
            type: 'roll',
            instrument: ev.instrument,
            genre: ev.genre
          })
        }
        processed = true
      }
      // 3. EAR CANDY: Occasional Open Hat on Off-beat
      else if (inst === 'CH' && !processed && Math.random() < 0.04) {
        if (ev.gridPos % 2 !== 0) {
          out.push({
            time: ev.time,
            duration: TICKS_16TH * 2,
            velocity: rule.velStrong + 10,
            note: getTransposedNote(GM_DRUM_MAP['OH'], DEFAULT_TRANSPOSE),
            type: 'open',
            instrument: ev.instrument,
            genre: ev.genre
          })
          processed = true
        }
      }
    }

    // 4. EAR CANDY: Ghost Snares
    if (!processed && inst === 'SN' && ev.velocity > 100) {
      const ghostTime = ev.time - TICKS_16TH
      const prevEv = out.length > 0 ? out[out.length - 1] : null
      let canAdd = true
      if (ghostTime < 0) canAdd = false
      if (prevEv && prevEv.time >= ghostTime) canAdd = false

      let ghostChance = 0.2
      if (genre === 'Amen Brother') ghostChance = 0.65
      if (genre === 'Lofi') ghostChance = 0.55 // More ghosts for jazz feel

      if (canAdd && Math.random() < ghostChance) {
        let ghostVel = 45
        if (genre === 'Amen Brother') ghostVel = 35 + Math.random() * 20
        if (genre === 'Lofi') ghostVel = 10 + Math.random() * 15 // Extremely quiet ghost notes

        out.push({
          time: ghostTime,
          duration: TICKS_16TH,
          velocity: ghostVel,
          note: clampNote(ev.note),
          type: 'ghost',
          instrument: ev.instrument,
          genre: ev.genre
        })
      }
    }

    // 5. EAR CANDY: Syncopated Accent
    if (!processed && ev.velocity < 80 && Math.random() < 0.03) {
      ev.velocity = Math.min(127, ev.velocity + 35)
    }

    if (!processed) out.push(ev)
  }

  return out.sort((a, b) => a.time - b.time)
}

function applyGroove(events, rule) {
  return events.map(ev => {
    const isOffbeat = (Math.floor(ev.time / TICKS_16TH) % 2 !== 0)
    if (isOffbeat) {
      ev.time += (rule.swing * TICKS_16TH)
    }

    // HUMANIZATION (Jitter)
    // Especially for Lofi, add random timing drift
    if (ev.genre === 'Lofi') {
      const jitter = (Math.random() - 0.5) * 6 // +/- 3 ticks drift
      ev.time += jitter
      if (ev.time < 0) ev.time = 0
    }

    if (ev.velocity > 127) ev.velocity = 127
    if (ev.velocity < 1) ev.velocity = 1
    ev.note = clampNote(ev.note)

    if (ev.genre === 'Lofi' && ev.instrument === 'SN' && (ev.velocity > 60)) {
      // LAZY SNARE: Delay snares on 2 and 4 (gridPos 4 and 12)
      // 4 ticks at 90bpm is ~30ms, significant drag
      if (ev.gridPos % 8 === 4) {
        ev.time += (TPQ * 0.05)
      }
    }

    return ev
  })
}

function writeEventsToClip(clip, events) {
  if (typeof clip.clearSteps === 'function') {
    clip.clearSteps()
  } else if (typeof clip.clear === 'function') {
    clip.clear()
  }
  try {
    if (typeof clip.setLoopLength === 'function') {
      clip.setLoopLength(16.0)
    } else if (clip.getLoopLength && typeof clip.getLoopLength().set === 'function') {
      clip.getLoopLength().set(16.0)
    } else if (typeof clip.setLength === 'function') {
      clip.setLength(16.0)
    }
  } catch (e) {
  }
  try {
    if (typeof clip.setStepSize === 'function') {
      clip.setStepSize(0.0625) // 1/64th note resolution
    } else if (clip.getStepSize && typeof clip.getStepSize().set === 'function') {
      clip.getStepSize().set(0.0625)
    }
  } catch (e) {
    // Ignore
  }

  const TICKS_64TH = 6 // 96 / 16

  for (let i = 0; i < events.length; i++) {
    let ev = events[i]
    if (ev.time < 0) continue

    // Calculate step index based on 64th note grid
    const step = Math.round(ev.time / TICKS_64TH)
    const dur = ev.duration / TPQ

    const midiNote = clampNote(ev.note)
    clip.setStep(0, step, midiNote, ev.velocity, dur)
  }
}

function flush() { }
function exit() { }
