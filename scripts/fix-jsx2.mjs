import fs from "fs";

const p = "src/PersonalHomepage.tsx";
const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);

const div = "div";
const motion = "motion.div";

lines[2454 - 1] = "              </" + div + ">";
lines[2458 - 1] = "            </" + div + ">";
lines[2459 - 1] = null;

lines[2526 - 1] = "              </" + div + ">";
lines[2545 - 1] = "            </" + div + ">";
lines[2546 - 1] = null;

lines[1352 - 1] = "        <" + div + ` className={middleColumnInnerClass}>`;
lines[1433 - 1] = "        </" + div + ">";

let s = lines.filter((line) => line !== null).join("\n");

const techOld = `}: {
  children: ReactNode;
  className?: string;
  pad?: "default" | "subsection" | "rule";
  trailing?: ReactNode;
}) {
  const padClass =
    pad === "subsection" ? techStackSubsectionPad : pad === "rule" ? techStackRuleRowPad : techStackMiddlePad;
  return (
    <div className={cn(\`relative min-w-0 overflow-visible border-l border-r border-solid \${borderLine}\`, padClass, className)}>
      <div className={middleColumnInnerClass}>{children}</div>`;

const techNew = `}: {
  children?: ReactNode;
  className?: string;
  pad?: "default" | "subsection" | "rule";
  trailing?: ReactNode;
}) {
  const padClass =
    pad === "subsection" ? techStackSubsectionPad : pad === "rule" ? techStackRuleRowPad : techStackMiddlePad;
  return (
    <div className={cn(\`relative min-w-0 overflow-visible border-l border-r border-solid \${borderLine}\`, padClass, className)}>
      {children != null ? <div className={middleColumnInnerClass}>{children}</div> : null}`;

if (!s.includes(techOld)) {
  console.error("TechStackMiddleCell block not found");
  process.exit(1);
}
s = s.replace(techOld, techNew);

fs.writeFileSync(p, s);
console.log("ok");
