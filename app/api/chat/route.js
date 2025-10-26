const payload = {
    "output_type": "chat",
    "input_type": "text",
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

fetch('https://langflow.sail.codes/api/v1/run/36e4f928-e23e-4733-85c8-759492389c95', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));