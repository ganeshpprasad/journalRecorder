import React from 'react';
// github.com/jsierles/react-native-audio/blob/master/AudioExample/AudioExample.js
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import ErrorBoundry from './src/screens/ErrorBoundry';
import Recorder from './src/screens/Recorder';
import RecordsList from './src/screens/RecordsList';
import {ADD_RECORD} from './src/actions/addAudio';

const audioListReducer = (state, {type, payload}) => {
  switch (type) {
    case ADD_RECORD:
      console.log('add record', state);

      const newList = [...state.audioFileNames, payload];
      return Object.assign({}, state, {audioFileNames: newList});
    default:
      return {
        audioFileNames: [],
      };
  }
};

const store = createStore(audioListReducer);

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
