import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import ErrorBoundry from '../screens/ErrorBoundry';

import audioListReducer from './reducers';

const store = createStore(audioListReducer);

export const withProvider = Comp => props => (
    <Provider store={store}>
        <ErrorBoundry>
            <Comp {...props} />
        </ErrorBoundry>
    </Provider>
);

export default withProvider;
