<template>
  <div class="console">
    <div v-for="(message, index) in messages" :key="index">
      {{ message }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, reactive } from "vue"

const colors = {
  number: "var(--console-color-magenta)", // "#9980ff"
  string: "var(--console-color-green)",
  propName: "var(--console-color-blue)"
}

// eslint-disable-next-line no-use-before-define
const log: MessageEventConsole = {
  type: "console.log",
  args: '["[sandbox::shape]: draw context on sandbox"]'
}
// eslint-disable-next-line no-use-before-define
const error: MessageEventError = {
  type: "error",
  col: 14,
  line: 22,
  filename:
    "blob:https://9000-tachibanash-fcanvasedit-zv6vx7lxtdu.ws-us59.gitpod.io/f293e923-5a37-462e-891b-f9d79f65d243",
  message: "Uncaught SyntaxError: missing ) after argument list",
  error: {
    message: "missing ) after argument list",
    stack: "SyntaxError: missing ) after argument list"
  }
}

interface MessageEventConsole {
  type: `console.${string}`
  args: unknown
}
interface MessageEventError {
  type: "error"
  col: number
  line: number
  filename: string
  message: string
  error: {
    message: string
    stack: string
  }
}
const messages = reactive<(MessageEventConsole | MessageEventError)[]>([])
messages.push(log, error)
function handlerTransportConsole({
  data
}: MessageEvent<MessageEventConsole | MessageEventError>) {
  if (!data || !data.type) return

  if (data.type === "error") {
    // nani?
    console.log(data)
    messages.push(data)
  } else if (data.type.startsWith("console.")) {
    console.log(data)
    messages.push(data)
  }
}
window.addEventListener("message", handlerTransportConsole)
onBeforeUnmount(() =>
  window.removeEventListener("message", handlerTransportConsole)
)
</script>

<style lang="scss" scoped>
.console.light {
  display: flex;
  border-top: 1px solid var(--override-message-border-color);
  border-bottom: 1px solid transparent;

  /* Console ANSI color */
  --console-color-black: #000;
  --console-color-red: #a00;
  --console-color-green: #0a0;
  --console-color-yellow: #a50;
  --console-color-blue: #00a;
  --console-color-magenta: #a0a;
  --console-color-cyan: #0aa;
  --console-color-gray: #aaa;
  --console-color-darkgray: #555;
  --console-color-lightred: #f55;
  --console-color-lightgreen: #5f5;
  --console-color-lightyellow: #ff5;
  --console-color-lightblue: #55f;
  --console-color-ightmagenta: #f5f;
  --console-color-lightcyan: #5ff;
  --console-color-white: #fff;
}

.console {
  /* Dark theme console ANSI color */
  --console-color-red: rgb(237 78 76);
  --console-color-green: rgb(1 200 1);
  --console-color-yellow: rgb(210 192 87);
  --console-color-blue: rgb(39 116 240);
  --console-color-magenta: rgb(161 66 244);
  --console-color-cyan: rgb(18 181 203);
  --console-color-gray: rgb(207 208 208);
  --console-color-darkgray: rgb(137 137 137);
  --console-color-lightred: rgb(242 139 130);
  --console-color-lightgreen: rgb(161 247 181);
  --console-color-lightyellow: rgb(221 251 85);
  --console-color-lightblue: rgb(102 157 246);
  --console-color-lightmagenta: rgb(214 112 214);
  --console-color-lightcyan: rgb(132 240 255);
}
</style>

<style lang="scss" scoped>
.console {
  font-size: 14px;

  &-log {
    border-top: 1px solid transparent;
    border-bottom: 1px solid #3d3d3d;
    margin-top: -1px;
    min-height: 24px;
    color: #a5a5a5;

    .counter {
      background-color: #42597f;
      padding: 2px 4px;
      color: #000;
      border-radius: 10px;
      font-size: 12px;
      float: left;
      margin: 2px -6px 0 10px;
    }
  }
  &-warn {
    color: #ffcb6b;
    background-color: #332a00;
    border {
      top: 1px solid #650;
      bottom: 1px solid #650;
    }

    .counter {
      background-color: #e8a400;
    }
  }
  &-error {
    background-color: #290000;
    color: #ff8080;
    border-top: 1px solid #5c0000;
    border-bottom: 1px solid #5c0000;

    .counter {
      background-color: rgb(255 128 128);
    }
  }
}
</style>

<style lang="scss" scoped>
.console-view {
  background-color: var(--color-background);
  overflow: hidden;

  --override-error-text-color: var(--color-error-text);
  --override-console-error-background-color: var(--color-error-background);
  --override-error-border-color: var(--color-error-border);
  --override-message-border-color: rgb(240 240 240);
  --override-warning-border-color: hsl(50deg 100% 88%);
  --override-focused-message-border-color: hsl(214deg 67% 88%);
  --override-focused-message-background-color: hsl(214deg 48% 95%);
  --override-console-warning-background-color: hsl(50deg 100% 95%);
  --override-console-warning-text-color: hsl(39deg 100% 18%);
}

.-theme-with-dark-background .console-view {
  --override-message-border-color: rgb(58 58 58);
  --override-warning-border-color: rgb(102 85 0);
  --override-focused-message-border-color: hsl(214deg 47% 48%);
  --override-focused-message-background-color: hsl(214deg 19% 20%);
  --override-console-warning-background-color: hsl(50deg 100% 10%);
  --override-console-warning-text-color: hsl(39deg 89% 55%);
  --override-console-link-color: var(--color-background-inverted);
}

.-theme-with-dark-background .object-state-note {
  background-color: hsl(230deg 100% 80%);
}

.-theme-with-dark-background .console-pins,
:host-context(.-theme-with-dark-background) .console-pins {
  --override-error-background-color: rgb(41 0 0);
  --override-error-border-color: rgb(92 0 0);
  --override-error-text-color: rgb(255 128 128);
}

:root {
  --color-primary: rgb(26 115 232);
  --color-primary-variant: rgb(66 133 244);
  --color-background: rgb(255 255 255);
  --color-background-inverted: rgb(0 0 0);
  --color-background-inverted-opacity-2: rgb(0 0 0 / 2%);
  --color-background-inverted-opacity-30: rgb(0 0 0 / 30%);
  --color-background-inverted-opacity-50: rgb(0 0 0 / 50%);
  --color-background-opacity-50: rgb(255 255 255 / 50%);
  --color-background-opacity-80: rgb(255 255 255 / 80%);
  --color-background-elevation-0: rgb(248 249 249);
  --color-background-elevation-1: rgb(241 243 244);
  --color-background-elevation-2: rgb(222 225 230);
  /** Used when the elevation is visible only on dark theme */
  --color-background-elevation-dark-only: var(--color-background);
  --color-background-highlight: rgb(218 220 224);
  /** To draw grid lines behind elements */
  --divider-line: rgb(0 0 0 / 10%);
  --color-background-hover-overlay: rgb(56 121 217 / 10%);
  /**
   * Used when selecting a range of a section, for example when
   * selecting a range in the performance panel timeline.
   */
  --color-selection-highlight: rgb(56 121 217 / 30%);
  --color-selection-highlight-border: rgb(16 81 177);
  /**
   * When showing matching elements of a particular search filter (for example
   * when showing all matching css selectors/rules in the elements style
   * pane). The highlight is intended to be used on top of the original background
   * color and text color.
   */
  --color-match-highlight: rgb(56 121 217 / 20%);
  --color-text-primary: rgb(32 33 36);
  --color-text-secondary: rgb(95 99 104);
  --color-text-secondary-selected: rgb(188 185 182);
  --color-text-disabled: rgb(128 134 139);
  --color-details-hairline: rgb(202 205 209);
  --color-details-hairline-light: rgb(223 225 227);
  --color-accent-red: rgb(217 48 37);
  --color-red: rgb(238 68 47);
  --color-accent-green: rgb(24 128 56);
  --color-accent-green-background: rgb(24 128 56 / 10%);
  --color-green: rgb(99 172 190);
  --color-link: var(--color-primary);
  --color-syntax-1: rgb(200 0 0);
  --color-syntax-2: rgb(136 18 128);
  --color-syntax-3: rgb(26 26 166);
  --color-syntax-4: rgb(153 69 0);
  --color-syntax-5: rgb(132 240 255);
  --color-syntax-6: rgb(35 110 37);
  --color-syntax-7: rgb(48 57 66);
  --color-syntax-8: rgb(168 148 166);
  --drop-shadow: 0 0 0 1px rgb(0 0 0 / 5%), 0 2px 4px rgb(0 0 0 / 20%),
    0 2px 6px rgb(0 0 0 / 10%);
  --drop-shadow-depth-1: 0 1px 2px rgb(60 64 67 / 30%),
    0 1px 3px 1px rgb(60 64 67 / 15%);
  --drop-shadow-depth-2: 0 1px 2px rgb(60 64 67 / 30%),
    0 2px 6px 2px rgb(60 64 67 / 15%);
  --drop-shadow-depth-3: 0 4px 8px 3px rgb(60 64 67 / 15%),
    0 1px 3px rgb(60 64 67 / 30%);
  --drop-shadow-depth-4: 0 6px 10px 4px rgb(60 64 67 / 15%),
    0 2px 3px rgb(60 64 67 / 30%);
  --drop-shadow-depth-5: 0 8px 12px 6px rgb(60 64 67 / 15%),
    0 4px 4px rgb(60 64 67 / 30%);
  --box-shadow-outline-color: rgb(0 0 0 / 50%);
  /** These are the colors of the native Mac scrollbars */
  --color-scrollbar-mac: rgb(143 143 143 / 60%);
  --color-scrollbar-mac-hover: rgb(64 64 64 / 60%);
  /** These colors are used on all non-Mac platforms for scrollbars */
  --color-scrollbar-other: rgb(0 0 0 / 50%);
  --color-scrollbar-other-hover: rgb(0 0 0 / 50%);
  /** These colors have the same value in dark mode */
  --lighthouse-red: rgb(255 78 67);
  --lighthouse-orange: rgb(255 164 0);
  --lighthouse-green: rgb(12 206 106);
  /** The colors are for issue icons and related highlights */
  --issue-color-red: rgb(235 57 65);
  --issue-color-yellow: rgb(242 153 0);
  --issue-color-blue: rgb(26 115 232);
  /** Used to indicate an input box */
  --input-outline: rgb(202 205 209);

  /** These colors are used to show errors */
  --color-error-text: #f00;
  --color-error-border: hsl(0deg 100% 92%);
  --color-error-background: hsl(0deg 100% 97%);
  --color-checkbox-accent-color: var(--color-primary);
  --color-image-preview-background: rgb(255 255 255);

  /* Colors for styling inputs */
  --color-input-outline: rgb(218 220 224);
  --color-input-outline-active: rgb(26 115 232);
  --color-input-outline-error: rgb(217 48 37);
  --color-input-outline-disabled: rgba(128 134 139 / 20%);
  --color-input-text-disabled: rgba(128 134 139 / 50%);

  /* Colors for styling buttons */
  --color-button-outline-focus: rgb(26 115 232 / 50%);
  --color-button-primary-background-hovering: rgb(77 134 225 / 100%);
  --color-button-primary-background-pressed: rgb(88 132 205);
  --color-button-primary-text: rgb(255 255 255);
  --color-button-primary-text-hover: rgb(218 220 224);
  --color-button-secondary-background-hovering: rgb(26 115 232 / 10%);
  --color-button-secondary-background-pressed: rgb(26 92 178 / 25%);
  --color-button-secondary-border: rgb(218 220 224);
  --color-iconbutton-hover: rgb(0 0 0 / 10%);
  --color-iconbutton-pressed: rgb(0 0 0 / 15%);

  /* Colors for file icons */
  --color-ic-file-document: rgb(39 116 240);
  --color-ic-file-image: rgb(46 184 83);
  --color-ic-file-font: rgb(18 192 226);
  --color-ic-file-script: rgb(240 179 0);
  --color-ic-file-stylesheet: rgb(174 82 255);
  --color-ic-file-webbundle: rgb(128 134 139);
  --color-ic-file-default: rgb(128 134 139);

  /* Code highlighting colors */
  --color-token-variable: inherit;
  --color-token-property: inherit;
  --color-token-type: rgb(0 136 119);
  --color-token-definition: var(--color-token-attribute-value);
  --color-token-variable-special: rgb(0 85 170);
  --color-token-builtin: rgb(50 0 170);
  --color-token-keyword: rgb(171 13 144);
  --color-token-number: rgb(50 0 255);
  --color-token-string: rgb(170 17 17);
  --color-token-string-special: rgb(200 0 0);
  --color-token-atom: rgb(34 17 153);
  --color-token-tag: rgb(136 18 128);
  --color-token-attribute: rgb(153 69 0);
  --color-token-attribute-value: rgb(26 26 168);
  --color-token-comment: rgb(0 117 0);
  --color-token-meta: rgb(85 85 85);
  --color-token-deleted: rgb(221 68 68);
  --color-token-inserted: rgb(34 153 34);
  --color-token-pseudo-element: rgb(17 85 204);

  /* Colors used by the code editor */
  --color-secondary-cursor: #c0c0c0;
  --color-line-number: hsl(0deg 0% 46%);
  --color-matching-bracket-underline: rgb(0 0 0 / 50%);
  --color-matching-bracket-background: rgb(0 0 0 / 7%);
  --color-nonmatching-bracket-underline: rgb(255 0 0 / 50%);
  --color-nonmatching-bracket-background: rgb(255 0 0 / 7%);
  --color-editor-selection: #cfe8fc;
  --color-editor-selection-blurred: #e0e0e0;
  --color-trailing-whitespace: rgb(255 0 0 / 5%);
  --color-selected-option: #fff;
  --color-selected-option-background: #1a73e8;
  --color-highlighted-line: rgb(255 255 0 / 50%);
  --color-completion-hover: rgb(56 121 217 / 10%);
  --color-search-match-border: rgb(128 128 128);
  --color-selected-search-match: var(--color-text-primary);
  --color-selected-search-match-background: rgb(241 234 0);
  --color-coverage-used: #63acbe;
  --color-execution-line-background: rgb(0 59 255 / 10%);
  --color-execution-line-outline: rgb(64 115 244);
  --color-execution-token-background: rgb(15 72 252 / 35%);
  --color-continue-to-location: rgb(5 65 255 / 10%);
  --color-continue-to-location-hover: rgb(15 72 252 / 35%);
  --color-continue-to-location-hover-border: rgb(121 141 254);
  --color-continue-to-location-async: rgb(58 162 8 / 30%);
  --color-continue-to-location-async-hover: rgb(75 179 6 / 55%);
  --color-continue-to-location-async-hover-border: rgb(100 154 100);
  --color-evaluated-expression: rgb(255 255 11 / 25%);
  --color-evaluated-expression-border: rgb(163 41 34);
  --color-variable-values: #ffe3c7;
  --color-non-breakable-line: rgb(128 128 128 / 40%);
}

.-theme-with-dark-background {
  --color-primary: rgb(138 180 248);
  --color-primary-variant: rgb(102 157 246);
  --color-background: rgb(32 33 36);
  --color-background-inverted: rgb(255 255 255);
  --color-background-inverted-opacity-2: rgb(255 255 255 / 2%);
  --color-background-inverted-opacity-30: rgb(255 255 255 / 30%);
  --color-background-inverted-opacity-50: rgb(255 255 255 / 50%);
  --color-background-opacity-50: rgb(32 33 36 / 50%);
  --color-background-opacity-80: rgb(32 33 36 / 80%);
  --color-background-elevation-0: rgb(32 32 35);
  --color-background-elevation-1: rgb(41 42 45);
  --color-background-elevation-2: rgb(53 54 58);
  --color-background-elevation-dark-only: var(--color-background-elevation-1);
  --color-background-highlight: rgb(69 69 69);
  --divider-line: rgb(255 255 255 / 10%);
  --color-background-hover-overlay: rgb(56 121 217 / 10%);
  --color-selection-highlight: rgb(251 202 70 / 20%);
  --color-selection-highlight-border: rgb(251 202 70);
  --color-match-highlight: rgb(56 121 217 / 35%);
  --color-text-primary: rgb(232 234 237);
  --color-text-secondary: rgb(154 160 166);
  --color-text-secondary-selected: rgb(188 185 182);
  --color-text-disabled: rgb(128 134 139);
  --color-details-hairline: rgb(73 76 80);
  --color-details-hairline-light: rgb(54 57 59);
  --color-accent-red: rgb(242 139 130);
  --color-red: rgb(237 78 76);
  --color-accent-green: rgb(129 201 149);
  --color-accent-green-background: rgb(129 201 149 / 20%);
  --color-link: var(--color-primary);
  --color-syntax-1: rgb(53 212 199);
  --color-syntax-2: rgb(93 176 215);
  --color-syntax-2-rgb: 93 176 215;
  --color-syntax-3: rgb(242 151 102);
  --color-syntax-4: rgb(155 187 220);
  --color-syntax-5: rgb(132 240 255);
  --color-syntax-6: rgb(171 171 171);
  --color-syntax-7: rgb(207 208 208);
  --color-syntax-8: rgb(93 176 215);
  --drop-shadow: 0 0 0 1px rgb(255 255 255 / 20%),
    0 2px 4px 2px rgb(0 0 0 / 20%), 0 2px 6px 2px rgb(0 0 0 / 10%);
  --drop-shadow-depth-1: 0 1px 2px rgb(0 0 0 / 30%),
    0 1px 3px 1px rgb(0 0 0 / 15%);
  --drop-shadow-depth-2: 0 1px 2px rgb(0 0 0 / 30%),
    0 2px 6px 2px rgb(0 0 0 / 15%);
  --drop-shadow-depth-3: 0 4px 8px 3px rgb(0 0 0 / 15%),
    0 1px 3px rgb(0 0 0 / 30%);
  --drop-shadow-depth-4: 0 6px 10px 4px rgb(0 0 0 / 15%),
    0 2px 3px rgb(0 0 0 / 30%);
  --drop-shadow-depth-5: 0 8px 12px 6px rgb(0 0 0 / 15%),
    0 4px 4px rgb(0 0 0 / 30%);
  --box-shadow-outline-color: rgb(0 0 0 / 50%);
  --color-scrollbar-mac: rgb(51 51 51);
  --color-scrollbar-mac-hover: rgb(75 76 79);
  --color-scrollbar-other: rgb(51 51 51);
  --color-scrollbar-other-hover: rgb(75 76 79);
  --color-error-text: hsl(0deg 100% 75%);
  --color-error-border: rgb(92 0 0);
  --color-error-background: hsl(0deg 100% 8%);
  --color-checkbox-accent-color: rgb(255 165 0);
  /* Colors for styling inputs */
  --color-input-outline: rgb(60 64 67);
  --color-input-outline-active: rgb(138 180 248);
  --color-input-outline-error: rgb(242 139 130);
  --color-input-outline-disabled: rgba(189 193 198 / 20%);
  --color-input-text-disabled: rgba(128 134 139 / 70%);
  /* Colors for styling buttons */
  --color-button-outline-focus: rgb(138 180 248 / 75%);
  --color-button-primary-background-hovering: rgb(174 203 250 / 100%);
  --color-button-primary-background-pressed: rgb(210 227 252 / 100%);
  --color-button-primary-text: rgb(0 0 0);
  --color-button-primary-text-hover: rgb(60 61 65);
  --color-button-secondary-background-hovering: rgb(138 180 248 / 15%);
  --color-button-secondary-background-pressed: rgb(138 180 248 / 23%);
  --color-button-secondary-border: rgb(60 61 65);
  --color-iconbutton-hover: rgb(255 255 255 / 12%);
  --color-iconbutton-pressed: rgb(255 255 255 / 20%);

  /* Colors for file icons */
  --color-ic-file-document: rgb(39 116 240);
  --color-ic-file-image: rgb(30 142 62);
  --color-ic-file-font: rgb(18 181 203);
  --color-ic-file-script: rgb(234 134 0);
  --color-ic-file-stylesheet: rgb(161 66 244);
  --color-ic-file-webbundle: rgb(128 134 139);
  --color-ic-file-default: rgb(128 134 139);

  /* Code highlighting colors */
  --color-token-variable: rgb(217 217 217);
  --color-token-property: rgb(210 192 87);
  --color-token-type: var(--color-token-tag);
  --color-token-definition: var(--color-token-tag);
  --color-token-builtin: rgb(159 180 214);
  --color-token-variable-special: rgb(0 85 170);
  --color-token-keyword: rgb(154 127 213);
  --color-token-string: rgb(242 139 84);
  --color-token-string-special: var(--color-token-string);
  --color-token-atom: rgb(161 247 181);
  --color-token-number: var(--color-token-atom);
  --color-token-comment: var(--color-syntax-6);
  --color-token-tag: rgb(93 176 215);
  --color-token-attribute: rgb(155 187 220);
  --color-token-attribute-value: rgb(242 151 102);
  --color-token-meta: rgb(221 251 85);
  --color-token-pseudo-element: rgb(237 119 229);

  /* Colors used by the code editor */
  --color-secondary-cursor: rgb(63 63 63);
  --color-line-number: rgb(138 138 138);
  --color-matching-bracket-underline: rgb(217 217 217);
  --color-matching-bracket-background: initial;
  --color-nonmatching-bracket-underline: rgb(255 26 26);
  --color-nonmatching-bracket-background: initial;
  --color-editor-selection: hsl(207deg 88% 22%);
  --color-editor-selection-blurred: #454545;
  --color-trailing-whitespace: rgb(255 0 0 / 5%);
  --color-selected-option: #fff;
  --color-selected-option-background: #0e639c;
  --color-highlighted-line: hsl(133deg 100% 30% / 50%);
  --color-completion-hover: rgb(56 121 217 / 10%);
  --color-search-match-border: rgb(128 128 128);
  --color-selected-search-match: #eee;
  --color-selected-search-match-background: hsl(133deg 100% 30%);
  --color-coverage-used: rgb(65 138 156);
  --color-execution-line-background: rgb(0 154 17 / 30%);
  --color-execution-line-outline: #33cc6b;
  --color-execution-token-background: rgb(132 237 78 / 20%);
  --color-continue-to-location: rgb(0 173 56 / 35%);
  --color-continue-to-location-hover: rgb(0 173 56 / 35%);
  --color-continue-to-location-hover-border: #33cc6b;
  --color-continue-to-location-async: rgb(87 238 0 / 20%);
  --color-continue-to-location-async-hover: rgb(128 241 48 / 50%);
  --color-continue-to-location-async-hover-border: rgb(101 155 101);
  --color-evaluated-expression: rgb(71 70 0 / 75%);
  --color-evaluated-expression-border: rgb(221 99 92);
  --color-variable-values: rgb(56 28 0);
  --color-non-breakable-line: rgb(127 127 127 / 40%);
}
</style>
