import { Head } from 'kukri/head';
import type { Props } from 'kukri';
import { example_4 } from '../lib/actions';

const foo = 'bar';

async function DelayedChild({ time, children }: Props<{ time: number }>) {
  console.log('before time', time, 'ms');
  await new Promise(resolve => setTimeout(resolve, time));
  console.log('after time', time, 'ms');
  return (
    <div>
      <h1>I was delayed by {time}ms</h1>
      {children}
    </div>
  );
}

function example_2() {
  return (<h1>Example 2</h1>);
}

function example_7(arg: string) {
  return (<h1>Example 7 {arg}</h1>);
}

function Child({ slug, children }: Props<{ slug: string; }>) {
  async function example_slug() {
    return (<h1>Example 1{slug}</h1>);
  }

  async function example_1() {
    return (<h1>Example 1 overwrite in different scope {slug}</h1>);
  }

  return (
    <div>
      <button hx-get={example_slug}>{children}</button>
      <button hx-get={example_1}>Click me (Example 1 diff scope)</button>
    </div>
  );
}

export default function Page() {
  const variable = 'foo bar baz';
  const test_2 = '/a/b/c';
  async function example_1() {
    return (<h1>Example 1{variable}</h1>);
  }

  function example_3(eek: string) {
    return (<h1>Example 3 {eek}</h1>);
  }

  const example_5 = () => {
    return (<h1>Example 5</h1>);
  }

  const example_6 = () => {
    return (<h1>Example 6 {test_2}</h1>);
  };

  const ex_7 = example_7.bind(null, 'eek');

  const { example_8, example_9: rebound_9, example_10 } = {
    example_8: () => (<h1>Example 8</h1>),
    example_9: example_7.bind(null, 'foo'),
    example_10: () => (<h1>Example 10 {test_2}</h1>),
  }

  const example_11 = () => (<h1>Example 11</h1>);

  const example_12 = () => (<h1>Example 12</h1>);
  const example_13 = () => (<h1>Example 13</h1>);

  return (
    <html>
      <Head/>
      <body>
        <section>
          <button hx-get={example_1}>Click me (Example 1)!</button>
          <button hx-get={example_1}>Click me (Example 1 again)!</button>
          <button hx-get={example_2}>Click me (Example 2)!</button>
          <button hx-vals={`{"a":1,"b":"two"}`} hx-get={example_3.bind(null, 'beam')}>Click me (Example 3)</button>
          <button hx-get={example_3.bind(null, 'boom')}>Click me (Example 3 with a different bind)</button>
          <button hx-get={example_4}>Click me (Example 4)</button>
          <button hx-get={example_5}>Click me (Example 5)</button>
          <button hx-get={example_6}>Click me (Example 6)</button>
          <button hx-get={example_6}>Click me (Example 6 again)</button>
          <button hx-get={ex_7}>Click me (Example 7)</button>
          <button hx-get={example_8}>Click me (Example 8)</button>
          <button hx-get={rebound_9}>Click me (Example 9)</button>
          <button hx-get={example_10}>Click me (Example 10)</button>
          <button hx-get={example_11}>Click me (Example 11)</button>
          <button hx-get={example_11}>Click me (Example 11 again)</button>
          <button hx-get={example_12}>Click me (Example 12)</button>
          <button hx-get={example_13}>Click me (Example 13)</button>
          <button hx-get={() => <h1>Arrow Example</h1>}>Click me (Arrow Example)</button>
          <button hx-get={() => <h1>Arrow Example {variable}</h1>}>Click me (Arrow Example with closure)</button>
          <button hx-get={function() { return <h1>Function Example {variable}</h1> }}>Click me (Function Example with closure)</button>
          <button hx-get={test_2}>This one is just a string</button>
          <Child slug="foo">Click me for a slug example of foo</Child>
          <Child slug="bar">Click me for a slug example of bar</Child>
        </section>
      </body>
    </html>
  );
}
