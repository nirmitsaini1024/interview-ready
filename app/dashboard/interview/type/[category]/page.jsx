import Link from 'next/link';
import { ArrowLeft, ChevronRight, Users, Clock, Trophy, Target, Code, Briefcase, Star, CheckCircle } from 'lucide-react';
import React from 'react';

const subCategories = {
  frontend: [
    { name: 'Frontend Development', difficulty: 'Intermediate', duration: '60 min', popularity: '94%', slug: 'frontend-development' },
  ],
  backend: [
    { name: 'Backend Development', difficulty: 'Advanced', duration: '75 min', popularity: '91%', slug: 'backend-development' },
  ],
  fullstack: [
    { name: 'Full Stack Development', difficulty: 'Expert', duration: '90 min', popularity: '89%', slug: 'fullstack-development' },
  ],
};

const categoryConfig = {
  frontend: {
    icon: Code,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    title: 'Frontend Development',
    description: 'Master modern frontend frameworks and user interfaces'
  },
  backend: {
    icon: Code,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    title: 'Backend Development',
    description: 'Ace server-side development and database design'
  },
  fullstack: {
    icon: Code,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    title: 'Full Stack Development',
    description: 'End-to-end development with complete technical expertise'
  },
};

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'Beginner': return 'bg-green-100 text-green-700 border-green-200';
    case 'Intermediate': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Advanced': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Expert': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function SubCategoryPage({ params }) {
  const { category } = React.use(params);
  const categoryKey = category.toLowerCase();
  const items = subCategories[categoryKey];
  const config = categoryConfig[categoryKey];

  if (!items || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
          <Link
            href="/dashboard/interview"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }


  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative px-6 pt-8 pb-12 max-w-7xl mx-auto">
          {}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link
              href="/dashboard/interview"
              className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Interview Types
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium capitalize">{category}</span>
          </div>

          {}
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-4 rounded-xl bg-gradient-to-br ${config.color} shadow-lg`}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-4xl font-bold text-gray-900">
                {config.title}
              </h1>
              <p className="text-lg text-gray-600">{config.description}</p>
            </div>
          </div>

          {}
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
              <CheckCircle className="w-4 h-4 text-indigo-700" />
              <span className="text-gray-700 text-sm font-medium">{items.length} Specializations</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
              <Users className="w-4 h-4 text-indigo-700" />
              <span className="text-gray-700 text-sm font-medium">AI-Powered Mocks</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
              <Star className="w-4 h-4 text-indigo-700" />
              <span className="text-gray-700 text-sm font-medium">Personalized Feedback</span>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="px-6 pb-20 pt-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <Link
              key={item.name}
              href={`/dashboard/interview/type/${category}/${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group relative"
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-50 shadow hover:border-blue-200/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10">
                {}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold text-gray-900 mb-2 group-hover:${config.color} transition-colors`}>
                      {item.name}
                    </h3>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:${config.color} transition-all duration-300`} />
                </div>

                {}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Duration</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.duration}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Trophy className="w-4 h-4" />
                      <span>Success Rate</span>
                    </div>
                    <span className="font-semibold text-green-600">{item.popularity}</span>
                  </div>
                </div>

                {}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Popularity</span>
                    <span>{item.popularity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${config.color} transition-all duration-500`}
                      style={{ width: item.popularity }}
                    ></div>
                  </div>
                </div>

                {}
                <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
              </div>
            </Link>
          ))}
        </div>

        {}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-lg rounded-xl px-6 py-3 border border-white/20">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <span className="text-gray-700">
              Can't find what you're looking for?
              <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                Contact us
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}