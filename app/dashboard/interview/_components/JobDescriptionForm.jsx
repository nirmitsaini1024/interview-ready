'use client';

import { useState } from "react";
import { TextAreaField } from "./TextAreaFeild";
import { validateJobDescription } from "@/lib/utils/validateJobDescription";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function JobDescriptionForm({ onSubmit, initialData = {}, jobData, setStep, step }) {
  const [jobDescription, setJobDescription] = useState(initialData.jobDescription || "");
  const [error, setError] = useState("");

  const {
    companyName = "",
    difficultyLevel = "medium",
    duration = 30,
  } = initialData;

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateJobDescription(jobData || jobDescription);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError("");

    // Create a simple result object without AI processing
    const result = {
      company: companyName,
      difficulty_level: difficultyLevel || 'medium',
      duration: duration ? String(duration) : '30',
      interview_time: new Date().toISOString(),
      job_description: jobData || jobDescription,
      interview_name: "Interview",
      location: "India",
      experience: "Not specified",
      interview_type: "technical",
      Requirements: [],
      Tech_Stack: [],
      Skills: [],
      Employment_Type: "Full-time",
      interview_style: "one-on-one",
      status: "open"
    };

    if (onSubmit) {
      onSubmit(result);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
        <TextAreaField
          value={jobData ? jobData : jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          ariaLabel="Job Description"
          required
        />

        <div className="flex justify-between items-center">
          <button onClick={() => setStep(step - 1)} className="flex gap-1 items-center cursor-pointer hover:text-gray-800 text-[#636366] text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button type="submit"
            className="bg-[#462eb4] hover:shadow-2xl text-white px-5 py-3 rounded-md text-sm font-medium flex items-center gap-2 cursor-pointer transition duration-300 ease-in-out">
            Next Step
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
}
