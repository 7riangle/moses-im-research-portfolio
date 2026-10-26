# Source-derived Python implementations

These modules preserve the algorithms and parameter choices of the author’s two public repositories in a compact, browser-loadable form. They are adapted/condensed from the publicly visible Python files, not byte-for-byte copies of the GitHub source files.

- https://github.com/7riangle/English-Phonotactics-Project (Phonotactics.py)
- https://github.com/7riangle/viterbi-syllabifier (MIT-licensed; src/common/viterbi.py, src/english/*, src/korean/*)

The "Run original Python" option executes these source-derived Python algorithms through Pyodide in the visitor’s browser. It does not execute server-side Python. The default instant demo is a faithful JavaScript port for fast load/offline interaction.

The original English phonotactics segment inventory includes one unusual Unicode vowel string, which has been deliberately preserved rather than silently edited. Both projects are educational toy models.
