/**
 * GitCode MR（Merge Request）信息查询脚本
 * 需要在 Playwright MCP 环境中执行
 */

/**
 * 获取 MR 列表
 * @param {Page} page - Playwright 页面对象
 * @param {string} mrListUrl - MR 列表页面 URL
 * @param {string} status - MR 状态过滤 (all/opened/closed/merged)
 * @param {number} limit - 最多获取多少个 MR（默认 20）
 * @returns {Array} MR 列表数组
 */
async function getMRList(page, mrListUrl, status = 'all', limit = 20) {
  // 构建带状态过滤的 URL
  let url = mrListUrl;
  if (!url.includes('?')) {
    url += '?';
  }
  if (status !== 'all') {
    url += `state=${status}&`;
  }

  // 导航到 MR 列表页面
  await page.goto(url);
  await page.waitForLoadState('networkidle');

  // 获取 MR 列表
  const mrs = await page.evaluate((maxCount) => {
    const mrList = [];

    // GitCode/GitLab 风格的 MR 选择器
    const mrSelectors = [
      '.merge-request',
      '.mr-list-item',
      '[data-testid="mr-item"]',
      'tr.merge-request',
      'li.merge-request'
    ];

    let mrContainer = null;
    for (const selector of mrSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        mrContainer = elements;
        break;
      }
    }

    if (!mrContainer) {
      return mrList;
    }

    // 遍历 MR 项
    for (let i = 0; i < Math.min(mrContainer.length, maxCount); i++) {
      const item = mrContainer[i];

      // 获取 MR 标题
      const titleSelectors = [
        '.mr-title',
        '.merge-request-title',
        'a[data-testid="mr-title"]',
        'h4 a'
      ];
      let title = '';
      let url = '';
      for (const sel of titleSelectors) {
        const el = item.querySelector(sel);
        if (el) {
          title = el.textContent.trim();
          url = el.getAttribute('href');
          // 转换为绝对 URL
          if (url.startsWith('/')) {
            url = window.location.origin + url;
          }
          break;
        }
      }

      // 获取 MR ID/编号
      let id = '';
      const idEl = item.querySelector('.mr-id, .merge-request-iid, [data-testid="mr-iid"]');
      if (idEl) {
        const text = idEl.textContent.trim();
        const match = text.match(/!?\s*(\d+)/);
        if (match) {
          id = match[1];
        }
      }
      // 如果从 URL 中提取
      if (!id && url) {
        const match = url.match(/\/merge_requests\/(\d+)/);
        if (match) {
          id = match[1];
        }
      }

      // 获取 MR 状态
      let status = 'opened';
      const statusEl = item.querySelector('.badge, .state-badge, [data-testid="mr-status"]');
      if (statusEl) {
        const statusText = statusEl.textContent.toLowerCase().trim();
        if (statusText.includes('merged')) {
          status = 'merged';
        } else if (statusText.includes('closed') || statusText.includes('关闭')) {
          status = 'closed';
        }
      }

      // 获取作者
      let author = '';
      const authorSelectors = [
        '.author',
        '.mr-author',
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
        'time',
        '.created-at',
        '.mr-time',
        '[data-testid="created-at"]'
      ];
      for (const sel of timeSelectors) {
        const el = item.querySelector(sel);
        if (el) {
          time = el.textContent.trim() || el.getAttribute('datetime') || '';
          break;
        }
      }

      // 获取来源分支和目标分支
      let sourceBranch = '';
      let targetBranch = '';
      const branchEl = item.querySelector('.branches, .mr-branches');
      if (branchEl) {
        const branchText = branchEl.textContent.trim();
        const branchMatch = branchText.match(/(.+?)\s*[→>to]\s*(.+)/);
        if (branchMatch) {
          sourceBranch = branchMatch[1].trim();
          targetBranch = branchMatch[2].trim();
        }
      }

      mrList.push({
        id,
        title,
        author,
        time,
        status,
        sourceBranch,
        targetBranch,
        url
      });
    }

    return mrList;
  }, limit);

  return mrs;
}

/**
 * 获取单个 MR 的详情和统计
 * @param {Page} page - Playwright 页面对象
 * @param {string} mrUrl - MR 详情页面 URL
 * @returns {object} MR 详情对象
 */
async function getMRDetails(page, mrUrl) {
  // 导航到 MR 详情页面
  await page.goto(mrUrl);
  await page.waitForLoadState('networkidle');

  // 获取 MR 详情和统计
  const details = await page.evaluate(() => {
    // 获取 MR 标题
    const titleEl = document.querySelector('.detail-page-title, .mr-title, h1');
    const title = titleEl ? titleEl.textContent.trim() : '';

    // 获取 MR ID
    let id = '';
    const idEl = document.querySelector('.mr-iid, .merge-request-iid');
    if (idEl) {
      const text = idEl.textContent.trim();
      const match = text.match(/!?\s*(\d+)/);
      if (match) {
        id = match[1];
      }
    }

    // 获取状态
    let status = 'opened';
    const statusEl = document.querySelector('.badge-state, .state-badge');
    if (statusEl) {
      const statusText = statusEl.textContent.toLowerCase().trim();
      if (statusText.includes('merged')) {
        status = 'merged';
      } else if (statusText.includes('closed') || statusText.includes('关闭')) {
        status = 'closed';
      }
    }

    // 获取分支信息
    let sourceBranch = '';
    let targetBranch = '';
    const branchEl = document.querySelector('.branches, .mr-branches, .from-merge-request');
    if (branchEl) {
      const branchText = branchEl.textContent.trim();
      const branchMatch = branchText.match(/(.+?)\s*[→>to]\s*(.+)/);
      if (branchMatch) {
        sourceBranch = branchMatch[1].trim();
        targetBranch = branchMatch[2].trim();
      }
    }

    // 获取统计信息
    let statsText = '';
    const statsEl = document.querySelector('.diff-stats, .mr-stats');
    if (statsEl) {
      statsText = statsEl.textContent.trim();
    }

    return {
      id,
      title,
      status,
      sourceBranch,
      targetBranch,
      statsText
    };
  });

  return details;
}

/**
 * 获取 MR 列表及统计
 * @param {Page} page - Playwright 页面对象
 * @param {string} mrListUrl - MR 列表页面 URL
 * @param {string} status - MR 状态过滤
 * @param {number} limit - 最多获取多少个 MR
 * @returns {Array} 包含统计信息的 MR 列表
 */
async function getMRsWithStats(page, mrListUrl, status = 'all', limit = 10) {
  // 先获取 MR 列表
  const mrs = await getMRList(page, mrListUrl, status, limit);

  // 遍历每个 MR，获取详情和统计
  for (const mr of mrs) {
    if (mr.url) {
      try {
        const details = await getMRDetails(page, mr.url);
        Object.assign(mr, details);
      } catch (error) {
        mr.statsError = error.message;
      }
    }
  }

  return mrs;
}

module.exports = { getMRList, getMRDetails, getMRsWithStats };
