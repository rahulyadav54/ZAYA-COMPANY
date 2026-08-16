import type { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

const CODING_PROBLEMS_META: Record<string, { title: string; category: string; desc: string }> = {
  'two-sum': {
    title: 'Two Sum Problem - Code Solution & Online IDE',
    category: 'Arrays & Hashing',
    desc: 'Solve the Two Sum algorithmic problem online in JavaScript, Python, C++, and Java. Test code against real-time test cases on ZAYA CODE HUB.',
  },
  'valid-palindrome': {
    title: 'Valid Palindrome - DSA Coding Challenge',
    category: 'Strings',
    desc: 'Check if a string is a palindrome ignoring non-alphanumeric characters. Online code runner in JS, Python, CPP, and Java on ZAYA CODE HUB.',
  },
  'longest-substring-without-repeating-characters': {
    title: 'Longest Substring Without Repeating Characters - Sliding Window DSA',
    category: 'Sliding Window',
    desc: 'Find the length of the longest substring without repeating characters using the sliding window technique on ZAYA CODE HUB.',
  },
  'reverse-linked-list': {
    title: 'Reverse Linked List - Data Structures Coding Problem',
    category: 'Linked List',
    desc: 'Reverse a singly linked list iteratively and recursively in JavaScript, Python, C++, and Java on ZAYA CODE HUB.',
  },
  'binary-tree-inorder-traversal': {
    title: 'Binary Tree Inorder Traversal - Trees & Graphs Algorithm',
    category: 'Trees & Graphs',
    desc: 'Solve Binary Tree Inorder Traversal using recursive DFS or iterative stack on ZAYA CODE HUB Coding Arena.',
  },
  'valid-anagram': {
    title: 'Valid Anagram - String Frequency Hash Map Challenge',
    category: 'Strings',
    desc: 'Determine if two strings are anagrams using hash map frequency count in JS, Python, C++, and Java on ZAYA CODE HUB.',
  },
  'best-time-to-buy-and-sell-stock': {
    title: 'Best Time to Buy and Sell Stock - Dynamic Programming & Arrays',
    category: 'Arrays & Sliding Window',
    desc: 'Maximize stock profit algorithm with single-pass O(N) solution in Python, JavaScript, Java, and C++ on ZAYA CODE HUB.',
  },
  'valid-parentheses': {
    title: 'Valid Parentheses - Stack Data Structure Problem',
    category: 'Stack',
    desc: 'Validate balanced brackets and parentheses using stack data structures in JavaScript, Python, C++, and Java on ZAYA CODE HUB.',
  },
  'maximum-subarray': {
    title: 'Maximum Subarray (Kadane’s Algorithm) - DSA Practice',
    category: 'Dynamic Programming',
    desc: 'Find the contiguous subarray with the largest sum using Kadane\'s algorithm on ZAYA CODE HUB.',
  },
  'container-with-most-water': {
    title: 'Container With Most Water - Two Pointers Algorithmic Problem',
    category: 'Two Pointers',
    desc: 'Solve the Container With Most Water problem using two pointers in JavaScript, Python, C++, and Java on ZAYA CODE HUB.',
  },
  'binary-search': {
    title: 'Binary Search Algorithm - Divide and Conquer DSA',
    category: 'Binary Search',
    desc: 'Implement O(log N) Binary Search in sorted arrays across multiple languages with automated test case evaluation on ZAYA CODE HUB.',
  },
  'single-number': {
    title: 'Single Number - Bitwise XOR Manipulation DSA Problem',
    category: 'Bit Manipulation',
    desc: 'Find the element that appears once where every other element appears twice using bitwise XOR on ZAYA CODE HUB.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = 'https://zayacodehub.in';
  const meta = CODING_PROBLEMS_META[id] || {
    title: `${id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} - DSA Problem`,
    category: 'Algorithms',
    desc: `Solve ${id.replace(/-/g, ' ')} online in JavaScript, Python, C++, and Java on ZAYA CODE HUB Coding Arena.`,
  };

  return {
    title: meta.title,
    description: meta.desc,
    keywords: [
      id.replace(/-/g, ' '),
      `${id.replace(/-/g, ' ')} solution`,
      `${id.replace(/-/g, ' ')} javascript python cpp java`,
      'dsa practice online',
      'leetcode alternative',
      'ZAYA CODE HUB coding arena',
    ],
    alternates: {
      canonical: `${baseUrl}/practice/code/${id}`,
    },
    openGraph: {
      title: `${meta.title} | ZAYA CODE HUB`,
      description: meta.desc,
      url: `${baseUrl}/practice/code/${id}`,
      type: 'website',
    },
  };
}

export default function ProblemLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
