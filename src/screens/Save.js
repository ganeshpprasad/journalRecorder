import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Text,
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Navigation } from 'react-native-navigation';

import { audioListAction } from '../actions/addAudio';

class Save extends Component {
    state = {
        nameText: 'sample',
    };

    nameRef = React.createRef();

    componentDidMount() {
        this.nameRef.current.focus();
    }

    saveAudioInRedux = () => {
        const { length, fileLocation, filesize, time } = this.props;

        this.props.addRecording({
            location: fileLocation,
            name: this.state.nameText,
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
                <Text style={styles.saveNameText}> Enter Name to Save </Text>
                <TextInput
                    style={styles.saveNameTextArea}
                    onChange={this.updateTextInput}
                    value={nameText}
                    ref={this.nameRef}
                />
                <Text style={styles.saveNameText}> Select Section</Text>
                <TextInput
                    style={styles.saveNameTextArea}
                    // onChange={this.updateTextInput}
                    value={'General'}
                />
                <Text style={styles.saveNameText}>
                    {' '}
                    FileSize: {this.props.filesize}{' '}
                </Text>
                <Text style={styles.saveNameText}>
                    {' '}
                    Length: {this.props.length}s
                </Text>
                <TouchableOpacity
                    style={styles.saveButton}
                    title={'save'}
                    onPress={this.saveAudioInRedux}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
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

const styles = StyleSheet.create({
    saveNameText: {
        margin: 10,
        padding: 10,
        fontSize: 15,
        color: '#333',
    },
    saveNameTextArea: {
        backgroundColor: '#eee',
        color: '#E50E64',
        fontSize: 18,
        padding: 10,
        paddingLeft: 15,
        margin: 10,
        marginTop: 0,
    },
    saveButton: {
        marginTop: 30,
        width: '50%',
        alignSelf: 'center',
        borderColor: '#E50E64',
        borderWidth: 2,
        padding: 10,
    },
    saveButtonText: {
        textAlign: 'center',
        fontSize: 18,
    },
});

export default connect(
    null,
    mapDispatchToProps,
)(Save);
