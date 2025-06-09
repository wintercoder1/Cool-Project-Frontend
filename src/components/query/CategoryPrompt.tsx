const CategoryPrompt = ({ category }) => {
  const getCategoryPrompt = () => {
    switch(category) {
      case 'Political Leaning':
        return "What organization do you want to find the political leaning of?";
      case 'DEI Friendliness':
        return "What organization do you want to find the DEI friendliness score of?";
      case 'Wokeness':
        return "What organization do you want to find the wokeness score of?";
      case 'Environmental Impact':
        return "What organization do you want to find the environmental impact score of?";
      case 'Immigration':
        return "What organization do you want to find the immigration friendliness score of?";
      case 'Technology Innovation':
        return "What organization do you want to find the technology innovation score of?";
      case 'Financial Contributions':
        return "What organization do you want to find the financial contribution information for?";
      default:
        return "What organization would you like to search for?";
    }
  };

  return (
    <h1 className="text-xl font-medium">
      {getCategoryPrompt()}
    </h1>
  );
};

export default CategoryPrompt;