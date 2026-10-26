/*
 * Optional Python-in-browser demonstration, based on the project's Python sources.
 * Uses the official Pyodide CDN at runtime. The regular JavaScript demos do not
 * depend on this module or an internet connection beyond loading the website.
 */
(function () {
  'use strict';

  const PYODIDE_BASE = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/';
  // Resolve source URLs from this script's own location rather than from page URLs.
  const sourceBase = new URL('python-source/', document.currentScript.src);
  const files = [
    'phonotactics_original.py', 'src/__init__.py',
    'src/common/__init__.py', 'src/common/viterbi.py',
    'src/english/__init__.py', 'src/english/phonology_en.py',
    'src/english/syllabifier_en.py', 'src/korean/__init__.py',
    'src/korean/hangul_utils.py', 'src/korean/syllabifier_ko.py'
  ];

  let runtimePromise = null;
  function withTimeout(promise, ms, description) {
    let timer;
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${description} timed out. Check your network, browser extensions, or CDN access.`)), ms);
      })
    ]).finally(() => clearTimeout(timer));
  }

  async function loadScript() {
    if (typeof window.loadPyodide === 'function') return;
    const scriptUrl = new URL('pyodide.js', PYODIDE_BASE).href;
    await withTimeout(new Promise((resolve, reject) => {
      const tag = document.createElement('script');
      tag.src = scriptUrl;
      tag.async = true;
      tag.crossOrigin = 'anonymous';
      tag.onload = () => typeof window.loadPyodide === 'function'
        ? resolve() : reject(new Error('Pyodide script loaded but did not expose loadPyodide.'));
      tag.onerror = () => reject(new Error('Could not download Pyodide from jsDelivr. A network blocker, security extension, or CDN outage may be responsible.'));
      document.head.appendChild(tag);
    }), 20000, 'Downloading Pyodide');
  }

  async function getRuntime(progress) {
    progress = typeof progress === 'function' ? progress : () => {};
    if (runtimePromise) return runtimePromise;
    runtimePromise = (async () => {
      progress('Downloading the Python interpreter…');
      await loadScript();
      progress('Initializing Python (this first download may be large)…');
      const py = await withTimeout(window.loadPyodide({ indexURL: PYODIDE_BASE }), 90000, 'Initializing Python');
      progress('Loading the project Python modules…');
      const sources = await Promise.all(files.map(async file => {
        const url = new URL(file, sourceBase).href;
        const resp = await fetch(url, { cache: 'no-store' });
        if (!resp.ok) throw new Error(`Could not fetch ${file} (${resp.status}). Check deployment files.`);
        return { file, source: await resp.text() };
      }));
      for (const { file, source } of sources) {
        const full = `/site/${file}`;
        const parent = full.substring(0, full.lastIndexOf('/'));
        py.FS.mkdirTree(parent);
        py.FS.writeFile(full, source, { encoding: 'utf8' });
      }
      py.runPython("import sys\nif '/site' not in sys.path: sys.path.insert(0, '/site')");
      progress('Python is ready. Running the model…');
      return py;
    })();
    try { return await runtimePromise; }
    catch (e) { runtimePromise = null; throw e; }
  }

  async function phonotactics(n, progress) {
    const py = await getRuntime(progress);
    py.globals.set('n_syllables', n);
    const result = await py.runPythonAsync(`
import phonotactics_original as p
import json
out = []
for i in range(n_syllables):
    onset, nucleus, coda = p.phonotactics_sequence_with_constraints(return_parts=True)
    out.append({'onset': onset, 'nucleus': nucleus, 'coda': coda, 'word': ''.join(onset+nucleus+coda)})
json.dumps(out, ensure_ascii=False)
`);
    return JSON.parse(result);
  }

  async function syllabifier(language, text, progress) {
    const py = await getRuntime(progress);
    py.globals.set('ui_language', language);
    py.globals.set('ui_text', text);
    const result = await py.runPythonAsync(`
import json
if ui_language == 'en':
    from src.english.syllabifier_en import build_english_onc_hmm
    seq = ui_text.strip().upper().replace(',', ' ').split()
    hmm = build_english_onc_hmm(seq)
else:
    from src.korean.hangul_utils import decompose_word
    from src.korean.syllabifier_ko import build_korean_hmm
    seq = decompose_word(ui_text.strip())
    hmm = build_korean_hmm(seq)
path, dp = hmm.viterbi(seq)
json.dumps({'phones': seq, 'path': path, 'dp': dp, 'states': ['O','N','C']}, ensure_ascii=False)
`);
    return JSON.parse(result);
  }

  window.MosePython = { phonotactics, syllabifier };
})();
