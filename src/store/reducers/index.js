import { ADD_RECORD } from '../../actions/addAudio';
// import {List, Map} from 'immutable';

const initialState = {
  audioFileName: [],
};

const audioListReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case ADD_RECORD:
      const temp = state.audioFileName;
      const newAFN = temp.concat(payload);
      console.log('add record', state, payload, newAFN);
      return { ...state, audioFileName: newAFN };
    default:
      return state;
  }
};

export default audioListReducer;
