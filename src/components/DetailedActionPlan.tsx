import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ActionPlanProps {
  actionPlan: {
    priorityTasks: Array<{task: string, impact: string, effort: string, timeEstimate: string}>;
    mediumTermTasks: Array<{task: string, impact: string, timeEstimate: string}>;
    longTermTasks: Array<{task: string, impact: string}>;
    summary: string;
  };
  repositoryName: string;
}

const DetailedActionPlan: React.FC<ActionPlanProps> = ({ actionPlan, repositoryName }) => {
  const priorityTaskImpacts = {
    high: actionPlan.priorityTasks.filter(task => task.impact === 'high').length,
    medium: actionPlan.priorityTasks.filter(task => task.impact === 'medium').length,
    low: actionPlan.priorityTasks.filter(task => task.impact === 'low').length,
  };
  
  const chartData = {
    labels: ['Priority Tasks', 'Medium-Term Tasks', 'Long-Term Tasks'],
    datasets: [
      {
        label: 'High Impact',
        data: [
          priorityTaskImpacts.high,
          actionPlan.mediumTermTasks.filter(task => task.impact === 'high').length,
          actionPlan.longTermTasks.filter(task => task.impact === 'high').length
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      },
      {
        label: 'Medium Impact',
        data: [
          priorityTaskImpacts.medium,
          actionPlan.mediumTermTasks.filter(task => task.impact === 'medium').length,
          actionPlan.longTermTasks.filter(task => task.impact === 'medium').length
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      },
      {
        label: 'Low Impact',
        data: [
          priorityTaskImpacts.low,
          actionPlan.mediumTermTasks.filter(task => task.impact === 'low').length,
          actionPlan.longTermTasks.filter(task => task.impact === 'low').length
        ],
        backgroundColor: 'rgba(255, 159, 64, 0.7)',
      }
    ]
  };
  
  return (
    <div className="detailed-action-plan">
      <h2>Action Plan for {repositoryName}</h2>
      
      <div className="action-plan-summary">
        <h3>Summary</h3>
        <p>{actionPlan.summary}</p>
      </div>
      
      <div className="action-plan-chart">
        <h3>Task Impact Distribution</h3>
        <Bar 
          data={chartData} 
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Tasks by Timeline and Impact'
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              } as any
            }
          }}
        />
      </div>
      
      <div className="action-plan-tasks">
        <div className="priority-tasks">
          <h3>Priority Tasks</h3>
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Impact</th>
                <th>Effort</th>
                <th>Time Estimate</th>
              </tr>
            </thead>
            <tbody>
              {actionPlan.priorityTasks.map((task, index) => (
                <tr key={index}>
                  <td>{task.task}</td>
                  <td>
                    <span className={`impact-badge impact-${task.impact}`}>
                      {task.impact}
                    </span>
                  </td>
                  <td>
                    <span className={`effort-badge effort-${task.effort}`}>
                      {task.effort}
                    </span>
                  </td>
                  <td>{task.timeEstimate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="medium-term-tasks">
          <h3>Medium-Term Tasks</h3>
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Impact</th>
                <th>Time Estimate</th>
              </tr>
            </thead>
            <tbody>
              {actionPlan.mediumTermTasks.map((task, index) => (
                <tr key={index}>
                  <td>{task.task}</td>
                  <td>
                    <span className={`impact-badge impact-${task.impact}`}>
                      {task.impact}
                    </span>
                  </td>
                  <td>{task.timeEstimate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="long-term-tasks">
          <h3>Long-Term Strategic Tasks</h3>
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {actionPlan.longTermTasks.map((task, index) => (
                <tr key={index}>
                  <td>{task.task}</td>
                  <td>
                    <span className={`impact-badge impact-${task.impact}`}>
                      {task.impact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="action-plan-export">
        <button className="export-button">
          Export as PDF
        </button>
        <button className="export-button">
          Export as CSV
        </button>
      </div>
    </div>
  );
};

export default DetailedActionPlan; 