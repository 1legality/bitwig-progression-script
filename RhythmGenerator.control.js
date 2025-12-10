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

const GENRES = ['Trap', 'Drill', 'Lofi', 'Boom Bap', 'House', 'Techno', 'Ambient', 'Tribal']
const INSTRUMENTS = ['All', 'Kick', 'Snare', 'Hi-Hat', 'Shaker', 'Tom', 'Percussion', 'Ride', 'Bell']

// --- TIMBRE GUIDE & DEFAULT NOTES ---
// Use your VST mapping (kick/snare/hihat) and map tam/percussion to white keys in F1..C2
const NOTES = {
  'Kick': 36,       // C1 (Kick)
  'Snare': 38,      // D1 (Snare)
  'Hi-Hat': 42,     // F#1 (Closed Hi-Hat)
  'Shaker': 41,     // F1
  'Tom': 43,        // G1
  'Percussion': 45, // A1
  'Ride': 47,       // B1
  'Bell': 48        // C2
}

// add a global octave offset (semitones). Negative = lower pitch.
// Default -18 semitones = down 1.5 octaves (adjust as needed)
const OCTAVE_OFFSET = -18

// small helper to keep notes in 0..127 and integer
function clampNote(n) {
  if (typeof n !== 'number') n = Number(n) || 0
  n = Math.round(n)
  if (n < 0) n = 0
  if (n > 127) n = 127
  return n
}

// --- TEMPLATES (Abbreviated for readability, logic remains same) ---
const TEMPLATES = {
  'Kick': {
    'Trap': ['x.........x.....', 'x...........x...', 'x..x......x.....', 'x.........x..x..', 'x.......x.x.....'],
    'Drill': ['x.........x...x.', 'x...x.....x...x.', 'x.........x.x...', 'x.....x...x.....', 'x...x...x...x...'],
    'Lofi': ['x.........x..x..', 'x...x.....x.....', 'x.........x.....', 'x.......x.......'],
    'Boom Bap': ['x.........xx....', 'x..x......x.....', 'x.........x.x...', 'x.....x.x.......'],
    'House': ['x...x...x...x...', 'x...x...x...x...', 'x..x.x..x..x.x..', 'x.......x...x...'],
    'Techno': ['x...x...x...x...', 'x...x...x...x...', 'x..xx...x..xx...', 'x...x.x.x...x...'],
    'Ambient': ['x...............', 'x.......x.......', '................'],
    'Tribal': ['x..x..x.x..x..x.', 'x...x...x.x.x...', 'x.x...x.x...x...']
  },
  'Snare': {
    'Trap': ['........x.......', '........x.......', '........x...x...', '........x.x.....'],
    'Drill': ['......x.......x.', '......x.....x...', 'xxx...x.......x.', '......x...x...x.'],
    'Lofi': ['....x.......x...', '....x.......x.x.', '....x.....x.x...', '....x.......x...'],
    'Boom Bap': ['....x.......x...', '....x..x....x...', '....x.......x.x.'],
    'House': ['....x.......x...', '....x.......x...', '....x.....x.x...', '..x.....x.......'],
    'Techno': ['....x.......x...', '....x.......x...', '................'],
    'Ambient': ['................', '....x.......x...', '................'],
    'Tribal': ['..x...x...x...x.', 'x...x...x...x...', '..x..x..x..x....']
  },
  'Hi-Hat': {
    'Trap': ['x.x.x.x.x.x.x.x.', 'x.x.x.x.x.xxx.x.', 'x...x...x...x...', 'x.......x.......', 'x.x.x.x.x.......', 'x.x...x.x.x...x.'],
    'Drill': ['x..x..x.x..x..x.', 'x..x.x..x..x.x..', 'x..x..x...x..x..', '.x..x..x.x..x..x', 'x...x...x..x..x.'],
    'Lofi': ['x.x.x.x.x.x.x.x.', '-.x.-.x.-.x.-.x.', 'x.x...x.x.x.....', '....x.......x...', 'x-x-x-x-x-x-x-x-'],
    'Boom Bap': ['x.x.x.x.x.x.x.x.', 'x-x-x-x-x-x-x-x-', 'x.x..x..x.x..x..', 'x...x.x.x...x.x.', 'x.......x.x.x...'],
    'House': ['.o.o.o.o.o.o.o.o', 'x.o.x.o.x.o.x.o.', 'x...x...x...x...', '..x...x...x...x.', 'x.x.x.o.x.x.x.o.'],
    'Techno': ['x.x.x.x.x.x.x.x.', '.x.x.x.x.x.x.x.x', 'xxxx.xxxxxxx.xxx', '..x...x...x...x.'],
    'Ambient': ['...x.......x....', 'x.......x.......', '.......x.......x', '. . . . x . . . ', '................'],
    'Tribal': ['x.x.x.x.x.x.x.x.', '.x.x.x.x.x.x.x.x', 'x.xx.x.x.xx.x.x.']
  },
  'Shaker': {
    'Trap': ['x.x.x.x.x.x.x.x.', 'x.xxx.xxx.xxx.xx', 'x...x...x...x...', '..x...x...x...x.'],
    'Drill': ['x.x.x.x.x.x.x.x.', '-.x.-.x.-.x.-.x.', 'x..x..x..x..x..x', '......x.......x.'],
    'Lofi': ['x.x.x.x.x.x.x.x.', 'x.x.x.x.x.x.x...', 'x...x...x...x...', '..x.x.x...x.x.x.'],
    'Boom Bap': ['x.x.x.x.x.x.x.x.', 'x-x-x-x-x-x-x-x-', 'x..x..x..x..x..x'],
    'House': ['x.x.x.x.x.x.x.x.', '..x...x...x...x.', 'x.x.x...x.x.x...', 'x...x.x.x...x.x.'],
    'Techno': ['x.x.x.x.x.x.x.x.', 'x.x.x.x.x.x.x.x.', '.x.x.x.x.x.x.x.x'],
    'Ambient': ['x.x.x.x.x.x.x.x.', '................', 'x.......x.......', '........x.......'],
    'Tribal': ['x.x.x.x.x.x.x.x.', 'x.xx.x.xx.x.xx.x', 'x..x..x..x..x..x', 'x.x...x.x.x...x.']
  },
  'Tom': {
    'Trap': ['................', '..............xx', '............x.x.', 'x...............'],
    'Drill': ['..............x.', '..........x..x..', '..x.............', 'x..x..x.........'],
    'Lofi': ['................', '..............f.', '..........x.....'],
    'Boom Bap': ['................', '..............x.', '..x.......x.....'],
    'House': ['................', '..x.......x.....', '....x.......x...', '..x...x...x...x.'],
    'Techno': ['................', '....x.......x...', '..x...x...x...x.', 'x...x...x...x...'],
    'Ambient': ['x...............', '..............x.', '......x.........'],
    'Tribal': ['x..x..x.x..x..x.', '..x...x.x...x...', 'x...x.x...x.x...', 'x.x...x.x.x...x.', '..x..x....x..x..']
  },
  'Percussion': {
    'Trap': ['..x...x...x...x.', '....x.......x...', 'x.......x.......', '......x...x.....'],
    'Drill': ['..x.....x.......', '......x...x.....', '....x.......x...', 'x.....x.....x...'],
    'Lofi': ['....x.......x...', '..x...x...x.....', '........x.......', 'x.x.............'],
    'Boom Bap': ['..x...x.......x.', '....x...x.......', '..x.............'],
    'House': ['..x...x...x...x.', '....x.......x...', 'x.....x.....x...', '...x.....x......'],
    'Techno': ['..x...x...x...x.', '....x.......x...', 'x...x...x...x...', '......x.x.x.....'],
    'Ambient': ['..x.............', '......x.......x.', 'x.......x.......', '....x.......x...'],
    'Tribal': ['..x...x...x...x.', '....x..x....x..x', 'x.....x.......x.', 'x.x.x...x.x.x...']
  },
  'Ride': {
    'Trap': ['x...x...x...x...', 'x.x.x.x.x.x.x.x.', 'x.......x.......'],
    'Drill': ['x...x...x...x...', 'x..x..x.x..x..x.', 'x.......x.......'],
    'Lofi': ['x...x...x...x...', 'x.x.x.x.x.x.x.x.', 'x..x..x..x..x..x'],
    'Boom Bap': ['x.x.x.x.x.x.x.x.', 'x...x.x.x...x.x.', 'x..x.x..x..x.x..', 'x...x...x..x.x..'],
    'House': ['x...x...x...x...', '.x..x...x...x...', 'x.x.x.x.x.x.x.x.', 'x...x.x.x...x.x.'],
    'Techno': ['x.x.x.x.x.x.x.x.', 'x...x...x...x...', '.x..x...x...x...'],
    'Ambient': ['x...............', 'x...x...x...x...', 'x.......x.......'],
    'Tribal': ['x...x...x...x...', 'x...x.x.x...x.x.', 'x.x...x.x.x...x.']
  },
  'Bell': {
    'Trap': ['x...............', '............x...', '..x.......x.....'],
    'Drill': ['..x.............', 'x.....x.....x...', '....x.......x...'],
    'Lofi': ['..x.............', '......x.........'],
    'Boom Bap': ['..x...x.......x.', '....x...x.......'],
    'House': ['.x..x...x...x...', '..x...x...x...x.', 'x...x...x...x...'],
    'Techno': ['.x..x...x...x...', '..x.......x.....', 'x...x...x...x...'],
    'Ambient': ['................', '......x.........', '..............x.'],
    'Tribal': ['x.x.x...x.x.x...', '..x...x...x...x.', 'x..x..x.x..x..x.']
  }
}

const RULES = {
  'Trap': { velStrong: 110, velWeak: 70, swing: 0, rollChance: 0.35, rollType: 'ratchet', rollResolution: [2, 3, 4, 5, 7] },
  'Drill': { velStrong: 100, velWeak: 60, swing: 0, rollChance: 0.4, rollType: 'slide', rollResolution: [3, 4, 6, 5] },
  'Lofi': { velStrong: 85, velWeak: 50, swing: 0.25, rollChance: 0.1, rollType: 'drag' },
  'Boom Bap': { velStrong: 95, velWeak: 60, swing: 0.15, rollChance: 0.05, rollType: 'none' },
  'House': { velStrong: 100, velWeak: 50, swing: 0.05, rollChance: 0.1, rollType: 'burst' },
  'Techno': { velStrong: 100, velWeak: 85, swing: 0, rollChance: 0.05, rollType: 'none' },
  'Ambient': { velStrong: 65, velWeak: 40, swing: 0, rollChance: 0.3, rollType: 'spray' },
  'Tribal': { velStrong: 115, velWeak: 75, swing: 0.18, rollChance: 0.2, rollType: 'burst' }
}

var sectionSetting, instrumentSetting, heatSetting, densitySetting
var cursorClipLauncher, cursorClipArranger
var clipTypeSetting
var transport

function init () {
  println('Rhythm Generator v0.1 Initialized')
  const documentState = host.getDocumentState()
  transport = host.createTransport()
  
  cursorClipLauncher = host.createLauncherCursorClip(16 * 128, 128)
  cursorClipArranger = host.createArrangerCursorClip(16 * 128, 128)

  // apply octave offset for the default clip scroll key
  const defaultScrollKey = clampNote((NOTES['Kick'] || 36) + OCTAVE_OFFSET)
  try { cursorClipLauncher.scrollToKey(defaultScrollKey) } catch (e) {}
  try { cursorClipArranger.scrollToKey(defaultScrollKey) } catch (e) {}

  instrumentSetting = documentState.getEnumSetting('Instrument', 'Generator', INSTRUMENTS, INSTRUMENTS[0])
  sectionSetting = documentState.getEnumSetting('Genre', 'Generator', GENRES, GENRES[0])
  heatSetting = documentState.getEnumSetting('Complexity', 'Generator', ['Off', 'Low', 'Mid', 'High'], 'Off')
  densitySetting = documentState.getEnumSetting('Density', 'Generator', ['Off', 'Low', 'Mid', 'High'], 'Off')
  clipTypeSetting = documentState.getEnumSetting('Clip Type', 'Generator', ['Launcher', 'Arranger'], 'Launcher')

  documentState.getSignalSetting('Generate', 'Generator', 'FIRE').addSignalObserver(() => {
    generateAndWrite()
  })
}

function generateAndWrite() {
  const genre = sectionSetting.get()
  const instSelection = instrumentSetting.get()
  
  const heatMap = { 'Off': 0.0, 'Low': 0.33, 'Mid': 0.66, 'High': 1.0 }
  const heat = heatMap[heatSetting.get()]
  const densityEnum = densitySetting.get()

  let instrumentsToProcess = []
  if (instSelection === 'All') {
    instrumentsToProcess = Object.keys(NOTES)
  } else {
    instrumentsToProcess = [instSelection]
  }

  let combinedEvents = []
  for (let i = 0; i < instrumentsToProcess.length; i++) {
    const inst = instrumentsToProcess[i]
    const instEvents = generatePatternForInstrument(inst, genre, heat, densityEnum)
    combinedEvents = combinedEvents.concat(instEvents)
  }

  const clipChoice = (clipTypeSetting && clipTypeSetting.get && clipTypeSetting.get() === 'Arranger') ? cursorClipArranger : cursorClipLauncher
  writeEventsToClip(clipChoice, combinedEvents)
  
  host.showPopupNotification('Generated: ' + instSelection + ' (' + genre + ')')
}

function generatePatternForInstrument(inst, genre, heat, densityEnum) {
  const rule = RULES[genre] || RULES['Trap']
  const bank = TEMPLATES[inst] || TEMPLATES['Hi-Hat']
  const templates = bank[genre] || bank['Trap'] || bank[Object.keys(bank)[0]]
  
  const templateIdx = Math.floor(Math.random() * templates.length)
  const patternStr = templates[templateIdx]
  
  // base note already adjusted by OCTAVE_OFFSET so all derived notes inherit the same shift
  const baseNote = clampNote((NOTES[inst] || 36) + OCTAVE_OFFSET)
  let events = []

  // 1. Generate Base Pattern (1 Bar / 16 steps)
  // We determine what happens on each step of the grid first
  let basePatternSteps = []
  for (let i = 0; i < 16; i++) {
     const char = patternStr[i]
     if (char === '-') continue
     if (char === '.' && heat === 0) continue

     let keepNote = true
     // Density Check
     if (densityEnum !== 'Off') {
         const isDownbeat = (i % 4 === 0)
         const isBackbeat = (inst === 'Snare' && (i === 4 || i === 12))
         const isImportant = isDownbeat || isBackbeat

         if (densityEnum === 'High') { if (!isImportant && Math.random() < 0.1) keepNote = false }
         else if (densityEnum === 'Mid') { if (!isImportant && Math.random() < 0.5) keepNote = false }
         else if (densityEnum === 'Low') { if (!isImportant) keepNote = false }
     }
     if (inst === 'Kick' && i === 0 && densityEnum !== 'Low') keepNote = true
     
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
           if (heat > 0) vel += Math.floor(Math.random() * 10 - 5)
        }
        if (inst === 'Bell') {
           vel = 115 + (heat === 0 ? 0 : Math.floor(Math.random() * 12))
           type = 'bell'
        }
        if (inst === 'Kick') {
           vel = 120 + (heat === 0 ? 0 : Math.floor(Math.random() * 7))
           if (char === '.') vel = 100 
        }
        if (inst === 'Snare') {
           if (i % 4 === 0 || i === 4 || i === 12) vel = 125
           else vel = 90 
           if ((genre === 'Trap' || genre === 'Drill') && i === 8) vel = 127
        }

        if (char === 'o') {
           if (inst === 'Hi-Hat') note = 46 // override hi-hat open pitch
           vel = rule.velStrong + 10
           type = 'open'
        } else if (char === 'f') {
           type = 'flam'
        } else if (char === '.') {
          vel = Math.floor(vel * 0.7)
        }

        // apply octave offset to special-case overrides & clamp the final note
        // if 'note' had been left as an override, apply the same shift as baseNote
        if (typeof note === 'number') {
          // if note was left as MIDI number (e.g., open hihat override), shift it same as base
          if (note !== baseNote) {
            note = clampNote(note + OCTAVE_OFFSET)
          } else {
            note = clampNote(note) // already includes baseNote shift
          }
        }

        basePatternSteps.push({ i, vel, note, type })
     }
  }

  // 2. Expand to 4 Bars (Loop)
  for (let bar = 0; bar < 4; bar++) {
    const isTurnaround = (bar === 3)
    
    // Tom Logic: Only play on turnaround OR random chaos
    // Fix: If heat is 0 (Off), skip checks and allow pattern if it's meant to be there
    if (inst === 'Tom' && genre !== 'Tribal' && !isTurnaround) {
       // If Heat is ON, we might random skip. If Heat is OFF, we usually skip Toms unless Tribal
       // Standard logic: Toms are fill instruments usually
       if (heat > 0) {
          if (Math.random() > (0.2 + heat)) continue
       } else {
          // Heat Off: Toms only on turnaround
          continue 
       }
    }

    // Apply base pattern to this bar
    for (let s = 0; s < basePatternSteps.length; s++) {
        const step = basePatternSteps[s]
        // use TICKS_16TH instead of magic number 24
        const tick = (bar * BAR_TICKS) + (step.i * TICKS_16TH)
        
        events.push({
            time: tick,
            duration: (inst === 'Shaker' || inst === 'Ride' || inst === 'Bell') ? TICKS_16TH : (TICKS_16TH / 2), 
            velocity: step.vel,
            note: step.note,
            type: step.type,
            gridPos: step.i,
            instrument: inst,
            genre: genre
        })
    }
  }
  
  events = applyInstrumentArticulations(events, inst, rule, heat, genre)
  events = applyGroove(events, rule, inst, heat, genre) 
  
  return events
}

function applyInstrumentArticulations(events, inst, rule, heat, genre) {
  let out = []
  events.sort((a, b) => a.time - b.time)

  for (let i = 0; i < events.length; i++) {
    let ev = events[i]
    let processed = false

    if (heat > 0) {
        if (ev.type === 'flam' || (inst === 'Tom' && Math.random() < heat * 0.3)) {
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
        else if (inst === 'Hi-Hat' || (inst === 'Snare' && (genre === 'Trap' || genre === 'Drill'))) {
          const isEndOfBeat = (ev.gridPos + 1) % 4 === 0
          const isTurnaroundBar = ev.time >= (3 * BAR_TICKS)
          
          let rollProb = rule.rollChance * heat
          if (inst === 'Snare') rollProb *= 0.5 
          if (isEndOfBeat) rollProb *= 1.5
          if (isTurnaroundBar) rollProb *= 2.0
          
          if (ev.type !== 'open' && Math.random() < rollProb) {
            if (rule.rollType === 'ratchet' || rule.rollType === 'slide' || rule.rollType === 'burst') {
              let subs = rule.rollResolution || [2, 3]
              if (rule.rollType === 'burst') subs = [4, 6]
              
              const div = subs[Math.floor(Math.random() * subs.length)]
              const stepSize = 24 / div 
              const rampUp = Math.random() > 0.5
              
              for (let k = 0; k < div; k++) {
                const t = ev.time + (k * stepSize)
                let vScale = rampUp ? 0.6 + ((k / (div - 1)) * 0.4) : 1.0 - ((k / (div - 1)) * 0.4)
                if (div === 1) vScale = 1.0 
                
                let pitchOffset = 0
                if (rule.rollType === 'slide') pitchOffset = -1 * Math.floor((k / div) * 12) 
                
                out.push({
                  time: t,
                  duration: stepSize, 
                  velocity: ev.velocity * vScale,
                  note: clampNote(ev.note + pitchOffset),
                  type: 'roll',
                  instrument: ev.instrument,
                  genre: ev.genre
                })
              }
              processed = true
            }
             else if (rule.rollType === 'drag') {
                out.push({
                   time: ev.time - 4,
                   duration: 4,
                   velocity: ev.velocity * 0.4,
                   note: clampNote(ev.note),
                   type: 'drag',
                   instrument: ev.instrument,
                   genre: ev.genre
                })
                out.push(ev)
                processed = true
             }
          }
        }
        else if (genre === 'Ambient' || (inst === 'Shaker' && Math.random() < 0.05)) {
            for (let k=0; k<4; k++) {
               out.push({
                 time: ev.time + (Math.random()*10 - 5),
                 duration: 6,
                 velocity: ev.velocity * 0.5,
                 note: clampNote(ev.note), // clamp note here
                 type: 'spray',
                 instrument: ev.instrument,
                 genre: ev.genre
               })
            }
            processed = true
        }
    }
    if (!processed) out.push(ev)
  }
  return out
}

function applyGroove(events, rule, heat) {
  return events.map(ev => {
    // 1. Swing & 2. Jitter only apply if Heat > 0
    if (heat > 0) {
      // use TICKS_16TH here
      const isOffbeat = (Math.floor(ev.time / TICKS_16TH) % 2 !== 0)
      if (isOffbeat) {
        ev.time += (rule.swing * TICKS_16TH)  // scale swing to ticks per 16th
      }
      
      let jitterAmount = 2
      if (ev.instrument === 'Shaker') jitterAmount = 4
      if (ev.instrument === 'Percussion') jitterAmount = 5 
      if (ev.genre === 'Techno' && ev.instrument === 'Kick') jitterAmount = 0 
      if (ev.genre === 'Techno' && ev.instrument === 'Hi-Hat') jitterAmount = 1 
      
      jitterAmount = jitterAmount * heat

      ev.time += (Math.random() * jitterAmount * 2) - jitterAmount
    }

    // 3. Clamp
    if (ev.velocity > 127) ev.velocity = 127
    if (ev.velocity < 1) ev.velocity = 1
    ev.note = clampNote(ev.note) // ensure final note is clamped
    
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

    // ensure note is a clamped integer and usable by the clip API
    const midiNote = clampNote(ev.note)
    clip.setStep(0, step, midiNote, ev.velocity, dur)
  }
}

function flush() {}
function exit() {}