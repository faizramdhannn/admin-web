export default function Home() {
  return (
    <main className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-primary-500">
          WEBSTORE - Invoice Management
        </h1>
        <p className="mt-4 text-light-muted dark:text-dark-muted">
          System is ready! 🚀
        </p>
        
        {/* Test Dark Mode Button */}
        <button className="mt-4 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600">
          Click Me
        </button>
      </div>
    </main>
  );
}