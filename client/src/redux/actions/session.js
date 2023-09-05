import { session } from "../reducers/session";
import { push } from "redux-first-history";
import axios from "axios";
axios.defaults.baseURL = "http://localhost:3000";

export const { setVisitor, setDroppedAsset, setDroppedAssets, setError } =
  session.actions;

const getQueryParams = () => {
  const queryParameters = new URLSearchParams(window.location.search);
  const visitorId = queryParameters.get("visitorId");
  const interactiveNonce = queryParameters.get("interactiveNonce");
  const assetId = queryParameters.get("assetId");
  const interactivePublicKey = queryParameters.get("interactivePublicKey");
  const urlSlug = queryParameters.get("urlSlug");

  return `visitorId=${visitorId}&interactiveNonce=${interactiveNonce}&assetId=${assetId}&interactivePublicKey=${interactivePublicKey}&urlSlug=${urlSlug}`;
};

export const getVisitor = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();

    const response = await axios.get(`backend/visitor?${queryParams}`);

    if (response.status === 200) {
      dispatch(setVisitor(response.data.visitor));
    }
  } catch (error) {
    console.error(error);
    dispatch(setError("There was an error when getting the user content."));
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const getDroppedAsset = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `backend/dropped-asset?${queryParams}`;

    const response = await axios.get(url);
    if (response.status === 200) {
      dispatch(setDroppedAsset(response?.data?.droppedAsset));
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};
