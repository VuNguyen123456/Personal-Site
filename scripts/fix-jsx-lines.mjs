import fs from "fs";

const p = "src/PersonalHomepage.tsx";
const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);

function replaceRange(startLine1, endLine1, newLines) {
  lines.splice(startLine1 - 1, endLine1 - startLine1 + 1, ...newLines);
}

replaceRange(2525, 2546, [
  "                </motion.div>",
  "              </motion.div>",
  '              <motion.div aria-hidden className={subsectionRulePadY}>',
  "                <ViewportSingleRule />",
  "              </motion.div>",
  '              <motion.div className={afterTitleRulePad}>',
  "                {workExperienceEntries.map((entry, index) => (",
  "                  <Fragment key={entry.id}>",
  "                    {index > 0 ? (",
  '                      <motion.div aria-hidden className={subsectionRulePadY}>',
  "                        <ViewportAdjacentRulesShaper />",
  "                      </motion.div>",
  "                    ) : null}",
  "                    <WorkExperienceRow entry={entry} />",
  "                  </Fragment>",
  "                ))}",
  "              </motion.div>",
  "              <motion.div className={`${subsectionRulePadY} ${sectionEndPadBelowRule}`}>",
  "                <SectionEndCap />",
  "              </motion.div>",
  "            </motion.div>",
]);

replaceRange(2453, 2458, [
  "                </motion.div>",
  "              </motion.div>",
  '              <motion.div aria-hidden className={featuredWorkTitleRulePadY}>',
  "                <ViewportSingleRule />",
  "              </motion.div>",
  "            </motion.div>",
]);

replaceRange(2471, 2472, [
  '                <ViewportAdjacentRulesShaper rulePad="pt-1 sm:pt-1.5 pb-0" />',
  "                <motion.div className={middleColumnInnerClass}>",
]);

replaceRange(1432, 1434, [
  "          </motion.div>",
  "        </motion.div>",
  "      </motion.div>",
]);

let s = lines.join("\n");

s = s.replace("  children: ReactNode;", "  children?: ReactNode;");
s = s.replace(
  "      <motion.div className={middleColumnInnerClass}>{children}</motion.div>",
  "      {children != null ? <motion.div className={middleColumnInnerClass}>{children}</motion.div> : null}",
);

fs.writeFileSync(p, s);
console.log("done");
