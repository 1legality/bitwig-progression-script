# Text to Midi

A Bitwig Studio controller script that parses a text-based chord progression and generates MIDI.

## Features

*   Parses chord progressions in a simple text format (e.g., `C:1 Am:1 F:1 G:1`).
*   Supports various chord qualities.
*   Different output types: Chords + Bass, Chords only, Bass only, Bass + Fifth.
*   Chord inversions and smooth voice leading.

## Installation

1.  Download the `TextToMidi.control.js` file.
2.  Place it in the Bitwig Studio `Controller Scripts` folder:
    *   **Windows:** `%USERPROFILE%\Documents\Bitwig Studio\Controller Scripts`
    *   **macOS:** `~/Documents/Bitwig Studio/Controller Scripts`
    *   **Linux:** `~/Bitwig Studio/Controller Scripts`
3.  Open Bitwig Studio, go to `Settings` -> `Controllers`.
4.  Click `+ Add controller` and select `1legality` -> `Text To Midi`.

## How to Use

1.  Once the controller is added, you will see a new panel in Bitwig.
2.  Enter your chord progression in the "Progression" text box.
3.  To make it easier to generate chord progressions, you can use one of the following AI assistants:
    *   **ChatGPT:** [https://chatgpt.com/g/g-682e7b9f338881919be4abdc2900b752-chord-progression-generator](https://chatgpt.com/g/g-682e7b9f338881919be4abdc2900b752-chord-progression-generator)
    *   **Gemini:** [https://gemini.google.com/gem/1mEp9hCTbbA9UybeB3l8-ZQEkzQKC1TXh?usp=sharing](https://gemini.google.com/gem/1mEp9hCTbbA9UybeB3l8-ZQEkzQKC1TXh?usp=sharing)
4.  Click the "Generate!" button to create the MIDI clip.

## Chord Qualities

Here is a list of all the possible chord qualities you can use:

*   `1`: Single note
*   `5`: Power chord (root and fifth)
*   `6`: Major sixth
*   `7`: Dominant seventh
*   `9`: Dominant ninth
*   `11`: Dominant eleventh
*   `13`: Dominant thirteenth
*   `Major`, `maj`, `M`: Major triad
*   `m`, `min`: Minor triad
*   `dim`: Diminished triad
*   `aug`, `+`: Augmented triad
*   `sus4`, `sus`: Suspended fourth
*   `sus2`: Suspended second
*   `add2`, `(add2)`: Major triad with an added second
*   `add4`, `(add4)`: Major triad with an added fourth
*   `add9`, `(add9)`: Major triad with an added ninth
*   `m(add2)`, `madd2`: Minor triad with an added second
*   `m(add4)`: Minor triad with an added fourth
*   `m(add9)`, `madd9`: Minor triad with an added ninth
*   `sus2add9`: Suspended second with an added ninth
*   `m7add11`: Minor seventh with an added eleventh
*   `maj7add13`: Major seventh with an added thirteenth
*   `7b13`: Dominant seventh with a flat thirteenth
*   `7sus2`: Seventh with a suspended second
*   `7sus2sus4`: Seventh with a suspended second and fourth
*   `7#11`: Dominant seventh with a sharp eleventh
*   `mMaj9`: Minor-major ninth
*   `maj6`: Major sixth
*   `m6`, `min6`: Minor sixth
*   `6/9`: Six-nine chord
*   `m6/9`: Minor six-nine chord
*   `maj7`, `M7`: Major seventh
*   `m7`, `min7`: Minor seventh
*   `m(maj7)`, `mM7`: Minor-major seventh
*   `dim7`: Diminished seventh
*   `m7b5`: Half-diminished seventh
*   `maj9`, `M9`: Major ninth
*   `m9`, `min9`: Minor ninth
*   `m(maj9)`, `mM9`: Minor-major ninth
*   `maj11`, `M11`: Major eleventh
*   `m11`, `min11`: Minor eleventh
*   `m(maj11)`, `mM11`: Minor-major eleventh
*   `maj13`, `M13`: Major thirteenth
*   `m13`, `min13`: Minor thirteenth
*   `m(maj13)`, `mM13`: Minor-major thirteenth
*   `7b5`: Seventh with a flat fifth
*   `7#5`, `7aug`: Seventh with a sharp fifth (augmented seventh)
*   `7b9`: Seventh with a flat ninth
*   `7#9`: Seventh with a sharp ninth
*   `7(#11)`: Seventh with a sharp eleventh
*   `9b5`: Ninth with a flat fifth
*   `9#5`: Ninth with a sharp fifth
*   `13b9`: Thirteenth with a flat ninth
*   `13#9`: Thirteenth with a sharp ninth
*   `13(#11)`: Thirteenth with a sharp eleventh
*   `7b9b5`: Seventh with a flat ninth and flat fifth
*   `7b9#5`: Seventh with a flat ninth and sharp fifth
*   `7#9b5`: Seventh with a sharp ninth and flat fifth
*   `7#9#5`: Seventh with a sharp ninth and sharp fifth
*   `7alt`: Altered dominant seventh
*   `maj7(#11)`, `M7#11`: Major seventh with a sharp eleventh
*   `maj9(#11)`, `M9#11`: Major ninth with a sharp eleventh
*   `m7(#11)`: Minor seventh with a sharp eleventh
*   `m9(#11)`: Minor ninth with a sharp eleventh
*   `7sus4`, `7sus`: Seventh with a suspended fourth
*   `9sus4`, `9sus`: Ninth with a suspended fourth
*   `13sus4`, `13sus`: Thirteenth with a suspended fourth
*   `maj7sus4`, `M7sus`: Major seventh with a suspended fourth
*   `` (empty): Major triad (default)

## Inversions

The script supports different chord voicings and inversions to create more natural and interesting progressions.

*   **None**: The chords are played in their root position.
*   **1st Inversion**: The root note of the chord is moved up an octave, making the third the lowest note.
*   **Smooth Voice Leading**: This mode analyzes the previous chord and arranges the notes of the current chord to minimize the melodic distance between them. This creates a smoother transition between chords.
*   **Pianist**: This voicing emulates a common piano style where the root note is played in the bass and the other chord tones are spread out in a higher register.
*   **Open Voicing**: This creates a more open and spacious sound by dropping the third of the chord down an octave.
*   **Spread**: This voicing spreads the chord tones across a wider range by moving the upper notes up by an octave.

## Credits

A special thank you to [Polarity Music](https://github.com/polarity/polarity-music-tools) for the inspiration.
