import { useState, useEffect } from 'react';

const AdminMail = () => {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [composing, setComposing] = useState(false);
  const [folder, setFolder] = useState('inbox');
  const [compose, setCompose] = useState({ to: '', subject: '', body: '' });
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const mails = JSON.parse(localStorage.getItem('mails') || '[]');
    if (mails.length === 0) {
      const defaults = [
        { id: 1, from: 'student@uni.edu', to: 'admin@codeflow.edu', subject: 'Inquiry about grievance status', body: 'Hello, I submitted a grievance last week (GRV-2026-0001) and wanted to check on its status. Could you please provide an update? Thank you.', date: new Date(Date.now() - 3600000).toISOString(), read: false, folder: 'inbox' },
        { id: 2, from: 'admin@codeflow.edu', to: 'student@uni.edu', subject: 'Re: Exam grievance resolved', body: 'Dear Student, We are pleased to inform you that your grievance regarding the examination has been reviewed and resolved. The marks have been corrected in the system. Regards, Admin.', date: new Date(Date.now() - 86400000).toISOString(), read: true, folder: 'sent' }
      ];
      localStorage.setItem('mails', JSON.stringify(defaults));
      setMessages(defaults);
    } else {
      setMessages(mails);
    }
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    setStudents(users.filter(u => u.role !== 'admin').map(u => u.email));
  }, []);

  const inbox = messages.filter(m => m.to === 'admin@codeflow.edu' || m.folder === 'inbox');
  const sent = messages.filter(m => m.from === 'admin@codeflow.edu' || m.folder === 'sent');
  const display = folder === 'inbox' ? inbox : sent;
  const unread = inbox.filter(m => !m.read).length;

  const markRead = (id) => {
    const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
    setMessages(updated);
    localStorage.setItem('mails', JSON.stringify(updated));
  };

  const handleSelect = (msg) => {
    setSelected(msg); setComposing(false); markRead(msg.id);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const newMail = { id: Date.now(), from: 'admin@codeflow.edu', to: compose.to, subject: compose.subject, body: compose.body, date: new Date().toISOString(), read: true, folder: 'sent' };
    const updatedMails = [...messages, newMail];
    setMessages(updatedMails);
    localStorage.setItem('mails', JSON.stringify(updatedMails));
    setCompose({ to: '', subject: '', body: '' });
    setComposing(false);
    alert('Message sent!');
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Admin Mail</h1>
          <p className="text-slate-500 text-sm mt-1">Communicate with students and staff</p>
        </div>
        <button onClick={() => { setComposing(true); setSelected(null); }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-900 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
          <i className="fas fa-edit"></i> Compose
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col lg:flex-row" style={{ minHeight: '580px' }}>
        {/* Sidebar */}
        <div className="w-full lg:w-48 border-b lg:border-b-0 lg:border-r border-slate-100 p-4 flex-shrink-0">
          {[['inbox', 'fa-inbox', `Inbox${unread > 0 ? ` (${unread})` : ''}`], ['sent', 'fa-paper-plane', 'Sent']].map(([f, icon, label]) => (
            <button key={f} onClick={() => { setFolder(f); setSelected(null); setComposing(false); }} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${folder === f ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              <i className={`fas ${icon} w-4`}></i>{label}
            </button>
          ))}
        </div>

        {/* Message List */}
        <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-100 overflow-y-auto flex-shrink-0">
          {display.length === 0 ? (
            <div className="p-8 text-center text-slate-400"><i className="fas fa-inbox text-3xl opacity-20 block mb-2"></i><p className="text-sm">No messages</p></div>
          ) : display.map(msg => (
            <button key={msg.id} onClick={() => handleSelect(msg)} className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${selected?.id === msg.id ? 'bg-blue-50 border-l-4 border-l-blue-700' : ''}`}>
              <div className="flex justify-between items-start mb-1">
                <p className={`text-sm truncate ${!msg.read && folder === 'inbox' ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>{folder === 'inbox' ? msg.from?.split('@')[0] : `To: ${msg.to?.split('@')[0]}`}</p>
                <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{new Date(msg.date).toLocaleDateString()}</span>
              </div>
              <p className={`text-sm truncate ${!msg.read && folder === 'inbox' ? 'font-semibold' : ''} text-slate-600`}>{msg.subject}</p>
              {!msg.read && folder === 'inbox' && <span className="mt-1 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>}
            </button>
          ))}
        </div>

        {/* View/Compose */}
        <div className="flex-1 overflow-y-auto">
          {composing ? (
            <form onSubmit={handleSend} className="p-6 h-full flex flex-col">
              <h3 className="font-bold text-slate-800 mb-5 text-lg">New Message</h3>
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">To <span className="text-red-500">*</span></label>
                  <input value={compose.to} onChange={e => setCompose({ ...compose, to: e.target.value })} required list="students-list" placeholder="student@uni.edu" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                  <datalist id="students-list">{students.map(s => <option key={s} value={s} />)}</datalist>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Subject <span className="text-red-500">*</span></label>
                  <input value={compose.subject} onChange={e => setCompose({ ...compose, subject: e.target.value })} required placeholder="Subject" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Message <span className="text-red-500">*</span></label>
                  <textarea value={compose.body} onChange={e => setCompose({ ...compose, body: e.target.value })} required rows={8} className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="Type your message..." />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setComposing(false)} className="px-5 py-2.5 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-blue-900 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <i className="fas fa-paper-plane"></i> Send
                </button>
              </div>
            </form>
          ) : selected ? (
            <div className="p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selected.subject}</h3>
                  <p className="text-slate-500 text-sm mt-1">From: <span className="font-medium">{selected.from}</span></p>
                  <p className="text-slate-400 text-xs mt-0.5">{new Date(selected.date).toLocaleString()}</p>
                </div>
                <button onClick={() => { setCompose({ to: selected.from, subject: `Re: ${selected.subject}`, body: '' }); setComposing(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors">
                  <i className="fas fa-reply"></i> Reply
                </button>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 text-slate-700 text-sm leading-relaxed">{selected.body}</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
              <i className="fas fa-envelope-open text-5xl opacity-20 mb-4"></i>
              <p className="font-medium">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMail;