// ==================== 合同列表渲染 ====================
function renderContractTable(list) {
  let html = '';
  if (list.length === 0) {
    html = '<tr><td colspan="32" style="text-align:center;padding:40px;color:#999;"><i class="fa-solid fa-inbox" style="font-size:40px;display:block;margin-bottom:10px;"></i>暂无数据</td></tr>';
  } else {
    list.forEach(function(c){
      html += '<tr>';
      html += '<td class="fixed-col fixed-col-left-0"><input type="checkbox" class="check-item" value="'+c.id+'"></td>';
      html += '<td class="fixed-col fixed-col-left-1">'+c.id+'</td>';
      html += '<td class="fixed-col fixed-col-left-2"><a href="#" onclick="openContractDetail('+c.id+')" style="color:var(--fa-primary);font-weight:500;">'+c.name+'</a></td>';
      html += '<td>'+c.no+'</td>';
      html += '<td>'+(c.subject||'—')+'</td>';
      html += '<td>'+(c.category||c.type||'—')+'</td>';
      html += '<td><span class="status-badge '+STATUS_CLASS[c.status]+'">'+STATUS_LABEL[c.status]+'</span></td>';
      html += '<td>'+(c.termType||'—')+'</td>';
      html += '<td>'+(c.validDate||'—')+'</td>';
      html += '<td>'+c.signDate+'</td>';
      html += '<td>'+(c.direction||'—')+'</td>';
      html += '<td>'+(c.pricingMethod||'—')+'</td>';
      html += '<td>'+(c.handler||'—')+'</td>';
      html += '<td style="text-align:right;">'+c.amount.toLocaleString('zh-CN', {minimumFractionDigits:2})+'</td>';
      // 计算已开票金额
      let invoiced = invoiceData.filter(i => i.contractId === c.id).reduce((s, i) => s + i.totalAmount, 0);
      let diff = c.amount - invoiced;
      let invoicedHtml = invoiced > 0 ? '¥ '+invoiced.toLocaleString('zh-CN', {minimumFractionDigits:2}) : '<span style="color:#CCC;">—</span>';
      let diffColor = diff > 0 ? 'var(--fa-warning)' : (diff < 0 ? 'var(--fa-danger)' : 'var(--fa-success)');
      let diffHtml = invoiced > 0 ? '<span style="color:'+diffColor+';font-weight:600;">¥ '+diff.toLocaleString('zh-CN', {minimumFractionDigits:2})+'</span>' : '<span style="color:#CCC;">—</span>';
      html += '<td style="text-align:right;">'+invoicedHtml+'</td>';
      html += '<td style="text-align:right;">'+diffHtml+'</td>';
      html += '<td>'+(c.currency||'CNY')+'</td>';
      html += '<td>'+(c.signDept||'—')+'</td>';
      html += '<td>'+(c.performPlace||'—')+'</td>';
      html += '<td title="'+(c.summary||'')+'">'+((c.summary&&c.summary.length>10)?c.summary.substring(0,10)+'…':(c.summary||'—'))+'</td>';
      html += '<td>'+(c.counterParty||c.partyB||'—')+'</td>';
      html += '<td>'+(c.counterContact||'—')+'</td>';
      html += '<td>'+(c.counterPhone||'—')+'</td>';
      html += '<td title="'+(c.counterAddress||'')+'">'+((c.counterAddress&&c.counterAddress.length>8)?c.counterAddress.substring(0,8)+'…':(c.counterAddress||'—'))+'</td>';
      html += '<td>'+(c.effectiveDate||'—')+'</td>';
      html += '<td>'+(c.deliveryDate||'—')+'</td>';
      html += '<td>'+(c.totalCopies||'—')+'</td>';
      html += '<td>'+(c.archiveCopies!==undefined?c.archiveCopies:'—')+'</td>';
      html += '<td>'+(c.archiveTime||'—')+'</td>';
      html += '<td>'+(c.archiveLocation||'—')+'</td>';
      html += '<td>'+c.createTime+'</td>';
      html += '<td>'+(c.updateTime||'—')+'</td>';
      html += '<td class="fixed-col fixed-col-right" style="white-space:nowrap;">';
      html += '<a href="#" onclick="openContractDetail('+c.id+');return false;" style="color:var(--fa-primary);margin-right:8px;">详情</a>';
      html += '<a href="#" onclick="editContract('+c.id+');return false;" style="color:var(--fa-success);margin-right:8px;">编辑</a>';
      html += '<a href="#" onclick="viewAuditRecord('+c.id+');return false;" style="color:var(--fa-info);margin-right:8px;">审核记录</a>';

      html += '<a href="#" onclick="deleteContract('+c.id+');return false;" style="color:var(--fa-danger);">删除</a>';
      html += '</td>';
      html += '</tr>';
    });
  }
  $('#contractTableBody').html(html);
  $('#checkAll').prop('checked', false);
}

function updateTotalCount() {
  let visible = $('#contractTableBody tr').length;
  // exclude empty placeholder
  let tbody = $('#contractTableBody');
  if (tbody.find('td[colspan]').length > 0) visible = 0;
  let total = (typeof getLedgerContracts !== 'undefined') ? getLedgerContracts().length : contracts.length;
  $('#totalCount').text(total);
  $('#pageTotalCount').text(visible > 0 ? visible : total);
}

// ==================== 筛选 ====================
// ==================== 快速操作（列表页） ====================
function quickApprove(id) {
  currentContractId = id;
  let c = contracts.find(function(item){ return item.id === id; });
  if (!c) return;
  if (!approvalHistories[id]) approvalHistories[id] = [];
  approvalHistories[id].push({
    user: c.currentHandler.split('（')[0],
    dept: c.currentHandler.split('（')[1] ? c.currentHandler.split('（')[1].replace('）','') : '',
    action: '审批通过',
    actionType: 'approve',
    time: new Date().toLocaleString('zh-CN'),
    opinion: '同意，快速通过。'
  });
  c.status = 'approved';
  c.currentNode = '已通过';
  c.progress = 100;
  renderContractTable(contracts);
  updateTotalCount();
  alert('已快速通过合同 ' + c.no);
}

function quickReject(id) {
  currentContractId = id;
  openRejectModal();
}

function reSubmit(id) {
  let c = contracts.find(function(item){ return item.id === id; });
  if (!c) return;
  c.status = 'approving';
  c.currentNode = '部门审批';
  c.currentHandler = '王主管（采购部）';
  c.progress = 30;
  if (!approvalHistories[id]) approvalHistories[id] = [];
  approvalHistories[id].push({
    user: c.handler.split('（')[0],
    dept: c.handler.split('（')[1] ? c.handler.split('（')[1].replace('）','') : '',
    action: '重新提交审批',
    actionType: 'submit',
    time: new Date().toLocaleString('zh-CN'),
    opinion: '已修改，重新提交审批。'
  });
  renderContractTable(contracts);
  updateTotalCount();
  alert('合同 ' + c.no + ' 已重新发起审批。');
}

// ==================== 合同起草页面 ====================