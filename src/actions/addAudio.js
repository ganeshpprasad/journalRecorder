export const ADD_RECORD = 'add_record';

export const audioListAction = fileName => {
  return {
    type: ADD_RECORD,
    payload: fileName,
  };
};
