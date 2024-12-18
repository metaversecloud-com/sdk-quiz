import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Route, Routes, useSearchParams } from "react-router-dom";

// pages
import { Error, Leaderboard, Question, Start } from "@pages/index.js";

// context
import { GlobalDispatchContext } from "./context/GlobalContext";
import { InteractiveParams, SET_HAS_SETUP_BACKEND, SET_INTERACTIVE_PARAMS } from "./context/types";

// utils
import { setupBackendAPI } from "./utils/backendAPI";

const App = () => {
  const [searchParams] = useSearchParams();
  const [hasInitBackendAPI, setHasInitBackendAPI] = useState(false);

  const dispatch = useContext(GlobalDispatchContext);

  const interactiveParams: InteractiveParams = useMemo(() => {
    return {
      assetId: searchParams.get("assetId") || "",
      displayName: searchParams.get("displayName") || "",
      identityId: searchParams.get("identityId") || "",
      interactiveNonce: searchParams.get("interactiveNonce") || "",
      interactivePublicKey: searchParams.get("interactivePublicKey") || "",
      profileId: searchParams.get("profileId") || "",
      sceneDropId: searchParams.get("sceneDropId") || "",
      uniqueName: searchParams.get("uniqueName") || "",
      urlSlug: searchParams.get("urlSlug") || "",
      username: searchParams.get("username") || "",
      visitorId: searchParams.get("visitorId") || "",
    };
  }, [searchParams]);

  const setInteractiveParams = useCallback(
    ({
      assetId,
      displayName,
      identityId,
      interactiveNonce,
      interactivePublicKey,
      profileId,
      sceneDropId,
      uniqueName,
      urlSlug,
      username,
      visitorId,
    }: InteractiveParams) => {
      dispatch!({
        type: SET_INTERACTIVE_PARAMS,
        payload: {
          interactiveParams: {
            assetId,
            displayName,
            identityId,
            interactiveNonce,
            interactivePublicKey,
            profileId,
            sceneDropId,
            uniqueName,
            urlSlug,
            username,
            visitorId,
          },
        },
      });
    },
    [dispatch],
  );

  const setHasSetupBackend = useCallback(
    (success: boolean) => {
      dispatch!({
        type: SET_HAS_SETUP_BACKEND,
        payload: { hasSetupBackend: success },
      });
    },
    [dispatch],
  );

  const setupBackend = () => {
    setupBackendAPI(interactiveParams)
      .then(() => setHasSetupBackend(true))
      .catch((error) => console.error(error))
      .finally(() => setHasInitBackendAPI(true));
  };

  useEffect(() => {
    if (interactiveParams.assetId) {
      setInteractiveParams({
        ...interactiveParams,
      });
    }
  }, [interactiveParams, setInteractiveParams]);

  useEffect(() => {
    if (!hasInitBackendAPI) setupBackend();
  }, [hasInitBackendAPI, interactiveParams]);

  return (
    <Routes>
      <Route path="/" element={<Leaderboard />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/start" element={<Start />} />
      <Route path="/question" element={<Question />} />
      <Route path="*" element={<Error />} />
    </Routes>
  );
};

export default App;
