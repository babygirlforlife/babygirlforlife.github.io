//============================================================================
// Name        : ProjectTwo.cpp
// Author      : Wuraola Akindele
// Version     : 2.0 (CS 499 enhanced)
// Description : CS 300 Project Two - ABCU Advising Assistance Program
//               Stores course data in a Binary Search Tree for fast,
//               sorted retrieval.
//
// CS 499 Enhancement Summary (Algorithms and Data Structures):
//   1. Balanced tree construction. A plain BST degrades to O(n) when keys
//      are inserted in sorted order. The tree is now built median-first
//      (divide and conquer) from a sorted vector, keeping it height balanced
//      so every search, insert, and print stays O(log n).
//   2. Circular prerequisite detection. A depth-first search now detects and
//      reports cycles (e.g. A requires B, B requires A) at load time.
//   3. O(1) prerequisite existence checks using an unordered_set, replacing
//      the original O(n) linear vector scan per prerequisite.
//   4. Case-normalized keys. Course numbers are uppercased on load so
//      storage and search always agree.
//   5. Robust menu input. Input is read as a line and validated with stoi,
//      preventing the infinite loop caused by non-numeric cin >> int reads.
//============================================================================

#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <algorithm>
#include <unordered_set>
#include <unordered_map>

using namespace std;

//============================================================================
// Data Structures
//============================================================================

struct Course {
    string courseNumber;
    string name;
    vector<string> prerequisites;
};

struct Node {
    Course course;
    Node* left;
    Node* right;
    Node(Course c) : course(c), left(nullptr), right(nullptr) {}
};

//============================================================================
// BST class
//============================================================================

class BinarySearchTree {
private:
    Node* root;

    // Recursive in-order traversal
    void inOrder(Node* node) {
        if (node == nullptr) return;
        inOrder(node->left);
        cout << node->course.courseNumber << ", " << node->course.name << endl;
        inOrder(node->right);
    }

    // Insert a node into the BST
    Node* insert(Node* node, Course course) {
        if (node == nullptr) return new Node(course);
        if (course.courseNumber < node->course.courseNumber)
            node->left = insert(node->left, course);
        else if (course.courseNumber > node->course.courseNumber)
            node->right = insert(node->right, course);
        return node;
    }

    // Search the BST for a course by number
    Node* search(Node* node, const string& courseNumber) {
        if (node == nullptr || node->course.courseNumber == courseNumber)
            return node;
        if (courseNumber < node->course.courseNumber)
            return search(node->left, courseNumber);
        return search(node->right, courseNumber);
    }

    // ENHANCEMENT 1: Balanced median-first build
    // Builds a balanced BST from a sorted vector by inserting the median
    // first, then recursing on left and right halves. This guarantees
    // O(log n) height regardless of the input file's sort order.
    Node* buildBalanced(vector<Course>& courses, int low, int high) {
        if (low > high) return nullptr;
        int mid = low + (high - low) / 2;
        Node* node = new Node(courses[mid]);
        node->left  = buildBalanced(courses, low, mid - 1);
        node->right = buildBalanced(courses, mid + 1, high);
        return node;
    }

    // Destructor helper
    void destroyTree(Node* node) {
        if (node == nullptr) return;
        destroyTree(node->left);
        destroyTree(node->right);
        delete node;
    }

public:
    BinarySearchTree() : root(nullptr) {}
    ~BinarySearchTree() { destroyTree(root); }

    void PrintInOrder() { inOrder(root); }

    void Insert(Course course) {
        root = insert(root, course);
    }

    // Build a balanced BST from a sorted vector (ENHANCEMENT 1)
    void BuildFromSorted(vector<Course>& courses) {
        sort(courses.begin(), courses.end(),
             [](const Course& a, const Course& b) {
                 return a.courseNumber < b.courseNumber;
             });
        root = buildBalanced(courses, 0, (int)courses.size() - 1);
    }

    Course Search(string courseNumber) {
        // Normalize search key to uppercase (ENHANCEMENT 4)
        transform(courseNumber.begin(), courseNumber.end(),
                  courseNumber.begin(), ::toupper);
        Node* result = search(root, courseNumber);
        if (result != nullptr) return result->course;
        return Course{};
    }
};

//============================================================================
// ENHANCEMENT 2: Circular prerequisite detection via DFS
// Detects cycles in the prerequisite graph. If Course A requires Course B
// and Course B requires Course A, a student can never satisfy either.
//============================================================================

bool hasCycleDFS(const string& node,
                 const unordered_map<string, vector<string>>& graph,
                 unordered_set<string>& visited,
                 unordered_set<string>& inStack) {
    visited.insert(node);
    inStack.insert(node);
    auto it = graph.find(node);
    if (it != graph.end()) {
        for (const string& neighbor : it->second) {
            if (inStack.count(neighbor)) return true;
            if (!visited.count(neighbor) &&
                hasCycleDFS(neighbor, graph, visited, inStack))
                return true;
        }
    }
    inStack.erase(node);
    return false;
}

bool detectCycles(const vector<Course>& courses) {
    // Build adjacency map: courseNumber -> prerequisites
    unordered_map<string, vector<string>> graph;
    for (const Course& c : courses)
        graph[c.courseNumber] = c.prerequisites;

    unordered_set<string> visited, inStack;
    for (const Course& c : courses) {
        if (!visited.count(c.courseNumber)) {
            if (hasCycleDFS(c.courseNumber, graph, visited, inStack)) {
                return true;
            }
        }
    }
    return false;
}

//============================================================================
// Load and build
//
// Design trade-off note (BST vs hash table):
//   A hash table would give O(1) average lookup and O(n) load, but it cannot
//   produce an in-order traversal without sorting afterward. Because this
//   program's most frequent operation is printing the full sorted catalog,
//   the BST is the better fit: in-order traversal is free and O(n), whereas
//   sorting a hash table's output would add O(n log n) on every print call.
//============================================================================

void loadAndBuild(const string& filePath, BinarySearchTree* bst) {
    ifstream file(filePath);
    if (!file.is_open()) {
        cout << "Error: Could not open file '" << filePath << "'." << endl;
        return;
    }

    vector<Course> courses;

    // ENHANCEMENT 3: unordered_set for O(1) existence checks
    unordered_set<string> courseNumbers;

    // First pass: collect all course numbers
    string line;
    while (getline(file, line)) {
        if (line.empty()) continue;
        stringstream ss(line);
        string token;
        if (getline(ss, token, ',')) {
            // ENHANCEMENT 4: normalize to uppercase
            transform(token.begin(), token.end(), token.begin(), ::toupper);
            string trimmed = token;
            trimmed.erase(0, trimmed.find_first_not_of(" \t\r\n"));
            trimmed.erase(trimmed.find_last_not_of(" \t\r\n") + 1);
            if (!trimmed.empty())
                courseNumbers.insert(trimmed);
        }
    }

    // Second pass: build course objects
    file.clear();
    file.seekg(0);
    while (getline(file, line)) {
        if (line.empty()) continue;
        stringstream ss(line);
        vector<string> tokens;
        string token;
        while (getline(ss, token, ',')) {
            token.erase(0, token.find_first_not_of(" \t\r\n"));
            token.erase(token.find_last_not_of(" \t\r\n") + 1);
            if (!token.empty()) tokens.push_back(token);
        }
        if (tokens.size() < 2) {
            cout << "Warning: Skipping malformed line: " << line << endl;
            continue;
        }

        Course course;
        // ENHANCEMENT 4: uppercase normalization
        course.courseNumber = tokens[0];
        transform(course.courseNumber.begin(), course.courseNumber.end(),
                  course.courseNumber.begin(), ::toupper);
        course.name = tokens[1];

        for (size_t i = 2; i < tokens.size(); i++) {
            string prereq = tokens[i];
            transform(prereq.begin(), prereq.end(), prereq.begin(), ::toupper);
            // ENHANCEMENT 3: O(1) lookup
            if (courseNumbers.count(prereq)) {
                course.prerequisites.push_back(prereq);
            } else {
                cout << "Warning: Prerequisite '" << prereq
                     << "' for course '" << course.courseNumber
                     << "' not found in catalog. Skipping." << endl;
            }
        }
        courses.push_back(course);
    }
    file.close();

    // ENHANCEMENT 2: detect cycles before loading into tree
    if (detectCycles(courses)) {
        cout << "Error: Circular prerequisite dependency detected in '"
             << filePath << "'. Data not loaded." << endl;
        return;
    }

    // ENHANCEMENT 1: build balanced BST
    bst->BuildFromSorted(courses);
    cout << "Courses loaded successfully." << endl;
}

//============================================================================
// Main
//============================================================================

int main() {
    BinarySearchTree* bst = new BinarySearchTree();
    bool dataLoaded = false;

    cout << "Welcome to the course planner." << endl;

    int choice = 0;
    while (choice != 9) {
        cout << endl;
        cout << "   1. Load Data Structure." << endl;
        cout << "   2. Print Course List." << endl;
        cout << "   3. Print Course." << endl;
        cout << "   9. Exit" << endl;
        cout << endl;
        cout << "What would you like to do? ";

        // ENHANCEMENT 5: robust input — no infinite loop on non-numeric entry
        string inputLine;
        getline(cin, inputLine);
        try {
            choice = stoi(inputLine);
        } catch (...) {
            choice = -1;
        }

        switch (choice) {
        case 1: {
            cout << "Enter the file name: ";
            string filePath;
            getline(cin, filePath);
            loadAndBuild(filePath, bst);
            dataLoaded = true;
            break;
        }
        case 2:
            if (!dataLoaded) {
                cout << "Please load data first (option 1)." << endl;
            } else {
                cout << endl << "Here is a sample schedule:" << endl << endl;
                bst->PrintInOrder();
            }
            break;
        case 3: {
            if (!dataLoaded) {
                cout << "Please load data first (option 1)." << endl;
                break;
            }
            cout << "What course do you want to know about? ";
            string courseNumber;
            getline(cin, courseNumber);
            Course course = bst->Search(courseNumber);
            if (!course.courseNumber.empty()) {
                cout << course.courseNumber << ", " << course.name << endl;
                if (!course.prerequisites.empty()) {
                    cout << "Prerequisites: ";
                    for (size_t i = 0; i < course.prerequisites.size(); i++) {
                        if (i > 0) cout << ", ";
                        cout << course.prerequisites[i];
                    }
                    cout << endl;
                } else {
                    cout << "Prerequisites: None" << endl;
                }
            } else {
                cout << "Course " << courseNumber << " not found." << endl;
            }
            break;
        }
        case 9:
            cout << "Thank you for using the course planner!" << endl;
            break;
        default:
            cout << choice << " is not a valid option." << endl;
            break;
        }
    }

    delete bst;
    return 0;
}
