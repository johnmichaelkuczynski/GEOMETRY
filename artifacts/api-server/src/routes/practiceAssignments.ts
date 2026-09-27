import { Router, type IRouter } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  db,
  assignmentsTable,
  problemsTable,
  topicsTable,
  practiceAssignmentsTable,
  practiceAssignmentProblemsTable,
  practiceAssignmentAnswersTable,
  feedbackMessagesTable,
} from "@workspace/db";
import {
  GeneratePracticeAssignmentBody,
  GeneratePracticeAssignmentResponse,
  GetPracticeAssignmentResponse,
  ListPracticeAssignmentsResponseItem,
  SavePracticeAssignmentAnswerBody,
  SubmitPracticeAssignmentResponse,
  PostFeedbackMessageBody,
  PostFeedbackMessageResponse,
  GetFeedbackMessagesResponseItem,
} from "@workspace/api-zod";
import { chatJson } from "../lib/ai";
import { gradeAnswer } from "../lib/grading";
import { getUserId } from "../lib/userId";
import { recordTopicResult, logActivity } from "../lib/profile";

const router: IRouter = Router();

function parseIdParam(raw: unknown): number {
  const s = Array.isArray(raw) ? raw[0] : (raw as string);
  return parseInt(s ?? "", 10);
}

// Collapses a prompt to a comparable key so we can deterministically reject any
// generated problem that duplicates a graded or prior-practice prompt.
function normalizePrompt(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9$+\-=/^().]/g, "")
    .trim();
}

type GeneratedProblem = {
  topicSlug: string;
  prompt: string;
  correctAnswer: string;
  explanation: string;
  hint?: string;
};

function randomizedGeometryProblem(topicTitle: string): GeneratedProblem {
  const int = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
  const topic = topicTitle.toLowerCase();
  const problem = (
    prompt: string,
    correctAnswer: string,
    explanation: string,
    hint: string,
  ): GeneratedProblem => ({ topicSlug: "", prompt, correctAnswer, explanation, hint });

  if (/segments, distance|midpoint|points, lines/.test(topic)) {
    const x1 = 2 * int(-5, 4);
    const y1 = 2 * int(-5, 4);
    if (Math.random() < 0.5) {
      const scale = int(1, 6);
      const x2 = x1 + 3 * scale;
      const y2 = y1 + 4 * scale;
      return problem(
        `Find the distance between $(${x1},${y1})$ and $(${x2},${y2})$.`,
        String(5 * scale),
        `Use the distance formula: $d=\\sqrt{(${x2}-${x1})^2+(${y2}-${y1})^2}=\\sqrt{(3·${scale})^2+(4·${scale})^2}=5·${scale}=${5 * scale}$.`,
        "Use the distance formula, or recognize the scaled 3-4-5 right triangle.",
      );
    }
    const x2 = x1 + 2 * int(1, 5);
    const y2 = y1 + 2 * int(1, 5);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    return problem(
      `Find the midpoint of the segment with endpoints $(${x1},${y1})$ and $(${x2},${y2})$.`,
      `(${mx}, ${my})`,
      `Average the corresponding coordinates: $M=((${x1}+${x2})/2,(${y1}+${y2})/2)=(${mx},${my})$.`,
      "Average the two x-coordinates and the two y-coordinates separately.",
    );
  }
  if (/angles and angle pairs/.test(topic)) {
    const angle = 2 * int(20, 75);
    const supplement = 180 - angle;
    return problem(
      `Two angles form a linear pair. If one measures $${angle}°$, find the other angle.`,
      `${supplement}°`,
      `Linear-pair angles are supplementary, so the other angle is $180°-${angle}°=${supplement}°$.`,
      "Angles in a linear pair have measures that add to 180°.",
    );
  }
  if (/inductive and deductive reasoning/.test(topic)) {
    const converse = Math.random() < 0.5;
    return converse
      ? problem(
          "Write the converse of: If two angles are vertical angles, then they are congruent.",
          "If two angles are congruent, then they are vertical angles.",
          "The converse switches the hypothesis and conclusion.",
          "Reverse the if-part and the then-part.",
        )
      : problem(
          "Write the contrapositive of: If a figure is a square, then it is a rectangle.",
          "If a figure is not a rectangle, then it is not a square.",
          "The contrapositive negates both parts and reverses their order.",
          "Reverse the implication and negate both statements.",
        );
  }
  if (/writing proofs/.test(topic)) {
    const [first, second] = [
      ["AB", "CD"],
      ["PQ", "RS"],
      ["XY", "ZW"],
      ["MN", "OP"],
    ][int(0, 3)]!;
    return problem(
      `Which property justifies the statement: if $${first}=${second}$, then $${second}=${first}$?`,
      "Symmetric property of equality",
      "The symmetric property allows the two sides of an equality to exchange places.",
      "Recall the property that reverses an equality.",
    );
  }
  if (/parallel lines and transversals/.test(topic)) {
    const angle = 2 * int(30, 70);
    return problem(
      `Two parallel lines are cut by a transversal. If one angle is $${angle}°$, find its corresponding angle.`,
      `${angle}°`,
      `Corresponding angles formed by parallel lines are congruent, so the angle also measures $${angle}°$.`,
      "Use the corresponding-angles theorem for parallel lines.",
    );
  }
  if (/constructions/.test(topic)) {
    return problem(
      "What locus contains all points equidistant from the two endpoints of a segment?",
      "The perpendicular bisector of the segment",
      "Every point on a segment's perpendicular bisector is equally distant from its endpoints.",
      "Think of the line that passes through the segment's midpoint at a right angle.",
    );
  }
  if (/triangle angle sum and classification/.test(topic)) {
    const a = int(35, 75);
    const b = int(35, 75);
    const c = 180 - a - b;
    return problem(
      `A triangle has angle measures $${a}°$ and $${b}°$. Find the third angle.`,
      `${c}°`,
      `The angles of a triangle sum to $180°$, so the third angle is $180°-${a}°-${b}°=${c}°$.`,
      "Subtract the two known angles from 180°.",
    );
  }
  if (/rigid motions and congruence/.test(topic)) {
    const x = int(-9, 9);
    const y = int(-9, 9);
    return problem(
      `Reflect the point $(${x},${y})$ across the x-axis.`,
      `(${x}, ${-y})`,
      `Reflection across the x-axis keeps x and changes the sign of y: $(${x},${y})→(${x},${-y})$.`,
      "An x-axis reflection preserves the x-coordinate and negates the y-coordinate.",
    );
  }
  if (/triangle congruence criteria/.test(topic)) {
    const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const [a, b, c, d, e, f] = Array.from({ length: 6 }, () =>
      labels.splice(int(0, labels.length), 1)[0]!,
    );
    const first = `${a}${b}${c}`;
    const second = `${d}${e}${f}`;
    return problem(
      `For comparing $△${first}$ and $△${second}$, list the five triangle congruence criteria.`,
      "SSS, SAS, ASA, AAS, HL",
      "The criteria are side-side-side, side-angle-side, angle-side-angle, angle-angle-side, and hypotenuse-leg.",
      "Include the right-triangle criterion as well as the three side/angle combinations.",
    );
  }
  if (/isosceles triangles and cpctc/.test(topic)) {
    const labels = "ABCDEFGH".split("");
    const apex = labels.splice(int(0, labels.length), 1)[0]!;
    const base1 = labels.splice(int(0, labels.length), 1)[0]!;
    const base2 = labels[int(0, labels.length - 1)]!;
    return problem(
      `In $△${apex}${base1}${base2}$, $${apex}${base1}≅${apex}${base2}$. Which pair of angles must be congruent?`,
      `∠${base1} ≅ ∠${base2}`,
      "The base angles opposite the congruent legs of an isosceles triangle are congruent.",
      "The congruent sides are opposite the congruent base angles.",
    );
  }
  if (/bisectors, medians, and altitudes/.test(topic)) {
    const median = 3 * int(3, 100);
    const vertexPart = (2 * median) / 3;
    const oppositePart = median / 3;
    return problem(
      `A median has length ${median}. How far is the centroid from the vertex on that median?`,
      String(vertexPart),
      `The centroid is two-thirds of the way from the vertex, so its distance is $(2/3)(${median})=${vertexPart}$. The remaining segment is ${oppositePart}.`,
      "The centroid divides a median in a 2:1 ratio, with the longer part next to the vertex.",
    );
  }
  if (/triangle inequalities/.test(topic)) {
    const a = int(4, 12);
    const b = int(4, 12);
    return problem(
      `Two sides of a triangle have lengths ${a} and ${b}. What integer lengths are possible for the third side?`,
      `From ${Math.abs(a - b) + 1} to ${a + b - 1}`,
      `The third side $c$ must satisfy $|${a}-${b}|<c<${a}+${b}$, so its integer values are ${Math.abs(a - b) + 1} through ${a + b - 1}.`,
      "Use the strict triangle inequality: the third side is greater than the difference and less than the sum.",
    );
  }
  if (/quadrilaterals and parallelograms/.test(topic)) {
    const base = int(4, 12);
    const height = int(3, 10);
    return problem(
      `A parallelogram has base ${base} and perpendicular height ${height}. Find its area.`,
      String(base * height),
      `The area is base times perpendicular height: $A=${base}(${height})=${base * height}$.`,
      "Use $A=bh$; the height is perpendicular to the base.",
    );
  }
  if (/dilations and similarity/.test(topic)) {
    const scale = int(2, 5);
    const side = int(3, 10);
    return problem(
      `A dilation has scale factor ${scale}. A segment originally ${side} units long is mapped to a segment of what length?`,
      String(scale * side),
      `A dilation multiplies lengths by its scale factor: $${scale}·${side}=${scale * side}$.`,
      "Multiply the original length by the scale factor.",
    );
  }
  if (/similarity criteria and proportional segments/.test(topic)) {
    const a = int(2, 8);
    const b = int(2, 8);
    const c = int(3, 10);
    return problem(
      `In $△ABC$, $DE∥BC$, with $AD=${a}$, $DB=${b}$, and $AE=${c}$. Find $EC$.`,
      `${(b * c) / a}`,
      `By the side-splitter theorem, $AD/DB=AE/EC$, so $${a}/${b}=${c}/EC$ and $EC=${(b * c) / a}$.`,
      "Set up the proportion of the two corresponding side segments.",
    );
  }
  if (/pythagorean theorem/.test(topic)) {
    const scale = int(1, 12);
    const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]] as const;
    const [baseA, baseB, baseC] = triples[int(0, triples.length - 1)]!;
    const [a, b, c] = [baseA * scale, baseB * scale, baseC * scale];
    return problem(
      `A right triangle has legs ${a} and ${b}. Find its hypotenuse.`,
      String(c),
      `By the Pythagorean theorem, $c^2=${a}^2+${b}^2=${a * a + b * b}$, so $c=${c}$.`,
      "Use $a^2+b^2=c^2$, then take the positive square root.",
    );
  }
  if (/right-triangle trigonometry/.test(topic)) {
    const scale = int(2, 6);
    const opposite = 3 * scale;
    const hypotenuse = 5 * scale;
    return problem(
      `In a right triangle, the side opposite angle $A$ is ${opposite} and the hypotenuse is ${hypotenuse}. Find $\\sin A$.`,
      "3/5",
      `$\\sin A=\\text{opposite}/\\text{hypotenuse}=${opposite}/${hypotenuse}=3/5$.`,
      "Use SOH: sine is opposite over hypotenuse.",
    );
  }
  if (/circles: chords, arcs, and central angles/.test(topic)) {
    const arc = 2 * int(25, 80);
    return problem(
      `A central angle intercepts an arc measuring $${arc}°$. What is the measure of the central angle?`,
      `${arc}°`,
      "A central angle has the same degree measure as its intercepted arc.",
      "For a central angle, the angle and intercepted arc have equal measures.",
    );
  }
  if (/inscribed angles and tangents/.test(topic)) {
    const arc = 2 * int(30, 150);
    return problem(
      `An inscribed angle intercepts an arc measuring $${arc}°$. Find the angle measure.`,
      `${arc / 2}°`,
      `An inscribed angle measures half its intercepted arc: $${arc}°/2=${arc / 2}°$.`,
      "An inscribed angle is half the measure of its intercepted arc.",
    );
  }
  if (/coordinate geometry/.test(topic)) {
    const h = int(-6, 6);
    const k = int(-6, 6);
    const r = int(2, 9);
    const xTerm = h < 0 ? `x+${-h}` : `x-${h}`;
    const yTerm = k < 0 ? `y+${-k}` : `y-${k}`;
    return problem(
      `Write the equation of a circle centered at $(${h},${k})$ with radius ${r}.`,
      `(${xTerm})^2+(${yTerm})^2=${r * r}`,
      `Use $(x-h)^2+(y-k)^2=r^2$: $(${xTerm})^2+(${yTerm})^2=${r * r}$.`,
      "Substitute the center coordinates and the square of the radius.",
    );
  }
  if (/area of polygons/.test(topic)) {
    const b1 = int(4, 12);
    const b2 = int(4, 12);
    const h = 2 * int(2, 8);
    return problem(
      `A trapezoid has bases ${b1} and ${b2} and height ${h}. Find its area.`,
      String((h * (b1 + b2)) / 2),
      `Use $A=\\frac12h(b_1+b_2)=\\frac12(${h})(${b1}+${b2})=${(h * (b1 + b2)) / 2}$.`,
      "Add the two bases, multiply by the height, then divide by 2.",
    );
  }
  if (/circles and sectors/.test(topic)) {
    const radius = 6 * int(1, 3);
    if (Math.random() < 0.5) {
      return problem(
        `Find the area of a circle with radius ${radius}. Give your answer in terms of $π$.`,
        `${radius * radius}π`,
        `Use $A=πr^2=π(${radius})^2=${radius * radius}π$.`,
        "Substitute the radius into the circle area formula.",
      );
    }
    const degrees = 30 * int(1, 11);
    return problem(
      `Find the arc length cut off by a $${degrees}°$ central angle in a circle of radius ${radius}. Give your answer in terms of $π$.`,
      `${(degrees * radius) / 180}π`,
      `Arc length is $s=(θ/360)(2πr)=(${degrees}/360)(2π·${radius})=${(degrees * radius) / 180}π$.`,
      "Use $s=(θ/360)·2πr$ with the central angle in degrees.",
    );
  }
  if (/surface area/.test(topic)) {
    const r = int(2, 8);
    const h = int(3, 12);
    return problem(
      `Find the total surface area of a cylinder with radius ${r} and height ${h}. Give your answer in terms of $π$.`,
      `${2 * r * r}π+${2 * r * h}π`,
      `Use $S=2πr^2+2πrh=2π(${r})^2+2π(${r})(${h})=${2 * r * r}π+${2 * r * h}π$.`,
      "Add the areas of both circular bases and the lateral surface.",
    );
  }
  if (/volume of prisms, cylinders, pyramids, and cones/.test(topic)) {
    const r = int(2, 8);
    const h = 3 * int(2, 8);
    return problem(
      `Find the volume of a cone with radius ${r} and height ${h}. Give your answer in terms of $π$.`,
      `${(r * r * h) / 3}π`,
      `Use $V=\\frac13πr^2h=\\frac13π(${r})^2(${h})=${(r * r * h) / 3}π$.`,
      "A cone has one-third the volume of a cylinder with the same base and height.",
    );
  }
  if (/spheres/.test(topic)) {
    const r = 3 * int(1, 3);
    if (Math.random() < 0.5) {
      return problem(
        `Find the surface area of a sphere with radius ${r}.`,
        `${4 * r * r}π`,
        `Use $S=4πr^2=4π(${r})^2=${4 * r * r}π$.`,
        "Substitute the radius into $S=4πr^2$.",
      );
    }
    return problem(
      `Find the volume of a sphere with radius ${r}. Give your answer in terms of $π$.`,
      `${(4 * r * r * r) / 3}π`,
      `Use $V=\\frac43πr^3=\\frac43π(${r})^3=${(4 * r * r * r) / 3}π$.`,
      "Substitute the radius into $V=\\frac43πr^3$.",
    );
  }
  if (/symmetry and tilings/.test(topic)) {
    const sides = int(3, 8);
    return problem(
      `How many lines of reflectional symmetry does a regular ${sides}-gon have?`,
      String(sides),
      `A regular ${sides}-gon has ${sides} reflection axes.`,
      "A regular polygon has one reflection axis for each vertex.",
    );
  }
  if (/non-euclidean geometry/.test(topic)) {
    const separation = 30 * int(2, 4);
    const sum = 180 + separation;
    return problem(
      `In spherical geometry, a triangle uses two meridians separated by ${separation}° and an equator arc. What is its angle sum?`,
      `${sum}°`,
      `The two angles at the equator are right angles and the polar angle is ${separation}°, so the sum is $90°+90°+${separation}°=${sum}°$.`,
      "The two equator angles are right angles; the angle at the pole equals the meridian separation.",
    );
  }
  if (/capstone synthesis/.test(topic)) {
    // An n-gonal prism is a real convex polyhedron with V=2n, E=3n, F=n+2.
    const sides = int(3, 100);
    const vertices = 2 * sides;
    const edges = 3 * sides;
    const faces = sides + 2;
    return problem(
      `A convex ${sides}-gonal prism has ${vertices} vertices and ${edges} edges. How many faces does it have?`,
      String(faces),
      `Euler's formula gives $V-E+F=2$, so $${vertices}-${edges}+F=2$ and $F=${faces}$.`,
      "Substitute the vertex and edge counts into $V-E+F=2$.",
    );
  }
  if (/circle|polygon|triangle|geometry/.test(topic)) {
    return problem(
      "What is the sum of the exterior angle measures of any convex polygon?",
      "360°",
      "One turn around a convex polygon is $360°$, so its exterior angles sum to $360°$.",
      "Think of the total turning made by traveling once around the polygon.",
    );
  }
  throw new Error(`Cannot generate a Geometry fallback for topic "${topicTitle}".`);
}

// Builds a fresh practice version of a graded assignment. The generator is
// given the real graded prompts (to NEVER reproduce) and the user's prior
// practice prompts for this assignment (to avoid repeats), while mirroring the
// source's kind, topic mix, and problem count.
async function generateProblems(opts: {
  sourceTitle: string;
  kind: string;
  weekNumber: number;
  topics: Array<{ slug: string; title: string }>;
  gradedPrompts: string[];
  priorPrompts: string[];
  count: number;
}): Promise<GeneratedProblem[]> {
  const system = [
    "You are a Geometry instructor authoring a FRESH practice version of a graded assignment.",
    "Produce brand-new problems that test the SAME concepts and difficulty as the graded set, but are clearly different problems (different numbers, scenarios, framing).",
    "CRITICAL RULES:",
    "1. NEVER reproduce, paraphrase, or trivially re-number any of the graded problems provided. They must not overlap.",
    "2. NEVER repeat any of the prior practice problems provided.",
    "3. Each problem must belong to exactly one of the allowed topics (use its slug).",
    "4. Like the graded set, answers should be concise geometric formulas, angle measures, lengths, ratios, areas, volumes, congruence criteria, or brief logical statements. Keep correctAnswer short, never multi-paragraph.",
    "5. Use $...$ for inline LaTeX in prompts/explanations where helpful.",
    "6. Provide a one-line hint that nudges without giving the answer away.",
    'Respond as strict JSON: {"problems": [{"topicSlug": string, "prompt": string, "correctAnswer": string, "explanation": string, "hint": string}]}.',
  ].join("\n");

  const user = JSON.stringify({
    assignment: opts.sourceTitle,
    kind: opts.kind,
    weekNumber: opts.weekNumber,
    problemCount: opts.count,
    allowedTopics: opts.topics,
    gradedProblemsDoNotReproduce: opts.gradedPrompts,
    priorPracticeProblemsDoNotRepeat: opts.priorPrompts,
  });

  const out = await chatJson<{ problems: GeneratedProblem[] }>(system, user);
  const problems = Array.isArray(out.problems) ? out.problems : [];
  return problems.slice(0, opts.count);
}

// POST /practice-assignments — generate a fresh practice version.
router.post("/practice-assignments", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = GeneratePracticeAssignmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { sourceAssignmentId } = parsed.data;

  const [source] = await db
    .select()
    .from(assignmentsTable)
    .where(eq(assignmentsTable.id, sourceAssignmentId));
  if (!source) {
    res.status(404).json({ error: "assignment not found" });
    return;
  }

  // The graded problems (with their topics) define the blueprint.
  const gradedProblems = await db
    .select({
      prompt: problemsTable.prompt,
      topicId: problemsTable.topicId,
      topicSlug: topicsTable.slug,
      topicTitle: topicsTable.title,
    })
    .from(problemsTable)
    .leftJoin(topicsTable, eq(problemsTable.topicId, topicsTable.id))
    .where(eq(problemsTable.assignmentId, sourceAssignmentId))
    .orderBy(asc(problemsTable.position));

  if (gradedProblems.length === 0) {
    res.status(400).json({ error: "source assignment has no problems" });
    return;
  }

  const topicMap = new Map<string, { slug: string; title: string }>();
  for (const g of gradedProblems) {
    if (g.topicSlug) topicMap.set(g.topicSlug, { slug: g.topicSlug, title: g.topicTitle ?? g.topicSlug });
  }

  // Prior practice prompts for this user+source. We fetch ALL of them for the
  // deterministic exclusion set; only the most recent are sent to the LLM as a
  // hint to keep the request bounded.
  const priorRows = await db
    .select({ prompt: practiceAssignmentProblemsTable.prompt })
    .from(practiceAssignmentProblemsTable)
    .innerJoin(
      practiceAssignmentsTable,
      eq(practiceAssignmentProblemsTable.practiceAssignmentId, practiceAssignmentsTable.id),
    )
    .where(
      and(
        eq(practiceAssignmentsTable.userId, userId),
        eq(practiceAssignmentsTable.sourceAssignmentId, sourceAssignmentId),
      ),
    )
    .orderBy(desc(practiceAssignmentProblemsTable.id));

  // Deterministic no-overlap guarantee: any generated problem whose normalized
  // prompt collides with a graded prompt, a prior practice prompt, or another
  // problem in this same batch is rejected — we never trust the LLM alone.
  const gradedPromptList = gradedProblems.map((g) => g.prompt);
  const priorPromptList = priorRows.map((p) => p.prompt);
  const seenKeys = new Set<string>(
    [...gradedPromptList, ...priorPromptList].map(normalizePrompt).filter(Boolean),
  );

  // Resolve topic ids for storing problems.
  const allTopics = await db.select().from(topicsTable);
  const slugToId = new Map(allTopics.map((t) => [t.slug, { id: t.id, title: t.title }]));

  let llmProblems: GeneratedProblem[] = [];
  try {
    llmProblems = await generateProblems({
      sourceTitle: source.title,
      kind: source.kind,
      weekNumber: source.weekNumber,
      topics: Array.from(topicMap.values()),
      gradedPrompts: gradedPromptList,
      priorPrompts: priorPromptList.slice(0, 40),
      count: gradedProblems.length,
    });
  } catch (err) {
    req.log.error({ err }, "practice generation failed");
  }

  // Keep only genuinely fresh problems.
  const generated: GeneratedProblem[] = [];
  for (const gp of llmProblems) {
    const key = normalizePrompt(gp.prompt);
    if (!key || seenKeys.has(key)) continue;
    seenKeys.add(key);
    generated.push(gp);
  }

  // Fallback: if generation produced too few unique problems, synthesize fresh
  // randomized Geometry problems for the exact requested topic, each checked against the same exclusion set, so
  // the user always receives a full, non-repeating practice set.
  if (generated.length < gradedProblems.length) {
    for (let i = generated.length; i < gradedProblems.length; i++) {
      const g = gradedProblems[i]!;
      for (let tries = 0; tries < 25; tries++) {
        const topicTitle = g.topicTitle ?? "";
        let fallback: GeneratedProblem;
        try {
          fallback = randomizedGeometryProblem(topicTitle);
        } catch (err) {
          req.log.error({ err, topicTitle }, "topic-appropriate Geometry fallback unavailable");
          res.status(503).json({
            error: `could not generate a practice problem for topic "${topicTitle || "unknown"}"`,
          });
          return;
        }
        const prompt = `Practice (${g.topicTitle ?? "Geometry"}): ${fallback.prompt}`;
        const key = normalizePrompt(prompt);
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        generated.push({
          topicSlug: g.topicSlug ?? Array.from(topicMap.keys())[0] ?? "",
          prompt,
          correctAnswer: fallback.correctAnswer,
          explanation: fallback.explanation,
          hint: fallback.hint,
        });
        break;
      }
    }
  }

  if (generated.length < gradedProblems.length) {
    res.status(503).json({ error: "could not generate a full, topic-appropriate practice set" });
    return;
  }

  const [created] = await db
    .insert(practiceAssignmentsTable)
    .values({
      userId,
      sourceAssignmentId,
      kind: source.kind,
      title: `Practice — ${source.title}`,
      weekNumber: source.weekNumber,
      status: "in_progress",
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "failed to create" });
    return;
  }

  const fallbackTopicId = gradedProblems[0]!.topicId;
  let position = 1;
  for (const gp of generated) {
    const resolved = slugToId.get(gp.topicSlug);
    const topicId = resolved?.id ?? fallbackTopicId;
    await db.insert(practiceAssignmentProblemsTable).values({
      practiceAssignmentId: created.id,
      topicId,
      position: position++,
      prompt: gp.prompt,
      correctAnswer: gp.correctAnswer,
      explanation: gp.explanation,
      hint: gp.hint ?? null,
      difficulty: 3.0,
    });
  }

  await logActivity({
    userId,
    kind: "practice_generated",
    refId: created.id,
    detail: source.title,
  });

  const detail = await loadDetail(created.id, userId);
  if (!detail) {
    res.status(500).json({ error: "failed to load" });
    return;
  }
  res.json(GeneratePracticeAssignmentResponse.parse(detail));
});

async function loadDetail(id: number, userId: string) {
  const [pa] = await db
    .select()
    .from(practiceAssignmentsTable)
    .where(
      and(eq(practiceAssignmentsTable.id, id), eq(practiceAssignmentsTable.userId, userId)),
    );
  if (!pa) return null;

  const [source] = await db
    .select()
    .from(assignmentsTable)
    .where(eq(assignmentsTable.id, pa.sourceAssignmentId));

  const problems = await db
    .select({
      id: practiceAssignmentProblemsTable.id,
      position: practiceAssignmentProblemsTable.position,
      prompt: practiceAssignmentProblemsTable.prompt,
      topicId: practiceAssignmentProblemsTable.topicId,
      topicTitle: topicsTable.title,
      hint: practiceAssignmentProblemsTable.hint,
      difficulty: practiceAssignmentProblemsTable.difficulty,
      correctAnswer: practiceAssignmentProblemsTable.correctAnswer,
      explanation: practiceAssignmentProblemsTable.explanation,
    })
    .from(practiceAssignmentProblemsTable)
    .leftJoin(topicsTable, eq(practiceAssignmentProblemsTable.topicId, topicsTable.id))
    .where(eq(practiceAssignmentProblemsTable.practiceAssignmentId, id))
    .orderBy(asc(practiceAssignmentProblemsTable.position));

  const answers = await db
    .select()
    .from(practiceAssignmentAnswersTable)
    .where(eq(practiceAssignmentAnswersTable.practiceAssignmentId, id));
  const byProblem = new Map(answers.map((a) => [a.problemId, a]));

  const submitted = pa.status === "submitted";

  return {
    id: pa.id,
    sourceAssignmentId: pa.sourceAssignmentId,
    kind: pa.kind as "homework" | "test" | "midterm" | "final",
    title: pa.title,
    weekNumber: pa.weekNumber,
    status: pa.status as "in_progress" | "submitted",
    scorePercent: pa.scorePercent,
    instructions: source?.instructions ?? null,
    problems: problems.map((p) => ({
      id: p.id,
      position: p.position,
      prompt: p.prompt,
      topicId: p.topicId,
      topicTitle: p.topicTitle ?? null,
      hint: p.hint ?? null,
      difficulty: p.difficulty,
    })),
    answers: problems.map((p) => {
      const a = byProblem.get(p.id);
      return {
        problemId: p.id,
        answer: a?.answer ?? "",
        correct: a?.correct ?? null,
        score: a?.score ?? null,
        feedback: a?.feedback ?? null,
        whatWasRight: a?.whatWasRight ?? null,
        whatToFix: a?.whatToFix ?? null,
        conceptTip: a?.conceptTip ?? null,
        // Only reveal canonical answer/explanation after submission.
        correctAnswer: submitted ? p.correctAnswer : null,
        explanation: submitted ? p.explanation : null,
      };
    }),
  };
}

// GET /practice-assignments?sourceAssignmentId=
router.get("/practice-assignments", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const sourceRaw = req.query.sourceAssignmentId;
  const sourceId = sourceRaw != null ? parseInt(String(sourceRaw), 10) : null;

  const where =
    sourceId != null && Number.isFinite(sourceId)
      ? and(
          eq(practiceAssignmentsTable.userId, userId),
          eq(practiceAssignmentsTable.sourceAssignmentId, sourceId),
        )
      : eq(practiceAssignmentsTable.userId, userId);

  const rows = await db
    .select()
    .from(practiceAssignmentsTable)
    .where(where)
    .orderBy(desc(practiceAssignmentsTable.id));

  const result = await Promise.all(
    rows.map(async (r) => {
      const cnt = await db
        .select({ id: practiceAssignmentProblemsTable.id })
        .from(practiceAssignmentProblemsTable)
        .where(eq(practiceAssignmentProblemsTable.practiceAssignmentId, r.id));
      return {
        id: r.id,
        sourceAssignmentId: r.sourceAssignmentId,
        kind: r.kind as "homework" | "test" | "midterm" | "final",
        title: r.title,
        weekNumber: r.weekNumber,
        status: r.status as "in_progress" | "submitted",
        scorePercent: r.scorePercent,
        problemCount: cnt.length,
        createdAt: r.startedAt.toISOString(),
      };
    }),
  );
  res.json(result.map((r) => ListPracticeAssignmentsResponseItem.parse(r)));
});

// GET /practice-assignments/:id
router.get("/practice-assignments/:id", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const id = parseIdParam(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const detail = await loadDetail(id, userId);
  if (!detail) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(GetPracticeAssignmentResponse.parse(detail));
});

// PUT /practice-assignments/:id/answer
router.put("/practice-assignments/:id/answer", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const id = parseIdParam(req.params.id);
  const parsed = SavePracticeAssignmentAnswerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [pa] = await db
    .select()
    .from(practiceAssignmentsTable)
    .where(
      and(eq(practiceAssignmentsTable.id, id), eq(practiceAssignmentsTable.userId, userId)),
    );
  if (!pa) {
    res.status(404).json({ error: "not found" });
    return;
  }
  if (pa.status !== "in_progress") {
    res.status(400).json({ error: "already submitted" });
    return;
  }
  const { problemId, answer } = parsed.data;
  const [problem] = await db
    .select()
    .from(practiceAssignmentProblemsTable)
    .where(
      and(
        eq(practiceAssignmentProblemsTable.id, problemId),
        eq(practiceAssignmentProblemsTable.practiceAssignmentId, id),
      ),
    );
  if (!problem) {
    res.status(404).json({ error: "problem not found" });
    return;
  }
  const [existing] = await db
    .select()
    .from(practiceAssignmentAnswersTable)
    .where(
      and(
        eq(practiceAssignmentAnswersTable.practiceAssignmentId, id),
        eq(practiceAssignmentAnswersTable.problemId, problemId),
      ),
    );
  if (existing) {
    await db
      .update(practiceAssignmentAnswersTable)
      .set({ answer, updatedAt: new Date() })
      .where(eq(practiceAssignmentAnswersTable.id, existing.id));
  } else {
    await db.insert(practiceAssignmentAnswersTable).values({
      practiceAssignmentId: id,
      problemId,
      answer,
    });
  }
  res.json({ ok: true });
});

type RichFeedback = {
  whatWasRight: string;
  whatToFix: string;
  conceptTip: string;
  feedback: string;
};

async function richFeedbackFor(opts: {
  prompt: string;
  correctAnswer: string;
  userAnswer: string;
  correct: boolean;
  explanation: string;
  topicTitle: string;
}): Promise<RichFeedback> {
  try {
    const out = await chatJson<RichFeedback>(
      [
        "You are an encouraging, surgically precise Geometry tutor giving feedback on ONE practice problem.",
        "Be specific to THIS student's answer — quote what they wrote, name the exact step that went right or wrong, and tie it to the underlying concept.",
        "Use $...$ for inline LaTeX. Keep each field tight and concrete (no fluff).",
        'Respond as strict JSON: {"whatWasRight": string, "whatToFix": string, "conceptTip": string, "feedback": string} where "feedback" is a 2-4 sentence markdown paragraph that ties it together and motivates the next attempt.',
      ].join("\n"),
      JSON.stringify({
        topic: opts.topicTitle,
        prompt: opts.prompt,
        correctAnswer: opts.correctAnswer,
        studentAnswer: opts.userAnswer,
        wasMarkedCorrect: opts.correct,
        canonicalExplanation: opts.explanation,
      }),
    );
    return {
      whatWasRight: out.whatWasRight || (opts.correct ? "You reached a correct result." : ""),
      whatToFix: out.whatToFix || (opts.correct ? "" : "Revisit the formula structure."),
      conceptTip: out.conceptTip || "",
      feedback: out.feedback || opts.explanation,
    };
  } catch {
    return {
      whatWasRight: opts.correct ? "You reached a correct result." : "",
      whatToFix: opts.correct ? "" : "Check the formula structure against the explanation.",
      conceptTip: "",
      feedback: opts.explanation,
    };
  }
}

// Reconstructs the submit result from already-graded, stored answers — used to
// make re-submission idempotent without re-grading or re-logging.
async function loadSubmittedResult(id: number) {
  const problems = await db
    .select({
      id: practiceAssignmentProblemsTable.id,
      correctAnswer: practiceAssignmentProblemsTable.correctAnswer,
      explanation: practiceAssignmentProblemsTable.explanation,
      topicId: practiceAssignmentProblemsTable.topicId,
      topicTitle: topicsTable.title,
    })
    .from(practiceAssignmentProblemsTable)
    .leftJoin(topicsTable, eq(practiceAssignmentProblemsTable.topicId, topicsTable.id))
    .where(eq(practiceAssignmentProblemsTable.practiceAssignmentId, id))
    .orderBy(asc(practiceAssignmentProblemsTable.position));

  const answers = await db
    .select()
    .from(practiceAssignmentAnswersTable)
    .where(eq(practiceAssignmentAnswersTable.practiceAssignmentId, id));
  const byProblem = new Map(answers.map((a) => [a.problemId, a]));

  let score = 0;
  const perProblem = problems.map((p) => {
    const a = byProblem.get(p.id);
    if (a?.correct) score += 1;
    return {
      problemId: p.id,
      correct: a?.correct ?? false,
      score: a?.score ?? 0,
      userAnswer: a?.answer ?? "",
      correctAnswer: p.correctAnswer,
      explanation: p.explanation,
      feedback: a?.feedback ?? "",
      whatWasRight: a?.whatWasRight ?? null,
      whatToFix: a?.whatToFix ?? null,
      conceptTip: a?.conceptTip ?? null,
      topicId: p.topicId,
      topicTitle: p.topicTitle ?? null,
    };
  });

  const total = problems.length;
  return {
    id,
    score,
    total,
    percent: total === 0 ? 0 : (score / total) * 100,
    overallFeedback: null as string | null,
    perProblem,
  };
}

// POST /practice-assignments/:id/submit
router.post("/practice-assignments/:id/submit", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const id = parseIdParam(req.params.id);
  const [pa] = await db
    .select()
    .from(practiceAssignmentsTable)
    .where(
      and(eq(practiceAssignmentsTable.id, id), eq(practiceAssignmentsTable.userId, userId)),
    );
  if (!pa) {
    res.status(404).json({ error: "not found" });
    return;
  }

  // Idempotent: never re-grade an already-submitted set. Re-grading would
  // re-run recordTopicResult + logActivity and inflate the per-user profile and
  // readiness signals. Return the stored result instead.
  if (pa.status !== "in_progress") {
    res.json(SubmitPracticeAssignmentResponse.parse(await loadSubmittedResult(id)));
    return;
  }

  const problems = await db
    .select({
      id: practiceAssignmentProblemsTable.id,
      prompt: practiceAssignmentProblemsTable.prompt,
      correctAnswer: practiceAssignmentProblemsTable.correctAnswer,
      explanation: practiceAssignmentProblemsTable.explanation,
      topicId: practiceAssignmentProblemsTable.topicId,
      topicTitle: topicsTable.title,
    })
    .from(practiceAssignmentProblemsTable)
    .leftJoin(topicsTable, eq(practiceAssignmentProblemsTable.topicId, topicsTable.id))
    .where(eq(practiceAssignmentProblemsTable.practiceAssignmentId, id))
    .orderBy(asc(practiceAssignmentProblemsTable.position));

  const answers = await db
    .select()
    .from(practiceAssignmentAnswersTable)
    .where(eq(practiceAssignmentAnswersTable.practiceAssignmentId, id));
  const byProblem = new Map(answers.map((a) => [a.problemId, a]));

  const perProblem = [];
  let score = 0;
  for (const p of problems) {
    const a = byProblem.get(p.id);
    const userAnswer = a?.answer ?? "";
    const graded = await gradeAnswer({
      prompt: p.prompt,
      correctAnswer: p.correctAnswer,
      userAnswer,
    });
    const numericScore = graded.correct ? 1 : 0;
    if (graded.correct) score += 1;

    const rich = await richFeedbackFor({
      prompt: p.prompt,
      correctAnswer: p.correctAnswer,
      userAnswer,
      correct: graded.correct,
      explanation: graded.explanation || p.explanation,
      topicTitle: p.topicTitle ?? "Geometry",
    });

    // Persist the answer row with feedback (create if missing).
    if (a) {
      await db
        .update(practiceAssignmentAnswersTable)
        .set({
          correct: graded.correct,
          score: numericScore,
          feedback: rich.feedback,
          whatWasRight: rich.whatWasRight,
          whatToFix: rich.whatToFix,
          conceptTip: rich.conceptTip,
          gradedAt: new Date(),
        })
        .where(eq(practiceAssignmentAnswersTable.id, a.id));
    } else {
      await db.insert(practiceAssignmentAnswersTable).values({
        practiceAssignmentId: id,
        problemId: p.id,
        answer: userAnswer,
        correct: graded.correct,
        score: numericScore,
        feedback: rich.feedback,
        whatWasRight: rich.whatWasRight,
        whatToFix: rich.whatToFix,
        conceptTip: rich.conceptTip,
        gradedAt: new Date(),
      });
    }

    // Update the evolving per-topic profile + activity log.
    await recordTopicResult({
      userId,
      topicId: p.topicId,
      correct: graded.correct,
      score: numericScore,
    });
    await logActivity({
      userId,
      kind: "practice_problem_graded",
      refId: id,
      topicId: p.topicId,
      score: numericScore,
    });

    perProblem.push({
      problemId: p.id,
      correct: graded.correct,
      score: numericScore,
      userAnswer,
      correctAnswer: p.correctAnswer,
      explanation: graded.explanation || p.explanation,
      feedback: rich.feedback,
      whatWasRight: rich.whatWasRight || null,
      whatToFix: rich.whatToFix || null,
      conceptTip: rich.conceptTip || null,
      topicId: p.topicId,
      topicTitle: p.topicTitle ?? null,
    });
  }

  const total = problems.length;
  const percent = total === 0 ? 0 : (score / total) * 100;
  await db
    .update(practiceAssignmentsTable)
    .set({ status: "submitted", submittedAt: new Date(), scorePercent: percent })
    .where(eq(practiceAssignmentsTable.id, id));

  await logActivity({
    userId,
    kind: "practice_submitted",
    refId: id,
    score: percent / 100,
    detail: pa.title,
  });

  let overallFeedback: string | null = null;
  try {
    const out = await chatJson<{ summary: string }>(
      "You are a motivating Geometry tutor. Given a student's practice results, write a 2-3 sentence encouraging summary that names their strongest geometry topic and the single most important skill to drill before the graded version. Use $...$ for any LaTeX. Respond as strict JSON: {\"summary\": string}.",
      JSON.stringify({
        title: pa.title,
        percent: Math.round(percent),
        perProblem: perProblem.map((p) => ({
          topic: p.topicTitle,
          correct: p.correct,
        })),
      }),
    );
    overallFeedback = out.summary || null;
  } catch {
    overallFeedback = null;
  }

  res.json(
    SubmitPracticeAssignmentResponse.parse({
      id,
      score,
      total,
      percent,
      overallFeedback,
      perProblem,
    }),
  );
});

// GET /practice-assignments/:id/dialogue
router.get("/practice-assignments/:id/dialogue", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const id = parseIdParam(req.params.id);
  const [pa] = await db
    .select()
    .from(practiceAssignmentsTable)
    .where(
      and(eq(practiceAssignmentsTable.id, id), eq(practiceAssignmentsTable.userId, userId)),
    );
  if (!pa) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const rows = await db
    .select()
    .from(feedbackMessagesTable)
    .where(eq(feedbackMessagesTable.practiceAssignmentId, id))
    .orderBy(asc(feedbackMessagesTable.id));
  res.json(
    rows.map((m) =>
      GetFeedbackMessagesResponseItem.parse({
        id: m.id,
        role: m.role as "user" | "tutor",
        content: m.content,
        problemId: m.problemId,
        createdAt: m.createdAt.toISOString(),
      }),
    ),
  );
});

// POST /practice-assignments/:id/dialogue — ask a follow-up about the feedback.
router.post("/practice-assignments/:id/dialogue", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const id = parseIdParam(req.params.id);
  const parsed = PostFeedbackMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { problemId, message } = parsed.data;

  const [pa] = await db
    .select()
    .from(practiceAssignmentsTable)
    .where(
      and(eq(practiceAssignmentsTable.id, id), eq(practiceAssignmentsTable.userId, userId)),
    );
  if (!pa) {
    res.status(404).json({ error: "not found" });
    return;
  }

  // Ground the dialogue in the specific problem + the student's graded answer.
  let context = "";
  if (problemId != null) {
    const [problem] = await db
      .select()
      .from(practiceAssignmentProblemsTable)
      .where(
        and(
          eq(practiceAssignmentProblemsTable.id, problemId),
          eq(practiceAssignmentProblemsTable.practiceAssignmentId, id),
        ),
      );
    const [answer] = await db
      .select()
      .from(practiceAssignmentAnswersTable)
      .where(
        and(
          eq(practiceAssignmentAnswersTable.practiceAssignmentId, id),
          eq(practiceAssignmentAnswersTable.problemId, problemId),
        ),
      );
    if (problem) {
      context = JSON.stringify({
        prompt: problem.prompt,
        correctAnswer: problem.correctAnswer,
        explanation: problem.explanation,
        studentAnswer: answer?.answer ?? "",
        wasCorrect: answer?.correct ?? null,
        priorFeedback: answer?.feedback ?? "",
      });
    }
  }

  // Recent thread for continuity (same scope).
  const history = await db
    .select()
    .from(feedbackMessagesTable)
    .where(eq(feedbackMessagesTable.practiceAssignmentId, id))
    .orderBy(desc(feedbackMessagesTable.id))
    .limit(10);
  const recent = history
    .reverse()
    .filter((m) => (problemId == null ? m.problemId == null : m.problemId === problemId))
    .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n");

  // Store the student's message.
  await db.insert(feedbackMessagesTable).values({
    userId,
    practiceAssignmentId: id,
    problemId: problemId ?? null,
    role: "user",
    content: message,
  });

  let reply = "";
  try {
    reply = (
      await chatJson<{ reply: string }>(
        [
          "You are a patient Geometry tutor continuing a conversation about feedback on a practice problem.",
          "Answer the student's question directly and concretely, referencing their actual answer and the problem when relevant. Use $...$ for LaTeX. Keep it to a few sentences unless they ask for a full worked solution.",
          'Respond as strict JSON: {"reply": string}.',
        ].join("\n"),
        JSON.stringify({
          problemContext: context || "(general question about this practice assignment)",
          conversationSoFar: recent,
          studentQuestion: message,
        }),
      )
    ).reply;
  } catch (err) {
    req.log.error({ err }, "feedback dialogue failed");
    reply = "Sorry — I had trouble generating a reply. Please try asking again.";
  }

  const [stored] = await db
    .insert(feedbackMessagesTable)
    .values({
      userId,
      practiceAssignmentId: id,
      problemId: problemId ?? null,
      role: "tutor",
      content: reply,
    })
    .returning();

  await logActivity({ userId, kind: "feedback_dialogue", refId: id });

  res.json(
    PostFeedbackMessageResponse.parse({
      id: stored!.id,
      role: "tutor",
      content: reply,
      problemId: problemId ?? null,
      createdAt: stored!.createdAt.toISOString(),
    }),
  );
});

export default router;
