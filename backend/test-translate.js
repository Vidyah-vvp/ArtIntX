const https = require('https');

function translate(text, targetLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const parsed = JSON.parse(data);
            let translated = '';
            parsed[0].forEach(item => {
                if (item[0]) translated += item[0];
            });
            console.log('Translated:', translated);
        });
    });
}

translate('Hello, I have a headache', 'es');
