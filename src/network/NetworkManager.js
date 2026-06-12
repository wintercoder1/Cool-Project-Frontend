class NetworkManager {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000';

    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  /**
   * Some backend endpoints return:
   *
   * {
   *   response: {
   *     rating,
   *     context,
   *     lean
   *   }
   * }
   *
   * Other endpoints return:
   *
   * {
   *   rating,
   *   context,
   *   lean
   * }
   *
   * This converts both into one consistent frontend shape.
   */
  normalizeApiResponse(data) {
    if (!data) return data;

    const unwrapped = data.response ?? data;

    return {
      ...unwrapped,

      // Preserve useful top-level metadata if it exists.
      timestamp: unwrapped.timestamp ?? data.timestamp,
      debug: unwrapped.debug ?? data.debug,

      // Preserve topic fields if nested response does not include them.
      topic: unwrapped.topic ?? data.topic,
      normalized_topic_name:
        unwrapped.normalized_topic_name ?? data.normalized_topic_name,

      query_type: unwrapped.query_type ?? data.query_type,
      entity_type: unwrapped.entity_type ?? data.entity_type,

      upvote_count: unwrapped.upvote_count ?? data.upvote_count,
      downvote_count: unwrapped.downvote_count ?? data.downvote_count,
    };
  }

  /**
   * Generic fetch wrapper with error handling.
   */
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...this.defaultOptions,
        ...options,
        headers: {
          ...(this.defaultOptions.headers || {}),
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        let errorBody = '';

        try {
          errorBody = await response.text();
        } catch {
          // Ignore body parsing failure.
        }

        throw new Error(
          `HTTP error! Status: ${response.status}${
            errorBody ? ` Body: ${errorBody}` : ''
          }`
        );
      }

      const text = await response.text();

      if (!text) {
        return null;
      }

      return JSON.parse(text);
    } catch (error) {
      console.error('Network request failed:', error);
      console.error('Request URL:', url);
      throw error;
    }
  }

  /**
   * Same as makeRequest, but normalizes the backend response shape.
   */
  async makeNormalizedRequest(url, options = {}) {
    const data = await this.makeRequest(url, options);
    return this.normalizeApiResponse(data);
  }

  /**
   * Get cached data for a specific category with pagination and sorting.
   */
  async getSavedCategoryData(
    category,
    orderBy = 'name',
    orderIncOrDec = 'inc',
    limit = 10,
    offset = 0
  ) {
    const endpoints = {
      'Political Leaning': '/getCachedPoliticalLeanings',
      'DEI Friendliness': '/getCachedDEIScores',
      Wokeness: '/getCachedWokenessScores',
      'Environmental Impact': '/getCachedWokenessScores',
      'Immigration Support': '/getCachedWokenessScores',
      'Technology Innovation': '/getCachedWokenessScores',
      'Financial Contributions': '/getCachedFinancialContributions',
    };

    const endpoint = endpoints[category];

    if (!endpoint) {
      throw new Error(`Unknown category: ${category}`);
    }

    const normalizedOrderBy = orderBy.toLocaleLowerCase();

    if (normalizedOrderBy === 'rating') {
      orderBy = 'number';
    }

    if (normalizedOrderBy === 'name') {
      orderBy = 'name';
    }

    if (orderIncOrDec === 'asc') {
      orderIncOrDec = 'inc';
    }

    if (orderIncOrDec === 'desc') {
      orderIncOrDec = 'dec';
    }

    let orderByParam = orderBy;

    if (category === 'Political Leaning' && orderBy === 'number') {
      orderByParam = 'political_number';
    }

    if (
      category === 'Political Leaning' &&
      ['liberal rating', 'liberal leaning', 'liberal lean'].includes(
        orderBy.toLocaleLowerCase()
      )
    ) {
      orderByParam = 'political_number';
    }

    if (
      category === 'Political Leaning' &&
      ['conservative rating', 'conservative leaning', 'conservative lean'].includes(
        orderBy.toLocaleLowerCase()
      )
    ) {
      orderByParam = 'political_number';

      // Higher political_number means more liberal, so invert for conservative sorting.
      orderIncOrDec = orderIncOrDec === 'dec' ? 'inc' : 'dec';
    }

    const params = new URLSearchParams({
      order_by: orderByParam,
      order_inc_or_dec: orderIncOrDec,
      limit: String(limit),
      offset: String(offset),
    });

    const url = `${this.baseURL}${endpoint}?${params.toString()}`;

    console.log('The request:', url);

    return this.makeRequest(url);
  }

  /**
   * Get total number of items for a category.
   */
  async getCategoryItemCount(category) {
    const categoryUpper = category.toUpperCase();

    const url = `${this.baseURL}/getNumberOfTopics?queryType=${encodeURIComponent(
      categoryUpper
    )}`;

    const data = await this.makeRequest(url);

    return data[0];
  }

  async getPoliticalLeaning(topic) {
    const url = `${this.baseURL}/getPoliticalLeaning/${encodeURIComponent(topic)}`;
    return this.makeNormalizedRequest(url);
  }

  async getDEIFriendlinessScore(topic) {
    const url = `${this.baseURL}/getDEIFriendlinessScore/${encodeURIComponent(
      topic
    )}`;
    return this.makeNormalizedRequest(url);
  }

  async getWokenessScore(topic) {
    const url = `${this.baseURL}/getWokenessScore/${encodeURIComponent(topic)}`;
    return this.makeNormalizedRequest(url);
  }

  async getEnvironmentalImpactScore(topic) {
    const url = `${this.baseURL}/getEnvironmentalImpactScore/${encodeURIComponent(
      topic
    )}`;
    return this.makeNormalizedRequest(url);
  }

  async getImmigrationSupportScore(topic) {
    const url = `${this.baseURL}/getImmigrationSupportScore/${encodeURIComponent(
      topic
    )}`;
    return this.makeNormalizedRequest(url);
  }

  async getTechnologyInnovationScore(topic) {
    const url = `${this.baseURL}/getTechnologyInnovationScore/${encodeURIComponent(
      topic
    )}`;
    return this.makeNormalizedRequest(url);
  }

  async getOrCreateFinancialContributionsOverview(topic) {
    const url = `${this.baseURL}/getFinancialContributionsOverview/${encodeURIComponent(
      topic
    )}`;

    console.log('Financial contributions overview URL:', url);

    return this.makeNormalizedRequest(url);
  }

  async getFinancialContributionsOverviewTextOnly(topic) {
    const url = `${this.baseURL}/getFinancialContributionsOverviewTextOnly/${encodeURIComponent(
      topic
    )}`;

    console.log('Financial contributions overview text-only URL:', url);

    return this.makeNormalizedRequest(url);
  }

  async getContributionPercentages(committeeId) {
    const url = `${this.baseURL}/getPercentContributionsToDemocratsAndRepublicansWithCommitteeID/${encodeURIComponent(
      committeeId
    )}`;

    return this.makeRequest(url);
  }

  async getContributionRecipients(committeeId) {
    const url = `${this.baseURL}/getContributionRecipientTotalsList/${encodeURIComponent(
      committeeId
    )}`;

    return this.makeRequest(url);
  }

  async getLeadershipContributions(committeeId) {
    const url = `${this.baseURL}/getContributionsToCommitteeFromLeadershipOnly/${encodeURIComponent(
      committeeId
    )}`;

    return this.makeRequest(url);
  }

  categoryToApiKey(category) {
    const categoryMap = {
      'Political Leaning': 'POLITICAL_LEANING',
      'DEI Friendliness': 'DEI_FRIENDLINESS',
      Wokeness: 'WOKENESS',
      'Environmental Impact': 'ENVIRONMENTAL_IMPACT',
      'Immigration Support': 'IMMIGRATION_SUPPORT',
      'Technology Innovation': 'TECHNOLOGY_INNOVATION',
      'Financial Contributions': 'FINANCIAL_CONTRIBUTIONS',
    };

    return categoryMap[category] || null;
  }

  async getRecommendations(category, topicName) {
    const categoryKey = this.categoryToApiKey(category);

    if (!categoryKey) {
      throw new Error(`Unknown category: ${category}`);
    }

    const url = `${this.baseURL}/getRecommendations/${categoryKey}/${encodeURIComponent(
      topicName
    )}`;

    return this.makeRequest(url);
  }

  async submitFeedback(category, id, feedbackText) {
    const categoryKey = this.categoryToApiKey(category);

    if (!categoryKey) {
      throw new Error(`Unknown category: ${category}`);
    }

    const params = new URLSearchParams({
      comment: feedbackText,
    });

    const url = `${this.baseURL}/addComment/${categoryKey}/${id}?${params.toString()}`;

    return this.makeRequest(url, { method: 'POST' });
  }

  async manualEditPersistedAnswer(category, id, contextText) {
    const categoryKey = this.categoryToApiKey(category);

    if (!categoryKey) {
      throw new Error(`Unknown category: ${category}`);
    }

    const params = new URLSearchParams({
      new_text: contextText,
    });

    const url = `${this.baseURL}/manualEditPersistedAnswer/${categoryKey}/${id}?${params.toString()}`;

    return this.makeRequest(url, { method: 'POST' });
  }

  async deletePersistedAnswer(category, id) {
    const categoryKey = this.categoryToApiKey(category);

    if (!categoryKey) {
      throw new Error(`Unknown category: ${category}`);
    }

    const url = `${this.baseURL}/deletePersistedAnswer/${categoryKey}/${id}`;

    return this.makeRequest(url, { method: 'DELETE' });
  }

  async upvote(category, id) {
    const categoryKey = this.categoryToApiKey(category);

    if (!categoryKey) {
      throw new Error(`Unknown category: ${category}`);
    }

    const url = `${this.baseURL}/upvote/${categoryKey}/${id}`;

    return this.makeRequest(url, { method: 'POST' });
  }

  async downvote(category, id) {
    const categoryKey = this.categoryToApiKey(category);

    if (!categoryKey) {
      throw new Error(`Unknown category: ${category}`);
    }

    const url = `${this.baseURL}/downvote/${categoryKey}/${id}`;

    return this.makeRequest(url, { method: 'POST' });
  }

  async searchPersistedAnswers(category, searchTerm) {
    const categoryKey = this.categoryToApiKey(category);

    if (!categoryKey) {
      throw new Error(`Unknown category: ${category}`);
    }

    const url = `${this.baseURL}/searchPersistedAnswers/${categoryKey}/${encodeURIComponent(
      searchTerm
    )}`;

    return this.makeRequest(url);
  }

  /**
   * Generic method to get data by category and topic.
   */
  async getTopicAnalysis(category, topic) {
    const cleanTopic = topic?.trim();

    if (!cleanTopic) {
      throw new Error('Missing topic');
    }

    const categoryMethods = {
      'Political Leaning': () => this.getPoliticalLeaning(cleanTopic),
      'DEI Friendliness': () => this.getDEIFriendlinessScore(cleanTopic),
      Wokeness: () => this.getWokenessScore(cleanTopic),
      'Environmental Impact': () => this.getEnvironmentalImpactScore(cleanTopic),
      'Immigration Support': () => this.getImmigrationSupportScore(cleanTopic),
      'Technology Innovation': () =>
        this.getTechnologyInnovationScore(cleanTopic),
      'Financial Contributions': () =>
        this.getOrCreateFinancialContributionsOverview(cleanTopic),
    };

    const method = categoryMethods[category];

    if (!method) {
      throw new Error(`Unknown category: ${category}`);
    }

    return method();
  }

  // NetworkManager
  // Get the persisted topic analysis for query type by way of the answer id.
  async getPersistedAnswerById(queryType, rowId, includeComments = false) {
    const qt = encodeURIComponent(queryType);
    const id = encodeURIComponent(String(rowId));
    const url = `${this.baseURL}/getPersistedAnswerById/${qt}/${id}?include_comments=${includeComments}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.defaultOptions.headers,
    });
    if (!response.ok) {
      throw new Error(`getPersistedAnswerById failed: ${response.status}`);
    }
    return await response.json(); // { success, answer }
  }
}

const networkManager = new NetworkManager();

export default networkManager;
