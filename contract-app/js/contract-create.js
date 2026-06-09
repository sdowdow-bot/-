// ==================== 新建合同 ====================
let createMode = "online"; // online | word | template

function selectCreateMode(mode) {
  createMode = mode;
  let templateCard = document.getElementById("createModeTemplate");
  let onlineCard = document.getElementById("createModeOnline");
  let wordCard = document.getElementById("createModeWord");
  let templateListArea = document.getElementById("createTemplateListArea");
  let templateSelectedArea = document.getElementById("createTemplateSelected");
  let wordArea = document.getElementById("createWordUploadArea");
  let nextBtn = document.getElementById("btnCreateNext");

  // 重置所有卡片
  [templateCard, onlineCard, wordCard].forEach(function(card){
    card.style.border = "2px solid #E0E0E0";
    card.style.background = "#fff";
  });
  templateListArea.style.display = "none";
  wordArea.style.display = "none";

  if (mode === "template") {
    templateCard.style.border = "2px solid var(--fa-primary)";
    templateCard.style.background = "#F0F7FF";
    // 显示内嵌模板列表
    templateListArea.style.display = "block";
    if (selectedTemplateId) { templateSelectedArea.style.display = "block"; }
    else { templateSelectedArea.style.display = "none"; }
    renderCreateTemplateList();
    nextBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> 下一步';
  } else if (mode === "online") {
    onlineCard.style.border = "2px solid var(--fa-primary)";
    onlineCard.style.background = "#F0F7FF";
    nextBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> 下一步';
  } else {
    wordCard.style.border = "2px solid #2B579A";
    wordCard.style.background = "#F0F7FF";
    wordArea.style.display = "block";
    nextBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> 保存并提交审批';
  }
}

// 渲染内嵌模板选择列表
function renderCreateTemplateList(filterText) {
  let html = '';
  let enabledTemplates = contractTemplates.filter(function(t){ return t.status === 1; });
  if (filterText) {
    let kw = filterText.toLowerCase();
    enabledTemplates = enabledTemplates.filter(function(t){ return t.name.toLowerCase().indexOf(kw) !== -1; });
  }
  if (enabledTemplates.length === 0) {
    html = '<div style="text-align:center;padding:30px;color:#999;"><i class="fa-solid fa-file-lines" style="font-size:32px;display:block;margin-bottom:8px;"></i>暂无可用模板</div>';
  } else {
    enabledTemplates.forEach(function(t) {
      let isSelected = selectedTemplateId === t.id;
      html += '<div class="create-tpl-item" data-id="'+t.id+'" onclick="selectCreateTemplateItem(this,'+t.id+')" style="display:flex;align-items:center;gap:12px;padding:10px 14px;cursor:pointer;transition:all .15s;border-bottom:1px solid #F0F0F0;'+(isSelected?'background:#F0F7FF;border-left:3px solid var(--fa-primary);':'')+'">';
      html += '<i class="fa-solid fa-file-lines" style="font-size:22px;color:var(--fa-primary);flex-shrink:0;"></i>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-weight:600;color:#333;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+t.name+'</div>';
      html += '<div style="font-size:11px;color:#888;margin-top:2px;">'+t.type+' · '+t.category+' · 使用 '+t.usageCount+' 次</div>';
      html += '</div>';
      if (isSelected) {
        html += '<i class="fa-solid fa-circle-check" style="font-size:18px;color:var(--fa-primary);flex-shrink:0;"></i>';
      }
      html += '</div>';
    });
  }
  $('#createTemplateList').html(html);
}

// 点击选择模板项
function selectCreateTemplateItem(el, id) {
  // 取消其他选中样式
  $('.create-tpl-item').css({background:'',borderLeft:''});
  $('.create-tpl-item .fa-circle-check').remove();
  // 选中当前
  $(el).css({background:'#F0F7FF',borderLeft:'3px solid var(--fa-primary)'});
  $(el).append('<i class="fa-solid fa-circle-check" style="font-size:18px;color:var(--fa-primary);flex-shrink:0;"></i>');

  selectedTemplateId = id;
  let t = contractTemplates.find(function(item){ return item.id === id; });
  if (!t) return;

  // 自动填充合同信息
  if (!$('#createName').val()) $('#createName').val(t.name.replace('模板',''));
  $('#createType').val(t.type);
  $('#createDept').val(t.dept);
  if (!$('#createSummary').val()) $('#createSummary').val('基于模板"'+t.name+'"创建');

  // 记录选中的模板
  selectedTemplateName = t.name;
  selectedTemplateContent = t.content;

  // 显示已选模板提示
  document.getElementById('createTemplateSelected').style.display = 'block';
  document.getElementById('createTemplateSelectedName').textContent = t.name;
}

// 搜索过滤模板列表
function filterCreateTemplateList() {
  let kw = $('#createTemplateSearch').val();
  renderCreateTemplateList(kw);
}

function clearTemplateSelection() {
  selectedTemplateId = null;
  selectedTemplateName = '';
  selectedTemplateContent = '';
  document.getElementById("createTemplateSelected").style.display = "none";
  // 重新渲染模板列表，清除选中状态
  renderCreateTemplateList();
}

function onCreateWordFileSelected(input) {
  if (input.files && input.files[0]) {
    let file = input.files[0];
    document.getElementById("createWordFileName").textContent = file.name;
    let sizeKB = (file.size / 1024).toFixed(1);
    let sizeMB = (file.size / 1024 / 1024).toFixed(2);
    document.getElementById("createWordFileSize").textContent = sizeKB > 1024 ? sizeMB + " MB" : sizeKB + " KB";
    document.getElementById("createWordFileInfo").style.display = "block";
    // 自动填写合同名称
    let nameWithoutExt = file.name.replace(/\.(doc|docx)$/i, "");
    if (!document.getElementById("createName").value) {
      document.getElementById("createName").value = nameWithoutExt;
    }
  }
}

function clearCreateWordFile() {
  document.getElementById("createWordFile").value = "";
  document.getElementById("createWordFileInfo").style.display = "none";
}

function openCreateContract() {
  // 初始化合同主体下拉
  let subjectHtml = '<option value="">请选择合同主体</option>';
  entityList.filter(function(e){ return e.status === 1; }).forEach(function(e){
    subjectHtml += '<option value="'+e.name+'">'+e.name+'</option>';
  });
  $('#createSubject').html(subjectHtml);
  // 生成合同编号
  let newId = contracts.length > 0 ? Math.max.apply(null, contracts.map(function(c){ return c.id; })) + 1 : 1;
  let no = 'HT-2026-' + String(newId).padStart(4, '0');
  resetCreateForm();
  $('#createNo').val(no);
  // 重置方式选择
  createMode = 'online';
  selectedTemplateId = null;
  selectedTemplateName = '';
  selectedTemplateContent = '';
  selectCreateMode('online');
  clearCreateWordFile();
  document.getElementById('createTemplateSelected').style.display = 'none';
  document.getElementById('createTemplateListArea').style.display = 'none';
  $('#createTemplateSearch').val('');
  $('#modalCreateContract').modal('show');
}

// 下一步按钮：根据方式执行不同逻辑
function createContractNext() {
  if (createMode === 'word') {
    createContractFromWordMode();
  } else if (createMode === 'template') {
    createContractFromTemplate();
  } else {
    createContract();
  }
}

// 从模板创建合同
function createContractFromTemplate() {
  if (!selectedTemplateId) { alert('请先选择合同模板'); return; }

  let name = $('#createName').val().trim();
  let type = $('#createType').val();
  let subject = $('#createSubject').val();
  let counterParty = $('#createCounterParty').val().trim();
  let amount = parseFloat($('#createAmount').val()) || 0;
  if (!name) { alert('请填写合同名称'); return; }
  if (!type) { alert('请选择合同类别'); return; }
  if (!subject) { alert('请选择合同主体'); return; }
  if (!counterParty) { alert('请填写相对方'); return; }

  let newId = contracts.length > 0 ? Math.max.apply(null, contracts.map(function(c){ return c.id; })) + 1 : 1;
  let no = $('#createNo').val() || 'HT-2026-' + String(newId).padStart(4, '0');

  let c = {
    id: newId, no: no, name: name, type: type, category: type, subject: subject,
    counterParty: counterParty, partyA: subject, partyB: counterParty, amount: amount,
    termType: $('#createTermType').val() || '固定期限', validDate: $('#createValidDate').val() || '—',
    signDate: $('#createSignDate').val() || '待定', startDate: $('#createSignDate').val() || '待定', endDate: '—',
    direction: $('#createDirection').val() || '支出', pricingMethod: $('#createPricingMethod').val() || '固定总价',
    currency: $('#createCurrency').val() || 'CNY（人民币）', dept: $('#createDept').val() || '采购部',
    performPlace: $('#createPerformPlace').val() || '—', summary: $('#createSummary').val() || '基于模板"'+selectedTemplateName+'"创建',
    counterContact: $('#createCounterContact').val() || '', counterPhone: $('#createCounterPhone').val() || '',
    counterAddress: $('#createCounterAddress').val() || '', effectiveDate: $('#createEffectiveDate').val() || '',
    deliveryDate: $('#createDeliveryDate').val() || '', totalCopies: parseInt($('#createTotalCopies').val()) || 0,
    archiveCopies: parseInt($('#createArchiveCopies').val()) || 0, archiveDate: $('#createArchiveDate').val() || '',
    archiveLocation: $('#createArchiveLocationSign').val() || $('#createArchiveLocation').val() || '',
    handler: '当前用户（发起人）', currentHandler: '—',
    status: 'draft', auditStatus: 'none', currentNode: '协同编辑中', progress: 5,
    createTime: new Date().toLocaleString('zh-CN'), updateTime: new Date().toLocaleString('zh-CN')
  };

  contracts.unshift(c);
  approvalHistories[newId] = [{
    user: '当前用户', dept: '发起人', action: '基于模板创建合同', actionType: 'submit',
    time: new Date().toLocaleString('zh-CN'), opinion: '基于模板"'+selectedTemplateName+'"创建合同，进入协同编辑。'
  }];

  collabAnnotations[newId] = [];
  collabRevisions[newId] = [];
  collabReviews[newId] = [];
  collabVersions[newId] = [
    { version: 'v1.0', user: '当前用户', time: new Date().toLocaleString('zh-CN'), summary: '基于模板创建' }
  ];
  collabOnlineUsers[newId] = [{ name: '管理员', dept: '当前用户', avatar: '#1E9FFF', isCurrent: true }];

  // 基于模板内容生成协同编辑文档
  generateCollabDocFromTemplate(newId, name, type, subject, counterParty, amount, selectedTemplateName, selectedTemplateContent);
  saveCollabDocContent(newId);

  // 更新模板使用次数
  let tpl = contractTemplates.find(function(t){ return t.id === selectedTemplateId; });
  if (tpl) tpl.usageCount++;

  $('#modalCreateContract').modal('hide');
  renderContractTable(contracts);
  updateTotalCount();
  renderDraftTable();

  setTimeout(function(){
    openCollabEdit(newId);
  }, 300);
}

// Word方式创建合同
function createContractFromWordMode() {
  let fileInput = document.getElementById('createWordFile');
  let fileName = (fileInput.files && fileInput.files[0]) ? fileInput.files[0].name : '';
  if (!fileName) { alert('请先选择Word文件'); return; }

  // 复用基本信息校验
  let name = $('#createName').val().trim();
  let type = $('#createType').val();
  let subject = $('#createSubject').val();
  let counterParty = $('#createCounterParty').val().trim();
  let amount = parseFloat($('#createAmount').val()) || 0;
  if (!name) { alert('请填写合同名称'); return; }
  if (!type) { alert('请选择合同类别'); return; }
  if (!subject) { alert('请选择合同主体'); return; }
  if (!counterParty) { alert('请填写相对方'); return; }
  if (!amount) { alert('请填写合同金额'); return; }

  let newId = contracts.length > 0 ? Math.max.apply(null, contracts.map(function(c){ return c.id; })) + 1 : 1;
  let no = $('#createNo').val() || 'HT-2026-' + String(newId).padStart(4, '0');

  let c = {
    id: newId, no: no, name: name, type: type, category: type, subject: subject,
    counterParty: counterParty, partyA: subject, partyB: counterParty, amount: amount,
    termType: $('#createTermType').val() || '固定期限', validDate: $('#createValidDate').val() || '—',
    signDate: $('#createSignDate').val() || '待定', startDate: $('#createSignDate').val() || '待定', endDate: '—',
    direction: $('#createDirection').val() || '支出', pricingMethod: $('#createPricingMethod').val() || '固定总价',
    currency: $('#createCurrency').val() || 'CNY（人民币）', dept: $('#createDept').val() || '采购部',
    performPlace: $('#createPerformPlace').val() || '—', summary: $('#createSummary').val() || '由Word文件导入起草',
    counterContact: $('#createCounterContact').val() || '', counterPhone: $('#createCounterPhone').val() || '',
    counterAddress: $('#createCounterAddress').val() || '', effectiveDate: $('#createEffectiveDate').val() || '',
    deliveryDate: $('#createDeliveryDate').val() || '', totalCopies: parseInt($('#createTotalCopies').val()) || 0,
    archiveCopies: parseInt($('#createArchiveCopies').val()) || 0, archiveDate: $('#createArchiveDate').val() || '',
    archiveLocation: $('#createArchiveLocationSign').val() || $('#createArchiveLocation').val() || '',
    handler: '当前用户（发起人）', currentHandler: '—',
    status: 'draft', auditStatus: 'none', currentNode: '—', progress: 5,
    createTime: new Date().toLocaleString('zh-CN'), updateTime: new Date().toLocaleString('zh-CN'),
    attachmentName: fileName
  };

  contracts.unshift(c);
  approvalHistories[newId] = [{
    user: '当前用户', dept: '发起人', action: '上传Word创建合同', actionType: 'submit',
    time: new Date().toLocaleString('zh-CN'), opinion: '通过上传Word文件创建合同草稿。'
  }];

  collabAnnotations[newId] = [];
  collabRevisions[newId] = [];
  collabReviews[newId] = [];
  collabVersions[newId] = [
    { version: 'v1.0', user: '当前用户', time: new Date().toLocaleString('zh-CN'), summary: 'Word文件导入' }
  ];
  collabOnlineUsers[newId] = [{ name: '管理员', dept: '当前用户', avatar: '#1E9FFF', isCurrent: true }];

  generateCollabDocFromUpload(newId, name, type, subject, counterParty, amount, fileName || 'Word文件');
  saveCollabDocContent(newId);

  // 设置合同状态为审批中
  let contract = contracts.find(function(item){ return item.id === newId; });
  if (contract) {
    contract.status = 'approving';
    contract.auditStatus = 'pending';
    contract.currentHandler = '王主管（部门负责人）';
    contract.currentNode = '部门负责人审批';
    contract.progress = 10;
    contract.updateTime = new Date().toLocaleString('zh-CN');
  }
  approvalHistories[newId].push({
    user: '当前用户', dept: '发起人', action: '提交审批', actionType: 'submit',
    time: new Date().toLocaleString('zh-CN'), opinion: '合同已上传Word文件，提交审批。'
  });

  $('#modalCreateContract').modal('hide');
  renderContractTable(contracts);
  updateTotalCount();
  renderDraftTable();
  switchPage('contractDraft');
  alert('合同 ' + no + ' 已保存并提交审批。');
}

function createContract() {
  let name = $('#createName').val().trim();
  let type = $('#createType').val();
  let subject = $('#createSubject').val();
  let counterParty = $('#createCounterParty').val().trim();
  let amount = parseFloat($('#createAmount').val()) || 0;

  if (!name) { alert('请填写合同名称'); return; }
  if (!type) { alert('请选择合同类别'); return; }
  if (!subject) { alert('请选择合同主体'); return; }
  if (!counterParty) { alert('请填写相对方'); return; }
  if (!amount) { alert('请填写合同金额'); return; }

  let newId = contracts.length > 0 ? Math.max.apply(null, contracts.map(function(c){ return c.id; })) + 1 : 1;
  let no = $('#createNo').val() || 'HT-2026-' + String(newId).padStart(4, '0');

  let c = {
    id: newId,
    no: no,
    name: name,
    type: type,
    category: type,
    subject: subject,
    counterParty: counterParty,
    partyA: subject,
    partyB: counterParty,
    amount: amount,
    termType: $('#createTermType').val(),
    validDate: $('#createValidDate').val() || '—',
    signDate: $('#createSignDate').val() || '待定',
    startDate: $('#createSignDate').val() || '待定',
    endDate: '—',
    direction: $('#createDirection').val(),
    pricingMethod: $('#createPricingMethod').val(),
    currency: $('#createCurrency').val(),
    dept: $('#createDept').val(),
    performPlace: $('#createPerformPlace').val() || '—',
    summary: $('#createSummary').val() || '',
    counterContact: $('#createCounterContact').val() || '',
    counterPhone: $('#createCounterPhone').val() || '',
    counterAddress: $('#createCounterAddress').val() || '',
    effectiveDate: $('#createEffectiveDate').val() || '',
    deliveryDate: $('#createDeliveryDate').val() || '',
    totalCopies: parseInt($('#createTotalCopies').val()) || 0,
    archiveCopies: parseInt($('#createArchiveCopies').val()) || 0,
    archiveDate: $('#createArchiveDate').val() || '',
    archiveLocation: $('#createArchiveLocationSign').val() || $('#createArchiveLocation').val() || '',
    handler: '当前用户（发起人）',
    currentHandler: '—',
    status: 'draft',
    auditStatus: 'none',
    currentNode: '协同编辑中',
    progress: 5,
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN')
  };

  contracts.unshift(c);
  approvalHistories[newId] = [{
    user: '当前用户',
    dept: '发起人',
    action: '创建合同',
    actionType: 'submit',
    time: new Date().toLocaleString('zh-CN'),
    opinion: '合同已创建，进入协同编辑。'
  }];

  // 初始化协同编辑数据
  collabAnnotations[newId] = [];
  collabRevisions[newId] = [];
  collabReviews[newId] = [];
  collabVersions[newId] = [
    { version: 'v1.0', user: '当前用户', time: new Date().toLocaleString('zh-CN'), summary: '空白合同创建' }
  ];
  collabOnlineUsers[newId] = [{ name: '管理员', dept: '当前用户', avatar: '#1E9FFF', isCurrent: true }];

  // 生成空白协同编辑文档
  generateBlankCollabDoc(newId, name, type, subject, counterParty, amount);
  saveCollabDocContent(newId);

  $('#modalCreateContract').modal('hide');
  renderContractTable(contracts);
  updateTotalCount();
  renderDraftTable();

  // 打开协同编辑页面
  setTimeout(function(){
    openCollabEdit(newId);
  }, 300);
}

function createContractDraft() {
  let name = $('#createName').val().trim() || '未命名合同';
  let type = $('#createType').val() || '其他';
  let subject = $('#createSubject').val() || 'XX科技有限公司';
  let counterParty = $('#createCounterParty').val().trim() || '待填写';
  let amount = parseFloat($('#createAmount').val()) || 0;

  let newId = contracts.length > 0 ? Math.max.apply(null, contracts.map(function(c){ return c.id; })) + 1 : 1;
  let no = $('#createNo').val() || 'HT-2026-' + String(newId).padStart(4, '0');

  // Word方式保存草稿
  if (createMode === 'word') {
    let fileInput = document.getElementById('createWordFile');
    let fileName = (fileInput.files && fileInput.files[0]) ? fileInput.files[0].name : '';

    let c = {
      id: newId, no: no, name: name, type: type, category: type, subject: subject,
      counterParty: counterParty, partyA: subject, partyB: counterParty, amount: amount,
      termType: $('#createTermType').val() || '固定期限', validDate: $('#createValidDate').val() || '—',
      signDate: '待定', startDate: '待定', endDate: '—',
      direction: $('#createDirection').val() || '支出', pricingMethod: $('#createPricingMethod').val() || '固定总价',
      currency: $('#createCurrency').val() || 'CNY（人民币）', dept: $('#createDept').val() || '采购部',
      performPlace: $('#createPerformPlace').val() || '—', summary: $('#createSummary').val() || '由Word文件导入起草',
      counterContact: $('#createCounterContact').val() || '', counterPhone: $('#createCounterPhone').val() || '',
      counterAddress: $('#createCounterAddress').val() || '', effectiveDate: $('#createEffectiveDate').val() || '',
      deliveryDate: $('#createDeliveryDate').val() || '', totalCopies: parseInt($('#createTotalCopies').val()) || 0,
      archiveCopies: parseInt($('#createArchiveCopies').val()) || 0, archiveDate: $('#createArchiveDate').val() || '',
      archiveLocation: $('#createArchiveLocationSign').val() || $('#createArchiveLocation').val() || '',
      handler: '当前用户（发起人）', currentHandler: '—',
      status: 'draft', auditStatus: 'none', currentNode: '—', progress: 5,
      createTime: new Date().toLocaleString('zh-CN'), updateTime: new Date().toLocaleString('zh-CN'),
      attachmentName: fileName
    };
    contracts.unshift(c);
    approvalHistories[newId] = [{
      user: '当前用户', dept: '发起人', action: '上传Word创建合同', actionType: 'submit',
      time: new Date().toLocaleString('zh-CN'), opinion: '通过上传Word文件创建合同草稿。'
    }];
    collabAnnotations[newId] = [];
    collabRevisions[newId] = [];
    collabReviews[newId] = [];
    collabVersions[newId] = [
      { version: 'v1.0', user: '当前用户', time: new Date().toLocaleString('zh-CN'), summary: 'Word文件导入' }
    ];
    collabOnlineUsers[newId] = [{ name: '管理员', dept: '当前用户', avatar: '#1E9FFF', isCurrent: true }];
    generateCollabDocFromUpload(newId, name, type, subject, counterParty, amount, fileName || 'Word文件');
    saveCollabDocContent(newId);
  } else if (createMode === 'template') {
    // 模板方式保存草稿
    contracts.unshift({
      id: newId, no: no, name: name, type: type, category: type, subject: subject,
      counterParty: counterParty, partyA: subject, partyB: counterParty, amount: amount,
      termType: $('#createTermType').val() || '固定期限', validDate: $('#createValidDate').val() || '—',
      signDate: '待定', startDate: '待定', endDate: '—',
      direction: $('#createDirection').val() || '支出', pricingMethod: $('#createPricingMethod').val() || '固定总价',
      currency: $('#createCurrency').val() || 'CNY（人民币）', dept: $('#createDept').val() || '采购部',
      performPlace: $('#createPerformPlace').val() || '—', summary: $('#createSummary').val() || '基于模板"'+selectedTemplateName+'"创建',
      counterContact: $('#createCounterContact').val() || '', counterPhone: $('#createCounterPhone').val() || '',
      counterAddress: $('#createCounterAddress').val() || '', effectiveDate: $('#createEffectiveDate').val() || '',
      deliveryDate: $('#createDeliveryDate').val() || '', totalCopies: parseInt($('#createTotalCopies').val()) || 0,
      archiveCopies: parseInt($('#createArchiveCopies').val()) || 0, archiveDate: $('#createArchiveDate').val() || '',
      archiveLocation: $('#createArchiveLocationSign').val() || $('#createArchiveLocation').val() || '',
      handler: '当前用户（发起人）', currentHandler: '—',
      status: 'draft', auditStatus: 'none', currentNode: '—', progress: 5,
      createTime: new Date().toLocaleString('zh-CN'), updateTime: new Date().toLocaleString('zh-CN')
    });
    approvalHistories[newId] = [{
      user: '当前用户', dept: '发起人', action: '基于模板创建合同', actionType: 'submit',
      time: new Date().toLocaleString('zh-CN'), opinion: '基于模板"'+selectedTemplateName+'"创建合同草稿。'
    }];
    collabAnnotations[newId] = [];
    collabRevisions[newId] = [];
    collabReviews[newId] = [];
    collabVersions[newId] = [
      { version: 'v1.0', user: '当前用户', time: new Date().toLocaleString('zh-CN'), summary: '基于模板创建' }
    ];
    collabOnlineUsers[newId] = [{ name: '管理员', dept: '当前用户', avatar: '#1E9FFF', isCurrent: true }];
    generateCollabDocFromTemplate(newId, name, type, subject, counterParty, amount, selectedTemplateName || '默认模板', selectedTemplateContent || '');
    saveCollabDocContent(newId);
  } else {
    // 在线编辑方式保存草稿
    contracts.unshift({
      id: newId, no: no, name: name, type: type, category: type, subject: subject,
      counterParty: counterParty, partyA: subject, partyB: counterParty, amount: amount,
      termType: $('#createTermType').val() || '固定期限', validDate: $('#createValidDate').val() || '—',
      signDate: '待定', startDate: '待定', endDate: '—',
      direction: $('#createDirection').val() || '支出', pricingMethod: $('#createPricingMethod').val() || '固定总价',
      currency: $('#createCurrency').val() || 'CNY（人民币）', dept: $('#createDept').val() || '采购部',
      performPlace: $('#createPerformPlace').val() || '—', summary: $('#createSummary').val() || '',
      counterContact: $('#createCounterContact').val() || '', counterPhone: $('#createCounterPhone').val() || '',
      counterAddress: $('#createCounterAddress').val() || '', effectiveDate: $('#createEffectiveDate').val() || '',
      deliveryDate: $('#createDeliveryDate').val() || '', totalCopies: parseInt($('#createTotalCopies').val()) || 0,
      archiveCopies: parseInt($('#createArchiveCopies').val()) || 0, archiveDate: $('#createArchiveDate').val() || '',
      archiveLocation: $('#createArchiveLocationSign').val() || $('#createArchiveLocation').val() || '',
      handler: '当前用户（发起人）', currentHandler: '—',
      status: 'draft', auditStatus: 'none', currentNode: '—', progress: 0,
      createTime: new Date().toLocaleString('zh-CN'), updateTime: new Date().toLocaleString('zh-CN')
    });
  }

  $('#modalCreateContract').modal('hide');
  renderContractTable(contracts);
  updateTotalCount();
  renderDraftTable();
  alert('合同 ' + no + ' 已保存为草稿。');
}

// ==================== 辅助功能 ====================
// ==================== 编辑合同 ====================
function editContract(id) {
  let c = contracts.find(function(item){ return item.id === id; });
  if (!c) return;

  // 记录正在编辑的合同ID
  editingContractId = id;

  // 初始化合同主体下拉
  let subjectHtml = '<option value="">请选择合同主体</option>';
  entityList.filter(function(e){ return e.status === 1; }).forEach(function(e){
    subjectHtml += '<option value="'+e.name+'"'+(c.subject===e.name?' selected':'')+'>'+e.name+'</option>';
  });
  $('#editSubject').html(subjectHtml);

  // 填充表单数据
  $('#editName').val(c.name || '');
  $('#editNo').val(c.no || '');
  $('#editType').val(c.type || c.category || '');
  $('#editTermType').val(c.termType || '固定期限');
  $('#editValidDate').val(c.validDate || '');
  $('#editSignDate').val(c.signDate || '');
  $('#editDirection').val(c.direction || '支出');
  $('#editPricingMethod').val(c.pricingMethod || '固定总价');
  $('#editAmount').val(c.amount || '');
  $('#editCurrency').val(c.currency || 'CNY（人民币）');
  $('#editDept').val(c.dept || '采购部');
  $('#editPerformPlace').val(c.performPlace || '');
  $('#editSummary').val(c.summary || '');
  $('#editCounterParty').val(c.counterParty || c.partyB || '');
  $('#editCounterContact').val(c.counterContact || '');
  $('#editCounterPhone').val(c.counterPhone || '');
  $('#editCounterAddress').val(c.counterAddress || '');
  $('#editEffectiveDate').val(c.effectiveDate || '');
  $('#editDeliveryDate').val(c.deliveryDate || '');
  $('#editTotalCopies').val(c.totalCopies || '');
  $('#editArchiveCopies').val(c.archiveCopies || '');
  $('#editArchiveDate').val(c.archiveDate || '');
  $('#editArchiveLocation').val(c.archiveLocation || '');

  $('#modalEditContract').modal('show');
}

// 公共保存函数：校验并保存编辑的合同信息
function doSaveEditContract() {
  let id = editingContractId;
  if (!id) return null;
  let c = contracts.find(function(item){ return item.id === id; });
  if (!c) return null;

  let name = $('#editName').val().trim();
  let type = $('#editType').val();
  let subject = $('#editSubject').val();
  let counterParty = $('#editCounterParty').val().trim();
  let amount = parseFloat($('#editAmount').val()) || 0;

  if (!name) { alert('请填写合同名称'); return null; }
  if (!type) { alert('请选择合同类别'); return null; }
  if (!subject) { alert('请选择合同主体'); return null; }
  if (!counterParty) { alert('请填写相对方'); return null; }
  if (!amount) { alert('请填写合同金额'); return null; }

  // 更新合同数据
  c.name = name;
  c.type = type;
  c.category = type;
  c.subject = subject;
  c.partyA = subject;
  c.counterParty = counterParty;
  c.partyB = counterParty;
  c.amount = amount;
  c.termType = $('#editTermType').val();
  c.validDate = $('#editValidDate').val() || '—';
  c.signDate = $('#editSignDate').val() || '待定';
  c.startDate = c.signDate;
  c.direction = $('#editDirection').val();
  c.pricingMethod = $('#editPricingMethod').val();
  c.currency = $('#editCurrency').val();
  c.dept = $('#editDept').val();
  c.performPlace = $('#editPerformPlace').val() || '—';
  c.summary = $('#editSummary').val() || '';
  c.counterContact = $('#editCounterContact').val() || '';
  c.counterPhone = $('#editCounterPhone').val() || '';
  c.counterAddress = $('#editCounterAddress').val() || '';
  c.effectiveDate = $('#editEffectiveDate').val() || '';
  c.deliveryDate = $('#editDeliveryDate').val() || '';
  c.totalCopies = parseInt($('#editTotalCopies').val()) || 0;
  c.archiveCopies = parseInt($('#editArchiveCopies').val()) || 0;
  c.archiveDate = $('#editArchiveDate').val() || '';
  c.archiveLocation = $('#editArchiveLocation').val() || '';
  c.updateTime = new Date().toLocaleString('zh-CN');

  // 如果合同还没有文档内容，先为它生成默认文档
  if (!collabDocContents[id] && id !== 1) {
    generateBlankCollabDoc(id, c.name, c.type, c.partyA, c.partyB, c.amount);
    saveCollabDocContent(id);
  }

  // 记录编辑操作到审批历史
  if (!approvalHistories[id]) approvalHistories[id] = [];
  approvalHistories[id].push({
    user: '当前用户',
    dept: '',
    action: '编辑合同信息',
    actionType: 'submit',
    time: new Date().toLocaleString('zh-CN'),
    opinion: '用户编辑了合同基本信息。'
  });

  return id;
}

// 保存合同信息（关闭弹框）
function saveEditContract() {
  let id = doSaveEditContract();
  if (!id) return;
  $('#modalEditContract').modal('hide');
  renderContractTable(contracts);
  updateTotalCount();
  renderDraftTable();
}

// 保存并跳转到协同编辑页面
function saveEditAndNextStep() {
  let id = doSaveEditContract();
  if (!id) return;
  $('#modalEditContract').modal('hide');
  renderContractTable(contracts);
  updateTotalCount();
  // 跳转到协同编辑页面
  setTimeout(function(){
    openCollabEdit(id);
  }, 300);
}

// ==================== 版本抽屉开关 ====================
// ==================== 新建合同表单重置 ====================



// 重置新建表单
function resetCreateForm() {
  // 合同信息
  $('#createName').val(''); $('#createNo').val('');
  $('#createSubject').val(''); $('#createType').val('');
  $('#createStatus').val('draft'); $('#createTermType').val('固定期限');
  $('#createValidDate').val(''); $('#createSignDate').val('');
  $('#createDirection').val('支出'); $('#createPricingMethod').val('固定总价');
  $('#createAmount').val(''); $('#createCurrency').val('CNY（人民币）');
  $('#createDept').val('采购部');
  $('#createPerformPlace').val(''); $('#createArchiveLocation').val('');
  $('#createSummary').val('');
  // 相对方信息
  $('#createCounterParty').val(''); $('#createCounterContact').val('');
  $('#createCounterPhone').val(''); $('#createCounterAddress').val('');
  // 签订信息
  $('#createEffectiveDate').val(''); $('#createDeliveryDate').val('');
  $('#createTotalCopies').val(''); $('#createArchiveCopies').val('');
  $('#createArchiveDate').val(''); $('#createArchiveLocationSign').val('');
}

// 从上传Word文件生成协同编辑文档内容（模拟解析）
function generateCollabDocFromUpload(contractId, name, type, partyA, partyB, amount, fileName) {
  let html = '<h2 style="text-align:center;color:#333;margin-bottom:20px;">' + name + '</h2>';
  html += '<p style="text-align:center;color:#888;font-size:12px;margin-bottom:20px;"><i class="fa-solid fa-file-word" style="color:#2B579A;"></i> 文档来源：' + fileName + ' &nbsp;|&nbsp; 导入时间：' + new Date().toLocaleString('zh-CN') + '</p>';
  html += '<div style="background:#FFF9C4;padding:8px 12px;border-radius:4px;font-size:12px;color:#666;margin-bottom:16px;border-left:3px solid #FFC107;"><i class="fa-solid fa-circle-info" style="color:#FFC107;"></i> 此文档由Word文件自动解析生成，请核对内容准确性。您可以直接在此编辑，其他协作者将实时看到您的修改。</div>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第一条 合同主体</h3>';
  html += '<p>甲方（采购方）：' + partyA + '</p>';
  html += '<p>乙方（供应方）：' + partyB + '</p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第二条 合同标的</h3>';
  html += '<p>（根据Word文档内容自动解析，请在此编辑补充具体标的物信息）</p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第三条 合同金额与支付</h3>';
  html += '<p>本合同总金额为人民币 ' + (amount > 0 ? amount.toLocaleString('zh-CN', {minimumFractionDigits:2}) : '【待填写】') + ' 元。</p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第四条 交付与验收</h3>';
  html += '<p>（请编辑补充交付与验收条款）</p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第五条 质量保证</h3>';
  html += '<p>（请编辑补充质量保证条款）</p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第六条 违约责任</h3>';
  html += '<p>（请编辑补充违约责任条款）</p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第七条 争议解决</h3>';
  html += '<p>因本合同引起的争议，双方应协商解决；协商不成的，任何一方均可向甲方所在地人民法院提起诉讼。</p>';
  html += '<div style="margin-top:40px;display:flex;justify-content:space-between;">';
  html += '<div><p><strong>甲方（盖章）：</strong>' + partyA + '</p><p style="margin-top:30px;">授权代表签字：_______________</p><p>日期：_______________</p></div>';
  html += '<div><p><strong>乙方（盖章）：</strong>' + partyB + '</p><p style="margin-top:30px;">授权代表签字：_______________</p><p>日期：_______________</p></div>';
  html += '</div>';
  $('#collabEditorBody').html(html);
  // 保存文档内容到存储
  collabDocContents[contractId] = html;
}

// 基于模板生成协同编辑文档
function generateCollabDocFromTemplate(contractId, name, type, partyA, partyB, amount, templateName, templateContent) {
  let html = '<h2 style="text-align:center;color:#333;margin-bottom:20px;">' + name + '</h2>';
  html += '<p style="text-align:center;color:#888;font-size:12px;margin-bottom:20px;"><i class="fa-solid fa-file-lines" style="color:var(--fa-primary);"></i> 基于模板：' + templateName + ' &nbsp;|&nbsp; 创建时间：' + new Date().toLocaleString('zh-CN') + '</p>';
  html += '<div style="background:#E8F4FD;padding:8px 12px;border-radius:4px;font-size:12px;color:#31708F;margin-bottom:16px;border-left:3px solid var(--fa-primary);"><i class="fa-solid fa-lightbulb" style="color:var(--fa-primary);"></i> 此合同基于模板"' + templateName + '"创建，您可以根据实际情况修改内容。其他协作者可以同时编辑，所有修改将实时同步保存。</div>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第一条 合同主体</h3>';
  html += '<p>甲方：' + partyA + '</p>';
  html += '<p>乙方：' + partyB + '</p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第二条 合同标的</h3>';
  html += '<p>（根据模板内容，请编辑补充具体标的物信息）</p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第三条 合同金额与支付</h3>';
  html += '<p>本合同总金额为人民币 ' + (amount > 0 ? amount.toLocaleString('zh-CN', {minimumFractionDigits:2}) : '【待填写】') + ' 元。</p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第四条 交付与验收</h3>';
  html += '<p>（请编辑补充交付与验收条款）</p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第五条 质量保证</h3>';
  html += '<p>（请编辑补充质量保证条款）</p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第六条 违约责任</h3>';
  html += '<p>（请编辑补充违约责任条款）</p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第七条 争议解决</h3>';
  html += '<p>因本合同引起的争议，双方应协商解决；协商不成的，任何一方均可向甲方所在地人民法院提起诉讼。</p>';
  html += '<div style="margin-top:40px;display:flex;justify-content:space-between;">';
  html += '<div><p><strong>甲方（盖章）：</strong>' + partyA + '</p><p style="margin-top:30px;">授权代表签字：_______________</p><p>日期：_______________</p></div>';
  html += '<div><p><strong>乙方（盖章）：</strong>' + partyB + '</p><p style="margin-top:30px;">授权代表签字：_______________</p><p>日期：_______________</p></div>';
  html += '</div>';
  // 附加模板原始内容
  if (templateContent && templateContent.length > 20) {
    html += '<div style="margin-top:30px;border-top:1px dashed #ccc;padding-top:16px;">';
    html += '<h4 style="color:#888;font-size:13px;"><i class="fa-solid fa-file-lines"></i> 模板原始内容</h4>';
    html += '<div style="font-size:13px;color:#666;line-height:1.8;">' + templateContent + '</div>';
    html += '</div>';
  }
  $('#collabEditorBody').html(html);
  collabDocContents[contractId] = html;
}

// 生成空白合同协同编辑文档
function generateBlankCollabDoc(contractId, name, type, partyA, partyB, amount) {
  let html = '<h2 style="text-align:center;color:#333;margin-bottom:20px;">' + name + '</h2>';
  html += '<p style="text-align:center;color:#888;font-size:12px;margin-bottom:20px;">合同类型：' + type + ' &nbsp;|&nbsp; 创建时间：' + new Date().toLocaleString('zh-CN') + '</p>';
  html += '<div style="background:#E8F4FD;padding:8px 12px;border-radius:4px;font-size:12px;color:#31708F;margin-bottom:16px;border-left:3px solid var(--fa-primary);"><i class="fa-solid fa-lightbulb" style="color:var(--fa-primary);"></i> 这是一个空白合同模板，请在线编辑合同内容。其他协作者可以同时编辑，所有修改将实时同步保存。</div>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第一条 合同主体</h3>';
  html += '<p>甲方：' + partyA + '</p>';
  html += '<p>乙方：' + partyB + '</p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第二条 合同标的</h3>';
  html += '<p><span style="color:#999;font-style:italic;">（请编辑填写合同标的物信息）</span></p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第三条 合同金额与支付</h3>';
  html += '<p>本合同总金额为人民币 ' + (amount > 0 ? amount.toLocaleString('zh-CN', {minimumFractionDigits:2}) : '【待填写】') + ' 元。</p>';
  html += '<p><span style="color:#999;font-style:italic;">（请编辑补充付款方式和期限）</span></p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第四条 交付与验收</h3>';
  html += '<p><span style="color:#999;font-style:italic;">（请编辑填写交付与验收条款）</span></p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第五条 质量保证</h3>';
  html += '<p><span style="color:#999;font-style:italic;">（请编辑填写质量保证条款）</span></p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第六条 违约责任</h3>';
  html += '<p><span style="color:#999;font-style:italic;">（请编辑填写违约责任条款）</span></p>';
  html += '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第七条 争议解决</h3>';
  html += '<p>因本合同引起的争议，双方应协商解决；协商不成的，任何一方均可向甲方所在地人民法院提起诉讼。</p>';
  html += '<div style="margin-top:40px;display:flex;justify-content:space-between;">';
  html += '<div><p><strong>甲方（盖章）：</strong>' + partyA + '</p><p style="margin-top:30px;">授权代表签字：_______________</p><p>日期：_______________</p></div>';
  html += '<div><p><strong>乙方（盖章）：</strong>' + partyB + '</p><p style="margin-top:30px;">授权代表签字：_______________</p><p>日期：_______________</p></div>';
  html += '</div>';
  $('#collabEditorBody').html(html);
  // 保存文档内容到存储
  collabDocContents[contractId] = html;
}

// ==================== 消息通知系统（增强版） ====================