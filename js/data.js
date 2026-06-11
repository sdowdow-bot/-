// ==================== 数据模型 ====================

// 合同状态枚举
const STATUS = {
  DRAFT: 'draft',
  APPROVING: 'approving',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SIGNING: 'signing',
  SEALED: 'sealed',
  ARCHIVING: 'archiving',
  ARCHIVED: 'archived',
  WITHDRAWN: 'withdrawn'
};

const STATUS_LABEL = {
  draft: '草稿',
  approving: '审核中',
  approved: '已通过',
  rejected: '已驳回',
  withdrawn: '已撤销',
  importPending: '导入待补全',
  pendingSign: '待签署',
  signing: '签署中',
  sealed: '已签署',
  fulfilling: '履约中',
  rejectedSign: '已拒签',
  archived: '已归档'
};

const STATUS_CLASS = {
  draft: 'status-draft',
  approving: 'status-approving',
  approved: 'status-approved',
  rejected: 'status-rejected',
  withdrawn: 'status-withdrawn',
  importPending: 'status-importPending',
  pendingSign: 'status-pendingSign',
  signing: 'status-signing',
  sealed: 'status-sealed',
  fulfilling: 'status-fulfilling',
  rejectedSign: 'status-rejectedSign',
  archived: 'status-archived'
};

const AUDIT_STATUS_LABEL = {
  none: '未提交',
  pending: '审核中',
  approved: '已通过',
  rejected: '已驳回',
  withdrawn: '已撤回'
};

const AUDIT_STATUS_CLASS = {
  none: 'status-draft',
  pending: 'status-approving',
  approved: 'status-approved',
  rejected: 'status-rejected',
  withdrawn: 'status-withdrawn'
};

// 合同数据
let contracts = [
  { id:1, no:'HT-2026-0001', name:'医疗器械采购合同', subject:'XX科技有限公司', category:'采购合同', status:'approving', auditStatus:'pending', termType:'固定期限', validDate:'2026-05-15 至 2027-05-14', signDate:'2026-05-15', direction:'支出', pricingMethod:'固定总价', handler:'张经理', amount:580000, currency:'CNY', signDept:'采购部', performPlace:'北京市朝阳区', summary:'采购医疗器械一批，包含监护仪、输液泵等设备', counterParty:'北京康医疗器械有限公司', counterContact:'李明', counterPhone:'010-88886666', counterAddress:'北京市海淀区中关村南大街5号', effectiveDate:'2026-05-15', deliveryDate:'2026-05-20', totalCopies:4, archiveCopies:2, archiveTime:'', archiveLocation:'', attachmentName:'医疗器械采购合同.pdf', createTime:'2026-05-10 14:30:00', updateTime:'2026-05-12 09:00:00', currentHandler:'李总监（法务部）', currentNode:'法务审批', progress:65, partyA:'XX科技有限公司', partyB:'北京康医疗器械有限公司', type:'采购合同', startDate:'2026-05-15', endDate:'2027-05-14' },
  { id:2, no:'HT-2026-0002', name:'上门护理服务合作协议', subject:'XX科技有限公司', category:'服务合同', status:'approving', auditStatus:'pending', termType:'固定期限', validDate:'2026-05-20 至 2027-05-19', signDate:'2026-05-20', direction:'支出', pricingMethod:'按次计费', handler:'王主管', amount:120000, currency:'CNY', signDept:'运营部', performPlace:'上海市浦东新区', summary:'居家护理服务合作，提供上门护理服务', counterParty:'仁心护理服务有限公司', counterContact:'张华', counterPhone:'021-66668888', counterAddress:'上海市浦东新区陆家嘴环路1000号', effectiveDate:'2026-05-20', deliveryDate:'2026-05-22', totalCopies:3, archiveCopies:1, archiveTime:'', archiveLocation:'', attachmentName:'上门护理服务合作协议.docx', createTime:'2026-05-11 09:15:00', updateTime:'2026-05-13 10:30:00', currentHandler:'刘总（总经理）', currentNode:'总经理审批', progress:90, partyA:'XX科技有限公司', partyB:'仁心护理服务有限公司', type:'服务合同', startDate:'2026-05-20', endDate:'2027-05-19' },
  { id:3, no:'HT-2026-0003', name:'医疗设备租赁合同', subject:'XX科技有限公司', category:'租赁合同', status:'approved', auditStatus:'approved', termType:'固定期限', validDate:'2026-06-01 至 2028-05-31', signDate:'2026-06-01', direction:'支出', pricingMethod:'按月计费', handler:'赵助理', amount:350000, currency:'CNY', signDept:'行政部', performPlace:'广州市天河区', summary:'租赁医疗设备含CT机、MRI设备等', counterParty:'华信医疗器械租赁有限公司', counterContact:'王刚', counterPhone:'020-33335555', counterAddress:'广州市天河区珠江新城华夏路30号', effectiveDate:'2026-06-01', deliveryDate:'2026-06-05', totalCopies:4, archiveCopies:2, archiveTime:'2026-06-10 14:00:00', archiveLocation:'档案室A区-03柜', createTime:'2026-05-08 11:00:00', updateTime:'2026-06-10 14:00:00', currentHandler:'李总监（法务部）', currentNode:'已完成', progress:100, partyA:'XX科技有限公司', partyB:'华信医疗器械租赁有限公司', type:'租赁合同', startDate:'2026-06-01', endDate:'2028-05-31' },
  { id:4, no:'HT-2026-0004', name:'药品供应合作协议', subject:'XX科技有限公司', category:'合作协议', status:'signing', auditStatus:'approved', termType:'固定期限', validDate:'2026-06-15 至 2029-06-14', signDate:'2026-06-15', direction:'支出', pricingMethod:'按量计费', handler:'张经理', amount:2000000, currency:'CNY', signDept:'采购部', performPlace:'武汉市洪山区', summary:'药品长期供应合作，涵盖常用药品及特殊药品', counterParty:'九州通医药集团', counterContact:'陈伟', counterPhone:'027-87654321', counterAddress:'武汉市洪山区光谷大道77号', effectiveDate:'2026-06-15', deliveryDate:'2026-06-18', totalCopies:6, archiveCopies:3, archiveTime:'', archiveLocation:'', createTime:'2026-05-05 16:20:00', updateTime:'2026-05-20 11:00:00', currentHandler:'陈主管（用印管理处）', currentNode:'用印签署', progress:100, partyA:'XX科技有限公司', partyB:'九州通医药集团', type:'合作协议', startDate:'2026-06-15', endDate:'2029-06-14' },
  { id:5, no:'HT-2026-0005', name:'信息系统维护服务合同', subject:'XX科技有限公司', category:'服务合同', status:'sealed', auditStatus:'approved', termType:'固定期限', validDate:'2026-04-01 至 2027-03-31', signDate:'2026-04-01', direction:'支出', pricingMethod:'固定总价', handler:'孙工', amount:86000, currency:'CNY', signDept:'IT部', performPlace:'深圳市南山区', summary:'信息系统年度维护服务，含7×24小时技术支持', counterParty:'云智科技有限公司', counterContact:'刘洋', counterPhone:'0755-22224444', counterAddress:'深圳市南山区科技园南区R2-B栋', effectiveDate:'2026-04-01', deliveryDate:'2026-04-03', totalCopies:3, archiveCopies:1, archiveTime:'', archiveLocation:'', createTime:'2026-03-25 10:00:00', updateTime:'2026-04-02 16:00:00', currentHandler:'刘经理（档案室）', currentNode:'合同存档', progress:100, partyA:'XX科技有限公司', partyB:'云智科技有限公司', type:'服务合同', startDate:'2026-04-01', endDate:'2027-03-31' },
  { id:6, no:'HT-2026-0006', name:'康复辅具采购合同', subject:'XX科技有限公司', category:'采购合同', status:'rejected', auditStatus:'rejected', termType:'固定期限', validDate:'2026-05-25 至 2027-05-24', signDate:'2026-05-25', direction:'支出', pricingMethod:'固定总价', handler:'张经理', amount:450000, currency:'CNY', signDept:'采购部', performPlace:'成都市武侯区', summary:'康复辅具采购，含轮椅、助行器等', counterParty:'康复之家医疗用品有限公司', counterContact:'赵磊', counterPhone:'028-55557777', counterAddress:'成都市武侯区人民南路四段1号', effectiveDate:'', deliveryDate:'', totalCopies:4, archiveCopies:0, archiveTime:'', archiveLocation:'', createTime:'2026-04-28 13:45:00', updateTime:'2026-04-29 10:00:00', currentHandler:'张经理（采购部）', currentNode:'已驳回', progress:30, partyA:'XX科技有限公司', partyB:'康复之家医疗用品有限公司', type:'采购合同', startDate:'2026-05-25', endDate:'2027-05-24' },
  { id:7, no:'HT-2026-0007', name:'物流配送服务合同', subject:'XX科技有限公司', category:'服务合同', status:'sealed', auditStatus:'approved', termType:'固定期限', validDate:'2026-07-01 至 2028-06-30', signDate:'2026-07-01', direction:'支出', pricingMethod:'按单计费', handler:'陈总监', amount:180000, currency:'CNY', signDept:'运营部', performPlace:'杭州市余杭区', summary:'医疗物资物流配送服务，覆盖华东地区', counterParty:'顺风物流有限公司', counterContact:'周强', counterPhone:'0571-99998888', counterAddress:'杭州市余杭区仓前街道文一西路1218号', effectiveDate:'2026-07-01', deliveryDate:'2026-07-02', totalCopies:4, archiveCopies:2, archiveTime:'2026-07-15 09:30:00', archiveLocation:'档案室B区-07柜', createTime:'2026-03-10 08:30:00', updateTime:'2026-07-15 09:30:00', currentHandler:'李总监（法务部）', currentNode:'已归档', progress:100, partyA:'XX科技有限公司', partyB:'顺风物流有限公司', type:'服务合同', startDate:'2026-07-01', endDate:'2028-06-30' },
  { id:8, no:'HT-2026-0008', name:'健康管理平台开发合同', subject:'XX科技有限公司', category:'合作协议', status:'sealed', auditStatus:'approved', termType:'固定期限', validDate:'2026-06-30 至 2028-06-29', signDate:'2026-06-30', direction:'支出', pricingMethod:'里程碑付款', handler:'孙工', amount:960000, currency:'CNY', signDept:'IT部', performPlace:'南京市建邺区', summary:'健康管理平台定制开发，含APP及后台管理系统', counterParty:'数字健康科技有限公司', counterContact:'吴芳', counterPhone:'025-77776666', counterAddress:'南京市建邺区河西大街198号', effectiveDate:'2026-06-30', deliveryDate:'2026-07-05', totalCopies:6, archiveCopies:3, archiveTime:'', archiveLocation:'', createTime:'2026-04-15 09:00:00', updateTime:'2026-07-01 10:00:00', currentHandler:'刘总（总经理）', currentNode:'已签署', progress:100, partyA:'XX科技有限公司', partyB:'数字健康科技有限公司', type:'合作协议', startDate:'2026-06-30', endDate:'2028-06-29' },
  { id:9, no:'HT-2026-0009', name:'护理耗材年度采购合同', subject:'XX科技有限公司', category:'采购合同', status:'draft', auditStatus:'none', termType:'固定期限', validDate:'2026-08-01 至 2027-07-31', signDate:'2026-08-01', direction:'支出', pricingMethod:'按量计费', handler:'张经理', amount:320000, currency:'CNY', signDept:'采购部', performPlace:'北京市大兴区', summary:'护理耗材年度采购，含注射器、敷料等', counterParty:'恒安医疗用品有限公司', counterContact:'孙丽', counterPhone:'010-66665555', counterAddress:'北京市大兴区生物医药基地天荣街9号', effectiveDate:'', deliveryDate:'', totalCopies:4, archiveCopies:0, archiveTime:'', archiveLocation:'', createTime:'2026-05-13 15:00:00', updateTime:'2026-05-13 15:00:00', currentHandler:'—', currentNode:'—', progress:0, partyA:'XX科技有限公司', partyB:'恒安医疗用品有限公司', type:'采购合同', startDate:'2026-08-01', endDate:'2027-07-31' },
  { id:10, no:'HT-2026-0010', name:'体检服务合作合同', subject:'XX科技有限公司', category:'服务合同', status:'withdrawn', auditStatus:'withdrawn', termType:'固定期限', validDate:'2026-09-01 至 2028-08-31', signDate:'2026-09-01', direction:'支出', pricingMethod:'按人次计费', handler:'赵助理', amount:500000, currency:'CNY', signDept:'行政部', performPlace:'天津市和平区', summary:'员工年度体检服务合作', counterParty:'美年大健康', counterContact:'钱进', counterPhone:'022-33334444', counterAddress:'天津市和平区南京路189号', effectiveDate:'', deliveryDate:'', totalCopies:3, archiveCopies:0, archiveTime:'', archiveLocation:'', createTime:'2026-04-20 10:30:00', updateTime:'2026-04-22 14:00:00', currentHandler:'赵助理（行政部）', currentNode:'已撤回', progress:15, partyA:'XX科技有限公司', partyB:'美年大健康', type:'服务合同', startDate:'2026-09-01', endDate:'2028-08-31' }
];

// 审批历史记录
let approvalHistories = {
  1: [
    { user:'张经理（采购部）', dept:'采购部', action:'提交审批', actionType:'submit', time:'2026-05-10 14:35:00', opinion:'采购合同已拟好，请审批。', nodeName:'发起申请', availableHandlers:['张经理（采购部）'], actualHandler:'张经理（采购部）' },
    { user:'王主管（采购部）', dept:'采购部', action:'审批通过', actionType:'approve', time:'2026-05-11 10:20:00', opinion:'采购物品清单确认无误，同意。', nodeName:'部门负责人审批', availableHandlers:['王主管（采购部）','陈总监（运营部）'], actualHandler:'王主管（采购部）' },
    { user:'李总监（法务部）', dept:'法务部', action:'审批通过', actionType:'approve', time:'2026-05-11 16:45:00', opinion:'合同条款合规，无法律风险，同意。', nodeName:'法务审核', availableHandlers:['李总监（法务部）','王律师（法务部）'], actualHandler:'李总监（法务部）' },
  ],
  2: [
    { user:'王主管（运营部）', dept:'运营部', action:'提交审批', actionType:'submit', time:'2026-05-11 09:20:00', opinion:'护理服务合作协议已拟定，请审批。', nodeName:'发起申请', availableHandlers:['王主管（运营部）'], actualHandler:'王主管（运营部）' },
    { user:'陈总监（运营部）', dept:'运营部', action:'审批通过', actionType:'approve', time:'2026-05-12 08:45:00', opinion:'服务条款合理，同意提交。', nodeName:'部门负责人审批', availableHandlers:['陈总监（运营部）'], actualHandler:'陈总监（运营部）' },
    { user:'刘总（总经理）', dept:'总经理', action:'审批通过', actionType:'approve', time:'2026-05-13 10:30:00', opinion:'同意，可执行。', nodeName:'总经理审批', availableHandlers:['刘总（总经理）'], actualHandler:'刘总（总经理）' },
  ],
  3: [
    { user:'赵助理（行政部）', dept:'行政部', action:'提交审批', actionType:'submit', time:'2026-05-08 11:05:00', opinion:'设备租赁合同，请审批。', nodeName:'发起申请', availableHandlers:['赵助理（行政部）'], actualHandler:'赵助理（行政部）' },
    { user:'刘经理（行政部）', dept:'行政部', action:'审批通过', actionType:'approve', time:'2026-05-09 09:30:00', opinion:'租赁条款确认无误。', nodeName:'部门负责人审批', availableHandlers:['刘经理（行政部）'], actualHandler:'刘经理（行政部）' },
    { user:'李总监（法务部）', dept:'法务部', action:'审批通过', actionType:'approve', time:'2026-05-09 15:00:00', opinion:'法律风险审查通过。', nodeName:'法务审核', availableHandlers:['李总监（法务部）','王律师（法务部）'], actualHandler:'李总监（法务部）' },
    { user:'赵主管（财务部）', dept:'财务部', action:'审批通过', actionType:'approve', time:'2026-05-09 17:20:00', opinion:'租赁费用在预算范围内，同意。', nodeName:'财务审核', availableHandlers:['赵主管（财务部）'], actualHandler:'赵主管（财务部）' },
    { user:'刘总（总经理）', dept:'总经理', action:'审批通过', actionType:'approve', time:'2026-05-10 10:00:00', opinion:'批准。', nodeName:'总经理审批', availableHandlers:['刘总（总经理）'], actualHandler:'刘总（总经理）' },
  ],
  4: [
    { user:'张经理（采购部）', dept:'采购部', action:'提交审批', actionType:'submit', time:'2026-05-05 16:20:00', opinion:'药品供应合作协议，金额较大，请审批。', nodeName:'发起申请', availableHandlers:['张经理（采购部）'], actualHandler:'张经理（采购部）' },
    { user:'王主管（采购部）', dept:'采购部', action:'审批通过', actionType:'approve', time:'2026-05-06 09:10:00', opinion:'采购需求确认，同意。', nodeName:'部门负责人审批', availableHandlers:['王主管（采购部）','陈总监（运营部）'], actualHandler:'王主管（采购部）' },
    { user:'李总监（法务部）', dept:'法务部', action:'审批通过', actionType:'approve', time:'2026-05-07 14:30:00', opinion:'合同条款合规，无法律风险。', nodeName:'法务审核', availableHandlers:['李总监（法务部）','王律师（法务部）'], actualHandler:'李总监（法务部）' },
    { user:'赵主管（财务部）', dept:'财务部', action:'审批通过', actionType:'approve', time:'2026-05-08 11:00:00', opinion:'预算充足，付款方式合理。', nodeName:'财务审核', availableHandlers:['赵主管（财务部）'], actualHandler:'赵主管（财务部）' },
    { user:'刘总（总经理）', dept:'总经理', action:'审批通过', actionType:'approve', time:'2026-05-09 09:00:00', opinion:'重大合同，已审阅，同意。', nodeName:'总经理审批', availableHandlers:['刘总（总经理）'], actualHandler:'刘总（总经理）' },
  ],
  6: [
    { user:'张经理（采购部）', dept:'采购部', action:'提交审批', actionType:'submit', time:'2026-04-28 14:00:00', opinion:'康复辅具采购合同，请审批。', nodeName:'发起申请', availableHandlers:['张经理（采购部）'], actualHandler:'张经理（采购部）' },
    { user:'王主管（采购部）', dept:'采购部', action:'审批通过', actionType:'approve', time:'2026-04-28 17:30:00', opinion:'采购清单确认无误，同意。', nodeName:'部门负责人审批', availableHandlers:['王主管（采购部）','陈总监（运营部）'], actualHandler:'王主管（采购部）' },
    { user:'李总监（法务部）', dept:'法务部', action:'审批通过', actionType:'approve', time:'2026-04-29 09:15:00', opinion:'合同条款合规。', nodeName:'法务审核', availableHandlers:['李总监（法务部）','王律师（法务部）'], actualHandler:'李总监（法务部）' },
    { user:'赵主管（财务部）', dept:'财务部', action:'驳回', actionType:'reject', time:'2026-04-29 10:00:00', opinion:'合同金额超出预算，请重新核算后提交。', rejectReason:'合同金额超出预算，请重新核算后提交。', nodeName:'财务审核', availableHandlers:['赵主管（财务部）'], actualHandler:'赵主管（财务部）' },
  ],
  7: [
    { user:'陈总监（运营部）', dept:'运营部', action:'提交审批', actionType:'submit', time:'2026-03-10 08:35:00', opinion:'物流服务合同请审批。', nodeName:'发起申请', availableHandlers:['陈总监（运营部）'], actualHandler:'陈总监（运营部）' },
    { user:'陈总监（运营部）', dept:'运营部', action:'审批通过', actionType:'approve', time:'2026-03-10 14:00:00', opinion:'运营需求确认，同意。', nodeName:'部门负责人审批', availableHandlers:['陈总监（运营部）'], actualHandler:'陈总监（运营部）' },
    { user:'刘总（总经理）', dept:'总经理', action:'审批通过', actionType:'approve', time:'2026-03-11 09:00:00', opinion:'批准。', nodeName:'总经理审批', availableHandlers:['刘总（总经理）'], actualHandler:'刘总（总经理）' },
    { user:'陈主管（用印管理处）', dept:'用印管理处', action:'用印签署完成', actionType:'approve', time:'2026-03-13 11:00:00', opinion:'已盖章签署。', nodeName:'用印签署', availableHandlers:['陈主管（用印管理处）'], actualHandler:'陈主管（用印管理处）' },
    { user:'刘经理（档案室）', dept:'档案室', action:'归档完成', actionType:'approve', time:'2026-03-14 10:00:00', opinion:'合同已归档入库。', nodeName:'合同归档', availableHandlers:['刘经理（档案室）'], actualHandler:'刘经理（档案室）' },
  ],
  8: [
    { user:'孙工（IT部）', dept:'IT部', action:'提交审批', actionType:'submit', time:'2026-04-15 09:00:00', opinion:'健康管理平台开发合同，请审批。', nodeName:'发起申请', availableHandlers:['孙工（IT部）'], actualHandler:'孙工（IT部）' },
    { user:'陈总监（运营部）', dept:'运营部', action:'审批通过', actionType:'approve', time:'2026-04-16 10:30:00', opinion:'开发需求明确，同意。', nodeName:'部门负责人审批', availableHandlers:['陈总监（运营部）'], actualHandler:'陈总监（运营部）' },
    { user:'李总监（法务部）', dept:'法务部', action:'审批通过', actionType:'approve', time:'2026-04-17 15:00:00', opinion:'知识产权条款已审核，无异议。', nodeName:'法务审核', availableHandlers:['李总监（法务部）','王律师（法务部）'], actualHandler:'李总监（法务部）' },
    { user:'赵主管（财务部）', dept:'财务部', action:'审批通过', actionType:'approve', time:'2026-04-18 09:30:00', opinion:'付款里程碑设置合理。', nodeName:'财务审核', availableHandlers:['赵主管（财务部）'], actualHandler:'赵主管（财务部）' },
    { user:'刘总（总经理）', dept:'总经理', action:'审批通过', actionType:'approve', time:'2026-04-19 09:00:00', opinion:'批准。', nodeName:'总经理审批', availableHandlers:['刘总（总经理）'], actualHandler:'刘总（总经理）' },
  ],
  12: [
    { user:'张经理（采购部）', dept:'采购部', action:'提交审批', actionType:'submit', time:'2026-05-09 08:00:00', opinion:'战略合作框架协议，请会签审批。', nodeName:'发起申请', availableHandlers:['张经理（采购部）'], actualHandler:'张经理（采购部）' },
    { user:'王主管（采购部）', dept:'采购部', action:'审批通过', actionType:'approve', time:'2026-05-09 10:30:00', opinion:'采购需求确认。', nodeName:'会签审批', availableHandlers:['王主管（采购部）','陈总监（运营部）','李总监（法务部）','赵主管（财务部）','刘总（总经理）','董事长'], actualHandler:'王主管（采购部）' },
    { user:'陈总监（运营部）', dept:'运营部', action:'审批通过', actionType:'approve', time:'2026-05-09 14:00:00', opinion:'运营方面无异议。', nodeName:'会签审批', availableHandlers:['王主管（采购部）','陈总监（运营部）','李总监（法务部）','赵主管（财务部）','刘总（总经理）','董事长'], actualHandler:'陈总监（运营部）' },
    { user:'李总监（法务部）', dept:'法务部', action:'审批通过', actionType:'approve', time:'2026-05-10 09:00:00', opinion:'法律条款审核通过。', nodeName:'会签审批', availableHandlers:['王主管（采购部）','陈总监（运营部）','李总监（法务部）','赵主管（财务部）','刘总（总经理）','董事长'], actualHandler:'李总监（法务部）' },
  ],
};

// ==================== 发票数据 ====================
let invoiceData = [
  { id: 1, invoiceNo: 'FP-2026-00156', type: '增值税专用发票', date: '2026-06-15', amount: 500000, taxRate: 6, tax: 30000, totalAmount: 530000, issuer: '北京康医疗器械有限公司', contractId: 1, status: 'linked', fileName: 'FP-2026-00156.pdf', uploadTime: '2026-06-16 10:30:00', remark: '医疗器械采购首批发票' },
  { id: 2, invoiceNo: 'FP-2026-00203', type: '增值税普通发票', date: '2026-06-20', amount: 80000, taxRate: 6, tax: 4800, totalAmount: 84800, issuer: '仁心护理服务有限公司', contractId: 2, status: 'linked', fileName: 'FP-2026-00203.pdf', uploadTime: '2026-06-21 14:15:00', remark: '护理服务费发票' },
  { id: 3, invoiceNo: 'FP-2026-00287', type: '增值税专用发票', date: '2026-07-01', amount: 175000, taxRate: 6, tax: 10500, totalAmount: 185500, issuer: '华信医疗器械租赁有限公司', contractId: 3, status: 'linked', fileName: 'FP-2026-00287.jpg', uploadTime: '2026-07-02 09:00:00', remark: '设备租赁费上半年发票' },
  { id: 4, invoiceNo: 'FP-2026-00312', type: '电子发票', date: '2026-07-10', amount: 43000, taxRate: 6, tax: 2580, totalAmount: 45580, issuer: '云智科技有限公司', contractId: null, status: 'unlinked', fileName: 'FP-2026-00312.pdf', uploadTime: '2026-07-11 11:20:00', remark: 'IT维护服务费' },
  { id: 5, invoiceNo: 'FP-2026-00345', type: '增值税专用发票', date: '2026-07-15', amount: 1000000, taxRate: 6, tax: 60000, totalAmount: 1060000, issuer: '九州通医药集团', contractId: 4, status: 'linked', fileName: 'FP-2026-00345.pdf', uploadTime: '2026-07-16 08:45:00', remark: '药品供应首批发票' },
  { id: 6, invoiceNo: 'FP-2026-00398', type: '收据', date: '2026-07-20', amount: 15000, taxRate: 0, tax: 0, totalAmount: 15000, issuer: '洁美物业服务有限公司', contractId: null, status: 'unlinked', fileName: 'FP-2026-00398.jpg', uploadTime: '2026-07-21 16:30:00', remark: '保洁服务费收据' },
  { id: 7, invoiceNo: 'FP-2026-00421', type: '电子发票', date: '2026-07-25', amount: 90000, taxRate: 6, tax: 5400, totalAmount: 95400, issuer: '顺风物流有限公司', contractId: 7, status: 'linked', fileName: 'FP-2026-00421.pdf', uploadTime: '2026-07-26 10:00:00', remark: '物流配送服务费' },
  { id: 8, invoiceNo: 'FP-2026-00456', type: '增值税普通发票', date: '2026-08-01', amount: 160000, taxRate: 6, tax: 9600, totalAmount: 169600, issuer: '恒安医疗用品有限公司', contractId: null, status: 'unlinked', fileName: 'FP-2026-00456.pdf', uploadTime: '2026-08-02 09:30:00', remark: '护理耗材采购发票' },
];
let invoiceNextId = 9;
let currentInvoiceStep = 1;
let selectedContractForInvoice = null;

// 沟通消息存储
let chatMessages = {};

// 当前查看的合同ID
let currentContractId = null;
let editingContractId = null;
// 记录来源页面，用于返回时跳转
let previousPage = 'contract';

// ==================== 标的物数据 ====================
let subjectItems = {
  1: [
    { name:'多参数监护仪', spec:'PM-9000', qty:10, unit:'台', price:28000, remark:'含配件' },
    { name:'输液泵', spec:'SP-500', qty:20, unit:'台', price:8500, remark:'' },
    { name:'注射泵', spec:'SY-1200', qty:15, unit:'台', price:6200, remark:'' },
    { name:'心电图机', spec:'ECG-300', qty:5, unit:'台', price:35000, remark:'含导联线' }
  ],
  2: [
    { name:'居家护理服务', spec:'标准套餐', qty:120, unit:'人次', price:1000, remark:'含基础护理+康复指导' }
  ],
  3: [
    { name:'CT机', spec:'Revolution EVO', qty:1, unit:'台', price:180000, remark:'含安装调试' },
    { name:'MRI设备', spec:'MAGNETOM 0.55T', qty:1, unit:'台', price:170000, remark:'含培训' }
  ],
  4: [
    { name:'常用药品包', spec:'综合套餐A', qty:1, unit:'批', price:2000000, remark:'年度供应' }
  ],
  5: [
    { name:'系统维护服务', spec:'7×24小时', qty:12, unit:'月', price:7166.67, remark:'含紧急响应' }
  ],
  7: [
    { name:'物流配送服务', spec:'华东区域', qty:12, unit:'月', price:15000, remark:'含冷链运输' }
  ],
  8: [
    { name:'健康管理平台APP', spec:'iOS+Android', qty:1, unit:'套', price:560000, remark:'含UI设计' },
    { name:'后台管理系统', spec:'Web端', qty:1, unit:'套', price:400000, remark:'含数据大屏' }
  ]
};

// ==================== 履约信息数据 ====================
let performanceInfo = {
  1: {
    place: '北京市朝阳区', period: '2026-05-15 至 2027-05-14',
    paymentMethod: '分三期付款（30%预付+50%到货+20%验收）', deliveryMethod: '供方送货上门并安装调试',
    acceptStandard: '符合国家医疗器械标准及合同附件规格', breachClause: '逾期交货按日0.5‰支付违约金',
    disputeResolution: '协商解决，协商不成由甲方所在地法院管辖',
    paymentPlans: [
      { stage: '第一期（预付款）', date: '2026-05-20', amount: 174000, ratio: '30%', status: '已付款' },
      { stage: '第二期（到货款）', date: '2026-07-15', amount: 290000, ratio: '50%', status: '待付款' },
      { stage: '第三期（验收款）', date: '2026-08-15', amount: 116000, ratio: '20%', status: '待付款' }
    ]
  },
  2: {
    place: '上海市浦东新区', period: '2026-05-20 至 2027-05-19',
    paymentMethod: '按月结算', deliveryMethod: '上门服务',
    acceptStandard: '按服务标准执行', breachClause: '按合同约定执行',
    disputeResolution: '协商解决',
    paymentPlans: [
      { stage: '月度结算', date: '每月25日', amount: 10000, ratio: '8.3%', status: '待付款' }
    ]
  },
  3: {
    place: '广州市天河区', period: '2026-06-01 至 2028-05-31',
    paymentMethod: '按月支付租金', deliveryMethod: '出租方安装交付',
    acceptStandard: '设备正常运行，满足临床需求', breachClause: '按合同约定执行',
    disputeResolution: '仲裁解决',
    paymentPlans: [
      { stage: '月度租金', date: '每月1日', amount: 14583.33, ratio: '4.2%', status: '待付款' }
    ]
  },
  7: {
    place: '杭州市余杭区', period: '2026-07-01 至 2028-06-30',
    paymentMethod: '按季度结算', deliveryMethod: '上门取件配送',
    acceptStandard: '按时送达，货物完好', breachClause: '延误赔偿运费3倍',
    disputeResolution: '协商解决',
    paymentPlans: [
      { stage: '季度结算', date: '每季度末', amount: 45000, ratio: '25%', status: '待付款' }
    ]
  }
};

// ==================== 变更记录数据 ====================
let changeRecords = {
  1: [
    { date: '2026-05-12', field: '合同金额', oldValue: '¥ 500,000.00', newValue: '¥ 580,000.00', operator: '张经理', reason: '增加心电图机5台' },
    { date: '2026-05-14', field: '有效日期', oldValue: '2026-05-15 至 2026-12-31', newValue: '2026-05-15 至 2027-05-14', operator: '张经理', reason: '供应商要求延长合作期限' }
  ],
  4: [
    { date: '2026-05-08', field: '合同金额', oldValue: '¥ 1,800,000.00', newValue: '¥ 2,000,000.00', operator: '张经理', reason: '增加特殊药品品类' }
  ],
  7: [
    { date: '2026-04-15', field: '履约地点', oldValue: '浙江省杭州市', newValue: '杭州市余杭区', operator: '陈总监', reason: '明确配送区域' },
    { date: '2026-05-20', field: '合同金额', oldValue: '¥ 150,000.00', newValue: '¥ 180,000.00', operator: '陈总监', reason: '增加冷链运输服务' }
  ]
};

// ==================== 审核流程配置数据 ====================
let auditFlows = [
  {
    id: 1,
    name: '标准合同审批流程',
    contractType: '采购合同',
    amountCondType: 'fixed',
    amountFixedOp: 'gte',
    amountFixedValue: 100000,
    amountRangeMinOp: 'gte',
    amountRangeMin: null,
    amountRangeMaxOp: 'lt',
    amountRangeMax: null,
    nodes: [
      { order: 1, name: '部门负责人审批', approveType: 'or-sign', handlers: ['王主管（采购部）', '陈总监（运营部）'] },
      { order: 2, name: '法务审核', approveType: 'or-sign', handlers: ['李总监（法务部）', '王律师（法务部）'] },
      { order: 3, name: '财务审核', approveType: 'or-sign', handlers: ['赵主管（财务部）'] },
      { order: 4, name: '总经理审批', approveType: 'or-sign', handlers: ['刘总（总经理）'] }
    ],
    ccMembers: ['周秘书（行政部）', '吴会计（财务部）'],
    status: 'enabled',
    remark: '适用于金额≥10万元的标准合同审批'
  },
  {
    id: 2,
    name: '简易合同审批流程',
    contractType: '服务合同',
    amountCondType: 'fixed',
    amountFixedOp: 'lt',
    amountFixedValue: 100000,
    amountRangeMinOp: 'gte',
    amountRangeMin: null,
    amountRangeMaxOp: 'lt',
    amountRangeMax: null,
    nodes: [
      { order: 1, name: '部门负责人审批', approveType: 'or-sign', handlers: ['陈总监（运营部）'] },
      { order: 2, name: '总经理审批', approveType: 'or-sign', handlers: ['刘总（总经理）'] }
    ],
    ccMembers: ['周秘书（行政部）'],
    status: 'enabled',
    remark: '适用于金额<10万的服务合同快速审批'
  },
  {
    id: 3,
    name: '重大合同审批流程',
    contractType: '合作协议',
    amountCondType: 'fixed',
    amountFixedOp: 'gte',
    amountFixedValue: 1000000,
    amountRangeMinOp: 'gte',
    amountRangeMin: null,
    amountRangeMaxOp: 'lt',
    amountRangeMax: null,
    nodes: [
      { order: 1, name: '联合会审', approveType: 'countersign', handlers: ['王主管（采购部）', '陈总监（运营部）', '李总监（法务部）', '赵主管（财务部）', '刘总（总经理）', '董事长'] }
    ],
    ccMembers: ['周秘书（行政部）', '吴会计（财务部）', '孙助理（总经办）'],
    status: 'enabled',
    remark: '适用于金额≥100万的重大合作合同审批'
  }
];
let editingFlowId = null;
let tempFlowNodes = [];

// ==================== 合同主体数据 ====================
let entityList = [
  { id:1, name:'XX科技有限公司', type:'总公司', creditCode:'91110108MA01XXXXX1', legalPerson:'王建国', address:'北京市海淀区中关村南大街5号', phone:'010-88886666', email:'legal@xxtech.com', bank:'中国工商银行北京中关村支行', bankAccount:'02000036090XXXXXX1', businessScope:'医疗器械研发、生产、销售；健康管理服务；软件开发；技术服务', status:1, remark:'集团母公司', createTime:'2025-01-15 10:00:00' },
  { id:2, name:'XX科技（上海）有限公司', type:'子公司', creditCode:'91310115MA1HXXXX2', legalPerson:'李明辉', address:'上海市浦东新区陆家嘴环路1000号', phone:'021-66668888', email:'legal@xxsh.com', bank:'中国建设银行上海浦东支行', bankAccount:'3105016193XXXXXX2', businessScope:'医疗器械销售；健康管理咨询；技术服务', status:1, remark:'上海全资子公司', createTime:'2025-03-20 14:30:00' },
  { id:3, name:'XX科技广州分公司', type:'分公司', creditCode:'91440106MA5XXXXXX3', legalPerson:'陈伟强', address:'广州市天河区珠江新城华夏路30号', phone:'020-33335555', email:'legal@xxgz.com', bank:'中国银行广州天河支行', bankAccount:'62366170000XXXXXX3', businessScope:'医疗器械销售；技术咨询服务', status:1, remark:'广州分公司，负责华南区域业务', createTime:'2025-05-10 09:00:00' },
  { id:4, name:'XX健康管理有限公司', type:'子公司', creditCode:'91330106MA2XXXXXX4', legalPerson:'赵德芳', address:'杭州市余杭区仓前街道文一西路1218号', phone:'0571-99998888', email:'legal@xxhm.com', bank:'中国农业银行杭州余杭支行', bankAccount:'19040101040XXXXXX4', businessScope:'健康管理服务；健康咨询；养老服务', status:1, remark:'健康管理业务子公司', createTime:'2025-06-01 11:00:00' },
  { id:5, name:'XX医疗供应链有限公司', type:'子公司', creditCode:'91500112MA6XXXXXX5', legalPerson:'刘志远', address:'武汉市洪山区光谷大道77号', phone:'027-87654321', email:'legal@xxsc.com', bank:'中国招商银行武汉光谷支行', bankAccount:'127908XXXXXX5', businessScope:'供应链管理；物流配送；仓储服务', status:0, remark:'已暂停运营，待注销', createTime:'2025-07-15 16:00:00' },
  { id:6, name:'XX科技成都事业部', type:'事业部', creditCode:'', legalPerson:'张经理', address:'成都市武侯区人民南路四段1号', phone:'028-55557777', email:'legal@xxcd.com', bank:'', bankAccount:'', businessScope:'西南区域医疗器械销售及服务', status:1, remark:'非独立法人，以总公司名义签署', createTime:'2025-09-01 08:30:00' }
];