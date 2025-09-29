'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText, Calendar, Clock, User, Star, CheckCircle, XCircle } from 'lucide-react';

export default function DetailedReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const reportId = params.id;

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/interview/reports');
      const result = await response.json();

      if (result.state) {
        const foundReport = result.data.find(r => r.id === reportId);
        if (foundReport) {
          setReport(foundReport);
        } else {
          setError('Report not found');
        }
      } else {
        setError(result.error || 'Failed to fetch report');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString || dateString === null || dateString === undefined) {
        return 'Date not available';
      }

      console.log('Formatting date:', dateString, 'Type:', typeof dateString);

      let date;
      if (typeof dateString === 'string') {

        if (dateString.includes('T') || dateString.includes('Z')) {

          date = new Date(dateString);
        } else if (dateString.includes('-')) {

          date = new Date(dateString);
        } else {

          date = new Date(dateString);
        }
      } else if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'number') {

        date = new Date(dateString);
      } else {
        console.log('Unknown date format:', dateString);
        return 'Date not available';
      }

      if (isNaN(date.getTime())) {
        console.log('Invalid date after parsing:', dateString);
        return 'Date not available';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Date formatting error:', e, 'Input:', dateString);
      return 'Date not available';
    }
  };

  const parseReportContent = (reportContent) => {
    try {
      return typeof reportContent === 'string' ? JSON.parse(reportContent) : reportContent;
    } catch (e) {
      return null;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const numRating = parseInt(rating) || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= numRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <XCircle className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard/report')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Report Not Found</h3>
          <p className="text-gray-600 mb-6">The requested report could not be found.</p>
          <button
            onClick={() => router.push('/dashboard/report')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const parsedContent = parseReportContent(report.report_content);
  const reportData = parsedContent?.report || {};
  
  // Handle coding interview reports differently
  const isCodingInterview = parsedContent?.type === 'coding_interview';
  const skillEvaluation = isCodingInterview ? {} : (reportData.Skill_Evaluation || {});
  const summary = isCodingInterview ? parsedContent?.detailedAnalysis : reportData?.overall_summary;
  const score = isCodingInterview ? parsedContent?.totalScore : parsedContent?.score;
  const recommendation = isCodingInterview ? parsedContent?.recommendation : parsedContent?.recommendation;
  
  // Helper function to determine if candidate is recommended
  const isRecommended = () => {
    if (typeof recommendation === 'boolean') {
      return recommendation;
    }
    if (typeof recommendation === 'string') {
      const lowerRec = recommendation.toLowerCase();
      return lowerRec.includes('recommend') || lowerRec.includes('strong') || lowerRec.includes('yes');
    }
    // Fallback: recommend if score >= 70
    return score >= 70;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interview Report</h1>
              <p className="text-gray-600 mt-2">Detailed performance analysis</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {formatDate(report.created_at || report.attempt?.created_at || report.attempt?.interview?.created_date)}
              </p>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Interview Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm">Company: {report.attempt?.interview?.company || 'N/A'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FileText className="w-4 h-4 mr-2" />
                <span className="text-sm">Position: {report.attempt?.interview?.position || 'N/A'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">Duration: {report.attempt?.interview?.duration || 'N/A'} minutes</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">Status: {report.attempt?.status || 'N/A'}</span>
              </div>
            </div>
          </div>

          {}
          {score && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Performance</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Total Score</h3>
                    <p className={`text-3xl font-bold ${getScoreColor(score)}`}>
                      {score}/100
                    </p>
                  </div>
                  <div className="text-right">
                    {isRecommended() ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-6 h-6 mr-2" />
                        <span className="font-medium">Recommended</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <XCircle className="w-6 h-6 mr-2" />
                        <span className="font-medium">Not Recommended</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {}
          {Object.keys(skillEvaluation).length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skill Evaluation</h2>
              <div className="space-y-4">
                {Object.entries(skillEvaluation).map(([skill, data]) => (
                  <div key={skill} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{skill.replace(/_/g, ' ')}</h3>
                      <div className="flex items-center">
                        {getRatingStars(data.rating)}
                        <span className="ml-2 text-sm text-gray-600">({data.rating}/5)</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{data.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          {summary && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{summary}</p>
              </div>
            </div>
          )}

          {}
          {/* Key Strengths - for both regular and coding interviews */}
          {((reportData.Key_Strengths && reportData.Key_Strengths.length > 0) || (isCodingInterview && parsedContent?.strengths && parsedContent.strengths.length > 0)) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Strengths</h2>
              <ul className="space-y-2">
                {(isCodingInterview ? parsedContent?.strengths : reportData.Key_Strengths).map((strength, index) => (
                  <li key={index} className="flex items-center text-green-700">
                    <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {}
          {/* Weaknesses - for coding interviews */}
          {isCodingInterview && parsedContent?.weaknesses && parsedContent.weaknesses.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Areas for Improvement</h2>
              <ul className="space-y-2">
                {parsedContent.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-center text-orange-700">
                    <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {}
          {/* Areas for Improvement - for both regular and coding interviews */}
          {((reportData.Areas_for_Improvement && reportData.Areas_for_Improvement.length > 0) || (isCodingInterview && parsedContent?.improvementAreas && parsedContent.improvementAreas.length > 0)) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Improvement Suggestions</h2>
              <ul className="space-y-2">
                {(isCodingInterview ? parsedContent?.improvementAreas : reportData.Areas_for_Improvement).map((area, index) => (
                  <li key={index} className="flex items-center text-blue-700">
                    <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {}
          {/* Question-wise Feedback - for both regular and coding interviews */}
          {((reportData.Question_Wise_Feedback && reportData.Question_Wise_Feedback.length > 0) || (isCodingInterview && parsedContent?.questionScores && parsedContent.questionScores.length > 0)) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Question-wise Feedback</h2>
              <div className="space-y-4">
                {(isCodingInterview ? parsedContent?.questionScores : reportData.Question_Wise_Feedback).map((feedback, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{feedback.question || feedback.questionId}</h3>
                      <div className="flex items-center">
                        {getRatingStars(feedback.score)}
                        <span className="ml-2 text-sm text-gray-600">({feedback.score}/5)</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{feedback.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
