import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register only the components that exist
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Add custom scales for Radar chart
ChartJS.defaults.scale.r = ChartJS.defaults.scale.r || {}; 
ChartJS.defaults.scale.r.angleLines = { display: true };
ChartJS.defaults.scale.r.suggestedMin = 0;
ChartJS.defaults.scale.r.suggestedMax = 100;

export { ChartJS }; 