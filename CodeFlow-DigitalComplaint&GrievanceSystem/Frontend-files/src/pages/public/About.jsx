import { Link } from 'react-router-dom';

const About = () => {
  const stats = [
    { value: '99.2%', label: 'Resolution Rate' },
    { value: '24h', label: 'Avg. First Response' },
    { value: '50K+', label: 'Active Users' },
    { value: '4.9/5', label: 'User Satisfaction' },
  ];

  const values = [
    { icon: 'fa-eye', title: 'Transparency', desc: 'Every step of the grievance process is visible to the complainant. No hidden procedures, no black boxes - complete clarity in how your case is handled.' },
    { icon: 'fa-tachometer-alt', title: 'Efficiency', desc: 'Time is critical. Our automated workflows and smart routing ensure your grievance reaches the right department within minutes, not days.' },
    { icon: 'fa-lock', title: 'Security', desc: 'Bank-grade 256-bit encryption protects your data. Your identity and grievance details are confidential and secure at every step.' },
    { icon: 'fa-hand-holding-heart', title: 'Empathy', desc: 'Behind every grievance is a human story. We train our officers to listen, understand, and resolve with compassion and respect.' },
    { icon: 'fa-balance-scale', title: 'Fairness', desc: 'Every case is judged on its merit. Our appeal system ensures that if you\'re unsatisfied, you have the right to a second review.' },
    { icon: 'fa-lightbulb', title: 'Innovation', desc: 'We continuously evolve our platform using AI and data analytics to predict bottlenecks and improve resolution times.' },
  ];

  const processSteps = [
    { number: '1', icon: 'fa-file-signature', color: 'blue', title: 'Submit Your Grievance', desc: 'Fill out our user-friendly digital form with details of your issue. Attach supporting documents, photos, or videos. Receive an instant acknowledgment with a unique tracking ID.' },
    { number: '2', icon: 'fa-route', color: 'teal', title: 'Smart Routing & Assignment', desc: 'Our AI-powered system automatically categorizes and routes your grievance to the appropriate department. Senior officers review complex cases for priority handling.' },
    { number: '3', icon: 'fa-tasks', color: 'orange', title: 'Investigation & Resolution', desc: 'Assigned officers investigate your case, gather facts, and work towards resolution. You receive real-time updates at every stage via SMS and email notifications.' },
    { number: '4', icon: 'fa-check-circle', color: 'blue', title: 'Closure & Feedback', desc: 'Once resolved, you receive a detailed closure report. Rate the resolution and provide feedback to help us improve. Dissatisfied? Escalate for review within 30 days.' },
  ];

  const impactStats = [
    { value: '125,000+', label: 'Total Grievances Resolved' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '45', label: 'Departments Connected' },
    { value: '12', label: 'Hours Avg. Resolution Time' },
  ];

  const timeline = [
    { year: '2020', title: 'Platform Launch', desc: 'Code Flow was launched as a pilot project in New Delhi with 5 government departments integrated.' },
    { year: '2021', title: 'National Expansion', desc: 'Expanded to 15 states, integrated AI-based routing system, and crossed 50,000 resolved grievances.' },
    { year: '2022', title: 'Mobile App Launch', desc: 'Launched Android and iOS apps with offline complaint filing capability and multi-language support.' },
    { year: '2023', title: 'Award Recognition', desc: 'Received the National e-Governance Award for Excellence in Citizen-Centric Services.' },
    { year: '2024', title: 'Pan-India Coverage', desc: 'Achieved 100% coverage across all states and UTs, with over 1 lakh monthly active users.' },
  ];

  const team = [
    { name: 'Rajesh Kumar', role: 'Founder & CEO' },
    { name: 'Priya Sharma', role: 'Chief Technology Officer' },
    { name: 'Amit Patel', role: 'Head of Operations' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-900 to-teal-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
        
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Transforming Grievance Resolution Through Technology
          </h1>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Code Flow is a pioneering digital platform dedicated to making grievance redressal transparent, efficient, and accessible to every citizen.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm opacity-80">
            <Link to="/" className="hover:opacity-70 no-underline text-white">Home</Link>
            <span>/</span>
            <span>About Us</span>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
              Our Mission is to <span className="bg-gradient-to-r from-blue-900 to-teal-600 bg-clip-text text-transparent">Empower Every Voice</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We believe that every citizen deserves a fair and transparent platform to voice their concerns. Code Flow was built with the vision of eliminating bureaucratic delays and ensuring that no grievance goes unheard.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="p-6 bg-slate-50 rounded-xl border-l-4 border-orange-500">
                  <div className="text-3xl font-extrabold text-blue-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="w-full h-[500px] bg-gradient-to-br from-blue-900/5 to-teal-600/5 rounded-3xl flex items-center justify-center relative">
              <div className="w-48 h-48 bg-gradient-to-br from-blue-900 to-teal-600 rounded-full flex items-center justify-center text-6xl text-white shadow-2xl">
                <i className="fas fa-bullhorn"></i>
              </div>
              
              <div className="absolute top-10 right-10 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <span className="font-semibold text-gray-800 text-sm">Secure Platform</span>
              </div>
              
              <div className="absolute bottom-16 left-5 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                  <i className="fas fa-bolt"></i>
                </div>
                <span className="font-semibold text-gray-800 text-sm">Fast Resolution</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Our Principles
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Core Values That Drive Us</h2>
            <p className="text-lg text-gray-600">The foundation of trust and excellence in grievance redressal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-900/10 to-teal-600/10 rounded-full flex items-center justify-center text-3xl text-blue-900 mb-6 group-hover:bg-gradient-to-br group-hover:from-blue-900 group-hover:to-teal-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <i className={`fas ${value.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              How It Works
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Our Grievance Resolution Process</h2>
            <p className="text-lg text-gray-600">A streamlined journey from submission to resolution</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-900 to-teal-600 rounded-full hidden md:block"></div>
            
            {processSteps.map((step, idx) => (
              <div key={idx} className={`flex items-center gap-8 mb-12 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 hidden md:block"></div>
                <div className="w-16 h-16 bg-white border-4 border-blue-900 rounded-full flex items-center justify-center text-2xl font-extrabold text-blue-900 shadow-lg z-10 flex-shrink-0" style={{borderColor: step.color === 'teal' ? '#0d9488' : step.color === 'orange' ? '#f97316' : '#1e3a8a', color: step.color === 'teal' ? '#0d9488' : step.color === 'orange' ? '#f97316' : '#1e3a8a'}}>
                  {step.number}
                </div>
                <div className="flex-1 bg-slate-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-500 transition-all duration-300">
                  <div className={`text-2xl mb-3 ${step.color === 'teal' ? 'text-teal-600' : step.color === 'orange' ? 'text-orange-500' : 'text-blue-900'}`}>
                    <i className={`fas ${step.icon}`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-teal-600">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <div className="inline-block px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
            Our Impact
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4">Making a Difference at Scale</h2>
          <p className="text-xl text-white/90 mb-12">Real numbers that reflect our commitment to citizens</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:-translate-y-2 hover:bg-white/15 transition-all duration-300">
                <div className="text-4xl font-extrabold text-white mb-2">{stat.value}</div>
                <div className="text-white/90 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Our Journey
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Milestones That Define Us</h2>
            <p className="text-lg text-gray-600">From inception to becoming India's trusted grievance platform</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-200 rounded-full hidden md:block"></div>
            
            {timeline.map((item, idx) => (
              <div key={idx} className={`flex items-center gap-8 mb-8 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 hidden md:block"></div>
                <div className="w-5 h-5 bg-orange-500 rounded-full border-4 border-white shadow-md z-10 flex-shrink-0"></div>
                <div className="flex-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <span className="inline-block px-3 py-1 bg-blue-900 text-white rounded-full text-xs font-bold mb-2">{item.year}</span>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Leadership
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Meet the Visionaries</h2>
            <p className="text-lg text-gray-600">Dedicated leaders committed to transforming governance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <div className="h-64 bg-gradient-to-br from-blue-900/10 to-teal-600/10 flex items-center justify-center">
                  <i className="fas fa-user-tie text-6xl text-blue-900/30"></i>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-teal-600 font-semibold text-sm mb-4">{member.role}</p>
                  <div className="flex justify-center gap-3">
                    <a href="#" className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-gray-500 hover:bg-blue-900 hover:text-white transition-all">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                    <a href="#" className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-gray-500 hover:bg-blue-900 hover:text-white transition-all">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#" className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-gray-500 hover:bg-blue-900 hover:text-white transition-all">
                      <i className="fas fa-envelope"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-teal-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-3xl mx-auto px-8 text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-white mb-4">Be Part of the Change</h2>
          <p className="text-xl text-white/90 mb-8">Join millions of citizens who trust Code Flow for their grievance redressal. Your voice matters.</p>
          <Link to="/login" className="inline-flex items-center gap-3 px-10 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all no-underline">
            <i className="fas fa-paper-plane"></i>
            File a Grievance Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;