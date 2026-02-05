import { useContext } from "react";

// context
import { GlobalStateContext } from "@/context/GlobalContext";

export const Badges = () => {
  const { badges, visitorInventory } = useContext(GlobalStateContext);

  return (
    <div className="grid grid-cols-3 gap-6 pt-4">
      {badges &&
        Object.values(badges).map((badge) => {
          const { name, description, icon } = badge;
          const hasBadge = visitorInventory && Object.keys(visitorInventory).includes(name);
          const style = { width: "90px", filter: "none" };
          if (!hasBadge) style.filter = "grayscale(1)";
          return (
            <div className="tooltip" key={name}>
              <span className="tooltip-content" style={{ width: "115px" }}>
                {name} {description && `- ${description}`}
              </span>
              <img src={icon} alt={name} style={style} />
            </div>
          );
        })}
    </div>
  );
};

export default Badges;
