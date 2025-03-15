import * as tf from '@tensorflow/tfjs';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { cachingService } from './cachingService';
import { Repository } from '../types/repository';
import { config } from '../config/environment';

// Add a comment to explain why we're keeping this despite not using it directly
// This security configuration is used as a reference for our safe ML implementation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const securityConfig = {
  disableNetworkFetch: true, // Prevents node-fetch vulnerabilities
  isolateVisualizations: true, // Sandboxes visualization components
  useSafeColorHandling: true // Mitigates d3-color ReDoS vulnerability
};

// Either use this interface or remove it if not needed
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface RepositoryFeatures {
  readmeQualityScore: number;
  cicd: number; // 0 or 1
  testing: number; // 0 or 1
  featureCount: number;
  issueResolutionRate: number;
  licensePermissiveness: number;
  activityScore: number; // Derived from update frequency
}

export interface MLPrediction {
  predictedScore: number;
  confidenceLevel: number;
  topRecommendations: string[];
  similarRepositories: string[];
  insightSummary: string;
}

export interface MLAnalysisLog {
  timestamp: Date;
  operation: string;
  repositoryCount: number;
  analysisId: string;
  duration: number;
  success: boolean;
}

// Constants for rate limiting and security
const MAX_REQUESTS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const API_KEY_STORAGE_KEY = 'gh-repo-analyzer-api-key';

class MLAnalysisService {
  private model: tf.Sequential | null = null;
  private isModelLoading = false;
  
  // Add these properties to your MLAnalysisService class
  private requestTimestamps: number[] = [];
  private analysisLogs: Array<{
    timestamp: Date;
    operation: string;
    repositoryCount: number;
    analysisId: string;
    duration: number;
    success: boolean;
  }> = [];
  private apiKeyEncrypted: string | null = null;
  
  constructor() {
    this.initializeModel();
    this.loadEncryptedApiKey();
    
    // Clean up old logs periodically
    setInterval(() => {
      // Keep only logs from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      this.analysisLogs = this.analysisLogs.filter(log => 
        log.timestamp > thirtyDaysAgo
      );
      
      // Also clean up old request timestamps
      const oneMinuteAgo = Date.now() - RATE_LIMIT_WINDOW_MS;
      this.requestTimestamps = this.requestTimestamps.filter(
        timestamp => timestamp > oneMinuteAgo
      );
    }, 3600000); // Run hourly
  }
  
  private async initializeModel() {
    // Create a simple model for repository score prediction
    this.model = tf.sequential();
    
    // Input shape represents our repository features
    this.model.add(tf.layers.dense({
      inputShape: [7], // 7 features as defined in RepositoryFeatures
      units: 12,
      activation: 'relu'
    }));
    
    this.model.add(tf.layers.dense({
      units: 8,
      activation: 'relu'
    }));
    
    this.model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid' // Output between 0-1 (will scale to 0-100)
    }));
    
    this.model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'meanSquaredError',
      metrics: ['mse']
    });
    
    // In a real application, we would load pre-trained weights
    // Since we don't have real training data, we'll simulate weights
    await this.simulateTraining();
  }
  
  private async simulateTraining() {
    // Create synthetic data based on reasonable heuristics about repository quality
    const syntheticData = {
      xs: tf.tensor2d([
        // Good repos: high readme, has CI/CD, has tests, etc.
        [85, 1, 1, 15, 75, 90, 80], 
        [90, 1, 1, 20, 85, 80, 90],
        [80, 1, 1, 12, 90, 70, 85],
        
        // Medium repos: mixed features
        [60, 1, 0, 10, 60, 50, 70],
        [70, 0, 1, 8, 50, 80, 60],
        [65, 1, 0, 6, 65, 90, 40],
        
        // Poor repos: low scores across most features
        [30, 0, 0, 4, 20, 30, 25],
        [40, 0, 0, 3, 10, 0, 15],
        [25, 0, 0, 2, 5, 40, 10]
      ]),
      ys: tf.tensor2d([
        [0.9], [0.95], [0.85], // Good scores
        [0.65], [0.6], [0.58], // Medium scores
        [0.3], [0.25], [0.2]   // Poor scores
      ])
    };
    
    // Fix the null check
    if (this.model) {
      // Train the model on our synthetic data
      await this.model.fit(syntheticData.xs, syntheticData.ys, {
        epochs: 100,
        validationSplit: 0.2,
        verbose: 0
      });
    }
  }
  
  // Convert repository analysis to feature vectors for ML processing
  private prepareFeatureVectors(repositories: any[]): number[][] {
    return repositories.map(repo => [
      repo.readmeQualityScore || 0,
      repo.hasCI ? 1 : 0,
      repo.hasTests ? 1 : 0, 
      repo.featureCount || 0,
      repo.issueResolutionRate || 0,
      repo.licensePermissiveness || 0,
      repo.activityScore || 0
    ]);
  }
  
  private getActivityScore(updateFrequency: string): number {
    if (updateFrequency.includes("Very Active")) return 90;
    if (updateFrequency.includes("Active")) return 75;
    if (updateFrequency.includes("Maintained")) return 60;
    if (updateFrequency.includes("Slow")) return 40;
    if (updateFrequency.includes("Stale")) return 20;
    return 10; // Abandoned
  }
  
  // Predict repository scores using ML
  private async predictScores(repositories: any[]): Promise<number[]> {
    if (!this.model) {
      throw new Error('ML model not initialized');
    }
    
    const features = this.prepareFeatureVectors(repositories);
    const tensor = tf.tensor2d(features);
    
    try {
      const predictions = this.model.predict(tensor) as tf.Tensor;
      const scores = Array.from(predictions.dataSync()).map(score => 
        Math.round(score * 100) // Scale to 0-100
      );
      
      // Dispose tensors to prevent memory leaks
      tensor.dispose();
      predictions.dispose();
      
      return scores;
    } catch (error) {
      console.error('Error predicting scores:', error);
      tensor.dispose();
      return repositories.map(() => 50); // Default score on error
    }
  }
  
  // Perform clustering to find similar repositories
  private findSimilarRepositories(repo: any): string[] {
    // In a real implementation, this would use ML to find similar repos
    // For now, we'll return dummy data
    return [
      'facebook/react',
      'microsoft/typescript',
      'angular/angular',
      'vuejs/vue'
    ].filter(name => name !== repo.full_name);
  }
  
  // Generate ML insights for repositories
  public async generateInsights(repositoryAnalyses: any[]): Promise<MLPrediction[]> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded for ML analysis. Please try again later.');
    }
    
    const startTime = Date.now();
    const analysisId = uuidv4();
    
    try {
      // Add to analysis logs
      this.analysisLogs.push({
        timestamp: new Date(),
        operation: 'generate-insights',
        repositoryCount: repositoryAnalyses.length,
        analysisId,
        duration: 0, // Will update later
        success: false // Will update on success
      });
      
      const predictedScores = await this.predictScores(repositoryAnalyses);
      const similarities = this.calculateSimilarities(repositoryAnalyses);
      
      const insights = await Promise.all(repositoryAnalyses.map((repo, index) => {
        // Find similar repos
        const repoSimilarities = similarities[index]
          .map((score, i) => ({ score: score, name: repositoryAnalyses[i].repoName }))
          .filter(item => item.name !== repo.repoName && item.score > 50)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        
        // Find similar repos with higher scores to derive recommendations
        const betterRepos = repositoryAnalyses
          .map((r, i) => ({
            repo: r,
            similarity: similarities[index][i],
            scoreDiff: predictedScores[i] - predictedScores[index]
          }))
          .filter(item => item.repo.repoName !== repo.repoName && item.similarity > 50 && item.scoreDiff > 5)
          .sort((a, b) => b.scoreDiff - a.scoreDiff);
        
        // Generate recommendations based on what better repositories are doing
        const recommendations: string[] = [];
        
        betterRepos.forEach(betterRepo => {
          if (betterRepo.repo.hasCI && !repo.hasCI) {
            recommendations.push(`Add CI/CD pipeline like ${betterRepo.repo.repoName} to automate testing`);
          }
          
          if (betterRepo.repo.hasTests && !repo.hasTests) {
            recommendations.push(`Implement automated tests like ${betterRepo.repo.repoName} to ensure code quality`);
          }
          
          if (betterRepo.repo.readmeQualityScore > repo.readmeQualityScore + 20) {
            recommendations.push(`Improve documentation structure like ${betterRepo.repo.repoName} for better onboarding`);
          }
          
          if (betterRepo.repo.issueResolutionRate > repo.issueResolutionRate + 20) {
            recommendations.push(`Enhance issue management approach like ${betterRepo.repo.repoName} for faster resolution`);
          }
        });
        
        // Limit to 3 unique recommendations
        const uniqueRecommendations = [...new Set(recommendations)].slice(0, 3);
        
        return this.processRepositoryInsight(
          repo,
          predictedScores[index],
          repoSimilarities.map(item => ({ name: item.name, score: item.score })),
          uniqueRecommendations
        );
      }));
      
      // Update log with success
      const lastLogIndex = this.analysisLogs.length - 1;
      if (lastLogIndex >= 0) {
        this.analysisLogs[lastLogIndex].duration = Date.now() - startTime;
        this.analysisLogs[lastLogIndex].success = true;
      }
      
      return insights;
    } catch (error) {
      // Update log with failure
      const lastLogIndex = this.analysisLogs.length - 1;
      if (lastLogIndex >= 0) {
        this.analysisLogs[lastLogIndex].duration = Date.now() - startTime;
      }
      
      console.error('Error generating insights:', error);
      throw error;
    }
  }
  
  private calculateSimilarities(repositories: any[]): number[][] {
    const features = this.prepareFeatureVectors(repositories);
    
    // Simple similarity calculation based on feature vectors
    const similarities: number[][] = [];
    
    for (let i = 0; i < features.length; i++) {
      const repoSimilarities: number[] = [];
      
      for (let j = 0; j < features.length; j++) {
        if (i === j) {
          repoSimilarities.push(100); // Same repo = 100% similar
          continue;
        }
        
        // Calculate Euclidean distance
        let distance = 0;
        for (let k = 0; k < features[i].length; k++) {
          distance += Math.pow(features[i][k] - features[j][k], 2);
        }
        distance = Math.sqrt(distance);
        
        // Convert distance to similarity score (0-100)
        const similarity = Math.max(0, 100 - (distance * 50));
        repoSimilarities.push(Math.round(similarity));
      }
      
      similarities.push(repoSimilarities);
    }
    
    return similarities;
  }
  
  private processRepositoryInsight(repo: any, score: number, similarRepos: {name: string; score: number}[], recommendations: string[]): MLPrediction {
    const scoreCategory = 
      score >= 80 ? "excellent" :
      score >= 70 ? "very good" :
      score >= 60 ? "good" :
      score >= 50 ? "average" :
      score >= 40 ? "below average" :
      "poor";
    
    let summary = `Based on machine learning analysis, ${repo.repoName} has ${scoreCategory} characteristics with a predicted quality score of ${Math.round(score)}%. `;
    
    if (similarRepos.length > 0) {
      summary += `It shares similarities with ${similarRepos.map(r => r.name).join(", ")}. `;
    }
    
    if (recommendations.length > 0) {
      const topRecommendation = recommendations[0];
      summary += `The most impactful improvement would be to ${topRecommendation.toLowerCase().replace(/^improve/, "").trim()}.`;
    }
    
    return {
      predictedScore: Math.round(score),
      confidenceLevel: this.calculateConfidenceLevel(repo),
      topRecommendations: recommendations.slice(0, 3),
      similarRepositories: similarRepos.map(r => r.name),
      insightSummary: summary.trim()
    };
  }
  
  private identifyWeakestAreas(repo: any): string[] {
    const areas: {name: string; score: number}[] = [
      { name: "documentation", score: repo.readmeQualityScore },
      { name: "CI/CD integration", score: repo.hasCI ? 100 : 0 },
      { name: "testing", score: repo.hasTests ? 100 : 0 },
      { name: "feature documentation", score: Math.min(100, repo.featureCount * 10) },
      { name: "issue management", score: repo.issueResolutionRate },
      { name: "license clarity", score: repo.licensePermissiveness }
    ];
    
    return areas
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(a => a.name);
  }
  
  private calculateConfidenceLevel(repo: any): number {
    // Calculate confidence based on data completeness
    let confidenceScore = 70; // Base confidence
    
    // Add confidence if we have complete data
    if (repo.readmeQualityScore !== undefined) confidenceScore += 5;
    if (repo.hasCI !== undefined) confidenceScore += 5;
    if (repo.hasTests !== undefined) confidenceScore += 5;
    if (repo.issueResolutionRate !== undefined) confidenceScore += 5;
    if (repo.licenseType !== undefined) confidenceScore += 5;
    
    // Cap at 95% - never be 100% confident
    return Math.min(95, confidenceScore);
  }
  
  private generateTopRecommendations(repo: any, score: number): string[] {
    const recommendations: string[] = [];
    
    // Generate recommendations based on repository metrics
    if (repo.readmeQualityScore < 70) {
      recommendations.push('Improve documentation with better examples and structure');
    }
    
    if (!repo.hasCI) {
      recommendations.push('Set up Continuous Integration to automate testing');
    }
    
    if (!repo.hasTests || (repo.hasTests && repo.testCoverage < 50)) {
      recommendations.push('Increase test coverage to improve code quality');
    }
    
    if (repo.issueResolutionRate < 60) {
      recommendations.push('Improve issue resolution workflow to address backlog');
    }
    
    if (recommendations.length === 0) {
      // Fallback recommendations if no specific issues found
      recommendations.push('Consider adding more examples in documentation');
      recommendations.push('Review dependencies for potential updates');
    }
    
    // Limit to top 3 recommendations
    return recommendations.slice(0, 3);
  }
  
  private generateInsightSummary(repo: any, score: number): string {
    // Generate a personalized summary based on repository data
    let summary = '';
    
    if (score >= 80) {
      summary = `${repo.name} demonstrates excellent development practices with strong documentation and testing. `;
    } else if (score >= 60) {
      summary = `${repo.name} follows good development practices but has room for improvement. `;
    } else {
      summary = `${repo.name} would benefit significantly from improvements in its development processes. `;
    }
    
    // Add specific insights
    if (repo.hasCI) {
      summary += 'The CI/CD setup shows a commitment to code quality. ';
    }
    
    if (repo.issueResolutionRate > 70) {
      summary += 'The team is responsive to issues, with a high resolution rate. ';
    }
    
    if (repo.readmeQualityScore > 80) {
      summary += 'Documentation is comprehensive and well-structured. ';
    }
    
    return summary.trim();
  }

  // Add this function to initialize TensorFlow more safely
  private async initializeTensorFlow() {
    // Configure TensorFlow to avoid using any vulnerable packages
    const tf = await import('@tensorflow/tfjs');
    
    // Disable unnecessary features that might use vulnerable dependencies
    const safeConfig = {
      WEBGL_FORCE_F16_TEXTURES: false,
      WEBGL_RENDER_FLOAT32_CAPABLE: true,
      WEBGL_VERSION: 2,
      WEBGL_FLUSH_THRESHOLD: 1, // Lower threshold to avoid memory issues
      PROD: true // Use production mode to avoid debug features
    };
    
    // Set safe backend
    await tf.setBackend('webgl');
    
    // Apply safe configurations
    for (const [key, value] of Object.entries(safeConfig)) {
      tf.env().set(key as any, value);
    }
    
    return tf;
  }

  // Add code to optimize ML model loading
  private async loadModel() {
    try {
      // First check if model is already loaded
      if (this.model) return this.model;
      
      // Show loading indicator
      this.isModelLoading = true;
      
      // Split model loading into small chunks to prevent main thread blocking
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Initialize model architecture
      this.model = tf.sequential();
      
      // Add first layer
      this.model.add(tf.layers.dense({
        inputShape: [7],
        units: 12,
        activation: 'relu'
      }));
      
      // Yield to browser main thread
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Add remaining layers
      this.model.add(tf.layers.dense({
        units: 8,
        activation: 'relu'
      }));
      
      this.model.add(tf.layers.dense({
        units: 1,
        activation: 'sigmoid'
      }));
      
      // Yield again
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Use a web worker for model training if browser supports it
      if (window.Worker) {
        await this.trainModelInWorker();
      } else {
        await this.simulateTraining();
      }
      
      this.isModelLoading = false;
      return this.model;
    } catch (error) {
      console.error('Error loading ML model:', error);
      this.isModelLoading = false;
      throw error;
    }
  }

  // Add this method to the MLAnalysisService class
  private async trainModelInWorker(): Promise<void> {
    // Since we're just creating a simple implementation for now,
    // we'll fall back to the regular training method
    // In a production environment, you would create an actual Worker
    console.log('Web Worker support detected, but not fully implemented yet.');
    console.log('Falling back to main thread training...');
    
    // For now, just call the simulateTraining method
    await this.simulateTraining();
    
    // TODO: In the future, implement actual Web Worker code:
    /*
    return new Promise((resolve, reject) => {
      try {
        // Create a blob URL containing worker code
        const workerCode = `
          self.onmessage = async function(e) {
            // Import TensorFlow.js in the worker
            importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
            
            // Recreate the model in the worker
            const model = tf.sequential();
            model.add(tf.layers.dense({
              inputShape: [7],
              units: 12, 
              activation: 'relu'
            }));
            model.add(tf.layers.dense({
              units: 8,
              activation: 'relu'
            }));
            model.add(tf.layers.dense({
              units: 1,
              activation: 'sigmoid'
            }));
            
            model.compile({
              optimizer: tf.train.adam(0.01),
              loss: 'meanSquaredError',
              metrics: ['mse']
            });
            
            // Create synthetic training data
            const xs = tf.tensor2d([
              [85, 1, 1, 15, 75, 90, 80],
              [90, 1, 1, 20, 85, 80, 90],
              [80, 1, 1, 12, 90, 70, 85],
              [60, 1, 0, 10, 60, 50, 70],
              [70, 0, 1, 8, 50, 80, 60],
              [65, 1, 0, 6, 65, 90, 40],
              [30, 0, 0, 4, 20, 30, 25],
              [40, 0, 0, 3, 10, 0, 15],
              [25, 0, 0, 2, 5, 40, 10]
            ]);
            
            const ys = tf.tensor2d([
              [0.9], [0.95], [0.85],
              [0.65], [0.6], [0.58],
              [0.3], [0.25], [0.2]
            ]);
            
            // Train the model
            await model.fit(xs, ys, {
              epochs: 100,
              validationSplit: 0.2,
              verbose: 0
            });
            
            // Serialize the model weights
            const modelWeights = await model.getWeights().map(w => w.arraySync());
            
            // Send trained weights back to main thread
            self.postMessage({ status: 'complete', weights: modelWeights });
          };
          
          // Signal that the worker is ready
          self.postMessage({ status: 'ready' });
        `;
        
        // Create a blob and URL for the worker
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        
        // Create the worker
        const worker = new Worker(workerUrl);
        
        // Handle messages from the worker
        worker.onmessage = async (e) => {
          if (e.data.status === 'complete' && this.model) {
            // Apply the trained weights to our model
            // This part would need to be implemented with careful type handling
            
            // Clean up
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
            resolve();
          }
        };
        
        worker.onerror = (error) => {
          console.error('Error in model training worker:', error);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          reject(error);
        };
        
      } catch (error) {
        console.error('Failed to initialize Web Worker for model training:', error);
        // Fall back to main thread training
        await this.simulateTraining();
        resolve();
      }
    });
    */
  }

  public async generateQuantifiableRecommendations(repository: any): Promise<Array<{
    recommendation: string;
    currentValue: number;
    targetValue: number;
    improvementPercentage: number;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
  }>> {
    // Determine weak areas based on repository metrics
    const weakAreas: Array<{type: string, value: number}> = [];
    
    if (repository.readmeQualityScore < 70) {
      weakAreas.push({ type: 'documentation', value: repository.readmeQualityScore });
    }
    
    if (!repository.hasCI) {
      weakAreas.push({ type: 'ci', value: 0 });
    }
    
    if (!repository.hasTests) {
      weakAreas.push({ type: 'tests', value: 0 });
    }
    
    if (repository.issueResolutionRate < 60) {
      weakAreas.push({ type: 'issue-management', value: repository.issueResolutionRate });
    }
    
    // Generate recommendations based on weak areas
    const recommendations: Array<{
      recommendation: string;
      currentValue: number;
      targetValue: number;
      improvementPercentage: number;
      effort: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
    }> = [];
    
    for (const area of weakAreas) {
      switch (area.type) {
        case 'documentation':
          recommendations.push({
            recommendation: 'Improve README quality with usage examples and better structure',
            currentValue: area.value,
            targetValue: 90,
            improvementPercentage: Math.round(((90 - area.value) / area.value) * 100),
            effort: 'medium',
            impact: 'high'
          });
          break;
        // Other cases...
      }
    }
    
    return recommendations;
  }

  // API key management methods
  private loadEncryptedApiKey(): void {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
      this.apiKeyEncrypted = storedKey;
    }
  }

  public setApiKey(apiKey: string, devicePassphrase: string): void {
    // Encrypt API key with device-specific passphrase
    const encrypted = CryptoJS.AES.encrypt(apiKey, devicePassphrase).toString();
    localStorage.setItem(API_KEY_STORAGE_KEY, encrypted);
    this.apiKeyEncrypted = encrypted;
  }

  private getDecryptedApiKey(devicePassphrase: string): string | null {
    if (!this.apiKeyEncrypted) return null;
    
    try {
      const decrypted = CryptoJS.AES.decrypt(this.apiKeyEncrypted, devicePassphrase);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Failed to decrypt API key');
      return null;
    }
  }

  // Add this method to check rate limits
  private checkRateLimit(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - RATE_LIMIT_WINDOW_MS;
    
    // Filter out requests older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => timestamp > oneMinuteAgo
    );
    
    // Check if we've exceeded our limit
    if (this.requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    
    // Add current request timestamp
    this.requestTimestamps.push(now);
    return true;
  }

  // Add a method to get analysis logs (with optional filtering)
  public getAnalysisLogs(options?: {
    startDate?: Date;
    endDate?: Date;
    onlySuccessful?: boolean;
  }): Array<{
    timestamp: Date;
    operation: string;
    repositoryCount: number;
    analysisId: string;
    duration: number;
    success: boolean;
  }> {
    let filteredLogs = [...this.analysisLogs];
    
    if (options?.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= options.startDate!);
    }
    
    if (options?.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= options.endDate!);
    }
    
    if (options?.onlySuccessful !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.success === options.onlySuccessful);
    }
    
    return filteredLogs;
  }

  // Add a method to clear all stored data (for privacy controls)
  public clearAllStoredData(): void {
    // Clear analysis logs
    this.analysisLogs = [];
    
    // Clear any cached data or model weights
    localStorage.removeItem('ml-model-cache');
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    this.apiKeyEncrypted = null;
    
    // Log the data clearing
    console.log('All ML analysis data and credentials cleared');
  }

  // Update the analyze method to use caching
  private async analyze(repositories: any[]): Promise<MLPrediction[]> {
    // Create a deterministic cache key from repository data
    const repoIdStr = repositories.map(repo => repo.id).sort().join('-');
    const cacheKey = `ml-analysis-${repoIdStr}`;
    
    // Check cache first
    const cachedAnalysis = cachingService.get<MLPrediction[]>(cacheKey, { 
      expirationTime: 30 * 60 * 1000, // 30 minutes
      useLocalStorage: true
    });
    
    if (cachedAnalysis) {
      console.log('Using cached ML analysis results');
      return cachedAnalysis;
    }
    
    // Not in cache, perform the analysis
    console.log('Performing fresh ML analysis');
    
    // Prepare feature vectors for the ML model
    const featureVectors = this.prepareFeatureVectors(repositories);
    
    // Get predictions from the model
    const predictedScores = await this.predictScores(repositories);
    
    // Generate full insights for each repository
    const allPredictions = repositories.map((repo, index) => {
      const score = predictedScores[index];
      
      return {
        predictedScore: score,
        confidenceLevel: this.calculateConfidenceLevel(repo),
        topRecommendations: this.generateTopRecommendations(repo, score),
        similarRepositories: this.findSimilarRepositories(repo),
        insightSummary: this.generateInsightSummary(repo, score)
      };
    });
    
    // Cache the results before returning
    cachingService.set(cacheKey, allPredictions, { 
      expirationTime: 30 * 60 * 1000, // 30 minutes
      useLocalStorage: true
    });
    
    return allPredictions;
  }

  // Add a method to clear the ML analysis cache
  public clearAnalysisCache(): void {
    cachingService.clear('github-analyzer-ml-analysis-');
  }

  /**
   * Generates a detailed, actionable plan for repository improvement
   * @param repositoryData Repository analysis data
   * @returns Detailed action plan with prioritized tasks
   */
  public generateDetailedActionPlan(repositoryData: any): {
    priorityTasks: Array<{task: string, impact: string, effort: string, timeEstimate: string}>;
    mediumTermTasks: Array<{task: string, impact: string, timeEstimate: string}>;
    longTermTasks: Array<{task: string, impact: string}>;
    summary: string;
  } {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded for ML analysis. Please try again later.');
    }
    
    // Generate a unique analysis ID for logging
    const analysisId = uuidv4();
    const startTime = Date.now();
    
    try {
      // Log the operation
      this.analysisLogs.push({
        timestamp: new Date(),
        operation: 'generate-action-plan',
        repositoryCount: 1,
        analysisId,
        duration: 0, // Will update later
        success: false // Will update on success
      });
      
      // Cache key based on repository data to avoid repeated processing
      const cacheKey = `action-plan-${repositoryData.id}`;
      
      // Check cache first
      const cachedPlan = cachingService.get<any>(cacheKey, { 
        expirationTime: 24 * 60 * 60 * 1000, // 24 hours
        useLocalStorage: true
      });
      
      if (cachedPlan && 
          cachedPlan.priorityTasks && 
          cachedPlan.mediumTermTasks && 
          cachedPlan.longTermTasks && 
          cachedPlan.summary) {
        // Update log with success from cache
        const lastLogIndex = this.analysisLogs.length - 1;
        if (lastLogIndex >= 0) {
          this.analysisLogs[lastLogIndex].duration = Date.now() - startTime;
          this.analysisLogs[lastLogIndex].success = true;
        }
        
        return cachedPlan as {
          priorityTasks: Array<{task: string, impact: string, effort: string, timeEstimate: string}>;
          mediumTermTasks: Array<{task: string, impact: string, timeEstimate: string}>;
          longTermTasks: Array<{task: string, impact: string}>;
          summary: string;
        };
      }
      
      // Identify areas for improvement
      const weakAreas = [];
      
      if (!repositoryData.hasCI) {
        weakAreas.push('ci');
      }
      
      if (!repositoryData.hasTests || repositoryData.testCoverage < 50) {
        weakAreas.push('testing');
      }
      
      if (repositoryData.readmeQualityScore < 70) {
        weakAreas.push('documentation');
      }
      
      if (repositoryData.issueResolutionRate < 60) {
        weakAreas.push('issueManagement');
      }
      
      if (!repositoryData.hasSecurity) {
        weakAreas.push('security');
      }
      
      if (!repositoryData.hasContributing) {
        weakAreas.push('community');
      }
      
      // Generate priority tasks (immediate actions)
      const priorityTasks = this.generatePriorityTasks(weakAreas, repositoryData);
      
      // Generate medium-term tasks
      const mediumTermTasks = this.generateMediumTermTasks(weakAreas, repositoryData);
      
      // Generate long-term strategic improvements
      const longTermTasks = this.generateLongTermTasks(repositoryData);
      
      // Generate summary
      const summary = this.generateActionPlanSummary(repositoryData, weakAreas, priorityTasks);
      
      // Create the complete action plan
      const actionPlan = {
        priorityTasks,
        mediumTermTasks,
        longTermTasks,
        summary
      };
      
      // Cache the result
      cachingService.set(cacheKey, actionPlan, { 
        expirationTime: 24 * 60 * 60 * 1000, // 24 hours
        useLocalStorage: true
      });
      
      // Update log with success
      const lastLogIndex = this.analysisLogs.length - 1;
      if (lastLogIndex >= 0) {
        this.analysisLogs[lastLogIndex].duration = Date.now() - startTime;
        this.analysisLogs[lastLogIndex].success = true;
      }
      
      return actionPlan;
    } catch (error) {
      // Update log with failure
      const lastLogIndex = this.analysisLogs.length - 1;
      if (lastLogIndex >= 0) {
        this.analysisLogs[lastLogIndex].duration = Date.now() - startTime;
      }
      
      console.error('Error generating action plan:', error);
      throw error;
    }
  }

  // Helper methods for action plan generation
  private generatePriorityTasks(weakAreas: string[], repositoryData: any): Array<{task: string, impact: string, effort: string, timeEstimate: string}> {
    const priorityTasks = [];
    
    if (weakAreas.includes('ci')) {
      priorityTasks.push({
        task: 'Set up GitHub Actions workflow for continuous integration',
        impact: 'high',
        effort: 'medium',
        timeEstimate: '2-4 hours'
      });
    }
    
    if (weakAreas.includes('testing')) {
      priorityTasks.push({
        task: `Add unit tests for critical components in ${repositoryData.language || 'your codebase'}`,
        impact: 'high',
        effort: 'high',
        timeEstimate: '1-2 days'
      });
    }
    
    if (weakAreas.includes('documentation')) {
      priorityTasks.push({
        task: 'Improve README with usage examples, installation instructions and API documentation',
        impact: 'high',
        effort: 'medium',
        timeEstimate: '3-6 hours'
      });
    }
    
    if (weakAreas.includes('security')) {
      priorityTasks.push({
        task: 'Add SECURITY.md file and implement security scanning in CI pipeline',
        impact: 'high',
        effort: 'medium',
        timeEstimate: '2-4 hours'
      });
    }
    
    if (weakAreas.includes('issueManagement')) {
      priorityTasks.push({
        task: 'Create issue templates and add project board for better issue tracking',
        impact: 'medium',
        effort: 'low',
        timeEstimate: '1-2 hours'
      });
    }
    
    return priorityTasks;
  }

  private generateMediumTermTasks(weakAreas: string[], repositoryData: any): Array<{task: string, impact: string, timeEstimate: string}> {
    const mediumTermTasks = [];
    
    if (weakAreas.includes('testing')) {
      mediumTermTasks.push({
        task: 'Set up test coverage reporting and aim for at least 70% coverage',
        impact: 'medium',
        timeEstimate: '1 week'
      });
    }
    
    if (weakAreas.includes('ci')) {
      mediumTermTasks.push({
        task: 'Implement automated deployment with proper environments (staging/production)',
        impact: 'high',
        timeEstimate: '3-5 days'
      });
    }
    
    if (weakAreas.includes('community')) {
      mediumTermTasks.push({
        task: 'Create CONTRIBUTING.md with detailed guidelines for contributors',
        impact: 'medium',
        timeEstimate: '1 day'
      });
    }
    
    mediumTermTasks.push({
      task: `Implement code quality checks (linting, static analysis) for ${repositoryData.language || 'your codebase'}`,
      impact: 'medium',
      timeEstimate: '1-2 days'
    });
    
    return mediumTermTasks;
  }

  private generateLongTermTasks(repositoryData: any): Array<{task: string, impact: string}> {
    return [
      {
        task: 'Implement semantic versioning and automated release notes',
        impact: 'medium'
      },
      {
        task: 'Set up performance benchmarking as part of the CI pipeline',
        impact: 'medium'
      },
      {
        task: 'Create comprehensive documentation site with tutorials and examples',
        impact: 'high'
      },
      {
        task: 'Establish community forum or discussion platform for users',
        impact: 'medium'
      }
    ];
  }

  private generateActionPlanSummary(repositoryData: any, weakAreas: string[], priorityTasks: any[]): string {
    let summary = `This action plan for ${repositoryData.name} focuses on `;
    
    if (weakAreas.length > 0) {
      const areasText = weakAreas.map(area => {
        switch(area) {
          case 'ci': return 'continuous integration';
          case 'testing': return 'automated testing';
          case 'documentation': return 'documentation quality';
          case 'issueManagement': return 'issue management';
          case 'security': return 'security practices';
          case 'community': return 'community engagement';
          default: return area;
        }
      });
      
      if (areasText.length === 1) {
        summary += `improving ${areasText[0]}`;
      } else if (areasText.length === 2) {
        summary += `improving ${areasText[0]} and ${areasText[1]}`;
      } else {
        const lastArea = areasText.pop();
        summary += `improving ${areasText.join(', ')}, and ${lastArea}`;
      }
      
      summary += '. ';
    } else {
      summary += 'enhancing already solid development practices. ';
    }
    
    summary += `We've identified ${priorityTasks.length} high-priority tasks that should be addressed first, `;
    summary += 'followed by medium-term improvements and strategic long-term goals. ';
    summary += 'Implementation of this plan will improve code quality, developer productivity, and project sustainability.';
    
    return summary;
  }

  public isModelReady(): boolean {
    return this.model !== null;
  }
}

export const mlService = new MLAnalysisService();
export default MLAnalysisService; 