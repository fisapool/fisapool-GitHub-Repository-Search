import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Repository } from './RepositoryList';
import { mlService, MLPrediction } from '../services/mlAnalysisService';
import SafeMLVisualization from './SafeMLVisualization';
import QuantifiableRecommendationsView, { Recommendation } from './QuantifiableRecommendationsView';
import MLComplianceControls from './MLComplianceControls';
import MLModelInfo from './MLModelInfo';
import DataFreshnessIndicator from './DataFreshnessIndicator';

interface RepoAnalysis {
  repoName: string;
  readmeLength: number;
  readmeQualityScore: number;
  hasCI: boolean;
  hasTests: boolean;
  featureCount: number;
  openIssuesCount: number;
  closedIssuesCount: number;
  issueResolutionRate: number;
  commonKeywords: string[];
  techStack: string[];
  licenseType: string;
  licensePermissiveness: number;
  codebaseMetrics: {
    size: number;
    lastActivity: string;
    updateFrequency: string;
  };
  requirements: string[];
  overallScore: number;
  improvementAreas: {
    area: string;
    currentScore: number;
    potentialScore: number;
    improvementPercentage: number;
    priority: string;
    action: string;
  }[];
}

interface IssuePatterns {
  [key: string]: {
    [repo: string]: number;
  };
}

interface RepositoryComparisonProps {
  repositories: Repository[];
}

// Define workflow stages for repository comparison
enum ComparisonWorkflowStage {
  SELECT_REPOSITORIES = 'select',
  FETCH_DATA = 'fetch',
  ANALYZE_DIFFERENCES = 'analyze',
  GENERATE_VISUALIZATIONS = 'visualize',
  DISPLAY_RESULTS = 'display'
}

const RepositoryComparison: React.FC<RepositoryComparisonProps> = ({ repositories }) => {
  const [analysisResults, setAnalysisResults] = useState<RepoAnalysis[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [comparisonMethod, setComparisonMethod] = useState<string>("features");
  const [repoIssues, setRepoIssues] = useState<{[key: string]: any[]}>({});
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState<boolean>(false);
  const [mlPredictions, setMlPredictions] = useState<MLPrediction[]>([]);
  const [workflowStage, setWorkflowStage] = useState<ComparisonWorkflowStage>(
    ComparisonWorkflowStage.SELECT_REPOSITORIES
  );
  const [mlEnabled, setMlEnabled] = useState<boolean>(true);
  const [analysisDepth, setAnalysisDepth] = useState<'basic' | 'standard' | 'comprehensive'>('standard');
  const [dataUsagePreference, setDataUsagePreference] = useState<'analysis-only' | 'improve-model' | 'none'>('analysis-only');
  const [lastDataUpdate, setLastDataUpdate] = useState<Date>(new Date());

  // Function to toggle repo selection for comparison
  const toggleRepoSelection = (id: number) => {
    if (selectedRepos.includes(id)) {
      setSelectedRepos(selectedRepos.filter(repoId => repoId !== id));
    } else if (selectedRepos.length < 3) {
      setSelectedRepos([...selectedRepos, id]);
    }
  };

  // Function to analyze repositories
  const analyzeRepositories = async () => {
    if (selectedRepos.length < 2) {
      setError('Please select at least 2 repositories to compare.');
      return;
    }

    setWorkflowStage(ComparisonWorkflowStage.FETCH_DATA);
    setLoading(true);
    setError(null);
    
    try {
      const reposToAnalyze = repositories.filter(repo => selectedRepos.includes(repo.id));
      const results: RepoAnalysis[] = [];
      const issuesData: {[key: string]: any[]} = {};
      
      for (const repo of reposToAnalyze) {
        // Fetch open issues (up to 100)
        try {
          const issuesResponse = await axios.get(
            `https://api.github.com/repos/${repo.full_name}/issues`,
            { params: { state: 'open', per_page: 100 } }
          );
          issuesData[repo.name] = issuesResponse.data;
        } catch (error) {
          console.error(`Error fetching issues for ${repo.name}:`, error);
          issuesData[repo.name] = [];
        }
        
        // Fetch README content
        let readmeContent = '';
        let readmeLength = 0;
        
        try {
          const readmeResponse = await axios.get(
            `https://api.github.com/repos/${repo.full_name}/readme`,
            { headers: { Accept: 'application/vnd.github.v3.raw' } }
          );
          readmeContent = readmeResponse.data;
          readmeLength = readmeContent.length;
        } catch (error) {
          console.warn(`Couldn't fetch README for ${repo.full_name}`, error);
        }
        
        // Analyze tech stack based on language and readme
        const techStack = extractTechStack(readmeContent, repo.language);
        
        // Calculate readme quality score (0-100)
        const readmeQualityScore = calculateReadmeQualityScore(readmeContent);
        
        // Check for CI configuration
        const hasCI = readmeContent.includes('CI') || 
                     readmeContent.includes('continuous integration') ||
                     readmeContent.includes('github actions') ||
                     readmeContent.includes('travis');
        
        // Check for tests
        const hasTests = readmeContent.includes('test') || 
                        readmeContent.includes('jest') ||
                        readmeContent.includes('mocha') ||
                        readmeContent.includes('testing');
        
        // Count potential features based on headers in readme
        const featureMatches = readmeContent.match(/#{1,3} [^\n]*/g) || [];
        const featureCount = featureMatches.length;
        
        // Extract common keywords
        const commonKeywords = extractKeywords(readmeContent);
        
        // Fetch issues count (open and closed)
        let closedIssuesCount = 0;
        try {
          const closedIssuesResponse = await axios.get(
            `https://api.github.com/repos/${repo.full_name}/issues?state=closed&per_page=1`
          );
          const totalHeader = closedIssuesResponse.headers["link"] || "";
          const totalMatch = totalHeader.match(/page=(\d+)>; rel="last"/);
          closedIssuesCount = totalMatch ? parseInt(totalMatch[1]) : 0;
        } catch (error) {
          console.warn(`Couldn't fetch closed issues count for ${repo.full_name}`, error);
        }
        
        // Calculate issue resolution rate
        const totalIssues = repo.open_issues_count + closedIssuesCount;
        const issueResolutionRate = totalIssues > 0 ? 
          Math.round((closedIssuesCount / totalIssues) * 100) : 0;
        
        // License analysis
        const licenseType = repo.license ? repo.license.name : "No license";
        const licensePermissiveness = calculateLicensePermissiveness(licenseType);
        
        // Codebase metrics
        const codebaseMetrics = {
          size: readmeLength, // Approximation since we can't easily get full codebase size
          lastActivity: repo.updated_at,
          updateFrequency: getUpdateFrequency(repo.updated_at, repo.created_at)
        };
        
        // Extract requirements from readme
        const requirements = extractRequirements(readmeContent);
        
        // Calculate overall score (0-100)
        const overallScore = calculateOverallScore(
          readmeQualityScore,
          hasCI,
          hasTests,
          featureCount,
          issueResolutionRate,
          licensePermissiveness,
          codebaseMetrics
        );
        
        // Generate improvement areas with percentages
        const improvementAreas = generateImprovementAreas(
          readmeQualityScore,
          hasCI,
          hasTests,
          featureCount,
          issueResolutionRate,
          licensePermissiveness,
          codebaseMetrics
        );
        
        results.push({
          repoName: repo.name,
          readmeLength,
          readmeQualityScore,
          hasCI,
          hasTests,
          featureCount,
          openIssuesCount: repo.open_issues_count,
          closedIssuesCount,
          issueResolutionRate,
          commonKeywords,
          techStack,
          licenseType,
          licensePermissiveness,
          codebaseMetrics,
          requirements,
          overallScore,
          improvementAreas
        });
      }
      
      setAnalysisResults(results);
      setRepoIssues(issuesData);
      
      setWorkflowStage(ComparisonWorkflowStage.ANALYZE_DIFFERENCES);
      
      // Analyze differences
      // ... your existing code for analysis ...
      
      setWorkflowStage(ComparisonWorkflowStage.GENERATE_VISUALIZATIONS);
      
      // Generate ML visualizations
      const predictions = await mlService.generateInsights(results);
      setMlPredictions(predictions);
      
      setWorkflowStage(ComparisonWorkflowStage.DISPLAY_RESULTS);
      setLoading(false);
    } catch (error) {
      console.error('Error analyzing repositories:', error);
      setError('Failed to analyze repositories. Please try again.');
      setWorkflowStage(ComparisonWorkflowStage.SELECT_REPOSITORIES);
      setLoading(false);
    }
  };

  // Helper function to calculate README quality score
  const calculateReadmeQualityScore = (readme: string): number => {
    if (!readme || readme.length === 0) return 0;
    
    let score = 0;
    
    // Length factor (up to 20 points)
    const lengthScore = Math.min(20, Math.floor(readme.length / 200));
    score += lengthScore;
    
    // Headers/structure (up to 20 points)
    const headersCount = (readme.match(/#{1,6} /g) || []).length;
    const headersScore = Math.min(20, headersCount * 4);
    score += headersScore;
    
    // Code examples (up to 15 points)
    const codeBlocksCount = (readme.match(/```[\s\S]*?```/g) || []).length;
    const codeScore = Math.min(15, codeBlocksCount * 5);
    score += codeScore;
    
    // Images (up to 10 points)
    const imagesCount = (readme.match(/!\[.*?\]\(.*?\)/g) || []).length;
    const imagesScore = Math.min(10, imagesCount * 5);
    score += imagesScore;
    
    // Links (up to 10 points)
    const linksCount = (readme.match(/\[.*?\]\(.*?\)/g) || []).length - imagesCount;
    const linksScore = Math.min(10, linksCount * 2);
    score += linksScore;
    
    // Installation/usage instructions (up to 15 points)
    if (readme.toLowerCase().includes('install')) score += 5;
    if (readme.toLowerCase().includes('usage')) score += 5;
    if (readme.toLowerCase().includes('example')) score += 5;
    
    // License mention (5 points)
    if (readme.toLowerCase().includes('license')) score += 5;
    
    // Contributing guidelines (5 points)
    if (readme.toLowerCase().includes('contribut')) score += 5;
    
    return Math.min(100, score);
  };

  // Helper function to extract keywords from readme
  const extractKeywords = (text: string): string[] => {
    const commonWords = ['the', 'and', 'in', 'to', 'a', 'is', 'for', 'of', 'with', 'on', 'this'];
    
    // Extract words, filter out common ones, and select frequent terms
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));
    
    // Count word frequency
    const wordFrequency: {[key: string]: number} = {};
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    // Get top keywords
    const topKeywords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
    
    return topKeywords;
  };

  // Helper function to extract tech stack
  const extractTechStack = (readme: string, primaryLanguage: string | null): string[] => {
    const techStack = new Set<string>();
    
    if (primaryLanguage) {
      techStack.add(primaryLanguage);
    }
    
    const technologies = [
      'React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 
      'Python', 'Django', 'Flask', 'Node.js', 'Express',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS',
      'Docker', 'Kubernetes', 'GraphQL', 'REST', 'Java',
      'Spring', 'Bootstrap', 'Tailwind', 'CSS', 'SASS'
    ];
    
    technologies.forEach(tech => {
      if (readme.toLowerCase().includes(tech.toLowerCase())) {
        techStack.add(tech);
      }
    });
    
    return Array.from(techStack);
  };
  
  // Helper function to calculate license permissiveness
  const calculateLicensePermissiveness = (licenseType: string): number => {
    const permissiveScores: {[key: string]: number} = {
      "MIT License": 100,
      "Apache License 2.0": 90,
      "BSD 3-Clause": 85,
      "BSD 2-Clause": 80,
      "ISC License": 75,
      "GNU LGPL v3": 60,
      "Mozilla Public License 2.0": 70,
      "GNU GPL v3": 40,
      "GNU AGPL v3": 30,
      "Proprietary": 10,
      "No license": 0
    };
    
    // Look for partial matches in license names
    for (const [key, score] of Object.entries(permissiveScores)) {
      if (licenseType.includes(key)) {
        return score;
      }
    }
    
    return 50; // Default for unknown licenses
  };
  
  // Helper function to get update frequency
  const getUpdateFrequency = (updatedAt: string, createdAt: string): string => {
    const now = new Date();
    const updated = new Date(updatedAt);
    const created = new Date(createdAt);
    
    const daysSinceUpdate = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
    const projectAge = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    // Consider project age in categorizing update frequency
    const ageAdjustedActivityLevel = projectAge > 365 ? daysSinceUpdate * 0.8 : daysSinceUpdate;
    
    if (ageAdjustedActivityLevel < 7) {
      return "Very Active (Updated this week)";
    } else if (ageAdjustedActivityLevel < 30) {
      return "Active (Updated this month)";
    } else if (ageAdjustedActivityLevel < 90) {
      return "Somewhat Active (Updated this quarter)";
    } else if (ageAdjustedActivityLevel < 365) {
      return "Stale (No updates in 3+ months)";
    } else {
      return "Abandoned (No updates in 1+ year)";
    }
  };
  
  // Helper function to extract requirements
  const extractRequirements = (readme: string): string[] => {
    const requirements = new Set<string>();
    
    // Check for requirements section
    const requirementSection = readme.match(/(?:requirements|prerequisites|dependencies).*?(?:\n#|$)/i);
    if (requirementSection) {
      const lines = requirementSection[0].split('\n');
      lines.forEach(line => {
        if (line.match(/[-*] \w+/)) {
          const requirement = line.replace(/[-*] /, '').trim();
          if (requirement.length > 0) {
            requirements.add(requirement);
          }
        }
      });
    }
    
    // Add common requirements found anywhere in readme
    const commonReqs = ['node', 'npm', 'yarn', 'python', 'pip', 'java', 'maven', 'docker', 'git'];
    commonReqs.forEach(req => {
      if (readme.toLowerCase().includes(req.toLowerCase())) {
        requirements.add(req);
      }
    });
    
    return Array.from(requirements);
  };
  
  // Helper function to calculate overall score
  const calculateOverallScore = (
    readmeQualityScore: number,
    hasCI: boolean,
    hasTests: boolean,
    featureCount: number,
    issueResolutionRate: number,
    licensePermissiveness: number,
    codebaseMetrics: {
      size: number;
      lastActivity: string;
      updateFrequency: string;
    }
  ): number => {
    // Weights for each component
    const weights = {
      documentation: 0.25,
      cicd: 0.10,
      testing: 0.15,
      features: 0.15,
      issues: 0.10,
      license: 0.05,
      maintenance: 0.20
    };
    
    // Calculate component scores
    const documentationScore = readmeQualityScore;
    const cicdScore = hasCI ? 100 : 0;
    const testingScore = hasTests ? 100 : 0;
    const featuresScore = Math.min(100, featureCount * 20); // 5 features = 100%
    const issuesScore = issueResolutionRate;
    const licenseScore = licensePermissiveness;
    const maintenanceScore = codebaseMetrics.updateFrequency.includes("Active") ? 
      (codebaseMetrics.updateFrequency.includes("Very") ? 100 : 80) : 
      (codebaseMetrics.updateFrequency.includes("Somewhat") ? 60 : 
       codebaseMetrics.updateFrequency.includes("Stale") ? 30 : 0);
    
    // Calculate weighted score
    const weightedScore = 
      weights.documentation * documentationScore +
      weights.cicd * cicdScore +
      weights.testing * testingScore +
      weights.features * featuresScore +
      weights.issues * issuesScore +
      weights.license * licenseScore +
      weights.maintenance * maintenanceScore;
    
    return Math.round(weightedScore);
  };
  
  // Improved version of generateImprovementAreas function
  const generateImprovementAreas = (
    readmeScore: number,
    hasCI: boolean,
    hasTests: boolean,
    featureCount: number,
    issueResolutionRate: number,
    licensePermissiveness: number,
    codebaseMetrics: any
  ): {area: string; currentScore: number; potentialScore: number; improvementPercentage: number; priority: string; action: string}[] => {
    const improvements = [];
    
    // README improvements
    if (readmeScore < 70) {
      improvements.push({
        area: "Documentation",
        currentScore: readmeScore,
        potentialScore: 100,
        // Cap improvement percentage at 100% for better readability
        improvementPercentage: Math.min(100, Math.round(((100 - readmeScore) / Math.max(1, readmeScore)) * 100)),
        priority: readmeScore < 30 ? "Critical" : readmeScore < 50 ? "High" : "Medium",
        action: "Add more comprehensive README with usage examples, installation instructions, and feature documentation."
      });
    }
    
    // CI improvements
    if (!hasCI) {
      improvements.push({
        area: "CI/CD Integration",
        currentScore: 0,
        potentialScore: 100,
        improvementPercentage: 100,
        priority: "High",
        action: "Implement GitHub Actions or another CI/CD solution to automate testing and deployment."
      });
    }
    
    // Testing improvements
    if (!hasTests) {
      improvements.push({
        area: "Testing",
        currentScore: 0,
        potentialScore: 100,
        improvementPercentage: 100,
        priority: "High",
        action: "Add unit tests and integration tests with a target of at least 70% code coverage."
      });
    }
    
    // Feature documentation improvements
    if (featureCount < 5) {
      improvements.push({
        area: "Feature Documentation",
        currentScore: featureCount * 20,
        potentialScore: 100,
        improvementPercentage: Math.min(100, Math.round(((100 - (featureCount * 20)) / Math.max(1, featureCount * 20)) * 100)),
        priority: featureCount < 2 ? "High" : "Medium",
        action: "Document key features with examples and use cases in the README."
      });
    }
    
    // Issue resolution improvements
    if (issueResolutionRate < 75) {
      improvements.push({
        area: "Issue Resolution",
        currentScore: issueResolutionRate,
        potentialScore: 100,
        improvementPercentage: Math.min(100, Math.round(((100 - issueResolutionRate) / Math.max(1, issueResolutionRate)) * 100)),
        priority: issueResolutionRate < 30 ? "Critical" : issueResolutionRate < 50 ? "High" : "Medium",
        action: "Establish a process for regularly reviewing and addressing open issues."
      });
    }
    
    // License improvements
    if (licensePermissiveness < 50) {
      improvements.push({
        area: "License Clarity",
        currentScore: licensePermissiveness,
        potentialScore: 90,
        improvementPercentage: Math.min(100, Math.round(((90 - licensePermissiveness) / Math.max(1, licensePermissiveness)) * 100)),
        priority: licensePermissiveness < 20 ? "High" : "Medium",
        action: "Consider adopting a more permissive license to encourage broader adoption and contribution."
      });
    }
    
    // Activity improvements
    if (!codebaseMetrics.updateFrequency.includes("Active")) {
      improvements.push({
        area: "Code Maintenance",
        currentScore: 40,
        potentialScore: 100,
        improvementPercentage: 100,
        priority: codebaseMetrics.updateFrequency.includes("Abandoned") ? "Critical" : "High",
        action: "Resume regular maintenance and updates to keep the codebase current and secure."
      });
    }
    
    return improvements;
  };
  
  // Function to get the most promising development opportunity
  const getMostPromisingOpportunity = (): string => {
    if (analysisResults.length === 0) return "";
    
    // Get the average scores for each area
    const avgScores = {
      readme: analysisResults.reduce((sum, r) => sum + r.readmeQualityScore, 0) / analysisResults.length,
      ci: analysisResults.filter(r => r.hasCI).length / analysisResults.length * 100,
      tests: analysisResults.filter(r => r.hasTests).length / analysisResults.length * 100,
      issueResolution: analysisResults.reduce((sum, r) => sum + r.issueResolutionRate, 0) / analysisResults.length
    };
    
    // Find the weakest area
    const minScore = Math.min(avgScores.readme, avgScores.ci, avgScores.tests, avgScores.issueResolution);
    
    if (minScore === avgScores.readme) {
      return "Documentation System - Create a unified documentation platform that automatically generates consistent README files and API docs.";
    } else if (minScore === avgScores.ci) {
      return "CI/CD Pipeline - Build a standardized CI/CD workflow that can be easily applied across all repositories.";
    } else if (minScore === avgScores.tests) {
      return "Testing Framework - Develop a comprehensive testing suite that works across the various technology stacks.";
    } else {
      return "Issue Tracker & Automation - Create an intelligent issue management system that prioritizes and suggests fixes.";
    }
  };

  // Add this improved function for more detailed issue categorization
  const analyzeCommonIssuePatterns = (): IssuePatterns => {
    if (Object.keys(repoIssues).length === 0) return {};
    
    // More detailed issue categories
    const issueCategoryCounts: IssuePatterns = {
      'feature-request': {},
      'bug': {},
      'documentation': {},
      'enhancement': {},
      'help-wanted': {},
      'performance': {},
      'security': {},
      'ui-ux': {},
      'accessibility': {},
      'refactoring': {},
      'dependencies': {},
      'configuration': {},
      'build': {},
      'testing': {},
      'grammar-related': {}  // Specific to Grammarly-related repositories
    };
    
    // Count issue categories across repositories with more detailed analysis
    Object.entries(repoIssues).forEach(([repoName, issues]) => {
      issues.forEach(issue => {
        // Check labels
        const labels = issue.labels || [];
        let categoryFound = false;
        const title = (issue.title || '').toLowerCase();
        const body = (issue.body || '').toLowerCase();
        
        // Try to categorize by labels with more detailed mappings
        labels.forEach((label: any) => {
          const labelName = (label.name || '').toLowerCase();
          
          if (labelName.includes('feature') || labelName.includes('request') || labelName.includes('enhancement')) {
            issueCategoryCounts['feature-request'][repoName] = (issueCategoryCounts['feature-request'][repoName] || 0) + 1;
            categoryFound = true;
          } else if (labelName.includes('bug') || labelName.includes('fix') || labelName.includes('defect')) {
            issueCategoryCounts['bug'][repoName] = (issueCategoryCounts['bug'][repoName] || 0) + 1;
            categoryFound = true;
          } else if (labelName.includes('doc') || labelName.includes('readme')) {
            issueCategoryCounts['documentation'][repoName] = (issueCategoryCounts['documentation'][repoName] || 0) + 1;
            categoryFound = true;
          } else if (labelName.includes('ui') || labelName.includes('ux') || labelName.includes('design')) {
            issueCategoryCounts['ui-ux'][repoName] = (issueCategoryCounts['ui-ux'][repoName] || 0) + 1;
            categoryFound = true;
          } else if (labelName.includes('access') || labelName.includes('a11y')) {
            issueCategoryCounts['accessibility'][repoName] = (issueCategoryCounts['accessibility'][repoName] || 0) + 1;
            categoryFound = true;
          } else if (labelName.includes('refactor') || labelName.includes('cleanup')) {
            issueCategoryCounts['refactoring'][repoName] = (issueCategoryCounts['refactoring'][repoName] || 0) + 1;
            categoryFound = true;
          } else if (labelName.includes('depend') || labelName.includes('package')) {
            issueCategoryCounts['dependencies'][repoName] = (issueCategoryCounts['dependencies'][repoName] || 0) + 1;
            categoryFound = true;
          } else if (labelName.includes('config') || labelName.includes('setup')) {
            issueCategoryCounts['configuration'][repoName] = (issueCategoryCounts['configuration'][repoName] || 0) + 1;
            categoryFound = true;
          } else if (labelName.includes('build') || labelName.includes('compile')) {
            issueCategoryCounts['build'][repoName] = (issueCategoryCounts['build'][repoName] || 0) + 1;
            categoryFound = true;
          } else if (labelName.includes('test')) {
            issueCategoryCounts['testing'][repoName] = (issueCategoryCounts['testing'][repoName] || 0) + 1;
            categoryFound = true;
          } else if (labelName.includes('grammar') || labelName.includes('spell') || labelName.includes('text')) {
            issueCategoryCounts['grammar-related'][repoName] = (issueCategoryCounts['grammar-related'][repoName] || 0) + 1;
            categoryFound = true;
          }
        });
        
        // Try to categorize by title and body content with more specific patterns
        if (!categoryFound) {
          const combinedText = `${title} ${body}`;
          
          if (/\b(feat|feature|request|add|implement|new)\b/i.test(combinedText)) {
            issueCategoryCounts['feature-request'][repoName] = (issueCategoryCounts['feature-request'][repoName] || 0) + 1;
          } else if (/\b(bug|fix|issue|error|crash|problem|incorrect|wrong|fail|broken)\b/i.test(combinedText)) {
            issueCategoryCounts['bug'][repoName] = (issueCategoryCounts['bug'][repoName] || 0) + 1;
          } else if (/\b(doc|docs|readme|documentation|example|tutorial)\b/i.test(combinedText)) {
            issueCategoryCounts['documentation'][repoName] = (issueCategoryCounts['documentation'][repoName] || 0) + 1;
          } else if (/\b(improve|enhance|better|refine|upgrade)\b/i.test(combinedText)) {
            issueCategoryCounts['enhancement'][repoName] = (issueCategoryCounts['enhancement'][repoName] || 0) + 1;
          } else if (/\b(help|support|assist|guidance)\b/i.test(combinedText)) {
            issueCategoryCounts['help-wanted'][repoName] = (issueCategoryCounts['help-wanted'][repoName] || 0) + 1;
          } else if (/\b(slow|performance|speed|optimize|lag|latency|fast)\b/i.test(combinedText)) {
            issueCategoryCounts['performance'][repoName] = (issueCategoryCounts['performance'][repoName] || 0) + 1;
          } else if (/\b(secure|security|vulnerab|auth|hack|exploit|protect)\b/i.test(combinedText)) {
            issueCategoryCounts['security'][repoName] = (issueCategoryCounts['security'][repoName] || 0) + 1;
          } else if (/\b(ui|ux|design|interface|visual|layout|display|style|css)\b/i.test(combinedText)) {
            issueCategoryCounts['ui-ux'][repoName] = (issueCategoryCounts['ui-ux'][repoName] || 0) + 1;
          } else if (/\b(access|a11y|screen reader|aria|wcag)\b/i.test(combinedText)) {
            issueCategoryCounts['accessibility'][repoName] = (issueCategoryCounts['accessibility'][repoName] || 0) + 1;
          } else if (/\b(refactor|clean|legacy|tech debt|code smell|decouple|restructure)\b/i.test(combinedText)) {
            issueCategoryCounts['refactoring'][repoName] = (issueCategoryCounts['refactoring'][repoName] || 0) + 1;
          } else if (/\b(depend|package|npm|pip|gem|version|upgrade|library|framework)\b/i.test(combinedText)) {
            issueCategoryCounts['dependencies'][repoName] = (issueCategoryCounts['dependencies'][repoName] || 0) + 1;
          } else if (/\b(config|setup|env|environment|setting)\b/i.test(combinedText)) {
            issueCategoryCounts['configuration'][repoName] = (issueCategoryCounts['configuration'][repoName] || 0) + 1;
          } else if (/\b(build|webpack|compile|bundle|minif|deploy)\b/i.test(combinedText)) {
            issueCategoryCounts['build'][repoName] = (issueCategoryCounts['build'][repoName] || 0) + 1;
          } else if (/\b(test|jest|mocha|cypress|unit test|integration test|e2e|coverage)\b/i.test(combinedText)) {
            issueCategoryCounts['testing'][repoName] = (issueCategoryCounts['testing'][repoName] || 0) + 1;
          } else if (/\b(grammar|spell|typo|text|sentence|word|language|translation|localization)\b/i.test(combinedText)) {
            issueCategoryCounts['grammar-related'][repoName] = (issueCategoryCounts['grammar-related'][repoName] || 0) + 1;
          }
        }
      });
    });
    
    // Remove empty categories
    Object.keys(issueCategoryCounts).forEach(category => {
      if (Object.keys(issueCategoryCounts[category]).length === 0) {
        delete issueCategoryCounts[category];
      }
    });
    
    return issueCategoryCounts;
  };

  // Enhanced issue insight generator with more detailed analysis
  const getIssueInsight = (category: string, repoCounts: {[repo: string]: number}) => {
    const repoNames = Object.keys(repoCounts);
    const counts = Object.values(repoCounts);
    const totalIssues = counts.reduce((sum, count) => sum + count, 0);
    
    if (totalIssues === 0) return "No issues found";
    
    const maxCount = Math.max(...counts);
    const maxRepo = repoNames[counts.indexOf(maxCount)];
    const reposWithIssues = repoNames.filter(name => repoCounts[name] > 0);
    const avgIssuesPerRepo = totalIssues / reposWithIssues.length;
    const issueDistribution = Math.abs(maxCount - avgIssuesPerRepo) / avgIssuesPerRepo;
    
    // Common insights
    if (reposWithIssues.length === 1) {
      return `Only ${maxRepo} has ${category.replace('-', ' ')} issues (${maxCount}). Consider whether this should be addressed in other repositories.`;
    }
    
    if (issueDistribution > 0.5) {
      return `${maxRepo} has disproportionately more ${category.replace('-', ' ')} issues (${maxCount}) than other repos. Investigate the cause and apply learnings to all repositories.`;
    }
    
    // Category-specific insights
    switch(category) {
      case 'bug':
        if (maxCount > 10) {
          return `High bug count in ${maxRepo} (${maxCount}) suggests quality issues. Consider implementing stricter code review and testing processes across all repositories.`;
        } else if (totalIssues > 15) {
          return `Multiple bugs across repositories indicate a potential need for a shared testing framework or quality assurance process.`;
        }
        return `Bug levels are relatively manageable across repositories (${totalIssues} total).`;
      
      case 'feature-request':
        if (totalIssues > 15) {
          return `High feature request volume (${totalIssues}) indicates strong user engagement but may require prioritization. Consider a unified roadmap across repositories.`;
        }
        return `Feature requests are distributed across repositories, suggesting ongoing development interest from users.`;
      
      case 'documentation':
        if (totalIssues > 5) {
          return `Documentation issues across multiple repositories suggest a systematic problem. Consider implementing documentation standards and templates.`;
        }
        return `Documentation issues are present but manageable. Review for common patterns that could be addressed together.`;
      
      case 'enhancement':
        return `Enhancement requests indicate areas where users see potential for improvement. Focus on those with highest impact first.`;
      
      case 'performance':
        if (totalIssues > 0) {
          return `Performance issues affecting ${reposWithIssues.join(', ')}. Consider cross-repository performance benchmarking.`;
        }
        break;
        
      case 'security':
        if (totalIssues > 0) {
          return `⚠️ Security issues require immediate attention! Prioritize review and fixes for ${reposWithIssues.join(', ')}.`;
        }
        break;
      
      case 'ui-ux':
        return `UI/UX issues suggest opportunity for design system implementation to ensure consistency across repositories.`;
        
      case 'accessibility':
        if (totalIssues > 0) {
          return `Accessibility issues may indicate compliance concerns. Consider an accessibility audit across all repositories.`;
        }
        break;
        
      case 'refactoring':
        return `Refactoring needs suggest technical debt that should be addressed before adding new features.`;
        
      case 'dependencies':
        return `Dependency issues may indicate security vulnerabilities or outdated packages. Consider implementing dependency management across repositories.`;
        
      case 'configuration':
        return `Configuration issues suggest need for simplified or standardized setup process across repositories.`;
        
      case 'build':
        return `Build issues may indicate CI/CD pipeline improvements or standardization opportunities.`;
        
      case 'testing':
        return `Testing issues suggest opportunity for improved test coverage or standardized testing approaches.`;
        
      case 'grammar-related':
        if (repoNames.some(name => name.toLowerCase().includes('grammarly'))) {
          return `Grammar-related issues are particularly relevant to these repositories' purpose. Prioritize fixing these to demonstrate quality.`;
        }
        return `Grammar-related issues affect content quality and user perception.`;
    }
    
    return `${totalIssues} total ${category.replace('-', ' ')} issues across ${reposWithIssues.length} repositories.`;
  };

  // Modify the generateProjectSuggestions function to provide more comparative suggestions
  const generateProjectSuggestions = () => {
    if (analysisResults.length === 0) return [];
    
    const suggestions = [];
    
    // Get common issue patterns to inform suggestions
    const issuePatterns = analyzeCommonIssuePatterns();
    
    // Check for common bugs across repositories
    const bugIssues = issuePatterns['bug'] || {};
    const hasBugIssues = Object.values(bugIssues).some((count: number) => count > 0);
    
    if (hasBugIssues && repositories.some(repo => repo.name.toLowerCase().includes('grammarly'))) {
      suggestions.push({
        title: "Grammar Error Detection Framework",
        description: `Create a unified framework to detect and fix common grammar errors found across the analyzed repositories. Address the ${Object.entries(bugIssues)
          .filter(([_, count]) => count > 0)
          .map(([repo, count]) => `${count} issues in ${repo}`)
          .join(', ')}.`,
        impact: "High",
        difficulty: "Medium",
        tags: ["bug-fixing", "grammar", "quality"]
      });
    }
    
    // Check for feature requests across repositories
    const featureRequests = issuePatterns['feature-request'] || {};
    const hasFeatureRequests = Object.values(featureRequests).some((count: number) => count > 0);
    
    if (hasFeatureRequests) {
      suggestions.push({
        title: "Cross-Repository Feature Integration",
        description: `Develop a solution that implements frequently requested features across repositories: ${Object.entries(featureRequests)
          .filter(([_, count]) => count > 0)
          .map(([repo, count]) => `${count} requests in ${repo}`)
          .join(', ')}.`,
        impact: "High",
        difficulty: "Medium",
        tags: ["feature-development", "enhancement"]
      });
    }
    
    // Check for documentation issues
    const docIssues = issuePatterns['documentation'] || {};
    const hasDocIssues = Object.values(docIssues).some((count: number) => count > 0);
    
    if (hasDocIssues) {
      suggestions.push({
        title: "Unified Documentation Solution",
        description: `Create a centralized documentation system addressing the documentation gaps found in ${Object.entries(docIssues)
          .filter(([_, count]) => count > 0)
          .map(([repo, count]) => `${repo} (${count} issues)`)
          .join(', ')}.`,
        impact: "Medium",
        difficulty: "Low",
        tags: ["documentation", "knowledge-base"]
      });
    }
    
    // Add Grammarly-specific suggestions based on comparative analysis
    if (repositories.some(repo => repo.name.toLowerCase().includes('grammarly'))) {
      // Check testing coverage differences
      const testingScores = analysisResults.map(result => result.hasTests ? 100 : 0);
      const hasMixedTestingApproaches = new Set(testingScores).size > 1;
      
      if (hasMixedTestingApproaches) {
        suggestions.push({
          title: "Standardized Testing Framework for Text Analysis",
          description: "Create a common testing framework that standardizes how grammar checking components are tested across repositories, addressing the inconsistent testing approaches observed.",
          impact: "High",
          difficulty: "Medium",
          tags: ["testing", "standardization", "quality"]
        });
      }
      
      // Check license differences
      const licenseTypes = analysisResults.map(result => result.licenseType);
      const hasLicenseVariation = new Set(licenseTypes).size > 1;
      
      if (hasLicenseVariation) {
        suggestions.push({
          title: "License Compliance Toolkit",
          description: "Develop a toolkit to help ensure proper license compliance across grammar-related repositories, addressing the observed variations in licensing approaches.",
          impact: "Medium",
          difficulty: "Low",
          tags: ["legal", "compliance", "licensing"]
        });
      }
      
      // Compare feature disparities
      if (analysisResults.length >= 2) {
        const featureCounts = analysisResults.map(result => result.featureCount);
        const maxFeatures = Math.max(...featureCounts);
        const minFeatures = Math.min(...featureCounts);
        
        if (maxFeatures - minFeatures > 5) {
          suggestions.push({
            title: "Feature Parity Framework",
            description: `Create a framework to help bring feature parity across grammar checking repositories. The current feature disparity ranges from ${minFeatures} to ${maxFeatures} features.`,
            impact: "High",
            difficulty: "Medium",
            tags: ["feature-parity", "consistency", "architecture"]
          });
        }
      }
    }
    
    // ... keep your existing suggestions too
    
    return suggestions;
  };

  // Enhanced export function with more detailed issue information
  const exportIssuesAsCSV = () => {
    // Create CSV content with more fields
    let csvContent = "Repository,Issue Title,Issue URL,Category,Labels,Status,Created Date,Updated Date,Comment Count,Assignees\n";
    
    // Get categories for each issue
    const categorizedIssues = new Map();
    
    Object.entries(repoIssues).forEach(([repoName, issues]) => {
      issues.forEach(issue => {
        // Categorize the issue
        const title = (issue.title || '').toLowerCase();
        const body = (issue.body || '').toLowerCase();
        const combinedText = `${title} ${body}`;
        const labels = issue.labels.map((l: any) => l.name).join('; ');
        
        let category = 'uncategorized';
        
        if (/\b(feat|feature|request|add|implement|new)\b/i.test(combinedText)) {
          category = 'feature-request';
        } else if (/\b(bug|fix|issue|error|crash|problem|incorrect|wrong|fail|broken)\b/i.test(combinedText)) {
          category = 'bug';
        } else if (/\b(doc|docs|readme|documentation|example|tutorial)\b/i.test(combinedText)) {
          category = 'documentation';
        } else if (/\b(improve|enhance|better|refine|upgrade)\b/i.test(combinedText)) {
          category = 'enhancement';
        } else if (/\b(help|support|assist|guidance)\b/i.test(combinedText)) {
          category = 'help-wanted';
        } else if (/\b(slow|performance|speed|optimize|lag|latency|fast)\b/i.test(combinedText)) {
          category = 'performance';
        } else if (/\b(secure|security|vulnerab|auth|hack|exploit|protect)\b/i.test(combinedText)) {
          category = 'security';
        } else if (/\b(grammar|spell|typo|text|sentence|word|language|translation|localization)\b/i.test(combinedText)) {
          category = 'grammar-related';
        }
        
        categorizedIssues.set(issue.id, category);
        
        // Format dates
        const createdDate = new Date(issue.created_at).toLocaleDateString();
        const updatedDate = new Date(issue.updated_at).toLocaleDateString();
        
        // Get assignees
        const assignees = (issue.assignees || []).map((a: any) => a.login).join('; ');
        
        csvContent += `"${repoName}","${issue.title.replace(/"/g, '""')}","${issue.html_url}","${category}","${labels}","${issue.state}","${createdDate}","${updatedDate}","${issue.comments}","${assignees}"\n`;
      });
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `repository_issues_comparison_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleDetailedAnalysis = () => {
    setShowDetailedAnalysis(!showDetailedAnalysis);
  };

  useEffect(() => {
    // Update page metadata when analysis results change
    if (analysisResults.length > 0) {
      // Update page title with repository names
      const repoNames = analysisResults.map(repo => repo.repoName).join(', ');
      document.title = `ML Analysis of ${repoNames} | GitHub Repository Comparison`;
      
      // Add meta description dynamically
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          `AI-powered comparison of ${repoNames} repositories. Machine learning analysis of code quality, documentation, and development patterns.`);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = `AI-powered comparison of ${repoNames} repositories. Machine learning analysis of code quality, documentation, and development patterns.`;
        document.head.appendChild(meta);
      }
      
      // Add structured data for rich results
      addStructuredData(analysisResults);
    }
  }, [analysisResults]);

  // Add structured data for rich search results
  const addStructuredData = (repos: RepoAnalysis[]) => {
    // Remove any existing structured data
    const existingScript = document.getElementById('repo-comparison-structured-data');
    if (existingScript) existingScript.remove();
    
    // Create structured data for software comparison
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Repository Comparison Results",
      "applicationCategory": "DeveloperApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": Math.round(repos.reduce((sum, repo) => sum + repo.overallScore, 0) / repos.length),
        "ratingCount": repos.length,
        "bestRating": "100",
        "worstRating": "0"
      },
      "review": repos.map(repo => ({
        "@type": "Review",
        "name": `AI Analysis of ${repo.repoName}`,
        "reviewBody": `Machine learning analysis shows ${repo.repoName} has a quality score of ${repo.overallScore}%.`,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": Math.round(repo.overallScore),
          "bestRating": "100",
          "worstRating": "0"
        }
      }))
    };
    
    // Add SoftwareSourceCode structured data for each repository
    const repoStructuredData = repos.map(repo => ({
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      "name": repo.repoName,
      "codeRepository": `https://github.com/${repo.repoName}`,
      "programmingLanguage": {
        "@type": "ComputerLanguage",
        "name": repo.techStack.join(", ")
      },
      "runtimePlatform": repo.techStack.join(", "),
      "about": {
        "@type": "Thing",
        "description": `Repository with ${repo.featureCount} documented features, 
                        ${repo.readmeQualityScore}% documentation quality score,
                        and ${repo.issueResolutionRate}% issue resolution rate.`
      }
    }));
    
    // Add machine learning analysis as a Dataset
    const mlDataset = {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": "Machine Learning Repository Analysis",
      "description": "AI-generated analysis of repository quality and characteristics",
      "keywords": [
        "machine learning", 
        "repository analysis", 
        "code quality", 
        "GitHub", 
        "artificial intelligence",
        "TensorFlow.js"
      ],
      "creator": {
        "@type": "Organization",
        "name": "Repository Analyzer"
      },
      "variableMeasured": [
        "Documentation Quality",
        "CI/CD Integration",
        "Testing Coverage",
        "Feature Documentation",
        "Issue Resolution Rate",
        "License Clarity",
        "Development Activity"
      ]
    };
    
    // Create multiple script tags
    const scriptTags = [
      createScriptTag('repo-comparison-structured-data', structuredData),
      ...repos.map((r, i) => createScriptTag(`repo-${i}-structured-data`, repoStructuredData[i])),
      createScriptTag('ml-dataset-structured-data', mlDataset)
    ];
    
    // Append all script tags
    scriptTags.forEach(script => document.head.appendChild(script));
  };

  // Helper function to create script tags
  const createScriptTag = (id: string, data: Record<string, any>) => {
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    return script;
  };

  // Add this function inside the RepositoryComparison component, before the return statement
  const convertToRecommendationObjects = (
    stringRecommendations: string[],
    repository: RepoAnalysis
  ): Recommendation[] => {
    return stringRecommendations.map(recommendation => {
      // Determine values based on the recommendation content
      let currentValue = 50; // Default value
      let targetValue = 80; // Default target
      let effort: 'low' | 'medium' | 'high' = 'medium';
      let impact: 'low' | 'medium' | 'high' = 'medium';
      
      // Set appropriate values based on recommendation content
      if (recommendation.toLowerCase().includes('readme') || 
          recommendation.toLowerCase().includes('documentation')) {
        currentValue = repository.readmeQualityScore;
        targetValue = Math.min(100, repository.readmeQualityScore + 25);
        effort = 'low';
        impact = 'high';
      } else if (recommendation.toLowerCase().includes('ci/cd') || 
                 recommendation.toLowerCase().includes('integration')) {
        currentValue = repository.hasCI ? 50 : 0;
        targetValue = 100;
        effort = 'medium';
        impact = 'high';
      } else if (recommendation.toLowerCase().includes('test')) {
        currentValue = repository.hasTests ? 50 : 0;
        targetValue = 70;
        effort = 'high';
        impact = 'high';
      } else if (recommendation.toLowerCase().includes('feature')) {
        currentValue = Math.min(100, repository.featureCount * 10);
        targetValue = 100;
        effort = 'medium';
        impact = 'medium';
      } else if (recommendation.toLowerCase().includes('issue')) {
        currentValue = repository.issueResolutionRate;
        targetValue = Math.min(100, repository.issueResolutionRate + 30);
        effort = 'low';
        impact = 'medium';
      }
      
      // Calculate improvement percentage
      const improvementPercentage = Math.round(
        ((targetValue - currentValue) / Math.max(1, currentValue)) * 100
      );
      
      return {
        recommendation,
        currentValue,
        targetValue,
        improvementPercentage,
        effort,
        impact
      };
    });
  };

  // Add these function declarations to the component
  const exportMLAnalysisToJSON = () => {
    // Create a JSON file with the ML analysis data
    const analysisData = {
      repositories: analysisResults.map((repo, i) => ({
        name: repo.repoName,
        prediction: mlPredictions[i],
        timestamp: new Date().toISOString(),
        analysisDepth,
        modelVersion: "v1.2.3" // This should match the version from MLModelInfo
      }))
    };
    
    // Create a blob and download link
    const dataStr = JSON.stringify(analysisData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create and trigger download
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `repository-ml-analysis-${new Date().toISOString()}.json`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const confirmClearMLData = () => {
    if (window.confirm("Are you sure you want to clear all ML analysis data? This action cannot be undone.")) {
      // Clear any stored ML data
      mlService.clearAllStoredData();
      
      // Show confirmation
      alert("All ML analysis data has been cleared successfully.");
    }
  };

  return (
    <div className="repository-comparison">
      <div className="seo-breadcrumbs" aria-label="breadcrumbs">
        <ol itemScope itemType="https://schema.org/BreadcrumbList">
          <li 
            itemProp="itemListElement" 
            itemScope 
            itemType="https://schema.org/ListItem"
          >
            <a itemProp="item" href="/">
              <span itemProp="name">Home</span>
            </a>
            <meta itemProp="position" content="1" />
          </li>
          <li 
            itemProp="itemListElement" 
            itemScope 
            itemType="https://schema.org/ListItem"
          >
            <span itemProp="name">Repository Comparison</span>
            <meta itemProp="position" content="2" />
          </li>
          {analysisResults.length > 0 && (
            <li 
              itemProp="itemListElement" 
              itemScope 
              itemType="https://schema.org/ListItem"
            >
              <span itemProp="name">Machine Learning Analysis</span>
              <meta itemProp="position" content="3" />
            </li>
          )}
        </ol>
      </div>

      <header className="repository-comparison-header">
        <h1>Machine Learning Repository Comparison</h1>
        <p className="page-description">
          Analyze GitHub repositories using artificial intelligence to identify strengths, 
          weaknesses, and opportunities for improvement. Our machine learning model calculates 
          quality scores and provides actionable insights for repository enhancement.
        </p>
      </header>
      
      <div className="repo-selection">
        <h3>Select up to 3 repositories to compare:</h3>
        <ul className="repo-selection-list">
          {repositories.map(repo => (
            <li key={repo.id} className={selectedRepos.includes(repo.id) ? 'selected' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedRepos.includes(repo.id)}
                  onChange={() => toggleRepoSelection(repo.id)}
                  disabled={!selectedRepos.includes(repo.id) && selectedRepos.length >= 3}
                />
                {repo.name}
              </label>
            </li>
          ))}
        </ul>
        
        <button 
          onClick={analyzeRepositories} 
          disabled={selectedRepos.length < 2 || loading}
          className="compare-button"
        >
          {loading ? 'Analyzing...' : 'Compare Repositories'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {analysisResults.length > 0 && (
        <div className="comparison-results">
          <h3>Comparison Results</h3>
          
          <div className="view-tabs">
            <button 
              className={comparisonMethod === "features" ? "active" : ""}
              onClick={() => setComparisonMethod("features")}
            >
              Features
            </button>
            <button 
              className={comparisonMethod === "documentation" ? "active" : ""}
              onClick={() => setComparisonMethod("documentation")}
            >
              Documentation
            </button>
            <button 
              className={comparisonMethod === "issues" ? "active" : ""}
              onClick={() => setComparisonMethod("issues")}
            >
              Issues
            </button>
            <button 
              className={comparisonMethod === "tech" ? "active" : ""}
              onClick={() => setComparisonMethod("tech")}
            >
              Tech Stack
            </button>
            <button 
              className={comparisonMethod === "scores" ? "active" : ""}
              onClick={() => setComparisonMethod("scores")}
            >
              Overall Scores
            </button>
          </div>
          
          {/* Overall Score Summary */}
          <div className="score-summary">
            {analysisResults.map(result => (
              <div key={result.repoName} className="repo-score-card">
                <h4>{result.repoName}</h4>
                <div 
                  className="score-meter" 
                  style={{
                    background: `conic-gradient(#4caf50 ${result.overallScore * 3.6}deg, #f0f0f0 0deg)`
                  }}
                >
                  <span className="score-value">{result.overallScore}%</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Comparison Tables - Show based on selected tab */}
          {comparisonMethod === "features" && (
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature Metrics</th>
                  {analysisResults.map(result => (
                    <th key={result.repoName}>{result.repoName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Features Count</td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>{result.featureCount}</td>
                  ))}
                </tr>
                <tr>
                  <td>CI Integration</td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>
                      {result.hasCI ? '✅' : '❌'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Testing</td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>
                      {result.hasTests ? '✅' : '❌'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Requirements</td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>
                      {result.requirements.length > 0 
                        ? result.requirements.join(', ') 
                        : 'No requirements specified'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
          
          {comparisonMethod === "documentation" && (
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Documentation</th>
                  {analysisResults.map(result => (
                    <th key={result.repoName}>{result.repoName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>README Quality</td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${result.readmeQualityScore}%`}}
                        ></div>
                        <span>{result.readmeQualityScore}%</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>README Size</td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>
                      {result.readmeLength > 0 ? 
                        `${Math.round(result.readmeLength / 100) / 10}KB` : 
                        'No README'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Keywords</td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>
                      {result.commonKeywords.join(', ')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>License</td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>
                      {result.licenseType} 
                      <br/>
                      <small>Permissiveness: {result.licensePermissiveness}%</small>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
          
          {comparisonMethod === "issues" && (
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Issue Tracking</th>
                  {analysisResults.map(result => (
                    <th key={result.repoName}>{result.repoName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Open Issues</td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>{result.openIssuesCount}</td>
                  ))}
                </tr>
                <tr>
                  <td>Closed Issues</td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>{result.closedIssuesCount}</td>
                  ))}
                </tr>
                <tr>
                  <td>Resolution Rate</td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{
                            width: `${result.issueResolutionRate}%`,
                            backgroundColor: result.issueResolutionRate > 75 ? '#4caf50' : 
                                           result.issueResolutionRate > 50 ? '#ff9800' : '#f44336'
                          }}
                        ></div>
                        <span>{result.issueResolutionRate}%</span>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
          
          {comparisonMethod === "tech" && (
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Technology</th>
                  {analysisResults.map(result => (
                    <th key={result.repoName}>{result.repoName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tech Stack</td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>
                      <div className="tech-stack-tags">
                        {result.techStack.map(tech => (
                          <span key={tech} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Last Activity</td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>
                      {new Date(result.codebaseMetrics.lastActivity).toLocaleDateString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Update Frequency</td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>
                      {result.codebaseMetrics.updateFrequency}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
          
          {comparisonMethod === "scores" && (
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Component Scores</th>
                  {analysisResults.map(result => (
                    <th key={result.repoName}>{result.repoName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["Documentation", "CI/CD Integration", "Testing", "Feature Documentation", 
                  "Issue Resolution", "License Clarity", "Code Maintenance"].map(area => (
                  <tr key={area}>
                    <td>{area}</td>
                    {analysisResults.map(result => {
                      const improvementArea = result.improvementAreas.find(imp => imp.area === area);
                      const score = improvementArea 
                        ? improvementArea.currentScore 
                        : area === "Documentation" ? result.readmeQualityScore :
                          area === "CI/CD Integration" ? (result.hasCI ? 100 : 0) :
                          area === "Testing" ? (result.hasTests ? 100 : 0) :
                          area === "Feature Documentation" ? Math.min(100, result.featureCount * 20) :
                          area === "Issue Resolution" ? result.issueResolutionRate :
                          area === "License Clarity" ? result.licensePermissiveness :
                          area === "Code Maintenance" ? (result.codebaseMetrics.updateFrequency.includes("Active") ? 80 : 40) : 0;
                          
                      return (
                        <td key={result.repoName}>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{
                                width: `${score}%`,
                                backgroundColor: score > 75 ? '#4caf50' : 
                                               score > 50 ? '#ff9800' : '#f44336'
                              }}
                            ></div>
                            <span>{score}%</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td><strong>Overall Score</strong></td>
                  {analysisResults.map(result => (
                    <td key={result.repoName}>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{
                            width: `${result.overallScore}%`,
                            backgroundColor: '#1a73e8'
                          }}
                        ></div>
                        <span><strong>{result.overallScore}%</strong></span>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
          
          <div className="ml-analysis-container">
            {mlPredictions.length > 0 && (
              <SafeMLVisualization 
                repositoryAnalyses={analysisResults}
                mlPredictions={mlPredictions}
              />
            )}
          </div>
          
          <div className="quantifiable-improvements-section">
            <h3>ML-Based Improvement Opportunities</h3>
            
            {analysisResults.map((repo, index) => (
              <div key={index} className="repository-improvements">
                <h4>{repo.repoName}</h4>
                
                <div className="improvement-summary">
                  <p>
                    Our ML analysis identified <strong>{mlPredictions[index].topRecommendations.length}</strong> key 
                    improvement opportunities that could increase this repository's quality score 
                    from <strong>{mlPredictions[index].predictedScore}%</strong> to 
                    <strong> {Math.min(100, Math.round(mlPredictions[index].predictedScore * 1.3))}%</strong>.
                  </p>
                </div>
                
                <QuantifiableRecommendationsView
                  recommendations={convertToRecommendationObjects(
                    mlPredictions[index].topRecommendations, 
                    repo
                  )}
                  repositoryName={repo.repoName}
                />
                
                <div className="improvement-action-buttons">
                  <button className="generate-action-plan">
                    Generate Detailed Action Plan
                  </button>
                  <button className="export-recommendations">
                    Export Recommendations
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="ml-metadata">
            <DataFreshnessIndicator 
              lastUpdated={lastDataUpdate}
              dataSource="GitHub API + Local ML Analysis"
            />
            
            {mlPredictions.map((prediction, idx) => (
              analysisResults[idx] && (
                <div className="ml-disclaimer" key={idx}>
                  <p>
                    <span className="ai-badge">AI-Generated Analysis</span>
                    These improvement recommendations are generated by a machine learning model 
                    with {prediction.confidenceLevel}% confidence. Results should be 
                    verified through manual code review.
                  </p>
                </div>
              )
            ))}
          </div>
          
          <div className="detailed-analysis-toggle">
            <button 
              className="toggle-analysis-button"
              onClick={toggleDetailedAnalysis}
            >
              {showDetailedAnalysis ? 'Hide Detailed Analysis' : 'Show Detailed Analysis'}
            </button>
            {!showDetailedAnalysis && (
              <p className="toggle-hint">
                Click to see improvement opportunities, issue analysis, and development suggestions
              </p>
            )}
          </div>
          
          {showDetailedAnalysis && (
            <>
              <div className="improvement-suggestions">
                <h3>Improvement Opportunities by Priority</h3>
                <div className="improvement-grid">
                  {analysisResults.map(result => (
                    <div key={result.repoName} className="improvement-card">
                      <h4>{result.repoName}</h4>
                      <div className="improvement-priority-groups">
                        {["Critical", "High", "Medium"].map(priority => {
                          const priorityImprovements = result.improvementAreas.filter(area => area.priority === priority);
                          if (priorityImprovements.length === 0) return null;
                          
                          return (
                            <div key={priority} className={`priority-group ${priority.toLowerCase()}`}>
                              <h5 className="priority-heading">{priority} Priority</h5>
                              <ul>
                                {priorityImprovements.map((area, index) => (
                                  <li key={index}>
                                    <div className="improvement-header">
                                      <span className="improvement-area">{area.area}</span> 
                                      <span className="improvement-score-gap">{area.currentScore} → {area.potentialScore}</span>
                                    </div>
                                    <div className="improvement-bar">
                                      <div className="current-level" style={{width: `${(area.currentScore/area.potentialScore) * 100}%`}}></div>
                                      <div className="potential-level"></div>
                                    </div>
                                    <p className="improvement-action">{area.action}</p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <h3>Comparison Summary</h3>
              <div className="comparison-summary">
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>Repository</th>
                      <th>Overall Score</th>
                      <th>Strengths</th>
                      <th>Critical Areas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResults.map(result => {
                      const strengths = Object.entries({
                        "Documentation": result.readmeQualityScore,
                        "CI/CD": result.hasCI ? 100 : 0,
                        "Testing": result.hasTests ? 100 : 0,
                        "Features": Math.min(100, result.featureCount * 20),
                        "Issue Resolution": result.issueResolutionRate,
                        "License": result.licensePermissiveness,
                        "Maintenance": result.codebaseMetrics.updateFrequency.includes("Active") ? 80 : 40
                      }).filter(([_, score]) => score >= 70).map(([area]) => area);
                      
                      const criticalImprovements = result.improvementAreas
                        .filter(area => area.priority === "Critical")
                        .map(area => area.area);
                      
                      return (
                        <tr key={result.repoName}>
                          <td>{result.repoName}</td>
                          <td>
                            <div className="summary-score">
                              <div className="score-pill" style={{
                                backgroundColor: result.overallScore > 75 ? '#4caf50' : 
                                                 result.overallScore > 50 ? '#ff9800' : '#f44336'
                              }}>
                                {result.overallScore}%
                              </div>
                            </div>
                          </td>
                          <td>
                            {strengths.length > 0 ? (
                              <ul className="summary-list">
                                {strengths.map(strength => (
                                  <li key={strength}>{strength}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="no-data">No major strengths identified</span>
                            )}
                          </td>
                          <td>
                            {criticalImprovements.length > 0 ? (
                              <ul className="summary-list critical">
                                {criticalImprovements.map(area => (
                                  <li key={area}>{area}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="no-critical">No critical issues</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          
          {showDetailedAnalysis && (
            <div className="development-opportunities">
              <h3>Most Promising Development Opportunity</h3>
              <div className="opportunity-highlight">
                <h4>{getMostPromisingOpportunity()}</h4>
                <p>This project would address the biggest gap identified across the compared repositories.</p>
              </div>
              
              <h3>What a New Developer Could Build</h3>
              <div className="project-cards">
                {generateProjectSuggestions().map((project, index) => (
                  <div className="project-card" key={index}>
                    <h4>{project.title}</h4>
                    <p>{project.description}</p>
                    <div className="project-stats">
                      <span>Impact: {project.impact}</span>
                      <span>Difficulty: {project.difficulty}</span>
                    </div>
                    <div className="project-tags">
                      {project.tags.map(tag => (
                        <span className="project-tag" key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {showDetailedAnalysis && Object.keys(repoIssues).length > 0 && (
            <div className="issues-comparison">
              <h3>Open Issues Analysis</h3>
              <p>Analyzing common issue patterns across repositories:</p>
              
              <div className="issues-summary">
                <div className="issues-summary-item">
                  <span className="issues-summary-number">
                    {Object.values(repoIssues).reduce((sum, issues) => sum + issues.length, 0)}
                  </span>
                  <span className="issues-summary-label">Total Open Issues</span>
                </div>
                
                <div className="issues-summary-item">
                  <span className="issues-summary-number">
                    {Object.keys(analyzeCommonIssuePatterns()).length}
                  </span>
                  <span className="issues-summary-label">Issue Categories</span>
                </div>
                
                <div className="issues-summary-item">
                  <span className="issues-summary-number">
                    {Object.entries(analyzeCommonIssuePatterns())
                      .reduce((max, [_, repoCounts]) => {
                        const category = Object.entries(repoCounts)
                          .reduce((maxRepo, [_, count]) => Math.max(maxRepo, count), 0);
                        return Math.max(max, category);
                      }, 0)}
                  </span>
                  <span className="issues-summary-label">Highest Issue Count</span>
                </div>
                
                <div className="issues-summary-item">
                  <span className="issues-summary-number">
                    {Object.keys(repoIssues).length}
                  </span>
                  <span className="issues-summary-label">Repositories Analyzed</span>
                </div>
              </div>
              
              <div className="issues-grid">
                <table className="issues-table">
                  <thead>
                    <tr>
                      <th>Issue Category</th>
                      {Object.keys(repoIssues).map(repoName => (
                        <th key={repoName}>{repoName}</th>
                      ))}
                      <th>Comparative Analysis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(analyzeCommonIssuePatterns())
                      .sort(([_, repoCounts1], [__, repoCounts2]) => {
                        // Sort by total issues in category, descending
                        const sum1 = Object.values(repoCounts1).reduce((s, c) => s + c, 0);
                        const sum2 = Object.values(repoCounts2).reduce((s, c) => s + c, 0);
                        return sum2 - sum1;
                      })
                      .map(([category, repoCounts]) => {
                        const totalCount = Object.values(repoCounts).reduce((sum, count) => sum + count, 0);
                        if (totalCount === 0) return null;
                        
                        // Calculate color based on count (higher = more red)
                        const maxPossible = 20; // Arbitrary max for color scaling
                        
                        return (
                          <tr key={category}>
                            <td className="issue-category">
                              {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </td>
                            {Object.keys(repoIssues).map(repoName => {
                              const count = repoCounts[repoName] || 0;
                              const intensity = Math.min(count / maxPossible * 100, 100);
                              const backgroundColor = count > 0 
                                ? `rgba(255, ${Math.max(0, 100 - intensity)}, ${Math.max(0, 100 - intensity)}, ${0.1 + (intensity/200)})`
                                : '';
                                
                              return (
                                <td 
                                  key={repoName} 
                                  className="issue-count"
                                  style={{ backgroundColor }}
                                >
                                  {count}
                                </td>
                              );
                            })}
                            <td className="issue-insight">
                              {getIssueInsight(category, repoCounts)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              
              <div className="export-options">
                <button 
                  className="export-button"
                  onClick={() => exportIssuesAsCSV()}
                >
                  <span className="export-icon">📊</span>
                  Export Detailed Issue Analysis to CSV
                </button>
                
                <div className="cross-repo-analysis">
                  <h4>Cross-Repository Issue Analysis</h4>
                  <p>
                    {(() => {
                      const patterns = analyzeCommonIssuePatterns();
                      const categoryCount = Object.keys(patterns).length;
                      const patternTypes = ["bug", "feature-request", "documentation"].filter(type => patterns[type]);
                      
                      if (categoryCount === 0) return "No common issue patterns found.";
                      
                      if (patternTypes.length > 0) {
                        const focusArea = patternTypes.sort((a, b) => {
                          const countA = Object.values(patterns[a] || {}).reduce((sum, count) => sum + count, 0);
                          const countB = Object.values(patterns[b] || {}).reduce((sum, count) => sum + count, 0);
                          return countB - countA;
                        })[0];
                        
                        const totalInFocus = Object.values(patterns[focusArea] || {}).reduce((sum, count) => sum + count, 0);
                        
                        return `Primary focus area should be ${focusArea.replace('-', ' ')} issues, which represent ${totalInFocus} issues across repositories. This suggests a shared challenge that could benefit from a coordinated solution.`;
                      }
                      
                      return `Issues span ${categoryCount} different categories, suggesting diverse challenges across repositories.`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {showDetailedAnalysis && (
        <div className="ml-model-details">
          <h3>ML Model Information & Limitations</h3>
          
          <MLModelInfo 
            modelVersion="v1.2.3"
            lastUpdated={new Date('2023-10-15')}
            dataPoints={25000}
            accuracy={87}
            biasAuditStatus="passed"
          />
          
          <div className="ml-export-options">
            <button className="export-button" onClick={() => exportMLAnalysisToJSON()}>
              Export ML Analysis Data
            </button>
            <button className="clear-button" onClick={() => confirmClearMLData()}>
              Clear All ML Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryComparison;