export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Swipe</h3>
              <p className="text-gray-400 mb-6 max-w-md text-sm">
                Empowering professionals to succeed in their career journey through AI-powered interview preparation and
                job matching.
              </p>
              {}
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/dashboard/interview" className="hover:text-white transition-colors">
                    Mock Interviews
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="hover:text-white transition-colors">
                    Resume Builder
                  </a>
                </li>
                <li>
                  <a href="https://chromewebstore.google.com/detail/hirenom/fpcmfhopkmoaimhelpjolkkhocfohgkk" className="hover:text-white transition-colors">
                    Chrome Extension
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/about" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Swipe. All rights reserved.</p>
          </div>
        </div>
      </footer>
  )
}
