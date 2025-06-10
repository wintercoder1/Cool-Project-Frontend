const PoliticalLeaningQuickLook = ({ lean, rating }) => {
  return (
    <div className="space-y-1">
      <br/>
      <div className="flex justify-between items-start">
        <div className="text-lg">
          <div className="text-lg">
            Lean:
          </div>
          <div className="text-3xl">
            {lean ? capitalizeFirstLetter(lean.trim()): ''}
          </div>
        </div>
        <div className="text-6xl font-bold">
          {rating}
        </div>
      </div>
    </div>
  );
};

const capitalizeFirstLetter = (val) =>{
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export default PoliticalLeaningQuickLook;