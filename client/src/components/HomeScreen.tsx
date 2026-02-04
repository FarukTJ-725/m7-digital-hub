import React from 'react';
import { HubHeader } from './HubHeader';
import { HubGrid } from './HubGrid';
import { HubFooter } from './HubFooter';

export const HomeScreen: React.FC = () => {
  return (
    <main className="home-screen">
      <HubHeader />
      <section className="hub-grid">
        <HubGrid />
      </section>
      <HubFooter />
    </main>
  );
};
