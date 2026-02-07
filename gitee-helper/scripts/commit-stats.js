/**
 * Gitee 提交统计查询脚本
 * 需要在 Playwright 环境中执行
 */

/**
 * 获取提交统计信息
 * @param {Page} page - Playwright 页面对象
 * @param {string} commitUrl - 提交页面 URL
 * @returns {string} 统计信息文本
 */
async function getCommitStats(page, commitUrl) {
  // 导航到提交页面
  await page.goto(commitUrl);
  await page.waitForLoadState('networkidle');

  // 使用 XPath 获取统计元素
  const statsText = await page.evaluate(() => {
    const xpath = '//*[@id="commit-show"]/div/div[5]/div/div[2]';
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    const element = result.singleNodeValue;
    return element ? element.textContent.trim() : '未找到统计信息';
  });

  return statsText;
}

/**
 * 解析统计信息
 * @param {string} statsText - 统计文本
 * @returns {object} 解析后的统计对象
 */
function parseStats(statsText) {
  const fileMatch = statsText.match(/(\d+)\s*个文件/);
  const addMatch = statsText.match(/\+(\d+)/);
  const delMatch = statsText.match(/-(\d+)/);

  return {
    fileCount: fileMatch ? parseInt(fileMatch[1]) : 0,
    additions: addMatch ? parseInt(addMatch[1]) : 0,
    deletions: delMatch ? parseInt(delMatch[1]) : 0,
    total: (addMatch ? parseInt(addMatch[1]) : 0) + (delMatch ? parseInt(delMatch[1]) : 0),
    raw: statsText
  };
}

module.exports = { getCommitStats, parseStats };
