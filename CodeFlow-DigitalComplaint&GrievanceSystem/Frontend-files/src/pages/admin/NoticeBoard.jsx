import { useState, useEffect } from 'react';
import noticeService from '../../services/noticeService';

const AdminNoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('latest');
  const [customCategories, setCustomCategories] = useState([]);

  const [form, setForm] = useState({
    title: '',
    category: '',
    priority: 'normal',
    content: '',
    author: '',
    date: new Date().toISOString().split('T')[0]
  });

  const loadNotices = async () => {
    try {
      const data = await noticeService.getNotices();
      setNotices(data);

      // Extract unique categories for filter
      const cats = [...new Set(data.map(n => n.category?.toLowerCase()).filter(Boolean))];
      setCustomCategories(cats);
    } catch (error) {
      console.error('Failed to load notices:', error);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const publishNotice = async () => {
    if (!form.title || !form.category || !form.author || !form.content) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await noticeService.createNotice({
        ...form,
        description: form.content
      });
      await loadNotices();
      setShowComposeModal(false);
      setForm({ title: '', category: '', priority: 'normal', content: '', author: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      alert('Failed to publish notice. Please try again.');
    }
  };

  const handleDeleteNotice = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await noticeService.deleteNotice(id);
      await loadNotices();
    } catch (error) {
      alert('Failed to delete notice.');
    }
  };

  const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getBadgeClass = (category) => {
    const categories = {
      exam: 'bg-blue-100 text-blue-700',
      academic: 'bg-blue-100 text-blue-700',
      event: 'bg-green-100 text-green-700',
      urgent: 'bg-red-100 text-red-700',
      important: 'bg-amber-100 text-amber-700',
      general: 'bg-slate-100 text-slate-600'
    };
    return categories[category?.toLowerCase()] || 'bg-slate-100 text-slate-600';
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notice.description || notice.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notice.author || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || notice.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortFilter === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortFilter === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    return 0;
  });

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 pt-6">
          <h1 className="text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-3">
            <i className="fas fa-bullhorn text-blue-600"></i> Notice Board
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Official announcements and updates shared by the administration</p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex flex-1 gap-3 w-full">
            <div className="relative flex-1 max-w-md">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="Search notices..."
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-medium text-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-semibold text-slate-600 appearance-none min-w-[160px]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="exam">Examination</option>
              <option value="event">Events</option>
              <option value="general">General</option>
              <option value="urgent">Urgent</option>
              {customCategories.map(cat => <option key={cat} value={cat}>{capitalizeFirst(cat)}</option>)}
            </select>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              className="px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-semibold text-slate-600 appearance-none min-w-[140px]"
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <button
              onClick={() => setShowComposeModal(true)}
              className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <i className="fas fa-plus"></i> Compose Notice
            </button>
          </div>
        </div>

        {/* Notices Container */}
        <div className="space-y-6">
          {filteredNotices.length > 0 ? (
            filteredNotices.map(notice => (
              <div
                key={notice._id}
                className={`bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden`}
                onClick={() => { setSelectedNotice(notice); setShowViewModal(true); }}
              >
                {/* Priority Indicator */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-opacity ${notice.priority === 'urgent' ? 'bg-red-500 opacity-100' :
                  notice.category === 'event' ? 'bg-green-500 opacity-100' :
                    notice.category === 'exam' ? 'bg-blue-500 opacity-100' : 'bg-slate-300 opacity-0 group-hover:opacity-100'
                  }`}></div>

                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <i className="fas fa-calendar-alt text-blue-500"></i> {formatDate(notice.createdAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <i className="fas fa-user text-sky-500"></i> {notice.postedBy || notice.author}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {notice.title}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      {notice.priority === 'urgent' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Urgent</span>}
                      {notice.priority === 'important' && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Important</span>}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeClass(notice.category)}`}>
                        {notice.category}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteNotice(notice._id, e)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <i className="fas fa-trash-alt text-sm"></i>
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed mb-6 line-clamp-3">
                  {notice.content || notice.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-50">
                  <button className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-md transition-all">
                    <i className="fas fa-eye"></i> View Details
                  </button>
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <i className="fas fa-eye text-blue-400"></i> {notice.views || 0} views
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-inbox text-4xl text-slate-200"></i>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No notices found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria to see more results</p>
            </div>
          )}
        </div>
      </div>

      {/* View Notice Modal */}
      {showViewModal && selectedNotice && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowViewModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden relative shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <i className="fas fa-file-alt text-blue-600"></i> Notice Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="mb-8">
                <div className="flex gap-2 mb-4">
                  {selectedNotice.priority === 'urgent' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Urgent</span>}
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeClass(selectedNotice.category)}`}>
                    {selectedNotice.category}
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 leading-tight mb-4">{selectedNotice.title}</h2>
                <div className="flex gap-6 text-sm font-semibold text-slate-400">
                  <span className="flex items-center gap-2"><i className="fas fa-calendar text-blue-500"></i> {formatDate(selectedNotice.createdAt)}</span>
                  <span className="flex items-center gap-2"><i className="fas fa-user text-blue-500"></i> {selectedNotice.postedBy || selectedNotice.author}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-8 text-slate-700 leading-relaxed text-lg mb-8">
                {selectedNotice.content}
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-8 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Notice Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowComposeModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden relative shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <i className="fas fa-pen-fancy text-blue-600"></i> Compose New Notice
              </h3>
              <button
                onClick={() => setShowComposeModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Notice Title *</label>
                  <input
                    type="text"
                    placeholder="Enter notice title"
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                  <select
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold text-slate-600"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category *</label>
                <input
                  type="text"
                  placeholder="e.g., Exam, Sports, Cultural"
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Author/Department *</label>
                  <input
                    type="text"
                    placeholder="Enter author name"
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-600"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Notice Content *</label>
                <textarea
                  placeholder="Write your notice content here..."
                  rows={6}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium resize-none"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setShowComposeModal(false)}
                className="px-8 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={publishNotice}
                className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <i className="fas fa-paper-plane"></i> Publish Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNoticeBoard;
