import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';

/**
 * Ana uygulama bileşeni
 * 
 * Uygulamanın kök bileşenidir
 */
function App() {
  return (
    <>
      <Toaster position="top-right" />
      <MainLayout>
        <HomePage />
      </MainLayout>
    </>
  );
}

export default App;
