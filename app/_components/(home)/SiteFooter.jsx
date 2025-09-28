import Logo from '../../../components/Logo';

export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Logo className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Swipe</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md text-sm">
                Empowering professionals to succeed in their career journey through AI-powered interview preparation and
                job matching.
              </p>
              {}
            </div>

          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Swipe. All rights reserved.</p>
          </div>
        </div>
      </footer>
  )
}
