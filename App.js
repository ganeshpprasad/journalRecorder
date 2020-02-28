import React from 'react';
// github.com/jsierles/react-native-audio/blob/master/AudioExample/AudioExample.js
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import ErrorBoundry from './src/screens/ErrorBoundry';
import Buttons from './src/screens/Buttons';
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
  state = {
    hasPermission: false,
  };

  // renderPauseButton() {}

  render() {
    const {recordingState} = this.state;
    console.log('rec', recordingState);

    return (
      <Provider store={store}>
        <ErrorBoundry>
          <Buttons />
        </ErrorBoundry>
      </Provider>
    );
  }
}

export default MeetingRoom;
