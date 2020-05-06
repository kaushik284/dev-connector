import { SET_ALERT, REMOVE_ALERT } from "../actions/types";
//state for only alert
const initialState = [];

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_ALERT:
      return [...state, payload];
    case REMOVE_ALERT:
      console.log(payload);
      console.log(state.filter((alert) => alert.id !== payload.id));
      return state.filter((alert) => alert.id !== payload.id);
    default:
      return state;
  }
}
