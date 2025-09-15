// src/questions/index.js

// 50-question bank (grouped by category)
export const QUESTION_BANK = [
  // 🌿 Self & Identity (1–5)
  { id: 'SI1', category: 'Self & Identity', text: 'If you had to describe yourself in three words, what would they be?' },
  { id: 'SI2', category: 'Self & Identity', text: 'Do you feel more like your true self when you’re alone or around people?' },
  { id: 'SI3', category: 'Self & Identity', text: 'Do you ever feel like people don’t fully “get” who you are?' },
  { id: 'SI4', category: 'Self & Identity', text: 'When was the last time you felt really proud of yourself?' },
  { id: 'SI5', category: 'Self & Identity', text: 'If you could change one thing about your personality, what would it be?' },

  // 💭 Thoughts & Mindset (6–10)
  { id: 'TM6', category: 'Thoughts & Mindset', text: 'Do your thoughts feel more like calm waves or a storm most of the time?' },
  { id: 'TM7', category: 'Thoughts & Mindset', text: 'How often do you catch yourself overthinking?' },
  { id: 'TM8', category: 'Thoughts & Mindset', text: 'Do you feel your mind is more focused on the past, present, or future?' },
  { id: 'TM9', category: 'Thoughts & Mindset', text: 'Do you believe you’re harder on yourself than others are on you?' },
  { id: 'TM10', category: 'Thoughts & Mindset', text: 'When you’re stressed, what’s the first thought that usually comes to mind?' },

  // ❤ Emotions (11–15)
  { id: 'EM11', category: 'Emotions', text: 'Do you allow yourself to feel sad or do you push it away?' },
  { id: 'EM12', category: 'Emotions', text: 'What emotion do you experience the most in a normal week?' },
  { id: 'EM13', category: 'Emotions', text: 'When was the last time you laughed so much you forgot your problems?' },
  { id: 'EM14', category: 'Emotions', text: 'Do you find it easy to express your emotions to others?' },
  { id: 'EM15', category: 'Emotions', text: 'Which emotion is the hardest for you to control?' },

  // 🤝 Relationships & Social Life (16–20)
  { id: 'RS16', category: 'Relationships & Social Life', text: 'Do you feel truly understood by at least one person in your life?' },
  { id: 'RS17', category: 'Relationships & Social Life', text: 'Do you feel drained or energized after spending time with people?' },
  { id: 'RS18', category: 'Relationships & Social Life', text: 'How easy is it for you to trust others?' },
  { id: 'RS19', category: 'Relationships & Social Life', text: 'Have you ever felt lonely even when surrounded by people?' },
  { id: 'RS20', category: 'Relationships & Social Life', text: 'Do you think you rely too much, too little, or just enough on friends/family?' },

  // 🌌 Mental Health & Well-being (21–25)
  { id: 'MW21', category: 'Mental Health & Well-being', text: 'Do you ever feel your mind and body aren’t on the same page?' },
  { id: 'MW22', category: 'Mental Health & Well-being', text: 'What usually triggers your stress or anxiety the most?' },
  { id: 'MW23', category: 'Mental Health & Well-being', text: 'Do you feel like you have healthy ways to cope when life gets heavy?' },
  { id: 'MW24', category: 'Mental Health & Well-being', text: 'If happiness was on a scale of 1–10, where are you right now?' },
  { id: 'MW25', category: 'Mental Health & Well-being', text: 'Do you ever feel like you’re pretending to be okay when you’re not?' },

  // 🌱 Self-awareness & Growth (26–30)
  { id: 'SG26', category: 'Self-awareness & Growth', text: 'Do you feel like you’re living life or just “getting through” it?' },
  { id: 'SG27', category: 'Self-awareness & Growth', text: 'When was the last time you felt completely at peace with yourself?' },
  { id: 'SG28', category: 'Self-awareness & Growth', text: 'Do you think you’ve discovered your true potential yet?' },
  { id: 'SG29', category: 'Self-awareness & Growth', text: 'If your younger self met you today, would they be proud?' },
  { id: 'SG30', category: 'Self-awareness & Growth', text: 'Do you feel more guided by logic or emotions in your decisions?' },

  // 🌙 Emotional Depth (31–35)
  { id: 'ED31', category: 'Emotional Depth', text: 'What emotion do you find the hardest to admit to yourself?' },
  { id: 'ED32', category: 'Emotional Depth', text: 'Do you cry easily, or is it rare for you to let it out?' },
  { id: 'ED33', category: 'Emotional Depth', text: 'Do you ever feel emotionally numb instead of sad or happy?' },
  { id: 'ED34', category: 'Emotional Depth', text: 'When you’re upset, do you prefer silence or talking it out?' },
  { id: 'ED35', category: 'Emotional Depth', text: 'Do you forgive yourself easily when you make mistakes?' },

  // ⚖ Stress & Coping (36–40)
  { id: 'SC36', category: 'Stress & Coping', text: 'Do you feel like your daily life is more draining or fulfilling?' },
  { id: 'SC37', category: 'Stress & Coping', text: 'What’s one small thing that instantly calms you down?' },
  { id: 'SC38', category: 'Stress & Coping', text: 'Do you often feel mentally exhausted even if you haven’t done much physically?' },
  { id: 'SC39', category: 'Stress & Coping', text: 'How do you usually react when everything feels out of control?' },
  { id: 'SC40', category: 'Stress & Coping', text: 'Do you feel you’re good at balancing responsibilities and self-care?' },

  // 🌍 Connection & Relationships (41–45)
  { id: 'CR41', category: 'Connection & Relationships', text: 'Do you ever feel misunderstood even by people close to you?' },
  { id: 'CR42', category: 'Connection & Relationships', text: 'Do you think people see you as you truly are, or just a version of you?' },
  { id: 'CR43', category: 'Connection & Relationships', text: 'When you’re struggling, do you reach out or keep it inside?' },
  { id: 'CR44', category: 'Connection & Relationships', text: 'Do you feel comfortable showing your weaknesses to others?' },
  { id: 'CR45', category: 'Connection & Relationships', text: 'Have you ever felt invisible in a group of people?' },

  // 🔮 Beliefs & Hopes (46–50)
  { id: 'BH46', category: 'Beliefs & Hopes', text: 'Do you believe everything happens for a reason, or do you think life is random?' },
  { id: 'BH47', category: 'Beliefs & Hopes', text: 'Do you ever fear that your dreams are too big to achieve?' },
  { id: 'BH48', category: 'Beliefs & Hopes', text: 'Do you feel like time is moving too fast, too slow, or just right?' },
  { id: 'BH49', category: 'Beliefs & Hopes', text: 'If you could erase one memory, would you do it?' },
  { id: 'BH50', category: 'Beliefs & Hopes', text: 'Do you feel hopeful about your future, or uncertain?' },
];

export function sampleQuestions(n = 10) {
  const pool = [...QUESTION_BANK];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.max(0, Math.min(n, pool.length)));
}
