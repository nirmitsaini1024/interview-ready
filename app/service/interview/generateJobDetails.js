

const generateJobDetails = async(jobDescription) => {
  const response = await fetch(`/api/interview/jobs-generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ jobDescription: jobDescription.trim() }),
  });

  if (!response.ok) {

    throw new Error("Failed to fetch data");
  }

  return await response.text();
};

export default generateJobDetails