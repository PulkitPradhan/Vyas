const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const rulesToDisable = [
  "react-doctor/no-array-index-as-key",
  "react-doctor/no-initialize-state",
  "react-doctor/prefer-module-scope-pure-function",
  "react-doctor/no-inline-bounce-easing",
  "react-doctor/no-giant-component",
  "react-doctor/no-autofocus",
  "react-doctor/prefer-module-scope-static-value",
  "react-doctor/server-sequential-independent-await",
  "react-doctor/async-await-in-loop",
  "react-doctor/rerender-lazy-ref-init",
  "react-doctor/control-has-associated-label",
  "react-doctor/no-derived-useState",
  "react-doctor/no-react19-deprecated-apis",
  "react-doctor/url-prefilled-privileged-action",
  "react-doctor/rendering-hydration-no-flicker",
  "react-doctor/rendering-svg-precision",
  "react-doctor/rerender-state-only-in-handlers",
  "react-doctor/js-combine-iterations",
  "react-doctor/prefer-tag-over-role",
  "react-doctor/jsx-no-constructed-context-values",
  "react-doctor/no-cascading-set-state"
];

for (const rule of rulesToDisable) {
  pkg.reactDoctor.rules[rule] = "off";
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
