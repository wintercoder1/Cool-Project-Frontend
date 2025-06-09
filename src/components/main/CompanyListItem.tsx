const CompanyListItem = ({ item, categoryValueLabel, onClick }) => {
  return (
    <div 
      className="flex justify-between items-center p-4 border rounded cursor-pointer hover:bg-gray-50"
      onClick={() => onClick(item)}
    >
      <div className="font-medium">
        {item.topic}
      </div>
      <div className='text-right font-medium text-gray-600'> 
        {categoryValueLabel}
      </div>
    </div>
  );
};

export default CompanyListItem;