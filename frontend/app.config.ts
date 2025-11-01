import 'dotenv/config';

export default {
  expo: {
    name: 'PHYSQ',
    slug: 'physq',
    scheme: 'physq',
    platforms: ['ios', 'android', 'web'],
    orientation: 'portrait',
    backgroundColor: '#000000',
    userInterfaceStyle: 'dark',
    web: {
      bundler: 'metro'
    },
    extra: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    }
  }
};
