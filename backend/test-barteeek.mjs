import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically import the compiled module
const { fetchCharacter } = await import(join(__dirname, '.next', 'server', 'lib', 'tibiadata.js'));

console.log('Testing fetchCharacter for Barteeek...');

try {
  const result = await fetchCharacter('Barteeek');
  console.log('Character fetched:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}
