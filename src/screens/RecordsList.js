import React, { Component, useState } from 'react';
import {
    StyleSheet,
    Text,
    FlatList,
    TouchableHighlight,
    View,
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import { AUDIOITEM } from './constants';

const Item = props => {
    const openAudioItem = () => {
        Navigation.push(props.componentId, {
            component: {
                name: AUDIOITEM,
                passProps: {
                    item: props.item,
                },
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
                <View style={styles.emptyList}>
                    <Text style={styles.emptyText}>
                        Record your first journal
                    </Text>
                </View>
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
    emptyList: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 100,
        paddingRight: 50,
        paddingLeft: 50,
    },
    emptyText: {
        fontSize: 18,
    },
});

export default RecordsList;
