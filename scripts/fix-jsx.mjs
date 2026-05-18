import fs from "fs";
const p = "src/PersonalHomepage.tsx";
const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);

// Fix work experience (~1-indexed line 2526, 2529, 2541, 2546 from earlier read - find by content)
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // After "Work Experience" title block: wrong closing motion.div for inner div
  if (line.trim() === "</motion.div>" && lines[i - 1]?.includes("</motion.div>") && lines[i - 5]?.includes("Work Experience")) {
    lines[i] = "              </motion.div>";
    console.log("fixed inner close at", i + 1);
  }
}

let s = lines.join("\n");

// Targeted replacements
s = s.replace(
  `              </motion.div>
              <div aria-hidden className={subsectionRulePadY}>
                <ViewportSingleRule />
              </motion.div>`,
  `              </motion.div>
              <motion.div aria-hidden className={subsectionRulePadY}>
                <ViewportSingleRule />
              </motion.div>`,
);

s = s.replace(
  `                </motion.div>

                <motion.div className={\`${subsectionRulePadY} ${sectionEndPadBelowRule}\`}>
                  <SectionEndCap />
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div className="min-w-0" aria-hidden />`,
  `              </motion.div>
              <motion.div className={\`${subsectionRulePadY} ${sectionEndPadBelowRule}\`}>
                <SectionEndCap />
              </motion.div>
            </motion.div>
            <motion.div className="min-w-0" aria-hidden />`,
);

// Fix afterTitle closing div -> motion.div
s = s.replace(
  `                  ))}
                </motion.div>

                <motion.div className={\`${subsectionRulePadY} ${sectionEndPadBelowRule}\`}>`,
  `                  ))}
              </motion.div>
              <motion.div className={\`${subsectionRulePadY} ${sectionEndPadBelowRule}\`}>`,
);

// Featured row
s = s.replace(
  `          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div className="min-w-0" aria-hidden />`,
  `          </motion.div>
        </motion.div>
      </motion.div>
      <div className="min-w-0" aria-hidden />`,
);

s = s.replace(
  `          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div className="min-w-0" aria-hidden />`,
  `          </motion.div>
        </motion.div>
      </motion.div>
      <div className="min-w-0" aria-hidden />`,
);

fs.writeFileSync(p, s);
console.log("done");
