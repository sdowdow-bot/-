// ==================== 打开合同详情 ====================
function openContractDetail(id, auditMode, draftView) {
  let c = contracts.find(function(item){ return item.id === id; });
  if (!c) return;
  currentContractId = id;

  // 审核模式或起草查看模式：只显示基本信息、合同内容、审核记录
  if (auditMode || draftView) {
    $('#detailTabs li:has(a[href="#tabSubject"])').hide();
    $('#detailTabs li:has(a[href="#tabPerformance"])').hide();
    $('#detailTabs li:has(a[href="#tabChangeRecord"])').hide();
    $('#detailTabs li:has(a[href="#tabInvoice"])').hide();
    if (auditMode) {
      // 审核模式：隐藏编辑按钮，显示底部审核操作栏
      $('#btnDetailEdit').hide();
      $('#auditBottomBar').css('display','flex');
      $('#pageContractDetail').css('padding-bottom','70px');
    } else {
      // 起草查看模式：不显示编辑按钮，也不显示审核操作栏
      $('#btnDetailEdit').hide();
      $('#auditBottomBar').hide();
      $('#pageContractDetail').css('padding-bottom','0');
    }
  } else {
    $('#detailTabs li:has(a[href="#tabSubject"])').show();
    $('#detailTabs li:has(a[href="#tabPerformance"])').show();
    $('#detailTabs li:has(a[href="#tabChangeRecord"])').show();
    $('#detailTabs li:has(a[href="#tabInvoice"])').show();
    // 非审核模式：显示编辑按钮，隐藏底部审核操作栏
    $('#btnDetailEdit').show();
    $('#auditBottomBar').hide();
    $('#pageContractDetail').css('padding-bottom','0');
  }

  $('#pageContractList').hide();
  $('#pageContractApproval').hide();
  $('#pageMyAudit').hide();
  $('#pageAuditConfig').hide();
  $('#pageExcelImport').hide();
  $('#pageFileImport').hide();
  $('#pageInvoice').hide();
  $('#pageContractDraft').hide();
  $('#pageContractTemplate').hide();
  $('#pageContractDetail').show();
  $('#breadcrumbCurrent').text('合同详情');

  // 填充基本信息
  $('#detailContractNo').text(c.no);
  $('#infoNo').text(c.no);
  $('#infoName').text(c.name);
  $('#infoSubject').text(c.subject||'—');
  $('#infoCategory').text(c.category||c.type||'—');
  $('#infoStatus').text(STATUS_LABEL[c.status]).attr('class','status-badge '+STATUS_CLASS[c.status]);
  $('#infoTermType').text(c.termType||'—');
  $('#infoValidDate').text(c.validDate||'—');
  $('#infoSignDate').text(c.signDate);
  $('#infoDirection').text(c.direction||'—');
  $('#infoPricingMethod').text(c.pricingMethod||'—');
  $('#infoHandler').text(c.handler||'—');
  $('#infoAmount').text('¥ ' + c.amount.toLocaleString('zh-CN', {minimumFractionDigits:2}));
  // 已开票金额和差额
  let invoiced = invoiceData.filter(i => i.contractId === c.id).reduce((s, i) => s + i.totalAmount, 0);
  let diff = c.amount - invoiced;
  let ratio = c.amount > 0 ? (invoiced / c.amount * 100).toFixed(1) : 0;
  $('#infoInvoiced').text(invoiced > 0 ? '¥ ' + invoiced.toLocaleString('zh-CN', {minimumFractionDigits:2}) : '¥ 0.00');
  let diffColor = diff > 0 ? 'var(--fa-warning)' : (diff < 0 ? 'var(--fa-danger)' : 'var(--fa-success)');
  $('#infoInvoiceDiff').html('<span style="color:'+diffColor+'">¥ ' + diff.toLocaleString('zh-CN', {minimumFractionDigits:2}) + '</span>');
  let progressHtml = '<div style="display:flex;align-items:center;gap:8px;">';
  progressHtml += '<div style="flex:1;height:8px;background:#E8E8E8;border-radius:4px;overflow:hidden;min-width:80px;"><div style="height:100%;width:'+Math.min(ratio,100)+'%;background:'+(ratio>=100?'var(--fa-success)':'var(--fa-warning)')+';border-radius:4px;transition:width 0.3s;"></div></div>';
  progressHtml += '<span style="font-size:12px;color:#666;">'+ratio+'%</span>';
  progressHtml += '</div>';
  $('#infoInvoiceProgress').html(progressHtml);
  $('#infoCurrency').text(c.currency||'CNY');
  $('#infoSignDept').text(c.signDept||'—');
  $('#infoSummary').text(c.summary||'—');
  // 合同附件
  if (c.attachmentName) {
    var ext = c.attachmentName.split('.').pop().toLowerCase();
    var isPdf = ext === 'pdf';
    $('#infoAttachmentName').hide();
    $('#infoAttachmentLink').show();
    $('#infoAttachmentIcon').attr('class', isPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-word').css('color', isPdf ? '#DD4B39' : '#2B579A');
    $('#infoAttachmentText').text(c.attachmentName);
  } else {
    $('#infoAttachmentName').show().text('暂无附件');
    $('#infoAttachmentLink').hide();
  }
  // 相对方信息
  $('#infoCounterParty').text(c.counterParty||c.partyB||'—');
  $('#infoCounterContact').text(c.counterContact||'—');
  $('#infoCounterPhone').text(c.counterPhone||'—');
  $('#infoCounterAddress').text(c.counterAddress||'—');
  // 时间与归档
  $('#infoEffectiveDate').text(c.effectiveDate||'—');
  $('#infoDeliveryDate').text(c.deliveryDate||'—');
  $('#infoTotalCopies').text(c.totalCopies||'—');
  $('#infoArchiveCopies').text(c.archiveCopies!==undefined?c.archiveCopies:'—');
  $('#infoArchiveTime').text(c.archiveTime||'—');
  $('#infoArchiveLocation').text(c.archiveLocation||'—');
  $('#infoCreateTime').text(c.createTime);
  $('#infoUpdateTime').text(c.updateTime||'—');

  // 渲染合同内容（去除修订标记，显示最终内容）
  let contentHtml = '';
  if (collabDocContents[id]) {
    contentHtml = collabDocContents[id];
  } else if (id === 1) {
    let bodyHtml = $('#collabEditorBody').html();
    if (bodyHtml && bodyHtml.trim()) contentHtml = bodyHtml;
  }
  if (contentHtml) {
    // 移除删除标记（revision-delete）的内容
    contentHtml = contentHtml.replace(/<span class="revision-delete"[^>]*>[\s\S]*?<\/span>/g, '');
    // 保留新增标记的内容，但去掉标记span
    contentHtml = contentHtml.replace(/<span class="revision-insert"[^>]*>([\s\S]*?)<\/span>/g, '$1');
    // 保留格式修改标记的内容，但去掉标记span
    contentHtml = contentHtml.replace(/<span class="revision-format"[^>]*>([\s\S]*?)<\/span>/g, '$1');
    // 保留批注标记的文本，但去掉批注标记span
    contentHtml = contentHtml.replace(/<span class="annotation-mark"[^>]*>([\s\S]*?)<\/span>/g, '$1');
    // 移除修订标记的after伪元素样式（通过移除class即可）
    $('#contractContentView').html(contentHtml);
  } else {
    $('#contractContentView').html('<span style="color:#999;">暂无合同内容，请通过编辑功能添加</span>');
  }

  // 渲染版本记录（右侧抽屉）
  let versions = collabVersions[id] || [];
  if (versions.length > 0) {
    $('#detailVersionCount').text('共 ' + versions.length + ' 个版本');
    let verHtml = '';
    versions.forEach(function(v, idx) {
      let isCurrent = idx === 0;
      let typeLabel = '';
      if (isCurrent) typeLabel = '<span class="version-current-tag">当前</span>';
      else if (v.type === 'draft') typeLabel = '<span class="version-draft-tag">草稿</span>';
      else if (v.type === 'auto') typeLabel = '<span style="display:inline-block;background:#E3F2FD;color:#1565C0;font-size:10px;padding:1px 6px;border-radius:3px;margin-left:6px;font-weight:500;">自动</span>';
      else if (v.type === 'rollback') typeLabel = '<span style="display:inline-block;background:#FCE4EC;color:#C62828;font-size:10px;padding:1px 6px;border-radius:3px;margin-left:6px;font-weight:500;">回滚</span>';
      verHtml += '<div style="border:1px solid #E8ECF0;border-radius:6px;margin-bottom:10px;overflow:hidden;">';
      verHtml += '<div style="padding:10px 12px;background:#F8F9FA;border-bottom:1px solid #E8ECF0;display:flex;align-items:center;justify-content:space-between;font-size:12px;">';
      verHtml += '<span><strong style="color:var(--fa-primary);">'+v.version+'</strong> '+typeLabel+'</span>';
      verHtml += '<span style="color:#999;font-size:11px;">'+v.time+'</span>';
      verHtml += '</div>';
      verHtml += '<div style="padding:10px 12px;">';
      verHtml += '<div style="font-size:12px;color:#555;margin-bottom:6px;">'+v.summary+' <span style="color:#999;">- '+v.user+'</span></div>';
      verHtml += '<div style="display:flex;gap:6px;">';
      if (!isCurrent) {
        verHtml += '<button class="btn btn-xs btn-info" onclick="detailPreviewVersion('+id+','+idx+')"><i class="fa-solid fa-eye"></i> 查看旧版</button>';
        verHtml += '<button class="btn btn-xs btn-primary" onclick="detailCompareVersion('+id+','+idx+')"><i class="fa-solid fa-code-compare"></i> 对比</button>';
        verHtml += '<button class="btn btn-xs btn-warning" onclick="detailRollbackVersion('+id+','+idx+')"><i class="fa-solid fa-rotate-left"></i> 回滚</button>';
      } else {
        verHtml += '<span style="font-size:11px;color:var(--fa-primary);font-weight:500;"><i class="fa-solid fa-circle-check"></i> 当前版本</span>';
      }
      verHtml += '</div>';
      verHtml += '</div>';
      verHtml += '</div>';
    });
    $('#detailVersionList').html(verHtml);
  } else {
    $('#detailVersionCount').text('');
    $('#detailVersionList').html('<div style="text-align:center;color:#999;padding:30px 0;"><i class="fa-solid fa-inbox" style="font-size:28px;display:block;margin-bottom:8px;"></i>暂无版本记录</div>');
  }
  // 关闭抽屉
  $('#versionDrawer').css('transform','translateX(100%)');
  $('#contractContentMain').css('margin-right','0');

  // 渲染标的物列表
  renderSubjectItems(c);

  // 渲染履约信息
  renderPerformanceInfo(c);

  // 渲染审核记录
  renderAuditRecord(id);

  // 渲染变更记录
  renderChangeRecord(id);

  // 渲染发票信息
  renderDetailInvoice(id);

  // 切换到基本信息tab
  $('#detailTabs a[href="#tabBasicInfo"]').tab('show');

  // 滚动到顶部
  window.scrollTo(0, 0);
}

// ==================== 渲染标的物 ====================
function renderSubjectItems(c) {
  let items = subjectItems[c.id] || [];
  let html = '';
  let totalAmount = 0;
  if (items.length === 0) {
    html = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#999;"><i class="fa-solid fa-box-open" style="font-size:30px;display:block;margin-bottom:8px;"></i>暂无标的物信息</td></tr>';
  } else {
    items.forEach(function(item, idx){
      let lineTotal = item.qty * item.price;
      totalAmount += lineTotal;
      html += '<tr>';
      html += '<td>'+(idx+1)+'</td>';
      html += '<td>'+item.name+'</td>';
      html += '<td>'+item.spec+'</td>';
      html += '<td>'+item.qty+'</td>';
      html += '<td>'+item.unit+'</td>';
      html += '<td style="text-align:right;">'+item.price.toLocaleString('zh-CN', {minimumFractionDigits:2})+'</td>';
      html += '<td style="text-align:right;">'+lineTotal.toLocaleString('zh-CN', {minimumFractionDigits:2})+'</td>';
      html += '<td>'+(item.remark||'—')+'</td>';
      html += '</tr>';
    });
  }
  $('#subjectTableBody').html(html);
  $('#subjectTotalAmount').text('¥ ' + totalAmount.toLocaleString('zh-CN', {minimumFractionDigits:2}));
}

// ==================== 渲染履约信息 ====================
function renderPerformanceInfo(c) {
  let perf = performanceInfo[c.id] || {};
  // 填充履约基本信息字段
  $('#infoPerformPlace').text(perf.place||c.performPlace||'—');
  $('#infoPerformValidDate').text(c.validDate||'—');
  $('#infoPerformSignDate').text(c.signDate||'—');
  $('#infoPerformEffectiveDate').text(c.effectiveDate||'—');
  $('#infoPerformDeliveryDate').text(c.deliveryDate||'—');
  $('#infoPerformDirection').text(c.direction||'—');
  $('#infoPerformPricingMethod').text(c.pricingMethod||'—');
  $('#infoPerformAmount').text('¥ ' + c.amount.toLocaleString('zh-CN', {minimumFractionDigits:2}));
  // 已开票金额和差额
  let invAmt = invoiceData.filter(i => i.contractId === c.id).reduce((s, i) => s + i.totalAmount, 0);
  let invDiff = c.amount - invAmt;
  $('#infoPerformInvoiced').text(invAmt > 0 ? '¥ ' + invAmt.toLocaleString('zh-CN', {minimumFractionDigits:2}) : '¥ 0.00');
  let invDiffColor = invDiff > 0 ? 'var(--fa-warning)' : (invDiff < 0 ? 'var(--fa-danger)' : 'var(--fa-success)');
  $('#infoPerformDiff').html('<span style="color:'+invDiffColor+'">¥ ' + invDiff.toLocaleString('zh-CN', {minimumFractionDigits:2}) + '</span>');
  $('#infoPerformCurrency').text(c.currency||'CNY');

  // 渲染付款计划
  let plans = perf.paymentPlans || [];
  let html = '';
  if (plans.length === 0) {
    html = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#999;">暂无付款计划</td></tr>';
  } else {
    plans.forEach(function(p){
      html += '<tr>';
      html += '<td>'+p.stage+'</td>';
      html += '<td>'+p.date+'</td>';
      html += '<td style="text-align:right;">'+p.amount.toLocaleString('zh-CN', {minimumFractionDigits:2})+'</td>';
      html += '<td>'+p.ratio+'</td>';
      html += '<td><span class="status-badge '+(p.status==='已付款'?'status-archived':p.status==='待付款'?'status-approving':'status-sealing')+'">'+p.status+'</span></td>';
      html += '<td>'+(p.remark||'—')+'</td>';
      html += '</tr>';
    });
  }
  $('#paymentPlanBody').html(html);
}

// ==================== 渲染审核记录 ====================
function renderAuditRecord(id) {
  let contract = contracts.find(function(c){ return c.id === id; });
  let history = approvalHistories[id] || [];
  let html = '';

  // 渲染审核流程概览
  renderAuditFlowOverview(id, contract, history);

  if (history.length === 0) {
    html = '<div style="text-align:center;padding:30px;color:#999;"><i class="fa-solid fa-clipboard-check" style="font-size:30px;display:block;margin-bottom:8px;"></i>暂无审核记录</div>';
  } else {
    history.forEach(function(h){
      var isReject = h.actionType === 'reject';
      html += '<div class="timeline-item '+h.actionType+'">';
      html += '<div class="timeline-icon">';
      if (h.actionType === 'approve') html += '<i class="fa-solid fa-check"></i>';
      else if (isReject) html += '<i class="fa-solid fa-xmark"></i>';
      else if (h.actionType === 'submit') html += '<i class="fa-solid fa-paper-plane"></i>';
      else if (h.actionType === 'transfer') html += '<i class="fa-solid fa-share"></i>';
      else if (h.actionType === 'withdraw') html += '<i class="fa-solid fa-rotate-left"></i>';
      else html += '<i class="fa-solid fa-circle"></i>';
      html += '</div>';
      html += '<div class="timeline-content">';
      // 节点名称标签
      if (h.nodeName) {
        html += '<span style="display:inline-block;background:#E8F4FD;color:var(--fa-primary);padding:2px 10px;border-radius:10px;font-size:11px;margin-bottom:6px;">'+h.nodeName+'</span> ';
      }
      // 审核状态标签
      if (h.actionType === 'approve') {
        html += '<span style="display:inline-block;background:#E8F5E9;color:#2E7D32;padding:2px 10px;border-radius:10px;font-size:11px;margin-bottom:6px;">通过</span>';
      } else if (isReject) {
        html += '<span style="display:inline-block;background:#FFEBEE;color:#C62828;padding:2px 10px;border-radius:10px;font-size:11px;margin-bottom:6px;">驳回</span>';
      } else if (h.actionType === 'submit') {
        html += '<span style="display:inline-block;background:#E3F2FD;color:#1565C0;padding:2px 10px;border-radius:10px;font-size:11px;margin-bottom:6px;">提交</span>';
      } else if (h.actionType === 'transfer') {
        html += '<span style="display:inline-block;background:#FFF3E0;color:#E65100;padding:2px 10px;border-radius:10px;font-size:11px;margin-bottom:6px;">转办</span>';
      } else if (h.actionType === 'withdraw') {
        html += '<span style="display:inline-block;background:#F3E5F5;color:#6A1B9A;padding:2px 10px;border-radius:10px;font-size:11px;margin-bottom:6px;">撤回</span>';
      }
      html += '<div class="tl-header"><span class="tl-user">'+h.user+'</span><span class="tl-time">'+h.time+'</span></div>';
      html += '<div class="tl-action"><strong>'+h.action+'</strong></div>';
      // 可审核成员：仅待审核节点显示，已审核和提交的不显示
      var isPendingNode = h.actionType !== 'approve' && h.actionType !== 'reject' && h.actionType !== 'submit';
      if (isPendingNode && h.availableHandlers && h.availableHandlers.length > 0) {
        html += '<div style="font-size:12px;color:#888;margin-top:4px;"><i class="fa-solid fa-users" style="margin-right:4px;"></i>可审核成员：'+h.availableHandlers.join('、')+'</div>';
      }
      // 实际审核员：已审核的节点显示
      if (h.actualHandler && (h.actionType === 'approve' || h.actionType === 'reject')) {
        html += '<div style="font-size:12px;color:var(--fa-primary);margin-top:2px;"><i class="fa-solid fa-user-check" style="margin-right:4px;"></i>审核员：'+h.actualHandler+'</div>';
      }
      // 审核备注：提交者不显示
      if (h.opinion && h.actionType !== 'submit') {
        html += '<div class="tl-opinion" style="margin-top:6px;"><i class="fa-solid fa-comment-dots" style="margin-right:4px;color:#888;"></i>审核备注：'+h.opinion+'</div>';
      }
      // 驳回理由（突出显示）
      if (isReject && h.rejectReason) {
        html += '<div style="margin-top:6px;padding:8px 12px;background:#FFEBEE;border-left:3px solid #C62828;border-radius:4px;font-size:13px;color:#C62828;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:4px;"></i><strong>驳回理由：</strong>'+h.rejectReason+'</div>';
      }
      html += '</div></div>';
    });
  }
  $('#approvalTimeline').html(html);
}

// ==================== 渲染审核流程概览 ====================
function renderAuditFlowOverview(id, contract, history) {
  if (!contract) { $('#auditFlowOverview').html(''); return; }

  // 根据合同类型和金额条件找到对应的审核流程
  var flow = null;
  // 优先匹配：合同类型 + 金额条件
  var enabledFlows = auditFlows.filter(function(f){ return f.status === 'enabled'; });
  for (var i = 0; i < enabledFlows.length; i++) {
    var f = enabledFlows[i];
    if (f.contractType === contract.category || f.contractType === 'all') {
      var amount = contract.amount || 0;
      var minOk = f.amountMin == null || amount >= f.amountMin;
      var maxOk = f.amountMax == null || amount < f.amountMax;
      if (minOk && maxOk) {
        flow = f;
        break;
      }
    }
  }
  // 回退：只匹配合同类型（不限金额）
  if (!flow) {
    flow = enabledFlows.find(function(f){ return (f.contractType === contract.category || f.contractType === 'all') && f.amountMin == null && f.amountMax == null; });
  }
  // 最终回退：任意启用的流程
  if (!flow) { flow = enabledFlows[0] || null; }
  if (!flow) { $('#auditFlowOverview').html(''); return; }

  var html = '<div style="border:1px solid #E0E0E0;border-radius:8px;padding:16px;background:#FAFAFA;">';
  html += '<h4 style="color:var(--fa-primary);margin:0 0 12px 0;font-size:15px;"><i class="fa-solid fa-route"></i> 审核流程概览</h4>';
  html += '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px;">';
  html += '<div style="font-size:13px;"><span style="color:#888;">流程名称：</span><strong>'+flow.name+'</strong></div>';
  html += '</div>';

  // 流程节点进度
  html += '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;">';

  // 统一按节点显示，每个节点有自己的审核类型
  var nodes = flow.nodes || [];
  nodes.forEach(function(node, i) {
    var nodeApproveType = node.approveType || 'or-sign';
    var typeTag = nodeApproveType === 'countersign' ? '<span style="font-size:9px;background:#E8F5E9;color:#2E7D32;padding:1px 4px;border-radius:3px;">会签</span>' : '<span style="font-size:9px;background:#FFF3E0;color:#E65100;padding:1px 4px;border-radius:3px;">或签</span>';
    var histItem = history.find(function(h){ return h.nodeName === node.name && h.actionType === 'approve'; });
    var rejectItem = history.find(function(h){ return h.nodeName === node.name && h.actionType === 'reject'; });
    var statusClass = '', statusIcon = '', statusText = '';
    if (histItem) {
      statusClass = 'background:#E8F5E9;border-color:#2E7D32;color:#2E7D32;';
      statusIcon = '<i class="fa-solid fa-check" style="font-size:10px;"></i>';
      statusText = '已通过';
    } else if (rejectItem) {
      statusClass = 'background:#FFEBEE;border-color:#C62828;color:#C62828;';
      statusIcon = '<i class="fa-solid fa-xmark" style="font-size:10px;"></i>';
      statusText = '已驳回';
    } else {
      // 判断是否是当前节点
      var isCurrent = contract.currentNode === node.name;
      if (isCurrent) {
        statusClass = 'background:#E3F2FD;border-color:#1565C0;color:#1565C0;';
        statusIcon = '<i class="fa-solid fa-play" style="font-size:10px;"></i>';
        statusText = '审核中';
      } else {
        statusClass = 'background:#F5F5F5;border-color:#BDBDBD;color:#9E9E9E;';
        statusIcon = '<i class="fa-regular fa-clock" style="font-size:10px;"></i>';
        statusText = '待审核';
      }
    }
    html += '<div style="display:flex;flex-direction:column;align-items:center;padding:8px 12px;border:1px solid;border-radius:8px;min-width:90px;font-size:12px;'+statusClass+'">';
    html += '<div style="margin-bottom:4px;">'+statusIcon+'</div>';
    html += '<div style="font-weight:500;white-space:nowrap;">'+node.name+' '+typeTag+'</div>';
    html += '<div style="font-size:10px;margin-top:2px;">'+statusText+'</div>';
    if (node.handlers && node.handlers.length > 0) {
      html += '<div style="font-size:10px;color:inherit;opacity:0.7;margin-top:2px;">'+node.handlers.join('、')+'</div>';
    }
    html += '</div>';
    if (i < nodes.length - 1) {
      html += '<div style="color:#BDBDBD;font-size:16px;display:flex;align-items:center;"><i class="fa-solid fa-arrow-right"></i></div>';
    }
  });

  html += '</div>';
  html += '</div>';
  $('#auditFlowOverview').html(html);
}

// ==================== 渲染变更记录 ====================
function renderChangeRecord(id) {
  let changes = changeRecords[id] || [];
  let html = '';
  if (changes.length === 0) {
    html = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#999;"><i class="fa-solid fa-code-compare" style="font-size:30px;display:block;margin-bottom:8px;"></i>暂无变更记录</td></tr>';
  } else {
    changes.forEach(function(ch){
      html += '<tr>';
      html += '<td>'+ch.date+'</td>';
      html += '<td>'+ch.operator+'</td>';
      html += '<td>'+ch.field+'</td>';
      html += '<td style="color:#999;text-decoration:line-through;">'+ch.oldValue+'</td>';
      html += '<td style="color:var(--fa-primary);font-weight:500;">'+ch.newValue+'</td>';
      html += '<td>'+(ch.reason||'—')+'</td>';
      html += '</tr>';
    });
  }
  $('#changeRecordBody').html(html);
}

function backToList() {
  $('#pageContractDetail').hide();
  $('#auditBottomBar').hide();
  currentContractId = null;
  if (previousPage === 'contractApproval') {
    switchPage('contractApproval');
  } else if (previousPage === 'myAudit') {
    switchPage('myAudit');
  } else if (previousPage === 'contractDraft') {
    switchPage('contractDraft');
  } else {
    switchPage('contract');
  }
}

// ==================== 工作流步骤 ====================
function updateWorkflowSteps(status) {
  // 重置所有步骤
  $('#stepApproval').removeClass('active done rejected-step');
  $('#stepSeal').removeClass('active done rejected-step');
  $('#stepArchive').removeClass('active done rejected-step');
  $('#connector1').removeClass('active done');
  $('#connector2').removeClass('active done');

  switch(status) {
    case 'draft':
      $('#stepApproval').addClass('active');
      break;
    case 'approving':
      $('#stepApproval').addClass('active');
      $('#connector1').addClass('active');
      break;
    case 'approved':
      $('#stepApproval').addClass('done');
      $('#connector1').addClass('done');
      $('#stepSeal').addClass('active');
      $('#connector2').addClass('active');
      break;
    case 'rejected':
      $('#stepApproval').addClass('rejected-step');
      break;
    case 'sealing':
      $('#stepApproval').addClass('done');
      $('#connector1').addClass('done');
      $('#stepSeal').addClass('active');
      $('#connector2').addClass('active');
      break;
    case 'sealed':
      $('#stepApproval').addClass('done');
      $('#connector1').addClass('done');
      $('#stepSeal').addClass('done');
      $('#connector2').addClass('done');
      $('#stepArchive').addClass('active');
      break;
    case 'archiving':
      $('#stepApproval').addClass('done');
      $('#connector1').addClass('done');
      $('#stepSeal').addClass('done');
      $('#connector2').addClass('done');
      $('#stepArchive').addClass('active');
      break;
    case 'archived':
      $('#stepApproval').addClass('done');
      $('#connector1').addClass('done');
      $('#stepSeal').addClass('done');
      $('#connector2').addClass('done');
      $('#stepArchive').addClass('done');
      break;
    case 'withdrawn':
      $('#stepApproval').addClass('rejected-step');
      break;
  }
}

// ==================== 审批历史 ====================
function renderApprovalHistory(id) {
  let history = approvalHistories[id] || [];
  let html = '';
  if (history.length === 0) {
    html = '<div style="text-align:center;padding:20px;color:#999;">暂无审批记录</div>';
  } else {
    history.forEach(function(h){
      html += '<div class="timeline-item '+h.actionType+'">';
      html += '<div class="timeline-icon">';
      if (h.actionType === 'approve') html += '<i class="fa-solid fa-check"></i>';
      else if (h.actionType === 'reject') html += '<i class="fa-solid fa-xmark"></i>';
      else if (h.actionType === 'submit') html += '<i class="fa-solid fa-paper-plane"></i>';
      else if (h.actionType === 'transfer') html += '<i class="fa-solid fa-share"></i>';
      else if (h.actionType === 'withdraw') html += '<i class="fa-solid fa-rotate-left"></i>';
      else html += '<i class="fa-solid fa-circle"></i>';
      html += '</div>';
      html += '<div class="timeline-content">';
      html += '<div class="tl-header"><span class="tl-user">'+h.user+' <small>('+h.dept+')</small></span><span class="tl-time">'+h.time+'</span></div>';
      html += '<div class="tl-action"><strong>'+h.action+'</strong></div>';
      if (h.opinion) {
        html += '<div class="tl-opinion">'+h.opinion+'</div>';
      }
      html += '</div></div>';
    });
  }
  $('#approvalTimeline').html(html);
}

// ==================== 渲染操作按钮 ====================
function renderActionButtons(c) {
  let html = '';

  switch(c.status) {
    case 'approving':
      html += '<button class="btn btn-success" onclick="submitApproval()"><i class="fa-solid fa-check"></i> 提交通过</button> ';
      html += '<button class="btn btn-danger" onclick="openRejectModal()"><i class="fa-solid fa-xmark"></i> 驳回</button> ';
      html += '<button class="btn btn-warning" onclick="openTransferModal()"><i class="fa-solid fa-share"></i> 转办</button> ';
      html += '<button class="btn btn-info" onclick="openCommunicateModal()"><i class="fa-solid fa-comments"></i> 沟通</button> ';
      html += '<button class="btn btn-purple" onclick="openSkipModal()"><i class="fa-solid fa-forward"></i> 同处理人跳过</button> ';
      html += '<button class="btn btn-purple" onclick="openAddHandlerModal()"><i class="fa-solid fa-user-plus"></i> 追加处理人</button> ';
      if (c.handler.indexOf('张经理') >= 0 || c.handler.indexOf('当前用户') >= 0) {
        html += '<button class="btn btn-default" onclick="openWithdrawModal()"><i class="fa-solid fa-rotate-left"></i> 撤回</button> ';
      }
      break;
    case 'approved':
      html += '<button class="btn btn-info" onclick="pushToSeal('+c.id+')"><i class="fa-solid fa-stamp"></i> 推送至用印签署</button> ';
      html += '<button class="btn btn-default" onclick="backToList()"><i class="fa-solid fa-arrow-left"></i> 返回</button>';
      break;
    case 'sealing':
      html += '<button class="btn btn-info" onclick="confirmSeal()"><i class="fa-solid fa-stamp"></i> 确认用印签署</button> ';
      html += '<button class="btn btn-default" onclick="backToList()"><i class="fa-solid fa-arrow-left"></i> 返回</button>';
      break;
    case 'sealed':
      html += '<button class="btn btn-purple" onclick="pushToArchive('+c.id+')"><i class="fa-solid fa-box-archive"></i> 推送至归档</button> ';
      html += '<button class="btn btn-default" onclick="backToList()"><i class="fa-solid fa-arrow-left"></i> 返回</button>';
      break;
    case 'archiving':
      html += '<button class="btn btn-purple" onclick="confirmArchive()"><i class="fa-solid fa-box-archive"></i> 确认归档</button> ';
      html += '<button class="btn btn-default" onclick="backToList()"><i class="fa-solid fa-arrow-left"></i> 返回</button>';
      break;
    case 'archived':
      html += '<button class="btn btn-default" onclick="backToList()"><i class="fa-solid fa-arrow-left"></i> 返回</button>';
      break;
    case 'draft':
    case 'rejected':
    case 'withdrawn':
      html += '<button class="btn btn-primary" onclick="reSubmit('+c.id+')"><i class="fa-solid fa-paper-plane"></i> 重新发起审批</button> ';
      html += '<button class="btn btn-default" onclick="backToList()"><i class="fa-solid fa-arrow-left"></i> 返回</button>';
      break;
    default:
      html += '<button class="btn btn-default" onclick="backToList()"><i class="fa-solid fa-arrow-left"></i> 返回</button>';
  }

  $('#actionButtons').html(html);
}

// ==================== 审批操作：提交通过 ====================
function submitApproval() {
  let opinion = $('#opinionText').val().trim();
  if (!opinion) {
    opinion = '同意，审批通过。';
  }
  let c = contracts.find(function(item){ return item.id === currentContractId; });
  if (!c) return;

  // 添加审批历史
  if (!approvalHistories[currentContractId]) approvalHistories[currentContractId] = [];
  approvalHistories[currentContractId].push({
    user: c.currentHandler.split('（')[0],
    dept: c.currentHandler.split('（')[1] ? c.currentHandler.split('（')[1].replace('）','') : '',
    action: '审批通过',
    actionType: 'approve',
    time: new Date().toLocaleString('zh-CN'),
    opinion: opinion
  });

  // 模拟流程流转：根据当前审批节点判断下一节点
  // 简化处理：直接标记为已通过
  c.status = 'approved';
  c.currentNode = '待推送用印签署';
  c.progress = 100;

  // 刷新界面
  openContractDetail(currentContractId);
  $('#opinionText').val('');
  alert('审批已通过！合同将流转至用印签署环节。');
}

// ==================== 审批操作：驳回 ====================
function openRejectModal() {
  $('#modalReject').modal('show');
}

function confirmReject() {
  let reason = $('#rejectReason').val().trim();
  if (!reason) { alert('请填写驳回原因'); return; }

  let c = contracts.find(function(item){ return item.id === currentContractId; });
  if (!c) return;

  if (!approvalHistories[currentContractId]) approvalHistories[currentContractId] = [];
  approvalHistories[currentContractId].push({
    user: c.currentHandler.split('（')[0],
    dept: c.currentHandler.split('（')[1] ? c.currentHandler.split('（')[1].replace('）','') : '',
    action: '驳回',
    actionType: 'reject',
    time: new Date().toLocaleString('zh-CN'),
    opinion: reason
  });

  c.status = 'rejected';
  c.currentNode = '已驳回';
  c.progress = Math.max(c.progress - 30, 10);
  c.currentHandler = c.handler;

  // 驳回后从待审核列表中移除
  myAuditList = myAuditList.filter(function(m){ return m.contractId !== currentContractId; });
  renderMyAuditTable(myAuditList);

  $('#modalReject').modal('hide');
  $('#rejectReason').val('');
  openContractDetail(currentContractId);
  alert('合同已驳回，该审核记录处理完成。');
}

// ==================== 审批操作：转办 ====================
function openTransferModal() {
  $('#modalTransfer').modal('show');
}
function quickTransfer(id) {
  currentContractId = id;
  openTransferModal();
}

function confirmTransfer() {
  let to = $('#transferTo').val();
  let opinion = $('#transferOpinion').val().trim();
  if (!to) { alert('请选择转交人员'); return; }

  let c = contracts.find(function(item){ return item.id === currentContractId; });
  if (!c) return;

  if (!approvalHistories[currentContractId]) approvalHistories[currentContractId] = [];
  approvalHistories[currentContractId].push({
    user: c.currentHandler.split('（')[0],
    dept: c.currentHandler.split('（')[1] ? c.currentHandler.split('（')[1].replace('）','') : '',
    action: '转办至 '+to,
    actionType: 'transfer',
    time: new Date().toLocaleString('zh-CN'),
    opinion: opinion || '转交处理'
  });

  c.currentHandler = to;
  // 更新当前节点显示
  let nodeMap = { '王律师':'法务审批', '赵主管':'财务审批', '陈总监':'运营审批', '刘经理':'行政审批' };
  for (let k in nodeMap) {
    if (to.indexOf(k) >= 0) { c.currentNode = nodeMap[k]; break; }
  }

  $('#modalTransfer').modal('hide');
  $('#transferTo').val('');
  $('#transferOpinion').val('');
  openContractDetail(currentContractId);
  alert('已转办至 ' + to);
}

// ==================== 审批操作：沟通 ====================
function openCommunicateModal() {
  if (!chatMessages[currentContractId]) chatMessages[currentContractId] = [];
  renderChatMessages();
  $('#modalCommunicate').modal('show');
}
function communicateAbout(id) {
  currentContractId = id;
  openCommunicateModal();
}

function renderChatMessages() {
  let msgs = chatMessages[currentContractId] || [];
  let html = '<div style="text-align:center;color:#999;font-size:12px;margin-bottom:10px;">—— 沟通记录 ——</div>';
  msgs.forEach(function(m){
    html += '<div style="margin-bottom:8px;"><strong style="color:var(--fa-primary);">'+m.user+'</strong> <small style="color:#999;">'+m.time+'</small><br><span style="background:#F0F7FF;padding:6px 10px;border-radius:6px;display:inline-block;max-width:90%;">'+m.text+'</span></div>';
  });
  if (msgs.length === 0) {
    html += '<div style="text-align:center;color:#999;padding:20px;">暂无沟通记录，开始对话吧</div>';
  }
  $('#chatMessages').html(html);
  // 滚动到底部
  $('#chatMessages').scrollTop($('#chatMessages')[0].scrollHeight);
}

function sendMessage() {
  let text = $('#chatInput').val().trim();
  if (!text) return;

  if (!chatMessages[currentContractId]) chatMessages[currentContractId] = [];
  chatMessages[currentContractId].push({
    user: '当前用户',
    time: new Date().toLocaleString('zh-CN'),
    text: text
  });

  // 同时写入审批历史
  if (!approvalHistories[currentContractId]) approvalHistories[currentContractId] = [];
  approvalHistories[currentContractId].push({
    user: '当前用户',
    dept: '',
    action: '沟通意见',
    actionType: 'submit',
    time: new Date().toLocaleString('zh-CN'),
    opinion: text
  });

  $('#chatInput').val('');
  renderChatMessages();
}

// ==================== 审批操作：同处理人跳过 ====================
function openSkipModal() {
  $('#modalSkip').modal('show');
}
function skipHandler(id) {
  currentContractId = id;
  openSkipModal();
}

function confirmSkip() {
  let c = contracts.find(function(item){ return item.id === currentContractId; });
  if (!c) return;

  if (!approvalHistories[currentContractId]) approvalHistories[currentContractId] = [];
  approvalHistories[currentContractId].push({
    user: c.currentHandler.split('（')[0],
    dept: c.currentHandler.split('（')[1] ? c.currentHandler.split('（')[1].replace('）','') : '',
    action: '同处理人跳过',
    actionType: 'approve',
    time: new Date().toLocaleString('zh-CN'),
    opinion: '与上一节点处理人相同，系统自动跳过。'
  });

  c.status = 'approved';
  c.currentNode = '待推送用印签署';
  c.progress = 100;

  $('#modalSkip').modal('hide');
  openContractDetail(currentContractId);
  alert('已跳过当前节点，流转至下一环节。');
}

// ==================== 审批操作：追加处理人 ====================
function openAddHandlerModal() {
  $('#modalAddHandler').modal('show');
}
function addHandler(id) {
  currentContractId = id;
  openAddHandlerModal();
}

function confirmAddHandler() {
  let selected = $('#addHandlerSelect').val();
  let reason = $('#addHandlerReason').val().trim();
  if (!selected || selected.length === 0) { alert('请选择追加的处理人'); return; }

  let c = contracts.find(function(item){ return item.id === currentContractId; });
  if (!c) return;

  if (!approvalHistories[currentContractId]) approvalHistories[currentContractId] = [];
  approvalHistories[currentContractId].push({
    user: c.currentHandler.split('（')[0],
    dept: c.currentHandler.split('（')[1] ? c.currentHandler.split('（')[1].replace('）','') : '',
    action: '追加处理人: '+selected.join('、'),
    actionType: 'transfer',
    time: new Date().toLocaleString('zh-CN'),
    opinion: reason || '追加协同审批人'
  });

  // 主处理人保持不变，追加的处理人也会收到通知
  $('#modalAddHandler').modal('hide');
  $('#addHandlerReason').val('');
  alert('已追加处理人：' + selected.join('、') + '，他们将收到审批通知。');
}

// ==================== 审批操作：撤回 ====================
function openWithdrawModal() {
  $('#modalWithdraw').modal('show');
}
function withdrawContract(id) {
  currentContractId = id;
  openWithdrawModal();
}

function confirmWithdraw() {
  let c = contracts.find(function(item){ return item.id === currentContractId; });
  if (!c) return;

  if (!approvalHistories[currentContractId]) approvalHistories[currentContractId] = [];
  approvalHistories[currentContractId].push({
    user: c.handler.split('（')[0],
    dept: c.handler.split('（')[1] ? c.handler.split('（')[1].replace('）','') : '',
    action: '撤回',
    actionType: 'withdraw',
    time: new Date().toLocaleString('zh-CN'),
    opinion: '经办人主动撤回。'
  });

  c.status = 'withdrawn';
  c.currentNode = '已撤回';
  c.currentHandler = c.handler;
  c.progress = 15;

  $('#modalWithdraw').modal('hide');
  openContractDetail(currentContractId);
  alert('合同已撤回。');
}

// ==================== 用印签署 ====================
function pushToSeal(id) {
  let c = contracts.find(function(item){ return item.id === id; });
  if (!c) return;
  c.status = 'sealing';
  c.currentNode = '用印签署';
  c.currentHandler = '陈主管（用印管理处）';
  if (!approvalHistories[id]) approvalHistories[id] = [];
  approvalHistories[id].push({
    user: '系统',
    dept: '',
    action: '流转至用印签署',
    actionType: 'submit',
    time: new Date().toLocaleString('zh-CN'),
    opinion: '审批已通过，自动流转至用印签署环节。'
  });
  openContractDetail(id);
  alert('已推送至用印签署环节。');
}

function quickSeal(id) {
  currentContractId = id;
  openContractDetail(id);
}

function confirmSeal() {
  let c = contracts.find(function(item){ return item.id === currentContractId; });
  if (!c) return;

  let opinion = $('#opinionText').val().trim() || '已完成盖章签署。';

  if (!approvalHistories[currentContractId]) approvalHistories[currentContractId] = [];
  approvalHistories[currentContractId].push({
    user: c.currentHandler.split('（')[0],
    dept: c.currentHandler.split('（')[1] ? c.currentHandler.split('（')[1].replace('）','') : '',
    action: '用印签署完成',
    actionType: 'approve',
    time: new Date().toLocaleString('zh-CN'),
    opinion: opinion
  });

  c.status = 'sealed';
  c.currentNode = '待推送归档';
  c.currentHandler = '刘经理（档案室）';

  $('#opinionText').val('');
  openContractDetail(currentContractId);
  alert('用印签署已完成！请推送至合同归档。');
}

// ==================== 归档 ====================
function pushToArchive(id) {
  let c = contracts.find(function(item){ return item.id === id; });
  if (!c) return;
  c.status = 'archiving';
  c.currentNode = '合同存档';
  c.currentHandler = '刘经理（档案室）';
  if (!approvalHistories[id]) approvalHistories[id] = [];
  approvalHistories[id].push({
    user: '系统',
    dept: '',
    action: '流转至归档',
    actionType: 'submit',
    time: new Date().toLocaleString('zh-CN'),
    opinion: '签署已完成，自动流转至归档环节。'
  });
  openContractDetail(id);
  alert('已推送至合同归档环节。');
}

function quickArchive(id) {
  currentContractId = id;
  openContractDetail(id);
}

function confirmArchive() {
  let c = contracts.find(function(item){ return item.id === currentContractId; });
  if (!c) return;

  let opinion = $('#opinionText').val().trim() || '合同已归档入库。';

  if (!approvalHistories[currentContractId]) approvalHistories[currentContractId] = [];
  approvalHistories[currentContractId].push({
    user: c.currentHandler.split('（')[0],
    dept: c.currentHandler.split('（')[1] ? c.currentHandler.split('（')[1].replace('）','') : '',
    action: '归档完成',
    actionType: 'approve',
    time: new Date().toLocaleString('zh-CN'),
    opinion: opinion
  });

  c.status = 'archived';
  c.currentNode = '已归档';
  c.progress = 100;

  $('#opinionText').val('');
  openContractDetail(currentContractId);
  alert('合同已归档完毕！');
}
