"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

interface PokemonDetails {
  name: string;
  id: number;
  weight: number;
  height: number;
  abilities: { ability: { name: string } }[];
  sprites: {
    front_default: string;
    front_shiny: string;
  };
}

async function getPokemonDetails(name: string): Promise<PokemonDetails | null> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch Pokémon details:", error);
    return null;
  }
}

export default function PokemonDetailsPage({
  params,
}: {
  params: { name: string };
}) {
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchPokemon = async () => {
      const pokemonData = await getPokemonDetails(params.name);
      if (pokemonData) {
        setPokemon(pokemonData);
      } else {
        router.push("/not-found");
      }
      setLoading(false);
    };

    fetchPokemon();
  }, [params.name, router]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery) return;

    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase()}`
      );

      if (res.ok) {
        router.push(`/details/${searchQuery.toLowerCase()}`);
      } else {
        router.push("/not-found");
      }
    } catch (error) {
      router.push("/not-found");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (!pokemon) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mb-8">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Pokémon"
            className="w-full p-2 border text-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </form>
      </div>

      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-5xl font-extrabold text-center capitalize mb-8 text-gray-900">
          {pokemon.name}{" "}
          <span className="text-2xl text-gray-500">(ID: {pokemon.id})</span>
        </h1>

        <div className="flex justify-center gap-16 mb-8">
          <div className="text-center transition-transform transform hover:scale-105">
            <img
              src={pokemon.sprites.front_default}
              alt={pokemon.name}
              className="w-48 h-48 object-contain"
            />
            <p className="text-gray-600 mt-2 text-lg">Front</p>
          </div>

          <div className="text-center transition-transform transform hover:scale-105">
            <img
              src={pokemon.sprites.front_shiny}
              alt={`${pokemon.name} shiny`}
              className="w-48 h-48 object-contain"
            />
            <p className="text-gray-600 mt-2 text-lg">Shiny</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-2xl font-semibold text-gray-800">
            Height: <span className="text-blue-600">{pokemon.height}</span>
          </p>
          <p className="text-2xl font-semibold text-gray-800">
            Weight: <span className="text-blue-600">{pokemon.weight}</span>
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Abilities
          </h3>
          <ul className="list-disc list-inside text-gray-700 text-lg text-center space-y-2">
            {pokemon.abilities.map((abilityObj) => (
              <li key={abilityObj.ability.name} className="capitalize">
                {abilityObj.ability.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-full max-w-4xl mb-4  flex justify-center items-center p-8 ">
        <button
          onClick={() => router.push("/")}
          className="mb-6 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
