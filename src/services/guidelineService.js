import { STORAGE_KEYS } from '../utils/constants';

// Initial seed data based on Guidelines.html
const DEFAULT_GUIDELINES = [
    {
        id: 1,
        title: 'General Grievance Submission',
        icon: 'fa-file-alt',
        color: 'blue',
        countLabel: '3 Rules',
        rules: [
            { id: 101, subtitle: 'Accuracy of Information', text: 'All information provided must be accurate and truthful. Providing false information may lead to the rejection of your grievance.' },
            { id: 102, subtitle: 'Supporting Evidence', text: 'Where possible, attach supporting documents, screenshots, or other evidence to help investigate your case faster.' },
            { id: 103, subtitle: 'Respectful Communication', text: 'Maintain professional and respectful language in all communications. Offensive language will not be tolerated.' }
        ]
    },
    {
        id: 2,
        title: 'Response & Resolution Time',
        icon: 'fa-clock',
        color: 'orange',
        countLabel: '3 Rules',
        rules: [
            { id: 201, subtitle: 'Initial Acknowledgment', text: 'An automated acknowledgment will be sent within 1 hour of submission. If not received, check your spam folder.' },
            { id: 202, subtitle: 'Resolution Timeline', text: 'Standard grievances will be resolved within 5-7 working days. Complex issues may take up to 15 working days.' },
            { id: 203, subtitle: 'Escalation Window', text: 'If no response is received within the stipulated time, students may escalate the issue to the Department Head.' }
        ]
    },
    {
        id: 3,
        title: 'Privacy & Confidentiality',
        icon: 'fa-user-shield',
        color: 'green',
        countLabel: '2 Rules',
        rules: [
            { id: 301, subtitle: 'Data Protection', text: 'All personal data submitted is encrypted and stored securely. It will only be accessed by authorized personnel.' },
            { id: 302, subtitle: 'Non-Disclosure', text: 'The identity of the complainant will be kept confidential unless disclosure is required by law or for investigation purposes.' }
        ]
    }
];

const guidelineService = {
    getGuidelines: () => {
        const stored = localStorage.getItem('guidelines_db');
        if (!stored) {
            localStorage.setItem('guidelines_db', JSON.stringify(DEFAULT_GUIDELINES));
            return DEFAULT_GUIDELINES;
        }
        return JSON.parse(stored);
    },

    saveGuideline: (categoryTitle, rule) => {
        const guidelines = guidelineService.getGuidelines();
        const categoryIndex = guidelines.findIndex(g => g.title === categoryTitle);

        if (categoryIndex > -1) {
            guidelines[categoryIndex].rules.push({
                id: Date.now(),
                ...rule
            });
            guidelines[categoryIndex].countLabel = `${guidelines[categoryIndex].rules.length} Rules`;
        } else {
            // New Category
            guidelines.push({
                id: Date.now(),
                title: categoryTitle,
                icon: 'fa-book',
                color: 'purple',
                countLabel: '1 Rule',
                rules: [{ id: Date.now() + 1, ...rule }]
            });
        }

        localStorage.setItem('guidelines_db', JSON.stringify(guidelines));
        return guidelines;
    },

    deleteRule: (categoryId, ruleId) => {
        let guidelines = guidelineService.getGuidelines();
        guidelines = guidelines.map(cat => {
            if (cat.id === categoryId) {
                const filteredRules = cat.rules.filter(r => r.id !== ruleId);
                return {
                    ...cat,
                    rules: filteredRules,
                    countLabel: `${filteredRules.length} Rules`
                };
            }
            return cat;
        });
        localStorage.setItem('guidelines_db', JSON.stringify(guidelines));
        return guidelines;
    }
};

export default guidelineService;
