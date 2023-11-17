import { Head } from 'kukri/head';
import { example_4 } from '../../lib/actions';

export default function Page() {
  return (
    <html>
      <Head/>
      <body>
        <section>
          <h1>Page 2</h1>
          <button hx-get={example_4}>Another hoisted example</button>
        </section>
      </body>
    </html>
  );
}
