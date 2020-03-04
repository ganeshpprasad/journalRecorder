import React from 'react';
// github.com/jsierles/react-native-audio/blob/master/AudioExample/AudioExample.js
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import ErrorBoundry from './src/screens/ErrorBoundry';
import Recorder from './src/screens/Recorder';
import {ADD_RECORD} from './src/actions/addAudio';

const audioListReducer = (state, {type, payload}) => {
  switch (type) {
    case ADD_RECORD:
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
          {/* List */}
        </ErrorBoundry>
      </Provider>
    );
  }
}

export default MeetingRoom;
