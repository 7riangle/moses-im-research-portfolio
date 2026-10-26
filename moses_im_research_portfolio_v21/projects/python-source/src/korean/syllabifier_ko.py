"""Toy Korean ONC syllabifier using jamo and a tiny HMM."""
from typing import List, Dict
from src.common.viterbi import ViterbiHMM, log
from .hangul_utils import decompose_word
STATES=['O','N','C']
def _is_vowel_jamo(j:str)->bool: return 0x1160<=ord(j)<=0x11A7
def _is_consonant_jamo(j:str)->bool:
    code=ord(j)
    return (0x1100<=code<=0x115F) or (0x11A8<=code<=0x11FF)
def build_korean_hmm(jamo_inventory:List[str])->ViterbiHMM:
    start_logprob={'O':log(.9),'N':log(.1),'C':log(.0)}
    trans_logprob={
        'O':{'N':log(.9),'O':log(.05),'C':log(.05)},
        'N':{'C':log(.7),'O':log(.3),'N':log(.0)},
        'C':{'O':log(.9),'C':log(.05),'N':log(.05)},
    }
    emit_logprob={s:{} for s in STATES}
    for j in jamo_inventory:
        if _is_vowel_jamo(j):
            emit_logprob['N'][j]=log(.95);emit_logprob['O'][j]=log(.05);emit_logprob['C'][j]=log(.05)
        elif _is_consonant_jamo(j):
            emit_logprob['O'][j]=log(.8);emit_logprob['C'][j]=log(.8);emit_logprob['N'][j]=log(.05)
        else:
            emit_logprob['O'][j]=log(.01);emit_logprob['N'][j]=log(.01);emit_logprob['C'][j]=log(.01)
    return ViterbiHMM(STATES,start_logprob,trans_logprob,emit_logprob)
def syllabify_korean_word(word:str,hmm:ViterbiHMM)->List[str]:
    jamo_seq=decompose_word(word)
    best_states,_=hmm.viterbi(jamo_seq)
    return best_states
