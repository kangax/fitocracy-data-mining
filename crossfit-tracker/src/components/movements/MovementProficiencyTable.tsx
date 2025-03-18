'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMovementProficiency } from '@/hooks/useWorkoutData';
import type { MovementProficiency } from '@/lib/calculations';

const MovementProficiencyTable: React.FC = () => {
  const { proficiencyData, isLoading, isError } = useMovementProficiency();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof MovementProficiency>('proficiencyScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Handle sorting
  const handleSort = (column: keyof MovementProficiency) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  // Filter and sort data
  const filteredAndSortedData = [...(proficiencyData || [])]
    .filter((movement) => 
      movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movement.category && movement.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (movement.equipment && movement.equipment.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  
  if (isError) {
    return <div className="text-red-500">Error loading movement proficiency data</div>;
  }
  
  return (
    <div className="bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Movement Proficiency</h2>
        <p className="text-gray-400 text-sm mt-1">
          Track your skill development across different movements
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search movements..."
            className="w-full p-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Movement
                {sortBy === 'name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('frequency')}
              >
                Frequency
                {sortBy === 'frequency' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
                <div className="text-xxs text-gray-400 font-normal normal-case">
                  <span className="cursor-pointer hover:text-gray-300" onClick={(e) => { e.stopPropagation(); handleSort('sessionCount'); }}>
                    Sessions
                    {sortBy === 'sessionCount' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                  {' • '}
                  <span className="cursor-pointer hover:text-gray-300" onClick={(e) => { e.stopPropagation(); handleSort('frequency'); }}>
                    Sets
                    {sortBy === 'frequency' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('lastPerformed')}
              >
                Last Performed
                {sortBy === 'lastPerformed' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('proficiencyScore')}
              >
                Proficiency
                {sortBy === 'proficiencyScore' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-1/4"></div>
                  </td>
                </tr>
              ))
            ) : (
              filteredAndSortedData.map((movement) => (
                <tr key={movement.exerciseId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      href={`/movements/${movement.exerciseId}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {movement.name}
                    </Link>
                    <div className="text-xs text-gray-400">
                      {movement.category && `${movement.category}`}
                      {movement.equipment && ` • ${movement.equipment}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {movement.frequency} sets
                    <div className="text-xs text-gray-400">
                      {movement.sessionCount} sessions • {movement.totalReps} total reps
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {new Date(movement.lastPerformed).toLocaleDateString()}
                    <div className="text-xs text-gray-400">
                      {movement.daysAgo} days ago
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-600 rounded-full h-2.5">
                        <div 
                          className="bg-blue-400 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(100, movement.proficiencyScore)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-300">
                        {movement.proficiencyScore.toFixed(1)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovementProficiencyTable;
