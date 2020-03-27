import {AudioRecorder, AudioUtils} from 'react-native-audio';

export const initialiseAudioRecorder = async (isAuthorisedCb, onProgressCb) => {
  const isAuthorised = await AudioRecorder.requestAuthorization();
  initialise(isAuthorised, isAuthorisedCb, onProgressCb);
};

const initialise = (isAuthorised, isAuthorisedCb, onProgressCb) => {
  isAuthorisedCb(isAuthorised);

  if (!isAuthorised) {
    // TODO: Choose what ot do
    return;
  }

  AudioRecorder.onProgress = onProgressCb;
};

export const prepareRecordingAtPath = path => {
  AudioRecorder.prepareRecordingAtPath(path, {
    SampleRate: 16000,
    AudioQuality: 'Medium',
    Channels: 1,
    AudioEncoding: 'amr_wb',
    // AudioEncodingBitRate: 32000,
  });
};
