const payload = {
    "output_type": "chat",
    "input_type": "chat",
    "input_value": "hello world!",
    "session_id": "user_1"
};

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
};

fetch('https://langflow.sail.codes/api/v1/run/639e8e95-88c9-4d27-97c7-17ac173828de', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));