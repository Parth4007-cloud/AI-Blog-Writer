import { Database } from "bun:sqlite";

const db = new Database("ai-blog-writer.db", { create: true });

// Enable WAL mode for better concurrent reads
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS blogs (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    target_keywords TEXT NOT NULL,
    tone TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS blog_content (
    id TEXT PRIMARY KEY,
    blog_id TEXT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    seo_title TEXT,
    meta_description TEXT,
    focus_keywords TEXT,
    content TEXT NOT NULL,
    faq TEXT,
    schema_markup TEXT,
    readability_score REAL,
    word_count INTEGER,
    created_at INTEGER NOT NULL
  );
`);

export interface BlogRow {
  id: string;
  topic: string;
  target_keywords: string;
  tone: string;
  created_at: number;
}

export interface BlogContentRow {
  id: string;
  blog_id: string;
  seo_title: string | null;
  meta_description: string | null;
  focus_keywords: string | null;
  content: string;
  faq: string | null;
  schema_markup: string | null;
  readability_score: number | null;
  word_count: number | null;
  created_at: number;
}

export function getAllBlogs(): BlogRow[] {
  return db.query("SELECT * FROM blogs ORDER BY created_at DESC").all() as BlogRow[];
}

export function getBlogById(id: string): BlogRow | null {
  return db.query("SELECT * FROM blogs WHERE id = ?").get(id) as BlogRow | null;
}

export function getContentByBlogId(blogId: string): BlogContentRow | null {
  return db.query("SELECT * FROM blog_content WHERE blog_id = ?").get(blogId) as BlogContentRow | null;
}

export function insertBlog(blog: BlogRow): void {
  db.query("INSERT INTO blogs (id, topic, target_keywords, tone, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(blog.id, blog.topic, blog.target_keywords, blog.tone, blog.created_at);
}

export function insertContent(content: Omit<BlogContentRow, "created_at">): void {
  db.query(`
    INSERT INTO blog_content (id, blog_id, seo_title, meta_description, focus_keywords, content, faq, schema_markup, readability_score, word_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    content.id,
    content.blog_id,
    content.seo_title,
    content.meta_description,
    content.focus_keywords,
    content.content,
    content.faq,
    content.schema_markup,
    content.readability_score,
    content.word_count,
    Date.now()
  );
}

export function deleteBlog(id: string): void {
  db.query("DELETE FROM blogs WHERE id = ?").run(id);
}

export default db;
