import './styles/cell-list.css';
import { Fragment, useEffect } from 'react';
import { useTypedSelector } from '../hooks/use-typed-selector';
import React from 'react';
import CellListItem from './cell-list-item';
import AddCell from './add-cell';
import { useActions } from '../hooks/use-actions';

const CellList: React.FC = () => {
  // Destructure from redux state cells property and more specifically order and
  // data properties of cells.
  // Map over order array and for each 'id' return the cell with that id as key
  // from data object
  const cells = useTypedSelector(({ cells: { order, data } }) =>
    order.map((id) => data[id])
  );

  // Get access to fetchCells and saveCells action creators from redux side of app
  const { fetchCells, saveCells } = useActions();

  // Retrieve a list of cells from api when component is first rendered
  useEffect(() => {
    fetchCells();
  }, []);

  // useEffect(() => {
  //   saveCells();
  // }, [JSON.stringify(cells)]);

  // Map over all the cell objects and for each cell create a CellListItem
  // component and pass that cell down as props
  // Always add key prop for list items
  // Wrap components inside React Fragment instead of <div> to prevent
  // unnecessary rendering of extra <div> to DOM
  // React Fragment can be written as empty <> or import Fragment and
  // write as <Fragment>. It can only take in props like key={} if it
  // is written as <Fragment>
  const renderedCells = cells.map((cell) => (
    <Fragment key={cell.id}>
      <CellListItem cell={cell} />
      <AddCell previousCellId={cell.id} />
    </Fragment>
  ));

  // Render AddCell to start of list and give cell 'id' of null as
  // there is no previous cell
  // If there are no cells on the screen or inside cells array
  // then forceVisible is true and we set AddCell opacity to 1 instead of faded out
  return (
    <div className="cell-list">
      <AddCell forceVisible={cells.length === 0} previousCellId={null} />
      {renderedCells}
    </div>
  );
};

export default CellList;
