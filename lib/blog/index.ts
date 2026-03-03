import { posts1 } from './posts1';
import { posts2 } from './posts2';
import { posts3 } from './posts3';
import { posts4 } from './posts4';
import { posts5 } from './posts5';

export type { BlogPost } from './posts1';

export const allPosts = [...posts1, ...posts2, ...posts3, ...posts4, ...posts5].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export const categories = [...new Set(allPosts.map((p) => p.category))];
