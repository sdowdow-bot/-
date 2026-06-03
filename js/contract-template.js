// ==================== 合同模板管理 ====================

// 合同模板数据
let contractTemplates = [
  { id: 1, name: '标准采购合同模板', type: '采购合同', category: '物资采购', dept: '采购部', author: '法务部', status: 1, createTime: '2026-01-15 10:30', updateTime: '2026-06-20 14:22', usageCount: 28, desc: '适用于一般物资采购，含标准付款条款、交付验收条款', content: '采购合同正文模板内容...' },
  { id: 2, name: '服务外包合同模板', type: '服务合同', category: '服务外包', dept: '运营部', author: '法务部', status: 1, createTime: '2026-02-10 09:00', updateTime: '2026-06-18 11:05', usageCount: 15, desc: '适用于服务外包项目，含SLA条款、保密条款', content: '服务合同正文模板内容...' },
  { id: 3, name: '战略合作框架协议模板', type: '合作协议', category: '战略合作', dept: '总经办', author: '法务部', status: 1, createTime: '2026-03-01 14:20', updateTime: '2026-05-30 16:40', usageCount: 8, desc: '适用于战略合作框架协议，含合作范围、权益分配条款', content: '合作协议正文模板内容...' },
  { id: 4, name: '办公场地租赁合同模板', type: '租赁合同', category: '场地租赁', dept: '行政部', author: '法务部', status: 1, createTime: '2026-03-15 11:00', updateTime: '2026-06-10 09:30', usageCount: 5, desc: '适用于办公场地租赁，含租金调整、续租条款', content: '租赁合同正文模板内容...' },
  { id: 5, name: '设备采购合同模板', type: '采购合同', category: '设备采购', dept: '采购部', author: '法务部', status: 0, createTime: '2026-04-05 16:00', updateTime: '2026-05-15 10:20', usageCount: 3, desc: '适用于设备采购，含安装调试、质保条款（已停用）', content: '设备采购合同正文模板内容...' },
  { id: 6, name: 'IT服务合同模板', type: '服务合同', category: 'IT服务', dept: '运营部', author: '法务部', status: 1, createTime: '2026-04-20 13:45', updateTime: '2026-06-22 08:50', usageCount: 12, desc: '适用于IT技术服务，含数据安全、知识产权条款', content: 'IT服务合同正文模板内容...' }
];

// 渲染模板列表
function renderTemplateTable(list) {
  if (!list) list = contractTemplates;
  let html = '';
  if (list.length === 0) {
    html = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#999;"><i class="fa-solid fa-file-lines" style="font-size:40px;display:block;margin-bottom:10px;color:var(--fa-primary);"></i>暂无合同模板</td></tr>';
  } else {
    list.forEach(function(t) {
      let statusSwitch = '<label class="tpl-switch" style="position:relative;display:inline-block;width:40px;height:22px;cursor:pointer;">';
      statusSwitch += '<input type="checkbox" '+(t.status===1?'checked':'')+' onchange="toggleTemplateStatus('+t.id+',this.checked)" style="opacity:0;width:0;height:0;">';
      statusSwitch += '<span class="tpl-slider" style="position:absolute;top:0;left:0;right:0;bottom:0;background:'+(t.status===1?'var(--fa-success)':'#ccc')+';border-radius:22px;transition:.3s;"></span>';
      statusSwitch += '</label>';
      html += '<tr>';
      html += '<td><input type="checkbox" class="template-check-item" value="'+t.id+'"></td>';
      html += '<td><a href="#" onclick="viewTemplateDetail('+t.id+');return false;" style="color:var(--fa-primary);font-weight:500;">'+t.name+'</a></td>';
      html += '<td>'+t.type+'</td>';
      html += '<td>'+t.category+'</td>';
      html += '<td>'+t.dept+'</td>';
      html += '<td>'+statusSwitch+'</td>';
      html += '<td>'+t.usageCount+' 次</td>';
      html += '<td>'+t.updateTime+'</td>';
      html += '<td style="white-space:nowrap;">';
      html += '<a href="#" onclick="editTemplateBasicInfo('+t.id+');return false;" style="color:var(--fa-info);margin-right:8px;" title="编辑基本信息"><i class="fa-solid fa-pen-to-square"></i> 基本信息</a>';
      html += '<a href="#" onclick="editTemplateContent('+t.id+');return false;" style="color:var(--fa-primary);margin-right:8px;" title="编辑内容"><i class="fa-solid fa-file-pen"></i> 合同内容</a>';
      html += '<a href="#" onclick="deleteTemplate('+t.id+');return false;" style="color:var(--fa-danger);" title="删除"><i class="fa-solid fa-trash"></i> 删除</a>';
      html += '</td>';
      html += '</tr>';
    });
  }
  $('#templateTableBody').html(html);
  $('#templateTotalCount').text(list.length);
  $('#templateCheckAll').prop('checked', false);
}

// 查看模板详情
function viewTemplateDetail(id) {
  let t = contractTemplates.find(function(item){ return item.id === id; });
  if (!t) return;
  let statusLabel = t.status === 1 ? '<span class="status-badge status-approved">启用</span>' : '<span class="status-badge status-rejected">停用</span>';
  let html = '';
  html += '<div style="margin-bottom:20px;">';
  html += '<h4 style="margin-top:0;"><i class="fa-solid fa-file-lines" style="color:var(--fa-primary);"></i> '+t.name+'</h4>';
  html += '<div class="row" style="margin-top:15px;">';
  html += '<div class="col-md-4"><p><strong>模板类型：</strong>'+t.type+'</p></div>';
  html += '<div class="col-md-4"><p><strong>适用类别：</strong>'+t.category+'</p></div>';
  html += '<div class="col-md-4"><p><strong>适用部门：</strong>'+t.dept+'</p></div>';
  html += '</div>';
  html += '<div class="row">';
  html += '<div class="col-md-4"><p><strong>创建者：</strong>'+t.author+'</p></div>';
  html += '<div class="col-md-4"><p><strong>状态：</strong>'+statusLabel+'</p></div>';
  html += '<div class="col-md-4"><p><strong>使用次数：</strong>'+t.usageCount+' 次</p></div>';
  html += '</div>';
  html += '<div class="row">';
  html += '<div class="col-md-6"><p><strong>创建时间：</strong>'+t.createTime+'</p></div>';
  html += '<div class="col-md-6"><p><strong>更新时间：</strong>'+t.updateTime+'</p></div>';
  html += '</div>';
  html += '<p><strong>模板说明：</strong>'+t.desc+'</p>';
  html += '</div>';
  html += '<div style="border-top:1px solid #E8ECF0;padding-top:15px;">';
  html += '<h5 style="color:var(--fa-primary);border-bottom:2px solid var(--fa-primary);padding-bottom:6px;margin-bottom:15px;"><i class="fa-solid fa-file-contract"></i> 模板内容预览</h5>';
  html += '<div style="background:#F9FAFB;border:1px solid #E8ECF0;border-radius:8px;padding:20px;min-height:200px;font-size:13px;line-height:1.8;color:#555;">';
  html += t.content;
  html += '</div>';
  html += '</div>';
  $('#templateDetailContent').html(html);
  $('#templateDetailName').text(t.name);
  $('#modalTemplateDetail').modal('show');
}

// 编辑模板相关变量
let editingTemplateId = null;
let isNewTemplateEditor = false;

// 保存编辑模板基本信息
function saveEditTemplate() {
  let id = parseInt($('#editTemplateId').val());
  let name = $('#editTemplateName').val().trim();
  let type = $('#editTemplateType').val();
  let category = $('#editTemplateCategory').val().trim();
  let dept = $('#editTemplateDept').val();
  let desc = $('#editTemplateDesc').val().trim();
  if (!name) { alert('请填写模板名称'); return; }
  if (!type) { alert('请选择模板类型'); return; }
  let t = contractTemplates.find(function(item){ return item.id === id; });
  if (t) {
    t.name = name; t.type = type; t.category = category; t.dept = dept;
    t.desc = desc; t.updateTime = new Date().toLocaleString('zh-CN');
  }
  $('#modalEditTemplate').modal('hide');
  renderTemplateTable();
  alert('模板基本信息已保存');
}

// 切换模板状态（开关）
function toggleTemplateStatus(id, checked) {
  let t = contractTemplates.find(function(item){ return item.id === id; });
  if (!t) return;
  t.status = checked ? 1 : 0;
  t.updateTime = new Date().toLocaleString('zh-CN');
  renderTemplateTable();
}

// 删除模板
function deleteTemplate(id) {
  let t = contractTemplates.find(function(item){ return item.id === id; });
  if (!t) return;
  if (!confirm('确认删除模板"' + t.name + '"？删除后不可恢复。')) return;
  contractTemplates = contractTemplates.filter(function(item){ return item.id !== id; });
  renderTemplateTable();
  alert('模板已删除');
}

// 编辑基本信息（弹框）
function editTemplateBasicInfo(id) {
  let t = contractTemplates.find(function(item){ return item.id === id; });
  if (!t) return;
  $('#editTemplateId').val(t.id);
  $('#editTemplateName').val(t.name);
  $('#editTemplateType').val(t.type);
  $('#editTemplateCategory').val(t.category);
  $('#editTemplateDept').val(t.dept);
  $('#editTemplateDesc').val(t.desc);
  $('#modalEditTemplate').modal('show');
}

// 编辑合同内容（跳转富文本编辑器页面）
function editTemplateContent(id) {
  let t = contractTemplates.find(function(item){ return item.id === id; });
  if (!t) return;

  // 标记为编辑模式
  editingTemplateId = id;
  isNewTemplateEditor = false;

  // 填充隐藏字段
  $('#templateEditorTitle').text('编辑合同内容 - ' + t.name);
  $('#editorTemplateName').val(t.name);
  $('#editorTemplateType').val(t.type);
  $('#editorTemplateCategory').val(t.category);
  $('#editorTemplateDept').val(t.dept);
  $('#editorTemplateDesc').val(t.desc);

  // 填充富文本编辑器内容
  if (t.content && t.content.length > 20 && t.content.indexOf('<') !== -1) {
    $('#templateRichEditor').html(t.content);
  } else {
    $('#templateRichEditor').html(
      '<h2 style="text-align:center;color:#333;margin-bottom:20px;">' + t.name + '</h2>' +
      '<p style="text-align:center;color:#888;font-size:12px;margin-bottom:20px;">合同类型：' + t.type + ' &nbsp;|&nbsp; 更新时间：' + t.updateTime + '</p>' +
      '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第一条 合同主体</h3>' +
      '<p>甲方：{{partyA}}</p>' +
      '<p>乙方：{{partyB}}</p>' +
      '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第二条 合同标的</h3>' +
      '<p>' + (t.content || '<span style="color:#999;font-style:italic;">（请编辑填写合同标的物信息）</span>') + '</p>' +
      '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第三条 合同金额与支付</h3>' +
      '<p>本合同总金额为人民币 {{amount}} 元。</p>' +
      '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第四条 交付与验收</h3>' +
      '<p><span style="color:#999;font-style:italic;">（请编辑填写交付与验收条款）</span></p>' +
      '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第五条 违约责任</h3>' +
      '<p><span style="color:#999;font-style:italic;">（请编辑填写违约责任条款）</span></p>' +
      '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第六条 争议解决</h3>' +
      '<p>因本合同引起的争议，双方应协商解决；协商不成的，任何一方均可向甲方所在地人民法院提起诉讼。</p>' +
      '<div style="margin-top:40px;display:flex;justify-content:space-between;">' +
      '<div><p><strong>甲方（盖章）：</strong>{{partyA}}</p><p style="margin-top:30px;">授权代表签字：_______________</p><p>日期：_______________</p></div>' +
      '<div><p><strong>乙方（盖章）：</strong>{{partyB}}</p><p style="margin-top:30px;">授权代表签字：_______________</p><p>日期：_______________</p></div>' +
      '</div>'
    );
  }

  switchPage('templateEditor');
}

// 新建模板 - 在线创建
function openCreateTemplate() {
  $('#newTemplateName').val('');
  $('#newTemplateType').val('');
  $('#newTemplateCategory').val('');
  $('#newTemplateDept').val('采购部');
  $('#newTemplateDesc').val('');
  $('#newTemplateContent').val('');
  $('#newTemplateFile').val('');
  $('#newTemplateFileInfo').hide();
  $('#templateCreateOnline').show();
  $('#templateCreateUpload').hide();
  selectTemplateCreateMode('online');
  $('#modalCreateTemplate').modal('show');
}

// 新建模板 - 在线编辑方式：跳转到模板编辑器页面
function openTemplateEditorForCreate() {
  let name = $('#newTemplateName').val().trim();
  let type = $('#newTemplateType').val();
  let category = $('#newTemplateCategory').val().trim();
  let dept = $('#newTemplateDept').val();
  let desc = $('#newTemplateDesc').val().trim();
  if (!name) { alert('请填写模板名称'); return; }
  if (!type) { alert('请选择模板类型'); return; }

  // 标记为新建模式
  editingTemplateId = null;
  isNewTemplateEditor = true;

  // 填充编辑器页面基本信息
  $('#templateEditorTitle').text('新建合同模板');
  $('#editorTemplateName').val(name);
  $('#editorTemplateType').val(type);
  $('#editorTemplateCategory').val(category);
  $('#editorTemplateDept').val(dept);
  $('#editorTemplateDesc').val(desc);

  // 清空编辑器内容，填入默认模板
  $('#templateRichEditor').html(
    '<h2 style="text-align:center;color:#333;margin-bottom:20px;">' + name + '</h2>' +
    '<p style="text-align:center;color:#888;font-size:12px;margin-bottom:20px;">合同类型：' + type + ' &nbsp;|&nbsp; 模板创建时间：' + new Date().toLocaleDateString('zh-CN') + '</p>' +
    '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第一条 合同主体</h3>' +
    '<p>甲方：{{partyA}}</p>' +
    '<p>乙方：{{partyB}}</p>' +
    '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第二条 合同标的</h3>' +
    '<p><span style="color:#999;font-style:italic;">（请编辑填写合同标的物信息）</span></p>' +
    '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第三条 合同金额与支付</h3>' +
    '<p>本合同总金额为人民币 {{amount}} 元。</p>' +
    '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第四条 交付与验收</h3>' +
    '<p><span style="color:#999;font-style:italic;">（请编辑填写交付与验收条款）</span></p>' +
    '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第五条 违约责任</h3>' +
    '<p><span style="color:#999;font-style:italic;">（请编辑填写违约责任条款）</span></p>' +
    '<h3 style="color:var(--fa-primary);margin:16px 0 10px;">第六条 争议解决</h3>' +
    '<p>因本合同引起的争议，双方应协商解决；协商不成的，任何一方均可向甲方所在地人民法院提起诉讼。</p>' +
    '<div style="margin-top:40px;display:flex;justify-content:space-between;">' +
    '<div><p><strong>甲方（盖章）：</strong>{{partyA}}</p><p style="margin-top:30px;">授权代表签字：_______________</p><p>日期：_______________</p></div>' +
    '<div><p><strong>乙方（盖章）：</strong>{{partyB}}</p><p style="margin-top:30px;">授权代表签字：_______________</p><p>日期：_______________</p></div>' +
    '</div>'
  );

  // 关闭弹窗，跳转到编辑器页面
  $('#modalCreateTemplate').modal('hide');
  switchPage('templateEditor');
}

let templateCreateMode = 'online';
function selectTemplateCreateMode(mode) {
  templateCreateMode = mode;
  let onlineCard = document.getElementById('tplModeOnline');
  let uploadCard = document.getElementById('tplModeUpload');
  let onlineArea = document.getElementById('templateCreateOnline');
  let uploadArea = document.getElementById('templateCreateUpload');
  let saveBtn = document.getElementById('btnSaveNewTemplate');
  if (mode === 'online') {
    onlineCard.style.border = '2px solid var(--fa-primary)';
    onlineCard.style.background = '#F0F7FF';
    uploadCard.style.border = '2px solid #E0E0E0';
    uploadCard.style.background = '#fff';
    onlineArea.style.display = 'block';
    uploadArea.style.display = 'none';
    // 在线创建模式：按钮显示"下一步"
    if (saveBtn) { saveBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> 下一步'; }
  } else {
    uploadCard.style.border = '2px solid #2B579A';
    uploadCard.style.background = '#F0F7FF';
    onlineCard.style.border = '2px solid #E0E0E0';
    onlineCard.style.background = '#fff';
    onlineArea.style.display = 'none';
    uploadArea.style.display = 'block';
    // 上传Word模式：按钮显示"创建模板"
    if (saveBtn) { saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> 创建模板'; }
  }
}

function onNewTemplateFileSelected(input) {
  if (input.files && input.files[0]) {
    let file = input.files[0];
    $('#newTemplateFileName').text(file.name);
    let sizeKB = (file.size / 1024).toFixed(1);
    let sizeMB = (file.size / 1024 / 1024).toFixed(2);
    $('#newTemplateFileSize').text(sizeKB > 1024 ? sizeMB + ' MB' : sizeKB + ' KB');
    $('#newTemplateFileInfo').show();
    let nameWithoutExt = file.name.replace(/\.(doc|docx)$/i, '');
    if (!$('#newTemplateName').val()) $('#newTemplateName').val(nameWithoutExt);
  }
}

function clearNewTemplateFile() {
  $('#newTemplateFile').val('');
  $('#newTemplateFileInfo').hide();
}

// 保存新建模板
function saveNewTemplate() {
  let name = $('#newTemplateName').val().trim();
  let type = $('#newTemplateType').val();
  let category = $('#newTemplateCategory').val().trim();
  let dept = $('#newTemplateDept').val();
  let desc = $('#newTemplateDesc').val().trim();
  if (!name) { alert('请填写模板名称'); return; }
  if (!type) { alert('请选择模板类型'); return; }

  if (templateCreateMode === 'online') {
    // 在线创建：跳转到富文本编辑器页面
    openTemplateEditorForCreate();
  } else {
    // 上传Word方式：直接保存
    let fileInput = document.getElementById('newTemplateFile');
    let fileName = (fileInput.files && fileInput.files[0]) ? fileInput.files[0].name : '';
    if (!fileName) { alert('请选择Word文件'); return; }
    let content = '由Word文件导入：' + fileName;
    let newId = contractTemplates.length > 0 ? Math.max.apply(null, contractTemplates.map(function(t){ return t.id; })) + 1 : 1;
    contractTemplates.push({
      id: newId, name: name, type: type, category: category, dept: dept,
      author: '当前用户', status: 1, createTime: new Date().toLocaleString('zh-CN'),
      updateTime: new Date().toLocaleString('zh-CN'), usageCount: 0, desc: desc, content: content
    });
    $('#modalCreateTemplate').modal('hide');
    renderTemplateTable();
    alert('模板"' + name + '"已创建');
  }
}

// 搜索筛选
function applyTemplateFilter() {
  let name = $('#templateSearchName').val().toLowerCase();
  let type = $('#templateSearchType').val();
  let status = $('#templateSearchStatus').val();
  let filtered = contractTemplates.filter(function(t) {
    if (name && t.name.toLowerCase().indexOf(name) === -1) return false;
    if (type && t.type !== type) return false;
    if (status !== '' && t.status !== parseInt(status)) return false;
    return true;
  });
  renderTemplateTable(filtered);
}

function resetTemplateFilter() {
  $('#templateSearchName').val('');
  $('#templateSearchType').val('');
  $('#templateSearchStatus').val('');
  renderTemplateTable();
}

function toggleTemplateCheckAll() {
  let checked = $('#templateCheckAll').prop('checked');
  $('.template-check-item').prop('checked', checked);
}

// ==================== 新建合同时 - 从模板选择 ====================
function openTemplateSelectModal() {
  let html = '';
  let enabledTemplates = contractTemplates.filter(function(t){ return t.status === 1; });
  if (enabledTemplates.length === 0) {
    html = '<div style="text-align:center;padding:40px;color:#999;"><i class="fa-solid fa-file-lines" style="font-size:40px;display:block;margin-bottom:10px;"></i>暂无可用模板</div>';
  } else {
    enabledTemplates.forEach(function(t) {
      html += '<div class="template-select-item" data-id="'+t.id+'" onclick="selectTemplateItem(this,'+t.id+')" style="border:2px solid #E0E0E0;border-radius:10px;padding:15px 18px;margin-bottom:10px;cursor:pointer;transition:all .2s;">';
      html += '<div style="display:flex;align-items:center;gap:12px;">';
      html += '<i class="fa-solid fa-file-lines" style="font-size:28px;color:var(--fa-primary);"></i>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-weight:600;color:#333;font-size:14px;">'+t.name+'</div>';
      html += '<div style="font-size:12px;color:#888;margin-top:3px;">'+t.type+' · '+t.category+' · 使用 '+t.usageCount+' 次</div>';
      html += '<div style="font-size:12px;color:#aaa;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+t.desc+'</div>';
      html += '</div>';
      html += '<i class="fa-solid fa-circle-check" style="font-size:20px;color:#ccc;display:none;" data-check="icon"></i>';
      html += '</div>';
      html += '</div>';
    });
  }
  $('#templateSelectList').html(html);
  selectedTemplateId = null;
  $('#btnConfirmTemplateSelect').prop('disabled', true);
  $('#modalTemplateSelect').modal('show');
}

let selectedTemplateId = null;
function selectTemplateItem(el, id) {
  // 取消其他选中
  $('.template-select-item').css({border:'2px solid #E0E0E0',background:'#fff'});
  $('.template-select-item [data-check="icon"]').css({display:'none',color:'#ccc'});
  // 选中当前
  $(el).css({border:'2px solid var(--fa-primary)',background:'#F0F7FF'});
  $(el).find('[data-check="icon"]').css({display:'inline-block',color:'var(--fa-primary)'});
  selectedTemplateId = id;
  $('#btnConfirmTemplateSelect').prop('disabled', false);
}

function confirmTemplateSelect() {
  if (!selectedTemplateId) { alert('请选择一个模板'); return; }
  let t = contractTemplates.find(function(item){ return item.id === selectedTemplateId; });
  if (!t) return;
  // 自动填充合同信息
  if (!$('#createName').val()) $('#createName').val(t.name.replace('模板',''));
  $('#createType').val(t.type);
  $('#createDept').val(t.dept);
  if (!$('#createSummary').val()) $('#createSummary').val('基于模板"'+t.name+'"创建');
  // 记录选中的模板
  createMode = 'template';
  selectedTemplateName = t.name;
  selectedTemplateContent = t.content;
  // 更新按钮
  document.getElementById('btnCreateNext').innerHTML = '<i class="fa-solid fa-arrow-right"></i> 下一步';
  // 更新方式卡片高亮
  document.getElementById('createModeTemplate').style.border = '2px solid var(--fa-primary)';
  document.getElementById('createModeTemplate').style.background = '#F0F7FF';
  document.getElementById('createModeOnline').style.border = '2px solid #E0E0E0';
  document.getElementById('createModeOnline').style.background = '#fff';
  document.getElementById('createModeWord').style.border = '2px solid #E0E0E0';
  document.getElementById('createModeWord').style.background = '#fff';
  document.getElementById('createWordUploadArea').style.display = 'none';
  // 显示已选模板
  document.getElementById('createTemplateSelected').style.display = 'block';
  document.getElementById('createTemplateSelectedName').textContent = t.name;
  $('#modalTemplateSelect').modal('hide');
}

let selectedTemplateName = '';
let selectedTemplateContent = '';

// ==================== 模板富文本编辑器功能 ====================

// 返回模板列表
function backToTemplateList() {
  switchPage('contractTemplate');
}

// 富文本编辑器命令
function templateEditorCmd(cmd, value) {
  document.execCommand(cmd, false, value || null);
  $('#templateRichEditor').focus();
}

// 插入表格
function templateEditorInsertTable() {
  let rows = 3, cols = 3;
  let html = '<table style="width:100%;border-collapse:collapse;margin:10px 0;">';
  for (let i = 0; i < rows; i++) {
    html += '<tr>';
    for (let j = 0; j < cols; j++) {
      html += '<td style="border:1px solid #ccc;padding:8px;min-width:60px;">&nbsp;</td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  document.execCommand('insertHTML', false, html);
  $('#templateRichEditor').focus();
}

// 插入分隔线
function templateEditorInsertHR() {
  document.execCommand('insertHTML', false, '<hr style="border:none;border-top:1px solid #ccc;margin:15px 0;">');
  $('#templateRichEditor').focus();
}

// 插入变量
function templateEditorInsertVar() {
  let vars = ['partyA', 'partyB', 'amount', 'startDate', 'endDate', 'contractNo', 'signDate', 'validDate', 'counterParty', 'handler', 'dept'];
  let html = '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.15);padding:20px;z-index:10000;min-width:300px;" id="varInsertPopup">';
  html += '<h5 style="margin:0 0 12px;color:var(--fa-primary);"><i class="fa-solid fa-code"></i> 插入变量</h5>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
  vars.forEach(function(v) {
    html += '<button class="btn btn-default btn-sm" onclick="doInsertVar(\'' + v + '\')" style="font-family:monospace;">{{' + v + '}}</button>';
  });
  html += '</div>';
  html += '<div style="margin-top:12px;text-align:right;"><button class="btn btn-default btn-sm" onclick="closeVarPopup()">关闭</button></div>';
  html += '</div>';
  html += '<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.2);z-index:9999;" onclick="closeVarPopup()" id="varInsertOverlay"></div>';
  $('body').append(html);
}

function doInsertVar(varName) {
  document.execCommand('insertHTML', false, '<span style="color:var(--fa-primary);font-weight:600;background:#F0F7FF;padding:1px 4px;border-radius:3px;">{{' + varName + '}}</span>');
  closeVarPopup();
  $('#templateRichEditor').focus();
}

function closeVarPopup() {
  $('#varInsertPopup, #varInsertOverlay').remove();
}

// 编辑器输入事件
function onTemplateEditorInput() {
  // 可以在这里添加自动保存等逻辑
}

// 从编辑器保存模板
function saveTemplateFromEditor() {
  let name = $('#editorTemplateName').val().trim();
  let type = $('#editorTemplateType').val();
  let category = $('#editorTemplateCategory').val().trim();
  let dept = $('#editorTemplateDept').val();
  let desc = $('#editorTemplateDesc').val().trim();
  let content = $('#templateRichEditor').html();

  if (!name) { alert('请填写模板名称'); return; }
  if (!type) { alert('请选择模板类型'); return; }
  if (!content || content === '<br>') { alert('请编辑模板内容'); return; }

  if (isNewTemplateEditor) {
    // 新建模式：添加新模板
    let newId = contractTemplates.length > 0 ? Math.max.apply(null, contractTemplates.map(function(t){ return t.id; })) + 1 : 1;
    contractTemplates.push({
      id: newId, name: name, type: type, category: category, dept: dept,
      author: '当前用户', status: 1, createTime: new Date().toLocaleString('zh-CN'),
      updateTime: new Date().toLocaleString('zh-CN'), usageCount: 0, desc: desc, content: content
    });
    alert('模板"' + name + '"已创建');
  } else if (editingTemplateId) {
    // 编辑模式：更新已有模板
    let t = contractTemplates.find(function(item){ return item.id === editingTemplateId; });
    if (t) {
      t.name = name; t.type = type; t.category = category; t.dept = dept;
      t.desc = desc; t.content = content; t.updateTime = new Date().toLocaleString('zh-CN');
    }
    alert('模板已更新');
  }

  // 重置状态
  editingTemplateId = null;
  isNewTemplateEditor = false;

  // 返回模板列表
  switchPage('contractTemplate');
  renderTemplateTable();
}
