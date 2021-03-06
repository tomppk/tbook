import './styles/code-cell.css';
import { useEffect } from 'react';
import CodeEditor from './code-editor';
import Preview from './preview';
import Resizable from './resizable';
import { Cell } from '../redux';
// Import helper hook to dispatch actions directly inside CodeCell component
import { useActions } from '../hooks/use-actions';
// Import typed helper hook to allow CodeCell component to directly
// pull state data from inside our redux store
import { useTypedSelector } from '../hooks/use-typed-selector';
// Helper hook to allow referencing code from previous cells and show() method
// show content inside preview window
import { useCumulativeCode } from '../hooks/use-cumulative-code';

// Interface to define properties which the props that the parent component
// passes down into CodeCell component must satisfy
interface CodeCellProps {
  cell: Cell;
}

// Component to display one code editor and one preview window
// Destructure received props.cell
const CodeCell: React.FC<CodeCellProps> = ({ cell }) => {
  // Extract updateCell and createBundle action creators from useActions()
  // updateCell(id, content) takes in id of cell and content to update.
  // Dispatches action to update redux store state.
  const { updateCell, createBundle } = useActions();

  // Reach into redux store and find the bundled state of cell with
  // specified 'id'
  const bundle = useTypedSelector((state) => state.bundles[cell.id]);

  const cumulativeCode = useCumulativeCode(cell.id);

  // cell.content is the code that user writes into editor
  // Run useEffect whenever input changes ie. cell.content piece of state from
  // redux store
  // Use debouncing to limit the frequency of preview display refresh and code
  // bundling to 1s
  // Pass in the code that user has inputted inside editor to createBundle()
  // action creator.
  // createBundle() action creator calls bundler to bundle input code
  // and updates redux store state
  // bundler initializes ESbuild takes in input, bundles it and returns object
  // with bundled code and possible error.
  useEffect(() => {
    // If there is no bundle, then do not wait 750ms but bundle code instantly
    // This runs bundle immediately at app initialization
    // After following re-renderings add 750ms delay

    if (!bundle) {
      createBundle(cell.id, cumulativeCode);
      return;
    }

    const timer = setTimeout(async () => {
      createBundle(cell.id, cumulativeCode);
    }, 750);

    return () => {
      clearTimeout(timer);
    };
    // Disable eslint so it does not give error of missing dependency of 'bundle'
    // below inside depencies list. If we would add 'bundle' it would cause
    // useEffect() to enter into infinite loop

    // Disable eslint for next line below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cumulativeCode, cell.content, createBundle]);

  // Pass down code state to Preview component
  // Wrap content with Resizable components to enable editor and preview resizing
  // updateCell() updates the redux store state
  // Set height to be 100% of parent less 10px for the resizer handle bar. This
  // way the resizer handle bar fits into parent as well and does not get pushed
  // out
  // If there is no bundle or bundle.loading then display <progress> bar HTML
  // element with classNames from Bulma to add it styling.
  // Add custom CSS to class "progress-cover" to show and position progress bar
  // correctly
  // Otherwise display <Preview> component
  return (
    <Resizable direction="vertical">
      <div
        style={{
          height: 'calc(100% - 10px)',
          display: 'flex',
          flexDirection: 'row',
        }}>
        <Resizable direction="horizontal">
          <CodeEditor
            initialValue={cell.content}
            onChange={(value) => updateCell(cell.id, value)}
          />
        </Resizable>
        <div className="progress-wrapper">
          {!bundle || bundle.loading ? (
            <div className="progress-cover">
              <progress className="progress is-small is-primary" max="100">
                Loading
              </progress>
            </div>
          ) : (
            <Preview code={bundle.code} err={bundle.err} />
          )}
        </div>
      </div>
    </Resizable>
  );
};

export default CodeCell;
