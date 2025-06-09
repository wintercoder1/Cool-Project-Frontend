import CompanyListItem from './CompanyListItem';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

const CompanyList = ({ 
  data, 
  loading, 
  category, 
  onItemClick,
  getCategoryValueLabel 
}) => {
  if (loading) {
    return <LoadingState />;
  }

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-2 px-4">
      {data.map((item, index) => (
        <CompanyListItem
          key={index}
          item={item}
          categoryValueLabel={getCategoryValueLabel()(item)}
          onClick={(item) => onItemClick(item, category)}
        />
      ))}
    </div>
  );
};

export default CompanyList;