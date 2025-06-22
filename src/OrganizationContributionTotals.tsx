import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LogoHeader from './components/LogoHeader';

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  onPrevPage, 
  onNextPage 
}) => {
  return (
    <div className="flex justify-center items-center mt-6 mb-16">
      <button 
        onClick={onPrevPage}
        disabled={currentPage === 1}
        className={`p-2 rounded-md transition-colors ${
          currentPage === 1 
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
            : 'bg-gray-100 text-blue-500 hover:bg-blue-50 touch-manipulation'
          }`}
        >
        <span style={{ display: "inline-block", width: "20px", height: "20px" }}>
          <ChevronLeft size={20} width={20} height={20}/>
        </span>
      </button>
      
      <span className="mx-4 text-sm">
        Page {currentPage} of {totalPages}
      </span>
      
      <button 
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md transition-colors ${
          currentPage === totalPages 
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
            : 'bg-gray-100 text-blue-500 hover:bg-blue-50 active:bg-blue-100 touch-manipulation'
          }`}
        >
        <span style={{ display: "inline-block", width: "20px", height: "20px" }}>
          <ChevronRight size={20} width={20} height={20}/>
        </span>
      </button>
    </div>
  );
};

const OrganizationRecipientsTotals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('amount'); // 'amount' or 'name' or 'contributions'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [organizationRecipientsTotalsData, setOrganizationRecipientsTotalsData] = useState(JSON.parse(localStorage.getItem("recipientsTotalsData")));
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 100;

  useEffect(() => {
    // Get data from sessionStorage
    const totalsData = localStorage.getItem('recipientsTotalsData');

    if (!totalsData) {
      setOrganizationRecipientsTotalsData(JSON.parse(totalsData));
    }
  }, []);

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  const handleLogoClick = () => {
    navigate('/');
  };

  if (!organizationRecipientsTotalsData) {
    return (
      <div className="px-0 py-0 flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="text-lg text-gray-500">Loading recipients data...</div>
        </div>
      </div>
    );
  }

  const { recipients, organizationName, committeeID, committeeName } = organizationRecipientsTotalsData;

  const filteredOrganizationRecipientsTotals = recipients.filter(recipient =>
    recipient.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.recipient_id.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
  const sortedOrganizationRecipientsTotals = [...filteredOrganizationRecipientsTotals].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.recipient_name.toLowerCase();
        bValue = b.recipient_name.toLowerCase();
        break;
      case 'contributions':
        aValue = a.number_of_contributions;
        bValue = b.number_of_contributions;
        break;
      case 'amount':
      default:
        aValue = a.total_contribution_amount;
        bValue = b.total_contribution_amount;
        break;
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedOrganizationRecipientsTotals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRecipients = sortedOrganizationRecipientsTotals.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const totalAmount = recipients.reduce((sum, r) => sum + r.total_contribution_amount, 0);
  const totalContributions = recipients.reduce((sum, r) => sum + r.number_of_contributions, 0);

  return (
    <div className="px-0 py-0 flex justify-even min-h-screen bg-white">
      {/* Header */}
      <div className="absolute top-4 left-8 cursor-pointer">
        <LogoHeader onClick={handleLogoClick} />
      </div>

      {/* Main Content */}
      <Card className="w-screen mx-auto absolute top-20 px-4 py-5 min-h-screen bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">
            All Contribution Recipients for {organizationName}
          </CardTitle>
          <div className="text-sm text-gray-600">
            {committeeName && (
              <div className="text-sm text-gray-600">
                Committee Name: {committeeName}
              </div>
            )}
            {!committeeName && (
              <div className="text-sm text-gray-600">
                Committee ID: {committeeID}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{recipients.length}</div>
              <div className="text-sm text-gray-600">Total Recipients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalContributions}</div>
              <div className="text-sm text-gray-600">Total Contributions</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <input
              type="text"
              placeholder="Search recipients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 max-w-md bg-white text-gray-900 placeholder-gray-500"
            />
            
            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="amount">Amount</option>
                <option value="name">Name</option>
                <option value="contributions">Contributions</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200 text-sm text-gray-900"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Showing {paginatedRecipients.length > 0 ? startIndex + 1 : 0}-{startIndex + paginatedRecipients.length} of {sortedOrganizationRecipientsTotals.length} recipients
              {searchTerm && ` (filtered by "${searchTerm}")`}
            </div>
            {totalPages > 1 && (
              <div>
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>

          {/* Recipients List */}
          <div className="space-y-3">
            {paginatedRecipients.map((recipient) => {
              return (
                <div key={recipient.recipient_id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {recipient.recipient_name}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {recipient.number_of_contributions} contribution{recipient.number_of_contributions !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-gray-900">
                        ${recipient.total_contribution_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {sortedOrganizationRecipientsTotals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No recipients found matching your search criteria.
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationRecipientsTotals;

// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import LogoHeader from './components/LogoHeader';

// // const OrganizationRecipientsTotals = () => {

// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [sortBy, setSortBy] = useState('amount'); // 'amount' or 'name' or 'contributions'
// //   const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
// //   const [organizationRecipientsTotalsData, setOrganizationRecipientsTotalsData] = useState(JSON.parse(localStorage.getItem("recipientsTotalsData")));
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     // Get data from sessionStorage
// //     const totalsData = localStorage.getItem('recipientsTotalsData');

// //     if (!totalsData) {
// //       setOrganizationRecipientsTotalsData(JSON.parse(totalsData));
// //     }
// //   }, []);

// //   const handleLogoClick = () => {
// //     navigate('/');
// //   };

// //   if (!organizationRecipientsTotalsData) {
// //     return (
// //       <div className="px-0 py-0 flex justify-center items-center min-h-screen bg-white">
// //         <div className="text-center">
// //           <div className="text-lg text-gray-500">Loading recipients data...</div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   const { recipients, organizationName, committeeID, committeeName } = organizationRecipientsTotalsData;

// //   const filteredOrganizationRecipientsTotals = recipients.filter(recipient =>
// //     recipient.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //     recipient.recipient_id.toLowerCase().includes(searchTerm.toLowerCase())
// //   );
 
// //   const sortedOrganizationRecipientsTotals = [... filteredOrganizationRecipientsTotals].sort((a, b) => {
// //     let aValue, bValue;
    
// //     switch (sortBy) {
// //       case 'name':
// //         aValue = a.recipient_name.toLowerCase();
// //         bValue = b.recipient_name.toLowerCase();
// //         break;
// //       case 'contributions':
// //         aValue = a.number_of_contributions;
// //         bValue = b.number_of_contributions;
// //         break;
// //       case 'amount':
// //       default:
// //         aValue = a.total_contribution_amount;
// //         bValue = b.total_contribution_amount;
// //         break;
// //     }

// //     if (sortOrder === 'asc') {
// //       return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
// //     } else {
// //       return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
// //     }
// //   });

// //   const totalAmount = recipients.reduce((sum, r) => sum + r.total_contribution_amount, 0);
// //   const totalContributions = recipients.reduce((sum, r) => sum + r.number_of_contributions, 0);

// //   return (
// //     <div className="px-0 py-0 flex justify-even min-h-screen bg-white">
// //       {/* Header */}
// //       {/* <div className="absolute top-4 left-8 right-8 flex justify-between items-center">
// //         <div 
// //           className="cursor-pointer flex items-center gap-2"
// //           role="button"
// //           onClick={handleLogoClick}
// //           tabIndex={0}
// //         >
// //           <img src={checkmark_logo} className="block" width="55" height="55" alt="blue_check_logo" />
// //           <h1 className="text-4xl font-bold text-black">MoralCheck AI</h1>
// //         </div>
        
// //       </div> */}

// //       <div className="absolute top-4 left-8 cursor-pointer">
// //         <LogoHeader onClick={handleLogoClick} />
// //       </div>

// //       {/* Main Content */}
// //       <Card className="w-screen mx-auto absolute top-20 px-4 py-5 min-h-screen bg-white">
// //         <CardHeader className="pb-4">
// //           <CardTitle className="text-2xl font-bold">
// //             All Contribution Recipients for {organizationName}
// //           </CardTitle>
// //             {/* renderDetailText(commiteeName); */}
// //           <div className="text-sm text-gray-600">
// //             {committeeName && (
// //               <div className="text-sm text-gray-600">
// //                 Committee Name: {committeeName}
// //               </div>
// //             )}
// //             {!committeeName && (
// //               <div className="text-sm text-gray-600">
// //                 Committee ID: {committeeID}
// //               </div>
// //             )}
// //           </div>
// //         </CardHeader>
        
// //         <CardContent className="space-y-6">
// //           {/* Summary Stats */}
// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
// //             <div className="text-center">
// //               <div className="text-2xl font-bold text-gray-900">{recipients.length}</div>
// //               <div className="text-sm text-gray-600">Total Recipients</div>
// //             </div>
// //             <div className="text-center">
// //               <div className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</div>
// //               <div className="text-sm text-gray-600">Total Amount</div>
// //             </div>
// //             <div className="text-center">
// //               <div className="text-2xl font-bold text-gray-900">{totalContributions}</div>
// //               <div className="text-sm text-gray-600">Total Contributions</div>
// //             </div>
// //           </div>

// //           {/* Controls */}
// //           <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
// //             <input
// //               type="text"
// //               placeholder="Search recipients..."
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 max-w-md bg-white text-gray-900 placeholder-gray-500"
// //             />
            
// //             <div className="flex gap-2 items-center">
// //               <label className="text-sm text-gray-600">Sort by:</label>
// //               <select
// //                 value={sortBy}
// //                 onChange={(e) => setSortBy(e.target.value)}
// //                 className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
// //               >
// //                 <option value="amount">Amount</option>
// //                 <option value="name">Name</option>
// //                 <option value="contributions">Contributions</option>
// //               </select>
              
// //               <button
// //                 onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
// //                 className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200 text-sm text-gray-900"
// //               >
// //                 {sortOrder === 'asc' ? '↑' : '↓'}
// //               </button>
// //             </div>
// //           </div>

// //           {/* Results Info */}
// //           <div className="text-sm text-gray-600">
// //             Showing {sortedOrganizationRecipientsTotals.length} of {recipients.length} recipients
// //             {searchTerm && ` (filtered by "${searchTerm}")`}
// //           </div>

// //           {/* Recipients List */}
// //           <div className="space-y-3">
// //             {sortedOrganizationRecipientsTotals.map((recipient, _) => {  // (recipient, index)
              
// //               return (
// //                 <div key={recipient.recipient_id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
// //                   <div className="flex justify-between items-start mb-2">
// //                     <div className="flex-1">
// //                       <h3 className="font-semibold text-gray-900 mb-1">
// //                         {recipient.recipient_name}
// //                       </h3>
// //                       <div className="text-sm text-gray-600">
// //                         {/* ID: {recipient.recipient_id} */}
// //                         {recipient.number_of_contributions} contribution{recipient.number_of_contributions !== 1 ? 's' : ''}
// //                       </div>
// //                     </div>
// //                     <div className="text-right ml-4">
// //                       <div className="text-lg font-bold text-gray-900">
// //                         ${recipient.total_contribution_amount.toLocaleString()}
// //                       </div>
// //                       {/* <div className="text-sm text-gray-600">
// //                         {recipient.number_of_contributions} contribution{recipient.number_of_contributions !== 1 ? 's' : ''}
// //                       </div> */}
// //                     </div>
// //                   </div>
                   
// //                 </div>
// //               );
// //             })}
// //           </div>

// //           {sortedOrganizationRecipientsTotals.length === 0 && (
// //             <div className="text-center py-8 text-gray-500">
// //               No recipients found matching your search criteria.
// //             </div>
// //           )}
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // };

// // export default OrganizationRecipientsTotals;