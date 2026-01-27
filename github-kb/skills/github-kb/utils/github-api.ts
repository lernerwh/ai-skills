import { Octokit } from 'octokit';
import { CodeSnippet, Repository, Issue } from '../src/types';

// 定义 GitHub API 响应类型
interface GitHubCodeSearchItem {
  name: string;
  path: string;
  repository: {
    full_name: string;
    stargazers_count: number;
    updated_at: string;
  };
  html_url: string;
}

interface GitHubRepoSearchItem {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  updated_at: string;
}

interface GitHubIssueSearchItem {
  id: number;
  title: string;
  body: string | null;
  state: string;
  repository_url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  pull_request?: any;
}

export class GitHubAPI {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
      userAgent: 'github-kb-skill'
    });
  }

  /**
   * 验证查询参数
   */
  private validateSearchParams(query: string, maxResults: number): void {
    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    if (maxResults < 1 || maxResults > 100) {
      throw new Error('maxResults must be between 1 and 100');
    }
  }

  /**
   * 搜索代码
   */
  async searchCode(
    query: string,
    language?: string,
    maxResults: number = 20
  ): Promise<CodeSnippet[]> {
    this.validateSearchParams(query, maxResults);

    try {
      const q = this.buildQuery(query, { language });

      const response = await this.octokit.rest.search.code({
        q,
        per_page: maxResults
      });

      return response.data.items.map((item: GitHubCodeSearchItem) => ({
        name: item.name,
        path: item.path,
        repository: item.repository.full_name,
        language: language || 'unknown',
        code: '',
        url: item.html_url,
        stars: item.repository.stargazers_count,
        updatedAt: item.repository.updated_at
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`GitHub code search failed: ${error.message}`);
      }
      throw new Error('GitHub code search failed: Unknown error');
    }
  }

  /**
   * 搜索仓库
   */
  async searchRepositories(
    query: string,
    language?: string,
    maxResults: number = 20
  ): Promise<Repository[]> {
    this.validateSearchParams(query, maxResults);

    try {
      const q = this.buildQuery(query, { language });

      const response = await this.octokit.rest.search.repos({
        q,
        per_page: maxResults,
        sort: 'stars'
      });

      return response.data.items.map((item: GitHubRepoSearchItem) => ({
        id: item.id,
        name: item.name,
        fullName: item.full_name,
        description: item.description || '',
        language: item.language || 'unknown',
        stars: item.stargazers_count,
        url: item.html_url,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`GitHub repository search failed: ${error.message}`);
      }
      throw new Error('GitHub repository search failed: Unknown error');
    }
  }

  /**
   * 搜索 Issues
   */
  async searchIssues(
    query: string,
    language?: string,
    maxResults: number = 20
  ): Promise<Issue[]> {
    this.validateSearchParams(query, maxResults);

    try {
      const q = this.buildQuery(query, { language, isIssue: true });

      const response = await this.octokit.rest.search.issuesAndPullRequests({
        q,
        per_page: maxResults
      });

      return response.data.items
        .filter((item: GitHubIssueSearchItem) => !item.pull_request)
        .map((item: GitHubIssueSearchItem) => ({
          id: item.id,
          title: item.title,
          body: item.body || '',
          state: item.state as 'open' | 'closed',
          repository: item.repository_url.split('/').slice(-1)[0],
          url: item.html_url,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`GitHub issues search failed: ${error.message}`);
      }
      throw new Error('GitHub issues search failed: Unknown error');
    }
  }

  /**
   * 搜索 Discussions
   * 注意: GitHub REST API 暂不支持直接搜索 Discussions
   * 这里返回 Issues 作为替代方案
   */
  async searchDiscussions(
    query: string,
    maxResults: number = 20
  ): Promise<Issue[]> {
    // Discussions API 目前不通过搜索 API 暴露
    // 使用 Issues 搜索作为替代
    return this.searchIssues(query, undefined, maxResults);
  }

  /**
   * 构建查询字符串
   */
  private buildQuery(
    query: string,
    options: {
      language?: string;
      isIssue?: boolean;
    }
  ): string {
    let q = query;

    if (options.language) {
      q += ` language:${options.language}`;
    }

    if (options.isIssue) {
      q += ' is:issue';
    }

    return q;
  }
}
