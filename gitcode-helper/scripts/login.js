/**
 * GitCode 登录脚本
 * 需要在 Playwright MCP 环境中执行
 *
 * GitCode 使用 CSDN 统一登录系统
 */

async function gitcodeLogin(page, username, password) {
  // 导航到登录页面
  await page.goto('https://gitcode.net/users/sign_in');

  // 等待页面加载完成
  await page.waitForLoadState('networkidle');

  // 等待登录表单出现
  await page.waitForSelector('input[placeholder*="账号"]', { timeout: 10000 }).catch(() => {
    // 如果找不到，尝试其他选择器
    return page.waitForSelector('.login-form input', { timeout: 5000 });
  });

  // 填写账号（尝试多种可能的选择器）
  const usernameSelectors = [
    'input[placeholder*="账号"]',
    'input[placeholder*="手机"]',
    'input[placeholder*="邮箱"]',
    'input[name="username"]',
    'input[type="text"]',
    '#all',
    '.username-input'
  ];

  let usernameFilled = false;
  for (const selector of usernameSelectors) {
    try {
      await page.fill(selector, username, { timeout: 2000 });
      usernameFilled = true;
      break;
    } catch (e) {
      // 继续尝试下一个选择器
    }
  }

  if (!usernameFilled) {
    throw new Error('无法找到账号输入框，请检查页面结构');
  }

  // 等待一下确保账号填写完成
  await page.waitForTimeout(500);

  // 填写密码（尝试多种可能的选择器）
  const passwordSelectors = [
    'input[placeholder*="密码"]',
    'input[type="password"]',
    'input[name="password"]',
    '.password-input'
  ];

  let passwordFilled = false;
  for (const selector of passwordSelectors) {
    try {
      const input = await page.$(selector);
      if (input) {
        // 使用 JavaScript 直接设置值并触发事件
        await page.evaluate((el, pwd) => {
          el.value = pwd;
          el.focus();
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, input, password);
        passwordFilled = true;
        break;
      }
    } catch (e) {
      // 继续尝试下一个选择器
    }
  }

  if (!passwordFilled) {
    throw new Error('无法找到密码输入框，请检查页面结构');
  }

  // 等待一下确保密码填写完成
  await page.waitForTimeout(500);

  // 查找并点击登录按钮
  const loginButtonSelectors = [
    'button[type="submit"]',
    '.login-btn',
    '.submit-btn',
    'button:has-text("登录")',
    'button:has-text("登 录")',
    'input[type="submit"]'
  ];

  let loginClicked = false;
  for (const selector of loginButtonSelectors) {
    try {
      await page.click(selector, { timeout: 2000 });
      loginClicked = true;
      break;
    } catch (e) {
      // 继续尝试下一个选择器
    }
  }

  if (!loginClicked) {
    throw new Error('无法找到登录按钮，请检查页面结构');
  }

  // 等待跳转或页面响应
  await page.waitForTimeout(2000);

  // 检查是否需要验证码
  const captchaPresent = await page.evaluate(() => {
    // 检查常见的验证码元素
    const captchaSelectors = [
      '.captcha',
      '#captcha',
      '.verify-code',
      '[class*="captcha"]',
      '[class*="verify"]'
    ];
    return captchaSelectors.some(sel => document.querySelector(sel));
  });

  if (captchaPresent) {
    throw new Error('检测到验证码，需要手动处理。请考虑使用更稳定的登录方式（如 Cookie/Token）');
  }

  // 等待页面稳定
  await page.waitForLoadState('networkidle').catch(() => {});

  // 检查是否登录成功
  const currentUrl = page.url();

  // 登录成功的标志：
  // 1. URL 不再是登录页面
  // 2. 或者 URL 包含用户相关路径
  // 3. 或页面出现用户信息元素
  const isLoggedIn = await page.evaluate(() => {
    // 检查是否有用户头像、用户名等登录后才会出现的元素
    const userIndicators = [
      '.user-avatar',
      '.user-info',
      '[class*="user-menu"]',
      '.header-user'
    ];
    return userIndicators.some(sel => document.querySelector(sel));
  });

  return isLoggedIn || !currentUrl.includes('sign_in');
}

module.exports = { gitcodeLogin };
