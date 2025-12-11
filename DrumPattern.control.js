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
const DRUM_SECTION_LABELS = {
  "Afro-Cuban": "Afro-Cuban (95-110 BPM)",
  "Basic Patterns": "Basic Patterns (100-120 BPM)",
  "Breaks": "Breaks (125-140 BPM)",
  "Breaks - Kick": "Breaks - Kick (125-140 BPM)",
  "Breaks - Snare": "Breaks - Snare (125-140 BPM)",
  "Drum Rolls": "Drum Rolls (Free/Fill)",
  "Drum and Bass": "Drum and Bass (170-175 BPM)",
  "Dub": "Dub (70-80 BPM)",
  "EDM": "EDM (125-128 BPM)",
  "Electro": "Electro (118-125 BPM)",
  "Funk and Soul": "Funk and Soul (95-110 BPM)",
  "Ghost Snares": "Ghost Snares (85-100 BPM)",
  "Hip Hop": "Hip Hop (85-95 BPM)",
  "House": "House (120-128 BPM)",
  "Hybrid Breaks With Alternate Endings": "Hybrid Breaks (125-140 BPM)",
  "Irregular Breaks": "Irregular Breaks (125-140 BPM)",
  "Miami Bass": "Miami Bass (125-135 BPM)",
  "Pop": "Pop (105-120 BPM)",
  "Reggaeton": "Reggaeton (90-105 BPM)",
  "Rock": "Rock (110-130 BPM)",
  "Rolling Breaks": "Rolling Breaks (125-140 BPM)",
  "Standard Breaks": "Standard Breaks (120-135 BPM)",
  "Uncategorized": "Uncategorized (80-130 BPM)",
  "Tribal": "Tribal (115-125 BPM)"
}
// Templates keyed by GM_DRUM_MAP codes (BD, SN, CH, OH, etc.)
const DRUM_PATTERN_TEMPLATES = {
  "EXAMPLE PATTERN": {
    "section": "Uncategorized",
    "instruments": {
      "BD": "x.......x.......",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "ONE AND SEVEN & FIVE AND THIRTEEN": {
    "section": "Basic Patterns",
    "instruments": {
      "BD": "x.....x.........",
      "SN": "....x.......x..."
    }
  },
  "BOOTS N\u2019 CATS": {
    "section": "Basic Patterns",
    "instruments": {
      "BD": "x.......x.......",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "TINY HOUSE": {
    "section": "Basic Patterns",
    "instruments": {
      "OH": "..x...x...x...x.",
      "BD": "x...x...x...x..."
    }
  },
  "GOOD TO GO": {
    "section": "Basic Patterns",
    "instruments": {
      "BD": "x..x..x...x.....",
      "SN": "....x.......x..."
    }
  },
  "HIP HOP": {
    "section": "Basic Patterns",
    "instruments": {
      "BD": "x.x...xx......x.",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "STANDARD BREAK 1": {
    "section": "Standard Breaks",
    "instruments": {
      "BD": "x.........x.....",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.xxx.x.x."
    }
  },
  "STANDARD BREAK 2": {
    "section": "Standard Breaks",
    "instruments": {
      "BD": "x.........x.....",
      "SN": "....x.......x...",
      "CH": "x.x.x.xxx.x...x."
    }
  },
  "ROLLING BREAK": {
    "section": "Standard Breaks",
    "instruments": {
      "BD": "x......x..x.....",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "THE UNKNOWN DRUMMER": {
    "section": "Standard Breaks",
    "instruments": {
      "BD": "x..x..x...x.....",
      "SN": ".x..x..x....x...",
      "CH": ".xx.xx.x.....x..",
      "OH": "........x.....x."
    }
  },
  "ROCK 1": {
    "section": "Rock",
    "instruments": {
      "BD": "x......xx.x.....",
      "SN": "....x.......x...",
      "CY": "x...............",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "ROCK 2": {
    "section": "Rock",
    "instruments": {
      "BD": "x......xx.x.....",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "ROCK 3": {
    "section": "Rock",
    "instruments": {
      "BD": "x......xx.x.....",
      "SN": "....x.......x...",
      "OH": "..............x.",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "ROCK 4": {
    "section": "Rock",
    "instruments": {
      "BD": "x......xx.x.....",
      "SN": "....x.......x.xx",
      "OH": "..............x.",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "ELECTRO 1 - A": {
    "section": "Electro",
    "instruments": {
      "SN": "....x.......x...",
      "BD": "x.....x........."
    }
  },
  "ELECTRO 1 - B": {
    "section": "Electro",
    "instruments": {
      "SN": "....x.......x...",
      "BD": "x.....x...x...x."
    }
  },
  "ELECTRO 2 - A": {
    "section": "Electro",
    "instruments": {
      "SN": "....x.......x...",
      "BD": "x.....x........."
    }
  },
  "ELECTRO 2 - B": {
    "section": "Electro",
    "instruments": {
      "SN": "....x.......x...",
      "BD": "x.........x..x.."
    }
  },
  "ELECTRO 3 - A": {
    "section": "Electro",
    "instruments": {
      "SN": "....x.......x...",
      "BD": "x.....x....x...."
    }
  },
  "ELECTRO 3 - B": {
    "section": "Electro",
    "instruments": {
      "SN": "....x.......x...",
      "BD": "x.....x....x.x.."
    }
  },
  "ELECTRO 4": {
    "section": "Electro",
    "instruments": {
      "SN": "....x.......x...",
      "BD": "x.....x...x..x.."
    }
  },
  "SIBERIAN NIGHTS": {
    "section": "Electro",
    "instruments": {
      "CH": "x.xxx.xxx.xxx.xx",
      "SN": "....x.......x...",
      "BD": "x.....x........."
    }
  },
  "NEW WAVE": {
    "section": "Electro",
    "instruments": {
      "BD": "x.....x.xx......",
      "SN": "....x.......x...",
      "CH": "xxxxxxxxxxxxxxxx",
      "OH": "..x.............",
      "SH": "....x.......x..."
    }
  },
  "HOUSE": {
    "section": "House",
    "instruments": {
      "BD": "x...x...x...x...",
      "SN": "....x.......x...",
      "CY": "x...............",
      "OH": "..x...x...x...x."
    }
  },
  "HOUSE 2": {
    "section": "House",
    "instruments": {
      "BD": "x...x...x...x...",
      "SN": "....x.......x...",
      "CH": "xxxxxxxxxxxxxxxx",
      "OH": "..x..x....x..x.."
    }
  },
  "BRIT HOUSE": {
    "section": "House",
    "instruments": {
      "BD": "x...x...x...x...",
      "CL": "....x.......x...",
      "CY": "..x...x...x...x.",
      "CH": "xx.xxx.xxx.xxx.x",
      "OH": "..x...x...x...x."
    }
  },
  "FRENCH HOUSE": {
    "section": "House",
    "instruments": {
      "BD": "x...x...x...x...",
      "CL": "....x.......x...",
      "SH": "xxx.x.xxxxx.x.xx",
      "CH": "xxxxxxxxxxxxxxxx",
      "OH": ".x.x.x.x.x.x.x.x"
    }
  },
  "DIRTY HOUSE": {
    "section": "House",
    "instruments": {
      "BD": "x.x.x...x.x.x..x",
      "SN": "....x.......x...",
      "CL": "..x.x...x.x.x...",
      "CH": "..........x....x",
      "OH": "..x.......x...x."
    }
  },
  "DEEP HOUSE": {
    "section": "House",
    "instruments": {
      "BD": "x...x...x...x...",
      "CL": "....x.......x...",
      "CH": ".x.....x.x......",
      "OH": "..x...x...x...x."
    }
  },
  "DEEPER HOUSE": {
    "section": "House",
    "instruments": {
      "BD": "x...x...x...x...",
      "CL": ".x.......x......",
      "MT": "..x....x..x.....",
      "SH": "...x....x.......",
      "OH": "..x...x...xx..x."
    }
  },
  "SLOW DEEP HOUSE": {
    "section": "House",
    "instruments": {
      "BD": "x...x...x...x...",
      "CL": "....x.......x...",
      "SH": "xxxxxxxxxxxxxxxx",
      "CH": "x...x...x...x...",
      "OH": "..xx..xx.xx.x..."
    }
  },
  "FOOTWORK - A": {
    "section": "House",
    "instruments": {
      "BD": "x..x..x.x..x..x.",
      "CL": "............x...",
      "CH": "..x.......x.....",
      "RS": "xxxxxxxxxxxxxxxx"
    }
  },
  "FOOTWORK - B": {
    "section": "House",
    "instruments": {
      "BD": "x..x..x.x..x..x.",
      "CL": "............x...",
      "CH": "..x...xx..x...x.",
      "RS": "xxxxxxxxxxxxxxxx"
    }
  },
  "MIAMI BASS - A": {
    "section": "Miami Bass",
    "instruments": {
      "BD": "x.....x.........",
      "SN": "....x.......x...",
      "CH": "x.xxx.xxx.xxx.xx"
    }
  },
  "MIAMI BASS - B": {
    "section": "Miami Bass",
    "instruments": {
      "BD": "x.....x...x..x..",
      "SN": "....x.......x...",
      "CH": "x.xxx.xxx.xxx.xx"
    }
  },
  "SALLY": {
    "section": "Miami Bass",
    "instruments": {
      "BD": "x.....x...x...x.",
      "SN": "....x.......x...",
      "LT": "x.....x...x...x.",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "ROCK THE PLANET": {
    "section": "Miami Bass",
    "instruments": {
      "BD": "x..x..x.........",
      "SN": "....x.......x...",
      "CH": "x.xxx.xxx.xxxxxx"
    }
  },
  "HIP HOP 1 - A": {
    "section": "Hip Hop",
    "instruments": {
      "BD": "x.....xx...x..x.",
      "SN": "....x.......x..."
    }
  },
  "HIP HOP 1 - B": {
    "section": "Hip Hop",
    "instruments": {
      "BD": "x......x...x....",
      "SN": "....x.......x..."
    }
  },
  "HIP HOP 2 - A": {
    "section": "Hip Hop",
    "instruments": {
      "BD": "x......xxx...x.x",
      "SN": "....x.......x..."
    }
  },
  "HIP HOP 2 - B": {
    "section": "Hip Hop",
    "instruments": {
      "BD": "x......xx..x....",
      "SN": "....x....x..x..."
    }
  },
  "HIP HOP 3 - A": {
    "section": "Hip Hop",
    "instruments": {
      "BD": "x.x.....x.x.....",
      "SN": "....x.......x..."
    }
  },
  "HIP HOP 3 - B": {
    "section": "Hip Hop",
    "instruments": {
      "BD": "x.x.....xx.x....",
      "SN": "....x.......x..."
    }
  },
  "HIP HOP 4 - A": {
    "section": "Hip Hop",
    "instruments": {
      "BD": "x..x...x.xx....x",
      "SN": "....x.......x..."
    }
  },
  "HIP HOP 4 - B": {
    "section": "Hip Hop",
    "instruments": {
      "BD": "x.x....xxxx.....",
      "SN": "....x.......x..."
    }
  },
  "HIP HOP 5": {
    "section": "Hip Hop",
    "instruments": {
      "BD": "x.x....xx.x....x",
      "SN": "....x.......x..."
    }
  },
  "HIP HOP 6": {
    "section": "Hip Hop",
    "instruments": {
      "BD": "x.x.......xx...x",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "HIP HOP 7": {
    "section": "Hip Hop",
    "instruments": {
      "BD": "x......x..x..x.x",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "HIP HOP 8": {
    "section": "Hip Hop",
    "instruments": {
      "BD": "x..x....x.xx....",
      "SN": "....x.......x...",
      "CH": "xx.xx.xxxx.xx.xx",
      "OH": ".....x.......x.."
    }
  },
  "TRAP - A": {
    "section": "Hip Hop",
    "instruments": {
      "BD": "x.....x.....x...",
      "SN": "........x.......",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "TRAP - B": {
    "section": "Hip Hop",
    "instruments": {
      "BD": "..x.x...........",
      "SN": "........x.......",
      "CH": "..x.x.x.x.x...x."
    }
  },
  "PLANET ROCK - A": {
    "section": "Hip Hop",
    "instruments": {
      "CH": "x.xxx.xxx.xxxxxx",
      "CB": "x.x.x.xx.x.xx.x.",
      "SN": "....x.......x...",
      "BD": "x.....x.........",
      "HC": "....x.......x..."
    }
  },
  "PLANET ROCK - B": {
    "section": "Hip Hop",
    "instruments": {
      "CH": "x.xxx.xxx.xxxxxx",
      "CB": "x.x.x.xx.x.xx.x.",
      "SN": "....x.......x...",
      "BD": "x.....x...x..x..",
      "HC": "....x.......x..."
    }
  },
  "INNA CLUB": {
    "section": "Hip Hop",
    "instruments": {
      "OH": "x.x.x.x.x.x.x.x.",
      "SN": "....x.......x...",
      "BD": "..x....x..x....x",
      "HC": "....x.......x..."
    }
  },
  "ICE": {
    "section": "Hip Hop",
    "instruments": {
      "SN": "....x.......x...",
      "BD": "x.....x...x...x.",
      "SH": "x.x.x.x.x.x.x.x."
    }
  },
  "BACK TO CALI - A": {
    "section": "Hip Hop",
    "instruments": {
      "CH": "x.x.x.x.x.x.x.x.",
      "SN": "....x.......x...",
      "BD": "x.....x.........",
      "HC": "....x.x.x...x.x."
    }
  },
  "BACK TO CALI - B": {
    "section": "Hip Hop",
    "instruments": {
      "CH": "x.x.x.x.x.x...x.",
      "OH": "............x...",
      "SN": "....x.......x...",
      "BD": "x.....x...x..x..",
      "HC": "x...x.x.x...x..."
    }
  },
  "SNOOP STYLES": {
    "section": "Hip Hop",
    "instruments": {
      "RS": "..x..x..x..x....",
      "OH": "x..x..x...x.....",
      "SN": "....x.......x...",
      "BD": "x..x..x...x.....",
      "HC": "....x.......x..."
    }
  },
  "THE GROOVE - A": {
    "section": "Hip Hop",
    "instruments": {
      "CH": "x.x.x.x.x.x.x.x.",
      "OH": ".......x........",
      "SN": "....x.......x...",
      "BD": "x..x...x...x..x.",
      "SH": "....x.......x..."
    }
  },
  "THE GROOVE - B": {
    "section": "Hip Hop",
    "instruments": {
      "CH": "x.x.x.x.x.x.xx..",
      "OH": ".......x..xxx.x.",
      "SN": "....x.......x...",
      "HT": ".........xx.....",
      "MT": "...........x.x..",
      "LT": "..............xx",
      "BD": "x..x...x...x....",
      "SH": "....x.......x..."
    }
  },
  "BOOM BAP": {
    "section": "Hip Hop",
    "instruments": {
      "CB": "........x.......",
      "OH": "..............x.",
      "CH": "xxxxxxxxxxxxxxxx",
      "CL": "..x...x...x...x.",
      "SN": "..x...x...x...x.",
      "BD": "x.x..x...x...x.."
    }
  },
  "MOST WANTED - A": {
    "section": "Hip Hop",
    "instruments": {
      "CH": "x.x.x.x.x.x.x.x.",
      "CY": "x...............",
      "SN": "....x.......x...",
      "BD": "x.....x.xx.....x",
      "HC": "....x.......x..."
    }
  },
  "MOST WANTED - B": {
    "section": "Hip Hop",
    "instruments": {
      "CH": "x...x.x.x.x.x.x.",
      "OH": "..x.............",
      "SN": "....x.......x...",
      "BD": "..x...x.xx......",
      "HC": "....x.......x..."
    }
  },
  "AMEN BREAK - A": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x.x.......xx....",
      "SN": "....x..x.x..x..x",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "AMEN BREAK - B": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x.x.......xx....",
      "SN": ".......x.x..x..x",
      "CH": "x.x.x.x.x.x.x.x.",
      "RS": "....x..........."
    }
  },
  "AMEN BREAK - C": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x.x.......x.....",
      "SN": ".......x.x..x..x",
      "CH": "x.x.x.x.x.x.x.x.",
      "RS": "..............x."
    }
  },
  "AMEN BREAK - D": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x.x.......x.....",
      "SN": ".x..x..x.x....x.",
      "CH": "x.x.x.x.x...x.x.",
      "CY": "..........x....."
    }
  },
  "THE FUNKY DRUMMER": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x.x...x...x..x..",
      "SN": "....x..x.x.xx..x",
      "CH": "xxxxxxx.xxxxx.xx",
      "OH": ".......x.....x.."
    }
  },
  "IMPEACH THE PRESIDENT": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x......xx.....x.",
      "SN": "....x.......x...",
      "CH": "x.x.x.xxx...x.x.",
      "OH": "..........x....."
    }
  },
  "WHEN THE LEVEE BREAKS": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "xx.....x..xx....",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "IT\u2019S A NEW DAY": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x.x.......xx...x",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "THE BIG BEAT": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x..x..x.x.......",
      "SN": "....x.......x...",
      "CH": "....x.......x..."
    }
  },
  "ASHLEY\u2019S ROACHCLIP": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x.x...x.xx......",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x...x.x.",
      "OH": "..........x.....",
      "CB": "x.x.x.x.x.x.x.x."
    }
  },
  "PAPA WAS TOO": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x......xx.x....x",
      "SN": "....x.......x...",
      "CH": "....x...x.x.x.xx",
      "CY": "....x..........."
    }
  },
  "SUPERSTITION": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x...x...x...x...",
      "SN": "....x.......x...",
      "CH": "x.x.x.xxxxx.x.xx"
    }
  },
  "CISSY STRUT - A": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x..x.x...x.xx.x.",
      "SN": "....x..x.xx.....",
      "CY": "............x.x."
    }
  },
  "CISSY STRUT - B": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x..x...x.x.xx.x.",
      "SN": "..x..xx.xx......"
    }
  },
  "CISSY STRUT - C": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x...x..x.x.xx.x.",
      "SN": "..x.xxx..x......",
      "CY": "............x.x."
    }
  },
  "CISSY STRUT - D": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x...x..x.x.xx.x.",
      "SN": "x.x..x..xx......",
      "CY": "............x.x."
    }
  },
  "HOOK AND SLING - A": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x.x......x...xx.",
      "SN": "....x.xx..x.x...",
      "CY": "x.xx.x..xx.x..x."
    }
  },
  "HOOK AND SLING - B": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "..............x.",
      "SN": "x...xx.x..xx..xx",
      "CY": "xx.x..x.xx..x.x."
    }
  },
  "HOOK AND SLING - C": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "xx..........xx.x",
      "SN": "..x.x.xx..xx..x.",
      "CY": "x.x.xx.x.x..xx.."
    }
  },
  "HOOK AND SLING - D": {
    "section": "Funk and Soul",
    "instruments": {
      "BD": "x.x..x.....x.xx.",
      "SN": "....x..x..x....x",
      "CY": "x.x.xx.x........"
    }
  },
  "KISSING MY LOVE - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "xxxxxxxxxxxxxxx.",
      "SN": "....x..x.x..x...",
      "BD": "xx.x.......x..x."
    }
  },
  "KISSING MY LOVE - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "xxxxxxxxxxxxxxxx",
      "SN": "....x..x.x..x..x",
      "BD": "xx.x.......x.x.."
    }
  },
  "KISSING MY LOVE - C": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "xxxxxxxxxxxxxxxx",
      "SN": "....x..x.x.....x",
      "BD": "xx.x......x.xx.."
    }
  },
  "KISSING MY LOVE - D": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "xxxxxxxxxxxxxxx.",
      "SN": "....x....x..x...",
      "BD": "x..x.......x..x."
    }
  },
  "KISSING MY LOVE - E": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "xxxxxxxxxxxxxxx.",
      "SN": "....x..x.x..x...",
      "BD": "x..........x.x.."
    }
  },
  "LADY - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "..x...x.........",
      "SN": "....xx..........",
      "BD": "x.......x..x..x."
    }
  },
  "LADY - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "..x...x.........",
      "SN": "....xx..x.......",
      "BD": "x..........x..x."
    }
  },
  "KNOCKS ME OFF MY FEET - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x...xx.xx...x.",
      "SN": "....x.......x...",
      "BD": "x.x.x..xx.x.x..x"
    }
  },
  "KNOCKS ME OFF MY FEET - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x...xx.xx...x.",
      "SN": "....x.......x...",
      "BD": "x.x.x..xx.x.x..x"
    }
  },
  "THE THRILL IS GONE": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "x...x...x...x...",
      "BD": ".......xx.x....."
    }
  },
  "POP TECH - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.......x.......",
      "SN": "....x.......x...",
      "BD": "x..............."
    }
  },
  "POP TECH - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.......x.......",
      "SN": "....x.......x...",
      "BD": ".x...........xxx"
    }
  },
  "YA MAMA - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "....x.......x...",
      "BD": "x.......x......."
    }
  },
  "YA MAMA - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "....x.......x...",
      "BD": "x......xx......."
    }
  },
  "COLD SWEAT - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x..x......x.",
      "BD": "x.......x.x....."
    }
  },
  "COLD SWEAT - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": ".x..x..x.x..x...",
      "BD": "..x.....x.x...x."
    }
  },
  "I GOT YOU (I FEEL GOOD) - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x.......x...",
      "BD": "x.........x....."
    }
  },
  "I GOT YOU (I FEEL GOOD) - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x.......x...",
      "BD": "..x...x...x...x."
    }
  },
  "THE SAME BLOOD": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.xxx.xxx.xx",
      "SN": "...x.xx.....xxx.",
      "BD": "xx......xx......"
    }
  },
  "GROOVE ME": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x.......x...",
      "BD": "x..xx..xxx.x.x.x"
    }
  },
  "LOOK-KA PY PY - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": ".x..x..xx.x...x.",
      "BD": "x..x.x....x..xx."
    }
  },
  "LOOK-KA PY PY - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": ".x..xx.xx.x...x.",
      "BD": "x..x.x.xx.x..xx."
    }
  },
  "USE ME - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.xxxxxxx.xxxx",
      "SN": "..x.x.xx.xx.x.xx",
      "BD": "x...x.......x..."
    }
  },
  "USE ME - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "xxx.xxxxxxx.xxxx",
      "SN": ".xx.x.xx.xx.x.xx",
      "BD": "....x..x..x.x..."
    }
  },
  "USE ME - C": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "xxxxxxxxxxxxxxxx",
      "SN": "....x..x.x..x..x",
      "BD": "x.x..x.xx.xx.x.x"
    }
  },
  "USE ME - D": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "xxxxxxxxxx.x.x.x",
      "SN": "....x..x.......x",
      "BD": "x.x..x..xx.x.x.x"
    }
  },
  "FUNKY PRESIDENT": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x.......x...",
      "BD": "x..x...x.xx....."
    }
  },
  "GET UP - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.xxx.x.x.xx",
      "SN": "....x.xx.x..x..x",
      "BD": "x.........x...x."
    }
  },
  "GET UP - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.xxx.x.x.x.",
      "SN": "....x.xx.x..x..x",
      "BD": "x.........x...x."
    }
  },
  "EXPENSIVE SHIT": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.xxx.xxx.xxx.xx",
      "SN": "xx.x.x..xx..xx..",
      "BD": "...x..x.......x."
    }
  },
  "CHUG CHUG CHUG-A-LUG": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.xxx.xxx.x.x.",
      "SN": ".xx.x..x.xx.x...",
      "BD": "x..x.x.x.x.x..x."
    }
  },
  "THE FEZ - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "..x...x...x...x.",
      "SN": ".x.xxx.x.x.xxx.x",
      "BD": "x.......x......."
    }
  },
  "THE FEZ - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "..x...x...x...x.",
      "SN": ".x.xxx.x.x.xxx.x",
      "BD": "x.......x..x..x."
    }
  },
  "ROCK STEADY": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.xxx.x.x.xx",
      "SN": ".x..xx.x.x..xx.x",
      "BD": "..x.x..x..x.x..."
    }
  },
  "SYNTHETIC SUBSTITUTION - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x...x.......",
      "BD": "x.x....x.xxx...x"
    }
  },
  "SYNTHETIC SUBSTITUTION - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x...x.......",
      "BD": "x.x....x.xxx...x"
    }
  },
  "COW\u2019D BELL - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CB": "x.xxx.xxx.xxx.xx",
      "SN": ".x.xxx.x.x.xxx.x",
      "BD": "x..x..xx..xx.x.x"
    }
  },
  "COW\u2019D BELL - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CB": "x.xxx.xxx.xxx.xx",
      "SN": ".x.xxx.x.x.xxx.x",
      "BD": "x.xx...xx.xx.x.x"
    }
  },
  "PALM GREASE - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "xxxx.xx.x.xx.xx.",
      "SN": "....x..x.x..x..x",
      "BD": "x.......x......x"
    }
  },
  "PALM GREASE - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.......x.....",
      "SN": ".x...x........x.",
      "BD": "..x............."
    }
  },
  "O-O-H CHILD - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "xxx.xxx.xxx.xxx.",
      "SN": ".x.xx.xx.x.xxx.x",
      "BD": "x.x.....x.xx...."
    }
  },
  "^      ^      ^      ^": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "xxx.xxx.xxx.xxx.",
      "SN": ".x.xx.xx.x..x.x.",
      "BD": "x.x.....x.xx...."
    }
  },
  "LADY MARMALADE - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x.......x...",
      "BD": "x.x...x.x.....x."
    }
  },
  "LADY MARMALADE - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x...x.......",
      "BD": "............x..."
    }
  },
  "HOT SWEAT - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x..xxx..x.xx",
      "BD": "x.........x....."
    }
  },
  "HOT SWEAT - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.xxx.x.x.xxx.x.",
      "SN": ".x.xxx.x.x.xxx..",
      "BD": "..xx......xx..x."
    }
  },
  "HAITIAN DIVORCE": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "xxx.xxxxxxx.xxxx",
      "SN": ".x..x.xx.x..x.xx",
      "BD": "..x.x.....x.x..."
    }
  },
  "COME DANCING - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": ".xx.xxx..xx.xxx.",
      "BD": "x......xx......x"
    }
  },
  "COME DANCING - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": ".x..xx...x..xxx.",
      "BD": "x.x..x.xx......x"
    }
  },
  "RESPECT YOURSELF - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x.....x.x...",
      "BD": "x...x...x...x..."
    }
  },
  "RESPECT YOURSELF - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x...x.x.x...",
      "BD": "x...x...x...x..."
    }
  },
  "EXPRESS YOURSELF - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "xxxxxxxxxxxxxxxx",
      "SN": "....x..x.x.x.x.x",
      "BD": "x..x....x..x..x."
    }
  },
  "EXPRESS YOURSELF - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "xxxxxxxxxxxxxxxx",
      "SN": "....x..x.x.xx...",
      "BD": "x..x....x..x..x."
    }
  },
  "LET A WOMAN BE A WOMAN": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x..x.xx.xx..",
      "BD": "..x.....x.xx.xx."
    }
  },
  "LET A MAN BE A MAN": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x..x.x.xx...",
      "BD": "..x.......x...x."
    }
  },
  "BOOKS OF MOSES - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x.......x...",
      "BD": "x...x...x..x...."
    }
  },
  "BOOKS OF MOSES - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "....x.......x...",
      "BD": "x...x...x......."
    }
  },
  "MOTHER POPCORN - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x...x...x...x...",
      "SN": "....x..x.x....x.",
      "BD": "x.x.......x....."
    }
  },
  "MOTHER POPCORN - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x...x...x...x...",
      "SN": ".x.xxx.x.x.xxx.x",
      "BD": "..x...x...x...x."
    }
  },
  "STRT BTS - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": ".xx.xx.xx....xx.",
      "SN": ".x..x..x...xx...",
      "BD": "x..x..x...x....."
    }
  },
  "STRT BTS - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": ".xx.xx.xx....xx.",
      "SN": ".x..x..x....x...",
      "BD": "x..x..x...x....."
    }
  },
  "I GOT THE FEELIN\u2019 - A": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": "......x..x....x.",
      "BD": "x.x.......x....."
    }
  },
  "I GOT THE FEELIN\u2019 - B": {
    "section": "Funk and Soul",
    "instruments": {
      "CY": "x.x.x.x.x.x.x.x.",
      "SN": ".x..xx.x.xxx.xxx",
      "BD": "..x.....x...x.x."
    }
  },
  "MORE BOUNCE TO THE OUNCE": {
    "section": "Funk and Soul",
    "instruments": {
      "CH": "..x.x.x.x.x.x.x.",
      "OH": "x...............",
      "HC": "....x.......x...",
      "SN": "....x.......x...",
      "BD": "x.......xx......"
    }
  },
  "SON CLAVE": {
    "section": "Afro-Cuban",
    "instruments": {
      "BD": "x..xx..xx..xx..x",
      "RS": "x..x..x...x.x...",
      "CY": "xxxxxxxxxxxxxxxx"
    }
  },
  "RUMBA": {
    "section": "Afro-Cuban",
    "instruments": {
      "BD": "x..xx..xx..xx..x",
      "RS": "x..x...x..x.x...",
      "CY": "xxxxxxxxxxxxxxxx"
    }
  },
  "BOSSA NOVA": {
    "section": "Afro-Cuban",
    "instruments": {
      "BD": "x..xx..xx..xx..x",
      "RS": "x..x..x...x..x..",
      "CY": "xxxxxxxxxxxxxxxx"
    }
  },
  "BOUTON": {
    "section": "Afro-Cuban",
    "instruments": {
      "BD": "x.......x.x...x.",
      "RS": "...x..x.....x...",
      "CH": "x.xxx.x.x.x.x.x."
    }
  },
  "GAHU": {
    "section": "Afro-Cuban",
    "instruments": {
      "BD": "x...x...x...x.x.",
      "RS": "..xx..xx..xx..xx",
      "CB": "x..x..x...x...x."
    }
  },
  "SHIKO": {
    "section": "Afro-Cuban",
    "instruments": {
      "BD": "x...x.x.x...x.x.",
      "RS": "..xx..xx..xx..xx",
      "CB": "x...x.x...x.x..."
    }
  },
  "SOUKOUS": {
    "section": "Afro-Cuban",
    "instruments": {
      "BD": "x...x...x...x.x.",
      "RS": "x..x..x.x..x..x.",
      "CB": "x..x..x..xx....."
    }
  },
  "DRUM AND BASS 1 - A": {
    "section": "Drum and Bass",
    "instruments": {
      "BD": "x..x...x.xx....x",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "DRUM AND BASS 1 - B": {
    "section": "Drum and Bass",
    "instruments": {
      "BD": "x.x....xxxx.....",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "DRUM AND BASS 2 - A": {
    "section": "Drum and Bass",
    "instruments": {
      "BD": "x......x.x.x...x",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "DRUM AND BASS 2 - B": {
    "section": "Drum and Bass",
    "instruments": {
      "BD": "x..........x....",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.xx"
    }
  },
  "DRUM AND BASS 3": {
    "section": "Drum and Bass",
    "instruments": {
      "BD": "x.........x.....",
      "SN": "....x.......x...",
      "CH": "xxxxxxxxxxxxxxxx",
      "OH": "......xxxx......"
    }
  },
  "DRUM AND BASS 4 - A": {
    "section": "Drum and Bass",
    "instruments": {
      "BD": "x.....x.........",
      "SN": "....x.....x.x...",
      "CH": "x.x.x.x.x.x.x.x.",
      "OH": "x..............."
    }
  },
  "DRUM AND BASS 4 - B": {
    "section": "Drum and Bass",
    "instruments": {
      "BD": "....x.....x.....",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "JUNGLE - A": {
    "section": "Drum and Bass",
    "instruments": {
      "BD": "x.x.......x.....",
      "SN": "....x..x.x....x.",
      "CH": "x.x.x.x.x.x.x.x.",
      "OH": "x..............."
    }
  },
  "JUNGLE - B": {
    "section": "Drum and Bass",
    "instruments": {
      "BD": ".xx.......x.....",
      "SN": ".x..x..x.x....x.",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "TECHNO": {
    "section": "EDM",
    "instruments": {
      "BD": "x...x...x...x.x.",
      "SN": "....x.......x...",
      "CH": ".........x......",
      "OH": "..x...x...x...x."
    }
  },
  "DUBSTEP - A": {
    "section": "EDM",
    "instruments": {
      "BD": "x.........x.....",
      "SN": "........x.......",
      "CH": ".xx...x....x..x.",
      "OH": "....x........x.."
    }
  },
  "DUBSTEP - B": {
    "section": "EDM",
    "instruments": {
      "BD": "x..x..x...x.....",
      "SN": "........x.......",
      "CH": ".xx...x....x..x.",
      "OH": "....x........x.."
    }
  },
  "DUBSTEP - RATCHETED": {
    "section": "EDM",
    "instruments": {
      "BD": "x..x....x..x....",
      "SN": "....x.......x..x",
      "CH": "xx...xxxxx.xxx.x",
      "OH": "......x........."
    }
  },
  "UK GARAGE - A": {
    "section": "EDM",
    "instruments": {
      "BD": "x.........x.....",
      "CL": "....x.......x...",
      "CH": "..xx..x...x...xx",
      "RS": ".x.....x.....x..",
      "MT": ".....x.....x...."
    }
  },
  "UK GARAGE - B": {
    "section": "EDM",
    "instruments": {
      "BD": "x.........x.....",
      "CL": "....x.......x...",
      "CH": "..x...x...x...x.",
      "RS": ".......x.....x..",
      "MT": ".....x.....x...."
    }
  },
  "SYNTH WAVE": {
    "section": "EDM",
    "instruments": {
      "BD": "x.......x.......",
      "SN": "....x.......x...",
      "CH": "xxxxxxxxxxxxxxxx",
      "OH": ".............x.."
    }
  },
  "HALF DROP": {
    "section": "Dub",
    "instruments": {
      "BD": "x...............",
      "SN": "........x.......",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "ONE DROP": {
    "section": "Dub",
    "instruments": {
      "BD": "........x.......",
      "SN": "........x.......",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "TWO DROP": {
    "section": "Dub",
    "instruments": {
      "BD": "x.......x.......",
      "SN": "........x.......",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "STEPPERS": {
    "section": "Dub",
    "instruments": {
      "BD": "x...x...x...x...",
      "SN": "........x.......",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "REGGAETON 1": {
    "section": "Reggaeton",
    "instruments": {
      "BD": "x...x...x...x...",
      "SN": "...x..x....x..x.",
      "CH": "x.x.x.x.x.x.x.x."
    }
  },
  "REGGAETON 2": {
    "section": "Reggaeton",
    "instruments": {
      "CH": "..x...x...x...x.",
      "SN": "...x.xxx..xx..x.",
      "BD": "x......x........"
    }
  },
  "REGGAETON 3 - A": {
    "section": "Reggaeton",
    "instruments": {
      "SN": "x..x..x.x..x..x.",
      "BD": "x.......x......."
    }
  },
  "REGGAETON 3 - B": {
    "section": "Reggaeton",
    "instruments": {
      "CH": "x..x..x.x..x..x.",
      "SN": "x..x..x.x..x..x.",
      "BD": "x.......x......."
    }
  },
  "POP 1 - A": {
    "section": "Pop",
    "instruments": {
      "CH": "xxxxxxxxxxxxxxxx",
      "OH": "x..x..x.xx......",
      "RS": "xx.x..xx..xx....",
      "SN": "....x.......x...",
      "BD": "xx.x...x..x.....",
      "HC": "....x.......x..."
    }
  },
  "IN THE AIR LAST NIGHT - A": {
    "section": "Pop",
    "instruments": {
      "HT": "..x...x.........",
      "OH": "x...........x...",
      "CH": "..x...x...x.x...",
      "SN": "............x...",
      "BD": "..........x....."
    }
  },
  "IN THE AIR LAST NIGHT - B": {
    "section": "Pop",
    "instruments": {
      "HT": "..x...x.........",
      "OH": "x...........x...",
      "CH": "..x...x...x.x...",
      "SN": "............x...",
      "BD": "x.x.x.x.x.x...x."
    }
  },
  "NINETEEN - A": {
    "section": "Pop",
    "instruments": {
      "CH": "x..x..x.xx......",
      "OH": "x..x..x.xx......",
      "RS": "xx.x..xx..xx....",
      "BD": "xx.x...x..x.....",
      "HC": "....x.......x..."
    }
  },
  "NINETEEN - B": {
    "section": "Pop",
    "instruments": {
      "CH": "xxxxxxxxxxxxxxxx",
      "OH": "x..x..x.xx......",
      "RS": "xx.x..xx..xx....",
      "SN": "....x.......x...",
      "BD": "xx.x...x..x.....",
      "HC": "....x.......x..."
    }
  },
  "BLEU MONDAY - A": {
    "section": "Pop",
    "instruments": {
      "OH": "..x...x...x...x.",
      "SN": "....x.......x...",
      "BD": "x.......x.......",
      "HC": "....x.......x..."
    }
  },
  "BLEU MONDAY - B": {
    "section": "Pop",
    "instruments": {
      "CH": "x..xx..xx..xx..x",
      "OH": "..x...x...x...x.",
      "SN": "....x.......x...",
      "BD": "x.......x.......",
      "HC": "....x.......x..."
    }
  },
  "STANDARD BREAKBEAT 1": {
    "section": "Breaks",
    "instruments": {
      "BD": "x.........x.....",
      "SN": "....x.......x..."
    }
  },
  "STANDARD BREAKBEAT 2": {
    "section": "Breaks",
    "instruments": {
      "BD": "x.x.......x.....",
      "SN": "....x.......x..."
    }
  },
  "STANDARD BREAKBEAT 3": {
    "section": "Breaks",
    "instruments": {
      "BD": "x.x...x...x.....",
      "SN": "....x..x.x..x..."
    }
  },
  "POLYRHYTHMIC - A": {
    "section": "Breaks",
    "instruments": {
      "BD": "x.....x.........",
      "SN": "..x.x...x.xxx.xx"
    }
  },
  "POLYRHYTHMIC - B": {
    "section": "Breaks",
    "instruments": {
      "BD": "..x.....x.......",
      "SN": "....x.x...x.x..."
    }
  },
  "HYBRID KICK": {
    "section": "Hybrid Breaks With Alternate Endings",
    "instruments": {
      "BD": "x.......x.......",
      "SN": "....x.......x..."
    }
  },
  "\u21b3 FOLLOW WITH HYBRID BREAK ENDING 1": {
    "section": "Hybrid Breaks With Alternate Endings",
    "instruments": {
      "BD": "x.........x.....",
      "SN": "....x....x..x..."
    }
  },
  "\u21b3 OR FOLLOW WITH HYBRID BREAK ENDING 2": {
    "section": "Hybrid Breaks With Alternate Endings",
    "instruments": {
      "BD": "x.....x.x..x....",
      "SN": "....x.......x..."
    }
  },
  "\u21b3 OR FOLLOW WITH HYBRID BREAK ENDING 3": {
    "section": "Hybrid Breaks With Alternate Endings",
    "instruments": {
      "BD": "x......x..x.....",
      "SN": "....x.......x..."
    }
  },
  "\u21b3 OR FOLLOW WITH HYBRID BREAK ENDING 4": {
    "section": "Hybrid Breaks With Alternate Endings",
    "instruments": {
      "BD": "x........x......",
      "SN": "....x.......x..."
    }
  },
  "\u21b3 OR FOLLOW WITH HYBRID BREAK ENDING 5": {
    "section": "Hybrid Breaks With Alternate Endings",
    "instruments": {
      "BD": "x.x.....x.x.....",
      "SN": "....x.......x..."
    }
  },
  "\u21b3 OR FOLLOW WITH HYBRID BREAK ENDING 6": {
    "section": "Hybrid Breaks With Alternate Endings",
    "instruments": {
      "BD": "x....x.x.xx.....",
      "SN": "....x.......x..."
    }
  },
  "HYBRID KICK 7 - A": {
    "section": "Hybrid Breaks With Alternate Endings",
    "instruments": {
      "BD": "x.x.....x.x.....",
      "SN": "....x.......x..."
    }
  },
  "\u21b3 FOLLOW WITH HYBRID BREAK 7 - B": {
    "section": "Hybrid Breaks With Alternate Endings",
    "instruments": {
      "BD": "xx......x.x.....",
      "SN": "....x.......x..."
    }
  },
  "HYBRID 8 - A": {
    "section": "Hybrid Breaks With Alternate Endings",
    "instruments": {
      "BD": "x.......x.x.....",
      "SN": "....x.......x..."
    }
  },
  "\u21b3 FOLLOW WITH HYBRID BREAK 8 - B": {
    "section": "Hybrid Breaks With Alternate Endings",
    "instruments": {
      "BD": "xx......x.x.....",
      "SN": "....x.......x..."
    }
  },
  "IRREGULAR 1 - A": {
    "section": "Irregular Breaks",
    "instruments": {
      "BD": "x.xx..x...x.....",
      "SN": "....x..x....x..x"
    }
  },
  "IRREGULAR 1 - B": {
    "section": "Irregular Breaks",
    "instruments": {
      "BD": "x.x....x..x.....",
      "SN": "....x.......x..x"
    }
  },
  "IRREGULAR 2 - A": {
    "section": "Irregular Breaks",
    "instruments": {
      "BD": "x......x..x.....",
      "SN": "...x........x..."
    }
  },
  "IRREGULAR 2 - B": {
    "section": "Irregular Breaks",
    "instruments": {
      "BD": "x.x...x...x.....",
      "SN": "....x...x...x..."
    }
  },
  "IRREGULAR 3": {
    "section": "Irregular Breaks",
    "instruments": {
      "BD": "x..x....x.....x.",
      "SN": ".x..x.....x..x.."
    }
  },
  "ROLLING 1": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x.........x.....",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 2": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x.........x..x..",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 3 - A": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x.....x.....x...",
      "SN": "....x.....x....."
    }
  },
  "ROLLING 3 - B": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x.....x.....x...",
      "SN": "....x.....x...x."
    }
  },
  "ROLLING 4 - A": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "xx..............",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 4 - B": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x......x.xx.....",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 5 - A": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x.x.......x.....",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 5 - B": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x..x......x.....",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 6 - A": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x.....x....x....",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 6 - B": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x.x....x..x..x..",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 7 - A": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x......xx..x....",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 7 - B": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x..x...x..x.....",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 7 - C": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x......x..x.....",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 7 - D": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x..x...x..x.....",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 8": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x......x........",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 9 - A": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x.......x.x.....",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 9 - B": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "xx......x.x.....",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 10": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x......x...x....",
      "SN": "....x.......x..."
    }
  },
  "ROLLING 11": {
    "section": "Rolling Breaks",
    "instruments": {
      "BD": "x....xx..xx.....",
      "SN": "....x.......x..."
    }
  },
  "CONTEMPORARY SNARE 1 - A": {
    "section": "Breaks - Snare",
    "instruments": {
      "BD": "x.........x.....",
      "SN": "....x....x....x."
    }
  },
  "CONTEMPORARY SNARE 1 - B": {
    "section": "Breaks - Snare",
    "instruments": {
      "BD": "..x.......x.....",
      "SN": "......x..x..x..."
    }
  },
  "CONTEMPORARY SNARE 2 - A": {
    "section": "Breaks - Snare",
    "instruments": {
      "BD": "x.x.......x.....",
      "SN": "....x.......x..."
    }
  },
  "CONTEMPORARY SNARE 2 - B": {
    "section": "Breaks - Snare",
    "instruments": {
      "BD": "..x.......xx....",
      "SN": "....x....x..x..."
    }
  },
  "CONTEMPORARY SNARE 3 - A": {
    "section": "Breaks - Snare",
    "instruments": {
      "BD": "x.....x.......x.",
      "SN": "....x.....x..x.x"
    }
  },
  "CONTEMPORARY SNARE 3 - B": {
    "section": "Breaks - Snare",
    "instruments": {
      "BD": "x..x..x.......x.",
      "SN": "....x.....x....."
    }
  },
  "UNCONVENTIONAL SNARE 1 - A": {
    "section": "Breaks - Snare",
    "instruments": {
      "BD": "x...x.....x.....",
      "SN": "........x.....x."
    }
  },
  "UNCONVENTIONAL SNARE 1 - B": {
    "section": "Breaks - Snare",
    "instruments": {
      "BD": "x.....x...x.....",
      "SN": "....x.......x..."
    }
  },
  "UNCONVENTIONAL SNARE 2 - A": {
    "section": "Breaks - Snare",
    "instruments": {
      "BD": "x...........x...",
      "SN": "....x...x..x...."
    }
  },
  "UNCONVENTIONAL SNARE 2 - B": {
    "section": "Breaks - Snare",
    "instruments": {
      "BD": "x...x...x.x.....",
      "SN": ".......x....x..."
    }
  },
  "UNCONVENTIONAL SNARE 3 - A": {
    "section": "Breaks - Snare",
    "instruments": {
      "BD": "x.....x......x..",
      "SN": "....x.....x....."
    }
  },
  "UNCONVENTIONAL SNARE 3 - B": {
    "section": "Breaks - Snare",
    "instruments": {
      "BD": "x...x...x.x.....",
      "SN": ".......x....x..."
    }
  },
  "UNCONVENTIONAL SNARE 4 - A": {
    "section": "Breaks - Snare",
    "instruments": {
      "BD": "x.x...x.x.......",
      "SN": "....x.....x....."
    }
  },
  "UNCONVENTIONAL SNARE 4 - B": {
    "section": "Breaks - Snare",
    "instruments": {
      "BD": "..x.......x.....",
      "SN": "x...x....x..x..."
    }
  },
  "GHOST SNARE 1 - A": {
    "section": "Ghost Snares",
    "instruments": {
      "SN": "....x..x.x..x..x"
    }
  },
  "GHOST SNARE 1 - B": {
    "section": "Ghost Snares",
    "instruments": {
      "SN": "....x..x.x..x..."
    }
  },
  "GHOST SNARE 2 - A": {
    "section": "Ghost Snares",
    "instruments": {
      "SN": ".x..x..x....x..x"
    }
  },
  "GHOST SNARE 2 - B": {
    "section": "Ghost Snares",
    "instruments": {
      "SN": ".x..x....x..x..x"
    }
  },
  "CONTEMPORARY KICK 1 - A": {
    "section": "Breaks - Kick",
    "instruments": {
      "BD": "x.........x.....",
      "SN": "....x.........x."
    }
  },
  "CONTEMPORARY KICK 1 - B": {
    "section": "Breaks - Kick",
    "instruments": {
      "BD": "..x....x..x.....",
      "SN": "....x.......x..."
    }
  },
  "CONTEMPORARY KICK 2 - A": {
    "section": "Breaks - Kick",
    "instruments": {
      "BD": "..x....x..x.....",
      "SN": "....x....x..x..."
    }
  },
  "CONTEMPORARY KICK 2 - B": {
    "section": "Breaks - Kick",
    "instruments": {
      "BD": "..x.......x..x..",
      "SN": "....x.......x..."
    }
  },
  "CONTEMPORARY KICK 3 - A": {
    "section": "Breaks - Kick",
    "instruments": {
      "BD": "x.........x.....",
      "SN": "....x.........x."
    }
  },
  "CONTEMPORARY KICK 3 - B": {
    "section": "Breaks - Kick",
    "instruments": {
      "BD": "x.......x.x.....",
      "SN": "....x.......x..."
    }
  },
  "CONTEMPORARY KICK 4": {
    "section": "Breaks - Kick",
    "instruments": {
      "BD": "x.......x.......",
      "SN": "....x.....x....."
    }
  },
  "DRUM ROLL 1": {
    "section": "Drum Rolls",
    "instruments": {
      "HT": "........xxx.....",
      "MT": "...........xxx..",
      "LT": "..............xx",
      "OH": "x...............",
      "CY": "x..............."
    }
  },
  "DRUM ROLL 2": {
    "section": "Drum Rolls",
    "instruments": {
      "BD": "............x.x.",
      "SN": "x.xxx.x.xxxx...."
    }
  },
  "DRUM ROLL 3": {
    "section": "Drum Rolls",
    "instruments": {
      "SN": "xxx.xxx.x.x.xxxx"
    }
  },
  "DRUM ROLL 4": {
    "section": "Drum Rolls",
    "instruments": {
      "BD": "x.....x.....x...",
      "SN": "...xx..xx......x",
      "CY": "x.....x.....x..."
    }
  },
  "DRUM ROLL 5": {
    "section": "Drum Rolls",
    "instruments": {
      "HT": "x...............",
      "MT": "....x...x.x.....",
      "LT": "............x.x."
    }
  },
  "DRUM ROLL 6": {
    "section": "Drum Rolls",
    "instruments": {
      "HT": "x...............",
      "MT": "....x...x.x.....",
      "LT": "............x.x."
    }
  },
  "DRUM ROLL 7": {
    "section": "Drum Rolls",
    "instruments": {
      "HT": "..x.............",
      "MT": "...x..xx........",
      "LT": "..........xx.x..",
      "SN": "x...x...x...x..."
    }
  },
  "DRUM ROLL 8": {
    "section": "Drum Rolls",
    "instruments": {
      "HT": "..x.............",
      "MT": "....x...x.xx....",
      "LT": "..............xx",
      "SN": "x......x....x..."
    }
  },
  "DRUM ROLL 9": {
    "section": "Drum Rolls",
    "instruments": {
      "HT": "..x.............",
      "MT": "....x.....x.....",
      "LT": "............x.x.",
      "SN": "xx....x.xx......"
    }
  },
  "DRUM ROLL 10": {
    "section": "Drum Rolls",
    "instruments": {
      "HT": "..xx............",
      "MT": "......xx..xx....",
      "LT": "..............xx",
      "SN": "xx..xx..xx..xx.."
    }
  },
  "DRUM ROLL 11": {
    "section": "Drum Rolls",
    "instruments": {
      "HT": ".x...........x..",
      "MT": "....x..x........",
      "LT": "..........x...xx",
      "SN": "x..x..x..x..x...",
      "BD": "..x..x..x..x...."
    }
  },
  "DRUM ROLL 12": {
    "section": "Drum Rolls",
    "instruments": {
      "HT": "..x......x......",
      "MT": "..........x.x...",
      "LT": "...........x.xx.",
      "SN": "xx......x...x...",
      "BD": "....x.x.........",
      "CY": "....x.x........."
    }
  },
  "DRUM ROLL 13": {
    "section": "Drum Rolls",
    "instruments": {
      "HT": ".x..............",
      "MT": ".....x...x......",
      "LT": ".............x..",
      "SN": "x...x...x...x...",
      "BD": "..xx..xx..xx..xx"
    }
  },
  "DRUM ROLL 14": {
    "section": "Drum Rolls",
    "instruments": {
      "HT": ".........xxxx...",
      "MT": "...xxxxxx....xx.",
      "LT": "xxx............x"
    }
  },
  "DRUM ROLL 15": {
    "section": "Drum Rolls",
    "instruments": {
      "HT": ".x.......x......",
      "LT": "...x...x...x...x",
      "SN": "x...x...x...x..."
    }
  },
  "DRUM ROLL 16": {
    "section": "Drum Rolls",
    "instruments": {
      "SN": "xx....xx....xx..",
      "BD": "..x.x.....x...x.",
      "CH": "..x.....x.....x.",
      "CY": "....x.....x....."
    }
  },
  "DRUM ROLL 17": {
    "section": "Drum Rolls",
    "instruments": {
      "HT": "..xx............",
      "MT": "........xx......",
      "SN": "xx..x.xx..x.xxxx",
      "CY": "....x.....x....."
    }
  },
  "DRUM ROLL 18": {
    "section": "Drum Rolls",
    "instruments": {
      "SN": "x.....x.........",
      "BD": "..x.x...x.x...x.",
      "CY": "x.....x.....x..."
    }
  },
  "DRUM ROLL 19": {
    "section": "Drum Rolls",
    "instruments": {
      "SN": "xx....xx....xx..",
      "BD": "..x.x...x.x...x.",
      "CY": "..x.x...x.x...x."
    }
  },
  "DRUM ROLL 20": {
    "section": "Drum Rolls",
    "instruments": {
      "HT": "..x.x...........",
      "MT": "......x.......x.",
      "LT": "...............x",
      "SN": "x.......x.x..x..",
      "BD": ".x.x.x.x.x.xx...",
      "CY": "........x......."
    }
  },
  "TRIBAL GROOVE - A": {
    "section": "Tribal",
    "instruments": {
      "BD": "x.....x...x...x.",
      "SN": "....x.......x...",
      "CH": "x.x.x.x.x.x.x.x.",
      "LT": "..x........x....",
      "MT": ".......x.......x",
      "CB": "...x.....x......"
    }
  },
  "TRIBAL GROOVE - B": {
    "section": "Tribal",
    "instruments": {
      "BD": "x.....x...x...x.",
      "SN": "...x.......x....",
      "CH": "x.x...x...x...x.",
      "OH": ".......x........",
      "LT": "..x..........x..",
      "MT": ".....x...x......",
      "CB": "...........x...."
    }
  },
  "TRIBAL CLAVE": {
    "section": "Tribal",
    "instruments": {
      "BD": "x......x..x..x..",
      "SN": "...x.......x....",
      "CH": "x.x.x.x.x.x.x.x.",
      "CL": "..x...x...x...x.",
      "CB": ".....x...x...x..",
      "OH": "...........x...."
    }
  }
}

// Groove/feel defaults (mirrors the style in RhythmGenerator)
const SECTION_RULES = {
  "Hip Hop": { velStrong: 112, velWeak: 82, swing: 0.12, ghostChance: 0.32 },
  "Breaks": { velStrong: 112, velWeak: 84, swing: 0.14, ghostChance: 0.3 },
  "Breaks - Kick": { velStrong: 112, velWeak: 84, swing: 0.14, ghostChance: 0.3 },
  "Breaks - Snare": { velStrong: 112, velWeak: 84, swing: 0.14, ghostChance: 0.32 },
  "Rolling Breaks": { velStrong: 112, velWeak: 84, swing: 0.15, ghostChance: 0.28 },
  "Standard Breaks": { velStrong: 112, velWeak: 84, swing: 0.12, ghostChance: 0.24 },
  "Hybrid Breaks With Alternate Endings": { velStrong: 112, velWeak: 84, swing: 0.14, ghostChance: 0.3 },
  "Irregular Breaks": { velStrong: 112, velWeak: 84, swing: 0.13, ghostChance: 0.28 },
  "Funk and Soul": { velStrong: 110, velWeak: 82, swing: 0.12, ghostChance: 0.32 },
  "House": { velStrong: 108, velWeak: 88, swing: 0.06, ghostChance: 0.08 },
  "Rock": { velStrong: 112, velWeak: 88, swing: 0.05, ghostChance: 0.12 },
  "Pop": { velStrong: 108, velWeak: 86, swing: 0.04, ghostChance: 0.1 },
  "Electro": { velStrong: 110, velWeak: 88, swing: 0.04, ghostChance: 0.08 },
  "EDM": { velStrong: 110, velWeak: 90, swing: 0.05, ghostChance: 0.08 },
  "Dub": { velStrong: 108, velWeak: 82, swing: 0.1, ghostChance: 0.18 },
  "Afro-Cuban": { velStrong: 112, velWeak: 86, swing: 0.16, ghostChance: 0.24 },
  "Reggaeton": { velStrong: 108, velWeak: 82, swing: 0.1, ghostChance: 0.2 },
  "Drum and Bass": { velStrong: 112, velWeak: 90, swing: 0.08, ghostChance: 0.16 },
  "Tribal": { velStrong: 114, velWeak: 86, swing: 0.16, ghostChance: 0.22 },
  "Uncategorized": { velStrong: 110, velWeak: 84, swing: 0.1, ghostChance: 0.2 },
  "Default": { velStrong: 110, velWeak: 84, swing: 0.1, ghostChance: 0.2 }
}

function patternStringToSteps (pattern) {
  var steps = []
  var body = (pattern || "").split("")
  for (var i = 0; i < body.length && i < 16; i++) {
    var ch = body[i].toLowerCase()
    if (ch === 'x') steps.push(i + 1)
  }
  return steps
}

function templatesToPatterns (templates) {
  var patterns = []
  for (var name in templates) {
    if (!templates.hasOwnProperty(name)) continue
    var tpl = templates[name] || {}
    var sectionName = tpl.section || ""
    var sectionIndex = DRUM_SECTIONS.indexOf(sectionName)
    if (sectionIndex < 0) sectionIndex = DRUM_SECTIONS.indexOf("Uncategorized")
    if (sectionIndex < 0) sectionIndex = 0
    var instruments = {}
    var inst = tpl.instruments || {}
    for (var instName in inst) {
      if (!inst.hasOwnProperty(instName)) continue
      var code = instName // templates now store codes directly (BD, SN, etc.)
      instruments[code] = patternStringToSteps(inst[instName])
    }
    patterns.push({ s: sectionIndex, n: name, i: instruments })
  }
  return patterns
}

const DRUM_PATTERNS = templatesToPatterns(DRUM_PATTERN_TEMPLATES)



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
  var baseName = DRUM_SECTIONS[sectionIndex] || 'Uncategorized'
  var label = DRUM_SECTION_LABELS[baseName] || baseName
  return label + ' - ' + pattern.n
}

function getRuleForSection (sectionIndex) {
  var name = DRUM_SECTIONS[sectionIndex] || 'Uncategorized'
  return SECTION_RULES[name] || SECTION_RULES['Default']
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

// small helper to keep notes in 0..127 and integer (same as RhythmGenerator)
function clampNote(n) {
  if (typeof n !== 'number') n = Number(n) || 0
  n = Math.round(n)
  if (n < 0) n = 0
  if (n > 127) n = 127
  return n
}

// small helper to keep velocity in 1..127 and integer
function clampVelocity(v) {
  if (typeof v !== 'number') v = Number(v) || 0
  v = Math.round(v)
  if (v < 1) v = 1
  if (v > 127) v = 127
  return v
}

function writePatternToClip (cursorClip, pattern, velocity, transpose) {
  var instruments = pattern.i || {}
  var rule = getRuleForSection(pattern.s)
  var velocityScale = velocity / DEFAULT_VELOCITY
  var events = []

  // Clear existing steps (support different Bitwig APIs)
  if (typeof cursorClip.clearSteps === 'function') {
    cursorClip.clearSteps()
  } else if (typeof cursorClip.clear === 'function') {
    cursorClip.clear()
  }

  for (var code in instruments) {
    if (!instruments.hasOwnProperty(code)) continue
    var midiNote = GM_DRUM_MAP[code]
    if (midiNote === undefined) {
      println('Unknown drum code: ' + code)
      continue
    }
    midiNote = midiNote + transpose

    // Normalize into 0..127 range and clamp
    while (midiNote < 0) {
      midiNote += 12
    }
    while (midiNote > 127) {
      midiNote -= 12
    }
    midiNote = clampNote(Math.round(midiNote))

    var steps = instruments[code]
    for (var i = 0; i < steps.length; i++) {
      var stepNumber = steps[i]
      var stepIndex = Math.max(0, stepNumber - 1)
      var isStrong = (stepIndex % 4 === 0) || (code === 'SN' && (stepIndex % 8 === 4))
      var baseVel = isStrong ? rule.velStrong : rule.velWeak
      var jitter = (Math.random() * 12) - 6
      var finalVel = clampVelocity(Math.round((baseVel + jitter) * velocityScale))

      for (var bar = 0; bar < 4; bar++) {
        var timeIn16ths = stepIndex + (bar * 16)
        var isOffbeat = (timeIn16ths % 2 !== 0)
        var swingShift = isOffbeat ? rule.swing : 0
        var eventTime = timeIn16ths + swingShift

        events.push({
          t: eventTime,
          note: midiNote,
          vel: finalVel
        })

        // Ghost snares for a bit of feel
        if (code === 'SN' && isStrong) {
          var ghostChance = rule.ghostChance || SECTION_RULES['Default'].ghostChance
          if (Math.random() < ghostChance) {
            var ghostTime = eventTime - 1
            if (ghostTime >= 0) {
              events.push({
                t: ghostTime,
                note: midiNote,
                vel: clampVelocity(Math.round((rule.velWeak * 0.6) * velocityScale))
              })
            }
          }
        }
      }
    }
  }

  events.sort(function (a, b) { return a.t - b.t })

  for (var ev = 0; ev < events.length; ev++) {
    var evt = events[ev]
    cursorClip.setStep(0, evt.t, evt.note, evt.vel, STEP_LENGTH_BEATS)
  }

  var longest = events.reduce(function (max, e) {
    return Math.max(max, e.t)
  }, 0)
  var clipLengthInBeats = Math.max(16.0, (Math.floor(longest) + 1) * STEP_LENGTH_BEATS)
  try {
    if (typeof cursorClip.setLength === 'function') {
      cursorClip.setLength(clipLengthInBeats)
    } else if (cursorClip.getLength && typeof cursorClip.getLength().set === 'function') {
      cursorClip.getLength().set(clipLengthInBeats)
    } else if (typeof cursorClip.setLoopLength === 'function') {
      cursorClip.setLoopLength(clipLengthInBeats)
    } else if (cursorClip.getLoopLength && typeof cursorClip.getLoopLength().set === 'function') {
      cursorClip.getLoopLength().set(clipLengthInBeats)
    }
  } catch (e) {
    // Length APIs may vary across Bitwig versions; ignore if unavailable.
  }
}

function flush () {}
function exit () {
  println('-- Drum Pattern Bye! --')
}
