import fs from "fs";

const p = "src/PersonalHomepage.tsx";
let s = fs.readFileSync(p, "utf8");

// Fix featured row closing tags
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
      <motion.div className="min-w-0" aria-hidden />
    </>
  );
}

const WASHINGTON_DC_TZ`,
);

// Featured title rule outside inner
s = s.replace(
  `                </motion.div>

                <motion.div aria-hidden className={featuredWorkTitleRulePadY}>
                  <ViewportSingleRule />
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div className="min-w-0" aria-hidden />

            {displayedProjects.map`,
  `                </motion.div>
              </motion.div>
              <motion.div aria-hidden className={featuredWorkTitleRulePadY}>
                <ViewportSingleRule />
              </motion.div>
            </motion.div>
            <motion.div className="min-w-0" aria-hidden />

            {displayedProjects.map`,
);

// Featured footer shaper outside inner
s = s.replace(
  `                <motion.div className={middleColumnInnerClass}>
                  <ViewportAdjacentRulesShaper rulePad="pt-1 sm:pt-1.5 pb-0" />

                  <motion.div className="flex items-center justify-center py-0.5 sm:py-1">`,
  `                <ViewportAdjacentRulesShaper rulePad="pt-1 sm:pt-1.5 pb-0" />
                <motion.div className={middleColumnInnerClass}>
                  <motion.div className="flex items-center justify-center py-0.5 sm:py-1">`,
);

// Work experience
s = s.replace(
  `                </motion.div>

                <motion.div aria-hidden className={subsectionRulePadY}>
                  <ViewportSingleRule />
                </motion.div>

                <motion.div className={afterTitleRulePad}>
                  {workExperienceEntries.map((entry, index) => (
                    <Fragment key={entry.id}>
                      {index > 0 ? <ViewportAdjacentRulesShaper /> : null}
                      <WorkExperienceRow entry={entry} />`,
  `                </motion.div>
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
                      <WorkExperienceRow entry={entry} />`,
);

// Scholarships
s = s.replace("<MiddleColumnRule />", "<ViewportSingleRule />");
s = s.replace(/\nfunction MiddleColumnRule\(\) \{[^}]+\}\n\n/, "\n");

// Tech stack rule rows
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

if (!s.includes("children?: ReactNode")) {
  s = s.replace(
    `  children: ReactNode;
  className?: string;
  pad?: "default" | "subsection" | "rule";
  trailing?: ReactNode;
}) {
  const padClass =
    pad === "subsection" ? techStackSubsectionPad : pad === "rule" ? techStackRuleRowPad : techStackMiddlePad;
  return (
    <motion.div className={cn(\`relative min-w-0 overflow-visible border-l border-r border-solid \${borderLine}\`, padClass, className)}>
      <motion.div className={middleColumnInnerClass}>{children}</motion.div>
      {trailing}
    </motion.div>
  );
}`,
    `  children?: ReactNode;
  className?: string;
  pad?: "default" | "subsection" | "rule";
  trailing?: ReactNode;
}) {
  const padClass =
    pad === "subsection" ? techStackSubsectionPad : pad === "rule" ? techStackRuleRowPad : techStackMiddlePad;
  return (
    <motion.div className={cn(\`relative min-w-0 overflow-visible border-l border-r border-solid \${borderLine}\`, padClass, className)}>
      {children != null ? <motion.div className={middleColumnInnerClass}>{children}</motion.div> : null}
      {trailing}
    </motion.div>
  );
}`.replaceAll("motion.div", "motion.div"),
  );
}

// Credential row - move shaper outside inner if still inside
s = s.replace(
  `      <motion.div className={\`relative min-w-0 border-l border-r border-solid \${borderLine} \${portfolioMiddlePad}\`}>
        <motion.div className={middleColumnInnerClass}>
          {index > 0 ? <ViewportAdjacentRulesShaper /> : null}
          <motion.div`,
  `      <motion.div className={\`relative min-w-0 overflow-visible border-l border-r border-solid \${borderLine} \${portfolioMiddlePad}\`}>
        {index > 0 ? <ViewportAdjacentRulesShaper /> : null}
        <motion.div className={middleColumnInnerClass}>
          <motion.div`,
);

fs.writeFileSync(p, s);
console.log("done", {
  MiddleColumnRule: s.includes("MiddleColumnRule"),
  wscreen: s.includes("w-screen max-w-none"),
  workOutside: s.includes("workExperienceEntries") && s.includes("index > 0 ? (\n                        <div"),
});
