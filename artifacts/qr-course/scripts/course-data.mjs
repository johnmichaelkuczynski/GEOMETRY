// Geometry course data used by the static prerender fallback.
// Lesson titles, order, week divisions, and descriptions follow geometryCourse.ts.
export const WEEK_META = {
  1: {
    title: "Foundations, reasoning, and proof",
    summary:
      "Points, lines, and planes; segments and distance; angles; inductive and deductive reasoning; proof; parallel lines and transversals; constructions.",
    metaDescription:
      "Learn geometric foundations, distance, angles, logical reasoning, proofs, parallel lines, and compass-and-straightedge constructions.",
  },
  2: {
    title: "Triangles, congruence, and quadrilaterals",
    summary:
      "The triangle angle sum; congruence and rigid motions; congruence criteria; isosceles triangles; bisectors, medians, and altitudes; triangle inequalities; quadrilaterals and parallelograms.",
    metaDescription:
      "Explore triangle angle sums, rigid motions, congruence proofs, triangle centers and inequalities, and quadrilateral properties.",
  },
  3: {
    title: "Similarity, right triangles, and circles",
    summary:
      "Dilations and similarity; similarity criteria and proportional segments; the Pythagorean theorem; right-triangle trigonometry; chords and arcs; inscribed angles and tangents; coordinate geometry.",
    metaDescription:
      "Study similarity, proportional segments, the Pythagorean theorem, trigonometry, circle theorems, and coordinate geometry.",
  },
  4: {
    title: "Area, volume, and beyond Euclid",
    summary:
      "Area of polygons; circles and sectors; surface area; volume of prisms, cylinders, pyramids, and cones; spheres; symmetry and tilings; non-Euclidean geometry; capstone synthesis.",
    metaDescription:
      "Calculate geometric area, surface area, and volume, then explore spheres, symmetry, tessellations, and non-Euclidean geometry.",
  },
};

const rows = [
  [1, "points-lines-planes", "Points, lines, and planes", "The undefined terms and the first assumptions.", "Geometry begins with points, lines, and planes, then builds from postulates about lines through points, intersecting lines, and planes."],
  [1, "segments-distance-midpoints", "Segments, distance, and midpoints", "Measuring along a line and in the plane.", "Use the ruler and segment addition postulates, midpoint and distance formulas, and segment bisectors to measure lengths."],
  [1, "angles-angle-pairs", "Angles and angle pairs", "Measuring turn, and angles that come in pairs.", "Classify angles and use complementary, supplementary, linear-pair, and vertical-angle relationships in geometric proofs."],
  [1, "inductive-deductive-reasoning", "Inductive and deductive reasoning", "Guessing patterns, and proving them.", "Form conjectures from patterns, test them with counterexamples, and use conditionals, converses, contrapositives, and deduction."],
  [1, "writing-proofs", "Writing proofs", "Chains of justified statements.", "Build proofs from givens, definitions, postulates, and theorems using properties of equality, two-column reasoning, or indirect proof."],
  [1, "parallel-lines-transversals", "Parallel lines and transversals", "The angles formed when a line crosses two others.", "Use corresponding, alternate-interior, and same-side-interior angle relationships to reason about parallel lines and slopes."],
  [1, "constructions", "Constructions", "Geometry with compass and straightedge.", "Construct angle and segment bisectors, perpendiculars, parallels, and standard figures with an unmarked straightedge and compass."],
  [2, "triangle-angle-sum", "Triangle angle sum and classification", "Why every triangle's angles add to 180°.", "Classify triangles and prove the 180-degree angle sum, exterior-angle theorem, and polygon interior-angle formula."],
  [2, "rigid-motions-congruence", "Rigid motions and congruence", "Moving figures without changing them.", "Translations, reflections, and rotations preserve lengths and angles; figures are congruent when a rigid motion maps one to the other."],
  [2, "triangle-congruence-criteria", "Triangle congruence criteria", "Three measurements that fix a triangle.", "Prove triangle congruence using SSS, SAS, ASA, AAS, or HL, and distinguish these criteria from AAA and SSA."],
  [2, "isosceles-cpctc", "Isosceles triangles and CPCTC", "Using congruence to prove other facts.", "Apply CPCTC and the isosceles triangle theorem to connect congruent sides with congruent base angles."],
  [2, "triangle-centers", "Bisectors, medians, and altitudes", "Special segments and the centers they meet at.", "Locate the circumcenter, incenter, centroid, and orthocenter, and use the centroid ratio and triangle midsegment theorem."],
  [2, "triangle-inequalities", "Triangle inequalities", "Which lengths can make a triangle, and which angle is largest.", "Apply the triangle inequality, compare sides and opposite angles, and use the hinge theorem to compare triangles."],
  [2, "quadrilaterals-parallelograms", "Quadrilaterals and parallelograms", "Four-sided figures and their hierarchy.", "Compare parallelograms, rectangles, rhombi, squares, trapezoids, and kites through their sides, angles, and diagonals."],
  [3, "dilations-similarity", "Dilations and similarity", "Same shape, different size.", "Dilations scale lengths while preserving angles; similarity relates scale factors to perimeter, area, and volume."],
  [3, "similarity-criteria-proportions", "Similarity criteria and proportional segments", "Proving triangles similar.", "Prove triangle similarity with AA, SSS~, or SAS~, then apply side-splitter and angle-bisector relationships."],
  [3, "pythagorean-theorem", "The Pythagorean theorem", "The most famous theorem in mathematics.", "Use a²+b²=c² and its converse, classify triangles by side lengths, and apply 45-45-90 and 30-60-90 ratios."],
  [3, "right-triangle-trigonometry", "Right-triangle trigonometry", "Similarity turned into ratios.", "Use sine, cosine, and tangent to relate acute angles and side lengths in right triangles and solve elevation problems."],
  [3, "circles-chords-arcs", "Circles: chords, arcs, and central angles", "The parts of a circle and their relations.", "Relate central angles, arcs, and chords, including how perpendicular diameters and equal distances from the center affect chords."],
  [3, "inscribed-angles-tangents", "Inscribed angles and tangents", "Angles on the circle, and lines that touch it.", "Apply the inscribed-angle theorem, tangent-radius relationships, equal tangent segments, and chord and secant products."],
  [3, "coordinate-geometry", "Coordinate geometry", "Proving theorems with coordinates.", "Use distance, midpoint, and slope in coordinate proofs, and write a circle equation from its center and radius."],
  [4, "area-polygons", "Area of polygons", "Measuring the inside of flat figures.", "Find polygon areas with base-height, diagonal, and apothem formulas, and decompose composite regions into simpler pieces."],
  [4, "circles-sectors", "Circles and sectors", "Circumference, area, arcs, and slices.", "Use circumference and circle area formulas, and find arc lengths, sector areas, and circular segment areas."],
  [4, "surface-area", "Surface area", "The total area of a solid's outside.", "Find prism, cylinder, pyramid, and cone surface areas from their faces, nets, base dimensions, and slant heights."],
  [4, "volume-prisms-cones", "Volume of prisms, cylinders, pyramids, and cones", "Measuring the space inside solids.", "Calculate volumes using base area and height, including Cavalieri's principle and the one-third pyramid and cone formulas."],
  [4, "spheres", "Spheres", "The roundest solid.", "Use sphere surface area and volume formulas, compare a sphere with its circumscribed cylinder, and recognize great circles."],
  [4, "symmetry-tilings", "Symmetry and tilings", "Figures unchanged by motions, and patterns that fill the plane.", "Identify reflection and rotational symmetry, test tessellations, and explore regular polygon and wallpaper patterns."],
  [4, "non-euclidean-geometry", "Non-Euclidean geometry", "What happens without the parallel postulate.", "Compare hyperbolic and spherical geometry, their parallel behavior and triangle angle sums, and the Poincaré disk model."],
  [4, "capstone-synthesis", "Capstone synthesis", "One idea behind everything: proof from axioms.", "Connect geometric postulates, proof, congruence, similarity, measurement, and the extension of geometry beyond Euclid."],
];

const lessonNumberByWeek = new Map();
export const TOPICS = rows.map(([weekNumber, slug, title, blurb, body]) => {
  const lessonNumber = (lessonNumberByWeek.get(weekNumber) ?? 0) + 1;
  lessonNumberByWeek.set(weekNumber, lessonNumber);
  return {
    slug,
    weekNumber,
    blurb,
    metaDescription: `${title}: ${blurb} Learn geometric definitions, theorems, and applications.`,
    lectureTitle: `${weekNumber}.${lessonNumber} ${title}`,
    body: `# ${title}\n\n${body}`,
  };
});