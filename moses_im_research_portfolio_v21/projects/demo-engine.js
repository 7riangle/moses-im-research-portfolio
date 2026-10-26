// Faithful browser ports of the algorithms at:
// https://github.com/7riangle/English-Phonotactics-Project
// https://github.com/7riangle/viterbi-syllabifier
// Original Python runner is also available using Pyodide from the advanced control.
(function(){
'use strict';
const cons=['p','t','k','tʃ','b','d','g','dʒ','f','θ','s','ʃ','h','v','ð','z','ʒ','m','n','ŋ','l','r','hw','x','j','w'];
const vowels=['a','eܼܼܼܼܼɪ','eə','ɑː','e','iː','ɪ','aɪ','ɪə','ɒ','əʊ','ɔː','ɔɪ','ʊ','uː','ʌ','aʊ','ɜː','ʊə','ə'];
const sonority={};
for(const c of ['p','t','k','b','d','g','tʃ','dʒ'])sonority[c]=1;
for(const c of ['f','θ','s','ʃ','h','v','ð','z','ʒ','x','hw'])sonority[c]=2;
for(const c of ['m','n','ŋ'])sonority[c]=3;
for(const c of ['l','r'])sonority[c]=4;
for(const c of ['j','w'])sonority[c]=5;
const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
const randint=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
function cluster(kind){
  let target=randint(0,kind==='onset'?3:2);
  if(!target)return [];
  let pool=kind==='onset'?cons.filter(c=>c!=='ŋ'):cons;
  let result=[pick(pool)];
  while(result.length<target){
    let cur=sonority[result[result.length-1]];
    let candidates=pool.filter(c=>kind==='onset'?sonority[c]>cur:sonority[c]<cur);
    if(!candidates.length)break;
    if(Math.random()<.4)break;
    result.push(pick(candidates));
  }
  return result;
}
function generate(count){
 const results=[];
 for(let i=0;i<count;i++){
   const onset=cluster('onset'),nucleus=[pick(vowels)],coda=cluster('coda');
   results.push({onset,nucleus,coda,word:[...onset,...nucleus,...coda].join('')});
 }
 return results;
}
const enCons=new Set('P T K B D G S Z F V TH DH SH ZH CH JH M N NG L R Y W HH'.split(' '));
const enVowels=new Set('AA AE AH AO AW AY EH ER EY IH IY OW OY UH UW'.split(' '));
const states=['O','N','C'];
const NI=-1e9;
const lg=x=>x<=0?NI:Math.log(x);
function englishHMM(input){
  let start={O:lg(.8),N:lg(.2),C:lg(0)};
  let trans={O:{O:lg(.4),N:lg(.5),C:lg(.1)},N:{C:lg(.7),O:lg(.3),N:lg(0)},C:{C:lg(.4),O:lg(.6),N:lg(0)}};
  let emit={O:{},N:{},C:{}};
  for(const ph of input){
    if(enVowels.has(ph)){emit.N[ph]=lg(.95);emit.O[ph]=lg(.05);emit.C[ph]=lg(.05)}
    else if(enCons.has(ph)){emit.O[ph]=lg(.8);emit.C[ph]=lg(.8);emit.N[ph]=lg(.05)}
    else {emit.O[ph]=lg(.01);emit.N[ph]=lg(.01);emit.C[ph]=lg(.01)}
  }
  return {start,trans,emit};
}
function decompose(word){
 const parts=[];
 for(const ch of word){
   let c=ch.codePointAt(0);
   if(c<0xAC00||c>0xD7A3){parts.push(ch);continue}
   let x=c-0xAC00;
   let jong=x%28;
   let jung=Math.floor(x/28)%21;
   let cho=Math.floor(x/(28*21));
   parts.push(String.fromCodePoint(0x1100+cho));
   parts.push(String.fromCodePoint(0x1161+jung));
   if(jong)parts.push(String.fromCodePoint(0x11A7+jong));
 }
 return parts;
}
function koreanHMM(input){
 let start={O:lg(.9),N:lg(.1),C:lg(0)};
 let trans={O:{N:lg(.9),O:lg(.05),C:lg(.05)},N:{C:lg(.7),O:lg(.3),N:lg(0)},C:{O:lg(.9),C:lg(.05),N:lg(.05)}};
 let emit={O:{},N:{},C:{}};
 for(const j of input){
    let cp=j.codePointAt(0);
    if(cp>=0x1160&&cp<=0x11A7){emit.N[j]=lg(.95);emit.O[j]=lg(.05);emit.C[j]=lg(.05)}
    else if((cp>=0x1100&&cp<=0x115F)||(cp>=0x11A8&&cp<=0x11FF)){emit.O[j]=lg(.8);emit.C[j]=lg(.8);emit.N[j]=lg(.05)}
    else {emit.O[j]=lg(.01);emit.N[j]=lg(.01);emit.C[j]=lg(.01)}
 }
 return {start,trans,emit};
}
function viterbi(input,{start,trans,emit}){
  if(!input.length)throw new Error('Please enter at least one symbol.');
  const T=input.length;
  const dp=states.map(()=>Array(T).fill(NI));
  const back=states.map(()=>Array(T).fill(null));
  for(let i=0;i<3;i++) dp[i][0]=(start[states[i]]??NI)+(emit[states[i]][input[0]]??NI);
  for(let t=1;t<T;t++){
    for(let i=0;i<3;i++){
      const current=states[i];const e=emit[current][input[t]]??NI;
      let best=NI;let prevIdx=null;
      for(let j=0;j<3;j++){
        const prev=states[j];
        const score=dp[j][t-1]+(trans[prev][current]??NI)+e;
        if(score>best){best=score;prevIdx=j;}
      }
      dp[i][t]=best;back[i][t]=prevIdx;
    }
  }
  let bestLast=0;
  for(let i=1;i<3;i++)if(dp[i][T-1]>dp[bestLast][T-1])bestLast=i;
  let idx=[bestLast];
  for(let t=T-1;t>0;t--){bestLast=back[bestLast][t];idx.push(bestLast)}
  idx.reverse();
  return {phones:input,path:idx.map(i=>states[i]),dp,states};
}
function decode(language,text){
  if(language==='en'){
    const phones=text.trim().toUpperCase().split(/[\s,]+/).filter(Boolean);
    if(!phones.length||phones.length>20)throw Error('Enter between 1 and 20 space-separated ARPAbet-style phones.');
    if(phones.some(x=>!/^[A-Z]+$/.test(x)))throw Error('English input should contain space-separated phones such as S T R AE N D.');
    return viterbi(phones,englishHMM(phones));
  }
  const word=text.trim().normalize('NFC');
  if(!word||[...word].length>12)throw Error('Enter a Korean word of up to 12 syllables.');
  if(!/^[가-힣]+$/.test(word))throw Error('Enter precomposed Korean Hangul syllables, such as 한국말.');
  const jamo=decompose(word);
  return viterbi(jamo,koreanHMM(jamo));
}
function renderStates(container,result){
  container.replaceChildren();
  result.phones.forEach((phone,i)=>{
    const d=document.createElement('div');d.className='state '+({O:'onset',N:'nucleus',C:'coda'}[result.path[i]]);
    const b=document.createElement('b');b.textContent=phone;
    const s=document.createElement('span');s.textContent=result.path[i];
    d.append(b,s);container.appendChild(d);
  });
}
function renderLattice(container,result){
  container.replaceChildren();
  const n=result.phones.length;const grid=document.createElement('div');grid.className='lattice';
  grid.style.gridTemplateColumns=`repeat(${n+1}, minmax(58px,auto))`;
  const all=result.dp.flat().filter(v=>v>-1e8);const max=Math.max(...all);const min=Math.min(...all);
  const cell=(txt,cl='',style='')=>{
   const c=document.createElement('div');c.className='cell '+cl;c.textContent=txt;if(style)c.style.backgroundColor=style;grid.appendChild(c);return c;
  };
  cell('State','head');result.phones.forEach(x=>cell(x,'head'));
  for(let j=0;j<3;j++){
    cell(result.states[j],'head');
    for(let i=0;i<n;i++){
      const v=result.dp[j][i];const chosen=result.path[i]===result.states[j];
      const nonfinite=v< -1e8;
      const alpha=nonfinite?.05:(.09+.42*(v-min)/Math.max(0.0001,max-min));
      const txt=nonfinite?'−∞':v.toFixed(2);
      cell(txt,chosen?'path':'',`rgba(61,95,135,${alpha})`);
    }
  }
  container.appendChild(grid);
}
window.MoseDemo={generate,decode,renderStates,renderLattice,decompose};
})();
