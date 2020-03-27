import {AudioUtils} from 'react-native-audio';

const AUDIO_BASE = AudioUtils.DocumentDirectoryPath;

export const getFileName = () => {
  // TODO: Move this to helper
  const date = new Date();
  const date_folder = date
    .toDateString()
    .split(' ')
    .join('_');
  const time_file = new Date()
    .toLocaleTimeString()
    .split(':')
    .join('_');

  // check for duplicates and all

  return {
    location: AUDIO_BASE + '/' + date_folder + '/' + time_file + '.amr',
    fileName: time_file,
  };
};
