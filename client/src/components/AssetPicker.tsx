import { useState } from "react";

interface AssetPickerProps {
  label: string;
  options: string[];
  value: string;
  onChange: (url: string) => void;
}

export const AssetPicker = ({ label, options, value, onChange }: AssetPickerProps) => {
  const isCustom = value && !options.includes(value);
  const [customUrl, setCustomUrl] = useState(isCustom ? value : "");

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
          className="input"
          type="url"
          placeholder="Or enter a custom image URL"
          value={customUrl}
          onChange={(e) => {
            setCustomUrl(e.target.value);
            if (e.target.value) onChange(e.target.value);
          }}
          aria-label={`Custom URL for ${label}`}
        />
      </div>
    </div>
  );
};

export default AssetPicker;
