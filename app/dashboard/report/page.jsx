'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Calendar, Clock, User } from 'lucide-react';

export default function ReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/interview/reports');
      const result = await response.json();

      if (result.state) {
        console.log('Reports data:', result.data);
        setReports(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports');
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
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRecommendationBadge = (recommendation) => {
    if (recommendation === true || recommendation === "YES") {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Recommended</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Not Recommended</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold text-gray-900">Interview Reports</h1>
              <p className="text-gray-600 mt-2">View your interview performance and feedback</p>
            </div>
          </div>
        </div>

        {}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {}
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
            <p className="text-gray-600 mb-6">Complete an interview to see your performance reports here.</p>
            <button
              onClick={() => router.push('/dashboard/interview')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start an Interview
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report, index) => {
              const parsedContent = parseReportContent(report.report_content);
              const reportData = parsedContent?.report || {};

              return (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.attempt?.interview?.interview_name || report.attempt?.interview?.company || 'Interview Report'}
                      </h3>
                      <p className="text-gray-600">
                        {report.attempt?.interview?.company || 'Company'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(report.created_at || report.attempt?.created_at || report.attempt?.interview?.created_date)}
                      </p>
                      {parsedContent?.recommendation !== undefined && (
                        <div className="mb-2">
                          {getRecommendationBadge(parsedContent.recommendation)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span className="text-sm">Position: {report.attempt?.interview?.position || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">Duration: {report.attempt?.interview?.duration || parsedContent?.duration || 'N/A'} min</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">Status: {report.attempt?.status || 'N/A'}</span>
                    </div>
                  </div>

                  {}
                  {parsedContent?.score && (
                    <div className="mb-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(parsedContent.score)}`}>
                        Score: {parsedContent.score}/100
                      </div>
                    </div>
                  )}

                  {}
                  {reportData.overall_summary && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
                      <div className="text-gray-700 text-sm">
                        {reportData.overall_summary.length > 200
                          ? reportData.overall_summary.substring(0, 200) + '...'
                          : reportData.overall_summary
                        }
                      </div>
                    </div>
                  )}

                  {}
                  {reportData.Key_Strengths && reportData.Key_Strengths.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Key Strengths</h4>
                      <div className="text-gray-700 text-sm">
                        {reportData.Key_Strengths.slice(0, 2).join(', ')}
                        {reportData.Key_Strengths.length > 2 && '...'}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {

                        router.push(`/dashboard/report/${report.id}`);
                      }}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View Full Report →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
