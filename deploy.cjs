const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const EMAIL = 'zhaoyiyong2021@163.com';
const PASSWORD = 'zhyiyo123';
const DOMAIN = 'jiushun-app.surge.sh';
const PROJECT = path.resolve(__dirname, 'dist');

// 通过 surge-sdk 获取 token，然后用 SURGE_TOKEN 环境变量部署
function deploy() {
  console.log('Getting token...');
  const surgeSDK = require('surge-sdk');
  const sdk = surgeSDK({ endpoint: 'https://surge.surge.sh' });

  sdk.token({ user: EMAIL, pass: PASSWORD }, (err, result) => {
    if (err) {
      console.error('Login failed:', err.message || JSON.stringify(err));
      process.exit(1);
      return;
    }
    const token = result.pass;
    console.log('Token obtained, deploying...');

    // 在子进程中用 SURGE_TOKEN 环境变量运行 surge CLI
    const surgePath = path.resolve(__dirname, 'node_modules', '.bin', 'surge');
    try {
      const output = execSync(
        `"${surgePath}" --project "${PROJECT}" --domain ${DOMAIN}`,
        { env: { ...process.env, SURGE_TOKEN: token }, stdio: 'inherit' }
      );
    } catch (e) {
      // surge exits non-zero even on success sometimes
      if (e.status !== 0) {
        console.error('Deploy failed:', e.message);
        process.exit(1);
      }
    }
  });
}

deploy();
