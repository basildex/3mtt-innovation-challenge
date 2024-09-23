// Import the JSON file directly from src/data
import railStations from './rail-stations.json';

// Helper function to get all items (READ)
export const getAllItems = () => {
  return new Promise((resolve) => {
    resolve(railStations); // Return JSON data
  });
};

// CREATE: Add a new station (client-side only for demo purposes)
export const createStation = (newStation) => {
  const data = [...railStations, newStation];
  localStorage.setItem('railStations', JSON.stringify(data));
  console.log('Station added successfully');
  return data;
};

// UPDATE: Update a station by name
export const updateStation = (name, updatedStation) => {
  const data = railStations.map((station) =>
    station.name === name ? { ...station, ...updatedStation } : station
  );
  localStorage.setItem('railStations', JSON.stringify(data));
  console.log('Station updated successfully');
  return data;
};

// DELETE: Remove a station by name
export const deleteStation = (name) => {
  const updatedData = railStations.filter((station) => station.name !== name);
  localStorage.setItem('railStations', JSON.stringify(updatedData));
  console.log('Station deleted successfully');
  return updatedData;
};

// Initialize data in localStorage (if not already set)
if (!localStorage.getItem('railStations')) {
  localStorage.setItem('railStations', JSON.stringify(railStations));
}
