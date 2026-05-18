---
title: "CS 110 — Programming Fundamentals 1"
date: 2026-05-18
course: "CS 110"
course_title: "Programming Fundamentals 1"
type: "course-summary"
curator: "Joshua Keyes"
compiler: "Claude (Opus 4.7)"
source: "https://catalog.acalog.cwu.edu/preview_course_nopop.php?catoid=64&coid=146739, https://catalog.acalog.cwu.edu/preview_course_nopop.php?catoid=60&coid=135822, https://catalog.acalog.cwu.edu/preview_entity.php?catoid=67&ent_oid=4336&print, https://www.cwu.edu/academics/explore-programs/computer-science-bachelor-science.php"
category: "CS"
category_label: "Computer Science"
image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1600&q=80&auto=format&fit=crop"
image_credit: "Photo via Unsplash"
tags: ["Course Reference", "Programming Fundamentals", "CS 110", "AI-compiled"]
draft: false
---

## Course Snapshot

- **Institution.** Central Washington University.
- **Catalog description.** "Fundamental concepts of programming from an object-oriented perspective. Classes, objects and methods, algorithm development, problem-solving techniques, basic control structures, primitive types and arrays."
- **Credits.** 4
- **General-education designation.** None. CS 110 is a major-track foundation course, not a gen-ed offering.
- **Prerequisites.** None listed in the catalog. Students typically come in with high-school-algebra-level math fluency and no prior programming required.
- **Approach.** Object-oriented from the start. CWU's CS department teaches CS 110 in Java, with classes, objects, and methods introduced alongside the standard imperative constructs rather than after them. The course is the on-ramp to CS 111 (Programming Fundamentals II) and the rest of the Computer Science major sequence.

## Official Learning Outcomes

Quoted from the CWU course catalog. Upon successful completion, students will demonstrate the ability to:

1. "Analyze the behavior of simple programs involving fundamental programming constructs."
2. "Write programs that use each of the following fundamental programming constructs: basic computation, simple I/O, standard conditional and iterative structures."
3. "Write programs in the object-oriented paradigm using objects, primitive data, classes, and method definitions."

The catalog lists three outcomes (not the four-to-six common at other institutions); the brevity reflects that CS 110 is a first-semester foundation course, with deeper coverage of inheritance, polymorphism, recursion, and data structures pushed into CS 111 and beyond.

## How the Course Is Usually Organized

Intro programming courses, including CS 110 as written, tend to run in one of two passes:

- **Imperative-then-objects.** Variables, types, conditionals, loops, methods, arrays first. Classes and objects introduced near the end. Common in older curricula.
- **Objects-early (CWU's approach).** Use objects from week one (Strings, Scanners, library classes) so the syntax is familiar, then teach students to write their own classes alongside the imperative constructs.

CWU's CS 110 is the objects-early flavor. The catalog ordering (classes / objects / methods / algorithms / control / types / arrays) signals that students meet the object syntax as users before they meet it as authors.

## Topical Outline

### Programming and the Machine

- **What a program is.** Source code, compilation, bytecode (Java), execution. Difference between writing code and running code.
- **Toolchain.** IDE (commonly Eclipse, IntelliJ IDEA, or VS Code), JDK, command-line `javac` / `java` for reference. File-and-class correspondence in Java.
- **The edit / compile / run / debug loop.** The actual rhythm of the work.

### Primitive Types and Variables

- **Primitive types in Java.** `int`, `long`, `short`, `byte`, `double`, `float`, `char`, `boolean`. Size, range, default values.
- **Variable declaration and assignment.** Static typing. The difference between declaration, initialization, and reassignment.
- **Operators.** Arithmetic (`+ - * / %`), assignment and compound assignment (`+= -= *= /=`), increment / decrement (`++ --`), relational (`< <= > >= == !=`), logical (`&& || !`).
- **Type conversion.** Widening (implicit), narrowing (explicit cast), integer division vs. floating-point division, the `%` operator and its sign behavior.
- **Constants.** `final` keyword. Naming conventions (UPPER_SNAKE_CASE).

### Input, Output, and Strings

- **Console output.** `System.out.print`, `System.out.println`, `System.out.printf` and format specifiers.
- **Console input.** `java.util.Scanner` with `nextInt`, `nextDouble`, `next`, `nextLine`, and the famous "leftover newline" gotcha.
- **Strings.** `String` as an object (objects-early payoff). Immutability. Common methods (`length`, `charAt`, `substring`, `indexOf`, `equals`, `equalsIgnoreCase`, `toLowerCase`, `toUpperCase`, `trim`, `split`). String concatenation with `+`.
- **Escape sequences.** `\n`, `\t`, `\"`, `\\`.

### Control Flow: Conditionals

- **`if` / `else if` / `else`.** Single-branch, two-branch, multi-branch.
- **Boolean expressions.** Short-circuit evaluation in `&&` and `||`. De Morgan's laws as a debugging tool.
- **Comparing values.** Primitive equality with `==`, object / String equality with `.equals()`. The classic intro-programming bug.
- **`switch` / `case`.** When it is cleaner than an `if` ladder. Fall-through behavior; modern `switch` expressions if the course uses a recent Java.

### Control Flow: Loops

- **`while`.** Pre-test loop. The standard pattern for "loop until a sentinel."
- **`do / while`.** Post-test loop. Useful for input validation.
- **`for`.** Counter-controlled iteration. The three-part header (init, condition, update).
- **Enhanced `for` (for-each).** Iterating arrays and collections without an index.
- **`break` and `continue`.** Use sparingly. Readability over cleverness.
- **Nested loops.** Row / column patterns, multiplication tables, ASCII art exercises.
- **Loop invariants.** Informal at this level, but the idea that "this is true every time we hit the top of the loop" is introduced.

### Methods

- **Defining methods.** Return type, name, parameter list, body. `void` return type.
- **Calling methods.** Arguments vs. parameters. Pass-by-value (Java is strictly pass-by-value, including for object references).
- **Method overloading.** Same name, different parameter lists. The compiler picks based on signature.
- **Scope.** Local variables, parameters, the block in which a name is visible.
- **Decomposition.** Breaking a big problem into small named pieces. The first real software-engineering habit the course teaches.
- **`return`.** Returning a value, returning early, the "single exit point" debate (in CS 110 it is usually just modeled, not debated).

### Classes and Objects

- **The `class` keyword.** Defining a new type.
- **Instance variables (fields).** State the object remembers between method calls.
- **Constructors.** How objects come into being. Default constructor vs. explicit constructor. Overloaded constructors.
- **Instance methods.** Methods that operate on a particular object's state.
- **`this` reference.** Disambiguating field vs. parameter. The object the method was called on.
- **Access modifiers.** `public`, `private`. Encapsulation as a design idea even before it is enforced rigorously.
- **Getters and setters.** Why fields are usually `private` with `public` accessors. The first encounter with the "interface vs. implementation" distinction.
- **`static` vs. instance.** Class-level data and methods (like `Math.sqrt`) vs. per-object data and methods.
- **`toString`.** The first method students learn to override. Why it makes debugging easier.

### Arrays

- **One-dimensional arrays.** Declaration, allocation with `new`, initialization with `{}`.
- **Indexing.** Zero-based. `.length` (a field, not a method).
- **Iteration.** Standard `for` with an index; enhanced `for` for read-only traversal.
- **Common operations.** Sum, max, min, count, search (linear), reverse, copy.
- **Aliasing.** Two references to the same array. Why `arr2 = arr1` is not a copy.
- **Two-dimensional arrays.** Array of arrays. Row-major iteration with nested loops.
- **Arrays vs. ArrayList (preview).** Many CS 110 sections introduce `ArrayList` lightly so students see the difference between fixed-size and growable.

### Algorithm Development and Problem-Solving

- **Pseudocode and stepwise refinement.** Write the problem in English. Refine to pseudocode. Refine to Java.
- **Tracing.** Hand-execute a program with a table of variable values. Catches more bugs than any debugger.
- **Test-as-you-go.** Run after each small change. The student who writes 200 lines then runs once is the student who suffers.
- **Basic complexity intuition (informal).** "This loop runs n times." Big-O notation is not formally taught here but the language is seeded.

### Debugging and Defensive Programming

- **Compile-time errors.** Syntax, missing semicolons, missing types, mismatched braces. Read the error message; the first error is usually the only real error.
- **Runtime errors.** `NullPointerException`, `ArrayIndexOutOfBoundsException`, `ArithmeticException` (division by zero on integers), `InputMismatchException` from Scanner.
- **Logic errors.** The program runs but produces the wrong answer. Tracing, `println` debugging, the IDE step-debugger.
- **Edge cases.** Empty input, single-element input, maximum / minimum values, negative numbers, off-by-one boundaries.

### Style and Convention

- **Naming.** `camelCase` for variables and methods, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.
- **Indentation and formatting.** Four spaces (or whatever the course style guide says). Auto-format in the IDE.
- **Comments.** Javadoc-style on classes and methods. Inline comments for non-obvious code, not for narration of the obvious.
- **Self-documenting code.** Good names first, comments second.

## Cross-Cutting Concepts

Programming-fundamentals ideas that recur across every language a student will ever touch.

- **Abstraction.** Each layer hides the layer below. A method name stands in for its body. A class name stands in for its fields and methods. Learning to think at the right altitude is the meta-skill of the whole course.
- **State.** A variable holds a value. An object holds many values. A program's "state" is the snapshot of all of those at one instant. Reasoning about how state changes over time is the core of programming.
- **Control flow.** What runs next. Sequence, selection, iteration are the three primitives. Everything fancier (recursion, events, async) is built on top.
- **Decomposition.** Big problems get broken into small problems. Small problems become methods. Related methods become classes. Related classes become packages. This pattern continues forever.
- **Encapsulation.** Pair the data with the operations that work on it. Make the data private. Expose a minimal public interface. The reason objects exist.
- **The compiler is your first reader.** It is brutally literal and never tired. A program that compiles is not yet correct, but a program that does not compile is definitely not.
- **Testing is part of writing.** Writing the test (or even just the mental test) sharpens the spec. Running the test catches what the writer missed.
- **Reading code is harder than writing code.** Most professional time is spent reading. The course quietly builds the habit by making students trace, modify, and debug code they did not write.

## Commonly Used Reference Texts in Intro Programming

These are the texts most often paired with an objects-early Java intro course. Any one of them is a usable companion when returning to the material.

- Reges, Stuart and Marty Stepp, *Building Java Programs: A Back to Basics Approach.* (The objects-later companion; CWU's catalog wording leans objects-early but Reges / Stepp is still the most-adopted intro Java textbook in U.S. CS programs.)
- Horstmann, Cay, *Java Concepts: Early Objects.*
- Lewis, John and William Loftus, *Java Software Solutions.*
- Sedgewick, Robert and Kevin Wayne, *Introduction to Programming in Java: An Interdisciplinary Approach.* (The Princeton text; rigorous, problem-driven.)
- Bloch, Joshua, *Effective Java.* (Not an intro text. Worth knowing it exists for the semester after this one.)
- Oracle's *Java Tutorials* (docs.oracle.com/javase/tutorial) and the *Java SE API Documentation*. The reference every Java programmer keeps a tab open to.

## Reading the Field as a Whole

A few patterns worth holding onto.

- **The language is a vehicle, not the destination.** CS 110 happens to be in Java, but the constructs (types, control flow, methods, classes, arrays) are the same in C#, Python, C++, Swift, Kotlin, JavaScript. The student who learns the constructs cleanly can pick up any language in a few weeks.
- **Objects-early bets on familiarity.** Treating `String` and `Scanner` as objects from day one means the syntax `someObject.someMethod()` stops being strange before students have to write their own classes. The bet usually pays off; the cost is that the first few weeks have an "I know what to type but not why" feel.
- **The course's biggest invisible curriculum is debugging.** No syllabus block is labeled "frustration tolerance," but the course is mostly that. The students who finish strong are the ones who learn to read error messages without flinching.
- **Style matters earlier than students think.** The bad habits picked up in CS 110 (one-letter names, no decomposition, mutating state everywhere) are the habits the rest of the major will spend three years undoing. Good style early is cheap; bad style early is expensive.
- **Confidence compounds.** The students who write small programs every day, even pointless ones, end the term more fluent than the students who only do the assignments. Programming is a motor skill as much as a knowledge body.

## Curator's Takeaway

*This section is the place for Joshua's own short reflection on the course, what stuck, what surprised, what shows up in the studio practice or worldbuilding work. To be filled in once he has reviewed the rest of the page.*
