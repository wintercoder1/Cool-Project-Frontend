import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Lectern, TrendingUp  } from 'lucide-react';
import PageHeader from './components/overview/PageHeader';
import Footer from './components/Footer';

const OrganizationRecipientsTotals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('amount'); // 'amount' or 'name' or 'contributions'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [organizationRecipientsTotalsData, setOrganizationRecipientsTotalsData] = useState(JSON.parse(localStorage.getItem("recipientsTotalsData")));
  const navigate = useNavigate();

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
    (recipient && recipient.recipient_name && recipient.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) )||
    (recipient && recipient.recipient_id && recipient.recipient_id.toLowerCase().includes(searchTerm.toLowerCase()) )
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

  // Calculate pagination
  const totalPages = Math.ceil(sortedOrganizationRecipientsTotals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedOrganizationRecipientsTotals.slice(startIndex, startIndex + itemsPerPage);
 
  const totalAmount = recipients.reduce((sum, r) => sum + r.total_contribution_amount, 0);
  const totalContributions = recipients.reduce((sum, r) => sum + r.number_of_contributions, 0);

  return (
    <div className=" bg-white">
      {/* Header */}
      <PageHeader onLogoClick={handleLogoClick} />
      
      {/* Main Content */}
      <div 
        className=""
        style={{
          position: 'absolute',
          top: '48px', // Adjust to your header height
          left: '2',
          right: '0',
          zIndex: 1
        }}
      >
        <div className="border-t border-gray-300 bg-gray-100 mt-8 pt-8 pb-10">    
          <div className="bg-gray-100 w-screen mx-auto p-5 py-0 min-h-screen">
            
            {/* Header Section */}
            <div className="bg-white  bg-white rounded-lg shadow-sm p-6 mb-6 pb-6">
              {/* <h1 className="text-3xl font-bold text-gray-900"></h1> */}
              <h1 className="bg-white text-3xl font-bold">
                Contributions From {organizationName}'s Political Action Comittee
              </h1>
              <div className="bg-white text-sm text-gray-600 pt-2">
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
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6  bg-gray-100 rounded-lg pb-5">

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Politicians/PACs</p>
                    <p className="text-2xl font-bold text-gray-900">{recipients.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Lectern className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Contributions</p>
                    <p className="text-2xl font-bold text-gray-900">{totalContributions}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-lg shadow-sm p-6 pb-6 mb-6">
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

            {/* Recipients List */}
            <div className="bg-white rounded-lg shadow-sm flex flex-col px-5">
              <div className="p-2 flex-1 overflow-auto"></div>
                <div className="space-y-3">
                  {paginatedData.map((recipient) => {
                    return (
                      <div key={recipient.recipient_id} className="p-3 rounded-lg border-b border-gray-100 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">
                              {recipient.recipient_name}
                            </div>
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

              {/* Pagination - Fixed at bottom */}
              <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between rounded-b-lg flex-shrink-0">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrganizationRecipientsTotals.length)} of{' '}
                      {filteredOrganizationRecipientsTotals.length} results
                    </p>
                    <select
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  
                </div>
              </div>

              {sortedOrganizationRecipientsTotals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No recipients found matching your search criteria.
                </div>
              )}

            </div>
          </div>
            
        </div>
        <Footer />
      
      </div>  
    </div>
  );
};

export default OrganizationRecipientsTotals;