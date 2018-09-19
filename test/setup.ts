import './console-wrapper';
import 'isomorphic-fetch';
import Enzyme from 'enzyme';

// eslint-disable-next-line import/default
import Adapter from './vendor/adapter';

if (Intl.PluralRules == null) {
  require('intl-pluralrules');
}

Enzyme.configure({adapter: new Adapter()});
