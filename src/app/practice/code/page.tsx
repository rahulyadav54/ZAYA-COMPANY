'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Code2, 
  Terminal, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Zap, 
  Cpu, 
  Flame,
  ArrowRight,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

// Curated In-House Coding Challenge Problems
export const BUILTIN_CODING_PROBLEMS = [
  {
    id: 'two-sum',
    title: '1. Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    languageSupport: ['JavaScript', 'Python', 'Java', 'C++'],
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
    sampleInput: 'nums = [2,7,11,15], target = 9',
    sampleOutput: '[0,1]',
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      python: `def twoSum(nums, target):\n    prevMap = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap:\n            return [prevMap[diff], i]\n        prevMap[n] = i\n    return []`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> map;\n    for (int i = 0; i < nums.size(); i++) {\n        int diff = target - nums[i];\n        if (map.count(diff)) return {map[diff], i};\n        map[nums[i]] = i;\n    }\n    return {};\n}`,
      java: `public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int diff = target - nums[i];\n        if (map.containsKey(diff)) return new int[] { map.get(diff), i };\n        map.put(nums[i], i);\n    }\n    return new int[]{};\n}`
    },
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
    ]
  },
  {
    id: 'valid-palindrome',
    title: '2. Valid Palindrome',
    difficulty: 'Easy',
    category: 'Strings',
    languageSupport: ['JavaScript', 'Python', 'Java', 'C++'],
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
    sampleInput: 's = "A man, a plan, a canal: Panama"',
    sampleOutput: 'true',
    starterCode: {
      javascript: `function isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return clean === clean.split('').reverse().join('');\n}`,
      python: `def isPalindrome(s: str) -> bool:\n    clean = ''.join(c.lower() for c in s if c.isalnum())\n    return clean == clean[::-1]`,
      cpp: `bool isPalindrome(string s) {\n    string clean = "";\n    for (char c : s) if (isalnum(c)) clean += tolower(c);\n    string rev = clean;\n    reverse(rev.begin(), rev.end());\n    return clean == rev;\n}`,
      java: `public boolean isPalindrome(String s) {\n    String clean = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();\n    String rev = new StringBuilder(clean).reverse().toString();\n    return clean.equals(rev);\n}`
    },
    testCases: [
      { input: { s: "A man, a plan, a canal: Panama" }, expected: true },
      { input: { s: "race a car" }, expected: false },
      { input: { s: " " }, expected: true }
    ]
  },
  {
    id: 'longest-substring-without-repeating-characters',
    title: '3. Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Sliding Window',
    languageSupport: ['JavaScript', 'Python', 'Java', 'C++'],
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    sampleInput: 's = "abcabcbb"',
    sampleOutput: '3',
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n  let set = new Set();\n  let left = 0;\n  let maxLen = 0;\n  for (let right = 0; right < s.length; right++) {\n    while (set.has(s[right])) {\n      set.delete(s[left]);\n      left++;\n    }\n    set.add(s[right]);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}`,
      python: `def lengthOfLongestSubstring(s: str) -> int:\n    charSet = set()\n    left = 0\n    res = 0\n    for right in range(len(s)):\n        while s[right] in charSet:\n            charSet.remove(s[left])\n            left += 1\n        charSet.add(s[right])\n        res = max(res, right - left + 1)\n    return res`,
      cpp: `int lengthOfLongestSubstring(string s) {\n    unordered_set<char> set;\n    int left = 0, maxLen = 0;\n    for (int right = 0; right < s.length(); right++) {\n        while (set.count(s[right])) {\n            set.erase(s[left]);\n            left++;\n        }\n        set.insert(s[right]);\n        maxLen = max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}`,
      java: `public int lengthOfLongestSubstring(String s) {\n    Set<Character> set = new HashSet<>();\n    int left = 0, maxLen = 0;\n    for (int right = 0; right < s.length(); right++) {\n        while (set.contains(s.charAt(right))) {\n            set.remove(s.charAt(left));\n            left++;\n        }\n        set.add(s.charAt(right));\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}`
    },
    testCases: [
      { input: { s: "abcabcbb" }, expected: 3 },
      { input: { s: "bbbbb" }, expected: 1 },
      { input: { s: "pwwkew" }, expected: 3 }
    ]
  },
  {
    id: 'reverse-linked-list',
    title: '4. Reverse Linked List',
    difficulty: 'Easy',
    category: 'Linked List',
    languageSupport: ['JavaScript', 'Python', 'Java', 'C++'],
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    sampleInput: 'head = [1,2,3,4,5]',
    sampleOutput: '[5,4,3,2,1]',
    starterCode: {
      javascript: `function reverseList(head) {\n  let prev = null;\n  let curr = head;\n  while (curr !== null) {\n    let nextTemp = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = nextTemp;\n  }\n  return prev;\n}`,
      python: `def reverseList(head):\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev`,
      cpp: `ListNode* reverseList(ListNode* head) {\n    ListNode* prev = nullptr;\n    ListNode* curr = head;\n    while (curr) {\n        ListNode* nextTemp = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}`,
      java: `public ListNode reverseList(ListNode head) {\n    ListNode prev = null;\n    ListNode curr = head;\n    while (curr != null) {\n        ListNode nextTemp = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}`
    },
    testCases: [
      { input: { head: [1, 2, 3, 4, 5] }, expected: [5, 4, 3, 2, 1] },
      { input: { head: [1, 2] }, expected: [2, 1] }
    ]
  },
  {
    id: 'binary-tree-inorder-traversal',
    title: '5. Binary Tree Inorder Traversal',
    difficulty: 'Easy',
    category: 'Trees & Graphs',
    languageSupport: ['JavaScript', 'Python', 'Java', 'C++'],
    description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',
    sampleInput: 'root = [1,null,2,3]',
    sampleOutput: '[1,3,2]',
    starterCode: {
      javascript: `function inorderTraversal(root) {\n  const res = [];\n  function helper(node) {\n    if (!node) return;\n    helper(node.left);\n    res.push(node.val);\n    helper(node.right);\n  }\n  helper(root);\n  return res;\n}`,
      python: `def inorderTraversal(root):\n    res = []\n    def dfs(node):\n        if not node: return\n        dfs(node.left)\n        res.append(node.val)\n        dfs(node.right)\n    dfs(root)\n    return res`,
      cpp: `vector<int> inorderTraversal(TreeNode* root) {\n    vector<int> res;\n    helper(root, res);\n    return res;\n}`,
      java: `public List<Integer> inorderTraversal(TreeNode root) {\n    List<Integer> res = new ArrayList<>();\n    helper(root, res);\n    return res;\n}`
    },
    testCases: [
      { input: { root: [1, null, 2, 3] }, expected: [1, 3, 2] },
      { input: { root: [] }, expected: [] }
    ]
  },
  {
    id: 'climbing-stairs',
    title: '6. Climbing Stairs',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    languageSupport: ['JavaScript', 'Python', 'Java', 'C++'],
    description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    sampleInput: 'n = 3',
    sampleOutput: '3',
    starterCode: {
      javascript: `function climbStairs(n) {\n  if (n <= 2) return n;\n  let one = 1, two = 2;\n  for (let i = 3; i <= n; i++) {\n    let current = one + two;\n    one = two;\n    two = current;\n  }\n  return two;\n}`,
      python: `def climbStairs(n: int) -> int:\n    if n <= 2: return n\n    one, two = 1, 2\n    for i in range(3, n + 1):\n        one, two = two, one + two\n    return two`,
      cpp: `int climbStairs(int n) {\n    if (n <= 2) return n;\n    int one = 1, two = 2;\n    for (int i = 3; i <= n; i++) {\n        int temp = one + two;\n        one = two;\n        two = temp;\n    }\n    return two;\n}`,
      java: `public int climbStairs(int n) {\n    if (n <= 2) return n;\n    int one = 1, two = 2;\n    for (int i = 3; i <= n; i++) {\n        int temp = one + two;\n        one = two;\n        two = temp;\n    }\n    return two;\n}`
    },
    testCases: [
      { input: { n: 2 }, expected: 2 },
      { input: { n: 3 }, expected: 3 },
      { input: { n: 5 }, expected: 8 }
    ]
  }
];

export default function PublicCodingArenaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', ...Array.from(new Set(BUILTIN_CODING_PROBLEMS.map(p => p.category)))];

  const filteredProblems = BUILTIN_CODING_PROBLEMS.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'ALL' || p.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <main className="flex-1">
        {/* Header Hero Banner */}
        <section className="relative py-16 px-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white overflow-hidden border-b border-slate-800">
          <div className="container mx-auto max-w-6xl space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-widest border border-blue-500/30">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>In-House Interactive Coding Arena</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight italic">
              Solve Real LeetCode & HackerRank <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Algorithmic Challenges</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm font-medium max-w-2xl mx-auto leading-relaxed">
              Practice Data Structures, Algorithms, Dynamic Programming, and SQL directly inside the ZAYA CODE HUB browser IDE. Instant execution worker and automated test case runner.
            </p>
          </div>
        </section>

        {/* Filter Controls */}
        <section className="py-10 px-6 container mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 mr-2">Difficulty:</span>
              {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search coding problem..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          {/* Problem Table */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="p-5 pl-8">Status</th>
                    <th className="p-5">Title</th>
                    <th className="p-5">Category</th>
                    <th className="p-5">Difficulty</th>
                    <th className="p-5 text-right pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                  {filteredProblems.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-5 pl-8">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      </td>
                      <td className="p-5 font-black text-slate-900 dark:text-white text-sm">
                        {p.title}
                      </td>
                      <td className="p-5 text-slate-500 dark:text-slate-400 font-medium">
                        {p.category}
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          p.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : p.difficulty === 'Medium'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-red-500/10 text-red-600 border-red-500/20'
                        }`}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="p-5 text-right pr-8">
                        <Link
                          href={`/practice/code/${p.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md shadow-blue-600/20 transition-all active:scale-95"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Solve Challenge</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
