import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-gray-900">
              Resolve Grievances <br />
              <span className="bg-gradient-to-r from-blue-900 to-teal-600 bg-clip-text text-transparent">with Confidence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              A fast, transparent, and secure digital platform for lodging and tracking complaints.
              We're committed to resolving your issues efficiently.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/login" className="px-8 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 hover:-translate-y-1 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 no-underline">
                <i className="fas fa-paper-plane"></i>
                Submit Complaint
              </Link>
              <Link to="/login" className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-blue-900 hover:text-blue-900 transition-all flex items-center gap-2 no-underline">
                <i className="fas fa-search"></i>
                Track Status
              </Link>
            </div>

            <div className="flex gap-12 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-extrabold text-blue-900">500+</div>
                <div className="text-sm text-gray-500 font-medium">Complaints Resolved</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-blue-900">4.7</div>
                <div className="text-sm text-gray-500 font-medium">User Rating</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-blue-900">48hrs</div>
                <div className="text-sm text-gray-500 font-medium">Avg. Response</div>
              </div>
            </div>
          </div>

          {/* FIXED: Browser Mockup with Floating Cards */}
          <div className="hidden lg:block relative">
            {/* Main Browser Window */}
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Browser Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white/20 rounded-lg px-4 py-1.5 text-white/80 text-sm text-center">
                    codeflow.gov.in/dashboard
                  </div>
                </div>
              </div>

              {/* Browser Content */}
              <div className="p-8 bg-gradient-to-br from-slate-50 to-white min-h-[320px] flex items-center justify-center relative">
                {/* Success Checkmark Circle */}
                <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                  <i className="fas fa-check text-5xl text-white"></i>
                </div>

                {/* Decorative Elements inside browser */}
                <div className="absolute top-8 left-8 w-16 h-2 bg-gray-200 rounded"></div>
                <div className="absolute top-8 left-8 w-12 h-2 bg-gray-200 rounded mt-3"></div>
                <div className="absolute bottom-8 left-8 right-8 h-12 bg-gray-100 rounded-lg"></div>
              </div>
            </div>

            {/* Floating Card - Top Left */}
            <div className="absolute -top-4 -left-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-float">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                <i className="fas fa-shield-alt text-lg"></i>
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm">Secure & Encrypted</div>
                <div className="text-xs text-gray-500">256-bit SSL</div>
              </div>
            </div>

            {/* Floating Card - Bottom Right */}
            <div className="absolute -bottom-4 -right-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-float-delayed">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                <i className="fas fa-clock text-lg"></i>
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm">Real-time Updates</div>
                <div className="text-xs text-gray-500">Instant notifications</div>
              </div>
            </div>

            {/* Background Decorative Circles */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-blue-100/50 to-teal-100/50 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-blue-900 py-8 text-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-wrap justify-around items-center gap-8">
          <div className="flex items-center gap-4">
            <i className="fas fa-check-circle text-3xl opacity-90"></i>
            <div>
              <h4 className="text-xl font-bold">Government Authorized</h4>
              <p className="text-sm opacity-90">Official digital grievance platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <i className="fas fa-lock text-3xl opacity-90"></i>
            <div>
              <h4 className="text-xl font-bold">256-bit Encryption</h4>
              <p className="text-sm opacity-90">Bank-level security standards</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <i className="fas fa-headset text-3xl opacity-90"></i>
            <div>
              <h4 className="text-xl font-bold">24/7 Support</h4>
              <p className="text-sm opacity-90">Always here to help you</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
            Simple Process
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 mb-12">Three easy steps to resolve your grievances</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-900 via-teal-600 to-orange-500 rounded-full"></div>

            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto bg-white border-4 border-blue-900 rounded-full flex items-center justify-center text-3xl font-extrabold text-blue-900 shadow-lg mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Complaint</h3>
              <p className="text-gray-600 text-sm">Fill out a simple form with your grievance details and supporting documents</p>
            </div>

            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto bg-white border-4 border-teal-600 rounded-full flex items-center justify-center text-3xl font-extrabold text-teal-600 shadow-lg mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm">Monitor your complaint status in real-time with unique tracking ID</p>
            </div>

            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto bg-white border-4 border-orange-500 rounded-full flex items-center justify-center text-3xl font-extrabold text-orange-500 shadow-lg mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Get Resolution</h3>
              <p className="text-gray-600 text-sm">Receive timely resolution and provide feedback on the outcome</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Our Services
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Comprehensive Grievance Solutions</h2>
            <p className="text-lg text-gray-600">Everything you need to resolve complaints efficiently</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: 'fa-file-alt',
                title: 'File Complaints',
                desc: 'Submit your grievance online with our streamlined digital form. Attach documents and track submission instantly.',
                link: 'Learn More'
              },
              {
                icon: 'fa-search',
                title: 'Track Status',
                desc: 'Real-time tracking of your complaint status. Get updates at every stage of the resolution process.',
                link: 'Track Now'
              },
              {
                icon: 'fa-gavel',
                title: 'Appeal Decisions',
                desc: 'Not satisfied with the resolution? File an appeal easily and get your case reviewed by senior officers.',
                link: 'Appeal'
              },
              {
                icon: 'fa-comments',
                title: 'Feedback & Rating',
                desc: 'Rate the resolution quality and provide feedback to help us improve our services continuously.',
                link: 'Give Feedback'
              }
            ].map((service, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-900/10 to-teal-600/10 rounded-xl flex items-center justify-center text-2xl text-blue-900 mb-6 group-hover:bg-gradient-to-br group-hover:from-blue-900 group-hover:to-teal-600 group-hover:text-white transition-all duration-300">
                  <i className={`fas ${service.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{service.desc}</p>
                <Link to="#" className="inline-flex items-center gap-2 text-blue-900 font-semibold text-sm group-hover:gap-3 transition-all no-underline">
                  {service.link} <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Explore More
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Additional Online Services</h2>
            <p className="text-lg text-gray-600">Specialized support for various grievance categories</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'fa-comment-dots', title: 'Submit Feedback on Resolution', desc: 'Share your experience with resolved complaints' },
              { icon: 'fa-book', title: 'Access Knowledge Base & FAQs', desc: 'Find answers to common questions instantly' },
              { icon: 'fa-balance-scale', title: 'Appeal Decisions', desc: 'Request review of unsatisfactory resolutions' },
              { icon: 'fa-hand-holding-usd', title: 'Eligibility & Schemes', desc: 'Check eligibility for compensation schemes' },
              { icon: 'fa-building', title: 'Public Service Issues', desc: 'Report issues with public utilities & services' },
              { icon: 'fa-file-contract', title: 'Legal & Administration', desc: 'Administrative and legal grievance support' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-5 p-6 bg-slate-50 rounded-xl border border-transparent hover:bg-white hover:border-gray-200 hover:shadow-md hover:translate-x-1 transition-all duration-300 cursor-pointer">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-xl text-blue-900 shadow-sm flex-shrink-0">
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-teal-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-3xl mx-auto px-8 text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8">Join thousands of citizens who have successfully resolved their grievances</p>
          <Link to="/login" className="inline-flex items-center gap-3 px-10 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all no-underline">
            <i className="fas fa-rocket"></i>
            Submit Your Complaint Now
          </Link>
        </div>
      </section>

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-float-delayed {
            animation: float 6s ease-in-out infinite;
            animation-delay: 3s;
          }
        `}
      </style>
    </div>
  );
};

export default Home;