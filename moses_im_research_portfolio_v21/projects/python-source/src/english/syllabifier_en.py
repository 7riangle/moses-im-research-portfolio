# src/english/syllabifier_en.py
from typing import List, Dict
from src.common.viterbi import ViterbiHMM, log
from .phonology_en import is_vowel, is_consonant
STATES=['O','N','C']
def build_english_onc_hmm(phoneme_inventory:List[str])->ViterbiHMM:
    start_logprob={'O':log(.8),'N':log(.2),'C':log(.0)}
    trans_logprob={
        'O':{'O':log(.4),'N':log(.5),'C':log(.1)},
        'N':{'C':log(.7),'O':log(.3),'N':log(.0)},
        'C':{'C':log(.4),'O':log(.6),'N':log(.0)},
    }
    emit_logprob={s:{} for s in STATES}
    for ph in phoneme_inventory:
        if is_vowel(ph):
            emit_logprob['N'][ph]=log(.95);emit_logprob['O'][ph]=log(.05);emit_logprob['C'][ph]=log(.05)
        elif is_consonant(ph):
            emit_logprob['O'][ph]=log(.8);emit_logprob['C'][ph]=log(.8);emit_logprob['N'][ph]=log(.05)
        else:
            emit_logprob['O'][ph]=log(.01);emit_logprob['N'][ph]=log(.01);emit_logprob['C'][ph]=log(.01)
    return ViterbiHMM(STATES,start_logprob,trans_logprob,emit_logprob)
def syllabify_phones(phones:List[str],hmm:ViterbiHMM)->List[str]:
    states,_=hmm.viterbi(phones)
    return states
