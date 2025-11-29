import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude Vision Service for Designer's Eye Review
 * 
 * Provides professional design feedback using Claude's vision capabilities.
 * All responses are structured to appear as expert designer feedback.
 */

// Types for the Designer's Eye Review
export interface DesignReviewRequest {
  screenshotUrl: string;
  pageUrl: string;
  existingScores?: {
    overall: number;
    typography?: number;
    colors?: number;
    cta?: number;
    complexity?: number;
  };
}

export interface DesignInsight {
  category: 'strength' | 'improvement' | 'critical';
  title: string;
  description: string;
  suggestion?: string;
}

export interface DesignReviewResponse {
  overallImpression: string;
  visualAppealRating: number; // 1-10
  visualAppealExplanation: string;
  firstImpressionFeedback: string;
  insights: DesignInsight[];
  missingElements: string[];
  emotionalImpact: {
    primaryEmotion: string;
    explanation: string;
    suggestedImprovement?: string;
  };
  topPriorities: string[];
  generatedAt: string;
}

// The system prompt for design analysis - written to sound like a professional designer
const DESIGN_REVIEW_SYSTEM_PROMPT = `You are an expert UI/UX designer with 15+ years of experience reviewing landing pages for startups and established brands. You've worked at top design agencies and have reviewed thousands of landing pages.

Your task is to provide a "Designer's Eye Review" - a professional, qualitative assessment of a landing page screenshot. Your feedback should sound like it's coming from an experienced designer, not a machine.

IMPORTANT GUIDELINES:
1. Be specific and actionable - reference exact elements you see
2. Use professional design terminology naturally
3. Balance critique with recognition of what works
4. Focus on conversion-relevant design elements
5. Consider the emotional impact on visitors
6. Never mention AI, algorithms, or automated analysis
7. Write as if you're giving feedback in a design critique session

Your tone should be:
- Professional but approachable
- Constructive and encouraging
- Specific rather than generic
- Focused on business impact`;

const DESIGN_REVIEW_USER_PROMPT = (pageUrl: string, scores?: DesignReviewRequest['existingScores']) => `
Please review this landing page screenshot from ${pageUrl}.

${scores ? `Context: The page has already received the following automated scores:
- Overall: ${scores.overall}/100
- Typography: ${scores.typography || 'N/A'}/100
- Colours: ${scores.colors || 'N/A'}/100
- CTA Design: ${scores.cta || 'N/A'}/100
- Visual Complexity: ${scores.complexity || 'N/A'}/100

Your review should complement these scores with qualitative insights a designer would notice.` : ''}

Please provide your Designer's Eye Review in the following JSON format:
{
  "overallImpression": "2-3 sentences capturing your immediate reaction as a designer",
  "visualAppealRating": <number 1-10>,
  "visualAppealExplanation": "Why you gave this rating, referencing specific elements",
  "firstImpressionFeedback": "What catches the eye in the first 3 seconds",
  "insights": [
    {
      "category": "strength|improvement|critical",
      "title": "Short title",
      "description": "What you observed",
      "suggestion": "How to improve (for improvement/critical only)"
    }
  ],
  "missingElements": ["List of common landing page elements that are missing or hard to find"],
  "emotionalImpact": {
    "primaryEmotion": "The main emotion this design evokes",
    "explanation": "Why it evokes this emotion",
    "suggestedImprovement": "How to better align emotional impact with conversion goals"
  },
  "topPriorities": ["Top 3 things to fix or improve, in order of impact"]
}

Provide 4-6 insights covering different aspects of the design. Be specific about what you see.`;

class ClaudeVisionService {
  private client: Anthropic | null = null;

  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable is not set');
      }
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }

  /**
   * Analyze a screenshot and generate a Designer's Eye Review
   */
  async analyzeDesign(request: DesignReviewRequest): Promise<DesignReviewResponse> {
    const client = this.getClient();

    try {
      // Fetch the image and convert to base64
      const imageResponse = await fetch(request.screenshotUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch screenshot: ${imageResponse.statusText}`);
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      
      // Determine media type from URL or default to png
      const mediaType = request.screenshotUrl.includes('.jpg') || request.screenshotUrl.includes('.jpeg')
        ? 'image/jpeg'
        : 'image/png';

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: DESIGN_REVIEW_USER_PROMPT(request.pageUrl, request.existingScores),
              },
            ],
          },
        ],
        system: DESIGN_REVIEW_SYSTEM_PROMPT,
      });

      // Extract the text response
      const textBlock = response.content.find(block => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text response from Claude');
      }

      // Parse the JSON response
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse JSON from response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as Omit<DesignReviewResponse, 'generatedAt'>;
      
      return {
        ...parsed,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Designer\'s Eye Review error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const claudeVision = new ClaudeVisionService();

// Export types
export type { DesignReviewRequest as ClaudeVisionRequest };

