// ==================== 操作日志 ====================
// 操作日志数据（不可篡改，使用哈希链保护）
let operationLogs = [];
let opLogCurrentPage = 1;
const opLogPageSize = 20;

// 简单哈希函数（模拟完整性校验）
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// 记录操作日志
function addOpLog(type, contractNo, contractName, description, changes) {
  let prevHash = operationLogs.length > 0 ? operationLogs[operationLogs.length - 1].hash : '00000000';
  let logEntry = {
    id: operationLogs.length + 1,
    time: new Date().toLocaleString('zh-CN'),
    user: '管理员',
    type: type,
    contractNo: contractNo || '—',
    contractName: contractName || '—',
    description: description || '',
    ip: '192.168.1.' + (100 + Math.floor(Math.random() * 50)),
    prevHash: prevHash,
    changes: changes || null
  };
  logEntry.hash = simpleHash(logEntry.id + logEntry.time + logEntry.user + logEntry.type + logEntry.contractNo + logEntry.description + prevHash);
  // 冻结对象，防止篡改
  Object.freeze(logEntry);
  operationLogs.push(logEntry);
  return logEntry;
}

// 验证日志完整性
function verifyLogIntegrity() {
  for (let i = 0; i < operationLogs.length; i++) {
    let log = operationLogs[i];
    let prevHash = i > 0 ? operationLogs[i - 1].hash : '00000000';
    let expectedHash = simpleHash(log.id + log.time + log.user + log.type + log.contractNo + log.description + prevHash);
    if (log.hash !== expectedHash || log.prevHash !== prevHash) return false;
  }
  return true;
}

// 操作类型标签
const OP_TYPE_LABELS = {
  create: { label: '新增', cls: 'status-approved' },
  delete: { label: '删除', cls: 'status-rejected' },
  edit: { label: '修改', cls: 'status-editing' },
  view: { label: '查看', cls: 'status-draft' },
  download: { label: '下载', cls: 'status-sealing' },
  print: { label: '打印', cls: 'status-archiving' },
  approve: { label: '审批', cls: 'status-approving' },
  withdraw: { label: '撤回', cls: 'status-withdrawn' },
  rollback: { label: '回滚', cls: 'status-rejected' },
  submit: { label: '提交', cls: 'status-approving' },
  export: { label: '导出', cls: 'status-sealing' }
};

function getOpTypeBadge(type) {
  let t = OP_TYPE_LABELS[type] || { label: type, cls: '' };
  return '<span class="status-badge ' + t.cls + '">' + t.label + '</span>';
}

// 生成模拟历史日志
function initOperationLogs() {
  let mockLogs = [
    { type: 'create', no: 'HT-2026-001', name: 'XX科技有限公司采购合同', desc: '创建合同', user: '张经理', time: '2026-05-15 09:00:12' },
    { type: 'edit', no: 'HT-2026-001', name: 'XX科技有限公司采购合同', desc: '编辑合同基本信息', user: '张经理', time: '2026-05-15 09:15:30', changes: [
      { field: '合同金额', before: '¥ 0.00', after: '¥ 580,000.00' },
      { field: '相对方', before: '—', after: 'XX科技有限公司' },
      { field: '合同类别', before: '—', after: '采购合同' }
    ]},
    { type: 'submit', no: 'HT-2026-001', name: 'XX科技有限公司采购合同', desc: '提交合同审批', user: '张经理', time: '2026-05-15 10:00:05' },
    { type: 'view', no: 'HT-2026-001', name: 'XX科技有限公司采购合同', desc: '查看合同详情', user: '李总监', time: '2026-05-15 11:20:33' },
    { type: 'approve', no: 'HT-2026-001', name: 'XX科技有限公司采购合同', desc: '部门审批通过', user: '李总监', time: '2026-05-15 14:30:00' },
    { type: 'edit', no: 'HT-2026-001', name: 'XX科技有限公司采购合同', desc: '协同编辑合同内容', user: '管理员', time: '2026-05-16 09:10:22', changes: [
      { field: '合同金额', before: '¥ 580,000.00', after: '¥ 620,000.00' },
      { field: '交付地址', before: '—', after: '北京市海淀区中关村科技园A座' }
    ]},
    { type: 'view', no: 'HT-2026-001', name: 'XX科技有限公司采购合同', desc: '查看合同详情', user: '王法务', time: '2026-05-16 10:05:18' },
    { type: 'approve', no: 'HT-2026-001', name: 'XX科技有限公司采购合同', desc: '法务审批通过', user: '王法务', time: '2026-05-16 15:20:00' },
    { type: 'print', no: 'HT-2026-001', name: 'XX科技有限公司采购合同', desc: '打印合同文本', user: '张经理', time: '2026-05-17 08:45:10' },
    { type: 'download', no: 'HT-2026-001', name: 'XX科技有限公司采购合同', desc: '下载合同文档', user: '张经理', time: '2026-05-17 08:46:30' },
    { type: 'create', no: 'HT-2026-002', name: '云计算服务合作协议', desc: '创建合同', user: '赵主管', time: '2026-05-18 10:00:00' },
    { type: 'edit', no: 'HT-2026-002', name: '云计算服务合作协议', desc: '编辑合同金额', user: '赵主管', time: '2026-05-18 11:30:15', changes: [
      { field: '合同金额', before: '¥ 0.00', after: '¥ 350,000.00' },
      { field: '服务期限', before: '—', after: '2026-06-01至2027-05-31' }
    ]},
    { type: 'submit', no: 'HT-2026-002', name: '云计算服务合作协议', desc: '提交合同审批', user: '赵主管', time: '2026-05-18 14:00:00' },
    { type: 'view', no: 'HT-2026-002', name: '云计算服务合作协议', desc: '查看合同详情', user: '李总监', time: '2026-05-18 14:30:22' },
    { type: 'approve', no: 'HT-2026-002', name: '云计算服务合作协议', desc: '部门审批通过', user: '李总监', time: '2026-05-18 16:00:00' },
    { type: 'create', no: 'HT-2026-003', name: '办公设备租赁合同', desc: '创建合同', user: '钱助理', time: '2026-05-19 09:00:00' },
    { type: 'edit', no: 'HT-2026-003', name: '办公设备租赁合同', desc: '修改租赁条款', user: '钱助理', time: '2026-05-19 10:15:30', changes: [
      { field: '租赁期限', before: '12个月', after: '24个月' },
      { field: '月租金', before: '¥ 5,000.00', after: '¥ 4,500.00' }
    ]},
    { type: 'submit', no: 'HT-2026-003', name: '办公设备租赁合同', desc: '提交合同审批', user: '钱助理', time: '2026-05-19 11:00:00' },
    { type: 'withdraw', no: 'HT-2026-003', name: '办公设备租赁合同', desc: '撤回合同审批', user: '钱助理', time: '2026-05-19 14:00:00' },
    { type: 'edit', no: 'HT-2026-003', name: '办公设备租赁合同', desc: '重新编辑合同内容', user: '钱助理', time: '2026-05-19 14:30:00', changes: [
      { field: '月租金', before: '¥ 4,500.00', after: '¥ 4,200.00' },
      { field: '质保期', before: '6个月', after: '12个月' }
    ]},
    { type: 'submit', no: 'HT-2026-003', name: '办公设备租赁合同', desc: '重新提交审批', user: '钱助理', time: '2026-05-19 15:00:00' },
    { type: 'create', no: 'HT-2026-004', name: 'IT运维服务合同', desc: '创建合同', user: '孙工程师', time: '2026-05-20 08:30:00' },
    { type: 'edit', no: 'HT-2026-004', name: 'IT运维服务合同', desc: '编辑服务范围', user: '孙工程师', time: '2026-05-20 09:00:15', changes: [
      { field: '服务范围', before: '基础运维', after: '基础运维+应急响应' },
      { field: '合同金额', before: '¥ 120,000.00', after: '¥ 180,000.00' }
    ]},
    { type: 'view', no: 'HT-2026-004', name: 'IT运维服务合同', desc: '查看合同详情', user: '管理员', time: '2026-05-20 09:30:00' },
    { type: 'create', no: 'HT-2026-005', name: '软件开发外包合同', desc: '创建合同', user: '周经理', time: '2026-05-20 10:00:00' },
    { type: 'edit', no: 'HT-2026-005', name: '软件开发外包合同', desc: '编辑合同条款', user: '周经理', time: '2026-05-20 10:30:00', changes: [
      { field: '交付日期', before: '2026-09-30', after: '2026-10-31' },
      { field: '合同金额', before: '¥ 500,000.00', after: '¥ 550,000.00' }
    ]},
    { type: 'export', no: '—', name: '—', desc: '导出合同列表数据', user: '管理员', time: '2026-05-20 11:00:00' },
    { type: 'rollback', no: 'HT-2026-001', name: 'XX科技有限公司采购合同', desc: '回滚合同内容至v2.0', user: '管理员', time: '2026-05-20 14:00:00' },
    { type: 'print', no: 'HT-2026-002', name: '云计算服务合作协议', desc: '打印合同文本', user: '赵主管', time: '2026-05-20 15:00:00' },
    { type: 'download', no: 'HT-2026-002', name: '云计算服务合作协议', desc: '下载合同PDF', user: '赵主管', time: '2026-05-20 15:05:00' },
  ];
  mockLogs.forEach(function(m) {
    let prevHash = operationLogs.length > 0 ? operationLogs[operationLogs.length - 1].hash : '00000000';
    let logEntry = {
      id: operationLogs.length + 1,
      time: m.time,
      user: m.user,
      type: m.type,
      contractNo: m.no,
      contractName: m.name,
      description: m.desc,
      ip: '192.168.1.' + (100 + Math.floor(Math.random() * 50)),
      prevHash: prevHash,
      changes: m.changes || null
    };
    logEntry.hash = simpleHash(logEntry.id + logEntry.time + logEntry.user + logEntry.type + logEntry.contractNo + logEntry.description + prevHash);
    Object.freeze(logEntry);
    operationLogs.push(logEntry);
  });
}

// 渲染操作日志表格
function renderOperationLogTable(list) {
  if (!list) list = operationLogs;
  // 按时间倒序
  let sorted = list.slice().reverse();
  let total = sorted.length;
  let totalPages = Math.max(1, Math.ceil(total / opLogPageSize));
  if (opLogCurrentPage > totalPages) opLogCurrentPage = totalPages;
  let startIdx = (opLogCurrentPage - 1) * opLogPageSize;
  let pageData = sorted.slice(startIdx, startIdx + opLogPageSize);

  let html = '';
  if (pageData.length === 0) {
    html = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#999;"><i class="fa-solid fa-inbox" style="font-size:36px;display:block;margin-bottom:10px;"></i>暂无操作日志</td></tr>';
  } else {
    pageData.forEach(function(log, idx) {
      html += '<tr>';
      html += '<td>' + (startIdx + idx + 1) + '</td>';
      html += '<td>' + log.user + '</td>';
      html += '<td>' + getOpTypeBadge(log.type) + '</td>';
      html += '<td style="font-family:monospace;">' + log.contractNo + '</td>';
      html += '<td>' + log.contractName + '</td>';
      // 操作描述：修改类型显示变更对比
      if (log.type === 'edit' && log.changes && log.changes.length > 0) {
        html += '<td>';
        html += '<div style="color:#555;margin-bottom:4px;">' + log.description + '</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:4px;">';
        log.changes.forEach(function(ch) {
          html += '<span style="display:inline-block;font-size:11px;background:#FFF3E0;border:1px solid #FFE0B2;border-radius:3px;padding:1px 6px;">';
          html += '<span style=\'color:#F44336;text-decoration:line-through;\'>' + ch.before + '</span> → <span style=\'color:#4CAF50;font-weight:600;\'>' + ch.after + '</span>';
          html += '</span>';
        });
        html += '</div>';
        html += '</td>';
      } else {
        html += '<td style="color:#555;">' + log.description + '</td>';
      }
      html += '<td style="font-family:monospace;font-size:12px;color:#999;">' + log.ip + '</td>';
      html += '<td style="font-family:monospace;font-size:12px;">' + log.time + '</td>';
      html += '</tr>';
    });
  }
  $('#opLogTableBody').html(html);
  $('#opLogTotalCount').text(operationLogs.length);
  $('#opLogPageTotal').text(total);
  $('#opLogPageStart').text(total > 0 ? startIdx + 1 : 0);
  $('#opLogPageEnd').text(Math.min(startIdx + opLogPageSize, total));
  $('#opLogPageInfo').text(opLogCurrentPage + '/' + totalPages);
}

// 筛选操作日志
function applyOpLogFilter() {
  let user = $('#opLogSearchUser').val().trim().toLowerCase();
  let type = $('#opLogSearchType').val();
  let contractNo = $('#opLogSearchContractNo').val().trim().toLowerCase();
  let dateStart = $('#opLogSearchDateStart').val();
  let dateEnd = $('#opLogSearchDateEnd').val();

  let filtered = operationLogs.filter(function(log) {
    if (user && log.user.toLowerCase().indexOf(user) === -1) return false;
    if (type && log.type !== type) return false;
    if (contractNo && log.contractNo.toLowerCase().indexOf(contractNo) === -1) return false;
    if (dateStart && log.time < dateStart) return false;
    if (dateEnd && log.time > dateEnd + ' 23:59:59') return false;
    return true;
  });
  opLogCurrentPage = 1;
  renderOperationLogTable(filtered);
}

function resetOpLogFilter() {
  $('#opLogSearchUser').val('');
  $('#opLogSearchType').val('');
  $('#opLogSearchContractNo').val('');
  $('#opLogSearchDateStart').val('');
  $('#opLogSearchDateEnd').val('');
  opLogCurrentPage = 1;
  renderOperationLogTable();
}

function opLogPrevPage() {
  if (opLogCurrentPage > 1) {
    opLogCurrentPage--;
    applyOpLogFilter();
  }
}

function opLogNextPage() {
  let total = operationLogs.length;
  let totalPages = Math.max(1, Math.ceil(total / opLogPageSize));
  if (opLogCurrentPage < totalPages) {
    opLogCurrentPage++;
    applyOpLogFilter();
  }
}

function exportOperationLog() {
  addOpLog('export', '—', '—', '导出操作日志');
  alert('操作日志已导出！共 ' + operationLogs.length + ' 条记录。');
}

// 初始化模拟日志
initOperationLogs();

function renderNoRuleTable() {
  var html = '';
  if (noRules.length === 0) {
    html = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999;"><i class="fa-solid fa-barcode" style="font-size:28px;display:block;margin-bottom:8px;"></i>暂无编号规则，请新建</td></tr>';
  } else {
    noRules.forEach(function(rule, idx){
      var preview = generateNoRulePreview(rule);
      var checked = rule.status === 'enabled' ? 'checked' : '';
      var statusHtml = '<label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;margin:0;">'
        + '<input type="checkbox" '+checked+' onchange="toggleNoRuleStatus('+rule.id+')" style="display:none;">'
        + '<span style="position:relative;display:inline-block;width:40px;height:22px;border-radius:11px;background:'+(rule.status==='enabled'?'#2E7D32':'#ccc')+';transition:background 0.3s;vertical-align:middle;">'
        + '<span style="position:absolute;top:2px;left:'+(rule.status==='enabled'?'20px':'2px')+';width:18px;height:18px;border-radius:50%;background:#fff;transition:left 0.3s;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></span>'
        + '</span>'
        + '<span style="font-size:12px;color:'+(rule.status==='enabled'?'#2E7D32':'#999')+';">'+(rule.status==='enabled'?'已启用':'已禁用')+'</span>'
        + '</label>';
      var typeLabel = rule.contractType === 'all' ? '全部类型' : rule.contractType;
      html += '<tr>';
      html += '<td>'+(idx+1)+'</td>';
      html += '<td><strong>'+rule.name+'</strong><br><small style="color:#888;">'+(rule.remark||'')+'</small></td>';
      html += '<td>'+typeLabel+'</td>';
      html += '<td><code style="font-size:13px;background:#F5F5F5;padding:3px 8px;border-radius:3px;">'+preview+'</code></td>';
      html += '<td><span style="font-weight:600;color:var(--fa-primary);">'+String(rule.currentSeq).padStart(rule.seqLen,'0')+'</span> / '+Math.pow(10,rule.seqLen - 1)+'...</td>';
      html += '<td>'+statusHtml+'</td>';
      html += '<td style="white-space:nowrap;">';
      html += '<button class="btn btn-xs btn-primary" onclick="editNoRule('+rule.id+')">编辑</button> ';
      html += '<button class="btn btn-xs btn-danger" onclick="deleteNoRule('+rule.id+')">删除</button>';
      html += '</td>';
      html += '</tr>';
    });
  }
  $('#noRuleTableBody').html(html);
}

// 生成编号预览
function generateNoRulePreview(rule) {
  var parts = [];
  var sep = rule.separator || '';
  rule.format.forEach(function(v){
    if (v === 'prefix') parts.push(rule.prefix || 'XX');
    else if (v === 'date') {
      var d = rule.dateFormat || 'YYYY';
      if (d === 'YYYY') parts.push('2026');
      else if (d === 'YYYYMM') parts.push('202605');
      else if (d === 'YYYYMMDD') parts.push('20260515');
      else parts.push('2026');
    }
    else if (v === 'createDate') {
      var d = rule.createDateFormat || 'YYYYMMDD';
      if (d === 'YYYY') parts.push('2026');
      else if (d === 'YYYYMM') parts.push('202605');
      else if (d === 'YYYYMMDD') parts.push('20260515');
      else parts.push('2026');
    }
    else if (v === 'contractDate') {
      var d = rule.contractDateFormat || 'YYYYMMDD';
      if (d === 'YYYY') parts.push('2026');
      else if (d === 'YYYYMM') parts.push('202605');
      else if (d === 'YYYYMMDD') parts.push('20260520');
      else parts.push('2026');
    }
    else if (v === 'dept') parts.push(rule.deptCode === 'auto' ? 'CGB' : (rule.deptCode || 'XX'));
    else if (v === 'type') parts.push(rule.typeCode || 'XX');
    else if (v === 'seq') parts.push(String(rule.currentSeq || 1).padStart(rule.seqLen || 4, '0'));
    else if (v === 'suffix') parts.push(rule.suffix || 'XX');
  });
  return parts.join(sep);
}

// 打开新建规则模态框
function openCreateNoRule() {
  $('#noRuleEditId').val('');
  $('#noRuleModalTitle').html('<i class="fa-solid fa-barcode"></i> 新建编号规则');
  $('#noRuleName').val('');
  $('#noRuleContractType').val('');
  $('#noRuleSeqLen').val('4');
  $('#noRuleSeqStart').val('1');
  $('#noRuleSeparator').val('-');
  $('#noRuleRemark').val('');
  tempNoRuleFormat = ['seq'];
  renderNoRuleFormatArea();
  renderNoRuleVarConfigs();
  updateNoRulePreview();
  $('#modalNoRule').modal('show');
}

// 编辑规则
function editNoRule(id) {
  var rule = noRules.find(function(r){ return r.id === id; });
  if (!rule) return;
  $('#noRuleEditId').val(rule.id);
  $('#noRuleModalTitle').html('<i class="fa-solid fa-pen"></i> 编辑编号规则');
  $('#noRuleName').val(rule.name);
  $('#noRuleContractType').val(rule.contractType);
  $('#noRuleSeqLen').val(rule.seqLen);
  $('#noRuleSeqStart').val(rule.seqStart);
  $('#noRuleSeparator').val(rule.separator);
  $('#noRuleRemark').val(rule.remark || '');
  tempNoRuleFormat = rule.format.slice();
  renderNoRuleFormatArea();
  renderNoRuleVarConfigs();
  // 填充变量配置值
  setTimeout(function(){
    $('#noRulePrefixVal').val(rule.prefix || '');
    $('#noRuleSuffixVal').val(rule.suffix || '');
    $('#noRuleDateFormat').val(rule.dateFormat || 'YYYY');
    $('#noRuleCreateDateFormat').val(rule.createDateFormat || 'YYYYMMDD');
    $('#noRuleContractDateFormat').val(rule.contractDateFormat || 'YYYYMMDD');
    $('#noRuleDeptCode').val(rule.deptCode || '');
    $('#noRuleTypeCode').val(rule.typeCode || '');
    updateNoRulePreview();
  }, 50);
  $('#modalNoRule').modal('show');
}

// 添加变量到格式区
function addNoRuleVariable(type) {
  tempNoRuleFormat.push(type);
  renderNoRuleFormatArea();
  renderNoRuleVarConfigs();
  updateNoRulePreview();
}

// 移除格式区变量
function removeNoRuleVariable(index) {
  if (tempNoRuleFormat[index] === 'seq') { alert('流水号是编号规则的必要组成部分，不可删除。'); return; }
  tempNoRuleFormat.splice(index, 1);
  renderNoRuleFormatArea();
  renderNoRuleVarConfigs();
  updateNoRulePreview();
}

// 渲染格式区
function renderNoRuleFormatArea() {
  var html = '';
  if (tempNoRuleFormat.length === 0) {
    html = '<span style="color:#999;font-size:13px;">点击上方变量添加到此处，可拖拽调整顺序...</span>';
  } else {
    tempNoRuleFormat.forEach(function(v, i){
      var label = noRuleVarLabels[v] || v;
      var color = noRuleVarColors[v] || '#777';
      html += '<span class="no-rule-tag" draggable="true" data-index="'+i+'" style="display:inline-flex;align-items:center;gap:4px;background:'+color+';color:#fff;padding:4px 10px;border-radius:4px;font-size:12px;cursor:grab;user-select:none;margin:2px;transition:transform 0.15s,box-shadow 0.15s;">';
      html += '<i class="fa-solid fa-grip-vertical" style="opacity:0.5;cursor:grab;"></i> ';
      html += '<i class="fa-solid fa-chevron-left" style="cursor:pointer;opacity:0.6;font-size:10px;'+(i===0?'visibility:hidden;':'')+'" onclick="moveNoRuleVariable('+i+',-1)" title="左移"></i> ';
      html += label;
      html += ' <i class="fa-solid fa-chevron-right" style="cursor:pointer;opacity:0.6;font-size:10px;'+(i===tempNoRuleFormat.length-1?'visibility:hidden;':'')+'" onclick="moveNoRuleVariable('+i+',1)" title="右移"></i>';
      if (v !== 'seq') {
        html += ' <i class="fa-solid fa-xmark" style="cursor:pointer;opacity:0.7;" onclick="removeNoRuleVariable('+i+')"></i>';
      } else {
        html += ' <i class="fa-solid fa-lock" style="opacity:0.6;font-size:10px;" title="固定必选项，不可删除"></i>';
      }
      html += '</span>';
    });
  }
  $('#noRuleFormatArea').html(html);
  initNoRuleDragSort();
}

// 左右移动变量
function moveNoRuleVariable(index, direction) {
  var newIndex = index + direction;
  if (newIndex < 0 || newIndex >= tempNoRuleFormat.length) return;
  var item = tempNoRuleFormat.splice(index, 1)[0];
  tempNoRuleFormat.splice(newIndex, 0, item);
  renderNoRuleFormatArea();
  updateNoRulePreview();
}

// 拖拽排序
var noRuleDragSrcIndex = null;
function initNoRuleDragSort() {
  var tags = document.querySelectorAll('.no-rule-tag');
  tags.forEach(function(tag){
    tag.addEventListener('dragstart', function(e){
      noRuleDragSrcIndex = parseInt(this.getAttribute('data-index'));
      this.style.opacity = '0.4';
      this.style.transform = 'scale(0.95)';
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', noRuleDragSrcIndex);
    });
    tag.addEventListener('dragend', function(e){
      this.style.opacity = '1';
      this.style.transform = 'scale(1)';
      // 移除所有拖拽指示样式
      document.querySelectorAll('.no-rule-tag').forEach(function(t){
        t.style.boxShadow = 'none';
        t.style.transform = 'scale(1)';
      });
    });
    tag.addEventListener('dragover', function(e){
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      this.style.boxShadow = '0 0 0 2px #fff, 0 0 0 4px '+noRuleVarColors[tempNoRuleFormat[parseInt(this.getAttribute('data-index'))]]||'#777';
      this.style.transform = 'scale(1.05)';
    });
    tag.addEventListener('dragleave', function(e){
      this.style.boxShadow = 'none';
      this.style.transform = 'scale(1)';
    });
    tag.addEventListener('drop', function(e){
      e.preventDefault();
      e.stopPropagation();
      this.style.boxShadow = 'none';
      this.style.transform = 'scale(1)';
      var dropIndex = parseInt(this.getAttribute('data-index'));
      if (noRuleDragSrcIndex !== null && noRuleDragSrcIndex !== dropIndex) {
        var item = tempNoRuleFormat.splice(noRuleDragSrcIndex, 1)[0];
        tempNoRuleFormat.splice(dropIndex, 0, item);
        renderNoRuleFormatArea();
        updateNoRulePreview();
      }
      noRuleDragSrcIndex = null;
    });
  });
}

// 渲染变量详细配置
function renderNoRuleVarConfigs() {
  var html = '';
  var hasPrefix = tempNoRuleFormat.indexOf('prefix') >= 0;
  var hasSuffix = tempNoRuleFormat.indexOf('suffix') >= 0;
  var hasDate = tempNoRuleFormat.indexOf('date') >= 0;
  var hasCreateDate = tempNoRuleFormat.indexOf('createDate') >= 0;
  var hasContractDate = tempNoRuleFormat.indexOf('contractDate') >= 0;
  var hasDept = tempNoRuleFormat.indexOf('dept') >= 0;
  var hasType = tempNoRuleFormat.indexOf('type') >= 0;

  if (hasPrefix || hasSuffix || hasDate || hasCreateDate || hasContractDate || hasDept || hasType) {
    html += '<div class="row">';
    if (hasPrefix) {
      html += '<div class="col-md-3"><div class="form-group"><label>前缀内容</label><input type="text" class="form-control" id="noRulePrefixVal" placeholder="如：HT" maxlength="10" onchange="updateNoRulePreview()"></div></div>';
    }
    if (hasSuffix) {
      html += '<div class="col-md-3"><div class="form-group"><label>后缀内容</label><input type="text" class="form-control" id="noRuleSuffixVal" placeholder="如：CN" maxlength="10" onchange="updateNoRulePreview()"></div></div>';
    }
    if (hasDate) {
      html += '<div class="col-md-3"><div class="form-group"><label>日期格式</label><select class="form-control" id="noRuleDateFormat" onchange="updateNoRulePreview()"><option value="YYYY">YYYY（年）</option><option value="YYYYMM">YYYYMM（年月）</option><option value="YYYYMMDD">YYYYMMDD（年月日）</option></select></div></div>';
    }
    if (hasCreateDate) {
      html += '<div class="col-md-3"><div class="form-group"><label>创建日期格式</label><select class="form-control" id="noRuleCreateDateFormat" onchange="updateNoRulePreview()"><option value="YYYY">YYYY（年）</option><option value="YYYYMM">YYYYMM（年月）</option><option value="YYYYMMDD">YYYYMMDD（年月日）</option></select></div></div>';
    }
    if (hasContractDate) {
      html += '<div class="col-md-3"><div class="form-group"><label>合同日期格式</label><select class="form-control" id="noRuleContractDateFormat" onchange="updateNoRulePreview()"><option value="YYYY">YYYY（年）</option><option value="YYYYMM">YYYYMM（年月）</option><option value="YYYYMMDD">YYYYMMDD（年月日）</option></select></div></div>';
    }
    if (hasDept) {
      html += '<div class="col-md-3"><div class="form-group"><label>部门编码</label><select class="form-control" id="noRuleDeptCode" onchange="updateNoRulePreview()"><option value="auto">自动取部门编码</option><option value="CGB">CGB（采购部）</option><option value="YWB">YWB（运营部）</option><option value="FWB">FWB（法务部）</option><option value="CWB">CWB（财务部）</option><option value="XZB">XZB（行政部）</option><option value="ITB">ITB（IT部）</option></select></div></div>';
    }
    if (hasType) {
      html += '<div class="col-md-3"><div class="form-group"><label>类型编码</label><input type="text" class="form-control" id="noRuleTypeCode" placeholder="如：CG" maxlength="6" onchange="updateNoRulePreview()"></div></div>';
    }
    html += '</div>';
  }
  $('#noRuleVarConfigs').html(html);
}

// 更新实时预览
function updateNoRulePreview() {
  if (tempNoRuleFormat.length === 0) {
    $('#noRulePreview').text('—');
    return;
  }
  var sep = $('#noRuleSeparator').val() || '';
  var seqLen = parseInt($('#noRuleSeqLen').val()) || 4;
  var seqStart = parseInt($('#noRuleSeqStart').val()) || 1;
  var parts = [];
  tempNoRuleFormat.forEach(function(v){
    if (v === 'prefix') {
      var val = $('#noRulePrefixVal').val() || 'XX';
      parts.push(val);
    } else if (v === 'suffix') {
      var val = $('#noRuleSuffixVal').val() || 'XX';
      parts.push(val);
    } else if (v === 'date') {
      var fmt = $('#noRuleDateFormat').val() || 'YYYY';
      if (fmt === 'YYYY') parts.push('2026');
      else if (fmt === 'YYYYMM') parts.push('202605');
      else if (fmt === 'YYYYMMDD') parts.push('20260515');
    } else if (v === 'createDate') {
      var fmt = $('#noRuleCreateDateFormat').val() || 'YYYYMMDD';
      if (fmt === 'YYYY') parts.push('2026');
      else if (fmt === 'YYYYMM') parts.push('202605');
      else if (fmt === 'YYYYMMDD') parts.push('20260515');
    } else if (v === 'contractDate') {
      var fmt = $('#noRuleContractDateFormat').val() || 'YYYYMMDD';
      if (fmt === 'YYYY') parts.push('2026');
      else if (fmt === 'YYYYMM') parts.push('202605');
      else if (fmt === 'YYYYMMDD') parts.push('20260520');
    } else if (v === 'dept') {
      var dept = $('#noRuleDeptCode').val() || 'auto';
      parts.push(dept === 'auto' ? 'CGB' : dept);
    } else if (v === 'type') {
      parts.push($('#noRuleTypeCode').val() || 'XX');
    } else if (v === 'seq') {
      parts.push(String(seqStart).padStart(seqLen, '0'));
    }
  });
  $('#noRulePreview').text(parts.join(sep));
}

// 保存规则
function saveNoRule() {
  var name = $('#noRuleName').val().trim();
  var contractType = $('#noRuleContractType').val();
  if (!name) { alert('请输入规则名称'); return; }
  if (!contractType) { alert('请选择适用合同类型'); return; }
  if (tempNoRuleFormat.length === 0) { alert('请至少添加一个编号组成变量'); return; }

  var ruleData = {
    name: name,
    contractType: contractType,
    format: tempNoRuleFormat.slice(),
    prefix: $('#noRulePrefixVal').val() || '',
    suffix: $('#noRuleSuffixVal').val() || '',
    dateFormat: $('#noRuleDateFormat').val() || 'YYYY',
    createDateFormat: $('#noRuleCreateDateFormat').val() || 'YYYYMMDD',
    contractDateFormat: $('#noRuleContractDateFormat').val() || 'YYYYMMDD',
    deptCode: $('#noRuleDeptCode').val() || 'auto',
    typeCode: $('#noRuleTypeCode').val() || '',
    seqLen: parseInt($('#noRuleSeqLen').val()) || 4,
    seqStart: parseInt($('#noRuleSeqStart').val()) || 1,
    separator: $('#noRuleSeparator').val(),
    remark: $('#noRuleRemark').val()
  };

  var editId = $('#noRuleEditId').val();
  if (editId) {
    var idx = noRules.findIndex(function(r){ return r.id === parseInt(editId); });
    if (idx >= 0) {
      Object.assign(noRules[idx], ruleData);
    }
  } else {
    ruleData.id = noRuleNextId++;
    ruleData.currentSeq = ruleData.seqStart;
    ruleData.status = 'enabled';
    noRules.push(ruleData);
  }

  $('#modalNoRule').modal('hide');
  renderNoRuleTable();
}

// 切换规则状态
function toggleNoRuleStatus(id) {
  var rule = noRules.find(function(r){ return r.id === id; });
  if (!rule) return;
  rule.status = rule.status === 'enabled' ? 'disabled' : 'enabled';
  renderNoRuleTable();
}

// 预览生成编号
function previewNoRuleGenerate(id) {
  var rule = noRules.find(function(r){ return r.id === id; });
  if (!rule) return;
  var samples = [];
  for (var i = 0; i < 5; i++) {
    var seq = rule.currentSeq + i;
    var parts = [];
    rule.format.forEach(function(v){
      if (v === 'prefix') parts.push(rule.prefix || 'XX');
      else if (v === 'date') {
        var d = rule.dateFormat || 'YYYY';
        if (d === 'YYYY') parts.push('2026');
        else if (d === 'YYYYMM') parts.push('202605');
        else if (d === 'YYYYMMDD') parts.push('20260515');
      }
      else if (v === 'createDate') {
        var d = rule.createDateFormat || 'YYYYMMDD';
        if (d === 'YYYY') parts.push('2026');
        else if (d === 'YYYYMM') parts.push('202605');
        else if (d === 'YYYYMMDD') parts.push('20260515');
      }
      else if (v === 'contractDate') {
        var d = rule.contractDateFormat || 'YYYYMMDD';
        if (d === 'YYYY') parts.push('2026');
        else if (d === 'YYYYMM') parts.push('202605');
        else if (d === 'YYYYMMDD') parts.push('20260520');
      }
      else if (v === 'dept') parts.push(rule.deptCode === 'auto' ? 'CGB' : (rule.deptCode || 'XX'));
      else if (v === 'type') parts.push(rule.typeCode || 'XX');
      else if (v === 'seq') parts.push(String(seq).padStart(rule.seqLen, '0'));
      else if (v === 'suffix') parts.push(rule.suffix || 'XX');
    });
    samples.push(parts.join(rule.separator || ''));
  }
  var msg = '规则：' + rule.name + '\n\n接下来5个编号预览：\n' + samples.join('\n');
  alert(msg);
}

// 删除规则
function deleteNoRule(id) {
  if (!confirm('确定要删除此编号规则吗？删除后不可恢复。')) return;
  noRules = noRules.filter(function(r){ return r.id !== id; });
  renderNoRuleTable();
}
