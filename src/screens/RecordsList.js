import React, { Component, useState } from 'react';
import { StyleSheet, Text, FlatList, TouchableHighlight } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import { AUDIOITEM } from './constants';

const Item = props => {
    const openAudioItem = () => {
        Navigation.push(props.componentId, {
            component: {
                name: AUDIOITEM,
            },
            passProps: {
                item: props.item,
            },
        });
    };

    return (
        <TouchableHighlight onPress={() => openAudioItem()}>
            <Text style={styles.item}>{props.item.name}</Text>
        </TouchableHighlight>
    );
};

export class RecordsList extends Component {
    render() {
        const elementToRender =
            this.props.audioFiles.length > 0 ? (
                <FlatList
                    style={styles.listCon}
                    data={this.props.audioFiles}
                    renderItem={({ item }) => (
                        <Item
                            item={item}
                            componentId={this.props.componentId}
                        />
                    )}
                />
            ) : (
                <Text>No items here</Text>
            );
        return elementToRender;
    }
}

const styles = StyleSheet.create({
    listCon: {
        margin: 10,
    },
    item: {
        padding: 10,
        fontSize: 15,
        borderBottomColor: '#eee',
        borderBottomWidth: 2,
    },
});

const mapStateToProps = state => ({
    audioFiles: state.audioFileName,
});

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(RecordsList);
