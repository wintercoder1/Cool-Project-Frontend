import { useState, useEffect } from 'react';
import { Loader2, X} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from 'react-router-dom';



const WaitingPage = () => {
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  
  // Mock location data - in real app this would come from useLocation()

  // Mock environment variable for demo
  // const ENVIRONMENT_BASE_URL = 'https://api.example.com';
  // //@ts-expect-error
  // const ENVIRONMENT_BASE_URL = import.meta.env.VITE_BASE_URL
  const ENVIRONMENT_BASE_URL = 'http://127.0.0.1:8000'

  const categoryEndpoints = {
    'Political Leaning': ENVIRONMENT_BASE_URL + '/getPoliticalLeaning/',
    'DEI Friendliness': ENVIRONMENT_BASE_URL + '/getDEIFriendlinessScore/',
    'Wokeness': ENVIRONMENT_BASE_URL + '/getWokenessScore/',
    'Environmental Impact': ENVIRONMENT_BASE_URL + '/getCachedWokenessScores',
    'Immigration': ENVIRONMENT_BASE_URL + '/getCachedWokenessScores',
    'Financial Contributions': ENVIRONMENT_BASE_URL + '/getFinancialContributionsOverview/'
  };

  // TODO: Make this code cleaner.
  useEffect(() => {
    console.log('location.state:')
    console.log(location.state)
    let category = ''
    let searchTerm = ''
    if (location && location.state && location.state.current_category && location.state.search_term) {
      category  = location.state.current_category;
      searchTerm = location.state.search_term;
      setCategory(category)
      setSearchTerm(searchTerm)
    } else {
      showGenericErrorDialog()
      return
    }
    
    if (category && searchTerm) {
      console.log('Fetching data..')
      fetchData(searchTerm, category);
    }

    // Make the timeout a bit longer for finincial contributions queries. At least for now.
    // TODO: Load the financial contrubtions first, go to page and then create the LLM generated text.
    const TIME_OUT = category == 'Financial Contributions' ?  3000 : 2200
    setTimeout(() => {
      showErrorDialog('Request timed out.');
    }, TIME_OUT);
  }, []);

  const fetchData = async (query_topic, category) => {
    try {
      const baseEndpoint = categoryEndpoints[category] || categoryEndpoints['Political Leaning'];
      const response = await fetch(`${baseEndpoint}${encodeURIComponent(query_topic)}`);
      
      console.log('Response:', response);

      if (!response.ok) {
        const networkError = 'Network response was not ok';
        showErrorDialog(networkError);
        throw new Error();
      }
       
      const jsonData = await response.json();
      console.log('Data fetched:', jsonData);

      // Check if the response contains an error
      if (jsonData.error) { 
        const message = jsonData.message; 
        showErrorDialog(message || 'An unexpected error occurred.');
        return;
      }
      console.log('Success so far!!');
      // Success - navigate to organization page
      console.log('Now navigating to page with category ', category)
      openDetailPageCurrentTab(jsonData, category);

    } catch (err) {
      console.error('Error fetching data:', err);
      showErrorDialog('Something went wrong. Please check your connection and try again.');
    }
  };

  const openDetailPageCurrentTab = (organization, category) => {
    localStorage.setItem(`categoryData`, category);
    navigate('/organization', { 
      state: { 
        ...organization, 
        categoryData: category 
      }
    });
  };

  const showGenericErrorDialog = () => {
    const generic_message = 'Something went wrong.'
    showErrorDialog(generic_message)
  }

  const showErrorDialog = (message) => {
    console.log('Error occurred:', message);
    setErrorModal({
      isOpen: true,
      message: message
    });
  };

  const closeErrorModal = () => {
    setErrorModal({
      isOpen: false,
      message: ''
    });
  };

  const closeErrorModalAndGoBack = () => {
    setErrorModal({
      isOpen: false,
      message: ''
    });
    // Optionally navigate back to previoius page.
    navigate(-1);
  };

  return (
    <>
      <div className="min-h-screen w-screen flex flex-col items-center justify-center py-40 bg-white space-y-40">
        {/* Top text */}
        <div className="text-2xl text-gray-500">
          Calculating...
        </div>

        {/* Spinner */}
        <div className="text-blue-400">
          <Loader2 className="h-28 w-28 animate-spin" />
        </div>

        {/* Bottom text */}
        <div className="text-lg text-gray-500">
          This may take a while..
        </div>
      </div>

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={closeErrorModal}
        onGoBack={closeErrorModalAndGoBack}
        message={errorModal.message}
      />
    </>
  );
};

const ErrorModal = ({ isOpen, onClose, onGoBack, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in duration-200">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            {/* <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div> */}
            <h3 className="text-lg font-semibold text-gray-900">
              Error
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end">
            <Button
              onClick={onGoBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage;

// import { Loader2 } from 'lucide-react';

// const WaitingPage = () => {
//   return (
//     <div className="min-h-screen w-screen flex  flex-col items-center space-y-40 py-40 bg-white space-y-8">
//       {/* Top text */}
//       <div className="text-2xl text-gray-500">
//         Calculating...
//       </div>

//       {/* Spinner */}
//       <div className="text-blue-400">
//         <Loader2 className="h-28 w-28 animate-spin" />
//       </div>

//       {/* Bottom text */}
//       <div className="text-lg text-gray-500">
//         This may take a while..
//       </div>
//     </div>
//   );
// };

// export default WaitingPage;