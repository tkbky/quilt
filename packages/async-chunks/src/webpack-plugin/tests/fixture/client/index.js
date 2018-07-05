const App = Loadable({
  loader: () => import(/* webpackChunkName: 'app' */ '../app/index'),
});
