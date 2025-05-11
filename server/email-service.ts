import { MailService } from '@sendgrid/mail';

// Email service setup - will be initialized when API key is provided
let mailService: MailService | null = null;

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

/**
 * Initialize the email service with the SendGrid API key
 * @param apiKey SendGrid API key
 * @returns true if initialization was successful
 */
export function initializeEmailService(apiKey: string): boolean {
  try {
    if (!apiKey) {
      console.warn('No SendGrid API key provided, email service disabled');
      return false;
    }
    
    mailService = new MailService();
    mailService.setApiKey(apiKey);
    console.log('Email service initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize email service:', error);
    return false;
  }
}

/**
 * Send an email using SendGrid
 * @param options Email options including recipient, subject, and content
 * @returns Promise resolving to true if email was sent successfully
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!mailService) {
    console.warn('Email service not initialized, cannot send email');
    return false;
  }
  
  try {
    // Ensure default from email is always a string
    const defaultFromEmail = process.env.DEFAULT_FROM_EMAIL || 'noreply@habitvault.app';
    
    await mailService.send({
      to: options.to,
      from: options.from || defaultFromEmail,
      subject: options.subject,
      text: options.text || '',
      html: options.html || '',
    });
    
    console.log(`Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send a weekly summary email with habit statistics
 * @param email Recipient email
 * @param username User's name
 * @param completionRate Overall completion rate
 * @param streak Current streak
 * @param topHabit Most completed habit
 * @returns Promise resolving to true if email was sent successfully
 */
export async function sendWeeklySummary(
  email: string,
  username: string,
  completionRate: number,
  streak: number,
  topHabit?: string
): Promise<boolean> {
  const subject = 'Your Weekly HabitVault Summary';
  
  const text = `
    Hello ${username},
    
    Here's your weekly habit summary from HabitVault:
    
    Overall Completion Rate: ${completionRate}%
    Current Streak: ${streak} days
    ${topHabit ? `Top Habit: ${topHabit}` : ''}
    
    Keep up the good work!
    
    - The HabitVault Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #5a67d8;">Your Weekly HabitVault Summary</h2>
      <p>Hello ${username},</p>
      <p>Here's your weekly habit summary:</p>
      <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 10px 0;"><strong>Overall Completion Rate:</strong> ${completionRate}%</p>
        <p style="margin: 10px 0;"><strong>Current Streak:</strong> ${streak} days</p>
        ${topHabit ? `<p style="margin: 10px 0;"><strong>Top Habit:</strong> ${topHabit}</p>` : ''}
      </div>
      <p>Keep up the good work!</p>
      <p style="color: #718096; font-size: 0.9em;">- The HabitVault Team</p>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject,
    text,
    html
  });
}

/**
 * Send a streak milestone notification
 * @param email Recipient email
 * @param username User's name
 * @param habit Habit name
 * @param streak Streak count
 * @returns Promise resolving to true if email was sent successfully
 */
export async function sendStreakMilestone(
  email: string,
  username: string,
  habit: string,
  streak: number
): Promise<boolean> {
  const subject = `Congratulations on your ${streak}-day streak!`;
  
  const text = `
    Awesome job, ${username}!
    
    You've maintained your "${habit}" habit for ${streak} days in a row!
    This is an amazing achievement that shows your dedication.
    
    Keep the momentum going!
    
    - The HabitVault Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #5a67d8;">Streak Milestone Achieved! 🎉</h2>
      <p>Awesome job, ${username}!</p>
      <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="font-size: 1.2em; margin: 10px 0;">You've maintained your <strong>"${habit}"</strong> habit for</p>
        <p style="font-size: 2em; color: #5a67d8; margin: 5px 0;"><strong>${streak} days</strong> in a row!</p>
        <p>This is an amazing achievement that shows your dedication.</p>
      </div>
      <p>Keep the momentum going!</p>
      <p style="color: #718096; font-size: 0.9em;">- The HabitVault Team</p>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject,
    text,
    html
  });
}