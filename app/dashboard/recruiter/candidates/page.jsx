'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, Clock, FileText, Star, MapPin, Building } from 'lucide-react';

export default function CandidatePerformancePage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchCandidatePerformance();
  }, []);

  const fetchCandidatePerformance = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recruiter/candidate-performance');
      const result = await response.json();
      
      if (result.state) {
        setCandidates(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch candidate data');
      }
    } catch (err) {
      console.error('Error fetching candidate performance:', err);
      setError('Failed to fetch candidate performance');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate performance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Performance</h1>
          <p className="text-gray-600 mt-2">View interview attempts and performance for your job postings</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Candidates List */}
        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Candidates Yet</h3>
            <p className="text-gray-600 mb-6">Candidates who attempt your interviews will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {candidates.map((attempt, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {attempt.user?.img_url ? (
                        <img
                          src={attempt.user.img_url}
                          alt={attempt.user.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-indigo-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {attempt.user?.name || 'Anonymous Candidate'}
                      </h3>
                      <p className="text-gray-600">{attempt.user?.email}</p>
                      <p className="text-sm text-gray-500">
                        {attempt.user?.designation || 'No designation'} • {attempt.user?.experience || 'No experience info'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(attempt.status)}`}>
                      {attempt.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(attempt.created_at)}
                    </p>
                  </div>
                </div>

                {/* Interview Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Interview Details</h4>
                    <span className="text-sm text-gray-500">Attempt #{attempt.interview_attempt}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Building className="w-4 h-4 mr-2" />
                      <span>{attempt.interview?.interview_name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{attempt.interview?.position}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Summary */}
                {attempt.ai_reports && attempt.ai_reports.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Report</h4>
                    <div className="text-gray-700 text-sm">
                      {attempt.ai_reports[0].report_content ? (
                        <div className="whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {attempt.ai_reports[0].report_content.length > 300 
                            ? attempt.ai_reports[0].report_content.substring(0, 300) + '...' 
                            : attempt.ai_reports[0].report_content
                          }
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No report available yet</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Started: {formatDate(attempt.started_at || attempt.created_at)}</span>
                    </div>
                    {attempt.completed_at && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Completed: {formatDate(attempt.completed_at)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedCandidate(attempt)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                    {attempt.ai_reports && attempt.ai_reports.length > 0 && (
                      <button
                        onClick={() => {
                          // Navigate to full report
                          window.open(`/dashboard/report/${attempt.ai_reports[0].id}`, '_blank');
                        }}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Full Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Candidate Details</h2>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Candidate Information</h3>
                    <p className="text-gray-600">{selectedCandidate.user?.name}</p>
                    <p className="text-gray-600">{selectedCandidate.user?.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">Interview Information</h3>
                    <p className="text-gray-600">{selectedCandidate.interview?.interview_name}</p>
                    <p className="text-gray-600">{selectedCandidate.interview?.company}</p>
                  </div>
                  
                  {selectedCandidate.chat_conversation && (
                    <div>
                      <h3 className="font-medium text-gray-900">Interview Conversation</h3>
                      <div className="bg-gray-50 p-3 rounded text-sm max-h-40 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(selectedCandidate.chat_conversation, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
