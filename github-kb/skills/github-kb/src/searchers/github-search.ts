import { GitHubAPI } from '../../utils/github-api';
import { QueryBuilder, QuestionType } from '../../utils/query-builder';
import {
  SearchOptions,
  SearchResult,
  CodeSnippet,
  Repository,
  Issue
} from '../types';

export class GitHubSearcher {
  private api: GitHubAPI;
  private queryBuilder: QueryBuilder;

  constructor(githubToken: string) {
    this.api = new GitHubAPI(githubToken);
    this.queryBuilder = new QueryBuilder();
  }

  /**
   * 主搜索方法 - 根据选项执行智能搜索
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    // 1. 分析问题类型
    const questionType = this.queryBuilder.analyzeQuestionType(options.query);

    // 2. 推断语言
    const language = options.language || this.queryBuilder.inferLanguage(options.query);

    // 3. 根据类型决定搜索策略
    const searchStrategy = this.getSearchStrategy(questionType, options.type);

    // 4. 并行执行搜索
    const results = await this.executeSearch(searchStrategy, options.query, language, options.maxResults);

    // 5. 应用相关性评分
    const scoredResults = this.applyRelevanceScoring(results, options.query);

    // 6. 排序并返回
    return this.sortResults(scoredResults, options.sortBy);
  }

  /**
   * 根据问题类型和用户指定类型确定搜索策略
   */
  private getSearchStrategy(
    questionType: QuestionType,
    userType?: string
  ): string[] {
    // 如果用户明确指定类型,使用用户类型
    if (userType && userType !== 'all') {
      return [userType];
    }

    // 根据问题类型智能选择
    switch (questionType) {
      case 'implementation':
        return ['code', 'repositories'];
      case 'debugging':
        return ['issues', 'discussions'];
      case 'selection':
        return ['repositories'];
      case 'best-practice':
        return ['code', 'repositories'];
      default:
        return ['code', 'repositories', 'issues'];
    }
  }

  /**
   * 并行执行多个搜索
   */
  private async executeSearch(
    types: string[],
    query: string,
    language?: string,
    maxResults: number = 20
  ): Promise<SearchResult[]> {
    const searchPromises: Promise<SearchResult[]>[] = [];

    for (const type of types) {
      switch (type) {
        case 'code':
          searchPromises.push(
            this.api.searchCode(query, language, maxResults)
              .then(items => this.convertToSearchResults('code', items))
          );
          break;
        case 'repositories':
          searchPromises.push(
            this.api.searchRepositories(query, language, maxResults)
              .then(items => this.convertToSearchResults('repository', items))
          );
          break;
        case 'issues':
          searchPromises.push(
            this.api.searchIssues(query, language, maxResults)
              .then(items => this.convertToSearchResults('issue', items))
          );
          break;
        case 'discussions':
          searchPromises.push(
            this.api.searchIssues(query, language, maxResults)
              .then(items => this.convertToSearchResults('discussion', items))
          );
          break;
      }
    }

    // 并行执行并合并结果
    const allResults = await Promise.all(searchPromises);
    return allResults.flat();
  }

  /**
   * 转换 API 结果为 SearchResult 格式
   */
  private convertToSearchResults(
    type: 'code' | 'repository' | 'issue' | 'discussion',
    items: CodeSnippet[] | Repository[] | Issue[]
  ): SearchResult[] {
    if (type === 'code') {
      return (items as CodeSnippet[]).map(item => ({
        type: 'code' as const,
        relevanceScore: 0,
        data: item
      }));
    }
    if (type === 'repository') {
      return (items as Repository[]).map(item => ({
        type: 'repository' as const,
        relevanceScore: 0,
        data: item
      }));
    }
    // Both 'issue' and 'discussion' use Issue type
    return (items as Issue[]).map(item => ({
      type,
      relevanceScore: 0,
      data: item
    }));
  }

  /**
   * 应用相关性评分
   * 算法: 关键词匹配度(40%) + 时间新鲜度(30%) + 质量评分(30%)
   */
  private applyRelevanceScoring(
    results: SearchResult[],
    query: string
  ): SearchResult[] {
    const now = Date.now();
    const keywords = this.extractKeywords(query);

    return results.map(result => {
      let score = 0;

      // 1. 关键词匹配度 (40%)
      const matchScore = this.calculateKeywordMatch(result, keywords);
      score += matchScore * 0.4;

      // 2. 时间新鲜度 (30%)
      const freshnessScore = this.calculateFreshness(result, now);
      score += freshnessScore * 0.3;

      // 3. 质量评分 (30%)
      const qualityScore = this.calculateQuality(result);
      score += qualityScore * 0.3;

      return {
        ...result,
        relevanceScore: score
      };
    });
  }

  /**
   * 计算关键词匹配度
   */
  private calculateKeywordMatch(result: SearchResult, keywords: string[]): number {
    const searchText = this.getSearchText(result).toLowerCase();
    const matchCount = keywords.filter(kw =>
      searchText.includes(kw.toLowerCase())
    ).length;
    return matchCount / keywords.length;
  }

  /**
   * 计算时间新鲜度 (0-1, 越新越高)
   */
  private calculateFreshness(result: SearchResult, now: number): number {
    const updatedAt = new Date(this.getUpdatedAt(result)).getTime();
    const daysSinceUpdate = (now - updatedAt) / (1000 * 60 * 60 * 24);

    // 2年内: 线性衰减, 超过2年: 0
    if (daysSinceUpdate > 730) {
      return 0;
    }
    return 1 - (daysSinceUpdate / 730);
  }

  /**
   * 计算质量评分 (基于 stars)
   */
  private calculateQuality(result: SearchResult): number {
    const stars = this.getStars(result);

    // 对数刻度, 避免大项目过度占优
    // 0 stars = 0, 10 stars = 0.5, 100 stars = 0.75, 1000+ stars = 1.0
    if (stars === 0) return 0;
    return Math.min(Math.log10(stars + 1) / 4, 1);
  }

  /**
   * 排序结果
   */
  private sortResults(
    results: SearchResult[],
    sortBy?: 'relevance' | 'stars' | 'updated'
  ): SearchResult[] {
    switch (sortBy) {
      case 'stars':
        return results.sort((a, b) => this.getStars(b) - this.getStars(a));
      case 'updated':
        return results.sort((a, b) =>
          new Date(this.getUpdatedAt(b)).getTime() - new Date(this.getUpdatedAt(a)).getTime()
        );
      case 'relevance':
      default:
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }

  /**
   * 提取关键词
   */
  private extractKeywords(query: string): string[] {
    return query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  }

  /**
   * 辅助方法: 获取可搜索文本
   */
  private getSearchText(result: SearchResult): string {
    switch (result.type) {
      case 'code':
        const snippet = result.data as CodeSnippet;
        return `${snippet.name} ${snippet.path} ${snippet.repository}`;
      case 'repository':
        const repo = result.data as Repository;
        return `${repo.name} ${repo.description} ${repo.fullName}`;
      case 'issue':
      case 'discussion':
        const issue = result.data as Issue;
        return `${issue.title} ${issue.body}`;
    }
  }

  /**
   * 辅助方法: 获取更新时间
   */
  private getUpdatedAt(result: SearchResult): string {
    switch (result.type) {
      case 'code':
        return (result.data as CodeSnippet).updatedAt;
      case 'repository':
        return (result.data as Repository).updatedAt;
      case 'issue':
      case 'discussion':
        return (result.data as Issue).updatedAt;
    }
  }

  /**
   * 辅助方法: 获取 stars 数量
   */
  private getStars(result: SearchResult): number {
    switch (result.type) {
      case 'code':
        return (result.data as CodeSnippet).stars;
      case 'repository':
        return (result.data as Repository).stars;
      case 'issue':
      case 'discussion':
        return 0; // Issues 没有 stars
    }
  }
}
