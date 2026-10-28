import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';

// Load .env.local into process.env for test runners
try {
  const envPath = path.resolve(__dirname, '../../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          const val = values.join('=').replace(/^["']|["']$/g, '');
          process.env[key.trim()] = val;
        }
      }
    });
  }
} catch (e) {
  // Ignore in CI if environment variables are provided directly
}
