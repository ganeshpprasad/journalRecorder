import {ADD_RECORD} from '../actions/addAudio';
import {Map} from 'immutable';

const initialState = Map({
  audioFileNames: [],
});

const audioListReducer = (state = initialState, {type, payload}) => {
  switch (type) {
    case ADD_RECORD:
      console.log('add record', state);
      const newState = state.set('audioFileNames', payload);
      return newState;
    default:
      return initialState;
  }
};

export default audioListReducer;
