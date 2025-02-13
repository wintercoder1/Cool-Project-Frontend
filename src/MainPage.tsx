import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from 'lucide-react';
// Use coordinator instead.
import OrganizationDetail from '@/OrganizationDetail'


const MainPage = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Page loaded?')
    const fetchData = async () => {
      try {
        // const response = await fetch('http://18.188.2.109:443/getCachedPolitcalLeanings');
        const response = await fetch('http://127.0.0.1:8000/getCachedPolitcalLeanings');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        console.log('data fetched:')
        console.log(jsonData)
        setData(jsonData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const getLeaningStyle = (rating, lean) => {
    const isLiberal = lean.toLowerCase().includes('liberal');
    const baseStyle = 'text-right font-medium';
    
    return `${baseStyle} ${isLiberal ? 'text-blue-600' : 'text-red-600'}`;
  };

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="text-red-500">Error loading data: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    //  
    // max-w-md 
    // max-w-7xl 
    <Card className="px-5 w-screen mx-auto bg-white">
      <CardContent className="p-4">
        <div className="text-xl font-bold mb-4 border-b pb-2">PolitiCheck.AI</div>
        
        <div className="space-y-2">
          {data.map((item, index) => (
            <div 
                key={index}
                className="flex justify-between items-center p-2 border rounded"
                onClick={() => openDetailPage()}
              >
                 
                <div className="font-medium">
                  {item.topic}
                </div>
                <div className={getLeaningStyle(item.rating, item.lean)}>
                  {item.rating} {item.lean}
                </div>
                {/* </button> */}
              </div>
          ))}
        </div>

        <div className="fixed bottom-6 right-6">
          <button 
            className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
            onClick={() => window.open('about:blank', '_blank')}
          >
            <Plus size={24} />
          </button>
        </div>

      </CardContent>
    </Card>
  );
};

const openDetailPage = () => {
  console.log('lol')
  // const test_org_detail = {"timestamp": "2024-11-15T02:19:13.500000",
  //   "citation": "\nSource 9:\nIn the case of Bud Light, the presence of many other light beers on the shelf suggests a high degree of substitutability and low switching costs. This is compounded by the brand’s lack of taste differentiation from its closest competitors: Blind taste tests on social media show light beer drinkers struggling to distinguish Bud Light from Coors Light and Miller Light. The similarity in flavor profiles among these leading light beer brands suggests that, for consumers, the decision to boycott Bud Light by switching to an alternative like Coors Light or Miller Light involves minimal sacrifice in terms of taste preference.\n\nObservability of consumption.\n",
  //   "context": " Molson is a Canadian beer company, and based on the political leanings of other Canadian companies, such as Labatt (3 Liberal), it is likely that Molson has a similar political leaning [1]. However, it's worth noting that Molson's parent company, Molson Coors Brewing Company, has a more conservative leaning due to its ownership of Coors, a well-known conservative brand [2]. Therefore, Molson's political leaning is likely to be slightly more liberal than its parent company. Reference: [1] Labatt: 3 Liberal [2] Coors: 4 Conservative.  Source 1: Labatt: 3 Liberal Source 2: Coors: 4 Conservative.  Source 9:\nIn the case of Bud Light, the presence of many other light beers on the shelf suggests a high degree of substitutability and low switching costs. This is compounded by the brand’s lack of taste differentiation from its closest competitors: Blind taste tests on social media show light beer drinkers struggling to distinguish Bud Light from Coors Light and Miller Light. The similarity in flavor profiles among these leading light beer brands suggests that, for consumers, the decision to boycott Bud Light by switching to an alternative\n",
  //   "lean": " Liberal",
  //   "rating": 3,
  //   "topic": "molson"};
  // window.open('about:blank', '_blank')
  window.open("organization", "_blank")
  // window.open("theorganization", "_blank")
};

export default MainPage;