import React from 'react';
import { Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import { withProvider } from './store';

import Recorder from './screens/Recorder';
import RecordsList from './screens/RecordsList';
import { RECORDING, AUDIO } from './screens/constants';

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
      },
    },
  });
};

export default App;
