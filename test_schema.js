import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const fileContent = fs.readFileSync('src/supabase.js', 'utf8');
const urlMatch = fileContent.match(/supabaseUrl\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = fileContent.match(/supabaseKey\s*=\s*['"]([^'"]+)['"]/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  
  async function test() {
    const { data: cols, error: colsErr } = await supabase
      .from('produtos')
      .select('*')
      .limit(1);
      
    if (colsErr) {
      console.log('Error fetching produtos:', colsErr.message);
    } else {
      console.log('Columns in produtos:', Object.keys(cols[0] || {}));
    }
  }
  
  test();
} else {
  console.log('Credentials not found');
}
