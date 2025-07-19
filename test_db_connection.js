// Simple test to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sncziafbwxgjkvymkolp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuY3ppYWZid3hnamt2eW1rb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNTMyNTksImV4cCI6MjA2NjgyOTI1OX0.r8xYuUWST0Hx6ifGLuFLgxj0GlvMSY3MGgrf90u5x5o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Connection error:', error);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log('Sample data:', data);
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err);
    return false;
  }
}

testConnection();