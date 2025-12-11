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
  'Lofi (80-90)',
  'Synthwave (100-120)',
  'Techno (130)',
  'Trap (140)',
  'Tribal (125)'
]
const INSTRUMENTS = (() => {
  const rest = ['Bass', 'Bell', 'Hi-Hat', 'Kick', 'Percussion', 'Ride', 'Shaker', 'Snare', 'Tom'].sort()
  return ['All'].concat(rest)
})()

// --- TIMBRE GUIDE & DEFAULT NOTES ---
const NOTES = {
  'Kick': 18,       // C1 in bitwig
  'Snare': 20,      
  'Hi-Hat': 24,     
  'Shaker': 23,     
  'Tom': 25,        
  'Percussion': 27, 
  'Ride': 29,       
  'Bell': 30,
  'Bass': 36       // C2 anchor for simple bass ostinatos
}

const OCTAVE_OFFSET = 0
var globalPitchOffset = 0 

function clampNote(n) {
  if (typeof n !== 'number') n = Number(n) || 0
  n = Math.round(n)
  if (n < 0) n = 0
  if (n > 127) n = 127
  return n
}

// --- TEMPLATES ---
const TEMPLATES = {
  'Kick': {
    'Trap': ['x.........x.....', 'x...........x...', 'x..x......x.....', 'x.........x..x..', 'x.......x.x.....'],
    'Drill': ['x.........x...x.', 'x...x.....x...x.', 'x.........x.x...', 'x.....x...x.....', 'x...x...x...x...'],
    'Lofi': ['x.........x..x..', 'x...x.....x.....', 'x.........x.....', 'x.......x.......'],
    'Boom Bap': ['x.........xx....', 'x..x......x.....', 'x.........x.x...', 'x.....x.x.......'],
    'House': ['x...x...x...x...', 'x...x...x...x...', 'x..x.x..x..x.x..', 'x.......x...x...'],
    'Techno': ['x...x...x...x...', 'x...x...x...x...', 'x..xx...x..xx...', 'x...x.x.x...x...'],
    'Ambient': ['x...............', 'x.......x.......', '................'],
    'Tribal': ['x.....x.....x...', 'x...x...x.x.....', 'x..x..x.....x...'],
    'Amen Brother': ['x.x.......xx....', 'x.........xx..x.', '..x.......xx....', 'x.x.......x.....'],
    'Synthwave': ['x...x...x...x...', 'x...x...x..x.x..', 'x...x.....x.x...', 'x.......x...x...'] // Driving 4/4 with slight variations
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
      'x...x...x...x...', 'x...x...x...x.x.', 'x...x...x..x.x..',
      'x...x...xx..x...', 'x..x...x..x...x.', 'x...x...x...xx..'
    ]
  },
  'Snare': {
    'Trap': ['........x.......', '........x.......', '........x...x...', '........x.x.....'],
    'Drill': ['......x.......x.', '......x.....x...', 'xxx...x.......x.', '......x...x...x.'],
    'Lofi': ['....x.......x...', '....x.......x.x.', '....x.....x.x...', '....x.......x...'],
    'Boom Bap': ['....x.......x...', '....x..x....x...', '....x.......x.x.'],
    'House': ['....x.......x...', '....x.......x...', '....x.....x.x...', '..x.....x.......'],
    'Techno': ['....x.......x...', '....x.......x...', '................'],
    'Ambient': ['................', '....x.......x...', '................'],
    'Tribal': ['....x.......x...', '..x.....x.......', '......x.......x.'],
    'Amen Brother': ['....x..x.x..x...', '....x.......x.x.', '....x.......x...', '..x.x..x.x..x...', '....x...x.x.x...'],
    'Synthwave': ['....x.......x...', '....x.......x.x.', '....x..x....x...'] // Big gated snares on 2 and 4
  },
  'Hi-Hat': {
    'Trap': ['x.x.x.x.x.x.x.x.', 'x.x.x.x.x.xxx.x.', 'x...x...x...x...', 'x.......x.......', 'x.x.x.x.x.......', 'x.x...x.x.x...x.'],
    'Drill': ['x..x..x.x..x..x.', 'x..x.x..x..x.x..', 'x..x..x...x..x..', '.x..x..x.x..x..x', 'x...x...x..x..x.'],
    'Lofi': ['x.x.x.x.x.x.x.x.', '-.x.-.x.-.x.-.x.', 'x.x...x.x.x.....', '....x.......x...', 'x-x-x-x-x-x-x-x-'],
    'Boom Bap': ['x.x.x.x.x.x.x.x.', 'x-x-x-x-x-x-x-x-', 'x.x..x..x.x..x..', 'x...x.x.x...x.x.', 'x.......x.x.x...'],
    'House': ['.o.o.o.o.o.o.o.o', 'x.o.x.o.x.o.x.o.', 'x...x...x...x...', '..x...x...x...x.', 'x.x.x.o.x.x.x.o.'],
    'Techno': ['x.x.x.x.x.x.x.x.', '.x.x.x.x.x.x.x.x', 'xxxx.xxxxxxx.xxx', '..x...x...x...x.'],
    'Ambient': ['...x.......x....', 'x.......x.......', '.......x.......x', '. . . . x . . . ', '................'],
    'Tribal': ['..x...x...x...x.', 'x...x.x.x...x...', '..x.x...x.x...x.'],
    'Amen Brother': ['x.x.x.x.x.x.x.x.', 'x.x.x.x.x.xx.xx.'],
    'Synthwave': ['x.x.x.x.x.x.x.x.', 'xxxxxxxxxxxxxxxx', 'x.x.x.x.x.x.x.o.', 'x...x...x...x...'] // 8ths, 16ths, or disco offbeats
  },
  'Shaker': {
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
  'Tom': {
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
  'Percussion': {
    'Trap': ['..x...x...x...x.', '....x.......x...', 'x.......x.......', '......x...x.....'],
    'Drill': ['..x.....x.......', '......x...x.....', '....x.......x...', 'x.....x.....x...'],
    'Lofi': ['....x.......x...', '..x...x...x.....', '........x.......', 'x.x.............'],
    'Boom Bap': ['..x...x.......x.', '....x...x.......', '..x.............'],
    'House': ['..x...x...x...x.', '....x.......x...', 'x.....x.....x...', '...x.....x......'],
    'Techno': ['..x...x...x...x.', '....x.......x...', 'x...x...x...x...', '......x.x.x.....'],
    'Ambient': ['..x.............', '......x.......x.', 'x.......x.......', '....x.......x...'],
    'Tribal': ['..x.............', '....x.......x...', '......x.x.......'],
    'Amen Brother': ['..x.............', 'x.......x.......'],
    'Synthwave': ['....x.......x...', '..x...x...x.....']
  },
  'Ride': {
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
  'Bell': {
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
  'Lofi': { velStrong: 85, velWeak: 50, swing: 0.25 },
  'Boom Bap': { velStrong: 95, velWeak: 60, swing: 0.15 },
  'House': { velStrong: 100, velWeak: 50, swing: 0.05 },
  'Techno': { velStrong: 100, velWeak: 85, swing: 0 },
  'Ambient': { velStrong: 65, velWeak: 40, swing: 0 },
  'Tribal': { velStrong: 115, velWeak: 75, swing: 0.18 },
  'Amen Brother': { velStrong: 120, velWeak: 55, swing: 0.10 },
  'Synthwave': { velStrong: 110, velWeak: 80, swing: 0 } // Machine-like, no swing
}

var sectionSetting, instrumentSetting
var cursorClipLauncher, cursorClipArranger
var clipTypeSetting
var transport

function init () {
  println('Rhythm Generator v0.1 (Alphanumeric Sort) Initialized')
  const documentState = host.getDocumentState()
  transport = host.createTransport()
  
  cursorClipLauncher = host.createLauncherCursorClip(16 * 128, 128)
  cursorClipArranger = host.createArrangerCursorClip(16 * 128, 128)

  const defaultScrollKey = clampNote((NOTES['Kick'] || 36) + OCTAVE_OFFSET)
  try { cursorClipLauncher.scrollToKey(defaultScrollKey) } catch (e) {}
  try { cursorClipArranger.scrollToKey(defaultScrollKey) } catch (e) {}

  instrumentSetting = documentState.getEnumSetting('Instrument', 'Generator', INSTRUMENTS, INSTRUMENTS[0])
  sectionSetting = documentState.getEnumSetting('Genre', 'Generator', GENRES, GENRES[0])
  clipTypeSetting = documentState.getEnumSetting('Clip Type', 'Generator', ['Launcher', 'Arranger'], 'Launcher')

  // --- GLOBAL PITCH SHIFT SETTING ---
  const shiftSetting = documentState.getNumberSetting('Global Pitch Shift', 'Generator', -48, 48, 1, 'st', 0)
  shiftSetting.addValueObserver(function(val) {
      globalPitchOffset = val
  })

  documentState.getSignalSetting('Generate', 'Generator', 'FIRE').addSignalObserver(() => {
    generateAndWrite()
  })
}

/**
 * INTELLIGENT ENSEMBLE SELECTION
 */
function selectEnsemble(genre) {
  // 1. Foundation
  let active = ['Kick', 'Snare']

  // 2. Primary Driver
  const drivers = ['Hi-Hat', 'Shaker', 'Ride']
  let driver = drivers[Math.floor(Math.random() * drivers.length)]

  if (genre === 'Trap' || genre === 'Drill') driver = 'Hi-Hat' 
  if (genre === 'Tribal') driver = 'Shaker' 
  if (genre === 'Techno') driver = (Math.random() > 0.4) ? 'Hi-Hat' : 'Ride'
  if (genre === 'Amen Brother') driver = (Math.random() > 0.5) ? 'Ride' : 'Hi-Hat' 
  if (genre === 'Synthwave') driver = (Math.random() > 0.7) ? 'Ride' : 'Hi-Hat' // Mostly Hats

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
  const textures = ['Tom', 'Percussion', 'Bell']
  let texture = textures[Math.floor(Math.random() * textures.length)]
  
  // 5. Secondary Texture
  let secondTexture = null
  if (Math.random() > 0.6) {
      secondTexture = textures[Math.floor(Math.random() * textures.length)]
      if (secondTexture === texture) secondTexture = null
  }

  if (genre === 'Ambient') {
    active = ['Shaker', 'Ride', 'Bell', 'Tom']
    if (Math.random() > 0.5) active.push('Percussion')
  } 
  else if (genre === 'Tribal') {
    active = ['Kick', 'Tom', 'Percussion', 'Shaker']
    if (Math.random() > 0.5) active.push('Hi-Hat')
  }
  else if (genre === 'Amen Brother') {
    active = ['Kick', 'Snare', 'Ride', 'Hi-Hat'] 
    if (Math.random() > 0.6) active.push('Bell') 
  }
  else if (genre === 'Synthwave') {
    // 80s Vibe: Kick, Snare, Hats + heavy use of Toms/Ride/Crash
    active = ['Kick', 'Snare', 'Hi-Hat']
    if (Math.random() > 0.3) active.push('Tom')
    if (Math.random() > 0.5) active.push('Ride')
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
  
  host.showPopupNotification('Generated: ' + (isAll ? 'Ensemble' : instSelection) + ' (' + genre + ') Shift: ' + globalPitchOffset)
}

function generateBaseSteps(inst, genre, rule, templates, baseNote) {
  const templateIdx = Math.floor(Math.random() * templates.length)
  const patternStr = templates[templateIdx]
  const steps = []

  for (let i = 0; i < 16; i++) {
     const char = patternStr[i]
     if (char === '-') continue
     if (char === '.') continue 

     let keepNote = true
     
     if (keepNote) {
        let vel = (i % 4 === 0) ? rule.velStrong : rule.velWeak 
        let type = 'hit'
        let note = baseNote

        if (inst === 'Shaker') {
           const subPos = i % 4
           if (subPos === 0) vel = rule.velStrong
           else if (subPos === 2) vel = rule.velStrong * 0.85
           else vel = rule.velWeak
        }
        if (inst === 'Ride') {
           vel = (vel > 100) ? 95 : vel
        }
        if (inst === 'Bell') {
           vel = 115 
           type = 'bell'
        }
        if (inst === 'Kick') {
           vel = 120 
           if (char === '.') vel = 100 
        }
        if (inst === 'Snare') {
           if (i % 4 === 0 || i === 4 || i === 12) vel = 125
           else vel = 90 
           if ((genre === 'Trap' || genre === 'Drill') && i === 8) vel = 127
        }

        if (char === 'o') {
           if (inst === 'Hi-Hat') {
             note = clampNote(46 + globalPitchOffset) 
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
  }
  return steps
}

function generatePatternForInstrument(inst, genre, isAll = false) {
  const rule = RULES[genre] || RULES['Trap']
  const bank = TEMPLATES[inst] || TEMPLATES['Hi-Hat']
  const templates = bank[genre] || bank['Trap'] || bank[Object.keys(bank)[0]]
  
  const baseNote = clampNote((NOTES[inst] || 36) + OCTAVE_OFFSET + globalPitchOffset)
  let events = []

  const steps = generateBaseSteps(inst, genre, rule, templates, baseNote)
  
  for (let bar = 0; bar < 4; bar++) {
    const isTurnaround = (bar === 3) 
    
    // Synthwave loves huge tom fills on turnarounds
    if (inst === 'Tom' && genre === 'Synthwave' && !isTurnaround) {
        if (Math.random() > 0.2) continue // 20% chance of random tom hit outside turnaround
    }
    else if (inst === 'Tom' && genre !== 'Tribal' && !isTurnaround) {
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
    if (!processed && (inst === 'Hi-Hat' || inst === 'Shaker' || inst === 'Ride')) {
       let rollChance = 0.08 
       if (genre === 'Trap' || genre === 'Drill') rollChance = 0.2
       if (genre === 'Amen Brother') rollChance = 0.15 
       if (isTurnaround) rollChance += 0.15
       if (genre === 'Synthwave') rollChance = 0.02 // Synthwave usually has straight hats
       
       if (ev.velocity > 60 && Math.random() < rollChance) {
          const div = (Math.random() > 0.6) ? 2 : 3 
          const stepSize = ev.duration / div
          
          for (let k = 0; k < div; k++) {
             out.push({
                time: ev.time + (k * stepSize),
                duration: stepSize,
                velocity: ev.velocity * (0.7 + (k * 0.1)), 
                note: ev.note,
                type: 'roll',
                instrument: ev.instrument,
                genre: ev.genre
             })
          }
          processed = true
       }
       // 3. EAR CANDY: Occasional Open Hat on Off-beat
       else if (inst === 'Hi-Hat' && !processed && Math.random() < 0.04) {
          if (ev.gridPos % 2 !== 0) {
              out.push({
                  time: ev.time,
                  duration: TICKS_16TH * 2, 
                  velocity: 110,
                  note: clampNote(46 + globalPitchOffset),
                  type: 'open',
                  instrument: ev.instrument,
                  genre: ev.genre
              })
              processed = true
          }
       }
    }

    // 4. EAR CANDY: Ghost Snares
    if (!processed && inst === 'Snare' && ev.velocity > 100) {
       const ghostTime = ev.time - TICKS_16TH
       const prevEv = out.length > 0 ? out[out.length - 1] : null
       let canAdd = true
       if (ghostTime < 0) canAdd = false
       if (prevEv && prevEv.time >= ghostTime) canAdd = false

       let ghostChance = 0.2
       if (genre === 'Amen Brother') ghostChance = 0.45 
       if (genre === 'Synthwave') ghostChance = 0.05 // Synthwave snares are usually clean

       if (canAdd && Math.random() < ghostChance) {
          out.push({
             time: ghostTime,
             duration: TICKS_16TH,
             velocity: 45, 
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
    
    if (ev.velocity > 127) ev.velocity = 127
    if (ev.velocity < 1) ev.velocity = 1
    ev.note = clampNote(ev.note) 
    
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
  for (let i = 0; i < events.length; i++) {
    let ev = events[i]
    if (ev.time < 0) continue
    const step = ev.time / TICKS_16TH
    const dur = ev.duration / TPQ

    const midiNote = clampNote(ev.note)
    clip.setStep(0, parseInt(step, 10), midiNote, ev.velocity, dur)
  }
}

function flush() {}
function exit() {}
