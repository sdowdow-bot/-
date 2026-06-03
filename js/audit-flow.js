// ==================== 审核流程配置 ====================
function renderFlowTable() {
  let html = '';
  if (auditFlows.length === 0) {
    html = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999;">暂无流程模板，请新建</td></tr>';
  } else {
    auditFlows.forEach(function(flow, idx){
      var detailHtml = '';
      var nodes = flow.nodes || [];
      if (nodes.length > 0) {
        detailHtml = nodes.map(function(n, i){
          var hNames = (n.handlers && n.handlers.length > 0) ? n.handlers.join('、') : '未指定';
          var typeLabel = n.approveType === 'countersign' ? '<span style="color:#2E7D32;font-size:10px;">[会签]</span>' : '<span style="color:#E65100;font-size:10px;">[或签]</span>';
          return '<span style="display:inline-block;background:#E8F4FD;padding:2px 8px;border-radius:10px;font-size:11px;margin:2px;">'+(i+1)+'. '+n.name+' '+typeLabel+' <small>('+hNames+')</small></span>';
        }).join('<i class="fa-solid fa-arrow-right" style="color:#999;font-size:10px;margin:0 2px;"></i>');
      } else {
        detailHtml = '<span class="text-muted">未配置节点</span>';
      }

      let ccHtml = flow.ccMembers.length > 0 ? flow.ccMembers.join('、') : '<span class="text-muted">无</span>';
      let statusHtml = '<label class="toggle-switch" onclick="toggleFlow('+flow.id+')"><input type="checkbox" '+(flow.status==='enabled'?'checked':'')+'><span class="toggle-slider"></span></label>';

      // 金额条件触发
      var opLabels = { gt: '>', gte: '≥', lt: '<', lte: '≤' };
      var amountHtml = '';
      if (flow.amountCondType === 'fixed' && flow.amountFixedValue !== null && flow.amountFixedValue !== undefined) {
        amountHtml = '<span style="color:var(--fa-primary);font-weight:500;"><i class="fa-solid fa-coins" style="margin-right:4px;"></i>金额 ' + (opLabels[flow.amountFixedOp] || '≥') + ' ¥' + flow.amountFixedValue.toLocaleString() + '</span>';
      } else if (flow.amountCondType === 'range') {
        var minOp = opLabels[flow.amountRangeMinOp] || '≥';
        var maxOp = opLabels[flow.amountRangeMaxOp] || '<';
        var minVal = (flow.amountRangeMin !== null && flow.amountRangeMin !== undefined) ? '¥' + flow.amountRangeMin.toLocaleString() : '—';
        var maxVal = (flow.amountRangeMax !== null && flow.amountRangeMax !== undefined) ? '¥' + flow.amountRangeMax.toLocaleString() : '—';
        amountHtml = '<span style="color:var(--fa-warning);font-weight:500;"><i class="fa-solid fa-coins" style="margin-right:4px;"></i>' + minVal + ' ' + minOp + ' 金额 ' + maxOp + ' ' + maxVal + '</span>';
      } else {
        amountHtml = '<span style="color:#999;">不限金额</span>';
      }
      html += '<tr>';
      html += '<td>'+(idx+1)+'</td>';
      html += '<td><strong>'+flow.name+'</strong></td>';
      html += '<td>'+flow.contractType+'</td>';
      html += '<td>'+amountHtml+'</td>';
      html += '<td style="max-width:400px;">'+detailHtml+'</td>';
      html += '<td>'+ccHtml+'</td>';
      html += '<td>'+statusHtml+'</td>';
      html += '<td>';
      html += '<button class="btn btn-xs btn-primary" onclick="editFlow('+flow.id+')"><i class="fa-solid fa-edit"></i></button> ';
      html += '<button class="btn btn-xs btn-info" onclick="copyFlow('+flow.id+')"><i class="fa-solid fa-copy"></i></button> ';
      html += '<button class="btn btn-xs btn-warning" onclick="toggleFlow('+flow.id+')"><i class="fa-solid fa-power-off"></i></button> ';
      html += '<button class="btn btn-xs btn-danger" onclick="deleteFlow('+flow.id+')"><i class="fa-solid fa-trash-can"></i></button>';
      html += '</td>';
      html += '</tr>';
    });
  }
  $('#flowTableBody').html(html);
  $('#flowCount').text(auditFlows.length);
}

function onFlowAmountCondTypeChange() {
  var condType = $('#flowAmountCondType').val();
  $('#flowAmountFixedSection').toggle(condType === 'fixed');
  $('#flowAmountRangeSection').toggle(condType === 'range');
  updateFlowAmountPreview();
}

function updateFlowAmountPreview() {
  // 预览已移除，此函数保留为空以兼容调用
}

function openCreateFlow() {
  editingFlowId = null;
  tempFlowNodes = [
    { order: 1, name: '部门负责人审批', approveType: 'or-sign', handlers: [] },
    { order: 2, name: '法务审核', approveType: 'or-sign', handlers: [] },
    { order: 3, name: '总经理审批', approveType: 'or-sign', handlers: [] }
  ];
  $('#flowConfigTitle').html('<i class="fa-solid fa-sliders"></i> 新建审核流程');
  $('#flowName').val('');
  $('#flowContractType').val('采购合同');
  $('#flowAmountCondType').val('');
  $('#flowAmountFixedOp').val('gte');
  $('#flowAmountFixedValue').val('');
  $('#flowAmountRangeMinOp').val('gte');
  $('#flowAmountRangeMin').val('');
  $('#flowAmountRangeMaxOp').val('lt');
  $('#flowAmountRangeMax').val('');
  $('#flowAmountFixedSection').hide();
  $('#flowAmountRangeSection').hide();
  updateFlowAmountPreview();
  ccSelectedMembers = [];
  $('#ccTagSelect .tag-item').remove();
  $('#ccTagSelect .tag-input').val('');
  $('#flowRemark').val('');
  renderFlowNodes();
  $('#modalFlowConfig').modal('show');
}

function editFlow(id) {
  let flow = auditFlows.find(function(f){ return f.id === id; });
  if (!flow) return;
  editingFlowId = id;
  tempFlowNodes = JSON.parse(JSON.stringify(flow.nodes || []));
  // 确保每个节点有approveType
  tempFlowNodes.forEach(function(n){ if (!n.approveType) n.approveType = 'or-sign'; });
  $('#flowConfigTitle').html('<i class="fa-solid fa-edit"></i> 编辑审核流程 — '+flow.name);
  $('#flowName').val(flow.name);
  $('#flowContractType').val(flow.contractType);
  // 初始化金额条件
  $('#flowAmountCondType').val(flow.amountCondType || '');
  $('#flowAmountFixedOp').val(flow.amountFixedOp || 'gte');
  $('#flowAmountFixedValue').val(flow.amountFixedValue !== null && flow.amountFixedValue !== undefined ? flow.amountFixedValue : '');
  $('#flowAmountRangeMinOp').val(flow.amountRangeMinOp || 'gte');
  $('#flowAmountRangeMin').val(flow.amountRangeMin !== null && flow.amountRangeMin !== undefined ? flow.amountRangeMin : '');
  $('#flowAmountRangeMaxOp').val(flow.amountRangeMaxOp || 'lt');
  $('#flowAmountRangeMax').val(flow.amountRangeMax !== null && flow.amountRangeMax !== undefined ? flow.amountRangeMax : '');
  $('#flowAmountFixedSection').toggle(flow.amountCondType === 'fixed');
  $('#flowAmountRangeSection').toggle(flow.amountCondType === 'range');
  updateFlowAmountPreview();
  // 初始化CC标签
  ccSelectedMembers = JSON.parse(JSON.stringify(flow.ccMembers || []));
  $('#ccTagSelect .tag-item').remove();
  ccSelectedMembers.forEach(function(m){ addCcTag(m); });
  $('#flowRemark').val(flow.remark || '');
  renderFlowNodes();
  $('#modalFlowConfig').modal('show');
}

function renderFlowNodes() {
  var allHandlers = ['王主管（采购部）','李总监（法务部）','赵主管（财务部）','陈总监（运营部）','刘总（总经理）','刘经理（行政部）','董事长','王律师（法务部）','吴会计（财务部）','孙助理（总经办）','周秘书（行政部）'];
  let html = '';
  tempFlowNodes.forEach(function(node, idx){
    var selectedHandlers = node.handlers || (node.handler ? [node.handler] : []);
    var nodeApproveType = node.approveType || 'or-sign';
    html += '<div class="flow-node-row" style="padding:8px 0;border-bottom:1px dotted #DDD;">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">';
    html += '<span style="font-weight:600;color:var(--fa-primary);min-width:24px;">'+(idx+1)+'.</span>';
    html += '<input type="text" class="form-control input-sm" placeholder="节点名称" value="'+node.name+'" onchange="tempFlowNodes['+idx+'].name=this.value" style="flex:1;height:30px;font-size:12px;">';
    html += '<select class="form-control input-sm" onchange="tempFlowNodes['+idx+'].approveType=this.value;onNodeApproveTypeChange('+idx+')" style="width:160px;height:30px;font-size:12px;" id="flowNodeApproveType_'+idx+'">';
    html += '<option value="or-sign"'+(nodeApproveType==='or-sign'?' selected':'')+'>或签（一人同意即可）</option>';
    html += '<option value="countersign"'+(nodeApproveType==='countersign'?' selected':'')+'>会签（须全部同意）</option>';
    html += '</select>';
    if (tempFlowNodes.length > 1) {
      html += '<button class="btn btn-xs btn-danger" onclick="removeFlowNode('+idx+')" title="删除"><i class="fa-solid fa-trash-can"></i></button>';
    }
    html += '</div>';
    html += '<div style="margin-left:32px;">';
    var memberLabel = nodeApproveType === 'countersign' ? '审核人员（可多选，会签须全部同意）' : '审核人员（可多选，或签一人同意即可）';
    html += '<label style="font-size:11px;color:#888;display:block;margin-bottom:2px;">'+memberLabel+'</label>';
    html += '<div class="tag-multi-select" id="flowNodeTags_'+idx+'" data-node-idx="'+idx+'">';
    html += '<input type="text" class="tag-input" placeholder="点击选择审核人..." onfocus="toggleNodeHandlerDropdown('+idx+',true)" onkeyup="filterNodeHandlerOptions('+idx+')" onclick="toggleNodeHandlerDropdown('+idx+',true)">';
    html += '<div class="tag-dropdown" id="flowNodeDropdown_'+idx+'"></div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    if (idx < tempFlowNodes.length - 1) {
      html += '<div style="text-align:center;padding:2px 0;color:#999;"><i class="fa-solid fa-arrow-down"></i></div>';
    }
  });
  $('#flowNodesContainer').html(html);
  // 初始化已选标签
  tempFlowNodes.forEach(function(node, idx){
    var selected = node.handlers || (node.handler ? [node.handler] : []);
    selected.forEach(function(h){ addNodeHandlerTag(idx, h); });
    renderNodeHandlerDropdown(idx, '');
  });
}

function onNodeApproveTypeChange(idx) {
  var type = tempFlowNodes[idx].approveType;
  var labelEl = $('#flowNodeTags_'+idx).closest('div').prev('label');
  if (type === 'countersign') {
    labelEl.text('审核人员（可多选，会签须全部同意）');
  } else {
    labelEl.text('审核人员（可多选，或签一人同意即可）');
  }
}

// 标签组件：节点审核人
function addNodeHandlerTag(idx, name) {
  var container = $('#flowNodeTags_'+idx);
  if (!container.length) return;
  // 避免重复
  if (container.find('.tag-item[data-val="'+name+'"]').length > 0) return;
  var tag = $('<span class="tag-item" data-val="'+name+'">'+name+'<span class="tag-remove" onclick="removeNodeHandlerTag('+idx+',\''+name+'\')">&times;</span></span>');
  container.find('.tag-input').before(tag);
  updateNodeHandlersArray(idx);
}

function removeNodeHandlerTag(idx, name) {
  $('#flowNodeTags_'+idx).find('.tag-item[data-val="'+name+'"]').remove();
  updateNodeHandlersArray(idx);
  renderNodeHandlerDropdown(idx, $('#flowNodeTags_'+idx).find('.tag-input').val());
}

function updateNodeHandlersArray(idx) {
  var handlers = [];
  $('#flowNodeTags_'+idx).find('.tag-item').each(function(){ handlers.push($(this).data('val')); });
  tempFlowNodes[idx].handlers = handlers;
}

function toggleNodeHandlerDropdown(idx, show) {
  var dd = $('#flowNodeDropdown_'+idx);
  if (show) {
    renderNodeHandlerDropdown(idx, '');
    dd.addClass('show');
  } else {
    setTimeout(function(){ dd.removeClass('show'); }, 200);
  }
}

function filterNodeHandlerOptions(idx) {
  var kw = $('#flowNodeTags_'+idx).find('.tag-input').val().toLowerCase();
  renderNodeHandlerDropdown(idx, kw);
  $('#flowNodeDropdown_'+idx).addClass('show');
}

function renderNodeHandlerDropdown(idx, keyword) {
  var allHandlers = ['王主管（采购部）','李总监（法务部）','赵主管（财务部）','陈总监（运营部）','刘总（总经理）','刘经理（行政部）','董事长','王律师（法务部）','吴会计（财务部）','孙助理（总经办）','周秘书（行政部）'];
  var selected = tempFlowNodes[idx].handlers || [];
  var dd = $('#flowNodeDropdown_'+idx);
  var html = '';
  var filtered = allHandlers.filter(function(h){ return !keyword || h.toLowerCase().indexOf(keyword) >= 0; });
  if (filtered.length === 0) {
    html = '<div class="tag-option" style="color:#999;">无匹配成员</div>';
  } else {
    filtered.forEach(function(h){
      var isSel = selected.indexOf(h) >= 0;
      html += '<div class="tag-option'+(isSel?' selected':'')+'" onclick="event.stopPropagation();addNodeHandlerTag('+idx+',\''+h+'\');renderNodeHandlerDropdown('+idx+',\'\');$(\'#flowNodeTags_'+idx+'\').find(\'.tag-input\').val(\'\').focus();$(\'#flowNodeDropdown_'+idx+'\').addClass(\'show\');">'+h+(isSel?' <i class="fa-solid fa-check" style="float:right;color:var(--fa-success);"></i>':'')+'</div>';
    });
  }
  dd.html(html);
}

// 更新多选审核人（保留兼容）
function updateFlowNodeHandlers(idx, selectEl) {
  var selected = [];
  for (var i = 0; i < selectEl.options.length; i++) {
    if (selectEl.options[i].selected) selected.push(selectEl.options[i].value);
  }
  tempFlowNodes[idx].handlers = selected;
}

function addFlowNode() {
  tempFlowNodes.push({
    order: tempFlowNodes.length + 1,
    name: '新增审核节点',
    approveType: 'or-sign',
    handlers: []
  });
  renderFlowNodes();
}

function removeFlowNode(idx) {
  if (tempFlowNodes.length <= 1) { alert('至少保留一个审核节点'); return; }
  tempFlowNodes.splice(idx, 1);
  tempFlowNodes.forEach(function(n, i){ n.order = i + 1; });
  renderFlowNodes();
}

function saveFlowConfig() {
  let name = $('#flowName').val().trim();
  if (!name) { alert('请输入流程名称'); return; }
  if (tempFlowNodes.length === 0) { alert('请至少添加一个审核节点'); return; }
  let hasEmpty = tempFlowNodes.some(function(n){ return !n.handlers || n.handlers.length === 0 || !n.name; });
  if (hasEmpty) { alert('请完善所有审核节点信息（名称和审核人必填）'); return; }

  let ccMembers = ccSelectedMembers.slice(0);

  if (editingFlowId) {
    let flow = auditFlows.find(function(f){ return f.id === editingFlowId; });
    if (flow) {
      flow.name = name;
      flow.contractType = $('#flowContractType').val();
      flow.amountCondType = $('#flowAmountCondType').val() || '';
      flow.amountFixedOp = $('#flowAmountFixedOp').val() || 'gte';
      flow.amountFixedValue = $('#flowAmountFixedValue').val() !== '' ? parseFloat($('#flowAmountFixedValue').val()) : null;
      flow.amountRangeMinOp = $('#flowAmountRangeMinOp').val() || 'gte';
      flow.amountRangeMin = $('#flowAmountRangeMin').val() !== '' ? parseFloat($('#flowAmountRangeMin').val()) : null;
      flow.amountRangeMaxOp = $('#flowAmountRangeMaxOp').val() || 'lt';
      flow.amountRangeMax = $('#flowAmountRangeMax').val() !== '' ? parseFloat($('#flowAmountRangeMax').val()) : null;
      flow.nodes = JSON.parse(JSON.stringify(tempFlowNodes));
      flow.ccMembers = ccMembers;
      flow.remark = $('#flowRemark').val();
    }
  } else {
    let newId = auditFlows.length > 0 ? Math.max.apply(null, auditFlows.map(function(f){ return f.id; })) + 1 : 1;
    var newFlow = {
      id: newId,
      name: name,
      contractType: $('#flowContractType').val(),
      amountCondType: $('#flowAmountCondType').val() || '',
      amountFixedOp: $('#flowAmountFixedOp').val() || 'gte',
      amountFixedValue: $('#flowAmountFixedValue').val() !== '' ? parseFloat($('#flowAmountFixedValue').val()) : null,
      amountRangeMinOp: $('#flowAmountRangeMinOp').val() || 'gte',
      amountRangeMin: $('#flowAmountRangeMin').val() !== '' ? parseFloat($('#flowAmountRangeMin').val()) : null,
      amountRangeMaxOp: $('#flowAmountRangeMaxOp').val() || 'lt',
      amountRangeMax: $('#flowAmountRangeMax').val() !== '' ? parseFloat($('#flowAmountRangeMax').val()) : null,
      nodes: JSON.parse(JSON.stringify(tempFlowNodes)),
      ccMembers: ccMembers,
      status: 'enabled',
      remark: $('#flowRemark').val()
    };
    auditFlows.push(newFlow);
  }

  $('#modalFlowConfig').modal('hide');
  renderFlowTable();
  alert(editingFlowId ? '流程已更新！' : '新流程已创建！');
  editingFlowId = null;
}

function deleteFlow(id) {
  if (!confirm('确认删除该审核流程吗？')) return;
  auditFlows = auditFlows.filter(function(f){ return f.id !== id; });
  renderFlowTable();
}

function toggleFlow(id) {
  let flow = auditFlows.find(function(f){ return f.id === id; });
  if (!flow) return;
  flow.status = flow.status === 'enabled' ? 'disabled' : 'enabled';
  renderFlowTable();
}

function copyFlow(id) {
  let flow = auditFlows.find(function(f){ return f.id === id; });
  if (!flow) return;
  let newId = auditFlows.length > 0 ? Math.max.apply(null, auditFlows.map(function(f){ return f.id; })) + 1 : 1;
  var newFlow = {
    id: newId,
    name: flow.name + '（副本）',
    contractType: flow.contractType,
    amountCondType: flow.amountCondType || '',
    amountFixedOp: flow.amountFixedOp || 'gte',
    amountFixedValue: flow.amountFixedValue !== undefined ? flow.amountFixedValue : null,
    amountRangeMinOp: flow.amountRangeMinOp || 'gte',
    amountRangeMin: flow.amountRangeMin !== undefined ? flow.amountRangeMin : null,
    amountRangeMaxOp: flow.amountRangeMaxOp || 'lt',
    amountRangeMax: flow.amountRangeMax !== undefined ? flow.amountRangeMax : null,
    nodes: JSON.parse(JSON.stringify(flow.nodes || [])),
    ccMembers: JSON.parse(JSON.stringify(flow.ccMembers)),
    status: 'enabled',
    remark: flow.remark
  };
  auditFlows.push(newFlow);
  renderFlowTable();
  alert('流程已复制！');
}

function refreshFlowList() {
  renderFlowTable();
}

// 判断金额是否满足条件
function checkAmountCondition(amount, op, threshold) {
  if (threshold === null || threshold === undefined) return true;
  if (op === 'gt') return amount > threshold;
  if (op === 'gte') return amount >= threshold;
  if (op === 'lt') return amount < threshold;
  if (op === 'lte') return amount <= threshold;
  return true;
}

// 根据合同金额和类型自动匹配审核流程
function matchAuditFlow(contractType, amount) {
  // 优先匹配有金额条件且启用的流程
  var matched = null;
  var fallback = null;
  auditFlows.forEach(function(flow) {
    if (flow.status !== 'enabled') return;
    // 检查合同类型是否匹配
    if (flow.contractType !== contractType && flow.contractType !== '全部类型') return;
    // 检查金额条件
    var amountOk = true;
    var hasAmountCond = false;
    if (flow.amountCondType === 'fixed' && flow.amountFixedValue !== null && flow.amountFixedValue !== undefined) {
      hasAmountCond = true;
      amountOk = checkAmountCondition(amount, flow.amountFixedOp, flow.amountFixedValue);
    } else if (flow.amountCondType === 'range') {
      var minOk = checkAmountCondition(amount, flow.amountRangeMinOp, flow.amountRangeMin);
      var maxOk = checkAmountCondition(amount, flow.amountRangeMaxOp, flow.amountRangeMax);
      if (flow.amountRangeMin !== null && flow.amountRangeMin !== undefined || flow.amountRangeMax !== null && flow.amountRangeMax !== undefined) {
        hasAmountCond = true;
      }
      amountOk = minOk && maxOk;
    }
    if (amountOk) {
      if (hasAmountCond) {
        if (!matched) matched = flow;
      } else {
        if (!fallback) fallback = flow;
      }
    }
  });
  return matched || fallback;
}
