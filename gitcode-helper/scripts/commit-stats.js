/**
 * GitCode 提交统计查询脚本
 * 需要在 Playwright MCP 环境中执行
 *
 * GitCode 基于 GitLab 架构，页面结构与 Gitee 不同
 */

/**
 * 获取提交统计信息
 * @param {Page} page - Playwright 页面对象
 * @param {string} commitUrl - 提交页面 URL
 * @returns {object} 统计信息对象
 */
async function getCommitStats(page, commitUrl) {
  // 导航到提交页面
  await page.goto(commitUrl);
  await page.waitForLoadState('networkidle');

  // 获取统计信息
  const stats = await page.evaluate(() => {
    // GitCode/GitLab 风格的选择器
    const selectors = {
      // 方法1: 查找差异统计文本（如 "1个文件，3行新增，2行删除"）
      diffStats: [
        '.diff-stats',
        '.commit-stats',
        '[data-testid="commit-stats"]',
        '.file-stats'
      ],
      // 方法2: 分别获取新增和删除行数
      additions: [
        '.text-green',
        '.additions',
        '[data-section="additions"]'
      ],
      deletions: [
        '.text-red',
        '.deletions',
        '[data-section="deletions"]'
      ]
    };

    let statsText = '';
    let fileCount = 0;
    let additions = 0;
    let deletions = 0;

    // 尝试获取完整统计文本
    for (const selector of selectors.diffStats) {
      const element = document.querySelector(selector);
      if (element) {
        statsText = element.textContent.trim();
        break;
      }
    }

    // 如果没找到完整统计，尝试解析页面
    if (!statsText) {
      // 查找文件数量
      const fileCountText = document.querySelector('.files-list')?.getAttribute('data-count') || '0';
      fileCount = parseInt(fileCountText) || 0;

      // 查找新增行数
      for (const selector of selectors.additions) {
        const element = document.querySelector(selector);
        if (element) {
          const match = element.textContent.match(/(\d+)/);
          if (match) {
            additions = parseInt(match[1]);
            break;
          }
        }
      }

      // 查找删除行数
      for (const selector of selectors.deletions) {
        const element = document.querySelector(selector);
        if (element) {
          const match = element.textContent.match(/(\d+)/);
          if (match) {
            deletions = parseInt(match[1]);
            break;
          }
        }
      }

      // 尝试从 diff 文件列表中统计
      if (fileCount === 0) {
        const fileRows = document.querySelectorAll('.file-row, .diff-file');
        fileCount = fileRows.length;
      }
    }

    return {
      raw: statsText,
      fileCount,
      additions,
      deletions
    };
  });

  // 如果获取到了原始文本，尝试解析
  if (stats.raw) {
    const parsed = parseStats(stats.raw);
    return {
      ...parsed,
      raw: stats.raw
    };
  }

  // 否则返回从页面元素获取的数据
  return {
    fileCount: stats.fileCount || 0,
    additions: stats.additions || 0,
    deletions: stats.deletions || 0,
    total: (stats.additions || 0) + (stats.deletions || 0),
    raw: stats.raw || `${stats.fileCount} 个文件，+${stats.additions} -${stats.deletions}`
  };
}

/**
 * 解析统计文本
 * @param {string} statsText - 统计文本
 * @returns {object} 解析后的统计对象
 */
function parseStats(statsText) {
  let fileCount = 0;
  let additions = 0;
  let deletions = 0;

  // 匹配文件数量
  const fileMatch = statsText.match(/(\d+)\s*(个文件|files|file)/i);
  if (fileMatch) {
    fileCount = parseInt(fileMatch[1]);
  }

  // 匹配新增行数
  const addMatch = statsText.match(/\+(\d+)/);
  if (addMatch) {
    additions = parseInt(addMatch[1]);
  }

  // 匹配删除行数
  const delMatch = statsText.match(/-(\d+)/);
  if (delMatch) {
    deletions = parseInt(delMatch[1]);
  }

  // 尝试其他格式的匹配（GitLab 风格）
  if (!additions && !deletions) {
    const linesMatch = statsText.match(/(\d+)\s*新增[,\s]*(\d+)\s*删除/);
    if (linesMatch) {
      additions = parseInt(linesMatch[1]);
      deletions = parseInt(linesMatch[2]);
    }
  }

  return {
    fileCount,
    additions,
    deletions,
    total: additions + deletions,
    raw: statsText
  };
}

/**
 * 格式化统计信息为可读文本
 * @param {object} stats - 统计对象
 * @returns {string} 格式化后的文本
 */
function formatStats(stats) {
  if (stats.raw) {
    return stats.raw;
  }
  return `${stats.fileCount} 个文件发生了变化，影响行数： +${stats.additions} -${stats.deletions}`;
}

module.exports = { getCommitStats, parseStats, formatStats };
