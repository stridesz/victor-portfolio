export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold mb-2">Victor Qi</h3>
            <p className="text-gray-400 max-w-md">
              Business student, operator, and builder of projects that bridge technology and strategy.
            </p>
          </div>
          <div className="flex flex-col md:items-end space-y-4">
            <div className="flex space-x-6">
              <a
                href="https://github.com/victorqi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/victorqi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                LinkedIn
              </a>
              <a
                href="https://twitter.com/victorqi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Twitter
              </a>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Victor Qi. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}