/**
 * Pre-defined templates for InkPad
 */

export interface Template {
    id: string;
    name: string;
    description: string;
    category: 'academic' | 'creative' | 'professional' | 'personal';
    content: string;
}

export const TEMPLATES: Template[] = [
    {
        id: 'assignment-cover',
        name: 'Assignment Cover Page',
        description: 'Standard academic cover page structure.',
        category: 'academic',
        content: `[UNIVERSITY NAME]
[DEPARTMENT NAME]

COURSE: [Course Title]
ASSIGNMENT: [Assignment Name]

SUBMITTED BY: [Your Name]
STUDENT ID: [Your ID]
DATE: [Current Date]

INSTRUCTOR: [Instructor Name]`
    },
    {
        id: 'formal-letter',
        name: 'Formal Letter',
        description: 'Professional correspondence format.',
        category: 'professional',
        content: `[Your Name]
[Your Address]
[City, State, Zip]

[Date]

[Recipient Name]
[Recipient Position]
[Company Name]
[Address]

Dear [Recipient Name],

I am writing to...

Sincerely,

[Your Name]`
    },
    {
        id: 'essay-outline',
        name: 'Essay Outline',
        description: 'Structured outline for academic writing.',
        category: 'academic',
        content: `TITLE: [Project Title]

I. INTRODUCTION
   A. Hook
   B. Context
   C. Thesis Statement

II. BODY PARAGRAPH 1
    A. Topic Sentence
    B. Evidence
    C. Analysis

III. BODY PARAGRAPH 2
     A. Topic Sentence
     B. Evidence
     C. Analysis

IV. CONCLUSION
    A. Restate Thesis
    B. Synthesis of Main Points
    C. Final Thought`
    },
    {
        id: 'lab-report',
        name: 'Lab Report Structure',
        description: 'Scientific reporting framework.',
        category: 'academic',
        content: `TITLE: [Experiment Name]
DATE: [Date]
PARTNERS: [Names]

1. OBJECTIVE
   What is the goal of this experiment?

2. HYPOTHESIS
   What do you expect to happen?

3. MATERIALS
   - [Item 1]
   - [Item 2]

4. PROCEDURE
   Step-by-step methodology.

5. RESULTS
   Observations and data.

6. CONCLUSION
   Summary of findings.`
    },
    {
        id: 'creative-prompt-1',
        name: 'Creative Prompt: The Mist',
        description: 'A starting point for a mystery story.',
        category: 'creative',
        content: `The fog rolled in from the harbor, thick and smelling of salt and something else—something metallic. I looked out the window and realized the streetlights weren't just dim; they were disappearing one by one.

Then, there was a knock. Not on the door, but on the glass of the second-story window.`
    },
    {
        id: 'meeting-notes',
        name: 'Meeting Notes',
        description: 'Professional meeting minute template.',
        category: 'professional',
        content: `MEETING: [Project/Team Name]
DATE: [Date]
ATTENDEES: [Names]

AGENDA:
1. Review previous actions
2. Current status update
3. New business

ACTION ITEMS:
- [Person] [Task] [Deadline]

NEXT MEETING: [Date/Time]`
    },
    {
        id: 'to-do-list',
        name: 'To-Do List',
        description: 'Simple daily task tracker.',
        category: 'personal',
        content: `DATE: [Current Date]

REQUIRED (High Priority):
[ ] 
[ ] 

SECONDARY (Low Priority):
- 
- 

NOTES:
`
    },
    {
        id: 'apology-letter',
        name: 'Apology Letter',
        description: 'Warm, personal apology format.',
        category: 'personal',
        content: `Dear [Name],

I am writing because I wanted to sincerely apologize for [what happened]. 

I value our relationship and I hope you can forgive me for [the mistake].

Best,

[Your Name]`
    }
];
