import produce from 'immer';
import { ActionType } from '../action-types';
import { Action } from '../actions';
import { Cell } from '../cell';

// Interface to define exact output of this reducer
// Data is object with key cell id and value the actual Cell
interface CellsState {
  loading: boolean;
  error: string | null;
  order: string[];
  data: {
    [key: string]: Cell;
  };
}

// Define initial state that this reducer outputs to redux store on initialization
const initialState: CellsState = {
  loading: false,
  error: null,
  order: [],
  data: {},
};

// Define the actual reducer with arguments state with default value of
// initialState and action. Return value satisfies CellsState interface
// Reducers always return new state object, not modify previous state object to
// prevent accidentally referencing the old object

// Wrap our reducer with Immer produce method to create new state more easily
// Immer allows to make direct updates to state and produces new state based
// on those updates
const reducer = produce((state: CellsState = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.UPDATE_CELL:
      const { id, content } = action.payload;
      // Immer allows to directly modify state object and automatically returns
      // new state object
      // Find cell with id we want to update from previous redux state and
      // update its content property with new content from action.payload
      // Add return state. Immer returns the state automatically so this is
      // not strictly necessary but if we do not add return state, Typescript will
      // otherwise infer possible return type as undefined.
      state.data[id].content = content;
      return state;

    // Delete cell from data object with id of action.payload
    // Filter state.order array and create new array containing all other id's
    // except the one id we want to delete
    case ActionType.DELETE_CELL:
      delete state.data[action.payload];
      state.order = state.order.filter((id) => id !== action.payload);
      return state;

    // Iterate over all id's in array and return index of id we are looking for
    // If direction is 'up' then decrease 1 from index, otherwise add 1
    // Check that target index is not out of bounds
    case ActionType.MOVE_CELL:
      const { direction } = action.payload;
      const index = state.order.findIndex((id) => id === action.payload.id);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex > state.order.length - 1) {
        return state;
      }

      // Move 'id' from targetIndex to index
      state.order[index] = state.order[targetIndex];
      // Move 'id' of action.payload ie the cell id we want to move to targetIndex
      state.order[targetIndex] = action.payload.id;

      return state;

    // Create a new cell of type 'code' or 'text' before cell with given 'id'
    // If 'id' null then add new cell to end of list
    case ActionType.INSERT_CELL_BEFORE:
      const cell: Cell = {
        content: '',
        type: action.payload.type,
        id: randomId(),
      };

      // Assign new key to data property of id we just generated
      state.data[cell.id] = cell;

      // Find id of cell we want to insert new cell before
      // If not found return -1
      const foundIndex = state.order.findIndex(
        (id) => id === action.payload.id
      );

      // If found index null then we push the new cell at the end of array
      // Else add new cell before index at foundIndex
      if (foundIndex < 0) {
        state.order.push(cell.id);
      } else {
        state.order.splice(foundIndex, 0, cell.id);
      }

      return state;

    default:
      return state;
  }
});

// Generate a random number. Convert it into a string filled with numbers and
// letters. toString(36) means base 36 so it can be any number from 0-9 and
// letter from A-Z.
// Take a portion of the string we get back with substring from index 2-5
const randomId = () => {
  return Math.random().toString(36).substr(2, 5);
};

export default reducer;
