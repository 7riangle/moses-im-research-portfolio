# src/common/viterbi.py
import math
from typing import List, Dict, Tuple, Any
NEG_INF = -1e9
def log(x: float) -> float:
    if x <= 0: return NEG_INF
    return math.log(x)
class ViterbiHMM:
    """Generic first-order HMM with Viterbi decoding."""
    def __init__(self,states,start_logprob,trans_logprob,emit_logprob):
        self.states=states
        self.start_logprob=start_logprob
        self.trans_logprob=trans_logprob
        self.emit_logprob=emit_logprob
    def viterbi(self,obs_seq):
        T=len(obs_seq);S=len(self.states)
        dp=[[NEG_INF]*T for _ in range(S)]
        backpointer=[[None]*T for _ in range(S)]
        for i,state in enumerate(self.states):
            emit=self.emit_logprob[state].get(obs_seq[0],NEG_INF)
            start=self.start_logprob.get(state,NEG_INF)
            dp[i][0]=start+emit
        for t in range(1,T):
            sym=obs_seq[t]
            for i,curr_state in enumerate(self.states):
                emit=self.emit_logprob[curr_state].get(sym,NEG_INF)
                best_score=NEG_INF
                best_prev=None
                for j,prev_state in enumerate(self.states):
                    trans=self.trans_logprob[prev_state].get(curr_state,NEG_INF)
                    score=dp[j][t-1]+trans+emit
                    if score>best_score:
                        best_score=score;best_prev=j
                dp[i][t]=best_score
                backpointer[i][t]=best_prev
        best_last_state=max(range(S),key=lambda i:dp[i][T-1])
        best_path_idx=[best_last_state]
        for t in range(T-1,0,-1):
            best_last_state=backpointer[best_last_state][t]
            best_path_idx.append(best_last_state)
        best_path_idx.reverse()
        best_path=[self.states[i] for i in best_path_idx]
        return best_path,dp
