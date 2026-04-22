import { Router, type Request, type Response } from "express";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import {
  insertBlog,
  insertContent,
  getAllBlogs,
  getBlogById,
  getContentByBlogId,
  deleteBlog,
  type BlogRow,
  type BlogContentRow,
} from "../db.js";

const router = Router();

// --- Helpers ---

function calculateReadabilityScore(text: string): number {
  // Simple Flesch Reading Ease approximation
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const complexWords = text.split(/\s+/).filter(word => word.length > 6).length;

  if (words === 0 || sentences === 0) return 0;

  const avgSentenceLength = words / sentences;
  const complexWordRatio = (complexWords / words) * 100;

  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * complexWordRatio);
  return Math.max(0, Math.min(100, score));
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// --- Routes ---

// GET /api/blogs
router.get("/blogs", (_req: Request, res: Response) => {
  const blogs = getAllBlogs();
  const result = blogs.map((blog) => {
    const content = getContentByBlogId(blog.id);
    return {
      id: blog.id,
      topic: blog.topic,
      targetKeywords: blog.target_keywords,
      tone: blog.tone,
      seoTitle: content?.seo_title,
      wordCount: content?.word_count,
      readabilityScore: content?.readability_score,
      createdAt: blog.created_at,
    };
  });
  res.json(result);
});

// GET /api/blogs/:id
router.get("/blogs/:id", (req: Request, res: Response) => {
  const blog = getBlogById(req.params.id);
  if (!blog) {
    res.status(404).json({ error: "Blog not found" });
    return;
  }
  const content = getContentByBlogId(blog.id);
  if (!content) {
    res.status(404).json({ error: "Blog content not found" });
    return;
  }

  res.json({
    id: blog.id,
    topic: blog.topic,
    targetKeywords: blog.target_keywords,
    tone: blog.tone,
    seoTitle: content.seo_title,
    metaDescription: content.meta_description,
    focusKeywords: content.focus_keywords ? JSON.parse(content.focus_keywords) : [],
    content: content.content,
    faq: content.faq ? JSON.parse(content.faq) : [],
    schemaMarkup: content.schema_markup,
    readabilityScore: content.readability_score,
    wordCount: content.word_count,
    createdAt: blog.created_at,
  });
});

// POST /api/generate-blog
router.post("/generate-blog", async (req: Request, res: Response) => {
  const { topic, targetKeywords, tone, targetAudience, wordCount, includeFAQ } = req.body;

  if (!topic || !targetKeywords) {
    res.status(400).json({ error: "topic and targetKeywords are required" });
    return;
  }

  try {
    const blogSchema = z.object({
      seoTitle: z.string().describe("SEO-optimized title (50-60 characters)"),
      metaDescription: z.string().describe("Meta description for SEO (150-160 characters)"),
      focusKeywords: z.array(z.string()).describe("List of focus keywords for SEO"),
      content: z.string().describe("Full blog post content in Markdown with proper headings (H1, H2, H3)"),
      faq: z.array(z.object({
        question: z.string(),
        answer: z.string()
      })).describe("List of FAQ questions and answers"),
      schemaMarkup: z.string().describe("JSON-LD schema markup for Article"),
    });

    const prompt = `You are an expert SEO content writer. Write a comprehensive, SEO-optimized blog post with the following specifications:

TOPIC: ${topic}
TARGET KEYWORDS: ${targetKeywords}
${tone ? `TONE: ${tone}` : ''}
${targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : ''}
${wordCount ? `WORD COUNT: Approximately ${wordCount} words` : 'WORD COUNT: 1500-2000 words'}

Requirements:
1. Create a compelling, SEO-friendly title (50-60 characters)
2. Write a meta description that encourages clicks (150-160 characters)
3. Extract 5-8 focus keywords from the topic
4. Write comprehensive content with:
   - Clear H1, H2, H3 heading structure
   - Short paragraphs (2-3 sentences)
   - Bullet points where appropriate
   - Natural keyword integration
   - Internal and external link suggestions [in brackets like this]
5. Generate 3-5 FAQ questions for featured snippets
6. Provide JSON-LD schema markup for Article type

Make the content engaging, informative, and valuable to readers.`;

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: blogSchema,
      prompt,
    });

    const blogId = crypto.randomUUID();
    const blog: BlogRow = {
      id: blogId,
      topic,
      target_keywords: targetKeywords,
      tone: tone || "professional",
      created_at: Date.now(),
    };

    insertBlog(blog);

    const contentWords = countWords(object.content);
    const readabilityScore = calculateReadabilityScore(object.content);

    const contentId = crypto.randomUUID();
    const content: Omit<BlogContentRow, "created_at"> = {
      id: contentId,
      blog_id: blogId,
      seo_title: object.seoTitle,
      meta_description: object.metaDescription,
      focus_keywords: JSON.stringify(object.focusKeywords),
      content: object.content,
      faq: JSON.stringify(object.faq),
      schema_markup: object.schemaMarkup,
      readability_score: readabilityScore,
      word_count: contentWords,
    };

    insertContent(content);

    res.json({
      id: blog.id,
      topic: blog.topic,
      targetKeywords: blog.target_keywords,
      tone: blog.tone,
      seoTitle: content.seo_title,
      metaDescription: content.meta_description,
      focusKeywords: object.focusKeywords,
      content: content.content,
      faq: object.faq,
      schemaMarkup: content.schema_markup,
      readabilityScore: content.readability_score,
      wordCount: content.word_count,
      createdAt: blog.created_at,
    });
  } catch (error) {
    console.error("Error generating blog:", error);
    res.status(500).json({ error: "Failed to generate blog" });
  }
});

// DELETE /api/blogs/:id
router.delete("/blogs/:id", (req: Request, res: Response) => {
  deleteBlog(req.params.id);
  res.json({ success: true });
});

export default router;
