// Simple API route to verify Vercel deployment
export default function handler(req, res) {
  res.status(200).json({ 
    name: 'AI Learning Experience Studio',
    status: 'API is working',
    features: [
      'Roleplay Characters',
      'Discussion Facilitators',
      'Feedback Coaches',
      'Subject Tutors',
      'Custom Interactions'
    ]
  });
}
