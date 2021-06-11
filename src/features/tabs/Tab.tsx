export interface TabProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function Tab({ children, className }: TabProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export default Tab;
