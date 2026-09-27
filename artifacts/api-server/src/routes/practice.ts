import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  db,
  topicsTable,
  practiceSessionsTable,
  practiceProblemsTable,
  practiceAttemptsTable,
} from "@workspace/db";
import {
  StartPracticeSessionBody,
  StartPracticeSessionResponse,
  NextPracticeProblemBody,
  NextPracticeProblemResponse,
  GradePracticeAnswerBody,
  GradePracticeAnswerResponse,
} from "@workspace/api-zod";
import { chatJson } from "../lib/ai";
import { getUserId } from "../lib/userId";
import { gradeAnswer } from "../lib/grading";

const router: IRouter = Router();

function parseIdParam(raw: unknown): number {
  const s = Array.isArray(raw) ? raw[0] : (raw as string);
  return parseInt(s ?? "", 10);
}

function geometryFallbackProblem(topicTitle: string, difficulty: number): {
  prompt: string;
  correctAnswer: string;
  explanation: string;
} {
  const int = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
  const topic = topicTitle.toLowerCase();
  const level = Math.max(1, Math.min(5, Math.round(difficulty)));
  if (/points, lines, and planes/.test(topic)) {
    return {
      prompt: "How many distinct lines pass through two given points?",
      correctAnswer: "Exactly one",
      explanation: "The two-point postulate states that exactly one line passes through any two points.",
    };
  }
  if (/segments, distance, and midpoints/.test(topic)) {
    const x1 = int(-level, level);
    const x2 = x1 + int(2, level + 3);
    return {
      prompt: `Find the midpoint of the segment with endpoints $(${x1},0)$ and $(${x2},0)$.`,
      correctAnswer: `(${(x1 + x2) / 2},0)`,
      explanation: `Average the endpoint coordinates: $(${x1}+${x2})/2=${(x1 + x2) / 2}$, so the midpoint is $(${(x1 + x2) / 2},0)$.`,
    };
  }
  if (/angles and angle pairs/.test(topic)) {
    const angle = int(25, 145);
    return {
      prompt: `An angle is supplementary to a ${angle}° angle. Find its measure.`,
      correctAnswer: `${180 - angle}°`,
      explanation: `Supplementary angles sum to $180°$, so the measure is $180°-${angle}°=${180 - angle}°$.`,
    };
  }
  if (/inductive and deductive reasoning/.test(topic)) {
    return {
      prompt: "What is the converse of: If two angles are vertical angles, then they are congruent?",
      correctAnswer: "If two angles are congruent, then they are vertical angles.",
      explanation: "The converse switches the hypothesis and conclusion.",
    };
  }
  if (/writing proofs/.test(topic)) {
    return {
      prompt: "If $AB=CD$ and $CD=EF$, what property proves $AB=EF$?",
      correctAnswer: "Transitive property of equality",
      explanation: "If one quantity equals a second and the second equals a third, the first equals the third.",
    };
  }
  if (/parallel lines and transversals/.test(topic)) {
    const angle = int(35, 145);
    return {
      prompt: `Two parallel lines are cut by a transversal. A corresponding angle measures ${angle}°. Find the other corresponding angle.`,
      correctAnswer: `${angle}°`,
      explanation: "Corresponding angles formed by parallel lines and a transversal are congruent.",
    };
  }
  if (/constructions/.test(topic)) {
    return {
      prompt: "What locus does a perpendicular bisector of a segment represent?",
      correctAnswer: "Points equidistant from the segment's endpoints",
      explanation: "Every point on a segment's perpendicular bisector is the same distance from both endpoints.",
    };
  }
  if (/triangle angle sum and classification/.test(topic)) {
    const a = int(35, 75);
    const b = int(35, 180 - a - 10);
    return {
      prompt: `A triangle has angles ${a}° and ${b}°. Find its third angle.`,
      correctAnswer: `${180 - a - b}°`,
      explanation: `Triangle angles sum to $180°$: $180°-${a}°-${b}°=${180 - a - b}°$.`,
    };
  }
  if (/rigid motions and congruence/.test(topic)) {
    const x = int(-5, 5);
    const y = int(-5, 5);
    return {
      prompt: `Reflect the point $(${x},${y})$ across the x-axis.`,
      correctAnswer: `(${x},${-y})`,
      explanation: "Reflection across the x-axis keeps the x-coordinate and changes the sign of the y-coordinate.",
    };
  }
  if (/triangle congruence criteria/.test(topic)) {
    return {
      prompt: "Which triangle congruence criterion uses two sides and the included angle?",
      correctAnswer: "SAS",
      explanation: "SAS proves congruence when two corresponding sides and their included angles match.",
    };
  }
  if (/isosceles triangles and cpctc/.test(topic)) {
    const baseAngle = int(30, 70);
    return {
      prompt: `In isosceles $△ABC$, $AB≅AC$. If $m∠B=${baseAngle}°$, find $m∠C$.`,
      correctAnswer: `${baseAngle}°`,
      explanation: "Angles opposite congruent sides of an isosceles triangle are congruent.",
    };
  }
  if (/bisectors, medians, and altitudes/.test(topic)) {
    return {
      prompt: "In what ratio does the centroid divide a median, measured from the vertex?",
      correctAnswer: "2:1",
      explanation: "The centroid is two-thirds of the way from a vertex to the opposite side's midpoint.",
    };
  }
  if (/triangle inequalities/.test(topic)) {
    const a = int(5, 10);
    const b = int(6, 12);
    return {
      prompt: `Two sides of a triangle are ${a} and ${b}. Give the strict range for the third side $x$.`,
      correctAnswer: `${Math.abs(a - b)}<x<${a + b}`,
      explanation: `The third side must be greater than the difference and less than the sum: $${Math.abs(a - b)}<x<${a + b}$.`,
    };
  }
  if (/quadrilaterals and parallelograms/.test(topic)) {
    const angle = int(55, 125);
    return {
      prompt: `One angle of a parallelogram measures ${angle}°. Find the measure of an adjacent angle.`,
      correctAnswer: `${180 - angle}°`,
      explanation: "Consecutive angles in a parallelogram are supplementary, so their measures sum to $180°$.",
    };
  }
  if (/dilations and similarity/.test(topic)) {
    const k = int(2, 4);
    const x = int(1, 5);
    const y = int(1, 5);
    return {
      prompt: `Dilate $(${x},${y})$ about the origin by scale factor ${k}. Find the image.`,
      correctAnswer: `(${k * x},${k * y})`,
      explanation: `Multiply each coordinate by ${k}: $(${x},${y})→(${k * x},${k * y})$.`,
    };
  }
  if (/similarity criteria and proportional segments/.test(topic)) {
    return {
      prompt: "Which similarity criterion proves triangles similar using two pairs of congruent angles?",
      correctAnswer: "AA",
      explanation: "If two pairs of corresponding angles are congruent, the third pair is congruent too, so the triangles are similar by AA.",
    };
  }
  if (/pythagorean theorem/.test(topic)) {
    const triples: [number, number, number][] =
      level <= 2 ? [[3, 4, 5]] : [[3, 4, 5], [5, 12, 13]];
    const [a, b, c] = triples[int(0, triples.length - 1)]!;
    return {
      prompt: `A right triangle has legs ${a} and ${b}. Find the hypotenuse.`,
      correctAnswer: String(c),
      explanation: `By the Pythagorean theorem, $c^2=${a}^2+${b}^2=${c * c}$, so $c=${c}$.`,
    };
  }
  if (/right-triangle trigonometry/.test(topic)) {
    return {
      prompt: "In a right triangle, the side opposite angle A is 3 and the hypotenuse is 5. Find $\\sin A$.",
      correctAnswer: "3/5",
      explanation: "$\\sin A=\\frac{opposite}{hypotenuse}=\\frac{3}{5}$.",
    };
  }
  if (/circles: chords, arcs, and central angles/.test(topic)) {
    const angle = int(35, 145);
    return {
      prompt: `A central angle measures ${angle}°. What is the measure of its intercepted minor arc?`,
      correctAnswer: `${angle}°`,
      explanation: "A minor arc has the same degree measure as its central angle.",
    };
  }
  if (/inscribed angles and tangents/.test(topic)) {
    const arc = int(60, 160) * 2;
    return {
      prompt: `An inscribed angle intercepts an arc measuring ${arc}°. Find the angle measure.`,
      correctAnswer: `${arc / 2}°`,
      explanation: `An inscribed angle is half its intercepted arc: $${arc}°÷2=${arc / 2}°$.`,
    };
  }
  if (/coordinate geometry/.test(topic)) {
    const h = int(-4, 4);
    const k = int(-4, 4);
    const r = int(2, 6);
    const xTerm = h < 0 ? `x+${-h}` : `x-${h}`;
    const yTerm = k < 0 ? `y+${-k}` : `y-${k}`;
    return {
      prompt: `A circle has center $(${h},${k})$ and radius ${r}. Write its equation.`,
      correctAnswer: `(${xTerm})^2+(${yTerm})^2=${r * r}`,
      explanation: `Use $(x-h)^2+(y-k)^2=r^2$ with center $(${h},${k})$ and radius ${r}$.`,
    };
  }
  if (/area of polygons/.test(topic)) {
    const base = int(4, 12);
    const height = int(3, 10);
    return {
      prompt: `Find the area of a triangle with base ${base} and perpendicular height ${height}.`,
      correctAnswer: String((base * height) / 2),
      explanation: `Triangle area is $\\frac12 bh=\\frac12(${base})(${height})=${(base * height) / 2}$ square units.`,
    };
  }
  if (/circles and sectors/.test(topic)) {
    const angle = int(1, 5) * 60;
    const radius = int(1, 2) * 3;
    return {
      prompt: `Find the arc length for a ${angle}° central angle in a circle of radius ${radius}. Give an exact answer.`,
      correctAnswer: `${(angle / 360) * 2 * radius}π`,
      explanation: `Arc length is $\\frac{${angle}}{360}·2π(${radius})=${(angle / 360) * 2 * radius}π$.`,
    };
  }
  if (/surface area/.test(topic)) {
    const r = int(2, 6);
    const h = int(3, 9);
    const coefficient = 2 * r * r + 2 * r * h;
    return {
      prompt: `Find the total surface area of a cylinder with radius ${r} and height ${h}. Give an exact answer.`,
      correctAnswer: `${coefficient}π`,
      explanation: `Use $S=2πr^2+2πrh=2π(${r})^2+2π(${r})(${h})=${coefficient}π$.`,
    };
  }
  if (/volume of prisms, cylinders, pyramids, and cones/.test(topic)) {
    const r = int(2, 6);
    const h = int(3, 9);
    return {
      prompt: `Find the volume of a cylinder with radius ${r} and height ${h}. Give an exact answer.`,
      correctAnswer: `${r * r * h}π`,
      explanation: `Use $V=πr^2h=π(${r})^2(${h})=${r * r * h}π$ cubic units.`,
    };
  }
  if (/spheres/.test(topic)) {
    const r = int(1, 2) * 3;
    return {
      prompt: `Find the volume of a sphere with radius ${r}. Give an exact answer.`,
      correctAnswer: `${(4 * r * r * r) / 3}π`,
      explanation: `Use $V=\\frac43πr^3=\\frac43π(${r})^3=${(4 * r * r * r) / 3}π$ cubic units.`,
    };
  }
  if (/symmetry and tilings/.test(topic)) {
    return {
      prompt: "What is the rotational symmetry order of a regular hexagon?",
      correctAnswer: "6",
      explanation: "A regular hexagon maps onto itself at each rotation of 60°, giving rotational symmetry of order 6.",
    };
  }
  if (/non-euclidean geometry/.test(topic)) {
    return {
      prompt: "In spherical geometry, how many parallel lines pass through a point outside a given line?",
      correctAnswer: "0",
      explanation: "Spherical lines are great circles, and every pair of great circles intersects, so there are no parallel lines.",
    };
  }
  if (/capstone synthesis/.test(topic)) {
    return {
      prompt: "A right triangle has legs 5 and 12. Find its hypotenuse.",
      correctAnswer: "13",
      explanation: "By the Pythagorean theorem, $c^2=5^2+12^2=169$, so $c=13$.",
    };
  }
  throw new Error(`Cannot generate a Geometry fallback for topic "${topicTitle}".`);
}

async function pickTopicId(
  weekNumber: number | null | undefined,
  preferred: number | null | undefined,
  focusOnWeaknesses: boolean,
): Promise<{ id: number; title: string; weekNumber: number }> {
  if (preferred != null) {
    const [t] = await db.select().from(topicsTable).where(eq(topicsTable.id, preferred));
    if (t) return { id: t.id, title: t.title, weekNumber: t.weekNumber };
  }
  const candidates = weekNumber
    ? await db.select().from(topicsTable).where(eq(topicsTable.weekNumber, weekNumber))
    : await db.select().from(topicsTable);

  if (focusOnWeaknesses) {
    const stats = await db.execute(sql`
      select topic_id, count(*)::int as n, avg(case when correct then 1.0 else 0.0 end) as acc
      from practice_attempts group by topic_id
    `);
    const byId = new Map<number, { n: number; acc: number }>();
    for (const r of stats.rows as Array<{ topic_id: number; n: number; acc: number }>) {
      byId.set(Number(r.topic_id), { n: Number(r.n), acc: Number(r.acc) });
    }
    // weight = (1 - accuracy) + small bonus for low-attempted topics
    const scored = candidates.map((t) => {
      const s = byId.get(t.id);
      const acc = s?.acc ?? 0.5;
      const n = s?.n ?? 0;
      const weight = (1 - acc) * 2 + (n < 3 ? 1 : 0) + Math.random() * 0.3;
      return { t, weight };
    });
    scored.sort((a, b) => b.weight - a.weight);
    const choice = scored[0]?.t ?? candidates[Math.floor(Math.random() * candidates.length)]!;
    return { id: choice.id, title: choice.title, weekNumber: choice.weekNumber };
  }
  const choice = candidates[Math.floor(Math.random() * candidates.length)]!;
  return { id: choice.id, title: choice.title, weekNumber: choice.weekNumber };
}

router.post("/practice/sessions", async (req, res): Promise<void> => {
  const parsed = StartPracticeSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { weekNumber, topicId, tutorEnabled, focusOnWeaknesses, initialDifficulty } =
    parsed.data;
  const startDifficulty =
    typeof initialDifficulty === "number" && !Number.isNaN(initialDifficulty)
      ? Math.max(1, Math.min(5, initialDifficulty))
      : 2.0;
  const [created] = await db
    .insert(practiceSessionsTable)
    .values({
      userId: getUserId(req) || null,
      weekNumber: weekNumber ?? null,
      topicId: topicId ?? null,
      tutorEnabled,
      focusOnWeaknesses: focusOnWeaknesses ?? true,
      difficulty: startDifficulty,
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "failed" });
    return;
  }
  res.json(
    StartPracticeSessionResponse.parse({
      id: created.id,
      tutorEnabled: created.tutorEnabled,
      difficulty: created.difficulty,
      weekNumber: created.weekNumber,
      topicId: created.topicId,
      focusOnWeaknesses: created.focusOnWeaknesses,
    }),
  );
});

router.post("/practice/sessions/:sessionId/next", async (req, res): Promise<void> => {
  const sessionId = parseIdParam(req.params.sessionId);
  const parsed = NextPracticeProblemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [session] = await db
    .select()
    .from(practiceSessionsTable)
    .where(
      and(
        eq(practiceSessionsTable.id, sessionId),
        eq(practiceSessionsTable.userId, getUserId(req)),
      ),
    );
  if (!session) {
    res.status(404).json({ error: "session not found" });
    return;
  }

  const topic = await pickTopicId(
    session.weekNumber,
    parsed.data.topicId ?? session.topicId,
    session.focusOnWeaknesses,
  );

  const lastProblems = await db
    .select({ prompt: practiceProblemsTable.prompt })
    .from(practiceProblemsTable)
    .where(
      and(
        eq(practiceProblemsTable.sessionId, sessionId),
        eq(practiceProblemsTable.topicId, topic.id),
      ),
    )
    .orderBy(desc(practiceProblemsTable.id))
    .limit(3);

  const difficulty = Math.max(1, Math.min(5, session.difficulty));
  const difficultyLabel =
    difficulty <= 1.7
      ? "very easy"
      : difficulty <= 2.5
      ? "easy"
      : difficulty <= 3.3
      ? "medium"
      : difficulty <= 4.1
      ? "hard"
      : "challenging";

  const userRequest = parsed.data.request?.trim() || "";
  let generated: { prompt: string; correctAnswer: string; explanation: string };
  try {
    generated = await chatJson<{
      prompt: string;
      correctAnswer: string;
      explanation: string;
    }>(
      `You generate a single Geometry practice problem. It MUST directly assess the requested topic "${topic.title}" at "${difficultyLabel}" difficulty (${difficulty.toFixed(
        1,
      )}/5). Use an age-appropriate Geometry skill that matches the topic title, such as geometric reasoning and proofs, angle relationships, transformations, triangle congruence and similarity, measurement, coordinate geometry, circles, or solid geometry. Do not introduce unrelated topics. Use $...$ for inline LaTeX where helpful. The answer must be a short string. Respond as strict JSON: {"prompt": string, "correctAnswer": string, "explanation": string}. Avoid these recent prompts: ${JSON.stringify(
        lastProblems.map((p) => p.prompt),
      )}.`,
      userRequest || `Generate a new ${difficultyLabel} Geometry problem on ${topic.title}.`,
    );
  } catch {
    try {
      generated = geometryFallbackProblem(topic.title, difficulty);
    } catch (fallbackError) {
      req.log.error({ err: fallbackError }, "topic-appropriate Geometry fallback unavailable");
      res.status(503).json({ error: `could not generate a problem for topic "${topic.title}"` });
      return;
    }
  }

  const [stored] = await db
    .insert(practiceProblemsTable)
    .values({
      sessionId,
      topicId: topic.id,
      prompt: generated.prompt,
      correctAnswer: generated.correctAnswer,
      explanation: generated.explanation,
      difficulty,
    })
    .returning();
  if (!stored) {
    res.status(500).json({ error: "failed" });
    return;
  }

  res.json(
    NextPracticeProblemResponse.parse({
      id: stored.id,
      prompt: stored.prompt,
      topicId: topic.id,
      topicTitle: topic.title,
      difficulty,
    }),
  );
});

router.post("/practice/sessions/:sessionId/grade", async (req, res): Promise<void> => {
  const sessionId = parseIdParam(req.params.sessionId);
  const parsed = GradePracticeAnswerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { problemId, answer, trace } = parsed.data;
  const [session] = await db
    .select()
    .from(practiceSessionsTable)
    .where(
      and(
        eq(practiceSessionsTable.id, sessionId),
        eq(practiceSessionsTable.userId, getUserId(req)),
      ),
    );
  if (!session) {
    res.status(404).json({ error: "session not found" });
    return;
  }
  const [problem] = await db
    .select()
    .from(practiceProblemsTable)
    .where(
      and(
        eq(practiceProblemsTable.id, problemId),
        eq(practiceProblemsTable.sessionId, sessionId),
      ),
    );
  if (!problem) {
    res.status(404).json({ error: "problem not found in this session" });
    return;
  }

  const graded = await gradeAnswer({
    prompt: problem.prompt,
    correctAnswer: problem.correctAnswer,
    userAnswer: answer,
  });

  await db.insert(practiceAttemptsTable).values({
    userId: getUserId(req) || null,
    sessionId,
    problemId,
    topicId: problem.topicId,
    answer,
    correct: graded.correct,
    difficulty: problem.difficulty,
    trace,
  });

  const delta = graded.correct ? 0.4 : -0.5;
  const newDifficulty = Math.max(1, Math.min(5, session.difficulty + delta));
  await db
    .update(practiceSessionsTable)
    .set({ difficulty: newDifficulty })
    .where(eq(practiceSessionsTable.id, sessionId));

  let tutorTip: string | null = null;
  if (session.tutorEnabled && !graded.correct) {
    try {
      tutorTip = (
        await chatJson<{ tip: string }>(
          "You are a kind, concise Geometry tutor. Given a problem, the correct answer, and the student's wrong attempt, give ONE focused next-step tip about the exact Geometry skill involved (2 sentences max). Respond as strict JSON: {\"tip\": string}.",
          JSON.stringify({
            prompt: problem.prompt,
            correctAnswer: problem.correctAnswer,
            studentAnswer: answer,
          }),
        )
      ).tip;
    } catch {
      tutorTip = null;
    }
  }

  res.json(
    GradePracticeAnswerResponse.parse({
      problemId,
      correct: graded.correct,
      correctAnswer: problem.correctAnswer,
      explanation: graded.explanation || problem.explanation,
      newDifficulty,
      tutorTip,
    }),
  );
});

export default router;
