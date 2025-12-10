import 'dotenv/config';
import app from './app.js';

const port = Number(process.env.PORT || 4000);

app.listen(port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});
