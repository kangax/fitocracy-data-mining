import React from 'react';
import Layout from '@/components/layout/Layout';
import PerformanceMetrics from '@/components/dashboard/PerformanceMetrics';
import MovementProficiencyTable from '@/components/movements/MovementProficiencyTable';
import ConsistencyChart from '@/components/charts/ConsistencyChart';

export default function Home() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Track your CrossFit progress and movement proficiency
          </p>
        </div>
        
        <PerformanceMetrics />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ConsistencyChart />
          </div>
          <div>
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-bold mb-4">Recent PRs</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="text-lg font-medium">Back Squat: 315 lbs</div>
                  <div className="text-sm text-gray-500">March 12, 2025</div>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="text-lg font-medium">Deadlift: 405 lbs</div>
                  <div className="text-sm text-gray-500">March 5, 2025</div>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="text-lg font-medium">Clean & Jerk: 225 lbs</div>
                  <div className="text-sm text-gray-500">February 28, 2025</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <MovementProficiencyTable />
      </div>
    </Layout>
  );
}
