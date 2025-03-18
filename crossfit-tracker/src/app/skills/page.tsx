import React from 'react';
import Layout from '@/components/layout/Layout';
import MovementProficiencyTable from '@/components/movements/MovementProficiencyTable';

export default function SkillsPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Movement Skills</h1>
          <p className="text-gray-600">
            Track your proficiency across different CrossFit movements
          </p>
        </div>
        
        <MovementProficiencyTable />
      </div>
    </Layout>
  );
}
