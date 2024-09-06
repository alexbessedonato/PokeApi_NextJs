"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Pokemon {
  name: string;
  url: string;
  sprites: {
    front_default: string;
  };
}

interface PokemonType {
  name: string;
  url: string;
}

export default function HomePage() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(
    "https://pokeapi.co/api/v2/pokemon?limit=20"
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [types, setTypes] = useState<PokemonType[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const fetchPokemonTypes = async () => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/`);
      const data = await res.json();
      setTypes(data.results);
    } catch (error) {
      console.error("Failed to fetch Pokémon types:", error);
    }
  };

  const fetchPokemonsByType = async (typeUrl: string) => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch(typeUrl);
      const data = await res.json();
      const detailedPokemons = await Promise.all(
        data.pokemon.map(async ({ pokemon }: { pokemon: Pokemon }) => {
          const pokemonRes = await fetch(pokemon.url);
          const pokemonData = await pokemonRes.json();
          return {
            ...pokemon,
            sprites: pokemonData.sprites,
          };
        })
      );

      setPokemons(detailedPokemons);
    } catch (error) {
      console.error("Failed to fetch Pokémon by type:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPokemons = async () => {
    if (!nextUrl || loading) return;

    setLoading(true);

    try {
      const res = await fetch(nextUrl);
      const data = await res.json();

      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon: Pokemon) => {
          const pokemonRes = await fetch(pokemon.url);
          const pokemonData = await pokemonRes.json();
          return {
            ...pokemon,
            sprites: pokemonData.sprites,
          };
        })
      );

      setPokemons((prev) => {
        const uniquePokemons = detailedPokemons.filter(
          (newPokemon) =>
            !prev.some((prevPokemon) => prevPokemon.name === newPokemon.name)
        );
        return [...prev, ...uniquePokemons];
      });

      setNextUrl(data.next);
    } catch (error) {
      console.error("Failed to fetch Pokémon:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemons();
    fetchPokemonTypes();
  }, []);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase()}`
      );

      if (res.ok) {
        router.push(`/details/${searchQuery.toLowerCase()}`);
      } else if (res.status === 404) {
        router.push("/not-found");
      }
    } catch (error) {
      router.push("/not-found");
    }
  };

  const filteredPokemons = pokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTypeUrl = e.target.value;
    setSelectedType(selectedTypeUrl);

    if (selectedTypeUrl) {
      fetchPokemonsByType(selectedTypeUrl);
    } else {
      fetchPokemons();
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextUrl && !loading) {
          fetchPokemons();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [nextUrl, loading]);
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        List of Pokémon
      </h1>

      <div className="flex justify-center mb-6 space-x-4">
        <form onSubmit={handleSearchSubmit} className="w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Pokémon"
            className="w-full p-2 border text-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </form>

        <select
          value={selectedType}
          onChange={handleTypeChange}
          className="p-2 border text-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Filter by Type</option>
          {types.map((type) => (
            <option key={type.name} value={type.url}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPokemons.map((pokemon) => (
          <Link href={`/details/${pokemon.name}`} key={pokemon.name}>
            <li className="flex items-center bg-white shadow-md rounded-lg p-4 text-gray-800 hover:bg-blue-100 transition cursor-pointer">
              <img
                src={pokemon.sprites.front_default}
                alt={pokemon.name}
                className="w-12 h-12 mr-4"
              />
              <span className="capitalize font-semibold">{pokemon.name}</span>
            </li>
          </Link>
        ))}
      </ul>

      {loading && (
        <div className="text-gray-800 text-center mt-4">Loading...</div>
      )}

      <div ref={loadMoreRef} className="h-10"></div>
    </div>
  );
}
