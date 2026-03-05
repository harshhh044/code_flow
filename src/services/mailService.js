// Mail Service - Handles messaging between users and admin

const MAIL_KEY = 'mailDatabase';
const DEVELOPER_EMAIL = 'developer@codeflow.edu';

export const mailService = {
  // Send message
  sendMessage: async (messageData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const message = {
          id: Date.now(),
          ...messageData,
          timestamp: new Date().toISOString(),
          read: false,
          starred: false
        };

        const db = JSON.parse(localStorage.getItem(MAIL_KEY) || '[]');
        db.push(message);
        localStorage.setItem(MAIL_KEY, JSON.stringify(db));

        resolve(message);
      }, 300);
    });
  },

  // Get inbox for user
  getInbox: async (userEmail) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = JSON.parse(localStorage.getItem(MAIL_KEY) || '[]');
        const messages = db.filter(m => 
          m.to === userEmail || m.toEmail === userEmail
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        resolve(messages);
      }, 300);
    });
  },

  // Get sent messages
  getSent: async (userEmail) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = JSON.parse(localStorage.getItem(MAIL_KEY) || '[]');
        const messages = db.filter(m => 
          m.fromEmail === userEmail || m.sender === userEmail
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        resolve(messages);
      }, 300);
    });
  },

  // Mark as read
  markAsRead: async (messageId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = JSON.parse(localStorage.getItem(MAIL_KEY) || '[]');
        const index = db.findIndex(m => m.id === messageId);
        
        if (index !== -1) {
          db[index].read = true;
          localStorage.setItem(MAIL_KEY, JSON.stringify(db));
        }
        
        resolve(index !== -1 ? db[index] : null);
      }, 200);
    });
  },

  // Toggle star
  toggleStar: async (messageId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = JSON.parse(localStorage.getItem(MAIL_KEY) || '[]');
        const index = db.findIndex(m => m.id === messageId);
        
        if (index !== -1) {
          db[index].starred = !db[index].starred;
          localStorage.setItem(MAIL_KEY, JSON.stringify(db));
        }
        
        resolve(index !== -1 ? db[index] : null);
      }, 200);
    });
  },

  // Delete message
  deleteMessage: async (messageId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = JSON.parse(localStorage.getItem(MAIL_KEY) || '[]');
        const filtered = db.filter(m => m.id !== messageId);
        localStorage.setItem(MAIL_KEY, JSON.stringify(filtered));
        resolve(true);
      }, 200);
    });
  },

  // Send support query to developer
  sendSupportQuery: async (queryData) => {
    const message = {
      from: queryData.sender || 'Administrator',
      fromEmail: queryData.senderEmail || 'admin@codeflow.edu',
      to: 'Developer',
      toEmail: DEVELOPER_EMAIL,
      subject: `[SUPPORT] ${queryData.subject}`,
      body: generateSupportEmailBody(queryData),
      priority: queryData.priority,
      module: queryData.module,
      issueType: queryData.issueType,
      isSupportQuery: true,
      supportQueryId: queryData.id,
      attachments: queryData.attachments || []
    };

    return mailService.sendMessage(message);
  },

  // Get unread count
  getUnreadCount: async (userEmail) => {
    const db = JSON.parse(localStorage.getItem(MAIL_KEY) || '[]');
    return db.filter(m => (m.to === userEmail || m.toEmail === userEmail) && !m.read).length;
  }
};

// Helper to generate support email body
const generateSupportEmailBody = (queryData) => {
  const priorityEmoji = {
    'low': 'Low',
    'medium': 'Medium', 
    'high': 'High',
    'urgent': 'URGENT'
  };

  return `Dear Developer,

A new technical support query has been submitted.

QUERY DETAILS:
- Issue Type: ${queryData.issueType?.toUpperCase()}
- Priority: ${priorityEmoji[queryData.priority] || queryData.priority}
- Module: ${queryData.module}
- Submitted: ${new Date(queryData.date).toLocaleString()}

SUBJECT:
${queryData.subject}

DESCRIPTION:
${queryData.description}

${queryData.attachments?.length > 0 ? `
ATTACHMENTS:
${queryData.attachments.map(att => `- ${att.name} (${att.size})`).join('\n')}
` : ''}

Please review and take appropriate action.

Best regards,
Code Flow Support System`;
};

export default mailService;