// ==================== 侧边栏 ====================
function toggleSidebar() {
  $('#sidebar').toggleClass('show');
}

function toggleTreeview(el) {
  event.preventDefault();
  event.stopPropagation();
  $(el).closest('li.treeview').toggleClass('open');
}

function activateMenu(menuKey) {
  $('#sidebarMenu li').removeClass('active');
  if (menuKey) {
    var $item = $('#sidebarMenu li[data-menu="' + menuKey + '"]');
    $item.addClass('active');
    // 展开所有父级treeview
    $item.parents('li.treeview').addClass('open');
  }
}

// ==================== 页面切换 ====================
function switchPage(page) {
  try { if (event && event.preventDefault) event.preventDefault(); } catch(e) {}
  // 隐藏所有页面
  $('#pageDashboard, #pageContractList, #pageContractDetail, #pageContractApproval, #pageMyAudit, #pageAuditConfig, #pageContractEntity, #pageExcelImport, #pageFileImport, #pageCollabEdit, #pageInvoice, #pageNoRule, #pageOperationLog, #pageNotifyCenter, #pageContractDraft, #pageContractTemplate, #pageTemplateEditor').hide();
  // 重置侧边栏激活状态
  $('#sidebarMenu li').removeClass('active');
  var bc = $('#breadcrumbCurrent');
  var bcParent = bc.closest('ol').find('li:eq(1)');

  // 面包屑父级映射
  var parentMap = {
    dashboard: '首页', myAudit: '个人中心', collabTask: '个人中心', notifyRemind: '个人中心', myBorrow: '个人中心', myFavorite: '个人中心',
    contract: '合同档案', contractImport: '合同档案', contractBorrow: '合同档案',
    contractTemplate: '合同签订', generalClause: '合同签订', contractDraft: '合同签订', contractApproval: '合同签订', signMyAudit: '合同签订', contractSeal: '合同签订',
    fulfillPlan: '合同履约', contractInvoice: '合同履约', incomingInvoice: '合同履约', contractPayment: '合同履约', riskManage: '合同履约', contractChange: '合同履约', fulfillSummary: '合同履约',
    aiRecogImport: '合同AI工具', aiCompare: '合同AI工具', aiReview: '合同AI工具', aiWrite: '合同AI工具',
    counterPartyLib: '相对方管理', counterPartyEval: '相对方管理', counterPartyRisk: '相对方管理', counterPartyBlack: '相对方管理',
    contractStats: '报表中心', counterPartyStats: '报表中心', financeStats: '报表中心',
    contractEntity: '基础设置', contractCategory: '基础设置', counterPartySetting: '基础设置', approvalFlow: '基础设置', noRule: '基础设置',
    notifySetting: '基础设置', sealManage: '基础设置', aiModelConfig: '基础设置', bizApiConfig: '基础设置',
    emailConfig: '基础设置', smsConfig: '基础设置', fileStorageConfig: '基础设置', dataBackup: '基础设置',
    accessLog: '安全管理', watermark: '安全管理', encryption: '安全管理', securityLevel: '安全管理', riskStrategy: '安全管理',
    excelImport: '合同档案', fileImport: '合同档案', collabEdit: '合同签订', invoice: '合同履约', approval: '个人中心'
  };

  // 面包屑标题映射
  var titleMap = {
    dashboard: '首页看板', myAudit: '待我审批', collabTask: '协作任务', notifyRemind: '通知提醒', myBorrow: '我的借阅', myFavorite: '我的收藏',
    contract: '合同台账', contractImport: '合同导入', contractBorrow: '合同借阅',
    contractTemplate: '合同模板', generalClause: '通用条款', contractDraft: '合同起草', contractApproval: '合同审批', signMyAudit: '待我审批', contractSeal: '合同用印',
    fulfillPlan: '履约计划', contractInvoice: '合同开票', incomingInvoice: '来票登记', contractPayment: '合同收付款', riskManage: '风险管理', contractChange: '合同变更', fulfillSummary: '履约总结',
    aiRecogImport: 'AI识别导入', aiCompare: '合同AI比对', aiReview: '合同AI审查', aiWrite: '合同AI智写',
    counterPartyLib: '相对方库', counterPartyEval: '相对方评价', counterPartyRisk: '相对方风控监测', counterPartyBlack: '相对方黑名单',
    contractStats: '合同统计', counterPartyStats: '相对方统计', financeStats: '财务统计',
    contractEntity: '合同主体维护', contractCategory: '合同类别维护', counterPartySetting: '相对方管理', approvalFlow: '审批流设置', noRule: '合同编号规则',
    notifySetting: '通知提醒设置', sealManage: '印章管理', aiModelConfig: 'AI模型配置', bizApiConfig: '工商接口配置',
    emailConfig: '邮件发送配置', smsConfig: '短信发送配置', fileStorageConfig: '文件存储配置', dataBackup: '数据备份',
    accessLog: '访问操作日志', watermark: '水印设置', encryption: '加密设置', securityLevel: '密级策略', riskStrategy: '风控策略',
    excelImport: 'Excel模板导入', fileImport: '合同文件导入', collabEdit: '协同编辑', invoice: '发票管理', approval: '我的审批'
  };

  // 更新面包屑
  bc.text(titleMap[page] || page);
  bcParent.text(parentMap[page] || '');
  // 激活菜单（部分页面key与data-menu不一致，需映射）
  var menuKeyMap = { contract: 'contractLedger', excelImport: 'contractImport', fileImport: 'contractImport', collabEdit: 'contractDraft', invoice: 'contractInvoice', approval: 'myAudit' };
  activateMenu(menuKeyMap[page] || page);

  // ========== 有专属页面的：显示对应页面 ==========
  if (page === 'dashboard') {
    previousPage = 'dashboard';
    $('#pageDashboard').show();
    renderDashboard();
  } else if (page === 'myAudit') {
    previousPage = 'myAudit';
    $('#pageMyAudit').show();
    renderMyAuditTable(myAuditList);
  } else if (page === 'signMyAudit') {
    previousPage = 'signMyAudit';
    $('#pageMyAudit').show();
    renderMyAuditTable(myAuditList);
  } else if (page === 'contract') {
    previousPage = 'contract';
    $('#pageContractList').show();
    renderContractTable(contracts); updateTotalCount();
  } else if (page === 'contractApproval') {
    previousPage = 'contractApproval';
    $('#pageContractApproval').show();
    renderContractApprovalTable();
  } else if (page === 'contractInvoice') {
    $('#pageInvoice').show();
    renderInvoiceList();
  } else if (page === 'contractEntity') {
    previousPage = 'contractEntity';
    $('#pageContractEntity').show();
    renderEntityTable();
  } else if (page === 'approvalFlow') {
    $('#pageAuditConfig').show();
    renderFlowTable();
  } else if (page === 'noRule') {
    $('#pageNoRule').show();
    renderNoRuleTable();
  } else if (page === 'accessLog') {
    $('#pageOperationLog').show();
    renderOperationLogTable();
  } else if (page === 'excelImport') {
    $('#pageExcelImport').show();
  } else if (page === 'fileImport') {
    $('#pageFileImport').show();
  } else if (page === 'collabEdit') {
    $('#pageCollabEdit').show();
    renderCollabEditList();
  } else if (page === 'invoice') {
    $('#pageInvoice').show();
    renderInvoiceList();
  } else if (page === 'approval') {
    $('#pageContractList').show();
    var pending = contracts.filter(function(c){ return c.status === 'approving' || c.status === 'sealing' || c.status === 'archiving'; });
    renderContractTable(pending); updateTotalCount();
  } else if (page === 'notifyRemind') {
    $('#pageNotifyCenter').show();
    renderNotifyCenterList();
    updateNotifyCenterStats();
  } else if (page === 'contractDraft') {
    previousPage = 'contractDraft';
    $('#pageContractDraft').show();
    renderDraftTable();
  } else if (page === 'contractTemplate') {
    previousPage = 'contractTemplate';
    $('#pageContractTemplate').show();
    renderTemplateTable();
  } else if (page === 'templateEditor') {
    previousPage = 'templateEditor';
    $('#pageTemplateEditor').show();
  }
  // ========== 无专属页面：留空（不显示任何页面） ==========
}

function filterByStatus(status) {
  $('#pageContractList').show();
  $('#pageContractDetail').hide();
  $('#searchStatus').val(status);
  applyFilter();
}

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
  $('#totalCount').text(contracts.length);
  $('#pageTotalCount').text(visible > 0 ? visible : contracts.length);
}

// ==================== 筛选 ====================
function applyFilter() {
  let status = $('#searchStatus').val();
  let type = $('#searchType').val();
  let name = $('#searchName').val().toLowerCase();
  let no = $('#searchNo').val().toLowerCase();

  let filtered = contracts.filter(function(c){
    if (status && c.status !== status) return false;
    if (type && (c.category||c.type) !== type) return false;
    if (name && c.name.toLowerCase().indexOf(name) === -1) return false;
    if (no && c.no.toLowerCase().indexOf(no) === -1) return false;
    return true;
  });
  renderContractTable(filtered);
  updateTotalCount();
}

function resetFilter() {
  $('#searchStatus').val('');
  $('#searchType').val('');
  $('#searchName').val('');
  $('#searchNo').val('');
  renderContractTable(contracts);
  updateTotalCount();
}

// ==================== 全选 ====================
function toggleCheckAll() {
  let checked = $('#checkAll').prop('checked');
  $('.check-item').prop('checked', checked);
}

// ==================== 辅助功能 ====================
function setOpinion(text) {
  $('#opinionText').val(text);
}

function viewContract(id) {
  openContractDetail(id);
}

function printContract(id) {
  alert('正在生成打印预览...');
}

function refreshList() {
  renderContractTable(contracts);
  updateTotalCount();
  alert('列表已刷新。');
}

function exportData() {
  alert('正在导出合同数据...');
}

// ==================== 首页看板渲染 ====================
function renderDashboard() {
  // 1. 统计卡片
  var approvingCount = contracts.filter(function(c){ return c.status === 'approving'; }).length;
  var myAuditCount = (typeof myAuditList !== 'undefined') ? myAuditList.length : 0;
  var draftCount = contracts.filter(function(c){ return c.status === 'draft'; }).length;
  var collabTaskCount = 5;
  var myBorrowCount = 3;
  var myFavoriteCount = 7;

  $('#dashApproving').text(approvingCount);
  $('#dashMyAudit').text(myAuditCount);
  $('#dashDrafts').text(draftCount);
  $('#dashCollabTask').text(collabTaskCount);
  $('#dashMyBorrow').text(myBorrowCount);
  $('#dashMyFavorite').text(myFavoriteCount);

  // 2. 待办事项（待我审批列表）
  if (typeof myAuditList !== 'undefined' && myAuditList.length > 0) {
    var todoHtml = '';
    myAuditList.slice(0, 5).forEach(function(item) {
      var urgencyIcon = item.urgency === '紧急' ? '<i class="fa-solid fa-circle-exclamation" style="color:var(--fa-danger);"></i>' : (item.urgency === '超时' ? '<i class="fa-solid fa-clock" style="color:var(--fa-danger);"></i>' : '<i class="fa-regular fa-clock" style="color:var(--fa-warning);"></i>');
      todoHtml += '<div class="dash-list-item">';
      todoHtml += '<div class="dash-icon" style="background:#FFF3E0;color:#E65100;"><i class="fa-solid fa-file-contract"></i></div>';
      todoHtml += '<div class="dash-info"><div class="dash-title">'+item.name+'</div><div class="dash-desc">'+item.currentNode+' · '+item.submitTime+'</div></div>';
      todoHtml += '<a href="#" onclick="switchPage(\'myAudit\');return false;" class="dash-action">处理</a>';
      todoHtml += '</div>';
    });
    $('#dashTodoList').html(todoHtml);
  } else {
    $('#dashTodoList').html('<div class="dash-empty"><i class="fa-solid fa-check-circle" style="color:var(--fa-success);"></i>暂无待办事项</div>');
  }

  // 3. 我的草稿
  var myDrafts = contracts.filter(function(c){ return c.status === 'draft'; });
  if (myDrafts.length > 0) {
    var draftHtml = '';
    myDrafts.slice(0, 5).forEach(function(c) {
      draftHtml += '<div class="dash-list-item">';
      draftHtml += '<div class="dash-icon" style="background:var(--fa-primary-light);color:var(--fa-primary);"><i class="fa-solid fa-pen"></i></div>';
      draftHtml += '<div class="dash-info"><div class="dash-title">'+c.name+'</div><div class="dash-desc">¥ '+c.amount.toLocaleString('zh-CN')+' · '+c.createTime+'</div></div>';
      draftHtml += '<a href="#" onclick="editContract('+c.id+');return false;" class="dash-action">编辑</a>';
      draftHtml += '</div>';
    });
    $('#dashDraftList').html(draftHtml);
  } else {
    $('#dashDraftList').html('<div class="dash-empty"><i class="fa-solid fa-inbox"></i>暂无草稿合同</div>');
  }

  // 4. 消息提醒（未读消息）
  if (typeof notifyMessages !== 'undefined') {
    var unreadMessages = notifyMessages.filter(function(m){ return !m.read; });
    if (unreadMessages.length > 0) {
      $('#dashMsgBadge').text(unreadMessages.length).show();
    } else {
      $('#dashMsgBadge').text('').hide();
    }
    if (unreadMessages.length > 0) {
      var notifyHtml = '';
      unreadMessages.slice(0, 5).forEach(function(m) {
        var cfg = (typeof MSG_TYPE_CONFIG !== 'undefined') ? (MSG_TYPE_CONFIG[m.type] || MSG_TYPE_CONFIG.system) : { label: m.type, icon: 'fa-solid fa-bell', color: '#1565C0' };
        notifyHtml += '<div class="dash-list-item">';
        notifyHtml += '<div class="dash-icon" style="background:'+cfg.bg+';color:'+cfg.color+';"><i class="'+cfg.icon+'"></i></div>';
        notifyHtml += '<div class="dash-info"><div class="dash-title">'+m.title+'</div><div class="dash-desc">'+m.desc+'</div></div>';
        notifyHtml += '<a href="#" onclick="switchPage(\'notifyRemind\');return false;" class="dash-action">查看</a>';
        notifyHtml += '</div>';
      });
      $('#dashNotifyList').html(notifyHtml);
    } else {
      $('#dashNotifyList').html('<div class="dash-empty"><i class="fa-regular fa-bell-slash"></i>暂无新消息</div>');
    }
  } else {
    $('#dashNotifyList').html('<div class="dash-empty"><i class="fa-regular fa-bell-slash"></i>暂无新消息</div>');
  }

  // 5. 协作任务
  var collabTasks = [
    { name: '医疗器械采购合同审核', desc: '法务审核 · 待处理' },
    { name: '护理服务合作协议会签', desc: '联合会审 · 进行中' },
    { name: '药品供应合同续签', desc: '部门评审 · 待回复' }
  ];
  var taskHtml = '';
  collabTasks.forEach(function(t) {
    taskHtml += '<div class="dash-list-item">';
    taskHtml += '<div class="dash-icon" style="background:#E3F2FD;color:#1565C0;"><i class="fa-solid fa-people-arrows"></i></div>';
    taskHtml += '<div class="dash-info"><div class="dash-title">'+t.name+'</div><div class="dash-desc">'+t.desc+'</div></div>';
    taskHtml += '</div>';
  });
  $('#dashCollabTaskList').html(taskHtml);

}

// ==================== 右侧抽屉弹框 ====================
var currentDrawerType = '';

function openDashDrawer(type) {
  currentDrawerType = type;
  var titles = {
    approving: '审批中合同',
    myAudit: '待我审批',
    draft: '我的草稿',
    collabTask: '协作任务',
    borrow: '我的借阅',
    favorite: '我的收藏'
  };
  var icons = {
    approving: 'fa-solid fa-spinner',
    myAudit: 'fa-solid fa-clipboard-list',
    draft: 'fa-solid fa-pen',
    collabTask: 'fa-solid fa-people-arrows',
    borrow: 'fa-solid fa-book-open-reader',
    favorite: 'fa-regular fa-star'
  };
  $('#dashDrawerTitle').html('<i class="'+icons[type]+'"></i> '+titles[type]);
  $('#dashDrawerSearch').val('');
  $('#dashDrawer').addClass('show');
  $('#dashDrawerOverlay').addClass('show');
  renderDashDrawerList();
}

function closeDashDrawer() {
  $('#dashDrawer').removeClass('show');
  $('#dashDrawerOverlay').removeClass('show');
}

function renderDashDrawerList() {
  var keyword = ($('#dashDrawerSearch').val() || '').toLowerCase();
  var listData = [];
  var emptyText = '';
  
  if (currentDrawerType === 'approving') {
    listData = contracts.filter(function(c){ return c.status === 'approving'; });
  } else if (currentDrawerType === 'myAudit') {
    listData = typeof myAuditList !== 'undefined' ? myAuditList : [];
  } else if (currentDrawerType === 'draft') {
    listData = contracts.filter(function(c){ return c.status === 'draft'; });
  } else if (currentDrawerType === 'collabTask') {
    listData = [
      { name: '医疗器械采购合同审核', desc: '法务审核 · 待处理' },
      { name: '护理服务合作协议会签', desc: '联合会审 · 进行中' },
      { name: '药品供应合同续签', desc: '部门评审 · 待回复' },
      { name: '办公区域租赁合同会签', desc: '联合会审 · 待处理' },
      { name: '物流配送服务合同初审', desc: '部门评审 · 已完成' }
    ];
  } else if (currentDrawerType === 'borrow') {
    listData = [
      { id: 1, name: '医疗器械采购合同', desc: '借阅至 2026-06-15' },
      { id: 7, name: '物流配送服务合同', desc: '借阅至 2026-07-01' }
    ];
  } else if (currentDrawerType === 'favorite') {
    listData = [
      { name: '采购合同标准模板', desc: '合同模板 - 可快速创建采购合同' },
      { name: '服务合同通用条款', desc: '通用条款 - 适用于服务类合同' }
    ];
  }

  // 搜索过滤
  if (keyword) {
    listData = listData.filter(function(item){
      return (item.name || '').toLowerCase().indexOf(keyword) >= 0 ||
             (item.desc || '').toLowerCase().indexOf(keyword) >= 0;
    });
  }

  var html = '';
  if (listData.length === 0) {
    html = '<div class="dash-drawer-empty"><i class="fa-solid fa-inbox"></i>暂无记录</div>';
  } else {
    listData.forEach(function(item){
      var onClick = '';
      if (currentDrawerType === 'approving' && item.id) {
        onClick = ' onclick="closeDashDrawer();openContractDetail('+item.id+');return false;"';
      } else if (currentDrawerType === 'myAudit' && item.id) {
        onClick = ' onclick="closeDashDrawer();switchPage(\'myAudit\');return false;"';
      } else if (currentDrawerType === 'draft' && item.id) {
        onClick = ' onclick="closeDashDrawer();editContract('+item.id+');return false;"';
      } else if (currentDrawerType === 'borrow' && item.id) {
        onClick = ' onclick="closeDashDrawer();switchPage(\'contract\');setTimeout(function(){openContractDetail('+item.id+')},300);return false;"';
      } else if (currentDrawerType === 'favorite') {
        onClick = '';
      }
      html += '<div class="dash-drawer-item" style="cursor:pointer;"'+onClick+'>';
      html += '<div class="drawer-info"><div class="drawer-title">'+(item.name||item.contractName||'')+'</div>';
      html += '<div class="drawer-desc">'+(item.desc||item.currentNode||item.contractNo||'')+'</div></div>';
      html += '</div>';
    });
  }
  $('#dashDrawerBody').html(html);
}
