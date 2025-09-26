"use client";

import { useState } from "react";
import { Coins, CheckCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";

// Central plan data
const plans = [
  {
    name: "Free Plan",
    tagline: "Give AI interviews a try",
    credits: { monthly: 300, yearly: 300 },
    displayPrice: { monthly: 0, yearly: 0 },
    features: {
      monthly: [
        "5 Min Mock Interview",
        "Resume Screening",
        "AI Resume Builder",
        "Basic Video Score Analysis",
        "Automated Interview Scheduling"
      ],
      yearly: [
        "60 Min Mock Interview",
        "Resume Screening",
        "AI Resume Builder",
        "Basic Video Score Analysis",
        "Automated Interview Scheduling"
      ]
    },
    highlighted: false,
    disabled: true
  },
  {
    name: "Basic Plan",
    tagline: "Kickstart your interview prep",
    credits: { monthly: 9000, yearly: 108000 },
    displayPrice: { monthly: 20, yearly: 199 },
    features: {
      monthly: [
        "150 Min Mock Interview",
        "AI Resume Creator",
        "Automated Interview Scheduling",
        "Resume Screening",
        "Video Feedback",
        "Interview Tips by AI"
      ],
      yearly: [
        "1800 Min Mock Interview",
        "AI Resume Creator",
        "Automated Interview Scheduling",
        "Resume Screening",
        "Video Feedback",
        "Interview Tips by AI"
      ]
    },
    highlighted: false,
    disabled: false
  },
  {
    name: "Professional Plan",
    tagline: "Best for regular practice",
    credits: { monthly: 27000, yearly: 324000 },
    displayPrice: { monthly: 49, yearly: 499 },
    features: {
      monthly: [
        "450 Min Mock Interview",
        "All Basic Plan Features",
        "AI Interview Insights",
        "Customizable Assessments",
        "Comprehensive Analytics",
        "Live Coding Scenarios"
      ],
      yearly: [
        "5400 Min Mock Interview",
        "All Basic Plan Features",
        "AI Interview Insights",
        "Customizable Assessments",
        "Comprehensive Analytics",
        "Live Coding Scenarios"
      ]
    },
    highlighted: true,
    disabled: false
  },
  {
    name: "Enterprise Plan",
    tagline: "For teams and organizations",
    credits: { monthly: 120000, yearly: 1440000 },
    displayPrice: { monthly: 199, yearly: 1999 },
    features: {
      monthly: [
        "2000 Min Mock Interview",
        "All Pro Plan Features",
        "Dedicated AI Coach",
        "Advanced Reporting",
        "Team Management",
        "Slack/Zoom Integration"
      ],
      yearly: [
        "24000 Min Mock Interview",
        "All Pro Plan Features",
        "Dedicated AI Coach",
        "Advanced Reporting",
        "Team Management",
        "Slack/Zoom Integration"
      ]
    },
    highlighted: false,
    disabled: false
  },
];

export default function BuyCredits() {
  const [selectedCycle, setSelectedCycle] = useState("monthly");
  const { user } = useUser();

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-2">
          Choose your right plan!
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Select from best plans, ensuring a perfect match. Need more or less? Customize your subscription for a seamless fit!
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setSelectedCycle("monthly")}
              className={`px-6 py-2 text-sm font-medium rounded-full transition ${selectedCycle === "monthly" ? "bg-[#462eb4] text-white" : "text-gray-700"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedCycle("yearly")}
              className={`px-6 py-2 text-sm font-medium rounded-full transition ${selectedCycle === "yearly" ? "bg-[#462eb4] text-white" : "text-gray-700"}`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            return (
              <div
                key={plan.name}
                className={`p-8 rounded-3xl shadow-xl border transition hover:shadow-2xl cursor-pointer bg-gradient-to-br from-white to-purple-50 ${plan.highlighted ? "bg-white ring-4 ring-yellow-300" : ""} ${plan.disabled ? "opacity-50 pointer-events-none select-none" : ""}`}
              >
                <div className="mb-4">
                  <h3 className=" text-sm font-bold text-white bg-[#462eb4] px-3 py-1 inline-block rounded-md">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.tagline}</p>
                </div>

                <div className="flex items-center gap-2 mb-2 text-md font-semibold text-[#462eb4]">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  {plan.credits[selectedCycle]} Credits
                </div>

                <p className="text-3xl font-bold text-gray-800 mb-6">
                  ${plan.displayPrice[selectedCycle]} / {selectedCycle}
                </p>

                <ul className="text-sm space-y-2 mb-6">
                  {plan.features[selectedCycle].map((f, idx) => (
                    <li key={idx} className="flex items-center text-gray-700 gap-2">
                      <CheckCircle className="text-green-500 w-4 h-4" /> {f}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={plan.disabled}
                  className={`w-full mt-4 py-2 px-4 rounded-xl font-semibold text-white transition ${plan.disabled ? "bg-gray-300 cursor-not-allowed" : "bg-[#462eb4] hover:bg-indigo-700"}`}
                >
                  {plan.disabled ? "Contact Sales" : "Coming Soon"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}