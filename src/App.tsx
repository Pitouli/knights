import { useAppStore } from './store';
import SetupScreen from './components/SetupScreen/SetupScreen';
import VisualizationScreen from './components/VisualizationScreen/VisualizationScreen';

export default function App() {
  const screen = useAppStore((s) => s.screen);
  return screen === 'setup' ? <SetupScreen /> : <VisualizationScreen />;
}
