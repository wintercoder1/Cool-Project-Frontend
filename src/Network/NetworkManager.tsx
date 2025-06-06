// Types for API responses
export interface CachedCategoryItem {
  topic: string;
  rating: number;
  lean?: string;
  context?: string;
  citation?: string;
  committee_id?: string;
  timestamp?: string;
  fec_financial_contributions_summary_text?: string;
}

export interface ContributionPercentages {
  percent_to_republicans: number;
  percent_to_democrats: number;
  total_to_republicans: number;
  total_to_democrats: number;
  total_contributions: number;
}

export interface ContributionRecipient {
  recipient_id: string;
  recipient_name: string;
  total_contribution_amount: number;
  number_of_contributions: number;
}

export interface ContributionRecipientsResponse {
  contribution_totals: ContributionRecipient[];
}

export interface LeadershipContributor {
  name: string;
  employer: string;
  occupation: string;
  transaction_amount: string;
}

export interface LeadershipContributionsResponse {
  leadership_contributors_to_committee: LeadershipContributor[];
}

export interface TopicAnalysisResponse {
  topic: string;
  rating: number;
  lean?: string;
  context: string;
  citation?: string;
  committee_id?: string;
  timestamp?: string;
  fec_financial_contributions_summary_text?: string;
  error?: boolean;
  message?: string;
}

export type CategoryType = 
  | 'Political Leaning'
  | 'DEI Friendliness'
  | 'Wokeness'
  | 'Environmental Impact'
  | 'Immigration Support'
  | 'Technology Innovation'
  | 'Financial Contributions';

interface NetworkManagerConfig {
  baseURL: string;
  defaultHeaders?: HeadersInit;
  timeout?: number;
}

class NetworkManager {
  private baseURL: string;
  private defaultOptions: RequestInit;

  constructor(config?: Partial<NetworkManagerConfig>) {
    // Get base URL from environment variable or config
    // @ts-expect-error
    this.baseURL = config?.baseURL || (import.meta.env?.VITE_BASE_URL as string) || '';
    
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...config?.defaultHeaders,
      },
    };
  }

  /**
   * Generic fetch wrapper with error handling and TypeScript support
   */
  private async makeRequest<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(url, {
        ...this.defaultOptions,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
      }

      const data: T = await response.json();
      return data;
    } catch (error) {
      console.error('Network request failed:', error);
      
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Network request to ${url} failed: ${error.message}`);
      }
      throw new Error(`Network request to ${url} failed with unknown error`);
    }
  }

  /**
   * Get cached data for a specific category with pagination
   */
  async getCachedCategoryData(
    category: CategoryType, 
    limit: number = 10, 
    offset: number = 0
  ): Promise<CachedCategoryItem[]> {
    const endpoints: Record<CategoryType, string> = {
      'Political Leaning': '/getCachedPoliticalLeanings',
      'DEI Friendliness': '/getCachedDEIScores',
      'Wokeness': '/getCachedWokenessScores',
      'Environmental Impact': '/getCachedWokenessScores',
      'Immigration Support': '/getCachedWokenessScores',
      'Technology Innovation': '/getCachedWokenessScores',
      'Financial Contributions': '/getCachedFinancialContributions'
    };

    const endpoint = endpoints[category];
    if (!endpoint) {
      throw new Error(`Unknown category: ${category}`);
    }

    const url = `${this.baseURL}${endpoint}?limit=${limit}&offset=${offset}`;
    return this.makeRequest<CachedCategoryItem[]>(url);
  }

  /**
   * Get total number of items for a category
   */
  async getCategoryItemCount(category: CategoryType): Promise<number> {
    const categoryUpper = category.toUpperCase();
    const url = `${this.baseURL}/getNumberOfTopics?queryType=${categoryUpper}`;
    const data = await this.makeRequest<number[]>(url);
    return data[0]; // API returns count as first element of array
  }

  /**
   * Get political leaning for a topic
   */
  async getPoliticalLeaning(topic: string): Promise<TopicAnalysisResponse> {
    const url = `${this.baseURL}/getPoliticalLeaning/${encodeURIComponent(topic)}`;
    return this.makeRequest<TopicAnalysisResponse>(url);
  }

  /**
   * Get DEI friendliness score for a topic
   */
  async getDEIFriendlinessScore(topic: string): Promise<TopicAnalysisResponse> {
    const url = `${this.baseURL}/getDEIFriendlinessScore/${encodeURIComponent(topic)}`;
    return this.makeRequest<TopicAnalysisResponse>(url);
  }

  /**
   * Get wokeness score for a topic
   */
  async getWokenessScore(topic: string): Promise<TopicAnalysisResponse> {
    const url = `${this.baseURL}/getWokenessScore/${encodeURIComponent(topic)}`;
    return this.makeRequest<TopicAnalysisResponse>(url);
  }

  /**
   * Get financial contributions overview for a topic
   */
  async getFinancialContributionsOverview(topic: string): Promise<TopicAnalysisResponse> {
    const url = `${this.baseURL}/getFinancialContributionsOverview/${encodeURIComponent(topic)}`;
    return this.makeRequest<TopicAnalysisResponse>(url);
  }

  /**
   * Get contribution percentages to Democrats and Republicans
   */
  async getContributionPercentages(committeeId: string): Promise<ContributionPercentages> {
    const url = `${this.baseURL}/getPercentContributionsToDemocratsAndRepublicansWithCommitteeID/${committeeId}`;
    return this.makeRequest<ContributionPercentages>(url);
  }

  /**
   * Get contribution recipients list
   */
  async getContributionRecipients(committeeId: string): Promise<ContributionRecipientsResponse> {
    const url = `${this.baseURL}/getContributionRecipientTotalsList/${committeeId}`;
    return this.makeRequest<ContributionRecipientsResponse>(url);
  }

  /**
   * Get leadership contributions
   */
  async getLeadershipContributions(committeeId: string): Promise<LeadershipContributionsResponse> {
    const url = `${this.baseURL}/getContributionsToCommitteeFromLeadershipOnly/${committeeId}`;
    return this.makeRequest<LeadershipContributionsResponse>(url);
  }

  /**
   * Generic method to get data by category and topic (for WaitingPage)
   */
  async getTopicAnalysis(category: CategoryType, topic: string): Promise<TopicAnalysisResponse> {
    const categoryMethods: Record<CategoryType, () => Promise<TopicAnalysisResponse>> = {
      'Political Leaning': () => this.getPoliticalLeaning(topic),
      'DEI Friendliness': () => this.getDEIFriendlinessScore(topic),
      'Wokeness': () => this.getWokenessScore(topic),
      'Environmental Impact': () => this.getWokenessScore(topic), // Uses same endpoint
      'Immigration Support': () => this.getWokenessScore(topic), // Uses same endpoint
      'Technology Innovation': () => this.getWokenessScore(topic), // Uses same endpoint
      'Financial Contributions': () => this.getFinancialContributionsOverview(topic)
    };

    const method = categoryMethods[category];
    if (!method) {
      throw new Error(`Unknown category: ${category}`);
    }

    return method();
  }

  /**
   * Update the base URL (useful for switching environments)
   */
  setBaseURL(newBaseURL: string): void {
    this.baseURL = newBaseURL;
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Add or update default headers
   */
  setDefaultHeaders(headers: HeadersInit): void {
    this.defaultOptions.headers = {
      ...this.defaultOptions.headers,
      ...headers,
    };
  }
}

// Create a singleton instance with optional configuration
const networkManager = new NetworkManager();

export default networkManager;
export { NetworkManager };