import fs from 'react-native-fs';

export const speechToText = async location => {
  console.log('fileName:', location);
  const file = await fs.readFile(location, 'base64');
  const audioBytes = file.toString('base64');

  // Make API call to nodejs server
  return fetch('http://192.168.225.113:5000/getTranscripts', {
    method: 'POST',
    body: JSON.stringify({
      audio: audioBytes,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => console.log('google api error', error));
};
