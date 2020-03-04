import React, {Component} from 'react';
import {connect} from 'react-redux';
import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Platform,
  PermissionsAndroid,
} from 'react-native';

import {audioListAction} from '../actions/addAudio';

const IDLE = 'idle';
// const PLAYING = 'play';
const PAUSED = 'pause';
const RECORD = 'record';
const AUDIO_BASE = AudioUtils.DocumentDirectoryPath;

export class Buttons extends Component {
  state = {
    recordingState: IDLE,
    hasPermission: false,
    currentTime: 0,
    newRecord: null,
    finished: false,
  };

  prepareRecordingPath(audioPath) {
    console.log('called');

    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 44100,
      Channels: 1,
      AudioQuality: 'Medium',
      AudioEncoding: 'aac',
      AudioEncodingBitRate: 32000,
    });
  }

  componentDidMount() {
    AudioRecorder.requestAuthorization().then(isAuthorised => {
      this.setState({
        hasPermission: isAuthorised,
      });

      if (!isAuthorised) {
        return;
      }

      // this.prepareRecordingPath(this.state.audioPath);

      AudioRecorder.onProgress = data => {
        this.setState({
          currentTime: Math.floor(data.currentTime),
        });
      };

      AudioRecorder.onFinished = data => {
        // Android callback comes in the form of a promise instead.
        if (Platform.OS === 'ios') {
          this.finishRecording(
            data.status === 'OK',
            data.audioFileURL,
            data.audioFileSize,
          );
        }
      };
    });
  }

  getButton(title, callback) {
    return (
      <TouchableHighlight onPress={callback} style={styles.playerButton}>
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableHighlight>
    );
  }

  renderButton(recordingState = this.state.recordingState) {
    if (recordingState == IDLE) {
      // render record
      return (
        <>
          {this.getButton('RECORD', () => this.record())}
          {this.getButton('Playrecord', () => this.play())}
        </>
      );
    } else if (recordingState == RECORD) {
      // render Stop button and pause
      return (
        <>
          <View style={styles.timerView}>
            <Text style={styles.timer}>{this.state.currentTime}</Text>
          </View>
          {this.getButton('stop', () => this.stop())}
          {this.getButton('pause', () => this.pause())}
        </>
      );
      // this.getButton('pause', () => this.pause()
    } else {
      // render Resume
      return this.getButton('resume', () => this.resume());
    }
  }

  async pause() {
    if (this.state.recordingState !== RECORD) {
      console.warn("Can't pause, not recording!");
      return;
    }

    try {
      const filePath = await AudioRecorder.pauseRecording();
      this.setState({paused: true});
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
      this.setState({paused: false});
    } catch (error) {
      console.error(error);
    }
  }

  async stop() {
    if (this.state.recordingState !== RECORD) {
      console.warn("Can't stop, not recording!");
      return;
    }

    this.setState({
      recordingState: IDLE,
    });

    try {
      const filePath = await AudioRecorder.stopRecording();

      if (Platform.OS === 'android') {
        this.finishRecording(true, filePath);
      }
      return filePath;
    } catch (error) {
      console.error(error);
    }
  }

  async play() {
    if (this.state.recordingState == IDLE) {
      // await this._stop();
    }

    // These timeouts are a hacky workaround for some issues with react-native-sound.
    // See https://github.com/zmxv/react-native-sound/issues/89.
    setTimeout(() => {
      var sound = new Sound(this.state.newRecord, '', error => {
        if (error) {
          console.log('failed to load the sound', error);
        }
      });

      setTimeout(() => {
        sound.play(success => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }, 100);
    }, 100);
  }

  async record() {
    if (this.state.recordingState == RECORD) {
      console.warn('Already recording!');
      return;
    }

    if (!this.state.hasPermission) {
      console.warn("Can't record, no permission granted!");
      return;
    }
    const date = new Date().toLocaleDateString();
    this.prepareRecordingPath(AUDIO_BASE + date);
    this.setState({
      newRecord: AUDIO_BASE + date,
    });

    this.setState({
      recordingState: RECORD,
    });
    try {
      const filePath = await AudioRecorder.startRecording();
      console.log('Recording', filePath);
    } catch (error) {
      console.error(error);
    }
  }

  finishRecording(didSucceed, filePath, fileSize) {
    console.log('file path at finish', this.state.newRecord, filePath);

    this.props.addRecording(filePath);
    this.setState({finished: didSucceed});
    console.log(
      `Finished recording of duration ${
        this.state.currentTime
      } seconds at path: ${filePath} and size of ${fileSize || 0} bytes`,
    );
  }

  render() {
    // console.log('t', this.state);
    return <View style={styles.mainCon}>{this.renderButton()}</View>;
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
  playerButton: {
    margin: 50,
    flex: 1,
    padding: 30,
    borderColor: '#919',
    borderWidth: 2,
    color: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  buttonText: {
    fontSize: 20,
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
