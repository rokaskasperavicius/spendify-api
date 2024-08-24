import type { components, paths } from './gocardless'

// // Schema Obj
// type MyType = components['schemas']['MyType']

// // Path params
// type EndpointParams = paths['/my/endpoint']['parameters']

// // Response obj
// type SuccessResponse = paths['/my/endpoint']['get']['responses'][200]['content']['application/json']['schema']
// type ErrorResponse = paths['/my/endpoint']['get']['responses'][500]['content']['application/json']['schema']

export type Institutions = paths['/api/v2/institutions/']['get']['responses'][200]['content']['application/json']

export type EndUserAgreement =
  paths['/api/v2/agreements/enduser/']['post']['responses'][201]['content']['application/json']
export type EndUserAgreementBody =
  paths['/api/v2/agreements/enduser/']['post']['requestBody']['content']['application/json']

export type Requisition = paths['/api/v2/requisitions/']['post']['responses'][201]['content']['application/json']
export type RequisitionBody = paths['/api/v2/requisitions/']['post']['requestBody']['content']['application/json']

export type RequisitionInfo =
  paths['/api/v2/requisitions/{id}/']['get']['responses'][200]['content']['application/json']

export type AccountMetadata = paths['/api/v2/accounts/{id}/']['get']['responses'][200]['content']['application/json']

export type AccountDetails =
  paths['/api/v2/accounts/{id}/details/']['get']['responses'][200]['content']['application/json']['account']

export type AccountBalance =
  paths['/api/v2/accounts/{id}/balances/']['get']['responses'][200]['content']['application/json']['balances']

export type Institution = paths['/api/v2/institutions/{id}/']['get']['responses'][200]['content']['application/json']
