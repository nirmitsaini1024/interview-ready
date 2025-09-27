'use client';

import { useState } from "react";

import { Loader2, SquareSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import createNewJobs from "@/app/service/jobs/createNewJobs";
import { toast } from "sonner";
import uploadLogo from "@/app/service/jobs/uploadLogo";
import generateQuestions from "@/app/service/jobs/generateQuestions";
import { extractJsonBlock } from "@/lib/utils/cleanCodeBlock";

export default function JobForm() {
  const [interviewName, setInterviewName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [createdDate, setCreatedDate] = useState('');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [status, setStatus] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [interviewStyle, setInterviewStyle] = useState('');
  const [duration, setDuration] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [experience, setExperience] = useState('');
  const [salary, setSalary] = useState('');
  const [recruiterTitle, setRecruiterTitle] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [jobType, setJobType] = useState('');
  const [loading, setLoading] = useState(false);

  const statuses = ["Scheduled", "In-Progress", "Completed", "Cancelled"];
  const interviewTypes = ["Video", "In-person"];
  const styles = ["Technical", "Behavioral"];
  const positions = ["Cloud Engineer", "Frontend Developer", "Data Analyst"];
  const experiences = ["Junior", "Mid-Senior", "Senior", "Architect"];
  const difficulty = ["Easy", "Medium", "Hard"];
  const employmentTypes = ["Full Time", "Internship", "Contract"];
  const jobTypes = ["On-Site", "Hybrid", "Remote"];

  const user = { id: 'demo_user_123', name: 'Demo User' };

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!interviewName.trim()) return alert("Interview name is required.");
    if (!jobDescription.trim()) return alert("Job description is required.");

    if (!interviewStyle) return alert("Please select an interview style.");
    if (!duration || isNaN(duration) || duration <= 0) return alert("Enter a valid duration.");
    if (!position) return alert("Please select a position.");
    if (!location.trim()) return alert("Location is required.");
    if (!difficultyLevel) return alert("Please select a Difficulty.");
    if (!experience) return alert("experience is required.");
    if (!companyName) return alert("Company name is required.");

    try {
      setLoading(true);
      let logoUrl = null;

      if (companyLogo instanceof File) {
        const logoForm = new FormData();
        logoForm.append('file', companyLogo);

        const logoUploadRes = await uploadLogo(logoForm);

        if (!logoUploadRes?.state) {

          toast.error("Logo upload failed");
        } else {

          logoUrl = logoUploadRes.data.url;  // ✅ fixed: result.data.url
        }
      }

      const questions = await getQuestions();

      const formData = {
        interview_name: interviewName.trim(),
        job_description: jobDescription.trim(),

        company_logo: logoUrl, // optional

        interview_type: interviewType,
        interview_style: interviewStyle,
        duration: Number(duration),
        position: position,
        location: location.trim(),
        experience: experience,
        difficulty_level: difficultyLevel,
        company: companyName,
        salary: salary,
        recruiter_title: recruiterTitle,
        employment_type: employmentType,
        job_type: jobType,
        type: 'JOB',
        questions: questions
      };

      const result = await createNewJobs(formData);

      if (!result.state) {

        toast("Error in creating jobs")
      }

      toast("Jobs created successfully!");

      setInterviewName("");
      setJobDescription("");
      setInterviewTime("");
      setCreatedDate("");
      setCompanyLogo(null);
      setStatus("");
      setInterviewType("");
      setInterviewStyle("");
      setDuration("");
      setPosition("");
      setLocation("");
      setDifficultyLevel("");
      setExperience("")

    } catch (error) {

      toast.error(error.message || "Something went wrong. Please try again.")
    } finally{
      setLoading(false);
      router.push("/dashboard/jobs");
    }
  };

  const getQuestions = async () =>{
    try{
      const result = await generateQuestions(jobDescription, companyName, interviewStyle, position, difficultyLevel, experience);

    if(!result?.state){

      toast.error("Error in generating questions");
    }

    const questions = extractJsonBlock(result.data);

    return JSON.parse(questions);
    } catch(error){

      toast.error(`Error: ${error}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex gap-1 items-center py-6">
        <SquareSquare className="w-5 h-5" />
        <h2 className="text-xl font-semibold text-white">Create New Job</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {}
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-600">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-black placeholder-gray-500"
            placeholder="e.g. Google"
          />
        </div>

        {}
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-600">Job Title</label>
          <input
            type="text"
            value={interviewName}
            onChange={(e) => setInterviewName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-black placeholder-gray-500"
            placeholder="e.g. Cloud Engineer"
          />
        </div>

        {}
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-600">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full h-40 px-3 py-2 border border-gray-200 text-black rounded-md text-sm placeholder-gray-500"
            placeholder="Enter Job Description"
          />
        </div>

        {}
        {}

        {}
        {}

        {}
        {}

        {}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Employment Type</label>
          <div className="flex gap-2">
            {employmentTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setEmploymentType(t)}
                className={`px-3 py-1 rounded-md text-sm border ${employmentType === t
                    ? "border border-indigo-300 bg-indigo-50 text-indigo-800 font-semibold"
                    : "border border-gray-300 bg-gray-50 text-gray-600"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Job Type</label>
          <div className="flex gap-2">
            {jobTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setJobType(t)}
                className={`px-3 py-1 rounded-md text-sm border ${jobType === t
                    ? "border border-indigo-300 bg-indigo-50 text-indigo-800 font-semibold"
                    : "border border-gray-300 bg-gray-50 text-gray-600"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {}
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-600">Recruiter Title</label>
          <input
            type="text"
            value={recruiterTitle}
            onChange={(e) => setRecruiterTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-black placeholder-gray-500"
            placeholder="e.g. Hiring Manager"
          />
        </div>

        {}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Interview Style</label>
          <div className="flex gap-2">
            {styles.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setInterviewStyle(style)}
                className={`px-3 py-1 rounded-md text-sm border ${interviewStyle === style
                    ? "border border-indigo-300 bg-indigo-50 text-indigo-800 font-semibold"
                    : "border border-gray-300 bg-gray-50 text-gray-600"
                  }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {}
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-600">Duration (in minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-black placeholder-gray-500"
            placeholder="e.g. 45"
          />
        </div>

        {}
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-600">Position</label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-black placeholder-gray-500"
            placeholder="Enter a Position Eg: Full Stack Developer"
          />
        </div>

        {}
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-600">Difficulty Level</label>
          <select
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-black placeholder-gray-500"
          >
            <option value="">Select difficulty level</option>
            {difficulty.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {}
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-600">Experience</label>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-black placeholder-gray-500"
          >
            <option value="">Select Experience Level</option>
            {experiences.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {}
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-600">Salary</label>
          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-black placeholder-gray-500"
            placeholder="e.g. Google"
          />
        </div>

        {}
        <div>
          <label className="block text-sm font-medium text-gray-600">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-black placeholder-gray-500"
            placeholder="e.g. Seattle, WA"
          />
        </div>

        {}
        <div className="pt-4 flex justify-end gap-3">
          <button type="button" className={`px-4 py-2 text-sm border rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer ${loading ? 'cursor-not-allowed opacity-50' : ''}`}>
            Cancel
          </button>
          <button type="submit" className={`flex items-center gap-2 px-4 py-2 text-sm bg-[#462eb4] text-white rounded-md hover:bg-gradient-to-b hover:from-indigo-600 hover:to-indigo-950 cursor-pointer ${loading ? 'cursor-not-allowed opacity-50' : ''}`}>
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : ''}
            {loading ? 'Creating Jobs' : 'Create Jobs'}
          </button>
        </div>
      </form>
    </div>
  );
}
