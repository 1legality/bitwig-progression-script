/*
 * Rhythm Generator v0.6 (Multi-Instrument Edition)
 * Controller script for Bitwig Studio
 *
 * NEW FEATURES:
 * - Instrument Selector: Hi-Hat, Shaker, Tom, Percussion, Ride
 * - Shaker Physics: Velocity oscillation (Push/Pull effect)
 * - Tom Logic: Sparse patterns with Flams
 * - Ride Logic: Bell accents on downbeats
 * - Percussion: Euclidean-style ear candy
 */

loadAPI(17)

host.setShouldFailOnDeprecatedUse(true)
host.defineController('1legality', 'Rhythm Generator', '0.1', '64fc7e0d-6c39-4f46-8b10-6814139d5172', '1legality')

// --- Constants ---
const TPQ = 96 
const TICKS_16TH = TPQ / 4 
const BAR_TICKS = 4 * TPQ 

const GENRES = ['Trap', 'Drill', 'Lofi', 'Boom Bap', 'House', 'Techno', 'Ambient']
const INSTRUMENTS = ['Hi-Hat', 'Shaker', 'Tom', 'Percussion', 'Ride']

// --- Default MIDI Notes (Can be overridden by Drum Rack mapping) ---
const NOTES = {
  'Hi-Hat': 42,
  'Shaker': 70, // Maracas usually
  'Tom': 47,    // Low-Mid Tom
  'Percussion': 75, // Claves/Sticks
  'Ride': 51
}

// --- TEMPLATES (The DNA) ---
// x = Strong, . = Weak, o = Open/Alt, - = Rest, f = Flam
const TEMPLATES = {
  'Hi-Hat': {
    'Trap': ['x.x.x.x.x.x.x.x.', 'x.x.x.x.x.xxx.x.', 'x...x...x...x...'],
    'Drill': ['x..x..x.x..x..x.', 'x..x.x..x..x.x..'],
    'Lofi': ['x.x.x.x.x.x.x.x.', '-.x.-.x.-.x.-.x.'],
    'Boom Bap': ['x.x.x.x.x.x.x.x.', 'x-x-x-x-x-x-x-x-'],
    'House': ['.o.o.o.o.o.o.o.o', 'x.o.x.o.x.o.x.o.'],
    'Techno': ['x.x.x.x.x.x.x.x.', '.x.x.x.x.x.x.x.x'],
    'Ambient': ['...x.......x....', 'x.......x.......']
  },
  'Shaker': {
    // Shakers are usually denser "motors"
    'Trap': ['x.x.x.x.x.x.x.x.', 'x.xxx.xxx.xxx.xx'], 
    'Drill': ['x.x.x.x.x.x.x.x.', '-.x.-.x.-.x.-.x.'], // Drill shakers often double the hats
    'Lofi': ['x.x.x.x.x.x.x.x.', 'x.x.x.x.x.x.x...'], // Loose shake
    'Boom Bap': ['x.x.x.x.x.x.x.x.', 'x-x-x-x-x-x-x-x-'],
    'House': ['x.x.x.x.x.x.x.x.', '..x...x...x...x.'],
    'Techno': ['x.x.x.x.x.x.x.x.', 'x.x.x.x.x.x.x.x.'],
    'Ambient': ['x.x.x.x.x.x.x.x.', '................'] // very soft background
  },
  'Tom': {
    // Toms are sparse, mostly fills
    'Trap': ['................', '..............xx', '............x.x.'],
    'Drill': ['..............x.', '..........x..x..'],
    'Lofi': ['................', '..............f.'],
    'Boom Bap': ['................', '..............x.'],
    'House': ['................', '..x.......x.....'], // Tribal hints
    'Techno': ['................', '....x.......x...'], // Rumble hints
    'Ambient': ['x...............', '..............x.']
  },
  'Percussion': {
    // Syncopated ear candy
    'Trap': ['..x...x...x...x.', '....x.......x...'],
    'Drill': ['..x.....x.......', '......x...x.....'],
    'Lofi': ['....x.......x...', '..x...x...x.....'],
    'Boom Bap': ['..x...x.......x.', '....x...x.......'],
    'House': ['..x...x...x...x.', '....x.......x...'],
    'Techno': ['..x...x...x...x.', '....x.......x...'],
    'Ambient': ['..x.............', '......x.......x.']
  },
  'Ride': {
    // Bells and Bows
    'Trap': ['x...x...x...x...', 'x.x.x.x.x.x.x.x.'],
    'Drill': ['x...x...x...x...', 'x..x..x.x..x..x.'],
    'Lofi': ['x...x...x...x...', 'x.x.x.x.x.x.x.x.'],
    'Boom Bap': ['x.x.x.x.x.x.x.x.', 'x...x.x.x...x.x.'], // The "Spang-a-lang" feel
    'House': ['x...x...x...x...', '.x..x...x...x...'],
    'Techno': ['x.x.x.x.x.x.x.x.', 'x...x...x...x...'],
    'Ambient': ['x...............', 'x...x...x...x...']
  }
}

const RULES = {
  'Trap': { velStrong: 110, velWeak: 70, swing: 0, rollChance: 0.35, rollType: 'ratchet', rollResolution: [2, 3, 4, 5, 7] },
  'Drill': { velStrong: 100, velWeak: 60, swing: 0, rollChance: 0.4, rollType: 'slide', rollResolution: [3, 4, 6, 5] },
  'Lofi': { velStrong: 85, velWeak: 50, swing: 0.25, rollChance: 0.1, rollType: 'drag' },
  'Boom Bap': { velStrong: 95, velWeak: 60, swing: 0.15, rollChance: 0.05, rollType: 'none' },
  'House': { velStrong: 100, velWeak: 50, swing: 0.05, rollChance: 0.1, rollType: 'burst' },
  'Techno': { velStrong: 100, velWeak: 85, swing: 0, rollChance: 0.05, rollType: 'none' },
  'Ambient': { velStrong: 65, velWeak: 40, swing: 0, rollChance: 0.3, rollType: 'spray' }
}

// --- Controller State ---
var sectionSetting, instrumentSetting, heatSetting
var cursorClipLauncher

function init () {
  println('Rhythm Generator v0.6 Initialized')
  const documentState = host.getDocumentState()
  cursorClipLauncher = host.createCursorClip(128, 128)
  
  instrumentSetting = documentState.getEnumSetting('Instrument', 'Generator', INSTRUMENTS, INSTRUMENTS[0])
  sectionSetting = documentState.getEnumSetting('Genre', 'Generator', GENRES, GENRES[0])
  heatSetting = documentState.getNumberSetting('Complexity', 'Generator', 0, 100, 1, '%', 40)

  documentState.getSignalSetting('Generate', 'Generator', 'FIRE').addSignalObserver(() => {
    generateAndWrite()
  })
}

function generateAndWrite() {
  const genre = sectionSetting.get()
  const inst = instrumentSetting.get()
  const heat = heatSetting.getRaw() / 100
  
  const rule = RULES[genre] || RULES['Trap']
  // Safety fallback for templates
  const bank = TEMPLATES[inst] || TEMPLATES['Hi-Hat']
  const templates = bank[genre] || bank['Trap']
  
  // Choose pattern
  const templateIdx = Math.floor(Math.random() * templates.length)
  const patternStr = templates[templateIdx]
  
  let events = []
  const baseNote = NOTES[inst]
  
  // --- 4 Bar Generation Loop ---
  for (let bar = 0; bar < 4; bar++) {
    const isTurnaround = (bar === 3)
    
    // Logic: Toms/Fills usually only happen on bar 4 or 2 & 4
    if (inst === 'Tom' && !isTurnaround && Math.random() > (0.2 + heat)) {
       // Skip non-turnaround bars for Toms unless Heat is high
       continue 
    }

    // Parse Template
    for (let i = 0; i < 16; i++) {
      const char = patternStr[i]
      if (char === '-') continue
      if (char === '.' && Math.random() > (0.6 + heat * 0.2)) continue // Skip ghosts if low heat

      const tick = (bar * BAR_TICKS) + (i * 24)
      let vel = (i % 4 === 0) ? rule.velStrong : rule.velWeak 
      let type = 'hit'
      let note = baseNote

      // --- Instrument Specific Physics ---
      
      // 1. Shaker Physics (Sawtooth Velocity)
      if (inst === 'Shaker') {
         // Push/Pull effect: Accentuate the Downbeat and the "and"
         // 1 e & a -> Strong, Weak, Med, Weak
         const subPos = i % 4
         if (subPos === 0) vel = rule.velStrong
         else if (subPos === 2) vel = rule.velStrong * 0.85
         else vel = rule.velWeak
      }

      // 2. Ride Physics (Bell vs Bow)
      if (inst === 'Ride') {
         // Quarter notes = Bell (High Vel), Others = Bow (Low Vel)
         if (i % 4 === 0) {
            vel = 110
            type = 'bell' // Marker for logic, note doesn't change here typically
         } else {
            vel = 60
         }
      }

      if (char === 'x') {
        // Standard hit
      } 
      else if (char === 'o') {
         // Open Hat or Alt Perc
         if (inst === 'Hi-Hat') note = 46 
         vel = rule.velStrong + 10
         type = 'open'
      }
      else if (char === 'f') {
         // Flam marker (handled in post-proc, but base note added here)
         type = 'flam'
      }

      events.push({
        time: tick,
        duration: (inst === 'Shaker' || inst === 'Ride') ? 24 : 12, // Shakers need length for visual solidity
        velocity: vel,
        note: note,
        type: type,
        gridPos: i
      })
    }
  }
  
  // --- Post-Processing ---
  events = applyInstrumentArticulations(events, inst, rule, heat)
  events = applyGroove(events, rule, inst) // Moved groove logic here

  writeEventsToClip(cursorClipLauncher, events)
  host.showPopupNotification('Generated ' + inst + ' - ' + genre)
}

function applyInstrumentArticulations(events, inst, rule, heat) {
  let out = []
  events.sort((a, b) => a.time - b.time)

  for (let i = 0; i < events.length; i++) {
    let ev = events[i]
    let processed = false

    // --- Flam Logic (Toms / Percs) ---
    if (ev.type === 'flam' || (inst === 'Tom' && Math.random() < heat * 0.3)) {
       // Create a grace note before the main hit
       out.push({
          time: ev.time - 3, // 3 ticks before
          duration: 3,
          velocity: ev.velocity * 0.6,
          note: ev.note,
          type: 'grace'
       })
       out.push(ev)
       processed = true
    }

    // --- Hat Rolls (Trap/Drill) ---
    else if (inst === 'Hi-Hat') {
       // Logic from HatGenerator v0.5.4
      const isEndOfBeat = (ev.gridPos + 1) % 4 === 0
      const isTurnaroundBar = ev.time >= (3 * BAR_TICKS)
      
      let rollProb = rule.rollChance * heat
      if (isEndOfBeat) rollProb *= 1.5
      if (isTurnaroundBar) rollProb *= 2.0
      
      if (ev.type !== 'open' && Math.random() < rollProb) {
        if (rule.rollType === 'ratchet' || rule.rollType === 'slide') {
          const subs = rule.rollResolution || [2, 3]
          const div = subs[Math.floor(Math.random() * subs.length)]
          const stepSize = 24 / div 
          
          const rampUp = Math.random() > 0.5
          
          for (let k = 0; k < div; k++) {
            const t = ev.time + (k * stepSize)
            let vScale = rampUp ? 0.6 + ((k / (div - 1)) * 0.4) : 1.0 - ((k / (div - 1)) * 0.4)
            if (div === 1) vScale = 1.0 // Prevent division by zero if div is 1
            
            let pitchOffset = 0
            if (rule.rollType === 'slide') {
               pitchOffset = -1 * Math.floor((k / div) * 12) 
            }
            
            out.push({
              time: t,
              duration: stepSize, 
              velocity: ev.velocity * vScale,
              note: ev.note + pitchOffset,
              type: 'roll'
            })
          }
          processed = true
        }
        else if (rule.rollType === 'drag') {
          out.push({
             time: ev.time - 4,
             duration: 4,
             velocity: ev.velocity * 0.4,
             note: ev.note,
             type: 'drag'
          })
          out.push(ev)
          processed = true
        }
        else if (rule.rollType === 'spray') {
          for (let k = 0; k < 5; k++) {
             const offset = (Math.random() * 24) - 12
             out.push({
               time: ev.time + offset,
               duration: 6,
               velocity: Math.random() * 40 + 10,
               note: ev.note,
               type: 'spray'
             })
          }
          processed = true
        }
      }
    }
    
    // --- Shaker/Ambient "Spray" ---
    else if (inst === 'Ambient' || (inst === 'Shaker' && Math.random() < 0.05)) {
        // Granular spray
        for (let k=0; k<4; k++) {
           out.push({
             time: ev.time + (Math.random()*10 - 5),
             duration: 6,
             velocity: ev.velocity * 0.5,
             note: ev.note,
             type: 'spray'
           })
        }
        processed = true
    }

    if (!processed) out.push(ev)
  }
  return out
}

function applyGroove(events, rule, inst) {
  return events.map(ev => {
    // 1. Swing
    const isOffbeat = (Math.floor(ev.time / 24) % 2 !== 0)
    if (isOffbeat) {
      ev.time += (rule.swing * 16)
    }
    
    // 2. Jitter (Instrument Dependent)
    // Shakers are messy. Hats are tight.
    let jitterAmount = 2
    if (inst === 'Shaker') jitterAmount = 4
    if (inst === 'Percussion') jitterAmount = 5 // Sloppy/Funky
    if (inst === 'Techno' && inst === 'Hi-Hat') jitterAmount = 0 // Robotic

    ev.time += (Math.random() * jitterAmount * 2) - jitterAmount
    
    // 3. Clamp
    if (ev.velocity > 127) ev.velocity = 127
    if (ev.velocity < 1) ev.velocity = 1
    
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
    // Length APIs vary between Bitwig versions; ignore if unavailable.
  }
  for (let i = 0; i < events.length; i++) {
    let ev = events[i]
    if (ev.time < 0) continue
    const step = ev.time / TICKS_16TH
    const dur = ev.duration / TPQ
    clip.setStep(0, step, ev.note, ev.velocity, dur)
  }
}

function flush() {}
function exit() {}
