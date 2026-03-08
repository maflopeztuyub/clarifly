import type { GeneratedTask, PriorityLevel, ClarityLevel } from '@/types';

interface TaskPattern {
  regex: RegExp;
  priority: PriorityLevel;
  clarity: ClarityLevel;
}

// Patterns to identify different types of tasks in transcripts
const TASK_PATTERNS: TaskPattern[] = [
  // Time-bound with specific pages/numbers
  {
    regex: /read (?:pages?|chapter|chapters) [\d\-\s,]+/i,
    priority: 'high',
    clarity: 'clear',
  },
  // Deadlines
  {
    regex: /(due|submit|turn in|deliver).*?(monday|tuesday|wednesday|thursday|friday|next class|end of|before|by)/i,
    priority: 'high',
    clarity: 'clear',
  },
  // Homework/assignments with numbers
  {
    regex: /(solve|complete|finish|do).*?problem(s)?.*?[\d\-\s,]+/i,
    priority: 'medium',
    clarity: 'clear',
  },
  // Group work
  {
    regex: /group|presentation|outline|together/i,
    priority: 'high',
    clarity: 'somewhat unclear',
  },
  // Study related
  {
    regex: /study|review|prepare|memorize/i,
    priority: 'medium',
    clarity: 'somewhat unclear',
  },
  // Question/discussion
  {
    regex: /question|discuss|bring.*(?:idea|thought|source)/i,
    priority: 'medium',
    clarity: 'clear',
  },
];

function extractTasksFromTranscript(transcript: string): Array<{ text: string; priority: PriorityLevel; clarity: ClarityLevel }> {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const tasks: Array<{ text: string; priority: PriorityLevel; clarity: ClarityLevel }> = [];

  for (const sentence of sentences) {
    let priority: PriorityLevel = 'medium';
    let clarity: ClarityLevel = 'clear';

    for (const pattern of TASK_PATTERNS) {
      if (pattern.regex.test(sentence)) {
        priority = pattern.priority;
        clarity = pattern.clarity;
        break;
      }
    }

    // If contains time markers, likely high priority
    if (/monday|tuesday|wednesday|thursday|friday|tomorrow|today|next|before|by/i.test(sentence)) {
      priority = 'high';
    }

    // If contains uncertain language, clarify is unclear
    if (/maybe|might|could|possibly|try to/i.test(sentence)) {
      clarity = 'somewhat unclear';
    }

    // If contains very vague language, it's unclear
    if (/sort of|kind of|basically|i guess|um|uh|like/i.test(sentence)) {
      clarity = 'unclear';
    }

    if (sentence.trim().length > 10) {
      tasks.push({
        text: sentence.trim(),
        priority,
        clarity,
      });
    }
  }

  return tasks;
}

function rephraseTasks(tasks: Array<{ text: string; priority: PriorityLevel; clarity: ClarityLevel }>): GeneratedTask[] {
  return tasks.map((task, index) => {
    const rephrased = smartRephraseTask(task.text);
    const assessment = generateFulfillmentAssessment(task.text);
    const nextStep = generateSuggestedNextStep(task.text);
    const confidence = calculateConfidence(task.text);

    return {
      id: `task-${index}-${Date.now()}`,
      original: task.text,
      rephrased,
      priority: task.priority,
      clarity: task.clarity,
      fulfillmentAssessment: assessment,
      suggestedNextStep: nextStep,
      confidence,
    };
  });
}

function smartRephraseTask(original: string): string {
  let rephrased = original.trim();

  // Add context if missing
  if (/read|pages?|chapter/i.test(rephrased) && !/by\s|before\s|due/i.test(rephrased)) {
    rephrased = rephrased.replace(/(read.*)/i, 'Before the next class, $1.');
  }

  // Make verbs clearer
  rephrased = rephrased
    .replace(/finish the worksheet/i, 'complete all questions on the worksheet')
    .replace(/prepare one research source/i, 'prepare one research source and be ready to explain it')
    .replace(/bring one question/i, 'write down one thoughtful question about the reading')
    .replace(/solve problems ([\d\-,\s]+)/i, 'solve all problems: $1')
    .replace(/study the formulas/i, 'review and memorize the formulas we covered in class');

  // Add priority indicators
  if (/due|deadline|submit|before|by/i.test(rephrased) && !/when\s|by\s|before\s/i.test(rephrased.substring(0, 20))) {
    if (!rephrased.match(/^(before|by|when)/i)) {
      rephrased = `Complete this task: ${rephrased}`;
    }
  }

  // Ensure it ends with a period
  if (!rephrased.endsWith('.') && !rephrased.endsWith('!') && !rephrased.endsWith('?')) {
    rephrased += '.';
  }

  return rephrased;
}

function generateFulfillmentAssessment(original: string): string {
  const hasDeadline = /due|monday|tuesday|wednesday|thursday|friday|before|by/i.test(original);
  const hasSpecifics = /[\d\-,\s]+(pages?|chapter|problems?|sources?|words?)/.test(original);
  const isClear = /read|complete|submit|prepare|solve|write/i.test(original);

  if (hasDeadline && hasSpecifics && isClear) {
    return 'Actionable and time-bound with clear expectations.';
  } else if (hasDeadline && hasSpecifics) {
    return 'Time-bound with specific requirements, but wording could be clearer.';
  } else if (hasSpecifics) {
    return 'Has specific requirements but missing a clear deadline.';
  } else if (hasDeadline) {
    return 'Time-bound but needs more specific details to be fully actionable.';
  } else {
    return 'Unclear requirements; seek clarification from instructor.';
  }
}

function generateSuggestedNextStep(original: string): string {
  const match = original.match(/(monday|tuesday|wednesday|thursday|friday|next class|before|by|due)(.*?)$/i);

  if (match) {
    const deadline = match[1].toLowerCase();
    const dayMap: Record<string, string> = {
      monday: 'Sunday evening',
      tuesday: 'Monday evening',
      wednesday: 'Tuesday evening',
      thursday: 'Wednesday evening',
      friday: 'Thursday evening',
      'next class': 'Today or tomorrow',
      'before': 'As soon as possible',
      'by': 'At least one day before',
      'due': 'At least two days before',
    };

    const suggestedDay = dayMap[deadline] || 'Soon';
    return `Add to your planner for ${suggestedDay} to ensure timely completion.`;
  }

  return 'Break this task into smaller steps and start immediately.';
}

function calculateConfidence(original: string): number {
  let confidence = 0.5;

  // Has clear verbs
  if (/read|complete|submit|prepare|solve|write|study|bring/i.test(original)) {
    confidence += 0.15;
  }

  // Has specific numbers
  if (/[\d\-,\s]+(pages?|chapter|problems?|sources?|words?)/.test(original)) {
    confidence += 0.15;
  }

  // Has clear deadline
  if (/monday|tuesday|wednesday|thursday|friday|next class|before|by|due|week/i.test(original)) {
    confidence += 0.2;
  }

  return Math.min(confidence, 0.95);
}

export function generateTasksFromTranscript(transcript: string): GeneratedTask[] {
  if (!transcript || transcript.trim().length === 0) {
    return [];
  }

  const extractedTasks = extractTasksFromTranscript(transcript);
  const generatedTasks = rephraseTasks(extractedTasks);

  // Sort by priority (high -> medium -> low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  generatedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return generatedTasks;
}
