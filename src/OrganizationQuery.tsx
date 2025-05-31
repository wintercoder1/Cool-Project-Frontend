import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from 'react-router-dom';

const OrganizationQuery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Political Leaning');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get category from location state if provided
    console.log('____ ____')
    console.log(location)
    console.log(location.state)
    console.log(location.state?.current_category)
    console.log('____ ____')
    if (location && location.state && location.state.current_category) {
      setCategory(location.state.current_category);
    }
  }, [location]);

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
      default:
        return "What organization would you like to search for?";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`User searched for: ${searchTerm} in category: ${category}`);

    // Navigate to waiting page with search data
    navigate('/waiting', { 
      state: { 
        current_category: category,
        search_term: searchTerm
      }
    });
  };

  return (
    <div className="min-h-screen w-screen flex items-center py-10 justify-center bg-white">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 px-6 pb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center space-y-6">
              <h1 className="text-xl font-medium">
                {getCategoryPrompt()}
              </h1>
              
              <Input
                type="text"
                placeholder="Type here."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-2 rounded-md px-4 py-2 text-gray-600"
                required
              />
            </div>

            <div className="flex justify-center">
              <Button 
                type="submit"
                className="bg-blue-100 hover:bg-blue-200 text-gray-800 px-6 py-2 rounded-md"
                disabled={!searchTerm.trim()}
              >
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationQuery;

// import { useState, useEffect } from 'react';
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useNavigate, useLocation } from 'react-router-dom';
// import { X, AlertCircle } from 'lucide-react';

// const OrganizationQuery = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [category, setCategory] = useState('Political Leaning');
//   const [errorModal, setErrorModal] = useState({
//     isOpen: false,
//     message: ''
//   });

//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     // Get category from location state if provided
//     console.log('____ ____')
//     console.log(location)
//     console.log(location.state)
//     console.log(location.state.current_category)
//     console.log('____ ____')
//     if (location && location.state && location.state.current_category) {
//       setCategory(location.state.current_category);
//     }
//   }, [location]);

//   // @ts-expect-error
//   const ENVIRONMENT_BASE_URL = import.meta.env.VITE_BASE_URL
//   // const ENVIRONMENT_BASE_URL = 'http://127.0.0.1:8000'

//   const categoryEndpoints = {
//     'Political Leaning': ENVIRONMENT_BASE_URL + '/getPoliticalLeaning/',
//     'DEI Friendliness': ENVIRONMENT_BASE_URL + '/getDEIFriendlinessScore/',
//     'Wokeness': ENVIRONMENT_BASE_URL + '/getWokenessScore/',
//     'Environmental Impact': ENVIRONMENT_BASE_URL + '/getCachedWokenessScores',
//     'Immigration': ENVIRONMENT_BASE_URL + '/getCachedWokenessScores',
//     'Financial Contributions': ENVIRONMENT_BASE_URL + '/getFinancialContributions/'
//   };

//   const getCategoryPrompt = () => {
//     // setCategory('DEI Friendliness')
//     switch(category) {
//       case 'Political Leaning':
//         return "What organization do you want to find the political leaning of?";
//       case 'DEI Friendliness':
//         return "What organization do you want to find the DEI friendliness score of?";
//       case 'Wokeness':
//         return "What organization do you want to find the wokeness score of?";
//       case 'Environmental Impact':
//         return "What organization do you want to find the environmental impact score of?";
//       case 'Immigration':
//         return "What organization do you want to find the immigration friendliness score of?";
//       default:
//         return "What organization would you like to search for?";
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log(`User searched for: ${searchTerm} in category: ${category}`);
//     fetchData(searchTerm);
//     openWaitingPageCurrentTab();
//   };

//   const fetchData = async (query_topic) => {
//     try {
//       const baseEndpoint = categoryEndpoints[category] || categoryEndpoints['Political Leaning'];
//       const response = await fetch(`${baseEndpoint}${encodeURIComponent(query_topic)}`);
      
//       console.log('Response:', response);

//       if (!response.ok) {
//         const networkError = 'Network response was not ok'
//         handleErrorOnUI(networkError);
//         throw new Error();
//       }
      
//       const jsonData = await response.json();
//       console.log('Data fetched:', jsonData);

//       // Check if the response contains an error
//       if (jsonData.error) {
//         const message = jsonData.message
//         handleErrorOnUI(message || 'An unexpected error occurred.');
//         return;
//       }

//       openDetailPageCurrentTab(jsonData);
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       handleErrorOnUI(err);
//     }
//   };

//   const openDetailPageCurrentTab = (organization) => {
//     navigate('/organization', { 
//       state: { 
//         ...organization, 
//         category: category 
//       }
//     });
//   };

//   const openWaitingPageCurrentTab = () => {
//     navigate('/waiting', { state: { category: category } });
//   };

//   // const handleErrorOnUI = () => {
//   //   console.log('Dialog should show now');
//   // };

//   const handleErrorOnUI = (message) => {
//     console.log('Dialog should show now');
//     console.log('Error occurred:', message);
//     setErrorModal({
//       isOpen: true,
//       message: message
//     });
//   };

//   const closeErrorModal = () => {
//     setErrorModal({
//       isOpen: false,
//       message: ''
//     });
//   };
 
//   return (
//     <>
//     <div className="min-h-screen w-screen flex items-center py-10 justify-center bg-white">
//       <Card className="w-full max-w-md mx-4">
//         <CardContent className="pt-6 px-6 pb-8">
//           <form onSubmit={handleSubmit} className="space-y-8">
//             <div className="text-center space-y-6">
//               <h1 className="text-xl font-medium">
//                 {getCategoryPrompt()}
//               </h1>
              
//               <Input
//                 type="text"
//                 placeholder="Type here."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full border-2 rounded-md px-4 py-2 text-gray-600"
//               />
//             </div>

//             <div className="flex justify-center">
//               <Button 
//                 type="submit"
//                 className="bg-blue-100 hover:bg-blue-200 text-gray-800 px-6 py-2 rounded-md"
//               >
//                 Continue
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>

//     <ErrorModal
//         isOpen={errorModal.isOpen}
//         onClose={closeErrorModal}
//         message={errorModal.message}
//       />
//     </>
//   );
// };

// const ErrorModal = ({ isOpen, onClose, message }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in duration-200">
//         <div className="flex items-center justify-between p-6 border-b">
//           <div className="flex items-center space-x-3">
//             <div className="flex-shrink-0">
//               <AlertCircle className="h-6 w-6 text-red-500" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900">
//               Something went wrong
//             </h3>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition-colors"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>
        
//         <div className="p-6">
//           <p className="text-gray-700 leading-relaxed">
//             {message}
//           </p>
//         </div>
        
//         <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
//           <div className="flex justify-end">
//             <Button
//               onClick={onClose}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
//             >
//               Got it
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrganizationQuery;