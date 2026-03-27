import { useState } from "react";

const MAX_DIMENSION = 2048;

const validateImageDimensions = (url: string): Promise<{ valid: boolean; width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ valid: img.width <= MAX_DIMENSION && img.height <= MAX_DIMENSION, width: img.width, height: img.height });
    img.onerror = () => resolve({ valid: true, width: 0, height: 0 });
    img.src = url;
  });
};

interface AssetPickerProps {
  label: string;
  options: string[];
  value: string;
  onChange: (url: string) => void;
}

export const AssetPicker = ({ label, options, value, onChange }: AssetPickerProps) => {
  const isCustom = value && !options.includes(value);
  const [customUrl, setCustomUrl] = useState(isCustom ? value : "");
  const [dimensionError, setDimensionError] = useState("");

  const hasCustomUrl = customUrl.length > 0;
  const selectedPreset = !hasCustomUrl ? value : "";

  return (
    <div className="mb-4">
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((url) => (
          <div
            key={url}
            onClick={() => {
              setCustomUrl("");
              onChange(url);
            }}
            style={{
              padding: "4px",
              border: selectedPreset === url ? "2px solid var(--color-primary, #6366f1)" : "2px solid transparent",
              borderRadius: "8px",
              width: "64px",
              height: "64px",
              cursor: "pointer",
            }}
            aria-label={`Select ${label} option`}
            aria-pressed={selectedPreset === url}
          >
            <img src={url} alt={`${label} option`} style={{ width: "100%", height: "100%", objectFit: "scale-down" }} />
          </div>
        ))}
      </div>
      <div className="mt-2">
        <input
          className={`input${dimensionError ? " input-error" : ""}`}
          type="url"
          placeholder="Or enter a custom image URL"
          value={customUrl}
          onChange={(e) => {
            const url = e.target.value;
            setCustomUrl(url);
            setDimensionError("");
            if (url) {
              validateImageDimensions(url).then(({ valid, width, height }) => {
                if (!valid) {
                  setDimensionError(`Image is ${width}x${height}px. Maximum allowed is ${MAX_DIMENSION}x${MAX_DIMENSION}px.`);
                } else {
                  onChange(url);
                }
              });
            }
          }}
          aria-label={`Custom URL for ${label}`}
        />
        {dimensionError && <p className="p3 text-error">{dimensionError}</p>}
      </div>
    </div>
  );
};

export default AssetPicker;
