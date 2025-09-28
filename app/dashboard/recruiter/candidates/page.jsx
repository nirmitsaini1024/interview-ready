'use client';

import { useEffect, useState } from 'react';
import { Users, TrendingUp, Award, Clock, MessageSquare, X } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function CandidatePerformancePage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCandidates: 0,
    completedInterviews: 0,
    averageScore: 0,
    recommended: 0
  });
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showConversationModal, setShowConversationModal] = useState(false);

  useEffect(() => {
    fetchCandidatePerformance();
  }, []);

  const fetchCandidatePerformance = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/interview/reports', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok || !result.state) {
        throw new Error(result.error || 'Failed to fetch candidate performance data');
      }

      const reports = result.data || [];
      
      console.log('Reports data:', reports);
      console.log('First report structure:', reports[0]);
      
      // Transform the data to match our UI structure
      const candidates = reports.map(report => {
        // Use the most appropriate date - try interview attempt date first, then report date
        const interviewDate = report.attempt?.started_at || 
                             report.attempt?.completed_at || 
                             report.created_at || 
                             new Date().toISOString();
        
        // Parse the report content to extract score and recommendation
        let score = 0;
        let recommendation = 'No recommendation';
        
        try {
          if (report.report_content) {
            const parsedContent = typeof report.report_content === 'string' 
              ? JSON.parse(report.report_content) 
              : report.report_content;
            
            score = parsedContent?.score || 0;
            recommendation = parsedContent?.recommendation === true ? 'Recommended' : 
                           parsedContent?.recommendation === false ? 'Not Recommended' : 
                           'No recommendation';
          }
        } catch (error) {
          console.error('Error parsing report content:', error);
        }
        
        return {
          id: report.id,
          name: report.attempt?.user?.name || 'Unknown Candidate',
          email: report.attempt?.user?.email || 'No email',
          position: report.attempt?.interview?.position || 'Position not specified',
          company: report.attempt?.interview?.company || 'Company not specified',
          interviewDate: interviewDate,
          score: score,
          status: report.attempt?.status || 'unknown',
          recommendation: recommendation,
          reportId: report.id,
          interviewId: report.attempt?.interview?.id,
          conversation: report.attempt?.chat_conversation || null
        };
      });

      setCandidates(candidates);
      
      // Calculate stats
      const totalCandidates = candidates.length;
      const completedInterviews = candidates.filter(c => c.status === 'completed').length;
      const averageScore = candidates.length > 0 ? candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length : 0;
      const recommended = candidates.filter(c => 
        c.recommendation === 'Recommended' || 
        c.recommendation === 'Strong Hire' || 
        c.recommendation === 'Hire'
      ).length;

      setStats({
        totalCandidates,
        completedInterviews,
        averageScore: Math.round(averageScore),
        recommended
      });
    } catch (error) {
      console.error('Error fetching candidate performance:', error);
      // Set empty data on error
      setCandidates([]);
      setStats({
        totalCandidates: 0,
        completedInterviews: 0,
        averageScore: 0,
        recommended: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRecommendationColor = (recommendation) => {
    if (recommendation === 'Recommended') return 'text-green-700 bg-green-200';
    if (recommendation === 'Strong Hire') return 'text-green-700 bg-green-200';
    if (recommendation === 'Hire') return 'text-green-600 bg-green-100';
    if (recommendation === 'Maybe') return 'text-yellow-600 bg-yellow-100';
    if (recommendation === 'Not Recommended') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const handleViewConversation = (candidate) => {
    let conversation = [];
    try {
      if (candidate.conversation && typeof candidate.conversation === 'object') {
        // Handle different conversation formats
        if (candidate.conversation.current && Array.isArray(candidate.conversation.current)) {
          conversation = candidate.conversation.current.filter(msg => msg.role !== 'system');
        } else if (Array.isArray(candidate.conversation)) {
          conversation = candidate.conversation.filter(msg => msg.role !== 'system');
        }
      }
    } catch (error) {
      console.error('Error parsing conversation:', error);
      conversation = [];
    }
    
    setSelectedConversation({
      candidate: candidate,
      conversation: conversation
    });
    setShowConversationModal(true);
  };

  const closeConversationModal = () => {
    setShowConversationModal(false);
    setSelectedConversation(null);
  };

  if (loading) {
    return <LoadingOverlay text="Loading candidate performance..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Performance</h1>
          <p className="text-gray-600">Track and analyze candidate interview performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedInterviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recommended</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recommended}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Interviews</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recommendation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                          <div className="text-sm text-gray-500">{candidate.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(candidate.score)}`}>
                        {candidate.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRecommendationColor(candidate.recommendation)}`}>
                        {candidate.recommendation}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(() => {
                        try {
                          const date = new Date(candidate.interviewDate);
                          if (isNaN(date.getTime())) {
                            return 'Date not available';
                          }
                          return date.toLocaleDateString();
                        } catch (error) {
                          return 'Date not available';
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <a
                          href={`/dashboard/report/${candidate.reportId}`}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                        >
                          View Report
                        </a>
                        {candidate.conversation && (
                          <button
                            onClick={() => handleViewConversation(candidate)}
                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Conversation
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {candidates.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by posting a job and conducting interviews.</p>
          </div>
        )}
      </div>

      {/* Conversation Modal */}
      {showConversationModal && selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Interview Conversation - {selectedConversation.candidate.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedConversation.candidate.position} at {selectedConversation.candidate.company}
                </p>
              </div>
              <button
                onClick={closeConversationModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedConversation.conversation.length > 0 ? (
                <div className="space-y-4">
                  {selectedConversation.conversation.map((message, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-50 border-l-4 border-blue-400 ml-8'
                          : 'bg-gray-50 border-l-4 border-gray-400 mr-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-semibold text-sm ${
                          message.role === 'user' ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {message.role === 'user' ? selectedConversation.candidate.name : 'AI Interviewer'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {message.role === 'user' ? 'Candidate' : 'Interviewer'}
                        </span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation available</h3>
                  <p className="mt-1 text-sm text-gray-500">This interview doesn't have recorded conversation data.</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeConversationModal}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
