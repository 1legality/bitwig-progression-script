/*
 * Hi-Hat Generator v0.5.4 (Tuplet Edition)
 * Controller script for Bitwig Studio
 *
 */

loadAPI(17)

host.setShouldFailOnDeprecatedUse(true)
host.defineController('1legality', 'Hi-Hat Generator', '0.1', '64fc7e0d-6c39-4f46-8b10-6814139d5172', '1legality')

// --- Constants ---
const HAT_NOTE_CLOSED = 42 
const HAT_NOTE_OPEN = 46   
const TPQ = 96 // Ticks Per Quarter
const TICKS_16TH = TPQ / 4 
const BAR_TICKS = 4 * TPQ 

const GENRES = [
  'Trap',
  'Drill',
  'Lofi',
  'Boom Bap',
  'House',
  'Techno',
  'Ambient'
]

// --- Musical Templates ---
// x = Accent, . = Ghost, o = Open Hat, - = Rest
const TEMPLATES = {
  'Trap': [
    'x.x.x.x.x.x.x.x.', // Basic 8ths
    'x.x.x.x.x.xxx.x.', // Triplet feel end
    'x...x...x...x...', // Spacious
    'xxxxxxxxxxxxxxxx'  // Machine gun (base layer)
  ],
  'Drill': [
    'x..x..x.x..x..x.', // The standard Drill pattern (3+3+2ish)
    'x..x.x..x..x.x..', // Variation
    '.x..x...x..x....'  // Counter rhythm
  ],
  'Lofi': [
    'x.x.x.x.x.x.x.x.', // Straight 8ths (swing applied later)
    'x...x.x.x...x.x.',
    '-.x.-.x.-.x.-.x.'  // Offbeat focus
  ],
  'Boom Bap': [
    'x.x.x.x.x.x.x.x.', // The classic 8th note backbone
    'x.x.x.x.x.x.x.o.', // Open hat end
    'x-x-x-x-x-x-x-x-'  // Hard swing 8ths
  ],
  'House': [
    '.o.o.o.o.o.o.o.o', // Classic Offbeat Open
    'x.o.x.o.x.o.x.o.', // Closed/Open interplay
    'x.x.x.x.x.x.x.x.'  // Shakers/Closed driving
  ],
  'Techno': [
    'x.x.x.x.x.x.x.x.', // Motor
    '.x.x.x.x.x.x.x.x', // Offbeat drive
    'x...x...x...x...'  // Minimal
  ],
  'Ambient': [
    '...x.......x....', // Very sparse
    '..x...x...x...x.', // Off-kilter
    'x.......x.......', // Minimal pulse
    '.x.x.x.x.x.x.x.x'  // Rapid light ticking (insect style)
  ]
}

const RULES = {
  'Trap': {
    grid: 24, // 1/16th
    velStrong: 110, velWeak: 70,
    swing: 0,
    rollChance: 0.35,
    rollType: 'ratchet', 
    // Added 5 (Quintuplet) and 7 (Septuplet)
    rollResolution: [2, 3, 4, 5, 7], 
    turnaround: true
  },
  'Drill': {
    grid: 24, 
    velStrong: 100, velWeak: 60,
    swing: 0,
    rollChance: 0.4,
    rollType: 'slide', 
    // Drill uses triplets heavily, but 5s add that "stumble"
    rollResolution: [3, 4, 6, 5], 
    turnaround: true
  },
  'Lofi': {
    grid: 24,
    velStrong: 85, velWeak: 50,
    swing: 0.25, 
    rollChance: 0.1,
    rollType: 'drag', 
    turnaround: false
  },
  'Boom Bap': {
    grid: 48, 
    velStrong: 95, velWeak: 60,
    swing: 0.15, 
    rollChance: 0.05,
    rollType: 'none',
    turnaround: true
  },
  'House': {
    grid: 24,
    velStrong: 100, velWeak: 50,
    swing: 0.05,
    rollChance: 0.1,
    rollType: 'burst',
    turnaround: false
  },
  'Techno': {
    grid: 24,
    velStrong: 100, velWeak: 85, 
    swing: 0,
    rollChance: 0.05,
    rollType: 'none',
    turnaround: false
  },
  'Ambient': {
    grid: 24,
    velStrong: 65, velWeak: 40, 
    swing: 0,
    rollChance: 0.3,
    rollType: 'spray', 
    turnaround: false
  }
}

// --- Controller State ---
var sectionSetting, clipTypeSetting, heatSetting
var cursorClipLauncher

function init () {
  println('Hi-Hat Generator v0.1 Initialized')
  const documentState = host.getDocumentState()

  // We only use Launcher cursor for simplicity in this version
  cursorClipLauncher = host.createLauncherCursorClip(16 * 128, 128)
  
  sectionSetting = documentState.getEnumSetting('Genre', 'Generator', GENRES, GENRES[0])
  heatSetting = documentState.getNumberSetting('Complexity/Fills', 'Generator', 0, 100, 1, '%', 40)

  documentState.getSignalSetting('Generate Pattern', 'Generator', 'FIRE').addSignalObserver(() => {
    generateAndWrite()
  })
}

function generateAndWrite() {
  const genre = sectionSetting.get()
  const heat = heatSetting.getRaw() / 100
  
  const rule = RULES[genre] || RULES['Trap']
  const templates = TEMPLATES[genre] || TEMPLATES['Trap']
  
  // Pick a base template for the A-section (Bars 1, 2, 3)
  const templateIdx = Math.floor(Math.random() * templates.length)
  const patternStr = templates[templateIdx]
  
  let events = []
  
  // --- Generate 4 Bars (A-A-A-B Structure) ---
  for (let bar = 0; bar < 4; bar++) {
    const isTurnaround = (bar === 3) && rule.turnaround
    
    // For turnaround, either use same pattern with more fills, or flip the pattern
    let currentPat = patternStr
    
    // Parse the template string into events
    for (let i = 0; i < 16; i++) {
      const char = currentPat[i]
      if (char === '-') continue
      
      const tick = (bar * BAR_TICKS) + (i * 24)
      let vel = (i % 4 === 0) ? rule.velStrong : rule.velWeak // Default phrasing
      let note = HAT_NOTE_CLOSED
      let type = 'hit'

      if (char === 'x') {
        // Standard hit
        // Randomly ghost notes based on Heat (inverse: lower heat = more strict to template)
        if (Math.random() > 0.9) vel = rule.velWeak - 10
      } 
      else if (char === 'o') {
        note = HAT_NOTE_OPEN
        type = 'open'
        vel = rule.velStrong + 10
      }
      else if (char === '.') {
        vel = rule.velWeak - 15
        type = 'ghost'
        if (Math.random() > (0.4 + heat * 0.4)) continue // Skip some ghosts
      }

      // Add the event
      events.push({
        time: tick,
        duration: (type === 'open') ? 48 : TICKS_16TH,
        velocity: vel,
        note: note,
        type: type,
        gridPos: i // store 16th grid position for logic
      })
    }
  }
  
  // --- Post-Processing Layers ---
  
  // 1. Rolls & Fills (The "Heat")
  events = applyRolls(events, rule, heat)
  
  // 2. Humanize / Groove
  events = applyHumanization(events, rule)

  // 3. Write to Clip
  writeEventsToClip(cursorClipLauncher, events)
  
  host.showPopupNotification(`Generated ${genre} (A-A-A-B Phrasing)`)
}

function applyRolls(events, rule, heat) {
  let out = []
  // Sort first to be safe
  events.sort((a, b) => a.time - b.time)
  
  for (let i = 0; i < events.length; i++) {
    let ev = events[i]
    let processed = false
    
    // Determine if we should roll
    // Increases chance on Bar 4 (Turnaround) or end of beats (gridPos 3, 7, 11, 15)
    const isEndOfBeat = (ev.gridPos + 1) % 4 === 0
    const isTurnaroundBar = ev.time >= (3 * BAR_TICKS)
    
    let rollProb = rule.rollChance * heat
    if (isEndOfBeat) rollProb *= 1.5
    if (isTurnaroundBar) rollProb *= 2.0
    
    if (ev.type === 'hit' && Math.random() < rollProb) {
      
      // TRAP / DRILL RATCHETS
      if (rule.rollType === 'ratchet' || rule.rollType === 'slide') {
        const subs = rule.rollResolution || [2, 3]
        const div = subs[Math.floor(Math.random() * subs.length)]
        const stepSize = 24 / div // 24 ticks is 1/16th. If div is 5, step is 4.8 ticks.
        
        // Velocity Ramp Direction (Crescendo or Decrescendo)
        const rampUp = Math.random() > 0.5
        
        for (let k = 0; k < div; k++) {
          const t = ev.time + (k * stepSize)
          
          // Calculate Ramp Velocity
          let vScale = 1.0
          if (rampUp) vScale = 0.6 + ((k / (div - 1)) * 0.4) // 60% -> 100%
          else vScale = 1.0 - ((k / (div - 1)) * 0.4)       // 100% -> 60%
          
          // Drill Pitch Slide
          let pitchOffset = 0
          if (rule.rollType === 'slide') {
             // Slide down typically
             pitchOffset = -1 * Math.floor((k / div) * 12) 
          }
          
          out.push({
            time: t,
            duration: stepSize, 
            velocity: ev.velocity * vScale,
            note: HAT_NOTE_CLOSED + pitchOffset, // Bitwig maps key to pitch in drum rack often
            type: 'roll'
          })
        }
        processed = true
      }
      // LOFI DRAG
      else if (rule.rollType === 'drag') {
        // Add a "drag" note slightly before
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
      // AMBIENT SPRAY
      else if (rule.rollType === 'spray') {
        // Replace single hit with 3-6 random granular hits nearby
        for (let k = 0; k < 5; k++) {
           const offset = (Math.random() * 24) - 12
           out.push({
             time: ev.time + offset,
             duration: 6,
             velocity: Math.random() * 40 + 10, // Very quiet random
             note: HAT_NOTE_CLOSED,
             type: 'spray'
           })
        }
        processed = true
      }
    }
    
    if (!processed) out.push(ev)
  }
  return out
}

function applyHumanization(events, rule) {
  return events.map(ev => {
    // 1. Swing
    // If it's an even 16th (the "and" of the beat), push it late
    const isOffbeat = (Math.floor(ev.time / 24) % 2 !== 0)
    if (isOffbeat) {
      ev.time += (rule.swing * 16) // up to 16 ticks swing
    }
    
    // 2. Micro-Jitter (Human feel)
    // Randomly move +/- 2 ticks
    ev.time += (Math.random() * 4) - 2
    
    // 3. Velocity Clamping
    // We rely on the Genre Rules for the base velocities now.
    if (ev.velocity > 127) ev.velocity = 127
    if (ev.velocity < 1) ev.velocity = 1
    
    return ev
  })
}

function writeEventsToClip(clip, events) {
  clip.clearSteps()
  
  // Set 4 Bars
  clip.getLoopLength().set(4 * 4) 

  for (let i = 0; i < events.length; i++) {
    let ev = events[i]
    if (ev.time < 0) continue
    
    // Bitwig setStep uses 16th note steps as the integer part
    // But we want micro-timing. 
    // Trick: setStep works on grid. For off-grid, strict script usage is hard without raw MIDI.
    // However, we can approximate by calculating the step index and specific duration.
    // Note: This API implementation assumes a standard grid. 
    // If you want pure unquantized, we would need to write to Arranger raw MIDI. 
    // For now, we quantize to 1/64th resolution roughly for the start times if utilizing setStep sub-resolution, 
    // but the standard API maps Steps to 16th grid slots.
    
    // To make this work simply: We map to the nearest 16th step, 
    // but this removes the swing we just calculated!
    
    // FIX: We use a high resolution grid calculation if possible, 
    // but standard Controller API setStep(x,y,...) snaps. 
    // We will just snap to 16ths for the display, but realistically 
    // to get the swing in generated clips, we rely on the groove settings usually.
    // HOWEVER, we can use floating point steps in some API versions. 
    
    const step = ev.time / TICKS_16TH
    const dur = ev.duration / TPQ
    
    clip.setStep(0, step, ev.note, ev.velocity, dur)
  }
}

function flush() {}
function exit() {}