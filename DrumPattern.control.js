
/*
 * Drum Pattern
 * controller script for Bitwig Studio
 * Converts stored drum patterns into MIDI (GM drum map)
 * @version 0.1
 */
loadAPI(17)

host.setShouldFailOnDeprecatedUse(true)
host.defineController('1legality', 'Drum Pattern', '0.1', '5f9c773d-8d93-4d72-a27f-f583efad6b1f', '1legality')

const STEP_LENGTH_BEATS = 0.25
const DEFAULT_VELOCITY = 110
const DEFAULT_TRANSPOSE = -30 // Shift down ~2.5 octaves to land kicks around C1

const GM_DRUM_MAP = {
  "BD": 36,
  "SN": 38,
  "CH": 42,
  "OH": 46,
  "LT": 45,
  "MT": 47,
  "HT": 50,
  "CL": 39,
  "SH": 70,
  "RS": 37,
  "CB": 56,
  "CY": 49,
  "HC": 63,
  "AC": 57,
  "LC": 64
}

const DRUM_SECTIONS = ["Afro-Cuban","Basic Patterns","Breaks","Breaks - Kick","Breaks - Snare","Drum Rolls","Drum and Bass","Dub","EDM","Electro","Funk and Soul","Ghost Snares","Hip Hop","House","Hybrid Breaks With Alternate Endings","Irregular Breaks","Miami Bass","Pop","Reggaeton","Rock","Rolling Breaks","Standard Breaks","Uncategorized","Tribal"];
const DRUM_PATTERNS_YAML = `
source: Pocket Operations
total_patterns: 270
legend: {BD: Bass Drum, SN: Snare, CH: Closed Hi-Hat, OH: Open Hi-Hat, LT: Low Tom,
  MT: Mid Tom, HT: High Tom, CL: Clap, SH: Shaker, RS: Rimshot, CB: Cowbell, CY: Cymbal,
  HC: High Conga, AC: Accent, LC: Low Conga}
patterns:
- name: EXAMPLE PATTERN
  section: Uncategorized
  page: 5
  instruments:
    BD: [1, 9]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: ONE AND SEVEN & FIVE AND THIRTEEN
  section: Basic Patterns
  page: 7
  instruments:
    BD: [1, 7]
    SN: [5, 13]
- name: "BOOTS N\u2019 CATS"
  section: Basic Patterns
  page: 7
  instruments:
    BD: [1, 9]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: TINY HOUSE
  section: Basic Patterns
  page: 7
  instruments:
    OH: [3, 7, 11, 15]
    BD: [1, 5, 9, 13]
- name: GOOD TO GO
  section: Basic Patterns
  page: 7
  instruments:
    BD: [1, 4, 7, 11]
    SN: [5, 13]
- name: HIP HOP
  section: Basic Patterns
  page: 7
  instruments:
    BD: [1, 3, 7, 8, 15]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: STANDARD BREAK 1
  section: Standard Breaks
  page: 8
  instruments:
    BD: [1, 11]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 10, 11, 13, 15]
- name: STANDARD BREAK 2
  section: Standard Breaks
  page: 8
  instruments:
    BD: [1, 11]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 8, 9, 11, 15]
- name: ROLLING BREAK
  section: Standard Breaks
  page: 8
  instruments:
    BD: [1, 8, 11]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: THE UNKNOWN DRUMMER
  section: Standard Breaks
  page: 8
  instruments:
    BD: [1, 4, 7, 11]
    SN: [2, 5, 8, 13]
    CH: [2, 3, 5, 6, 8, 14]
    OH: [9, 15]
- name: ROCK 1
  section: Rock
  page: 9
  instruments:
    BD: [1, 8, 9, 11]
    SN: [5, 13]
    CY: [1]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: ROCK 2
  section: Rock
  page: 9
  instruments:
    BD: [1, 8, 9, 11]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: ROCK 3
  section: Rock
  page: 9
  instruments:
    BD: [1, 8, 9, 11]
    SN: [5, 13]
    OH: [15]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: ROCK 4
  section: Rock
  page: 9
  instruments:
    BD: [1, 8, 9, 11]
    SN: [5, 13, 15, 16]
    OH: [15]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: ELECTRO 1 - A
  section: Electro
  page: 10
  instruments:
    SN: [5, 13]
    BD: [1, 7]
- name: ELECTRO 1 - B
  section: Electro
  page: 10
  instruments:
    SN: [5, 13]
    BD: [1, 7, 11, 15]
- name: ELECTRO 2 - A
  section: Electro
  page: 10
  instruments:
    SN: [5, 13]
    BD: [1, 7]
- name: ELECTRO 2 - B
  section: Electro
  page: 10
  instruments:
    SN: [5, 13]
    BD: [1, 11, 14]
- name: ELECTRO 3 - A
  section: Electro
  page: 10
  instruments:
    SN: [5, 13]
    BD: [1, 7, 12]
- name: ELECTRO 3 - B
  section: Electro
  page: 11
  instruments:
    SN: [5, 13]
    BD: [1, 7, 12, 14]
- name: ELECTRO 4
  section: Electro
  page: 11
  instruments:
    SN: [5, 13]
    BD: [1, 7, 11, 14]
- name: SIBERIAN NIGHTS
  section: Electro
  page: 11
  instruments:
    CH: [1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16]
    SN: [5, 13]
    BD: [1, 7]
- name: NEW WAVE
  section: Electro
  page: 11
  instruments:
    BD: [1, 7, 9, 10]
    SN: [5, 13]
    CH: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    OH: [3]
    SH: [5, 13]
- name: HOUSE
  section: House
  page: 12
  instruments:
    BD: [1, 5, 9, 13]
    SN: [5, 13]
    CY: [1]
    OH: [3, 7, 11, 15]
- name: HOUSE 2
  section: House
  page: 12
  instruments:
    BD: [1, 5, 9, 13]
    SN: [5, 13]
    CH: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    OH: [3, 6, 11, 14]
- name: BRIT HOUSE
  section: House
  page: 12
  instruments:
    BD: [1, 5, 9, 13]
    CL: [5, 13]
    CY: [3, 7, 11, 15]
    CH: [1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16]
    OH: [3, 7, 11, 15]
- name: FRENCH HOUSE
  section: House
  page: 12
  instruments:
    BD: [1, 5, 9, 13]
    CL: [5, 13]
    SH: [1, 2, 3, 5, 7, 8, 9, 10, 11, 13, 15, 16]
    CH: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    OH: [2, 4, 6, 8, 10, 12, 14, 16]
- name: DIRTY HOUSE
  section: House
  page: 13
  instruments:
    BD: [1, 3, 5, 9, 11, 13, 16]
    SN: [5, 13]
    CL: [3, 5, 9, 11, 13]
    CH: [11, 16]
    OH: [3, 11, 15]
- name: DEEP HOUSE
  section: House
  page: 13
  instruments:
    BD: [1, 5, 9, 13]
    CL: [5, 13]
    CH: [2, 8, 10]
    OH: [3, 7, 11, 15]
- name: DEEPER HOUSE
  section: House
  page: 13
  instruments:
    BD: [1, 5, 9, 13]
    CL: [2, 10]
    MT: [3, 8, 11]
    SH: [4, 9]
    OH: [3, 7, 11, 12, 15]
- name: SLOW DEEP HOUSE
  section: House
  page: 14
  instruments:
    BD: [1, 5, 9, 13]
    CL: [5, 13]
    SH: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    CH: [1, 5, 9, 13]
    OH: [3, 4, 7, 8, 10, 11, 13]
- name: FOOTWORK - A
  section: House
  page: 14
  instruments:
    BD: [1, 4, 7, 9, 12, 15]
    CL: [13]
    CH: [3, 11]
    RS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
- name: FOOTWORK - B
  section: House
  page: 14
  instruments:
    BD: [1, 4, 7, 9, 12, 15]
    CL: [13]
    CH: [3, 7, 8, 11, 15]
    RS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
- name: MIAMI BASS - A
  section: Miami Bass
  page: 15
  instruments:
    BD: [1, 7]
    SN: [5, 13]
    CH: [1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16]
- name: MIAMI BASS - B
  section: Miami Bass
  page: 15
  instruments:
    BD: [1, 7, 11, 14]
    SN: [5, 13]
    CH: [1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16]
- name: SALLY
  section: Miami Bass
  page: 15
  instruments:
    BD: [1, 7, 11, 15]
    SN: [5, 13]
    LT: [1, 7, 11, 15]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: ROCK THE PLANET
  section: Miami Bass
  page: 15
  instruments:
    BD: [1, 4, 7]
    SN: [5, 13]
    CH: [1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 14, 15, 16]
- name: HIP HOP 1 - A
  section: Hip Hop
  page: 16
  instruments:
    BD: [1, 7, 8, 12, 15]
    SN: [5, 13]
- name: HIP HOP 1 - B
  section: Hip Hop
  page: 16
  instruments:
    BD: [1, 8, 12]
    SN: [5, 13]
- name: HIP HOP 2 - A
  section: Hip Hop
  page: 16
  instruments:
    BD: [1, 8, 9, 10, 14, 16]
    SN: [5, 13]
- name: HIP HOP 2 - B
  section: Hip Hop
  page: 16
  instruments:
    BD: [1, 8, 9, 12]
    SN: [5, 10, 13]
- name: HIP HOP 3 - A
  section: Hip Hop
  page: 16
  instruments:
    BD: [1, 3, 9, 11]
    SN: [5, 13]
- name: HIP HOP 3 - B
  section: Hip Hop
  page: 17
  instruments:
    BD: [1, 3, 9, 10, 12]
    SN: [5, 13]
- name: HIP HOP 4 - A
  section: Hip Hop
  page: 17
  instruments:
    BD: [1, 4, 8, 10, 11, 16]
    SN: [5, 13]
- name: HIP HOP 4 - B
  section: Hip Hop
  page: 17
  instruments:
    BD: [1, 3, 8, 9, 10, 11]
    SN: [5, 13]
- name: HIP HOP 5
  section: Hip Hop
  page: 17
  instruments:
    BD: [1, 3, 8, 9, 11, 16]
    SN: [5, 13]
- name: HIP HOP 6
  section: Hip Hop
  page: 17
  instruments:
    BD: [1, 3, 11, 12, 16]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: HIP HOP 7
  section: Hip Hop
  page: 18
  instruments:
    BD: [1, 8, 11, 14, 16]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: HIP HOP 8
  section: Hip Hop
  page: 18
  instruments:
    BD: [1, 4, 9, 11, 12]
    SN: [5, 13]
    CH: [1, 2, 4, 5, 7, 8, 9, 10, 12, 13, 15, 16]
    OH: [6, 14]
- name: TRAP - A
  section: Hip Hop
  page: 18
  instruments:
    BD: [1, 7, 13]
    SN: [9]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: TRAP - B
  section: Hip Hop
  page: 18
  instruments:
    BD: [3, 5]
    SN: [9]
    CH: [3, 5, 7, 9, 11, 15]
- name: PLANET ROCK - A
  section: Hip Hop
  page: 19
  instruments:
    CH: [1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 14, 15, 16]
    CB: [1, 3, 5, 7, 8, 10, 12, 13, 15]
    SN: [5, 13]
    BD: [1, 7]
    HC: [5, 13]
- name: PLANET ROCK - B
  section: Hip Hop
  page: 19
  instruments:
    CH: [1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 14, 15, 16]
    CB: [1, 3, 5, 7, 8, 10, 12, 13, 15]
    SN: [5, 13]
    BD: [1, 7, 11, 14]
    HC: [5, 13]
- name: INNA CLUB
  section: Hip Hop
  page: 19
  instruments:
    OH: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 13]
    BD: [3, 8, 11, 16]
    HC: [5, 13]
- name: ICE
  section: Hip Hop
  page: 19
  instruments:
    SN: [5, 13]
    BD: [1, 7, 11, 15]
    SH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: BACK TO CALI - A
  section: Hip Hop
  page: 20
  instruments:
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 13]
    BD: [1, 7]
    HC: [5, 7, 9, 13, 15]
- name: BACK TO CALI - B
  section: Hip Hop
  page: 20
  instruments:
    CH: [1, 3, 5, 7, 9, 11, 15]
    OH: [13]
    SN: [5, 13]
    BD: [1, 7, 11, 14]
    HC: [1, 5, 7, 9, 13]
- name: SNOOP STYLES
  section: Hip Hop
  page: 20
  instruments:
    RS: [3, 6, 9, 12]
    OH: [1, 4, 7, 11]
    SN: [5, 13]
    BD: [1, 4, 7, 11]
    HC: [5, 13]
- name: THE GROOVE - A
  section: Hip Hop
  page: 21
  instruments:
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
    OH: [8]
    SN: [5, 13]
    BD: [1, 4, 8, 12, 15]
    SH: [5, 13]
- name: THE GROOVE - B
  section: Hip Hop
  page: 21
  instruments:
    CH: [1, 3, 5, 7, 9, 11, 13, 14]
    OH: [8, 11, 12, 13, 15]
    SN: [5, 13]
    HT: [10, 11]
    MT: [12, 14]
    LT: [15, 16]
    BD: [1, 4, 8, 12]
    SH: [5, 13]
- name: BOOM BAP
  section: Hip Hop
  page: 22
  instruments:
    CB: [9]
    OH: [15]
    CH: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    CL: [3, 7, 11, 15]
    SN: [3, 7, 11, 15]
    BD: [1, 3, 6, 10, 14]
- name: MOST WANTED - A
  section: Hip Hop
  page: 22
  instruments:
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
    CY: [1]
    SN: [5, 13]
    BD: [1, 7, 9, 10, 16]
    HC: [5, 13]
- name: MOST WANTED - B
  section: Hip Hop
  page: 22
  instruments:
    CH: [1, 5, 7, 9, 11, 13, 15]
    OH: [3]
    SN: [5, 13]
    BD: [3, 7, 9, 10]
    HC: [5, 13]
- name: AMEN BREAK - A
  section: Funk and Soul
  page: 23
  instruments:
    BD: [1, 3, 11, 12]
    SN: [5, 8, 10, 13, 16]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: AMEN BREAK - B
  section: Funk and Soul
  page: 23
  instruments:
    BD: [1, 3, 11, 12]
    SN: [8, 10, 13, 16]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
    RS: [5]
- name: AMEN BREAK - C
  section: Funk and Soul
  page: 23
  instruments:
    BD: [1, 3, 11]
    SN: [8, 10, 13, 16]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
    RS: [15]
- name: AMEN BREAK - D
  section: Funk and Soul
  page: 23
  instruments:
    BD: [1, 3, 11]
    SN: [2, 5, 8, 10, 15]
    CH: [1, 3, 5, 7, 9, 13, 15]
    CY: [11]
- name: THE FUNKY DRUMMER
  section: Funk and Soul
  page: 24
  instruments:
    BD: [1, 3, 7, 11, 14]
    SN: [5, 8, 10, 12, 13, 16]
    CH: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 15, 16]
    OH: [8, 14]
- name: IMPEACH THE PRESIDENT
  section: Funk and Soul
  page: 24
  instruments:
    BD: [1, 8, 9, 15]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 8, 9, 13, 15]
    OH: [11]
- name: WHEN THE LEVEE BREAKS
  section: Funk and Soul
  page: 24
  instruments:
    BD: [1, 2, 8, 11, 12]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: "IT\u2019S A NEW DAY"
  section: Funk and Soul
  page: 24
  instruments:
    BD: [1, 3, 11, 12, 16]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: THE BIG BEAT
  section: Funk and Soul
  page: 25
  instruments:
    BD: [1, 4, 7, 9]
    SN: [5, 13]
    CH: [5, 13]
- name: "ASHLEY\u2019S ROACHCLIP"
  section: Funk and Soul
  page: 25
  instruments:
    BD: [1, 3, 7, 9, 10]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 13, 15]
    OH: [11]
    CB: [1, 3, 5, 7, 9, 11, 13, 15]
- name: PAPA WAS TOO
  section: Funk and Soul
  page: 25
  instruments:
    BD: [1, 8, 9, 11, 16]
    SN: [5, 13]
    CH: [5, 9, 11, 13, 15, 16]
    CY: [5]
- name: SUPERSTITION
  section: Funk and Soul
  page: 25
  instruments:
    BD: [1, 5, 9, 13]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 8, 9, 10, 11, 13, 15, 16]
- name: CISSY STRUT - A
  section: Funk and Soul
  page: 26
  instruments:
    BD: [1, 4, 6, 10, 12, 13, 15]
    SN: [5, 8, 10, 11]
    CY: [13, 15]
- name: CISSY STRUT - B
  section: Funk and Soul
  page: 26
  instruments:
    BD: [1, 4, 8, 10, 12, 13, 15]
    SN: [3, 6, 7, 9, 10]
- name: CISSY STRUT - C
  section: Funk and Soul
  page: 26
  instruments:
    BD: [1, 5, 8, 10, 12, 13, 15]
    SN: [3, 5, 6, 7, 10]
    CY: [13, 15]
- name: CISSY STRUT - D
  section: Funk and Soul
  page: 26
  instruments:
    BD: [1, 5, 8, 10, 12, 13, 15]
    SN: [1, 3, 6, 9, 10]
    CY: [13, 15]
- name: HOOK AND SLING - A
  section: Funk and Soul
  page: 27
  instruments:
    BD: [1, 3, 10, 14, 15]
    SN: [5, 7, 8, 11, 13]
    CY: [1, 3, 4, 6, 9, 10, 12, 15]
- name: HOOK AND SLING - B
  section: Funk and Soul
  page: 27
  instruments:
    BD: [15]
    SN: [1, 5, 6, 8, 11, 12, 15, 16]
    CY: [1, 2, 4, 7, 9, 10, 13, 15]
- name: HOOK AND SLING - C
  section: Funk and Soul
  page: 27
  instruments:
    BD: [1, 2, 13, 14, 16]
    SN: [3, 5, 7, 8, 11, 12, 15]
    CY: [1, 3, 5, 6, 8, 10, 13, 14]
- name: HOOK AND SLING - D
  section: Funk and Soul
  page: 27
  instruments:
    BD: [1, 3, 6, 12, 14, 15]
    SN: [5, 8, 11, 16]
    CY: [1, 3, 5, 6, 8]
- name: KISSING MY LOVE - A
  section: Funk and Soul
  page: 28
  instruments:
    CY: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    SN: [5, 8, 10, 13]
    BD: [1, 2, 4, 12, 15]
- name: KISSING MY LOVE - B
  section: Funk and Soul
  page: 28
  instruments:
    CY: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    SN: [5, 8, 10, 13, 16]
    BD: [1, 2, 4, 12, 14]
- name: KISSING MY LOVE - C
  section: Funk and Soul
  page: 28
  instruments:
    CY: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    SN: [5, 8, 10, 16]
    BD: [1, 2, 4, 11, 13, 14]
- name: KISSING MY LOVE - D
  section: Funk and Soul
  page: 28
  instruments:
    CY: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    SN: [5, 10, 13]
    BD: [1, 4, 12, 15]
- name: KISSING MY LOVE - E
  section: Funk and Soul
  page: 28
  instruments:
    CY: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    SN: [5, 8, 10, 13]
    BD: [1, 12, 14]
- name: LADY - A
  section: Funk and Soul
  page: 29
  instruments:
    CY: [3, 7]
    SN: [5, 6]
    BD: [1, 9, 12, 15]
- name: LADY - B
  section: Funk and Soul
  page: 29
  instruments:
    CY: [3, 7]
    SN: [5, 6, 9]
    BD: [1, 12, 15]
- name: KNOCKS ME OFF MY FEET - A
  section: Funk and Soul
  page: 29
  instruments:
    CY: [1, 3, 7, 8, 10, 11, 15]
    SN: [5, 13]
    BD: [1, 3, 5, 8, 9, 11, 13, 16]
- name: KNOCKS ME OFF MY FEET - B
  section: Funk and Soul
  page: 29
  instruments:
    CY: [1, 3, 7, 8, 10, 11, 15]
    SN: [5, 13]
    BD: [1, 3, 5, 8, 9, 11, 13, 16]
- name: THE THRILL IS GONE
  section: Funk and Soul
  page: 30
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [1, 5, 9, 13]
    BD: [8, 9, 11]
- name: POP TECH - A
  section: Funk and Soul
  page: 30
  instruments:
    CY: [1, 9]
    SN: [5, 13]
    BD: [1]
- name: POP TECH - B
  section: Funk and Soul
  page: 30
  instruments:
    CY: [1, 9]
    SN: [5, 13]
    BD: [2, 14, 15, 16]
- name: YA MAMA - A
  section: Funk and Soul
  page: 30
  instruments:
    CY: [5, 13]
    BD: [1, 9]
- name: YA MAMA - B
  section: Funk and Soul
  page: 30
  instruments:
    CY: [5, 13]
    BD: [1, 8, 9]
- name: COLD SWEAT - A
  section: Funk and Soul
  page: 31
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 8, 15]
    BD: [1, 9, 11]
- name: COLD SWEAT - B
  section: Funk and Soul
  page: 31
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [2, 5, 8, 10, 13]
    BD: [3, 9, 11, 15]
- name: I GOT YOU (I FEEL GOOD) - A
  section: Funk and Soul
  page: 31
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 13]
    BD: [1, 11]
- name: I GOT YOU (I FEEL GOOD) - B
  section: Funk and Soul
  page: 31
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 13]
    BD: [3, 7, 11, 15]
- name: THE SAME BLOOD
  section: Funk and Soul
  page: 32
  instruments:
    CY: [1, 3, 5, 7, 8, 9, 11, 12, 13, 15, 16]
    SN: [4, 6, 7, 13, 14, 15]
    BD: [1, 2, 9, 10]
- name: GROOVE ME
  section: Funk and Soul
  page: 32
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 13]
    BD: [1, 4, 5, 8, 9, 10, 12, 14, 16]
- name: LOOK-KA PY PY - A
  section: Funk and Soul
  page: 32
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [2, 5, 8, 9, 11, 15]
    BD: [1, 4, 6, 11, 14, 15]
- name: LOOK-KA PY PY - B
  section: Funk and Soul
  page: 32
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [2, 5, 6, 8, 9, 11, 15]
    BD: [1, 4, 6, 8, 9, 11, 14, 15]
- name: USE ME - A
  section: Funk and Soul
  page: 33
  instruments:
    CY: [1, 3, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16]
    SN: [3, 5, 7, 8, 10, 11, 13, 15, 16]
    BD: [1, 5, 13]
- name: USE ME - B
  section: Funk and Soul
  page: 33
  instruments:
    CY: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16]
    SN: [2, 3, 5, 7, 8, 10, 11, 13, 15, 16]
    BD: [5, 8, 11, 13]
- name: USE ME - C
  section: Funk and Soul
  page: 33
  instruments:
    CY: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    SN: [5, 8, 10, 13, 16]
    BD: [1, 3, 6, 8, 9, 11, 12, 14, 16]
- name: USE ME - D
  section: Funk and Soul
  page: 33
  instruments:
    CY: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16]
    SN: [5, 8, 16]
    BD: [1, 3, 6, 9, 10, 12, 14, 16]
- name: FUNKY PRESIDENT
  section: Funk and Soul
  page: 34
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 13]
    BD: [1, 4, 8, 10, 11]
- name: GET UP - A
  section: Funk and Soul
  page: 34
  instruments:
    CY: [1, 3, 5, 7, 8, 9, 11, 13, 15, 16]
    SN: [5, 7, 8, 10, 13, 16]
    BD: [1, 11, 15]
- name: GET UP - B
  section: Funk and Soul
  page: 34
  instruments:
    CY: [1, 3, 5, 7, 8, 9, 11, 13, 15]
    SN: [5, 7, 8, 10, 13, 16]
    BD: [1, 11, 15]
- name: EXPENSIVE SHIT
  section: Funk and Soul
  page: 34
  instruments:
    CY: [1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16]
    SN: [1, 2, 4, 6, 9, 10, 13, 14]
    BD: [4, 7, 15]
- name: CHUG CHUG CHUG-A-LUG
  section: Funk and Soul
  page: 35
  instruments:
    CY: [1, 3, 5, 6, 7, 9, 10, 11, 13, 15]
    SN: [2, 3, 5, 8, 10, 11, 13]
    BD: [1, 4, 6, 8, 10, 12, 15]
- name: THE FEZ - A
  section: Funk and Soul
  page: 35
  instruments:
    CY: [3, 7, 11, 15]
    SN: [2, 4, 5, 6, 8, 10, 12, 13, 14, 16]
    BD: [1, 9]
- name: THE FEZ - B
  section: Funk and Soul
  page: 35
  instruments:
    CY: [3, 7, 11, 15]
    SN: [2, 4, 5, 6, 8, 10, 12, 13, 14, 16]
    BD: [1, 9, 12, 15]
- name: ROCK STEADY
  section: Funk and Soul
  page: 35
  instruments:
    CY: [1, 3, 5, 7, 8, 9, 11, 13, 15, 16]
    SN: [2, 5, 6, 8, 10, 13, 14, 16]
    BD: [3, 5, 8, 11, 13]
- name: SYNTHETIC SUBSTITUTION - A
  section: Funk and Soul
  page: 36
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 9]
    BD: [1, 3, 8, 10, 11, 12, 16]
- name: SYNTHETIC SUBSTITUTION - B
  section: Funk and Soul
  page: 36
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 9]
    BD: [1, 3, 8, 10, 11, 12, 16]
- name: "COW\u2019D BELL - A"
  section: Funk and Soul
  page: 36
  instruments:
    CB: [1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16]
    SN: [2, 4, 5, 6, 8, 10, 12, 13, 14, 16]
    BD: [1, 4, 7, 8, 11, 12, 14, 16]
- name: "COW\u2019D BELL - B"
  section: Funk and Soul
  page: 36
  instruments:
    CB: [1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16]
    SN: [2, 4, 5, 6, 8, 10, 12, 13, 14, 16]
    BD: [1, 3, 4, 8, 9, 11, 12, 14, 16]
- name: PALM GREASE - A
  section: Funk and Soul
  page: 37
  instruments:
    CY: [1, 2, 3, 4, 6, 7, 9, 11, 12, 14, 15]
    SN: [5, 8, 10, 13, 16]
    BD: [1, 9, 16]
- name: PALM GREASE - B
  section: Funk and Soul
  page: 37
  instruments:
    CY: [1, 3, 11]
    SN: [2, 6, 15]
    BD: [3]
- name: O-O-H CHILD - A
  section: Funk and Soul
  page: 37
  instruments:
    CY: [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15]
    SN: [2, 4, 5, 7, 8, 10, 12, 13, 14, 16]
    BD: [1, 3, 9, 11, 12]
- name: ^      ^      ^      ^
  section: Funk and Soul
  page: 37
  instruments:
    CY: [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15]
    SN: [2, 4, 5, 7, 8, 10, 13, 15]
    BD: [1, 3, 9, 11, 12]
- name: LADY MARMALADE - A
  section: Funk and Soul
  page: 38
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 13]
    BD: [1, 3, 7, 9, 15]
- name: LADY MARMALADE - B
  section: Funk and Soul
  page: 38
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 9]
    BD: [13]
- name: HOT SWEAT - A
  section: Funk and Soul
  page: 38
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 8, 9, 10, 13, 15, 16]
    BD: [1, 11]
- name: HOT SWEAT - B
  section: Funk and Soul
  page: 38
  instruments:
    CY: [1, 3, 4, 5, 7, 9, 11, 12, 13, 15]
    SN: [2, 4, 5, 6, 8, 10, 12, 13, 14]
    BD: [3, 4, 11, 12, 15]
- name: HAITIAN DIVORCE
  section: Funk and Soul
  page: 39
  instruments:
    CY: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16]
    SN: [2, 5, 7, 8, 10, 13, 15, 16]
    BD: [3, 5, 11, 13]
- name: COME DANCING - A
  section: Funk and Soul
  page: 39
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [2, 3, 5, 6, 7, 10, 11, 13, 14, 15]
    BD: [1, 8, 9, 16]
- name: COME DANCING - B
  section: Funk and Soul
  page: 39
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [2, 5, 6, 10, 13, 14, 15]
    BD: [1, 3, 6, 8, 9, 16]
- name: RESPECT YOURSELF - A
  section: Funk and Soul
  page: 40
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 11, 13]
    BD: [1, 5, 9, 13]
- name: RESPECT YOURSELF - B
  section: Funk and Soul
  page: 40
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 9, 11, 13]
    BD: [1, 5, 9, 13]
- name: EXPRESS YOURSELF - A
  section: Funk and Soul
  page: 40
  instruments:
    CY: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    SN: [5, 8, 10, 12, 14, 16]
    BD: [1, 4, 9, 12, 15]
- name: EXPRESS YOURSELF - B
  section: Funk and Soul
  page: 40
  instruments:
    CY: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    SN: [5, 8, 10, 12, 13]
    BD: [1, 4, 9, 12, 15]
- name: LET A WOMAN BE A WOMAN
  section: Funk and Soul
  page: 41
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 8, 10, 11, 13, 14]
    BD: [3, 9, 11, 12, 14, 15]
- name: LET A MAN BE A MAN
  section: Funk and Soul
  page: 41
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 8, 10, 12, 13]
    BD: [3, 11, 15]
- name: BOOKS OF MOSES - A
  section: Funk and Soul
  page: 41
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 13]
    BD: [1, 5, 9, 12]
- name: BOOKS OF MOSES - B
  section: Funk and Soul
  page: 41
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [5, 13]
    BD: [1, 5, 9]
- name: MOTHER POPCORN - A
  section: Funk and Soul
  page: 42
  instruments:
    CY: [1, 5, 9, 13]
    SN: [5, 8, 10, 15]
    BD: [1, 3, 11]
- name: MOTHER POPCORN - B
  section: Funk and Soul
  page: 42
  instruments:
    CY: [1, 5, 9, 13]
    SN: [2, 4, 5, 6, 8, 10, 12, 13, 14, 16]
    BD: [3, 7, 11, 15]
- name: STRT BTS - A
  section: Funk and Soul
  page: 42
  instruments:
    CY: [2, 3, 5, 6, 8, 9, 14, 15]
    SN: [2, 5, 8, 12, 13]
    BD: [1, 4, 7, 11]
- name: STRT BTS - B
  section: Funk and Soul
  page: 42
  instruments:
    CY: [2, 3, 5, 6, 8, 9, 14, 15]
    SN: [2, 5, 8, 13]
    BD: [1, 4, 7, 11]
- name: "I GOT THE FEELIN\u2019 - A"
  section: Funk and Soul
  page: 43
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [7, 10, 15]
    BD: [1, 3, 11]
- name: "I GOT THE FEELIN\u2019 - B"
  section: Funk and Soul
  page: 43
  instruments:
    CY: [1, 3, 5, 7, 9, 11, 13, 15]
    SN: [2, 5, 6, 8, 10, 11, 12, 14, 15, 16]
    BD: [3, 9, 13, 15]
- name: MORE BOUNCE TO THE OUNCE
  section: Funk and Soul
  page: 43
  instruments:
    CH: [3, 5, 7, 9, 11, 13, 15]
    OH: [1]
    HC: [5, 13]
    SN: [5, 13]
    BD: [1, 9, 10]
- name: SON CLAVE
  section: Afro-Cuban
  page: 44
  instruments:
    BD: [1, 4, 5, 8, 9, 12, 13, 16]
    RS: [1, 4, 7, 11, 13]
    CY: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
- name: RUMBA
  section: Afro-Cuban
  page: 44
  instruments:
    BD: [1, 4, 5, 8, 9, 12, 13, 16]
    RS: [1, 4, 8, 11, 13]
    CY: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
- name: BOSSA NOVA
  section: Afro-Cuban
  page: 44
  instruments:
    BD: [1, 4, 5, 8, 9, 12, 13, 16]
    RS: [1, 4, 7, 11, 14]
    CY: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
- name: BOUTON
  section: Afro-Cuban
  page: 44
  instruments:
    BD: [1, 9, 11, 15]
    RS: [4, 7, 13]
    CH: [1, 3, 4, 5, 7, 9, 11, 13, 15]
- name: GAHU
  section: Afro-Cuban
  page: 45
  instruments:
    BD: [1, 5, 9, 13, 15]
    RS: [3, 4, 7, 8, 11, 12, 15, 16]
    CB: [1, 4, 7, 11, 15]
- name: SHIKO
  section: Afro-Cuban
  page: 45
  instruments:
    BD: [1, 5, 7, 9, 13, 15]
    RS: [3, 4, 7, 8, 11, 12, 15, 16]
    CB: [1, 5, 7, 11, 13]
- name: SOUKOUS
  section: Afro-Cuban
  page: 45
  instruments:
    BD: [1, 5, 9, 13, 15]
    RS: [1, 4, 7, 9, 12, 15]
    CB: [1, 4, 7, 10, 11]
- name: DRUM AND BASS 1 - A
  section: Drum and Bass
  page: 46
  instruments:
    BD: [1, 4, 8, 10, 11, 16]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: DRUM AND BASS 1 - B
  section: Drum and Bass
  page: 46
  instruments:
    BD: [1, 3, 8, 9, 10, 11]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: DRUM AND BASS 2 - A
  section: Drum and Bass
  page: 46
  instruments:
    BD: [1, 8, 10, 12, 16]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: DRUM AND BASS 2 - B
  section: Drum and Bass
  page: 46
  instruments:
    BD: [1, 12]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15, 16]
- name: DRUM AND BASS 3
  section: Drum and Bass
  page: 46
  instruments:
    BD: [1, 11]
    SN: [5, 13]
    CH: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    OH: [7, 8, 9, 10]
- name: DRUM AND BASS 4 - A
  section: Drum and Bass
  page: 47
  instruments:
    BD: [1, 7]
    SN: [5, 11, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
    OH: [1]
- name: DRUM AND BASS 4 - B
  section: Drum and Bass
  page: 47
  instruments:
    BD: [5, 11]
    SN: [5, 13]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: JUNGLE - A
  section: Drum and Bass
  page: 47
  instruments:
    BD: [1, 3, 11]
    SN: [5, 8, 10, 15]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
    OH: [1]
- name: JUNGLE - B
  section: Drum and Bass
  page: 47
  instruments:
    BD: [2, 3, 11]
    SN: [2, 5, 8, 10, 15]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: TECHNO
  section: EDM
  page: 48
  instruments:
    BD: [1, 5, 9, 13, 15]
    SN: [5, 13]
    CH: [10]
    OH: [3, 7, 11, 15]
- name: DUBSTEP - A
  section: EDM
  page: 48
  instruments:
    BD: [1, 11]
    SN: [9]
    CH: [2, 3, 7, 12, 15]
    OH: [5, 14]
- name: DUBSTEP - B
  section: EDM
  page: 48
  instruments:
    BD: [1, 4, 7, 11]
    SN: [9]
    CH: [2, 3, 7, 12, 15]
    OH: [5, 14]
- name: DUBSTEP - RATCHETED
  section: EDM
  page: 48
  instruments:
    BD: [1, 4, 9, 12]
    SN: [5, 13, 16]
    CH: [1, 2, 6, 7, 8, 9, 10, 12, 13, 14, 16]
    OH: [7]
- name: UK GARAGE - A
  section: EDM
  page: 49
  instruments:
    BD: [1, 11]
    CL: [5, 13]
    CH: [3, 4, 7, 11, 15, 16]
    RS: [2, 8, 14]
    MT: [6, 12]
- name: UK GARAGE - B
  section: EDM
  page: 49
  instruments:
    BD: [1, 11]
    CL: [5, 13]
    CH: [3, 7, 11, 15]
    RS: [8, 14]
    MT: [6, 12]
- name: SYNTH WAVE
  section: EDM
  page: 49
  instruments:
    BD: [1, 9]
    SN: [5, 13]
    CH: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    OH: [14]
- name: HALF DROP
  section: Dub
  page: 50
  instruments:
    BD: [1]
    SN: [9]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: ONE DROP
  section: Dub
  page: 50
  instruments:
    BD: [9]
    SN: [9]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: TWO DROP
  section: Dub
  page: 50
  instruments:
    BD: [1, 9]
    SN: [9]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: STEPPERS
  section: Dub
  page: 50
  instruments:
    BD: [1, 5, 9, 13]
    SN: [9]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: REGGAETON 1
  section: Reggaeton
  page: 51
  instruments:
    BD: [1, 5, 9, 13]
    SN: [4, 7, 12, 15]
    CH: [1, 3, 5, 7, 9, 11, 13, 15]
- name: REGGAETON 2
  section: Reggaeton
  page: 51
  instruments:
    CH: [3, 7, 11, 15]
    SN: [4, 6, 7, 8, 11, 12, 15]
    BD: [1, 8]
- name: REGGAETON 3 - A
  section: Reggaeton
  page: 51
  instruments:
    SN: [1, 4, 7, 9, 12, 15]
    BD: [1, 9]
- name: REGGAETON 3 - B
  section: Reggaeton
  page: 51
  instruments:
    CH: [1, 4, 7, 9, 12, 15]
    SN: [1, 4, 7, 9, 12, 15]
    BD: [1, 9]
- name: POP 1 - A
  section: Pop
  page: 52
  instruments:
    CH: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    OH: [1, 4, 7, 9, 10]
    RS: [1, 2, 4, 7, 8, 11, 12]
    SN: [5, 13]
    BD: [1, 2, 4, 8, 11]
    HC: [5, 13]
- name: IN THE AIR LAST NIGHT - A
  section: Pop
  page: 52
  instruments:
    HT: [3, 7]
    OH: [1, 13]
    CH: [3, 7, 11, 13]
    SN: [13]
    BD: [11]
- name: IN THE AIR LAST NIGHT - B
  section: Pop
  page: 52
  instruments:
    HT: [3, 7]
    OH: [1, 13]
    CH: [3, 7, 11, 13]
    SN: [13]
    BD: [1, 3, 5, 7, 9, 11, 15]
- name: NINETEEN - A
  section: Pop
  page: 53
  instruments:
    CH: [1, 4, 7, 9, 10]
    OH: [1, 4, 7, 9, 10]
    RS: [1, 2, 4, 7, 8, 11, 12]
    BD: [1, 2, 4, 8, 11]
    HC: [5, 13]
- name: NINETEEN - B
  section: Pop
  page: 53
  instruments:
    CH: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    OH: [1, 4, 7, 9, 10]
    RS: [1, 2, 4, 7, 8, 11, 12]
    SN: [5, 13]
    BD: [1, 2, 4, 8, 11]
    HC: [5, 13]
- name: BLEU MONDAY - A
  section: Pop
  page: 53
  instruments:
    OH: [3, 7, 11, 15]
    SN: [5, 13]
    BD: [1, 9]
    HC: [5, 13]
- name: BLEU MONDAY - B
  section: Pop
  page: 53
  instruments:
    CH: [1, 4, 5, 8, 9, 12, 13, 16]
    OH: [3, 7, 11, 15]
    SN: [5, 13]
    BD: [1, 9]
    HC: [5, 13]
- name: STANDARD BREAKBEAT 1
  section: Breaks
  page: 54
  instruments:
    BD: [1, 11]
    SN: [5, 13]
- name: STANDARD BREAKBEAT 2
  section: Breaks
  page: 54
  instruments:
    BD: [1, 3, 11]
    SN: [5, 13]
- name: STANDARD BREAKBEAT 3
  section: Breaks
  page: 54
  instruments:
    BD: [1, 3, 7, 11]
    SN: [5, 8, 10, 13]
- name: POLYRHYTHMIC - A
  section: Breaks
  page: 54
  instruments:
    BD: [1, 7]
    SN: [3, 5, 9, 11, 12, 13, 15, 16]
- name: POLYRHYTHMIC - B
  section: Breaks
  page: 54
  instruments:
    BD: [3, 9]
    SN: [5, 7, 11, 13]
- name: HYBRID KICK
  section: Hybrid Breaks With Alternate Endings
  page: 55
  instruments:
    BD: [1, 9]
    SN: [5, 13]
- name: "\u21B3 FOLLOW WITH HYBRID BREAK ENDING 1"
  section: Hybrid Breaks With Alternate Endings
  page: 55
  instruments:
    BD: [1, 11]
    SN: [5, 10, 13]
- name: "\u21B3 OR FOLLOW WITH HYBRID BREAK ENDING 2"
  section: Hybrid Breaks With Alternate Endings
  page: 55
  instruments:
    BD: [1, 7, 9, 12]
    SN: [5, 13]
- name: "\u21B3 OR FOLLOW WITH HYBRID BREAK ENDING 3"
  section: Hybrid Breaks With Alternate Endings
  page: 55
  instruments:
    BD: [1, 8, 11]
    SN: [5, 13]
- name: "\u21B3 OR FOLLOW WITH HYBRID BREAK ENDING 4"
  section: Hybrid Breaks With Alternate Endings
  page: 55
  instruments:
    BD: [1, 10]
    SN: [5, 13]
- name: "\u21B3 OR FOLLOW WITH HYBRID BREAK ENDING 5"
  section: Hybrid Breaks With Alternate Endings
  page: 56
  instruments:
    BD: [1, 3, 9, 11]
    SN: [5, 13]
- name: "\u21B3 OR FOLLOW WITH HYBRID BREAK ENDING 6"
  section: Hybrid Breaks With Alternate Endings
  page: 56
  instruments:
    BD: [1, 6, 8, 10, 11]
    SN: [5, 13]
- name: HYBRID KICK 7 - A
  section: Hybrid Breaks With Alternate Endings
  page: 56
  instruments:
    BD: [1, 3, 9, 11]
    SN: [5, 13]
- name: "\u21B3 FOLLOW WITH HYBRID BREAK 7 - B"
  section: Hybrid Breaks With Alternate Endings
  page: 56
  instruments:
    BD: [1, 2, 9, 11]
    SN: [5, 13]
- name: HYBRID 8 - A
  section: Hybrid Breaks With Alternate Endings
  page: 56
  instruments:
    BD: [1, 9, 11]
    SN: [5, 13]
- name: "\u21B3 FOLLOW WITH HYBRID BREAK 8 - B"
  section: Hybrid Breaks With Alternate Endings
  page: 56
  instruments:
    BD: [1, 2, 9, 11]
    SN: [5, 13]
- name: IRREGULAR 1 - A
  section: Irregular Breaks
  page: 57
  instruments:
    BD: [1, 3, 4, 7, 11]
    SN: [5, 8, 13, 16]
- name: IRREGULAR 1 - B
  section: Irregular Breaks
  page: 57
  instruments:
    BD: [1, 3, 8, 11]
    SN: [5, 13, 16]
- name: IRREGULAR 2 - A
  section: Irregular Breaks
  page: 57
  instruments:
    BD: [1, 8, 11]
    SN: [4, 13]
- name: IRREGULAR 2 - B
  section: Irregular Breaks
  page: 57
  instruments:
    BD: [1, 3, 7, 11]
    SN: [5, 9, 13]
- name: IRREGULAR 3
  section: Irregular Breaks
  page: 57
  instruments:
    BD: [1, 4, 9, 15]
    SN: [2, 5, 11, 14]
- name: ROLLING 1
  section: Rolling Breaks
  page: 58
  instruments:
    BD: [1, 11]
    SN: [5, 13]
- name: ROLLING 2
  section: Rolling Breaks
  page: 58
  instruments:
    BD: [1, 11, 14]
    SN: [5, 13]
- name: ROLLING 3 - A
  section: Rolling Breaks
  page: 58
  instruments:
    BD: [1, 7, 13]
    SN: [5, 11]
- name: ROLLING 3 - B
  section: Rolling Breaks
  page: 58
  instruments:
    BD: [1, 7, 13]
    SN: [5, 11, 15]
- name: ROLLING 4 - A
  section: Rolling Breaks
  page: 58
  instruments:
    BD: [1, 2]
    SN: [5, 13]
- name: ROLLING 4 - B
  section: Rolling Breaks
  page: 59
  instruments:
    BD: [1, 8, 10, 11]
    SN: [5, 13]
- name: ROLLING 5 - A
  section: Rolling Breaks
  page: 59
  instruments:
    BD: [1, 3, 11]
    SN: [5, 13]
- name: ROLLING 5 - B
  section: Rolling Breaks
  page: 59
  instruments:
    BD: [1, 4, 11]
    SN: [5, 13]
- name: ROLLING 6 - A
  section: Rolling Breaks
  page: 59
  instruments:
    BD: [1, 7, 12]
    SN: [5, 13]
- name: ROLLING 6 - B
  section: Rolling Breaks
  page: 59
  instruments:
    BD: [1, 3, 8, 11, 14]
    SN: [5, 13]
- name: ROLLING 7 - A
  section: Rolling Breaks
  page: 60
  instruments:
    BD: [1, 8, 9, 12]
    SN: [5, 13]
- name: ROLLING 7 - B
  section: Rolling Breaks
  page: 60
  instruments:
    BD: [1, 4, 8, 11]
    SN: [5, 13]
- name: ROLLING 7 - C
  section: Rolling Breaks
  page: 60
  instruments:
    BD: [1, 8, 11]
    SN: [5, 13]
- name: ROLLING 7 - D
  section: Rolling Breaks
  page: 60
  instruments:
    BD: [1, 4, 8, 11]
    SN: [5, 13]
- name: ROLLING 8
  section: Rolling Breaks
  page: 60
  instruments:
    BD: [1, 8]
    SN: [5, 13]
- name: ROLLING 9 - A
  section: Rolling Breaks
  page: 61
  instruments:
    BD: [1, 9, 11]
    SN: [5, 13]
- name: ROLLING 9 - B
  section: Rolling Breaks
  page: 61
  instruments:
    BD: [1, 2, 9, 11]
    SN: [5, 13]
- name: ROLLING 10
  section: Rolling Breaks
  page: 61
  instruments:
    BD: [1, 8, 12]
    SN: [5, 13]
- name: ROLLING 11
  section: Rolling Breaks
  page: 61
  instruments:
    BD: [1, 6, 7, 10, 11]
    SN: [5, 13]
- name: CONTEMPORARY SNARE 1 - A
  section: Breaks - Snare
  page: 62
  instruments:
    BD: [1, 11]
    SN: [5, 10, 15]
- name: CONTEMPORARY SNARE 1 - B
  section: Breaks - Snare
  page: 62
  instruments:
    BD: [3, 11]
    SN: [7, 10, 13]
- name: CONTEMPORARY SNARE 2 - A
  section: Breaks - Snare
  page: 62
  instruments:
    BD: [1, 3, 11]
    SN: [5, 13]
- name: CONTEMPORARY SNARE 2 - B
  section: Breaks - Snare
  page: 62
  instruments:
    BD: [3, 11, 12]
    SN: [5, 10, 13]
- name: CONTEMPORARY SNARE 3 - A
  section: Breaks - Snare
  page: 63
  instruments:
    BD: [1, 7, 15]
    SN: [5, 11, 14, 16]
- name: CONTEMPORARY SNARE 3 - B
  section: Breaks - Snare
  page: 63
  instruments:
    BD: [1, 4, 7, 15]
    SN: [5, 11]
- name: UNCONVENTIONAL SNARE 1 - A
  section: Breaks - Snare
  page: 63
  instruments:
    BD: [1, 5, 11]
    SN: [9, 15]
- name: UNCONVENTIONAL SNARE 1 - B
  section: Breaks - Snare
  page: 63
  instruments:
    BD: [1, 7, 11]
    SN: [5, 13]
- name: UNCONVENTIONAL SNARE 2 - A
  section: Breaks - Snare
  page: 63
  instruments:
    BD: [1, 13]
    SN: [5, 9, 12]
- name: UNCONVENTIONAL SNARE 2 - B
  section: Breaks - Snare
  page: 64
  instruments:
    BD: [1, 5, 9, 11]
    SN: [8, 13]
- name: UNCONVENTIONAL SNARE 3 - A
  section: Breaks - Snare
  page: 64
  instruments:
    BD: [1, 7, 14]
    SN: [5, 11]
- name: UNCONVENTIONAL SNARE 3 - B
  section: Breaks - Snare
  page: 64
  instruments:
    BD: [1, 5, 9, 11]
    SN: [8, 13]
- name: UNCONVENTIONAL SNARE 4 - A
  section: Breaks - Snare
  page: 64
  instruments:
    BD: [1, 3, 7, 9]
    SN: [5, 11]
- name: UNCONVENTIONAL SNARE 4 - B
  section: Breaks - Snare
  page: 64
  instruments:
    BD: [3, 11]
    SN: [1, 5, 10, 13]
- name: GHOST SNARE 1 - A
  section: Ghost Snares
  page: 65
  instruments:
    SN: [5, 8, 10, 13, 16]
- name: GHOST SNARE 1 - B
  section: Ghost Snares
  page: 65
  instruments:
    SN: [5, 8, 10, 13]
- name: GHOST SNARE 2 - A
  section: Ghost Snares
  page: 65
  instruments:
    SN: [2, 5, 8, 13, 16]
- name: GHOST SNARE 2 - B
  section: Ghost Snares
  page: 65
  instruments:
    SN: [2, 5, 10, 13, 16]
- name: CONTEMPORARY KICK 1 - A
  section: Breaks - Kick
  page: 66
  instruments:
    BD: [1, 11]
    SN: [5, 15]
- name: CONTEMPORARY KICK 1 - B
  section: Breaks - Kick
  page: 66
  instruments:
    BD: [3, 8, 11]
    SN: [5, 13]
- name: CONTEMPORARY KICK 2 - A
  section: Breaks - Kick
  page: 66
  instruments:
    BD: [3, 8, 11]
    SN: [5, 10, 13]
- name: CONTEMPORARY KICK 2 - B
  section: Breaks - Kick
  page: 66
  instruments:
    BD: [3, 11, 14]
    SN: [5, 13]
- name: CONTEMPORARY KICK 3 - A
  section: Breaks - Kick
  page: 67
  instruments:
    BD: [1, 11]
    SN: [5, 15]
- name: CONTEMPORARY KICK 3 - B
  section: Breaks - Kick
  page: 67
  instruments:
    BD: [1, 9, 11]
    SN: [5, 13]
- name: CONTEMPORARY KICK 4
  section: Breaks - Kick
  page: 67
  instruments:
    BD: [1, 9]
    SN: [5, 11]
- name: DRUM ROLL 1
  section: Drum Rolls
  page: 68
  instruments:
    HT: [9, 10, 11]
    MT: [12, 13, 14]
    LT: [15, 16]
    OH: [1]
    CY: [1]
- name: DRUM ROLL 2
  section: Drum Rolls
  page: 68
  instruments:
    BD: [13, 15]
    SN: [1, 3, 4, 5, 7, 9, 10, 11, 12]
- name: DRUM ROLL 3
  section: Drum Rolls
  page: 68
  instruments:
    SN: [1, 2, 3, 5, 6, 7, 9, 11, 13, 14, 15, 16]
- name: DRUM ROLL 4
  section: Drum Rolls
  page: 68
  instruments:
    BD: [1, 7, 13]
    SN: [4, 5, 8, 9, 16]
    CY: [1, 7, 13]
- name: DRUM ROLL 5
  section: Drum Rolls
  page: 69
  instruments:
    HT: [1]
    MT: [5, 9, 11]
    LT: [13, 15]
- name: DRUM ROLL 6
  section: Drum Rolls
  page: 69
  instruments:
    HT: [1]
    MT: [5, 9, 11]
    LT: [13, 15]
- name: DRUM ROLL 7
  section: Drum Rolls
  page: 69
  instruments:
    HT: [3]
    MT: [4, 7, 8]
    LT: [11, 12, 14]
    SN: [1, 5, 9, 13]
- name: DRUM ROLL 8
  section: Drum Rolls
  page: 70
  instruments:
    HT: [3]
    MT: [5, 9, 11, 12]
    LT: [15, 16]
    SN: [1, 8, 13]
- name: DRUM ROLL 9
  section: Drum Rolls
  page: 70
  instruments:
    HT: [3]
    MT: [5, 11]
    LT: [13, 15]
    SN: [1, 2, 7, 9, 10]
- name: DRUM ROLL 10
  section: Drum Rolls
  page: 70
  instruments:
    HT: [3, 4]
    MT: [7, 8, 11, 12]
    LT: [15, 16]
    SN: [1, 2, 5, 6, 9, 10, 13, 14]
- name: DRUM ROLL 11
  section: Drum Rolls
  page: 71
  instruments:
    HT: [2, 14]
    MT: [5, 8]
    LT: [11, 15, 16]
    SN: [1, 4, 7, 10, 13]
    BD: [3, 6, 9, 12]
- name: DRUM ROLL 12
  section: Drum Rolls
  page: 71
  instruments:
    HT: [3, 10]
    MT: [11, 13]
    LT: [12, 14, 15]
    SN: [1, 2, 9, 13]
    BD: [5, 7]
    CY: [5, 7]
- name: DRUM ROLL 13
  section: Drum Rolls
  page: 71
  instruments:
    HT: [2]
    MT: [6, 10]
    LT: [14]
    SN: [1, 5, 9, 13]
    BD: [3, 4, 7, 8, 11, 12, 15, 16]
- name: DRUM ROLL 14
  section: Drum Rolls
  page: 72
  instruments:
    HT: [10, 11, 12, 13]
    MT: [4, 5, 6, 7, 8, 9, 14, 15]
    LT: [1, 2, 3, 16]
- name: DRUM ROLL 15
  section: Drum Rolls
  page: 72
  instruments:
    HT: [2, 10]
    LT: [4, 8, 12, 16]
    SN: [1, 5, 9, 13]
- name: DRUM ROLL 16
  section: Drum Rolls
  page: 72
  instruments:
    SN: [1, 2, 7, 8, 13, 14]
    BD: [3, 5, 11, 15]
    CH: [3, 9, 15]
    CY: [5, 11]
- name: DRUM ROLL 17
  section: Drum Rolls
  page: 72
  instruments:
    HT: [3, 4]
    MT: [9, 10]
    SN: [1, 2, 5, 7, 8, 11, 13, 14, 15, 16]
    CY: [5, 11]
- name: DRUM ROLL 18
  section: Drum Rolls
  page: 73
  instruments:
    SN: [1, 7]
    BD: [3, 5, 9, 11, 15]
    CY: [1, 7, 13]
- name: DRUM ROLL 19
  section: Drum Rolls
  page: 73
  instruments:
    SN: [1, 2, 7, 8, 13, 14]
    BD: [3, 5, 9, 11, 15]
    CY: [3, 5, 9, 11, 15]
- name: DRUM ROLL 20
  section: Drum Rolls
  page: 73
  instruments:
    HT: [3, 5]
    MT: [7, 15]
    LT: [16]
    SN: [1, 9, 11, 14]
    BD: [2, 4, 6, 8, 10, 12, 13]
    CY: [9]
`;

function parseYamlPatterns (yaml) {
  var lines = (yaml || '').split(/\r?\n/)
  var patterns = []
  var current = null
  var inPatterns = false
  var inInstruments = false
  var instrumentsIndent = 0
  var patternIndent = 0

  function trim (s) { return (s || '').trim() }

  function parseNumberOrString (value) {
    var num = Number(value)
    return isNaN(num) ? value : num
  }

  function parseInlineMap (value) {
    var body = trim(value)
    if (body.charAt(0) !== '{' || body.charAt(body.length - 1) !== '}') return {}
    body = body.slice(1, -1)
    var result = {}
    var pairs = body.split(',')
    for (var i = 0; i < pairs.length; i++) {
      var parts = pairs[i].split(':')
      if (parts.length < 2) continue
      var key = trim(parts.shift())
      var val = trim(parts.join(':'))
      result[key] = parseNumberOrString(val)
    }
    return result
  }

  function parseValue (value) {
    var body = trim(value)
    if (!body) return null
    var first = body.charAt(0)
    var last = body.charAt(body.length - 1)
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return body.slice(1, -1)
    }
    if (first === '[' && last === ']') {
      var inner = body.slice(1, -1)
      if (!inner.trim()) return []
      var parts = inner.split(',')
      var out = []
      for (var i = 0; i < parts.length; i++) {
        var v = trim(parts[i])
        if (v) out.push(parseNumberOrString(v))
      }
      return out
    }
    if (first === '{' && last === '}') {
      return parseInlineMap(body)
    }
    return parseNumberOrString(body)
  }

  function assignField (target, key, value) {
    if (key === 'name' || key === 'n') target.n = value
    else if (key === 'section' || key === 'sect') target.section = value
    else if (key === 's') target.s = value
    else if (key === 'instruments' || key === 'i') target.i = target.i || {}
    else target[key] = value
  }

  function finalizePattern (raw, index) {
    if (!raw) return null
    var name = raw.n || raw.name || ('Pattern ' + (index + 1))
    var sectionIndex = typeof raw.s === 'number' ? raw.s : DRUM_SECTIONS.indexOf(raw.section || '')
    if (isNaN(sectionIndex) || sectionIndex < 0) {
      sectionIndex = DRUM_SECTIONS.indexOf('Uncategorized')
      if (sectionIndex < 0) sectionIndex = 0
    }
    var instruments = raw.i || raw.instruments || {}
    return { s: sectionIndex, n: name, i: instruments }
  }

  for (var li = 0; li < lines.length; li++) {
    var rawLine = lines[li]
    var trimmed = trim(rawLine)
    if (!trimmed || trimmed.charAt(0) === '#') continue
    if (!inPatterns) {
      if (trimmed === 'patterns:' || trimmed.indexOf('patterns:') === 0) {
        inPatterns = true
      }
      continue
    }
    var indent = rawLine.match(/^\s*/)[0].length
    if (trimmed.indexOf('- ') === 0) {
      if (current) patterns.push(finalizePattern(current, patterns.length))
      current = {}
      inInstruments = false
      instrumentsIndent = 0
      patternIndent = indent
      var rest = trimmed.slice(2)
      if (rest.indexOf(':') !== -1) {
        var parts = rest.split(':')
        var key = trim(parts.shift())
        var value = parts.join(':')
        assignField(current, key, parseValue(value))
      }
      continue
    }
    if (!current) continue
    if (trimmed.indexOf('instruments:') === 0) {
      current.i = current.i || {}
      inInstruments = true
      instrumentsIndent = indent
      continue
    }
    if (inInstruments && indent > instrumentsIndent) {
      var instParts = trimmed.split(':')
      var instKey = trim(instParts.shift())
      var instVal = parseValue(instParts.join(':'))
      current.i[instKey] = Array.isArray(instVal) ? instVal : []
      continue
    }
    inInstruments = false
    var fieldParts = trimmed.split(':')
    if (fieldParts.length >= 2) {
      assignField(current, trim(fieldParts.shift()), parseValue(fieldParts.join(':')))
    }
  }
  if (current) patterns.push(finalizePattern(current, patterns.length))
  return patterns
}

const DRUM_PATTERNS = (() => {
  try {
    var parsed = parseYamlPatterns(DRUM_PATTERNS_YAML)
    if (parsed && parsed.length) return parsed
  } catch (e) {
    println('YAML parse failed, using empty pattern list: ' + e)
  }
  return []
})()

;[
  {"s":23,"n":"TRIBAL GROOVE - A","i":{"BD":[1,7,11,15],"SN":[5,13],"CH":[1,3,5,7,9,11,13,15],"LT":[3,12],"MT":[8,16],"CB":[4,10]}},
  {"s":23,"n":"TRIBAL GROOVE - B","i":{"BD":[1,7,11,15],"SN":[4,12],"CH":[1,3,7,11,15],"OH":[8],"LT":[3,14],"MT":[6,10],"CB":[12]}},
  {"s":23,"n":"TRIBAL CLAVE","i":{"BD":[1,8,11,14],"SN":[4,12],"CH":[1,3,5,7,9,11,13,15],"CL":[3,7,11,15],"CB":[6,10,14],"OH":[12]}}
].forEach(function (p) {
  for (var i = 0; i < DRUM_PATTERNS.length; i++) {
    if (DRUM_PATTERNS[i].n === p.n) return
  }
  DRUM_PATTERNS.push(p)
})

function init () {
  println('Drum Pattern ready!')
  const documentState = host.getDocumentState()
  const cursorClipLauncher = host.createLauncherCursorClip(16 * 128, 128)
  const cursorClipArranger = host.createArrangerCursorClip(16 * 128, 128)
  const scrollKey = Math.max(0, 60 + DEFAULT_TRANSPOSE)
  cursorClipLauncher.scrollToKey(scrollKey)
  cursorClipArranger.scrollToKey(scrollKey)

  const names = getPatternNames()
  const patternSetting = documentState.getEnumSetting('Pattern', 'Drum Pattern', names, names[0] || '')
  const clipType = documentState.getEnumSetting('Clip Type', 'Drum Pattern', ['Launcher', 'Arranger'], 'Launcher')
  const velocitySetting = documentState.getNumberSetting('Velocity', 'Drum Pattern', 1, 127, 1, '', DEFAULT_VELOCITY)

  documentState.getSignalSetting('Export', 'Drum Pattern', 'Export Pattern').addSignalObserver(() => {
    const clip = clipType.get() === 'Arranger' ? cursorClipArranger : cursorClipLauncher
    clip.clearSteps()

    const pattern = findPattern(patternSetting.get())
    if (!pattern) {
      const msg = 'Pattern not found: ' + patternSetting.get()
      println(msg)
      host.showPopupNotification(msg)
      return
    }

    writePatternToClip(clip, pattern, velocitySetting.getRaw(), DEFAULT_TRANSPOSE)
    host.showPopupNotification('Exported "' + pattern.n + '" to ' + clipType.get())
  })
}

function getPatternDisplayName (pattern) {
  var sectionIndex = typeof pattern.s === 'number' ? pattern.s : Number.MAX_SAFE_INTEGER
  var sectionName = DRUM_SECTIONS[sectionIndex] || 'Uncategorized'
  return sectionName + ' - ' + pattern.n
}

function getPatternNames () {
  return DRUM_PATTERNS.slice().sort(function (a, b) {
    var sectionA = typeof a.s === 'number' ? a.s : Number.MAX_SAFE_INTEGER
    var sectionB = typeof b.s === 'number' ? b.s : Number.MAX_SAFE_INTEGER
    if (sectionA !== sectionB) {
      return sectionA - sectionB
    }
    return a.n.localeCompare(b.n)
  }).map(getPatternDisplayName)
}

function findPattern (name) {
  for (var i = 0; i < DRUM_PATTERNS.length; i++) {
    var p = DRUM_PATTERNS[i]
    if (p.n === name || getPatternDisplayName(p) === name) {
      return p
    }
  }
  return null
}

function writePatternToClip (cursorClip, pattern, velocity, transpose) {
  var instruments = pattern.i || {}
  var longestStep = 0

  for (var code in instruments) {
    if (!instruments.hasOwnProperty(code)) continue
    var midiNote = GM_DRUM_MAP[code]
    if (midiNote === undefined) {
      println('Unknown drum code: ' + code)
      continue
    }
    midiNote = midiNote + transpose
    while (midiNote < 0) {
      midiNote += 12
    }
    while (midiNote > 127) {
      midiNote -= 12
    }
    var steps = instruments[code]
    for (var i = 0; i < steps.length; i++) {
      var stepNumber = steps[i]
      var stepIndex = Math.max(0, stepNumber - 1)
      var timeIn16ths = stepIndex
      cursorClip.setStep(0, timeIn16ths, midiNote, velocity, STEP_LENGTH_BEATS)
      if (stepNumber > longestStep) {
        longestStep = stepNumber
      }
    }
  }

  var clipLengthInBeats = Math.max(4, longestStep * STEP_LENGTH_BEATS)
  try {
    if (typeof cursorClip.setLength === 'function') {
      cursorClip.setLength(clipLengthInBeats)
    } else if (cursorClip.getLength && typeof cursorClip.getLength().set === 'function') {
      cursorClip.getLength().set(clipLengthInBeats)
    }
  } catch (e) {
    // Length APIs may vary across Bitwig versions; ignore if unavailable.
  }
}

function flush () {}
function exit () {
  println('-- Drum Pattern Bye! --')
}



