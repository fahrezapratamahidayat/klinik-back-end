declare module 'midtrans-client'
// declare module 'midtrans-client' {
//     export interface ClientConfig {
//       isProduction: boolean;
//       serverKey: string;
//       clientKey: string;
//     }
  
//     export interface TransactionDetails {
//       order_id: string;
//       gross_amount: number;
//     }
  
//     export interface CustomerDetails {
//       first_name?: string;
//       last_name?: string;
//       email?: string;
//       phone?: string;
//       billing_address?: any;
//       shipping_address?: any;
//     }
  
//     export interface ItemDetails {
//       id: string;
//       price: number;
//       quantity: number;
//       name: string;
//       brand?: string;
//       category?: string;
//       merchant_name?: string;
//     }
  
//     export interface TransactionOptions {
//       transaction_details: TransactionDetails;
//       customer_details?: CustomerDetails;
//       item_details?: ItemDetails[];
//       custom_field1?: string;
//       custom_field2?: string;
//       custom_field3?: string;
//     }
  
//     export interface TransactionResponse {
//       token: string;
//       redirect_url: string;
//     }
  
//     export interface NotificationResponse {
//       transaction_time: string;
//       transaction_status: string;
//       transaction_id: string;
//       status_message: string;
//       status_code: string;
//       signature_key: string;
//       payment_type: string;
//       order_id: string;
//       merchant_id: string;
//       gross_amount: string;
//       fraud_status: string;
//       currency: string;
//     }
  
//     export class Snap {
//       constructor(config: ClientConfig);
//       createTransaction(options: TransactionOptions): Promise<TransactionResponse>;
//       transaction: {
//         notification(notification: any): Promise<NotificationResponse>;
//         status(orderId: string): Promise<any>;
//       };
//     }
  
//     export default {
//       Snap
//     };
//   }