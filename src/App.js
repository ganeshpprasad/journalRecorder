import React from 'react';
import { Navigation } from 'react-native-navigation';

// screens
import { RECORDING, AUDIO } from './screens/constants';

import Recorder from './screens/Recorder';
import RecordsList from './screens/RecordsList';
import withProvider from './store';

const screens = new Map();
screens.set(RECORDING, Recorder);
screens.set(AUDIO, RecordsList);

screens.forEach((screen, name) => {
  Navigation.registerComponent(name, () => withProvider(screen));
});

const App = () => {
  Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: RECORDING,
            },
          },
        ],
        options: {},
      },
    },
  });
};

export default App;
