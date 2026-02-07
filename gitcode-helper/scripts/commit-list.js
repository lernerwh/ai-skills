/**
 * GitCode 提交列表获取脚本
 * 需要在 Playwright MCP 环境中执行
 */

/**
 * 获取提交列表
 * @param {Page} page - Playwright 页面对象
 * @param {string} commitsUrl - 提交列表页面 URL
 * @param {number} limit - 最多获取多少个提交（默认 20）
 * @returns {Array} 提交列表数组
 */
async function getCommitList(page, commitsUrl, limit = 20) {
  // 导航到提交列表页面
  await page.goto(commitsUrl);
  await page.waitForLoadState('networkidle');

  // 获取提交列表
  const commits = await page.evaluate((maxCount) => {
    const commitList = [];

    // GitCode/GitLab 风格的选择器
    const commitSelectors = [
      'ul.commit-list > li',
      '.commit',
      '[data-testid="commit-item"]',
      '.commit-item'
    ];

    let commitContainer = null;
    for (const selector of commitSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        commitContainer = elements;
        break;
      }
    }

    if (!commitContainer) {
      return commitList;
    }

    // 遍历提交项
    for (let i = 0; i < Math.min(commitContainer.length, maxCount); i++) {
      const item = commitContainer[i];

      // 获取提交标题
      const titleSelectors = ['.commit-title', '.commit-message', 'a.commit-row-message', 'h4'];
      let title = '';
      for (const sel of titleSelectors) {
        const el = item.querySelector(sel);
        if (el) {
          title = el.textContent.trim();
          break;
        }
      }

      // 获取提交哈希
      let hash = '';
      const linkEl = item.querySelector('a[href*="/-/commit/"]');
      if (linkEl) {
        const href = linkEl.getAttribute('href');
        const match = href.match(/\/-\/commit\/([a-f0-9]+)/);
        if (match) {
          hash = match[1];
        }
      }

      // 如果没找到，尝试短哈希
      if (!hash) {
        const hashEl = item.querySelector('.commit-id', '.short-sha');
        if (hashEl) {
          hash = hashEl.textContent.trim();
        }
      }

      // 获取作者
      let author = '';
      const authorSelectors = [
        '.author-name',
        '.commit-author',
        '[data-testid="author"]',
        '.user-link'
      ];
      for (const sel of authorSelectors) {
        const el = item.querySelector(sel);
        if (el) {
          author = el.textContent.trim();
          break;
        }
      }

      // 获取时间
      let time = '';
      const timeSelectors = [
        '.commit-time',
        'time',
        '.time',
        '[data-testid="time"]'
      ];
      for (const sel of timeSelectors) {
        const el = item.querySelector(sel);
        if (el) {
          time = el.textContent.trim() || el.getAttribute('datetime') || '';
          break;
        }
      }

      // 构建完整 URL
      let url = '';
      if (hash) {
        url = linkEl ? linkEl.getAttribute('href') : `/-/commit/${hash}`;
        // 转换为绝对 URL
        if (url.startsWith('/')) {
          url = window.location.origin + url;
        }
      }

      commitList.push({
        hash,
        title,
        author,
        time,
        url
      });
    }

    return commitList;
  }, limit);

  return commits;
}

/**
 * 批量获取提交统计
 * @param {Page} page - Playwright 页面对象
 * @param {string} commitsUrl - 提交列表页面 URL
 * @param {number} limit - 最多获取多少个提交（默认 10）
 * @returns {Array} 包含统计信息的提交列表
 */
async function getCommitsWithStats(page, commitsUrl, limit = 10) {
  // 先获取提交列表
  const commits = await getCommitList(page, commitsUrl, limit);

  // 遍历每个提交，获取统计信息
  const { getCommitStats } = require('./commit-stats.js');

  for (const commit of commits) {
    if (commit.url) {
      try {
        const stats = await getCommitStats(page, commit.url);
        commit.stats = stats;
      } catch (error) {
        commit.stats = { error: error.message };
      }
    }
  }

  return commits;
}

module.exports = { getCommitList, getCommitsWithStats };
