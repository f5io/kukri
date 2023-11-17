import type { Props } from 'kukri';

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

export default function Page(request) {
  const bar: string = 'bar';
  const foo = () => {
    return bar;
  };

  const action = () => {
    const b = bar;
    const result = foo();
    console.log(request);
    const eek = 'eek'
    return (<h1>{result}+{eek}</h1>);
  }
  return (
    <main>
      <button hx-get={action}>Test me</button>
      <DelayedChild time={3000}/>
      <DelayedChild time={4500}/>
    </main>
  );
}
