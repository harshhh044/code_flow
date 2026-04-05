import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFaq, setActiveFaq] = useState(null);

  const categories = [
    { id: 'all', label: 'All', count: 12, icon: 'fa-border-all' },
    { id: 'general', label: 'General', count: 2, icon: 'fa-info-circle' },
    { id: 'account', label: 'Account', count: 2, icon: 'fa-user-circle' },
    { id: 'submission', label: 'Submission', count: 3, icon: 'fa-file-alt' },
    { id: 'tracking', label: 'Tracking', count: 2, icon: 'fa-search' },
    { id: 'resolution', label: 'Resolution', count: 2, icon: 'fa-check-circle' },
    { id: 'technical', label: 'Technical', count: 1, icon: 'fa-laptop-code' },
  ];

  const faqs = [
    {
      category: 'general',
      icon: 'fa-question',
      question: 'What is Code Flow Digital Grievance Portal?',
      answer: 'Code Flow is a Digital Complaint and Grievance Analytical System designed for students to submit, track, and resolve grievances efficiently. It provides a transparent platform where you can file complaints across multiple categories, track real-time status updates, communicate with administration, view insights and analytics, and access guidelines and important notices.'
    },
    {
      category: 'general',
      icon: 'fa-shield-alt',
      question: 'Is my complaint data secure and confidential?',
      answer: 'Absolutely. We prioritize your privacy and data security with bank-grade 256-bit encryption, authorized administrator access only, no third-party sharing, strict confidentiality for sensitive grievances, and secure login with session management.'
    },
    {
      category: 'account',
      icon: 'fa-user-plus',
      question: 'How do I register on the portal?',
      answer: 'Registration is simple: Click "Register" in navigation, enter your institutional email, create a secure password (min 8 characters), verify email through OTP, and complete your profile. Note: You must use your university email (@yourcollege.edu) to register.'
    },
    {
      category: 'account',
      icon: 'fa-key',
      question: 'I forgot my password. How can I reset it?',
      answer: 'Go to Login page, click "Forgot Password", enter your registered email, check for reset link (valid 1 hour), and create a new password. If no email in 5 minutes, check spam or contact technical support.'
    },
    {
      category: 'submission',
      icon: 'fa-file-signature',
      question: 'How do I submit a new grievance?',
      answer: 'Login and click "Submit Grievance", select appropriate category, fill subject line, provide detailed description, upload supporting documents if available, review and submit. You will immediately receive a Grievance ID - save this for tracking!'
    },
    {
      category: 'submission',
      icon: 'fa-list-alt',
      question: 'What categories of grievances can I file?',
      answer: 'Code Flow supports 12 categories: Academic, Hostel Facilities, Transport & Community, IT & Digital Services, Library Services, Administrative, Financial, Placement & Career, Harassment/Ragging (confidential), and more specialized categories.'
    },
    {
      category: 'submission',
      icon: 'fa-paperclip',
      question: 'What file types and sizes are supported for attachments?',
      answer: 'Supported formats: Images (JPG, PNG, GIF), Documents (PDF, DOC, DOCX), Text files (TXT). Max 10MB per file, up to 5 files per grievance. Recommended: Screenshots for technical issues, bills for financial grievances, photos for facility issues.'
    },
    {
      category: 'tracking',
      icon: 'fa-tasks',
      question: 'How can I track the status of my complaint?',
      answer: 'Track via Dashboard (see all grievances with status cards), My Grievances (detailed list), Check Status Tool (enter Grievance ID), or Email Notifications. Status meanings: Pending (submitted, awaiting review), Under Review (being examined), Resolved (solution implemented), Escalated (moved to higher authorities).'
    },
    {
      category: 'tracking',
      icon: 'fa-clock',
      question: 'How long does it take to resolve a grievance?',
      answer: 'Simple issues: 24-48 hours. Standard issues: 3-5 working days. Complex issues: 7-14 working days. Investigation required: 15-30 days. SLA: First response within 24 hours and weekly progress updates until resolution.'
    },
    {
      category: 'resolution',
      icon: 'fa-redo-alt',
      question: 'What if I\'m not satisfied with the resolution?',
      answer: 'You can reopen within 7 days with comments, file an appeal through "Appeal Decision" option, escalate to senior authorities, or contact Grievance Cell directly. Every appeal is reviewed by a senior officer not involved in original decision.'
    },
    {
      category: 'resolution',
      icon: 'fa-comments',
      question: 'Can I communicate with the officer handling my case?',
      answer: 'Yes! Use the Mail System from dashboard, add comments to grievance thread, respond to officer requests via email/SMS, or request video call for complex issues. All communications are logged for transparency.'
    },
    {
      category: 'technical',
      icon: 'fa-exclamation-triangle',
      question: 'The website is not loading / I\'m facing technical issues. What should I do?',
      answer: 'Try clearing browser cache and cookies, use updated Chrome/Firefox/Safari, enable desktop mode on mobile, use Support button in dashboard, or email support@codeflow.gov. System Requirements: Internet Explorer not supported. Use Edge, Chrome, Firefox, or Safari updated within last 2 years.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const clearSearch = () => {
    setSearchTerm('');
    setActiveCategory('all');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-900 to-teal-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
        
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl opacity-90 mb-6">Find answers to common questions about filing grievances, tracking status, and using the Code Flow platform</p>
          <div className="flex items-center justify-center gap-2 text-sm opacity-80">
            <Link to="/" className="hover:opacity-70 no-underline text-white">Home</Link>
            <span>/</span>
            <span>FAQs</span>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="sticky top-20 bg-white border-b border-gray-200 py-6 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-8">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
            <input
              type="text"
              className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              placeholder="Search for answers... (e.g., 'how to track complaint')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-blue-900 to-teal-600 text-white shadow-md'
                    : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-900'
                }`}
              >
                <i className={`fas ${cat.icon}`}></i>
                {cat.label}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeCategory === cat.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* FAQ Grid */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
                    activeFaq === idx ? 'shadow-lg border-blue-300' : 'hover:shadow-md'
                  }`}
                >
                  <button
                    className={`w-full px-6 py-5 flex items-center gap-4 text-left ${
                      activeFaq === idx ? 'bg-gradient-to-r from-blue-50 to-teal-50' : ''
                    }`}
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      activeFaq === idx 
                        ? 'bg-gradient-to-br from-blue-900 to-teal-600 text-white rotate-180' 
                        : 'bg-blue-100 text-blue-900'
                    }`}>
                      <i className={`fas ${faq.icon}`}></i>
                    </div>
                    <span className="flex-1 font-semibold text-gray-900 text-lg">{faq.question}</span>
                    <i className={`fas fa-chevron-down text-blue-900 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`}></i>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${activeFaq === idx ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="px-6 pb-6 pl-20">
                      <p className="text-gray-600 leading-relaxed mb-4">{faq.answer}</p>
                      <span className="inline-block px-3 py-1 bg-slate-100 text-blue-900 rounded-full text-xs font-bold uppercase tracking-wide">
                        {categories.find(c => c.id === faq.category)?.label}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* No Results */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center text-4xl text-gray-300 shadow-md mb-6">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No matching questions found</h3>
              <p className="text-gray-600 mb-6">Try different keywords or browse by category above</p>
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all">
                Contact Support
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-teal-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-3xl mx-auto px-8 text-center relative z-10">
          <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center text-4xl text-white mb-6">
            <i className="fas fa-headset"></i>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4">Still have questions?</h2>
          <p className="text-xl text-white/90 mb-8">Can't find the answer you're looking for? Our support team is here to help you 24/7</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 rounded-xl font-bold hover:shadow-2xl hover:-translate-y-1 transition-all">
              <i className="fas fa-envelope"></i>
              Contact Support
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/10 hover:border-white transition-all">
              <i className="fas fa-paper-plane"></i>
              Submit Grievance
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQs;