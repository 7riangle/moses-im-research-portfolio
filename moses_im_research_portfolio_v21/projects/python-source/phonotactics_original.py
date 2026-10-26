# Source: https://github.com/7riangle/English-Phonotactics-Project/blob/main/Phonotactics.py
# English Phonotactics Generator with Sonority Sequencing Principles (SSP).
# Onset: rising sonority towards the vowel
# Coda: falling sonority away from the vowel
import random
consonants = ['p', 't', 'k', 'tʃ', 'b', 'd', 'g', 'dʒ', 'f', 'θ', 's', 'ʃ', 'h' ,'v', 'ð', 'z', 'ʒ', 'm', 'n', 'ŋ', 'l', 'r', 'hw', 'x', 'j', 'w']
vowels = ['a', 'eܼܼܼܼܼɪ', 'eə', 'ɑː', 'e', 'iː', 'ɪ', 'aɪ', 'ɪə', 'ɒ', 'əʊ', 'ɔː', 'ɔɪ', 'ʊ', 'uː', 'ʌ', 'aʊ', 'ɜː', 'ʊə', 'ə']
onset_consonants = [c for c in consonants if c !='ŋ']
stops_affricates = {'p', 't', 'k', 'b', 'd', 'g', 'tʃ', 'dʒ'}
fricatives = {'f', 'θ', 's', 'ʃ', 'h', 'v', 'ð', 'z', 'ʒ', 'x', 'hw'}
nasals = {'m', 'n', 'ŋ'}
liquids = {'l', 'r'}
glides = {'j', 'w'}
sonority = {}
for c in stops_affricates: sonority[c] = 1
for c in fricatives: sonority[c] = 2
for c in nasals: sonority[c] = 3
for c in liquids: sonority[c] = 4
for c in glides: sonority[c] = 5

def rising_sonority(cluster):
    return all(sonority[cluster[i]] < sonority[cluster[i + 1]] for i in range(len(cluster) - 1))

def falling_sonority(cluster):
    return all(sonority[cluster[i]] > sonority[cluster[i + 1]] for i in range(len(cluster) - 1))

def build_onset(max_len=3, allow_empty=True):
    max_len=max(0,max_len); min_len=0 if allow_empty else 1
    if max_len == 0: return []
    target_len=random.randint(min_len,max_len)
    if target_len == 0: return []
    cluster=[random.choice(onset_consonants)]
    while len(cluster)<target_len:
        prev=cluster[-1]; prev_s=sonority[prev]
        candidates=[c for c in onset_consonants if sonority[c]>prev_s]
        if not candidates: break
        if random.random()<.4: break
        cluster.append(random.choice(candidates))
    return cluster

def build_coda(max_len=2, allow_empty=True):
    max_len=max(0,max_len); min_len=0 if allow_empty else 1
    if max_len == 0: return []
    target_len=random.randint(min_len,max_len)
    if target_len == 0: return []
    cluster=[random.choice(consonants)]
    while len(cluster)<target_len:
        prev=cluster[-1]; prev_s=sonority[prev]
        candidates=[c for c in consonants if sonority[c]<prev_s]
        if not candidates: break
        if random.random()<.4: break
        cluster.append(random.choice(candidates))
    return cluster

def phonotactics_sequence_with_constraints(return_parts=False):
    onset=build_onset(max_len=3,allow_empty=True)
    nucleus=[random.choice(vowels)]
    coda=build_coda(max_len=2,allow_empty=True)
    if return_parts: return onset,nucleus,coda
    return ''.join(onset+nucleus+coda)

def is_ssp_well_formed(onset,coda):
    return rising_sonority(onset) and falling_sonority(coda)

if __name__=='__main__':
    for _ in range(10): print(phonotactics_sequence_with_constraints())
