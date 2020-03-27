import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

// components
import ErrorBoundry from './src/screens/ErrorBoundry';
import Recorder from './src/screens/Recorder';
import RecordsList from './src/screens/RecordsList';

// main reducer
import audioListReducer from './src/reducers';

const store = createStore(audioListReducer);

if (!__DEV__) {
  console.ignoredYellowBox = true;
}

class MeetingRoom extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <ErrorBoundry>
          <Recorder />
          <RecordsList />
        </ErrorBoundry>
      </Provider>
    );
  }
}

export default MeetingRoom;
