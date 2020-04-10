import { Navigation } from 'react-native-navigation';

import { withProvider } from './store';

import Recorder from './screens/Recorder';
import RecordsList from './screens/RecordsList';
import Save from './screens/Save';
import AudioItem from './screens/AudioItem';
import { RECORDING, SAVE, AUDIOITEM } from './screens/constants';

const screens = new Map();
screens.set(RECORDING, Recorder);
screens.set(SAVE, Save);
screens.set(AUDIOITEM, AudioItem);

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
                            options: {
                                topBar: {
                                    height: 0,
                                },
                            },
                        },
                    },
                ],
            },
        },
    });
};

export default App;
