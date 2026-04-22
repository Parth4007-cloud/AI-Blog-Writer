import type { Blog, BlogListItem, GenerateBlogRequest } from '../types';

const API_BASE = '/api';

export async function getBlogs(): Promise<BlogListItem[]> {
  const response = await fetch(`${API_BASE}/blogs`);
  if (!response.ok) throw new Error('Failed to fetch blogs');
  return response.json();
}

export async function getBlog(id: string): Promise<Blog> {
  const response = await fetch(`${API_BASE}/blogs/${id}`);
  if (!response.ok) throw new Error('Failed to fetch blog');
  return response.json();
}

export async function generateBlog(request: GenerateBlogRequest): Promise<Blog> {
  const response = await fetch(`${API_BASE}/generate-blog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to generate blog');
  return response.json();
}

export async function deleteBlog(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/blogs/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete blog');
}
