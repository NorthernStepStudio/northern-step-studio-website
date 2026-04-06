import { StatusBadge } from './components';

interface LayoutGuideProps {
  layoutGuide: Array<{ step: string; title: string; detail: string }>;
}

export function LayoutGuide({ layoutGuide }: LayoutGuideProps) {
  return (
    <section className="panel panel-wide">
      <div className="panel-header">
        <div>
          <h2>How This Add-On Is Laid Out</h2>
          <p>
            Use this as the map for the screen. The top five sections are setup, and Operating View
            is the live dashboard after launch.
          </p>
        </div>
        <StatusBadge tone="neutral">6 sections</StatusBadge>
      </div>
      <div className="guide-grid">
        {layoutGuide.map((item) => (
          <article key={item.title} className="guide-card">
            <span className="guide-step">{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
