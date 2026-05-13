import { useState } from 'react';
import { useAppStore } from './store';
import SetupScreen from './components/SetupScreen/SetupScreen';
import VisualizationScreen from './components/VisualizationScreen/VisualizationScreen';

export default function App() {
  const screen = useAppStore((s) => s.screen);
  const [isIntroOpen, setIsIntroOpen] = useState(true);

  return (
    <>
      {screen === 'setup' ? <SetupScreen /> : <VisualizationScreen />}

      {isIntroOpen && (
        <div
          className="intro-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-modal-title"
        >
          <div className="intro-modal">
            <h2 id="intro-modal-title">Welcome to Knights: Spiral Placement</h2>
            <p>
              Select your chess pieces. The app will then place them one by one on an
              infinite board. The engine follows a spiral path from the center, and each piece is
              dropped on the first square where it can fit without being captured by any piece of
              another color.
            </p>
            <p>
              The concept is explained in the youtube video{' '}
              <a href="https://www.youtube.com/watch?v=UiX4CFIiegM">
                Red & Black Knights (extraordinary result)
              </a>{' '}
              by Numberphile.
            </p>
            <div className="intro-modal-videos">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/UiX4CFIiegM?si=WuWrCFShN-wFA7__"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/VgmDuBCayPw?si=ejjA7Pi6vb7manRf"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>

            <button
              type="button"
              className="intro-modal-close"
              onClick={() => setIsIntroOpen(false)}
            >
              Start exploring
            </button>
          </div>
        </div>
      )}
    </>
  );
}
