import { useState, useEffect } from 'react';
import networkManager from '../../network/NetworkManager';

const CATEGORY_TO_SLUG: Record<string, string> = {
  'Political Leaning': 'political_leaning',
  'DEI Friendliness': 'dei_friendliness',
  'Wokeness': 'wokeness',
  'Environmental Impact': 'environmental_impact',
  'Immigration Support': 'immigration_support',
  'Technology Innovation': 'technology_innovation',
  'Financial Contributions': 'financial_contributions',
};

const getRatingLabel = (rec: any, categoryData: string): string | null => {
  if (categoryData === 'Political Leaning' && rec.lean) {
    return `${rec.rating} · ${rec.lean}`;
  }
  if (rec.rating !== undefined && rec.rating !== null) {
    return `${rec.rating}/5`;
  }
  return null;
};

const RecommendationCard = ({ rec, categoryData }: { rec: any; categoryData: string }) => {
  const handleClick = () => {
    const slug = CATEGORY_TO_SLUG[categoryData] ?? categoryData.toLowerCase().replace(/\s+/g, '_');
    localStorage.setItem('categoryData', categoryData);
    localStorage.setItem('organizationData', JSON.stringify(rec));
    window.open(`/organization/${slug}/${encodeURIComponent(rec.topic)}`, '_blank', 'noreferrer');
  };

  const ratingLabel = getRatingLabel(rec, categoryData);

  return (
    <button
      onClick={handleClick}
      className="flex-shrink-0 w-44 text-left p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
    >
      <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-1">
        {rec.topic}
      </p>
      {ratingLabel && (
        <p className="text-xs text-gray-500">{ratingLabel}</p>
      )}
    </button>
  );
};

const RecommendationsSection = ({ organizationData, categoryData }: { organizationData: any; categoryData: string }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationData?.topic || !categoryData) return;
    let cancelled = false;
    const fetchRecs = async () => {
      try {
        const data = await networkManager.getRecommendations(categoryData, organizationData.topic);
        if (!cancelled && data.success) {
          setRecommendations(data.recommendations || []);
        }
      } catch {
        // Recommendations are supplementary — fail silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRecs();
    return () => { cancelled = true; };
  }, [organizationData?.topic, categoryData]);

  if (loading || recommendations.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">
        Organizations or people with a similar {categoryData} rating: {/* Put this here when it works on the open internet and more people queries will be made.*/}
        {/* Organizations with a similar {categoryData} rating: */}
      </h4>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {recommendations.map(rec => (
          <RecommendationCard key={rec.id} rec={rec} categoryData={categoryData} />
        ))}
      </div>
    </div>
  );
};

export default RecommendationsSection;
