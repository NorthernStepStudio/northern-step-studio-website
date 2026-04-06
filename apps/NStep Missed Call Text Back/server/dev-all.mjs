import { spawn } from 'node:child_process';

const gateway =
  process.platform === 'win32'
    ? spawn('cmd.exe', ['/d', '/s', '/c', 'npm run gateway:dev'], {
        stdio: 'inherit',
        shell: false,
      })
    : spawn('npm', ['run', 'gateway:dev'], {
        stdio: 'inherit',
        shell: false,
      });

const app =
  process.platform === 'win32'
    ? spawn('cmd.exe', ['/d', '/s', '/c', 'npm run dev'], {
        stdio: 'inherit',
        shell: false,
      })
    : spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: false,
      });

function forward(signal) {
  gateway.kill(signal);
  app.kill(signal);
}

process.on('SIGINT', () => forward('SIGINT'));
process.on('SIGTERM', () => forward('SIGTERM'));

gateway.on('exit', (code) => {
  if (code && code !== 0) {
    process.exit(code);
  }
});

app.on('exit', (code) => {
  if (code && code !== 0) {
    process.exit(code);
  }
});
