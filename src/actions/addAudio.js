export const ADD_RECORD = 'add_record';

export const audioListAction = fileName => {
  console.log('action is ready', fileName, ADD_RECORD);

  return {
    type: ADD_RECORD,
    payload: fileName,
  };
};
