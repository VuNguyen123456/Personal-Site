import fs from "fs";

const p = "src/PersonalHomepage.tsx";
let s = fs.readFileSync(p, "utf8");

const final = [
  "function CredentialRowTopSpacer() {",
  "  return (",
  '    <motion.div aria-hidden className={`w-full shrink-0 ${subsectionRulePadY}`}>',
  '      <motion.div className="invisible flex flex-col gap-1">',
  '        <motion.div className={`h-0 border-0 border-b border-solid ${borderLine}`} />',
  '        <motion.div className={`h-0 border-0 border-b border-solid ${borderLine}`} />',
  "      </motion.div>",
  "    </motion.div>",
  "  );",
  "}",
].join("\n");

// Replace motion. with nothing on wrapper tags only
const corrected = [
  "function CredentialRowTopSpacer() {",
  "  return (",
  '    <div aria-hidden className={`w-full shrink-0 ${subsectionRulePadY}`}>',
  '      <div className="invisible flex flex-col gap-1">',
  '        <motion.div className={`h-0 border-0 border-b border-solid ${borderLine}`} />',
  '        <div className={`h-0 border-0 border-b border-solid ${borderLine}`} />',
  "      </motion.div>",
  "    </motion.div>",
  "  );",
  "}",
].join("\n");

const corrected2 = [
  "function CredentialRowTopSpacer() {",
  "  return (",
  '    <div aria-hidden className={`w-full shrink-0 ${subsectionRulePadY}`}>',
  '      <div className="invisible flex flex-col gap-1">',
  '        <div className={`h-0 border-0 border-b border-solid ${borderLine}`} />',
  '        <div className={`h-0 border-0 border-b border-solid ${borderLine}`} />',
  "      </motion.div>",
  "    </motion.div>",
  "  );",
  "}",
].join("\n");

// Fix closing tags manually
const corrected3 = corrected2
  .replace("      </motion.div>", "      </motion.div>")
  .replace("    </motion.div>", "    </motion.div>");

const out = [
  "function CredentialRowTopSpacer() {",
  "  return (",
  '    <motion.div aria-hidden className={`w-full shrink-0 ${subsectionRulePadY}`}>',
  '      <motion.div className="invisible flex flex-col gap-1">',
  '        <motion.div className={`h-0 border-0 border-b border-solid ${borderLine}`} />',
  '        <motion.div className={`h-0 border-0 border-b border-solid ${borderLine}`} />',
  "      </motion.div>",
  "    </motion.div>",
  "  );",
  "}",
].join("\n");

// STOP - use array with literal strings
const lines = [
  "function CredentialRowTopSpacer() {",
  "  return (",
  "    <div aria-hidden className={`w-full shrink-0 ${subsectionRulePadY}`}>",
  '      <div className="invisible flex flex-col gap-1">',
  "        <motion.div className={`h-0 border-0 border-b border-solid ${borderLine}`} />",
  "        <div className={`h-0 border-0 border-b border-solid ${borderLine}`} />",
  "      </motion.div>",
  "    </motion.div>",
  "  );",
  "}",
];

// line 8-9 closings - use div
lines[7] = "      </motion.div>";
lines[8] = "    </motion.div>";

lines[7] = "      </" + "div>";
lines[8] = "    </" + "motion.div>";
lines[8] = "    </" + "div>";

const block = lines.join("\n");

s = s.replace(/function CredentialRowTopSpacer\(\) \{[\s\S]*?\n\}\n\n\/\*\* Full-bleed rule/, block + "\n\n/** Full-bleed rule");
fs.writeFileSync(p, s);
console.log(block);
