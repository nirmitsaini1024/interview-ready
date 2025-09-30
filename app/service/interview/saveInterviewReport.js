
const saveInterviewReport = async (interviewId, interview_attempt_id, score, recommendation, report, duration) => {

  try {
    const numericScore = Math.max(0, Math.min(100, Number(score) || 0));
    const input = {
        interviewId: interviewId,
        interview_attempt_id: interview_attempt_id,
        score: numericScore,
        recommendation: recommendation,
        report: report,
        duration: duration,
    };

    const response = await fetch(`/api/interview/save-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response Error:", errorText);
      return {
        state: false,
        error: "Failed to Save data",
        message: 'Failed',
      };
    }

    const result = await response.json();

    console.log("result", result);

    if (!result.state) {
      return {
        state: false,
        error: "Backend returned failure",
        message: result.message || 'Failed',
      };
    }

    return {
      state: true,
      data: result.data,
      message: result.message || 'Success',
    };
  } catch (error) {
    console.error("Catch Error:", error);
    return {
      state: false,
      error: error.message || 'Unexpected error',
      message: 'Failed',
    };
  }
};

export default saveInterviewReport;
