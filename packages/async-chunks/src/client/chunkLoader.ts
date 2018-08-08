export interface ChunkState {
  loading: boolean;
  promise: Promise<any> | null;
  loadedChunk: React.ReactNode | null;
  error: Error | null;
}

// TODO: refactor to async/await
export function chunkLoader(chunkLoader): ChunkState {
  const state: ChunkState = {
    loading: true,
    loadedChunk: null,
    promise: null,
    error: null,
  };

  state.promise = chunkLoader()
    .then(chunk => {
      state.loading = false;
      state.loadedChunk = chunk;
      return chunk;
    })
    .catch(err => {
      state.loading = false;
      state.error = err;
      throw err;
    });

  return state;
}
