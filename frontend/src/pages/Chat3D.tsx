import { useEffect } from 'react';

export const Chat3D = () => {
  useEffect(() => {
    // Redirect to the static HTML file
    window.location.href = '/chat3d.html';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#86BC25] mx-auto"></div>
        <p className="mt-4 text-gray-600">Načítání 3D hlasového chatu...</p>
      </div>
    </div>
  );
};
