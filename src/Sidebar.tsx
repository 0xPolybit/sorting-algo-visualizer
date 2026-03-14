import { algorithms } from "./algorithms";

type Props = {
  selected: number;
  onSelect: (index: number) => void;
  disabled: boolean;
};

export default function Sidebar({ selected, onSelect, disabled }: Props) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Algorithms</h2>
      <ul className="sidebar-list">
        {algorithms.map((algo, i) => (
          <li key={algo.name}>
            <button
              className={`sidebar-item${i === selected ? " active" : ""}`}
              onClick={() => onSelect(i)}
              disabled={disabled}
            >
              <span className="sidebar-item-name">{algo.name}</span>
              <span className="sidebar-item-complexity">
                Time: {algo.time} &middot; Space: {algo.space}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
