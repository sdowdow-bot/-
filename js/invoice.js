// ==================== 发票管理 ====================

function renderInvoiceList() {
  let list = filterInvoiceData();
  updateInvoiceStats();
  if (list.length === 0) {
    $('#invoiceTableBody').html('');
    $('#invoiceTableEmpty').show();
    return;
  }
  $('#invoiceTableEmpty').hide();
  let html = '';
  list.forEach(function(inv) {
    let contract = inv.contractId ? contracts.find(c => c.id === inv.contractId) : null;
    let contractName = contract ? contract.name : '—';
    let statusHtml = inv.status === 'linked'
      ? '<span class="status-badge status-approved"><i class="fa-solid fa-link"></i> 已关联</span>'
      : '<span class="status-badge status-rejected"><i class="fa-solid fa-link-slash"></i> 待关联</span>';
    html += '<tr>';
    html += '<td><input type="checkbox" class="inv-check-item" value="' + inv.id + '" onchange="updateInvBatchBtn()"></td>';
    html += '<td><a href="#" onclick="viewInvoiceDetail(' + inv.id + ');return false;" style="color:var(--fa-primary);font-weight:500;">' + inv.invoiceNo + '</a></td>';
    html += '<td>' + inv.type + '</td>';
    html += '<td>' + inv.date + '</td>';
    html += '<td style="text-align:right;">¥ ' + inv.amount.toLocaleString('zh-CN', {minimumFractionDigits:2}) + '</td>';
    html += '<td style="text-align:right;">¥ ' + inv.tax.toLocaleString('zh-CN', {minimumFractionDigits:2}) + '</td>';
    html += '<td style="text-align:right;font-weight:600;color:var(--fa-danger);">¥ ' + inv.totalAmount.toLocaleString('zh-CN', {minimumFractionDigits:2}) + '</td>';
    html += '<td>' + inv.issuer + '</td>';
    html += '<td>' + (contract ? '<a href="#" onclick="switchPage(\'contract\');setTimeout(function(){openContractDetail(' + contract.id + ')},200);return false;" style="color:var(--fa-primary);">' + contractName + '</a>' : '<span style="color:#999;">未关联</span>') + '</td>';
    html += '<td>' + statusHtml + '</td>';
    html += '<td>';
    if (inv.status === 'unlinked') {
      html += '<button class="btn btn-warning btn-xs" onclick="openLinkContractModal(' + inv.id + ')" style="margin-right:3px;"><i class="fa-solid fa-link"></i> 关联</button>';
    }
    html += '<button class="btn btn-default btn-xs" onclick="viewInvoiceDetail(' + inv.id + ')" style="margin-right:3px;"><i class="fa-solid fa-eye"></i></button>';
    html += '<button class="btn btn-danger btn-xs" onclick="deleteInvoice(' + inv.id + ')"><i class="fa-solid fa-trash-can"></i></button>';
    html += '</td></tr>';
  });
  $('#invoiceTableBody').html(html);
}

function filterInvoiceData() {
  let keyword = $('#invSearchKeyword').val().toLowerCase();
  let type = $('#invSearchType').val();
  let status = $('#invSearchStatus').val();
  let month = $('#invSearchMonth').val();
  return invoiceData.filter(function(inv) {
    if (keyword && !inv.invoiceNo.toLowerCase().includes(keyword) && !inv.issuer.toLowerCase().includes(keyword)) return false;
    if (type && inv.type !== type) return false;
    if (status && inv.status !== status) return false;
    if (month && !inv.date.startsWith(month)) return false;
    return true;
  });
}

function filterInvoiceList() { renderInvoiceList(); }
function refreshInvoiceList() { renderInvoiceList(); }

function updateInvoiceStats() {
  let total = invoiceData.length;
  let linked = invoiceData.filter(i => i.status === 'linked').length;
  let amount = invoiceData.reduce((s, i) => s + i.totalAmount, 0);
  let pending = invoiceData.filter(i => i.status === 'unlinked').length;
  $('#invStatTotal').text(total);
  $('#invStatLinked').text(linked);
  $('#invStatAmount').text('¥ ' + amount.toLocaleString('zh-CN'));
  $('#invStatPending').text(pending);
  $('#badgeInvoice').text(pending);
}

// 发票上传弹框
function openInvoiceUploadModal() {
  currentInvoiceStep = 1;
  selectedContractForInvoice = null;
  resetInvoiceUploadForm();
  updateInvoiceStepUI();
  $('#invoiceUploadModal').show();
  $('body').css('overflow', 'hidden');
}

function closeInvoiceUploadModal() {
  $('#invoiceUploadModal').hide();
  $('body').css('overflow', '');
  removeInvoiceFile();
}

function resetInvoiceUploadForm() {
  $('#invFormNo, #invFormDate, #invFormIssuer, #invFormAmount, #invFormRemark').val('');
  $('#invFormType').val('');
  $('#invFormTaxRate').val('6');
  $('#invFormTax, #invFormTotal').val('');
  $('#invoiceUploadedFile').hide();
  $('#invNextStep1').prop('disabled', true);
  selectedContractForInvoice = null;
}

function updateInvoiceStepUI() {
  for (let i = 1; i <= 2; i++) {
    $('#invStep' + i).removeClass('active done');
    $('#invUploadStep' + i).hide();
  }
  for (let i = 1; i < currentInvoiceStep; i++) {
    $('#invStep' + i).addClass('done');
    if (i < 2) $('#invStepLine' + i).addClass('done');
  }
  $('#invStep' + currentInvoiceStep).addClass('active');
  $('#invUploadStep' + currentInvoiceStep).show();
  if (currentInvoiceStep === 2) populateInvoiceContractDropdown();
}

function goInvoiceStep(step) {
  if (step === 2 && currentInvoiceStep === 1) {
  }
  currentInvoiceStep = step;
  updateInvoiceStepUI();
}

function goInvoiceStepBack() {
  if (currentInvoiceStep > 1) { currentInvoiceStep--; updateInvoiceStepUI(); }
}

function populateInvoiceContractDropdown() {
  let html = '<option value="">不关联（稍后在发票管理中关联）</option>';
  contracts.forEach(function(c) {
    html += '<option value="' + c.id + '">' + c.no + ' - ' + c.name + '（' + STATUS_LABEL[c.status] + '）</option>';
  });
  $('#invFormContract').html(html);
  if (selectedContractForInvoice) {
    $('#invFormContract').val(selectedContractForInvoice);
  }
}

// 文件上传
function handleInvoiceFileDrop(e) {
  let files = e.dataTransfer.files;
  if (files.length > 0) processInvoiceFile(files[0]);
}

function handleInvoiceFileSelect(input) {
  if (input.files.length > 0) processInvoiceFile(input.files[0]);
}

function processInvoiceFile(file) {
  let ext = file.name.split('.').pop().toLowerCase();
  if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
    alert('请上传 PDF、JPG 或 PNG 格式的文件');
    return;
  }
  $('#invFileName').text(file.name);
  $('#invFileSize').text(formatFileSize(file.size));
  $('#invoiceUploadedFile').show();
  $('#invNextStep1').prop('disabled', false);
}

function removeInvoiceFile() {
  $('#invoiceUploadedFile').hide();
  $('#invoiceFileInput').val('');
  $('#invNextStep1').prop('disabled', true);
}

function calcInvoiceTotal() {
  let amount = parseFloat($('#invFormAmount').val()) || 0;
  let rate = parseFloat($('#invFormTaxRate').val()) || 0;
  let tax = amount * rate / 100;
  let total = amount + tax;
  $('#invFormTax').val(tax.toFixed(2));
  $('#invFormTotal').val('¥ ' + total.toLocaleString('zh-CN', {minimumFractionDigits:2}));
}

// 合同选择列表
function renderContractSelectList() {
  let searchVal = $('#invContractSearch').val() || '';
  let html = '';
  let filtered = contracts.filter(c => {
    if (!searchVal) return true;
    return c.name.includes(searchVal) || c.no.includes(searchVal) || (c.counterParty && c.counterParty.includes(searchVal));
  });
  if (filtered.length === 0) {
    html = '<div style="text-align:center;padding:30px;color:#999;">未找到匹配的合同</div>';
  } else {
    filtered.forEach(function(c) {
      let sel = selectedContractForInvoice === c.id ? ' selected' : '';
      html += '<div class="inv-contract-item' + sel + '" onclick="selectContractForInvoice(' + c.id + ')">';
      html += '<div class="inv-ct-info">';
      html += '<div class="inv-ct-no">' + c.no + '</div>';
      html += '<div class="inv-ct-name">' + c.name + '</div>';
      html += '</div>';
      html += '<div class="inv-ct-amount">¥ ' + c.amount.toLocaleString('zh-CN') + '</div>';
      html += '</div>';
    });
  }
  $('#invContractList').html(html);
}

function selectContractForInvoice(id) {
  selectedContractForInvoice = (selectedContractForInvoice === id) ? null : id;
  renderContractSelectList();
}

// 提交发票
function submitInvoice() {
  let invNo = $('#invFormNo').val();
  let invType = $('#invFormType').val();
  let invDate = $('#invFormDate').val();
  let invAmount = parseFloat($('#invFormAmount').val()) || 0;
  let invTaxRate = parseFloat($('#invFormTaxRate').val()) || 0;
  let invTax = invAmount * invTaxRate / 100;
  let invTotal = invAmount + invTax;
  let invIssuer = $('#invFormIssuer').val();
  let invRemark = $('#invFormRemark').val();
  let fileName = $('#invFileName').text() || 'invoice.pdf';

  let newInvoice = {
    id: invoiceNextId++,
    invoiceNo: invNo,
    type: invType,
    date: invDate,
    amount: invAmount,
    taxRate: invTaxRate,
    tax: invTax,
    totalAmount: invTotal,
    issuer: invIssuer || '—',
    contractId: selectedContractForInvoice,
    status: selectedContractForInvoice ? 'linked' : 'unlinked',
    fileName: fileName,
    uploadTime: new Date().toLocaleString('zh-CN'),
    remark: invRemark
  };
  invoiceData.push(newInvoice);
  closeInvoiceUploadModal();
  renderInvoiceList();
  alert('发票上传成功！' + (selectedContractForInvoice ? '已关联合同。' : '可在发票列表中关联合同。'));
}

// 查看发票详情
function viewInvoiceDetail(id) {
  let inv = invoiceData.find(i => i.id === id);
  if (!inv) return;
  let contract = inv.contractId ? contracts.find(c => c.id === inv.contractId) : null;
  let html = '<div class="detail-info">';
  html += '<div class="info-row"><span class="info-label">发票号码：</span><span class="info-value" style="font-weight:600;color:var(--fa-primary);">' + inv.invoiceNo + '</span></div>';
  html += '<div class="info-row"><span class="info-label">发票类型：</span><span class="info-value">' + inv.type + '</span></div>';
  html += '<div class="info-row"><span class="info-label">开票日期：</span><span class="info-value">' + inv.date + '</span></div>';
  html += '<div class="info-row"><span class="info-label">发票金额：</span><span class="info-value" style="color:var(--fa-danger);font-weight:600;">¥ ' + inv.amount.toLocaleString('zh-CN', {minimumFractionDigits:2}) + '</span></div>';
  html += '<div class="info-row"><span class="info-label">税率：</span><span class="info-value">' + inv.taxRate + '%</span></div>';
  html += '<div class="info-row"><span class="info-label">税额：</span><span class="info-value">¥ ' + inv.tax.toLocaleString('zh-CN', {minimumFractionDigits:2}) + '</span></div>';
  html += '<div class="info-row"><span class="info-label">价税合计：</span><span class="info-value" style="color:var(--fa-danger);font-weight:700;font-size:16px;">¥ ' + inv.totalAmount.toLocaleString('zh-CN', {minimumFractionDigits:2}) + '</span></div>';
  html += '<div class="info-row"><span class="info-label">开票方：</span><span class="info-value">' + inv.issuer + '</span></div>';
  html += '<div class="info-row"><span class="info-label">关联合同：</span><span class="info-value">' + (contract ? '<a href="#" onclick="closeInvoiceDetail();switchPage(\'contract\');setTimeout(function(){openContractDetail(' + contract.id + ')},200);return false;" style="color:var(--fa-primary);">' + contract.name + ' (' + contract.no + ')</a>' : '<span style="color:#999;">未关联</span>') + '</span></div>';
  html += '<div class="info-row"><span class="info-label">状态：</span><span class="info-value">' + (inv.status === 'linked' ? '<span class="status-badge status-approved">已关联</span>' : '<span class="status-badge status-rejected">待关联</span>') + '</span></div>';
  html += '<div class="info-row"><span class="info-label">上传时间：</span><span class="info-value">' + inv.uploadTime + '</span></div>';
  html += '<div class="info-row"><span class="info-label">备注：</span><span class="info-value">' + (inv.remark || '—') + '</span></div>';
  html += '</div>';
  // 移除旧的详情弹框
  $('#invoiceDetailModal').remove();
  let modalHtml = '<div class="invoice-detail-overlay" id="invoiceDetailModal" onclick="if(event.target===this)closeInvoiceDetail()">';
  modalHtml += '<div class="invoice-detail-dialog">';
  modalHtml += '<div class="idd-header"><h3><i class="fa-solid fa-file-invoice"></i> 发票详情</h3><button class="idd-close" onclick="closeInvoiceDetail()">&times;</button></div>';
  modalHtml += '<div class="idd-body">' + html + '</div>';
  modalHtml += '<div class="idd-footer">';
  if (inv.status === 'unlinked') {
    modalHtml += '<button class="btn btn-warning btn-sm" onclick="closeInvoiceDetail();openLinkContractModal(' + inv.id + ')"><i class="fa-solid fa-link"></i> 关联合同</button>';
  }
  modalHtml += '<button class="btn btn-default btn-sm" onclick="closeInvoiceDetail()">关闭</button>';
  modalHtml += '</div></div></div>';
  $('body').append(modalHtml);
}

function closeInvoiceDetail() {
  $('#invoiceDetailModal').remove();
}

// 关联合同弹框
function openLinkContractModal(invId) {
  selectedContractForInvoice = null;
  // 移除旧的关联弹框
  $('#linkContractModal').remove();
  let modalHtml = '<div class="invoice-detail-overlay" id="linkContractModal" onclick="if(event.target===this)closeLinkContractModal()">';
  modalHtml += '<div class="invoice-detail-dialog" style="width:600px;">';
  modalHtml += '<div class="idd-header" style="background:var(--fa-warning);"><h3><i class="fa-solid fa-link"></i> 关联合同</h3><button class="idd-close" onclick="closeLinkContractModal()">&times;</button></div>';
  modalHtml += '<div class="idd-body">';
  modalHtml += '<div style="margin-bottom:12px;"><input type="text" class="form-control" id="linkContractSearch" placeholder="搜索合同名称、编号、相对方..." oninput="renderLinkContractList(' + invId + ')"></div>';
  modalHtml += '<div class="inv-contract-list" id="linkContractList"></div>';
  modalHtml += '</div>';
  modalHtml += '<div class="idd-footer"><button class="btn btn-default btn-sm" onclick="closeLinkContractModal()">取消</button><button class="btn btn-primary btn-sm" onclick="confirmLinkContract(' + invId + ')" id="btnConfirmLink" disabled><i class="fa-solid fa-check"></i> 确认关联</button></div>';
  modalHtml += '</div></div>';
  $('body').append(modalHtml);
  renderLinkContractList(invId);
}

function renderLinkContractList(invId) {
  let searchVal = $('#linkContractSearch').val() || '';
  let html = '';
  let filtered = contracts.filter(c => {
    if (!searchVal) return true;
    return c.name.includes(searchVal) || c.no.includes(searchVal) || (c.counterParty && c.counterParty.includes(searchVal));
  });
  if (filtered.length === 0) {
    html = '<div style="text-align:center;padding:30px;color:#999;">未找到匹配的合同</div>';
  } else {
    filtered.forEach(function(c) {
      let sel = selectedContractForInvoice === c.id ? ' selected' : '';
      html += '<div class="inv-contract-item' + sel + '" onclick="selectLinkContract(' + c.id + ',' + invId + ')">';
      html += '<div class="inv-ct-info">';
      html += '<div class="inv-ct-no">' + c.no + '</div>';
      html += '<div class="inv-ct-name">' + c.name + '</div>';
      html += '</div>';
      html += '<div class="inv-ct-amount">¥ ' + c.amount.toLocaleString('zh-CN') + '</div>';
      html += '</div>';
    });
  }
  $('#linkContractList').html(html);
}

function selectLinkContract(cId, invId) {
  selectedContractForInvoice = (selectedContractForInvoice === cId) ? null : cId;
  $('#btnConfirmLink').prop('disabled', !selectedContractForInvoice);
  renderLinkContractList(invId);
}

function confirmLinkContract(invId) {
  if (!selectedContractForInvoice) return;
  let inv = invoiceData.find(i => i.id === invId);
  if (inv) {
    inv.contractId = selectedContractForInvoice;
    inv.status = 'linked';
  }
  closeLinkContractModal();
  renderInvoiceList();
  alert('发票已成功关联合同！');
}

function closeLinkContractModal() {
  $('#linkContractModal').remove();
  selectedContractForInvoice = null;
}

// 删除发票
function deleteInvoice(id) {
  if (!confirm('确定要删除该发票记录吗？')) return;
  invoiceData = invoiceData.filter(i => i.id !== id);
  renderInvoiceList();
}

// 批量操作
function toggleInvoiceCheckAll() {
  let checked = $('#invCheckAll').prop('checked');
  $('.inv-check-item').prop('checked', checked);
  updateInvBatchBtn();
}

function updateInvBatchBtn() {
  let count = $('.inv-check-item:checked').length;
  let $btn = $('#invBatchDeleteBtn');
  if (count > 0) {
    $btn.prop('disabled', false).css('opacity', 1);
  } else {
    $btn.prop('disabled', true).css('opacity', 0.5);
  }
}

function showInvoiceBatchDeleteConfirm() {
  let count = $('.inv-check-item:checked').length;
  if (count === 0) return;
  if (!confirm('确定要删除选中的 ' + count + ' 条发票记录吗？此操作不可撤销。')) return;
  let ids = [];
  $('.inv-check-item:checked').each(function() { ids.push(parseInt($(this).val())); });
  invoiceData = invoiceData.filter(i => !ids.includes(i.id));
  renderInvoiceList();
}

// 合同详情页-发票Tab渲染
function renderDetailInvoice(contractId) {
  let list = invoiceData.filter(i => i.contractId === contractId);
  let contract = contracts.find(c => c.id === contractId);
  let totalInvAmount = list.reduce((s, i) => s + i.totalAmount, 0);
  let contractAmount = contract ? contract.amount : 0;
  let ratio = contractAmount > 0 ? (totalInvAmount / contractAmount * 100).toFixed(1) : 0;

  $('#detailInvoiceCount').text(list.length);
  $('#detailInvoiceAmount').text('¥ ' + totalInvAmount.toLocaleString('zh-CN'));
  $('#detailContractAmount').text('¥ ' + contractAmount.toLocaleString('zh-CN'));
  $('#detailInvoiceRatio').text(ratio + '%');

  if (list.length === 0) {
    $('#detailInvoiceBody').html('');
    $('#detailInvoiceEmpty').show();
    return;
  }
  $('#detailInvoiceEmpty').hide();
  let html = '';
  list.forEach(function(inv, idx) {
    let statusHtml = inv.status === 'linked'
      ? '<span class="status-badge status-approved"><i class="fa-solid fa-link"></i> 已关联</span>'
      : '<span class="status-badge status-rejected">待关联</span>';
    html += '<tr>';
    html += '<td>' + (idx + 1) + '</td>';
    html += '<td><a href="#" onclick="viewInvoiceDetail(' + inv.id + ');return false;" style="color:var(--fa-primary);font-weight:500;">' + inv.invoiceNo + '</a></td>';
    html += '<td>' + inv.type + '</td>';
    html += '<td>' + inv.date + '</td>';
    html += '<td style="text-align:right;">¥ ' + inv.amount.toLocaleString('zh-CN', {minimumFractionDigits:2}) + '</td>';
    html += '<td style="text-align:right;">¥ ' + inv.tax.toLocaleString('zh-CN', {minimumFractionDigits:2}) + '</td>';
    html += '<td style="text-align:right;font-weight:600;color:var(--fa-danger);">¥ ' + inv.totalAmount.toLocaleString('zh-CN', {minimumFractionDigits:2}) + '</td>';
    html += '<td>' + inv.issuer + '</td>';
    html += '<td>' + statusHtml + '</td>';
    html += '<td><button class="btn btn-default btn-xs" onclick="viewInvoiceDetail(' + inv.id + ')"><i class="fa-solid fa-eye"></i> 查看</button></td>';
    html += '</tr>';
  });
  $('#detailInvoiceBody').html(html);
}

// 点击发票上传弹框遮罩层关闭
$(document).on('click', '#invoiceUploadModal', function(e) {
  if (e.target === this) closeInvoiceUploadModal();
});

// ESC关闭发票弹框
$(document).on('keydown', function(e) {
  if (e.key === 'Escape') {
    if ($('#invoiceUploadModal').is(':visible')) closeInvoiceUploadModal();
    if ($('#invoiceDetailModal').length && $('#invoiceDetailModal').is(':visible')) closeInvoiceDetail();
    if ($('#linkContractModal').length && $('#linkContractModal').is(':visible')) closeLinkContractModal();
  }
});
