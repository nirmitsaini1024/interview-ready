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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        {/* Header */}
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

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Reports List */}
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
            {reports.map((report, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {report.interview_attempts?.interviews?.interview_name || 'Interview Report'}
                    </h3>
                    <p className="text-gray-600">
                      {report.interview_attempts?.interviews?.company || 'Company'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatDate(report.created_at)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span className="text-sm">Position: {report.interview_attempts?.interviews?.position || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">Duration: {report.interview_attempts?.interviews?.duration || 'N/A'} min</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">Status: {report.interview_attempts?.status || 'N/A'}</span>
                  </div>
                </div>

                {report.report_content && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Report Summary</h4>
                    <div className="text-gray-700 text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {report.report_content.length > 300 
                        ? report.report_content.substring(0, 300) + '...' 
                        : report.report_content
                      }
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // Navigate to detailed report view
                      router.push(`/dashboard/report/${report.id}`);
                    }}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    View Full Report →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
