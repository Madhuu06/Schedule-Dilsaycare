import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WeeklyCalendar from './components/WeeklyCalendar';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App min-h-screen">
        <WeeklyCalendar />
      </div>
    </QueryClientProvider>
  );
}

export default App;
