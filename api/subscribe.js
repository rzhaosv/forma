
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { email } = req.body;

        // Basic validation
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Please provide a valid email address.' });
        }

        // LOG THE SIGNUP - This is how the user will track it in Vercel Logs
        console.log(`NEW SUBSCRIBER: ${email} at ${new Date().toISOString()}`);

        // Simulate database delay for realism
        await new Promise(resolve => setTimeout(resolve, 500));

        // Return success
        return res.status(200).json({
            success: true,
            message: 'Successfully subscribed!',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Subscription Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
