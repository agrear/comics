import { configureStore } from '@reduxjs/toolkit';
import { batchDispatchMiddleware } from 'redux-batched-actions';
import createSagaMiddleware from 'redux-saga';

import { appInitialized } from './appSlice';
import rootReducer from "./rootReducer";
import rootSaga from './rootSaga';

export const createStore = () => {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: rootReducer,
    middleware: [
      batchDispatchMiddleware,
      sagaMiddleware
    ]
  });

  sagaMiddleware.run(rootSaga);

  store.dispatch(appInitialized());

  return store;
}

export type RootState = ReturnType<typeof rootReducer>;
