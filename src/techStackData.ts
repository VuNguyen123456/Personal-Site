export type TechStackItem = {
  name: string;
  hoverCaption: string;
  personalExperience: string;
  personalWhy: string;
  website?: string;
  iconImage?: string;
  fallbackIcon?: string;
};

const techAsset = (fileName: string) => `/assets/tech/${fileName}`;

export const techStackSections: { title: string; items: TechStackItem[] }[] = [
  {
    title: "Programming",
    items: [
      {
        name: "Python",
        website: "https://www.python.org",
        iconImage: techAsset("python.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
        hoverCaption: "Versatile language for backends, data work, and automation.",
        personalExperience:
          "Built DNS clients, MTP over UDP, network routing sims, MapReduce in Go’s cousin workflows, adversarial search, Bayesian networks, Grammys web analytics pipelines, and a LangChain Pokémon strategy agent.",
        personalWhy:
          "I love how fast I can go from idea to working prototype—whether it’s sockets, AI, or a one-off data script.",
      },
      {
        name: "C",
        website: "https://en.cppreference.com/w/c",
        iconImage: techAsset("c.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
        hoverCaption: "Low-level language for performance and systems fundamentals.",
        personalExperience:
          "Wrote ZAKU, a Unix-like shell with signals and I/O redirection; a cooperative CPU scheduler; a 9-bit floating-point library; LRU virtual memory; and a pthread thread-pool web server with FIFO/SFF scheduling.",
        personalWhy:
          "C taught me what actually happens under the hood—memory, processes, and scheduling click in a way higher-level languages hide.",
      },
      {
        name: "Go",
        website: "https://go.dev",
        iconImage: techAsset("go.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
        hoverCaption: "Compiled language for simple, fast concurrent services.",
        personalExperience:
          "Engineered a 50-goroutine traffic bridge simulator with mutexes and condition variables, plus a fault-tolerant MapReduce library with RPC workers and task reassignment on failure.",
        personalWhy:
          "Goroutines and channels make concurrency feel approachable—I reach for Go when I want clarity and performance together.",
      },
      {
        name: "Jinja",
        website: "https://jinja.palletsprojects.com",
        iconImage: techAsset("jinja.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jinja/jinja-original.svg",
        hoverCaption: "Templating for generating HTML and config from data.",
        personalExperience:
          "Used Jinja inside dbt on Snowflake to drive metadata-driven SQL macros—new tables often need only YAML config instead of hand-written transforms.",
        personalWhy:
          "Templating turns repetitive warehouse SQL into something scalable; I like separating data logic from boilerplate.",
      },
      {
        name: "Java",
        website: "https://www.java.com",
        iconImage: techAsset("java.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
        hoverCaption: "Widely used for enterprise apps and Android.",
        personalExperience:
          "Shipped JDBC inventory apps, Dijkstra shortest-path tools, MARS triage simulations, credit-report processors over 1,500+ records, tree-structure coursework, and DAG-based course scheduling with custom heaps.",
        personalWhy:
          "Java’s structure and collections libraries are perfect for algorithm-heavy coursework that still feels production-shaped.",
      },
      {
        name: "JavaScript",
        website: "https://developer.mozilla.org/docs/Web/JavaScript",
        iconImage: techAsset("javascript.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
        hoverCaption: "The language of the web in browsers and beyond.",
        personalExperience:
          "Built PatriotRead’s accessibility extension UI, a real-time chat client with Socket.IO, and full-stack features across hackathons and internships.",
        personalWhy:
          "It runs everywhere—one language from browser extension to API glue keeps iteration fast.",
      },
      {
        name: "TypeScript",
        website: "https://www.typescriptlang.org",
        iconImage: techAsset("typescript.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
        hoverCaption: "JavaScript with static types for safer large codebases.",
        personalExperience:
          "Developed Quizly and CourseCupid frontends with typed React components, API contracts, and safer refactors across large feature surfaces.",
        personalWhy:
          "Types catch mistakes before runtime—essential when a team is moving quickly on a full-stack product.",
      },
      {
        name: "HTML5",
        website: "https://developer.mozilla.org/docs/Web/HTML",
        iconImage: techAsset("html5.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
        hoverCaption: "Structure and semantics for web pages.",
        personalExperience:
          "Structured Gigmarket’s rating flows, hackathon demos, and portfolio layouts with semantic markup and accessible patterns.",
        personalWhy:
          "Good HTML is the foundation of accessibility—I care about getting structure right before CSS polish.",
      },
      {
        name: "CSS3",
        website: "https://developer.mozilla.org/docs/Web/CSS",
        iconImage: techAsset("css3.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
        hoverCaption: "Styling, layout, and responsive design on the web.",
        personalExperience:
          "Styled PatriotRead’s injected accessibility themes—48px fonts, decluttered layouts, and high-contrast modes that adapt any webpage.",
        personalWhy:
          "CSS is how users feel your product; small layout decisions change whether software feels calm or chaotic.",
      },
      {
        name: "Bash",
        website: "https://www.gnu.org/software/bash/",
        iconImage: techAsset("bash.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg",
        hoverCaption: "Shell scripting for automation and dev workflows.",
        personalExperience:
          "Automated deploy checks, test runners, and environment setup across class projects and cloud labs.",
        personalWhy:
          "A solid shell script saves hours of repetitive clicking—I reach for Bash when glue code is the job.",
      },
    ],
  },
  {
    title: "Technologies",
    items: [
      {
        name: "GitHub",
        website: "https://github.com",
        iconImage: techAsset("github.png"),
        hoverCaption: "Host repos, collaborate, and ship with pull requests.",
        personalExperience:
          "Host coursework, hackathons, and portfolio code with PR-based reviews across PatriotRead, Quizly, and systems projects.",
        personalWhy:
          "GitHub is where my work becomes shareable—I like the transparency of open commits and READMEs.",
      },
      {
        name: "GitLab",
        website: "https://gitlab.com",
        iconImage: techAsset("gitlab.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg",
        hoverCaption: "Repos, CI/CD, and issue tracking in one platform.",
        personalExperience:
          "At Gigmarket I integrated Angular, Node, and PostgreSQL with GitLab source control, improving stability ~9% through disciplined branching and reviews.",
        personalWhy:
          "Enterprise teams often live in GitLab—I’m comfortable with its CI and review flows, not just GitHub.",
      },
      {
        name: "Microsoft Excel",
        website: "https://www.microsoft.com/microsoft-365/excel",
        iconImage: techAsset("excel.png"),
        hoverCaption: "Spreadsheets for analysis, modeling, and reporting.",
        personalExperience:
          "Partnered on Intel’s sustainability analytics—benchmarking 15M+ kWh savings and 6,700+ tons CO₂ alongside SQL-driven insights.",
        personalWhy:
          "Stakeholders still live in spreadsheets; I like pairing Excel storytelling with rigorous SQL underneath.",
      },
      {
        name: "Docker",
        website: "https://www.docker.com",
        iconImage: techAsset("docker.png"),
        hoverCaption: "Containers for consistent builds and deploys.",
        personalExperience:
          "Containerized a PCI-aware checkout service on AWS ECS with blue-green deploys, hitting sub-200ms responses and zero-downtime releases.",
        personalWhy:
          "Containers make “works on my machine” disappear—I trust them for reproducible deploys.",
      },
      {
        name: "AWS",
        website: "https://aws.amazon.com",
        iconImage: techAsset("aws.png"),
        hoverCaption: "Amazon cloud for compute, storage, and managed services.",
        personalExperience:
          "Interned on AWS at 22nd Century: ECS, ALB, CloudFront, RDS Multi-AZ, and auto-scaling checkout. At PatriotHacks I ran Lambda + API Gateway for TTS/LLM endpoints.",
        personalWhy:
          "AWS lets student projects feel production-grade—I enjoy wiring the pieces into reliable, observable systems.",
      },
      {
        name: "Azure",
        website: "https://azure.microsoft.com",
        iconImage: techAsset("azure.png"),
        hoverCaption: "Microsoft cloud for apps and enterprise workloads.",
        personalExperience:
          "PatriotRead routes long text through Azure OpenAI and Speech Services with retries and backoff for sub-100ms TTS at scale.",
        personalWhy:
          "Azure’s AI APIs slot cleanly into accessibility features—I like pairing them with lightweight serverless fronts.",
      },
      {
        name: "dbt",
        website: "https://www.getdbt.com",
        iconImage: techAsset("dbt.png"),
        fallbackIcon: "https://www.vectorlogo.zone/logos/getdbt/getdbt-icon.svg",
        hoverCaption: "Transform warehouse data with SQL and version control.",
        personalExperience:
          "Built a medallion Airbnb pipeline in Snowflake—10+ models, incremental loads, custom tests, and ~80% compute reduction via Jinja macros.",
        personalWhy:
          "dbt brings software engineering discipline to analytics; I love testable, documented transforms.",
      },
      {
        name: "Snowflake",
        website: "https://www.snowflake.com",
        iconImage: techAsset("snowflake.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/snowflake/snowflake-original.svg",
        hoverCaption: "Cloud data warehouse for analytics at scale.",
        personalExperience:
          "Ran Bronze/Silver/Gold layers for Airbnb data and dual-wrote CourseCupid analytics events for scalable tracking.",
        personalWhy:
          "Separation of storage and compute makes experimentation cheap—I like iterating on models without fear.",
      },
      {
        name: "Jira",
        website: "https://www.atlassian.com/software/jira",
        iconImage: techAsset("jira.png"),
        hoverCaption: "Track agile work, sprints, and project issues.",
        personalExperience:
          "Led The Fitting Room prototype with Agile sprints at 22nd Century and coordinated Monstarlab mobile work across design and engineering.",
        personalWhy:
          "Clear tickets and sprints keep teams aligned—I’d rather over-communicate scope than miss a deadline.",
      },
      {
        name: "PostgreSQL",
        website: "https://www.postgresql.org",
        iconImage: techAsset("postgresql.png"),
        hoverCaption: "Open-source relational database with strong SQL.",
        personalExperience:
          "At Gigmarket I built CRUD with indexing and GraphQL atop Postgres; GMU coursework includes Oracle/SQL library systems and relational modeling.",
        personalWhy:
          "Postgres is my default when data integrity matters—I trust its SQL and extension ecosystem.",
      },
      {
        name: "SQL",
        website: "https://www.postgresql.org/docs/",
        iconImage: techAsset("sql.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
        hoverCaption: "Query and model relational data with structured SQL.",
        personalExperience:
          "Queried 600k+ Intel device records, designed library EER schemas in Oracle SQL, and wrote complex reporting queries across internships and class.",
        personalWhy:
          "SQL is how I think about data—set-based logic beats ad-hoc loops for analysis every time.",
      },
      {
        name: "Git",
        website: "https://git-scm.com",
        iconImage: techAsset("git.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
        hoverCaption: "Distributed version control for code history.",
        personalExperience:
          "Daily driver across GitHub/GitLab teams, hackathons, and multi-month research repos with feature branches and clean history.",
        personalWhy:
          "Git is non-negotiable literacy—good commits are how future-me thanks present-me.",
      },
      {
        name: "MongoDB",
        website: "https://www.mongodb.com",
        iconImage: techAsset("mongodb.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
        hoverCaption: "Document database for flexible JSON-like data.",
        personalExperience:
          "Migrated Oracle schemas to embedded documents, powered real-time chat collections, and backed CourseCupid profiles and pods.",
        personalWhy:
          "Flexible schemas shine for evolving product shapes—I like picking the right store per workload.",
      },
      {
        name: "Redis",
        website: "https://redis.io",
        iconImage: techAsset("redis.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
        hoverCaption: "In-memory cache for fast reads and lower DB load.",
        personalExperience:
          "Added Redis caching to Gigmarket’s GraphQL stack to cut latency and database pressure on hot queries.",
        personalWhy:
          "A well-placed cache is the cheapest performance win—I enjoy measuring before and after.",
      },
    ],
  },
  {
    title: "Full Stack",
    items: [
      {
        name: "Angular",
        website: "https://angular.dev",
        iconImage: techAsset("angular.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg",
        hoverCaption: "TypeScript framework for large enterprise web apps.",
        personalExperience:
          "At Gigmarket I shipped a rating page that cut task time ~20% and lifted engagement ~22%, wiring Angular with Node, Express, and PostgreSQL.",
        personalWhy:
          "Angular’s structure suits team codebases—I like explicit modules when many developers touch the same app.",
      },
      {
        name: "React.js",
        website: "https://react.dev",
        iconImage: techAsset("react.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
        hoverCaption: "Component UI library for interactive front ends.",
        personalExperience:
          "Built Quizly, CourseCupid, and a real-time chat UI with 10+ reusable components, JWT auth flows, and Socket.IO-driven updates.",
        personalWhy:
          "Component composition matches how I sketch UIs—I can iterate on UX without rewiring the whole page.",
      },
      {
        name: "Node.js",
        website: "https://nodejs.org",
        iconImage: techAsset("nodejs.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
        hoverCaption: "JavaScript runtime for servers and tooling.",
        personalExperience:
          "Delivered Gigmarket’s Express backend, a chat server with REST + websockets, and integration work that cut data latency ~25% at 22nd Century.",
        personalWhy:
          "One language across stack speeds delivery—I like Node when APIs and frontends share types and tooling.",
      },
      {
        name: "Express.js",
        website: "https://expressjs.com",
        iconImage: techAsset("express-js.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
        hoverCaption: "Minimal Node framework for HTTP APIs and middleware.",
        personalExperience:
          "Implemented Gigmarket APIs and a chat backend with middleware, routing, and PostgreSQL integration under GitLab workflow.",
        personalWhy:
          "Express stays out of the way—I can focus on API design and observability instead of framework ceremony.",
      },
      {
        name: "FastAPI",
        website: "https://fastapi.tiangolo.com",
        iconImage: techAsset("fast-api.gif"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg",
        hoverCaption: "Modern Python API framework with automatic OpenAPI docs.",
        personalExperience:
          "Architected Quizly’s 30+ endpoints and CourseCupid’s matching, chatbot, and analytics APIs with Pydantic validation.",
        personalWhy:
          "FastAPI’s speed and schema validation make Python backends feel as crisp as typed frontends.",
      },
      {
        name: "GraphQL",
        website: "https://graphql.org",
        iconImage: techAsset("graphql.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg",
        hoverCaption: "Query APIs for exactly the data clients need.",
        personalExperience:
          "Built Gigmarket CRUD with GraphQL queries/mutations over Postgres and Redis for efficient client-server contracts.",
        personalWhy:
          "Clients fetch what they need—fewer over-fetched payloads and cleaner mobile/web clients.",
      },
      {
        name: "RESTful APIs",
        website: "https://restfulapi.net",
        iconImage: techAsset("rest-api.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg",
        hoverCaption: "HTTP APIs built around resources and verbs.",
        personalExperience:
          "Designed PatriotRead Lambda routes (/tts, /llm), Quizly REST surfaces, and chat endpoints with JWT-secured resources.",
        personalWhy:
          "REST is the lingua franca of integrations—clear resources make debugging and docs straightforward.",
      },
      {
        name: "Socket.IO",
        website: "https://socket.io",
        iconImage: techAsset("socket-io.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg",
        hoverCaption: "Real-time bidirectional events between client and server.",
        personalExperience:
          "Delivered sub-100ms chat messaging with live UI updates across sessions in a React + Node capstone.",
        personalWhy:
          "Instant feedback changes how social apps feel—I love watching messages land without refresh.",
      },
      {
        name: "Pydantic",
        website: "https://docs.pydantic.dev",
        iconImage: techAsset("pydantic.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
        hoverCaption: "Validation and settings with Python type hints.",
        personalExperience:
          "Modeled Quizly and CourseCupid request/response bodies so bad payloads fail fast at the API boundary.",
        personalWhy:
          "Validated models document the contract—bugs surface at parse time, not in production logs.",
      },
      {
        name: "Flutter",
        website: "https://flutter.dev",
        iconImage: techAsset("Flutter.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
        hoverCaption: "Cross-platform UI toolkit with Dart for mobile apps.",
        personalExperience:
          "At Monstarlab in Hanoi I implemented Flutter features, debugged UI performance in Android Studio, and shipped sprint deliverables with designers.",
        personalWhy:
          "Hot reload and one codebase for iOS/Android made mobile iteration feel as fast as web hackathons.",
      },
      {
        name: "Android Studio",
        website: "https://developer.android.com/studio",
        iconImage: techAsset("android-studio.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/androidstudio/androidstudio-original.svg",
        hoverCaption: "Official IDE for building Android apps.",
        personalExperience:
          "Profiled Flutter builds, traced layout jank, and fixed stability issues across screen sizes during my Monstarlab internship.",
        personalWhy:
          "Studio’s profilers turn guesswork into evidence—I like fixing performance with data.",
      },
      {
        name: "Android Emulator",
        website: "https://developer.android.com/studio/run/emulator",
        iconImage: techAsset("android-emulator.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg",
        hoverCaption: "Virtual devices to test Android without hardware.",
        personalExperience:
          "Ran multi-device emulator matrices to catch Flutter UI regressions before QA handoff.",
        personalWhy:
          "Emulators let me test edge cases—not everyone has the latest Pixel in their pocket.",
      },
    ],
  },
  {
    title: "Machine Learning",
    items: [
      {
        name: "scikit-learn",
        website: "https://scikit-learn.org",
        iconImage: techAsset("scikit-learn.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg",
        hoverCaption: "Classic ML algorithms and tools in Python.",
        personalExperience:
          "Used cosine similarity in Quizly’s free-response grading pipeline to hit 85%+ accuracy alongside GPT-4o evaluation.",
        personalWhy:
          "Simple, interpretable baselines still win—I reach for sklearn before jumping to huge models.",
      },
      {
        name: "Pandas",
        website: "https://pandas.pydata.org",
        iconImage: techAsset("pandas.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg",
        hoverCaption: "DataFrames for cleaning and analyzing tables.",
        personalExperience:
          "Cleaned 1,800+ days of Grammys web traffic, engineered engagement KPIs, and prepped restaurant datasets for decision-tree vs. neural net comparisons.",
        personalWhy:
          "DataFrames are how I explore messy CSVs—vectorized ops beat spreadsheet copy-paste.",
      },
      {
        name: "NumPy",
        website: "https://numpy.org",
        iconImage: techAsset("numpy.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg",
        hoverCaption: "Fast numerical arrays and linear algebra.",
        personalExperience:
          "Backed neural-network coursework and embedding similarity math in Quizly’s grading stack.",
        personalWhy:
          "NumPy is the bedrock—once arrays click, every ML library makes more sense.",
      },
      {
        name: "OpenCV",
        website: "https://opencv.org",
        iconImage: techAsset("opencv.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg",
        hoverCaption: "Computer vision and image processing.",
        personalExperience:
          "Experimented with image pipelines in coursework touching spatial data and visualization-heavy projects.",
        personalWhy:
          "Vision problems are tangible—pixels and filters make abstract ML feel concrete.",
      },
      {
        name: "matplotlib",
        website: "https://matplotlib.org",
        iconImage: techAsset("matplotlib.png"),
        fallbackIcon: "https://upload.wikimedia.org/wikipedia/commons/0/01/Created_with_Matplotlib-logo.svg",
        hoverCaption: "Foundational plotting for Python charts.",
        personalExperience:
          "Plotted model metrics and coursework graphs where fine-grained control over axes and styles mattered.",
        personalWhy:
          "When I need publication-quality control, matplotlib is still my reliable baseline.",
      },
      {
        name: "seaborn",
        website: "https://seaborn.pydata.org",
        iconImage: techAsset("seaborn.png"),
        fallbackIcon: "https://seaborn.pydata.org/_images/logo-mark-lightbg.svg",
        hoverCaption: "Statistical visualization on top of matplotlib.",
        personalExperience:
          "Styled distribution and comparison plots for ML coursework and exploratory analysis notebooks.",
        personalWhy:
          "Seaborn gives beautiful defaults—I spend time on insights, not boilerplate chart code.",
      },
      {
        name: "Plotly",
        website: "https://plotly.com/python/",
        iconImage: techAsset("plotly.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/plotly/plotly-original.svg",
        hoverCaption: "Interactive charts for dashboards and storytelling.",
        personalExperience:
          "Visualized Grammys traffic spikes (4,190% awards night) and presented Global Career Accelerator insights interactively.",
        personalWhy:
          "Interactive charts help non-technical stakeholders see the story—I love toggling traces live.",
      },
      {
        name: "Jupyter",
        website: "https://jupyter.org",
        iconImage: techAsset("jupyter.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg",
        hoverCaption: "Notebooks for exploratory code and plots.",
        personalExperience:
          "Analyzed real-world datasets in the Global Career Accelerator and iterated on ML assignments with inline plots.",
        personalWhy:
          "Notebooks are my lab bench—mix prose, code, and charts until the analysis clicks.",
      },
      {
        name: "LangChain",
        website: "https://www.langchain.com",
        iconImage: techAsset("langchain.png"),
        fallbackIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
        hoverCaption: "Framework for composing LLM tools, prompts, and agents.",
        personalExperience:
          "Built a Pokémon strategy assistant with GPT-4o, four custom tools, Smogon parsers, and regex-routed prompts—cutting output verbosity ~70%.",
        personalWhy:
          "LangChain keeps tool calls and routing organized—I like structuring agents instead of one giant prompt.",
      },
    ],
  },
];
