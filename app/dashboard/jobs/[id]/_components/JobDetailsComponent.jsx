'use client';

import fetchJobDetails from "@/app/service/jobs/fetchJobDetails";
import Tabs from "@/components/Tabs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import JobDetails from "./JobDetails";
import JobTabs from "../../_components/JobTabs";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function JobDetailsComponent({ interviewId }) {

    const [job, setJob] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchInterview = async () => {
        try {
            setLoading(true);
            const result = await fetchJobDetails(interviewId);

            if (!result?.state){

                toast.error(data.error || "Failed to fetch");
            }

            if (!result.state) {
                setError("Something went wrong");
                toast.error("Something went wrong");
            }

            setJob(result?.data);
        } catch (err) {

            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!interviewId) return;

        fetchInterview();
    }, [interviewId]);

  if (loading){
    <>
        <LoadingOverlay text="Loading details..." />
    </>
  }

    return(
        <>
            <JobTabs details={job} />
        </>
    )
}