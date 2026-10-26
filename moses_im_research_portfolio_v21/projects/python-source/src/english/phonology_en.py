# src/english/phonology_en.py
CONSONANTS = {'P','T','K','B','D','G','S','Z','F','V','TH','DH','SH','ZH','CH','JH','M','N','NG','L','R','Y','W','HH'}
VOWELS = {'AA','AE','AH','AO','AW','AY','EH','ER','EY','IH','IY','OW','OY','UH','UW'}
def is_vowel(phone: str) -> bool: return phone in VOWELS
def is_consonant(phone: str) -> bool: return phone in CONSONANTS
