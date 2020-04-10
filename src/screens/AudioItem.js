import React, { Component } from 'react';
import {
    Button,
    Text,
    View,
    Slider,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Sound from 'react-native-sound';

import { getAudioTimeString } from '../helpers/soundRecorder';
import { speechToText } from '../services/speechToTextAPI';

const playerStates = {
    IDLE: 'idle',
    PLAYING: 'playing',
    PAUSED: 'paused',
};

class AudioItem extends Component {
    state = {
        isPlaying: playerStates.IDLE,
        currentTime: 0,
        duration: 0,
        sliderEdit: false,
        transcript: '',
    };

    componentDidMount() {
        console.log('did mount');

        this.sound = new Sound(this.props.item.location, '', () => {});
    }

    componentWillUnmount() {
        if (this.sound) {
            this.sound.release();
            this.sound = null;
        }
    }

    setPlayerTimer = () => {
        this.timeout = setInterval(() => {
            if (
                this.sound &&
                this.sound.isLoaded() &&
                this.state.isPlaying == playerStates.PLAYING &&
                !this.sliderEditing
            ) {
                this.sound.getCurrentTime((seconds, isPlaying) => {
                    this.setState({ currentTime: seconds });
                });
            }
        }, 100);
    };

    finishedPlaying = success => {
        if (success) {
            console.log('successfully finished playing');
        } else {
            console.log('playback failed due to audio decoding errors');
        }
        // TODO CAn show a signal if player failed
        this.setState((prevState, prevProps) => ({
            ...prevState,
            isPlaying: playerStates.IDLE,
        }));
        if (this.timeout) {
            clearInterval(this.timeout);
        }
    };

    playRecording = () => {
        this.setState(prevState => ({
            ...prevState,
            duration: this.sound.getDuration(),
        }));
        this.setPlayerTimer();
        setTimeout(() => {
            this.setState((prevState, prevProps) => ({
                ...prevState,
                isPlaying: playerStates.PLAYING,
            }));
            this.sound.play(this.finishedPlaying());
        }, 100);
    };

    pausePlayer = () => {
        if (this.sound) {
            this.sound.pause();
            this.setState(prevState => ({
                ...prevState,
                isPlaying: playerStates.PAUSED,
            }));
        }
    };

    onSliderEditStart = () => {
        this.sliderEditing = true;
    };

    onSliderEditEnd = () => {
        this.sliderEditing = false;
    };

    onSliderValueChange = value => {
        if (this.sound) {
            this.sound.setCurrentTime(value);
            this.setState(prevState => ({ ...prevState, currentTime: value }));
        }
    };

    getTranscripts = () => {
        const { location } = this.props.item;
        const response = speechToText(location);
        response
            .then(data => {
                console.log('res done', data);
                // this.setState(data);
            })
            .catch(e => console.log('error in response data', e));

        return <Text>{this.state.transcript}</Text>;
    };

    render() {
        const { isPlaying, currentTime, duration } = this.state;
        const { name } = this.props.item;

        return (
            <View style={styles.playScreen}>
                <Text style={styles.recordName}>{name}</Text>
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => this.playRecording()}>
                    <Text style={styles.playButtonText}>
                        {isPlaying === playerStates.PLAYING
                            ? 'pause'
                            : isPlaying === playerStates.PAUSED
                            ? 'Resume'
                            : 'play'}
                    </Text>
                </TouchableOpacity>
                <View style={styles.controlCon}>
                    <Text style={styles.currentTime}>
                        {getAudioTimeString(currentTime)}
                    </Text>
                    <Slider
                        style={styles.control}
                        onTouchStart={this.onSliderEditStart}
                        onTouchEnd={this.onSliderEditEnd}
                        onValueChange={this.onSliderValueChange}
                        value={currentTime}
                        maximumValue={duration}
                        maximumTrackTintColor={'gray'}
                        minimumTrackTintColor={'blue'}
                        thumbTintColor={'blue'}
                    />
                    <Text style={styles.totalTime}>
                        {getAudioTimeString(duration)}
                    </Text>
                </View>
                <Text style={styles.transcript}>Transcript wil be here</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    playScreen: {
        margin: 10,
    },
    recordName: {
        fontSize: 18,
        margin: 20,
        textAlign: 'center',
    },
    playButton: {
        margin: 30,
        borderWidth: 2,
        borderColor: '#E50E64',
        height: 150,
        width: 150,
        borderRadius: 150,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    playButtonText: {
        fontSize: 21,
    },
    controlCon: {
        flexDirection: 'row',
        margin: 30,
    },
    control: {
        flexGrow: 1,
    },
    currentTime: {
        padding: 6,
    },
    totalTime: {
        padding: 6,
    },
    transcript: {
        textAlign: 'center',
        color: '#aaa',
        margin: 10,
    },
});

export default AudioItem;
