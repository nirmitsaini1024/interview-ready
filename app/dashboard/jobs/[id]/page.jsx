import Tabs from "@/components/Tabs";
import JobDetailsComponent from "./_components/JobDetailsComponent";

export default async function page({ params }) {

    const param = await params;
    const interviewId = param.id;

    return(
        <>
            <JobDetailsComponent interviewId={interviewId} />
        </>
    )
}