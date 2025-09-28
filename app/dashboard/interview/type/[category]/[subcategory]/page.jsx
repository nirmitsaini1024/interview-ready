'use client'

import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import generateQuestions from '@/app/service/portal/generateQuestions';
import { extractJsonBlock } from '@/lib/utils/cleanCodeBlock';
import Modal from '@/components/Modal';
import ResumeTextExtractor from '../../_components/ResumeTextExtractor';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Sparkles, ChevronRight, Zap, Play, BarChart3, CheckCircle, Upload, FileText } from 'lucide-react';
import createInterviewFromAPI from '@/app/service/interview/createInterviewFromAPI';

export default function SubCategoryPage({ params }) {
    const [jobDescription, setJobDescription] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [jobDetails, setJobDetails] = useState(null);
    const [interviewData, setInterviewData] = useState();
    const [open, setOpen] = useState(false);
    const [loadingStart, setLoadingStart] = useState(false);
    const [loadingDashboard, setLoadingDashboard] = useState(false);
    const [resume, setResume] = useState(null);
    const [generateJobDetailStatus, setGenerateJobDetailStatus] = useState(false);
    const [generateQuestionStatus, setGenerateQuestionStatus] = useState(false);
    const [createInterviewFromAPIStatus, setCreateInterviewFromAPIStatus] = useState(false);
    const [resumeStatus, setResumeStatus] = useState(null);

    const router = useRouter();

    const { category } = React.use(params);
    const { subcategory } = React.use(params);

    const getFallbackQuestions = (type) => {
        const fallbackQuestions = {
            'frontend-development': [
                "Can you explain the difference between a class component and a function component in React?",
                "How do you handle state management in a React application?",
                "What are some common performance optimization techniques for frontend applications?",
                "How do you ensure your web applications are responsive across different devices?",
                "Can you walk me through your debugging process for frontend issues?"
            ],
            'backend-development': [
                "How do you design and implement RESTful APIs?",
                "What are the key considerations for database design and optimization?",
                "How do you handle authentication and authorization in backend systems?",
                "What strategies do you use for scaling backend applications?",
                "Can you explain your approach to error handling and logging?"
            ],
            'fullstack-development': [
                "How do you architect a full-stack application from frontend to backend?",
                "What are your strategies for maintaining consistency between frontend and backend?",
                "How do you handle data flow between client and server applications?",
                "What considerations do you make for deployment and DevOps?",
                "How do you ensure security across the entire application stack?"
            ]
        };
        
        return fallbackQuestions[type] || [
            "Tell me about your experience with software development.",
            "What programming languages and frameworks are you most comfortable with?",
            "Describe a challenging project you worked on recently.",
            "How do you approach problem-solving in your development work?",
            "What are your thoughts on current technology trends?"
        ];
    };

    if (!subcategory){
        return(
            <>
                <h1>Not Found</h1>
            </>
        )
    }

    const handlePdfUpload = async (pdfData) => {

        setResume(pdfData);
        setResumeStatus(true);
    }

    const getQuestions = async () => {
        console.log("=== getQuestions function called ===");
        console.log("Resume value:", resume);
        console.log("Resume type:", typeof resume);
        console.log("Resume length:", resume?.length);
        try {
            setGenerateQuestionStatus(true);
            if (resume === null) {
                console.log("Resume is null, returning null");
                setResumeStatus(false);
                return null;
            }

            const genResult = await generateQuestions(subcategory || 'Not Available', resume || 'Not Available');

            if (!genResult?.status || !genResult?.data) {
                setError("Failed to generate interview questions.");
                return null;
            }

            console.log("Raw AI response:", genResult.data);
            console.log("Raw AI response type:", typeof genResult.data);
            console.log("Raw AI response length:", genResult.data?.length);
            
            console.log("About to call extractJsonBlock with:", genResult.data);
            const questions = extractJsonBlock(genResult.data);
            console.log("Extracted questions:", questions);
            console.log("Extracted questions type:", typeof questions);
            console.log("Extracted questions length:", questions?.length);
            
            if (!questions || questions.trim().length < 10) {
                console.error("No valid questions extracted from AI response");
                console.log("Using fallback questions for type:", subcategory);
                
                // Use fallback questions based on the subcategory
                const fallbackQuestions = getFallbackQuestions(subcategory);
                return fallbackQuestions;
            }

            try {
                const parsedQuestions = JSON.parse(questions);
                console.log("Successfully generated questions:", parsedQuestions);
                return parsedQuestions;
            } catch (parseError) {
                console.error("JSON parsing error:", parseError);
                console.error("Failed to parse questions:", questions);
                
                // Try fallback questions if JSON parsing fails
                console.log("Using fallback questions due to parsing error");
                const fallbackQuestions = getFallbackQuestions(subcategory);
                return fallbackQuestions;
            }

        } catch (error) {
            console.log("Error generating questions: ", error);
            console.log("Using fallback questions due to error");
            const fallbackQuestions = getFallbackQuestions(subcategory);
            return fallbackQuestions;
        } finally {
            setGenerateQuestionStatus(false);
        }
    }

    const handleInterviewCreate = async (mergedResult, questions, college_interview_data) => {
        try {
          setCreateInterviewFromAPIStatus(true);

          const createResult = await createInterviewFromAPI(mergedResult, questions, college_interview_data);

          if (!createResult.state || createResult?.error) {

            return;
          }

          if (createResult.state) {

            setInterviewData(createResult?.data)
            setOpen(true); // Trigger success modal or state
          }
        } catch (error) {
          console.log("Error: ", error);
        } finally {
          setCreateInterviewFromAPIStatus(false);
        }
    }

    const handleFinalSubmit = async () => {
        console.log("=== handleFinalSubmit called ===");
        setLoading(true);

        try {
            // Don't call getQuestions() again - let the API generate questions from resume
            console.log("Creating interview - API will generate questions from resume");

            const college_interview_data = {
                name: category,
                program_name: subcategory,
                resume: resume,
                status: 'in-progress'
            }

            const mergedResult = {
                interview_name: category,
                company: subcategory,
                duration: '30',
                interview_time: new Date().toISOString(),
                status: 'open',
                type: 'ADMISSION'
            };

            await handleInterviewCreate(mergedResult, null, college_interview_data);
        } catch (err) {
        console.error("Error in handleFinalSubmit:", err);
        } finally {
        setLoading(false);
        }
    };

    const handleModalClose = () => {
    router.push("/dashboard/interview");
    setOpen(false);
    setLoading(true);
  }

  const handleStartInterview = async () => {
    setLoadingStart(true);
    await router.push(`/dashboard/meetings/${interviewData?.id}`);
  };

  const handleGoToDashboard = async () => {
    setLoadingDashboard(true);
    await router.push("/dashboard/interview");
  };

    if(loading){
        return(
            <>
                <LoadingOverlay text="Creating Interview..." />
            </>
        )
    }

    if(error){
        return(
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/20 p-4 sm:p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-3xl shadow-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                        <p className="text-gray-700 mb-6">{error}</p>
                        <button 
                            onClick={() => setError("")}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/20 p-4 sm:p-6">
            <div className="max-w-3xl mx-auto">
                {}
                <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl shadow-violet-500/10 overflow-hidden">
                    {}
                    <div className="relative bg-gradient-to-r from-[#462eb4] via-indigo-600 to-indigo-600 px-8 py-12">
                        {}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Sparkles className="text-white" size={48} />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                        Create AI Interview
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-3 py-1 bg-white/20 rounded-full text-white/90 text-sm font-medium backdrop-blur-sm">
                                            {category?.toUpperCase()}
                                        </span>
                                        <ChevronRight className="text-white/60" size={16} />
                                        <span className="px-3 py-1 bg-white/20 rounded-full text-white/90 text-sm font-medium backdrop-blur-sm">
                                            {subcategory?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-white/80 text-sm leading-relaxed max-w-2xl">
                                Upload your resume and let our AI create a personalized interview experience tailored to your skills and the role you're targeting.
                            </p>
                        </div>
                    </div>

                    {}
                    <div className="p-8 space-y-8">
                        {}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                                    <span className="text-violet-600 font-bold text-sm">1</span>
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800">Upload Resume</h2>
                            </div>
                            <div className="w-full">
                                <ResumeTextExtractor onSubmit={handlePdfUpload} />
                            </div>
                        </div>

                        {}
                        {resumeStatus && (
                            <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <span className="text-emerald-600 font-bold text-sm">2</span>
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-800">Generate Interview</h2>
                                </div>

                                <div className="p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm">
                                            <Zap className="text-violet-600" size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 mb-2">Ready to Generate</h3>
                                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                                Your resume has been analyzed. We'll create interview questions based on your experience, skills, and the selected role category.
                                            </p>

                                            <div className="w-full flex flex-col items-center justify-center gap-6">
                                                <button
                                                    onClick={() => {
                                                        console.log("=== BUTTON CLICKED ===");
                                                        handleFinalSubmit();
                                                    }}
                                                    className="group relative overflow-hidden w-full bg-gradient-to-r from-[#462eb4] to-indigo-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                                >
                                                    {}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                                                    <div className="relative flex items-center gap-3">
                                                        <Sparkles size={20} />
                                                        <span>Create Interview</span>
                                                        {}
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Sparkles, title: "AI-Powered", desc: "Smart question generation" },
                        { icon: FileText, title: "Resume-Based", desc: "Tailored to your experience" },
                        { icon: Zap, title: "Instant Results", desc: "Ready in seconds" }
                    ].map((feature, index) => (
                        <div key={index} className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/80 transition-all duration-300 hover:scale-105">
                            <div className="inline-flex p-3 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl mb-3">
                                <feature.icon className="text-violet-600" size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                            <p className="text-sm text-gray-600">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {}
            <Modal isOpen={open} onClose={handleModalClose} width="max-w-lg">
                <div className="relative bg-white rounded-xl px-8 py-12 overflow-hidden">
                    {}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                                <CheckCircle className="text-white" size={28} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Interview Created!</h2>
                                <p className="text-emerald-100 text-sm">Your AI interview is ready to begin</p>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="px-8 py-8 space-y-6">
                        <p className="text-gray-600 text-center">What would you like to do next?</p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleStartInterview}
                                disabled={loadingStart}
                                className="group relative overflow-hidden bg-gradient-to-r from-indigo-900 to-indigo-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                                <div className="relative flex items-center gap-3">
                                    {loadingStart ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Play size={20} />
                                    )}
                                    <span>Start Interview Now</span>
                                </div>
                            </button>

                            <button
                                onClick={handleGoToDashboard}
                                disabled={loadingDashboard}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3.5 rounded-lg font-medium transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-gray-200"
                            >
                                {loadingDashboard ? (
                                    <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <BarChart3 size={20} />
                                )}
                                <span>Go to Dashboard</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}