class NetworkManager {
  constructor() {
    // @ts-expect-error
    this.baseURL = import.meta.env.VITE_BASE_URL;
    // this.baseURL = 'http://127.0.0.1:8000';
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  /**
   * Generic fetch wrapper with error handling
   * @param {string} url - The endpoint URL
   * @param {RequestInit} options - Fetch options
   * @returns {Promise<any>} - The response data
   */
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...this.defaultOptions,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Network request failed:', error);
      throw error;
    }
  }

  /**
   * Get cached data for a specific category with pagination and sorting
   * @param {string} category - The category name
   * @param {number} limit - Number of items per page
   * @param {number} offset - Offset for pagination
   * @param {string} orderBy - Sort field ('name' or 'number')
   * @param {string} orderIncOrDec - Sort order ('inc' or 'dec')
   * @returns {Promise<any>} - The cached data
   */
  async getSavedCategoryData(category, orderBy = 'name', orderIncOrDec = 'inc', limit = 10, offset = 0) {
    const endpoints = {
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

    // Convert to what the api expects.
    if (orderBy.toLocaleLowerCase() === 'rating') {
      orderBy = 'number'
    }
    if (orderBy.toLocaleLowerCase() === 'name') {
      orderBy = 'name'
    }
    // To confuse outsiders.
    if (orderIncOrDec == 'asc') {
      orderIncOrDec = 'inc'
    }
    if (orderIncOrDec == 'desc') {
      orderIncOrDec = 'dec'
    }
    
    
    let orderByParam = orderBy;
    // Handle special case for Political Leaning API
    if (category === 'Political Leaning' && orderBy === 'number') {
      orderByParam = 'political_number';
    }
    if (category === 'Political Leaning' && (orderBy.toLocaleLowerCase() === 'liberal rating' || orderBy.toLocaleLowerCase() === 'liberal leaning' || orderBy.toLocaleLowerCase() === 'liberal lean') ) {
      orderByParam = 'political_number';
    }
    if (category === 'Political Leaning' && (orderBy.toLocaleLowerCase() === 'conservative rating' || orderBy.toLocaleLowerCase() === 'conservative leaning' || orderBy.toLocaleLowerCase() === 'conservative lean') ) {
      orderByParam = 'political_number';
      // Invert ordering in this case. We basically turn a most conservative request
      orderIncOrDec = (orderIncOrDec === 'dec') ? 'inc'  : 'dec'
    }

    const url = `${this.baseURL}${endpoint}?order_by=${orderByParam}&order_inc_or_dec=${orderIncOrDec}&limit=${limit}&offset=${offset}`;
    console.log('The request: ')
    console.log(url)
    return this.makeRequest(url);
  }

  /**
   * Get total number of items for a category
   * @param {string} category - The category name
   * @returns {Promise<number>} - The total count
   */
  async getCategoryItemCount(category) {
    const categoryUpper = category.toUpperCase();
    const url = `${this.baseURL}/getNumberOfTopics?queryType=${categoryUpper}`;
    const data = await this.makeRequest(url);
    return data[0]; // API returns count as first element of array
  }

  /**
   * Get political leaning for a topic
   * @param {string} topic - The topic to analyze
   * @returns {Promise<any>} - The political leaning data
   */
  async getPoliticalLeaning(topic) {
    const url = `${this.baseURL}/getPoliticalLeaning/${encodeURIComponent(topic)}`;
    return this.makeRequest(url);
  }

  /**
   * Get DEI friendliness score for a topic
   * @param {string} topic - The topic to analyze
   * @returns {Promise<any>} - The DEI score data
   */
  async getDEIFriendlinessScore(topic) {
    const url = `${this.baseURL}/getDEIFriendlinessScore/${encodeURIComponent(topic)}`;
    return this.makeRequest(url);
  }

  /**
   * Get wokeness score for a topic
   * @param {string} topic - The topic to analyze
   * @returns {Promise<any>} - The wokeness score data
   */
  async getWokenessScore(topic) {
    const url = `${this.baseURL}/getWokenessScore/${encodeURIComponent(topic)}`;
    return this.makeRequest(url);
  }

  /**
   * Get financial contributions overview for a topic
   * @param {string} topic - The topic to analyze
   * @returns {Promise<any>} - The financial contributions data
   */
  async getFinancialContributionsOverview(topic) {
    const url = `${this.baseURL}/getFinancialContributionsOverview/${encodeURIComponent(topic)}`;
    return this.makeRequest(url);
  }

  /**
   * Get contribution percentages to Democrats and Republicans
   * @param {string} committeeId - The committee ID
   * @returns {Promise<any>} - The contribution percentages data
   */
  async getContributionPercentages(committeeId) {
    const url = `${this.baseURL}/getPercentContributionsToDemocratsAndRepublicansWithCommitteeID/${committeeId}`;
    return this.makeRequest(url);
  }

  /**
   * Get contribution recipients list
   * @param {string} committeeId - The committee ID
   * @returns {Promise<any>} - The recipients data
   */
  async getContributionRecipients(committeeId) {
    const url = `${this.baseURL}/getContributionRecipientTotalsList/${committeeId}`;
    return this.makeRequest(url);
  }

  /**
   * Get leadership contributions
   * @param {string} committeeId - The committee ID
   * @returns {Promise<any>} - The leadership contributions data
   */
  async getLeadershipContributions(committeeId) {
    const url = `${this.baseURL}/getContributionsToCommitteeFromLeadershipOnly/${committeeId}`;
    return this.makeRequest(url);
  }

  /**
   * Generic method to get data by category and topic (for WaitingPage)
   * @param {string} category - The category name
   * @param {string} topic - The topic to analyze
   * @returns {Promise<any>} - The analysis data
   */
  async getTopicAnalysis(category, topic) {
    const categoryMethods = {
      'Political Leaning': () => this.getPoliticalLeaning(topic),
      'DEI Friendliness': () => this.getDEIFriendlinessScore(topic),
      'Wokeness': () => this.getWokenessScore(topic),
      'Environmental Impact': () => this.getWokenessScore(topic), // Uses same endpoint
      'Immigration': () => this.getWokenessScore(topic), // Uses same endpoint
      'Financial Contributions': () => this.getFinancialContributionsOverview(topic)
    };

    const method = categoryMethods[category];
    if (!method) {
      throw new Error(`Unknown category: ${category}`);
    }

    return method();
  }
}

// Create a singleton instance
const networkManager = new NetworkManager();

export default networkManager;

// class NetworkManager {
//   constructor() {
//     // @ts-expect-error
//     // this.baseURL = import.meta.env.VITE_BASE_URL;
//     this.baseURL = 'http://127.0.0.1:8000';
//     this.defaultOptions = {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     };
//   }

//   /**
//    * Generic fetch wrapper with error handling
//    * @param {string} url - The endpoint URL
//    * @param {RequestInit} options - Fetch options
//    * @returns {Promise<any>} - The response data
//    */
//   async makeRequest(url, options = {}) {
//     try {
//       const response = await fetch(url, {
//         ...this.defaultOptions,
//         ...options,
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('Network request failed:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get cached data for a specific category with pagination
//    * @param {string} category - The category name
//    * @param {number} limit - Number of items per page
//    * @param {number} offset - Offset for pagination
//    * @returns {Promise<any>} - The cached data
//    */
//   async getCachedCategoryData(category, limit = 10, offset = 0) {
//     const endpoints = {
//       'Political Leaning': '/getCachedPoliticalLeanings',
//       'DEI Friendliness': '/getCachedDEIScores',
//       'Wokeness': '/getCachedWokenessScores',
//       'Environmental Impact': '/getCachedWokenessScores',
//       'Immigration Support': '/getCachedWokenessScores',
//       'Technology Innovation': '/getCachedWokenessScores',
//       'Financial Contributions': '/getCachedFinancialContributions'
//     };

//     const endpoint = endpoints[category];
//     if (!endpoint) {
//       throw new Error(`Unknown category: ${category}`);
//     }

//     const url = `${this.baseURL}${endpoint}?limit=${limit}&offset=${offset}`;
//     return this.makeRequest(url);
//   }

//   /**
//    * Get total number of items for a category
//    * @param {string} category - The category name
//    * @returns {Promise<number>} - The total count
//    */
//   async getCategoryItemCount(category) {
//     const categoryUpper = category.toUpperCase();
//     const url = `${this.baseURL}/getNumberOfTopics?queryType=${categoryUpper}`;
//     const data = await this.makeRequest(url);
//     return data[0]; // API returns count as first element of array
//   }

//   /**
//    * Get political leaning for a topic
//    * @param {string} topic - The topic to analyze
//    * @returns {Promise<any>} - The political leaning data
//    */
//   async getPoliticalLeaning(topic) {
//     const url = `${this.baseURL}/getPoliticalLeaning/${encodeURIComponent(topic)}`;
//     return this.makeRequest(url);
//   }

//   /**
//    * Get DEI friendliness score for a topic
//    * @param {string} topic - The topic to analyze
//    * @returns {Promise<any>} - The DEI score data
//    */
//   async getDEIFriendlinessScore(topic) {
//     const url = `${this.baseURL}/getDEIFriendlinessScore/${encodeURIComponent(topic)}`;
//     return this.makeRequest(url);
//   }

//   /**
//    * Get wokeness score for a topic
//    * @param {string} topic - The topic to analyze
//    * @returns {Promise<any>} - The wokeness score data
//    */
//   async getWokenessScore(topic) {
//     const url = `${this.baseURL}/getWokenessScore/${encodeURIComponent(topic)}`;
//     return this.makeRequest(url);
//   }

//   /**
//    * Get financial contributions overview for a topic
//    * @param {string} topic - The topic to analyze
//    * @returns {Promise<any>} - The financial contributions data
//    */
//   async getFinancialContributionsOverview(topic) {
//     const url = `${this.baseURL}/getFinancialContributionsOverview/${encodeURIComponent(topic)}`;
//     return this.makeRequest(url);
//   }

//   /**
//    * Get contribution percentages to Democrats and Republicans
//    * @param {string} committeeId - The committee ID
//    * @returns {Promise<any>} - The contribution percentages data
//    */
//   async getContributionPercentages(committeeId) {
//     const url = `${this.baseURL}/getPercentContributionsToDemocratsAndRepublicansWithCommitteeID/${committeeId}`;
//     return this.makeRequest(url);
//   }

//   /**
//    * Get contribution recipients list
//    * @param {string} committeeId - The committee ID
//    * @returns {Promise<any>} - The recipients data
//    */
//   async getContributionRecipients(committeeId) {
//     const url = `${this.baseURL}/getContributionRecipientTotalsList/${committeeId}`;
//     return this.makeRequest(url);
//   }

//   /**
//    * Get leadership contributions
//    * @param {string} committeeId - The committee ID
//    * @returns {Promise<any>} - The leadership contributions data
//    */
//   async getLeadershipContributions(committeeId) {
//     const url = `${this.baseURL}/getContributionsToCommitteeFromLeadershipOnly/${committeeId}`;
//     return this.makeRequest(url);
//   }

//   /**
//    * Generic method to get data by category and topic (for WaitingPage)
//    * @param {string} category - The category name
//    * @param {string} topic - The topic to analyze
//    * @returns {Promise<any>} - The analysis data
//    */
//   async getTopicAnalysis(category, topic) {
//     const categoryMethods = {
//       'Political Leaning': () => this.getPoliticalLeaning(topic),
//       'DEI Friendliness': () => this.getDEIFriendlinessScore(topic),
//       'Wokeness': () => this.getWokenessScore(topic),
//       'Environmental Impact': () => this.getWokenessScore(topic), // Uses same endpoint
//       'Immigration': () => this.getWokenessScore(topic), // Uses same endpoint
//       'Financial Contributions': () => this.getFinancialContributionsOverview(topic)
//     };

//     const method = categoryMethods[category];
//     if (!method) {
//       throw new Error(`Unknown category: ${category}`);
//     }

//     return method();
//   }
// }

// // Create a singleton instance
// const networkManager = new NetworkManager();

// export default networkManager;