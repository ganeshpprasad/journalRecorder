import React from 'react';
// github.com/jsierles/react-native-audio/blob/master/AudioExample/AudioExample.js
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Platform,
  PermissionsAndroid,
} from 'react-native';

import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';

class MeetingRoom extends React.Component {
  state = {
    isRecording: false,
    audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
    hasPermission: false,
    currentTime: 0,
    paused: false,
  };

  prepareRecordingPath(audioPath) {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: 'Low',
      AudioEncoding: 'aac',
      AudioEncodingBitRate: 32000,
    });
  }

  componentDidMount() {
    AudioRecorder.requestAuthorization().then(isAuthorised => {
      this.setState({
        hasPermission: isAuthorised,
      });

      if (!isAuthorised) return;

      this.prepareRecordingPath(this.state.audioPath);

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

  renderButton(title, callback, shouldRender) {
    const render = shouldRender ? (
      <TouchableHighlight onPress={callback}>
        <Text>{title}</Text>
      </TouchableHighlight>
    ) : null;
    return render;
  }

  // renderPauseButton() {}

  async pause() {
    if (!this.state.recording) {
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
    if (!this.state.paused) {
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
    if (!this.state.recording) {
      console.warn("Can't stop, not recording!");
      return;
    }

    this.setState({
      isRecording: false,
      paused: false,
    });

    try {
      const filePath = await AudioRecorder.stopRecording();

      if (Platform.OS === 'android') {
        this._finishRecording(true, filePath);
      }
      return filePath;
    } catch (error) {
      console.error(error);
    }
  }

  async play() {
    if (this.state.recording) {
      await this._stop();
    }

    // These timeouts are a hacky workaround for some issues with react-native-sound.
    // See https://github.com/zmxv/react-native-sound/issues/89.
    setTimeout(() => {
      var sound = new Sound(this.state.audioPath, '', error => {
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
    if (this.state.recording) {
      console.warn('Already recording!');
      return;
    }

    if (!this.state.hasPermission) {
      console.warn("Can't record, no permission granted!");
      return;
    }

    this.setState({
      isRecording: true,
      paused: false,
    });

    try {
      const filePath = await AudioRecorder.startRecording();
      console.log('Recording', filePath);
    } catch (error) {
      console.error(error);
    }
  }

  finishRecording(didSucceed, filePath, fileSize) {
    this.setState({finished: didSucceed});
    console.log(
      `Finished recording of duration ${
        this.state.currentTime
      } seconds at path: ${filePath} and size of ${fileSize || 0} bytes`,
    );
  }

  render() {
    const {isRecording} = this.state;
    return (
      <View>
        <View>
          {this.renderButton(
            'Start Recordi',
            () => this.record(),
            !isRecording,
          )}
        </View>
        <View>{this.renderButton('Stop', () => this.stop(), isRecording)}</View>
        <View>
          {this.renderButton('Pause', () => this.pause(), isRecording)}
        </View>
      </View>
    );
  }
}

export default MeetingRoom;
