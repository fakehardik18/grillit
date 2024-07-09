async function getContent(platform, username) {
    let url;
    switch (platform) {
        case 'reddit':
            url = `https://www.reddit.com/user/${username}.json`;
            break;
        case 'github':
            url = `https://api.github.com/users/${username}/repos`;
            break;
        default:
            throw new Error('Unsupported platform');
    }
    
    const response = await fetch(url);
    const data = await response.json();
    const user_data = [];
    
    if (platform === 'reddit') {
        for (const post of data['data']['children']) {
            try {
                const postData = {
                    title: post['data']['title'] || post['data']['link_title'] || "",
                    content: post['data']['selftext'] || post['data']['body'] || ""
                };
                user_data.push(postData);
            } catch (error) {
                console.error('Error processing post:', error);
            }
        }
    } else if (platform === 'github') {
        data.forEach(repo => {
            user_data.push({
                title: repo.name,
                content: repo.description || ""
            });
        });
    }
    
    return user_data;
}

async function roastUser() {
    const platform = document.getElementById('platform').value;
    const username = document.getElementById('username').value;
    const userData = await getContent(platform, username);
    const key = 'd64fa560a12a4ad9cfa423a368cda858d86c403c6ffc6a4cff31457bbc225fe9'; // Replace with your API key

    const response = await fetch('https://api.together.xyz/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
            model: 'meta-llama/Llama-3-8b-chat-hf',
            messages: [
                { role: 'user', content: `Roast a user named ${username} based on this data ${JSON.stringify(userData)}. in the form of a 3 para poem with each para having 4 lines` }
            ]
        })
    });

    const result = await response.json();
    document.getElementById('response').innerText = result.choices[0].message.content;
    document.getElementById('responseBox').classList.remove('hidden');
}

function copyToClipboard() {
    const responseText = document.getElementById('response').innerText;
    if (responseText) {
        navigator.clipboard.writeText(responseText).then(() => {
            alert('Roasted text copied to clipboard!');
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    } else {
        alert('No text to copy!');
    }
}
