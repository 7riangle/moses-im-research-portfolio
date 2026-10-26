"""Hangul decomposition utilities — from viterbi-syllabifier source."""
from typing import List, Tuple
HANGUL_BASE=0xAC00
CHOSUNG_BASE=0x1100
JUNGSUNG_BASE=0x1161
NUM_CHOSUNG=19
NUM_JUNGSUNG=21
NUM_JONGSUNG=28
CHOSUNG_LIST=['ᄀ','ᄁ','ᄂ','ᄃ','ᄄ','ᄅ','ᄆ','ᄇ','ᄈ','ᄉ','ᄊ','ᄋ','ᄌ','ᄍ','ᄎ','ᄏ','ᄐ','ᄑ','ᄒ']
JUNGSUNG_LIST=['ᅡ','ᅢ','ᅣ','ᅤ','ᅥ','ᅦ','ᅧ','ᅨ','ᅩ','ᅪ','ᅫ','ᅬ','ᅭ','ᅮ','ᅯ','ᅰ','ᅱ','ᅲ','ᅳ','ᅴ','ᅵ']
JONGSUNG_LIST=['','ᆨ','ᆩ','ᆪ','ᆫ','ᆬ','ᆭ','ᆮ','ᆯ','ᆰ','ᆱ','ᆲ','ᆳ','ᆴ','ᆵ','ᆶ','ᆷ','ᆸ','ᆹ','ᆺ','ᆻ','ᆼ','ᆽ','ᆾ','ᆿ','ᇀ','ᇁ','ᇂ']
def decompose_syllable(syll:str)->Tuple[str,str,str]:
    code=ord(syll)
    if not(0xAC00 <= code <= 0xD7A3): raise ValueError(f'Not a precomposed Hangul syllable: {syll}')
    s_index=code-HANGUL_BASE
    jong_index=s_index%NUM_JONGSUNG
    jung_index=((s_index-jong_index)//NUM_JONGSUNG)%NUM_JUNGSUNG
    cho_index=((s_index-jong_index)//NUM_JONGSUNG)//NUM_JUNGSUNG
    return CHOSUNG_LIST[cho_index],JUNGSUNG_LIST[jung_index],JONGSUNG_LIST[jong_index]
def decompose_word(word:str)->List[str]:
    seq=[]
    for ch in word:
        try:
            cho,jung,jong=decompose_syllable(ch)
            seq.extend([cho,jung])
            if jong:seq.append(jong)
        except ValueError:seq.append(ch)
    return seq
