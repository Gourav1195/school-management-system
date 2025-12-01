// import { useState, useCallback } from 'react';
// import { Group } from '@/types/all';

// export const useFavoriteGroups = () => {
//   const [favorites, setFavorites] = useState<Group[]>([]);
//   const [loading, setLoading] = useState(true);

  
//     useEffect(() => {
//         async function fetchFavorites() {
//           const res = await apiClient('/api/user/favorites');
//           const data = await res.json();
//           setFavGroups(data.favorites  || []);
//         }
//         fetchFavorites();
//       }, []);

//   // 🔁 fetch once on mount
//   useState(() => {
//     fetchFavorites();
//   });

//   return { favorites, loading, refreshFavorites: fetchFavorites };
// };
