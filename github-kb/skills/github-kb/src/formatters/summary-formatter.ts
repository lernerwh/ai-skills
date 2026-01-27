import { SearchResult } from '../types';

export interface Summary {
  query: string;
  totalResults: number;
  breakdown: {
    code: number;
    repositories: number;
    issues: number;
    discussions: number;
  };
  topResults: {
    code: SearchResult[];
    repositories: SearchResult[];
    issues: SearchResult[];
    discussions: SearchResult[];
  };
  keyFindings: string[];
}

export class SummaryFormatter {
  /**
   * 生成搜索结果摘要
   */
  generateSummary(results: SearchResult[], query: string): Summary {
    return {
      query,
      totalResults: results.length,
      breakdown: this.calculateBreakdown(results),
      topResults: this.extractTopResults(results),
      keyFindings: this.extractKeyFindings(results, query)
    };
  }

  /**
   * 计算结果分类统计
   */
  private calculateBreakdown(results: SearchResult[]): Summary['breakdown'] {
    return {
      code: results.filter(r => r.type === 'code').length,
      repositories: results.filter(r => r.type === 'repository').length,
      issues: results.filter(r => r.type === 'issue').length,
      discussions: results.filter(r => r.type === 'discussion').length
    };
  }

  /**
   * 提取各类别的 Top 结果
   */
  private extractTopResults(results: SearchResult[]): Summary['topResults'] {
    const topN = 5; // 每类取前5个

    return {
      code: results
        .filter(r => r.type === 'code')
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, topN),
      repositories: results
        .filter(r => r.type === 'repository')
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, topN),
      issues: results
        .filter(r => r.type === 'issue')
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, topN),
      discussions: results
        .filter(r => r.type === 'discussion')
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, topN)
    };
  }

  /**
   * 提取关键发现
   */
  private extractKeyFindings(results: SearchResult[], query: string): string[] {
    const findings: string[] = [];

    // 1. 统计高质量结果
    const highQualityResults = results.filter(r => r.relevanceScore > 0.7);
    if (highQualityResults.length > 0) {
      findings.push(`找到 ${highQualityResults.length} 个高质量结果 (相关性 > 70%)`);
    }

    // 2. 统计热门项目
    const popularRepos = results
      .filter(r => r.type === 'repository')
      .filter(r => this.getStars(r) > 1000);
    if (popularRepos.length > 0) {
      findings.push(`发现 ${popularRepos.length} 个热门项目 (stars > 1000)`);
    }

    // 3. 统计最近更新的内容
    const recentResults = results.filter(r => {
      const updatedAt = this.getUpdatedAt(r);
      const daysSinceUpdate = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate < 7; // 7天内更新
    });
    if (recentResults.length > 0) {
      findings.push(`${recentResults.length} 个结果最近一周内有更新`);
    }

    // 4. 提取常见主题
    const commonThemes = this.extractCommonThemes(results);
    if (commonThemes.length > 0) {
      findings.push(`常见主题: ${commonThemes.join(', ')}`);
    }

    return findings;
  }

  /**
   * 提取常见主题
   */
  private extractCommonThemes(results: SearchResult[]): string[] {
    const themes = new Map<string, number>();

    for (const result of results) {
      const text = this.getSearchText(result).toLowerCase();

      // 提取常见技术术语
      const techTerms = text.match(/\b(api|component|hook|function|class|async|await|promise|error|handler|middleware|service|utility|helper)\b/g);

      if (techTerms) {
        for (const term of techTerms) {
          themes.set(term, (themes.get(term) || 0) + 1);
        }
      }
    }

    // 返回出现频率最高的3个主题
    return Array.from(themes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([term]) => term);
  }

  /**
   * 格式化摘要为可读文本
   */
  formatAsText(summary: Summary): string {
    const lines: string[] = [];

    lines.push(`🔍 搜索 "${summary.query}" 的结果:\n`);

    // 统计信息
    lines.push(`📊 统计信息:`);
    lines.push(`  📝 共找到 ${summary.totalResults} 个相关结果`);
    lines.push(`  💻 代码片段: ${summary.breakdown.code}`);
    lines.push(`  📦 仓库: ${summary.breakdown.repositories}`);
    lines.push(`  🐛 Issues: ${summary.breakdown.issues}`);
    lines.push(`  💬 Discussions: ${summary.breakdown.discussions}\n`);

    // 关键发现
    if (summary.keyFindings.length > 0) {
      lines.push(`🔑 关键发现:`);
      summary.keyFindings.forEach((finding, index) => {
        lines.push(`  ${index + 1}. ${finding}`);
      });
      lines.push('');
    }

    // Top 结果
    lines.push(this.formatTopResults(summary.topResults));

    return lines.join('\n');
  }

  /**
   * 格式化 Top 结果
   */
  private formatTopResults(topResults: Summary['topResults']): string {
    const lines: string[] = [];

    // 代码示例
    if (topResults.code.length > 0) {
      lines.push('\n💻 推荐代码示例:');
      topResults.code.slice(0, 3).forEach((result, index) => {
        const snippet = result.data as any; // Type assertion for code result
        lines.push(`  ${index + 1}. ${snippet.name}`);
        lines.push(`     📍 ${snippet.repository}/${snippet.path}`);
        lines.push(`     ⭐ ${snippet.stars} stars | 相关性: ${(result.relevanceScore * 100).toFixed(0)}%`);
        lines.push(`     🔗 ${snippet.url}`);
      });
    }

    // 推荐项目
    if (topResults.repositories.length > 0) {
      lines.push('\n📦 推荐项目:');
      topResults.repositories.slice(0, 3).forEach((result, index) => {
        const repo = result.data as any; // Type assertion for repository result
        lines.push(`  ${index + 1}. ${repo.fullName}`);
        lines.push(`     📝 ${repo.description.substring(0, 80)}...`);
        lines.push(`     ⭐ ${repo.stars} stars | 🗣️ ${repo.language}`);
        lines.push(`     🔗 ${repo.url}`);
      });
    }

    // 相关讨论
    if (topResults.issues.length > 0 || topResults.discussions.length > 0) {
      lines.push('\n💬 相关讨论:');
      const discussions = [...topResults.issues, ...topResults.discussions].slice(0, 3);
      discussions.forEach((result, index) => {
        const issue = result.data as any; // Type assertion for issue/discussion result
        lines.push(`  ${index + 1}. ${issue.title}`);
        lines.push(`     📍 ${issue.repository}`);
        lines.push(`     📅 ${issue.updatedAt}`);
        lines.push(`     🔗 ${issue.url}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * 辅助方法: 获取搜索文本
   */
  private getSearchText(result: SearchResult): string {
    switch (result.type) {
      case 'code':
        const snippet = result.data;
        return `${snippet.name} ${snippet.path}`;
      case 'repository':
        const repo = result.data;
        return `${repo.name} ${repo.description}`;
      case 'issue':
      case 'discussion':
        const issue = result.data;
        return `${issue.title} ${issue.body}`;
    }
  }

  /**
   * 辅助方法: 获取更新时间
   */
  private getUpdatedAt(result: SearchResult): string {
    switch (result.type) {
      case 'code':
        return (result.data).updatedAt;
      case 'repository':
        return (result.data).updatedAt;
      case 'issue':
      case 'discussion':
        return (result.data).updatedAt;
    }
  }

  /**
   * 辅助方法: 获取 stars 数量
   */
  private getStars(result: SearchResult): number {
    switch (result.type) {
      case 'code':
        return (result.data).stars;
      case 'repository':
        return (result.data).stars;
      case 'issue':
      case 'discussion':
        return 0;
    }
  }
}
