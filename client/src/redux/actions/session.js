import { session } from "../reducers/session";
import { push } from "redux-first-history";
import axios from "axios";

if (process.env.LOCALHOST) {
  axios.defaults.baseURL = "http://localhost:3000";
}

export const {
  setVisitor,
  setDroppedAsset,
  setDroppedAssets,
  setLeaderboard,
  setQuestionsAnswered,
  setError,
} = session.actions;

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

export const registerUserAnswer =
  (isCorrect, selectedOption) => async (dispatch) => {
    try {
      const queryParams = getQueryParams();
      const url = `backend/registerUserAnswer?${queryParams}`;

      const response = await axios.post(url, { isCorrect, selectedOption });
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

export const clear = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `backend/clear?${queryParams}`;

    const response = await axios.post(url);
    if (response.status === 200) {
      dispatch(getDroppedAsset());
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const getLeaderboard = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `backend/leaderboard?${queryParams}`;

    const response = await axios.get(url);
    if (response.status === 200) {
      dispatch(setLeaderboard(response?.data?.leaderboard));
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const startClock = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `backend/timestamp?${queryParams}`;

    const response = await axios.put(url);
    if (response.status === 200) {
      dispatch(getVisitor());
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const getQuestionsAnsweredFromStart = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `backend/questionsAnsweredFromStart?${queryParams}`;

    const response = await axios.get(url);
    if (response.status === 200) {
      dispatch(setQuestionsAnswered(response?.data));
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};
