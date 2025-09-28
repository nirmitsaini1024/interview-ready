import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Brain, Users, Trophy, Zap, History } from 'lucide-react';

const categories = [
  {
    name: 'Frontend',
    slug: 'frontend',
    description: 'Master React, Vue, Angular and modern frontend frameworks.',
    image: 'https://logo.clearbit.com/github.com',
    avatars: [
      'https://logo.clearbit.com/google.com',
      'https://logo.clearbit.com/facebook.com',
      'https://logo.clearbit.com/netflix.com',
      'https://logo.clearbit.com/airbnb.com',
      'https://logo.clearbit.com/spotify.com',
    ],
    icon: Brain,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    stats: '18K+ developers'
  },
  {
    name: 'Backend',
    slug: 'backend',
    description: 'Ace server-side development, APIs, and database design.',
    image: 'https://logo.clearbit.com/github.com',
    avatars: [
      'https://logo.clearbit.com/amazon.com',
      'https://logo.clearbit.com/microsoft.com',
      'https://logo.clearbit.com/oracle.com',
      'https://logo.clearbit.com/ibm.com',
      'https://logo.clearbit.com/salesforce.com',
    ],
    icon: Brain,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    stats: '15K+ engineers'
  },
  {
    name: 'Full Stack',
    slug: 'fullstack',
    description: 'End-to-end development with frontend and backend expertise.',
    image: 'https://logo.clearbit.com/github.com',
    avatars: [
      'https://logo.clearbit.com/google.com',
      'https://logo.clearbit.com/amazon.com',
      'https://logo.clearbit.com/microsoft.com',
      'https://logo.clearbit.com/apple.com',
      'https://logo.clearbit.com/netflix.com',
    ],
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    stats: '22K+ developers'
  },
];

export default function InterviewCategory() {
  return (
    <div className="min-h-screen rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50">
   

      {}
      <div className="px-6 pb-20 pt-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {categories.map((cat, index) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={cat.slug}
                className="group relative"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className={`${cat.bgColor} rounded-xl p-8 border border-gray-100 shadow transition-all duration-500 hover:shadow hover:shadow-blue-500/25`}>
                  {}
                  <div className={`bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>

                  {}
                  <div className="relative z-10 flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${cat.color} shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{cat.name}</h2>
                        <p className="text-sm text-gray-500 font-medium">{cat.stats}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  {}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 relative z-10">
                    {cat.description}
                  </p>

                  {}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center -space-x-3">
                      {cat.avatars.map((src, idx) => (
                        <div key={idx} className="relative">
                          <Image
                            src={src}
                            alt={`Partner ${idx + 1}`}
                            width={34}
                            height={34}
                            className="rounded-full border-3 border-white shadow-lg hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                    <div className={`px-4 py-2 cursor-pointer hover:shadow-lg rounded-lg bg-gradient-to-r ${cat.color} text-white text-sm font-semibold shadow`}>

                      <Link
                        href={`/dashboard/interview/type/${cat.slug}/${cat.slug}-development`}
                      >
                      Start Interview</Link>
                    </div>
                  </div>

                  {}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl"></div>
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-xl"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}