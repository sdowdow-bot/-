// ==================== 合同起草页面 ====================
function getDraftList() {
  var status = $('#draftSearchStatus').val();
  var name = $('#draftSearchName').val().toLowerCase();
  var no = $('#draftSearchNo').val().toLowerCase();
  var type = $('#draftSearchType').val();
  var list = contracts;
  if (status) list = list.filter(function(c){ return c.status === status; });
  if (name) list = list.filter(function(c){ return c.name.toLowerCase().indexOf(name) >= 0; });
  if (no) list = list.filter(function(c){ return c.no.toLowerCase().indexOf(no) >= 0; });
  if (type) list = list.filter(function(c){ return (c.category||c.type) === type; });
  return list;
}

function renderDraftTable(list) {
  if (!list) {
    list = getDraftList();
  }
  let html = '';
  if (list.length === 0) {
    html = '<tr><td colspan="13" style="text-align:center;padding:40px;color:#999;"><i class="fa-solid fa-inbox" style="font-size:40px;display:block;margin-bottom:10px;"></i>暂无起草记录</td></tr>';
  } else {
    list.forEach(function(c){
      html += '<tr>';
      html += '<td><input type="checkbox" class="draft-check-item" value="'+c.id+'" '+(c.status==='approved'||c.status==='approving'?'disabled':'')+'></td>';
      html += '<td>'+c.id+'</td>';
      html += '<td><a href="#" onclick="'+(c.status==='draft'?'editDraftContract('+c.id+')':'openContractDetail('+c.id+')')+';return false;" style="color:var(--fa-primary);font-weight:500;">'+c.name+'</a></td>';
      html += '<td>'+c.no+'</td>';
      html += '<td>'+(c.subject||'—')+'</td>';
      html += '<td>'+(c.category||c.type||'—')+'</td>';
      html += '<td><span class="status-badge '+STATUS_CLASS[c.status]+'">'+STATUS_LABEL[c.status]+'</span></td>';
      html += '<td>'+(c.handler||'—')+'</td>';
      html += '<td style="text-align:right;">'+c.amount.toLocaleString('zh-CN', {minimumFractionDigits:2})+'</td>';
      html += '<td>'+(c.counterParty||c.partyB||'—')+'</td>';
      html += '<td>'+c.createTime+'</td>';
      html += '<td>'+(c.updateTime||'—')+'</td>';
      html += '<td style="white-space:nowrap;">';
      if (c.status === 'draft') {
        html += '<a href="#" onclick="editDraftContract('+c.id+');return false;" style="color:var(--fa-info);margin-right:8px;" title="编辑"><i class="fa-solid fa-pen-to-square"></i> 编辑</a>';
        html += '<a href="#" onclick="deleteContract('+c.id+');return false;" style="color:var(--fa-danger);" title="删除"><i class="fa-solid fa-trash"></i> 删除</a>';
      } else if (c.status === 'approving') {
        html += '<a href="#" onclick="withdrawContract('+c.id+');return false;" style="color:#777;margin-right:8px;" title="撤销"><i class="fa-solid fa-rotate-left"></i> 撤销</a>';
        html += '<a href="#" onclick="openContractDetail('+c.id+',false,true);return false;" style="color:var(--fa-primary);margin-right:8px;" title="查看"><i class="fa-solid fa-eye"></i> 查看</a>';
        html += '<a href="#" onclick="viewAuditRecord('+c.id+');return false;" style="color:var(--fa-info);" title="审核记录"><i class="fa-solid fa-clock-rotate-left"></i> 审核记录</a>';
      } else if (c.status === 'approved') {
        html += '<a href="#" onclick="openContractDetail('+c.id+',false,true);return false;" style="color:var(--fa-primary);margin-right:8px;" title="查看"><i class="fa-solid fa-eye"></i> 查看</a>';
        html += '<a href="#" onclick="viewAuditRecord('+c.id+');return false;" style="color:var(--fa-info);" title="审核记录"><i class="fa-solid fa-clock-rotate-left"></i> 审核记录</a>';
      } else if (c.status === 'rejected') {
        html += '<a href="#" onclick="deleteContract('+c.id+');return false;" style="color:var(--fa-danger);margin-right:8px;" title="删除"><i class="fa-solid fa-trash"></i> 删除</a>';
        html += '<a href="#" onclick="openContractDetail('+c.id+',false,true);return false;" style="color:var(--fa-primary);margin-right:8px;" title="查看"><i class="fa-solid fa-eye"></i> 查看</a>';
        html += '<a href="#" onclick="editDraftContract('+c.id+');return false;" style="color:var(--fa-warning);margin-right:8px;" title="编辑"><i class="fa-solid fa-pen"></i> 编辑</a>';
        html += '<a href="#" onclick="viewAuditRecord('+c.id+');return false;" style="color:var(--fa-info);" title="审核记录"><i class="fa-solid fa-clock-rotate-left"></i> 审核记录</a>';
      } else if (c.status === 'withdrawn') {
        html += '<a href="#" onclick="editDraftContract('+c.id+');return false;" style="color:var(--fa-info);margin-right:8px;" title="编辑"><i class="fa-solid fa-pen-to-square"></i> 编辑</a>';
        html += '<a href="#" onclick="deleteContract('+c.id+');return false;" style="color:var(--fa-danger);" title="删除"><i class="fa-solid fa-trash"></i> 删除</a>';
      } else {
        html += '<a href="#" onclick="openContractDetail('+c.id+');return false;" style="color:var(--fa-primary);margin-right:8px;" title="查看详情"><i class="fa-solid fa-eye"></i> 查看</a>';
      }
      html += '</td>';
      html += '</tr>';
    });
  }
  $('#draftTableBody').html(html);
  $('#draftTotalCount').text(list.length);
  $('#draftPageTotalCount').text(list.length);
  $('#draftCheckAll').prop('checked', false);
}

function editDraftContract(id) {
  editContract(id);
}

// ==================== 合同起草 - 在线编辑 ====================
function openDraftOnlineEdit(id) {
  let c = contracts.find(function(item){ return item.id === id; });
  if (!c) return;
  // 确保有协同编辑文档内容
  if (!collabDocContents[id]) {
    generateBlankCollabDoc(id, c.name, c.type || c.category || '采购合同', c.partyA || c.subject || 'XX科技有限公司', c.partyB || c.counterParty || '待填写', c.amount || 0);
    saveCollabDocContent(id);
  }
  previousPage = 'contractDraft';
  openCollabEdit(id);
}

// ==================== 为已有合同上传Word ====================
let draftUploadWordContractId = null;

// ==================== 为已有合同上传Word ====================
function openDraftUploadWord(id) {
  draftUploadWordContractId = id;
  document.getElementById('draftWordFile').value = '';
  document.getElementById('draftWordFileInfo').style.display = 'none';
  $('#modalDraftUploadWord').modal('show');
}

function onDraftWordFileSelected(input) {
  if (input.files && input.files[0]) {
    let file = input.files[0];
    document.getElementById('draftWordFileName').textContent = file.name;
    let sizeKB = (file.size / 1024).toFixed(1);
    let sizeMB = (file.size / 1024 / 1024).toFixed(2);
    document.getElementById('draftWordFileSize').textContent = sizeKB > 1024 ? sizeMB + ' MB' : sizeKB + ' KB';
    document.getElementById('draftWordFileInfo').style.display = 'block';
  }
}

function clearDraftWordFile() {
  document.getElementById('draftWordFile').value = '';
  document.getElementById('draftWordFileInfo').style.display = 'none';
}

function applyDraftWordUpload() {
  let id = draftUploadWordContractId;
  if (!id) return;
  let fileInput = document.getElementById('draftWordFile');
  let fileName = (fileInput.files && fileInput.files[0]) ? fileInput.files[0].name : '';
  if (!fileName) { alert('请先选择Word文件'); return; }

  let c = contracts.find(function(item){ return item.id === id; });
  if (!c) return;

  // 替换协同编辑文档内容
  generateCollabDocFromUpload(id, c.name, c.type || c.category || '采购合同', c.partyA || c.subject, c.partyB || c.counterParty, c.amount || 0, fileName);
  saveCollabDocContent(id);

  c.attachmentName = fileName;
  c.updateTime = new Date().toLocaleString('zh-CN');

  // 记录版本
  if (!collabVersions[id]) collabVersions[id] = [];
  collabVersions[id].unshift({
    version: 'v' + (collabVersions[id].length + 1) + '.0',
    user: '管理员', time: new Date().toLocaleString('zh-CN'),
    summary: 'Word文件替换: ' + fileName, type: 'upload',
    content: collabDocContents[id]
  });

  $('#modalDraftUploadWord').modal('hide');
  renderDraftTable();
  renderContractTable(contracts);
  alert('合同 ' + c.no + ' 的内容已替换为Word文件内容，可点击“在线编辑”查看和修改。');
}

function submitDraftToApproval(id) {
  let c = contracts.find(function(item){ return item.id === id; });
  if (!c) return;
  if (c.status !== 'draft') { alert('只有草稿状态才能提交审批'); return; }
  if (!c.name || c.name === '未命名合同') { alert('请先编辑合同信息后再提交'); return; }
  if (!c.amount || c.amount <= 0) { alert('请先填写合同金额后再提交'); return; }
  c.status = 'approving';
  c.auditStatus = 'pending';
  c.currentNode = '部门负责人审批';
  c.progress = 10;
  c.updateTime = new Date().toLocaleString('zh-CN');
  if (!approvalHistories[id]) approvalHistories[id] = [];
  approvalHistories[id].push({
    user: '当前用户', dept: '', action: '提交审批', actionType: 'submit',
    time: new Date().toLocaleString('zh-CN'), opinion: '合同起草完成，提交审批。'
  });
  renderDraftTable();
  renderContractTable(contracts);
  updateTotalCount();
  alert('合同 ' + c.no + ' 已提交审批。');
}

function applyDraftFilter() {
  renderDraftTable();
}

function resetDraftFilter() {
  $('#draftSearchName').val('');
  $('#draftSearchNo').val('');
  $('#draftSearchType').val('');
  renderDraftTable();
}

function toggleDraftCheckAll() {
  let checked = $('#draftCheckAll').prop('checked');
  $('.draft-check-item').prop('checked', checked);
}

function batchSubmitDraft() {
  let checkedIds = [];
  $('.draft-check-item:checked').each(function(){ checkedIds.push(parseInt($(this).val())); });
  if (checkedIds.length === 0) { alert('请先选择要提交的合同'); return; }
  let count = 0;
  checkedIds.forEach(function(id){
    let c = contracts.find(function(item){ return item.id === id; });
    if (c && c.status === 'draft' && c.name && c.name !== '未命名合同' && c.amount > 0) {
      c.status = 'approving';
      c.auditStatus = 'pending';
      c.currentNode = '部门负责人审批';
      c.progress = 10;
      c.updateTime = new Date().toLocaleString('zh-CN');
      if (!approvalHistories[id]) approvalHistories[id] = [];
      approvalHistories[id].push({
        user: '当前用户', dept: '', action: '提交审批', actionType: 'submit',
        time: new Date().toLocaleString('zh-CN'), opinion: '合同起草完成，提交审批。'
      });
      count++;
    }
  });
  renderDraftTable();
  renderContractTable(contracts);
  updateTotalCount();
  alert('已成功提交 ' + count + ' 份合同审批。');
}

function batchDeleteDraft() {
  let checkedIds = [];
  $('.draft-check-item:checked').each(function(){ checkedIds.push(parseInt($(this).val())); });
  if (checkedIds.length === 0) { alert('请先选择要删除的合同'); return; }
  if (!confirm('确定要删除选中的 ' + checkedIds.length + ' 份合同吗？')) return;
  contracts = contracts.filter(function(item){ return checkedIds.indexOf(item.id) === -1; });
  renderDraftTable();
  renderContractTable(contracts);
  updateTotalCount();
  alert('已删除 ' + checkedIds.length + ' 份合同。');
}
