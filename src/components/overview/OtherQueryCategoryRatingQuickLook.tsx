const OtherQueryCategoryRatingQuickLook = ({ text, rating }) => {
  return (
    <div className="space-y-1">
      <br/>
      <div className="flex justify-between items-start">
        <div className="text-3xl">
          {text}
        </div>
        <div className="text-6xl font-bold">
          {rating}
        </div>
      </div>
    </div>
  );
};

export default OtherQueryCategoryRatingQuickLook;