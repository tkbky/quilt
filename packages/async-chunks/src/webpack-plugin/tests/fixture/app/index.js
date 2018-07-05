module.exports = function() {
  const asyncFoo = import(/* webpackChunkName: 'asyncFoo' */ './foo');
  return `I need ${asyncFoo.default}`;
};
