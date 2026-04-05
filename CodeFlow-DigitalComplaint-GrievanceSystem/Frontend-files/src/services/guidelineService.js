import api from './api';

const guidelineService = {
    // Get all guideline categories and rules from backend
    getGuidelines: async () => {
        try {
            const response = await api.get('/guidelines');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching guidelines:', error);
            return [];
        }
    },

    // Save new guideline or add rule to existing category
    saveGuideline: async (categoryTitle, rule) => {
        try {
            // First, get all guidelines to see if category exists
            const guidelines = await guidelineService.getGuidelines();
            const existingCategory = guidelines.find(g => g.title === categoryTitle);

            if (existingCategory) {
                // Add rule to existing category
                const response = await api.post(`/guidelines/${existingCategory._id}/rules`, rule);
                return response.data.data;
            } else {
                // Create new category first (Simplified for now - assumes admin provides icon/color or backend defaults)
                const createResponse = await api.post('/guidelines', {
                    title: categoryTitle,
                    icon: 'fa-book',
                    color: 'purple'
                });
                const newCat = createResponse.data.data;
                // Then add the rule
                const ruleResponse = await api.post(`/guidelines/${newCat._id}/rules`, rule);
                return ruleResponse.data.data;
            }
        } catch (error) {
            console.error('Error saving guideline:', error);
            throw error;
        }
    },

    // Delete a specific rule
    deleteRule: async (categoryId, ruleId) => {
        try {
            const response = await api.delete(`/guidelines/${categoryId}/rules/${ruleId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error deleting rule:', error);
            throw error;
        }
    }
};

export default guidelineService;
