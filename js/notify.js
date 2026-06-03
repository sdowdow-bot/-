// ==================== 消息通知系统（增强版） ====================

// 消息类型配置
const MSG_TYPE_CONFIG = {
  system:  { label: '系统通知', icon: 'fa-solid fa-gear',              color: '#1565C0', bg: '#E3F2FD', tag: 'tag-system' },
  audit:   { label: '审核通知', icon: 'fa-solid fa-clipboard-check',   color: '#E65100', bg: '#FFF3E0', tag: 'tag-audit' },
  cc:      { label: '抄送通知', icon: 'fa-solid fa-share-from-square', color: '#2E7D32', bg: '#E8F5E9', tag: 'tag-cc' },
  remind:  { label: '提醒通知', icon: 'fa-solid fa-clock',             color: '#C62828', bg: '#FCE4EC', tag: 'tag-remind' },
  expire:  { label: '到期通知', icon: 'fa-solid fa-hourglass-half',    color: '#F57F17', bg: '#FFF8E1', tag: 'tag-expire' },
  change:  { label: '变更通知', icon: 'fa-solid fa-rotate',            color: '#6A1B9A', bg: '#F3E5F5', tag: 'tag-change' }
};

// 消息跳转路由映射
const MSG_ROUTE_MAP = {
  system:      { page: 'contract',      action: 'list' },
  audit:       { page: 'myAudit',       action: 'auditDetail' },
  cc:          { page: 'contract',      action: 'contractDetail' },
  remind:      { page: 'contract',      action: 'contractDetail' },
  expire:      { page: 'contract',      action: 'contractDetail' },
  change:      { page: 'contract',      action: 'contractDetail' }
};

// 消息数据
let notifyMessages = [
  { id: 1,  type: 'cc',     title: '合同抄送通知',     desc: '王主管将《医疗器械采购合同》抄送给你，请知悉',                                     contractId: 1, contractNo: 'HT-2026-001', contractName: '医疗器械采购合同',       sender: '王主管',   priority: 'medium', time: '2026-07-28 09:15:00', read: false,
    detail: '王主管于2026年7月28日将《医疗器械采购合同》（编号：HT-2026-001）抄送给你，请及时查阅合同内容。合同金额：¥580,000.00，签约方：华润医疗器械有限公司。', linkPage: 'contract', linkLabel: '关联合同' },
  { id: 2,  type: 'cc',     title: '合同抄送通知',     desc: '李总监将《护理服务合作协议》抄送给你，请知悉',                                     contractId: 2, contractNo: 'HT-2026-002', contractName: '护理服务合作协议',       sender: '李总监',   priority: 'low',    time: '2026-07-27 16:30:00', read: false,
    detail: '李总监于2026年7月27日将《护理服务合作协议》（编号：HT-2026-002）抄送给你。该协议涉及年度护理服务外包项目，合同金额：¥320,000.00。', linkPage: 'contract', linkLabel: '关联合同' },
  { id: 3,  type: 'audit',  title: '审批通过通知',     desc: '《医疗设备租赁合同》已通过法务审核',                                               contractId: 3, contractNo: 'HT-2026-003', contractName: '医疗设备租赁合同',       sender: '法务部-张律师', priority: 'high', time: '2026-07-27 14:20:00', read: false,
    detail: '你提交的《医疗设备租赁合同》（编号：HT-2026-003）已于2026年7月27日通过法务审核。审核意见：合同条款合法合规，建议签署。下一步：请安排用印流程。', linkPage: 'myAudit', linkLabel: '前往审批' },
  { id: 4,  type: 'cc',     title: '合同抄送通知',     desc: '陈总监将《药品集中采购框架协议》抄送给你，请知悉',                                 contractId: 4, contractNo: 'HT-2026-004', contractName: '药品集中采购框架协议',   sender: '陈总监',   priority: 'low',    time: '2026-07-26 11:00:00', read: true,
    detail: '陈总监于2026年7月26日将《药品集中采购框架协议》（编号：HT-2026-004）抄送给你。该协议为年度框架协议，涉及多个药品品规的集中采购。', linkPage: 'contract', linkLabel: '关联合同' },
  { id: 5,  type: 'audit',  title: '待审批通知',       desc: '《物流配送服务合同》提交审批，请你审核',                                           contractId: 7, contractNo: 'HT-2026-007', contractName: '物流配送服务合同',       sender: '采购部-刘经理', priority: 'high', time: '2026-07-26 09:45:00', read: false,
    detail: '刘经理提交的《物流配送服务合同》（编号：HT-2026-007）正在等待你的审批。合同金额：¥156,000.00，签约方：顺丰速运有限公司，合同期限：2026年8月1日至2027年7月31日。请及时审核。', linkPage: 'myAudit', linkLabel: '前往审批' },
  { id: 6,  type: 'expire', title: '合同即将到期',     desc: '《医疗设备租赁合同》将于30天后到期，请及时处理',                                   contractId: 3, contractNo: 'HT-2026-003', contractName: '医疗设备租赁合同',       sender: '系统',     priority: 'high',   time: '2026-07-25 08:00:00', read: true,
    detail: '《医疗设备租赁合同》（编号：HT-2026-003）将于2026年8月25日到期，距今仅剩30天。请及时联系签约方商讨续约事宜，或安排合同终止流程。如需续签，请在到期前15天启动续签审批。', linkPage: 'contract', linkLabel: '查看合同' },
  { id: 7,  type: 'cc',     title: '合同抄送通知',     desc: '赵主管将《康复辅具采购合同》抄送给你，请知悉',                                     contractId: 6, contractNo: 'HT-2026-006', contractName: '康复辅具采购合同',       sender: '赵主管',   priority: 'low',    time: '2026-07-24 15:30:00', read: true,
    detail: '赵主管于2026年7月24日将《康复辅具采购合同》（编号：HT-2026-006）抄送给你。合同金额：¥245,000.00，涉及康复训练设备及辅具采购。', linkPage: 'contract', linkLabel: '关联合同' },
  { id: 8,  type: 'system', title: '归档完成通知',     desc: '《物流配送服务合同》已完成归档',                                                   contractId: 7, contractNo: 'HT-2026-007', contractName: '物流配送服务合同',       sender: '系统',     priority: 'low',    time: '2026-07-24 10:00:00', read: true,
    detail: '《物流配送服务合同》（编号：HT-2026-007）已于2026年7月24日完成归档操作。归档编号：DA-2026-0042，归档位置：电子档案库/2026年度/服务合同类。如需借阅，请通过合同借阅功能申请。', linkPage: 'contract', linkLabel: '查看合同' },
  { id: 9,  type: 'audit',  title: '审批驳回通知',     desc: '《康复辅具采购合同》已被财务部驳回，请修改后重新提交',                             contractId: 6, contractNo: 'HT-2026-006', contractName: '康复辅具采购合同',       sender: '财务部-孙总监', priority: 'high', time: '2026-07-23 17:00:00', read: true,
    detail: '你提交的《康复辅具采购合同》（编号：HT-2026-006）已被财务部孙总监驳回。驳回原因：合同付款条款中未约定质保金比例，建议增加5%-10%质保金条款后重新提交审批。', linkPage: 'myAudit', linkLabel: '前往处理' },
  { id: 10, type: 'cc',     title: '合同抄送通知',     desc: '刘经理将《办公区域租赁合同》抄送给你，请知悉',                                     contractId: 5, contractNo: 'HT-2026-005', contractName: '办公区域租赁合同',       sender: '刘经理',   priority: 'low',    time: '2026-07-22 14:10:00', read: true,
    detail: '刘经理于2026年7月22日将《办公区域租赁合同》（编号：HT-2026-005）抄送给你。合同金额：¥480,000.00/年，租赁期限：3年。', linkPage: 'contract', linkLabel: '关联合同' },
  { id: 11, type: 'remind', title: '付款提醒',         desc: '《医疗器械采购合同》将于3天后支付第二期款项¥174,000.00',                           contractId: 1, contractNo: 'HT-2026-001', contractName: '医疗器械采购合同',       sender: '系统',     priority: 'high',   time: '2026-07-28 08:00:00', read: false,
    detail: '根据《医疗器械采购合同》（编号：HT-2026-001）付款计划，第二期款项¥174,000.00将于2026年7月31日到期支付。请及时确认付款事宜，确保按期支付。付款条件：到货验收合格后15个工作日内支付。', linkPage: 'contractPayment', linkLabel: '前往付款' },
  { id: 12, type: 'system', title: '系统维护通知',     desc: '系统将于2026年7月30日凌晨2:00-4:00进行维护升级',                                   contractId: null, contractNo: '', contractName: '', sender: '系统管理员', priority: 'medium', time: '2026-07-28 10:00:00', read: false,
    detail: '合同管理系统将于2026年7月30日凌晨2:00-4:00进行例行维护升级。升级内容：1.新增合同AI智能比对功能；2.优化审批流程性能；3.修复已知问题。维护期间系统将暂停服务，请提前做好工作安排。', linkPage: 'dashboard', linkLabel: '返回首页' },
  { id: 13, type: 'change', title: '合同变更通知',     desc: '《办公区域租赁合同》已发起变更申请，租赁面积调整',                                 contractId: 5, contractNo: 'HT-2026-005', contractName: '办公区域租赁合同',       sender: '行政部-周主管', priority: 'medium', time: '2026-07-27 11:30:00', read: false,
    detail: '行政部周主管对《办公区域租赁合同》（编号：HT-2026-005）发起变更申请。变更内容：租赁面积由原500㎡调整为650㎡，月租金相应调整。变更原因：部门扩编需增加办公面积。请审核变更申请。', linkPage: 'contractChange', linkLabel: '前往审核' },
  { id: 14, type: 'remind', title: '签署提醒',         desc: '《护理服务合作协议》已完成审批，请尽快安排签署',                                   contractId: 2, contractNo: 'HT-2026-002', contractName: '护理服务合作协议',       sender: '系统',     priority: 'medium', time: '2026-07-27 09:00:00', read: true,
    detail: '《护理服务合作协议》（编号：HT-2026-002）已于2026年7月26日完成全部审批流程，请尽快安排合同签署。签约方：安康护理服务有限公司，合同金额：¥320,000.00。', linkPage: 'contractSeal', linkLabel: '前往用印' },
  { id: 15, type: 'expire', title: '合同到期预警',     desc: '《办公区域租赁合同》将于60天后到期',                                               contractId: 5, contractNo: 'HT-2026-005', contractName: '办公区域租赁合同',       sender: '系统',     priority: 'medium', time: '2026-07-26 08:00:00', read: false,
    detail: '《办公区域租赁合同》（编号：HT-2026-005）将于2026年9月25日到期，距今还有60天。当前合同存在变更申请，请先处理变更后再进行续约评估。', linkPage: 'contract', linkLabel: '查看合同' },
  { id: 16, type: 'audit',  title: '加急审批通知',     desc: '《药品集中采购框架协议》标记为加急，请优先处理',                                   contractId: 4, contractNo: 'HT-2026-004', contractName: '药品集中采购框架协议',   sender: '采购部-陈总监', priority: 'high',   time: '2026-07-28 10:30:00', read: false,
    detail: '陈总监提交的《药品集中采购框架协议》（编号：HT-2026-004）已标记为加急审批。原因：供应商要求7月30日前确认合作意向，否则将调整价格方案。请优先处理此审批事项。', linkPage: 'myAudit', linkLabel: '前往审批' },
  { id: 17, type: 'system', title: '权限变更通知',     desc: '你已被授予"合同审批-高级"权限',                                                   contractId: null, contractNo: '', contractName: '', sender: '系统管理员', priority: 'low',    time: '2026-07-25 14:00:00', read: true,
    detail: '系统管理员已于2026年7月25日为你授予"合同审批-高级"权限。新增权限范围：1.可审批金额500万以上合同；2.可审批涉外合同；3.可指定审批加急标识。如对权限有疑问，请联系系统管理员。', linkPage: 'dashboard', linkLabel: '返回首页' },
  { id: 18, type: 'change', title: '合同变更完成通知', desc: '《医疗器械采购合同》变更已完成审批，交货期调整已生效',                             contractId: 1, contractNo: 'HT-2026-001', contractName: '医疗器械采购合同',       sender: '系统',     priority: 'medium', time: '2026-07-24 16:00:00', read: true,
    detail: '《医疗器械采购合同》（编号：HT-2026-001）的变更申请已通过全部审批。变更内容：交货期由原30天调整为45天，其他条款不变。变更后的合同已自动更新，请查阅最新版本。', linkPage: 'contract', linkLabel: '查看合同' },
  { id: 19, type: 'remind', title: '开票提醒',         desc: '《医疗设备租赁合同》本月租金¥40,000.00待开票',                                    contractId: 3, contractNo: 'HT-2026-003', contractName: '医疗设备租赁合同',       sender: '系统',     priority: 'medium', time: '2026-07-25 09:00:00', read: false,
    detail: '根据《医疗设备租赁合同》（编号：HT-2026-003）约定，本月租金¥40,000.00待开具发票。请于7月31日前完成开票操作。发票类型：增值税专用发票，税率：6%。', linkPage: 'contractInvoice', linkLabel: '前往开票' },
  { id: 20, type: 'system', title: '数据备份完成',     desc: '2026年7月合同数据已自动备份完成',                                                  contractId: null, contractNo: '', contractName: '', sender: '系统',     priority: 'low',    time: '2026-07-28 03:00:00', read: true,
    detail: '2026年7月合同数据自动备份已于2026年7月28日03:00完成。备份数据量：合同记录28条，审批记录156条，操作日志2,340条。备份位置：云端存储/2026年7月。如需恢复数据，请联系系统管理员。', linkPage: 'dashboard', linkLabel: '返回首页' }
];

let currentNotifyTab = 'all';
let currentMsgCenterTab = 'all';
let currentMsgDetailId = null;
let msgCenterPage = 1;
const MSG_PAGE_SIZE = 8;

// ============ 顶部通知下拉面板 ============
function toggleNotifyPanel(e) {
  e.stopPropagation();
  let dd = $('#notifyDropdown');
  if (dd.hasClass('show')) {
    dd.removeClass('show');
  } else {
    dd.addClass('show');
    renderNotifyList();
  }
}

// 点击外部关闭
$(document).on('click', function(e) {
  if (!$(e.target).closest('#notifyDropdown, .notify').length) {
    $('#notifyDropdown').removeClass('show');
  }
  if (!$(e.target).closest('.tag-multi-select').length) {
    $('.tag-dropdown').removeClass('show');
  }
});

function switchNotifyTab(tab, el) {
  currentNotifyTab = tab;
  $('.nd-tab').removeClass('active');
  $(el).addClass('active');
  renderNotifyList();
}

function renderNotifyList() {
  let filtered = currentNotifyTab === 'all' ? notifyMessages : notifyMessages.filter(function(m){ return m.type === currentNotifyTab; });
  // 按时间倒序，未读优先
  filtered.sort(function(a,b){ 
    if(a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.time) - new Date(a.time);
  });
  let html = '';
  if (filtered.length === 0) {
    html = '<div class="nd-empty"><i class="fa-regular fa-bell-slash" style="font-size:28px;display:block;margin-bottom:8px;"></i>暂无消息</div>';
  } else {
    filtered.slice(0, 8).forEach(function(m) {
      var cfg = MSG_TYPE_CONFIG[m.type] || MSG_TYPE_CONFIG.system;
      html += '<div class="nd-item' + (m.read ? '' : ' nd-unread') + '" onclick="event.stopPropagation();openNotifyDetail(' + m.id + ')">';
      html += '<div class="nd-icon ' + m.type + '"><i class="' + cfg.icon + '"></i></div>';
      html += '<div class="nd-body">';
      html += '<div class="nd-title"><span style="color:' + cfg.color + ';font-weight:500;">[' + cfg.label + ']</span> ' + m.title + '</div>';
      html += '<div class="nd-desc">' + m.desc + '</div>';
      html += '<div class="nd-time"><i class="fa-regular fa-clock" style="margin-right:3px;"></i>' + formatMsgTime(m.time) + '</div>';
      html += '</div>';
      if (!m.read) html += '<span style="width:8px;height:8px;border-radius:50%;background:var(--fa-primary);flex-shrink:0;margin-top:4px;"></span>';
      html += '<i class="fa-solid fa-chevron-right nd-arrow"></i>';
      html += '</div>';
    });
  }
  $('#notifyList').html(html);
  updateNotifyBadge();
  updateTabBadges();
}

function openNotifyDetail(msgId) {
  let msg = notifyMessages.find(function(m){ return m.id === msgId; });
  if (!msg) return;
  msg.read = true;
  renderNotifyList();
  $('#notifyDropdown').removeClass('show');
  // 审核通知（待我审核）直接跳转待我审批页面
  if (msg.type === 'audit') {
    switchPage('myAudit');
    return;
  }
  // 抄送通知直接跳转合同详情
  if (msg.type === 'cc' && msg.contractId) {
    switchPage('contract');
    setTimeout(function(){ openContractDetail(msg.contractId); }, 200);
    return;
  }
  openMsgDetailModal(msgId);
}

function clearAllNotify() {
  notifyMessages.forEach(function(m){ m.read = true; });
  renderNotifyList();
  showNotifyToast('已将所有消息标记为已读', 'success');
}

function updateNotifyBadge() {
  let unread = notifyMessages.filter(function(m){ return !m.read; }).length;
  let $badge = $('#notifyBadge');
  if (unread > 0) {
    $badge.text(unread > 99 ? '99+' : unread).show();
  } else {
    $badge.text('').hide();
  }
}

function updateTabBadges() {
  var types = ['all', 'cc', 'audit', 'system', 'remind', 'expire'];
  types.forEach(function(t) {
    var count;
    if (t === 'all') {
      count = notifyMessages.filter(function(m){ return !m.read; }).length;
    } else {
      count = notifyMessages.filter(function(m){ return m.type === t && !m.read; }).length;
    }
    var $el = t === 'all' ? $('#tabBadgeAll') : $('#tabBadge' + t.charAt(0).toUpperCase() + t.slice(1));
    if ($el.length) {
      if (count > 0) { $el.text(count).attr('data-count', count); } 
      else { $el.text('').attr('data-count', '0'); }
    }
  });
}

// ============ 消息中心页面 ============
function switchMsgCenterTab(type, el) {
  currentMsgCenterTab = type;
  msgCenterPage = 1;
  $('.msg-type-tab').removeClass('active');
  $(el).addClass('active');
  renderNotifyCenterList();
}

function renderNotifyCenterList() {
  var filtered = getFilteredMessages();
  var total = filtered.length;
  var totalPages = Math.max(1, Math.ceil(total / MSG_PAGE_SIZE));
  if (msgCenterPage > totalPages) msgCenterPage = totalPages;
  var start = (msgCenterPage - 1) * MSG_PAGE_SIZE;
  var end = Math.min(start + MSG_PAGE_SIZE, total);
  var pageData = filtered.slice(start, end);

  var html = '';
  if (pageData.length === 0) {
    html = '<div class="msg-empty-state"><i class="fa-regular fa-bell-slash"></i><p>暂无消息通知</p></div>';
  } else {
    pageData.forEach(function(m) {
      var cfg = MSG_TYPE_CONFIG[m.type] || MSG_TYPE_CONFIG.system;
      html += '<div class="msg-list-item' + (m.read ? '' : ' msg-unread') + '" onclick="openNotifyDetail(' + m.id + ')">';
      html += '<div class="msg-icon type-' + m.type + '"><i class="' + cfg.icon + '"></i></div>';
      html += '<div class="msg-content">';
      html += '<div class="msg-title-row">';
      html += '<span class="msg-title">' + m.title + '</span>';
      html += '<span class="msg-type-tag ' + cfg.tag + '">' + cfg.label + '</span>';
      html += '</div>';
      html += '<div class="msg-desc">' + m.desc + '</div>';
      html += '<div class="msg-meta">';
      html += '<span><i class="fa-regular fa-clock" style="margin-right:3px;"></i>' + formatMsgTime(m.time) + '</span>';
      if (m.contractNo) html += '<span class="msg-contract-no"><i class="fa-solid fa-link" style="margin-right:3px;"></i>' + m.contractNo + '</span>';
      html += '<span><i class="fa-regular fa-user" style="margin-right:3px;"></i>' + m.sender + '</span>';

      html += '</div>';
      html += '</div>';
      html += '<div class="msg-actions">';
      if (!m.read) html += '<div class="msg-unread-dot"></div>';
      html += '<div class="msg-go-btn"><i class="fa-solid fa-arrow-right"></i> 查看详情</div>';
      html += '</div>';
      html += '</div>';
    });
  }
  $('#msgCenterList').html(html);

  // 分页信息
  $('#msgPageStart').text(total > 0 ? start + 1 : 0);
  $('#msgPageEnd').text(end);
  $('#msgPageTotal').text(total);

  // 分页按钮
  var pageHtml = '';
  pageHtml += '<button class="btn btn-default btn-xs" onclick="goMsgPage(' + (msgCenterPage - 1) + ')" ' + (msgCenterPage <= 1 ? 'disabled' : '') + '><i class="fa-solid fa-chevron-left"></i></button>';
  for (var p = 1; p <= totalPages; p++) {
    if (totalPages > 7 && Math.abs(p - msgCenterPage) > 2 && p !== 1 && p !== totalPages) {
      if (p === 2 || p === totalPages - 1) pageHtml += '<span style="padding:0 4px;color:#999;">...</span>';
      continue;
    }
    pageHtml += '<button class="btn btn-xs ' + (p === msgCenterPage ? 'btn-primary' : 'btn-default') + '" onclick="goMsgPage(' + p + ')">' + p + '</button>';
  }
  pageHtml += '<button class="btn btn-default btn-xs" onclick="goMsgPage(' + (msgCenterPage + 1) + ')" ' + (msgCenterPage >= totalPages ? 'disabled' : '') + '><i class="fa-solid fa-chevron-right"></i></button>';
  $('#msgPageBtns').html(pageHtml);

  updateNotifyCenterStats();
  updateMsgTabCounts();
  updateNotifyBadge();
  updateTabBadges();
}

function getFilteredMessages() {
  var type = currentMsgCenterTab;
  var status = $('#msgFilterStatus').val();
  var keyword = ($('#msgFilterKeyword').val() || '').trim().toLowerCase();

  var filtered = notifyMessages;
  if (type !== 'all') filtered = filtered.filter(function(m){ return m.type === type; });
  if (status === 'unread') filtered = filtered.filter(function(m){ return !m.read; });
  if (status === 'read') filtered = filtered.filter(function(m){ return m.read; });
  if (keyword) filtered = filtered.filter(function(m){ 
    return (m.title || '').toLowerCase().indexOf(keyword) >= 0 || 
           (m.desc || '').toLowerCase().indexOf(keyword) >= 0 ||
           (m.contractNo || '').toLowerCase().indexOf(keyword) >= 0 ||
           (m.contractName || '').toLowerCase().indexOf(keyword) >= 0;
  });
  // 按时间倒序，未读优先
  filtered.sort(function(a,b){ 
    if(a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.time) - new Date(a.time);
  });
  return filtered;
}

function goMsgPage(p) {
  var total = getFilteredMessages().length;
  var totalPages = Math.max(1, Math.ceil(total / MSG_PAGE_SIZE));
  if (p < 1 || p > totalPages) return;
  msgCenterPage = p;
  renderNotifyCenterList();
}

function resetMsgFilter() {
  $('#msgFilterStatus').val('');
  $('#msgFilterKeyword').val('');
  msgCenterPage = 1;
  renderNotifyCenterList();
}

function updateNotifyCenterStats() {
  var total = notifyMessages.length;
  var readCount = notifyMessages.filter(function(m){ return m.read; }).length;
  var unreadCount = total - readCount;
  $('#msgStatTotal').text(total);
  $('#msgStatRead').text(readCount);
  $('#msgStatUnread').text(unreadCount);
}

function updateMsgTabCounts() {
  var types = ['all', 'system', 'audit', 'cc', 'remind', 'expire', 'change'];
  types.forEach(function(t) {
    var count;
    if (t === 'all') {
      count = notifyMessages.filter(function(m){ return !m.read; }).length;
    } else {
      count = notifyMessages.filter(function(m){ return m.type === t && !m.read; }).length;
    }
    var $el = $('#msgTabCount' + t.charAt(0).toUpperCase() + t.slice(1));
    if ($el.length) {
      if (count > 0) { $el.text(count).attr('data-count', count); }
      else { $el.text('').attr('data-count', '0'); }
    }
  });
}

function batchMarkRead() {
  var unread = notifyMessages.filter(function(m){ return !m.read; });
  if (unread.length === 0) {
    showNotifyToast('没有未读消息', 'info');
    return;
  }
  notifyMessages.forEach(function(m){ m.read = true; });
  renderNotifyCenterList();
  renderNotifyList();
  showNotifyToast('已将全部 ' + unread.length + ' 条消息标记为已读', 'success');
}

// ============ 消息详情弹窗 ============
function openMsgDetailModal(msgId) {
  var msg = notifyMessages.find(function(m){ return m.id === msgId; });
  if (!msg) return;
  currentMsgDetailId = msgId;
  msg.read = true;

  var cfg = MSG_TYPE_CONFIG[msg.type] || MSG_TYPE_CONFIG.system;

  // 类型图标
  $('#mdTypeIcon').attr('class', 'md-type-icon type-' + msg.type);
  $('#mdTypeIconI').attr('class', cfg.icon);

  // 标题和时间
  $('#mdTitle').html('<span class="msg-type-tag ' + cfg.tag + '" style="margin-right:6px;">' + cfg.label + '</span>' + msg.title);
  $('#mdTime').html('<i class="fa-regular fa-clock" style="margin-right:3px;"></i>' + msg.time);

  // 信息网格 - 系统通知简化显示
  var infoHtml = '';
  if (msg.type === 'system') {
    // 系统通知只显示发送人和发送时间
    infoHtml += '<div class="md-info-item"><div class="md-info-label">发送人</div><div class="md-info-value">' + msg.sender + '</div></div>';
    infoHtml += '<div class="md-info-item"><div class="md-info-label">发送时间</div><div class="md-info-value">' + msg.time + '</div></div>';
  } else {
    infoHtml += '<div class="md-info-item"><div class="md-info-label">发送人</div><div class="md-info-value">' + msg.sender + '</div></div>';
    infoHtml += '<div class="md-info-item"><div class="md-info-label">发送时间</div><div class="md-info-value">' + msg.time + '</div></div>';
    if (msg.contractNo) {
      infoHtml += '<div class="md-info-item"><div class="md-info-label">合同编号</div><div class="md-info-value"><a href="#" onclick="goToLinkedContract(' + msg.id + ');return false;">' + msg.contractNo + '</a></div></div>';
      infoHtml += '<div class="md-info-item"><div class="md-info-label">合同名称</div><div class="md-info-value"><a href="#" onclick="goToLinkedContract(' + msg.id + ');return false;">' + msg.contractName + '</a></div></div>';
    }
  }
  $('#mdInfoGrid').html(infoHtml);

  // 正文内容
  $('#mdBodyContent').html(msg.detail || msg.desc);

  // 系统通知：隐藏关联跳转区域，只显示确认按钮
  if (msg.type === 'system') {
    $('#mdLinkArea').hide();
    // 隐藏上下条导航和标记已读按钮，只显示确认
    $('#mdPrevBtn').hide();
    $('#mdNextBtn').hide();
    $('#mdToggleReadBtn').hide();
    $('#mdActionBtn').html('<i class="fa-solid fa-check"></i> 确认').show();
  } else {
    // 关联跳转区域
    if (msg.contractNo || msg.linkPage) {
      $('#mdLinkArea').show();
      $('#mdLinkLabel').text(msg.linkLabel || '关联合同');
      $('#mdLinkName').text(msg.contractName || '点击前往处理');
    } else {
      $('#mdLinkArea').hide();
    }
    // 已读/未读按钮
    updateToggleReadBtn(msg);
    $('#mdToggleReadBtn').show();
    // 上下条导航
    var filtered = getFilteredMessages();
    var idx = filtered.findIndex(function(m){ return m.id === msgId; });
    $('#mdPrevBtn').prop('disabled', idx <= 0).show();
    $('#mdNextBtn').prop('disabled', idx >= filtered.length - 1).show();
    // 操作按钮
    var actionLabel = msg.linkLabel || '前往处理';
    $('#mdActionBtn').html('<i class="fa-solid fa-arrow-right"></i> ' + actionLabel).show();
  }

  $('#modalMsgDetail').modal('show');
  renderNotifyList();
  renderNotifyCenterList();
}

function updateToggleReadBtn(msg) {
  if (msg.read) {
    $('#mdToggleReadBtn').html('<i class="fa-solid fa-envelope"></i> 标记未读');
  } else {
    $('#mdToggleReadBtn').html('<i class="fa-solid fa-envelope-open"></i> 标记已读');
  }
}

function toggleMsgReadStatus() {
  var msg = notifyMessages.find(function(m){ return m.id === currentMsgDetailId; });
  if (!msg) return;
  msg.read = !msg.read;
  updateToggleReadBtn(msg);
  renderNotifyList();
  renderNotifyCenterList();
  showNotifyToast(msg.read ? '已标记为已读' : '已标记为未读', 'info');
}

function navigateMsg(direction) {
  var filtered = getFilteredMessages();
  var idx = filtered.findIndex(function(m){ return m.id === currentMsgDetailId; });
  var newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= filtered.length) return;
  openMsgDetailModal(filtered[newIdx].id);
}

function goToLinkedPage() {
  var msg = notifyMessages.find(function(m){ return m.id === currentMsgDetailId; });
  if (!msg) return;
  // 系统通知确认按钮只关闭弹窗
  if (msg.type === 'system') {
    $('#modalMsgDetail').modal('hide');
    return;
  }
  $('#modalMsgDetail').modal('hide');
  var route = MSG_ROUTE_MAP[msg.type] || { page: 'contract' };
  var targetPage = msg.linkPage || route.page;
  switchPage(targetPage);
  // 如果关联合同，打开合同详情
  if (msg.contractId && (targetPage === 'contract' || targetPage === 'contractDetail')) {
    setTimeout(function(){ openContractDetail(msg.contractId); }, 200);
  }
}

function goToLinkedContract(msgId) {
  var msg = notifyMessages.find(function(m){ return m.id === (msgId || currentMsgDetailId); });
  if (!msg || !msg.contractId) return;
  $('#modalMsgDetail').modal('hide');
  switchPage('contract');
  setTimeout(function(){ openContractDetail(msg.contractId); }, 200);
}

// ============ 通知 Toast ============
function showNotifyToast(message, type) {
  type = type || 'info';
  var iconMap = { success: 'fa-solid fa-circle-check', info: 'fa-solid fa-circle-info', warning: 'fa-solid fa-triangle-exclamation', error: 'fa-solid fa-circle-xmark' };
  var colorMap = { success: 'var(--fa-success)', info: 'var(--fa-primary)', warning: 'var(--fa-warning)', error: 'var(--fa-danger)' };
  var existingToasts = $('.notify-toast').length;
  var topOffset = 60 + existingToasts * 70;
  var toastId = 'toast_' + Date.now();
  var toastHtml = '<div class="notify-toast" id="' + toastId + '" style="top:' + topOffset + 'px;animation:notifyToastIn 0.3s ease;">';
  toastHtml += '<div class="toast-icon" style="color:' + colorMap[type] + ';"><i class="' + iconMap[type] + '"></i></div>';
  toastHtml += '<div class="toast-body"><div class="toast-title">' + message + '</div></div>';
  toastHtml += '<button class="toast-close" onclick="$(this).closest(\'.notify-toast\').remove();"><i class="fa-solid fa-xmark"></i></button>';
  toastHtml += '</div>';
  $('body').append(toastHtml);
  setTimeout(function(){ 
    $('#' + toastId).addClass('toast-out');
    setTimeout(function(){ $('#' + toastId).remove(); }, 300);
  }, 4000);
}

// ============ 工具函数 ============
function formatMsgTime(timeStr) {
  if (!timeStr) return '';
  return timeStr;
}

// 初始化
updateNotifyBadge();
updateTabBadges();