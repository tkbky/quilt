import * as React from 'react';
import {mount, shallow} from 'enzyme';
import {timer} from '@shopify/jest-dom-mocks';

import Key, {ModifierKey} from '../keys';
import Shortcut from '../Shortcut';
import ShortcutProvider from '../ShortcutProvider';

describe('<Shortcut />', () => {
  describe('allowdefault', () => {
    it('works', () => {
      const fooSpy = jest.fn();

      mount(
        <ShortcutProvider>
          <Shortcut key="foo" ordered={['f', 'o', 'o']} onMatch={fooSpy} />
        </ShortcutProvider>,
      );

      keydown('f');
      keydown('o');
      keydown('o');

      expect(fooSpy).toHaveBeenCalled();
    });
  });
});

// describe('<Editor />', () => {
//   describe('id', () => {
//     it('uses a custom value', () => {
//       const id = 'MyEditor';
//       const editor = mount(<Editor id={id} />);
//       expect(editor.find('textarea').prop('id')).toBe(id);
//     });

//     it('uses a default ID when not provided', () => {
//       const editor = mount(<Editor />);
//       expect(typeof editor.find('textarea').prop('id')).toBe('string');
//     });
//   });
// });

// it('calls the matching shortcut immediately if there are no other similar shortcuts', () => {
//   const fooSpy = jest.fn();
//   const barSpy = jest.fn();

//   mount(
//     <ShortcutProvider>
//       <Shortcut key="foo" ordered={['f', 'o', 'o']} onMatch={fooSpy} />
//       <Shortcut key="bar" ordered={['b', 'a', 'r']} onMatch={barSpy} />
//     </ShortcutProvider>,
//   );

//   keydown('f');
//   keydown('o');
//   keydown('o');

//   expect(fooSpy).toHaveBeenCalled();
// });

function keydown(key: Key | ModifierKey, target = document, eventSpies = {}) {
  let event = new KeyboardEvent('keydown', {
    key,
  });

  if (Object.getOwnPropertyNames(eventSpies).length !== 0) {
    event = Object.assign(event, eventSpies);
  }

  target.dispatchEvent(event);
}
