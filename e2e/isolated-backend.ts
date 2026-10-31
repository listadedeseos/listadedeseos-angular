import { expect, Page } from '@playwright/test';
import { ChildProcess, execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { API } from './helpers';

// Own copy of the backend for specs that write freely or register users (which sends real email):
// throwaway SQLite database seeded by the migrations, mails discarded, no rate limit.
// The front keeps calling :8000 and gets rerouted.
const BACKEND = process.env['E2E_BACKEND_DIR'] ?? resolve(process.cwd(), '../../listadedeseos/listadedeseos-laravel');
const PHP_ARGS = ['-d', 'error_reporting=E_ALL & ~E_DEPRECATED', '-d', 'display_errors=0'];

export const ISOLATED_API = 'http://localhost:8123/api';

let server: ChildProcess;
let tempDir: string;
let database: string;

export async function startBackend() {
  tempDir = mkdtempSync(join(tmpdir(), 'listadedeseos-e2e-'));
  database = join(tempDir, 'e2e.sqlite');
  writeFileSync(database, '');

  const env = {
    ...process.env,
    APP_ENV: 'local',
    DB_CONNECTION: 'sqlite',
    DB_DATABASE: database,
    MAIL_MAILER: 'array',
    TELESCOPE_ENABLED: 'false',
    CACHE_DRIVER: 'array',
  };
  execFileSync('php', [...PHP_ARGS, 'artisan', 'migrate', '--force'], { cwd: BACKEND, env, stdio: 'ignore' });

  const router = join(BACKEND, 'vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php');
  server = spawn('php', [...PHP_ARGS, '-S', 'localhost:8123', router], { cwd: join(BACKEND, 'public'), env, stdio: 'ignore' });

  await expect.poll(() => fetch(`${ISOLATED_API}/isLogged`).then((r) => r.status, () => 0), { timeout: 20_000 }).not.toBe(0);
}

export function stopBackend() {
  server?.kill();
  // the server may still hold the file for a moment on Windows
  rmSync(tempDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
}

export async function useBackend(page: Page) {
  await page.route(`${API}/**`, (route) => route.fallback({ url: route.request().url().replace(API, ISOLATED_API) }));
}

export function securityCode(email: string) {
  const script = `$pdo = new PDO('sqlite:' . $argv[1]);`
    + `$query = $pdo->prepare('select security_code from user where email = ?');`
    + `$query->execute([$argv[2]]); echo $query->fetchColumn();`;
  return execFileSync('php', [...PHP_ARGS, '-r', script, database, email]).toString().trim();
}
