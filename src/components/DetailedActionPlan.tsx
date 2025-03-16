import React from 'react';

interface ActionPlanProps {
  plan: {
    priorityTasks: Array<{task: string, impact: string, effort: string, timeEstimate: string}>;
    mediumTermTasks: Array<{task: string, impact: string, timeEstimate: string}>;
    longTermTasks: Array<{task: string, impact: string}>;
    summary: string;
  };
  repositoryName: string;
}

const DetailedActionPlan: React.FC<ActionPlanProps> = ({
  plan,
  repositoryName
}) => {
  return (
    <div className="detailed-action-plan">
      <div className="action-plan-header">
        <h2>Action Plan for {repositoryName}</h2>
        <p className="summary">{plan.summary}</p>
      </div>
      
      <div className="action-plan-content">
        <section className="priority-tasks">
          <h3>Priority Tasks</h3>
          <p className="section-description">
            These tasks should be addressed first for maximum impact.
          </p>
          
          <ul className="tasks-list">
            {plan.priorityTasks.map((task, index) => (
              <li key={index} className="task-item priority-task">
                <div className="task-header">
                  <h4 className="task-title">{task.task}</h4>
                  <div className="task-meta">
                    <span className={`impact-badge impact-${task.impact.toLowerCase()}`}>
                      {task.impact} Impact
                    </span>
                    <span className={`effort-badge effort-${task.effort.toLowerCase()}`}>
                      {task.effort} Effort
                    </span>
                  </div>
                </div>
                <div className="task-details">
                  <span className="time-estimate">Estimated time: {task.timeEstimate}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
        
        <section className="medium-term-tasks">
          <h3>Medium-Term Tasks</h3>
          <p className="section-description">
            These tasks can be addressed after completing priority items.
          </p>
          
          <ul className="tasks-list">
            {plan.mediumTermTasks.map((task, index) => (
              <li key={index} className="task-item medium-task">
                <div className="task-header">
                  <h4 className="task-title">{task.task}</h4>
                  <div className="task-meta">
                    <span className={`impact-badge impact-${task.impact.toLowerCase()}`}>
                      {task.impact} Impact
                    </span>
                  </div>
                </div>
                <div className="task-details">
                  <span className="time-estimate">Estimated time: {task.timeEstimate}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
        
        <section className="long-term-tasks">
          <h3>Strategic Long-Term Improvements</h3>
          <p className="section-description">
            These tasks represent longer-term strategic improvements.
          </p>
          
          <ul className="tasks-list">
            {plan.longTermTasks.map((task, index) => (
              <li key={index} className="task-item long-term-task">
                <div className="task-header">
                  <h4 className="task-title">{task.task}</h4>
                  <div className="task-meta">
                    <span className={`impact-badge impact-${task.impact.toLowerCase()}`}>
                      {task.impact} Impact
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      
      <div className="action-plan-footer">
        <p className="disclaimer">
          This action plan was generated based on automated analysis of the repository. 
          Always validate recommendations based on your specific project requirements.
        </p>
      </div>
    </div>
  );
};

export default DetailedActionPlan; 