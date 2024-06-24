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
  setStartTimestamp,
  setEndTimestamp,
  setStartDroppedAsset,
  setQuestionDroppedAsset,
  setAllQuestions,
  setQuestionAsset,
  setGameResetFlag,
  setInPrivateZone,
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

    const response = await axios.get(`api/visitor?${queryParams}`);

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
    const url = `api/dropped-asset?${queryParams}`;

    const response = await axios.get(url);
    if (response.status === 200) {
      const droppedAsset = response?.data?.droppedAsset;
      const visitor = response?.data?.visitor;
      const startTimestamp =
        response?.data?.droppedAsset?.dataObject?.quiz[visitor?.profileId]
          ?.startTimestamp;
      const endTimestamp =
        response?.data?.droppedAsset?.dataObject?.quiz[visitor?.profileId]
          ?.endTimestamp;

      dispatch(setDroppedAsset(droppedAsset));
      dispatch(setVisitor(visitor));
      dispatch(setStartTimestamp(startTimestamp));
      dispatch(setEndTimestamp(endTimestamp));
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const getStartDroppedAsset = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `api/start-dropped-asset?${queryParams}`;

    const response = await axios.get(url);
    if (response.status === 200) {
      const droppedAsset = response?.data?.droppedAsset;
      const visitor = response?.data?.visitor;
      const startTimestamp =
        response?.data?.droppedAsset?.dataObject?.quiz[visitor?.profileId]
          ?.startTimestamp;
      const endTimestamp =
        response?.data?.droppedAsset?.dataObject?.quiz[visitor?.profileId]
          ?.endTimestamp;
      const inPrivateZone = response?.data?.inPrivateZone;

      dispatch(setStartDroppedAsset(droppedAsset));
      dispatch(setVisitor(visitor));
      dispatch(setStartTimestamp(startTimestamp));
      dispatch(setEndTimestamp(endTimestamp));
      dispatch(setInPrivateZone(inPrivateZone));
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const updateStartTimestamp = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `api/start-timestamp?${queryParams}`;

    const response = await axios.put(url);
    if (response.status === 200) {
      dispatch(setStartTimestamp(response?.data?.startTimestamp));
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
      const url = `api/registerUserAnswer?${queryParams}`;

      const response = await axios.post(url, { isCorrect, selectedOption });

      const startDroppedAsset = response?.data?.startDroppedAsset;
      const questionDroppedAsset = response?.data?.questionDroppedAsset;
      const visitor = response?.data?.visitor;
      const endTimestamp =
        startDroppedAsset?.dataObject?.quiz[visitor?.profileId]?.endTimestamp;

      if (response.status === 200) {
        dispatch(setDroppedAsset(startDroppedAsset));
        dispatch(setQuestionDroppedAsset(questionDroppedAsset));
        dispatch(setEndTimestamp(endTimestamp));
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
    const url = `api/clear?${queryParams}`;

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

export const resetGame = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `api/resetGame?${queryParams}`;

    const response = await axios.post(url);
    if (response.status === 200) {
      const startDroppedAsset = response?.data?.startAsset;
      const gameResetFlag = response?.data?.gameResetFlag;
      dispatch(setStartDroppedAsset(startDroppedAsset));
      dispatch(setGameResetFlag(gameResetFlag));
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const resetTimer = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `api/resetTimer?${queryParams}`;

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

export const getLeaderboard = (originAsset) => async (dispatch) => {
  try {
    console.log("getLeaderboard originAsset ", originAsset);
    const queryParams = getQueryParams();
    let url;

    if (originAsset == "startAsset") {
      console.log("entered startAsset");
      url = `api/leaderboard-from-start-asset?${queryParams}`;
    } else if (originAsset == "questionAsset") {
      console.log("entered questionAsset");
      url = `api/leaderboard-from-question-asset?${queryParams}`;
    } else {
      url = `api/leaderboard?${queryParams}`;
    }

    const response = await axios.get(url);
    if (response.status === 200) {
      const startDroppedAsset = response?.data?.startDroppedAsset;
      const visitor = response?.data?.visitor;
      const startTimestamp =
        response?.data?.startDroppedAsset?.dataObject?.quiz[visitor?.profileId]
          ?.startTimestamp;
      const endTimestamp =
        response?.data?.startDroppedAsset?.dataObject?.quiz[visitor?.profileId]
          ?.endTimestamp;

      dispatch(setVisitor(visitor));
      dispatch(setStartDroppedAsset(startDroppedAsset));
      dispatch(setStartTimestamp(startTimestamp));
      dispatch(setEndTimestamp(endTimestamp));
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
    const url = `api/timestamp?${queryParams}`;

    const response = await axios.put(url);
    if (response.status === 200) {
      dispatch(getTimestamp(response?.data));
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const getQuestionsStatistics = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `api/questionsStatistics?${queryParams}`;

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

export const getTimestamp = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `api/timestamp?${queryParams}`;

    const response = await axios.get(url);
    if (response.status === 200) {
      dispatch(setStartTimestamp(response?.data?.startTimestamp));
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const getStartDroppedAssetFromQuestionAsset = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `api/question/start-dropped-asset?${queryParams}`;

    const response = await axios.get(url);
    if (response.status === 200) {
      const startDroppedAsset = response?.data?.startDroppedAsset;
      const questionDroppedAsset = response?.data?.questionDroppedAsset;
      const visitor = response?.data?.visitor;
      const startTimestamp =
        response?.data?.startDroppedAsset?.dataObject?.quiz[visitor?.profileId]
          ?.startTimestamp;
      const endTimestamp =
        response?.data?.startDroppedAsset?.dataObject?.quiz[visitor?.profileId]
          ?.endTimestamp;
      const inPrivateZone = response?.data?.inPrivateZone;

      dispatch(setStartDroppedAsset(startDroppedAsset));
      dispatch(setQuestionDroppedAsset(questionDroppedAsset));
      dispatch(setVisitor(visitor));
      dispatch(setStartTimestamp(startTimestamp));
      dispatch(setEndTimestamp(endTimestamp));
      dispatch(setInPrivateZone(inPrivateZone));
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const getAllQuestions = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `api/all-question-assets?${queryParams}`;

    const response = await axios.get(url);
    if (response.status === 200) {
      const allQuestions = response?.data?.allQuestions;
      const visitor = response?.data?.visitor;

      dispatch(setAllQuestions(allQuestions));
      dispatch(setVisitor(visitor));
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const editQuestion =
  (questionNumber, updatedQuestion) => async (dispatch) => {
    try {
      const queryParams = getQueryParams();
      const url = `api/question?${queryParams}`;

      const response = await axios.put(url, {
        questionNumber,
        updatedQuestion,
      });
      if (response.status === 200) {
        const allQuestionAssets = response?.data?.allQuestionAssets;
        const questionAsset = response?.data?.questionAsset;
        dispatch(setQuestionAsset(questionAsset));
        dispatch(setAllQuestions(allQuestionAssets));
      }
    } catch (error) {
      console.error("error", error);
      if (error.response && error.response.data) {
      } else {
      }
    }
  };
