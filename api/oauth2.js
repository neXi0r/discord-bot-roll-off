const { Router } = require('express');
const router = Router();
const fetch = require('node-fetch');

router.get('/auth', (req, res) => {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=identify`;
    res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
    const code = req.query.code;
    const data = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDIRECT_URI,
    });

    const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    const json = await response.json();
    res.json(json);
});

module.exports = router;