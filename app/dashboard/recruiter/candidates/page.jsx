'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, Clock, FileText, Star, MapPin, Building, ArrowLeft } from 'lucide-react';

export default function CandidatePerformancePage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'report'

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

  if (viewMode === 'report' && selectedCandidate) {
    const report = selectedCandidate.ai_reports?.[0];

    if (!report) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Candidates
            </button>
            <div className="text-center py-8">
              <p className="text-gray-500">No report available for this interview.</p>
            </div>
          </div>
        </div>
      );
    }

    let reportContent;
    try {
      reportContent = typeof report.report_content === 'string'
        ? JSON.parse(report.report_content)
        : report.report_content;
    } catch (e) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Candidates
            </button>
            <div className="text-center py-8">
              <p className="text-red-500">Error parsing report data.</p>
            </div>
          </div>
        </div>
      );
    }

    const reportData = reportContent?.report || {};
    const skillEvaluation = reportData.Skill_Evaluation || {};

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {}
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Interview Report</h1>
            <p className="text-gray-600 mt-2">{selectedCandidate.user?.name} - {selectedCandidate.interview?.company}</p>
          </div>

          <div className="space-y-6">
            {}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Overall Performance</h3>
                <div className="text-right">
                  {reportContent?.score && (
                    <div className={`text-3xl font-bold ${
                      reportContent.score >= 80 ? 'text-green-600' :
                      reportContent.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {reportContent.score}/100
                    </div>
                  )}
                  {reportContent?.recommendation !== undefined && (
                    <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                      reportContent.recommendation === true || reportContent.recommendation === "YES"
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {reportContent.recommendation === true || reportContent.recommendation === "YES"
                        ? 'Recommended' : 'Not Recommended'}
                    </div>
                  )}
                </div>
              </div>
              {reportData.overall_summary && (
                <p className="text-gray-700">{reportData.overall_summary}</p>
              )}
            </div>

            {}
            {reportData.Key_Strengths && reportData.Key_Strengths.length > 0 && (
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Key Strengths</h3>
                <ul className="space-y-2">
                  {reportData.Key_Strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-green-800">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {}
            {reportData.Areas_for_Improvement && reportData.Areas_for_Improvement.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {reportData.Areas_for_Improvement.map((area, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-600 mr-2">⚠</span>
                      <span className="text-orange-800">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {}
            {Object.keys(skillEvaluation).length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Skill Evaluation</h3>
                <div className="grid gap-4">
                  {Object.entries(skillEvaluation).map(([skill, data]) => (
                    <div key={skill} className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{skill.replace(/_/g, ' ')}</h4>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${
                                i < (parseInt(data.rating) || 0) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">({data.rating}/5)</span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{data.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {}
            {reportData.Question_Wise_Feedback && reportData.Question_Wise_Feedback.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">Question-wise Feedback</h3>
                <div className="space-y-4">
                  {reportData.Question_Wise_Feedback.map((feedback, index) => (
                    <div key={index} className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{feedback.question}</h4>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < (parseInt(feedback.score) || 0) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">({feedback.score}/5)</span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{feedback.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {}
            {selectedCandidate.chat_conversation && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Conversation</h3>
                <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                  {(() => {
                    try {
                      console.log('Chat conversation data:', selectedCandidate.chat_conversation);

                      let conversation = selectedCandidate.chat_conversation;

                      if (conversation.current && Array.isArray(conversation.current)) {
                        conversation = conversation.current;
                      } else if (Array.isArray(conversation)) {
                        conversation = conversation;
                      } else if (typeof conversation === 'string') {

                        conversation = JSON.parse(conversation);
                        if (conversation.current && Array.isArray(conversation.current)) {
                          conversation = conversation.current;
                        }
                      } else if (typeof conversation === 'object') {

                        const possibleArrays = Object.values(conversation).filter(val => Array.isArray(val));
                        if (possibleArrays.length > 0) {
                          conversation = possibleArrays[0];
                        }
                      }

                      if (Array.isArray(conversation)) {
                        return (
                          <div className="space-y-3">
                            {conversation.map((message, index) => {

                              let role, content;

                              if (typeof message === 'string') {

                                role = 'unknown';
                                content = message;
                              } else if (message.role) {

                                role = message.role;
                                content = message.content || message.message || message.text || message.transcript || 'No content';
                              } else {

                                role = 'unknown';
                                content = JSON.stringify(message);
                              }

                              if (role === 'system' || role === 'tool') {
                                return null;
                              }

                              return (
                                <div key={index} className={`p-3 rounded-lg ${
                                  role === 'user' || role === 'candidate'
                                    ? 'bg-blue-100 ml-8'
                                    : role === 'assistant'
                                    ? 'bg-gray-100 mr-8'
                                    : 'bg-yellow-100'
                                }`}>
                                  <div className="flex items-start">
                                    <span className={`font-medium text-sm mr-2 ${
                                      role === 'user' || role === 'candidate' ? 'text-blue-800' :
                                      role === 'assistant' ? 'text-gray-800' : 'text-yellow-800'
                                    }`}>
                                      {role === 'user' || role === 'candidate' ? 'Candidate' :
                                       role === 'assistant' ? 'AI Interviewer' : 'System'}:
                                    </span>
                                    <span className={`text-sm ${
                                      role === 'user' || role === 'candidate' ? 'text-blue-700' :
                                      role === 'assistant' ? 'text-gray-700' : 'text-yellow-700'
                                    }`}>
                                      {content}
                                    </span>
                                  </div>
                                </div>
                              );
                            }).filter(Boolean)}
                          </div>
                        );
                      }

                      return (
                        <div>
                          <p className="text-gray-500 mb-4">Conversation format not recognized. Raw data:</p>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(selectedCandidate.chat_conversation, null, 2)}
                          </pre>
                        </div>
                      );
                    } catch (e) {
                      console.error('Error parsing conversation:', e);
                      return (
                        <div>
                          <p className="text-red-500 mb-4">Error displaying conversation:</p>
                          <pre className="text-xs bg-red-50 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(selectedCandidate.chat_conversation, null, 2)}
                          </pre>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Performance</h1>
          <p className="text-gray-600 mt-2">View interview attempts and performance for your job postings</p>
        </div>

        {}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {}
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

                {}
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

                {}
                {attempt.ai_reports && attempt.ai_reports.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Summary</h4>
                    <div className="text-gray-700 text-sm">
                      {(() => {
                        try {
                          const reportContent = typeof attempt.ai_reports[0].report_content === 'string'
                            ? JSON.parse(attempt.ai_reports[0].report_content)
                            : attempt.ai_reports[0].report_content;

                          const summary = reportContent?.report?.overall_summary || 'No summary available';
                          return (
                            <div className="whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {summary.length > 200 ? summary.substring(0, 200) + '...' : summary}
                            </div>
                          );
                        } catch (e) {
                          return <p className="text-gray-500 italic">Report available but format error</p>;
                        }
                      })()}
                    </div>
                  </div>
                )}

                {}
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
                      onClick={() => {
                        setSelectedCandidate(attempt);
                        setViewMode('report');
                      }}
                      className="px-3 py-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium border border-indigo-200 hover:border-indigo-300 rounded-md transition-colors"
                    >
                      View Details
                    </button>
                    {attempt.ai_reports && attempt.ai_reports.length > 0 ? (
                      <button
                        onClick={() => {
                          setSelectedCandidate(attempt);
                          setViewMode('report');
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                      >
                        View Full Report
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm font-medium rounded-md">
                        No Report Yet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
