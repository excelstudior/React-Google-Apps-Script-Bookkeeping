import { createRoot } from 'react-dom/client';
import { DatabaseStudioDashboard } from "./DatabaseStudioDashboard";

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<DatabaseStudioDashboard />);