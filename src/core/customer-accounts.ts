// Purchases are one-off. A buyer pays, reads their report, and finds it again later
// with their order number and the phone number used at checkout, so there is nothing
// for a customer account to add. The account code stays in place — admin sign-in
// still uses it, and it is the path back if membership is ever wanted — but the
// customer-facing sign-in surface is off.
//
// Turning this on restores the sign-in prompt and the device-sync panel; it does not
// by itself remove the order-lookup route, which remains the guest path.
export const customerAccountsEnabled = false;
