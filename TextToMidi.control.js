/*
 * Text To Midi
 * controller script for Bitwig Studio
 * Parses a text-based chord progression and generates MIDI.
 * @version 0.1
 */
loadAPI(17)

host.setShouldFailOnDeprecatedUse(true)
host.defineController('1legality', 'Text To Midi', '0.1', 'c1e3a7d0-4a29-47a2-a893-63585983567f', '1legality')

const chordQualities = {
  '1': [0],
  '5': [0, 7],
  '6': [0, 4, 7, 9],
  '7': [0, 4, 7, 10],
  '9': [0, 4, 7, 10, 14],
  '11': [0, 4, 7, 10, 14, 17],
  '13': [0, 4, 7, 10, 14, 21],
  'Major': [0, 4, 7],
  'maj': [0, 4, 7],
  'M': [0, 4, 7],
  'm': [0, 3, 7],
  'min': [0, 3, 7],
  'dim': [0, 3, 6],
  'aug': [0, 4, 8],
  '+': [0, 4, 8],
  'sus4': [0, 5, 7],
  'sus': [0, 5, 7],
  'sus2': [0, 2, 7],
  'add2': [0, 4, 7, 2],
  '(add2)': [0, 4, 7, 2],
  'add4': [0, 4, 5, 7],
  '(add4)': [0, 4, 5, 7],
  'add9': [0, 4, 7, 14],
  '(add9)': [0, 4, 7, 14],
  'm(add2)': [0, 3, 7, 2],
  'm(add4)': [0, 3, 5, 7],
  'm(add9)': [0, 3, 7, 14],
  'madd2': [0, 3, 7, 2],
  'madd9': [0, 3, 7, 14],
  'sus2add9': [0, 2, 7, 14],
  'm7add11': [0, 3, 7, 10, 17],
  'maj7add13': [0, 4, 7, 11, 21],
  '7b13': [0, 4, 7, 10, 20],
  '7sus2': [0, 2, 7, 10],
  '7sus2sus4': [0, 2, 5, 7, 10],
  '7#11': [0, 4, 7, 10, 6],
  'mMaj9': [0, 3, 7, 11, 14],
  'maj6': [0, 4, 7, 9],
  'm6': [0, 3, 7, 9],
  'min6': [0, 3, 7, 9],
  '6/9': [0, 4, 7, 9, 14],
  'm6/9': [0, 3, 7, 9, 14],
  'maj7': [0, 4, 7, 11],
  'M7': [0, 4, 7, 11],
  'm7': [0, 3, 7, 10],
  'min7': [0, 3, 7, 10],
  'm(maj7)': [0, 3, 7, 11],
  'mM7': [0, 3, 7, 11],
  'dim7': [0, 3, 6, 9],
  'm7b5': [0, 3, 6, 10],
  'maj9': [0, 4, 7, 11, 14],
  'M9': [0, 4, 7, 11, 14],
  'm9': [0, 3, 7, 10, 14],
  'min9': [0, 3, 7, 10, 14],
  'm(maj9)': [0, 3, 7, 11, 14],
  'mM9': [0, 3, 7, 11, 14],
  'maj11': [0, 4, 7, 11, 14, 17],
  'M11': [0, 4, 7, 11, 14, 17],
  'm11': [0, 3, 7, 10, 14, 17],
  'min11': [0, 3, 7, 10, 14, 17],
  'm(maj11)': [0, 3, 7, 11, 14, 17],
  'mM11': [0, 3, 7, 11, 14, 17],
  'maj13': [0, 4, 7, 11, 14, 21],
  'M13': [0, 4, 7, 11, 14, 21],
  'm13': [0, 3, 7, 10, 14, 21],
  'min13': [0, 3, 7, 10, 14, 21],
  'm(maj13)': [0, 3, 7, 11, 14, 21],
  'mM13': [0, 3, 7, 11, 14, 21],
  '7b5': [0, 4, 6, 10],
  '7#5': [0, 4, 8, 10],
  '7aug': [0, 4, 8, 10],
  '7b9': [0, 4, 7, 10, 13],
  '7#9': [0, 4, 7, 10, 15],
  '7(#11)': [0, 4, 7, 10, 6],
  '9b5': [0, 4, 6, 10, 14],
  '9#5': [0, 4, 8, 10, 14],
  '13b9': [0, 4, 7, 10, 13, 21],
  '13#9': [0, 4, 7, 10, 15, 21],
  '13(#11)': [0, 4, 7, 10, 14, 6, 21],
  '7b9b5': [0, 4, 6, 10, 13],
  '7b9#5': [0, 4, 8, 10, 13],
  '7#9b5': [0, 4, 6, 10, 15],
  '7#9#5': [0, 4, 8, 10, 15],
  '7alt': [0, 4, 10, 13, 8],
  'maj7(#11)': [0, 4, 7, 11, 6],
  'M7#11': [0, 4, 7, 11, 6],
  'maj9(#11)': [0, 4, 7, 11, 14, 6],
  'M9#11': [0, 4, 7, 11, 14, 6],
  'm7(#11)': [0, 3, 7, 10, 6],
  'm9(#11)': [0, 3, 7, 10, 14, 6],
  '7sus4': [0, 5, 7, 10],
  '7sus': [0, 5, 7, 10],
  '9sus4': [0, 5, 7, 10, 14],
  '9sus': [0, 5, 7, 10, 14],
  '13sus4': [0, 5, 7, 10, 14, 21],
  '13sus': [0, 5, 7, 10, 14, 21],
  'maj7sus4': [0, 5, 7, 11],
  'M7sus': [0, 5, 7, 11],
  '': [0, 4, 7] // Default to major
}

const noteMap = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
}

const OCTAVE_ADJUSTMENT_THRESHOLD = 6;

function init () {
  println('Text To Midi ready!')
  const documentState = host.getDocumentState()
  const cursorClipLauncher = host.createLauncherCursorClip(16 * 128, 128)
  const cursorClipArranger = host.createArrangerCursorClip(16 * 128, 128)
  cursorClipLauncher.scrollToKey(0)
  cursorClipArranger.scrollToKey(0)

  const progressionText = documentState.getStringSetting('Progression', 'Chord Progression', 512, 'C:1 Am:1 F:1 G:1')
  const clipType = documentState.getEnumSetting('Clip Type', 'Clip', ['Launcher', 'Arranger'], 'Launcher')
  const baseOctave = documentState.getNumberSetting('Base Octave', 'MIDI', 0, 8, 1, '', 4)
  const outputType = documentState.getEnumSetting('Output Type', 'MIDI', ['Chords + Bass', 'Chords only', 'Bass only', 'Bass + Fifth'], 'Chords + Bass')
  const inversionType = documentState.getEnumSetting('Inversion', 'MIDI', ['None', '1st Inversion', 'Smooth Voice Leading', 'Pianist', 'Open Voicing', 'Spread'], 'None')

  function getCursorClip () {
    return clipType.get() === 'Arranger' ? cursorClipArranger : cursorClipLauncher
  }

  documentState.getSignalSetting('Generate', 'Chord Progression', 'Generate!').addSignalObserver(() => {
    const progression = progressionText.get()
    const cursorClip = getCursorClip()
    cursorClip.clearSteps()
    parseAndGenerate(progression, cursorClip)
  })

  function parseAndGenerate (progressionString, cursorClip) {
    const baseMidiNote = (baseOctave.getRaw() + 1) * 12
    const outputMode = outputType.get()
    const inversionMode = inversionType.get()
    const currentBaseOctave = baseOctave.getRaw()
    let currentTime_in_16ths = 0.0
    let previousChordNotes = null

    const parts = progressionString.trim().split(/\s+/)

    for (const part of parts) {
      const [chordDef, durationDef] = part.split(':')

      let durationInBars = 1.0; // Default to 1 bar
      if (durationDef) {
          const parsedDuration = parseFloat(durationDef);
          if (!isNaN(parsedDuration)) {
              durationInBars = parsedDuration;
          }
      }

      const durationInBeats = durationInBars * 4.0;
      const durationIn16ths = durationInBars * 16.0;

      if (chordDef.toUpperCase().startsWith('R')) {
        currentTime_in_16ths += durationIn16ths
        previousChordNotes = null // Reset for rests
        continue
      }

      let rootNoteName = chordDef.charAt(0).toUpperCase()
      let qualityName = ''
      let remainder = ''

      if (chordDef.length > 1) {
        if (chordDef.charAt(1) === '#' || chordDef.charAt(1) === 'b') {
          rootNoteName += chordDef.charAt(1)
          remainder = chordDef.substring(2)
        } else {
          remainder = chordDef.substring(1)
        }
      }
      
      let slashNoteName = null
      const slashIndex = remainder.indexOf('/')
      if (slashIndex > -1) {
        slashNoteName = remainder.substring(slashIndex + 1)
        remainder = remainder.substring(0, slashIndex)
      }

      qualityName = remainder

      const rootNoteMidi = noteMap[rootNoteName]
      if (rootNoteMidi === undefined) {
        println(`Unknown root note: ${rootNoteName}`)
        continue
      }

      let intervals = chordQualities[qualityName]
      if (!intervals) {
        for (let i = qualityName.length; i > 0; i--) {
          const shorterQuality = qualityName.substring(0, i)
          if (chordQualities[shorterQuality]) {
            intervals = chordQualities[shorterQuality]
            break
          }
        }
      }
      if (!intervals) {
        println(`Unknown chord quality: ${qualityName}`)
        intervals = [0, 4, 7] // Default to major
      }

      // --- New Inversion Logic ---
      let chordNotes = intervals.map(interval => {
        let midiNote = baseMidiNote + rootNoteMidi + interval
        while (midiNote > 127) {
          midiNote -= 12
        }
        while (midiNote < 0) {
          midiNote += 12
        }
        return midiNote
      })

      if (inversionMode !== 'None' && outputMode.indexOf('Chords') > -1) {
        chordNotes = applyInversion(chordNotes, inversionMode, previousChordNotes, currentBaseOctave)
      }
      
      if (outputMode.indexOf('Chords') > -1) {
        previousChordNotes = [...chordNotes]
      } else {
        previousChordNotes = null
      }
      // --- End Inversion Logic ---

      let notesToWrite = []

      // Determine the bass note, considering slash chords
      let bassNoteMidi = baseMidiNote + rootNoteMidi - 12 // Default bass note
      if (slashNoteName) {
        const slashNoteValue = noteMap[slashNoteName]
        if (slashNoteValue !== undefined) {
          bassNoteMidi = baseMidiNote + slashNoteValue - 12
        }
      }
      while (bassNoteMidi < 0) {
        bassNoteMidi += 12
      }
      while (bassNoteMidi > 127) {
        bassNoteMidi -= 12
      }

      if (outputMode === 'Chords + Bass') {
        notesToWrite = [bassNoteMidi, ...chordNotes]
      } else if (outputMode === 'Chords only') {
        notesToWrite = chordNotes
      } else if (outputMode === 'Bass only') {
        notesToWrite = [bassNoteMidi]
      } else if (outputMode === 'Bass + Fifth') {
        let fifthNoteMidi = bassNoteMidi + 7
        while (fifthNoteMidi > 127) {
          fifthNoteMidi -= 12
        }
        while (fifthNoteMidi < 0) {
          fifthNoteMidi += 12
        }
        notesToWrite = [bassNoteMidi, fifthNoteMidi]
      }

      for (const midiNote of notesToWrite) {
        cursorClip.setStep(0, currentTime_in_16ths, midiNote, 100, durationInBeats)
      }

      currentTime_in_16ths += durationIn16ths
    }
  }
}


/**
 * Generates all possible inversions for a given set of root-position chord notes.
 */
function generateInversions(rootPositionNotes) {
    if (rootPositionNotes.length <= 1) {
        return [rootPositionNotes];
    }
    const allInversions = [];
    let currentVoicing = [...rootPositionNotes];
    for (let i = 0; i < rootPositionNotes.length; i++) {
        currentVoicing.sort((a, b) => a - b);
        allInversions.push([...currentVoicing]);
        if (i < rootPositionNotes.length - 1) {
            const lowestNote = currentVoicing.shift();
            if (lowestNote !== undefined) {
                currentVoicing.push(lowestNote + 12);
            }
        }
    }
    return allInversions;
}

/**
 * Calculates a distance metric between two chord voicings to estimate smoothness.
 */
function calculateVoicingDistance(voicing1, voicing2) {
    const sorted1 = [...voicing1].sort((a, b) => a - b);
    const sorted2 = [...voicing2].sort((a, b) => a - b);
    let totalDistance = 0;
    const minLength = Math.min(sorted1.length, sorted2.length);
    const maxLength = Math.max(sorted1.length, sorted2.length);
    for (let i = 0; i < minLength; i++) {
        totalDistance += Math.abs(sorted1[i] - sorted2[i]);
    }
    const noteCountDifference = maxLength - minLength;
    totalDistance += noteCountDifference * 6; // Penalty for different number of notes
    return totalDistance;
}

/**
 * Adjusts chord voicings to be closer to the target octave.
 */
function adjustVoicingsToTargetOctave(voicings, baseOctave) {
    if (!voicings || voicings.length === 0) {
        return [];
    }
    const targetCenterPitch = 12 * (baseOctave + 1); // C note in the target octave

    return voicings.map(voicing => {
        if (!voicing || voicing.length === 0) {
            return [];
        }
        const sum = voicing.reduce((acc, note) => acc + note, 0);
        const averagePitch = sum / voicing.length;
        const difference = averagePitch - targetCenterPitch;

        if (Math.abs(difference) > OCTAVE_ADJUSTMENT_THRESHOLD) {
            const octaveShift = Math.round(difference / 12);
            if (octaveShift !== 0) {
                const semitoneShift = octaveShift * -12;
                const adjustedVoicing = voicing.map(note => note + semitoneShift);
                const minNote = Math.min(...adjustedVoicing);
                const maxNote = Math.max(...adjustedVoicing);
                if (minNote >= 0 && maxNote <= 127) {
                    return adjustedVoicing.sort((a, b) => a - b);
                } else {
                    return voicing.sort((a, b) => a - b);
                }
            }
        }
        return voicing.sort((a, b) => a - b);
    });
}


/**
 * Main function to apply inversion/voicing algorithms.
 */
function applyInversion(chordNotes, inversionType, previousChordNotes, baseOctave) {
    let newVoicing = [...chordNotes].sort((a, b) => a - b);

    switch (inversionType) {
        case 'None':
            return newVoicing;

        case '1st Inversion':
            if (newVoicing.length > 1) {
                const lowestNote = newVoicing.shift();
                newVoicing.push(lowestNote + 12);
            }
            break;

        case 'Smooth Voice Leading':
            if (previousChordNotes && newVoicing.length > 1) {
                // The target for smooth voice leading is the previous chord itself.
                const targetVoicing = previousChordNotes;
                const targetAverage = targetVoicing.reduce((acc, note) => acc + note, 0) / targetVoicing.length;

                const possibleInversions = generateInversions(chordNotes);
                let bestVoicing = newVoicing; // Fallback, will be overwritten.
                let minDistance = Infinity;

                for (const inversion of possibleInversions) {
                    // Temporarily shift this inversion to the same octave as the previous chord.
                    const invAverage = inversion.reduce((acc, note) => acc + note, 0) / inversion.length;
                    const octaveDifference = Math.round((targetAverage - invAverage) / 12);
                    const adjustedInversion = inversion.map(note => note + octaveDifference * 12);

                    // Calculate distance and find the best voicing (which is already in the correct octave).
                    const distance = calculateVoicingDistance(targetVoicing, adjustedInversion);
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestVoicing = adjustedInversion;
                    }
                }
                newVoicing = bestVoicing;
            }
            // If it's the first chord, do nothing and let it be in root position in the target octave.
            break;

        case 'Pianist':
            const root = newVoicing[0];
            const topVoices = newVoicing.slice(1).map(n => n - 12);
            const SPREAD_BASE = 12;
            if (previousChordNotes && topVoices.length > 1) {
                const possibleVoicings = generateInversions(topVoices);
                let bestTopVoicing = topVoices;
                let minDistance = Infinity;
                for (const inversion of possibleVoicings) {
                    const spreadInversion = inversion.map((note, i) => note + SPREAD_BASE + i * 2);
                    const testVoicing = [root, ...spreadInversion];
                    const distance = calculateVoicingDistance(previousChordNotes, testVoicing);
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestTopVoicing = spreadInversion;
                    }
                }
                newVoicing = [root, ...bestTopVoicing];
            } else {
                const spreadTop = topVoices.map((note, i) => note + SPREAD_BASE + i * 2);
                newVoicing = [root, ...spreadTop];
            }
            break;

        case 'Open Voicing':
            if (newVoicing.length > 2) {
                newVoicing[1] -= 12; // Drop the 3rd down an octave
            }
            break;

        case 'Spread': // Implementing 'spread' from the TS file
            if (newVoicing.length > 1) {
                const root = newVoicing[0];
                const spreadNotes = newVoicing.slice(1).map((note, i) => note + 12 * (i % 2));
                newVoicing = [root, ...spreadNotes];
            }
            break;
    }

    return newVoicing.sort((a, b) => a - b);
}

function flush () {}
function exit () {
  println('-- Text To Midi Bye! --')
}
