import { useState, useEffect, useRef } from 'react';
import { Loader2, X} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from 'react-router-dom';
import networkManager from './network/NetworkManager';
// import networkManager from '@/network/NetworkManager.tsx'

const WaitingPage = () => {
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: ''
  });

  const [_, setSearchTerm] = useState('');
  const [__, setCategory] = useState('');
  const [, setFetchComplete] = useState(false);
  const timeoutRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

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

    // Per-category budgets. Leadership is the slow one: a cold lookup queries
    // SEC EDGAR (~8s) and then Wikidata for biographies (~20s more), so the old
    // 15.5s ceiling timed out every first-time company while the request was
    // still progressing normally.
    const TIME_OUT =
      category === 'Leadership Demographics' ? 45000 :
      category === 'Financial Contributions' ? 25500 :
      15500;

    // Kept in a ref and cleared when the fetch settles. The previous
    // `if (!fetchComplete)` guard read the value captured at mount, so it was
    // always false — the timer was scheduled every time and its callback fired
    // unconditionally, showing "Request timed out" even after a request had
    // already succeeded or failed.
    timeoutRef.current = setTimeout(() => {
      showErrorDialog('Request timed out.');
    }, TIME_OUT);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const cancelTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const fetchData = async (query_topic, category) => {
    try {
      console.log(`Fetching ${category} data for topic: ${query_topic}`);
      
      const jsonData = await networkManager.getTopicAnalysis(category, query_topic);
      console.log('Data fetched:', jsonData);
      setFetchComplete(true)
      cancelTimeout();

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
      cancelTimeout();
      showErrorDialog('Something went wrong. Please check your connection and try again.');
    }
  };

  const openDetailPageCurrentTab = (organization, category) => {
    localStorage.setItem(`categoryData`, category);

    // Leadership has its own page, which reads the topic from the URL. The bare
    // /organization route renders OrganizationDetailOverview, which is built
    // around a lean/rating answer and cannot display a roster. ?id= points at
    // the exact row that was just created.
    if (category === 'Leadership Demographics') {
      const topicParam = encodeURIComponent(organization?.topic ?? '');
      const idParam =
        organization?.id != null ? `?id=${encodeURIComponent(organization.id)}` : '';
      navigate(`/organization/leadership_demographics/${topicParam}${idParam}`);
      return;
    }

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
            <h3 className="text-lg font-semibold text-gray-900">
              Error
            </h3>
          </div>
          <button
            onClick={onClose}
            className="transition-colors bg-white"
          >
            <X className="h-8 w-8" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>
        
        <div className="px-6 py-4 bg-gray-100 rounded-b-lg">
          <div className="flex justify-end">
            <Button
              onClick={onGoBack}
              className="bg-blue-600 hover:bg-brand text-white px-4 py-2 rounded-md transition-colors"
            >
              Go back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage;