import { vi, describe, it, expect, beforeEach } from 'vitest';
import type {
  FlowNodeItemType,
  FlowNodeTemplateType,
  StoreNodeItemType
} from '@fastgpt/global/core/workflow/type/node';
import type { Node, Edge } from 'reactflow';
import {
  FlowNodeTypeEnum,
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum,
  EDGE_TYPE
} from '@fastgpt/global/core/workflow/node/constant';
import { WorkflowIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';
import { NodeInputKeyEnum } from '@fastgpt/global/core/workflow/constants';
import {
  nodeTemplate2FlowNode,
  storeNode2FlowNode,
  filterWorkflowNodeOutputsByType,
  checkWorkflowNodeAndConnection,
  getLatestNodeTemplate
} from '@/web/core/workflow/utils';
import type { FlowNodeOutputItemType } from '@fastgpt/global/core/workflow/type/io';

describe('nodeTemplate2FlowNode', () => {
  it('should convert template to flow node', () => {
    const template: FlowNodeTemplateType = {
      id: 'template1',
      templateType: 'formInput',
      name: 'Test Node',
      flowNodeType: FlowNodeTypeEnum.formInput,
      inputs: [],
      outputs: []
    };

    const result = nodeTemplate2FlowNode({
      template,
      position: { x: 100, y: 100 },
      selected: true,
      parentNodeId: 'parent1',
      t: ((key: any) => key) as any
    });

    expect(result).toMatchObject({
      type: FlowNodeTypeEnum.formInput,
      position: { x: 100, y: 100 },
      selected: true,
      data: {
        name: 'Test Node',
        flowNodeType: FlowNodeTypeEnum.formInput,
        parentNodeId: 'parent1'
      }
    });
    expect(result.id).toBeDefined();
  });
});

describe('storeNode2FlowNode', () => {
  it('should convert store node to flow node', () => {
    const storeNode: StoreNodeItemType = {
      nodeId: 'node1',
      flowNodeType: FlowNodeTypeEnum.formInput,
      position: { x: 100, y: 100 },
      inputs: [],
      outputs: [],
      name: 'Test Node',
      version: '1.0'
    };

    const result = storeNode2FlowNode({
      item: storeNode,
      selected: true,
      t: ((key: any) => key) as any
    });

    expect(result).toMatchObject({
      id: 'node1',
      type: FlowNodeTypeEnum.formInput,
      position: { x: 100, y: 100 },
      selected: true
    });
  });

  it('should handle dynamic inputs and outputs', () => {
    const storeNode: StoreNodeItemType = {
      nodeId: 'node1',
      flowNodeType: FlowNodeTypeEnum.formInput,
      position: { x: 0, y: 0 },
      inputs: [
        {
          key: 'dynamicInput',
          label: 'Dynamic Input',
          renderTypeList: [FlowNodeInputTypeEnum.addInputParam]
        }
      ],
      outputs: [
        {
          id: 'dynamicOutput',
          key: 'dynamicOutput',
          label: 'Dynamic Output',
          type: FlowNodeOutputTypeEnum.dynamic
        }
      ],
      name: 'Test Node',
      version: '1.0'
    };

    const result = storeNode2FlowNode({
      item: storeNode,
      t: ((key: any) => key) as any
    });

    expect(result.data.inputs).toHaveLength(3);
    expect(result.data.outputs).toHaveLength(2);
  });

  // 這兩個測試涉及到模擬衝突，請運行單獨的測試文件:
  // - utils.deprecated.test.ts: 測試 deprecated inputs/outputs
  // - utils.version.test.ts: 測試 version 和 avatar inheritance
});

describe('filterWorkflowNodeOutputsByType', () => {
  it('should filter outputs by type', () => {
    const outputs: FlowNodeOutputItemType[] = [
      {
        id: '1',
        valueType: WorkflowIOValueTypeEnum.string,
        key: '1',
        label: '1',
        type: FlowNodeOutputTypeEnum.static
      },
      {
        id: '2',
        valueType: WorkflowIOValueTypeEnum.number,
        key: '2',
        label: '2',
        type: FlowNodeOutputTypeEnum.static
      },
      {
        id: '3',
        valueType: WorkflowIOValueTypeEnum.boolean,
        key: '3',
        label: '3',
        type: FlowNodeOutputTypeEnum.static
      }
    ];

    const result = filterWorkflowNodeOutputsByType(outputs, WorkflowIOValueTypeEnum.string);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should return all outputs for any type', () => {
    const outputs: FlowNodeOutputItemType[] = [
      {
        id: '1',
        valueType: WorkflowIOValueTypeEnum.string,
        key: '1',
        label: '1',
        type: FlowNodeOutputTypeEnum.static
      },
      {
        id: '2',
        valueType: WorkflowIOValueTypeEnum.number,
        key: '2',
        label: '2',
        type: FlowNodeOutputTypeEnum.static
      }
    ];

    const result = filterWorkflowNodeOutputsByType(outputs, WorkflowIOValueTypeEnum.any);

    expect(result).toHaveLength(2);
  });

  it('should handle array types correctly', () => {
    const outputs: FlowNodeOutputItemType[] = [
      {
        id: '1',
        valueType: WorkflowIOValueTypeEnum.string,
        key: '1',
        label: '1',
        type: FlowNodeOutputTypeEnum.static
      },
      {
        id: '2',
        valueType: WorkflowIOValueTypeEnum.arrayString,
        key: '2',
        label: '2',
        type: FlowNodeOutputTypeEnum.static
      }
    ];

    const result = filterWorkflowNodeOutputsByType(outputs, WorkflowIOValueTypeEnum.arrayString);
    expect(result).toHaveLength(2);
  });
});

describe('checkWorkflowNodeAndConnection', () => {
  it('should validate nodes and connections', () => {
    const nodes: Node[] = [
      {
        id: 'node1',
        type: FlowNodeTypeEnum.formInput,
        data: {
          nodeId: 'node1',
          flowNodeType: FlowNodeTypeEnum.formInput,
          inputs: [
            {
              key: NodeInputKeyEnum.aiChatDatasetQuote,
              required: true,
              value: undefined,
              renderTypeList: [FlowNodeInputTypeEnum.input]
            }
          ],
          outputs: []
        },
        position: { x: 0, y: 0 }
      }
    ];

    const edges: Edge[] = [
      {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        type: EDGE_TYPE
      }
    ];

    const result = checkWorkflowNodeAndConnection({ nodes, edges });
    expect(result).toEqual(['node1']);
  });

  it('should handle empty nodes and edges', () => {
    const result = checkWorkflowNodeAndConnection({ nodes: [], edges: [] });
    expect(result).toBeUndefined();
  });
});

describe('getLatestNodeTemplate', () => {
  it('should update node to latest template version', () => {
    const node: FlowNodeItemType = {
      id: 'node1',
      nodeId: 'node1',
      templateType: 'formInput',
      flowNodeType: FlowNodeTypeEnum.formInput,
      inputs: [
        {
          key: 'input1',
          value: 'test',
          renderTypeList: [FlowNodeInputTypeEnum.input],
          label: 'Input 1'
        }
      ],
      outputs: [
        {
          key: 'output1',
          value: 'test',
          type: FlowNodeOutputTypeEnum.static,
          label: 'Output 1',
          id: 'output1'
        }
      ],
      name: 'Old Name',
      intro: 'Old Intro'
    };

    const template: FlowNodeTemplateType = {
      name: 'Template 1',
      id: 'template1',
      templateType: 'formInput',
      flowNodeType: FlowNodeTypeEnum.formInput,
      inputs: [
        { key: 'input1', renderTypeList: [FlowNodeInputTypeEnum.input], label: 'Input 1' },
        { key: 'input2', renderTypeList: [FlowNodeInputTypeEnum.input], label: 'Input 2' }
      ],
      outputs: [
        { id: 'output1', key: 'output1', type: FlowNodeOutputTypeEnum.static, label: 'Output 1' },
        { id: 'output2', key: 'output2', type: FlowNodeOutputTypeEnum.static, label: 'Output 2' }
      ]
    };

    const result = getLatestNodeTemplate(node, template);

    expect(result.inputs).toHaveLength(2);
    expect(result.outputs).toHaveLength(2);
    expect(result.name).toBe('Old Name');
  });

  it('should preserve existing values when updating template', () => {
    const node: FlowNodeItemType = {
      id: 'node1',
      nodeId: 'node1',
      templateType: 'formInput',
      flowNodeType: FlowNodeTypeEnum.formInput,
      inputs: [
        {
          key: 'input1',
          value: 'existingValue',
          renderTypeList: [FlowNodeInputTypeEnum.input],
          label: 'Input 1'
        }
      ],
      outputs: [
        {
          key: 'output1',
          value: 'existingOutput',
          type: FlowNodeOutputTypeEnum.static,
          label: 'Output 1',
          id: 'output1'
        }
      ],
      name: 'Node Name',
      intro: 'Node Intro'
    };

    const template: FlowNodeTemplateType = {
      name: 'Template 1',
      id: 'template1',
      templateType: 'formInput',
      flowNodeType: FlowNodeTypeEnum.formInput,
      inputs: [
        { key: 'input1', renderTypeList: [FlowNodeInputTypeEnum.input], label: 'Input 1' },
        { key: 'input2', renderTypeList: [FlowNodeInputTypeEnum.input], label: 'Input 2' }
      ],
      outputs: [
        { id: 'output1', key: 'output1', type: FlowNodeOutputTypeEnum.static, label: 'Output 1' },
        { id: 'output2', key: 'output2', type: FlowNodeOutputTypeEnum.static, label: 'Output 2' }
      ]
    };

    const result = getLatestNodeTemplate(node, template);

    expect(result.inputs[0].value).toBe('existingValue');
    expect(result.outputs[0].value).toBe('existingOutput');
  });
});
