import dedent from 'dedent';
import { jsx } from './jsx-runtime.js';
import type { Props } from './types';

export const boundary_text = ' suspense boundary ';

const suspense_ext = `
  (() => {
    const BOUNDARY_TEXT = '${boundary_text}';
    const BOUNDARY = '<!--' + BOUNDARY_TEXT + '-->';

    htmx.defineExtension('suspense', {
      name: 'suspense',
      init(api) {
        function handle_swap(el) {
          if (el.parentNode != null) {
            el.parentNode.removeChild(el);
          }

          if (el.nodeType === 3) {
            console.log('received a text node only');
            return false;
          }

          const response = el.innerHTML;
          const swapSpec = api.getSwapSpecification(el);
          const target = api.getTarget(el);

          if (target == null) {
            console.log('suspense target not found');
            return false;
          }

          const settleInfo = api.makeSettleInfo(el);

          api.selectAndSwap(swapSpec.swapStyle, target, el, response, settleInfo)
          api.settleImmediately(settleInfo.tasks)
          return true;
        }

        const observer = new MutationObserver(function handle_suspense(list) {
          for (const item of list) {
            const el = item.addedNodes.item(0);
            if (el == null) continue;
            if (
              el.nodeType === 1
              && el.hasAttribute('hx-suspense')
            ) {
              handle_swap(el);
            } else if (
              el.nodeType === 8
              && el.data === BOUNDARY_TEXT
            ) {
              el.parentNode.removeChild(el);
            }
          }
        });

        requestAnimationFrame(() => {
          const el = document.querySelector('[hx-error]');
          if (el != null) {
            handle_swap(el);
          } else {
            const boundary = document.childNodes[1];
            if (
              boundary != null
              && boundary.nodeType === 8
              && boundary.data === BOUNDARY_TEXT
            ) {
              htmx.process(document.body);
            }

            for (const el of document.querySelectorAll('[hx-suspense]')) {
              handle_swap(el);
            }

            observer.observe(document.body, { childList: true });
            htmx.onLoad(() => observer.disconnect());

            document.body.addEventListener('htmx:beforeRequest', (event) => {
              // make sure this element is extended with suspense
              let is_suspense = false;
              api.withExtensions(event.detail.elt, ext => {
                if (!is_suspense) is_suspense = ext.name === 'suspense';
              });
              if (!is_suspense) return;

              const xhr = event.detail.xhr;
              const call_original = (() => {
                let called = false;
                const original = xhr.onload;
                return () => {
                  if (!called) {
                    original();
                    called = true;
                  }
                }
              })();

              let suspense_response = false;
              let seen = 0;
              let buffer = '';
              let first_boundary_index = 0;

              xhr.onload = () => {
                call_original();

                let to_handle = buffer;
                if (to_handle.length === 0) {
                  to_handle = xhr.response.slice(first_boundary_index);
                }

                if (to_handle.length === 0) return;

                for (const item of to_handle.split(BOUNDARY)) {
                  // makeFragment returns a body, we need the actual element
                  const el = api.makeFragment(item).firstChild;
                  handle_swap(el);
                }
              };

              xhr.onprogress = () => {
                const data = xhr.response.substr(seen);
                buffer += data;
                seen = xhr.responseText.length;

                if (buffer.includes(BOUNDARY)) {
                  if (suspense_response === false) {
                    suspense_response = true;
                    first_boundary_index = buffer.indexOf(BOUNDARY) + BOUNDARY.length;
                    buffer = buffer.slice(first_boundary_index);
                    call_original();
                  } else {
                    const item = buffer.slice(0, buffer.indexOf(BOUNDARY));
                    buffer = buffer.slice(buffer.indexOf(BOUNDARY) + BOUNDARY.length);

                    // makeFragment returns a body, we need the actual element
                    const el = api.makeFragment(item).firstChild;
                    handle_swap(el);
                  }
                }
              };

            });
          }
        });
      },
      transformResponse(response, xhr, el) {
        if (xhr != null && response.includes(BOUNDARY)) {
          // if the suspense boundary is hit, we're in an early onload
          // and should chop the response text up until the first
          // boundary...
          return response.substr(0, response.indexOf(BOUNDARY));
        }
        return response;
      }
    });
  })();
`;

export function Head({ children }: Props) {
  const child_props = Array().concat(children);
  return jsx('head', {
    children: [
      jsx('script', {
        src: 'https://unpkg.com/htmx.org@1.9.8'
      }),
      jsx('script', {
        type: 'text/javascript',
        children: dedent(suspense_ext),
      }),
      ...child_props,
    ]
  });
}
