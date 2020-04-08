import React, { Component } from 'react';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    Platform,
} from 'react-native';

import { Navigation } from 'react-native-navigation';
import { AUDIO, SAVE } from './constants';

// const PLAYING = 'play';
const IDLE = 'idle';
const PAUSED = 'pause';
const RECORD = 'record';
const AUDIO_BASE = AudioUtils.DocumentDirectoryPath;

export class Buttons extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        recordingState: IDLE,
        hasPermission: false,
        currentTime: 0,
        fileLocation: null,
        finished: false,
        recordTime: null,
    };

    prepareRecordingPath(audioPath) {
        // TODO: Move this to helper
        AudioRecorder.prepareRecordingAtPath(audioPath, {
            SampleRate: 44100,
            Channels: 1,
            AudioQuality: 'Medium',
            AudioEncoding: 'amr_wb',
            AudioEncodingBitRate: 32000,
        });
    }

    componentDidMount() {
        // TODO: Move this to helper
        AudioRecorder.requestAuthorization().then(isAuthorised => {
            this.setState({
                hasPermission: isAuthorised,
            });

            if (!isAuthorised) {
                return;
            }

            // this.prepareRecordingPath(this.state.audioPath);
            // TODO: Move this to helper
            AudioRecorder.onProgress = data => {
                // FIXME Get the data and set state here
                this.setState({
                    currentTime: Math.floor(data.currentTime),
                });
            };
            // TODO: Move this to helper
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

    // Render different buttons based on recordingState
    renderButton(recordingState = this.state.recordingState) {
        if (recordingState == IDLE) {
            // render record
            return (
                <>
                    {this.getButton('RECORD', () => this.record())}
                    {this.getButton('Playrecord', () => this.openRecordList())}
                </>
            );
        } else if (recordingState == RECORD) {
            // render Stop button and pause
            return (
                <>
                    <View style={styles.timerView}>
                        <Text style={styles.timer}>
                            {this.state.currentTime}
                        </Text>
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
            this.setState({ recordingState: PAUSED });
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
            this.setState({ recordingState: RECORD });
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

    async openRecordList() {
        Navigation.push(this.props.componentId, {
            component: {
                name: AUDIO,
            },
        });
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
        // TODO: Move this to helper
        const date = new Date();
        const date_foler = date
            .toDateString()
            .split(' ')
            .join('_');
        const time_file = new Date()
            .toLocaleTimeString()
            .split(':')
            .join('_')
            .split(' ')
            .join('_');

        // check for duplicates and all

        const fileName =
            AUDIO_BASE + '/' + date_foler + '/' + time_file + '.amr';
        this.prepareRecordingPath(fileName);
        this.setState({
            fileLocation: fileName,
            recordTime: time_file,
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
        if (!didSucceed) {
            // TODO Handle this
            return;
        }

        // TODO Move this to utilitys
        Navigation.push(this.props.componentId, {
            component: {
                name: SAVE,
                passProps: {
                    fileLocation: this.state.fileLocation,
                    time: this.state.recordTime,
                    fileSize,
                    length: this.state.currentTime,
                },
            },
        });

        this.setState({ finished: didSucceed });
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
export default Buttons;
