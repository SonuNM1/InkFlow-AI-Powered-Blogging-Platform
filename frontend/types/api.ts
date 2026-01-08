

// ===== BLOG =====

export interface BlogDTO {
  id: string;
  title: string;
  description: string;
  blogcontent: string;
  image?: string;
  author: string;
  category: string;
  created_at: string;
}

// ===== AUTHOR =====

export interface AuthorDTO {
  _id: string;
  name: string;
  image?: string;
}

// ===== RESPONSES =====

export interface SingleBlogResponse {
  blog: BlogDTO;
  author: AuthorDTO;
}

// ===== COMMENT =====

export interface CommentDTO {
  id: string;
  userid: string;
  comment: string;
  username: string;
  userimage?: string;
  create_at: string;
}

// export interface EditableBlogDTO {
//   id: string;
//   title: string;
//   description: string;
//   blogcontent: string;
//   category: string;
//   image?: string;
//   author: string;
//   created_at: string;
// }
