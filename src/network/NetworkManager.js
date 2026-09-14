class NetworkManager {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000';
    // this.baseURL = 'http://127.0.0.1:8000';

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

        // The message is left exactly as it was so existing callers that
        // surface or log it keep behaving the same; the status rides along as a
        // property. Without it the only way to tell a 401 (session no good)
        // from a 500 (auth not configured server-side) or a 503 (auth provider
        // unreachable, worth retrying) is to string-match the message.
        const error = new Error(
          `HTTP error! Status: ${response.status}${
            errorBody ? ` Body: ${errorBody}` : ''
          }`
        );
        error.status = response.status;
        error.body = errorBody;
        throw error;
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
      'Leadership Demographics': '/getCachedLeadership',
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

    // Leadership has no rating, so it keeps its own allowlist: name, topic,
    // time, id, size (officer count). 'number' would sort by name silently.
    if (category === 'Leadership Demographics') {
      orderByParam = normalizedOrderBy === 'size' ? 'size' : 'name';
    }

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

    const data = await this.makeRequest(url);

    // The cached-list endpoints disagree on shape: the older ones return a bare
    // array, while /getCachedLeadership returns
    // { success, results, total_count, limit, offset }. Callers map over the
    // rows, so unwrap here rather than making every list view know which
    // endpoint it came from. (total_count is dropped: pagination takes its
    // count from getNumberOfTopics, and mixing the two sources would be worse
    // than the small disagreement between them.)
    if (data && !Array.isArray(data) && Array.isArray(data.results)) {
      return data.results;
    }

    return data;
  }

  /**
   * Get total number of items for a category.
   */
  async getCategoryItemCount(category) {
    // getNumberOfTopics parses strictly now: an unrecognised value is a 400,
    // not a silent fall-through to political leaning. Uppercasing the display
    // label happens to work for the score categories (the parser tolerates
    // spaces) but not for ones whose label differs from their query type.
    const queryType = this.categoryToApiKey(category) ?? category.toUpperCase();

    const url = `${this.baseURL}/getNumberOfTopics?queryType=${encodeURIComponent(
      queryType
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

  /**
   * Party split only, straight from the knowledge graph — ~0.15s, no row fetch.
   *
   * Used to resolve what a bare /organization/financial_contributions/<topic>
   * URL should do, because one call answers three questions: whether a full
   * answer exists (`full_answer_available`), its id (`id`), and whether there
   * is a committee at all (`committee_status`). That last one matters: a
   * company with no PAC has nothing to generate.
   */
  async getFinancialContributionsPercentContributionsOnly(topic) {
    const url = `${this.baseURL}/getFinancialContributionsPercentContributionsOnly/${encodeURIComponent(
      topic
    )}`;
    return this.makeRequest(url);
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
      // The backend's query type is LEADERSHIP; the UI label is longer. Without
      // this mapping the count call sent "LEADERSHIP DEMOGRAPHICS", which the
      // API now rejects with a 400 rather than silently reading political
      // leaning as it used to.
      'Leadership Demographics': 'LEADERSHIP',
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

  /**
   * Search cached answers.
   *
   * `allowDuplicates` maps to the endpoint's allow_duplicates param, which
   * defaults to TRUE server-side — that default is why search shows every
   * stored version of a topic while browsing (which uses DISTINCT ON) shows
   * one. Passing false makes the server collapse them, so the filtering
   * happens before pagination rather than after.
   *
   * It is not a complete fix on its own: the server groups by
   * normalized_topic_name, so rows whose topic carries an invisible character
   * get a different normalized name and survive as visually identical
   * duplicates. MainPage still runs its own pass over the result for those.
   */
  async searchPersistedAnswers(category, searchTerm, { allowDuplicates } = {}) {
    const categoryKey = this.categoryToApiKey(category);

    if (!categoryKey) {
      throw new Error(`Unknown category: ${category}`);
    }

    const base = `${this.baseURL}/searchPersistedAnswers/${categoryKey}/${encodeURIComponent(
      searchTerm
    )}`;
    const url = allowDuplicates === undefined
      ? base
      : `${base}?allow_duplicates=${allowDuplicates ? 'true' : 'false'}`;

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
      'Leadership Demographics': () => this.getLeadership(cleanTopic),
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

  /**
   * C-suite roster plus aggregate demographics for one company.
   *
   * Per-topic only: there is no getCachedLeadership* list endpoint, and passing
   * LEADERSHIP to getNumberOfTopics/searchPersistedAnswers silently returns
   * POLITICAL_LEANING rows (CoreLogic._parseQueryTypeStr defaults rather than
   * rejecting), so neither can back this category.
   *
   * A cache miss runs the full SEC/Wikidata lookup, so this can be slow.
   */
  async getLeadership(topic, { overrideCache } = {}) {
    const base = `${this.baseURL}/getLeadership/${encodeURIComponent(topic)}`;
    const url = overrideCache ? `${base}?overrideCache=true` : base;
    return this.makeRequest(url);
  }

  // ---------------------------------------------------------------------------
  // Favorites
  //
  // These are the only endpoints here that require a signed-in user. Clerk's
  // session token lives ~60s and its SDK refreshes it, so callers must pass a
  // freshly-awaited getToken() per call rather than holding one — see
  // useFavoriteToken(). A missing token means a 401, so callers check first.
  // ---------------------------------------------------------------------------

  authHeaders(token) {
    return { Authorization: `Bearer ${token}` };
  }

  /** True/false for one answer. Requires auth. */
  async isFavorited(queryType, answerId, token) {
    const url = `${this.baseURL}/isFavorited/${encodeURIComponent(
      queryType
    )}/${encodeURIComponent(answerId)}`;
    return this.makeRequest(url, { headers: this.authHeaders(token) });
  }

  /** Idempotent — re-saving returns the existing row. Requires auth. */
  async addFavorite(queryType, answerId, token) {
    const url = `${this.baseURL}/addFavorite/${encodeURIComponent(
      queryType
    )}/${encodeURIComponent(answerId)}`;
    return this.makeRequest(url, {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /** Removing something unsaved is a 200 with rows_deleted: 0. Requires auth. */
  async removeFavorite(queryType, answerId, token) {
    const url = `${this.baseURL}/removeFavorite/${encodeURIComponent(
      queryType
    )}/${encodeURIComponent(answerId)}`;
    return this.makeRequest(url, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  /** Full listing, newest first, enriched with each answer's display topic. */
  async getFavorites(token, { limit = 50, offset = 0, queryType } = {}) {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (queryType) params.set('query_type', queryType);
    const url = `${this.baseURL}/getFavorites?${params.toString()}`;
    return this.makeRequest(url, { headers: this.authHeaders(token) });
  }

  // ---------------------------------------------------------------------------
  // Compass Match — the values quiz
  //
  // All three are anonymous and stay that way: no Authorization header, and
  // nothing about a run is stored server-side. The share token IS the answers,
  // compressed — there is no record to look up. Shapes live in src/lib/quiz.ts.
  // ---------------------------------------------------------------------------

  /**
   * The questions, plus a live company count per shopping category.
   *
   * Fetch per session rather than caching across releases: quiz_version and the
   * category counts both move server-side, and a stale definition posted at a
   * retuned scorer is refused with a 400 rather than silently mis-scored.
   */
  async getQuizDefinition() {
    return this.makeRequest(`${this.baseURL}/getQuizDefinition`);
  }

  /**
   * Answers in, ranking out.
   *
   * POST with the answers in the body rather than a query string on purpose —
   * a primary run then keeps someone's stated political positions out of
   * server logs and browser history. The share link is the one place they
   * necessarily become visible, which is what share_warning is for.
   *
   * Send answers, never a computed score. Scoring stays on the server where it
   * is versioned and tested; there is no endpoint that accepts a match value.
   */
  async submitQuiz(submission) {
    return this.makeRequest(`${this.baseURL}/submitQuiz`, {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  }

  /**
   * Re-scores a shared link. Same response shape as submitQuiz.
   *
   * The result is recomputed rather than retrieved, and reproduces the original
   * ranking because as_of is pinned inside the token itself.
   */
  async getQuizResult(shareToken) {
    const url = `${this.baseURL}/getQuizResult?a=${encodeURIComponent(
      shareToken
    )}`;
    return this.makeRequest(url);
  }
}

const networkManager = new NetworkManager();

export default networkManager;
