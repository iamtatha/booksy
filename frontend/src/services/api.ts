import axios, { AxiosError } from 'axios';
import { Book, Review } from '../types/book';
import { User } from '../types/user';

// Re-export User type for convenience
export type { User } from '../types/user';

// API URL based on environment
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://booksy-fkc6.onrender.com/api'  // Use Render backend URL for production
  : 'https://booksy-fkc6.onrender.com/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
  name: string | '';
  userType: 'Author' | 'Seller' | 'Reader';
}

export interface ApiError {
  message: string;
  status: number;
}

export interface FollowedUserBookActivity {
  book: Book;
  reviewCount: number;
  readCount: number;
  recentActivity: Array<{
    type: 'review' | 'read';
    user: {
      _id: string;
      username: string;
      profileImage?: string;
    };
    rating?: number;
    date: string;
  }>;
}

// Error handling helper
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || 'An error occurred');
  }
  throw new Error('An unexpected error occurred');
};

// Add auth token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.log('Axios interceptor - URL:', config.url);
  console.log('Axios interceptor - Token exists:', !!token);
  console.log('Axios interceptor - User ID exists:', !!user._id);
  
  // Only add auth header if both token and valid user exist
  if (token && user._id) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Axios interceptor - Added auth header');
  } else {
    console.log('Axios interceptor - No auth header added');
  }
  return config;
});

// Book API
export const bookApi = {
  getBooks: async () => {
    try {
      const response = await axios.get<Book[]>(`${API_URL}/books`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  searchBooks: async (queryParams: string) => {
    try {
      const response = await axios.get<Book[]>(`${API_URL}/books/search?${queryParams}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getBookById: async (id: string) => {
    try {
      const response = await axios.get<Book>(`${API_URL}/books/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  createBook: async (book: Omit<Book, '_id'>) => {
    try {
      const response = await axios.post<Book>(`${API_URL}/books`, book);
      console.log("From API createBook", response.data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getSimilarBooks: async (id: string) => {
    try {
      const response = await axios.get<Book[]>(`${API_URL}/books/${id}/similar`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getRecommendations: async () => {
    try {
      const response = await axios.get<Book[]>(`${API_URL}/books/recommendations`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getWishlist: async () => {
    try {
      const response = await axios.get<Book[]>(`${API_URL}/users/wishlist`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getUserBooks: async () => {
    try {
      const response = await axios.get<Book[]>(`${API_URL}/users/my-books`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Review API
export const reviewApi = {
  getBookReviews: async (bookId: string) => {
    console.log("From API getreview");
    try {
      const response = await axios.get<Review[]>(`${API_URL}/reviews/book/${bookId}`);
      console.log(response);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getRecentReviews: async () => {
    try {
      const response = await axios.get<Review[]>(`${API_URL}/reviews/recent`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  createReview: async (bookId: string, review: { rating: number; content: string }) => {
    console.log("From API");
    console.log(bookId);
    console.log(review);
    try {
      const response = await axios.post<Review>(`${API_URL}/reviews/book/${bookId}`, { 
        rating: review.rating,
        comment: review.content
      });
      console.log(response);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  updateReview: async (reviewId: string, data: { rating?: number; content?: string }) => {
    try {
      const response = await axios.put<Review>(`${API_URL}/reviews/${reviewId}`, {
        rating: data.rating,
        comment: data.content
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  deleteReview: async (reviewId: string) => {
    try {
      await axios.delete(`${API_URL}/reviews/${reviewId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getPopularBooksThisWeek: async () => {
    try {
      const response = await axios.get<{ book: Book; reviewCount: number }[]>(`${API_URL}/reviews/popular-week`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// User API
export const userApi = {
  getProfile: async (id: string) => {
    try {
      const response = await axios.get<User>(`${API_URL}/users/profile/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw handleApiError(error);
    }
  },
  getUserReviews: async (id: string) => {
    try {
      // console.log(id);
      const response = await axios.get<Review[]>(`${API_URL}/users/reviews/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getListedBooks: async (userId?: string) => {
    try {
      const endpoint = userId ? `/users/listed-books/${userId}` : '/users/listed-books';
      const response = await axios.get<Book[]>(`${API_URL}${endpoint}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getCreatedBooks: async (userId?: string) => {
    try {
      const endpoint = userId ? `/users/created-books/${userId}` : '/users/created-books';
      const response = await axios.get<Book[]>(`${API_URL}${endpoint}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getBookDetails: async (id: string) => {
    try {
      const response = await axios.get<Book>(`${API_URL}/books/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  updateProfile: async (data: { username?: string; email?: string; profileImage?: string; bio?: string }) => {
    try {
      const response = await axios.put<User>(`${API_URL}/users/profile/update`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    try {
      await axios.put(`${API_URL}/users/password`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },
  login: async (credentials: LoginCredentials) => {
    console.log(credentials);
    try {
      const response = await axios.post<{ token: string; user: User }>(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  register: async (data: RegisterCredentials) => {
    // console.log(data);
    try {
      const response = await axios.post<{ token: string; user: User }>(`${API_URL}/auth/register`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  getFollowerCount: async (id: string) => {
    try {
      const response = await axios.get<{ count: number }>(`${API_URL}/users/follower-count/${id}`);
      return response.data.count;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getFollowingCount: async (id: string) => {
    try {
      const response = await axios.get<{ count: number }>(`${API_URL}/users/following-count/${id}`);
      return response.data.count;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getReadBooksCount: async (id: string) => {
    try {
      const response = await axios.get<Book[]>(`${API_URL}/users/recently-read/${id}`);
      return response.data.length;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      const data = await response.json();
      console.log('Upload response:', data);
      
      if (!data.imageUrl) {
        throw new Error('No image URL returned from server');
      }

      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
  getProfileImage: async (userId: string): Promise<string | null> => {
    try {
      const response = await axios.get<{ profileImage: string | null }>(`${API_URL}/users/profile-image/${userId}`);
      return response.data.profileImage;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw handleApiError(error);
    }
  },
  getWishlist: async (): Promise<Book[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/wishlist`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch wishlist');
    }
    return response.json();
  },
  getRecentlyRead: async (userId?: string): Promise<Book[]> => {
    const token = localStorage.getItem('token');
    const endpoint = userId ? `/users/recently-read/${userId}` : '/users/recently-read';
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch recently read books');
    }
    return response.json();
  },
  toggleWishlist: async (bookId: string) => {
    try {
      const response = await axios.put(`${API_URL}/users/addtowishlist/${bookId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  toggleRecentlyRead: async (bookId: string) => {
    try {
      const response = await axios.put(`${API_URL}/users/addto-recently-read/${bookId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getBio: async (id: string) => {
    try {
      const response = await axios.get<{ bio: string }>(`${API_URL}/users/bio/${id}`);
      return response.data.bio;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  searchUsers: async (query: string) => {
    try {
      console.log("From API searchUsers", query);
      const response = await axios.get<User[]>(`${API_URL}/users/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  toggleFollow: async (userId: string) => {
    try {
      const response = await axios.put<{ isFollowing: boolean; followerCount: number; followingCount: number }>(
        `${API_URL}/users/follow/${userId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getFollowedUsersBooks: async () => {
    try {
      const response = await axios.get<FollowedUserBookActivity[]>(`${API_URL}/users/followed-users-books`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  checkUserExists: async (username: string): Promise<boolean> => {
    try {
      const response = await axios.get<{ exists: boolean }>(`${API_URL}/users/check/${username}`);
      return response.data.exists;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw handleApiError(error);
    }
  },
};

export const fetchBookById = async (id: string): Promise<Book> => {
  const response = await fetch(`${API_URL}/books/${id}`);
  console.log(response);
  if (!response.ok) {
    throw new Error('Failed to fetch book');
  }
  return response.json();
}; 

export const fetchBookReviews = async (id: string): Promise<Book> => {
  const response = await fetch(`${API_URL}/reviews/books/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Review');
  }
  return response.json();
}; 

export const fetchUserReviews = async (id: string): Promise<Review[]> => {
  const response = await fetch(`${API_URL}/users/${id}/reviews`);
  if (!response.ok) {
    throw new Error('Failed to fetch Review');
  }
  return response.json();
}; 