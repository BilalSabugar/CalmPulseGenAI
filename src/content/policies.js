// src/content/policies.js
import { contact } from './contact';

export const privacyPolicy = {
  title: 'IAS & Co. — Privacy Policy & Terms',
  meta: 'Effective Date: 05 Aug 2025 · Last Updated: 05 Aug 2025 · Applies to our website and portal (developed by Novyex Co).',
  badge: 'Updated',
  sections: [
    {
      h: '1. Information We May Collect',
      para: 'When you interact with our website/portal, we may collect the following data:',
      bullets: [
        'Full Name',
        'Email Address',
        'Phone Number',
        'Organization or Business Name',
        'GST Number & PAN Number',
        'Company Logo',
        'Business or Financial Information',
        'Uploaded Documents (e.g., Aadhar, Passport, bills, ledgers, invoices, etc.)',
        'Authentication details (via Google only – we do not store passwords)',
      ],
      muted: 'We do not collect data for marketing, advertising, or third-party tracking purposes.',
    },
    {
      h: '2. How We Use Your Information',
      bullets: [
        'To deliver our professional CA services',
        'To authenticate users through Google',
        'To process uploaded documents for internal firm use',
        'To communicate with clients regarding submissions or services',
        'To comply with legal and regulatory requirements',
      ],
    },
    {
      h: '3. Document Uploads & Confidentiality',
      para: 'Our website/portal allows users to upload sensitive documents which are automatically shared with our internal admin team. While we strive to use secure infrastructure and cloud solutions (e.g., Google/Firebase) to store data, we do not take responsibility for data loss, data breaches, or hacking incidents. By uploading documents, you acknowledge and agree that IAS & Co. and the developer will not be liable for any unauthorized access, leak, loss, or damage of data. We attempt to apply reasonable security measures, but no online system is fully immune to risk.',
    },
    {
      h: '4. Data Storage & Retention',
      bullets: [
        'Uploaded documents and client data may be retained for regulatory and professional record-keeping purposes.',
        'Data may be stored on secure third-party servers such as Google Cloud/Firebase.',
        'We reserve the right to update, delete, or manage user data at our discretion without prior notice.',
      ],
    },
    {
      h: '5. Data Access, Correction & Deletion',
      para: 'Users can request access to their data, correction of inaccurate data, and deletion of information (subject to legal and record-keeping obligations). Not all data can be deleted upon request.',
      muted: 'For details, contact iasandco@icai.org.',
    },
    {
      h: '6. Third-Party Services',
      para: 'We use trusted third-party services such as Google Cloud/Firebase for storage and Google Authentication for login. These services have their own privacy policies which we recommend you review before use.',
    },
    {
      h: '7. Payments, Verification & Refunds',
      para: 'The portal supports UPI and Cash payments for certain services. UPI references (UTR/Transaction ID) provided by users may be checked using automated heuristics (e.g., format plausibility, amount tolerance, recency). Where checks indicate high confidence, payments may be auto-marked as Paid; otherwise, they are placed Under Verification. Cash payments are always placed Under Verification until reviewed by the accounts team. Refunds (if applicable) are processed to the original mode of payment.',
    },
    {
      h: '8. Tickets, Invoices & Receipts',
      para: 'Users can download invoices and receipts from the portal. Transaction issues may be raised via the in-app ticketing flow. Ticket submissions include metadata such as timestamp, ticket type, user email, subject, ticketId and the referenced transactionId. Ticket status may be Active/Closed and is updated as the issue progresses.',
    },
    {
      h: '9. Cookies, Analytics & Device Data',
      para: 'Minimal analytics, device information, and technical logs may be captured to secure accounts, improve reliability and detect abuse. We do not use behavioral advertising or third-party tracking pixels.',
    },
    {
      h: '10. Children’s Data',
      para: 'Our services are intended for professional/business users. We do not knowingly collect personal data from children.',
    },
    {
      h: '11. International Transfers',
      para: 'Data may be stored or processed on servers located outside your state or country. By using the portal, you consent to such transfers consistent with applicable law.',
    },
    {
      h: '12. Changes to this Policy',
      para: 'This Privacy Policy may be updated to reflect improvements, legal changes, or functional upgrades. Users will be notified via email or in-app announcements. Continued use constitutes acceptance of the revised terms.',
    },
    {
      h: '13. Terms of Use',
      bullets: [
        'You are responsible for safeguarding your credentials and session.',
        'Upload only lawful content that you have the right to share.',
        'Fees are payable as per engagement letters; applicable taxes are extra.',
        'We may suspend access in case of misuse, fraud, or non-payment.',
      ],
    },
    {
      h: '14. Intellectual Property',
      para: 'Unless expressly assigned, all portal UI, code and content are the property of IAS & Co. or its licensors. Client-generated content and documents remain the property of the client, subject to our engagement terms and legal obligations.',
    },
    {
      h: '15. Limitation of Liability',
      para: 'To the fullest extent permitted by law, IAS & Co. shall not be liable for indirect or consequential damages, loss of profits or data arising from use of the portal. Our aggregate liability is limited to fees paid for the specific engagement giving rise to the claim.',
    },
    {
      h: '16. Indemnity',
      para: 'You agree to indemnify and hold harmless IAS & Co. against claims arising from your breach of these terms or violation of law/third-party rights.',
    },
    {
      h: '17. Governing Law & Dispute Resolution',
      para: 'These terms are governed by the laws of India. Courts at Ahmedabad shall have exclusive jurisdiction, subject to any mandatory arbitration or mediation requirements in the engagement letter, if applicable.',
    },
    {
      h: '18. Termination',
      para: 'We may terminate or suspend access where required for security, misuse, or non-payment. Your obligations that by nature survive termination shall continue.',
    },
    {
      h: '19. Contact',
      para: `${contact.title}
 Email: ${contact.email}
 Phone: ${contact.phone}
 Address: ${contact.address}
 Office Hours: ${contact.officeTime}`,
    },
    {
      h: 'Disclaimer',
      para: 'This page summarizes your rights and responsibilities in concise language. It does not replace detailed engagement letters or professional advice. In case of conflict, the engagement letter and applicable law prevail.',
      muted: true,
    },
  ],
};
