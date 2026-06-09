// ==================== Excel模板导入 ====================
let excelImportData = [];

function downloadExcelTemplate() {
  // 模拟下载Excel模板 - 字段与合同列表完全对齐
  let csvContent = '合同名称,合同类别,合同主体,相对方,合同金额,收支方向,币种,期限类型,签订日期,生效日期,起始日期,结束日期,负责人,签署部门,计价方式,履约地点,相对方联系人,相对方联系方式,相对方联系地址,合同概要,合同总份数,送达日期\n';
  csvContent += '医疗器械采购合同,采购合同,XX科技有限公司,北京康医疗器械有限公司,580000,支出,CNY,固定期限,2026-05-15,2026-05-15,2026-05-15,2027-05-14,张经理,采购部,固定总价,北京市朝阳区,李明,010-88886666,北京市海淀区中关村南大街5号,采购医疗器械一批含监护仪输液泵等,4,2026-05-20\n';
  csvContent += '上门护理服务合同,服务合同,XX科技有限公司,仁心护理服务有限公司,120000,支出,CNY,固定期限,2026-05-20,2026-05-20,2026-05-20,2027-05-19,王主管,运营部,按次计费,上海市浦东新区,张华,021-66668888,上海市浦东新区陆家嘴环路1000号,居家护理服务合作提供上门护理服务,3,2026-05-22\n';
  csvContent += '医疗设备租赁合同,租赁合同,XX科技有限公司,华信医疗器械租赁有限公司,350000,支出,CNY,固定期限,2026-06-01,2026-06-01,2026-06-01,2028-05-31,赵助理,行政部,按月计费,广州市天河区,王刚,020-33335555,广州市天河区珠江新城华夏路30号,租赁医疗设备含CT机MRI设备等,4,2026-06-05\n';

  let blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '合同导入模板.csv';
  link.click();
  alert('模板已下载！请按模板格式填写合同信息后上传。');
}

function handleExcelDrop(e) {
  let files = e.dataTransfer.files;
  if (files.length > 0) {
    processExcelFile(files[0]);
  }
}

function handleExcelUpload(input) {
  if (input.files.length > 0) {
    processExcelFile(input.files[0]);
  }
}

function processExcelFile(file) {
  let ext = file.name.split('.').pop().toLowerCase();
  if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
    alert('请上传 .xlsx、.xls 或 .csv 格式的文件');
    return;
  }

  // 显示文件信息
  $('#excelFileName').text(file.name);
  $('#excelFileSize').text(formatFileSize(file.size));
  $('#excelFileList').show();
  $('#excelImportProgress').show();

  // 模拟解析进度
  let progress = 0;
  let timer = setInterval(function() {
    progress += Math.random() * 15 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(timer);
      setTimeout(function() {
        $('#excelImportProgress').hide();
        generateExcelPreviewData();
      }, 300);
    }
    $('#excelProgressBar').css('width', Math.min(progress, 100) + '%');
    $('#excelProgressText').text(Math.round(Math.min(progress, 100)) + '%');
  }, 200);
}

function removeExcelFile() {
  $('#excelFileList').hide();
  $('#excelImportProgress').hide();
  closeExcelPreviewModal();
  $('#excelFileInput').val('');
  excelImportData = [];
}

function cancelExcelImport() {
  removeExcelFile();
}

// ==================== Excel预览弹框 ====================
function openExcelPreviewModal() {
  $('#excelPreviewModal').addClass('show');
  $('body').css('overflow', 'hidden');
}

function closeExcelPreviewModal() {
  $('#excelPreviewModal').removeClass('show');
  $('body').css('overflow', '');
}

function generateExcelPreviewData() {
  // 模拟解析出的Excel数据 - 字段与合同列表完全对齐
  excelImportData = [
    { row: 2, name: '医疗耗材年度采购合同', category: '采购合同', subject: 'XX科技有限公司', counterParty: '恒安医疗用品有限公司', amount: 320000, direction: '支出', currency: 'CNY', termType: '固定期限', signDate: '2025-08-01', effectiveDate: '2025-08-01', startDate: '2025-08-01', endDate: '2026-07-31', handler: '张经理', signDept: '采购部', pricingMethod: '按量计费', performPlace: '北京市大兴区', counterContact: '孙丽', counterPhone: '010-66665555', counterAddress: '北京市大兴区生物医药基地天荣街9号', summary: '护理耗材年度采购含注射器敷料等', totalCopies: 4, deliveryDate: '2025-08-05', valid: true, error: '' },
    { row: 3, name: '体检服务合作协议', category: '服务合同', subject: 'XX科技有限公司', counterParty: '美年大健康产业集团', amount: 500000, direction: '支出', currency: 'CNY', termType: '固定期限', signDate: '2025-09-01', effectiveDate: '2025-09-01', startDate: '2025-09-01', endDate: '2027-08-31', handler: '赵助理', signDept: '行政部', pricingMethod: '按人次计费', performPlace: '天津市和平区', counterContact: '钱进', counterPhone: '022-33334444', counterAddress: '天津市和平区南京路189号', summary: '员工年度体检服务合作', totalCopies: 3, deliveryDate: '2025-09-05', valid: true, error: '' },
    { row: 4, name: '办公设备租赁合同', category: '租赁合同', subject: 'XX科技有限公司', counterParty: '华信办公设备有限公司', amount: 86000, direction: '支出', currency: 'CNY', termType: '固定期限', signDate: '2025-03-15', effectiveDate: '2025-03-15', startDate: '2025-03-15', endDate: '2026-03-14', handler: '刘经理', signDept: '行政部', pricingMethod: '按月计费', performPlace: '北京市朝阳区', counterContact: '周涛', counterPhone: '010-55556666', counterAddress: '北京市朝阳区建国路88号', summary: '办公设备租赁含打印机复印机等', totalCopies: 3, deliveryDate: '2025-03-18', valid: true, error: '' },
    { row: 5, name: '', category: '服务合同', subject: 'XX科技有限公司', counterParty: '顺丰物流有限公司', amount: 180000, direction: '支出', currency: 'CNY', termType: '固定期限', signDate: '2025-04-01', effectiveDate: '2025-04-01', startDate: '2025-04-01', endDate: '2027-03-31', handler: '陈总监', signDept: '运营部', pricingMethod: '按单计费', performPlace: '杭州市余杭区', counterContact: '周强', counterPhone: '0571-99998888', counterAddress: '杭州市余杭区仓前街道文一西路1218号', summary: '物流配送服务', totalCopies: 4, deliveryDate: '2025-04-03', valid: false, error: '合同名称为空' },
    { row: 6, name: '信息系统维护合同', category: '服务合同', subject: 'XX科技有限公司', counterParty: '云智科技有限公司', amount: 96000, direction: '支出', currency: 'CNY', termType: '固定期限', signDate: '2025-01-10', effectiveDate: '2025-01-10', startDate: '2025-01-10', endDate: '2026-01-09', handler: '孙工', signDept: 'IT部', pricingMethod: '固定总价', performPlace: '深圳市南山区', counterContact: '刘洋', counterPhone: '0755-22224444', counterAddress: '深圳市南山区科技园南区R2-B栋', summary: '信息系统年度维护服务', totalCopies: 3, deliveryDate: '2025-01-12', valid: true, error: '' },
    { row: 7, name: '药品供应合同', category: '合作协议', subject: 'XX科技有限公司', counterParty: '九州通医药集团', amount: 2000000, direction: '支出', currency: 'CNY', termType: '固定期限', signDate: '2024-06-15', effectiveDate: '2024-06-15', startDate: '2024-06-15', endDate: '2027-06-14', handler: '张经理', signDept: '采购部', pricingMethod: '按量计费', performPlace: '武汉市洪山区', counterContact: '陈伟', counterPhone: '027-87654321', counterAddress: '武汉市洪山区光谷大道77号', summary: '药品长期供应合作涵盖常用药品及特殊药品', totalCopies: 6, deliveryDate: '2024-06-18', valid: true, error: '' },
    { row: 8, name: '保洁服务外包合同', category: '服务合同', subject: '', counterParty: '洁美物业服务有限公司', amount: 65000, direction: '支出', currency: 'CNY', termType: '固定期限', signDate: '2025-02-01', effectiveDate: '2025-02-01', startDate: '2025-02-01', endDate: '2026-01-31', handler: '刘经理', signDept: '行政部', pricingMethod: '固定总价', performPlace: '北京市海淀区', counterContact: '马丽', counterPhone: '010-11112222', counterAddress: '北京市海淀区西三环北路50号', summary: '保洁服务外包', totalCopies: 3, deliveryDate: '2025-02-03', valid: false, error: '合同主体为空' },
    { row: 9, name: '康复设备采购合同', category: '采购合同', subject: 'XX科技有限公司', counterParty: '康复之家医疗用品有限公司', amount: 450000, direction: '支出', currency: 'CNY', termType: '固定期限', signDate: '2025-05-25', effectiveDate: '2025-05-25', startDate: '2025-05-25', endDate: '2026-05-24', handler: '张经理', signDept: '采购部', pricingMethod: '固定总价', performPlace: '成都市武侯区', counterContact: '赵磊', counterPhone: '028-55557777', counterAddress: '成都市武侯区人民南路四段1号', summary: '康复辅具采购含轮椅助行器等', totalCopies: 4, deliveryDate: '2025-05-28', valid: true, error: '' },
  ];

  renderExcelPreviewTable();
  openExcelPreviewModal();
}

function renderExcelPreviewTable() {
  let validCount = excelImportData.filter(d => d.valid).length;
  let errorCount = excelImportData.filter(d => !d.valid).length;
  $('#excelValidCount').text(validCount);
  $('#excelErrorCount').text(errorCount);
  $('#excelTotalCount').text(excelImportData.length);

  if (excelImportData.length === 0) {
    $('#excelPreviewBody').html('');
    $('#excelPreviewEmpty').show();
    $('#excelCheckAll').prop('checked', false);
    updateExcelSelectedCount();
    return;
  }

  $('#excelPreviewEmpty').hide();
  let html = '';
  excelImportData.forEach(function(item, idx) {
    let checked = item.valid ? 'checked' : '';
    let disabled = item.valid ? '' : 'disabled';
    let rowClass = item.valid ? (checked ? 'row-selected' : '') : 'row-invalid';
    let statusHtml = item.valid
      ? '<span class="status-badge status-approved"><i class="fa-solid fa-check"></i> 有效</span>'
      : '<span class="status-badge status-rejected" title="' + item.error + '"><i class="fa-solid fa-exclamation-triangle"></i> ' + item.error + '</span>';

    html += '<tr class="' + rowClass + '" data-idx="' + idx + '">';
    html += '<td><input type="checkbox" class="excel-check-item" value="' + idx + '" ' + checked + ' ' + disabled + ' onchange="onExcelCheckChange(this, ' + idx + ')"></td>';
    html += '<td>' + item.row + '</td>';
    html += '<td>' + (item.name || '<span class="text-danger">空</span>') + '</td>';
    html += '<td>' + (item.category || '—') + '</td>';
    html += '<td>' + (item.subject || '<span class="text-danger">空</span>') + '</td>';
    html += '<td>' + (item.counterParty || '—') + '</td>';
    html += '<td style="text-align:right;">' + (item.amount ? '¥ ' + item.amount.toLocaleString() : '—') + '</td>';
    html += '<td>' + (item.direction || '—') + '</td>';
    html += '<td>' + (item.termType || '—') + '</td>';
    html += '<td>' + (item.signDate || '—') + '</td>';
    html += '<td>' + (item.effectiveDate || '—') + '</td>';
    html += '<td>' + (item.handler || '—') + '</td>';
    html += '<td>' + (item.signDept || '—') + '</td>';
    html += '<td>' + (item.pricingMethod || '—') + '</td>';
    html += '<td>' + statusHtml + '</td>';
    html += '<td><button class="row-del-btn" onclick="deleteExcelRecord(' + idx + ')" title="删除此条记录"><i class="fa-solid fa-trash-can"></i></button></td>';
    html += '</tr>';
  });
  $('#excelPreviewBody').html(html);
  updateExcelSelectedCount();
}

// 删除单条记录
function deleteExcelRecord(idx) {
  let $row = $('#excelPreviewBody tr[data-idx="' + idx + '"]');
  $row.addClass('row-deleting');
  setTimeout(function() {
    excelImportData.splice(idx, 1);
    renderExcelPreviewTable();
    // 如果所有记录都被删完，自动关闭弹框
    if (excelImportData.length === 0) {
      closeExcelPreviewModal();
      removeExcelFile();
    }
  }, 280);
}

// 复选框变化处理
function onExcelCheckChange(checkbox, idx) {
  let $row = $(checkbox).closest('tr');
  if (checkbox.checked) {
    $row.addClass('row-selected');
  } else {
    $row.removeClass('row-selected');
  }
  updateExcelSelectedCount();
}

// 显示批量删除确认弹框
function showBatchDeleteConfirm() {
  let selectedIndices = [];
  $('.excel-check-item:checked').each(function() {
    selectedIndices.push(parseInt($(this).val()));
  });

  if (selectedIndices.length === 0) {
    return;
  }

  $('#batchDeleteConfirmCount').text(selectedIndices.length);
  $('#batchDeleteConfirmModal').show();
}

// 关闭批量删除确认弹框
function closeBatchDeleteConfirm() {
  $('#batchDeleteConfirmModal').hide();
}

// 执行批量删除
function executeBatchDelete() {
  let selectedIndices = [];
  $('.excel-check-item:checked').each(function() {
    selectedIndices.push(parseInt($(this).val()));
  });

  if (selectedIndices.length === 0) {
    closeBatchDeleteConfirm();
    return;
  }

  // 先添加删除动画
  selectedIndices.forEach(function(idx) {
    $('#excelPreviewBody tr[data-idx="' + idx + '"]').addClass('row-deleting');
  });

  closeBatchDeleteConfirm();

  setTimeout(function() {
    // 从后往前删除，避免索引错乱
    selectedIndices.sort(function(a, b) { return b - a; });
    selectedIndices.forEach(function(idx) {
      excelImportData.splice(idx, 1);
    });
    renderExcelPreviewTable();
    // 如果所有记录都被删完，自动关闭弹框
    if (excelImportData.length === 0) {
      closeExcelPreviewModal();
      removeExcelFile();
    }
  }, 280);
}

function toggleExcelCheckAll() {
  let checked = $('#excelCheckAll').prop('checked');
  $('.excel-check-item:not(:disabled)').each(function() {
    $(this).prop('checked', checked);
    let $row = $(this).closest('tr');
    if (checked) {
      $row.addClass('row-selected');
    } else {
      $row.removeClass('row-selected');
    }
  });
  updateExcelSelectedCount();
}

function updateExcelSelectedCount() {
  let count = $('.excel-check-item:checked').length;
  let totalValid = excelImportData.filter(d => d.valid).length;
  $('#excelSelectedCount').text(count);
  $('#batchDeleteCount').text(count);
  // 更新批量删除按钮状态
  if (count > 0) {
    $('#batchDeleteBtn').removeClass('batch-disabled');
  } else {
    $('#batchDeleteBtn').addClass('batch-disabled');
  }
  // 更新全选复选框状态
  if (count === 0) {
    $('#excelCheckAll').prop('checked', false);
  } else if (count === totalValid) {
    $('#excelCheckAll').prop('checked', true);
  }
}

function confirmExcelImport() {
  let selectedIndices = [];
  $('.excel-check-item:checked').each(function() {
    selectedIndices.push(parseInt($(this).val()));
  });
  if (selectedIndices.length === 0) {
    alert('请至少选择一条有效记录进行导入');
    return;
  }

  let importCount = 0;
  selectedIndices.forEach(function(idx) {
    let item = excelImportData[idx];
    if (item && item.valid) {
      let newId = contracts.length > 0 ? Math.max.apply(null, contracts.map(c => c.id)) + 1 : 1;
      let no = 'HT-IMP-' + String(newId).padStart(4, '0');
      let startDate = item.startDate || '';
      let endDate = item.endDate || '';
      contracts.push({
        id: newId,
        no: no,
        name: item.name,
        subject: item.subject || 'XX科技有限公司',
        category: item.category || '其他',
        type: item.category || '其他',
        status: 'archived',
        termType: item.termType || '固定期限',
        validDate: (startDate && endDate) ? startDate + ' 至 ' + endDate : '',
        signDate: item.signDate || '—',
        direction: item.direction || '支出',
        pricingMethod: item.pricingMethod || '—',
        handler: item.handler || '—',
        amount: item.amount,
        currency: item.currency || 'CNY',
        signDept: item.signDept || '—',
        performPlace: item.performPlace || '—',
        summary: item.summary || '',
        counterParty: item.counterParty || '',
        counterContact: item.counterContact || '—',
        counterPhone: item.counterPhone || '—',
        counterAddress: item.counterAddress || '—',
        effectiveDate: item.effectiveDate || '—',
        deliveryDate: item.deliveryDate || '—',
        totalCopies: item.totalCopies || '—',
        archiveCopies: 0,
        archiveTime: '',
        archiveLocation: '',
        partyA: item.subject || 'XX科技有限公司',
        partyB: item.counterParty || '',
        startDate: startDate || '—',
        endDate: endDate || '—',
        currentHandler: '—',
        currentNode: '已归档',
        progress: 100,
        createTime: new Date().toLocaleString('zh-CN'),
        updateTime: new Date().toLocaleString('zh-CN')
      });
      importCount++;
    }
  });

  // 清理界面
  closeExcelPreviewModal();
  removeExcelFile();
  updateTotalCount();

  alert('成功导入 ' + importCount + ' 条合同记录！导入的合同默认为"已归档"状态，可在合同列表中查看。');
}

// 点击弹框遮罩层关闭弹框
$(document).on('click', '#excelPreviewModal', function(e) {
  if (e.target === this) {
    closeExcelPreviewModal();
  }
});

// 点击批量删除确认弹框遮罩层关闭
$(document).on('click', '#batchDeleteConfirmModal', function(e) {
  if (e.target === this) {
    closeBatchDeleteConfirm();
  }
});

// ESC键关闭批量删除确认弹框
$(document).on('keydown', function(e) {
  if (e.key === 'Escape') {
    if ($('#batchDeleteConfirmModal').is(':visible')) {
      closeBatchDeleteConfirm();
    }
  }
});

// 按ESC关闭弹框
$(document).on('keydown', function(e) {
  if (e.key === 'Escape' && $('#excelPreviewModal').hasClass('show')) {
    closeExcelPreviewModal();
  }
});

