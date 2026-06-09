// ==================== 合同主体管理函数 ====================
function renderEntityTable(list) {
  if (!list) list = entityList;
  let html = '';
  if (list.length === 0) {
    html = '<tr><td colspan="10" style="text-align:center;padding:40px;color:#999;"><i class="fa-solid fa-building" style="font-size:40px;display:block;margin-bottom:10px;"></i>暂无数据</td></tr>';
  } else {
    list.forEach(function(e, idx){
      let contractCount = contracts.filter(function(c){ return c.subject === e.name; }).length;
      let checked = e.status === 1 ? 'checked' : '';
      let statusSwitch = '<label class="switch"><input type="checkbox" '+checked+' onchange="toggleEntityStatus('+e.id+')"><span class="slider"></span></label>';
      html += '<tr>';
      html += '<td>'+(idx+1)+'</td>';
      html += '<td><a href="#" onclick="viewEntityDetail('+e.id+');return false;" style="color:var(--fa-primary);font-weight:500;">'+e.name+'</a></td>';
      html += '<td>'+e.type+'</td>';
      html += '<td>'+(e.creditCode||'<span style="color:#CCC;">—</span>')+'</td>';
      html += '<td>'+e.legalPerson+'</td>';
      html += '<td title="'+e.address+'">'+(e.address.length>12?e.address.substring(0,12)+'…':e.address)+'</td>';
      html += '<td>'+e.phone+'</td>';
      html += '<td>'+contractCount+'</td>';
      html += '<td>'+statusSwitch+'</td>';
      html += '<td>';
      html += '<a href="#" onclick="editEntity('+e.id+');return false;" style="color:var(--fa-success);margin-right:8px;"><i class="fa-solid fa-pen-to-square"></i> 编辑</a>';
      html += '<a href="#" onclick="deleteEntity('+e.id+');return false;" style="color:var(--fa-danger);"><i class="fa-solid fa-trash"></i> 删除</a>';
      html += '</td>';
      html += '</tr>';
    });
  }
  $('#entityTableBody').html(html);
  $('#entityListCount').text(list.length);
  $('#entityPageTotal').text(list.length);
  $('#entityPageEnd').text(list.length);
}

function openCreateEntity() {
  $('#entityEditId').val('');
  $('#entityModalTitle').html('<i class="fa-solid fa-building"></i> 新建合同主体');
  $('#entityName').val('');
  $('#entityType').val('');
  $('#entityCreditCode').val('');
  $('#entityLegalPerson').val('');
  $('#entityAddress').val('');
  $('#entityPhone').val('');
  $('#entityEmail').val('');
  $('#entityBank').val('');
  $('#entityBankAccount').val('');
  $('#entityBusinessScope').val('');
  $('#entityStatus').val('1');
  $('#entityRemark').val('');
  $('#modalEntity').modal('show');
}

function editEntity(id) {
  let e = entityList.find(function(item){ return item.id === id; });
  if (!e) return;
  $('#entityEditId').val(e.id);
  $('#entityModalTitle').html('<i class="fa-solid fa-building"></i> 编辑合同主体');
  $('#entityName').val(e.name);
  $('#entityType').val(e.type);
  $('#entityCreditCode').val(e.creditCode);
  $('#entityLegalPerson').val(e.legalPerson);
  $('#entityAddress').val(e.address);
  $('#entityPhone').val(e.phone);
  $('#entityEmail').val(e.email);
  $('#entityBank').val(e.bank);
  $('#entityBankAccount').val(e.bankAccount);
  $('#entityBusinessScope').val(e.businessScope);
  $('#entityStatus').val(String(e.status));
  $('#entityRemark').val(e.remark);
  $('#modalEntity').modal('show');
}

function saveEntity() {
  let editId = $('#entityEditId').val();
  let name = $('#entityName').val().trim();
  let type = $('#entityType').val();
  let creditCode = $('#entityCreditCode').val().trim();
  let legalPerson = $('#entityLegalPerson').val().trim();
  let address = $('#entityAddress').val().trim();
  let bank = $('#entityBank').val().trim();
  let bankAccount = $('#entityBankAccount').val().trim();
  if (!name) { alert('请输入主体名称'); return; }
  if (!creditCode) { alert('请输入统一社会信用代码'); return; }
  if (!legalPerson) { alert('请输入法定代表人'); return; }
  if (!type) { alert('请选择主体类型'); return; }
  if (!bank) { alert('请输入开户银行'); return; }
  if (!bankAccount) { alert('请输入银行账号'); return; }

  let data = {
    name: name,
    type: type,
    creditCode: creditCode,
    legalPerson: legalPerson,
    address: address,
    phone: $('#entityPhone').val().trim(),
    email: $('#entityEmail').val().trim(),
    bank: $('#entityBank').val().trim(),
    bankAccount: $('#entityBankAccount').val().trim(),
    businessScope: $('#entityBusinessScope').val().trim(),
    status: parseInt($('#entityStatus').val()),
    remark: $('#entityRemark').val().trim()
  };

  if (editId) {
    let e = entityList.find(function(item){ return item.id === parseInt(editId); });
    if (e) { Object.assign(e, data); }
  } else {
    data.id = entityList.length > 0 ? Math.max.apply(null, entityList.map(function(e){ return e.id; })) + 1 : 1;
    data.createTime = new Date().toLocaleString('zh-CN');
    entityList.push(data);
  }
  $('#modalEntity').modal('hide');
  renderEntityTable();
  alert(editId ? '合同主体已更新' : '合同主体已创建');
}

function toggleEntityStatus(id) {
  let e = entityList.find(function(item){ return item.id === id; });
  if (!e) return;
  e.status = e.status === 1 ? 0 : 1;
  renderEntityTable();
}

function deleteEntity(id) {
  let e = entityList.find(function(item){ return item.id === id; });
  if (!e) return;
  let contractCount = contracts.filter(function(c){ return c.subject === e.name; }).length;
  if (contractCount > 0) {
    alert('该主体下存在 ' + contractCount + ' 个关联合同，无法删除。请先解除关联合同或停用该主体。');
    return;
  }
  if (!confirm('确认删除合同主体「' + e.name + '」？此操作不可恢复。')) return;
  entityList = entityList.filter(function(item){ return item.id !== id; });
  renderEntityTable();
  alert('已删除合同主体「' + e.name + '」');
}

function viewEntityDetail(id) {
  let e = entityList.find(function(item){ return item.id === id; });
  if (!e) return;
  let contractCount = contracts.filter(function(c){ return c.subject === e.name; }).length;
  let statusLabel = e.status === 1 ? '<span class="status-badge status-approved">启用</span>' : '<span class="status-badge status-rejected">停用</span>';
  let html = '<div class="detail-info">';
  html += '<div class="info-row"><span class="info-label">主体名称：</span><span class="info-value" style="font-weight:600;">'+e.name+'</span></div>';
  html += '<div class="info-row"><span class="info-label">主体类型：</span><span class="info-value">'+e.type+'</span></div>';
  html += '<div class="info-row"><span class="info-label">统一社会信用代码：</span><span class="info-value" style="font-family:monospace;">'+(e.creditCode||'—')+'</span></div>';
  html += '<div class="info-row"><span class="info-label">法定代表人：</span><span class="info-value">'+e.legalPerson+'</span></div>';
  html += '<div class="info-row"><span class="info-label">注册地址：</span><span class="info-value">'+e.address+'</span></div>';
  html += '<div class="info-row"><span class="info-label">联系电话：</span><span class="info-value">'+e.phone+'</span></div>';
  html += '<div class="info-row"><span class="info-label">电子邮箱：</span><span class="info-value">'+(e.email||'—')+'</span></div>';
  html += '<div class="info-row"><span class="info-label">开户银行：</span><span class="info-value">'+(e.bank||'—')+'</span></div>';
  html += '<div class="info-row"><span class="info-label">银行账号：</span><span class="info-value" style="font-family:monospace;">'+(e.bankAccount||'—')+'</span></div>';
  html += '<div class="info-row"><span class="info-label">经营范围：</span><span class="info-value">'+(e.businessScope||'—')+'</span></div>';
  html += '<div class="info-row"><span class="info-label">关联合同数：</span><span class="info-value" style="color:var(--fa-primary);font-weight:600;">'+contractCount+'</span></div>';
  html += '<div class="info-row"><span class="info-label">状态：</span><span class="info-value">'+statusLabel+'</span></div>';
  html += '<div class="info-row"><span class="info-label">备注：</span><span class="info-value">'+(e.remark||'—')+'</span></div>';
  html += '<div class="info-row"><span class="info-label">创建时间：</span><span class="info-value">'+e.createTime+'</span></div>';
  html += '</div>';
  if (contractCount > 0) {
    html += '<h4 style="color:var(--fa-primary);border-bottom:1px solid #eee;padding-bottom:8px;margin:20px 0 15px;"><i class="fa-solid fa-file-contract"></i> 关联合同列表</h4>';
    html += '<table class="table table-bordered" style="font-size:13px;"><thead><tr><th>合同编号</th><th>合同名称</th><th>合同类型</th><th>合同状态</th><th>合同金额</th></tr></thead><tbody>';
    contracts.filter(function(c){ return c.subject === e.name; }).forEach(function(c){
      html += '<tr><td>'+c.no+'</td><td>'+c.name+'</td><td>'+(c.category||c.type)+'</td><td><span class="status-badge '+STATUS_CLASS[c.status]+'">'+STATUS_LABEL[c.status]+'</span></td><td>¥ '+c.amount.toLocaleString('zh-CN',{minimumFractionDigits:2})+'</td></tr>';
    });
    html += '</tbody></table>';
  }
  $('#entityDetailBody').html(html);
  $('#modalEntityDetail').modal('show');
}

function applyEntityFilter() {
  let name = $('#entitySearchName').val().toLowerCase();
  let type = $('#entitySearchType').val();
  let status = $('#entitySearchStatus').val();
  let filtered = entityList.filter(function(e){
    if (name && e.name.toLowerCase().indexOf(name) === -1) return false;
    if (type && e.type !== type) return false;
    if (status !== '' && String(e.status) !== status) return false;
    return true;
  });
  renderEntityTable(filtered);
}

function resetEntityFilter() {
  $('#entitySearchName').val('');
  $('#entitySearchType').val('');
  $('#entitySearchStatus').val('');
  renderEntityTable();
}

function exportEntityData() {
  alert('正在导出合同主体数据...');
}

// ==================== 待我审核数据（模拟当前用户待审） ====================
let myAuditList = [
  { id:101, contractId:1, no:'HT-2026-0001', name:'医疗器械采购合同', type:'采购合同', initiator:'张经理（采购部）', currentNode:'法务审核', submitTime:'2026-05-10 14:35:00', deadline:'2026-05-16 14:35:00', urgency:'普通', flowName:'标准合同审批流程' },
  { id:102, contractId:2, no:'HT-2026-0002', name:'上门护理服务合作协议', type:'服务合同', initiator:'王主管（运营部）', currentNode:'总经理审批', submitTime:'2026-05-11 09:20:00', deadline:'2026-05-14 09:20:00', urgency:'紧急', flowName:'简易合同审批流程' },
  { id:103, contractId:11, no:'HT-2026-0011', name:'年度体检服务合同', type:'服务合同', initiator:'赵助理（行政部）', currentNode:'法务审核', submitTime:'2026-05-12 10:00:00', deadline:'2026-05-18 10:00:00', urgency:'普通', flowName:'标准合同审批流程' },
  { id:104, contractId:12, no:'HT-2026-0012', name:'战略合作框架协议', type:'合作协议', initiator:'张经理（采购部）', currentNode:'财务审核', submitTime:'2026-05-09 08:00:00', deadline:'2026-05-13 08:00:00', urgency:'超时', flowName:'重大合同审批流程' }
];

// ==================== 初始化 ====================
$(function(){
  renderContractTable(contracts);
  updateTotalCount();
});
