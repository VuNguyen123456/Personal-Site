import fs from "fs";
const p = "src/PersonalHomepage.tsx";
let s = fs.readFileSync(p, "utf8");

s = s.replace(
  `          </motion.div>
        </div>
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

s = s.replace(
  `function ViewportSingleRule() {
  return <div aria-hidden className={\`\${fullBleed} h-0 border-0 border-b border-solid \${borderLine}\`} />;
}

function MiddleColumnRule() {
  return <div aria-hidden className={\`h-0 w-full shrink-0 border-0 border-b border-solid \${borderLine}\`} />;
}`,
  `function ViewportSingleRule() {
  return (
    <div
      aria-hidden
      className={\`relative left-1/2 z-[1] h-0 w-screen max-w-none -translate-x-1/2 border-0 border-b border-solid \${borderLine}\`}
    />
  );
}`,
);

// Featured title
s = s.replace(
  `                </motion.div>

                <div aria-hidden className={featuredWorkTitleRulePadY}>
                  <ViewportSingleRule />
                </div>
              </div>
            </div>
            <motion.div className="min-w-0" aria-hidden />

            {displayedProjects.map`,
  `                </motion.div>
              </div>
              <div aria-hidden className={featuredWorkTitleRulePadY}>
                <ViewportSingleRule />
              </div>
            </div>
            <div className="min-w-0" aria-hidden />

            {displayedProjects.map`,
);

// Featured footer
s = s.replace(
  `                <div className={middleColumnInnerClass}>
                  <ViewportAdjacentRulesShaper rulePad="pt-1 sm:pt-1.5 pb-0" />

                  <motion.div className="flex items-center justify-center py-0.5 sm:py-1">`,
  `                <ViewportAdjacentRulesShaper rulePad="pt-1 sm:pt-1.5 pb-0" />
                <div className={middleColumnInnerClass}>
                  <div className="flex items-center justify-center py-0.5 sm:py-1">`,
);

// Work exp
s = s.replace(
  `                </motion.div>

                <div aria-hidden className={subsectionRulePadY}>
                  <ViewportSingleRule />
                </div>

                <div className={afterTitleRulePad}>
                  {workExperienceEntries.map((entry, index) => (
                    <Fragment key={entry.id}>
                      {index > 0 ? <ViewportAdjacentRulesShaper /> : null}
                      <WorkExperienceRow entry={entry} />`,
  `                </motion.div>
              </motion.div>
              <div aria-hidden className={subsectionRulePadY}>
                <ViewportSingleRule />
              </motion.div>
              <motion.div className={afterTitleRulePad}>
                  {workExperienceEntries.map((entry, index) => (
                    <Fragment key={entry.id}>
                      {index > 0 ? (
                        <div aria-hidden className={subsectionRulePadY}>
                          <ViewportAdjacentRulesShaper />
                        </motion.div>
                      ) : null}
                      <WorkExperienceRow entry={entry} />`,
);

// fix typo in work exp replace - used motion.div close wrong
s = s.replace(
  `                      {index > 0 ? (
                        <div aria-hidden className={subsectionRulePadY}>
                          <ViewportAdjacentRulesShaper />
                        </motion.div>
                      ) : null}`,
  `                      {index > 0 ? (
                        <div aria-hidden className={subsectionRulePadY}>
                          <ViewportAdjacentRulesShaper />
                        </div>
                      ) : null}`,
);

// Credential middle column
s = s.replace(
  `      <div className={\`relative min-w-0 border-l border-r border-solid \${borderLine} \${portfolioMiddlePad}\`}>
        {index > 0 ? <ViewportAdjacentRulesShaper /> : null}
        <div className={middleColumnInnerClass}>`,
  `      <div className={\`relative min-w-0 overflow-visible border-l border-r border-solid \${borderLine} \${portfolioMiddlePad}\`}>
        {index > 0 ? <ViewportAdjacentRulesShaper /> : null}
        <div className={middleColumnInnerClass}>`,
);

// Tech stack cells
if (!s.includes('pad="rule"\n                  trailing=')) {
  s = s.replace(
    `<TechStackMiddleCell pad="rule">
                  <ViewportAdjacentRulesShaper variant="single" rulePad={techSubsectionRulePadY} />
                </TechStackMiddleCell>`,
    `<TechStackMiddleCell
                  pad="rule"
                  trailing={<ViewportAdjacentRulesShaper variant="single" rulePad={techSubsectionRulePadY} />}
                />`,
  );
  s = s.replace(
    `<TechStackMiddleCell pad="rule">
          <ViewportAdjacentRulesShaper variant="single" rulePad={techSubsectionRulePadY} />
        </TechStackMiddleCell>`,
    `<TechStackMiddleCell
          pad="rule"
          trailing={<ViewportAdjacentRulesShaper variant="single" rulePad={techSubsectionRulePadY} />}
        />`,
  );
}

if (!s.includes("children?: ReactNode")) {
  s = s.replace(
    "      <motion.div className={middleColumnInnerClass}>{children}</motion.div>",
    "      {children != null ? <motion.div className={middleColumnInnerClass}>{children}</motion.div> : null}",
  );
  s = s.replace("children: ReactNode;", "children?: ReactNode;");
}

fs.writeFileSync(p, s);
console.log("ok");
