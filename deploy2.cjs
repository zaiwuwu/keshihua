const surgeSDK = require('surge-sdk');
const fs = require('fs');
const path = require('path');

const endpoint = 'https://surge.surge.sh';
const email = 'zhaoyiyong2021@163.com';
const password = 'zhyiyo123';

const sdk = surgeSDK({ endpoint });

// Step 1: Get token
sdk.token({ user: email, pass: password }, (err, result) => {
  if (err) {
    console.error('Token error:', JSON.stringify(err));
    process.exit(1);
    return;
  }
  console.log('Token obtained:', result.pass.substring(0, 10) + '...');

  // Step 2: Save to .netrc
  const home = process.env.USERPROFILE || process.env.HOME;
  const netrcPath = path.join(home, '.netrc');
  const host = 'surge.surge.sh';

  // Check existing netrc
  let netrc = {};
  try {
    const content = fs.readFileSync(netrcPath, 'utf8');
    // parse it roughly
    const lines = content.split('\n');
    let currentMachine = null;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('machine ')) {
        currentMachine = trimmed.replace('machine ', '').trim();
        netrc[currentMachine] = {};
      } else if (currentMachine && trimmed.startsWith('login ')) {
        netrc[currentMachine].login = trimmed.replace('login ', '').trim();
      } else if (currentMachine && trimmed.startsWith('password ')) {
        netrc[currentMachine].password = trimmed.replace('password ', '').trim();
      }
    }
  } catch(e) {
    // no netrc
  }

  netrc[host] = { login: email, password: result.pass };

  // Write netrc
  let output = '';
  for (const [m, creds] of Object.entries(netrc)) {
    output += `machine ${m}\n  login ${creds.login}\n  password ${creds.password}\n`;
  }
  fs.writeFileSync(netrcPath, output);
  console.log('Saved credentials to .netrc');

  // Step 3: Now publish using the node script
  console.log('Deploying...');
  const deployScript = require('child_process').spawn(
    process.execPath,
    ['-e', `
      const surge = require('./node_modules/surge');
      const s = surge();
      const netrc = require('netrc');
      const creds = netrc();

      // Build the request object like CLI does
      const req = {
        argv: {},
        configuration: { terminal: false, output: process.stdout, input: process.stdin },
        endpoint: require('url-parse-as-address')('https://surge.surge.sh'),
        creds: { email: '${email}', token: '${result.pass}' }
      };

      // Run middleware chain
      const middle = [
        require('./node_modules/surge/lib/middleware/_shared/_whitelist'),
        require('./node_modules/surge/lib/middleware/_shared/_endpoint'),
        require('./node_modules/surge/lib/middleware/_shared/_pkg'),
        require('./node_modules/surge/lib/middleware/_shared/_version'),
        require('./node_modules/surge/lib/middleware/_shared/_welcome'),
        require('./node_modules/surge/lib/middleware/_shared/_project'),
        require('./node_modules/surge/lib/middleware/_shared/_size'),
        require('./node_modules/surge/lib/middleware/_shared/_domain'),
        require('./node_modules/surge/lib/middleware/_shared/_protocol'),
        require('./node_modules/surge/lib/middleware/_shared/_subscription'),
        require('./node_modules/surge/lib/middleware/deploy')
      ];

      const helpers = require('./node_modules/surge/lib/util/helpers');
      req.project = 'dist';
      req.domain = 'jiushun-app.surge.sh';

      function runMiddleware(i) {
        if (i >= middle.length) {
          console.log('Deploy complete!');
          return;
        }
        middle[i](req, () => runMiddleware(i + 1));
      }

      runMiddleware(0);
    `],
    { cwd: 'D:\\桌面\\报价单可视化app', stdio: 'inherit' }
  );

  deployScript.on('exit', (code) => {
    console.log('Deploy script exited with code:', code);
  });
});
