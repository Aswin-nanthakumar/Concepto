export const BLOOM_LEVELS = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']

export const BLOOM_COLORS = {
  remember: '#3B82F6',
  understand: '#10B981',
  apply: '#F59E0B',
  analyze: '#EF4444',
  evaluate: '#8B5CF6',
  create: '#EC4899',
}

export const BLOOM_META = {
  remember: { label: 'Remember', desc: 'Recall facts and basic concepts', verbs: ['define', 'list', 'recall', 'identify'] },
  understand: { label: 'Understand', desc: 'Explain ideas and concepts', verbs: ['explain', 'summarize', 'interpret', 'classify'] },
  apply: { label: 'Apply', desc: 'Use knowledge in new situations', verbs: ['apply', 'solve', 'demonstrate', 'implement'] },
  analyze: { label: 'Analyze', desc: 'Draw connections among ideas', verbs: ['analyze', 'compare', 'examine', 'categorize'] },
  evaluate: { label: 'Evaluate', desc: 'Justify decisions and judgments', verbs: ['evaluate', 'justify', 'critique', 'assess'] },
  create: { label: 'Create', desc: 'Produce original work', verbs: ['design', 'construct', 'develop', 'compose'] },
}

export const CONTENT_TYPES = {
  chapter: { label: 'Chapter', icon: 'BookOpen' },
  lesson: { label: 'Lesson Plan', icon: 'Presentation' },
  syllabus: { label: 'Syllabus', icon: 'ScrollText' },
  course: { label: 'Course Description', icon: 'GraduationCap' },
  transcript: { label: 'Transcript', icon: 'Mic' },
}

export const SAMPLE_TEXTS = [
  {
    id: 'photosynthesis',
    title: 'Biology: Photosynthesis',
    type: 'chapter',
    text: `Chapter 7: Photosynthesis — Converting Light into Life

Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy stored in glucose. The overall equation is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2.

The process occurs in two main stages. First, the light-dependent reactions take place in the thylakoid membranes of the chloroplast. Here, chlorophyll absorbs photons, splitting water molecules (photolysis) and releasing oxygen. This stage produces ATP and NADPH, the energy carriers of the cell.

Second, the Calvin cycle (light-independent reactions) occurs in the stroma. ATP and NADPH drive the fixation of carbon dioxide into a three-carbon compound, which is then assembled into glucose through a series of enzyme-catalyzed steps. The enzyme RuBisCO, the most abundant protein on Earth, catalyzes the first step of carbon fixation.

Several factors affect the rate of photosynthesis: light intensity, carbon dioxide concentration, temperature, and water availability. Farmers exploit this knowledge in greenhouses by enriching CO2 levels to boost crop yields.

Understanding photosynthesis matters beyond biology class. It underpins agriculture, climate science, and renewable energy research — from engineering more efficient crops to designing artificial leaves that mimic nature's solar panels.`,
  },
  {
    id: 'fractions',
    title: 'Math: Fractions Lesson Plan',
    type: 'lesson',
    text: `Lesson Plan: Introduction to Fractions (Grade 4)

Objective of this lesson: students will understand what fractions represent and compare simple fractions.

Warm-up (10 min): Display a pizza cut into 8 slices with 3 slices eaten. Ask: what portion remains? Introduce vocabulary: numerator, denominator, whole.

Direct instruction (15 min): Define a fraction as part of a whole. The denominator names the total equal parts; the numerator counts the parts we consider. Model examples on the number line: 1/2, 1/4, 3/4. Demonstrate equivalent fractions using fraction strips: 1/2 = 2/4 = 4/8.

Guided practice (15 min): Pairs shade fraction models and write the matching fraction. Circulate and check for the common misconception that a bigger denominator means a bigger fraction — use visual models to correct it.

Independent work (10 min): Worksheet — (1) label shaded parts, (2) compare pairs with <, >, =, (3) challenge: order 1/3, 1/2, 3/4 on a number line.

Exit ticket: Draw and label a fraction of your choice, then explain in one sentence what its numerator and denominator mean.`,
  },
  {
    id: 'ww2',
    title: 'History: Causes of WWII (Transcript)',
    type: 'transcript',
    text: `Lecture Transcript — HIST 201: The Causes of World War II

[00:00] Professor: Good morning. Today we examine why the world went to war again, just twenty years after the so-called war to end all wars.

[01:12] First, the Treaty of Versailles. Germany was forced to accept full war guilt, pay crushing reparations, and surrender territory. The economic collapse and national humiliation created fertile ground for extremism.

[04:30] Second, the failure of appeasement. Britain and France, desperate to avoid another war, allowed Hitler to remilitarize the Rhineland, annex Austria, and seize the Sudetenland at Munich in 1938. Each concession emboldened further aggression.

[08:05] Third, the global depression. Mass unemployment destabilized democracies and discredited liberal capitalism in the eyes of many. Authoritarian movements promising order and jobs surged across Europe and Japan.

[11:40] Finally, expansionist ideologies — Lebensraum in Germany, the Greater East Asia Co-Prosperity Sphere in Japan, and imperial ambitions in Italy — made conflict over territory almost inevitable once diplomacy failed.

[14:20] So was the war inevitable? Historians debate this fiercely. The structural pressures were enormous, but individual decisions — at Munich, in Tokyo, in Berlin — still mattered. For Thursday, compare two historians' arguments and be ready to defend your own position.`,
  },
]

export const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard', icon: 'LayoutDashboard', end: true },
  { to: '/app/upload', label: 'Upload Content', icon: 'UploadCloud' },
  { to: '/app/extraction', label: 'Objective Extraction', icon: 'Target' },
  { to: '/app/bloom', label: 'Bloom Analysis', icon: 'Pyramid' },
  { to: '/app/concepts', label: 'Concept Explorer', icon: 'Network' },
  { to: '/app/assessments', label: 'Assessments', icon: 'ClipboardCheck' },
  { to: '/app/analytics', label: 'Analytics', icon: 'BarChart3' },
  { to: '/app/export', label: 'Export Center', icon: 'Download' },
  { to: '/app/history', label: 'History', icon: 'History' },
  { to: '/app/settings', label: 'Settings', icon: 'Settings' },
]
