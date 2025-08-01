import { useState, useMemo, useEffect } from 'react';
import { Search, Download, DollarSign, Users, TrendingUp } from 'lucide-react';
import Footer from './components/Footer';
import PageHeader from './components/overview/PageHeader';

export default function OrganizationLeadershipContributionTotals() {
  // Get data from localStorage (set by your existing component)
  const [leadershipData, setLeadershipData] = useState(null);
  const [organizationName, setOrganizationName] = useState('');
  const [committeeId, setCommitteeId] = useState('');

  const handleLogoClick = (event) => {
    console.log(event);
  //   navigate('/', {});
  };

  useEffect(() => {
    // Load data from localStorage when component mounts
    const storedData = localStorage.getItem('leadershipContributionsData');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setLeadershipData(parsed.leadership || []);
        setOrganizationName(parsed.organizationName || '');
        setCommitteeId(parsed.committeeId || '');
      } catch (error) {
        console.error('Error parsing leadership data:', error);
        // Fallback sample data if localStorage fails
        setLeadershipData([
          { name: "ARMATO, STEVEN", occupation: "VICE PRESIDENT", employer: "AMAZON.COM SERVICES LLC", total_amount: 10000, contribution_count: 2 },
          { name: "JASSY, ANDREW", occupation: "CHIEF EXECUTIVE OFFICER", employer: "AMAZON.COM SERVICES LLC", total_amount: 10000, contribution_count: 2 },
          { name: "MADAN, UDIT", occupation: "VICE PRESIDENT", employer: "AMAZON.COM SERVICES LLC", total_amount: 10000, contribution_count: 2 },
          { name: "SCHMIDT, STEPHEN", occupation: "VICE PRESIDENT", employer: "AMAZON WEB SERVICES, INC.", total_amount: 10000, contribution_count: 2 },
          { name: "ALPERSON, DAVID", occupation: "VICE PRESIDENT", employer: "AMAZON.COM SERVICES LLC", total_amount: 9750, contribution_count: 2 },
          { name: "HERRINGTON, DOUGLAS", occupation: "SENIOR VICE PRESIDENT", employer: "AMAZON.COM SERVICES LLC", total_amount: 9568, contribution_count: 23 },
          { name: "TAGAWA, JOHN", occupation: "VICE PRESIDENT", employer: "AMAZON.COM SERVICES LLC", total_amount: 9568, contribution_count: 23 },
          { name: "HUSEMAN, STEPHEN", occupation: "VICE PRESIDENT", employer: "AMAZON.COM SERVICES LLC", total_amount: 9568, contribution_count: 23 },
          { name: "WILLIAMS, ROBERT", occupation: "VICE PRESIDENT", employer: "AMAZON.COM SERVICES LLC", total_amount: 9568, contribution_count: 23 },
          { name: "DEAL, MICHAEL", occupation: "VICE PRESIDENT", employer: "AMAZON.COM SERVICES LLC", total_amount: 9568, contribution_count: 23 }
        ]);
        setOrganizationName('Company Leadership');
      }
    }
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('amount');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterByEmployer, setFilterByEmployer] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique employers for filter
  const employers = useMemo(() => {
    if (!leadershipData) return [];
    const uniqueEmployers = [...new Set(leadershipData.map(item => item.employer))];
    return uniqueEmployers.sort();
  }, [leadershipData]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!leadershipData) return [];
    
    let filtered = leadershipData.filter(contributor => {
      const matchesSearch = contributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contributor.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contributor.employer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEmployer = filterByEmployer === 'all' || contributor.employer === filterByEmployer;
      
      return matchesSearch && matchesEmployer;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.total_amount;
          bValue = b.total_amount;
          break;
        case 'count':
          aValue = a.contribution_count;
          bValue = b.contribution_count;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'occupation':
          aValue = a.occupation.toLowerCase();
          bValue = b.occupation.toLowerCase();
          break;
        default:
          aValue = a.total_amount;
          bValue = b.total_amount;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, sortBy, sortOrder, filterByEmployer, leadershipData]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);

  // Calculate summary statistics
  const totalAmount = filteredAndSortedData.reduce((sum, contributor) => sum + contributor.total_amount, 0);
  const totalContributions = filteredAndSortedData.reduce((sum, contributor) => sum + contributor.contribution_count, 0);

  // Show loading state if no data yet
  if (!leadershipData) {
    return (
      <div className="bg-gray-100 p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading leadership contributions data...</div>
        </div>
      </div>
    );
  }

  // <div className="absolute top-2 w-screen mx-auto min-h-screen bg-white">
  //     {/* Header with Logo and Dropdown */}
  //     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8 bg-white">
  //       <LogoHeader />
  //       <CategoryDropdown 
  //         category={category}
  //         availableCategories={availableCategories}
  //         dropdownOpen={dropdownOpen}
  //         onToggleDropdown={handleToggleDropdown}
  //         onSelectCategory={handleSelectCategory}
  //       />
  //     </div>
  //     <div className="border-t border-gray-300 bg-gray-100 mt-2 pt-6 pb-10">
  return (
    <div className="absolute top-0 w-screen mx-auto min-h-screen bg-white">

      <PageHeader onLogoClick={handleLogoClick} />
      <div 
        className=""
        style={{
          position: 'absolute',
          top: '48px', // Adjust to your header height
          left: '0',
          right: '0',
          zIndex: 1
        }}
      >
        <div className="border-t border-gray-300 bg-gray-100 mt-8 pt-8 pb-10 px-5">

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {organizationName ? `${organizationName} - Leadership Contributors` : 'Company Leadership Contributors'}
                </h1>
                <p className="text-gray-600 mt-2">Complete list of leadership political contributions</p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                  <p className="text-sm font-medium text-gray-600">Total Contributors</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredAndSortedData.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
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

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search contributors..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Sort By */}
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="amount">Sort by Amount</option>
                <option value="count">Sort by Contribution Count</option>
                <option value="name">Sort by Name</option>
                <option value="occupation">Sort by Occupation</option>
              </select>

              {/* Sort Order */}
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>

              {/* Filter by Employer */}
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterByEmployer}
                onChange={(e) => setFilterByEmployer(e.target.value)}
              >
                <option value="all">All Employers</option>
                {employers.map(employer => (
                  <option key={employer} value={employer}>{employer}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Data Table - Fixed height and scrolling */}
          <div className="bg-white rounded-lg shadow-sm flex flex-col">
            <div className="p-6 flex-1 overflow-auto">
              <div className="space-y-3">
                {paginatedData.map((contributor, index) => {
                  return (
                    <div key={`${contributor.name}-${contributor.employer}-${index}`} className="p-3 rounded-lg border-b border-gray-100 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">
                            {contributor.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {contributor.occupation}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contributor.employer}
                          </div>
                        </div>
                        <div className="ml-4 text-right flex-shrink-0">
                          <div className="font-semibold text-gray-900">
                            ${contributor.total_amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {contributor.contribution_count} contribution{contributor.contribution_count !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)} of{' '}
                    {filteredAndSortedData.length} results
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

          </div> 
        </div>

        <Footer />
        
      </div>
    </div>
  );
}

