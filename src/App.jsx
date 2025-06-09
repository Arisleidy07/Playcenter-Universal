import Header from './components/Header';
import './index.css';

function App() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-20 flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-bold text-primary">¡Bienvenido!</h1>
        <p className="text-neutral">Aquí va tu contenido principal.</p>
      </main>
    </>
  );
}

export default App;
