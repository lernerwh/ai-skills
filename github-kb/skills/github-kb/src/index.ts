import { GitHubSearcher } from './searchers/github-search';
import { SummaryFormatter } from './formatters/summary-formatter';
import { SearchOptions } from './types';

/**
 * GitHub Knowledge Base Search Skill
 * 智能搜索 GitHub 代码示例、文档、讨论和解决方案
 */

// 从环境变量获取 GitHub Token
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

/**
 * 执行 GitHub 搜索
 */
export async function searchGitHub(options: SearchOptions) {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
  }

  const searcher = new GitHubSearcher(GITHUB_TOKEN);
  const results = await searcher.search(options);

  const formatter = new SummaryFormatter();
  const summary = formatter.generateSummary(results, options.query);

  return {
    summary,
    formattedText: formatter.formatAsText(summary),
    rawResults: results
  };
}

/**
 * 导出类型和类供外部使用
 */
export { GitHubSearcher } from './searchers/github-search';
export { SummaryFormatter } from './formatters/summary-formatter';
export * from './types';
