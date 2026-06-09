// ==================== 合同审批 ====================
function getApprovalContracts() {
  return contracts.filter(function(c){ return c.auditStatus === 'pending'; });
}

function renderContractApprovalTable(list) {
  if (!list) list = getApprovalContracts();
  let html = '';
  if (list.length === 0) {
    html = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#999;"><i class="fa-solid fa-clipboard-check" style="font-size:40px;display:block;margin-bottom:10px;color:var(--fa-success);"></i>暂无审核中的合同</td></tr>';
  } else {
    list.forEach(function(c){
      // 匹配待我审核数据获取紧急程度
      let auditItem = myAuditList.find(function(m){ return m.contractId === c.id; });
      let urgency = auditItem ? auditItem.urgency : '普通';
      let urgencyClass = '';
      if (urgency === '紧急') { urgencyClass = 'status-badge status-approving'; }
      else if (urgency === '超时') { urgencyClass = 'status-badge status-rejected'; }
      else { urgencyClass = 'status-badge status-pending'; }

      html += '<tr>';
      html += '<td><input type="checkbox" class="approval-check-item" value="'+c.id+'"></td>';
      html += '<td><a href="#" onclick="openContractDetail('+c.id+',true)" style="color:var(--fa-primary);font-weight:500;">'+c.no+'</a></td>';
      html += '<td>'+c.name+'</td>';
      html += '<td>'+(c.category||c.type||'—')+'</td>';
      html += '<td>'+(c.handler||'—')+'</td>';
      html += '<td>'+(c.currentNode||'—')+'</td>';
      html += '<td>'+c.createTime+'</td>';
      html += '<td><span class="'+urgencyClass+'">'+urgency+'</span></td>';
      html += '<td>';
      html += '<button class="btn btn-xs btn-primary" onclick="openContractDetail('+c.id+',true)" title="审核"><i class="fa-solid fa-gavel"></i> 审核</button> ';
      html += '<button class="btn btn-xs btn-warning" onclick="auditTransfer('+c.id+')" title="转办"><i class="fa-solid fa-share"></i> 转办</button> ';
      html += '<button class="btn btn-xs btn-default" onclick="viewAuditRecord('+c.id+')" title="审核记录"><i class="fa-solid fa-clock-rotate-left"></i> 审核记录</button>';
      html += '</td>';
      html += '</tr>';
    });
  }
  $('#contractApprovalTableBody').html(html);
  $('#contractApprovalTotal').text(list.length);
  $('#approvalPendingCount').text(list.length);
  $('#approvalPageTotal').text(list.length);
  $('#approvalPageEnd').text(list.length);
  $('#badgeContractApproval').text(list.length);
  $('#approvalCheckAll').prop('checked', false);
}

function refreshContractApproval() {
  renderContractApprovalTable();
}

function applyContractApprovalFilter() {
  let no = $('#approvalSearchNo').val().toLowerCase();
  let name = $('#approvalSearchName').val().toLowerCase();
  let node = $('#approvalSearchNode').val();
  let urgency = $('#approvalSearchUrgency').val();
  let list = getApprovalContracts();
  let filtered = list.filter(function(c){
    if (no && c.no.toLowerCase().indexOf(no) === -1) return false;
    if (name && c.name.toLowerCase().indexOf(name) === -1) return false;
    if (node && c.currentNode !== node) return false;
    if (urgency) {
      let auditItem = myAuditList.find(function(m){ return m.contractId === c.id; });
      let itemUrgency = auditItem ? auditItem.urgency : '普通';
      if (itemUrgency !== urgency) return false;
    }
    return true;
  });
  renderContractApprovalTable(filtered);
}

function resetContractApprovalFilter() {
  $('#approvalSearchNo').val('');
  $('#approvalSearchName').val('');
  $('#approvalSearchNode').val('');
  $('#approvalSearchUrgency').val('');
  renderContractApprovalTable();
}

function toggleApprovalCheckAll() {
  let checked = $('#approvalCheckAll').prop('checked');
  $('.approval-check-item').prop('checked', checked);
}

function batchApprovalPass() {
  let checkedIds = [];
  $('.approval-check-item:checked').each(function(){ checkedIds.push(parseInt($(this).val())); });
  if (checkedIds.length === 0) { alert('请选择要批量通过的合同'); return; }
  if (!confirm('确认批量通过选中的 '+checkedIds.length+' 条合同？')) return;
  checkedIds.forEach(function(id){
    let c = contracts.find(function(item){ return item.id === id; });
    if (c) {
      c.status = 'approved';
      c.auditStatus = 'approved';
      c.currentNode = '待推送用印签署';
      c.progress = 100;
    }
  });
  renderContractApprovalTable();
  renderContractTable(contracts);
  alert('已批量通过 '+checkedIds.length+' 条合同');
}

function batchApprovalReject() {
  let checkedIds = [];
  $('.approval-check-item:checked').each(function(){ checkedIds.push(parseInt($(this).val())); });
  if (checkedIds.length === 0) { alert('请选择要批量驳回的合同'); return; }
  if (!confirm('确认批量驳回选中的 '+checkedIds.length+' 条合同？')) return;
  checkedIds.forEach(function(id){
    let c = contracts.find(function(item){ return item.id === id; });
    if (c) {
      c.status = 'rejected';
      c.auditStatus = 'rejected';
      c.currentNode = '已驳回';
    }
  });
  renderContractApprovalTable();
  renderContractTable(contracts);
  alert('已批量驳回 '+checkedIds.length+' 条合同');
}

// ==================== 待我审核 ====================
function renderMyAuditTable(list) {
  let html = '';
  if (list.length === 0) {
    html = '<tr><td colspan="10" style="text-align:center;padding:40px;color:#999;"><i class="fa-solid fa-check-circle" style="font-size:40px;display:block;margin-bottom:10px;color:var(--fa-success);"></i>暂无待审核记录</td></tr>';
  } else {
    list.forEach(function(item, idx){
      let urgencyClass = '';
      let urgencyLabel = item.urgency;
      if (item.urgency === '紧急') { urgencyClass = 'status-badge status-approving'; }
      else if (item.urgency === '超时') { urgencyClass = 'status-badge status-rejected'; }
      else { urgencyClass = 'status-badge status-pending'; }

      html += '<tr>';
      html += '<td><input type="checkbox" class="my-audit-check-item" value="'+item.contractId+'"></td>';
      html += '<td><a href="#" onclick="openContractDetail('+item.contractId+',true)" style="color:var(--fa-primary);font-weight:500;">'+item.no+'</a></td>';
      html += '<td>'+item.name+'</td>';
      html += '<td>'+item.type+'</td>';
      html += '<td>'+item.initiator+'</td>';
      html += '<td>'+item.currentNode+'</td>';
      html += '<td>'+item.submitTime+'</td>';
      html += '<td><span class="'+urgencyClass+'">'+urgencyLabel+'</span></td>';
      html += '<td>';
      html += '<button class="btn btn-xs btn-primary" onclick="openContractDetail('+item.contractId+',true)" title="审核"><i class="fa-solid fa-gavel"></i> 审核</button> ';
      html += '<button class="btn btn-xs btn-warning" onclick="auditTransfer('+item.contractId+')" title="转办"><i class="fa-solid fa-share"></i> 转办</button> ';
      html += '<button class="btn btn-xs btn-default" onclick="viewAuditRecord('+item.contractId+')" title="查看审核记录"><i class="fa-solid fa-clock-rotate-left"></i> 审核记录</button>';
      html += '</td>';
      html += '</tr>';
    });
  }
  $('#myAuditTableBody').html(html);
  $('#myAuditTotal').text(list.length);
  $('#myAuditPageTotal').text(list.length);
  let overdue = list.filter(function(i){ return i.urgency === '超时'; }).length;
  $('#overdueCount').text(overdue);
  $('#badgeMyAudit').text(list.length);
}

function getTimeLeft(deadline) {
  let now = new Date();
  let dl = new Date(deadline);
  let diff = dl - now;
  if (diff < 0) return '已超时 ' + Math.ceil(Math.abs(diff)/(1000*3600)) + ' 小时';
  let hours = Math.floor(diff/(1000*3600));
  let days = Math.floor(hours/24);
  hours = hours % 24;
  if (days > 0) return days + '天' + hours + '小时';
  return hours + '小时';
}

// 详情页审核通过
function detailAuditPass() {
  if (!currentContractId) return;
  auditPass(currentContractId);
  backToMyAudit();
}

// 详情页审核驳回
function detailAuditReject() {
  if (!currentContractId) return;
  let rejectId = currentContractId;
  openRejectModal();
  let origConfirmReject = confirmReject;
  confirmReject = function() {
    origConfirmReject();
    myAuditList = myAuditList.filter(function(m){ return m.contractId !== rejectId; });
    renderMyAuditTable(myAuditList);
    backToMyAudit();
  };
}

// 返回待我审核列表
function backToMyAudit() {
  $('#pageContractDetail').hide();
  $('#auditBottomBar').hide();
  $('#pageMyAudit').show();
  $('#breadcrumbCurrent').text('待我审核');
  window.scrollTo(0, 0);
}

function auditPass(contractId) {
  let item = myAuditList.find(function(m){ return m.contractId === contractId; });
  if (!item) return;
  let c = contracts.find(function(c){ return c.id === contractId; });
  if (c) {
    c.status = 'approved';
    c.currentNode = '待推送用印签署';
    c.progress = 100;
    if (!approvalHistories[contractId]) approvalHistories[contractId] = [];
    approvalHistories[contractId].push({
      user: '当前用户', dept: '', action: '审批通过（待我审核）', actionType: 'approve',
      time: new Date().toLocaleString('zh-CN'), opinion: '同意，审核通过。'
    });
  }
  myAuditList = myAuditList.filter(function(m){ return m.contractId !== contractId; });
  renderMyAuditTable(myAuditList);
  alert('已通过合同 ' + item.no);
}

function auditReject(contractId) {
  currentContractId = contractId;
  openRejectModal();
  // 在驳回确认后也从待审列表中移除
  let origConfirmReject = confirmReject;
  confirmReject = function() {
    origConfirmReject();
    myAuditList = myAuditList.filter(function(m){ return m.contractId !== contractId; });
    renderMyAuditTable(myAuditList);
  };
}

function auditTransfer(contractId) {
  currentContractId = contractId;
  openTransferModal();
}

function applyMyAuditFilter() {
  let node = $('#myAuditSearchNode').val();
  let urgency = $('#myAuditSearchUrgency').val();
  let name = $('#myAuditSearchName').val().toLowerCase();
  let no = $('#myAuditSearchNo').val().toLowerCase();
  let filtered = myAuditList.filter(function(item){
    if (node && item.currentNode !== node) return false;
    if (urgency && item.urgency !== urgency) return false;
    if (name && item.name.toLowerCase().indexOf(name) === -1) return false;
    if (no && item.no.toLowerCase().indexOf(no) === -1) return false;
    return true;
  });
  renderMyAuditTable(filtered);
}

function resetMyAuditFilter() {
  $('#myAuditSearchNode').val('');
  $('#myAuditSearchUrgency').val('');
  $('#myAuditSearchName').val('');
  $('#myAuditSearchNo').val('');
  renderMyAuditTable(myAuditList);
}

function toggleMyAuditCheckAll() {
  let checked = $('#myAuditCheckAll').prop('checked');
  $('.my-audit-check-item').prop('checked', checked);
}

function refreshMyAudit() {
  renderMyAuditTable(myAuditList);
}

// ==================== 抄送标签多选 ====================
var ccAllMembers = ['周秘书（行政部）','吴会计（财务部）','孙助理（总经办）','王律师（法务部）','赵主管（财务部）','陈总监（运营部）','刘经理（行政部）'];
var ccSelectedMembers = [];
var countersignSelectedMembers = [];
var countersignAllMembers = ['王主管（采购部）','李总监（法务部）','赵主管（财务部）','陈总监（运营部）','刘总（总经理）','刘经理（行政部）','董事长','王律师（法务部）','吴会计（财务部）','孙助理（总经办）','周秘书（行政部）'];
