# CS 300 ABCU Advising Program - CS 499 Enhancement
## Algorithms and Data Structures Category

Enhanced version of the CS 300 Project Two advising program for the
CS 499 Computer Science Capstone ePortfolio.

## Files
- `ProjectTwo.cpp` ................. enhanced program (CS 499 submission)
- `ProjectTwo_ORIGINAL.cpp` ........ original CS 300 submission (before/after reference)
- `courses.csv` .................... sample data file for testing

## Build and Run
    g++ -std=c++17 -Wall -o ProjectTwo ProjectTwo.cpp
    ./ProjectTwo
Then select option 1 and enter `courses.csv`.

## Enhancements (each maps to a code review finding)

1. **Balanced BST build** — A plain BST degrades to O(n) on sorted input.
   The tree is now built median-first from a sorted vector, guaranteeing
   O(log n) height regardless of the file's sort order. See BuildFromSorted().

2. **Circular prerequisite detection** — A depth-first search now reports
   cycles (e.g. A requires B, B requires A) at load time before any data
   enters the tree. See detectCycles().

3. **O(1) prerequisite existence checks** — An unordered_set replaces the
   original O(n) linear vector scan performed for every prerequisite token.

4. **Case-normalized keys** — Course numbers are uppercased on load.
   The original uppercased only the search input, so a lowercase CSV entry
   would silently fail to match.

5. **Robust menu input** — Input is read as a string line and parsed with
   stoi(), preventing the infinite loop that occurred when a user typed a
   non-numeric character into cin >> int.
