const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let app;
try {
  if (!admin.apps.length) {
    const serviceAccount = {
      type: process.env.GOOGLE_TYPE,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN
    };

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.GOOGLE_PROJECT_ID
    });
    
    console.log('Firebase Admin initialized successfully');
  } else {
    app = admin.app();
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Validate environment variables
    const requiredEnvVars = [
      'GOOGLE_TYPE',
      'GOOGLE_PROJECT_ID',
      'GOOGLE_PRIVATE_KEY',
      'GOOGLE_CLIENT_EMAIL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Server configuration error',
          missingVars: missingVars
        })
      };
    }

    // Parse request body
    const { tokens, title, message } = JSON.parse(event.body);

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid or empty tokens array' })
      };
    }

    if (!title || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Title and message are required' })
      };
    }

    console.log(`Sending notifications to ${tokens.length} devices`);

    // Prepare the notification payload
    const payload = {
      notification: {
        title: title,
        body: message,
      },
      webpush: {
        fcmOptions: {
          link: 'https://radio.kenlive.co.ke'
        },
        notification: {
          title: title,
          body: message,
          icon: '/newsline-logo.png',
          badge: '/newsline-logo.png',
          vibrate: [200, 100, 200],
          requireInteraction: true
        }
      },
      tokens: tokens
    };

    // Send the notification using sendEachForMulticast
    const response = await admin.messaging().sendEachForMulticast(payload);

    console.log('Notification sent successfully:', {
      successCount: response.successCount,
      failureCount: response.failureCount
    });

    // Log any failures
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push({
            token: tokens[idx].substring(0, 20) + '...',
            error: resp.error?.message || 'Unknown error'
          });
        }
      });
      console.error('Failed tokens:', failedTokens);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        message: `Sent to ${response.successCount} devices`
      })
    };

  } catch (error) {
    console.error('Error sending notifications:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send notifications',
        details: error.message 
      })
    };
  }
};
