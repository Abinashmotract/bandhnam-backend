import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Generate invoice HTML template
const generateInvoiceHTML = (transaction, user, plan) => {
  const invoiceDate = new Date(transaction.createdAt).toLocaleDateString('en-IN');
  const invoiceTime = new Date(transaction.createdAt).toLocaleTimeString('en-IN');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Invoice - BandhanM</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: #51365F;
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: bold;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.9;
            }
            .content {
                padding: 30px;
            }
            .invoice-details {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .detail-row:last-child {
                border-bottom: none;
                font-weight: bold;
                font-size: 18px;
                color: #51365F;
            }
            .detail-label {
                color: #6c757d;
                font-weight: 500;
            }
            .detail-value {
                color: #333;
                font-weight: 600;
            }
            .plan-features {
                margin: 20px 0;
            }
            .plan-features h3 {
                color: #51365F;
                margin-bottom: 15px;
            }
            .features-list {
                list-style: none;
                padding: 0;
            }
            .features-list li {
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
                position: relative;
                padding-left: 25px;
            }
            .features-list li:before {
                content: "✓";
                color: #28a745;
                font-weight: bold;
                position: absolute;
                left: 0;
            }
            .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #6c757d;
                font-size: 14px;
            }
            .success-message {
                background: #d4edda;
                color: #155724;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #28a745;
            }
            .cta-button {
                display: inline-block;
                background: #51365F;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Payment Successful!</h1>
                <p>Thank you for subscribing to BandhanM</p>
            </div>
            
            <div class="content">
                <div class="success-message">
                    <strong>Congratulations!</strong> Your subscription has been activated successfully. 
                    You now have access to all premium features of the ${plan.name} plan.
                </div>
                
                <h2>Invoice Details</h2>
                <div class="invoice-details">
                    <div class="detail-row">
                        <span class="detail-label">Invoice Number:</span>
                        <span class="detail-value">INV-${transaction.paymentIntentId.slice(-8).toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Transaction ID:</span>
                        <span class="detail-value">${transaction.paymentIntentId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date & Time:</span>
                        <span class="detail-value">${invoiceDate} at ${invoiceTime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Plan:</span>
                        <span class="detail-value">${plan.name} (${plan.duration})</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amount Paid:</span>
                        <span class="detail-value">₹${transaction.amount}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Method:</span>
                        <span class="detail-value">Card ending in ****</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value" style="color: #28a745;">✅ Completed</span>
                    </div>
                </div>
                
                <div class="plan-features">
                    <h3>What's Included in Your ${plan.name} Plan:</h3>
                    <ul class="features-list">
                        ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/profile" class="cta-button">
                        Access Your Dashboard
                    </a>
                </div>
                
                <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
                    This invoice serves as your receipt for the payment. Please keep this email for your records.
                    If you have any questions about your subscription, please contact our support team.
                </p>
            </div>
            
            <div class="footer">
                <p><strong>BandhanM - Find Your Perfect Match</strong></p>
                <p>Thank you for choosing BandhanM for your matrimonial journey!</p>
                <p style="font-size: 12px; margin-top: 15px;">
                    This is an automated email. Please do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send invoice email
export const sendInvoiceEmail = async (transaction, user, plan) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email configuration not found. Skipping invoice email.');
      return { success: false, message: 'Email not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"BandhanM" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Payment Invoice - ${plan.name} Plan Subscription | BandhanM`,
      html: generateInvoiceHTML(transaction, user, plan),
      attachments: [
        {
          filename: `invoice-${transaction.paymentIntentId.slice(-8)}.pdf`,
          content: 'Invoice PDF content would be generated here',
          contentType: 'application/pdf'
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Invoice email sent successfully:', result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId,
      message: 'Invoice email sent successfully'
    };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to send invoice email'
    };
  }
};

export default sendInvoiceEmail;
