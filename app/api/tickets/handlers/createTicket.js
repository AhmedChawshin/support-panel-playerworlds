import { connectToDatabase } from '../../../../utils/db';
import axios from 'axios';
import { newResponse } from '../utils/ticketUtils'; 

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const baseUrl = process.env.WEBPAGE_URL || 'http://localhost:3000';

export async function createTicket(req) {
  const db = await connectToDatabase();
  const { graalid, game, installed, started, problemType, subProblem, description, email } = await req.json();

  // Required fields check
  if (!graalid || !game || !installed || (installed === '1' && !started) || (started === '1' && !problemType)) {
    return newResponse({ message: 'All required fields must be completed' }, 400);
  }

  const userEmail = email || req.user.email.trim().toLowerCase(); // Use provided email or authenticated user's email

  // Check active ticket count
  const activeTicketsCount = await db.collection('tickets').countDocuments({
    email: userEmail,
    status: { $in: ['open', 'Waiting for user response'] },
  });

  if (activeTicketsCount >= 3) {
    return newResponse({ message: 'Maximum of 3 active tickets allowed per user' }, 429);
  }

  // Construct ticket title and description
  const title = `${problemType}${subProblem ? ` - ${subProblem}` : ''}`;
  const fullDescription = [
    `Game: ${game.replace('_', ' ').replace('classic', 'GraalOnline Classic').replace('era', 'GraalOnline Era').replace('zone', 'GraalOnline Zone').replace('olwest', 'GraalOnline Olwest')}`,
    `Installed: ${installed === '1' ? 'Yes' : 'No'}`,
    installed === '1' ? `Started: ${started === '1' ? 'Yes' : 'No'}` : null,
    started === '1' ? `Problem Type: ${problemType}` : null,
    subProblem ? `Sub-Problem: ${subProblem}` : null,
    `\nUser Description:\n${description || 'No additional details provided.'}`,
  ].filter(Boolean).join('\n');

  const ticket = {
    email: userEmail,
    graalid,
    game,
    installed,
    started: installed === '1' ? started : null,
    problemType: started === '1' ? problemType : null,
    subProblem: subProblem || null,
    description: fullDescription,
    createdAt: new Date(),
    replies: [],
    status: 'open',
    assignedAdmin: null,
  };

  const result = await db.collection('tickets').insertOne(ticket);

  // Enhanced Discord Webhook Embed
  await axios.post(webhookUrl, {
    embeds: [
      {
        title: '🎟️ New Support Ticket Created',
        description: 'A new issue has been reported! Details below:',
        color: 5763719, // A cool teal color (#57F287)
        fields: [
          { name: '📌 Ticket ID', value: `#${result.insertedId}`, inline: true },
          { name: '👤 User', value: userEmail, inline: true },
          { name: '🎮 Game', value: game.replace('_', ' ').replace('classic', 'GraalOnline Classic').replace('era', 'GraalOnline Era').replace('zone', 'GraalOnline Zone').replace('olwest', 'GraalOnline Olwest'), inline: true },
          { name: '💾 Installed?', value: installed === '1' ? '✅ Yes' : '❌ No', inline: true },
          installed === '1' ? { name: '🚀 Started?', value: started === '1' ? '✅ Yes' : '❌ No', inline: true } : null,
          started === '1' ? { name: '⚠️ Problem Type', value: problemType.charAt(0).toUpperCase() + problemType.slice(1), inline: true } : null,
          subProblem ? { name: '🔍 Sub-Problem', value: subProblem.charAt(0).toUpperCase() + subProblem.slice(1).replace(/([A-Z])/g, ' $1'), inline: true } : null,
          { name: '📝 Description', value: description || 'No additional details provided.', inline: false },
        ].filter(Boolean),
        footer: {
          text: 'GraalOnline Support Team',
        },
        url: `${baseUrl}/admin/tickets/${result.insertedId}`,
        timestamp: new Date().toISOString(),
      },
    ],
  }).catch((error) => {
    console.error('Failed to send Discord webhook:', error.message);
  });

  return newResponse({ message: 'Ticket created', ticketId: result.insertedId }, 201);
}