//OELS Assignment 2: Do Scottish speakers perceive SVLR-driven vowel length as phonemic or allophonic?

// -----------------------------
// 0. Flags & jsPsych initialisation
// -----------------------------

// mobiles and tablets screening
var is_mobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)
  || (navigator.userAgentData && navigator.userAgentData.mobile === true)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// consent
var consent_given = false;

// Headphone check
var headphone_passed = false;

// Portfolio replay: keep participant responses inside this browser session only.
var jsPsych = initJsPsych({
  on_finish: function() {
    // Deliberately no PHP/CSV/network export of participant responses.
  }
});

// main timeline
var timeline = [];

// --------------------------------------
// 1. mobiles and tablets screening
// --------------------------------------

var mobile_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="max-width: 600px; margin: 80px auto; text-align: center;">
      <h3>This experiment is only available on desktop or laptop computers.</h3>
      <p>Please open this link on a computer with a keyboard and try again.</p>
    </div>
  `,
  choices: "NO_KEYS",
  trial_duration: 8000,
  on_finish: function() {
    jsPsych.endExperiment(`
      <div style="max-width: 600px; margin: 80px auto; text-align: center;">
        <h3>This experiment is only available on desktop or laptop computers.</h3>
        <p>Please close this window and try again on a desktop or laptop.</p>
      </div>
    `);
  }
};

// only mobile
var mobile_node = {
  timeline: [mobile_screen],
  conditional_function: function() {
    return is_mobile;
  }
};
timeline.push(mobile_node);

// --------------------------------------
// 2. Stimuli files and preload
// --------------------------------------

// continuum
// The seven-step vowel-duration continuum was the planned research design.
// For this portfolio demonstration we do NOT pretend that seven validated
// resynthesised duration steps were produced. We replay only the representative
// author-recorded placeholder tokens already used in the original practice.
const PLANNED_N_STEPS = 7;
const DEMO_STEP = 4;

// step no → file path mapping function
function carrierFile(step) {
  return 'audio/STIM_CARRIER_step' + step + '.wav';
}

function contextFile(step) {
  return 'audio/STIM_CONTEXT_step' + step + '.wav';
}

const STIM_CARRIER = carrierFile(DEMO_STEP);
const STIM_CONTEXT = contextFile(DEMO_STEP);

// beep sound for volume checking
const VOLUME_BEEP  = 'audio/beep.wav';

// Woods et al. (2017) headphone check stimuli
const HP_STIMS = [
  'audio/antiphase_HC_ISO.wav',
  'audio/antiphase_HC_IOS.wav',
  'audio/antiphase_HC_SOI.wav',
  'audio/antiphase_HC_SIO.wav',
  'audio/antiphase_HC_OSI.wav',
  'audio/antiphase_HC_OIS.wav'
];

// Retain the original preload-first design. Load every file actually used by
// the shortened demo (beep + six headphone-check stimuli + two sample tokens).
// Unused conceptual continuum steps are NOT requested or implied to exist.
const ALL_STIMS = [VOLUME_BEEP].concat(HP_STIMS, [STIM_CARRIER, STIM_CONTEXT]);

// Audio preloading stays before consent, as in the submitted jsPsych code.
var preload = {
  type: jsPsychPreload,
  audio: ALL_STIMS
};
timeline.push(preload);

// --------------------------------------
// 3. consent and basic explanation
// --------------------------------------

var consent = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="width: 100%; max-width: 700px; margin: auto; text-align: left; line-height: 1.6;">
      <h3 style="text-align: center;">Welcome to the Experiment</h3>
      
      <p>Thank you for participating in this study on <b>Scottish English vowel perception</b>.</p>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; margin: 20px 0;">
        <h4 style="margin-top: 0;">Participant Requirements</h4>
        <ul style="margin-bottom: 0;">
          <li>Please ensure you are in a <b>quiet environment</b>.</li>
          <li>You must use <b>headphones or earphones</b>.</li>
          <li>This shortened demo illustrates the experimental procedure using placeholder audio.</li>
          <li style="color: #d9534f; font-weight: bold; margin-top: 10px;">
            Please DO NOT use the browser's [Back] button.<br>
            (Doing so will reset the experiment.)
          </li>
        </ul>
      </div>

      <p style="font-size: 0.95rem; color: #555;">
        <b>Disclaimer:</b> This is a portfolio demonstration of my student project for <i>Online Experiments for Language Scientists</i>. 
        It is for educational purposes only and has not undergone full ethical review. 
        <b>No response data are saved or transmitted.</b> No financial remuneration is provided.
      </p>

      <p>Your participation is voluntary. You may stop the experiment at any time by simply closing your browser window.</p>
      
      <p style="text-align: center; margin-top: 30px;">
        If you agree to these terms, please click the button below to proceed.
      </p>
    </div>
  `,
  choices: ['Yes, I consent to participate', 'No, I do not consent'],
  on_finish: function(data) {
    // 0 = Yes, 1 = No
    consent_given = (Number(data.response) === 0);
  }
};
timeline.push(consent);

// messages for not consenting
var no_consent_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="text-align: center; margin-top: 100px;">
      <h3>You chose not to participate.</h3>
      <p>Thank you for your time.</p>
      <p>You may close this window or return to the portfolio.</p>
      <p style="margin-top: 28px;">
        <a href="../../../index.html#projects" class="jspsych-btn" style="display: inline-block; text-decoration: none; padding: 12px 22px;">Return to homepage</a>
      </p>
    </div>
  `,
  choices: "NO_KEYS"
};

// no consent node
var no_consent_node = {
  timeline: [no_consent_screen],
  conditional_function: function() {
    return !consent_given;
  }
};
timeline.push(no_consent_node);

// --------------------------------------
// 4. audio test
// --------------------------------------

const audio_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h3>Audio Test Preparation</h3>
    <p>A sound will play shortly to help you adjust the volume.</p>
    <p>When you are ready, please press the <b>[Start]</b> button.</p>
    <p>After pressing the button, a <b>3-second countdown</b> will appear, followed by the sound.</p>
  `,
  choices: ['Start']
};

const countdown_3 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size: 80px; font-weight: bold;">3</div>',
  choices: "NO_KEYS",
  trial_duration: 1000
};
const countdown_2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size: 80px; font-weight: bold;">2</div>',
  choices: "NO_KEYS",
  trial_duration: 1000
};
const countdown_1 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size: 80px; font-weight: bold;">1</div>',
  choices: "NO_KEYS",
  trial_duration: 1000
};

const volume_check = {
  type: jsPsychAudioButtonResponse,
  stimulus: VOLUME_BEEP,
  prompt: `
    <style>
      #jspsych-content {
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
      }
    </style>
    <div>
      <p>Please adjust the volume so that the sound is comfortable and clear.</p>
      <p>When you're ready, please press the button below.</p>
    </div>
  `,
  choices: ['The volume is appropriate'],
  response_allowed_while_playing: false
};

// --------------------------------------
// 5. Headphone screening (Woods et al. 2017)
// --------------------------------------

const hp_instructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="max-width: 700px; margin: 0 auto; text-align: left; line-height: 1.6;">
      <h3 style="text-align: center;">Headphone check</h3>

      <p>
        In this task, we want to make sure that you are using 
        <b>headphones</b> and that your audio setup is working properly.
      </p>

      <p>
        You will now hear <b>three tones</b> in each trial.
        Your task is to choose <b>which tone was the quietest</b>
        (1st, 2nd, or 3rd).
      </p>

      <p>
        This task is designed to work <b>only with headphones</b>, 
        because some of the differences are very hard to hear over speakers.
      </p>

      <p>
        There will be <b>six</b> trials in total.<br>
      </p>

      <p>
        To continue to the main experiment, you need to answer 
        at least <b>5 out of 6</b> trials correctly.
      </p>

      <p>
        This helps us include only data from participants who can 
        reliably hear the sounds over headphones.
      </p>

      <p style="text-align: center; margin-top: 20px;">
        When you are ready, click the button below to begin.
      </p>
    </div>
  `,
  choices: ['Start']
};

const hp_trials_vars = [
  { file: 'audio/antiphase_HC_ISO.wav', correct: 1 },
  { file: 'audio/antiphase_HC_IOS.wav', correct: 2 },
  { file: 'audio/antiphase_HC_SOI.wav', correct: 0 },
  { file: 'audio/antiphase_HC_SIO.wav', correct: 0 },
  { file: 'audio/antiphase_HC_OSI.wav', correct: 1 },
  { file: 'audio/antiphase_HC_OIS.wav', correct: 2 }
];

const hp_trial = {
  type: jsPsychAudioButtonResponse,
  stimulus: jsPsych.timelineVariable('file'),
  choices: ['1st tone', '2nd tone', '3rd tone'],
  prompt: `
    <style>
      #jspsych-content {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      #jspsych-audio-button-response-stimulus {
        order: 0;
      }
      #jspsych-audio-button-response-prompt {
        order: 1;
        margin-top: 15px;
      }
      #jspsych-audio-button-response-btngroup {
        order: 2;
        margin-top: 10px;
      }
    </style>
    <p>Which tone was the <b>quietest</b>?</p>
  `,
  response_allowed_while_playing: false,
  data: {
    task: 'headphone_check',
    correct_resp: jsPsych.timelineVariable('correct')
  },
  on_finish: function(data) {
    data.correct = (data.response === data.correct_resp);
  }
};

const hp_procedure = {
  timeline: [hp_trial],
  timeline_variables: hp_trials_vars,
  randomize_order: true
};

const hp_evaluate = {
  type: jsPsychCallFunction,
  func: function() {
    var hp_data = jsPsych.data.get().filter({ task: 'headphone_check' });
    var n_trials = hp_data.count();
    var n_correct = hp_data.filter({ correct: true }).count();

    // Original coursework screening criterion (Woods et al. headphone check).
    headphone_passed = (n_trials > 0) && (n_correct / n_trials >= 5/6);
  }
};

const hp_fail_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="text-align: center; max-width: 700px; margin: auto;">
      <h3>Headphone check not passed</h3>
      <p>
        Unfortunately, your performance on the headphone check suggests that you
        may not be using headphones or that your listening environment is too noisy.
      </p>
      <p>
        For this study, we can only include participants who pass the headphone check.
      </p>
      <p>You can return to the research portfolio at any time.</p>
      <p style="margin-top: 28px;">
        <a href="../../../index.html#projects" class="jspsych-btn" style="display: inline-block; text-decoration: none; padding: 12px 22px;">Return to homepage</a>
      </p>
    </div>
  `,
  choices: "NO_KEYS"
};

const hp_fail_node = {
  timeline: [hp_fail_screen],
  conditional_function: function() {
    return !headphone_passed;
  }
};

// ===================================================================
// 6. Practice block
// ===================================================================

const practice_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="max-width: 700px; margin: 0 auto; text-align: center; line-height: 1.6;">
      <h3>Practice block</h3>

      <p>
        Before the main demonstration, you will complete <b>two</b> practice trials.
      </p>

      <p>
        The first practice trial uses the same format as <b>Block 1</b>:
        the target word appears in a short carrier sentence of the form 
        <i>"Say [WORD] again."</i>
      </p>

      <p>
        The second practice trial uses the same format as <b>Block 2</b>:
        you will see the sentence 
        <i>"The witches ______ inside the castle."</i>
        and hear the target word in the blank.
      </p>

      <p>
        After each sentence, please decide which word you heard and respond
        by clicking the buttons or using the keyboard:
      </p>

      <div style="display: flex; justify-content: center; gap: 40px; margin: 10px 0 25px 0;">
        <div><b>F</b> = BROOD</div>
        <div><b>J</b> = BREWED</div>
      </div>

      <p>
        After you make your choice, you will also rate how confident you are 
        on a 1–7 scale.
      </p>

      <p>
        Try to respond as accurately and as quickly as you can, 
        but don’t worry if you make mistakes in this practice block.
      </p>

      <p style="color: blue; font-size: 0.9rem;">
        (If you normally type in another language, please make sure your keyboard 
        is set to <b>English</b> so that the <b>F</b> and <b>J</b> keys are recognised correctly.)
      </p>

      <p>
        When you are ready, click the button below to start the practice.
      </p>
    </div>
  `,
  choices: ['Start practice']
};

// fixation point
const fixation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size:48px;">+</div>',
  choices: "NO_KEYS",
  trial_duration: 500,
  data: { task: 'fixation' }
};

// select box layout
const CHOICE_BOXES = `
  <div style="display: flex; justify-content: center; gap: 50px; margin-top: 20px;">
    <div style="border: 2px solid #333; padding: 20px 40px; border-radius: 10px;">
      <strong>BROOD</strong><br>(Press F)
    </div>
    <div style="border: 2px solid #333; padding: 20px 40px; border-radius: 10px;">
      <strong>BREWED</strong><br>(Press J)
    </div>
  </div>
`;

// Attach F/J only while a BROOD/BREWED response screen is active.
// html-button-response 2.1.0 uses buttons with data-choice="0" / "1".
// Clicking the real plugin button preserves jsPsych's own RT measurement.
let choiceShortcutHandler = null;
function removeChoiceShortcuts() {
  if (choiceShortcutHandler) {
    document.removeEventListener('keydown', choiceShortcutHandler, true);
    choiceShortcutHandler = null;
  }
}
function installChoiceShortcuts() {
  removeChoiceShortcuts();
  choiceShortcutHandler = function(event) {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    const key = (event.key || '').toLowerCase();
    // event.code supports a physical F/J press even when a Korean input layout is active.
    const choice = (key === 'f' || event.code === 'KeyF') ? '0' :
                   (key === 'j' || event.code === 'KeyJ') ? '1' : null;
    if (choice === null) return;
    const group = document.getElementById('jspsych-html-button-response-btngroup');
    if (!group) return;
    const button = group.querySelector(`[data-choice="${choice}"]`)
      || group.querySelectorAll('button')[Number(choice)];
    if (!button || button.disabled) return;
    event.preventDefault();
    button.click();
  };
  document.addEventListener('keydown', choiceShortcutHandler, true);
}

// ----------------------
// carrier sentence for practice
// ----------------------
const audio_play_carrier = {
  type: jsPsychAudioKeyboardResponse,
  stimulus: jsPsych.timelineVariable('file'),
  prompt: `
    <div style="font-size: 24px; margin-bottom: 20px; font-weight: bold;">
      Say [TARGET] again.
    </div>
  `,
  choices: "NO_KEYS",
  trial_ends_after_audio: true
};

const response_carrier = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size: 24px; margin-bottom: 40px; font-weight: bold;">
      Say [TARGET] again.
    </div>
  `,
  choices: ['BROOD (F)', 'BREWED (J)'],
  data: {
    task: 'response',
    step: jsPsych.timelineVariable('step'),
    block_type: jsPsych.timelineVariable('block_name')
  },
  on_load: installChoiceShortcuts,
  on_finish: function(data) {
    removeChoiceShortcuts();
    // html-button-response: response = 0 (left), 1 (right)
    const chose_first = (data.response === 0);
    data.response_word = chose_first ? 'BROOD' : 'BREWED';
  }
};

// ----------------------
// context sentence for practice
// ----------------------
const audio_play_context = {
  type: jsPsychAudioKeyboardResponse,
  stimulus: jsPsych.timelineVariable('file'),
  prompt: `
    <div style="font-size: 24px; margin-bottom: 20px; font-weight: bold;">
      The witches ______ inside the castle.
    </div>
  `,
  choices: "NO_KEYS",
  trial_ends_after_audio: true
};

const response_context = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size: 24px; margin-bottom: 40px; font-weight: bold;">
      The witches ______ inside the castle.
    </div>
  `,
  choices: ['BROOD (F)', 'BREWED (J)'],
  data: {
    task: 'response',
    step: jsPsych.timelineVariable('step'),
    block_type: jsPsych.timelineVariable('block_name')
  },
  on_load: installChoiceShortcuts,
  on_finish: function(data) {
    removeChoiceShortcuts();
    const chose_first = (data.response === 0);
    data.response_word = chose_first ? 'BROOD' : 'BREWED';
  }
};

// confidence slider
const confidence = {
  type: jsPsychHtmlSliderResponse,
  stimulus: '<p>How confident are you about your choice?</p>',
  labels: ['Not confident at all', 'Very confident'],
  min: 1,
  max: 7,
  start: 4,
  step: 0.1,
  require_movement: true,
  data: { task: 'confidence' }
};

// practice trial variables
const practice_carrier_vars = [
  { step: DEMO_STEP, file: STIM_CARRIER, block_name: 'practice_carrier' }
];

const practice_context_vars = [
  { step: DEMO_STEP, file: STIM_CONTEXT, block_name: 'practice_context' }
];

const practice_carrier_procedure = {
  timeline: [fixation, audio_play_carrier, response_carrier, confidence],
  timeline_variables: practice_carrier_vars,
  randomize_order: false
};

const practice_context_procedure = {
  timeline: [fixation, audio_play_context, response_context, confidence],
  timeline_variables: practice_context_vars,
  randomize_order: false
};

// ===================================================================
// 7. Main Experiment
// ===================================================================

const main_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="max-width: 700px; margin: 0 auto; text-align: center; line-height: 1.6;">
      <h3>Main experiment</h3>

      <p>
        The main experiment consists of <b>two blocks</b>, with the same formats you saw
        in the practice trials.
      </p>

      <p>
        In <b>Block 1</b>, the target word is embedded in a short carrier sentence of the form
        <i>"Say [WORD] again."</i>
      </p>

      <p>
        In <b>Block 2</b>, you will see the sentence
        <i>"The witches ______ inside the castle."</i>
        and the blank will be filled by a word that sounds like <b>BROOD</b> or <b>BREWED</b>.
      </p>

      <p>
        Across the two blocks, you will complete <b>4 trials in total</b>
        (2 trials in Block 1 and 2 trials in Block 2).
        This short demonstration uses representative placeholder audio rather
        than a completed seven-step vowel-duration continuum.
      </p>

      <p>
        After each sentence, decide which word you heard and respond using the keyboard:
      </p>

      <p><b>F</b> = BROOD &nbsp;&nbsp;&nbsp; <b>J</b> = BREWED</p>

      <p>
        As in the practice block, you will <b>not</b> receive feedback after your responses.
        Please listen carefully and respond as accurately and as quickly as you can.
      </p>

      <p>
        When you are ready to begin the main experiment, click the button below.
      </p>
    </div>
  `,
  choices: ['Start']
};

// Block 1
const block1_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="max-width: 700px; margin: 0 auto; text-align: center; line-height: 1.6;">
      <h3>Block 1</h3>
      <p>
        In this block, the target word will be presented inside a short carrier sentence
        of the form <i>"Say [WORD] again."</i>
      </p>
      <p>
        The word in the middle of the sentence will always be either <b>BROOD</b> or <b>BREWED</b>.
        After each sentence, decide which word you heard and respond using the keyboard:
      </p>
      <p><b>F</b> = BROOD &nbsp;&nbsp;&nbsp; <b>J</b> = BREWED</p>
      <p>
        This demonstration block contains <b>2 trials</b>. You will not receive feedback, 
        so please listen carefully and respond as accurately and as quickly as you can.
      </p>
    </div>
  `,
  choices: ['Start Block 1']
};

// Portfolio demonstration: repeat one representative placeholder token twice
// in each context. No real duration-continuum sampling is claimed.
const DEMO_REPS_PER_CONTEXT = 2;
const N_TRIALS_BLOCK = DEMO_REPS_PER_CONTEXT;
let block1_vars = Array.from({ length: DEMO_REPS_PER_CONTEXT }, () => ({
  step: DEMO_STEP, file: STIM_CARRIER, block_name: 'block1_carrier'
}));

const block1_procedure = {
  timeline: [fixation, audio_play_carrier, response_carrier, confidence],
  timeline_variables: block1_vars,
  randomize_order: true
};


// Block 2
const block2_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="max-width: 700px; margin: 0 auto; text-align: center; line-height: 1.6;">
      <h3>Block 2</h3>
      <p>
        In this block, you will see a sentence on the screen:
        <i>"The witches ______ inside the castle."</i>
      </p>
      <p>
        The blank will be filled by a word that sounds like <b>BROOD</b> or <b>BREWED</b>.
        After each sentence, decide which word you heard and respond using the keyboard:
      </p>
      <p><b>F</b> = BROOD &nbsp;&nbsp;&nbsp; <b>J</b> = BREWED</p>
      <p>
        This demonstration block contains <b>2 trials</b>. Please listen carefully and
        respond as accurately and as quickly as you can.
      </p>
    </div>
  `,
  choices: ['Start Block 2']
};

// Block 2 uses the same placeholder stimulus repeated twice.
let block2_vars = Array.from({ length: DEMO_REPS_PER_CONTEXT }, () => ({
  step: DEMO_STEP, file: STIM_CONTEXT, block_name: 'block2_context'
}));

const block2_procedure = {
  timeline: [fixation, audio_play_context, response_context, confidence],
  timeline_variables: block2_vars,
  randomize_order: true
};


// ===================================================================
// 8. End of the experiment
// ===================================================================

const debrief = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="max-width: 700px; margin: 80px auto; text-align: center; line-height: 1.6;">
      <h3>End of experiment</h3>
      <p>Thank you very much for taking part in this demonstration.</p>
      <p>Your responses have not been saved or transmitted.</p>
      <p style="margin-top: 28px;">
        <a href="../../../index.html#projects" class="jspsych-btn" style="display: inline-block; text-decoration: none; padding: 12px 22px;">Return to homepage</a>
      </p>
    </div>
  `,
  choices: "NO_KEYS"
};

// ===================================================================
// 9. Main Experiment Timeline (when consent)
// ===================================================================

const main_task_node = {
  timeline: [
    practice_intro,
    practice_carrier_procedure,
    practice_context_procedure,
    main_intro,
    block1_intro,
    block1_procedure,
    block2_intro,
    block2_procedure,
    debrief
  ],
  conditional_function: function() {
    return headphone_passed;
  }
};

// Original order after the preload and consent: volume introduction,
// countdown, volume check, headphone screening, practice, and two blocks.
const main_experiment = {
  timeline: [
    audio_intro,
    countdown_3,
    countdown_2,
    countdown_1,
    volume_check,
    hp_instructions,
    hp_procedure,
    hp_evaluate,
    hp_fail_node,
    main_task_node
  ],
  conditional_function: function() {
    return consent_given;
  }
};

timeline.push(main_experiment);

jsPsych.run(timeline);