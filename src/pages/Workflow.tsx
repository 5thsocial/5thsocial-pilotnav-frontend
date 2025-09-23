import React from 'react';

interface WorkflowProps {
  selectedSystem?: string;
  onWorkflowSelection?: (txnCode: string) => void;
}

const Workflow: React.FC<WorkflowProps> = ({ selectedSystem, onWorkflowSelection }) => {
  return (
    <div>
      <h1>Workflow - {selectedSystem}</h1>
      <button onClick={() => onWorkflowSelection?.('example')}>Select Workflow</button>
    </div>
  );
};

export default Workflow;