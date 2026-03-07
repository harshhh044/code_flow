import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 text-2xl font-extrabold text-white mb-4 no-underline">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-teal-600 rounded-lg flex items-center justify-center text-white">
                <i className="fas fa-code-branch"></i>
              </div>
              <span>Code Flow</span>
            </Link>
            <p className="text-slate-400 leading-relaxed mb-6 text-sm">
              Empowering citizens with a transparent, efficient, and user-friendly digital grievance resolution platform. Your voice matters, and we're here to ensure it's heard.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 hover:-translate-y-1 transition-all text-white">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 hover:-translate-y-1 transition-all text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 hover:-translate-y-1 transition-all text-white">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 hover:-translate-y-1 transition-all text-white">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Use Cases</h4>
            <ul className="space-y-3 list-none m-0 p-0">
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors no-underline">
                  <i className="fas fa-chevron-right text-xs"></i>
                  File Grievance
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors no-underline">
                  <i className="fas fa-chevron-right text-xs"></i>
                  Track Status
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors no-underline">
                  <i className="fas fa-chevron-right text-xs"></i>
                  View History
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors no-underline">
                  <i className="fas fa-chevron-right text-xs"></i>
                  Download Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Company</h4>
            <ul className="space-y-3 list-none m-0 p-0">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors no-underline">
                  <i className="fas fa-chevron-right text-xs"></i>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors no-underline">
                  <i className="fas fa-chevron-right text-xs"></i>
                  Our Team
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors no-underline">
                  <i className="fas fa-chevron-right text-xs"></i>
                  Careers
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors no-underline">
                  <i className="fas fa-chevron-right text-xs"></i>
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Contact</h4>
            <ul className="space-y-3 list-none m-0 p-0">
              <li>
                <a href="mailto:support@codeflow.gov" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors no-underline">
                  <i className="fas fa-envelope"></i>
                  support@codeflow.gov
                </a>
              </li>
              <li>
                <a href="tel:18001234567" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors no-underline">
                  <i className="fas fa-phone"></i>
                  1800-123-4567
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors no-underline">
                  <i className="fas fa-map-marker-alt"></i>
                  New Delhi, India
                </Link>
              </li>
            </ul>          
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>&copy; 2024 Code Flow Digital Grievance Portal. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors no-underline">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors no-underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;