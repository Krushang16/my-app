// pages/collection-entry.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

interface ReportedWaste {
  id: string;
  location: string;
  wasteType: string;
  reportedBy: string;
  reportedDate: string;
  status: 'reported' | 'assigned' | 'collected';
}

export default function CollectionEntry() {
  const router = useRouter();
  const [reportedWasteList, setReportedWasteList] = useState<ReportedWaste[]>([]);
  const [selectedWasteId, setSelectedWasteId] = useState<string>('');
  const [collectionData, setCollectionData] = useState({
    actualQuantity: '',
    wasteCondition: 'good',
    collectionNotes: '',
    collectionDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Simulated data - in a real app, this would come from an API call
  useEffect(() => {
    // Mock data for demonstration
    const mockData: ReportedWaste[] = [
      {
        id: 'waste-1',
        location: '123 Green Street, Downtown',
        wasteType: 'Plastic',
        reportedBy: 'Jane Smith',
        reportedDate: '2025-04-15',
        status: 'assigned',
      },
      {
        id: 'waste-2',
        location: '456 Eco Avenue, Uptown',
        wasteType: 'Paper',
        reportedBy: 'John Doe',
        reportedDate: '2025-04-16',
        status: 'assigned',
      },
      {
        id: 'waste-3',
        location: '789 Recycle Road, Westside',
        wasteType: 'Glass',
        reportedBy: 'Alex Johnson',
        reportedDate: '2025-04-17',
        status: 'assigned',
      },
    ];
    
    setReportedWasteList(mockData);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCollectionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWasteSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWasteId(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real app, you would send this data to your API
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Collection data submitted:', {
        wasteId: selectedWasteId,
        ...collectionData
      });
      
      setSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setSelectedWasteId('');
        setCollectionData({
          actualQuantity: '',
          wasteCondition: 'good',
          collectionNotes: '',
          collectionDate: new Date().toISOString().split('T')[0],
        });
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting collection data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Collection Entry | Real Waste Management</title>
      </Head>
      
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white">
          <div className="flex items-center gap-2 p-4 border-b">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm-1 10.707l-3.707-3.707 1.414-1.414L8 10.586l4.293-4.293 1.414 1.414L8 13.707z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="font-medium">Real Waste Management</div>
          </div>
          
          <nav className="p-2">
            <Link href="/">
              <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10m-1-1h-1M8 7H6a1 1 0 00-1 1v1" />
                </svg>
                <span>Home</span>
              </div>
            </Link>
            
            <Link href="/report-waste">
              <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Report Waste</span>
              </div>
            </Link>
            
            <Link href="/collect-waste">
              <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>Collect Waste</span>
              </div>
            </Link>
            
            <Link href="/collection-entry">
              <div className="flex items-center gap-3 px-3 py-2 rounded bg-green-50 text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Collection Entry</span>
              </div>
            </Link>
            
            <Link href="/rewards">
              <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Rewards</span>
              </div>
            </Link>
            
            <Link href="/leaderboard">
              <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Leaderboard</span>
              </div>
            </Link>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <header className="sticky top-0 bg-white border-b border-gray-200 flex justify-between items-center px-6 py-3 z-10">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="relative">
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-white text-xs flex items-center justify-center">
                    1
                  </div>
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-green-600 font-medium">10.00</div>
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-gray-300"></div>
                </div>
                <div className="font-medium">Mirav</div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </header>
          
          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Collection Entry</h1>
              <p className="text-gray-600">Record details of waste collected from reported locations</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {success ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Collection details successfully recorded!</span>
                </div>
              ) : null}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="wasteId" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Reported Waste
                    </label>
                    <select
                      id="wasteId"
                      name="wasteId"
                      value={selectedWasteId}
                      onChange={handleWasteSelection}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">-- Select reported waste --</option>
                      {reportedWasteList.map(waste => (
                        <option key={waste.id} value={waste.id}>
                          {waste.location} - {waste.wasteType} (Reported on: {waste.reportedDate})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedWasteId && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                      <h3 className="font-medium text-gray-800 mb-2">Selected Waste Details</h3>
                      {reportedWasteList.filter(waste => waste.id === selectedWasteId).map(waste => (
                        <div key={waste.id} className="space-y-1 text-sm">
                          <p><span className="font-medium">Location:</span> {waste.location}</p>
                          <p><span className="font-medium">Type:</span> {waste.wasteType}</p>
                          <p><span className="font-medium">Reported by:</span> {waste.reportedBy}</p>
                          <p><span className="font-medium">Reported on:</span> {waste.reportedDate}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="actualQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                        Actual Quantity (kg)
                      </label>
                      <input
                        type="number"
                        id="actualQuantity"
                        name="actualQuantity"
                        value={collectionData.actualQuantity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g. 5.5"
                        required
                        min="0"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="collectionDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Collection Date
                      </label>
                      <input
                        type="date"
                        id="collectionDate"
                        name="collectionDate"
                        value={collectionData.collectionDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="wasteCondition" className="block text-sm font-medium text-gray-700 mb-1">
                      Waste Condition
                    </label>
                    <select
                      id="wasteCondition"
                      name="wasteCondition"
                      value={collectionData.wasteCondition}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="good">Good (Can be recycled)</option>
                      <option value="damaged">Damaged (Partial recycling)</option>
                      <option value="contaminated">Contaminated (Cannot be recycled)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="collectionNotes" className="block text-sm font-medium text-gray-700 mb-1">
                      Collection Notes
                    </label>
                    <textarea
                      id="collectionNotes"
                      name="collectionNotes"
                      value={collectionData.collectionNotes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Add any important notes about this collection..."
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading || !selectedWasteId}
                      className={`px-4 py-2 bg-green-500 text-white font-medium rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                        (loading || !selectedWasteId) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Submitting...' : 'Submit Collection Data'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}