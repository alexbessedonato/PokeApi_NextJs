export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">
        404 - Pokémon Not Found
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Sorry, we couldn't find the Pokémon you're looking for.
      </p>
      <a
        href="/"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Go back to Home
      </a>
    </div>
  );
}
