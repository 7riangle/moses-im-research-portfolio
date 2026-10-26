/* Loads the user's Python modules into Pyodide. No server or data storage is used.
   Runs only when a visitor deliberately clicks "Run original Python". */
(function(){
 'use strict';
 let loadPromise;
 async function getRuntime(){
  if(loadPromise)return loadPromise;
  loadPromise=(async()=>{
   if(!window.loadPyodide){
    await new Promise((resolve,reject)=>{
     const script=document.createElement('script');
     script.src='https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.js';
     script.onload=resolve;script.onerror=()=>reject(new Error('Could not download the Python runtime. Check your internet connection.'));
     document.head.appendChild(script);
    });
   }
   const py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/'});
   const paths=[
     'phonotactics_original.py','src/__init__.py','src/common/__init__.py','src/common/viterbi.py',
     'src/english/__init__.py','src/english/phonology_en.py','src/english/syllabifier_en.py',
     'src/korean/__init__.py','src/korean/hangul_utils.py','src/korean/syllabifier_ko.py'
   ];
   for(const p of paths){
    const response=await fetch(`../../python-source/${p}`);
    if(!response.ok)throw new Error('Missing Python source: '+p);
    const contents=await response.text();
    const full='/site/'+p;
    const segments=full.split('/').slice(1,-1);
    let path='';
    for(const part of segments){path+='/'+part;if(!py.FS.analyzePath(path).exists)py.FS.mkdir(path)}
    py.FS.writeFile(full,contents);
   }
   py.runPython("import sys\nsys.path.insert(0, '/site')");
   return py;
  })();
  try{return await loadPromise}catch(err){loadPromise=null;throw err}
 }
 async function phonotactics(n){
  const py=await getRuntime();
  py.globals.set('n_syllables', n);
  const result=py.runPython(`
import phonotactics_original as p
import json
out = []
for i in range(n_syllables):
    onset,nucleus,coda=p.phonotactics_sequence_with_constraints(return_parts=True)
    out.append({'onset':onset,'nucleus':nucleus,'coda':coda,'word':''.join(onset+nucleus+coda)})
json.dumps(out,ensure_ascii=False)
`);
  return JSON.parse(result);
 }
 async function syllabifier(language,text){
  const py=await getRuntime();
  py.globals.set('ui_language',language);
  py.globals.set('ui_text',text);
  const result=py.runPython(`
import json
if ui_language=='en':
    from src.english.syllabifier_en import build_english_onc_hmm
    seq=ui_text.strip().upper().replace(',', ' ').split()
    hmm=build_english_onc_hmm(seq)
else:
    from src.korean.hangul_utils import decompose_word
    from src.korean.syllabifier_ko import build_korean_hmm
    seq=decompose_word(ui_text.strip())
    hmm=build_korean_hmm(seq)
path,dp=hmm.viterbi(seq)
json.dumps({'phones':seq,'path':path,'dp':dp,'states':['O','N','C']},ensure_ascii=False)
`);
  return JSON.parse(result);
 }
 window.MosePython={phonotactics,syllabifier};
})();
