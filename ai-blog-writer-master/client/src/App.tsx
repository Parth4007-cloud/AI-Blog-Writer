import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Blog, BlogListItem, GenerateBlogRequest, FAQ } from './types';
import { getBlogs, getBlog, generateBlog, deleteBlog } from './services/api';
import {
  PenLineIcon,
  LayoutDashboardIcon,
  PlusIcon,
  Trash2Icon,
  SparklesIcon,
  Loader2Icon,
  ArrowLeftIcon,
  HomeIcon,
  SunIcon,
  MoonIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  CodeIcon,
  CheckCircleIcon,
  SearchIcon,
  BookOpenIcon,
  ZapIcon,
  GlobeIcon,
  TagIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  HashIcon,
  FileCodeIcon,
  FileTextIcon,
} from './components/icons';

// --- Sub-Components ---

const ThemeToggle: React.FC<{ isDark: boolean; toggle: () => void }> = ({ isDark, toggle }) => (
  <button
    onClick={toggle}
    className="p-2 rounded-full bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors backdrop-blur-sm"
    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
  >
    {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
  </button>
);

interface CopyButtonProps {
  text: string;
  label?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text, label = "Copy" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      {copied ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
      {copied ? "Copied!" : label}
    </button>
  );
};

interface ReadabilityBadgeProps {
  score?: number;
}

const ReadabilityBadge: React.FC<ReadabilityBadgeProps> = ({ score }) => {
  if (score === undefined) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (score >= 60) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    if (score >= 40) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
      Readability: {getScoreLabel(score)} ({score.toFixed(0)})
    </span>
  );
};

interface FAQSectionProps {
  faqs: FAQ[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <MessageSquareIcon className="w-5 h-5 text-purple-500" />
        FAQ Section
      </h3>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <details
            key={index}
            open={openIndex === index}
            onToggle={(e) => {
              if ((e.target as HTMLDetailsElement).open) {
                setOpenIndex(index);
              }
            }}
            className="group bg-slate-50 dark:bg-slate-800 rounded-lg"
          >
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <span className="font-medium text-slate-900 dark:text-white">{faq.question}</span>
              <HashIcon className="w-4 h-4 text-slate-400 group-open:rotate-45 transition-transform" />
            </summary>
            <div className="px-4 pb-4 text-slate-700 dark:text-slate-300">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

interface SEOPanelProps {
  seoTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  wordCount: number;
  readabilityScore: number;
}

const SEOPanel: React.FC<SEOPanelProps> = ({
  seoTitle,
  metaDescription,
  focusKeywords,
  wordCount,
  readabilityScore,
}) => {
  const titleLength = seoTitle.length;
  const descLength = metaDescription.length;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <SearchIcon className="w-5 h-5 text-blue-500" />
        SEO Analysis
      </h3>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">SEO Title</span>
            <span className={`text-xs ${titleLength >= 50 && titleLength <= 60 ? 'text-green-500' : 'text-orange-500'}`}>
              {titleLength}/60
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded">{seoTitle}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Meta Description</span>
            <span className={`text-xs ${descLength >= 150 && descLength <= 160 ? 'text-green-500' : 'text-orange-500'}`}>
              {descLength}/160
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded">{metaDescription}</p>
        </div>

        <div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Focus Keywords</span>
          <div className="flex flex-wrap gap-2">
            {focusKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
              >
                <TagIcon className="w-3 h-3 inline mr-1" />
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <BookOpenIcon className="w-4 h-4" />
            {wordCount} words
          </div>
          <ReadabilityBadge score={readabilityScore} />
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

type ViewMode = "preview" | "code";

const App: React.FC = () => {
  // --- Global State ---
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);

  // --- Theme State ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ai-blog-theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });

  // --- Navigation State ---
  const [activeBlogId, setActiveBlogId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // --- Form State ---
  const [topic, setTopic] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");
  const [tone, setTone] = useState("professional");
  const [targetAudience, setTargetAudience] = useState("");
  const [wordCount, setWordCount] = useState("1500");
  const [includeFAQ, setIncludeFAQ] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Blog View State ---
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [showSEO, setShowSEO] = useState(true);

  // --- Load blogs from backend ---
  useEffect(() => {
    getBlogs()
      .then(setBlogs)
      .catch(console.error)
      .finally(() => setIsLoadingBlogs(false));
  }, []);

  // --- Theme Effect ---
  useEffect(() => {
    localStorage.setItem("ai-blog-theme", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- Derived State ---
  const activeBlog = useMemo(
    () => blogs.find((b) => b.id === activeBlogId) || null,
    [blogs, activeBlogId]
  );

  // --- Actions ---

  const handleGenerateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !targetKeywords.trim()) return;

    setIsGenerating(true);
    try {
      const request: GenerateBlogRequest = {
        topic,
        targetKeywords,
        tone,
        targetAudience: targetAudience.trim() || undefined,
        wordCount: parseInt(wordCount),
        includeFAQ,
      };
      const newBlog = await generateBlog(request);
      newBlog.createdAt = Date.now();

      setBlogs((prev) => [
        {
          id: newBlog.id,
          topic: newBlog.topic,
          targetKeywords: newBlog.targetKeywords,
          tone: newBlog.tone,
          seoTitle: newBlog.seoTitle,
          wordCount: newBlog.wordCount,
          readabilityScore: newBlog.readabilityScore,
          createdAt: newBlog.createdAt,
        },
        ...prev,
      ]);
      setCurrentBlog(newBlog);
      setActiveBlogId(newBlog.id);
      setIsCreating(false);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Failed to generate blog. Please check your API key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadBlog = async (id: string) => {
    setActiveBlogId(id);
    try {
      const blog = await getBlog(id);
      setCurrentBlog(blog);
    } catch (error) {
      console.error("Failed to load blog:", error);
      setActiveBlogId(null);
    }
  };

  const handleDeleteBlog = async (e: React.MouseEvent, blogId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this blog? This cannot be undone.")) {
      try {
        await deleteBlog(blogId);
        setBlogs((prev) => prev.filter((b) => b.id !== blogId));
        if (activeBlogId === blogId) {
          setActiveBlogId(null);
          setCurrentBlog(null);
        }
      } catch (error) {
        console.error("Failed to delete blog:", error);
      }
    }
  };

  const resetForm = () => {
    setTopic("");
    setTargetKeywords("");
    setTone("professional");
    setTargetAudience("");
    setWordCount("1500");
    setIncludeFAQ(true);
  };

  const navigateHome = () => {
    setActiveBlogId(null);
    setIsCreating(false);
    setCurrentBlog(null);
  };

  const downloadAsHTML = (blog: Blog) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${blog.seoTitle}</title>
    <meta name="description" content="${blog.metaDescription}">
    <script type="application/ld+json">${blog.schemaMarkup}</script>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
        h1, h2, h3 { margin-top: 2rem; }
    </style>
</head>
<body>
    <article>${blog.content}</article>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${blog.seoTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Views ---

  const renderLandingOrCreate = () => (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle isDark={isDarkMode} toggle={toggleTheme} />
      </div>
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-400/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-pink-400/10 dark:bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {blogs.length > 0 && (
        <button
          onClick={() => setIsCreating(false)}
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors z-20"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Back to Dashboard
        </button>
      )}

      <div className="max-w-2xl w-full z-10 text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-slate-800/50 rounded-2xl mb-4 ring-1 ring-slate-200 dark:ring-slate-700 shadow-lg backdrop-blur-sm">
            <PenLineIcon className="w-10 h-10 text-purple-500 dark:text-purple-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 pb-2">
            AI Blog Writer
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl">
            Generate SEO-optimized blog posts with AI. Perfect meta tags, keywords, and structure.
          </p>
        </div>

        <form onSubmit={handleGenerateBlog} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Blog Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The Future of Remote Work"
              className="w-full bg-white dark:bg-slate-900 rounded-lg px-4 py-3 ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Target Keywords *
            </label>
            <input
              type="text"
              value={targetKeywords}
              onChange={(e) => setTargetKeywords(e.target.value)}
              placeholder="e.g., remote work, telecommuting, distributed teams"
              className="w-full bg-white dark:bg-slate-900 rounded-lg px-4 py-3 ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 rounded-lg px-4 py-3 ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="authoritative">Authoritative</option>
                <option value="conversational">Conversational</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Word Count
              </label>
              <select
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 rounded-lg px-4 py-3 ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="800">~800 words</option>
                <option value="1500">~1500 words</option>
                <option value="2000">~2000 words</option>
                <option value="3000">~3000 words</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Target Audience (optional)
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., small business owners, marketers"
              className="w-full bg-white dark:bg-slate-900 rounded-lg px-4 py-3 ring-1 ring-slate-200 dark:ring-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="faq"
              checked={includeFAQ}
              onChange={(e) => setIncludeFAQ(e.target.checked)}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
            />
            <label htmlFor="faq" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Include FAQ section for featured snippets
            </label>
          </div>

          <button
            type="submit"
            disabled={!topic.trim() || !targetKeywords.trim() || isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-lg font-bold transition-all shadow-lg shadow-purple-900/20 dark:shadow-black/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <Loader2Icon className="w-5 h-5 animate-spin" />
                Writing Your Blog...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                Generate SEO Blog
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 transition-colors duration-500">
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle isDark={isDarkMode} toggle={toggleTheme} />
      </div>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8 md:pt-0">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <LayoutDashboardIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              Your Blogs
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Manage your AI-generated SEO-optimized blog posts.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-lg font-medium transition-all shadow-lg shadow-purple-900/20 dark:shadow-black/20"
          >
            <PlusIcon className="w-5 h-5" /> Write New Blog
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              onClick={() => handleLoadBlog(blog.id)}
              className="group bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-purple-500/30 rounded-2xl p-6 cursor-pointer transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => handleDeleteBlog(e, blog.id)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/50 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors"
                  title="Delete Blog"
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                    <FileTextIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <ReadabilityBadge score={blog.readabilityScore} />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                  {blog.seoTitle}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 line-clamp-1">
                  {blog.topic}
                </p>
                <div className="mt-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <BookOpenIcon className="w-3 h-3" />
                    {blog.wordCount} words
                  </span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                    {blog.tone}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBlogView = () => {
    if (!currentBlog) return null;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-500">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={navigateHome}
                className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <HomeIcon className="w-5 h-5" />
              </button>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-md">
                  {currentBlog.seoTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === "preview" ? "code" : "preview")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "preview"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title={viewMode === "preview" ? "View Code" : "View Preview"}
              >
                {viewMode === "preview" ? <CodeIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowSEO(!showSEO)}
                className={`p-2 rounded-lg transition-colors ${
                  showSEO
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="Toggle SEO Panel"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              <ThemeToggle isDark={isDarkMode} toggle={toggleTheme} />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto flex">
          {/* Sidebar - SEO Panel */}
          {showSEO && (
            <aside className="w-80 p-6 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 hidden lg:block">
              <SEOPanel
                seoTitle={currentBlog.seoTitle}
                metaDescription={currentBlog.metaDescription}
                focusKeywords={currentBlog.focusKeywords}
                wordCount={currentBlog.wordCount}
                readabilityScore={currentBlog.readabilityScore}
              />

              <div className="mt-6 space-y-3">
                <CopyButton text={currentBlog.seoTitle} label="Copy Title" />
                <CopyButton text={currentBlog.metaDescription} label="Copy Meta" />
                <CopyButton
                  text={currentBlog.focusKeywords.join(", ")}
                  label="Copy Keywords"
                />
                <button
                  onClick={() => downloadAsHTML(currentBlog)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Download HTML
                </button>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-12 overflow-auto">
            <div className="max-w-4xl mx-auto">
              {/* Blog Title */}
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {currentBlog.seoTitle}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <TagIcon className="w-4 h-4" />
                  {currentBlog.focusKeywords[0]}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpenIcon className="w-4 h-4" />
                  {currentBlog.wordCount} words
                </span>
                <ReadabilityBadge score={currentBlog.readabilityScore} />
              </div>

              {/* Content */}
              {viewMode === "preview" ? (
                <div className="markdown-body bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 mb-8">
                  <ReactMarkdown>{currentBlog.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="bg-slate-900 rounded-xl p-6 mb-8 overflow-x-auto">
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                    {currentBlog.content}
                  </pre>
                </div>
              )}

              {/* FAQ Section */}
              {currentBlog.faq && currentBlog.faq.length > 0 && (
                <FAQSection faqs={currentBlog.faq} />
              )}

              {/* Schema Markup */}
              <details className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 mt-6">
                <summary className="flex items-center gap-2 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-t-xl">
                  <FileCodeIcon className="w-5 h-5 text-slate-500" />
                  <span className="font-medium text-slate-900 dark:text-white">
                    Schema Markup (JSON-LD)
                  </span>
                </summary>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
                    {currentBlog.schemaMarkup}
                  </pre>
                  <CopyButton text={currentBlog.schemaMarkup} label="Copy Schema" />
                </div>
              </details>
            </div>
          </main>
        </div>
      </div>
    );
  };

  // --- Main Render Logic ---

  if (isLoadingBlogs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2Icon className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (blogs.length === 0 || isCreating) {
    return renderLandingOrCreate();
  }

  if (activeBlogId) {
    if (currentBlog) {
      return renderBlogView();
    }
    // Loading state while fetching blog content
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2Icon className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return renderDashboard();
};

export default App;
