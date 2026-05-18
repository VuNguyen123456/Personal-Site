import fs from "fs";
const p = "src/PersonalHomepage.tsx";
let s = fs.readFileSync(p, "utf8");

const broken = `                </motion.div>
              </motion.div>
              <div aria-hidden className={subsectionRulePadY}>
                <ViewportSingleRule />
              </motion.div>
              <motion.div className={afterTitleRulePad}>
                  {workExperienceEntries.map((entry, index) => (
                    <Fragment key={entry.id}>
                      {index > 0 ? (
                        <motion.div aria-hidden className={subsectionRulePadY}>
                          <ViewportAdjacentRulesShaper />
                        </motion.div>
                      ) : null}
                      <WorkExperienceRow entry={entry} />
                    </Fragment>
                  ))}
                </motion.div>

                <motion.div className={\`${subsectionRulePadY} ${sectionEndPadBelowRule}\`}>
                  <SectionEndCap />
                </motion.div>
              </motion.div>
            </motion.div>`;

const fixed = `                </motion.div>
              </motion.div>
              <motion.div aria-hidden className={subsectionRulePadY}>
                <ViewportSingleRule />
              </motion.div>
              <motion.div className={afterTitleRulePad}>
                {workExperienceEntries.map((entry, index) => (
                  <Fragment key={entry.id}>
                    {index > 0 ? (
                      <motion.div aria-hidden className={subsectionRulePadY}>
                        <ViewportAdjacentRulesShaper />
                      </motion.div>
                    ) : null}
                    <WorkExperienceRow entry={entry} />
                  </Fragment>
                ))}
              </motion.div>
              <motion.div className={\`${subsectionRulePadY} ${sectionEndPadBelowRule}\`}>
                <SectionEndCap />
              </motion.div>
            </motion.div>`;

if (!s.includes(broken)) {
  console.log("broken block not found, trying div variant");
  const broken2 = broken.replace(/motion\.div/g, "div");
  const fixed2 = fixed.replace(/motion\.motion\.div/g, "motion.div").replace(/<motion\.div/g, "<div").replace(/<\/motion\.motion\.motion\.div>/g, "</div>");
}
s = s.replace(broken, fixed);

// featured row closings
s = s.replace(
  `          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div className="min-w-0" aria-hidden />
    </>
  );
}

const WASHINGTON_DC_TZ`,
  `          </motion.div>
        </motion.div>
      </motion.div>
      <div className="min-w-0" aria-hidden />
    </>
  );
}

const WASHINGTON_DC_TZ`,
);

// try alternate featured closings
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
console.log("fixed");
