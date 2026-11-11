// API pública del slice: lo que el resto de la aplicación puede usar. Lo demás es interno.
export { ApproveOrderButton } from './ApproveOrderButton';
export { createHttpApprovalGateway } from './http-approval-gateway';
export type { ApprovalGateway, Approver } from './approve-order';
