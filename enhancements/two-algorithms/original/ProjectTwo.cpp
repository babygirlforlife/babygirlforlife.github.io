//============================================================================
// Name        : ProjectTwo.cpp
// Author      : Wuraola Akindele
// Version     : 1.0 (CS 300 original submission)
// Description : CS 300 Project Two - ABCU Advising Assistance Program
//               Original version before CS 499 enhancements.
//============================================================================
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

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

class BinarySearchTree {
private:
    Node* root;
    void inOrder(Node* node) {
        if (node == nullptr) return;
        inOrder(node->left);
        cout << node->course.courseNumber << ", " << node->course.name << endl;
        inOrder(node->right);
    }
    Node* insert(Node* node, Course course) {
        if (node == nullptr) return new Node(course);
        if (course.courseNumber < node->course.courseNumber)
            node->left = insert(node->left, course);
        else if (course.courseNumber > node->course.courseNumber)
            node->right = insert(node->right, course);
        return node;
    }
    Node* search(Node* node, const string& courseNumber) {
        if (node == nullptr || node->course.courseNumber == courseNumber)
            return node;
        if (courseNumber < node->course.courseNumber)
            return search(node->left, courseNumber);
        return search(node->right, courseNumber);
    }
public:
    BinarySearchTree() : root(nullptr) {}
    void PrintInOrder() { inOrder(root); }
    void Insert(Course course) { root = insert(root, course); }
    Course Search(string courseNumber) {
        transform(courseNumber.begin(), courseNumber.end(), courseNumber.begin(), ::toupper);
        Node* result = search(root, courseNumber);
        if (result != nullptr) return result->course;
        return Course{};
    }
};

void loadCourses(const string& filePath, BinarySearchTree* bst) {
    ifstream file(filePath);
    if (!file.is_open()) {
        cout << "Error: Could not open file." << endl;
        return;
    }
    vector<string> courseNumbers;
    string line;
    while (getline(file, line)) {
        stringstream ss(line);
        string token;
        if (getline(ss, token, ',')) courseNumbers.push_back(token);
    }
    file.clear(); file.seekg(0);
    while (getline(file, line)) {
        stringstream ss(line);
        vector<string> tokens;
        string token;
        while (getline(ss, token, ',')) tokens.push_back(token);
        if (tokens.size() < 2) continue;
        Course course;
        course.courseNumber = tokens[0];
        course.name = tokens[1];
        for (size_t i = 2; i < tokens.size(); i++) {
            // O(n) linear scan for each prerequisite
            for (const string& num : courseNumbers) {
                if (num == tokens[i]) { course.prerequisites.push_back(tokens[i]); break; }
            }
        }
        bst->Insert(course);
    }
    file.close();
    cout << "Courses loaded successfully." << endl;
}

int main() {
    BinarySearchTree* bst = new BinarySearchTree();
    cout << "Welcome to the course planner." << endl;
    int choice = 0;
    while (choice != 9) {
        cout << "\n   1. Load Data Structure.\n   2. Print Course List.\n   3. Print Course.\n   9. Exit\n\nWhat would you like to do? ";
        cin >> choice;  // NOTE: causes infinite loop on non-numeric input
        switch (choice) {
        case 1: { string fp; cout << "Enter the file name: "; cin >> fp; loadCourses(fp, bst); break; }
        case 2: cout << "\nHere is a sample schedule:\n\n"; bst->PrintInOrder(); break;
        case 3: { string cn; cout << "What course do you want to know about? "; cin >> cn;
                  Course c = bst->Search(cn);
                  if (!c.courseNumber.empty()) {
                      cout << c.courseNumber << ", " << c.name << endl;
                      if (!c.prerequisites.empty()) { cout << "Prerequisites: "; for (size_t i=0;i<c.prerequisites.size();i++){if(i>0)cout<<", ";cout<<c.prerequisites[i];} cout<<endl; }
                      else cout << "Prerequisites: None" << endl;
                  } else cout << "Course " << cn << " not found." << endl; break; }
        case 9: cout << "Thank you for using the course planner!" << endl; break;
        default: cout << choice << " is not a valid option." << endl; break;
        }
    }
    delete bst;
    return 0;
}
