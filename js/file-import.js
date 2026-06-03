// ==================== 合同文件批量上传导入 ====================
let uploadedContractFiles = [];
let extractResults = [];
let fileImportHistory = [];

function handleContractFileDrop(e) {
  let files = e.dataTransfer.files;
  addContractFiles(files);
}

function handleContractFileUpload(input) {
  addContractFiles(input.files);
  input.value = '';
}

function addContractFiles(files) {
  let allowedExts = ['doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png', 'tif', 'tiff'];
  for (let i = 0; i < files.length; i++) {
    let ext = files[i].name.split('.').pop().toLowerCase();
    if (allowedExts.indexOf(ext) === -1) {
      alert('文件 ' + files[i].name + ' 格式不支持，请上传Word、PDF或扫描件格式');
      continue;
    }
    // 检查是否重复
    let exists = uploadedContractFiles.some(f => f.name === files[i].name && f.size === files[i].size);
    if (exists) continue;

    uploadedContractFiles.push({
      file: files[i],
      name: files[i].name,
      size: files[i].size,
      ext: ext,
      status: 'uploaded',
      extractStatus: 'pending'
    });
  }
  renderContractFileList();
  $('#btnExtractAll').prop('disabled', uploadedContractFiles.length === 0);
  $('#fileUploadCount').text(uploadedContractFiles.length);
}

function renderContractFileList() {
  if (uploadedContractFiles.length === 0) {
    $('#contractFileList').hide();
    return;
  }
  $('#contractFileList').show();

  let html = '';
  uploadedContractFiles.forEach(function(f, idx) {
    let iconClass = 'fa-file';
    let iconColor = '#666';
    if (f.ext === 'pdf') { iconClass = 'fa-file-pdf'; iconColor = '#DD4B39'; }
    else if (f.ext === 'doc' || f.ext === 'docx') { iconClass = 'fa-file-word'; iconColor = '#2B579A'; }
    else if (['jpg', 'jpeg', 'png', 'tif', 'tiff'].indexOf(f.ext) >= 0) { iconClass = 'fa-file-image'; iconColor = '#F39C12'; }

    let statusHtml = '';
    if (f.extractStatus === 'pending') statusHtml = '<span class="status-badge status-draft">待提取</span>';
    else if (f.extractStatus === 'extracting') statusHtml = '<span class="status-badge status-approving"><i class="fa-solid fa-spinner fa-spin"></i> 提取中</span>';
    else if (f.extractStatus === 'done') statusHtml = '<span class="status-badge status-approved">已提取</span>';

    html += '<div class="file-item">';
    html += '<div class="file-icon"><i class="fa-solid ' + iconClass + '" style="color:' + iconColor + ';"></i></div>';
    html += '<div class="file-info"><div class="file-name">' + f.name + '</div><div class="file-size">' + formatFileSize(f.size) + '</div></div>';
    html += '<div class="file-status">' + statusHtml + '</div>';
    html += '<span class="file-remove" onclick="removeContractFile(' + idx + ')"><i class="fa-solid fa-xmark"></i></span>';
    html += '</div>';
  });
  $('#contractFileList').html(html);
}

function removeContractFile(idx) {
  uploadedContractFiles.splice(idx, 1);
  renderContractFileList();
  $('#btnExtractAll').prop('disabled', uploadedContractFiles.length === 0);
  $('#fileUploadCount').text(uploadedContractFiles.length);
}

function clearAllContractFiles() {
  if (uploadedContractFiles.length === 0) return;
  if (!confirm('确认清空所有已上传的文件吗？')) return;
  uploadedContractFiles = [];
  extractResults = [];
  renderContractFileList();
  $('#extractResultList').html('');
  $('#extractBottomBar').hide();
  $('#btnExtractAll').prop('disabled', true);
  $('#fileUploadCount').text(0);
}

function startExtractAll() {
  if (uploadedContractFiles.length === 0) return;

  // 切换到步骤2
  $('#importStep1Content').hide();
  $('#importStep2Content').show();
  $('#importStep1').removeClass('active').addClass('done');
  $('#importConn1').addClass('active');
  $('#importStep2').addClass('active');

  // 重置提取结果
  extractResults = [];
  $('#extractProgressBox').show();
  $('#extractResultList').html('');
  $('#extractBottomBar').hide();

  let pendingFiles = uploadedContractFiles.filter(f => f.extractStatus !== 'done');
  let totalFiles = pendingFiles.length;
  let doneCount = 0;

  $('#extractTotalCount').text(totalFiles);
  $('#extractDoneCount').text(0);
  $('#extractPercent').text('0%');
  $('#extractProgressBar').css('width', '0%');

  // 逐个模拟提取
  pendingFiles.forEach(function(f, idx) {
    f.extractStatus = 'extracting';
    renderContractFileList();
    $('#extractCurrentFile').text('正在提取: ' + f.name);

    setTimeout(function() {
      let result = simulateExtract(f);
      extractResults.push(result);
      f.extractStatus = 'done';
      doneCount++;
      let pct = Math.round(doneCount / totalFiles * 100);
      $('#extractDoneCount').text(doneCount);
      $('#extractPercent').text(pct + '%');
      $('#extractProgressBar').css('width', pct + '%');
      $('#extractCurrentFile').text('已完成: ' + f.name);
      renderContractFileList();

      // 逐个追加渲染提取结果卡片
      appendExtractResultCard(extractResults.length - 1);

      if (doneCount === totalFiles) {
        $('#extractProgressBox').find('h3').html('<i class="fa-solid fa-circle-check"></i> 智能提取完成');
        $('#importStep2').removeClass('active').addClass('done');
        $('#importConn2').addClass('active');
        $('#importStep3').addClass('active');
        $('#extractBottomBar').show();
        updateExtractStats();
      }
    }, 800 + idx * 800);
  });
}

function backToUploadStep() {
  $('#importStep2Content').hide();
  $('#importStep1Content').show();
  $('#importStep1').removeClass('done').addClass('active');
  $('#importStep2').removeClass('active done');
  $('#importStep3').removeClass('active done');
  $('#importConn1').removeClass('active');
  $('#importConn2').removeClass('active');
}

function updateExtractStats() {
  let total = extractResults.length;
  let valid = 0;
  let invalid = 0;
  extractResults.forEach(function(r, idx) {
    let name = $('#extractField_' + idx + '_name').val();
    let subject = $('#extractField_' + idx + '_subject').val();
    let counterParty = $('#extractField_' + idx + '_counterParty').val();
    let amount = $('#extractField_' + idx + '_amount').val();
    if (name && subject && counterParty && amount && amount > 0) valid++;
    else invalid++;
  });
  $('#totalExtracted').text(total);
  $('#validExtracted').text(valid);
  $('#invalidExtracted').text(invalid);
}

function simulateExtract(fileInfo) {
  // 根据文件类型模拟不同的提取结果 - 字段与合同列表完全对齐
  let contractNames = ['医疗器械采购合同', '护理服务合作协议', '医疗设备租赁合同', '药品供应合同', '信息系统维护服务合同', '健康管理平台开发合同', '体检服务合同', '物流配送服务合同'];
  let parties = ['北京康医疗器械有限公司', '仁心护理服务有限公司', '华信医疗器械租赁有限公司', '九州通医药集团', '云智科技有限公司', '数字健康科技有限公司', '美年大健康', '顺风物流有限公司'];
  let types = ['采购合同', '服务合同', '租赁合同', '合作协议', '服务合同', '合作协议', '服务合同', '服务合同'];
  let amounts = [580000, 120000, 350000, 2000000, 86000, 960000, 500000, 180000];
  let directions = ['支出', '支出', '支出', '支出', '支出', '支出', '支出', '支出'];
  let pricingMethods = ['固定总价', '按次计费', '按月计费', '按量计费', '固定总价', '里程碑付款', '按人次计费', '按单计费'];
  let signDepts = ['采购部', '运营部', '行政部', '采购部', 'IT部', 'IT部', '行政部', '运营部'];
  let handlers = ['张经理', '王主管', '赵助理', '张经理', '孙工', '孙工', '赵助理', '陈总监'];
  let performPlaces = ['北京市朝阳区', '上海市浦东新区', '广州市天河区', '武汉市洪山区', '深圳市南山区', '南京市建邺区', '天津市和平区', '杭州市余杭区'];
  let contacts = ['李明', '张华', '王刚', '陈伟', '刘洋', '吴芳', '钱进', '周强'];
  let phones = ['010-88886666', '021-66668888', '020-33335555', '027-87654321', '0755-22224444', '025-77776666', '022-33334444', '0571-99998888'];
  let addresses = ['北京市海淀区中关村南大街5号', '上海市浦东新区陆家嘴环路1000号', '广州市天河区珠江新城华夏路30号', '武汉市洪山区光谷大道77号', '深圳市南山区科技园南区R2-B栋', '南京市建邺区河西大街198号', '天津市和平区南京路189号', '杭州市余杭区仓前街道文一西路1218号'];

  let rIdx = Math.floor(Math.random() * contractNames.length);
  let confidence = fileInfo.ext === 'pdf' ? 'high' : (fileInfo.ext === 'doc' || fileInfo.ext === 'docx' ? 'high' : 'mid');
  let lowConf = confidence === 'high' ? 'mid' : 'low';

  let signDate = '2025-' + String(Math.floor(Math.random()*12)+1).padStart(2,'0') + '-' + String(Math.floor(Math.random()*28)+1).padStart(2,'0');
  let startDate = signDate;
  let endYear = 2025 + Math.floor(Math.random()*3) + 1;
  let endDate = endYear + '-' + String(Math.floor(Math.random()*12)+1).padStart(2,'0') + '-' + String(Math.floor(Math.random()*28)+1).padStart(2,'0');

  return {
    id: Date.now() + Math.random(),
    fileName: fileInfo.name,
    fileType: fileInfo.ext,
    extracted: {
      name: { value: contractNames[rIdx], confidence: confidence },
      category: { value: types[rIdx], confidence: confidence },
      subject: { value: 'XX科技有限公司', confidence: confidence },
      counterParty: { value: parties[rIdx], confidence: confidence },
      amount: { value: amounts[rIdx], confidence: lowConf },
      direction: { value: directions[rIdx], confidence: confidence },
      currency: { value: 'CNY', confidence: 'high' },
      termType: { value: '固定期限', confidence: confidence },
      signDate: { value: signDate, confidence: 'mid' },
      effectiveDate: { value: signDate, confidence: 'mid' },
      startDate: { value: startDate, confidence: 'mid' },
      endDate: { value: endDate, confidence: 'mid' },
      handler: { value: handlers[rIdx], confidence: lowConf },
      signDept: { value: signDepts[rIdx], confidence: lowConf },
      pricingMethod: { value: pricingMethods[rIdx], confidence: lowConf },
      performPlace: { value: performPlaces[rIdx], confidence: lowConf },
      counterContact: { value: contacts[rIdx], confidence: lowConf },
      counterPhone: { value: phones[rIdx], confidence: lowConf },
      counterAddress: { value: addresses[rIdx], confidence: 'low' },
      summary: { value: '', confidence: 'low' },
      totalCopies: { value: '', confidence: 'low' },
      deliveryDate: { value: '', confidence: 'low' }
    },
    linkedContractId: '',
    submitted: false
  };
}

function getExtractResultCardHtml(idx) {
  let result = extractResults[idx];
  let iconClass = 'fa-file';
  let iconColor = '#666';
  let fileTypeLabel = '文件';
  let extractMethod = '文本提取';
  if (result.fileType === 'pdf') { iconClass = 'fa-file-pdf'; iconColor = '#DD4B39'; fileTypeLabel = 'PDF文档'; extractMethod = 'PDF文本解析'; }
  else if (result.fileType === 'doc' || result.fileType === 'docx') { iconClass = 'fa-file-word'; iconColor = '#2B579A'; fileTypeLabel = 'Word文档'; extractMethod = '文档结构解析'; }
  else { iconClass = 'fa-file-image'; iconColor = '#F39C12'; fileTypeLabel = '扫描件/图片'; extractMethod = 'OCR文字识别'; }

  let html = '<div class="extract-result-card" id="extractCard_' + idx + '" style="animation: fadeInUp 0.4s ease;">';

  // 卡片头部 - 文件信息与状态
  html += '<div class="card-header" style="background:linear-gradient(135deg,#F8F9FA,#E8F4FD);">';
  html += '<div style="display:flex;align-items:center;gap:12px;flex:1;">';
  html += '<div style="width:48px;height:48px;border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,0.1);">';
  html += '<i class="fa-solid ' + iconClass + '" style="font-size:24px;color:' + iconColor + ';"></i>';
  html += '</div>';
  html += '<div>';
  html += '<div class="card-file-name" style="font-size:14px;margin-bottom:2px;">' + result.fileName + '</div>';
  html += '<div style="font-size:11px;color:#888;">';
  html += '<span style="margin-right:12px;"><i class="fa-solid fa-tag"></i> ' + fileTypeLabel + '</span>';
  html += '<span style="margin-right:12px;"><i class="fa-solid fa-microchip"></i> ' + extractMethod + '</span>';
  html += '<span><i class="fa-solid fa-clock"></i> ' + new Date().toLocaleTimeString('zh-CN') + '</span>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '<div style="display:flex;align-items:center;gap:8px;">';
  if (result.submitted) {
    html += '<span class="status-badge status-approved" style="font-size:12px;padding:4px 12px;"><i class="fa-solid fa-check"></i> 已入库</span>';
  } else {
    html += '<button class="btn btn-xs btn-danger" onclick="removeExtractResult(' + idx + ')" title="移除"><i class="fa-solid fa-trash-can"></i></button>';
  }
  html += '</div>';
  html += '</div>';

  html += '<div class="card-body" style="padding:0;">';

  // 关联合同区域
  html += '<div style="padding:14px 18px;background:#F0F7FF;border-bottom:1px solid #D4E8FB;">';
  html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
  html += '<i class="fa-solid fa-link" style="color:var(--fa-primary);font-size:14px;"></i>';
  html += '<strong style="font-size:13px;">关联合同</strong>';
  html += '<small style="color:#999;font-size:11px;">（可选，关联已录入系统的合同，关联后自动填充字段）</small>';
  html += '</div>';
  html += '<select class="form-control" style="height:32px;font-size:12px;" id="linkContract_' + idx + '" onchange="handleLinkContract(' + idx + ', this.value)">';
  html += '<option value="">不关联，作为新合同入库</option>';
  contracts.forEach(function(c) {
    html += '<option value="' + c.id + '">' + c.no + ' - ' + c.name + ' (' + c.status + ')</option>';
  });
  html += '</select>';
  html += '</div>';

  // 提取字段 - 双列布局
  html += '<div style="padding:14px 18px;">';
  html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;">';
  html += '<i class="fa-solid fa-wand-magic-sparkles" style="color:var(--fa-primary);"></i>';
  html += '<strong style="font-size:13px;">提取要素</strong>';
  html += '<small style="color:#999;font-size:11px;">（AI自动识别，请核对确认）</small>';
  html += '</div>';

  let fields = [
    // 核心信息
    { key: 'name', label: '合同名称', required: true, icon: 'fa-file-signature', col: 12, group: '核心信息' },
    { key: 'category', label: '合同类别', required: true, icon: 'fa-tags', col: 4, group: '' },
    { key: 'subject', label: '合同主体', required: true, icon: 'fa-building', col: 4, group: '' },
    { key: 'counterParty', label: '相对方', required: true, icon: 'fa-building-columns', col: 4, group: '' },
    { key: 'amount', label: '合同金额', required: true, icon: 'fa-yen-sign', col: 4, group: '' },
    { key: 'direction', label: '收支方向', required: false, icon: 'fa-arrows-up-down', col: 4, group: '' },
    { key: 'currency', label: '币种', required: false, icon: 'fa-coins', col: 4, group: '' },
    // 日期与期限
    { key: 'termType', label: '期限类型', required: false, icon: 'fa-clock', col: 4, group: '日期与期限' },
    { key: 'signDate', label: '签订日期', required: false, icon: 'fa-calendar-check', col: 4, group: '' },
    { key: 'effectiveDate', label: '生效日期', required: false, icon: 'fa-calendar-plus', col: 4, group: '' },
    { key: 'startDate', label: '起始日期', required: false, icon: 'fa-calendar-day', col: 4, group: '' },
    { key: 'endDate', label: '结束日期', required: false, icon: 'fa-calendar-minus', col: 4, group: '' },
    { key: 'deliveryDate', label: '送达日期', required: false, icon: 'fa-truck', col: 4, group: '' },
    // 经办与履约
    { key: 'handler', label: '负责人', required: false, icon: 'fa-user', col: 4, group: '经办与履约' },
    { key: 'signDept', label: '签署部门', required: false, icon: 'fa-sitemap', col: 4, group: '' },
    { key: 'pricingMethod', label: '计价方式', required: false, icon: 'fa-calculator', col: 4, group: '' },
    { key: 'performPlace', label: '履约地点', required: false, icon: 'fa-location-dot', col: 4, group: '' },
    { key: 'totalCopies', label: '合同总份数', required: false, icon: 'fa-copy', col: 4, group: '' },
    // 相对方联系信息
    { key: 'counterContact', label: '相对方联系人', required: false, icon: 'fa-user-tie', col: 4, group: '相对方联系信息' },
    { key: 'counterPhone', label: '相对方联系方式', required: false, icon: 'fa-phone', col: 4, group: '' },
    { key: 'counterAddress', label: '相对方联系地址', required: false, icon: 'fa-map-marker-alt', col: 4, group: '' },
    // 其他
    { key: 'summary', label: '合同概要', required: false, icon: 'fa-align-left', col: 12, group: '其他信息' }
  ];

  html += '<div class="row" style="margin:0 -6px;">';
  fields.forEach(function(field) {
    // 渲染分组标题
    if (field.group) {
      html += '</div>'; // 关闭前一个row
      html += '<div style="margin:12px 0 8px;padding:6px 10px;background:linear-gradient(90deg,#F0F7FF,#E8F4FD);border-left:3px solid var(--fa-primary);border-radius:0 4px 4px 0;font-size:12px;font-weight:600;color:var(--fa-primary);">';
      html += '<i class="fa-solid fa-layer-group" style="margin-right:6px;font-size:10px;"></i>' + field.group;
      html += '</div>';
      html += '<div class="row" style="margin:0 -6px;">';
    }

    let val = result.extracted[field.key];

    let isEmpty = !val.value;

    html += '<div class="col-md-' + field.col + '" style="padding:0 6px;margin-bottom:10px;">';
    html += '<div style="border:1px solid ' + (isEmpty && field.required ? '#FFCDD2' : '#E0E0E0') + ';border-radius:4px;padding:8px 10px;background:' + (isEmpty && field.required ? '#FFF5F5' : '#fff') + ';">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">';
    html += '<label style="font-size:11px;color:#888;margin:0;font-weight:500;">';
    html += '<i class="fa-solid ' + field.icon + '" style="margin-right:4px;color:#aaa;font-size:10px;"></i>';
    html += field.label;
    if (field.required) html += ' <span class="text-danger">*</span>';
    html += '</label>';

    html += '</div>';

    if (field.key === 'category') {
      html += '<select id="extractField_' + idx + '_' + field.key + '" style="width:100%;height:30px;font-size:12px;border-radius:3px;border:1px solid #D2D6DE;">';
      ['采购合同', '服务合同', '合作协议', '租赁合同', '其他'].forEach(function(t) {
        html += '<option' + (val.value === t ? ' selected' : '') + '>' + t + '</option>';
      });
      html += '</select>';
    } else if (field.key === 'direction') {
      html += '<select id="extractField_' + idx + '_' + field.key + '" style="width:100%;height:30px;font-size:12px;border-radius:3px;border:1px solid #D2D6DE;">';
      ['支出', '收入'].forEach(function(t) {
        html += '<option' + (val.value === t ? ' selected' : '') + '>' + t + '</option>';
      });
      html += '</select>';
    } else if (field.key === 'currency') {
      html += '<select id="extractField_' + idx + '_' + field.key + '" style="width:100%;height:30px;font-size:12px;border-radius:3px;border:1px solid #D2D6DE;">';
      ['CNY', 'USD', 'EUR', 'GBP', 'JPY'].forEach(function(t) {
        html += '<option' + (val.value === t ? ' selected' : '') + '>' + t + '</option>';
      });
      html += '</select>';
    } else if (field.key === 'termType') {
      html += '<select id="extractField_' + idx + '_' + field.key + '" style="width:100%;height:30px;font-size:12px;border-radius:3px;border:1px solid #D2D6DE;">';
      ['固定期限', '无固定期限', '以完成一定任务为期限'].forEach(function(t) {
        html += '<option' + (val.value === t ? ' selected' : '') + '>' + t + '</option>';
      });
      html += '</select>';
    } else if (field.key === 'pricingMethod') {
      html += '<select id="extractField_' + idx + '_' + field.key + '" style="width:100%;height:30px;font-size:12px;border-radius:3px;border:1px solid #D2D6DE;">';
      ['固定总价', '按量计费', '按次计费', '按月计费', '按单计费', '按人次计费', '里程碑付款', '其他'].forEach(function(t) {
        html += '<option' + (val.value === t ? ' selected' : '') + '>' + t + '</option>';
      });
      html += '</select>';
    } else if (field.key === 'amount') {
      html += '<div style="display:flex;align-items:center;">';
      html += '<span style="font-size:12px;color:#888;margin-right:4px;">¥</span>';
      html += '<input type="number" id="extractField_' + idx + '_' + field.key + '" value="' + (val.value || '') + '" placeholder="请输入金额" style="flex:1;height:30px;font-size:12px;border-radius:3px;border:1px solid #D2D6DE;padding:2px 8px;">';
      html += '</div>';
    } else if (field.key === 'totalCopies') {
      html += '<input type="number" min="0" id="extractField_' + idx + '_' + field.key + '" value="' + (val.value || '') + '" placeholder="请输入份数" style="width:100%;height:30px;font-size:12px;border-radius:3px;border:1px solid #D2D6DE;padding:2px 8px;">';
    } else if (field.key === 'summary') {
      html += '<textarea id="extractField_' + idx + '_' + field.key + '" placeholder="请输入合同概要" rows="2" style="width:100%;font-size:12px;border-radius:3px;border:1px solid #D2D6DE;padding:4px 8px;resize:vertical;">' + (val.value || '') + '</textarea>';
    } else {
      let inputType = (field.key.indexOf('Date') >= 0 || field.key === 'signDate') ? 'date' : 'text';
      html += '<input type="' + inputType + '" id="extractField_' + idx + '_' + field.key + '" value="' + (val.value || '') + '" placeholder="请输入' + field.label + '" style="width:100%;height:30px;font-size:12px;border-radius:3px;border:1px solid #D2D6DE;padding:2px 8px;' + (isEmpty && field.required ? 'border-color:#EF9A9A;background:#FFF8F8;' : '') + '">';
    }

    html += '</div>';
    html += '</div>';
  });
  html += '</div>';

  // 提交按钮
  if (!result.submitted) {
    html += '<div style="margin-top:6px;text-align:right;padding-top:10px;border-top:1px solid #F0F0F0;">';
    html += '<button class="btn btn-primary btn-sm" onclick="submitExtractResult(' + idx + ')"><i class="fa-solid fa-database"></i> 提交入库</button>';
    html += '</div>';
  }

  html += '</div>';
  html += '</div>';
  html += '</div>';

  return html;
}

function appendExtractResultCard(idx) {
  let html = getExtractResultCardHtml(idx);
  $('#extractResultList').append(html);
}

function handleLinkContract(idx, contractId) {
  extractResults[idx].linkedContractId = contractId ? parseInt(contractId) : '';
  if (contractId) {
    let c = contracts.find(function(item) { return item.id === parseInt(contractId); });
    if (c) {
      // 自动填充已有关联合同的字段 - 与合同列表字段对齐
      $('#extractField_' + idx + '_name').val(c.name);
      if ($('#extractField_' + idx + '_category').length) $('#extractField_' + idx + '_category').val(c.category || c.type);
      if ($('#extractField_' + idx + '_subject').length) $('#extractField_' + idx + '_subject').val(c.subject || c.partyA);
      if ($('#extractField_' + idx + '_counterParty').length) $('#extractField_' + idx + '_counterParty').val(c.counterParty || c.partyB);
      if ($('#extractField_' + idx + '_amount').length) $('#extractField_' + idx + '_amount').val(c.amount);
      if ($('#extractField_' + idx + '_direction').length) $('#extractField_' + idx + '_direction').val(c.direction || '支出');
      if ($('#extractField_' + idx + '_currency').length) $('#extractField_' + idx + '_currency').val(c.currency || 'CNY');
      if ($('#extractField_' + idx + '_termType').length) $('#extractField_' + idx + '_termType').val(c.termType || '固定期限');
      if (c.signDate && c.signDate !== '—') $('#extractField_' + idx + '_signDate').val(c.signDate);
      if (c.effectiveDate && c.effectiveDate !== '—') $('#extractField_' + idx + '_effectiveDate').val(c.effectiveDate);
      if (c.startDate && c.startDate !== '—') $('#extractField_' + idx + '_startDate').val(c.startDate);
      if (c.endDate && c.endDate !== '—') $('#extractField_' + idx + '_endDate').val(c.endDate);
      if ($('#extractField_' + idx + '_handler').length) $('#extractField_' + idx + '_handler').val(c.handler || '');
      if ($('#extractField_' + idx + '_signDept').length) $('#extractField_' + idx + '_signDept').val(c.signDept || '');
      if ($('#extractField_' + idx + '_pricingMethod').length) $('#extractField_' + idx + '_pricingMethod').val(c.pricingMethod || '');
      if ($('#extractField_' + idx + '_performPlace').length) $('#extractField_' + idx + '_performPlace').val(c.performPlace || '');
      if ($('#extractField_' + idx + '_counterContact').length) $('#extractField_' + idx + '_counterContact').val(c.counterContact || '');
      if ($('#extractField_' + idx + '_counterPhone').length) $('#extractField_' + idx + '_counterPhone').val(c.counterPhone || '');
      if ($('#extractField_' + idx + '_counterAddress').length) $('#extractField_' + idx + '_counterAddress').val(c.counterAddress || '');
      if ($('#extractField_' + idx + '_summary').length) $('#extractField_' + idx + '_summary').val(c.summary || '');
      if (c.deliveryDate && c.deliveryDate !== '—') $('#extractField_' + idx + '_deliveryDate').val(c.deliveryDate);
      if (c.totalCopies && c.totalCopies !== '—') $('#extractField_' + idx + '_totalCopies').val(c.totalCopies);
    }
  }
}

function submitExtractResult(idx) {
  let result = extractResults[idx];
  let name = $('#extractField_' + idx + '_name').val().trim();
  let category = $('#extractField_' + idx + '_category').val();
  let subject = $('#extractField_' + idx + '_subject').val().trim();
  let counterParty = $('#extractField_' + idx + '_counterParty').val().trim();
  let amount = $('#extractField_' + idx + '_amount').val();

  // 验证必填字段
  if (!name) { alert('合同名称为必填项，请填写后提交'); return; }
  if (!subject) { alert('合同主体为必填项，请填写后提交'); return; }
  if (!counterParty) { alert('相对方为必填项，请填写后提交'); return; }
  if (!amount || amount <= 0) { alert('合同金额为必填项，请填写有效金额后提交'); return; }

  // 获取所有提取字段的值
  function getExtractVal(key) {
    let el = $('#extractField_' + idx + '_' + key);
    return el.length ? el.val().trim() : '';
  }

  let startDate = getExtractVal('startDate');
  let endDate = getExtractVal('endDate');

  if (result.linkedContractId) {
    // 关联已有合同 - 更新文件关联信息
    let c = contracts.find(function(item) { return item.id === result.linkedContractId; });
    if (c) {
      if (!c.signDate || c.signDate === '—') c.signDate = getExtractVal('signDate') || '—';
      if (!c.effectiveDate || c.effectiveDate === '—') c.effectiveDate = getExtractVal('effectiveDate') || '—';
      if (!c.startDate || c.startDate === '—') c.startDate = startDate || '—';
      if (!c.endDate || c.endDate === '—') c.endDate = endDate || '—';
      if (!c.handler || c.handler === '—') c.handler = getExtractVal('handler') || '—';
      if (!c.signDept || c.signDept === '—') c.signDept = getExtractVal('signDept') || '—';
      if (!c.pricingMethod || c.pricingMethod === '—') c.pricingMethod = getExtractVal('pricingMethod') || '—';
      if (!c.performPlace || c.performPlace === '—') c.performPlace = getExtractVal('performPlace') || '—';
      if (!c.counterContact || c.counterContact === '—') c.counterContact = getExtractVal('counterContact') || '—';
      if (!c.counterPhone || c.counterPhone === '—') c.counterPhone = getExtractVal('counterPhone') || '—';
      if (!c.counterAddress || c.counterAddress === '—') c.counterAddress = getExtractVal('counterAddress') || '—';
      if (!c.summary) c.summary = getExtractVal('summary') || '';
      if (!c.deliveryDate || c.deliveryDate === '—') c.deliveryDate = getExtractVal('deliveryDate') || '—';
      if (!c.totalCopies || c.totalCopies === '—') c.totalCopies = getExtractVal('totalCopies') || '—';
    }
    result.submitted = true;
    $('#extractCard_' + idx).replaceWith(getExtractResultCardHtml(idx));
    updateExtractStats();
    alert('已关联合同 ' + c.no + '，文件信息已更新至该合同。');
  } else {
    let newId = contracts.length > 0 ? Math.max.apply(null, contracts.map(c => c.id)) + 1 : 1;
    let no = 'HT-FILE-' + String(newId).padStart(4, '0');
    contracts.push({
      id: newId,
      no: no,
      name: name,
      subject: subject,
      category: category,
      type: category,
      status: 'archived',
      termType: getExtractVal('termType') || '固定期限',
      validDate: (startDate && endDate) ? startDate + ' 至 ' + endDate : '',
      signDate: getExtractVal('signDate') || '—',
      direction: getExtractVal('direction') || '支出',
      pricingMethod: getExtractVal('pricingMethod') || '—',
      handler: getExtractVal('handler') || '当前用户（文件导入）',
      amount: parseFloat(amount),
      currency: getExtractVal('currency') || 'CNY',
      signDept: getExtractVal('signDept') || '—',
      performPlace: getExtractVal('performPlace') || '—',
      summary: getExtractVal('summary') || '',
      counterParty: counterParty,
      counterContact: getExtractVal('counterContact') || '—',
      counterPhone: getExtractVal('counterPhone') || '—',
      counterAddress: getExtractVal('counterAddress') || '—',
      effectiveDate: getExtractVal('effectiveDate') || '—',
      deliveryDate: getExtractVal('deliveryDate') || '—',
      totalCopies: getExtractVal('totalCopies') || '—',
      archiveCopies: 0,
      archiveTime: '',
      archiveLocation: '',
      partyA: subject,
      partyB: counterParty,
      startDate: startDate || '—',
      endDate: endDate || '—',
      currentHandler: '—',
      currentNode: '已归档',
      progress: 100,
      createTime: new Date().toLocaleString('zh-CN'),
      updateTime: new Date().toLocaleString('zh-CN')
    });
    result.submitted = true;
    $('#extractCard_' + idx).replaceWith(getExtractResultCardHtml(idx));
    updateExtractStats();
    updateTotalCount();
    alert('新合同 ' + no + ' 已入库！默认为"已归档"状态。');
  }

  // 记录导入历史
  fileImportHistory.unshift({
    time: new Date().toLocaleString('zh-CN'),
    fileName: result.fileName,
    linked: result.linkedContractId ? true : false,
    contractNo: result.linkedContractId ? contracts.find(c => c.id === result.linkedContractId)?.no : no
  });
  renderFileImportHistory();
}

function batchSubmitExtractResults() {
  let count = 0;
  extractResults.forEach(function(result, idx) {
    if (result.submitted) return;
    let name = $('#extractField_' + idx + '_name').val().trim();
    let subject = $('#extractField_' + idx + '_subject').val().trim();
    let counterParty = $('#extractField_' + idx + '_counterParty').val().trim();
    let amount = $('#extractField_' + idx + '_amount').val();
    let category = $('#extractField_' + idx + '_category').val();

    if (!name || !subject || !counterParty || !amount || amount <= 0) return;

    // 获取所有提取字段的值
    function getExtractVal(key) {
      let el = $('#extractField_' + idx + '_' + key);
      return el.length ? el.val().trim() : '';
    }

    let startDate = getExtractVal('startDate');
    let endDate = getExtractVal('endDate');

    if (result.linkedContractId) {
      let c = contracts.find(function(item) { return item.id === result.linkedContractId; });
      if (c) {
        if (!c.signDate || c.signDate === '—') c.signDate = getExtractVal('signDate') || '—';
        if (!c.effectiveDate || c.effectiveDate === '—') c.effectiveDate = getExtractVal('effectiveDate') || '—';
        if (!c.startDate || c.startDate === '—') c.startDate = startDate || '—';
        if (!c.endDate || c.endDate === '—') c.endDate = endDate || '—';
        if (!c.handler || c.handler === '—') c.handler = getExtractVal('handler') || '—';
        if (!c.signDept || c.signDept === '—') c.signDept = getExtractVal('signDept') || '—';
        if (!c.pricingMethod || c.pricingMethod === '—') c.pricingMethod = getExtractVal('pricingMethod') || '—';
        if (!c.performPlace || c.performPlace === '—') c.performPlace = getExtractVal('performPlace') || '—';
        if (!c.counterContact || c.counterContact === '—') c.counterContact = getExtractVal('counterContact') || '—';
        if (!c.counterPhone || c.counterPhone === '—') c.counterPhone = getExtractVal('counterPhone') || '—';
        if (!c.counterAddress || c.counterAddress === '—') c.counterAddress = getExtractVal('counterAddress') || '—';
        if (!c.summary) c.summary = getExtractVal('summary') || '';
        if (!c.deliveryDate || c.deliveryDate === '—') c.deliveryDate = getExtractVal('deliveryDate') || '—';
        if (!c.totalCopies || c.totalCopies === '—') c.totalCopies = getExtractVal('totalCopies') || '—';
      }
    } else {
      let newId = contracts.length > 0 ? Math.max.apply(null, contracts.map(c => c.id)) + 1 : 1;
      let no = 'HT-FILE-' + String(newId).padStart(4, '0');
      contracts.push({
        id: newId,
        no: no,
        name: name,
        subject: subject,
        category: category,
        type: category,
        status: 'archived',
        termType: getExtractVal('termType') || '固定期限',
        validDate: (startDate && endDate) ? startDate + ' 至 ' + endDate : '',
        signDate: getExtractVal('signDate') || '—',
        direction: getExtractVal('direction') || '支出',
        pricingMethod: getExtractVal('pricingMethod') || '—',
        handler: getExtractVal('handler') || '当前用户（文件导入）',
        amount: parseFloat(amount),
        currency: getExtractVal('currency') || 'CNY',
        signDept: getExtractVal('signDept') || '—',
        performPlace: getExtractVal('performPlace') || '—',
        summary: getExtractVal('summary') || '',
        counterParty: counterParty,
        counterContact: getExtractVal('counterContact') || '—',
        counterPhone: getExtractVal('counterPhone') || '—',
        counterAddress: getExtractVal('counterAddress') || '—',
        effectiveDate: getExtractVal('effectiveDate') || '—',
        deliveryDate: getExtractVal('deliveryDate') || '—',
        totalCopies: getExtractVal('totalCopies') || '—',
        archiveCopies: 0,
        archiveTime: '',
        archiveLocation: '',
        partyA: subject,
        partyB: counterParty,
        startDate: startDate || '—',
        endDate: endDate || '—',
        currentHandler: '—',
        currentNode: '已归档',
        progress: 100,
        createTime: new Date().toLocaleString('zh-CN'),
        updateTime: new Date().toLocaleString('zh-CN')
      });
    }
    result.submitted = true;
    count++;
  });

  // 重新渲染所有卡片
  $('#extractResultList').html('');
  extractResults.forEach(function(r, i) {
    appendExtractResultCard(i);
  });
  updateExtractStats();
  updateTotalCount();
  if (count > 0) {
    alert('批量提交成功！共 ' + count + ' 个合同文件已入库。');
  } else {
    alert('没有可提交的记录，请确保必填字段已填写。');
  }
}

function removeExtractResult(idx) {
  extractResults.splice(idx, 1);
  if (uploadedContractFiles[idx]) {
    uploadedContractFiles.splice(idx, 1);
    $('#fileUploadCount').text(uploadedContractFiles.length);
    renderContractFileList();
  }
  // 重新渲染所有提取结果卡片
  $('#extractResultList').html('');
  extractResults.forEach(function(r, i) {
    appendExtractResultCard(i);
  });
  updateExtractStats();
}

function renderFileImportHistory() {
  let html = '';
  if (fileImportHistory.length === 0) {
    html = '<div style="text-align:center;color:#999;padding:10px;">暂无导入记录</div>';
  } else {
    fileImportHistory.forEach(function(h) {
      html += '<div style="padding:6px 0;border-bottom:1px dotted #EEE;display:flex;justify-content:space-between;align-items:center;">';
      html += '<div>';
      html += '<strong style="color:var(--fa-primary);font-size:12px;">' + h.fileName + '</strong>';
      html += '<div style="font-size:11px;color:#888;margin-top:2px;">';
      if (h.linked) {
        html += '<i class="fa-solid fa-link" style="color:var(--fa-primary);"></i> 关联 ' + h.contractNo;
      } else {
        html += '<i class="fa-solid fa-plus text-success"></i> 新建 ' + h.contractNo;
      }
      html += '</div></div>';
      html += '<small style="color:#999;font-size:11px;">' + h.time + '</small>';
      html += '</div>';
    });
  }
  $('#fileImportHistory').html(html);
  if (fileImportHistory.length > 0) {
    $('#fileImportHistoryWrap').show();
  }
}
