/**
 * Gitee 登录脚本
 * 需要在 Playwright 环境中执行
 */

async function giteeLogin(page, username, password) {
  // 导航到登录页面
  await page.goto('https://gitee.com/login');

  // 等待页面加载
  await page.waitForLoadState('networkidle');

  // 填写账号
  await page.fill('#user_login', username);

  // 填写密码（需要触发加密事件）
  await page.evaluate((pwd) => {
    const pwdInput = document.getElementById('user_password');
    pwdInput.value = pwd;
    pwdInput.focus();
    pwdInput.dispatchEvent(new Event('focus', { bubbles: true }));
    pwdInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    pwdInput.dispatchEvent(new Event('input', { bubbles: true }));
    pwdInput.dispatchEvent(new Event('change', { bubbles: true }));
  }, password);

  // 点击登录按钮
  await page.click('.ui.fluid.orange.submit.button.large');

  // 等待跳转
  await page.waitForLoadState('networkidle');

  // 检查是否登录成功
  const currentUrl = page.url();
  return currentUrl !== 'https://gitee.com/login';
}

module.exports = { giteeLogin };
