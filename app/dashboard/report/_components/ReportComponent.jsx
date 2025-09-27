'use client'

import fetchReportDetails from "@/app/service/interview/fetchReportDetails";
import LoadingOverlay from "@/components/LoadingOverlay";
import Tabs from "@/components/Tabs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ReportComponent({ id }) {

    const [reportDetails, setReportDetails] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() =>{
        async function getReport() {
            try{
                setLoading(true);
                const result = await fetchReportDetails(id);
                if(!result?.state){

                    toast.error("Error in fetching report card");
                }

                setReportDetails(result?.data);
            } catch(err){

            } finally{
                setLoading(false);
                toast.info("Successfully fetched the report");
            }
        }
        getReport();
    }, [id]);

    if (loading) {
        return (
          <>
            <LoadingOverlay text="Loading Report..." />
          </>
        )
    }

    return(
        <>
            <Tabs reportDetails={reportDetails} />
        </>
    )
}