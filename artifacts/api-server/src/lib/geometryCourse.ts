// Geometry — A Four-Week Course, adapted from the uploaded geometry-course PDF.
// Lesson order, short lecture concepts, homework, exams, and answers follow the source.
export type Lesson = [slug: string, title: string, blurb: string, body: string];

export const LESSONS: Lesson[] = [
  ["points-lines-planes", "Points, lines, and planes", "The undefined terms and the first assumptions.", `# Points, lines, and planes

Every definition uses other words, so geometry must start with terms left undefined. The three undefined terms are the point (a location with no size), the line (straight, extending without end, with no thickness), and the plane (a flat surface extending without end).

## Postulates
A postulate or axiom is a statement accepted without proof. The first ones say how the undefined terms relate:
- Through any two points there is exactly one line.
- Through any three noncollinear points there is exactly one plane.
- If two lines intersect, they meet in exactly one point; two planes meet in a line.

## Vocabulary
Points on one line are collinear; points in one plane are coplanar. A segment AB consists of A, B, and the points between; a ray AB starts at A and runs through B without end. Everything else in the course is defined from these terms and proved from the postulates.

## A real example
Around 300 BCE Euclid of Alexandria collected the geometry of his time in the *Elements*: 23 definitions, five postulates, five common notions, and 465 propositions, each proved from what came before. It was first printed in 1482 and has appeared in more than a thousand editions, and for over two thousand years it was the model of what a rigorous body of knowledge looks like.`],
  ["segments-distance-midpoints", "Segments, distance, and midpoints", "Measuring along a line and in the plane.", `# Segments, distance, and midpoints

The ruler postulate pairs the points of a line with real numbers, so the distance AB is the absolute difference of their coordinates. The segment addition postulate says that if B lies between A and C, then $AB+BC=AC$. Segments of equal length are congruent, written $AB≅CD$.

## Midpoints and bisectors
The midpoint of a segment divides it into two congruent segments; a segment bisector is any line, ray, or segment through the midpoint. On a coordinate plane:

$$M=((x_1+x_2)/2,(y_1+y_2)/2).$$

## The distance formula
The distance between $(x_1,y_1)$ and $(x_2,y_2)$ is the hypotenuse of a right triangle with legs $|x_2−x_1|$ and $|y_2−y_1|$, so $d=√[(x_2−x_1)^2+(y_2−y_1)^2]$. From $(1,2)$ to $(7,10)$ the distance is $√(36+64)=10$ and the midpoint is $(4,6)$.

## A real example
In 1620 the English mathematician Edmund Gunter introduced a surveyor's chain 66 feet long, divided into 100 links. Ten square chains make an acre and 80 chains a mile, so area and distance could be computed without fractions. The United States Public Land Survey measured most of the country with Gunter's chain, and property deeds still record boundaries in chains and links.`],
  ["angles-angle-pairs", "Angles and angle pairs", "Measuring turn, and angles that come in pairs.", `# Angles and angle pairs

An angle is formed by two rays with a common endpoint, the vertex. The protractor postulate assigns each angle a measure from $0°$ to $180°$. Angles are acute (under $90°$), right ($90°$), obtuse (between $90°$ and $180°$), or straight ($180°$).

## Angle pairs
- Adjacent angles share a vertex and a side but no interior points.
- Complementary angles sum to $90°$; supplementary angles sum to $180°$.
- A linear pair is two adjacent angles whose outer sides form a line; they are supplementary.
- Vertical angles are the opposite angles formed by two intersecting lines.

## The vertical angle theorem
Vertical angles are congruent.

Proof: if $∠1$ and $∠3$ are vertical, each forms a linear pair with $∠2$, so $∠1+∠2=180°=∠3+∠2$, and $∠1=∠3$. An angle bisector divides an angle into two congruent angles; perpendicular lines meet at right angles.

## A real example
The Greek historian Eudemus of Rhodes, as quoted by Proclus, credited Thales of Miletus around 600 BCE with the first proof that vertical angles are equal. The fact was obvious to anyone who looked; what was new was proving it from simpler truths. That shift — from knowing to demonstrating — is why Thales is often called the first mathematician.`],
  ["inductive-deductive-reasoning", "Inductive and deductive reasoning", "Guessing patterns, and proving them.", `# Inductive and deductive reasoning

Inductive reasoning generalizes from examples to a conjecture. It suggests truths but cannot establish them: a single counterexample refutes a conjecture. The polynomial $n^2+n+41$ is prime for $n=0$ through 39 and fails at $n=40$.

## Conditional statements
A conditional "if p, then q" ($p→q$) has hypothesis p and conclusion q. From it come:
- converse $q→p$; inverse $¬p→¬q$; contrapositive $¬q→¬p$.

$$p→q ≡ ¬q→¬p.$$

A conditional and its contrapositive are always both true or both false; the converse need not be. "If a figure is a square, it is a rectangle" is true; its converse is false. When both hold, write the biconditional $p↔q$ — the form of every good definition.

## Deductive reasoning
Deductive reasoning derives conclusions from accepted statements by logic. Modus ponens: from $p→q$ and p, conclude q. The law of syllogism: from $p→q$ and $q→r$, conclude $p→r$. Deduction guarantees its conclusions if its premises are true.

## A real example
Abraham Lincoln said that as a young lawyer he kept hearing the word "demonstrate" and realized he did not know what it meant. He went home and studied the first six books of Euclid until he could prove every proposition in them. His speeches, including the argument of the Lincoln–Douglas debates of 1858, are built as chains of deduction from stated premises.`],
  ["writing-proofs", "Writing proofs", "Chains of justified statements.", `# Writing proofs

A proof is a sequence of statements, each justified by a given fact, a definition, a postulate, or a previously proved theorem, ending in the statement to be proved.

## Properties of equality and congruence
The algebraic properties become reasons: addition, subtraction, multiplication, division, and substitution, together with:

- reflexive: $a=a$
- symmetric: $a=b⇒b=a$
- transitive: $a=b$ and $b=c⇒a=c$

Congruence of segments and angles obeys the same three properties.

## Formats
A two-column proof lists statements beside their reasons. A paragraph proof gives the same chain in sentences; a flowchart proof draws it with arrows. Indirect proof assumes the conclusion is false and derives a contradiction. Begin by marking the given information on a diagram, and work backwards from the goal: what would be enough to prove it?

## A real example
In 1899 David Hilbert published *Foundations of Geometry*, which rebuilt Euclid on 20 axioms. Euclid had silently used facts that never appear among his postulates — that two circles meet when each passes through the other's center, that a line entering a triangle must leave it. Hilbert, following Moritz Pasch, made every assumption explicit, so that a proof would remain valid if "points, lines, and planes" were replaced by "tables, chairs, and beer mugs."`],
  ["parallel-lines-transversals", "Parallel lines and transversals", "The angles formed when a line crosses two others.", `# Parallel lines and transversals

Parallel lines are coplanar lines that never meet; skew lines are noncoplanar lines that never meet. A transversal crosses two lines at different points, forming eight angles.

## Angle pairs and the parallel postulate
Angles in matching positions are corresponding; angles between the lines on opposite sides of the transversal are alternate interior; angles between the lines on the same side are same-side interior. The parallel postulate says that through a point not on a line there is exactly one parallel line. From it:

$$\\text{lines parallel} ⇔ \\text{corresponding angles congruent}.$$

Also, alternate interior angles are congruent and same-side interior angles are supplementary — and the converses hold, which is how parallelism is proved.

## In the coordinate plane
Nonvertical lines are parallel exactly when their slopes are equal and perpendicular exactly when their slopes multiply to $−1$. A line perpendicular to one of two parallel lines is perpendicular to the other.

## A real example
Mathematicians spent two thousand years trying to prove Euclid's parallel postulate from the other four. In 1733 the Jesuit Girolamo Saccheri published *Euclid Freed of Every Flaw*, assuming the postulate false and hunting for a contradiction. He derived a long series of strange theorems and declared them "repugnant to the nature of the straight line" — without realizing he had discovered the first results of non-Euclidean geometry (Lecture 4.7).`],
  ["constructions", "Constructions", "Geometry with compass and straightedge.", `# Constructions

A construction produces a figure using only an unmarked straightedge, to draw lines through two points, and a compass, to draw circles with a given center through a given point. Each construction is a small theorem: its correctness is proved by congruent triangles.

## The basic constructions
- Copy a segment and copy an angle.
- Bisect an angle.
- Construct the perpendicular bisector of a segment — which also finds its midpoint.
- Construct a perpendicular or a parallel to a line through a given point.

Equal arcs from A and B meet on the perpendicular bisector of AB.

## What can be constructed
Equilateral triangles, squares, and regular hexagons are constructible, and bisecting angles repeatedly gives regular polygons with $2^n$ times as many sides. Constructions show which lengths follow from a unit length by geometry alone: exactly those obtained by adding, subtracting, multiplying, dividing, and taking square roots.

## A real example
Three construction problems resisted the Greeks: doubling a cube, trisecting any angle, and squaring a circle. In 1837 Pierre Wantzel proved the first two impossible, since they require cube roots, which compass and straightedge cannot produce. In 1882 Ferdinand von Lindemann proved $π$ transcendental, so the third is impossible too. Two thousand years of failure ended in proofs that success was never possible.`],

  ["triangle-angle-sum", "Triangle angle sum and classification", "Why every triangle's angles add to 180°.", `# Triangle angle sum and classification

Triangles are classified by sides — scalene (none congruent), isosceles (at least two), equilateral (all three) — and by angles — acute, right, or obtuse.

## The triangle sum theorem
$$∠A+∠B+∠C=180°.$$

Proof: draw the line through C parallel to AB. The three angles at C along that line form a straight angle, and the two outer ones equal $∠A$ and $∠B$ as alternate interior angles. The proof depends on the parallel postulate.

## The exterior angle theorem
An exterior angle of a triangle equals the sum of the two remote interior angles, since both it and their sum are supplementary to the adjacent interior angle. The interior angles of a convex polygon with n sides sum to $(n−2)·180°$, found by cutting it into $n−2$ triangles; its exterior angles always sum to $360°$.

## A real example
In the 1820s, directing the geodetic survey of Hanover, Carl Friedrich Gauss measured the angles of a triangle formed by three mountain peaks — Brocken, Hohehagen, and Inselsberg — with sides up to 107 kilometers. The sum matched $180°$ within the error of his instruments. Whether he intended it as a test of whether space itself is Euclidean remains debated, but Gauss knew, as Saccheri had not, that the answer was not logically guaranteed.`],
  ["rigid-motions-congruence", "Rigid motions and congruence", "Moving figures without changing them.", `# Rigid motions and congruence

A rigid motion, or isometry, is a transformation that preserves distance and angle measure. There are three basic kinds, and every rigid motion of the plane is a combination of them.

## Translations, reflections, rotations
- Translation: slide every point the same distance in the same direction, $(x,y)→(x+a,y+b)$.
- Reflection across a line: flip, as in $(x,y)→(x,−y)$ across the x-axis.
- Rotation about a point: turn, as in $(x,y)→(−y,x)$ for $90°$ counterclockwise about the origin.

$$\\text{figures are congruent} ⇔ \\text{a rigid motion maps one onto the other}.$$

## Composition
Performing one rigid motion after another is again a rigid motion. Two reflections across parallel lines make a translation; across intersecting lines, a rotation by twice the angle between them. Congruent figures have all corresponding parts congruent, and the order of vertex names records the correspondence: $△ABC≅△DEF$ means A matches D.

## A real example
In 1872 the 23-year-old Felix Klein, on joining the faculty at Erlangen, proposed defining each geometry by the transformations it treats as irrelevant. Euclidean geometry studies the properties unchanged by rigid motions; similarity geometry allows scaling; projective geometry allows perspective. Klein's Erlangen program organized the geometries of the nineteenth century, and the modern definition of congruence descends from it.`],
  ["triangle-congruence-criteria", "Triangle congruence criteria", "Three measurements that fix a triangle.", `# Triangle congruence criteria

Two triangles are congruent if all six pairs of parts match, but fewer suffice. Each criterion says that certain parts determine the triangle completely:

## The criteria
- SSS: three pairs of sides congruent.
- SAS: two sides and the included angle.
- ASA: two angles and the included side.
- AAS: two angles and a non-included side.
- HL: in right triangles, the hypotenuse and a leg.

$$SSS,\\ SAS,\\ ASA,\\ AAS,\\ HL ⇒ △ABC≅△DEF.$$

## What does not work
AAA fixes only the shape, not the size: it proves similarity (Week 3). SSA fails because two different triangles can share two sides and a non-included angle — the ambiguous case. HL is the exception where SSA works, because the right angle is the largest angle.

## A real example
SSS is the reason bridges and roofs are built of triangles. A quadrilateral frame with hinged joints can be pushed into a different shape with the same side lengths, but a triangle cannot: its three sides fix its angles. The Warren truss, patented in England in 1848 by James Warren and Willoughby Monzani, uses nothing but triangles and still carries railway and highway bridges worldwide.`],
  ["isosceles-cpctc", "Isosceles triangles and CPCTC", "Using congruence to prove other facts.", `# Isosceles triangles and CPCTC

Once two triangles are proved congruent, every pair of their corresponding parts is congruent: corresponding parts of congruent triangles are congruent (CPCTC). Congruence is usually a means to proving that two particular segments or angles are equal.

## The isosceles triangle theorem
$$AB≅AC ⇔ ∠B≅∠C.$$

The angles opposite the congruent sides — the base angles — are congruent, and conversely. Proof: the bisector of $∠A$ splits the triangle into two congruent triangles by SAS, and the base angles are corresponding parts. The bisector is also the perpendicular bisector of the base.

## Equilateral triangles
An equilateral triangle is equiangular, with each angle $60°$, and conversely. In proofs with overlapping triangles, redraw them separately and mark shared sides as congruent by the reflexive property.

## A real example
The isosceles triangle theorem is Proposition 5 of Book I of the *Elements*, known in the Middle Ages as the *pons asinorum*, the "bridge of asses" — the first proof weak students could not cross. Euclid's proof extends the sides and uses a complicated diagram. Pappus of Alexandria, around 300 CE, gave a much shorter one: compare the triangle ABC with itself read as ACB, which is congruent to it by SAS.`],
  ["triangle-centers", "Bisectors, medians, and altitudes", "Special segments and the centers they meet at.", `# Bisectors, medians, and altitudes

Each triangle has four families of special lines, and in each family the three lines meet at a single point — they are concurrent.

## The four centers
- Perpendicular bisectors of the sides meet at the circumcenter, equidistant from the vertices: the center of the circumscribed circle.
- Angle bisectors meet at the incenter, equidistant from the sides: the center of the inscribed circle.
- Medians, from each vertex to the midpoint of the opposite side, meet at the centroid, the balance point.
- Altitudes, perpendicular from each vertex to the opposite side, meet at the orthocenter.

The centroid divides each median in the ratio $2:1$.

## Why they are concurrent
Every point on a perpendicular bisector is equidistant from the segment's endpoints, and every point on an angle bisector is equidistant from its sides. The point where two perpendicular bisectors meet is equidistant from all three vertices, so it lies on the third. A midsegment joining two midpoints is parallel to the third side and half as long.

## A real example
In 1765 Leonhard Euler proved that in every triangle the circumcenter, centroid, and orthocenter lie on one line, now called the Euler line, with the centroid always one-third of the way from the circumcenter to the orthocenter. The fact had escaped two thousand years of Greek and later geometry. More than 50,000 other triangle centers have since been catalogued.`],
  ["triangle-inequalities", "Triangle inequalities", "Which lengths can make a triangle, and which angle is largest.", `# Triangle inequalities

Not every three lengths form a triangle: 2, 3, and 7 cannot, since the two short sides cannot reach across the long one.

## The triangle inequality theorem
$$a+b>c,\\quad b+c>a,\\quad a+c>b.$$

Each side is shorter than the sum of the other two and longer than their difference. So with sides 5 and 8, the third side lies strictly between 3 and 13. Geometrically: the straight path between two points is the shortest.

## Sides and angles
In a triangle the longest side lies opposite the largest angle, and the shortest opposite the smallest. The hinge theorem: if two sides of one triangle are congruent to two sides of another, the triangle with the larger included angle has the longer third side — open a hinge wider and its ends move farther apart.

## A real example
Heron of Alexandria, in the first century CE, explained why a mirror reflects light at equal angles. To travel from A to the mirror to B by the shortest route, reflect B across the mirror to B′; any path from A to the mirror to B has the same length as a path from A to B′, and by the triangle inequality the shortest is the straight line AB′ — which meets the mirror at equal angles. Light, Heron concluded, takes the shortest path.`],
  ["quadrilaterals-parallelograms", "Quadrilaterals and parallelograms", "Four-sided figures and their hierarchy.", `# Quadrilaterals and parallelograms

A parallelogram is a quadrilateral with both pairs of opposite sides parallel. Its properties follow by drawing a diagonal and using congruent triangles:

## Properties of parallelograms
- Opposite sides are congruent, and opposite angles are congruent.
- Consecutive angles are supplementary.
- The diagonals bisect each other.

$$\\text{diagonals bisect each other} ⇔ \\text{parallelogram}.$$

The converses give tests for proving a quadrilateral is a parallelogram, including one pair of sides both parallel and congruent.

## Special quadrilaterals
A rectangle has four right angles and congruent diagonals; a rhombus has four congruent sides and perpendicular diagonals; a square is both. A trapezoid has exactly one pair of parallel sides, and its midsegment equals the average of the bases; a kite has two pairs of adjacent congruent sides. Each special figure inherits every property of the figures above it.

## A real example
Around 1603 the Jesuit astronomer Christoph Scheiner invented the pantograph, four rods pinned together in a parallelogram. As one point traces a drawing, another point redraws it enlarged or reduced, because opposite sides of a parallelogram stay parallel however the linkage flexes. Scheiner used it to copy sunspot drawings; engravers, sign cutters, and key duplicators used it for centuries.`],

  ["dilations-similarity", "Dilations and similarity", "Same shape, different size.", `# Dilations and similarity

A dilation with center O and scale factor $k>0$ moves each point P to P′ on ray OP with $OP′=k·OP$. If $k>1$ it enlarges; if $k<1$ it reduces. About the origin, $(x,y)→(kx,ky)$.

## What a dilation preserves
A dilation multiplies every length by k and preserves every angle; it maps a line to a parallel line. Two figures are similar if a dilation followed by a rigid motion maps one onto the other:

$$△ABC∼△DEF ⇔ \\text{angles congruent and } AB/DE=BC/EF=CA/FD.$$

## Scale and area
If two figures are similar with scale factor k, their perimeters are in ratio k, their areas in ratio $k^2$, and — for solids — their volumes in ratio $k^3$. A map at scale $1:50,000$ shrinks area by a factor of 2.5 billion. Scale drawings, models, and maps all rest on similarity.

## A real example
Around 1415 the architect Filippo Brunelleschi stood inside the doorway of Florence Cathedral and painted the Baptistery opposite on a panel, then invited viewers to look through a hole in the panel at a mirror. Painting and building matched exactly. He had worked out linear perspective, in which objects shrink in proportion to their distance from the eye — similar triangles sharing a vertex at the viewer.`],
  ["similarity-criteria-proportions", "Similarity criteria and proportional segments", "Proving triangles similar.", `# Similarity criteria and proportional segments

As with congruence, a few parts suffice to prove similarity:

## The criteria
- AA: two pairs of congruent angles.
- SSS~: all three pairs of sides proportional.
- SAS~: two pairs of sides proportional and the included angles congruent.

Two angles congruent implies triangles similar. AA is the workhorse, since the third angles then agree automatically.

## The side-splitter theorem
A line parallel to one side of a triangle divides the other two sides proportionally: if $DE∥BC$ with D on AB and E on AC, then $AD/DB=AE/EC$. The angle bisector theorem: the bisector of an angle divides the opposite side in the ratio of the adjacent sides. In a right triangle the altitude to the hypotenuse creates two triangles similar to the original, so it is the geometric mean of the two segments it cuts.

## A real example
Around 270 BCE Aristarchus of Samos used similar triangles to estimate the sizes and distances of the Sun and Moon. From the width of Earth's shadow during a lunar eclipse and the angle between Sun and Moon at half moon, he concluded that the Sun is many times larger than Earth. His numbers were far off, but his reasoning was sound, and it led him to propose, eighteen centuries before Copernicus, that Earth goes around the Sun.`],
  ["pythagorean-theorem", "The Pythagorean theorem", "The most famous theorem in mathematics.", `# The Pythagorean theorem

In a right triangle with legs a and b and hypotenuse c:

## The theorem and its converse
$$a^2+b^2=c^2.$$

One proof uses the similar triangles of Lecture 3.2; another arranges four copies of the triangle inside a square of side $a+b$. The converse classifies any triangle with longest side c: if $a^2+b^2=c^2$ it is right, if greater it is acute, if less it is obtuse. Whole-number solutions such as 3-4-5, 5-12-13, and 8-15-17 are Pythagorean triples.

## Special right triangles
The 45-45-90 triangle, half of a square, has sides $x,x,x√2$. The 30-60-90 triangle, half of an equilateral triangle, has sides $x,x√3,2x$, with the short leg opposite $30°$. A square of side 10 has diagonal $10√2$; an equilateral triangle of side 10 has height $5√3$.

## A real example
In 1876 James A. Garfield, then a congressman from Ohio and later the twentieth president, published an original proof of the Pythagorean theorem in the *New England Journal of Education*. It computes the area of a trapezoid made of three right triangles in two ways. In 1940 the mathematics teacher Elisha Loomis published *The Pythagorean Proposition*, a collection of 370 different proofs, including Garfield's.`],
  ["right-triangle-trigonometry", "Right-triangle trigonometry", "Similarity turned into ratios.", `# Right-triangle trigonometry

All right triangles with the same acute angle are similar by AA, so the ratios of their sides depend only on the angle. Those ratios are named:

## Sine, cosine, and tangent
$$sin A=opp/hyp,\\quad cos A=adj/hyp,\\quad tan A=opp/adj.$$

With one side and one acute angle, or two sides, every part of a right triangle can be found. A ladder 20 feet long leaning at $75°$ to the ground reaches $20sin75°≈19.3$ feet up the wall. To find an angle from sides use the inverse functions: $A=tan^{−1}(opp/adj)$.

## Applications
Heights and distances are found from angles of elevation and depression, measured from the horizontal. The sine and cosine of complementary angles are equal, $sin A=cos(90°−A)$, and $sin^2A+cos^2A=1$ is the Pythagorean theorem divided by $c^2$. The full theory is the subject of Trigonometry.

## A real example
In the sixth century BCE the engineer Eupalinos dug a tunnel over a kilometer long through a mountain on the island of Samos to bring water to the town, with two crews digging from opposite ends. They met in the middle with an error of only a few meters. Heron of Alexandria later explained how such a tunnel can be aligned: by walking around the mountain in right-angled steps and using similar right triangles to fix the direction from each entrance.`],
  ["circles-chords-arcs", "Circles: chords, arcs, and central angles", "The parts of a circle and their relations.", `# Circles: chords, arcs, and central angles

A circle is the set of points at a fixed distance, the radius, from a center. A chord joins two points of the circle; a diameter is a chord through the center.

## Arcs and central angles
A central angle has its vertex at the center. The arc it cuts off has the same measure in degrees: a minor arc under $180°$, a semicircle equal to $180°$, a major arc over $180°$. Adjacent arcs add, like segments.

## Chord theorems
- In the same or congruent circles, congruent chords have congruent arcs, and conversely.
- A diameter perpendicular to a chord bisects the chord and its arc.
- Chords equidistant from the center are congruent.

The perpendicular bisector of any chord passes through the center. So the center of any circle can be found from three of its points: the perpendicular bisectors of two chords meet there.

## A real example
Archaeologists reconstruct whole pots from single fragments with the chord theorem. The curved rim of a sherd is an arc of the original circle; the perpendicular bisectors of two chords drawn on it meet at the center, giving the radius. In practice the sherd is matched against a chart of concentric circles, but the chart simply automates the theorem.`],
  ["inscribed-angles-tangents", "Inscribed angles and tangents", "Angles on the circle, and lines that touch it.", `# Inscribed angles and tangents

An inscribed angle has its vertex on the circle and its sides along chords.

## The inscribed angle theorem
$$\\text{inscribed angle}=½\\,\\text{intercepted arc}.$$

Consequences: inscribed angles that intercept the same arc are congruent; an angle inscribed in a semicircle is a right angle; opposite angles of a quadrilateral inscribed in a circle are supplementary.

## Tangents and secants
A tangent meets the circle at exactly one point and is perpendicular to the radius there. Two tangent segments from an external point are congruent. When two chords cross inside a circle, the products of their segments are equal, $ab=cd$; for two secants from an outside point, (whole)(outside) is the same for both; for a tangent and a secant, $t^2=(whole)(outside)$. Angles formed by chords, secants, and tangents equal half the sum or half the difference of the intercepted arcs.

## A real example
The theorem that an angle inscribed in a semicircle is a right angle is called Thales' theorem, and according to the biographer Diogenes Laertius, Thales sacrificed an ox when he proved it. Carpenters still use it: to test whether a curve is a true semicircle, hold a carpenter's square with its corner on the curve and its edges through the ends of the diameter — it fits everywhere only if the curve is exact.`],
  ["coordinate-geometry", "Coordinate geometry", "Proving theorems with algebra.", `# Coordinate geometry

Placing figures on a coordinate plane turns geometric questions into computation with the distance, midpoint, and slope formulas.

## Coordinate proofs
Place the figure to simplify the algebra: a vertex at the origin, a side along an axis, general coordinates such as $(a,0)$ and $(b,c)$. To prove the diagonals of a parallelogram bisect each other, show that their midpoints coincide. To prove a quadrilateral is a rhombus, show all four sides have equal length; a rectangle, that adjacent slopes multiply to $−1$.

## The equation of a circle
$$ (x−h)^2+(y−k)^2=r^2.$$

This is the distance formula: every point $(x,y)$ at distance r from the center $(h,k)$. To identify a circle from an expanded equation, complete the square: $x^2+y^2+4x−6y=12$ becomes $(x+2)^2+(y−3)^2=25$, center $(-2,3)$, radius 5. Partitioning a segment in a given ratio uses weighted averages of the endpoints.

## A real example
Pierre de Fermat, a lawyer in Toulouse who did mathematics in his spare time, wrote an introduction to plane and solid loci around 1636 that expressed curves as equations in two unknowns — lines as first-degree equations, conic sections as second-degree. René Descartes published the same idea in 1637. Fermat's work circulated only in manuscript, which is why coordinates are called Cartesian, not Fermatian.`],

  ["area-polygons", "Area of polygons", "Measuring the inside of flat figures.", `# Area of polygons

Area measures the space a figure covers, in square units. Its postulates: congruent figures have equal areas, and the area of a region is the sum of the areas of its nonoverlapping parts. From the rectangle, $A=bh$, the rest follow by cutting and rearranging.

## The basic formulas
- Parallelogram: $A=bh$, cutting a triangle off one end and moving it to the other.
- Triangle: $A=½bh$, half a parallelogram.
- Trapezoid: $A=½h(b_1+b_2)$.
- Rhombus or kite: $A=½d_1d_2$, from the diagonals.

$$A=½h(b_1+b_2).$$

## Regular polygons and composite figures
A regular polygon splits into congruent triangles meeting at the center, so $A=½×apothem×perimeter$, where the apothem is the distance from the center to a side. Composite figures are found by adding pieces or subtracting holes. The height of a triangle is always perpendicular to the base, never a slanted side.

## A real example
In 1899 the Austrian mathematician Georg Pick found a formula for the area of any polygon whose vertices lie on the points of a square grid: $A=I+B/2−1$, where I counts grid points inside the polygon and B points on its boundary. A triangle with vertices $(0,0)$, $(4,0)$, $(0,3)$ has $I=3$ and $B=8$, so $A=3+4−1=6$, agreeing with $½·4·3$. Area is reduced to counting.`],
  ["circles-sectors", "Circles and sectors", "Circumference, area, arcs, and slices.", `# Circles and sectors

All circles are similar, so the ratio of circumference to diameter is the same for every circle. That constant is $π≈3.14159$.

## Circumference and area
$$C=2πr,\\quad A=πr^2.$$

The area formula follows by cutting a circle into thin wedges and rearranging them into a near-rectangle of height r and width half the circumference, $πr$.

## Arcs and sectors
An arc of central angle $x°$ is the fraction $x/360$ of the circle, so its length is $(x/360)·2πr$ and the area of its sector is $(x/360)·πr^2$. A $72°$ sector of a circle of radius 10 has arc length $4π$ and area $20π$. A segment of a circle — between a chord and its arc — is the sector minus the triangle. In radians these become $s=rθ$ and $A=½r^2θ$.

## A real example
In 263 CE the Chinese mathematician Liu Hui computed π by inscribing regular polygons in a circle and doubling the sides, reaching 3,072 sides and $π≈3.1416$. Two centuries later Zu Chongzhi pinned π between 3.1415926 and 3.1415927 and gave the fraction $355/113$, correct to six decimal places — a record that stood for nearly a thousand years.`],
  ["surface-area", "Surface area", "The total area of a solid's outside.", `# Surface area

The surface area of a solid is the sum of the areas of all its faces or surfaces. Unfolding a solid into a flat net shows every piece.

## Prisms and cylinders
The lateral area of a right prism is the perimeter of the base times the height; add the two bases for the total. A cylinder unrolls into a rectangle of width $2πr$:

$$S=2πr^2+2πrh\\quad\\text{(cylinder)}.$$

## Pyramids and cones
The lateral faces of a regular pyramid are triangles whose height is the slant height ℓ, so $S=B+½Pℓ$. A cone unrolls into a sector, giving $S=πr^2+πrℓ$. The slant height comes from the Pythagorean theorem: for a cone with $r=3$ and $h=4$, $ℓ=5$ and $S=9π+15π=24π$.

## A real example
In *Two New Sciences* (1638) Galileo pointed out that if an animal is scaled up by a factor k, its weight grows as $k^3$ but the cross-sectional area of its bones only as $k^2$. A giant built like a man would break its own legs; larger animals need disproportionately thick bones. The same square–cube law explains why elephants have big ears to shed heat and why insects can fall from any height unharmed.`],
  ["volume-prisms-cones", "Volume of prisms, cylinders, pyramids, and cones", "Measuring the space inside solids.", `# Volume of prisms, cylinders, pyramids, and cones

Volume measures space in cubic units. For a prism or cylinder, the solid is a stack of copies of its base:

## Prisms and cylinders
$$V=Bh;\\quad V=πr^2h\\quad\\text{(cylinder)}.$$

Cavalieri's principle: two solids of equal height whose cross sections at every level have equal areas have equal volumes. So a slanted stack of coins has the same volume as a straight one, and oblique prisms and cylinders use the same formula.

## Pyramids and cones
A pyramid is exactly one-third of the prism with the same base and height — a cube splits into three congruent pyramids meeting at one corner:
- pyramid: $V=⅓Bh$;
- cone: $V=⅓πr^2h$.

A cone of radius 3 and height 4 holds $12π$ cubic units, one-third of the cylinder's $36π$. Similar solids with scale factor k have volumes in ratio $k^3$.

## A real example
The Moscow Mathematical Papyrus, from about 1850 BCE, computes the volume of a truncated square pyramid with base side 4, top side 2, and height 6, arriving at 56 — the correct answer, by a rule equivalent to $V=(h/3)(a^2+ab+b^2)$. How Egyptian scribes found this formula, which requires in modern terms an argument by limits, is unknown. Bonaventura Cavalieri stated his principle in 1635.`],
  ["spheres", "Spheres", "The roundest solid.", `# Spheres

A sphere is the set of points in space at distance r from a center. A plane through the center cuts a great circle, the largest possible; it divides the sphere into two hemispheres.

## Volume and surface area
$$V=⁴⁄₃πr^3,\\quad S=4πr^2.$$

The volume follows from Cavalieri's principle: a hemisphere has the same cross-sectional areas as a cylinder with a cone removed. The surface area is exactly four great circles. A sphere of radius 3 has volume $36π$ and surface area $36π$.

## Comparisons
A sphere fits exactly inside a cylinder of the same radius and height $2r$, and takes up two-thirds of its volume — and its surface is two-thirds of the cylinder's total surface as well. Of all solids with a given surface area, the sphere encloses the most volume, which is why soap bubbles and raindrops are round.

## A real example
Archimedes proved around 225 BCE that a sphere has two-thirds the volume and surface of its circumscribing cylinder, and asked that a sphere inside a cylinder be carved on his tomb. In 75 BCE Cicero, serving as a Roman official in Sicily, found the neglected tomb near Syracuse, overgrown with brambles, by spotting the sphere and cylinder on a column, and had it cleared.`],
  ["symmetry-tilings", "Symmetry and tilings", "Figures unchanged by motions, and patterns that fill the plane.", `# Symmetry and tilings

A figure has symmetry if a rigid motion maps it onto itself. It has line symmetry if a reflection does, and rotational symmetry of order n if a rotation by $360°/n$ does. A regular hexagon has six lines of symmetry and rotational symmetry of order 6.

## Tessellations
A tessellation covers the plane with shapes, without gaps or overlaps. The angles meeting at each vertex must sum to $360°$, so only three regular polygons tile the plane by themselves:

Equilateral triangles ($6×60°$), squares ($4×90°$), hexagons ($3×120°$).

Every triangle and every quadrilateral tiles the plane, and combinations of regular polygons give eight further semiregular tilings.

## Periodic patterns
A pattern that repeats by translation in two directions is periodic. Its symmetries form one of exactly 17 wallpaper groups, a classification completed by Evgraf Fedorov in 1891. Rotational symmetry in a periodic pattern can only be of order 2, 3, 4, or 6 — never 5.

## A real example
In 1974 Roger Penrose found two shapes that tile the plane only nonperiodically, with fivefold symmetry that no periodic pattern can have. In 1982 Dan Shechtman observed the same forbidden fivefold symmetry in an aluminum–manganese alloy. Many chemists refused to believe him; the materials came to be called quasicrystals, and Shechtman received the 2011 Nobel Prize in Chemistry.`],
  ["non-euclidean-geometry", "Non-Euclidean geometry", "What happens without the parallel postulate.", `# Non-Euclidean geometry

The parallel postulate of Lecture 1.6 cannot be proved from Euclid's other postulates. Replacing it gives consistent geometries in which some familiar theorems fail.

## Hyperbolic geometry
Through a point not on a line there are infinitely many parallels. Triangles have angle sums less than $180°$, and the deficit is proportional to the triangle's area; similar triangles of different sizes do not exist. Models include the Poincaré disk, in which lines are arcs meeting the boundary at right angles.

## Spherical geometry
On a sphere, angle sum is greater than $180°$. The "lines" are great circles, and any two of them meet, so there are no parallels. A triangle with one vertex at the North Pole and two on the equator, $90°$ of longitude apart, has three right angles. Airline routes follow great circles, which is why a flight from New York to Tokyo passes over Alaska.

## A real example
Around 1830 János Bolyai in Hungary and Nikolai Lobachevsky in Russia independently published geometries in which the parallel postulate fails; Gauss had privately reached the same results and kept them to himself. In 1915 Albert Einstein's general relativity described gravity as the curvature of space and time. Measurements of starlight bending around the Sun during the 1919 eclipse confirmed it: physical space is not exactly Euclidean.`],
  ["capstone-synthesis", "Capstone synthesis", "One idea behind everything: proof from axioms.", `# Capstone synthesis

Step back, and the entire course reduces to a single sentence: geometry derives the properties of space from a few assumptions by proof, and measurement follows from congruence and similarity.

## The one theorem
$$a^2+b^2=c^2.$$

Everything you have learned elaborates this statement or leads to it:
- Postulates, reasoning, and parallel lines lay the foundation (Week 1).
- Congruence, the triangle angle sum, and quadrilaterals build on it (Week 2).
- Similarity yields the Pythagorean theorem, trigonometry, and the equation of a circle (Week 3).
- Area and volume measure figures, and changing one postulate yields new geometries (Week 4).

## Where geometry goes next
Trigonometry extends right-triangle ratios to all angles; analytic geometry and calculus measure curved shapes; linear algebra treats transformations as matrices. Differential geometry studies curved spaces, and topology studies the properties that survive any continuous deformation.

## A real example
In a 1750 letter to Christian Goldbach, Leonhard Euler observed that for every convex polyhedron the numbers of vertices, edges, and faces satisfy $V−E+F=2$: a cube has $8−12+6$, a tetrahedron $4−6+4$. The formula ignores all lengths and angles — it survives any stretching of the solid — and it became the starting point of topology, the geometry of shape without measurement.`],
];

type Problem = { lesson: number; prompt: string; correctAnswer: string };
const p = (lesson: number, prompt: string, correctAnswer: string): Problem => ({ lesson, prompt, correctAnswer });

const homeworkOne = [
  p(1, "Write the midpoint formula for $(x_1, y_1)$ and $(x_2, y_2)$.", "M = ((x_1 + x_2)/2, (y_1 + y_2)/2)"),
  p(1, "Write the distance formula for $(x_1, y_1)$ and $(x_2, y_2)$.", "d = √((x_2 − x_1)^2 + (y_2 − y_1)^2)"),
  p(2, "Write the relation between vertical angles $∠1$ and $∠3$.", "∠1 ≅ ∠3"),
  p(2, "Write the relation between supplementary angles $∠1$ and $∠2$.", "m∠1 + m∠2 = 180°"),
];
const homeworkTwo = [
  p(3, "Write the converse of $p→q$.", "q → p"),
  p(3, "Write the contrapositive of $p→q$.", "¬q → ¬p"),
  p(5, "Write the condition on slopes $m_1$ and $m_2$ for parallel lines.", "m_1 = m_2"),
  p(7, "Write the sum of the interior angles of a polygon with $n$ sides.", "(n−2)·180°"),
];
const midterm = [
  p(7, "Write the triangle sum theorem for $△ABC$.", "m∠A + m∠B + m∠C = 180°"),
  p(7, "Write the exterior angle theorem for exterior angle $∠4$ with remote interior angles $∠1$ and $∠2$.", "m∠4 = m∠1 + m∠2"),
  p(9, "List the five triangle congruence criteria.", "SSS, SAS, ASA, AAS, HL"),
  p(12, "Write the triangle inequality for sides $a, b, c$.", "a + b > c"),
  p(8, "Write the rule for reflecting $(x, y)$ across the x-axis.", "(x, y) → (x, −y)"),
  p(10, "Write the isosceles triangle theorem for $AB≅AC$ in $△ABC$.", "∠B ≅ ∠C"),
  p(11, "Write the ratio in which the centroid divides each median.", "2 : 1"),
  p(21, "Write the area of a trapezoid with bases $b_1, b_2$ and height $h$.", "A = (1/2) h (b_1 + b_2)"),
];
const final = [
  p(16, "Write the Pythagorean theorem.", "a^2 + b^2 = c^2"),
  p(16, "Write the side lengths of a 30-60-90 triangle with short leg $x$.", "x, x√3, 2x"),
  p(20, "Write the equation of a circle with center $(h, k)$ and radius $r$.", "(x − h)^2 + (y − k)^2 = r^2"),
  p(19, "Write the measure of an inscribed angle in terms of its intercepted arc.", "inscribed angle = (1/2) intercepted arc"),
  p(22, "Write the area of a circle.", "A = πr^2"),
  p(22, "Write the arc length of a central angle of $x°$ in a circle of radius $r$.", "s = (x/360) · 2πr"),
  p(24, "Write the volume of a cone.", "V = (1/3)πr^2 h"),
  p(25, "Write the volume of a sphere.", "V = (4/3)πr^3"),
  p(25, "Write the surface area of a sphere.", "S = 4πr^2"),
  p(28, "Write Euler's formula for a convex polyhedron.", "V−E+F=2"),
];

export const ASSIGNMENTS = [
  { kind: "homework" as const, title: "Homework 1.1 — Distance, midpoints, and angles", weekNumber: 1, isTimed: false, timeLimitMinutes: null, instructions: "Short-answer problems on segments and angles. Write each answer as the key formula in symbols using the on-screen math keyboard (use the Geometry tab for angle, congruence, and radical symbols).", problems: homeworkOne },
  { kind: "homework" as const, title: "Homework 1.2 — Reasoning and parallel lines", weekNumber: 1, isTimed: false, timeLimitMinutes: null, instructions: "Use the math keyboard for logical and angle symbols.", problems: homeworkTwo },
  { kind: "midterm" as const, title: "Midterm — Weeks 1 & 2", weekNumber: 2, isTimed: true, timeLimitMinutes: 60, instructions: "Cumulative midterm on foundations, proof, triangles, and quadrilaterals. 60 minutes. Math keyboard available; pasting disabled.", problems: midterm },
  { kind: "final" as const, title: "Final Exam — Geometry", weekNumber: 4, isTimed: true, timeLimitMinutes: 90, instructions: "Cumulative final covering all four weeks. 90 minutes. Math keyboard available; pasting disabled.", problems: final },
];