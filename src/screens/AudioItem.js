import React, { Component } from 'react';
import { Button, Text, View } from 'react-native';
import Sound from 'react-native-sound';

import { speechToText } from '../services/speechToTextAPI';

class AudioItem extends Component {
    state = {
        isPlaying: false,
        transcript: '',
    };
    // shows a player
    // Pause and play
    playRecording = () => {
        const sound = new Sound(this.props.item.location, '', () => {});
        setTimeout(() => {
            sound.play(success => {
                if (success) {
                    console.log('successfully finished playing');
                } else {
                    console.log('playback failed due to audio decoding errors');
                }
            });
        }, 100);
    };

    // shows either getTranscripts
    // or the transcript
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
        const { isPlaying } = this.state;
        console.log(this.props);

        return (
            <View>
                <Text>{'name'}</Text>
                <Button
                    title={isPlaying ? 'pause' : 'play'}
                    onPress={() => this.playRecording()}
                />
                {/* The buffer will be here */}
                <Text>Transcript wil be here</Text>
            </View>
        );
    }
}

export default AudioItem;
