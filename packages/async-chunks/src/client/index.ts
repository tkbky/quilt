import * as React from 'react';
import {func, shape} from 'prop-types';
import {chunkLoader, ChunkState} from './chunkLoader';

type Initializer = () => React.ReactNode;

const ALL_INITIALIZERS: Initializer[] = [];
const READY_INITIALIZERS: Initializer[] = [];

// eslint-disable-next-line camelcase
declare const __webpack_modules__: any;

function isWebpackReady(getModuleIds) {
  // eslint-disable-next-line camelcase
  if (typeof __webpack_modules__ !== 'object') {
    return false;
  }

  return getModuleIds().every(moduleId => {
    return (
      typeof moduleId !== 'undefined' &&
      // eslint-disable-next-line camelcase
      typeof __webpack_modules__[moduleId] !== 'undefined'
    );
  });
}

interface Options {
  loader: Promise<any> | null;
  loading: React.ReactNode | null;
  delay?: number;
  timeout?: number | null;
  modules?: string[];
  render?: (loadedChunk, props) => React.ReactNode;
  webpack?: () => Promise<any>[];
}

function resolve(obj) {
  return obj && obj.__esModule ? obj.default : obj;
}

function render(loaded, props) {
  return React.createElement(resolve(loaded), props);
}

function createLoadableComponent(chunkLoader, options: Options) {
  if (!options.loading) {
    throw new Error('@shopify/async-chunks requires a `loading` component');
  }

  const opts: Options = Object.assign(
    {
      loader: null,
      loading: null,
      delay: 200,
      timeout: null,
      render,
      webpack: null,
      modules: null,
    },
    options,
  );

  let chunk: ChunkState | null = null;

  function init(): Promise<any> {
    if (chunk === null) {
      chunk = chunkLoader(opts.loader);
    }

    return chunk && chunk.promise
      ? chunk.promise
      : Promise.reject(new Error('Async chunk could not be resolved properly'));
  }

  ALL_INITIALIZERS.push(init);

  if (typeof opts.webpack === 'function') {
    READY_INITIALIZERS.push(() => {
      return isWebpackReady(opts.webpack) ? init() : null;
    });
  }

  const contextTypes = {
    loadable: shape({
      report: func.isRequired,
    }),
  };

  return class LoadableComponent extends React.Component {
    static contextTypes = contextTypes;

    static preload() {
      return init();
    }

    chunkState;
    delay;
    timeout;
    mounted = false;

    constructor(props) {
      super(props);
      init();

      this.chunkState = {
        error: chunk && chunk.error,
        pastDelay: false,
        timedOut: false,
        loading: chunk && chunk.loading,
        loaded: chunk && chunk.loadedChunk,
      };
    }

    componentWillMount() {
      this.mounted = true;
      this.loadModule();
    }

    componentWillUnmount() {
      this.mounted = false;
      this._clearTimeouts();
    }

    _clearTimeouts() {
      clearTimeout(this.delay);
      clearTimeout(this.timeout);
    }

    retry = () => {
      this.setState({error: null, loading: true, timedOut: false});
      chunk = chunkLoader(opts.loader);
      this.loadModule();
    };

    render() {
      if (this.chunkState.loading || this.chunkState.error) {
        // TODO: get opts.loading to work in React.createElement
        // const loading = opts.loading ? opts.loading : 'loading';
        return React.createElement('div', {
          isLoading: this.chunkState.loading,
          pastDelay: this.chunkState.pastDelay,
          timedOut: this.chunkState.timedOut,
          error: this.chunkState.error,
          retry: this.retry,
        });
      } else if (this.chunkState.loaded) {
        return opts.render && opts.render(this.chunkState.loaded, this.props);
      } else {
        return null;
      }
    }

    loadModule() {
      if (this.context.loadable && Array.isArray(opts.modules)) {
        opts.modules.forEach(moduleName => {
          this.context.loadable.report(moduleName);
        });
      }

      if (chunk && !chunk.loading) {
        return;
      }

      if (typeof opts.delay === 'number') {
        if (opts.delay === 0) {
          this.setState({pastDelay: true});
        } else {
          this.delay = setTimeout(() => {
            this.setState({pastDelay: true});
          }, opts.delay);
        }
      }

      if (typeof opts.timeout === 'number') {
        this.timeout = setTimeout(() => {
          this.setState({timedOut: true});
        }, opts.timeout);
      }

      const update = () => {
        if (!this.mounted) {
          return;
        }

        this.setState({
          error: chunk && chunk.error,
          loaded: chunk && chunk.loadedChunk,
          loading: chunk && chunk.loading,
        });

        this._clearTimeouts();
      };

      chunk &&
        chunk.promise &&
        chunk.promise
          // eslint-disable-next-line
          .then(() => {
            update();
          })
          .catch(err => {
            update();
            throw err;
          });
    }
  };
}

export interface Props {
  report(moduleName: string): number;
}

// TODO: Move out of client since it's used on the server?
export class Capture extends React.Component<Props, never> {
  static childContextTypes = {
    loadable: shape({
      report: func.isRequired,
    }).isRequired,
  };

  getChildContext() {
    const {report} = this.props;
    return {
      loadable: {
        report,
      },
    };
  }

  render() {
    const {children} = this.props;
    return React.Children.only(children);
  }
}

function flushInitializers(initializers: Initializer[]) {
  const promises: React.ReactNode[] = [];

  while (initializers.length) {
    const init = initializers.pop();
    if (init) {
      promises.push(init());
    }
  }

  return (
    Promise.all(promises)
      // eslint-disable-next-line consistent-return
      .then(() => {
        // eslint-disable-next-line promise/always-return
        if (initializers.length) {
          return flushInitializers(initializers);
        }
      })
      .catch(error => error)
  );
}

export function preloadAll() {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line promise/catch-or-return
    flushInitializers(ALL_INITIALIZERS).then(resolve, reject);
  });
}

export function preloadReady() {
  return new Promise(resolve => {
    // Will always resolve, errors should be handled within loading UIs.
    // eslint-disable-next-line promise/catch-or-return
    flushInitializers(READY_INITIALIZERS).then(resolve, resolve);
  });
}

export default function Loadable(opts) {
  return createLoadableComponent(chunkLoader, opts);
}
