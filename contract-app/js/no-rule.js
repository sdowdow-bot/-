// ==================== 合同编号规则 ====================
// 编号规则数据
let noRules = [
  {
    id: 1,
    name: '采购合同编号规则',
    contractType: '采购合同',
    format: ['prefix','date','seq'],
    prefix: 'CG',
    suffix: '',
    dateFormat: 'YYYY',
    deptCode: '',
    typeCode: 'CG',
    seqLen: 4,
    seqStart: 1,
    currentSeq: 15,
    separator: '-',
    status: 'enabled',
    remark: '采购类合同统一编号'
  },
  {
    id: 2,
    name: '服务合同编号规则',
    contractType: '服务合同',
    format: ['prefix','date','dept','seq'],
    prefix: 'FW',
    suffix: '',
    dateFormat: 'YYYYMM',
    deptCode: 'auto',
    typeCode: 'FW',
    seqLen: 4,
    seqStart: 1,
    currentSeq: 8,
    separator: '-',
    status: 'enabled',
    remark: '服务类合同按月编号'
  },
  {
    id: 3,
    name: '租赁合同编号规则',
    contractType: '租赁合同',
    format: ['prefix','type','date','seq','suffix'],
    prefix: 'ZL',
    suffix: 'CN',
    dateFormat: 'YYYY',
    deptCode: '',
    typeCode: 'ZL',
    seqLen: 3,
    seqStart: 1,
    currentSeq: 3,
    separator: '/',
    status: 'enabled',
    remark: '租赁合同含后缀CN标识'
  },
  {
    id: 4,
    name: '合作协议编号规则',
    contractType: '合作协议',
    format: ['prefix','date','seq'],
    prefix: 'HZ',
    suffix: '',
    dateFormat: 'YYYY',
    deptCode: '',
    typeCode: 'HZ',
    seqLen: 4,
    seqStart: 1,
    currentSeq: 2,
    separator: '-',
    status: 'disabled',
    remark: '暂未启用'
  },
  {
    id: 5,
    name: '通用编号规则',
    contractType: 'all',
    format: ['prefix','date','seq'],
    prefix: 'HT',
    suffix: '',
    dateFormat: 'YYYYMM',
    deptCode: '',
    typeCode: '',
    seqLen: 4,
    seqStart: 1,
    currentSeq: 46,
    separator: '-',
    status: 'enabled',
    remark: '适用于所有类型的合同默认编号'
  }
];
let noRuleNextId = 6;
let tempNoRuleFormat = []; // 临时存储编号格式变量

// 变量名称映射
var noRuleVarLabels = {
  prefix: '前缀',
  date: '日期',
  createDate: '创建日期',
  contractDate: '合同日期',
  dept: '部门编码',
  type: '合同类型',
  seq: '流水号',
  suffix: '后缀'
};
var noRuleVarColors = {
  prefix: '#337AB7',
  date: '#5BC0DE',
  createDate: '#9C27B0',
  contractDate: '#FF5722',
  dept: '#5CB85C',
  type: '#F0AD4E',
  seq: '#D9534F',
  suffix: '#777'
};

// 渲染规则列表