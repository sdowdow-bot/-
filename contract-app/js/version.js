// ==================== 版本抽屉开关 ====================
let versionDrawerOpen = false;
function toggleVersionDrawer() {
  versionDrawerOpen = !versionDrawerOpen;
  if (versionDrawerOpen) {
    $('#versionDrawer').css('transform','translateX(0)');
    $('#contractContentMain').css('margin-right','380px');
  } else {
    $('#versionDrawer').css('transform','translateX(100%)');
    $('#contractContentMain').css('margin-right','0');
  }
}

// ==================== 详情页版本预览与对比 ====================
function detailPreviewVersion(contractId, versionIdx) {
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
  previewHtml += '<strong style="color:var(--fa-primary);">' + v.version + '</strong> ' + v.summary + ' <span style="color:#999;">- ' + v.user + ' ' + v.time + '</span>';
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

function detailCompareVersion(contractId, versionIdx) {
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

  // 按段落拆分对比
  let oldLines = oldContent.replace(/<\/p>/g, '</p>\n').split('\n').filter(function(l){ return l.trim(); });
  let newLines = newContent.replace(/<\/p>/g, '</p>\n').split('\n').filter(function(l){ return l.trim(); });

  let oldDiffHtml = '';
  let newDiffHtml = '';
  let maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    let oldLine = oldLines[i] || '';
    let newLine = newLines[i] || '';
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
  for (let i = oldLines.length; i < newLines.length; i++) {
    newDiffHtml += '<div class="diff-added">' + newLines[i] + '</div>';
  }
  for (let i = newLines.length; i < oldLines.length; i++) {
    oldDiffHtml += '<div class="diff-removed">' + oldLines[i] + '</div>';
  }

  let compareHtml = '<div style="margin-bottom:12px;padding:8px 12px;background:#FFF8E1;border-radius:6px;font-size:12px;color:#8D6E00;">';
  compareHtml += '<i class="fa-solid fa-code-compare"></i> 对比：<strong style="color:var(--fa-primary);">' + v.version + '</strong> → <strong style="color:var(--fa-primary);">' + current.version + '</strong>（当前版本）';
  compareHtml += '</div>';
  compareHtml += '<div class="version-diff-view">';
  compareHtml += '<div class="diff-pane"><div class="diff-pane-header"><i class="fa-solid fa-file-lines"></i> ' + v.version + ' <span style="color:#999;font-weight:400;">' + v.summary + '</span></div><div class="diff-pane-body">' + (oldDiffHtml||'<span style="color:#999;">无内容</span>') + '</div></div>';
  compareHtml += '<div class="diff-pane"><div class="diff-pane-header"><i class="fa-solid fa-file-lines"></i> ' + current.version + ' <span style="color:#999;font-weight:400;">当前版本</span></div><div class="diff-pane-body">' + (newDiffHtml||'<span style="color:#999;">无内容</span>') + '</div></div>';
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

// 详情页回滚到指定版本
function detailRollbackVersion(contractId, versionIdx) {
  let versions = collabVersions[contractId] || [];
  let v = versions[versionIdx];
  if (!v) return;
  if (!confirm('确认回滚到版本 '+v.version+'（'+v.summary+'）？\n回滚后合同内容将被替换为该版本内容，当前版本仍保留在历史记录中。')) return;

  let content = v.content || '';
  // 更新文档内容
  collabDocContents[contractId] = content;

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

  // 更新合同更新时间
  let c = contracts.find(function(item){ return item.id === contractId; });
  if (c) {
    c.updateTime = new Date().toLocaleString('zh-CN');
  }

  // 重新渲染合同内容
  let contentHtml = content;
  contentHtml = contentHtml.replace(/<span class="revision-delete"[^>]*>[\s\S]*?<\/span>/g, '');
  contentHtml = contentHtml.replace(/<span class="revision-insert"[^>]*>([\s\S]*?)<\/span>/g, '$1');
  contentHtml = contentHtml.replace(/<span class="revision-format"[^>]*>([\s\S]*?)<\/span>/g, '$1');
  contentHtml = contentHtml.replace(/<span class="annotation-mark"[^>]*>([\s\S]*?)<\/span>/g, '$1');
  $('#contractContentView').html(contentHtml);

  // 重新渲染版本列表
  let newVersions = collabVersions[contractId] || [];
  if (newVersions.length > 0) {
    $('#detailVersionCount').text('共 ' + newVersions.length + ' 个版本');
    let verHtml = '';
    newVersions.forEach(function(v2, idx) {
      let isCurrent = idx === 0;
      let typeLabel = '';
      if (isCurrent) typeLabel = '<span class="version-current-tag">当前</span>';
      else if (v2.type === 'draft') typeLabel = '<span class="version-draft-tag">草稿</span>';
      else if (v2.type === 'auto') typeLabel = '<span style="display:inline-block;background:#E3F2FD;color:#1565C0;font-size:10px;padding:1px 6px;border-radius:3px;margin-left:6px;font-weight:500;">自动</span>';
      else if (v2.type === 'rollback') typeLabel = '<span style="display:inline-block;background:#FCE4EC;color:#C62828;font-size:10px;padding:1px 6px;border-radius:3px;margin-left:6px;font-weight:500;">回滚</span>';
      verHtml += '<div style="border:1px solid #E8ECF0;border-radius:6px;margin-bottom:10px;overflow:hidden;">';
      verHtml += '<div style="padding:10px 12px;background:#F8F9FA;border-bottom:1px solid #E8ECF0;display:flex;align-items:center;justify-content:space-between;font-size:12px;">';
      verHtml += '<span><strong style="color:var(--fa-primary);">'+v2.version+'</strong> '+typeLabel+'</span>';
      verHtml += '<span style="color:#999;font-size:11px;">'+v2.time+'</span>';
      verHtml += '</div>';
      verHtml += '<div style="padding:10px 12px;">';
      verHtml += '<div style="font-size:12px;color:#555;margin-bottom:6px;">'+v2.summary+' <span style="color:#999;">- '+v2.user+'</span></div>';
      verHtml += '<div style="display:flex;gap:6px;">';
      if (!isCurrent) {
        verHtml += '<button class="btn btn-xs btn-info" onclick="detailPreviewVersion('+contractId+','+idx+')"><i class="fa-solid fa-eye"></i> 查看旧版</button>';
        verHtml += '<button class="btn btn-xs btn-primary" onclick="detailCompareVersion('+contractId+','+idx+')"><i class="fa-solid fa-code-compare"></i> 对比</button>';
        verHtml += '<button class="btn btn-xs btn-warning" onclick="detailRollbackVersion('+contractId+','+idx+')"><i class="fa-solid fa-rotate-left"></i> 回滚</button>';
      } else {
        verHtml += '<span style="font-size:11px;color:var(--fa-primary);font-weight:500;"><i class="fa-solid fa-circle-check"></i> 当前版本</span>';
      }
      verHtml += '</div>';
      verHtml += '</div>';
      verHtml += '</div>';
    });
    $('#detailVersionList').html(verHtml);
  }

  alert('已回滚到版本 '+v.version+'！');
}

// ==================== 合同附件下载 ====================
function downloadContractAttachment(id) {
  var c = contracts.find(function(item){ return item.id === id; });
  if (!c || !c.attachmentName) { alert('暂无附件可下载'); return; }
  var ext = c.attachmentName.split('.').pop().toLowerCase();
  var mimeType = ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  var content = '这是一个模拟的合同附件文件：' + c.attachmentName + '\n\n';
  content += '合同编号：' + c.no + '\n';
  content += '合同名称：' + c.name + '\n';
  content += '合同金额：¥' + c.amount.toLocaleString('zh-CN', {minimumFractionDigits:2}) + '\n';
  content += '相对方：' + (c.counterParty || c.partyB || '—') + '\n';
  content += '签订日期：' + c.signDate + '\n';
  content += '这是模拟生成的附件内容，实际系统中将为真实上传的合同文件。';
  var blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = c.attachmentName;
  a.click();
  URL.revokeObjectURL(url);
}

// ==================== 删除合同 ====================
function deleteContract(id) {
  let c = contracts.find(function(item){ return item.id === id; });
  if (!c) return;
  if (!confirm('确认删除合同【' + c.name + '】吗？删除后不可恢复！')) return;
  contracts = contracts.filter(function(item){ return item.id !== id; });
  renderContractTable(contracts);
  updateTotalCount();
  renderDraftTable();
  alert('合同已删除。');
}

// ==================== 查看审核记录 ====================
function viewAuditRecord(id) {
  previousPage = 'contractApproval';
  openContractDetail(id);
  setTimeout(function(){
    $('#detailTabs a[href="#tabAuditRecord"]').tab('show');
  }, 100);
}

function printAuditRecord() {
  alert('正在生成审核记录打印预览...');
}
