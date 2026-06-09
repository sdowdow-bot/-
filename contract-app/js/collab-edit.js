// ==================== 通用工具函数 ====================
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  let k = 1024;
  let sizes = ['B', 'KB', 'MB', 'GB'];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

// ==================== 合同多人协同编辑 ====================
let collabCurrentPanel = 'annotations';
let collabEditMode = 'edit';
let revisionMode = false;
let collabAutoSaveTimer = null;

// 协同编辑文档内容存储（按合同ID保存编辑器内容）
let collabDocContents = {};

// 协同编辑在线用户模拟数据
let collabOnlineUsers = {
  1: [
    { name: '管理员', dept: '当前用户', avatar: '#1E9FFF', isCurrent: true },
    { name: '李总监', dept: '法务部', avatar: '#E91E63', isCurrent: false },
    { name: '赵主管', dept: '财务部', avatar: '#FF9800', isCurrent: false }
  ]
};

// 协同编辑 - 其他用户的编辑光标模拟
let collabCursors = {};
let collabCursorTimers = {};

// 协同编辑数据 - 批注
let collabAnnotations = {
  1: [
    { id: 'anno1', user: '李总监', dept: '法务部', avatar: '#E91E63', text: '预付款30%比例偏高，建议调整为20%，降低资金风险。', quote: '10个工作日内', time: '2026-05-18 10:25', resolved: false, replies: [
      { user: '张经理', text: '已与乙方沟通，同意调整为20%预付款。', time: '2026-05-18 11:30' }
    ]},
    { id: 'anno2', user: '赵主管', dept: '财务部', avatar: '#FF9800', text: '验收期限5个工作日偏短，建议延长至10个工作日，确保充分检测。', quote: '5个工作日内', time: '2026-05-19 09:15', resolved: false, replies: [] },
    { id: 'anno3', user: '管理员', dept: '', avatar: '#1E9FFF', text: '交付地址已补充完整，请法务确认。', quote: '北京市大兴区生物医药基地天荣街9号', time: '2026-05-20 14:20', resolved: true, replies: [
      { user: '李总监', text: '地址信息确认无误。', time: '2026-05-20 15:00' }
    ]}
  ]
};

// 协同编辑数据 - 修订记录
let collabRevisions = {
  1: [
    { id: 'rev1', user: '管理员', avatar: '#1E9FFF', type: 'insert', time: '2026-05-20 14:30', oldText: '柒拾万零伍仟元整（¥705,000.00）', newText: '柒拾伍万贰仟伍佰元整（¥752,500.00）', status: 'pending', reason: '根据最新报价更新合同金额' },
    { id: 'rev2', user: '李总监', avatar: '#E91E63', type: 'insert', time: '2026-05-19 16:45', oldText: '', newText: '北京市大兴区生物医药基地天荣街9号', status: 'accepted', reason: '补充完整交付地址' },
    { id: 'rev3', user: '赵主管', avatar: '#FF9800', type: 'format', time: '2026-05-19 11:20', oldText: '12个月', newText: '不少于24个月', status: 'pending', reason: '延长质保期以保障甲方权益' },
    { id: 'rev4', user: '管理员', avatar: '#1E9FFF', type: 'delete', time: '2026-05-20 10:15', oldText: '合同签订后30个自然日内', newText: '', status: 'pending', reason: '删除冗余条款，交付期限已在第四条明确' }
  ]
};

// 协同编辑数据 - 评审意见
let collabReviews = {
  1: [
    { id: 'review1', user: '李总监', dept: '法务部', avatar: '#E91E63', role: '法务审核', verdict: 'comment', opinion: '合同主体条款完整，权责划分清晰。建议在违约责任条款中增加不可抗力免责条款，以应对特殊情况。另外付款条件建议分三期支付更为稳妥。', time: '2026-05-19 17:00' },
    { id: 'review2', user: '赵主管', dept: '财务部', avatar: '#FF9800', role: '财务审核', verdict: 'approve', opinion: '合同金额及付款方式经财务核算无异议，预算充足，同意通过。', time: '2026-05-20 09:30' }
  ]
};

// 协同编辑数据 - 版本历史（每个版本存储内容快照）
let collabVersions = {
  1: [
    { version: 'v3.0', user: '管理员', time: '2026-05-20 14:35', summary: '更新合同金额，补充交付地址', type: 'manual', content: null },
    { version: 'v2.0', user: '李总监', time: '2026-05-19 16:50', summary: '补充交付地址，修改质保期条款', type: 'manual', content: null },
    { version: 'v1.0', user: '张经理', time: '2026-05-15 09:00', summary: '初始版本创建', type: 'manual', content: null }
  ]
};

// 协同编辑列表页渲染
function renderCollabEditList() {
  let html = '';
  let collabContracts = contracts.filter(function(c) {
    return c.status !== 'withdrawn';
  });
  if (collabContracts.length === 0) {
    html = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#999;"><i class="fa-solid fa-inbox" style="font-size:40px;display:block;margin-bottom:10px;"></i>暂无协同编辑合同</td></tr>';
  } else {
    collabContracts.forEach(function(c) {
      let annos = collabAnnotations[c.id] || [];
      let revs = collabRevisions[c.id] || [];
      let reviews = collabReviews[c.id] || [];
      let pendingRevs = revs.filter(function(r){ return r.status === 'pending'; });
      let onlineCount = Math.floor(Math.random() * 4);
      let lastActivity = c.updateTime || c.createTime;

      let onlineHtml = '';
      if (onlineCount > 0) {
        let colors = ['#1E9FFF','#E91E63','#FF9800','#4CAF50'];
        let names = ['管','李','赵','王'];
        for (let i = 0; i < onlineCount && i < 4; i++) {
          onlineHtml += '<div class="online-avatar" style="background:'+colors[i]+';width:22px;height:22px;font-size:9px;display:inline-flex;margin-right:2px;">'+names[i]+'<span class="pulse-dot" style="background:#4CAF50;width:6px;height:6px;"></span></div>';
        }
        onlineHtml += '<span style="font-size:11px;color:var(--fa-success);">'+onlineCount+'人</span>';
      } else {
        onlineHtml = '<span style="font-size:11px;color:#999;">离线</span>';
      }

      let reviewStatusHtml = '';
      if (reviews.length === 0) {
        reviewStatusHtml = '<span class="status-badge status-draft">待评审</span>';
      } else {
        let hasReject = reviews.some(function(r){ return r.verdict === 'reject'; });
        let allApprove = reviews.every(function(r){ return r.verdict === 'approve'; });
        if (hasReject) reviewStatusHtml = '<span class="status-badge status-rejected">有驳回</span>';
        else if (allApprove) reviewStatusHtml = '<span class="status-badge status-approved">已通过</span>';
        else reviewStatusHtml = '<span class="status-badge status-approving">评审中</span>';
      }

      html += '<tr>';
      html += '<td>'+c.no+'</td>';
      html += '<td><a href="#" onclick="openCollabEdit('+c.id+')" style="color:var(--fa-primary);font-weight:500;">'+c.name+'</a></td>';
      html += '<td>'+(c.category||c.type||'—')+'</td>';
      html += '<td>'+onlineHtml+'</td>';
      html += '<td><span style="color:var(--fa-warning);font-weight:600;">'+annos.length+'</span></td>';
      html += '<td><span style="color:var(--fa-primary);font-weight:600;">'+pendingRevs.length+'</span>/<span style="color:#999;">'+revs.length+'</span></td>';
      html += '<td>'+reviewStatusHtml+'</td>';
      html += '<td style="font-size:11px;color:#999;">'+lastActivity+'</td>';
      html += '<td>';
      html += '<button class="btn btn-xs btn-primary" onclick="openCollabEdit('+c.id+')" title="进入协同编辑"><i class="fa-solid fa-users"></i> 协同</button> ';
      html += '<button class="btn btn-xs btn-default" onclick="openContractDetail('+c.id+')" title="查看详情"><i class="fa-solid fa-eye"></i></button>';
      html += '</td>';
      html += '</tr>';
    });
  }
  $('#collabEditTableBody').html(html);
}

function refreshCollabList() {
  renderCollabEditList();
}

// 取消协同编辑，返回上一页
function cancelCollabEdit() {
  if (currentContractId) {
    // 保存当前文档
    saveCollabDocContent(currentContractId);
  }
  // 返回合同列表
  switchPage(previousPage || 'contract');
}

// 保存协同编辑文档
function saveCollabEditDoc(isDraft) {
  if (!currentContractId) return;
  saveCollabDocContent(currentContractId);
  let c = contracts.find(function(item){ return item.id === currentContractId; });
  if (c) {
    c.updateTime = new Date().toLocaleString('zh-CN');
  }
  // 创建版本快照
  let content = collabDocContents[currentContractId] || '';
  if (!collabVersions[currentContractId]) collabVersions[currentContractId] = [];
  let lastVer = collabVersions[currentContractId].length > 0 ? collabVersions[currentContractId][0] : null;
  let verNum = lastVer ? parseFloat(lastVer.version.replace('v', '')) + 1 : 1;
  let verType = isDraft ? 'draft' : 'manual';
  let verSummary = isDraft ? '保存草稿' : '手动保存';
  collabVersions[currentContractId].unshift({
    version: 'v' + verNum.toFixed(0),
    user: '管理员',
    time: new Date().toLocaleString('zh-CN'),
    summary: verSummary,
    type: verType,
    content: content
  });
  // 更新保存状态
  $('#collabSaveStatus').removeClass('saving').addClass('saved').html('<i class="fa-solid fa-circle-check"></i> 已保存');
  if (isDraft) {
    alert('草稿已保存！');
  } else {
    alert('文档已保存！');
  }
}

// 保存并提交审核
function saveAndSubmitAudit() {
  if (!currentContractId) return;
  saveCollabDocContent(currentContractId);
  let c = contracts.find(function(item){ return item.id === currentContractId; });
  if (!c) return;
  if (!confirm('确认保存文档并提交审核？提交后将进入审批流程。')) return;
  // 更新合同状态
  c.status = 'approving';
  c.auditStatus = 'pending';
  c.currentHandler = '王主管（采购部）';
  c.currentNode = '部门审批';
  c.progress = 30;
  c.updateTime = new Date().toLocaleString('zh-CN');
  // 添加审批记录
  approvalHistories[currentContractId] = approvalHistories[currentContractId] || [];
  approvalHistories[currentContractId].push({
    user: '当前用户',
    dept: '发起人',
    action: '提交审批',
    actionType: 'submit',
    time: new Date().toLocaleString('zh-CN'),
    opinion: '合同编辑完成，提交审批。'
  });
  // 返回合同列表
  switchPage(previousPage || 'contract');
  renderContractTable(contracts);
  updateTotalCount();
  alert('合同 ' + c.no + ' 已保存并提交审批！');
}

// 打开协同编辑（独立页面）
function openCollabEdit(id) {
  currentContractId = id;
  // 隐藏所有页面，显示协同编辑页
  $('#pageContractList, #pageContractDetail, #pageContractApproval, #pageMyAudit, #pageAuditConfig, #pageContractEntity, #pageExcelImport, #pageFileImport, #pageCollabEdit, #pageInvoice, #pageNoRule, #pageOperationLog, #pageNotifyCenter, #pageContractDraft, #pageContractTemplate, #pageTemplateEditor').hide();
  $('#pageCollabEdit').show();
  // 更新面包屑
  $('#breadcrumbCurrent').text('协同编辑');
  $('#breadcrumbCurrent').closest('ol').find('li:eq(1)').text('合同管理');
  // 初始化编辑器
  initCollabEditor(id);
  // 更新页面标题
  let c = contracts.find(function(item){ return item.id === id; });
  if (c) {
    $('#collabEditTitle').html('<i class="fa-solid fa-file-contract"></i> ' + c.name);
    $('#collabEditNo').text(c.no);
  }
}

// 初始化协同编辑器
function initCollabEditor(contractId) {
  if (!collabAnnotations[contractId]) collabAnnotations[contractId] = [];
  if (!collabRevisions[contractId]) collabRevisions[contractId] = [];
  if (!collabReviews[contractId]) collabReviews[contractId] = [];

  // 加载已保存的文档内容，如果没有则生成默认内容
  if (collabDocContents[contractId]) {
    $('#collabEditorBody').html(collabDocContents[contractId]);
  } else if (contractId === 1) {
    // 合同1使用默认的硬编码内容（保持原有展示）
  } else {
    // 其他合同生成基于合同信息的文档内容
    let c = contracts.find(function(item){ return item.id === contractId; });
    if (c) {
      generateBlankCollabDoc(contractId, c.name, c.type || c.category || '采购合同', c.partyA || 'XX科技有限公司', c.partyB || '待填写', c.amount || 0);
    }
  }

  // 初始化在线用户
  if (!collabOnlineUsers[contractId]) {
    collabOnlineUsers[contractId] = [
      { name: '管理员', dept: '当前用户', avatar: '#1E9FFF', isCurrent: true }
    ];
  }
  renderOnlineUsers(contractId);

  // 启动多人协同编辑模拟
  startCollabSimulation(contractId);

  renderCollabPanel();
  startAutoSave();
  updateCollabCounts(contractId);

  // 更新编辑器头部信息
  let c = contracts.find(function(item){ return item.id === contractId; });
  if (c) {
    $('#detailContractNo').text(c.no);
  }
}

// 渲染在线用户头像
function renderOnlineUsers(contractId) {
  let users = collabOnlineUsers[contractId] || [];
  // 更新头部在线用户头像
  let html = '<span style="display:inline-flex;align-items:center;gap:2px;padding:2px 8px;background:#F0F7FF;border-radius:12px;font-size:11px;color:var(--fa-primary);font-weight:500;"><i class="fa-solid fa-circle" style="font-size:6px;color:#4CAF50;"></i> '+users.length+'人在线</span>';
  users.forEach(function(user) {
    html += '<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:600;background:'+user.avatar+';border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.12);position:relative;" title="'+user.name+'（'+user.dept+'）">'+user.name.charAt(0);
    if (user.isCurrent) {
      html += '<span style="position:absolute;bottom:-1px;right:-1px;width:8px;height:8px;border-radius:50%;background:#4CAF50;border:2px solid #fff;"></span>';
    }
    html += '</div>';
  });
  $('#collabOnlineUsersBar').html(html);
}

// 多人协同编辑模拟 - 模拟其他用户的实时编辑行为
function startCollabSimulation(contractId) {
  // 清除之前的模拟定时器
  if (collabCursorTimers[contractId]) {
    clearInterval(collabCursorTimers[contractId]);
  }

  // 模拟其他用户偶尔加入编辑
  let otherUsers = [
    { name: '李总监', dept: '法务部', avatar: '#E91E63' },
    { name: '赵主管', dept: '财务部', avatar: '#FF9800' },
    { name: '王主管', dept: '采购部', avatar: '#4CAF50' },
    { name: '陈总监', dept: '运营部', avatar: '#9C27B0' }
  ];

  // 随机添加1-2个在线用户
  let currentUsers = collabOnlineUsers[contractId] || [{ name: '管理员', dept: '当前用户', avatar: '#1E9FFF', isCurrent: true }];
  let availableUsers = otherUsers.filter(function(u) {
    return !currentUsers.some(function(cu) { return cu.name === u.name; });
  });
  if (availableUsers.length > 0) {
    let addCount = Math.min(Math.floor(Math.random() * 2) + 1, availableUsers.length);
    for (let i = 0; i < addCount; i++) {
      let idx = Math.floor(Math.random() * availableUsers.length);
      currentUsers.push(availableUsers.splice(idx, 1)[0]);
    }
    collabOnlineUsers[contractId] = currentUsers;
    renderOnlineUsers(contractId);
  }

  // 模拟其他用户的光标移动和编辑行为
  collabCursorTimers[contractId] = setInterval(function() {
    simulateOtherUserEdit(contractId);
  }, 8000 + Math.random() * 12000); // 8-20秒模拟一次
}

// 模拟其他用户的编辑行为
function simulateOtherUserEdit(contractId) {
  let users = collabOnlineUsers[contractId] || [];
  let otherUsers = users.filter(function(u) { return !u.isCurrent; });
  if (otherUsers.length === 0) return;

  let user = otherUsers[Math.floor(Math.random() * otherUsers.length)];
  let actions = ['typing', 'cursor_move', 'select'];
  let action = actions[Math.floor(Math.random() * actions.length)];

  // 显示协同编辑提示
  let now = new Date();
  let timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');

  if (action === 'typing') {
    // 模拟其他用户正在输入
    showCollabTypingIndicator(user, contractId);
    // 模拟编辑后自动保存
    setTimeout(function() {
      saveCollabDocContent(contractId);
      let c = contracts.find(function(item){ return item.id === contractId; });
      if (c) {
        c.updateTime = now.toLocaleString('zh-CN');
      }
      $('#collabLastEdit').text('最后编辑：' + user.name + ' ' + now.toLocaleString('zh-CN'));
    }, 2000);
  } else if (action === 'cursor_move') {
    // 模拟光标移动提示
    showCollabCursorIndicator(user);
  } else {
    // 模拟选中内容
    showCollabSelectIndicator(user);
  }
}

// 显示其他用户正在输入的指示器
function showCollabTypingIndicator(user, contractId) {
  let indicator = $('#collabTypingIndicator');
  if (indicator.length === 0) {
    $('.collab-editor-header').append('<div id="collabTypingIndicator" style="position:absolute;top:50px;right:10px;background:#FFF3E0;border:1px solid #FFE0B2;border-radius:4px;padding:4px 10px;font-size:11px;z-index:10;white-space:nowrap;"></div>');
    indicator = $('#collabTypingIndicator');
  }
  indicator.html('<div class="online-avatar" style="background:'+user.avatar+';width:18px;height:18px;font-size:9px;display:inline-flex;vertical-align:middle;margin-right:4px;">'+user.name.charAt(0)+'</div><span style="color:#E65100;">'+user.name+'</span> 正在编辑...<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>');
  indicator.show();
  setTimeout(function() { indicator.fadeOut(300); }, 4000);
}

// 显示其他用户光标移动提示
function showCollabCursorIndicator(user) {
  let indicator = $('#collabCursorIndicator');
  if (indicator.length === 0) {
    $('#collabEditorBody').before('<div id="collabCursorIndicator" style="position:absolute;z-index:10;pointer-events:none;"></div>');
    indicator = $('#collabCursorIndicator');
  }
  let editorRect = $('#collabEditorBody')[0].getBoundingClientRect();
  let x = 100 + Math.random() * (editorRect.width - 200);
  let y = 50 + Math.random() * (editorRect.height - 100);
  indicator.css({ left: x + 'px', top: y + 'px' });
  indicator.html('<div style="position:relative;"><div style="width:2px;height:18px;background:'+user.avatar+';display:inline-block;"></div><div style="position:absolute;top:-16px;left:0;background:'+user.avatar+';color:#fff;font-size:9px;padding:1px 4px;border-radius:2px;white-space:nowrap;">'+user.name+'</div></div>');
  indicator.show();
  setTimeout(function() { indicator.fadeOut(500); }, 3000);
}

// 显示其他用户选中内容提示
function showCollabSelectIndicator(user) {
  let indicator = $('#collabSelectIndicator');
  if (indicator.length === 0) {
    $('.collab-editor-header').append('<div id="collabSelectIndicator" style="position:absolute;top:50px;left:10px;background:#E3F2FD;border:1px solid #BBDEFB;border-radius:4px;padding:4px 10px;font-size:11px;z-index:10;white-space:nowrap;"></div>');
    indicator = $('#collabSelectIndicator');
  }
  indicator.html('<div class="online-avatar" style="background:'+user.avatar+';width:18px;height:18px;font-size:9px;display:inline-flex;vertical-align:middle;margin-right:4px;">'+user.name.charAt(0)+'</div><span style="color:#0D47A1;">'+user.name+'</span> 选中了一段文本');
  indicator.show();
  setTimeout(function() { indicator.fadeOut(300); }, 3000);
}

// 保存协同编辑文档内容到存储
function saveCollabDocContent(contractId) {
  if (!contractId) contractId = currentContractId;
  let content = $('#collabEditorBody').html();
  collabDocContents[contractId] = content;
  return content;
}

// 获取协同编辑文档内容
function getCollabDocContent(contractId) {
  return collabDocContents[contractId] || null;
}

// 更新计数
function updateCollabCounts(contractId) {
  let annos = collabAnnotations[contractId] || [];
  let revs = collabRevisions[contractId] || [];
  let reviews = collabReviews[contractId] || [];
  let pendingAnno = annos.filter(function(a){ return !a.resolved; });
  let pendingRevs = revs.filter(function(r){ return r.status === 'pending'; });

  $('#annoCount').text(pendingAnno.length);
  $('#revCount').text(pendingRevs.length);
  $('#reviewCount').text(reviews.length);
}

// 切换右侧面板
function switchCollabPanel(panel) {
  collabCurrentPanel = panel;
  $('.collab-side-panel .panel-tab').removeClass('active');
  if (panel === 'annotations') $('.collab-side-panel .panel-tab:eq(0)').addClass('active');
  else if (panel === 'revisions') $('.collab-side-panel .panel-tab:eq(1)').addClass('active');
  else if (panel === 'reviews') $('.collab-side-panel .panel-tab:eq(2)').addClass('active');
  renderCollabPanel();
}

// 渲染右侧面板内容
function renderCollabPanel() {
  let contractId = currentContractId;
  let html = '';

  if (collabCurrentPanel === 'annotations') {
    let annos = collabAnnotations[contractId] || [];
    if (annos.length === 0) {
      html = '<div style="text-align:center;color:#999;padding:30px;"><i class="fa-solid fa-comment-dots" style="font-size:32px;display:block;margin-bottom:10px;"></i>暂无批注<br><small>选中合同文本后点击批注按钮添加</small></div>';
    } else {
      annos.forEach(function(anno, idx) {
        html += '<div class="annotation-card'+(anno.resolved?' resolved':'')+'">';
        html += '<div class="anno-header">';
        html += '<div class="anno-avatar" style="background:'+anno.avatar+';">'+anno.user.charAt(0)+'</div>';
        html += '<span class="anno-user">'+anno.user+(anno.dept?'（'+anno.dept+'）':'')+'</span>';
        html += '<span class="anno-time">'+anno.time+'</span>';
        html += '</div>';
        if (anno.quote) {
          html += '<div class="anno-quote"><i class="fa-solid fa-quote-left" style="color:#FFC107;margin-right:4px;font-size:9px;"></i>'+anno.quote+'</div>';
        }
        html += '<div class="anno-body">'+anno.text+'</div>';
        // 回复列表
        if (anno.replies && anno.replies.length > 0) {
          html += '<div class="anno-replies">';
          anno.replies.forEach(function(reply) {
            html += '<div class="anno-reply-item"><span class="reply-user">'+reply.user+'</span> '+reply.text+' <span style="color:#999;font-size:9px;">'+reply.time+'</span></div>';
          });
          html += '</div>';
        }
        html += '<div class="anno-actions">';
        html += '<button class="anno-reply-btn" onclick="toggleAnnoReplyInput('+idx+')"><i class="fa-solid fa-reply"></i> 回复</button>';
        if (!anno.resolved) {
          html += '<button class="anno-resolve-btn" onclick="resolveAnnotation('+idx+')"><i class="fa-solid fa-circle-check"></i> 已解决</button>';
        } else {
          html += '<span style="font-size:10px;color:var(--fa-success);margin-left:auto;"><i class="fa-solid fa-check"></i> 已解决</span>';
        }
        html += '</div>';
        html += '<div class="anno-reply-input" id="annoReplyInput_'+idx+'" style="display:none;">';
        html += '<input type="text" id="annoReplyText_'+idx+'" placeholder="输入回复..." onkeydown="if(event.key===\'Enter\')submitAnnoReply('+idx+')">';
        html += '<button class="btn btn-xs btn-primary" onclick="submitAnnoReply('+idx+')"><i class="fa-solid fa-paper-plane"></i></button>';
        html += '</div>';
        html += '</div>';
      });
    }
  } else if (collabCurrentPanel === 'revisions') {
    let revs = collabRevisions[contractId] || [];
    if (revs.length === 0) {
      html = '<div style="text-align:center;color:#999;padding:30px;"><i class="fa-solid fa-code-compare" style="font-size:32px;display:block;margin-bottom:10px;"></i>暂无修订记录</div>';
    } else {
      revs.forEach(function(rev, idx) {
        let typeLabel = rev.type === 'insert' ? '新增' : (rev.type === 'delete' ? '删除' : '格式');
        html += '<div class="revision-card">';
        html += '<div class="rev-header">';
        html += '<div class="rev-avatar" style="background:'+rev.avatar+';">'+rev.user.charAt(0)+'</div>';
        html += '<span class="rev-user">'+rev.user+'</span>';
        html += '<span class="rev-type '+rev.type+'">'+typeLabel+'</span>';
        html += '<span class="rev-time">'+rev.time+'</span>';
        html += '</div>';
        html += '<div class="rev-diff">';
        if (rev.oldText) html += '<del>'+rev.oldText+'</del> ';
        if (rev.newText) html += '<ins>'+rev.newText+'</ins>';
        html += '</div>';
        if (rev.reason) html += '<div style="margin-top:4px;font-size:11px;color:#888;"><i class="fa-solid fa-circle-info"></i> '+rev.reason+'</div>';
        if (rev.status === 'pending') {
          html += '<div class="rev-actions">';
          html += '<button class="btn btn-xs btn-success" onclick="acceptRevisionByIdx('+idx+')"><i class="fa-solid fa-check"></i> 接受</button>';
          html += '<button class="btn btn-xs btn-danger" onclick="rejectRevisionByIdx('+idx+')"><i class="fa-solid fa-xmark"></i> 拒绝</button>';
          html += '</div>';
        } else {
          html += '<div style="margin-top:6px;"><span class="status-badge '+(rev.status==='accepted'?'status-approved':'status-rejected')+'">'+(rev.status==='accepted'?'已接受':'已拒绝')+'</span></div>';
        }
        html += '</div>';
      });
    }
  } else if (collabCurrentPanel === 'reviews') {
    let reviews = collabReviews[contractId] || [];
    if (reviews.length === 0) {
      html = '<div style="text-align:center;color:#999;padding:30px;"><i class="fa-solid fa-gavel" style="font-size:32px;display:block;margin-bottom:10px;"></i>暂无评审意见<br><small>评审人可在下方提交评审意见</small></div>';
    } else {
      reviews.forEach(function(review) {
        let verdictLabel = review.verdict === 'approve' ? '同意' : (review.verdict === 'reject' ? '驳回' : '意见');
        html += '<div class="review-card">';
        html += '<div class="review-header">';
        html += '<div class="review-avatar" style="background:'+review.avatar+';">'+review.user.charAt(0)+'</div>';
        html += '<span class="review-user">'+review.user+'</span>';
        html += '<span class="review-role">'+review.role+'</span>';
        html += '<span class="review-time">'+review.time+'</span>';
        html += '</div>';
        html += '<div class="review-body">'+review.opinion;
        html += '<div><span class="review-verdict '+review.verdict+'"><i class="fa-solid '+(review.verdict==='approve'?'fa-check':(review.verdict==='reject'?'fa-xmark':'fa-comment'))+'"></i> '+verdictLabel+'</span></div>';
        html += '</div>';
        html += '</div>';
      });
    }
  }

  $('#collabPanelContent').html(html);
}

// 编辑模式切换
function setCollabEditMode(mode) {
  collabEditMode = mode;
  $('#collabModeSelect').val(mode);
  let editor = $('#collabEditorBody');

  if (mode === 'edit') {
    editor.attr('contenteditable', 'true');
    $('.collab-toolbar .tb-btn').slice(0,2).removeClass('active');
    $('.collab-toolbar .tb-btn:eq(0)').addClass('active');
  } else if (mode === 'review') {
    editor.attr('contenteditable', 'true');
    $('.collab-toolbar .tb-btn').slice(0,2).removeClass('active');
    $('.collab-toolbar .tb-btn:eq(1)').addClass('active');
  } else if (mode === 'readonly') {
    editor.attr('contenteditable', 'false');
    $('.collab-toolbar .tb-btn').slice(0,2).removeClass('active');
  }
}

// 格式命令
function collabFormatCmd(cmd) {
  document.execCommand(cmd, false, null);
  triggerAutoSave();
}

// 修订模式开关
function toggleRevisionMode() {
  revisionMode = !revisionMode;
  if (revisionMode) {
    $('#btnRevisionMode').addClass('active');
    $('#revisionModeIndicator').show();
  } else {
    $('#btnRevisionMode').removeClass('active');
    $('#revisionModeIndicator').hide();
  }
}

// 接受修订
function acceptRevision() {
  let sel = window.getSelection();
  if (sel.rangeCount > 0) {
    let range = sel.getRangeAt(0);
    let container = range.commonAncestorContainer;
    if (container.nodeType === 3) container = container.parentNode;
    let insertEl = $(container).closest('.revision-insert');
    let deleteEl = $(container).closest('.revision-delete');
    let formatEl = $(container).closest('.revision-format');

    if (insertEl.length) { insertEl.replaceWith(insertEl.html()); }
    else if (deleteEl.length) { deleteEl.remove(); }
    else if (formatEl.length) { formatEl.replaceWith(formatEl.html()); }
    else { alert('请将光标放在修订痕迹上再点击接受'); return; }
    triggerAutoSave();
  }
}

// 拒绝修订
function rejectRevision() {
  let sel = window.getSelection();
  if (sel.rangeCount > 0) {
    let range = sel.getRangeAt(0);
    let container = range.commonAncestorContainer;
    if (container.nodeType === 3) container = container.parentNode;
    let insertEl = $(container).closest('.revision-insert');
    let deleteEl = $(container).closest('.revision-delete');
    let formatEl = $(container).closest('.revision-format');

    if (insertEl.length) { insertEl.remove(); }
    else if (deleteEl.length) { deleteEl.replaceWith(deleteEl.html()); deleteEl.css({'text-decoration':'none','background':'transparent','color':'inherit','border-bottom':'none'}); }
    else if (formatEl.length) { formatEl.replaceWith(formatEl.text()); }
    else { alert('请将光标放在修订痕迹上再点击拒绝'); return; }
    triggerAutoSave();
  }
}

// 通过索引接受修订
function acceptRevisionByIdx(idx) {
  let contractId = currentContractId;
  if (collabRevisions[contractId] && collabRevisions[contractId][idx]) {
    collabRevisions[contractId][idx].status = 'accepted';
    renderCollabPanel();
    updateCollabCounts(contractId);
    alert('已接受修订：' + collabRevisions[contractId][idx].newText);
  }
}

// 通过索引拒绝修订
function rejectRevisionByIdx(idx) {
  let contractId = currentContractId;
  if (collabRevisions[contractId] && collabRevisions[contractId][idx]) {
    collabRevisions[contractId][idx].status = 'rejected';
    renderCollabPanel();
    updateCollabCounts(contractId);
    alert('已拒绝修订：' + collabRevisions[contractId][idx].newText);
  }
}

// 批注弹窗
function openAnnotationPopup() {
  let sel = window.getSelection();
  if (!sel || sel.isCollapsed) {
    alert('请先选中需要批注的文本');
    return;
  }
  let selectedText = sel.toString();
  if (selectedText.length > 100) selectedText = selectedText.substring(0, 100) + '...';

  let range = sel.getRangeAt(0);
  let rect = range.getBoundingClientRect();
  let editorRect = $('#collabEditorBody')[0].getBoundingClientRect();

  $('#annoPopup').css({
    top: (rect.bottom - editorRect.top + 10) + 'px',
    left: (rect.left - editorRect.left) + 'px'
  }).addClass('show');
  $('#annoPopupText').val('').data('quote', selectedText).focus();
}

function closeAnnotationPopup() {
  $('#annoPopup').removeClass('show');
}

function submitAnnotation() {
  let text = $('#annoPopupText').val().trim();
  let quote = $('#annoPopupText').data('quote') || '';
  if (!text) { alert('请输入批注内容'); return; }

  let contractId = currentContractId;
  if (!collabAnnotations[contractId]) collabAnnotations[contractId] = [];

  let newAnno = {
    id: 'anno' + Date.now(),
    user: '管理员',
    dept: '',
    avatar: '#1E9FFF',
    text: text,
    quote: quote,
    time: new Date().toLocaleString('zh-CN'),
    resolved: false,
    replies: []
  };
  collabAnnotations[contractId].push(newAnno);

  // 给选中文本添加批注标记
  let sel = window.getSelection();
  if (sel.rangeCount > 0 && !sel.isCollapsed) {
    let range = sel.getRangeAt(0);
    let mark = document.createElement('span');
    mark.className = 'annotation-mark';
    mark.setAttribute('data-anno-id', newAnno.id);
    try {
      range.surroundContents(mark);
    } catch(e) {
      // 跨节点选择时忽略
    }
  }

  closeAnnotationPopup();
  renderCollabPanel();
  updateCollabCounts(contractId);
  triggerAutoSave();
}

// 批注回复
function toggleAnnoReplyInput(idx) {
  let input = $('#annoReplyInput_' + idx);
  input.toggle();
  if (input.is(':visible')) {
    $('#annoReplyText_' + idx).focus();
  }
}

function submitAnnoReply(idx) {
  let text = $('#annoReplyText_' + idx).val().trim();
  if (!text) return;

  let contractId = currentContractId;
  if (collabAnnotations[contractId] && collabAnnotations[contractId][idx]) {
    if (!collabAnnotations[contractId][idx].replies) collabAnnotations[contractId][idx].replies = [];
    collabAnnotations[contractId][idx].replies.push({
      user: '管理员',
      text: text,
      time: new Date().toLocaleString('zh-CN')
    });
    renderCollabPanel();
    triggerAutoSave();
  }
}

// 解决批注
function resolveAnnotation(idx) {
  let contractId = currentContractId;
  if (collabAnnotations[contractId] && collabAnnotations[contractId][idx]) {
    collabAnnotations[contractId][idx].resolved = true;
    renderCollabPanel();
    updateCollabCounts(contractId);
    triggerAutoSave();
  }
}

// 提交评审意见
function submitReviewOpinion() {
  let verdict = $('#reviewVerdict').val();
  let opinion = $('#reviewOpinionText').val().trim();
  if (!verdict) { alert('请选择评审结论'); return; }
  if (!opinion) { alert('请填写评审意见'); return; }

  let contractId = currentContractId;
  if (!collabReviews[contractId]) collabReviews[contractId] = [];

  collabReviews[contractId].push({
    id: 'review' + Date.now(),
    user: '管理员',
    dept: '',
    avatar: '#1E9FFF',
    role: '当前评审人',
    verdict: verdict,
    opinion: opinion,
    time: new Date().toLocaleString('zh-CN')
  });

  // 同时写入审批历史
  if (!approvalHistories[contractId]) approvalHistories[contractId] = [];
  let verdictLabel = verdict === 'approve' ? '同意' : (verdict === 'reject' ? '驳回' : '意见');
  approvalHistories[contractId].push({
    user: '管理员',
    dept: '',
    action: '协同评审: ' + verdictLabel,
    actionType: verdict === 'reject' ? 'reject' : 'approve',
    time: new Date().toLocaleString('zh-CN'),
    opinion: opinion
  });

  $('#reviewVerdict').val('');
  $('#reviewOpinionText').val('');
  renderCollabPanel();
  updateCollabCounts(contractId);
  alert('评审意见已提交！评审过程全程留痕。');
}

// 版本历史
function showVersionHistory() {
  let contractId = currentContractId;
  let versions = collabVersions[contractId] || [];
  let html = '';
  if (versions.length === 0) {
    html = '<div style="text-align:center;color:#999;padding:30px;"><i class="fa-solid fa-inbox" style="font-size:36px;display:block;margin-bottom:10px;"></i>暂无版本记录</div>';
  } else {
    html += '<div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">';
    html += '<span style="font-size:13px;color:#666;">共 <b style="color:var(--fa-primary);">'+versions.length+'</b> 个版本</span>';
    html += '<span style="font-size:11px;color:#999;"><i class="fa-solid fa-circle-info"></i> 选择两个版本进行差异对比</span>';
    html += '</div>';
    html += '<div style="max-height:380px;overflow-y:auto;">';
    versions.forEach(function(v, idx) {
      let isCurrent = idx === 0;
      let typeLabel = '';
      if (isCurrent) typeLabel = '<span class="version-current-tag">当前</span>';
      else if (v.type === 'draft') typeLabel = '<span class="version-draft-tag">草稿</span>';
      else if (v.type === 'auto') typeLabel = '<span style="display:inline-block;background:#E3F2FD;color:#1565C0;font-size:10px;padding:1px 6px;border-radius:3px;margin-left:6px;font-weight:500;">自动</span>';

      html += '<div class="version-compare-panel">';
      html += '<div class="version-header">';
      html += '<span><strong style="color:var(--fa-primary);">'+v.version+'</strong> '+typeLabel+' <span style="color:#999;">by '+v.user+'</span></span>';
      html += '<span style="color:#999;font-size:11px;">'+v.time+'</span>';
      html += '</div>';
      html += '<div class="version-body">';
      html += '<div style="margin-bottom:6px;color:#555;">'+v.summary+'</div>';
      html += '<div class="version-actions">';
      if (!isCurrent) {
        html += '<button class="btn btn-xs btn-primary" onclick="compareVersions('+contractId+','+idx+')"><i class="fa-solid fa-code-compare"></i> 对比</button>';
        html += '<button class="btn btn-xs btn-warning" onclick="rollbackToVersion('+contractId+','+idx+')"><i class="fa-solid fa-rotate-left"></i> 回滚</button>';
        html += '<button class="btn btn-xs btn-info" onclick="previewVersion('+contractId+','+idx+')"><i class="fa-solid fa-eye"></i> 预览</button>';
      } else {
        html += '<button class="btn btn-xs btn-info" onclick="previewVersion('+contractId+','+idx+')"><i class="fa-solid fa-eye"></i> 预览</button>';
      }
      html += '</div>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  // 使用模态框显示
  if ($('#modalVersionHistory').length === 0) {
    let modalHtml = '<div class="modal fade" id="modalVersionHistory" tabindex="-1">';
    modalHtml += '<div class="modal-dialog modal-lg"><div class="modal-content">';
    modalHtml += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '<h4 class="modal-title"><i class="fa-solid fa-clock-rotate-left"></i> 版本历史</h4></div>';
    modalHtml += '<div class="modal-body" id="versionHistoryBody"></div>';
    modalHtml += '<div class="modal-footer"><button class="btn btn-default" data-dismiss="modal">关闭</button></div>';
    modalHtml += '</div></div></div>';
    $('body').append(modalHtml);
  }
  $('#versionHistoryBody').html(html);
  $('#modalVersionHistory').modal('show');
}

// 预览指定版本内容
function previewVersion(contractId, versionIdx) {
  let versions = collabVersions[contractId] || [];
  let v = versions[versionIdx];
  if (!v) return;
  let content = v.content || '<span style="color:#999;">该版本无内容快照</span>';
  // 去除修订标记
  content = content.replace(/<span class="revision-delete"[^>]*>[\s\S]*?<\/span>/g, '');
  content = content.replace(/<span class="revision-insert"[^>]*>([\s\S]*?)<\/span>/g, '$1');
  content = content.replace(/<span class="revision-format"[^>]*>([\s\S]*?)<\/span>/g, '$1');
  content = content.replace(/<span class="annotation-mark"[^>]*>([\s\S]*?)<\/span>/g, '$1');

  let previewHtml = '<div style="margin-bottom:12px;padding:8px 12px;background:#F8F9FA;border-radius:6px;font-size:12px;color:#666;">';
  previewHtml += '<strong style="color:var(--fa-primary);">'+v.version+'</strong> '+v.summary+' <span style="color:#999;">- '+v.user+' '+v.time+'</span>';
  previewHtml += '</div>';
  previewHtml += '<div style="background:#FAFBFC;border:1px solid #E8ECF0;border-radius:6px;padding:24px 32px;line-height:1.8;font-size:14px;color:#333;max-height:450px;overflow-y:auto;">';
  previewHtml += content;
  previewHtml += '</div>';

  if ($('#modalVersionPreview').length === 0) {
    let modalHtml = '<div class="modal fade" id="modalVersionPreview" tabindex="-1">';
    modalHtml += '<div class="modal-dialog modal-lg"><div class="modal-content">';
    modalHtml += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '<h4 class="modal-title"><i class="fa-solid fa-eye"></i> 版本预览</h4></div>';
    modalHtml += '<div class="modal-body" id="versionPreviewBody"></div>';
    modalHtml += '<div class="modal-footer"><button class="btn btn-default" data-dismiss="modal">关闭</button></div>';
    modalHtml += '</div></div></div>';
    $('body').append(modalHtml);
  }
  $('#versionPreviewBody').html(previewHtml);
  $('#modalVersionPreview').modal('show');
}

// 对比指定版本与当前版本
function compareVersions(contractId, versionIdx) {
  let versions = collabVersions[contractId] || [];
  let v = versions[versionIdx];
  let current = versions[0];
  if (!v || !current) return;

  let oldContent = v.content || '';
  let newContent = current.content || '';

  // 去除修订标记
  oldContent = oldContent.replace(/<span class="revision-delete"[^>]*>[\s\S]*?<\/span>/g, '');
  oldContent = oldContent.replace(/<span class="revision-insert"[^>]*>([\s\S]*?)<\/span>/g, '$1');
  oldContent = oldContent.replace(/<span class="revision-format"[^>]*>([\s\S]*?)<\/span>/g, '$1');
  oldContent = oldContent.replace(/<span class="annotation-mark"[^>]*>([\s\S]*?)<\/span>/g, '$1');
  newContent = newContent.replace(/<span class="revision-delete"[^>]*>[\s\S]*?<\/span>/g, '');
  newContent = newContent.replace(/<span class="revision-insert"[^>]*>([\s\S]*?)<\/span>/g, '$1');
  newContent = newContent.replace(/<span class="revision-format"[^>]*>([\s\S]*?)<\/span>/g, '$1');
  newContent = newContent.replace(/<span class="annotation-mark"[^>]*>([\s\S]*?)<\/span>/g, '$1');

  // 简单的文本差异对比：按段落拆分对比
  let oldLines = oldContent.replace(/<\/p>/g, '</p>\n').split('\n').filter(function(l){ return l.trim(); });
  let newLines = newContent.replace(/<\/p>/g, '</p>\n').split('\n').filter(function(l){ return l.trim(); });

  let oldDiffHtml = '';
  let newDiffHtml = '';
  let maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    let oldLine = oldLines[i] || '';
    let newLine = newLines[i] || '';
    // 提取纯文本对比
    let oldText = oldLine.replace(/<[^>]+>/g, '').trim();
    let newText = newLine.replace(/<[^>]+>/g, '').trim();
    if (oldText === newText) {
      oldDiffHtml += oldLine;
      newDiffHtml += newLine;
    } else {
      if (oldLine) oldDiffHtml += '<div class="diff-removed">' + oldLine + '</div>';
      if (newLine) newDiffHtml += '<div class="diff-added">' + newLine + '</div>';
    }
  }

  // 新增的行
  for (let i = oldLines.length; i < newLines.length; i++) {
    newDiffHtml += '<div class="diff-added">' + newLines[i] + '</div>';
  }
  // 删除的行
  for (let i = newLines.length; i < oldLines.length; i++) {
    oldDiffHtml += '<div class="diff-removed">' + oldLines[i] + '</div>';
  }

  let compareHtml = '<div style="margin-bottom:12px;padding:8px 12px;background:#FFF8E1;border-radius:6px;font-size:12px;color:#8D6E00;">';
  compareHtml += '<i class="fa-solid fa-code-compare"></i> 对比：<strong style="color:var(--fa-primary);">'+v.version+'</strong> → <strong style="color:var(--fa-primary);">'+current.version+'</strong>（当前版本）';
  compareHtml += '</div>';
  compareHtml += '<div class="version-diff-view">';
  compareHtml += '<div class="diff-pane"><div class="diff-pane-header"><i class="fa-solid fa-file-lines"></i> '+v.version+' <span style="color:#999;font-weight:400;">'+v.summary+'</span></div><div class="diff-pane-body">'+(oldDiffHtml||'<span style="color:#999;">无内容</span>')+'</div></div>';
  compareHtml += '<div class="diff-pane"><div class="diff-pane-header"><i class="fa-solid fa-file-lines"></i> '+current.version+' <span style="color:#999;font-weight:400;">当前版本</span></div><div class="diff-pane-body">'+(newDiffHtml||'<span style="color:#999;">无内容</span>')+'</div></div>';
  compareHtml += '</div>';
  compareHtml += '<div style="margin-top:12px;font-size:11px;color:#999;"><i class="fa-solid fa-circle-info"></i> <span class="diff-added" style="display:inline;padding:1px 4px;">绿色</span> = 新增内容 &nbsp; <span class="diff-removed" style="display:inline;padding:1px 4px;">红色</span> = 删除内容</div>';

  if ($('#modalVersionCompare').length === 0) {
    let modalHtml = '<div class="modal fade" id="modalVersionCompare" tabindex="-1">';
    modalHtml += '<div class="modal-dialog modal-lg"><div class="modal-content">';
    modalHtml += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '<h4 class="modal-title"><i class="fa-solid fa-code-compare"></i> 版本差异对比</h4></div>';
    modalHtml += '<div class="modal-body" id="versionCompareBody"></div>';
    modalHtml += '<div class="modal-footer"><button class="btn btn-default" data-dismiss="modal">关闭</button></div>';
    modalHtml += '</div></div></div>';
    $('body').append(modalHtml);
  }
  $('#versionCompareBody').html(compareHtml);
  $('#modalVersionCompare').modal('show');
}

// 回滚到指定版本
function rollbackToVersion(contractId, versionIdx) {
  let versions = collabVersions[contractId] || [];
  let v = versions[versionIdx];
  if (!v) return;
  if (!confirm('确认回滚到版本 '+v.version+'（'+v.summary+'）？\n回滚后当前编辑器内容将被替换，但当前版本仍保留在历史记录中。')) return;

  let content = v.content || '';
  // 加载到编辑器
  $('#collabEditorBody').html(content);
  saveCollabDocContent(contractId);

  // 创建回滚版本快照
  let lastVer = versions[0];
  let verNum = lastVer ? parseFloat(lastVer.version.replace('v', '')) + 1 : 1;
  collabVersions[contractId].unshift({
    version: 'v' + verNum.toFixed(0),
    user: '管理员',
    time: new Date().toLocaleString('zh-CN'),
    summary: '回滚至 ' + v.version,
    type: 'rollback',
    content: content
  });

  // 更新保存状态
  $('#collabSaveStatus').removeClass('saving').addClass('saved').html('<i class="fa-solid fa-circle-check"></i> 已保存');

  // 关闭版本历史弹框
  $('#modalVersionHistory').modal('hide');
  alert('已回滚到版本 '+v.version+'！');
}

// 导出协同文档
function exportCollabDoc() {
  let content = $('#collabEditorBody').html();
  let contractId = currentContractId;
  let c = contracts.find(function(item){ return item.id === contractId; });
  let fileName = c ? c.name : '合同文档';

  // 创建下载
  let blob = new Blob(['<html><head><meta charset="utf-8"><title>'+fileName+'</title><style>body{font-family:sans-serif;padding:40px;line-height:1.8;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ddd;padding:8px;} th{background:#f4f6f9;}</style></head><body>'+content+'</body></html>'], {type: 'text/html'});
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = fileName + '.html';
  a.click();
  URL.revokeObjectURL(url);
  alert('合同文档已导出！');
}

// 自动保存
function startAutoSave() {
  if (collabAutoSaveTimer) clearInterval(collabAutoSaveTimer);
  collabAutoSaveTimer = setInterval(function() {
    let statusEl = $('#collabSaveStatus');
    statusEl.removeClass('saved').addClass('saving').html('<i class="fa-solid fa-spinner fa-spin"></i> 保存中...');
    setTimeout(function() {
      // 保存文档内容到存储
      saveCollabDocContent(currentContractId);
      // 更新合同的更新时间
      let c = contracts.find(function(item){ return item.id === currentContractId; });
      if (c) {
        c.updateTime = new Date().toLocaleString('zh-CN');
      }
      // 自动保存创建版本快照
      let content = collabDocContents[currentContractId] || '';
      if (!collabVersions[currentContractId]) collabVersions[currentContractId] = [];
      let lastVer = collabVersions[currentContractId].length > 0 ? collabVersions[currentContractId][0] : null;
      // 检查内容是否有变化，有变化才创建版本
      let contentChanged = !lastVer || !lastVer.content || lastVer.content !== content;
      if (contentChanged) {
        let verNum = lastVer ? parseFloat(lastVer.version.replace('v', '')) + 1 : 1;
        collabVersions[currentContractId].unshift({
          version: 'v' + verNum.toFixed(0),
          user: '管理员',
          time: new Date().toLocaleString('zh-CN'),
          summary: '自动保存',
          type: 'auto',
          content: content
        });
      }
      statusEl.removeClass('saving').addClass('saved').html('<i class="fa-solid fa-circle-check"></i> 已保存');
      let now = new Date();
      $('#collabLastEdit').text('最后编辑：管理员 ' + now.toLocaleString('zh-CN'));
    }, 800);
  }, 30000);
}

function triggerAutoSave() {
  let statusEl = $('#collabSaveStatus');
  statusEl.removeClass('saved').addClass('saving').html('<i class="fa-solid fa-spinner fa-spin"></i> 保存中...');
  setTimeout(function() {
    // 真正保存文档内容到存储
    saveCollabDocContent(currentContractId);
    // 更新合同的更新时间
    let c = contracts.find(function(item){ return item.id === currentContractId; });
    if (c) {
      c.updateTime = new Date().toLocaleString('zh-CN');
    }
    statusEl.removeClass('saving').addClass('saved').html('<i class="fa-solid fa-circle-check"></i> 已保存');
    let now = new Date();
    $('#collabLastEdit').text('最后编辑：管理员 ' + now.toLocaleString('zh-CN'));
  }, 600);
}

// 编辑器内容变化监听
$(document).on('input', '#collabEditorBody', function() {
  triggerAutoSave();
  // 更新字数
  let text = $(this).text().replace(/\s/g, '');
  $('#collabWordCount').text('字数：' + text.length);
});
