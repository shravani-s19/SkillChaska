import { COURSE_DETAILS } from '../data/mockData';

export const api = {
  learn: {
    validateAnswer: async (data: { module_id: string; interaction_id: string; selected_option: string }) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const module = COURSE_DETAILS.course_modules.find(m => m.module_id === data.module_id);
      const question = module?.module_ai_interaction_points.find(q => q.id === data.interaction_id);

      if (!question) {
        return { is_correct: false, feedback: "Error validating answer." };
      }

      const isCorrect = data.selected_option === question.correct_answer;
      
      return {
        is_correct: isCorrect,
        feedback: isCorrect 
          ? "Excellent! That is the correct answer." 
          : `Incorrect. The correct answer is: ${question.correct_answer}`
      };
    },
    getAiResponse: async (message: string, context: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        response: `As your AI Tutor for "${context}", I can explain that. ${message} is a core concept. In the context of this video, focus on how memory allocation changes between mutable and immutable objects.`
      };
    }
  }
};