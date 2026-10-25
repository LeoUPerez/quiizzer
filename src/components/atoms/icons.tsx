interface IconProps { className?: string }

export const ArrowRightIcon = ({ className = "h-5 w-5" }: IconProps) => <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}><path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
export const BookIcon = ({ className = "h-5 w-5" }: IconProps) => <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}><path d="M4.5 5.8A2.8 2.8 0 0 1 7.3 3H20v15H7.3a2.8 2.8 0 0 0-2.8 2.8V5.8Zm0 15V6.5M8 7h8m-8 4h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
export const LockIcon = ({ className = "h-4 w-4" }: IconProps) => <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}><rect x="4.5" y="8.25" width="11" height="8" rx="1.7" stroke="currentColor" strokeWidth="1.5" /><path d="M6.8 8.25V6.4a3.2 3.2 0 0 1 6.4 0v1.85" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
export const FlaskIcon = () => <span aria-hidden="true" className="text-2xl">⚗</span>;
export const CodeIcon = () => <span aria-hidden="true" className="font-mono text-xl">&lt;/&gt;</span>;
export const CalculatorIcon = () => <span aria-hidden="true" className="text-2xl">▦</span>;
export const AnatomyIcon = () => <span aria-hidden="true" className="text-2xl">♡</span>;

export const DnaIcon = () => <span aria-hidden="true" className="text-2xl">⌬</span>;
export const KineticsIcon = () => <span aria-hidden="true" className="text-2xl">⌁</span>;
export const VitaminIcon = () => <span aria-hidden="true" className="text-2xl">✦</span>;
export const InhibitorIcon = () => <span aria-hidden="true" className="text-2xl">⊘</span>;
