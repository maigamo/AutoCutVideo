/**
 * Instagram 下载功能测试脚本
 * 
 * 使用方法:
 * node test-instagram-download.js
 */

const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('开始测试 Instagram 下载功能...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 90000
  });
  
  const context = await browser.newContext({
    acceptDownloads: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  
  const page = await context.newPage();

  try {
    // 1. 打开站点
    console.log('步骤 1: 访问 instasave.to...');
    await page.goto('https://instasave.to/', { waitUntil: 'networkidle', timeout: 90000 });
    console.log('✓ 页面加载成功\n');

    // 2. 粘贴 Instagram 链接
    console.log('步骤 2: 输入 Instagram 视频链接...');
    const url = 'https://www.instagram.com/reel/DQo4zTUjMQg/?igsh=N2U3Y2s5eTN5MWxm';
    await page.fill('input#s_input[name="q"]', url);
    console.log('✓ 链接已输入\n');

    // 3. 点击 Download 按钮
    console.log('步骤 3: 点击下载按钮...');
    await page.click('button[onclick*="ksearchvideo"]');
    console.log('✓ 下载按钮已点击\n');

    // 4. 等待"Download Video"按钮出现并点击
    console.log('步骤 4: 等待下载链接生成...');
    const downBtn = await page.waitForSelector('a.abutton.is-success.is-fullwidth:has-text("Download Video")', {
      timeout: 30000,
    });
    console.log('✓ 下载链接已生成\n');
    
    console.log('步骤 5: 开始下载视频...');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      downBtn.click(),
    ]);
    console.log('✓ 下载已开始\n');
    
    // 保存文件 (可选)
    // const savePath = path.join(__dirname, 'test_instagram_download.mp4');
    // await download.saveAs(savePath);
    // console.log(`✓ 视频已保存到: ${savePath}\n`);
    
    console.log('✅ Instagram 下载功能测试通过!\n');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    await context.close();
    await browser.close();
    console.log('\n浏览器已关闭');
  }
})();

