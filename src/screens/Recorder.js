import React, {Component} from 'react';
import {connect} from 'react-redux';
import Sound from 'react-native-sound';
import {AudioRecorder} from 'react-native-audio';
import {StyleSheet, Text, View, Animated} from 'react-native';

import {audioListAction} from '../actions/addAudio';
import {
  initialiseAudioRecorder,
  prepareRecordingAtPath,
} from '../helpers/soundRecorder';

import {Button} from '../components/Button';
import {getFileName} from '../helpers/filename';

const IDLE = 'idle';
// const PLAYING = 'play';
const PAUSED = 'pause';
const RECORD = 'record';

export class Buttons extends Component {
  state = {
    recordingState: IDLE,
    isAuthorised: false,
    currentTime: 0,
    location: null,
    finished: false,
    fileName: null,
    show: new Animated.Value(0),
  };

  constructor(props) {
    super(props);
    this.onProgress = this.onProgress.bind(this);
    this.setAuthorisedState = this.setAuthorisedState.bind(this);
  }

  onProgress(data) {
    this.setState({
      currentTime: Math.floor(data.currentTime),
    });
  }

  setAuthorisedState(isAuthorised) {
    this.setState({
      isAuthorised,
    });
  }

  componentDidMount() {
    // TODO: Move this to helper

    initialiseAudioRecorder(this.setAuthorisedState, this.onProgress);

    Animated.timing(this.state.show, {
      toValue: 1,
      timing: 10000,
    }).start();
  }

  async pause() {
    if (this.state.recordingState !== RECORD) {
      console.warn("Can't pause, not recording!");
      return;
    }

    try {
      await AudioRecorder.pauseRecording();
      this.setState({recordingState: PAUSED});
    } catch (error) {
      console.error(error);
    }
  }

  async resume() {
    if (this.state.recordingState !== PAUSED) {
      console.warn("Can't resume, not paused!");
      return;
    }

    try {
      await AudioRecorder.resumeRecording();
      this.setState({recordingState: RECORD});
    } catch (error) {
      console.error(error);
    }
  }

  async stop() {
    if (this.state.recordingState !== RECORD) {
      console.warn("Can't stop, not recording!");
      return;
    }

    try {
      const filePath = await AudioRecorder.stopRecording();
      this.finishRecording(true, filePath);
    } catch (error) {
      console.error(error);
    }
  }

  async record() {
    if (this.state.recordingState == RECORD) {
      console.warn('Already recording!');
      return;
    }

    if (!this.state.isAuthorised) {
      console.warn("Can't record, no permission granted!");
      return;
    }

    const {location, fileName} = getFileName();
    console.log('record begin');

    prepareRecordingAtPath(location);
    this.setState({
      location,
      fileName,
      recordingState: RECORD,
    });

    try {
      await AudioRecorder.startRecording();
    } catch (error) {
      console.error(error);
    }
  }

  finishRecording(didSucceed, filePath, fileSize) {
    this.props.addRecording({
      location: this.state.location,
      name: this.state.fileName,
    });
    this.setState({finished: didSucceed, recordingState: IDLE});
  }

  render() {
    const {recordingState} = this.state;
    console.log('render', recordingState);

    return (
      <View style={styles.mainCon}>
        {recordingState === IDLE ? (
          // render record
          <Animated.View style={{opacity: this.state.show}}>
            <Button title={'RECORD'} callback={() => this.record()} />
            {/* <Button title={'Playrecord'} callback={() => this.play()} /> */}
          </Animated.View>
        ) : recordingState === RECORD ? (
          // render Stop button and pause
          <>
            <View style={styles.timerView}>
              <Text style={styles.timer}>{this.state.currentTime}</Text>
            </View>
            <Button title={'STOP'} callback={() => this.stop()} />
            <Button title={'PAUSE'} callback={() => this.pause()} />
          </>
        ) : (
          <Button title={'RESUME'} callback={() => this.resume()} />
        )}
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addRecording: filePath => {
      dispatch(audioListAction(filePath));
    },
  };
};

const styles = StyleSheet.create({
  mainCon: {
    marginTop: 10,
  },
  timer: {
    fontSize: 20,
  },
  timerView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 5,
    borderColor: '#333',
    borderRadius: 50,
    padding: 30,
  },
});

// eslint-disable-next-line prettier/prettier
export default connect(null, mapDispatchToProps)(Buttons);
