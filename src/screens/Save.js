import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Text, View, TextInput, Button } from 'react-native';
import { Navigation } from 'react-native-navigation';

import { audioListAction } from '../actions/addAudio';

class Save extends Component {
    state = {
        nameText: 'sample',
    };

    saveAudioInRedux = () => {
        const { length, fileLocation, filesize, time } = this.props;

        this.props.addRecording({
            location: fileLocation,
            name: this.state.nameText + '' + time,
            section: 'general',
            transcribe: false,
            tags: [''],
            filesize: filesize,
            length: length,
            time: time,
        });

        Navigation.popToRoot(this.props.componentId);
    };

    updateTextInput = e => {
        console.log('e', e);

        this.setState({
            nameText: e.nativeEvent.text,
        });
    };
    render() {
        const { nameText } = this.state;

        return (
            <View>
                <Text> Enter Name to Save </Text>
                <TextInput onChange={this.updateTextInput} value={nameText} />
                <Button title={'save'} onPress={this.saveAudioInRedux} />
            </View>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addRecording: filePath => {
            console.log('action called');

            dispatch(audioListAction(filePath));
        },
    };
};

export default connect(
    null,
    mapDispatchToProps,
)(Save);
