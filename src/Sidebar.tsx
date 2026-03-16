import { algorithms } from "./algorithms";
import { playSelect } from "./audio";
import { TbCircles } from "react-icons/tb";
import { LuMousePointerClick, LuArrowDownToLine, LuZap, LuHash } from "react-icons/lu";
import { TbArrowsSplit2, TbBinaryTree } from "react-icons/tb";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import type { IconType } from "react-icons";

const algoIcons: Record<string, IconType> = {
  "Bubble Sort": TbCircles,
  "Selection Sort": LuMousePointerClick,
  "Insertion Sort": LuArrowDownToLine,
  "Merge Sort": TbArrowsSplit2,
  "Quick Sort": LuZap,
  "Heap Sort": TbBinaryTree,
  "Counting Sort": LuHash,
};

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
        {algorithms.map((algo, i) => {
          const Icon = algoIcons[algo.name];
          return (
            <li key={algo.name}>
              <button
                className={`sidebar-item${i === selected ? " active" : ""}`}
                onClick={() => { playSelect(); onSelect(i); }}
                disabled={disabled}
              >
                {Icon && <Icon className="sidebar-item-icon" />}
                <div className="sidebar-item-text">
                  <span className="sidebar-item-name">{algo.name}</span>
                  <span className="sidebar-item-complexity">
                    Time: {algo.time} &middot; Space: {algo.space}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Social Links */}
      <div className="social-section">
        <div className="social-links">
          <a
            href="https://github.com/0xPolybit"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            title="GitHub"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/polybit/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            title="LinkedIn"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://www.instagram.com/swastikbiswas1776"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            title="Instagram"
          >
            <FaInstagram />
          </a>
        </div>
      </div>
    </aside>
  );
}
