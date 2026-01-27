/**
 * ISO 8601 日期时间格式
 */
export type ISODateTime = string;

/**
 * 搜索选项
 */
export interface SearchOptions {
  query: string;
  language?: string;
  type?: 'code' | 'repositories' | 'issues' | 'discussions' | 'all';
  maxResults?: number;
  sortBy?: 'relevance' | 'stars' | 'updated';
}

/**
 * 代码片段
 */
export interface CodeSnippet {
  name: string;
  path: string;
  repository: string;
  language: string;
  code: string;
  url: string;
  stars: number;
  updatedAt: ISODateTime;
}

/**
 * 仓库信息
 */
export interface Repository {
  id: number;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  url: string;
  updatedAt: ISODateTime;
}

/**
 * Issue/Discussion
 */
export interface Issue {
  id: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  repository: string;
  url: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/**
 * 搜索结果
 */
export type SearchResult =
  | { type: 'code'; relevanceScore: number; data: CodeSnippet }
  | { type: 'repository'; relevanceScore: number; data: Repository }
  | { type: 'issue'; relevanceScore: number; data: Issue }
  | { type: 'discussion'; relevanceScore: number; data: Issue };

/**
 * 知识卡片
 */
export interface KnowledgeCard {
  id: string;
  type: 'github-code' | 'github-repo' | 'github-issue';
  title: string;
  summary: string;
  code?: string;
  metadata: {
    url: string;
    stars?: number;
    language?: string;
    updatedAt: ISODateTime;
  };
  tags: string[];
  createdAt: ISODateTime;
}

/**
 * 缓存结构
 */
export interface KnowledgeCache {
  searchResults: Record<string, SearchResult[]>;
  codeSnippets: Record<string, CodeSnippet[]>;
  repositories: Record<string, Repository>;
  lastUpdated: number;
}
