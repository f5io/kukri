import { Head } from 'kukri/head';
import { example_4 } from '../../lib/actions';

function test() {
  return 'foo';
};

function Foo() {
  return (<h1>Foo</h1>);
}

const foo = 'bar/baz';
function Bar() {
  const result = test();
  return (
    <>
      <p>{foo}</p>
      <Foo/>
      <h1>Bar</h1>
    </>
  );
}

export default function Page() {
  const inner_val = 'bar';
  function inner_fn() {
    return (
      <>
        <h1>{inner_val}</h1>
        <h1>{foo}</h1>
      </>
    );
  }
  return (
    <html>
      <Head/>
      <body>
        <section>
          <h1>Page Example 2</h1>
          <p>I like it you see</p>
          <button hx-get={example_4}>Another hoisted example</button>
          <button hx-get={Bar}>A different one</button>
          <button hx-get={inner_fn}>Another different one</button>
        </section>
      </body>
    </html>
  );
}
