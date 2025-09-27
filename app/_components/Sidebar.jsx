'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  Menu, X, LayoutDashboard, ChevronDown, ChevronRight,
  Video, BriefcaseBusiness, FileText,
  User, Users, ChevronUp
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import matchfox from '../../public/match-fox-5.jpg'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [userType, setUserType] = useState('CANDIDATE')
  const [showUserTypes, setShowUserTypes] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => setIsOpen(!isOpen)
  const handleDropdownToggle = (dropdownName) => {
    setOpenDropdown(prev => (prev === dropdownName ? null : dropdownName))
  }

  const toggleUserTypes = () => setShowUserTypes(!showUserTypes)

  useEffect(() => {
    setIsClient(true);
    const savedUserType = localStorage.getItem('userType') || 'CANDIDATE';
    setUserType(savedUserType);
  }, []);

  return (
    <div className="bg-white text-white min-h-screen">
      <div className="md:hidden fixed top-0 left-0 w-full bg-gray-50 z-30 flex items-center justify-between px-4 h-14 border-b border-gray-200">
        <button onClick={toggleSidebar}>
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex items-center gap-1 text-lg text-indigo-900 font-semibold">
          <Image src={matchfox} width={24} height={24} alt='logo' className='rounded-md' />
          Swipe
        </div>
        <div className="w-6" />
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`bg-white border-r border-zinc-100 shadow w-3/4 transform transition-transform duration-300 md:w-60
          ${isOpen ? 'fixed top-0 left-0 z-40 h-screen' : 'fixed top-0 left-0 z-40 h-screen -translate-x-full'}
          md:translate-x-0 md:sticky md:top-0 md:h-screen md:shadow-none shadow-md`}
        style={{ fontFamily: "var(--font-roboto)" }}
      >
        <div className="md:hidden flex justify-end p-4">
          <button onClick={toggleSidebar}>
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <nav className="space-y-2 px-4 pb-32">
          <Link
            href="/"
            className="hidden md:flex items-center mt-1.5 pb-6 space-x-2 p-2 rounded"
          >
            <Image src={matchfox} width={24} height={24} alt='logo' className="w-7 h-7 rounded-md" />
            <span className='font-bold text-lg text-indigo-900'>Swipe</span>
          </Link>

          <div className="mb-4">
            <div
              className="flex items-center justify-between bg-blue-600 px-2 py-3 rounded-sm cursor-pointer shadow hover:bg-blue-700 transition-colors"
              onClick={toggleUserTypes}
            >
              <div className="flex items-center space-x-2">
                {userType === 'CANDIDATE' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Users className="w-4 h-4 text-white" />
                )}
                <span className="text-sm font-medium text-white">
                  {userType === 'CANDIDATE' ? 'Candidate' : 'Recruiter'}
                </span>
              </div>
              {showUserTypes ? (
                <ChevronUp className="w-4 h-4 text-white" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white" />
              )}
            </div>

            {showUserTypes && (
              <div className="space-y-1 mt-1">
                <div
                  className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    userType === 'CANDIDATE'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => {
                    setUserType('CANDIDATE')
                    setShowUserTypes(false)
                    localStorage.setItem('userType', 'CANDIDATE')
                  }}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Candidate</span>
                </div>
                <div
                  className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    userType === 'RECRUITER'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => {
                    setUserType('RECRUITER')
                    setShowUserTypes(false)
                    localStorage.setItem('userType', 'RECRUITER')
                  }}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Recruiter</span>
                </div>
              </div>
            )}
          </div>

          {userType === 'CANDIDATE' && (
            <>
                   <Link
                     href="/dashboard"
                     className={`flex items-center text-sm space-x-2 p-2 rounded
                       ${pathname === '/dashboard' ? 'bg-gray-400 text-white' : 'text-zinc-800 hover:bg-zinc-200'}`}
                   >
                     <LayoutDashboard className="w-4 h-4" />
                     <span>Dashboard</span>
                   </Link>

                   <Link
                     href="/dashboard/interview"
                     className={`flex items-center text-sm space-x-2 p-2 rounded
                       ${pathname === '/dashboard/interview' ? 'bg-gray-400 text-white' : 'text-zinc-800 hover:bg-zinc-200'}`}
                   >
                     <Video className="w-4 h-4" />
                     <span>Interviews</span>
                   </Link>

                   <Link
                     href="/dashboard/report"
                     className={`flex items-center text-sm space-x-2 p-2 rounded
                       ${pathname === '/dashboard/report' ? 'bg-gray-400 text-white' : 'text-zinc-800 hover:bg-zinc-200'}`}
                   >
                     <FileText className="w-4 h-4" />
                     <span>Interview Reports</span>
                   </Link>

            </>
          )}

          {userType === 'RECRUITER' && (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center text-sm space-x-2 p-2 rounded
                  ${pathname === '/dashboard' ? 'bg-gray-400 text-white' : 'text-zinc-800 hover:bg-zinc-200'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/dashboard/jobs"
                className={`flex items-center text-sm space-x-2 p-2 rounded
                  ${pathname === '/dashboard/jobs' ? 'bg-gray-400 text-white' : 'text-zinc-800 hover:bg-zinc-200'}`}
              >
                <BriefcaseBusiness className="w-4 h-4" />
                <span>Jobs Post</span>
              </Link>

              <Link
                href="/dashboard/recruiter/candidates"
                className={`flex items-center text-sm space-x-2 p-2 rounded
                  ${pathname === '/dashboard/recruiter/candidates' ? 'bg-gray-400 text-white' : 'text-zinc-800 hover:bg-zinc-200'}`}
              >
                <Users className="w-4 h-4" />
                <span>Candidate Performance</span>
              </Link>
            </>
          )}

        </nav>
      </div>

      <div className="h-14 md:hidden" />
    </div>
  )
}