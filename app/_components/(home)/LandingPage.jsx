"use client";

import { motion } from "framer-motion";
import {
  Mic,
  CheckCircle,
  ArrowRight,
  Play,
  Brain,
} from "lucide-react";
import Header from "./Header";
import Link from "next/link";
import SiteFooter from "./SiteFooter";

const FloatingCard = ({ children, className, delay = 0 }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative overflow-hidden mb-24 before:absolute before:top-0 before:start-1/2 before:bg-[url('https://preline.co/assets/svg/examples/polygon-bg-element.svg')] dark:before:bg-[url('https://preline.co/assets/svg/examples-dark/polygon-bg-element.svg')] before:bg-no-repeat before:bg-top before:bg-cover before:size-full before:-z-[1] before:transform before:-translate-x-1/2">
        <Header />

        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          <div className=" inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse"></div>
          </div>
          <FloatingCard
            className="absolute left-10 top-1/4 bg-white p-4 rounded-xl shadow-lg border border-gray-100"
            delay={0}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Interview Passed
                </p>
                <p className="text-xs text-gray-500">95% Success Rate</p>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            className="absolute right-10 top-1/3 bg-white p-4 rounded-xl shadow-lg border border-gray-100"
            delay={2}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Live Interview
                </p>
                <p className="text-xs text-gray-500">Real-time AI Chat</p>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            className="absolute left-20 bottom-1/4 bg-white p-4 rounded-xl shadow-lg border border-gray-100"
            delay={4}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  AI Feedback
                </p>
                <p className="text-xs text-gray-500">Instant Analysis</p>
              </div>
            </div>
          </FloatingCard>

          <div className="relative z-10">
            <div className="text-center">
              <motion.h1
                className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 mt-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Ace Your Next{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Interview
                </span>{" "}
                with AI
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Practice with our advanced AI interviewer, get instant feedback,
                and land your dream job. Join thousands of successful candidates.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Start Practicing Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Link>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    10K+
                  </div>
                  <div className="text-sm text-gray-600">
                    Successful Interviews
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    95%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    50+
                  </div>
                  <div className="text-sm text-gray-600">Companies</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Swipe</h3>
              <p className="text-gray-400 mb-6 max-w-md text-sm">
                Empowering professionals to succeed in their career journey
                through AI-powered interview preparation and job matching.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Mock Interviews
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    AI Feedback
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Job Matching
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Swipe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}