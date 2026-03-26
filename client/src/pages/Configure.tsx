import { useContext, useState } from "react";

// components
import { AssetPicker, PageFooter, QuestionEditor } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";
import { AssetAppearance, QuestionType, QuizSettings } from "@/context/types";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

const ASSET_IMAGES = {
  start: [
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/start_1.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/start_2.png",
  ],
  questionMarker: [
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/questionMarker_1.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/questionMarker_2.png",
  ],
  platform: [
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/platfom_1.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/platfom_2.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/platfom_3.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/platfom_4.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/platfom_5.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/platfom_6.png",
  ],
  leaderboard: [
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/leaderboard_1.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/leaderboard_2.png",
  ],
};

const DEFAULT_QUESTION: QuestionType = {
  questionText: "",
  questionType: "multipleChoice",
  answer: "",
  options: { "1": "", "2": "" },
};

export const Configure = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { quiz } = useContext(GlobalStateContext);

  const isEditing = !!quiz?.settings;

  // Settings state
  const [appearance, setAppearance] = useState<AssetAppearance>(
    quiz?.settings?.assetAppearance || {
      startImage: ASSET_IMAGES.start[0],
      questionMarkerImage: ASSET_IMAGES.questionMarker[0],
      platformImage: ASSET_IMAGES.platform[0],
      leaderboardImage: ASSET_IMAGES.leaderboard[0],
    },
  );
  const [correctAnswerParticle, setCorrectAnswerParticle] = useState(
    quiz?.settings?.correctAnswerParticle || "brain_float",
  );
  const [completionParticle, setCompletionParticle] = useState(
    quiz?.settings?.completionParticle || "partyPopper_float",
  );
  const [allowReplay, setAllowReplay] = useState(quiz?.settings?.replayMode !== "never");
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(quiz?.settings?.showCorrectAnswer ?? true);
  const [timerEnabled, setTimerEnabled] = useState(quiz?.settings?.timerEnabled ?? true);
  const [timerDurationMinutes, setTimerDurationMinutes] = useState<number | undefined>(
    quiz?.settings?.timerDurationMinutes,
  );

  // Questions state
  const [questions, setQuestions] = useState<{ [questionId: string]: QuestionType }>(() => {
    if (quiz?.settings && quiz.questions) {
      return quiz.questions;
    }
    return { "1": { ...DEFAULT_QUESTION } };
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false);
  const [isSubmittingQuestions, setIsSubmittingQuestions] = useState(false);
  // Map of questionId -> { fieldName -> error message }
  const [validationErrors, setValidationErrors] = useState<{ [questionId: string]: { [field: string]: string } }>({});
  const [activeSection, setActiveSection] = useState<"settings" | "questions">("settings");

  const handleQuestionChange = (questionId: string, question: QuestionType) => {
    setQuestions((prev) => ({ ...prev, [questionId]: question }));
    // Clear validation errors for this question as the user edits
    if (validationErrors[questionId]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    }
  };

  // Renumber questions so keys are always sequential: "1", "2", "3", ...
  const renumberQuestions = (qs: { [id: string]: QuestionType }): { [id: string]: QuestionType } => {
    const renumbered: { [id: string]: QuestionType } = {};
    Object.keys(qs)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((key, index) => {
        renumbered[(index + 1).toString()] = qs[key];
      });
    return renumbered;
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => {
      const nextId = (Object.keys(prev).length + 1).toString();
      return { ...prev, [nextId]: { ...DEFAULT_QUESTION } };
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (Object.keys(questions).length <= 1 || isDeleting) return;

    if (isEditing && quiz?.droppedAssets?.[questionId]) {
      setIsDeleting(true);
      backendAPI
        .delete(`/admin/delete-question/${questionId}`)
        .then((response) => {
          setGameState(dispatch, response.data);
          setQuestions(response.data.quiz.questions);
        })
        .catch((error) => setErrorMessage(dispatch, error))
        .finally(() => setIsDeleting(false));
    } else {
      setQuestions((prev) => {
        const updated = { ...prev };
        delete updated[questionId];
        return renumberQuestions(updated);
      });
    }
  };

  const validateQuestions = (): boolean => {
    const errors: { [questionId: string]: { [field: string]: string } } = {};
    for (const [qId, q] of Object.entries(questions)) {
      const qErrors: { [field: string]: string } = {};
      if (!q.questionText.trim()) qErrors.questionText = "Question text is required.";
      const filledOptions = Object.values(q.options).filter((v) => v.trim());
      if (filledOptions.length < 2) qErrors.options = "At least 2 options must be filled in.";
      for (const [optId, optVal] of Object.entries(q.options)) {
        if (!optVal.trim()) qErrors[`option-${optId}`] = "Option cannot be empty.";
      }
      if (q.questionType === "allThatApply") {
        if (!q.correctOptions || q.correctOptions.length === 0) {
          qErrors.correctAnswer = "Select at least one correct answer.";
        }
      } else {
        if (!q.answer) qErrors.correctAnswer = "Select the correct answer.";
      }
      if (Object.keys(qErrors).length > 0) errors[qId] = qErrors;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildSettings = (): Partial<QuizSettings> => ({
    assetAppearance: appearance,
    correctAnswerParticle,
    completionParticle,
    replayMode: allowReplay ? "manual" : "never",
    showCorrectAnswer,
    timerEnabled,
    timerDurationMinutes: timerEnabled ? timerDurationMinutes : undefined,
  });

  const handleSaveSettings = () => {
    setIsSubmittingSettings(true);

    backendAPI
      .put("/admin/update-settings", { settings: buildSettings() })
      .then((response) => setGameState(dispatch, response.data))
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => setIsSubmittingSettings(false));
  };

  const handleSaveQuestions = () => {
    if (!validateQuestions()) return;

    setIsSubmittingQuestions(true);

    backendAPI
      .put("/admin/save-questions", { questions, assetAppearance: appearance })
      .then((response) => setGameState(dispatch, response.data))
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => setIsSubmittingQuestions(false));
  };

  return (
    <div className="grid gap-4">
      <div className="tab-container">
        <button
          className={activeSection === "settings" ? "btn" : "btn btn-text"}
          onClick={() => setActiveSection("settings")}
          aria-label="Settings section"
        >
          Settings
        </button>
        <button
          className={activeSection === "questions" ? "btn" : "btn btn-text"}
          onClick={() => setActiveSection("questions")}
          aria-label="Questions section"
        >
          Questions ({Object.keys(questions).length})
        </button>
      </div>

      {activeSection === "settings" ? (
        <div className="grid gap-2">
          <label className="label">
            <input
              className="input-checkbox mr-2"
              type="checkbox"
              checked={allowReplay}
              onChange={(e) => setAllowReplay(e.target.checked)}
            />
            Allow replay
          </label>
          <span className="p3 text-muted">
            {allowReplay
              ? "Players can retake the quiz after finishing to improve their score or time."
              : "Players can only take the quiz once."}
          </span>

          <label className="label">
            <input
              className="input-checkbox mr-2"
              type="checkbox"
              checked={showCorrectAnswer}
              onChange={(e) => setShowCorrectAnswer(e.target.checked)}
            />
            Show correct answer
          </label>
          <p className="p3 text-muted ml-6">
            {showCorrectAnswer
              ? "Players see the correct answer immediately after answering wrong."
              : "Correct answers are hidden. Players only see if their answer was recorded."}
          </p>

          <label className="label">
            <input
              className="input-checkbox mr-2"
              type="checkbox"
              checked={timerEnabled}
              onChange={(e) => setTimerEnabled(e.target.checked)}
            />
            Enable timer
          </label>
          {timerEnabled && (
            <>
              <label className="label">Time limit (minutes, optional)</label>
              <input
                className="input"
                type="number"
                min="1"
                value={timerDurationMinutes || ""}
                onChange={(e) => setTimerDurationMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="No limit"
                aria-label="Timer duration in minutes"
              />
            </>
          )}

          <h3 className="h3 my-4 pt-3 border-t border-grey-500">Asset Appearance</h3>

          <AssetPicker
            label="Start Asset"
            options={ASSET_IMAGES.start}
            value={appearance.startImage}
            onChange={(url) => setAppearance((prev) => ({ ...prev, startImage: url }))}
          />
          <AssetPicker
            label="Question Marker"
            options={ASSET_IMAGES.questionMarker}
            value={appearance.questionMarkerImage}
            onChange={(url) => setAppearance((prev) => ({ ...prev, questionMarkerImage: url }))}
          />
          <AssetPicker
            label="Question Platform"
            options={ASSET_IMAGES.platform}
            value={appearance.platformImage}
            onChange={(url) => setAppearance((prev) => ({ ...prev, platformImage: url }))}
          />
          <AssetPicker
            label="Leaderboard Asset"
            options={ASSET_IMAGES.leaderboard}
            value={appearance.leaderboardImage}
            onChange={(url) => setAppearance((prev) => ({ ...prev, leaderboardImage: url }))}
          />

          <h3 className="h3 mb-4 pt-3 border-t border-grey-500">Particle Effects</h3>
          <label className="label">Correct Answer Particle</label>
          <input
            className="input mb-4"
            type="text"
            value={correctAnswerParticle}
            onChange={(e) => setCorrectAnswerParticle(e.target.value)}
            placeholder="brain_float"
            aria-label="Correct answer particle effect name"
          />
          <label className="label">Completion Particle</label>
          <input
            className="input mb-4"
            type="text"
            value={completionParticle}
            onChange={(e) => setCompletionParticle(e.target.value)}
            placeholder="partyPopper_float"
            aria-label="Completion particle effect name"
          />
        </div>
      ) : (
        <div>
          {Object.entries(questions).map(([questionId, question]) => (
            <QuestionEditor
              key={questionId}
              questionId={questionId}
              question={question}
              onChange={handleQuestionChange}
              onDelete={handleDeleteQuestion}
              canDelete={Object.keys(questions).length > 1}
              isDeleting={isDeleting}
              errors={validationErrors[questionId]}
            />
          ))}

          <button className="btn btn-outline mt-4" onClick={handleAddQuestion} aria-label="Add new question">
            + Add Question
          </button>
        </div>
      )}

      <PageFooter>
        {activeSection === "settings" ? (
          <button className="btn" onClick={handleSaveSettings} disabled={isSubmittingSettings}>
            {isSubmittingSettings ? "Saving..." : "Save Settings"}
          </button>
        ) : (
          <button className="btn" onClick={handleSaveQuestions} disabled={isSubmittingQuestions}>
            {isSubmittingQuestions ? "Saving..." : "Save Questions"}
          </button>
        )}
      </PageFooter>
    </div>
  );
};

export default Configure;
