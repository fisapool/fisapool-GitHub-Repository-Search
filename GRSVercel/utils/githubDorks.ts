export interface DorkTemplate {
  name: string
  description: string
  query: string
  category: string
}

export const dorkCategories = [
  "Security",
  "Code Quality",
  "Repository Discovery",
  "File Search",
  "User & Organization",
  "Issues & PRs",
  "Dependencies",
  "Advanced Combinations",
]

export const commonDorks: DorkTemplate[] = [
  // Security Dorks
  {
    name: "API Keys & Tokens",
    description: "Find potential API keys and tokens in code",
    query: "filename:.env OR filename:config.js password OR api_key OR apikey OR secret OR token",
    category: "Security",
  },
  {
    name: "AWS Keys",
    description: "Find AWS access keys in code",
    query: "AKIA[0-9A-Z]{16}",
    category: "Security",
  },
  {
    name: "Database Connection Strings",
    description: "Find database connection strings",
    query: "mongodb+srv: OR postgresql:// OR jdbc:mysql:// OR jdbc:postgresql://",
    category: "Security",
  },
  {
    name: "Private Keys",
    description: "Find private keys in repositories",
    query: "BEGIN RSA PRIVATE KEY OR BEGIN DSA PRIVATE KEY OR BEGIN EC PRIVATE KEY",
    category: "Security",
  },
  {
    name: "Hardcoded Credentials",
    description: "Find hardcoded credentials in code",
    query: "password OR passwd OR pwd in:file extension:js OR extension:py OR extension:php",
    category: "Security",
  },
  {
    name: "Security Vulnerabilities",
    description: "Find common security issues in code",
    query: "security vulnerability filename:package.json",
    category: "Security",
  },
  {
    name: "Authentication Bypass",
    description: "Find potential authentication bypass code",
    query: "auth bypass OR authentication bypass OR auth skip OR !auth OR auth == null",
    category: "Security",
  },
  {
    name: "SQL Injection Vulnerabilities",
    description: "Find potential SQL injection vulnerabilities",
    query: 'execute(" OR executeQuery(" OR executeUpdate(" OR exec(" OR EXECUTE IMMEDIATE',
    category: "Security",
  },

  // Code Quality Dorks
  {
    name: "TODO Comments",
    description: "Find TODO comments in code",
    query: "TODO filename:js OR filename:ts OR filename:py OR filename:java",
    category: "Code Quality",
  },
  {
    name: "FIXME Comments",
    description: "Find FIXME comments in code",
    query: "FIXME filename:js OR filename:ts OR filename:py OR filename:java",
    category: "Code Quality",
  },
  {
    name: "Deprecated Code",
    description: "Find deprecated code",
    query: "@deprecated filename:js OR filename:ts OR filename:java",
    category: "Code Quality",
  },
  {
    name: "Debug Code",
    description: "Find debug code that might be left in production",
    query: "console.log OR System.out.println OR print( OR debug( filename:js OR filename:java OR filename:py",
    category: "Code Quality",
  },
  {
    name: "Large Functions",
    description: "Find potentially complex functions (many lines)",
    query: "function( extension:js size:>1000",
    category: "Code Quality",
  },
  {
    name: "Code Smells",
    description: "Find potential code smells",
    query: "instanceof OR typeof == OR === null OR == null OR != null",
    category: "Code Quality",
  },

  // Repository Discovery Dorks
  {
    name: "High-Star Repositories",
    description: "Find popular repositories with many stars",
    query: "stars:>10000",
    category: "Repository Discovery",
  },
  {
    name: "Recently Updated Popular Repos",
    description: "Find popular repositories updated recently",
    query: "stars:>1000 pushed:>2023-01-01",
    category: "Repository Discovery",
  },
  {
    name: "Trending Repositories",
    description: "Find repositories that are trending (recently starred)",
    query: "stars:>100 created:>2023-01-01",
    category: "Repository Discovery",
  },
  {
    name: "Beginner-Friendly Projects",
    description: "Find repositories suitable for beginners",
    query: "topic:beginner-friendly good-first-issue:>5",
    category: "Repository Discovery",
  },
  {
    name: "Hackathon Projects",
    description: "Find hackathon projects",
    query: "topic:hackathon stars:>10",
    category: "Repository Discovery",
  },
  {
    name: "Educational Repositories",
    description: "Find repositories for learning",
    query: "topic:education OR topic:tutorial OR topic:learning-resources stars:>100",
    category: "Repository Discovery",
  },
  {
    name: "Open Source Alternatives",
    description: "Find open source alternatives to popular software",
    query: "alternative to filename:README.md stars:>100",
    category: "Repository Discovery",
  },

  // File Search Dorks
  {
    name: "Configuration Files",
    description: "Find configuration files",
    query: "filename:config.json OR filename:settings.json OR filename:.env.example",
    category: "File Search",
  },
  {
    name: "Docker Files",
    description: "Find Docker configuration files",
    query: "filename:Dockerfile OR filename:docker-compose.yml",
    category: "File Search",
  },
  {
    name: "CI/CD Configurations",
    description: "Find CI/CD configuration files",
    query: "filename:.github/workflows OR filename:.gitlab-ci.yml OR filename:azure-pipelines.yml",
    category: "File Search",
  },
  {
    name: "Large JSON Data Files",
    description: "Find large JSON data files",
    query: "extension:json size:>10000",
    category: "File Search",
  },
  {
    name: "API Documentation",
    description: "Find API documentation files",
    query: "filename:api.md OR filename:api-docs.md OR filename:swagger.json OR filename:openapi.yaml",
    category: "File Search",
  },
  {
    name: "Database Schemas",
    description: "Find database schema definitions",
    query: "filename:schema.sql OR filename:migrations extension:sql",
    category: "File Search",
  },
  {
    name: "Test Data",
    description: "Find test data files",
    query: "filename:test-data OR filename:fixtures extension:json OR extension:yaml",
    category: "File Search",
  },

  // User & Organization Dorks
  {
    name: "Repositories by Organization",
    description: "Find repositories from a specific organization",
    query: "org:microsoft stars:>1000",
    category: "User & Organization",
  },
  {
    name: "User's Popular Repositories",
    description: "Find popular repositories from a specific user",
    query: "user:facebook stars:>1000",
    category: "User & Organization",
  },
  {
    name: "Repositories with Many Contributors",
    description: "Find repositories with a large number of contributors",
    query: "stars:>1000 fork:true",
    category: "User & Organization",
  },
  {
    name: "Repositories by Location",
    description: "Find repositories from users in a specific location",
    query: 'location:"San Francisco" language:javascript stars:>100',
    category: "User & Organization",
  },
  {
    name: "Company Open Source Projects",
    description: "Find open source projects from a specific company",
    query: "org:google NOT android NOT chrome stars:>500",
    category: "User & Organization",
  },

  // Issues & PRs Dorks
  {
    name: "Help Wanted Issues",
    description: "Find issues labeled as 'help wanted'",
    query: 'is:issue is:open label:"help wanted"',
    category: "Issues & PRs",
  },
  {
    name: "Good First Issues",
    description: "Find beginner-friendly issues",
    query: 'is:issue is:open label:"good first issue"',
    category: "Issues & PRs",
  },
  {
    name: "Bug Reports",
    description: "Find open bug reports",
    query: "is:issue is:open label:bug",
    category: "Issues & PRs",
  },
  {
    name: "Feature Requests",
    description: "Find open feature requests",
    query: 'is:issue is:open label:"feature request" OR label:enhancement',
    category: "Issues & PRs",
  },
  {
    name: "PRs Needing Review",
    description: "Find pull requests needing review",
    query: "is:pr is:open review:required",
    category: "Issues & PRs",
  },
  {
    name: "Recently Closed Issues",
    description: "Find recently closed issues",
    query: "is:issue is:closed closed:>2023-01-01",
    category: "Issues & PRs",
  },

  // Dependencies Dorks
  {
    name: "Outdated Dependencies",
    description: "Find repositories with outdated dependencies",
    query: '"dependabot[bot]" is:pr is:open',
    category: "Dependencies",
  },
  {
    name: "Specific Package Usage",
    description: "Find repositories using a specific package",
    query: 'filename:package.json "dependencies": {"react":',
    category: "Dependencies",
  },
  {
    name: "Vulnerable Dependencies",
    description: "Find repositories with potentially vulnerable dependencies",
    query: "CVE-2023 filename:package-lock.json",
    category: "Dependencies",
  },
  {
    name: "Dependency Version Ranges",
    description: "Find repositories using dependency version ranges",
    query: 'filename:package.json "^" OR "~" OR "*" OR ">="',
    category: "Dependencies",
  },

  // Advanced Combinations
  {
    name: "Modern React Projects",
    description: "Find modern React projects with TypeScript and hooks",
    query: "language:typescript filename:package.json react-hooks stars:>100 pushed:>2023-01-01",
    category: "Advanced Combinations",
  },
  {
    name: "AI/ML Projects with Documentation",
    description: "Find AI/ML projects with good documentation",
    query: "topic:machine-learning filename:README.md size:>5000 stars:>500",
    category: "Advanced Combinations",
  },
  {
    name: "Serverless Applications",
    description: "Find serverless applications",
    query: "filename:serverless.yml OR filename:netlify.toml stars:>50",
    category: "Advanced Combinations",
  },
  {
    name: "Microservices Architecture",
    description: "Find microservices projects",
    query: "topic:microservices filename:docker-compose.yml stars:>100",
    category: "Advanced Combinations",
  },
  {
    name: "GraphQL APIs",
    description: "Find GraphQL API implementations",
    query: "filename:schema.graphql OR extension:graphql stars:>50",
    category: "Advanced Combinations",
  },
  {
    name: "Web3 & Blockchain Projects",
    description: "Find Web3 and blockchain projects",
    query: "topic:web3 OR topic:blockchain OR topic:ethereum stars:>100 pushed:>2023-01-01",
    category: "Advanced Combinations",
  },
  {
    name: "Mobile App Templates",
    description: "Find mobile app templates and starters",
    query: "topic:react-native OR topic:flutter template OR starter OR boilerplate stars:>100",
    category: "Advanced Combinations",
  },
  {
    name: "E-commerce Solutions",
    description: "Find e-commerce solutions and platforms",
    query: "topic:ecommerce OR topic:e-commerce stars:>100 NOT shopify NOT woocommerce",
    category: "Advanced Combinations",
  },
]

export const dorkOperators = [
  // Search Scope Operators
  { operator: "in:name", description: "Search within repository name", category: "Scope" },
  { operator: "in:description", description: "Search within repository description", category: "Scope" },
  { operator: "in:readme", description: "Search within README files", category: "Scope" },
  { operator: "in:file", description: "Search within file contents", category: "Scope" },
  { operator: "in:path", description: "Search within file paths", category: "Scope" },

  // Repository Attribute Operators
  { operator: "language:", description: "Filter by programming language", category: "Repository" },
  { operator: "stars:>X", description: "Repositories with more than X stars", category: "Repository" },
  { operator: "stars:<X", description: "Repositories with fewer than X stars", category: "Repository" },
  { operator: "stars:X..Y", description: "Repositories with X to Y stars", category: "Repository" },
  { operator: "forks:>X", description: "Repositories with more than X forks", category: "Repository" },
  { operator: "forks:<X", description: "Repositories with fewer than X forks", category: "Repository" },
  { operator: "forks:X..Y", description: "Repositories with X to Y forks", category: "Repository" },
  { operator: "size:>X", description: "Repositories larger than X KB", category: "Repository" },
  { operator: "size:<X", description: "Repositories smaller than X KB", category: "Repository" },
  { operator: "size:X..Y", description: "Repositories between X and Y KB", category: "Repository" },
  { operator: "pushed:>YYYY-MM-DD", description: "Repositories pushed after date", category: "Repository" },
  { operator: "pushed:<YYYY-MM-DD", description: "Repositories pushed before date", category: "Repository" },
  { operator: "created:>YYYY-MM-DD", description: "Repositories created after date", category: "Repository" },
  { operator: "created:<YYYY-MM-DD", description: "Repositories created before date", category: "Repository" },
  { operator: "topic:", description: "Repositories with specific topic", category: "Repository" },
  { operator: "license:", description: "Repositories with specific license", category: "Repository" },
  { operator: "is:public", description: "Public repositories only", category: "Repository" },
  { operator: "is:private", description: "Private repositories only (requires auth)", category: "Repository" },
  { operator: "mirror:true", description: "Repository mirrors", category: "Repository" },
  { operator: "archived:true", description: "Archived repositories", category: "Repository" },
  { operator: "archived:false", description: "Non-archived repositories", category: "Repository" },

  // User & Organization Operators
  { operator: "user:", description: "Repositories by specific user", category: "User" },
  { operator: "org:", description: "Repositories in specific organization", category: "User" },
  { operator: "author:", description: "Commits by specific author", category: "User" },
  { operator: "committer:", description: "Commits by specific committer", category: "User" },
  { operator: "author-name:", description: "Commits by author name", category: "User" },
  { operator: "committer-name:", description: "Commits by committer name", category: "User" },
  { operator: "author-email:", description: "Commits by author email", category: "User" },
  { operator: "committer-email:", description: "Commits by committer email", category: "User" },

  // File Operators
  { operator: "filename:", description: "Repositories containing specific file", category: "File" },
  { operator: "path:", description: "Repositories with files in specific path", category: "File" },
  { operator: "extension:", description: "Repositories with files of specific extension", category: "File" },
  { operator: "file:", description: "Repositories containing a file with specific name", category: "File" },
  { operator: "content:", description: "Search for specific content in files", category: "File" },

  // Issue & PR Operators
  { operator: "is:issue", description: "Search for issues", category: "Issue" },
  { operator: "is:pr", description: "Search for pull requests", category: "Issue" },
  { operator: "is:open", description: "Open issues or PRs", category: "Issue" },
  { operator: "is:closed", description: "Closed issues or PRs", category: "Issue" },
  { operator: "is:merged", description: "Merged pull requests", category: "Issue" },
  { operator: "is:unmerged", description: "Unmerged pull requests", category: "Issue" },
  { operator: "label:", description: "Issues or PRs with specific label", category: "Issue" },
  { operator: "milestone:", description: "Issues or PRs in specific milestone", category: "Issue" },
  { operator: "assignee:", description: "Issues or PRs assigned to specific user", category: "Issue" },
  { operator: "author:", description: "Issues or PRs created by specific user", category: "Issue" },
  { operator: "mentions:", description: "Issues or PRs mentioning specific user", category: "Issue" },
  { operator: "team:", description: "Issues or PRs assigned to specific team", category: "Issue" },
  { operator: "comments:>X", description: "Issues or PRs with more than X comments", category: "Issue" },
  { operator: "created:>YYYY-MM-DD", description: "Issues or PRs created after date", category: "Issue" },
  { operator: "updated:>YYYY-MM-DD", description: "Issues or PRs updated after date", category: "Issue" },
  { operator: "closed:>YYYY-MM-DD", description: "Issues or PRs closed after date", category: "Issue" },
  { operator: "merged:>YYYY-MM-DD", description: "PRs merged after date", category: "Issue" },

  // Boolean Operators
  { operator: "NOT", description: "Exclude repositories matching the following term", category: "Boolean" },
  { operator: "OR", description: "Include repositories matching either term", category: "Boolean" },
  { operator: "AND", description: "Include repositories matching both terms (default)", category: "Boolean" },
]

export function buildDorkQuery(baseQuery: string, options: Record<string, string | boolean>): string {
  let query = baseQuery.trim()

  // Add language filter
  if (options.language) {
    query += ` language:${options.language}`
  }

  // Add star count filter
  if (options.minStars) {
    query += ` stars:>=${options.minStars}`
  }

  // Add date filter
  if (options.updatedAfter) {
    query += ` pushed:>${options.updatedAfter}`
  }

  // Add topic filter
  if (options.topic) {
    query += ` topic:${options.topic}`
  }

  // Add search scope
  if (options.searchInName) {
    query += " in:name"
  }
  if (options.searchInDescription) {
    query += " in:description"
  }
  if (options.searchInReadme) {
    query += " in:readme"
  }

  return query.trim()
}

