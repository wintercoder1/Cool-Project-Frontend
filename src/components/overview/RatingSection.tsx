// components/overview/RatingSection.jsx
import PoliticalLeaningQuickLook from './PoliticalLeaningQuickLook';
import OtherQueryCategoryRatingQuickLook from './OtherQueryCategoryRatingQuickLook';

const RatingSection = ({ categoryData, lean, rating }) => {
  if (categoryData === 'Political Leaning') {
    return (
      <PoliticalLeaningQuickLook 
        lean={lean}
        rating={rating}
      />
    );
  }

  if (categoryData !== 'Political Leaning' && categoryData !== 'Financial Contributions') {
    return (
      <OtherQueryCategoryRatingQuickLook
        text={`${categoryData} Rating:`}
        rating={rating}
      />
    );
  }

  return null;
};

export default RatingSection;