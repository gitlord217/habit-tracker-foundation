interface Quote {
  text: string;
  author: string;
}

export const motivationalQuotes: Quote[] = [
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle"
  },
  {
    text: "Habits are first cobwebs, then cables.",
    author: "Spanish Proverb"
  },
  {
    text: "You'll never change your life until you change something you do daily. The secret of your success is found in your daily routine.",
    author: "John C. Maxwell"
  },
  {
    text: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun"
  },
  {
    text: "Good habits formed at youth make all the difference.",
    author: "Aristotle"
  },
  {
    text: "Habits are the invisible architecture of everyday life.",
    author: "Gretchen Rubin"
  },
  {
    text: "The chains of habit are too weak to be felt until they are too strong to be broken.",
    author: "Samuel Johnson"
  },
  {
    text: "Your net worth to the world is usually determined by what remains after your bad habits are subtracted from your good ones.",
    author: "Benjamin Franklin"
  },
  {
    text: "A habit cannot be tossed out the window; it must be coaxed down the stairs a step at a time.",
    author: "Mark Twain"
  },
  {
    text: "First forget inspiration. Habit is more dependable. Habit will sustain you whether you're inspired or not.",
    author: "Octavia Butler"
  },
  {
    text: "Excellence is not a singular act, but a habit. You are what you repeatedly do.",
    author: "Shaquille O'Neal"
  },
  {
    text: "The difference between an amateur and a professional is in their habits. An amateur has amateur habits. A professional has professional habits.",
    author: "Steven Pressfield"
  },
  {
    text: "Successful people are simply those with successful habits.",
    author: "Brian Tracy"
  },
  {
    text: "The second half of a man's life is made up of nothing but the habits he has acquired during the first half.",
    author: "Fyodor Dostoevsky"
  },
  {
    text: "Your beliefs become your thoughts, your thoughts become your words, your words become your actions, your actions become your habits, your habits become your values, your values become your destiny.",
    author: "Mahatma Gandhi"
  },
  {
    text: "The quality of your life is determined by the quality of your habits.",
    author: "James Clear"
  },
  {
    text: "Habit is persistence in practice.",
    author: "Octavia Butler"
  },
  {
    text: "Habits are safer than rules; you don't have to watch them. And you don't have to keep them either. They keep you.",
    author: "Frank Crane"
  },
  {
    text: "You cannot change your future, but you can change your habits, and surely your habits will change your future.",
    author: "Abdul Kalam"
  },
  {
    text: "Small habits can yield big results—if you're willing to stick with them for years.",
    author: "James Clear"
  }
];

export function getTodaysQuote(): Quote {
  const today = new Date();
  const dayOfYear = getDayOfYear(today);
  
  // Use the day of the year as a seed to pick a quote
  const quoteIndex = dayOfYear % motivationalQuotes.length;
  
  return motivationalQuotes[quoteIndex];
}

function getDayOfYear(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
