import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/faqs', label: 'FAQs' },
    { path: '/login', label: 'Submit Complaint' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 text-2xl font-extrabold text-blue-900 no-underline">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-teal-600 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-code-branch"></i>
          </div>
          <span>Code Flow</span>
        </Link>

        {/* Navigation Links */}
        <ul className="hidden md:flex gap-10 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.path} className="relative">
              <Link
                to={link.path}
                className={`relative text-sm font-medium transition-colors duration-300 no-underline py-1 ${
                  isActive(link.path) ? 'text-blue-900' : 'text-gray-500 hover:text-blue-900'
                }`}
              >
                {link.label}
                <span 
                  className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${
                    isActive(link.path) ? 'w-full' : 'w-0 hover:w-full'
                  }`}
                ></span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="flex gap-4 items-center">
          <Link 
            to="/register" 
            className="px-6 py-2 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:border-blue-900 hover:text-blue-900 transition-all no-underline text-sm"
          >
            Register
          </Link>
          <Link 
            to="/login" 
            className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg no-underline text-sm"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-2xl text-gray-600 cursor-pointer">
          <i className="fas fa-bars"></i>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;