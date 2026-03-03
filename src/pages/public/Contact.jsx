import { useState } from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const contactInfo = [
    {
      icon: 'fa-envelope',
      title: 'Email Us',
      desc: 'For general inquiries and support',
      link: 'mailto:support@codeflow.gov',
      text: 'support@codeflow.gov'
    },
    {
      icon: 'fa-phone-alt',
      title: 'Call Us',
      desc: 'Mon-Sat, 9am to 6pm IST',
      link: 'tel:18001234567',
      text: '1800-123-4567 (Toll Free)'
    },
    {
      icon: 'fa-map-marker-alt',
      title: 'Visit Us',
      desc: 'Code Flow Headquarters',
      text: '123 Digital Plaza, Sector 62, Noida, UP 201301'
    },
    {
      icon: 'fa-clock',
      title: 'Working Hours',
      desc: 'Monday to Saturday',
      text: '9:00 AM - 6:00 PM IST'
    }
  ];

  const supportOptions = [
    {
      icon: 'fa-comments',
      title: 'Live Chat',
      desc: 'Get instant answers from our support team through live chat. Available 24/7 for urgent queries.',
      btnText: 'Start Chat'
    },
    {
      icon: 'fa-video',
      title: 'Video Call',
      desc: 'Schedule a video call appointment with our grievance officers for complex issues.',
      btnText: 'Book Appointment'
    },
    {
      icon: 'fa-users',
      title: 'Community Forum',
      desc: 'Join our community forum to connect with other users and find answers to common questions.',
      btnText: 'Join Forum'
    }
  ];

  const faqs = [
    {
      question: 'How long does it take to get a response?',
      answer: 'We aim to respond to all inquiries within 24 hours during business days. For urgent grievance-related issues, please use the live chat or call our toll-free number for immediate assistance.'
    },
    {
      question: 'Can I visit your office without an appointment?',
      answer: 'Yes, our office is open for walk-in visitors during working hours (9 AM - 6 PM, Mon-Sat). However, we recommend scheduling an appointment for complex issues to ensure a dedicated officer is available to assist you.'
    },
    {
      question: 'What information should I include in my message?',
      answer: 'Please include your full name, contact details, grievance ID (if applicable), and a detailed description of your query. Attaching relevant screenshots or documents can help us assist you faster.'
    },
    {
      question: 'Is there a dedicated support for technical issues?',
      answer: 'Yes! For technical issues like login problems, portal errors, or file upload issues, please select "Technical Support" in the subject dropdown or call our technical helpline at 1800-123-4567 (Ext. 2).'
    },
    {
      question: 'How can I escalate my complaint if not satisfied?',
      answer: 'If you\'re not satisfied with the resolution, you can escalate by selecting "Escalate" in your dashboard, emailing escalation@codeflow.gov, or requesting a callback from a senior officer through this contact form.'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-900 to-teal-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
        
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Get in Touch</h1>
          <p className="text-xl opacity-90 mb-6">We're here to help and answer any question you might have. We look forward to hearing from you.</p>
          <div className="flex items-center justify-center gap-2 text-sm opacity-80">
            <Link to="/" className="hover:opacity-70 no-underline text-white">Home</Link>
            <span>/</span>
            <span>Contact Us</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Let's Start a Conversation</h2>
            <p className="text-gray-600 mb-8 text-lg">Have questions about filing a grievance, tracking your complaint, or need technical support? Our team is ready to assist you through multiple channels.</p>
            
            <div className="space-y-6">
              {contactInfo.map((info, idx) => (
                <div key={idx} className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-900/10 to-teal-600/10 rounded-xl flex items-center justify-center text-blue-900 flex-shrink-0">
                    <i className={`fas ${info.icon}`}></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{info.title}</h3>
                    <p className="text-gray-500 text-sm mb-1">{info.desc}</p>
                    {info.link ? (
                      <a href={info.link} className="text-blue-900 font-semibold text-sm hover:text-orange-500 transition-colors no-underline">
                        {info.text}
                      </a>
                    ) : (
                      <span className="text-gray-500 text-sm">{info.text}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h3>
              <p className="text-gray-500 text-sm">Fill out the form below and we'll get back to you within 24 hours.</p>
            </div>

            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
                <i className="fas fa-check-circle"></i>
                <span className="font-medium">Thank you! Your message has been sent successfully.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">First Name <span className="text-orange-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name <span className="text-orange-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address <span className="text-orange-500">*</span></label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Subject <span className="text-orange-500">*</span></label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none bg-white"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="grievance">Grievance Related</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Message <span className="text-orange-500">*</span></label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-y min-h-[120px]"
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-900 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-paper-plane"></i>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Multiple Channels
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Other Ways to Reach Us</h2>
            <p className="text-lg text-gray-600">Choose the support channel that works best for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportOptions.map((option, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-2xl text-center border-2 border-transparent hover:border-gray-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center text-3xl text-blue-900 shadow-md mb-6 group-hover:bg-gradient-to-br group-hover:from-blue-900 group-hover:to-teal-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  <i className={`fas ${option.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{option.title}</h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{option.desc}</p>
                <button
                  onClick={() => alert(`${option.title} feature coming soon!`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-blue-900 rounded-lg font-semibold text-sm hover:bg-blue-900 hover:text-white hover:border-blue-900 transition-all"
                >
                  {option.btnText} <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Got Questions?
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Quick answers to common contact-related queries</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 ${activeFaq === idx ? 'shadow-md' : 'hover:shadow-sm'}`}
              >
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <i className={`fas fa-chevron-down text-blue-900 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`}></i>
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 ${activeFaq === idx ? 'max-h-48 pb-5' : 'max-h-0'}`}>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="relative h-96 bg-gradient-to-br from-sky-100 to-teal-50 flex items-center justify-center overflow-hidden">
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center text-4xl text-orange-500 shadow-xl mb-6 animate-pulse">
            <i className="fas fa-map-marked-alt"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Find Us on the Map</h3>
          <p className="text-gray-600">Code Flow Digital Grievance Portal Headquarters</p>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 font-semibold text-gray-900">
          <i className="fas fa-map-marker-alt text-orange-500"></i>
          <span>Noida, Uttar Pradesh, India</span>
        </div>
      </section>

      {/* Live Chat CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-teal-600 text-center">
        <div className="max-w-3xl mx-auto px-8">
          <h2 className="text-3xl font-extrabold text-white mb-4">Need Immediate Assistance?</h2>
          <p className="text-xl text-white/90 mb-8">Our support team is available 24/7 to help you with urgent queries</p>
          <button
            onClick={() => alert('Live chat feature will be activated soon!')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-full font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <i className="fas fa-comment-dots animate-bounce"></i>
            Start Live Chat
          </button>
        </div>
      </section>
    </div>
  );
};

export default Contact;